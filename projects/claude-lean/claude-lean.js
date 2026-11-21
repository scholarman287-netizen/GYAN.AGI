#!/usr/bin/env node
// CLAUDE LEAN: one self-contained file that minimises Claude token usage.
// Built from Token Squeezer (local compression, 0 model tokens) + Claude Booster (routing, prompt caching,
// compact handoffs, response cache, ledger), retuned for hard limits:
//   - cheapest-model routing, Opus blocked unless LEAN_ALLOW_DEEP=1, budget-driven auto-downgrade
//   - every prompt squeezed; documents and the PE foundation pruned query-aware to fixed token caps
//   - tight max_tokens per call + terse-output directive; short-key JSON contract expanded locally
//   - MPC research in 1-2 calls instead of 4 (planner folded in, critic+synthesizer merged)
//   - prompt caching only where it pays (prefix reused and long enough), local response cache (repeat = 0 tokens)
//   - persistent ledger with a hard daily budget; proxy mode enforces all of this for Claude Code / any SDK
// Zero dependencies. Node >= 20. Token counts are heuristic estimates; the ledger records real API usage.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';

// =====================================================================================
// TOKEN SQUEEZER CORE (verbatim from token-squeezer/src/squeeze.js)
// =====================================================================================
// Token Squeezer core: model-agnostic prompt compression. Zero dependencies, runs locally (0 model tokens).
// Levels: 1 = near-lossless cleanup, 2 = + dedupe/markdown strip, 3 = + telegraphic prose & comment stripping.
// Pruning (query-aware extractive) is lossy and only applied to old turns, big documents, or when over budget.

const SLASH = new Set(['js', 'javascript', 'ts', 'typescript', 'java', 'c', 'cpp', 'go', 'rust', 'rs', 'swift', 'kotlin', 'cs', 'php', 'scala']);
const HASH = new Set(['py', 'python', 'sh', 'bash', 'shell', 'yaml', 'yml', 'rb', 'ruby', 'toml', 'r']);
const STOP = new Set('the and for with are was were been this that these those from not but then which who what when where how why you your they them his her our their its into about over under than also just very have has had can could will would should may might'.split(' '));

/** Approximate token count (no tokenizer needed). Calibrated to ~BPE behaviour; real counts vary by model. */
export function estimateTokens(s = '') {
  let t = 0;
  for (const m of String(s).matchAll(/\s*\n\s*|[ \t]{2,}|[\p{L}]+|\d+|([^\s\p{L}\d])\1*/gu)) {
    const x = m[0];
    if (/^\s/.test(x)) t += 1 + Math.floor(x.length / 24); // whitespace/newline runs cost ~1 token each
    else if (/[぀-鿿가-힯]/.test(x)) t += x.length;
    else if (/^\p{L}/u.test(x)) t += Math.max(1, Math.round(x.length / 4.2));
    else if (/^\d/.test(x)) t += Math.ceil(x.length / 3);
    else t += Math.ceil(x.length / 2);
  }
  return t;
}

function splitFences(text) {
  const out = []; let last = 0, m; const re = /```([^\n`]*)\n([\s\S]*?)```/g;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ code: false, text: text.slice(last, m.index) });
    out.push({ code: true, lang: m[1].trim().toLowerCase(), text: m[2] }); last = re.lastIndex;
  }
  if (last < text.length) out.push({ code: false, text: text.slice(last) });
  return out;
}
const joinFences = (parts) => parts.map((p) => (p.code ? '```' + p.lang + '\n' + p.text + '```' : p.text)).join('');
function tryJson(s) { const t = s.trim(); if (!/^[[{]/.test(t)) return null; try { return JSON.stringify(JSON.parse(t)); } catch { return null; } }

const ASCII = { '‘': "'", '’': "'", '“': '"', '”': '"', '–': '-', '—': '-', '…': '...', ' ': ' ', '•': '-' };
function prose1(t) {
  return t.replace(/[​-‍﻿]/g, '').replace(/[‘’“”–—… •]/g, (c) => ASCII[c])
    .replace(/<!--[\s\S]*?-->/g, '').replace(/[ \t]+$/gm, '').replace(/(\S)[ \t]{2,}/g, '$1 ')
    .replace(/^(?:[-*_][ \t]*){3,}$/gm, '').replace(/\n{3,}/g, '\n\n');
}
function prose2(t, role) {
  t = t.replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '$2')
    .replace(/^[ \t]*\|?[ \t:|-]*-{3,}[ \t:|-]*\|?[ \t]*$/gm, (r) => (r.includes('|') ? r.replace(/-{3,}/g, '-').replace(/[ \t]+/g, '') : r))
    .replace(/^(.+)\n\1$/gm, '$1');
  if (role === 'assistant') t = t.replace(/^(sure|certainly|of course|absolutely|great question)[!,.]\s*/i, '');
  return t;
}
const PHRASES = [[/\b(?:please|kindly)\s+/gi, ''], [/\bI (?:would like|want|need) you to\s+/gi, ''], [/\bin order to\b/gi, 'to'], [/\bdue to the fact that\b/gi, 'because'],
  [/\bat this point in time\b/gi, 'now'], [/\bin the event that\b/gi, 'if'], [/\bit is (?:important|worth) (?:to note|noting) that\s*/gi, ''], [/\bas well as\b/gi, 'and'],
  [/\ba (?:large |great )?number of\b/gi, 'many'], [/\bthe fact that\b/gi, 'that'], [/\bwith (?:regard|respect) to\b/gi, 'on'], [/\bfor example\b/gi, 'e.g.'],
  [/\bin addition,?\s*/gi, 'also '], [/\bhowever,\s*/gi, 'but '], [/\btherefore,\s*/gi, 'so '], [/\bapproximately\b/gi, '~'], [/\bin particular\b/gi, 'esp.']];
function prose3(t) {
  return t.split('\n').map((line) => {
    if (/[\\$=^_{}<>|`]/.test(line) || line.split(/\s+/).length < 6) return line;
    for (const [r, s] of PHRASES) line = line.replace(r, s);
    return line.replace(/\b(?:the|a|an)\s+(?=\S)/gi, '');
  }).join('\n');
}
function stripComments(c, lang) {
  let re = null;
  if (SLASH.has(lang)) re = /^\s*\/\/.*$/gm; else if (HASH.has(lang)) re = /^\s*#(?!!|\s*(?:include|define|pragma|if|endif|else)).*$/gm;
  return re ? c.replace(re, '').replace(/\n{2,}/g, '\n') : c;
}

export function normalizeText(text, { level = 2, role = 'user', seen = null, dedupe = false } = {}) {
  text = text.replace(/\r\n?/g, '\n');
  const whole = tryJson(text); if (whole !== null) return whole;
  const parts = splitFences(text).map((p) => {
    if (p.code) {
      if (p.lang === 'json') { const j = tryJson(p.text); if (j !== null) return { ...p, text: j + '\n' }; }
      let c = p.text.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');
      if (level >= 3) c = stripComments(c, p.lang);
      return { ...p, text: c };
    }
    let t = prose1(p.text);
    if (level >= 2) t = prose2(t, role);
    if (level >= 3) t = prose3(t);
    if (level >= 2 && seen) {
      t = t.split(/\n{2,}/).map((para) => {
        const key = para.toLowerCase().replace(/\s+/g, ' ').trim();
        if (key.length < 60) return para;
        if (dedupe && seen.has(key)) return '[dup omitted]';
        seen.add(key); return para;
      }).join('\n\n');
    }
    return { ...p, text: t };
  });
  return joinFences(parts).trim();
}

// ---- query-aware extractive pruning (lossy) ----
const WORD = /[\p{L}\d]{3,}/gu;
function unitsOf(text) {
  const out = [];
  for (const p of splitFences(text)) {
    if (p.code) { out.push({ t: '```' + p.lang + '\n' + p.text + '```', code: true }); continue; }
    for (const line of p.text.split('\n')) {
      const l = line.trim(); if (!l) continue;
      if (estimateTokens(l) > 80) for (const s of l.split(/(?<=[.!?])\s+/)) { if (s.trim()) out.push({ t: s.trim() }); } else out.push({ t: l });
    }
  }
  return out;
}
function pruneOnce(text, query, target) {
  const U = unitsOf(text); const toks = U.map((u) => estimateTokens(u.t) + 1); // +1 for the joining newline
  if (toks.reduce((a, b) => a + b, 0) <= target) return text;
  const terms = [...new Set((query.toLowerCase().match(WORD) || []).filter((w) => !STOP.has(w)))];
  const dt = U.map((u) => (u.t.toLowerCase().match(WORD) || []).filter((w) => !STOP.has(w)));
  const df = new Map(); for (const ws of dt) for (const w of new Set(ws)) df.set(w, (df.get(w) || 0) + 1);
  const N = U.length, idf = (w) => Math.log(1 + N / (1 + (df.get(w) || 0)));
  const score = U.map((u, i) => {
    const tf = {}; for (const w of dt[i]) tf[w] = (tf[w] || 0) + 1;
    const len = dt[i].length || 1;
    const rel = terms.reduce((s, w) => (tf[w] ? s + idf(w) * (1 + Math.log(tf[w])) : s), 0);
    const info = [...new Set(dt[i])].reduce((s, w) => s + idf(w), 0) / Math.sqrt(len);
    let s = (terms.length ? 2 * rel / Math.sqrt(len + 4) : 0) + 0.3 * info;
    if (/^(#{1,6}\s|\d+(\.\d+)*\s+[A-Z]|\\(sub)*section)/.test(u.t)) s += 1.5;
    if (/\b(definition|theorem|proposition|lemma|conclusion|summary|abstract|note)\b/i.test(u.t)) s += 1;
    if (/\d|[=<>]/.test(u.t)) s += 0.4;
    if (u.code) s += 0.5;
    if (i < 2) s += 5; if (i === U.length - 1) s += 1.5;
    return s;
  });
  let used = 0; const keep = new Set();
  for (const i of score.map((s, i) => i).sort((a, b) => score[b] - score[a])) { if (used + toks[i] <= target) { keep.add(i); used += toks[i]; } }
  const out = []; let gap = false;
  for (let i = 0; i < U.length; i++) { if (keep.has(i)) { if (gap && out.length) out.push('[...]'); out.push(U[i].t); gap = false; } else gap = true; }
  if (gap) out.push('[...]');
  return out.join('\n');
}

export function pruneText(text, { query = '', target = 500 } = {}) {
  let t = target, out = pruneOnce(text, query, t);
  for (let i = 0; i < 12 && estimateTokens(out) > target && t > 20; i++) { t = Math.floor(t * 0.92); out = pruneOnce(text, query, t); } // gap markers cost tokens too
  return out;
}

// ---- message-level compression ----
const mapContent = (c, fn) => (typeof c === 'string' ? fn(c) : Array.isArray(c) ? c.map((p) => (p && p.type === 'text' && typeof p.text === 'string' ? { ...p, text: fn(p.text) } : p)) : c);
export const contentText = (c) => (typeof c === 'string' ? c : Array.isArray(c) ? c.map((p) => (p && p.type === 'text' ? p.text : '')).join('\n') : '');
const msgTokens = (m) => estimateTokens(contentText(m.content)) + 4;
const total = (ms) => ms.reduce((a, m) => a + msgTokens(m), 0);

export const PRESETS = {
  light: { level: 1, oldCap: 0, docCap: 0 },
  balanced: { level: 2, oldCap: 250, docCap: 0 },
  max: { level: 3, oldCap: 80, docCap: 2000, terse: true },
};

/** compress(messages, {preset|level, keepLast, oldCap, docCap, maxInputTokens, terse}) -> {messages, stats} */
export function compress(messages, o = {}) {
  const opt = { keepLast: 4, maxInputTokens: 0, terse: false, ...PRESETS[o.preset || 'balanced'], ...o };
  const before = total(messages);
  const lastUser = messages.map((m) => m.role).lastIndexOf('user');
  const query = lastUser >= 0 ? contentText(messages[lastUser].content) : '';
  const norm = (level) => { const seen = new Set(); return messages.map((m, i) => ({ ...m, content: mapContent(m.content, (t) => normalizeText(t, { level: i === lastUser ? Math.min(level, 2) : level, role: m.role, seen, dedupe: i !== lastUser })) })); };
  let level = opt.level, ms = norm(level);
  const prune = (i, cap, q) => { ms[i] = { ...ms[i], content: mapContent(ms[i].content, (t) => pruneText(t, { query: q, target: cap })) }; };
  const oldIdx = ms.map((m, i) => i).filter((i) => ms[i].role !== 'system' && i < ms.length - opt.keepLast && i !== lastUser);
  if (opt.oldCap) for (const i of oldIdx) prune(i, opt.oldCap, query);
  if (opt.docCap) for (let i = 0; i < ms.length; i++) if (i !== lastUser && msgTokens(ms[i]) > opt.docCap) prune(i, opt.docCap, query);
  const B = opt.maxInputTokens;
  if (B && total(ms) > B) {
    if (level < 3) { level = 3; ms = norm(3); if (opt.oldCap) for (const i of oldIdx) prune(i, opt.oldCap, query); }
    for (const cap of [150, 80, 40]) { if (total(ms) <= B) break; for (const i of oldIdx) prune(i, cap, query); }
    for (let guard = 0; total(ms) > B && guard < 20; guard++) {
      let k = -1, best = 0; ms.forEach((m, i) => { if (i !== lastUser && msgTokens(m) > best) { best = msgTokens(m); k = i; } });
      if (k < 0 || best < 60) break;
      prune(k, Math.max(40, Math.floor(best - (total(ms) - B) * 1.1)), query);
    }
    const lastRef = ms[lastUser]; let dropped = 0;
    while (total(ms) > B) { // still over: omit oldest turns (pairs keep role alternation)
      const f = ms.findIndex((m) => m.role !== 'system');
      if (f < 0 || ms.length - f <= opt.keepLast || ms[f] === lastRef) break;
      const n = ms[f + 1] === lastRef ? 1 : 2; ms.splice(f, n); dropped += n;
    }
    if (dropped) { const f = ms.findIndex((m) => m.role !== 'system'); const note = `[${dropped} earlier messages omitted] `; ms[f] = { ...ms[f], content: typeof ms[f].content === 'string' ? note + ms[f].content : [{ type: 'text', text: note }, ...ms[f].content] }; }
    const li = ms.indexOf(lastRef);
    if (total(ms) > B && li >= 0) { const m = ms[li], tail = contentText(m.content).slice(-400); prune(li, Math.max(60, msgTokens(m) - (total(ms) - B)), tail); }
  }
  if (opt.terse) {
    const note = 'Reply tersely: no preamble, no restating the question, no closing summary.';
    const s = ms.findIndex((m) => m.role === 'system');
    if (s >= 0) ms[s] = { ...ms[s], content: mapContent(ms[s].content, (t) => t + '\n' + note) }; else ms.unshift({ role: 'system', content: note });
  }
  const after = total(ms);
  return { messages: ms, stats: { before, after, saved: before - after, pct: before ? +(100 * (before - after) / before).toFixed(1) : 0, level } };
}

/** compressText(text, {level, query, budget}) for single documents/prompts. */
export function compressText(text, { level = 2, query = '', budget = 0 } = {}) {
  const before = estimateTokens(text); let out = normalizeText(text, { level });
  if (budget && estimateTokens(out) > budget) out = pruneText(normalizeText(text, { level: 3 }), { query, target: budget });
  const after = estimateTokens(out);
  return { text: out, stats: { before, after, saved: before - after, pct: before ? +(100 * (before - after) / before).toFixed(1) : 0 } };
}

// ---- response cache (from token-squeezer/src/cache.js) ----

/** LRU + TTL response cache. A hit costs 0 model tokens. Optional JSON persistence. */
export class Cache {
  constructor({ max = 500, ttlMs = 86400000, file = '' } = {}) {
    Object.assign(this, { max, ttlMs, file }); this.map = new Map(); this.timer = null;
    if (file && fs.existsSync(file)) { try { for (const [k, v] of JSON.parse(fs.readFileSync(file, 'utf8'))) this.map.set(k, v); } catch { /* ignore corrupt cache */ } }
  }
  static key(obj) { return crypto.createHash('sha256').update(JSON.stringify(obj)).digest('hex'); }
  get(k) {
    const e = this.map.get(k); if (!e) return null;
    if (Date.now() - e.t > this.ttlMs) { this.map.delete(k); return null; }
    this.map.delete(k); this.map.set(k, e); return e.v;
  }
  set(k, v) {
    this.map.set(k, { t: Date.now(), v });
    while (this.map.size > this.max) this.map.delete(this.map.keys().next().value);
    if (this.file && !this.timer) this.timer = setTimeout(() => { this.timer = null; try { fs.writeFileSync(this.file, JSON.stringify([...this.map])); } catch { /* ignore */ } }, 2000).unref();
  }
  get size() { return this.map.size; }
}

// =====================================================================================
// LEAN LAYER: Claude Booster + Token Squeezer, retuned for minimum token spend.
// =====================================================================================
const HERE = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v, d) => (v === undefined || v === '' || !Number.isFinite(Number(v)) ? d : Number(v));
const OUT_W = 5; // output tokens are billed ~5x input on current Claude list prices; budgets count "input-token equivalents"

export function leanConfig(env = process.env) {
  return {
    apiKey: env.LEAN_API_KEY || env.ANTHROPIC_API_KEY || '',
    baseUrl: (env.LEAN_UPSTREAM || 'https://api.anthropic.com').replace(/\/+$/, ''),
    version: env.LEAN_API_VERSION || '2023-06-01',
    models: { fast: env.LEAN_FAST_MODEL || 'claude-haiku-5-5', standard: env.LEAN_STANDARD_MODEL || 'claude-sonnet-5-5', deep: env.LEAN_DEEP_MODEL || 'claude-opus-5-5' },
    allowDeep: env.LEAN_ALLOW_DEEP === '1',             // Opus is blocked (downgraded to standard) unless explicitly allowed
    maxOut: num(env.LEAN_MAX_OUT, 700),                 // default output cap for ask()
    maxIn: num(env.LEAN_MAX_IN, 6000),                  // input cap per request (history+doc+prompt)
    docCap: num(env.LEAN_DOC_TOKENS, 2500),             // attached documents pruned to this, query-aware
    foundationCap: num(env.LEAN_FOUNDATION_TOKENS, 900),// PE foundation pruned to this per research task
    dailyBudget: num(env.LEAN_DAILY_BUDGET, 150000),    // hard daily ceiling, input-token equivalents
    cacheMin: num(env.LEAN_CACHE_MIN_TOKENS, 1024),     // below this, provider prompt caching can't engage
    temperature: env.LEAN_TEMPERATURE === undefined ? undefined : Number(env.LEAN_TEMPERATURE),
    timeoutMs: num(env.LEAN_TIMEOUT_MS, 120000),
    dir: env.LEAN_DIR || path.join(os.homedir(), '.claude-lean'),
    responseCache: env.LEAN_CACHE !== '0',
    foundation: env.LEAN_FOUNDATION || '',
  };
}

// ---------- routing: cheapest model that plausibly fits ----------
export function classify(task) {
  const t = task.toLowerCase();
  const heavy = /\b(prove|proof|derive|derivation|theorem|counterexample|necessary and sufficient|falsif\w*|rigorous|stability|convergence|nonlinear|refactor|architecture|debug)\b/.test(t);
  const items = (task.match(/^\s*(?:\d+[.)]|[-*])\s/gm) || []).length;
  if (!heavy && items < 3 && task.length < 600) return 'fast';
  if (heavy && (task.length > 700 || items >= 4)) return 'deep';
  return 'standard';
}
const pickTier = (tier, cfg) => (tier === 'deep' && !cfg.allowDeep ? 'standard' : tier);
const DOWN = { deep: 'standard', standard: 'fast', fast: null };

// ---------- usage ledger with hard daily budget ----------
export class Ledger {
  constructor(file) { this.file = file; this.d = {}; try { this.d = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* new */ } }
  static units(u = {}) { return Math.round((u.input_tokens || 0) + 1.25 * (u.cache_creation_input_tokens || 0) + 0.1 * (u.cache_read_input_tokens || 0) + OUT_W * (u.output_tokens || 0)); }
  today() { const k = new Date().toLocaleDateString('en-CA'); return (this.d[k] ||= { calls: 0, input: 0, cache_write: 0, cache_read: 0, output: 0, units: 0, cache_hits: 0, units_saved_by_cache: 0 }); }
  remaining(budget) { return budget - this.today().units; }
  add(u = {}) {
    const t = this.today(); t.calls++; t.input += u.input_tokens || 0; t.cache_write += u.cache_creation_input_tokens || 0;
    t.cache_read += u.cache_read_input_tokens || 0; t.output += u.output_tokens || 0; t.units += Ledger.units(u); this.save();
  }
  hit(units) { const t = this.today(); t.cache_hits++; t.units_saved_by_cache += units; this.save(); }
  save() {
    if (!this.file) return;
    const keys = Object.keys(this.d).sort(); for (const k of keys.slice(0, Math.max(0, keys.length - 31))) delete this.d[k];
    try { fs.mkdirSync(path.dirname(this.file), { recursive: true }); fs.writeFileSync(this.file, JSON.stringify(this.d, null, 1)); } catch { /* best effort */ }
  }
}
function guard(cfg, ledger, estUnits) {
  const left = ledger.remaining(cfg.dailyBudget);
  if (estUnits > left) throw new Error(`claude-lean budget: this call needs ~${estUnits} units, ${Math.max(0, left)} left today (LEAN_DAILY_BUDGET=${cfg.dailyBudget}).`);
}

// ---------- Claude Messages API ----------
async function callClaude(cfg, body) {
  for (let attempt = 0; ; attempt++) {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), cfg.timeoutMs);
    try {
      const r = await fetch(`${cfg.baseUrl}/v1/messages`, { method: 'POST', signal: ctl.signal, body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-api-key': cfg.apiKey, 'anthropic-version': cfg.version } });
      const txt = await r.text();
      if ([429, 500, 502, 503, 529].includes(r.status) && attempt < 2) { await sleep(1000 * num(r.headers.get('retry-after'), 0) || 800 * 2 ** attempt); continue; }
      if (!r.ok) throw new Error(`Claude API ${r.status}: ${txt.slice(0, 400)}`);
      const j = JSON.parse(txt);
      return { text: (j.content || []).filter((b) => b.type === 'text').map((b) => b.text).join(''), usage: j.usage || {}, model: j.model || body.model, stop: j.stop_reason };
    } catch (e) { throw e.name === 'AbortError' ? new Error(`timeout after ${cfg.timeoutMs} ms (${body.model})`) : e; } finally { clearTimeout(to); }
  }
}
const TERSE = 'Be terse: answer only. No preamble, no restating the question, no filler caveats, no closing summary. Prefer lists/code over prose.';
const caches = new Map();
const cacheFor = (cfg) => { const f = path.join(cfg.dir, 'responses.json'); if (!caches.has(f)) caches.set(f, new Cache({ max: 500, ttlMs: 7 * 86400000, file: f })); return caches.get(f); };
const ledgerFor = (cfg) => new Ledger(path.join(cfg.dir, 'ledger.json'));

// ---------- 1) ask: one squeezed, routed, capped, cached call ----------
export async function ask(prompt, o = {}) {
  const cfg = o.cfg || leanConfig(); const ledger = ledgerFor(cfg);
  if (typeof prompt !== 'string' || !prompt.trim()) throw new Error('prompt must be a non-empty string');
  let tier = pickTier(o.tier || classify(prompt), cfg);
  const maxOut = o.maxOut ?? cfg.maxOut;
  const doc = o.doc ? compressText(o.doc, { level: 2, query: prompt, budget: cfg.docCap }).text : '';
  const user = doc ? `<doc>\n${doc}\n</doc>\n${prompt}` : prompt;
  const sq = compress([...(o.history || []), { role: 'user', content: user }], { preset: 'max', terse: false, maxInputTokens: cfg.maxIn });
  const system = [normalizeText(o.system || '', { level: 2 }), TERSE].filter(Boolean).join('\n');
  const inTok = estimateTokens(system) + sq.stats.after;
  // auto-downgrade the model until the estimated cost fits today's remaining budget
  const est = () => Math.round(inTok * 1.15 + OUT_W * maxOut * 0.6);
  while (DOWN[tier] && est() > ledger.remaining(cfg.dailyBudget)) tier = DOWN[tier];
  const body = { model: cfg.models[tier], max_tokens: maxOut, system, messages: sq.messages };
  if (cfg.temperature !== undefined) body.temperature = cfg.temperature;
  const cache = cfg.responseCache ? cacheFor(cfg) : null; const key = Cache.key(body);
  const hit = cache?.get(key);
  if (hit) { ledger.hit(Ledger.units(hit.usage)); return { ...hit, cache: 'hit', usage_note: 'served from local cache: 0 tokens' }; }
  if (!cfg.apiKey) throw new Error('No API key: set ANTHROPIC_API_KEY (or LEAN_API_KEY).');
  guard(cfg, ledger, est());
  const r = await callClaude(cfg, body); ledger.add(r.usage);
  const out = { text: r.text, model: r.model, tier, truncated: r.stop === 'max_tokens', usage: r.usage, squeeze: sq.stats };
  if (cache && !out.truncated) cache.set(key, out);
  return { ...out, cache: 'miss' };
}

// ---------- 2) research: Mishrin Paradoxical Computer, lean pipeline ----------
// Naive MPC = 4 calls, each resending the full 9 KB foundation + pretty-printed contract, 3000-token outputs.
// Booster = 1-4 calls, squeezed prefix, prompt caching. Lean = 1-2 calls, query-pruned foundation,
// short-key output contract (expanded locally), planner folded into researcher, critic+synthesizer merged.
const MPC_LEAN = `MPC research worker for Aman Mishra's Paradoxical Equilibrium (PE) program. Goal: scientific progress, not praise.
PE: system-level equilibrium while components keep nonzero local optimization pressure, offset by coupling/shared constraints/collective effects. Strong-PE candidate signature grad F(x*)=0 with ell(x*)!=0 is NOT sufficient: also establish system equilibrium, coupling/non-separability, dynamic sustainability or stability, admissibility. Weak PE: local pressure may vanish. Dynamic PE: sustainable/attracting region, not only a fixed point.
Rules: foundation is authoritative; label changes as proposals. No claims of universal law, revolution or originality; renaming is not novelty. Stationary point != dynamical equilibrium != stability; never infer stability from grad F=0. Keep strong/weak PE exact. State assumptions (state space, feasibility, differentiability, constraints, dynamics, timescale, domain). Label each result. Proofs: every step and assumption; say if incomplete. Check algebra, signs, dimensions, limits; simulation is not proof. Compare fairly with Pareto/multi-objective, Nash, control theory, dynamical systems, homeostasis, self-organization, organizational paradox. Never invent citations, results or scores; without sources mark prior art literature_review_required or unverified_background. Try to falsify: counterexamples, failure conditions, best alternative explanation. Keep disagreements; no fake consensus. Prefer narrow defensible claims. Never claim experiments or code were run.`;
const CONTRACT_LEAN = `Output ONE JSON object, no fences/prose. Short keys: u=task understanding; r=result; d=[definitions/assumptions]; w=[{c=claim,k=definition|theorem|proposition|conjecture|hypothesis|example|analogy,a=[assumptions],e=derivation/evidence,s=proved|conditionally_proved|plausible|unproved|invalid|requires_external_verification}]; p=[{o=concept/work,l=same|special_case|related|different|unknown,s=provided_in_foundation|unverified_background|literature_review_required,e=why}]; x=[counterexamples/failure modes]; t=[{h=hypothesis,m=method,k=[metrics],o=expected,f=falsified if}]; q=[open questions]; n=[next actions]; c=low|medium|high; v=novelty (established / possibly distinctive / needs literature review). Omit empty keys. Max 3 items per list. Terse strings; full detail only in e.`;
const LONG = { u: 'task_understanding', r: 'proposed_result', d: 'definitions_and_assumptions', w: 'mathematical_work', p: 'prior_art', x: 'counterexamples_and_failure_modes', t: 'experiments_or_tests', q: 'unresolved_questions', n: 'next_research_actions', c: 'confidence', v: 'novelty_assessment' };
const SUBLONG = { w: { c: 'claim', k: 'classification', a: 'assumptions', e: 'derivation_or_evidence', s: 'status' }, p: { o: 'concept_or_work', l: 'relationship', s: 'evidence_status', e: 'explanation' }, t: { h: 'hypothesis', m: 'method', k: 'metrics', o: 'expected_observation', f: 'falsification_condition' } };
export function expandResult(o) {
  if (!o || typeof o !== 'object') return o; const out = {};
  for (const [k, v] of Object.entries(o)) {
    const sub = SUBLONG[k];
    out[LONG[k] || k] = sub && Array.isArray(v) ? v.map((it) => (it && typeof it === 'object' ? Object.fromEntries(Object.entries(it).map(([a, b]) => [sub[a] || a, b])) : it)) : v;
  }
  return out;
}
const SHORT = Object.fromEntries(Object.entries(LONG).map(([a, b]) => [b, a]));
const shortKeys = (o) => Object.fromEntries(Object.entries(o || {}).map(([k, v]) => [SHORT[k] || k, v]));
function extractJsonObject(text) {
  const cleaned = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  try { const p = JSON.parse(cleaned); if (p && typeof p === 'object' && !Array.isArray(p)) return p; } catch { /* fall through */ }
  const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}');
  if (s >= 0 && e > s) { const p = JSON.parse(cleaned.slice(s, e + 1)); if (p && typeof p === 'object' && !Array.isArray(p)) return p; }
  throw new Error('no valid JSON object in model output');
}
// compact inter-stage handoff (from Claude Booster)
const isEmpty = (x) => x == null || x === '' || (Array.isArray(x) && !x.length) || (typeof x === 'object' && !Array.isArray(x) && !Object.keys(x).length);
function slim(v) {
  if (Array.isArray(v)) return v.map(slim).filter((x) => !isEmpty(x));
  if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) { const s = slim(x); if (!isEmpty(s)) o[k] = s; } return o; }
  return typeof v === 'string' ? normalizeText(v, { level: 3 }) : v;
}
function shrink(v, cap) {
  if (Array.isArray(v)) return v.map((x) => shrink(x, cap));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shrink(x, cap)]));
  return typeof v === 'string' && estimateTokens(v) > cap ? pruneText(v, { target: cap }) : v;
}
export function handoff(obj, capTokens = 1200) {
  let o = slim(obj), s = JSON.stringify(o);
  for (const c of [200, 100, 50]) { if (estimateTokens(s) <= capTokens) break; o = shrink(o, c); s = JSON.stringify(o); }
  return s;
}
function findFoundation(cfg, explicit) {
  for (const f of [explicit, cfg.foundation, path.resolve('knowledge/PE_FOUNDATION.md'), path.join(HERE, 'knowledge/PE_FOUNDATION.md')]) if (f && fs.existsSync(f)) return fs.readFileSync(f, 'utf8');
  return '';
}
const ROLE = {
  solo: 'ROLE: solo researcher. Plan silently, solve, attack your own result, return the final result.',
  research: 'ROLE: researcher. Plan silently (definitions, assumptions, proof obligations, counterexamples), then execute. Show derivations, conditions, limits. "proved" only if complete.',
  review: 'ROLE: adversarial reviewer AND editor. Try to falsify DRAFT (errors, hidden assumptions, definition drift, trivial reformulation, missing stability argument, prior-art overlap), then return the corrected FINAL result in the same schema. Keep unresolved disagreement in q.',
};
const ROLE_OUT = { solo: 1000, research: 1400, review: 1200 };

export function researchPlan(task, domain = '', o = {}) {
  const cfg = o.cfg || leanConfig();
  const tier = pickTier(o.tier || classify(task), cfg);
  const stages = tier === 'fast' || o.review === false ? [['solo', tier]] : [['research', tier], ['review', 'standard']];
  const raw = findFoundation(cfg, o.foundation);
  const foundation = raw ? pruneText(normalizeText(raw, { level: 2 }), { query: `${task} ${domain}`, target: cfg.foundationCap }) : '';
  const system = [{ type: 'text', text: `${MPC_LEAN}\n${CONTRACT_LEAN}` }, { type: 'text', text: foundation ? `PE FOUNDATION (excerpt, task-relevant)\n${foundation}` : 'PE FOUNDATION: not supplied.' }];
  const prefixTokens = estimateTokens(system[0].text) + estimateTokens(system[1].text);
  const models = stages.map(([, t]) => cfg.models[t]);
  const reuse = models.length > 1 && models[0] === models[1] && prefixTokens >= cfg.cacheMin; // cache only if reused AND long enough to qualify
  if (reuse) system[1] = { ...system[1], cache_control: { type: 'ephemeral' } };
  const userBase = estimateTokens(task + domain) + 30;
  const estIn = stages.reduce((s, [r], i) => s + prefixTokens * (reuse ? (i ? 0.1 : 1.25) : 1) + userBase + (r === 'review' ? 900 : 0), 0);
  const estOut = stages.reduce((s, [r, t]) => s + (r === 'research' && t === 'deep' ? 1800 : ROLE_OUT[r]) * 0.7, 0);
  return { tier, stages: stages.map(([role, t]) => ({ role, model: cfg.models[t], max_tokens: role === 'research' && t === 'deep' ? 1800 : ROLE_OUT[role] })), system, prompt_caching: reuse,
    foundation_tokens: { full: raw ? estimateTokens(raw) : 0, sent: estimateTokens(foundation) }, prefix_tokens: prefixTokens,
    estimate: { input: Math.round(estIn), output: Math.round(estOut), units: Math.round(estIn + OUT_W * estOut) } };
}

export async function research(task, o = {}) {
  const cfg = o.cfg || leanConfig(); const ledger = ledgerFor(cfg); const domain = o.domain || '';
  if (typeof task !== 'string' || !task.trim()) throw new Error('"task" must be a non-empty string.');
  if (task.length > 12000) throw new Error('"task" must be 12,000 characters or fewer.');
  let plan = researchPlan(task, domain, { ...o, cfg });
  // budget-driven auto-downgrade: drop review, then cheaper tier
  while (plan.estimate.units > ledger.remaining(cfg.dailyBudget)) {
    if (plan.stages.length > 1) plan = researchPlan(task, domain, { ...o, cfg, review: false, tier: plan.tier });
    else if (DOWN[plan.tier]) plan = researchPlan(task, domain, { ...o, cfg, review: false, tier: DOWN[plan.tier] });
    else break;
  }
  const cache = cfg.responseCache ? cacheFor(cfg) : null;
  const key = Cache.key({ task, domain, stages: plan.stages, sys: plan.system });
  const hit = cache?.get(key);
  if (hit) { ledger.hit(hit.units || 0); return { ...hit, cache: 'hit', usage_note: 'served from local cache: 0 tokens' }; }
  if (!cfg.apiKey) throw new Error('No API key: set ANTHROPIC_API_KEY (or LEAN_API_KEY).');
  guard(cfg, ledger, plan.estimate.units);
  const workflow = []; let draft = null, final = null, units = 0;
  for (const st of plan.stages) {
    const user = [ROLE[st.role], `TASK: ${normalizeText(task, { level: 2 })}`, `DOMAIN: ${domain || 'general'}`];
    if (st.role === 'review' && draft) user.push(`DRAFT: ${handoff(shortKeys(draft))}`);
    const body = { model: st.model, max_tokens: st.max_tokens, system: plan.system, messages: [{ role: 'user', content: user.join('\n') }] };
    if (cfg.temperature !== undefined) body.temperature = cfg.temperature;
    const r = await callClaude(cfg, body); ledger.add(r.usage); units += Ledger.units(r.usage);
    let result;
    try { result = expandResult(extractJsonObject(r.text)); } catch (e) {
      result = { proposed_result: r.text, confidence: 'low', unresolved_questions: [`Structured-output parsing issue: ${e.message}${r.stop === 'max_tokens' ? ' (output hit max_tokens)' : ''}`] };
    }
    workflow.push({ stage: st.role, model: r.model, usage: r.usage, truncated: r.stop === 'max_tokens', output: result });
    if (st.role === 'review') final = result; else draft = result;
  }
  const out = { system: 'Mishrin Paradoxical Computer + Claude Lean', task, domain: domain || null, tier: plan.tier, prompt_caching: plan.prompt_caching,
    final_result: final || draft, workflow, units,
    important_note: 'AI-generated research is provisional. Proofs, novelty and empirical claims need independent verification.' };
  if (cache && !workflow.some((w) => w.truncated)) cache.set(key, out);
  return { ...out, cache: 'miss' };
}

// ---------- 3) proxy: put limits in front of ANY Anthropic client (Claude Code, SDKs, MPC) ----------
// Clamps max_tokens and thinking budgets, blocks Opus unless allowed, adds prompt-cache breakpoints,
// cache-stable text cleanup, local response cache, and a hard daily budget (429 when exhausted).
const CACHEABLE = new Set(['text', 'image', 'tool_use', 'tool_result', 'document']);
function countBreakpoints(b) {
  let n = 0; const scan = (c) => { if (Array.isArray(c)) for (const p of c) if (p?.cache_control) n++; };
  scan(b.system); scan(b.tools); for (const m of b.messages || []) scan(m.content); return n;
}
function addBreakpoint(msg) {
  const c = typeof msg.content === 'string' ? [{ type: 'text', text: msg.content }] : msg.content;
  if (!Array.isArray(c) || !c.length) return false;
  const last = c[c.length - 1]; if (!CACHEABLE.has(last?.type) || (last.type === 'text' && !last.text)) return false;
  msg.content = [...c.slice(0, -1), { ...last, cache_control: { type: 'ephemeral' } }]; return true;
}
export function shapeRequest(body, p) {
  const notes = [];
  if (/opus/i.test(body.model || '') && !p.cfg.allowDeep) { notes.push(`model ${body.model}->${p.cfg.models.standard}`); body.model = p.cfg.models.standard; }
  if (body.thinking?.budget_tokens > p.thinkCap) { notes.push(`thinking ${body.thinking.budget_tokens}->${p.thinkCap}`); body.thinking = { ...body.thinking, budget_tokens: p.thinkCap }; }
  const think = body.thinking?.budget_tokens || 0;
  const cap = p.outCap + think;
  if (!body.max_tokens || body.max_tokens > cap) { notes.push(`max_tokens ${body.max_tokens}->${cap}`); body.max_tokens = cap; }
  let before = 0, after = 0;
  if (Array.isArray(body.messages) && p.preset !== 'off') { // deterministic, query-independent cleanup so the provider cache prefix stays stable
    const r = compress(body.messages, { preset: p.preset, oldCap: 0, docCap: 0, maxInputTokens: 0, terse: false }); body.messages = r.messages; before += r.stats.before; after += r.stats.after;
  }
  if (p.terse) {
    if (typeof body.system === 'string') body.system = body.system ? `${body.system}\n${TERSE}` : TERSE;
    else if (Array.isArray(body.system)) body.system = [...body.system, { type: 'text', text: TERSE }];
    else body.system = TERSE;
  }
  let free = 4 - countBreakpoints(body);
  const sysTok = estimateTokens(typeof body.system === 'string' ? body.system : contentText(body.system || []));
  if (free > 0 && sysTok >= p.cfg.cacheMin) {
    if (typeof body.system === 'string') body.system = [{ type: 'text', text: body.system }];
    const s = body.system; s[s.length - 1] = { ...s[s.length - 1], cache_control: { type: 'ephemeral' } }; free--; notes.push('cache:system');
  }
  const msgs = body.messages || [];
  if (free > 0 && msgs.length >= 3 && sysTok + estimateTokens(msgs.slice(0, -1).map((m) => contentText(m.content)).join('\n')) >= p.cfg.cacheMin) {
    const m = { ...msgs[msgs.length - 2] }; if (addBreakpoint(m)) { msgs[msgs.length - 2] = m; notes.push('cache:history'); }
  }
  return { notes, squeeze: { before, after } };
}

export function createLeanProxy(env = process.env) {
  const cfg = leanConfig(env);
  const p = { cfg, outCap: num(env.LEAN_PROXY_MAX_OUT, 4096), thinkCap: num(env.LEAN_PROXY_THINKING, 4000), preset: env.LEAN_PROXY_PRESET || 'light', terse: env.LEAN_PROXY_TERSE === '1' };
  const ledger = ledgerFor(cfg); const cache = cfg.responseCache ? cacheFor(cfg) : null;
  const st = { requests: 0, clamped: 0, downgraded: 0, blocked: 0, cache_hits: 0, squeezed_tokens_saved: 0 };
  const send = (res, code, obj) => { const b = JSON.stringify(obj, null, 2); res.writeHead(code, { 'content-type': 'application/json' }); res.end(b); };
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (req.method === 'GET' && url.pathname === '/lean/stats') return send(res, 200, { ...st, today: ledger.today(), budget: cfg.dailyBudget, remaining: ledger.remaining(cfg.dailyBudget) });
    const chunks = []; for await (const c of req) chunks.push(c); const raw = Buffer.concat(chunks);
    let body = null;
    if (req.method === 'POST' && url.pathname === '/v1/messages') { try { body = JSON.parse(raw.toString()); } catch { /* forward as-is */ } }
    let ckey = null, notes = [];
    if (body) {
      st.requests++;
      if (ledger.remaining(cfg.dailyBudget) <= 0) { st.blocked++; return send(res, 429, { type: 'error', error: { type: 'rate_limit_error', message: `claude-lean: daily budget of ${cfg.dailyBudget} units exhausted. Raise LEAN_DAILY_BUDGET or wait until tomorrow.` } }); }
      const s = shapeRequest(body, p); notes = s.notes; st.squeezed_tokens_saved += s.squeeze.before - s.squeeze.after;
      if (notes.some((n) => n.startsWith('max_tokens') || n.startsWith('thinking'))) st.clamped++;
      if (notes.some((n) => n.startsWith('model'))) st.downgraded++;
      if (cache && !body.stream && (body.temperature ?? 1) <= 0.3) {
        ckey = Cache.key(body); const hit = cache.get(ckey);
        if (hit) { st.cache_hits++; ledger.hit(Ledger.units(hit.usage)); res.writeHead(200, { 'content-type': 'application/json', 'x-lean-cache': 'hit' }); return res.end(hit.text); }
      }
    }
    const headers = {}; for (const [k, v] of Object.entries(req.headers)) if (!['host', 'content-length', 'connection', 'accept-encoding'].includes(k)) headers[k] = v;
    if (!headers['x-api-key'] && !headers.authorization && cfg.apiKey) headers['x-api-key'] = cfg.apiKey;
    try {
      const up = await fetch(cfg.baseUrl + req.url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : (body ? JSON.stringify(body) : raw) });
      const ct = up.headers.get('content-type') || 'application/json';
      const h = { 'content-type': ct, 'x-lean-notes': notes.join(',') || 'none' };
      if (/event-stream/.test(ct)) { // stream through, reading usage events for the ledger
        res.writeHead(up.status, h); const usage = {}; const dec = new TextDecoder(); let buf = '';
        for await (const chunk of up.body) {
          res.write(chunk); buf += dec.decode(chunk, { stream: true }); let i;
          while ((i = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, i); buf = buf.slice(i + 1);
            if (line.startsWith('data:')) { try { const j = JSON.parse(line.slice(5)); if (j.type === 'message_start') Object.assign(usage, j.message?.usage); else if (j.type === 'message_delta' && j.usage) Object.assign(usage, j.usage); } catch { /* partial */ } }
          }
        }
        res.end(); if (body) ledger.add(usage); return;
      }
      const text = await up.text(); let usage = null;
      try { usage = JSON.parse(text).usage || null; } catch { /* non-JSON */ }
      if (body && usage) ledger.add(usage);
      if (ckey && up.ok && usage) cache.set(ckey, { text, usage });
      res.writeHead(up.status, h); res.end(text);
    } catch (e) { if (!res.headersSent) send(res, 502, { type: 'error', error: { type: 'api_error', message: `claude-lean upstream failed: ${e.message}` } }); else res.end(); }
  });
}

// ---------- CLI ----------
const USAGE = `claude-lean: squeezed, routed, capped, cached Claude calls (zero dependencies, Node >= 20)

  node claude-lean.js ask "question" [--file doc.txt] [--system "..."] [--tier fast|standard|deep] [--max-out N]
  node claude-lean.js research "task" [--domain "..."] [--tier ...] [--no-review] [--foundation PE_FOUNDATION.md]
  node claude-lean.js plan "task" [--domain "..."]          dry run: tier, stages, foundation tokens, cost estimate
  node claude-lean.js squeeze FILE [--budget N] [--query "..."] [--level 1-3]   compress text locally, 0 tokens
  node claude-lean.js serve [--port 8788]                   limiting proxy for Claude Code / SDKs / MPC
  node claude-lean.js stats                                 today's usage vs budget

Key env: ANTHROPIC_API_KEY, LEAN_DAILY_BUDGET (150000), LEAN_MAX_OUT (700), LEAN_MAX_IN (6000), LEAN_ALLOW_DEEP=1,
LEAN_FOUNDATION_TOKENS (900), LEAN_PROXY_MAX_OUT (4096), LEAN_PROXY_THINKING (4000), LEAN_PROXY_PRESET (light|balanced|off),
LEAN_PROXY_TERSE=1, LEAN_CACHE=0, LEAN_DIR (~/.claude-lean), LEAN_UPSTREAM.`;

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [cmd, ...args] = process.argv.slice(2);
  const BOOL = new Set(['no-review']); const skip = new Set();
  args.forEach((a, i) => { if (a.startsWith('--')) { skip.add(i); if (!BOOL.has(a.slice(2))) skip.add(i + 1); } });
  const flag = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
  const text = args.filter((a, i) => !skip.has(i)).join(' ').trim();
  const cfg = leanConfig();
  const print = (o) => console.log(typeof o === 'string' ? o : JSON.stringify(o, null, 2));
  try {
    if (cmd === 'ask') {
      const r = await ask(text, { cfg, tier: flag('tier'), system: flag('system'), maxOut: flag('max-out') ? Number(flag('max-out')) : undefined, doc: flag('file') ? fs.readFileSync(flag('file'), 'utf8') : '' });
      print(r.text); console.error(`[lean] ${r.model || r.tier} cache=${r.cache}${r.truncated ? ' TRUNCATED (raise --max-out)' : ''} in=${r.usage?.input_tokens ?? 0} out=${r.usage?.output_tokens ?? 0} squeeze=${r.squeeze ? r.squeeze.pct + '%' : '-'}`);
    } else if (cmd === 'research') {
      print(await research(text || (flag('file') ? fs.readFileSync(flag('file'), 'utf8') : ''), { cfg, domain: flag('domain'), tier: flag('tier'), review: args.includes('--no-review') ? false : undefined, foundation: flag('foundation') }));
    } else if (cmd === 'plan') {
      const p = researchPlan(text, flag('domain') || '', { cfg, tier: flag('tier'), review: args.includes('--no-review') ? false : undefined, foundation: flag('foundation') });
      delete p.system; print(p);
    } else if (cmd === 'squeeze') {
      const src = fs.readFileSync(text, 'utf8'); const r = compressText(src, { level: Number(flag('level') || 3), query: flag('query') || '', budget: Number(flag('budget') || 0) });
      print(r.text); console.error(`[lean] ${r.stats.before} -> ${r.stats.after} tokens (-${r.stats.pct}%)`);
    } else if (cmd === 'serve') {
      const port = Number(flag('port') || process.env.PORT || 8788);
      createLeanProxy().listen(port, '127.0.0.1', () => console.error(`claude-lean proxy on http://127.0.0.1:${port} -> ${cfg.baseUrl}\nClaude Code: ANTHROPIC_BASE_URL=http://127.0.0.1:${port} claude`));
    } else if (cmd === 'stats') {
      const l = ledgerFor(cfg); print({ today: l.today(), budget: cfg.dailyBudget, remaining: l.remaining(cfg.dailyBudget), ledger: l.file });
    } else { console.error(USAGE); process.exit(cmd ? 2 : 0); }
  } catch (e) { console.error(`claude-lean: ${e.message}`); process.exit(1); }
}
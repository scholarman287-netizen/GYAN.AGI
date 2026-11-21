#!/usr/bin/env node
// CLAUDE BOOSTER: resource-aware orchestration of Claude models for the Mishrin Paradoxical Computer.
// It cannot change model weights; it gets more output per token/dollar by:
//   1. routing each task to the cheapest pipeline/model tier that fits (fast | standard | deep),
//   2. Anthropic prompt caching of the shared prefix (system + PE foundation + contract),
//   3. Token Squeezer on every prompt and inter-stage handoff (empties dropped, JSON minified, prose compacted),
//   4. per-role max_tokens instead of one global cap, a per-request token budget with auto-downgrade,
//   5. response cache (repeat tasks cost 0) and bounded-concurrency batching,
//   6. a usage ledger comparing actual usage with the naive 4-call MPC pipeline.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { loadDotEnv } from './src/config.js';
import { loadTheoryFoundation, OUTPUT_CONTRACT } from './src/theory.js';
import { MPC_SYSTEM, rolePrompt } from './src/prompts.js';
import { extractJsonObject, normaliseModelResult } from './src/json.js';
import { estimateTokens, normalizeText, pruneText } from './src/squeeze/squeeze.js';
import { Cache } from './src/squeeze/cache.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function boosterConfig(env = process.env) {
  return {
    apiKey: env.MISHRIN_BOOST_API_KEY || env.ANTHROPIC_API_KEY || '',
    baseUrl: (env.MISHRIN_BOOST_BASE_URL || 'https://api.anthropic.com').replace(/\/+$/, ''),
    version: env.MISHRIN_BOOST_API_VERSION || '2023-06-01',
    models: { fast: env.MISHRIN_BOOST_FAST_MODEL || 'claude-haiku-5-5', standard: env.MISHRIN_BOOST_STANDARD_MODEL || 'claude-sonnet-5-5', deep: env.MISHRIN_BOOST_DEEP_MODEL || 'claude-opus-5-5' },
    budget: Number(env.MISHRIN_BOOST_BUDGET || 60000),
    thinking: Number(env.MISHRIN_BOOST_THINKING || 0),
    timeoutMs: Number(env.MISHRIN_REQUEST_TIMEOUT_MS || 120000),
    cacheFile: env.MISHRIN_BOOST_CACHE_FILE || '',
    maxOut: { single: 3500, planner: 1200, researcher: 3000, critic: 1500, synthesizer: 2500 },
  };
}

// ---------- routing ----------
export function classify(task) {
  const t = task.toLowerCase();
  const heavy = /\b(prove|proof|derive|derivation|theorem|counterexample|necessary and sufficient|falsif\w*|rigorous|stability|convergence|nonlinear)\b/.test(t);
  const items = (task.match(/^\s*(?:\d+[.)]|[-*])\s/gm) || []).length;
  if (task.length < 280 && !heavy && items < 3) return 'fast';
  if (heavy && (task.length > 500 || items >= 4)) return 'deep';
  return 'standard';
}
export const PLANS = {
  fast: [['single', 'fast']],
  standard: [['researcher', 'standard'], ['critic', 'standard'], ['synthesizer', 'standard']],
  // deep uses only two models: caches are per-model, and a cache write costs 1.25x, so each model must be reused.
  deep: [['planner', 'standard'], ['researcher', 'deep'], ['critic', 'standard'], ['synthesizer', 'deep']],
};
const ORDER = ['deep', 'standard', 'fast'];

// ---------- squeezed, cache-friendly prompt prefix ----------
export function buildPrefix() {
  const system = normalizeText(MPC_SYSTEM, { level: 2 });
  const foundation = normalizeText(loadTheoryFoundation(), { level: 2 });
  const contract = JSON.stringify(OUTPUT_CONTRACT); // minified (original sent pretty-printed on every call)
  return { system, shared: `CANONICAL PE FOUNDATION\n${foundation}\n\nOUTPUT CONTRACT (JSON only)\n${contract}` };
}
const ROLE = {
  single: 'ROLE: solo researcher. Plan briefly, solve, attack your own result, return the final result in one pass.',
  planner: 'ROLE: planner. Decompose into definitions, assumptions, proof obligations, prior-art areas, counterexamples, tests. Do not solve.',
  researcher: 'ROLE: mathematical researcher. Execute the task (and plan if given). Show derivations, conditions, limits. Claim "proved" only if complete.',
  critic: 'ROLE: adversarial reviewer. Find errors, hidden assumptions, definition drift, trivial reformulations, counterexamples, missing stability arguments, prior-art overlap. Try to falsify.',
  synthesizer: 'ROLE: editor. Merge draft and critique into the final result; fix errors; keep unresolved disagreement; separate established from proposed.',
};
const TEMP = { single: 0.2, planner: 0.2, researcher: 0.2, critic: 0.1, synthesizer: 0.2 };

// ---------- handoff compaction ----------
const isEmpty = (x) => x == null || x === '' || (Array.isArray(x) && !x.length) || (typeof x === 'object' && !Array.isArray(x) && !Object.keys(x).length);
export function slim(v) {
  if (Array.isArray(v)) return v.map(slim).filter((x) => !isEmpty(x));
  if (v && typeof v === 'object') { const o = {}; for (const [k, x] of Object.entries(v)) { const s = slim(x); if (!isEmpty(s)) o[k] = s; } return o; }
  return typeof v === 'string' ? normalizeText(v, { level: 3 }) : v;
}
function shrink(v, cap) {
  if (Array.isArray(v)) return v.map((x) => shrink(x, cap));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shrink(x, cap)]));
  return typeof v === 'string' && estimateTokens(v) > cap ? pruneText(v, { target: cap }) : v;
}
export function handoff(obj, capTokens = 1800) {
  let o = slim(obj), s = JSON.stringify(o);
  for (const c of [300, 150, 80]) { if (estimateTokens(s) <= capTokens) break; o = shrink(o, c); s = JSON.stringify(o); }
  return s;
}

// ---------- Claude Messages API ----------
async function callClaude(cfg, { model, system, user, maxTokens, temperature }) {
  const body = { model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] };
  if (cfg.thinking) { body.thinking = { type: 'enabled', budget_tokens: cfg.thinking }; body.max_tokens = maxTokens + cfg.thinking; } else body.temperature = temperature;
  for (let attempt = 0; ; attempt++) {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), cfg.timeoutMs);
    try {
      const r = await fetch(`${cfg.baseUrl}/v1/messages`, { method: 'POST', signal: ctl.signal, body: JSON.stringify(body), headers: { 'content-type': 'application/json', 'x-api-key': cfg.apiKey, 'anthropic-version': cfg.version } });
      const txt = await r.text();
      if ([429, 500, 502, 503, 529].includes(r.status) && attempt < 2) { await sleep(800 * 2 ** attempt); continue; }
      if (!r.ok) throw new Error(`Claude API ${r.status}: ${txt.slice(0, 500)}`);
      const j = JSON.parse(txt);
      return { text: (j.content || []).filter((b) => b.type === 'text').map((b) => b.text).join(''), usage: j.usage || {}, model: j.model || model };
    } catch (e) { throw e.name === 'AbortError' ? new Error(`timeout after ${cfg.timeoutMs} ms (${model})`) : e; } finally { clearTimeout(to); }
  }
}

class Ledger {
  constructor() { this.calls = []; this.t = { input: 0, cache_write: 0, cache_read: 0, output: 0 }; }
  add(stage, model, u) {
    const c = { stage, model, input: u.input_tokens || 0, cache_write: u.cache_creation_input_tokens || 0, cache_read: u.cache_read_input_tokens || 0, output: u.output_tokens || 0 };
    this.calls.push(c); for (const k of Object.keys(this.t)) this.t[k] += c[k];
  }
  // Anthropic list multipliers: cache write 1.25x, cache read 0.1x (verify for your plan).
  get effective_input() { return Math.round(this.t.input + 1.25 * this.t.cache_write + 0.1 * this.t.cache_read); }
}

// ---------- planning / budget ----------
const useCount = (plan, cfg) => { const n = {}; for (const [, t] of plan) n[cfg.models[t]] = (n[cfg.models[t]] || 0) + 1; return n; };
function prefixCost(plan, cfg, prefixTokens) { // effective prefix tokens: cached only if a model is called 2+ times
  const n = useCount(plan, cfg), seen = new Set(); return plan.map(([, t]) => { const m = cfg.models[t]; const first = !seen.has(m); seen.add(m); return n[m] < 2 ? prefixTokens : prefixTokens * (first ? 1.25 : 0.1); }); }
function estimate(plan, cfg, prefixTokens, userBase) {
  let input = 0, out = 0; const pc = prefixCost(plan, cfg, prefixTokens);
  for (const [i, [role]] of plan.entries()) {
    input += pc[i] + userBase + (role === 'single' || role === 'planner' ? 0 : 1200);
    out += cfg.maxOut[role] * 0.6;
  }
  return { input: Math.round(input), output: Math.round(out), total: Math.round(input + out) };
}
export function choosePlan(task, domain, cfg, tierOverride) {
  const { system, shared } = buildPrefix();
  const prefixTokens = estimateTokens(system) + estimateTokens(shared), userBase = estimateTokens(task + domain) + 40;
  let tier = tierOverride || classify(task); const requested = tier;
  while (tier !== 'fast' && estimate(PLANS[tier], cfg, prefixTokens, userBase).total > cfg.budget) tier = ORDER[ORDER.indexOf(tier) + 1];
  return { requested_tier: requested, tier, stages: PLANS[tier].map(([role, t]) => ({ role, model: cfg.models[t] })), estimate: estimate(PLANS[tier], cfg, prefixTokens, userBase), prefix_tokens: prefixTokens };
}

/** Dry run: no API call. Compares prompt scaffolding of naive MPC (4 calls) vs boosted plan. */
export function planReport(task, domain = '', cfg = boosterConfig(), tierOverride) {
  const p = choosePlan(task, domain, cfg, tierOverride); const foundation = loadTheoryFoundation();
  const naive = ['planner', 'researcher', 'critic', 'synthesizer'].reduce((s, r) => s + estimateTokens(MPC_SYSTEM) + estimateTokens(rolePrompt(r, { task, domain, foundation })), 0);
  const pc = prefixCost(PLANS[p.tier], cfg, p.prefix_tokens); let boosted = 0;
  p.stages.forEach((st, i) => { boosted += pc[i] + estimateTokens(ROLE[st.role] + task + domain); });
  boosted = Math.round(boosted);
  return { ...p, naive_scaffold_tokens: naive, boosted_scaffold_effective_tokens: boosted, scaffold_saving_pct: +(100 * (naive - boosted) / naive).toFixed(1), note: 'Scaffolding only (system+foundation+contract+instructions); excludes stage outputs. Estimates, not tokenizer counts.' };
}

// ---------- main ----------
const defaultCache = new Cache({ max: 200, file: boosterConfig().cacheFile });
export async function boost({ task, domain = '', tier, cfg = boosterConfig(), cache = defaultCache } = {}) {
  if (typeof task !== 'string' || !task.trim()) throw new Error('"task" must be a non-empty string.');
  if (task.length > 12000) throw new Error('"task" must be 12,000 characters or fewer.');
  const plan = choosePlan(task, domain, cfg, tier);
  const ckey = Cache.key({ task, domain, stages: plan.stages });
  const hit = cache?.get(ckey);
  if (hit) return { ...hit, cache: 'hit', usage: { note: 'served from response cache: 0 tokens' } };
  if (!cfg.apiKey) throw new Error('No API key: set MISHRIN_BOOST_API_KEY (or ANTHROPIC_API_KEY).');

  const { system, shared } = buildPrefix();
  const uses = useCount(PLANS[plan.tier], cfg); // cache only models reused in this plan
  const ledger = new Ledger(), out = {}, workflow = [];
  for (const st of plan.stages) {
    const parts = [ROLE[st.role], `TASK: ${task}`, `DOMAIN: ${domain || 'general'}`];
    if (out.planner) parts.push(`PLAN: ${handoff(out.planner)}`);
    if (st.role !== 'planner' && st.role !== 'researcher' && out.researcher) parts.push(`DRAFT: ${handoff(out.researcher)}`);
    if (out.critic && st.role === 'synthesizer') parts.push(`CRITIQUE: ${handoff(out.critic)}`);
    const sys = [{ type: 'text', text: system }, uses[st.model] >= 2 ? { type: 'text', text: shared, cache_control: { type: 'ephemeral' } } : { type: 'text', text: shared }];
    const r = await callClaude(cfg, { model: st.model, system: sys, user: parts.join('\n'), maxTokens: cfg.maxOut[st.role], temperature: TEMP[st.role] });
    ledger.add(st.role, r.model, r.usage);
    let result; try { result = extractJsonObject(r.text); } catch (e) { result = normaliseModelResult(r.text, st.role); result.unresolved_questions = [...(result.unresolved_questions || []), `Structured-output parsing issue: ${e.message}`]; }
    out[st.role === 'single' ? 'researcher' : st.role] = result; workflow.push({ stage: st.role, model: r.model, output: result });
  }
  const finalResult = out.synthesizer || out.researcher;
  const naive = ['planner', 'researcher', 'critic', 'synthesizer'].reduce((s, role) => s + estimateTokens(MPC_SYSTEM) + estimateTokens(rolePrompt(role, { task, domain, foundation: loadTheoryFoundation(), plan: out.planner ? JSON.stringify(out.planner, null, 2) : '', research: out.researcher ? JSON.stringify(out.researcher, null, 2) : '', critique: out.critic ? JSON.stringify(out.critic, null, 2) : '' })), 0);
  const result = {
    system: 'Mishrin Paradoxical Computer + Claude Booster', cache: 'miss', task, domain: domain || null, plan: { requested_tier: plan.requested_tier, tier: plan.tier, stages: plan.stages },
    final_result: finalResult, workflow,
    usage: { calls: ledger.calls, totals: ledger.t, effective_input_tokens: ledger.effective_input, baseline_naive_input_tokens_est: naive, input_saving_pct_est: +(100 * (naive - ledger.effective_input) / naive).toFixed(1), note: 'Actual API usage vs estimated naive 4-call pipeline (conservative: missing stage outputs counted as empty).' },
    important_note: 'AI-generated research is provisional. Proofs, novelty and empirical claims need independent verification.',
  };
  cache?.set(ckey, result);
  return result;
}

/** Batch with bounded concurrency; shares response cache. */
export async function boostMany(tasks, { concurrency = 2, ...opts } = {}) {
  const res = new Array(tasks.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (i < tasks.length) { const k = i++; const t = typeof tasks[k] === 'string' ? { task: tasks[k] } : tasks[k]; try { res[k] = await boost({ ...opts, ...t }); } catch (e) { res[k] = { error: e.message }; } }
  }));
  return res;
}

// ---------- CLI ----------
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.chdir(HERE); loadDotEnv();
  const args = process.argv.slice(2), flag = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
  const bool = new Set(['plan']); const skip = new Set(); args.forEach((a, i) => { if (a.startsWith('--')) { skip.add(i); if (!bool.has(a.slice(2))) skip.add(i + 1); } });
  const task = args.filter((a, i) => !skip.has(i)).join(' ').trim() || (flag('file') ? fs.readFileSync(flag('file'), 'utf8') : '');
  const cfg = boosterConfig(); if (flag('budget')) cfg.budget = Number(flag('budget'));
  if (!task) { console.error('Usage: node claude-booster.js [--plan] [--tier fast|standard|deep] [--budget N] [--file task.txt] "task"'); process.exit(2); }
  try {
    const r = args.includes('--plan') ? planReport(task, flag('domain') || '', cfg, flag('tier')) : await boost({ task, domain: flag('domain') || '', tier: flag('tier'), cfg });
    console.log(JSON.stringify(r, null, 2));
  } catch (e) { console.error(`claude-booster failed: ${e.message}`); process.exit(1); }
}
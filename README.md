# GYAN.AGI — Mishrin Paradoxical Intelligence & Computational Framework

Mishrin Paradoxical Intelligence & Computational Framework by Aman Mishra (India): Paradoxical Equilibrium research, multi-model AI orchestration, GPT Booster, and Token Squeezer.

## Overview

This repository brings together theoretical research and three related software projects exploring AI orchestration, context compression, and resource-aware computation.

**Author:** Aman Mishra  
**Country:** India  
**Email:** [scholarman287@gmail.com](mailto:scholarman287@gmail.com)

## Projects

### 1. Mishrin Paradoxical Computer
A model-agnostic, four-stage research orchestration prototype:
- **Planner:** decomposes a task into subtasks.
- **Researcher:** develops candidate analysis and solutions.
- **Independent critic:** challenges assumptions and looks for weaknesses.
- **Synthesizer:** consolidates findings into a structured response.

### 2. Mishrin GPT Booster (OpenAI adaptation)
An OpenAI Responses API integration layer with task tiers, configurable models, role prompts, token budgets, caching and usage tracking. It changes API request orchestration; it does not modify GPT model weights or ChatGPT's internal implementation.

### 3. Token Squeezer
A local text/context compression and proxy utility with query-aware pruning, input budgeting, caching and usage statistics. Compression can be lossy; verify that essential context, code, equations and constraints are preserved.

### 4. Paradoxical Equilibrium Theory
Theoretical research proposing a framework for understanding system-level stability amid competing tendencies and objectives. Its generality and empirical validity remain open research questions.

### 5. Paradoxical Equilibrium Computer Code
A LaTeX research document containing computational formalization and code-related material associated with the proposed framework.

## Repository layout

```text
.
├── README.md
├── projects/
│   ├── mishrin-gpt-booster-openai/   # OpenAI API booster source
│   ├── token-squeezer/               # Compression utility source
│   └── mishrin-paradoxical-computer/ # Research orchestration source
└── research/
    ├── paradoxical-equilibrium-theory.tex
    └── paradoxical-equilibrium-computer-code.tex
```

## Installation

Each project is independently packaged and has its own `package.json`, README and environment example. Extract or enter the relevant project directory, install its dependencies, configure environment variables from `.env.example`, then follow its local instructions.

Typical commands (run from an individual project directory):

```bash
npm install
npm test
npm start
```

Check the project-specific README for exact supported Node.js versions and commands. Never commit real API keys or populated `.env` files.

## Unified architecture — intended direction

The long-term design is to combine local context compression, task/model routing, and multi-stage research orchestration behind one interface. The current packages are separate prototypes; this README does not claim that they are already integrated into one executable service.

## Evaluation and limitations

- Multi-model workflows can increase latency, API cost and total token use.
- Compression does not guarantee a fixed token-saving percentage and may remove important context.
- AI criticism does not constitute formal verification or proof checking.
- The software does not retrain or modify commercial model weights.
- Productivity, accuracy, cost and token improvements require controlled benchmarking against a baseline.
- Paradoxical Equilibrium is a proposed research framework, not an established universal scientific law.

## Research objective

Investigate whether collective AI performance, reliability and system stability can be improved by balancing competing objectives while controlling computational resources.

## Author

**Aman Mishra** — India  
Email: [scholarman287@gmail.com](mailto:scholarman287@gmail.com)

**Mishrin — Intelligence through Equilibrium.**

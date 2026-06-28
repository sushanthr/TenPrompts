# On-Device AI Studio — 10 Prompt API Concepts

A portfolio of **10 distinct web apps** built on the browser's built-in
**Prompt API** (`window.LanguageModel` / Gemini Nano) — a local language model that runs
entirely on the user's device. No servers, no API keys, no per-token cost, and **no data
ever leaves the browser**.

https://sushanthr.github.io/TenPrompts/

## Run it

It's pure static HTML/CSS/JS. Either:

```bash
# from this folder
npx serve .
# or
python -m http.server 8000
```

Then open `http://localhost:8000/` (or just open `index.html` directly — it works over
`file://` too). Start at the directory page and click into any project.

## What's inside

| # | Project | Concept |
|---|---------|---------|
| 01 | **Inkwell** | Private AI journal with reflective prompts & mood tagging |
| 02 | **Glimmer** | Instant inline writing assistant (rephrase / tone / fix) |
| 03 | **Recall** | Ask-your-own-notes Q&A with citations |
| 04 | **PlainSpeak** | Plain-language / reading-level adapter (accessibility) |
| 05 | **Cortex** | Notes → quiz + Socratic study tutor |
| 06 | **Aether Tavern** | Living game NPCs with infinite improvised dialogue |
| 07 | **Veil** | On-device PII redactor (scrub before sending anywhere) |
| 08 | **Triage** | Email thread summarizer + reply drafter |
| 09 | **Tabula** | Messy text → structured CSV/JSON (uses `responseConstraint`) |
| 10 | **Relay** | Hybrid local + cloud routing architecture demo |

## Live mode vs. Demo mode

- **Live mode** — runs when the browser supports the Prompt API (Chrome with built-in AI
  enabled). Real on-device inference, streamed token by token.
- **Demo mode** — on any other browser, each app automatically falls back to a faithful
  *simulated* stream so the full UX is still presentable. Every page shows a badge telling
  you which mode it's in. **Nothing is uploaded in either mode.**

This means you can present the whole portfolio to a client on any laptop, today, and it
all works — while real on-device AI lights up automatically wherever it's available.

## How the API is used

All 10 apps share one ~120-line wrapper: [`assets/llm.js`](assets/llm.js).

```js
const lm = window.LanguageModel;
await lm.availability();                          // feature detect
const session = await lm.create({ initialPrompts, temperature, topK, monitor });
const stream = session.promptStreaming(text, { responseConstraint });
for await (const chunk of stream) { full += chunk; }   // chunks are deltas
```

API reference: https://sushanthr.github.io/PromptAPI/

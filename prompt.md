# Session — Building the On-Device AI Studio (Prompt API portfolio)

This file captures the session that produced this repository: a client-facing portfolio
of 10 web apps built on the browser's built-in **Prompt API** (`window.LanguageModel` /
Gemini Nano), plus a directory landing page.

---

## Prompt 1 — Ideation

> You are a Creative and professional web developer, there is now a new API to prompt a
> local language model in the browser. What would be the top 10 ways to leverage this API
> in your projects. Come up with a project description and how you would use the API and
> how it would be useful for the end user.

**Outcome:** A ranked list of 10 concepts, ordered by how well each exploits what's *unique*
about an on-device model rather than just "cloud AI but smaller." The through-line: the
winning ideas are ones that were previously **impossible** because the data couldn't leave
the device (privacy) or because per-call cost killed the business model.

1. Privacy-first AI journal
2. Inline writing / form assistant
3. Ask-your-own-data Q&A
4. Plain-language / reading-level accessibility adapter
5. Flashcards + Socratic tutor
6. Game NPC dialogue & narrative engine
7. On-device PII redaction (before sending to cloud)
8. Email / message triage & reply drafting
9. Unstructured text → structured data extraction
10. Hybrid local/cloud routing with graceful degradation

Key advantages emphasized: **fully private, instant (no round-trip), works offline, zero
per-call cost, no API keys.** Caveats noted: small models (~2–4B params) suit bounded tasks
(rewrite, classify, extract, short chat); always feature-detect and handle first-run model
download; keep a non-AI fallback.

---

## Prompt 2 — Build the portfolio

> BTW, https://sushanthr.github.io/PromptAPI/prompt.js roughly shows how the API can work.
> Create a portfolio of 10 projects in separate folders and a directory page with nice
> introduction to each concept I can show to my clients. Make each site look unique, modern
> colorful creative and sexy.

**Outcome:** Studied the reference `prompt.js` to mirror the real API surface, then built
the full portfolio.

### Real API pattern (mirrored from the reference)

```js
const lm = window.LanguageModel || window.ai.languageModel;
const status = await lm.availability();          // 'available' | 'downloadable' | 'downloading' | 'unavailable'
const session = await lm.create({
  initialPrompts: [{ role: 'system', content: systemPrompt }],
  temperature: 0.4, topK: 3,
  monitor(m){ m.addEventListener('downloadprogress', e => show(e.loaded / e.total)); }
});
const stream = session.promptStreaming(userText, { responseConstraint: schema });
for await (const chunk of stream) { full += chunk; }   // chunks are deltas
```

### What was built

- **`assets/llm.js`** — one shared ~120-line wrapper over the real Prompt API, with
  `responseConstraint` support, download-progress monitoring, and an automatic **Demo Mode**:
  if the live API isn't present, it fake-streams a faithful canned response so the full UX is
  presentable on any browser. Every page badges which mode it's in. Nothing is ever uploaded.
- **`index.html`** — premium directory landing page (animated aurora background, live
  API-availability indicator, 10 color-coded cards).
- **`projects/01..10/`** — 10 self-contained demo sites, each with its own palette,
  typography, and layout:

| # | Project | Concept | Identity |
|---|---------|---------|----------|
| 01 | Inkwell | Private AI journal | Ink-navy + cream + gold, Fraunces |
| 02 | Glimmer | Inline writing assist | Neon magenta/violet, Space Grotesk |
| 03 | Recall | Ask-your-notes Q&A | Dark teal/blue knowledge UI |
| 04 | PlainSpeak | Readability adapter | Friendly green, Outfit |
| 05 | Cortex | Study tutor | Violet→pink→lime, Lexend |
| 06 | Aether Tavern | Living game NPCs | Dark fantasy ember, Cinzel |
| 07 | Veil | PII redactor | Security mono, redaction bars |
| 08 | Triage | Inbox summarize + reply | Blue/coral productivity |
| 09 | Tabula | Text → CSV/JSON | Lime brutalist, structured output |
| 10 | Relay | Hybrid local/cloud router | Local-vs-cloud visualizer |

Projects 07 (Veil) and 09 (Tabula) use the API's `responseConstraint` for structured JSON
output.

---

## Prompt 3 — Housekeeping

> Save this session to the repo as an md file prompt.md, and fix the title of the first
> commit in the repo it has a spelling error and finally push.

**Outcome:** This file added; the initial commit message corrected (`singel` → `single`);
the remote's README website-link update preserved; history rewritten and force-pushed.

---

*Reference API: https://sushanthr.github.io/PromptAPI/*

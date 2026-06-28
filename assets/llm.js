/*
 * llm.js — a tiny shared wrapper around the browser's built-in Prompt API.
 *
 * Real API (Chrome built-in AI / Gemini Nano), mirrored from prompt.js:
 *   const lm = window.LanguageModel || window.ai.languageModel;
 *   await lm.availability();                       -> 'available' | 'downloadable' | 'downloading' | 'unavailable'
 *   const s  = await lm.create({ initialPrompts, temperature, topK, monitor, signal });
 *   const stream = s.promptStreaming(text, { responseConstraint, signal });
 *   for await (const chunk of stream) { full += chunk; }   // chunks are deltas
 *
 * If the API isn't present (most browsers today), run() falls back to a local
 * "demo mode" that fake-streams a canned response so the UX is fully viewable.
 * Every demo page badges this honestly.
 *
 * Loaded as a classic script so it works over file:// as well as http(s).
 */
window.PromptAPI = (function () {
  "use strict";

  function getLM() {
    if (window.LanguageModel) return window.LanguageModel;
    if (window.ai && window.ai.languageModel) return window.ai.languageModel;
    return null;
  }

  function supported() { return !!getLM(); }

  async function availability() {
    const lm = getLM();
    if (!lm) return "unavailable";
    try { return await lm.availability(); }
    catch (e) { return "unavailable"; }
  }

  /*
   * run(cfg) — the one call every demo uses.
   * cfg:
   *   system       string   system prompt (persona / instructions)
   *   temperature  number
   *   topK         number
   *   prompt       string   the user turn
   *   schema       object|RegExp  responseConstraint for structured output
   *   onChunk      (fullText, delta) => void   called as text streams in
   *   onStatus     (state, pct) => void  state: 'checking'|'live'|'demo'|'downloading'
   *   signal       AbortSignal
   *   simulate     (prompt) => string    canned text used in demo mode
   * resolves to the final accumulated string.
   */
  async function run(cfg) {
    cfg = cfg || {};
    const onChunk = cfg.onChunk || function () {};
    const onStatus = cfg.onStatus || function () {};
    const lm = getLM();

    // No API -> demo mode.
    if (!lm) {
      onStatus("demo");
      return fakeStream(pickSim(cfg), onChunk, cfg.signal);
    }

    onStatus("checking");
    let status = "unavailable";
    try { status = await lm.availability(); } catch (e) {}

    if (status === "unavailable") {
      onStatus("demo");
      return fakeStream(pickSim(cfg), onChunk, cfg.signal);
    }

    const opts = {};
    if (cfg.system) opts.initialPrompts = [{ role: "system", content: cfg.system }];
    if (cfg.temperature != null) opts.temperature = cfg.temperature;
    if (cfg.topK != null) opts.topK = cfg.topK;
    if (cfg.signal) opts.signal = cfg.signal;
    opts.monitor = function (m) {
      m.addEventListener("downloadprogress", function (e) {
        onStatus("downloading", Math.round((e.loaded * 100) / (e.total || 1)));
      });
    };

    try {
      const session = await lm.create(opts);
      onStatus("live");
      const popts = {};
      if (cfg.schema) popts.responseConstraint = cfg.schema;
      if (cfg.signal) popts.signal = cfg.signal;

      let full = "";
      const stream = session.promptStreaming(cfg.prompt, popts);
      for await (const chunk of stream) {
        full += chunk;          // chunks are incremental deltas
        onChunk(full, chunk);
      }
      try { session.destroy && session.destroy(); } catch (e) {}
      return full;
    } catch (e) {
      // Any runtime failure -> graceful demo fallback.
      onStatus("demo");
      return fakeStream(pickSim(cfg), onChunk, cfg.signal);
    }
  }

  function pickSim(cfg) {
    if (typeof cfg.simulate === "function") return cfg.simulate(cfg.prompt || "");
    if (typeof cfg.simulate === "string") return cfg.simulate;
    return "On-device AI isn’t enabled in this browser, so this is a simulated preview of the experience.";
  }

  // Fake token-by-token streaming for demo mode.
  function fakeStream(text, onChunk, signal) {
    return new Promise(function (resolve) {
      const tokens = String(text).split(/(\s+)/);
      let full = "", i = 0;
      (function tick() {
        if (signal && signal.aborted) return resolve(full);
        if (i >= tokens.length) return resolve(full);
        full += tokens[i++];
        onChunk(full, "");
        setTimeout(tick, 14 + Math.random() * 34);
      })();
    });
  }

  // Convenience: a label + tone for the status badge.
  function statusLabel(state, pct) {
    switch (state) {
      case "live":        return { text: "Live · on-device AI", tone: "live" };
      case "checking":    return { text: "Checking model…", tone: "wait" };
      case "downloading": return { text: "Downloading model " + (pct || 0) + "%", tone: "wait" };
      case "demo":        return { text: "Demo mode · simulated", tone: "demo" };
      default:            return { text: state || "", tone: "wait" };
    }
  }

  return { getLM: getLM, supported: supported, availability: availability, run: run, statusLabel: statusLabel };
})();

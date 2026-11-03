(function () {
  "use strict";

  /*
   * Price-currency switch for the Pricing section.
   *
   * Prices are written in rupees in site-content.js. This module shows them in
   * Singapore dollars or UAE dirhams as a guide; invoices stay in rupees.
   *
   *  - Rates come from api.frankfurter.dev (reference rates from the ECB and
   *    central banks, no key). They are fetched only when a visitor first picks a
   *    non-rupee currency, kept for 12 hours, and checked before use.
   *  - If the fetch fails, the dated rates saved in site-content.js are used and
   *    the page says so. A wrong number is never shown as a live one.
   *  - Amounts in site-content.js are tokens: {inr:1200}, {inr:1000-5000},
   *    {usd:100} and {usda:495} (a dollar price that shows "(about ₹…)" in rupee mode).
   *  {trial:price|total|deposit|balance} are the paid-trial figures, kept consistent with each other.
   */
  var pricing = (window.KENISHA_PORTFOLIO || {}).pricing || {};
  var API = "https://api.frankfurter.dev/v2/rates?base=INR&quotes=SGD,AED,USD";
  var STORAGE_CHOICE = "kk-currency";
  var STORAGE_RATES = "kk-fx";
  var MAX_AGE = 12 * 3600 * 1000;
  var ASSUMED_USD_INR = 88; // only used to write "(about ₹…)" next to a dollar price in rupee mode

  var META = {
    INR: { prefix: "₹", locale: "en-IN", label: "₹ INR", name: "Indian rupees" },
    SGD: { prefix: "S$", locale: "en-US", label: "S$ SGD", name: "Singapore dollars" },
    AED: { prefix: "AED ", locale: "en-US", label: "AED", name: "UAE dirhams" }
  };
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  var saved = pricing.fx && pricing.fx.rates ? pricing.fx : null;
  var listed = (Array.isArray(pricing.currencies) ? pricing.currencies : []).filter(function (code) {
    return META[code] && code !== "INR" && saved && saved.rates[code] > 0 && saved.rates.USD > 0;
  });

  var state = {
    code: "INR",
    rates: saved ? { SGD: saved.rates.SGD, AED: saved.rates.AED, USD: saved.rates.USD } : null,
    date: saved ? saved.date : "",
    source: "saved",       // "saved" (from site-content.js) | "live"
    failed: false          // a live fetch was tried and did not work
  };
  var listeners = [];
  var fetching = false;
  var formatters = {};

  function store(read, key, value) {
    try {
      if (read) return window.localStorage.getItem(key);
      if (value === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, value);
    } catch (error) { /* private mode or blocked storage: the switch simply won't be remembered */ }
    return null;
  }

  function group(value, code) {
    var key = META[code].locale;
    if (!formatters[key]) formatters[key] = new Intl.NumberFormat(key, { maximumFractionDigits: 1 });
    return formatters[key].format(value);
  }

  /* Round to a figure that reads cleanly while staying within about 2.5% of the exact value. */
  function nice(value) {
    var step = value < 100 ? 1 : value < 1000 ? 5 : value < 10000 ? 10 : 50;
    return Math.max(step === 1 ? 1 : 0, Math.round(value / step) * step);
  }

  function unitRate(code) { return state.rates && state.rates[code] > 0 ? state.rates[code] : 0; }
  function inrToLocal(amount) { return amount * unitRate(state.code); }
  function usdToLocal(amount) { return amount * unitRate(state.code) / state.rates.USD; }

  function isInr() { return state.code === "INR" || !unitRate(state.code); }
  function prefix() { return META[isInr() ? "INR" : state.code].prefix; }

  /* A rupee amount shown in the chosen currency (rounded when converted). */
  function money(inr) {
    return isInr() ? "₹" + group(Math.round(inr), "INR") : prefix() + group(nice(inrToLocal(inr)), state.code);
  }

  /* Pieces for the trial card, kept consistent: total = reels × unit, deposit = its share of the total. */
  function trialFigures(trial) {
    var total = trial.reels * trial.price;
    if (isInr()) {
      return { price: money(trial.price), total: money(total), deposit: money(trial.deposit), balance: money(total - trial.deposit) };
    }
    var unit = nice(inrToLocal(trial.price));
    var all = unit * trial.reels;
    var deposit = Math.round(all * (trial.deposit / total) * 2) / 2;
    var p = prefix();
    // Half amounts are written with cents so "S$16.50" never reads as "S$16.5".
    var exact = function (v) { return p + (Number.isInteger(v) ? group(v, state.code) : v.toFixed(2)); };
    return { price: exact(unit), total: exact(all), deposit: exact(deposit), balance: exact(all - deposit) };
  }

  /* Short label for the chart axis: ₹25k, S$340, AED 1.1k. */
  function axisLabel(inr) {
    if (inr === 0) return "0";
    if (isInr()) return "₹" + inr / 1000 + "k";
    var local = inrToLocal(inr);
    return prefix() + (local >= 1000 ? Math.round(local / 100) / 10 + "k" : group(nice(local), state.code));
  }

  function parseRange(text) {
    var parts = String(text).split("-").map(Number);
    return parts.filter(function (n) { return isFinite(n); });
  }

  function joinRange(parts, format) {
    return parts.map(format).join("–");
  }

  /* Replace {inr:…} {usd:…} {usda:…} {fxnote} in a piece of text. */
  function expand(text) {
    if (typeof text !== "string" || text.indexOf("{") < 0) return text;
    return text.replace(/\{(inr|usd|usda):([\d-]+)\}|\{trial:(price|total|deposit|balance)\}|\{fxnote\}/g, function (match, kind, value, trialKey) {
      if (trialKey) return pricing.trial ? trialFigures(pricing.trial)[trialKey] : match;
      if (match === "{fxnote}") return isInr() ? " Dollar amounts are converted at an assumed ₹" + ASSUMED_USD_INR + "." : "";
      var parts = parseRange(value);
      if (!parts.length) return match;
      if (kind === "inr") {
        if (isInr()) return "₹" + joinRange(parts, function (n) { return group(n, "INR"); });
        return prefix() + joinRange(parts, function (n) { return group(nice(inrToLocal(n)), state.code); });
      }
      if (!isInr()) return prefix() + joinRange(parts, function (n) { return group(nice(usdToLocal(n)), state.code); });
      var dollars = "$" + joinRange(parts, function (n) { return group(n, "INR"); });
      if (kind === "usd") return dollars;
      return dollars + " (about ₹" + joinRange(parts, function (n) { return group(Math.round(n * ASSUMED_USD_INR / 10) * 10, "INR"); }) + ")";
    }).replace(/\s{2,}/g, " ").trim();
  }

  function prettyDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
    return m ? Number(m[3]) + " " + months[Number(m[2]) - 1] + " " + m[1] : "";
  }

  /* The honest line under the switch: which rate, from when, and that billing stays in rupees. */
  function rateLine() {
    if (isInr()) return "";
    var perUnit = 1 / unitRate(state.code);
    var shown = (perUnit >= 10 ? perUnit.toFixed(2) : perUnit.toFixed(3)).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
    var unit = state.code === "AED" ? "AED 1" : "S$1";
    var line = "Approximate. Billing stays in rupees. Rate of " + prettyDate(state.date) + ": " + unit + " = ₹" + shown + ".";
    if (state.source === "saved" && state.failed) line += " Live rates could not be loaded, so a saved rate is used.";
    return line;
  }

  function notify() { listeners.forEach(function (fn) { fn(); }); }

  /* ── rates ────────────────────────────────────────────────────────── */
  function plausible(rates) {
    if (!rates || !saved) return false;
    var ok = ["SGD", "AED", "USD"].every(function (code) {
      var rate = rates[code], base = saved.rates[code];
      return typeof rate === "number" && isFinite(rate) && rate > 0 && rate > base * 0.6 && rate < base * 1.6;
    });
    // The dirham is pegged to the dollar at 3.6725, so the two must agree.
    return ok && Math.abs(rates.AED / rates.USD - 3.6725) < 0.04;
  }

  function adopt(rates, date, source) {
    state.rates = { SGD: rates.SGD, AED: rates.AED, USD: rates.USD };
    state.date = date;
    state.source = source;
    state.failed = false;
  }

  function readCache() {
    try {
      var cached = JSON.parse(store(true, STORAGE_RATES) || "null");
      if (cached && Date.now() - cached.t < MAX_AGE && plausible(cached.rates) && /^\d{4}-\d{2}-\d{2}$/.test(cached.date)) {
        adopt(cached.rates, cached.date, "live");
        return true;
      }
    } catch (error) { /* ignore a corrupt cache */ }
    return false;
  }

  function refresh() {
    if (fetching || !saved || typeof fetch !== "function") return;
    if (readCache()) { notify(); return; }
    fetching = true;
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 4500) : 0;
    fetch(API, { signal: controller ? controller.signal : undefined, headers: { Accept: "application/json" } })
      .then(function (response) { if (!response.ok) throw new Error("rates " + response.status); return response.json(); })
      .then(function (rows) {
        var rates = {}, date = "";
        (Array.isArray(rows) ? rows : []).forEach(function (row) {
          if (row && row.base === "INR") { rates[row.quote] = Number(row.rate); date = row.date || date; }
        });
        if (!plausible(rates) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("rates not usable");
        adopt(rates, date, "live");
        store(false, STORAGE_RATES, JSON.stringify({ t: Date.now(), date: date, rates: rates }));
      })
      .catch(function () { state.failed = true; })
      .then(function () { fetching = false; clearTimeout(timer); notify(); });
  }

  /* ── choice ───────────────────────────────────────────────────────── */
  function use(code) {
    if (code !== "INR" && listed.indexOf(code) < 0) code = "INR";
    state.code = code;
    store(false, STORAGE_CHOICE, code === "INR" ? null : code);
    if (code !== "INR") refresh();
    notify();
  }

  var remembered = store(true, STORAGE_CHOICE);
  if (remembered && listed.indexOf(remembered) >= 0) { state.code = remembered; refresh(); }

  window.KKCurrency = {
    codes: ["INR"].concat(listed),
    meta: META,
    code: function () { return isInr() ? "INR" : state.code; },
    use: use,
    isInr: isInr,
    money: money,
    expand: expand,
    trialFigures: trialFigures,
    axisLabel: axisLabel,
    rateLine: rateLine,
    onChange: function (fn) { listeners.push(fn); }
  };
})();

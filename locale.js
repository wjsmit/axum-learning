/*
 * locale.js — Axum Learning country/UX layer.
 *
 * Responsibilities (UX layer only — never touches content/objective codes):
 *   1. Auto-detect the visitor's country (IP geo) and let them override it; remember the choice.
 *   2. Show prices in the local currency = usd_base x PPP-tier x live FX.
 *   3. Show the right local "year" label for a Cambridge stage (Stage / Year / Grade / Class).
 *   4. Expose the programme/board list so the questionnaire can accept ANY board.
 *
 * Data source: data/locale-map.json (the single source of truth).
 * No build step, no dependencies. Include with:  <script src="locale.js" defer></script>
 *
 * DOM hooks (all optional — present only on pages that need them):
 *   [data-locale-bar]        container the country picker is injected into (else .header-inner)
 *   [data-price-usd="30"]    element whose text becomes the localized price of $30
 *   [data-stage-label="stage-7"]  element whose text becomes the local label for that stage
 *   [data-locale-programmes] <select> populated with every board
 *   [data-locale-levels]     <select> populated with the stages, labelled for the chosen country
 *
 * JS API:  window.Locale.ready (Promise), .setCountry(code), .country(), .programmes(),
 *          .stageLabel(stageId), .formatPrice(usd), .onChange(fn)
 */
(function () {
  "use strict";

  var STORE_COUNTRY = "axum.country";
  var STORE_FX = "axum.fx.usd";
  var FX_TTL_MS = 12 * 60 * 60 * 1000; // 12h
  var GEO_ENDPOINTS = [
    { url: "https://ipwho.is/", pick: function (j) { return j && j.success ? j.country_code : null; } },
    { url: "https://ipapi.co/json/", pick: function (j) { return j ? j.country_code || j.country : null; } }
  ];
  var FX_ENDPOINT = "https://open.er-api.com/v6/latest/USD";

  var MAP = null;          // loaded locale-map.json
  var byCountry = {};      // code -> country
  var byStage = {};        // id   -> stage
  var fxRates = null;      // { GBP: 0.79, ... } relative to USD
  var currentCode = null;  // active country code
  var listeners = [];

  // ---- small helpers -------------------------------------------------------
  function get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, v) { try { localStorage.setItem(key, v); } catch (e) {} }

  function fetchJSON(url, ms) {
    var ctl = ("AbortController" in window) ? new AbortController() : null;
    var t = ctl ? setTimeout(function () { ctl.abort(); }, ms || 4000) : null;
    return fetch(url, ctl ? { signal: ctl.signal } : undefined)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .finally(function () { if (t) clearTimeout(t); });
  }

  function country(code) { return byCountry[code] || byCountry[MAP.default_country]; }
  function tierMult(c) { var t = MAP.price_tiers[c.tier]; return t ? t.ppp_multiplier : 1; }

  // ---- detection -----------------------------------------------------------
  function detectFromNavigator() {
    var langs = navigator.languages || [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      var m = /[-_]([A-Za-z]{2})\b/.exec(langs[i] || "");
      if (m && byCountry[m[1].toUpperCase()]) return m[1].toUpperCase();
    }
    return null;
  }

  function detectGeo() {
    // Try endpoints in order; resolve to a supported code or null. Never rejects.
    return GEO_ENDPOINTS.reduce(function (p, ep) {
      return p.then(function (found) {
        if (found) return found;
        return fetchJSON(ep.url, 3500)
          .then(function (j) { var c = ep.pick(j); return c && byCountry[c.toUpperCase()] ? c.toUpperCase() : null; })
          .catch(function () { return null; });
      });
    }, Promise.resolve(null));
  }

  function resolveCountry() {
    var saved = get(STORE_COUNTRY);
    if (saved && byCountry[saved]) return Promise.resolve(saved);   // explicit override wins
    return detectGeo().then(function (geo) {
      return geo || detectFromNavigator() || MAP.default_country;   // geo > browser locale > default
    });
  }

  // ---- FX ------------------------------------------------------------------
  function loadFX() {
    var cached = get(STORE_FX);
    if (cached) {
      try { var o = JSON.parse(cached); if (o && Date.now() - o.t < FX_TTL_MS && o.rates) { fxRates = o.rates; return Promise.resolve(); } } catch (e) {}
    }
    return fetchJSON(FX_ENDPOINT, 4000)
      .then(function (j) { if (j && j.rates) { fxRates = j.rates; set(STORE_FX, JSON.stringify({ t: Date.now(), rates: j.rates })); } })
      .catch(function () { /* no FX -> prices stay in USD */ });
  }

  // ---- formatting ----------------------------------------------------------
  function niceRound(n) {
    if (n >= 1000) return Math.round(n / 100) * 100;
    if (n >= 100) return Math.round(n / 10) * 10;
    return Math.round(n);
  }

  function formatPrice(usd) {
    var c = country(currentCode);
    var rate = (fxRates && fxRates[c.currency]) ? fxRates[c.currency] : (c.currency === "USD" ? 1 : null);
    var localCurrency = rate ? c.currency : "USD";
    var amount = niceRound(usd * tierMult(c) * (rate || 1));
    try {
      return new Intl.NumberFormat(c.locale || "en", {
        style: "currency", currency: localCurrency, maximumFractionDigits: 0
      }).format(amount);
    } catch (e) {
      return localCurrency + " " + amount;
    }
  }

  function stageLabel(stageId) {
    var s = byStage[stageId];
    if (!s) return stageId;
    var sys = country(currentCode).labels || "stage";
    return s.labels[sys] || s.labels.stage;
  }

  // ---- DOM application -----------------------------------------------------
  function apply() {
    document.querySelectorAll("[data-price-usd]").forEach(function (el) {
      var usd = parseFloat(el.getAttribute("data-price-usd"));
      if (!isNaN(usd)) el.textContent = formatPrice(usd);
    });
    document.querySelectorAll("[data-stage-label]").forEach(function (el) {
      el.textContent = stageLabel(el.getAttribute("data-stage-label"));
    });
    document.querySelectorAll("[data-locale-levels]").forEach(populateLevels);
    var picker = document.getElementById("axum-country-select");
    if (picker) picker.value = currentCode;
    listeners.forEach(function (fn) { try { fn(currentCode); } catch (e) {} });
  }

  function populateLevels(sel) {
    var keep = sel.value;
    sel.innerHTML = "";
    MAP.stages.forEach(function (s) {
      var o = document.createElement("option");
      o.value = s.id;
      o.textContent = stageLabel(s.id) + " · age " + s.age;
      sel.appendChild(o);
    });
    if (keep) sel.value = keep;
  }

  function populateProgrammes(sel) {
    if (sel.options.length) return; // don't clobber if already built
    MAP.programmes.forEach(function (p) {
      var o = document.createElement("option");
      o.value = p.id;
      o.textContent = p.name;
      sel.appendChild(o);
    });
    sel.value = MAP.default_programme;
  }

  // ---- country picker UI ---------------------------------------------------
  function buildPicker() {
    var host = document.querySelector("[data-locale-bar]") || document.querySelector(".nav") || document.querySelector(".header-inner");
    if (!host || document.getElementById("axum-country-select")) return;

    var wrap = document.createElement("label");
    wrap.className = "locale-picker";
    wrap.setAttribute("aria-label", "Choose your country");

    var globe = document.createElement("span");
    globe.className = "locale-picker__icon";
    globe.setAttribute("aria-hidden", "true");
    globe.textContent = "🌐";

    var sel = document.createElement("select");
    sel.id = "axum-country-select";
    sel.className = "locale-picker__select";

    MAP.countries.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c.code;
      o.textContent = c.name;
      sel.appendChild(o);
    });
    sel.value = currentCode;
    sel.addEventListener("change", function () { setCountry(sel.value); });

    wrap.appendChild(globe);
    wrap.appendChild(sel);
    host.appendChild(wrap);
  }

  // ---- public API ----------------------------------------------------------
  function setCountry(code) {
    if (!byCountry[code]) return;
    currentCode = code;
    set(STORE_COUNTRY, code);
    apply();
  }

  var api = {
    ready: null,
    setCountry: setCountry,
    country: function () { return country(currentCode); },
    countryCode: function () { return currentCode; },
    programmes: function () { return MAP ? MAP.programmes.slice() : []; },
    stages: function () { return MAP ? MAP.stages.slice() : []; },
    stageLabel: stageLabel,
    formatPrice: formatPrice,
    populateProgrammes: populateProgrammes,
    populateLevels: populateLevels,
    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); }
  };
  window.Locale = api;

  // ---- boot ----------------------------------------------------------------
  function dataURL() {
    // resolve data/locale-map.json relative to this script, so it works from any page
    var s = document.currentScript || (function () { var a = document.getElementsByTagName("script"); return a[a.length - 1]; })();
    var base = s && s.src ? s.src.replace(/[^/]*$/, "") : "";
    return base + "data/locale-map.json";
  }

  api.ready = fetchJSON(dataURL(), 6000)
    .then(function (m) {
      MAP = m;
      m.countries.forEach(function (c) { byCountry[c.code] = c; });
      m.stages.forEach(function (s) { byStage[s.id] = s; });
      return Promise.all([resolveCountry(), loadFX()]);
    })
    .then(function (res) {
      currentCode = res[0];
      function go() {
        document.querySelectorAll("[data-locale-programmes]").forEach(populateProgrammes);
        buildPicker();
        apply();
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
      else go();
    })
    .catch(function (e) { if (window.console) console.warn("[locale] init failed:", e); });
})();

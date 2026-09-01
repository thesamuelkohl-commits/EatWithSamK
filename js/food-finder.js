/* Homepage "What Should I Eat?" — filters PLACES (js/data.js) client-side
   and randomly surfaces one match, reusing placeCardHtml() so a result
   looks identical to every other card on the site. No restaurant is ever
   hardcoded here — the only data source is PLACES/BADGES/PRICE_GUIDE, same
   as reviews.js and app.js. Geolocation is only requested when the visitor
   clicks "Use My Location", never on page load, and coordinates are kept
   in memory only (never stored, never sent to analytics). */

(function () {
  const root = document.getElementById("food-finder");
  if (!root || typeof PLACES === "undefined") return;

  // Hard floor, not a filter the visitor can loosen — no UI control sets
  // this, and showClosestMatch() below never relaxes it either.
  const MIN_SCORE = 8.0;

  const els = {
    useLocationBtn: document.getElementById("finder-use-location"),
    locationNote: document.getElementById("finder-location-note"),
    distanceGroup: document.getElementById("finder-distance-group"),
    distanceSelect: document.getElementById("finder-distance"),
    cuisine: document.getElementById("finder-cuisine"),
    price: document.getElementById("finder-price"),
    tag: document.getElementById("finder-tag"),
    submit: document.getElementById("finder-submit"),
    result: document.getElementById("finder-result"),
  };

  /* ---------- Populate filters from PLACES — never a hardcoded list ---------- */
  const cuisines = [...new Set(PLACES.map((p) => p.cuisine).filter(Boolean))].sort();
  els.cuisine.innerHTML =
    `<option value="">Anything</option>` +
    cuisines.map((c) => `<option value="${escapeForAttr(c)}">${c}</option>`).join("");

  els.price.innerHTML =
    `<option value="">Any</option>` +
    Object.keys(PRICE_GUIDE).map((price) => `<option value="${price}">${price}</option>`).join("");

  // Same rule as reviews.js: only show a Vibe option that at least one place
  // actually has, so no filter can ever return zero results on its own.
  const usedBadgeKeys = [...new Set(PLACES.flatMap((p) => p.badges || []))].filter((key) => BADGES[key]);
  els.tag.innerHTML =
    `<option value="">Anything</option>` +
    usedBadgeKeys.map((key) => `<option value="${key}">${BADGES[key].emoji} ${BADGES[key].label}</option>`).join("");

  /* ---------- Location state ---------- */
  let userCoords = null; // { lat, lng } — in memory only, never persisted

  function haversineMiles(lat1, lng1, lat2, lng2) {
    const R = 3958.8; // Earth radius in miles
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function formatDistance(mi) {
    if (mi < 1) return "Less than 1 mile away";
    if (mi < 10) return `${mi.toFixed(1)} miles away`;
    return `${Math.round(mi)} miles away`;
  }

  function track(name, params) {
    if (typeof gtag === "function") gtag("event", name, params || {});
  }

  function setLocationNote(text) {
    els.locationNote.textContent = text;
  }

  els.useLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      setLocationNote("Location isn't available in this browser. You can still search all Eat With Sam K restaurants.");
      return;
    }
    els.useLocationBtn.disabled = true;
    els.useLocationBtn.textContent = "📍 Finding you…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        els.useLocationBtn.hidden = true;
        els.locationNote.hidden = true;
        els.distanceGroup.hidden = false;
        track("food_finder_location_enabled");
      },
      () => {
        userCoords = null;
        els.useLocationBtn.disabled = false;
        els.useLocationBtn.textContent = "📍 Use My Location";
        els.distanceGroup.hidden = true;
        setLocationNote("Location access is off. You can still search all Eat With Sam K restaurants.");
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 }
    );
  });

  els.distanceSelect.addEventListener("change", () => {
    track("food_finder_radius_selected", { radius: els.distanceSelect.value });
  });

  /* ---------- Matching pool ---------- */
  function currentFilters() {
    return {
      cuisine: els.cuisine.value,
      price: els.price.value,
      tag: els.tag.value,
      radius: userCoords ? els.distanceSelect.value : null,
    };
  }

  // `skip*` flags let "Show Closest Match" relax one filter at a time
  // without ever inventing a restaurant that isn't in PLACES. MIN_SCORE is
  // deliberately not skippable here — it's a floor, not a filter.
  function poolFor(filters, skip) {
    skip = skip || {};
    let list = PLACES.filter((p) => p.rating >= MIN_SCORE);
    if (userCoords && filters.radius && filters.radius !== "any" && !skip.distance) {
      const r = parseFloat(filters.radius);
      list = list.filter((p) => haversineMiles(userCoords.lat, userCoords.lng, p.lat, p.lng) <= r);
    }
    if (filters.cuisine && !skip.cuisine) list = list.filter((p) => p.cuisine === filters.cuisine);
    if (filters.price && !skip.price) list = list.filter((p) => p.price === filters.price);
    if (filters.tag && !skip.tag) list = list.filter((p) => (p.badges || []).includes(filters.tag));
    return list;
  }

  let lastShownId = null;

  // Discovery over "always the best": pick randomly, and avoid immediately
  // repeating the same place again when other matches exist.
  function pickRandom(list) {
    let pool = list;
    if (pool.length > 1 && lastShownId) {
      const withoutLast = pool.filter((p) => p.id !== lastShownId);
      if (withoutLast.length) pool = withoutLast;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function distanceLabelFor(place) {
    if (!userCoords) return null;
    return formatDistance(haversineMiles(userCoords.lat, userCoords.lng, place.lat, place.lng));
  }

  function renderResult(place, filters) {
    lastShownId = place.id;
    els.result.innerHTML = `
      <p class="finder-result-label">🍽️ Sam's Pick For You</p>
      ${placeCardHtml(place, { distanceLabel: distanceLabelFor(place) })}
      <div class="finder-actions">
        <button type="button" class="btn btn-ghost" id="finder-another">🔀 Show Me Another</button>
      </div>`;
    hydrateFavoriteButtons(els.result);
    track("food_finder_result", {
      cuisine: filters.cuisine || "any",
      price: filters.price || "any",
      min_score: MIN_SCORE,
      result: place.id,
    });
  }

  function renderEmptyLocation(filters) {
    const radius = filters.radius;
    const nextSteps = { 5: ["10", "Expand to 10 Miles"], 10: ["25", "Expand to 25 Miles"], 25: ["50", "Expand to 50 Miles"], 50: ["any", "Search Any Distance"] };
    const next = nextSteps[radius];

    els.result.innerHTML = `
      <div class="finder-empty">
        <p>No exact matches within ${radius === "any" ? "any distance" : radius + " miles"}.</p>
        <div class="finder-actions">
          ${next ? `<button type="button" class="btn btn-primary" id="finder-expand" data-radius="${next[0]}">${next[1]}</button>` : ""}
          <button type="button" class="btn btn-ghost" id="finder-widen">Widen My Filters</button>
        </div>
      </div>`;

    const expandBtn = document.getElementById("finder-expand");
    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        els.distanceSelect.value = expandBtn.dataset.radius;
        runFinder();
      });
    }
    document.getElementById("finder-widen").addEventListener("click", resetFilters);
  }

  function renderEmptyGeneral() {
    els.result.innerHTML = `
      <div class="finder-empty">
        <p>No exact match yet, try widening your filters.</p>
        <div class="finder-actions">
          <button type="button" class="btn btn-ghost" id="finder-reset">Reset Filters</button>
          <button type="button" class="btn btn-primary" id="finder-closest">Show Closest Match</button>
        </div>
      </div>`;
    document.getElementById("finder-reset").addEventListener("click", resetFilters);
    document.getElementById("finder-closest").addEventListener("click", showClosestMatch);
  }

  function resetFilters() {
    els.cuisine.value = "";
    els.price.value = "";
    els.tag.value = "";
    runFinder();
  }

  // Relaxes filters one at a time (tag, then price, then cuisine, then
  // distance) until something matches — always a real place from PLACES,
  // never invented, and never below MIN_SCORE.
  function showClosestMatch() {
    const filters = currentFilters();
    const steps = [
      { tag: true },
      { tag: true, price: true },
      { tag: true, price: true, cuisine: true },
      { tag: true, price: true, cuisine: true, distance: true },
    ];
    for (const skip of steps) {
      const pool = poolFor(filters, skip);
      if (pool.length) {
        renderResult(pickRandom(pool), filters);
        return;
      }
    }
    els.result.innerHTML = `<div class="finder-empty"><p>No reviews yet, check back soon. 👀</p></div>`;
  }

  function runFinder() {
    const filters = currentFilters();
    track("food_finder_used", {
      cuisine: filters.cuisine || "any",
      price: filters.price || "any",
      min_score: MIN_SCORE,
      radius: filters.radius || "any",
    });
    const pool = poolFor(filters);
    if (!pool.length) {
      if (userCoords && filters.radius && filters.radius !== "any") renderEmptyLocation(filters);
      else renderEmptyGeneral();
      return;
    }
    renderResult(pickRandom(pool), filters);
  }

  els.submit.addEventListener("click", runFinder);

  els.result.addEventListener("click", (e) => {
    if (e.target.closest("#finder-another")) {
      runFinder();
      return;
    }
    if (e.target.closest('a[href^="/reviews/"]')) {
      track("food_finder_review_clicked", { result: lastShownId });
    }
  });

  // Fires only when the place currently shown in the finder gets saved —
  // not for favorites toggled anywhere else on the page.
  document.addEventListener("favorites:change", (e) => {
    if (e.detail && e.detail.id === lastShownId && e.detail.active) {
      track("food_finder_saved", { result: lastShownId });
    }
  });
})();

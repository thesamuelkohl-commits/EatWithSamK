/* Map page: the interactive map of every place rated, full-size, plus
   rating/city/cuisine/price/tag/saved filters. Shares its map logic with
   the homepage via initPlacesMap() in common.js. */

const { map, markers } = initPlacesMap("map", PLACES);

const slider = document.getElementById("rating-slider");
const sliderValue = document.getElementById("rating-slider-value");
const cityEl = document.getElementById("filter-city");
const cuisineEl = document.getElementById("filter-cuisine");
const priceGroupEl = document.getElementById("filter-price-group");
const priceEl = document.getElementById("filter-price");
const tagsGroupEl = document.getElementById("filter-tags-group");
const tagsEl = document.getElementById("filter-tags");
const savedBtn = document.getElementById("filter-saved");
const clearBtn = document.getElementById("filters-clear");

const activePrices = new Set();
const activeTags = new Set();
let savedOnly = false;

/* ---------- Build filter options from whatever's actually in PLACES ---------- */

const cities = [...new Set(PLACES.map((p) => p.city))].sort();
cityEl.innerHTML =
  `<option value="">All Cities</option>` +
  cities.map((c) => `<option value="${escapeForAttr(c)}">${c}</option>`).join("");

const cuisines = [...new Set(PLACES.map((p) => p.cuisine).filter(Boolean))].sort();
cuisineEl.innerHTML =
  `<option value="">All Cuisines</option>` +
  cuisines.map((c) => `<option value="${escapeForAttr(c)}">${c}</option>`).join("");

priceEl.innerHTML = Object.entries(PRICE_GUIDE)
  .map(([price, tier]) => `<button type="button" class="filter-pill has-tooltip" data-price="${escapeForAttr(price)}" ${tooltipAttrs(`${tier.range}, ${tier.description}`)}>${price}</button>`)
  .join("");

const usedBadgeKeys = [...new Set(PLACES.flatMap((p) => p.badges || []))].filter((key) => BADGES[key]);
if (usedBadgeKeys.length) {
  tagsGroupEl.hidden = false;
  tagsEl.innerHTML = usedBadgeKeys
    .map((key) => {
      const b = BADGES[key];
      return `<button type="button" class="filter-pill has-tooltip" data-tag="${escapeForAttr(key)}" ${tooltipAttrs(b.description)}>${b.emoji} ${b.label}</button>`;
    })
    .join("");
}

/* ---------- Apply ---------- */

function applyFilters() {
  const min = parseFloat(slider.value);
  sliderValue.textContent = min <= 0 ? "Showing all (0+ / 10)" : `Showing ${min.toFixed(1)}+ / 10`;

  PLACES.forEach((place) => {
    const marker = markers[place.id];
    if (!marker) return;
    const shouldShow =
      place.rating >= min &&
      (!cityEl.value || place.city === cityEl.value) &&
      (!cuisineEl.value || place.cuisine === cuisineEl.value) &&
      (!activePrices.size || activePrices.has(place.price)) &&
      (!activeTags.size || (place.badges || []).some((b) => activeTags.has(b))) &&
      (!savedOnly || isFavorite(place.id));
    const isShown = map.hasLayer(marker);
    if (shouldShow && !isShown) marker.addTo(map);
    if (!shouldShow && isShown) map.removeLayer(marker);
  });
}

slider.addEventListener("input", applyFilters);
cityEl.addEventListener("change", applyFilters);
cuisineEl.addEventListener("change", applyFilters);

priceEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-price]");
  if (!btn) return;
  const price = btn.dataset.price;
  activePrices.has(price) ? activePrices.delete(price) : activePrices.add(price);
  btn.classList.toggle("active");
  applyFilters();
});

tagsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-tag]");
  if (!btn) return;
  const tag = btn.dataset.tag;
  activeTags.has(tag) ? activeTags.delete(tag) : activeTags.add(tag);
  btn.classList.toggle("active");
  applyFilters();
});

savedBtn.addEventListener("click", () => {
  savedOnly = !savedOnly;
  savedBtn.classList.toggle("active", savedOnly);
  savedBtn.textContent = savedOnly ? "❤️ Saved Only" : "🤍 Saved Only";
  applyFilters();
});

// A heart toggled anywhere (a card, this map's own popups, a review page)
// should update the map live if we're currently filtered to "Saved Only".
document.addEventListener("favorites:change", () => {
  if (savedOnly) applyFilters();
});

clearBtn.addEventListener("click", () => {
  slider.value = 0;
  cityEl.value = "";
  cuisineEl.value = "";
  activePrices.clear();
  activeTags.clear();
  savedOnly = false;
  priceEl.querySelectorAll(".filter-pill.active").forEach((b) => b.classList.remove("active"));
  tagsEl.querySelectorAll(".filter-pill.active").forEach((b) => b.classList.remove("active"));
  savedBtn.classList.remove("active");
  savedBtn.textContent = "🤍 Saved Only";
  applyFilters();
});

applyFilters();

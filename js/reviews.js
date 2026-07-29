/* Reviews page: full searchable, sortable, filterable list of every place. */

const cardsEl = document.getElementById("cards");
const searchEl = document.getElementById("search");
const sortEl = document.getElementById("sort");
const cityEl = document.getElementById("filter-city");
const cuisineEl = document.getElementById("filter-cuisine");
const priceGroupEl = document.getElementById("filter-price-group");
const priceEl = document.getElementById("filter-price");
const tagsGroupEl = document.getElementById("filter-tags-group");
const tagsEl = document.getElementById("filter-tags");
const clearBtn = document.getElementById("filters-clear");

const sorters = {
  "rating-desc": (a, b) => b.rating - a.rating,
  "rating-asc": (a, b) => a.rating - b.rating,
  name: (a, b) => a.name.localeCompare(b.name),
  city: (a, b) => a.city.localeCompare(b.city),
};

const activePrices = new Set();
const activeTags = new Set();

/* ---------- Build filter options from whatever's actually in PLACES ---------- */

const cities = [...new Set(PLACES.map((p) => p.city))].sort();
cityEl.innerHTML =
  `<option value="">All Cities</option>` +
  cities.map((c) => `<option value="${escapeForAttr(c)}">${c}</option>`).join("");

const cuisines = [...new Set(PLACES.map((p) => p.cuisine).filter(Boolean))].sort();
cuisineEl.innerHTML =
  `<option value="">All Cuisines</option>` +
  cuisines.map((c) => `<option value="${escapeForAttr(c)}">${c}</option>`).join("");

// Price tiers are a fixed, site-wide vocabulary (PRICE_GUIDE) — show all four
// regardless of whether every tier is in use yet.
priceEl.innerHTML = Object.entries(PRICE_GUIDE)
  .map(([price, tier]) => `<button type="button" class="filter-pill has-tooltip" data-price="${escapeForAttr(price)}" ${tooltipAttrs(`${tier.range} — ${tier.description}`)}>${price}</button>`)
  .join("");

// Tags are the site's badge vocabulary — only show the ones actually used by
// at least one place, so every visible filter option can return results.
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

priceEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-price]");
  if (!btn) return;
  const price = btn.dataset.price;
  activePrices.has(price) ? activePrices.delete(price) : activePrices.add(price);
  btn.classList.toggle("active");
  renderCards();
});

tagsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-tag]");
  if (!btn) return;
  const tag = btn.dataset.tag;
  activeTags.has(tag) ? activeTags.delete(tag) : activeTags.add(tag);
  btn.classList.toggle("active");
  renderCards();
});

/* ---------- Render ---------- */

function renderCards() {
  const q = searchEl.value.trim().toLowerCase();
  let list = PLACES.filter((p) =>
    [p.name, p.city, p.ate, ...(p.tags || [])].join(" ").toLowerCase().includes(q)
  );

  if (cityEl.value) list = list.filter((p) => p.city === cityEl.value);
  if (cuisineEl.value) list = list.filter((p) => p.cuisine === cuisineEl.value);
  if (activePrices.size) list = list.filter((p) => activePrices.has(p.price));
  if (activeTags.size) list = list.filter((p) => (p.badges || []).some((b) => activeTags.has(b)));

  list = sortEl.value === "recent" ? sortByRecent(list) : list.sort(sorters[sortEl.value]);

  if (!list.length) {
    cardsEl.innerHTML = `<div class="no-results">No spots match those filters — try clearing one. 👀</div>`;
    return;
  }

  cardsEl.innerHTML = list.map((p) => placeCardHtml(p, { showMapJump: false })).join("");
}

searchEl.addEventListener("input", renderCards);
sortEl.addEventListener("change", renderCards);
cityEl.addEventListener("change", renderCards);
cuisineEl.addEventListener("change", renderCards);

clearBtn.addEventListener("click", () => {
  searchEl.value = "";
  cityEl.value = "";
  cuisineEl.value = "";
  activePrices.clear();
  activeTags.clear();
  priceEl.querySelectorAll(".filter-pill.active").forEach((b) => b.classList.remove("active"));
  tagsEl.querySelectorAll(".filter-pill.active").forEach((b) => b.classList.remove("active"));
  renderCards();
});

renderCards();

// Structured data for the full review list — helps Google understand every
// reviewed restaurant this page links to (see js/common.js for shared helpers).
const itemListLd = document.createElement("script");
itemListLd.type = "application/ld+json";
itemListLd.textContent = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: PLACES.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: p.name,
    url: `https://www.eatwithsamk.com/reviews/${p.id}.html`,
  })),
});
document.head.appendChild(itemListLd);

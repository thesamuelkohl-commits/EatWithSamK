/* Reviews page: full searchable, sortable list of every place. */

const cardsEl = document.getElementById("cards");
const searchEl = document.getElementById("search");
const sortEl = document.getElementById("sort");

const sorters = {
  "rating-desc": (a, b) => b.rating - a.rating,
  "rating-asc": (a, b) => a.rating - b.rating,
  name: (a, b) => a.name.localeCompare(b.name),
  city: (a, b) => a.city.localeCompare(b.city),
};

function renderCards() {
  const q = searchEl.value.trim().toLowerCase();
  let list = PLACES.filter((p) =>
    [p.name, p.city, p.ate, ...(p.tags || [])].join(" ").toLowerCase().includes(q)
  );

  list = sortEl.value === "recent" ? sortByRecent(list) : list.sort(sorters[sortEl.value]);

  if (!list.length) {
    cardsEl.innerHTML = `<div class="no-results">No spots match that search — yet. 👀</div>`;
    return;
  }

  cardsEl.innerHTML = list.map((p) => placeCardHtml(p, { showMapJump: false })).join("");
}

searchEl.addEventListener("input", renderCards);
sortEl.addEventListener("change", renderCards);

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

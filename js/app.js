/* Home page: map (all places) + Recent Reviews (latest few). Full,
   searchable list lives on reviews.html (js/reviews.js). */

const RECENT_COUNT = 6;
const RECENT_POST_COUNT = 3;

/* ---------- Stats (based on every place, not just recent) ---------- */
const cities = new Set(PLACES.map((p) => p.city));
const avg = PLACES.reduce((s, p) => s + p.rating, 0) / (PLACES.length || 1);
animateCountUp(document.getElementById("stat-places"), PLACES.length, 0);
animateCountUp(document.getElementById("stat-cities"), cities.size, 0);
animateCountUp(document.getElementById("stat-avg"), avg, 1);

/* ---------- Map ---------- */
const { map, markers, stopAutoFit } = initPlacesMap("map", PLACES);

/* ---------- Recent Reviews ---------- */
const cardsEl = document.getElementById("cards");
const recent = sortByRecent(PLACES).slice(0, RECENT_COUNT);

cardsEl.innerHTML = recent.length
  ? recent.map((p) => placeCardHtml(p, { showMapJump: true })).join("")
  : `<div class="no-results">No reviews yet, check back soon. 👀</div>`;

cardsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-map-jump]");
  if (!btn) return;
  const place = PLACES.find((p) => p.id === btn.dataset.mapJump);
  stopAutoFit();
  document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
  map.flyTo([place.lat, place.lng], 15, { duration: 1.2 });
  setTimeout(() => markers[place.id].openPopup(), 1300);
});

/* ---------- Best Of Guides on homepage ---------- */
const homeBlogEl = document.getElementById("home-blog");
if (homeBlogEl && typeof BLOG_POSTS !== "undefined") {
  const recentPosts = [...BLOG_POSTS]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, RECENT_POST_COUNT);
  homeBlogEl.innerHTML = recentPosts.length
    ? recentPosts.map(blogCardHtml).join("")
    : `<div class="no-results">No posts yet, check back soon. 👀</div>`;
}

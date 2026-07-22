/* Home page: map (all places) + Recent Reviews (latest few). Full,
   searchable list lives on reviews.html (js/reviews.js). */

const RECENT_COUNT = 6;

/* ---------- Stats (based on every place, not just recent) ---------- */
const cities = new Set(PLACES.map((p) => p.city));
const avg = PLACES.reduce((s, p) => s + p.rating, 0) / (PLACES.length || 1);
document.getElementById("stat-places").textContent = PLACES.length;
document.getElementById("stat-cities").textContent = cities.size;
document.getElementById("stat-avg").textContent = avg.toFixed(1);

/* ---------- Map ---------- */
// Start with a sane default view immediately — fitAllPlaces() refines it
// once the container has a real size.
const map = L.map("map", { scrollWheelZoom: false }).setView([39.8, -98.5], 4);

L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  maxZoom: 19,
}).addTo(map);

const markers = {};

PLACES.forEach((place) => {
  const icon = L.divIcon({
    className: "",
    html: `<div class="rating-marker ${ratingClass(place.rating)}"><span>${place.rating}</span></div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44],
  });

  const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
  marker.bindPopup(`
    <div class="popup-title">${place.name}</div>
    <div class="popup-city">📍 ${place.city}</div>
    <div class="popup-rating">★ ${place.rating}/10</div>
    <a class="popup-link" href="${place.video}" target="_blank" rel="noopener">▶ Watch my review</a><br>
    <a class="popup-link" href="reviews/${place.id}.html">📖 Full review</a>
  `);
  markers[place.id] = marker;
});

function fitAllPlaces() {
  map.invalidateSize();
  const size = map.getSize();
  if (!size.x || !size.y) return; // container hidden — wait for a real size
  if (PLACES.length) {
    map.fitBounds(
      L.latLngBounds(PLACES.map((p) => [p.lat, p.lng])),
      { padding: [50, 50], maxZoom: 14 }
    );
  } else {
    map.setView([39.8, -98.5], 4);
  }
}

// Keep the map fitted to all places while the page layout settles —
// fitting before the container has its final size zooms to a meaningless
// spot. Stops as soon as the user touches the map.
fitAllPlaces();
const mapEl = document.getElementById("map");
const autoFit = new ResizeObserver(fitAllPlaces);
autoFit.observe(mapEl);
const stopAutoFit = () => autoFit.disconnect();
mapEl.addEventListener("pointerdown", stopAutoFit, { once: true });
mapEl.addEventListener("wheel", stopAutoFit, { once: true });

/* ---------- Recent Reviews ---------- */
const cardsEl = document.getElementById("cards");
const recent = sortByRecent(PLACES).slice(0, RECENT_COUNT);

cardsEl.innerHTML = recent.length
  ? recent.map((p) => placeCardHtml(p, { showMapJump: true })).join("")
  : `<div class="no-results">No reviews yet — check back soon. 👀</div>`;

cardsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-map-jump]");
  if (!btn) return;
  const place = PLACES.find((p) => p.id === btn.dataset.mapJump);
  stopAutoFit();
  document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
  map.flyTo([place.lat, place.lng], 15, { duration: 1.2 });
  setTimeout(() => markers[place.id].openPopup(), 1300);
});

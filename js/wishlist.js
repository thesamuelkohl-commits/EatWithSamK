/* Private "want to try" list — not linked from the public nav, bookmark
   this page directly. Gated behind Supabase sign-in (js/auth.js) AND
   restricted to OWNER_EMAIL plus any emails in VIEWER_EMAILS; every row is
   also scoped by RLS (see supabase/wishlist.sql — the SELECT-for-viewers
   policy has to be added there too, in the Supabase SQL Editor, since this
   file's checks are UX only and can't grant real database access on their
   own). Only the owner gets the mark-tried/remove controls — viewers get a
   read-only version of the same list (see isOwner in itemHtml()/renderAuthed()).

   Every entry is added by Claude: Sam names a place in chat, Claude
   researches the address/phone/website/coordinates, finds a cover photo
   from the restaurant's own official site (never Instagram — no reliable,
   stable way to hotlink an IG photo without a paid Meta developer token),
   downloads it to images/wishlist/<slug>/cover.jpg, and writes the row
   directly via the Supabase service role key (see .env.local — never
   referenced from this file or any other public site file). This page is
   a pure viewer: filter, browse, mark tried, remove — no add form. */

const gate = document.getElementById("wishlist-gate");
const OWNER_EMAIL = "thesamuelkohl@gmail.com";
const VIEWER_EMAILS = ["melanie.davis044@gmail.com"];
const ALLOWED_EMAILS = [OWNER_EMAIL, ...VIEWER_EMAILS];

let allItems = [];
let cityFilter = "";
let cuisineFilter = "";
let searchQuery = "";
let userLoc = null;
let geoAttempted = false;
let wishlistMap = null;
let wishlistMarkers = {};

function escHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function distanceMiles(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function signInPromptHtml() {
  if (!AUTH_CONFIGURED) {
    return `<div class="quick-facts-card"><p class="review-about">Sign-in isn't set up yet on this site — see js/supabase-config.js.</p></div>`;
  }
  return `<div class="quick-facts-card"><p class="review-about">Sign in (top right) to see and add to your want-to-try list — it's private to your account.</p></div>`;
}

function notOwnerHtml() {
  return `<div class="quick-facts-card"><p class="review-about">This page is private to Sam's account and a few invited viewers. Signed in as ${escHtml(currentUser.email)}, which isn't on that list.</p></div>`;
}

function itemHtml(item) {
  const cover = item.slug ? `images/wishlist/${item.slug}/cover.jpg` : null;
  const dist =
    userLoc && item.lat != null && item.lng != null
      ? `${distanceMiles(userLoc.lat, userLoc.lng, item.lat, item.lng).toFixed(1)} mi away`
      : "";
  const hasContact = item.address || item.phone || item.website;
  // Viewers (anyone in VIEWER_EMAILS, not the owner) get a read-only card —
  // no mark-tried/remove controls, since RLS only grants them SELECT anyway.
  const isOwner = currentUser && currentUser.email === OWNER_EMAIL;
  return `
    <article class="place-card reveal wishlist-item" data-id="${item.id}" data-tried="${item.tried}" style="${item.tried ? "opacity:0.6;" : ""}">
      ${cover ? `<div class="card-photo" style="background-image: url('${cover}')"></div>` : ""}
      <div class="card-body">
        <div class="card-top">
          <div>
            <h3>${item.tried ? "✅ " : ""}${escHtml(item.name)}</h3>
            ${item.city || dist ? `<div class="card-city">${item.city ? `📍 ${escHtml(item.city)}` : ""}${item.city && dist ? " · " : dist ? "📍 " : ""}${dist}</div>` : ""}
            ${item.cuisine ? `<div class="card-tags"><span class="tag">${escHtml(item.cuisine)}</span></div>` : ""}
          </div>
          ${
            isOwner
              ? `<div class="card-top-actions">
            <button type="button" class="favorite-btn has-tooltip" data-toggle-tried data-tooltip="${item.tried ? "Mark as not tried yet" : "Mark as tried"}" aria-label="${item.tried ? "Mark as not tried yet" : "Mark as tried"}" tabindex="0">${item.tried ? "↩️" : "✅"}</button>
          </div>`
              : ""
          }
        </div>
        ${
          hasContact
            ? `<div class="card-contact">
          ${item.address ? `<span>🏠 ${escHtml(item.address)}</span>` : ""}
          ${item.phone ? `<span>📞 <a href="tel:${escHtml(item.phone.replace(/[^+\d]/g, ""))}">${escHtml(item.phone)}</a></span>` : ""}
          ${item.website ? `<span>🌐 <a href="${escHtml(item.website)}" target="_blank" rel="noopener">${escHtml(item.website.replace(/^https?:\/\/(www\.)?/, ""))}</a></span>` : ""}
        </div>`
            : ""
        }
        ${item.notes ? `<p class="card-ate">${escHtml(item.notes)}</p>` : ""}
        ${
          isOwner
            ? `<div class="card-actions"><button type="button" class="btn btn-ghost" data-delete>Remove</button></div>`
            : ""
        }
      </div>
    </article>`;
}

function populateCityFilter() {
  const sel = document.getElementById("wishlist-city-filter");
  if (!sel) return;
  const cities = [...new Set(allItems.map((i) => i.city).filter(Boolean))].sort();
  const current = sel.value;
  sel.innerHTML = `<option value="">All Cities</option>` + cities.map((c) => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join("");
  sel.value = cities.includes(current) ? current : "";
}

function populateCuisineFilter() {
  const sel = document.getElementById("wishlist-cuisine-filter");
  if (!sel) return;
  const cuisines = [...new Set(allItems.map((i) => i.cuisine).filter(Boolean))].sort();
  const current = sel.value;
  sel.innerHTML = `<option value="">All Types</option>` + cuisines.map((c) => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join("");
  sel.value = cuisines.includes(current) ? current : "";
}

function filteredItems() {
  const q = searchQuery.trim().toLowerCase();
  return allItems.filter(
    (i) =>
      (!cityFilter || i.city === cityFilter) &&
      (!cuisineFilter || i.cuisine === cuisineFilter) &&
      (!q || [i.name, i.city, i.cuisine, i.address, i.notes].filter(Boolean).join(" ").toLowerCase().includes(q))
  );
}

function renderCards() {
  const listEl = document.getElementById("wishlist-list");
  if (!listEl) return;
  let items = filteredItems();

  const countEl = document.getElementById("wishlist-count");
  if (countEl) {
    countEl.textContent =
      items.length === allItems.length
        ? `${allItems.length} place${allItems.length === 1 ? "" : "s"}`
        : `${items.length} of ${allItems.length} places`;
  }

  if (userLoc) {
    items = [...items].sort((a, b) => {
      const da = a.lat != null ? distanceMiles(userLoc.lat, userLoc.lng, a.lat, a.lng) : Infinity;
      const db = b.lat != null ? distanceMiles(userLoc.lat, userLoc.lng, b.lat, b.lng) : Infinity;
      return da - db;
    });
  }

  listEl.innerHTML = items.length
    ? items.map(itemHtml).join("")
    : `<p class="review-about">${allItems.length ? "No places match that city." : "Nothing on your list yet — tell Claude about a place in chat and it'll show up here."}</p>`;
}

function renderMap() {
  const mapEl = document.getElementById("wishlist-map");
  if (!mapEl || typeof L === "undefined") return;

  if (!wishlistMap) {
    wishlistMap = L.map("wishlist-map", { scrollWheelZoom: false }).setView([39.8, -98.5], 4);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(wishlistMap);
  }

  Object.values(wishlistMarkers).forEach((m) => wishlistMap.removeLayer(m));
  wishlistMarkers = {};

  const withCoords = filteredItems().filter((i) => i.lat != null && i.lng != null);
  withCoords.forEach((item) => {
    const marker = L.marker([item.lat, item.lng], {
      icon: L.divIcon({ className: "", html: `<div class="wishlist-marker">🍽️</div>`, iconSize: [36, 36], iconAnchor: [18, 36] }),
    }).addTo(wishlistMap);
    const photo = item.slug ? `images/wishlist/${item.slug}/cover.jpg` : null;
    marker.bindPopup(`
      ${photo ? `<div class="popup-photo" style="background-image: url('${photo}')"></div>` : ""}
      <div class="popup-top"><div class="popup-title">${escHtml(item.name)}</div></div>
      ${item.address ? `<div class="popup-city">📍 ${escHtml(item.address)}</div>` : ""}
      ${item.website ? `<a class="popup-link" href="${escHtml(item.website)}" target="_blank" rel="noopener">🌐 Visit their website</a>` : ""}
    `);
    wishlistMarkers[item.id] = marker;
  });

  wishlistMap.invalidateSize();
  if (withCoords.length) {
    wishlistMap.fitBounds(L.latLngBounds(withCoords.map((i) => [i.lat, i.lng])), { padding: [40, 40], maxZoom: 14 });
  } else {
    wishlistMap.setView([39.8, -98.5], 4);
  }
}

function tryGeolocate() {
  if (geoAttempted || !navigator.geolocation) return;
  geoAttempted = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (wishlistMap) {
        wishlistMap.setView([userLoc.lat, userLoc.lng], 11);
        L.marker([userLoc.lat, userLoc.lng], {
          icon: L.divIcon({
            className: "",
            html: '<div class="you-are-here"><div class="you-are-here-pulse"></div></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
          zIndexOffset: 1000,
        })
          .addTo(wishlistMap)
          .bindPopup("📍 You are here");
      }
      renderCards();
    },
    () => {},
    { timeout: 8000, maximumAge: 5 * 60 * 1000 }
  );
}

async function loadList() {
  const listEl = document.getElementById("wishlist-list");
  if (!listEl) return;
  const { data, error } = await supabaseClient.from("wishlist").select("*").order("created_at", { ascending: false });
  if (error) {
    listEl.innerHTML = `<p class="review-about">Couldn't load your list: ${escHtml(error.message)}</p>`;
    return;
  }
  allItems = data;
  populateCityFilter();
  populateCuisineFilter();
  renderMap();
  renderCards();
  tryGeolocate();
}

function renderAuthed() {
  wishlistMap = null;
  wishlistMarkers = {};
  gate.innerHTML = `
    <div class="toolbar">
      <h2 id="wishlist-count"></h2>
      <input type="search" class="search-input" id="wishlist-search" placeholder="Search by name, city, or food…" />
    </div>
    <div class="filters-panel">
      <div class="filter-group">
        <span class="filter-group-label">City</span>
        <select class="filter-select" id="wishlist-city-filter"><option value="">All Cities</option></select>
        <span class="filter-group-label">Type of Food</span>
        <select class="filter-select" id="wishlist-cuisine-filter"><option value="">All Types</option></select>
      </div>
    </div>
    <div id="wishlist-map" style="height: 320px; border-radius: var(--radius); margin-bottom: 22px; overflow: hidden;"></div>
    <div id="wishlist-list" class="cards-grid"><p class="review-about">Loading…</p></div>`;
  loadList();
}

function applyAuthState() {
  if (!currentUser) {
    gate.innerHTML = signInPromptHtml();
  } else if (!ALLOWED_EMAILS.includes(currentUser.email)) {
    gate.innerHTML = notOwnerHtml();
  } else {
    renderAuthed();
  }
}

document.addEventListener("auth:change", applyAuthState);
// Covers the case where auth.js already resolved getSession() before this
// script's listener above was registered — see authReady in js/auth.js.
if (typeof authReady !== "undefined" && authReady) applyAuthState();

document.addEventListener("input", (e) => {
  if (e.target.id === "wishlist-search") {
    searchQuery = e.target.value;
    renderCards();
    renderMap();
  }
});

document.addEventListener("change", (e) => {
  if (e.target.id === "wishlist-city-filter") {
    cityFilter = e.target.value;
    renderCards();
    renderMap();
  } else if (e.target.id === "wishlist-cuisine-filter") {
    cuisineFilter = e.target.value;
    renderCards();
    renderMap();
  }
});

document.addEventListener("click", async (e) => {
  const toggleBtn = e.target.closest("[data-toggle-tried]");
  if (toggleBtn) {
    const card = toggleBtn.closest("[data-id]");
    const wasTried = card.dataset.tried === "true";
    await supabaseClient.from("wishlist").update({ tried: !wasTried }).eq("id", card.dataset.id);
    loadList();
    return;
  }

  const delBtn = e.target.closest("[data-delete]");
  if (delBtn) {
    const card = delBtn.closest("[data-id]");
    if (!confirm(`Remove this from your list?`)) return;
    await supabaseClient.from("wishlist").delete().eq("id", card.dataset.id);
    loadList();
  }
});

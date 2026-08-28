/* Shared across all pages: renders social buttons + footer year. */

const SOCIAL_ICONS = {
  instagram:
    '<svg viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.13a5.88 5.88 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38 5.88 5.88 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zm0 10.15A4 4 0 1 1 16 12a4 4 0 0 1-4 3.99zm7.85-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44z"/></svg>',
  tiktok:
    '<svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.9 2.9 0 0 1-5.2 1.74 2.9 2.9 0 0 1 2.31-4.64c.3 0 .58.05.85.13V9.4a6.33 6.33 0 0 0-.85-.06 6.34 6.34 0 1 0 6.34 6.33V9.41a8.16 8.16 0 0 0 4.77 1.52v-3.45a4.85 4.85 0 0 1-1-.79z"/></svg>',
  youtube:
    '<svg viewBox="0 0 24 24"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>',
};

const SOCIAL_LABELS = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube Shorts",
};

/* ---------- Saved places (favorites) ----------
   Visitor-side "want to try" list — no accounts/backend on this site, so
   it lives in the browser's localStorage, per device. Any page can drop
   in favoriteButtonHtml(id) and clicks just work: the click handler below
   is delegated on <body> once, here, so nothing per-page needs to wire it
   up. Fires a "favorites:change" event on document for any page (like the
   Reviews page's "Saved Only" filter) that wants to react live. */

const FAVORITES_KEY = "eatwithsamk:favorites";

function getFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  const current = getFavorites();
  const active = current.includes(id);
  const next = active ? current.filter((f) => f !== id) : [...current, id];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch {
    // Private browsing / storage disabled — the click still updates the
    // button on screen, it just won't persist across a reload.
  }
  // js/auth.js defines this when a visitor is signed in, to mirror the
  // change to their account. Undefined (not an error) if auth.js isn't
  // loaded, or if they're just a guest — favorites still work either way.
  if (typeof onFavoriteToggled === "function") onFavoriteToggled(id, !active);
  return !active;
}

function favoriteButtonHtml(place, extraClass) {
  const active = isFavorite(place.id);
  return `<button type="button" class="favorite-btn${extraClass ? ` ${extraClass}` : ""}${active ? " active" : ""}" data-favorite-toggle="${place.id}" aria-pressed="${active}" aria-label="${active ? "Remove" : "Save"} ${place.name} ${active ? "from" : "to"} your saved places">${active ? "❤️" : "🤍"}</button>`;
}

// The static reviews/<id>.html pages are generated at build time, with no
// visitor to check localStorage for — their favorite button always starts
// unsaved. This corrects it client-side, on load, to the real state.
function hydrateFavoriteButtons(root) {
  (root || document).querySelectorAll("[data-favorite-toggle]").forEach((el) => {
    const active = isFavorite(el.dataset.favoriteToggle);
    el.classList.toggle("active", active);
    el.setAttribute("aria-pressed", String(active));
    el.textContent = active ? "❤️" : "🤍";
  });
}

document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-favorite-toggle]");
  if (!btn) return;
  const id = btn.dataset.favoriteToggle;
  const active = toggleFavorite(id);
  document.querySelectorAll(`[data-favorite-toggle="${id}"]`).forEach((el) => {
    el.classList.toggle("active", active);
    el.setAttribute("aria-pressed", String(active));
    el.textContent = active ? "❤️" : "🤍";
    el.classList.remove("favorite-pop");
    void el.offsetWidth; // restart the pop animation even on rapid re-clicks
    el.classList.add("favorite-pop");
  });
  document.dispatchEvent(new CustomEvent("favorites:change", { detail: { id, active } }));
});

/* ---------- Shared nav + footer ----------
   Every page has an empty `<nav data-nav="home">` and
   `<footer data-footer>` — common.js fills both in, so adding a new
   page (like "About") only means editing NAV_LINKS once here instead
   of five separate HTML files. NAV_LINKS and FOOTER_RESOURCES hrefs
   are root-relative (a leading "/") since every page's real URL is
   clean now (see vercel.json's "cleanUrls") — that resolves correctly
   no matter how deep the current page sits, so nav/footer page-links
   ignore `data-prefix` entirely. `data-prefix` still matters for the
   footer's own logo image src below, which is a real asset path, not
   a page URL — `data-prefix="../"` on pages one directory deep
   (reviews/<id>.html), `data-prefix="/"` (root-relative) on
   guides/<id>/index.html — see generate-reviews.js's renderGuidePage(). */

const NAV_LINKS = [
  { id: "home", label: "Home", href: "/" },
  { id: "map", label: "Map", href: "/map" },
  { id: "reviews", label: "Reviews", href: "/reviews" },
  { id: "blog", label: "Best Of", href: "/best-of" },
  { id: "about", label: "About", href: "/about" },
  { id: "advertise", label: "Advertise", href: "/advertise" },
];

// Footer "Resources" column — add a line here any time you want another
// resource-style post (guides, comparisons, etc.) linked site-wide from
// every page's footer. `href` is root-relative, same as NAV_LINKS above.
const FOOTER_RESOURCES = [
  { label: "Best Credit Cards for Dining", href: "/guides/best-credit-cards-for-dining/" },
  { label: "Advertise & Sponsorships", href: "/advertise" },
];

document.querySelectorAll("[data-nav]").forEach((nav) => {
  const current = nav.dataset.nav;
  nav.innerHTML = NAV_LINKS.map(
    (link) => `<a href="${link.href}"${link.id === current ? ' class="active"' : ""}>${link.label}</a>`
  ).join("");
});

function referralWidgetHtml() {
  return `
    <div class="referral-widget">
      <h3 class="referral-title">🎁 Deals I Actually Use</h3>
      <p class="referral-blurb">A few things I personally use to eat out and get around, here's how you can save (or earn) too.</p>
      <div class="referral-cards">
        <a class="referral-card" href="https://americanexpress.com/en-us/referral/gold-card?ref=SAMUEKhIMj&XL=MIZNS" target="_blank" rel="sponsored noopener">
          <span class="referral-card-name">Amex Gold Card</span>
          <span class="referral-card-desc">Great everyday points on food &amp; travel</span>
          <span class="referral-card-cta">Learn More →</span>
        </a>
        <a class="referral-card" href="https://americanexpress.com/en-us/referral/platinum-card?ref=SAMUEKQPAv&XL=MIZNS" target="_blank" rel="sponsored noopener">
          <span class="referral-card-name">Amex Platinum Card</span>
          <span class="referral-card-desc">Even better points on travel</span>
          <span class="referral-card-cta">Learn More →</span>
        </a>
        <a class="referral-card" href="https://referrals.uber.com/refer?id=r68141rgpszh" target="_blank" rel="sponsored noopener">
          <span class="referral-card-name">Uber</span>
          <span class="referral-card-desc">Sign up for an easy ride to your next meal</span>
          <span class="referral-card-cta">Learn More →</span>
        </a>
        <a class="referral-card" href="https://ubereats.com/feed?promoCode=eats-samuelk6169ue" target="_blank" rel="sponsored noopener">
          <span class="referral-card-name">Uber Eats</span>
          <span class="referral-card-desc">Get your next meal delivered</span>
          <span class="referral-card-cta">Learn More →</span>
        </a>
      </div>
      <p class="referral-disclosure">These are referral links, if you sign up, I may earn rewards too. Thanks for supporting the site!</p>
    </div>`;
}

function footerHtml(prefix) {
  prefix = prefix || "";
  return `
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="logo" href="/"><img class="logo-img" src="${prefix}images/logo.png?v=2" alt="Eat With Sam K logo" /> Eat With Sam K</a>
          <p class="footer-tagline" data-tagline></p>
          <div class="social-row" data-socials></div>
        </div>
        <div class="footer-col">
          <h4>Explore</h4>
          <a href="/">Home</a>
          <a href="/map">Map</a>
          <a href="/reviews">All Reviews</a>
          <a href="/best-of">Best Of</a>
          <a href="/about">About Me</a>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          ${FOOTER_RESOURCES.map((r) => `<a href="${r.href}">${r.label}</a>`).join("")}
        </div>
        <div class="footer-col">
          <h4>Stay Updated</h4>
          <p>Get new reviews and city guides sent to your inbox, no spam, just good food.</p>
          <form class="newsletter-form" data-newsletter>
            <input type="email" placeholder="Your email" required aria-label="Email address" />
            <button type="submit" class="btn btn-primary">Subscribe</button>
          </form>
          <p class="newsletter-note" hidden></p>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="footer-note">© <span id="year"></span> Eat With Sam K · All reviews are my own, I pay for every meal.</p>
        <div class="footer-legal"><a href="/privacy">Privacy Policy</a></div>
      </div>
    </div>`;
}

document.querySelectorAll("[data-footer]").forEach((el) => {
  el.innerHTML = footerHtml(el.dataset.prefix || "");
});

// Runs after nav/footer are injected above, so it also catches the
// [data-socials] / [data-tagline] elements that just appeared inside the footer.
document.querySelectorAll("[data-socials]").forEach((row) => {
  row.innerHTML = Object.entries(SITE.socials)
    .map(
      ([key, url]) =>
        `<a class="social-btn" href="${url}" target="_blank" rel="noopener" aria-label="${SOCIAL_LABELS[key]}" title="${SOCIAL_LABELS[key]}">${SOCIAL_ICONS[key]}</a>`
    )
    .join("");
});

document.querySelectorAll("[data-tagline]").forEach((el) => (el.textContent = SITE.tagline));

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Newsletter form isn't wired to a real email service yet — this just gives
// honest, immediate feedback instead of silently discarding what someone types.
document.querySelectorAll("[data-newsletter]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const note = form.parentElement.querySelector(".newsletter-note");
    if (note) {
      note.textContent = "Newsletter signup is launching soon, follow on Instagram to stay in the loop for now!";
      note.hidden = false;
    }
    form.reset();
  });
});

/* ---------- Shared place helpers (used by app.js and reviews.js) ---------- */

function ratingClass(rating) {
  if (rating >= 8) return "great";
  if (rating >= 6) return "good";
  return "poor";
}

// Newest first: places with a `date` sort by it; undated places keep their
// array position (new places are always added at the top of PLACES).
function sortByRecent(places) {
  return places
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      if (a.p.date && b.p.date) return b.p.date.localeCompare(a.p.date);
      if (a.p.date) return -1;
      if (b.p.date) return 1;
      return a.i - b.i;
    })
    .map((x) => x.p);
}

function escapeForAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// A styled hover tooltip (not the native browser `title` box) — used for
// both badge pills and price tags. `aria-label` keeps it accessible.
function tooltipAttrs(text) {
  const safe = escapeForAttr(text);
  return `data-tooltip="${safe}" aria-label="${safe}" tabindex="0"`;
}

function badgeRowHtml(p) {
  if (!p.badges || !p.badges.length) return "";
  const pills = p.badges
    .map((key) => BADGES[key])
    .filter(Boolean)
    .map((b) => `<span class="badge-pill has-tooltip" ${tooltipAttrs(b.description)}>${b.emoji} ${b.label}</span>`)
    .join("");
  return pills ? `<div class="badge-row">${pills}</div>` : "";
}

function priceTagHtml(price) {
  const tier = typeof PRICE_GUIDE !== "undefined" ? PRICE_GUIDE[price] : null;
  if (!tier) return escapeForAttr(price);
  return `<span class="price-tag has-tooltip" ${tooltipAttrs(`${tier.range}, ${tier.description}`)}>${price}</span>`;
}

function placeCardHtml(p, opts) {
  opts = opts || {};
  const ratingBadge = `<div class="rating-badge ${ratingClass(p.rating)}">${p.rating}<small>/ 10</small></div>`;
  const metaBits = [p.cuisine, p.price ? priceTagHtml(p.price) : ""].filter(Boolean);
  return `
    <article class="place-card reveal" id="card-${p.id}">
      ${
        p.heroPhoto
          ? `<a class="card-photo" href="/reviews/${p.id}" style="background-image: url('${p.heroPhoto}')" aria-hidden="true" tabindex="-1">${ratingBadge}</a>`
          : ""
      }
      <div class="card-body">
        <div class="card-top">
          <div>
            <h3><a href="/reviews/${p.id}">${p.name}</a></h3>
            <div class="card-city">📍 ${p.city}${opts.distanceLabel ? ` · ${opts.distanceLabel}` : ""}</div>
          </div>
          <div class="card-top-actions">
            ${favoriteButtonHtml(p)}
            ${p.heroPhoto ? "" : ratingBadge}
          </div>
        </div>
        ${metaBits.length ? `<p class="card-meta">${metaBits.join(" • ")}</p>` : ""}
        ${badgeRowHtml(p)}
        ${p.tags && p.tags.length ? `<div class="card-tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
        <p class="card-ate"><strong>What I ate:</strong> ${p.ate}</p>
        ${p.quickTake ? `<p class="card-quicktake">💬 <strong>Sam Says:</strong> “${p.quickTake}”</p>` : ""}
        <div class="card-contact">
          <span>🏠 ${p.address}</span>
          ${p.phone ? `<span>📞 <a href="tel:${p.phone.replace(/[^+\d]/g, "")}">${p.phone}</a></span>` : ""}
          ${p.website ? `<span>🌐 <a href="${p.website}" target="_blank" rel="noopener">${p.website.replace(/^https?:\/\/(www\.)?/, "")}</a></span>` : ""}
        </div>
        <div class="card-actions">
          <a class="btn btn-primary" href="${p.video}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Watch Review
          </a>
          ${opts.showMapJump ? `<button class="btn btn-ghost" data-map-jump="${p.id}">View on map</button>` : `<a class="btn btn-ghost" href="/reviews/${p.id}">Full Review</a>`}
        </div>
        <a class="read-more" href="/reviews/${p.id}">Read full review →</a>
      </div>
    </article>`;
}

/* ---------- Shared map (used by app.js on the homepage and js/map.js on
   the dedicated Map page) ---------- */

function initPlacesMap(containerId, places) {
  // Sane default view immediately — fitAllPlaces() refines it once the
  // container has a real size.
  const map = L.map(containerId, { scrollWheelZoom: false }).setView([39.8, -98.5], 4);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(map);

  const markers = {};

  places.forEach((place) => {
    const icon = L.divIcon({
      className: "",
      html: `<div class="rating-marker ${ratingClass(place.rating)}"><span>${place.rating}</span></div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });

    const marker = L.marker([place.lat, place.lng], { icon }).addTo(map);
    marker.bindPopup(`
      ${
        place.heroPhoto
          ? `<div class="popup-photo" style="background-image: url('${place.heroPhoto}')"><div class="rating-badge ${ratingClass(place.rating)}">${place.rating}<small>/10</small></div></div>`
          : ""
      }
      <div class="popup-top">
        <div class="popup-title">${place.name}</div>
        ${favoriteButtonHtml(place)}
      </div>
      <div class="popup-city">📍 ${place.city}</div>
      ${place.heroPhoto ? "" : `<div class="popup-rating">★ ${place.rating}/10</div>`}
      <a class="popup-link" href="${place.video}" target="_blank" rel="noopener">▶ Watch my review</a><br>
      <a class="popup-link" href="/reviews/${place.id}">📖 Full review</a>
    `);
    markers[place.id] = marker;
  });

  function fitAllPlaces() {
    map.invalidateSize();
    const size = map.getSize();
    if (!size.x || !size.y) return; // container hidden — wait for a real size
    if (places.length) {
      map.fitBounds(
        L.latLngBounds(places.map((p) => [p.lat, p.lng])),
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
  const mapEl = document.getElementById(containerId);
  const autoFit = new ResizeObserver(fitAllPlaces);
  autoFit.observe(mapEl);
  const stopAutoFit = () => autoFit.disconnect();
  mapEl.addEventListener("pointerdown", stopAutoFit, { once: true });
  mapEl.addEventListener("wheel", stopAutoFit, { once: true });

  return { map, markers, fitAllPlaces, stopAutoFit };
}

/* ---------- Shared blog helpers (used by best-of.html and app.js) ---------- */

function formatPostDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// A guide only gets a photo cover once Sam has personally reviewed one of the
// places in it (via post.places) and that review has a heroPhoto — otherwise
// it keeps the plain emoji banner. Never sourced from Instagram or elsewhere.
function postCoverPhoto(post) {
  const withPhoto = (post.places || [])
    .map((id) => PLACES.find((p) => p.id === id))
    .find((p) => p && p.heroPhoto);
  return withPhoto ? withPhoto.heroPhoto : null;
}

function blogCardHtml(post) {
  const cover = postCoverPhoto(post);
  return `
    <a class="blog-card reveal" href="/guides/${post.id}/">
      ${cover ? `<div class="blog-card-banner blog-card-banner-photo" style="background-image: url('${cover}')"></div>` : `<div class="blog-card-banner">${post.emoji}</div>`}
      <div class="blog-card-body">
        <div class="blog-meta"><span class="pill">${post.city}</span><span>${formatPostDate(post.date)}</span></div>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <span class="read-more">Read more →</span>
      </div>
    </a>`;
}

/* ---------- Motion: scroll-reveal, count-up stats, header shadow ----------
   Applies site-wide since common.js loads on every page. Reveal targets are
   marked with class="reveal" in HTML (or added dynamically via innerHTML —
   a MutationObserver picks those up too, so render order never matters). */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

function observeReveal(el, index) {
  el.style.transitionDelay = `${Math.min((index || 0) * 60, 300)}ms`;
  revealObserver.observe(el);
}

document.querySelectorAll(".reveal").forEach((el, i) => observeReveal(el, i));

new MutationObserver((mutations) => {
  mutations.forEach((m) => {
    m.addedNodes.forEach((node) => {
      if (node.nodeType !== 1) return;
      if (node.matches && node.matches(".reveal")) observeReveal(node);
      if (node.querySelectorAll) node.querySelectorAll(".reveal").forEach((el) => observeReveal(el));
    });
  });
}).observe(document.body, { childList: true, subtree: true });

// Safety net: if something prevents the scroll trigger from ever firing (a
// throttled observer, an odd in-app-browser webview), don't leave content
// stuck invisible — reveal everything after a short grace period.
setTimeout(() => {
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => el.classList.add("is-visible"));
}, 2000);

// Animates a number counting up to `target` once its element scrolls into
// view. `decimals` controls precision (e.g. 1 for "7.4"). Uses setInterval
// rather than requestAnimationFrame so it keeps ticking even in contexts
// where rAF gets throttled (e.g. a backgrounded/inactive tab).
function animateCountUp(el, target, decimals) {
  let started = false;
  // index.html now has the real numbers baked in at build time (see
  // generate-reviews.js), not always "0" — animate from whatever's
  // already showing instead of resetting to 0, so a page that already
  // loaded with the right number doesn't flash back to 0 first.
  const initial = parseFloat(el.textContent) || 0;

  function runCountUp() {
    started = true;
    const duration = 1100;
    const stepMs = 16;
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = initial + (target - initial) * eased;
      el.textContent = decimals ? value.toFixed(decimals) : Math.round(value);
      if (progress >= 1) {
        el.textContent = decimals ? target.toFixed(decimals) : target;
        clearInterval(timer);
      }
    }, stepMs);
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || started) return;
        obs.unobserve(entry.target);
        runCountUp();
      });
    },
    { threshold: 0.5 }
  );
  obs.observe(el);

  // Same safety net as reveal — never leave a stat frozen at 0.
  setTimeout(() => {
    if (!started) {
      obs.disconnect();
      runCountUp();
    }
  }, 2000);
}

const siteHeaderEl = document.querySelector(".site-header");
if (siteHeaderEl) {
  window.addEventListener(
    "scroll",
    () => siteHeaderEl.classList.toggle("scrolled", window.scrollY > 8),
    { passive: true }
  );
}

// Keep hover tooltips (price tags, badges) from getting clipped off-screen
// near the edge of the viewport. Delegated so it also covers cards rendered
// dynamically after page load (e.g. placeCardHtml()).
function positionTooltip(el) {
  if (!el || !el.classList || !el.classList.contains("has-tooltip")) return;
  const rect = el.getBoundingClientRect();
  const tooltipWidth = Math.min(220, window.innerWidth - 24);
  const margin = 12;
  const centerX = rect.left + rect.width / 2;
  const halfWidth = tooltipWidth / 2;
  let shift = 0;
  if (centerX - halfWidth < margin) {
    shift = margin - (centerX - halfWidth);
  } else if (centerX + halfWidth > window.innerWidth - margin) {
    shift = window.innerWidth - margin - (centerX + halfWidth);
  }
  el.style.setProperty("--tt-shift", `${shift}px`);
}

document.addEventListener(
  "mouseover",
  (e) => positionTooltip(e.target.closest && e.target.closest(".has-tooltip")),
  { passive: true }
);
document.addEventListener("focusin", (e) =>
  positionTooltip(e.target.closest && e.target.closest(".has-tooltip"))
);
window.addEventListener(
  "resize",
  () => document.querySelectorAll(".has-tooltip:hover").forEach(positionTooltip),
  { passive: true }
);

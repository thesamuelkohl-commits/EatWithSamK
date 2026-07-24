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

/* ---------- Shared place helpers (used by app.js and reviews.js) ---------- */

function ratingClass(rating) {
  if (rating >= 9) return "great";
  if (rating >= 8) return "";
  return "good";
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

function badgeRowHtml(p) {
  if (!p.badges || !p.badges.length) return "";
  const pills = p.badges
    .map((key) => BADGES[key])
    .filter(Boolean)
    .map((b) => `<span class="badge-pill" title="${b.description}">${b.emoji} ${b.label}</span>`)
    .join("");
  return pills ? `<div class="badge-row">${pills}</div>` : "";
}

function placeCardHtml(p, opts) {
  opts = opts || {};
  return `
    <article class="place-card reveal" id="card-${p.id}">
      <div class="card-top">
        <div>
          <h3><a href="reviews/${p.id}.html">${p.name}</a></h3>
          <div class="card-city">📍 ${p.city}</div>
        </div>
        <div class="rating-badge ${ratingClass(p.rating)}">${p.rating}<small>/ 10</small></div>
      </div>
      ${badgeRowHtml(p)}
      ${p.tags && p.tags.length ? `<div class="card-tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
      <p class="card-ate"><strong>What I ate:</strong> ${p.ate}</p>
      <div class="card-contact">
        <span>🏠 ${p.address}</span>
        ${p.phone ? `<span>📞 <a href="tel:${p.phone.replace(/[^+\d]/g, "")}">${p.phone}</a></span>` : ""}
        ${p.website ? `<span>🌐 <a href="${p.website}" target="_blank" rel="noopener">${p.website.replace(/^https?:\/\/(www\.)?/, "")}</a></span>` : ""}
      </div>
      <div class="card-actions">
        <a class="btn btn-primary" href="${p.video}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Watch Review
        </a>
        ${opts.showMapJump ? `<button class="btn btn-ghost" data-map-jump="${p.id}">View on map</button>` : `<a class="btn btn-ghost" href="reviews/${p.id}.html">Full Review</a>`}
      </div>
      <a class="read-more" href="reviews/${p.id}.html">Read full review →</a>
    </article>`;
}

/* ---------- Shared blog helpers (used by blog.html and app.js) ---------- */

function formatPostDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function blogCardHtml(post) {
  return `
    <a class="blog-card reveal" href="post.html?id=${post.id}">
      <div class="blog-card-banner">${post.emoji}</div>
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

  function runCountUp() {
    started = true;
    const duration = 1100;
    const stepMs = 16;
    const start = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
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

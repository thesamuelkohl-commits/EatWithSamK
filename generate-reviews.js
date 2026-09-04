/* ============================================================
   EAT WITH SAM K — STATIC PAGE GENERATOR
   Run this any time you add, edit, or remove a place in
   js/data.js, or a guide in js/blog-data.js:

     node generate-reviews.js

   It builds:
     - reviews/<id>.html      (one real, static, SEO-optimized
       page per place — full <title>, meta description, Open
       Graph tags, and Review structured data baked in, so
       Google — and anyone sharing the link on social — sees
       real content immediately, no JavaScript required. Lives
       on disk as reviews/<id>.html but SERVES at the clean URL
       /reviews/<id> — see vercel.json's "cleanUrls" below)
     - guides/<id>/index.html (same deal, one per Best Of guide —
       serves at the clean URL /guides/<id>/, full article text
       and structured data in the raw HTML, no JS required)
     - sitemap.xml
     - robots.txt
     - _redirects             (Netlify-format 301s from the old
       /post.html?id=<id> URLs to their new /guides/<id>/ home —
       kept for portability, but NOT what the live site reads)
     - vercel.json             (same redirects, in the format Vercel
       actually honors — the site is hosted there, see README —
       plus "cleanUrls": true, which strips ".html" from every
       page's URL without moving any file on disk)

   You never edit the files in reviews/ or guides/ by hand —
   they're regenerated from js/data.js and js/blog-data.js every
   time you run this script.
   ============================================================ */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// TODO: update this once you have a real domain (e.g. after
// pointing eatwithsamk.com at your Netlify/GitHub Pages deploy).
// It's used for canonical URLs, Open Graph tags, and the sitemap.
const SITE_URL = "https://www.eatwithsamk.com";

function loadModule(relPath, trailingExpr) {
  const code = fs.readFileSync(path.join(__dirname, relPath), "utf8");
  return vm.runInNewContext(code + "\n" + trailingExpr, {});
}

const { SITE, PLACES, BADGES, PRICE_GUIDE } = loadModule("js/data.js", "({ SITE, PLACES, BADGES, PRICE_GUIDE });");
const BLOG_POSTS = loadModule("js/blog-data.js", "(BLOG_POSTS);");

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// A styled hover tooltip (not the native browser `title` box) — matches
// the client-side helper in js/common.js, used the same way here.
function tooltipAttrs(text) {
  const safe = escapeAttr(text);
  return `data-tooltip="${safe}" aria-label="${safe}" tabindex="0"`;
}

function priceTagHtml(price) {
  const tier = PRICE_GUIDE[price];
  if (!tier) return escapeHtml(price);
  return `<span class="price-tag has-tooltip" ${tooltipAttrs(`${tier.range}, ${tier.description}`)}>${escapeHtml(price)}</span>`;
}

function ratingClass(rating) {
  if (rating >= 8) return "great";
  if (rating >= 6) return "good";
  return "poor";
}

// Build-time render — always starts unsaved (no visitor/localStorage exists
// yet). js/common.js's hydrateFavoriteButtons() corrects this on page load.
function favoriteButtonHtml(place, extraClass) {
  return `<button type="button" class="favorite-btn${extraClass ? ` ${extraClass}` : ""}" data-favorite-toggle="${place.id}" aria-pressed="false" aria-label="Save ${escapeAttr(place.name)} to your saved places">🤍</button>`;
}

// Same widget as js/common.js's referralWidgetHtml() (used in the shared
// footer) — duplicated here since this file runs in Node, not the browser.
// No page-relative paths involved (just outbound links), so the two copies
// never need to diverge.
function referralWidgetHtml() {
  return `
    <div class="referral-widget glow-card">
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

function formatVisitDate(dateStr) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function truncate(str, max) {
  const clean = str.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1).trim() + "…" : clean;
}

// Best-effort split of "5056 Broadway, Suite B-103, Nashville, TN 37203"
// into schema.org PostalAddress fields.
function parseAddress(address) {
  const parts = address.split(",").map((p) => p.trim());
  const last = parts[parts.length - 1] || "";
  const match = last.match(/^([A-Za-z]{2})\s+(\d{5}(-\d{4})?)$/);
  const region = match ? match[1] : "";
  const postalCode = match ? match[2] : "";
  const locality = parts.length >= 2 ? parts[parts.length - 2] : "";
  const streetAddress = parts.slice(0, Math.max(parts.length - 2, 1)).join(", ");
  return { streetAddress, addressLocality: locality, addressRegion: region, postalCode };
}

function reviewUrl(place) {
  return `${SITE_URL}/reviews/${place.id}`;
}

function guideUrl(post) {
  return `${SITE_URL}/guides/${post.id}/`;
}

// Same rule as js/common.js's postCoverPhoto() (browser-side): a guide only
// gets a photo cover once Sam has personally reviewed one of the places in
// it (via post.places) and that review has a heroPhoto — otherwise it keeps
// the plain emoji banner. Duplicated here since this script runs in Node,
// not the browser (same reasoning as referralWidgetHtml() above).
function postCoverPhoto(post) {
  const withPhoto = (post.places || [])
    .map((id) => PLACES.find((p) => p.id === id))
    .find((p) => p && p.heroPhoto);
  return withPhoto ? withPhoto.heroPhoto : null;
}

function socialButtonsHtml() {
  return ""; // filled client-side by js/common.js via [data-socials]
}

// Small inline 0-10 meter for the Taste/Value/Atmosphere/Service breakdown.
function scoreRowHtml(label, value) {
  if (value === undefined || value === null) return "";
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return `
    <div class="score-row">
      <span class="score-label">${escapeHtml(label)}</span>
      <div class="score-bar"><div class="score-bar-fill" style="width:${pct}%"></div></div>
      <span class="score-value">${value}/10</span>
    </div>`;
}

function renderReviewPage(place, relatedPosts) {
  const cls = ratingClass(place.rating);
  const year = place.date ? new Date(place.date + "T12:00:00").getFullYear() : new Date().getFullYear();
  const title = `${place.name} Review (${year}): ${place.rating}/10 in ${place.city} | Eat With Sam K`;
  const description = `${truncate(place.ate, 140)} Sam K's rating: ${place.rating}/10.`;
  const canonical = reviewUrl(place);
  const ogImage = `${SITE_URL}/images/logo.png`;
  const addr = parseAddress(place.address);
  const telDigits = place.phone ? place.phone.replace(/[^+\d]/g, "") : "";
  const websiteLabel = place.website ? place.website.replace(/^https?:\/\/(www\.)?/, "") : "";
  const tagsHtml = (place.tags || [])
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join("");
  const greatForBadges = (place.badges || []).map((key) => BADGES[key]).filter(Boolean);
  const badgesHtml = greatForBadges
    .map((b) => `<span class="badge-pill has-tooltip" ${tooltipAttrs(b.description)}>${b.emoji} ${escapeHtml(b.label)}</span>`)
    .join("");
  // Strip tracking query params (?igsh=...) for a clean embed permalink.
  const videoPermalink = place.video ? place.video.split("?")[0] : "";
  const photosHtml = (place.photos || [])
    .map((p) => `<img src="../${p.src}" alt="${escapeAttr(p.alt || place.name)}" loading="lazy" />`)
    .join("");

  const isInstagramWebsite = !!(place.website && place.website.includes("instagram.com"));
  const quickFactsHtml = `
    <ul class="quick-facts">
      <li>⭐ <strong>Sam Score:</strong> ${place.rating}/10</li>
      ${place.date ? `<li>📅 <strong>Visited:</strong> ${formatVisitDate(place.date)}</li>` : ""}
      <li>📍 <strong>Address:</strong> ${escapeHtml(place.address)}</li>
      ${place.price ? `<li>💰 <strong>Price:</strong> ${priceTagHtml(place.price)}</li>` : ""}
      ${place.cuisine ? `<li>🍽️ <strong>Cuisine:</strong> ${escapeHtml(place.cuisine)}</li>` : ""}
      ${place.parking ? `<li>🚗 <strong>Parking:</strong> ${escapeHtml(place.parking)}</li>` : ""}
      ${place.phone ? `<li>📞 <strong>Phone:</strong> <a href="tel:${telDigits}">${escapeHtml(place.phone)}</a></li>` : ""}
      ${place.website ? `<li>${isInstagramWebsite ? "📸 <strong>Instagram:</strong>" : "🌐 <strong>Website:</strong>"} <a href="${place.website}" target="_blank" rel="noopener">${escapeHtml(websiteLabel)}</a></li>` : ""}
    </ul>
    ${greatForBadges.length ? `<p class="quick-facts-label">❤️ <strong>Great For:</strong></p><div class="badge-row">${badgesHtml}</div>` : ""}
    <div class="card-actions" style="margin-top: 14px;">
      ${place.video ? `<a class="btn btn-primary" href="${place.video}" target="_blank" rel="noopener">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Watch My Review
      </a>` : ""}
      <a class="btn btn-ghost" href="/reviews">← All Reviews</a>
    </div>`;

  const scores = place.scores || {};
  const breakdownHtml = [
    scoreRowHtml("Taste", scores.taste),
    scoreRowHtml("Value", scores.value),
    scoreRowHtml("Atmosphere", scores.atmosphere),
    scoreRowHtml("Service", scores.service),
  ].join("");
  const hasBreakdown = Object.keys(scores).length > 0;

  const hasProsOrCons = (place.pros && place.pros.length) || (place.cons && place.cons.length);
  const prosConsHtml = hasProsOrCons
    ? `
    <div class="pros-cons">
      ${place.pros && place.pros.length ? `<div class="pros"><h3>👍 Pros</h3><ul>${place.pros.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul></div>` : ""}
      ${place.cons && place.cons.length ? `<div class="cons"><h3>👎 Cons</h3><ul>${place.cons.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}</ul></div>` : ""}
    </div>`
    : "";

  const relatedHtml = relatedPosts.length
    ? `
    <div class="reveal">
      <h2 class="review-section-title">Related Articles</h2>
      <p class="review-about">${escapeHtml(place.name)} appears on:</p>
      <ul class="related-articles">
        ${relatedPosts.map((post) => `<li><a href="/guides/${post.id}/">${escapeHtml(post.title)}</a></li>`).join("")}
      </ul>
    </div>`
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: place.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: addr.streetAddress,
      addressLocality: addr.addressLocality,
      addressRegion: addr.addressRegion,
      postalCode: addr.postalCode,
      addressCountry: "US",
    },
    ...(place.about ? { description: place.about } : {}),
    ...(place.phone ? { telephone: place.phone } : {}),
    ...(place.website ? { url: place.website } : {}),
    ...(place.price ? { priceRange: place.price } : {}),
    ...(place.cuisine ? { servesCuisine: place.cuisine } : {}),
    ...(place.lat && place.lng
      ? { geo: { "@type": "GeoCoordinates", latitude: place.lat, longitude: place.lng } }
      : {}),
    review: {
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: place.rating,
        bestRating: "10",
        worstRating: "1",
      },
      author: { "@type": "Person", name: "Sam K" },
      reviewBody: place.ate,
      publisher: { "@type": "Organization", name: SITE.name },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Reviews", item: `${SITE_URL}/reviews` },
      { "@type": "ListItem", position: 3, name: place.name, item: canonical },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-2V4D6ZQV6Q"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-2V4D6ZQV6Q');
  </script>

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7072826210873110"
       crossorigin="anonymous"></script>

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:site_name" content="${escapeHtml(SITE.name)}" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />

  <link rel="icon" type="image/png" href="../images/favicon.png?v=2" />
  <link rel="manifest" href="../manifest.json" />
  <meta name="theme-color" content="#c05a24" />
  <link rel="apple-touch-icon" href="../images/icon-192.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Eat With Sam K" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="../css/style.css?v=45" />

  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
</head>
<body>

  <header class="site-header">
    <div class="header-inner">
      <a class="logo" href="/"><img class="logo-img" src="../images/logo.png?v=2" alt="Eat With Sam K logo" /> Eat With Sam K</a>
      <nav class="main-nav" data-nav="reviews" data-prefix="../"></nav>
      <div class="header-right">
        <div class="social-row" data-socials></div>
        <div class="auth-widget" data-auth></div>
        <div class="install-widget" data-install></div>
      </div>
    </div>
  </header>

  <main class="post-wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a><span>›</span>
      <a href="/reviews">Reviews</a><span>›</span>
      <span aria-current="page">${escapeHtml(place.name)}</span>
    </nav>

    ${place.heroPhoto ? `<div class="review-hero-banner" style="background-image: url('../${place.heroPhoto}')">` : ""}
    <div class="review-hero${place.heroPhoto ? " review-hero-on-photo" : ""}">
      <div class="rating-badge rating-badge-lg ${cls}">${place.rating}<small>/ 10</small></div>
      <div>
        <h1>${escapeHtml(place.name)} Review (${year})</h1>
        <p class="card-city">📍 ${escapeHtml(place.city)}</p>
      </div>
      ${favoriteButtonHtml(place, "favorite-btn-lg")}
    </div>
    ${place.heroPhoto ? `</div>` : ""}
    ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ""}

    <div class="reveal quick-facts-card glow-card">${quickFactsHtml}</div>

    ${videoPermalink ? `
    <div class="reveal">
      <h2 class="review-section-title">My Video Review</h2>
      <div class="ig-embed">
        <blockquote class="instagram-media" data-instgrm-permalink="${videoPermalink}" data-instgrm-version="14"></blockquote>
      </div>
    </div>
    ` : ""}

    ${place.about ? `<div class="reveal"><h2 class="review-section-title">About ${escapeHtml(place.name)}</h2><p class="review-about">${escapeHtml(place.about)}</p></div>` : ""}

    <h2 class="review-section-title">What I Ordered</h2>
    <p class="review-about">${escapeHtml(place.ate)}</p>

    ${photosHtml ? `
    <div class="reveal">
      <h2 class="review-section-title">Photos</h2>
      <div class="review-photos">${photosHtml}</div>
    </div>
    ` : ""}

    ${hasBreakdown ? `
    <div class="reveal">
      <h2 class="review-section-title">The Breakdown</h2>
      <div class="score-grid">${breakdownHtml}</div>
    </div>
    ` : ""}

    ${hasProsOrCons ? `<div class="reveal"><h2 class="review-section-title">Pros &amp; Cons</h2>${prosConsHtml}</div>` : ""}

    <div class="reveal final-rating">
      <h2 class="review-section-title">Sam Score</h2>
      <div class="rating-badge rating-badge-lg ${cls}">${place.rating}<small>/ 10</small></div>
    </div>

    <div class="reveal deals-section">${referralWidgetHtml()}</div>

    ${relatedHtml}

    <h2 class="review-section-title">Find it on the map</h2>
    <div id="map" class="review-map"></div>
  </main>

  <footer class="site-footer" data-footer data-prefix="../"></footer>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  ${videoPermalink ? '<script async src="//www.instagram.com/embed.js"></script>' : ""}
  <script src="../js/data.js?v=17"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="../js/supabase-config.js?v=1"></script>
  <script src="../js/common.js?v=34"></script>
  <script src="../js/auth.js?v=4"></script>
  <script src="../js/pwa.js?v=2"></script>
  <script>
    hydrateFavoriteButtons();
    var map = L.map("map", { scrollWheelZoom: false }).setView([${place.lat}, ${place.lng}], 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    var icon = L.divIcon({
      className: "",
      html: '<div class="rating-marker ${cls}"><span>${place.rating}</span></div>',
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });
    L.marker([${place.lat}, ${place.lng}], { icon: icon }).addTo(map)
      .bindPopup(${JSON.stringify(`<div class="popup-title">${place.name}</div>`)})
      .openPopup();
    window.addEventListener("load", function () { map.invalidateSize(); });
  </script>
</body>
</html>
`;
}

// Guide pages live one directory deeper than reviews/<id>.html — the URL is
// /guides/<id>/ (a folder + index.html, so it resolves as a clean trailing-
// slash path with no .html in the address bar). Rather than compute a
// different "../../" relative-path depth than reviews/*.html uses, every
// internal link/asset in this template is root-relative (a leading "/"),
// which resolves correctly no matter how deep the page sits. js/blog-data.js
// content is authored with the same convention (see the bulk migration note
// at the top of that file) so it drops in here unmodified.
function renderGuidePage(post) {
  const canonical = guideUrl(post);
  const title = `${post.title}, Eat With Sam K`;
  const description = post.excerpt;
  const cover = postCoverPhoto(post);
  const ogImage = cover ? `${SITE_URL}/${cover}` : `${SITE_URL}/images/logo.png`;
  const fmt = formatVisitDate(post.date);
  const hasInstagramEmbed = post.content.includes("instagram-media");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description,
    datePublished: post.date,
    image: ogImage,
    author: { "@type": "Person", name: "Sam K" },
    publisher: { "@type": "Organization", name: SITE.name },
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    url: canonical,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Best Of", item: `${SITE_URL}/best-of` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  const faqLd =
    post.faq && post.faq.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((qa) => ({
            "@type": "Question",
            name: qa.question,
            acceptedAnswer: { "@type": "Answer", text: qa.answer },
          })),
        }
      : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-2V4D6ZQV6Q"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-2V4D6ZQV6Q');
  </script>

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7072826210873110"
       crossorigin="anonymous"></script>

  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${canonical}" />

  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${canonical}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:site_name" content="${escapeHtml(SITE.name)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${ogImage}" />

  <link rel="icon" type="image/png" href="/images/favicon.png?v=2" />
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#c05a24" />
  <link rel="apple-touch-icon" href="/images/icon-192.png" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content="Eat With Sam K" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/style.css?v=45" />

  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbLd)}</script>
  ${faqLd ? `<script type="application/ld+json">${JSON.stringify(faqLd)}</script>` : ""}
</head>
<body>

  <header class="site-header">
    <div class="header-inner">
      <a class="logo" href="/"><img class="logo-img" src="/images/logo.png?v=2" alt="Eat With Sam K logo" /> Eat With Sam K</a>
      <nav class="main-nav" data-nav="blog" data-prefix="/"></nav>
      <div class="header-right">
        <div class="social-row" data-socials></div>
        <div class="auth-widget" data-auth></div>
        <div class="install-widget" data-install></div>
      </div>
    </div>
  </header>

  <main class="post-wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="/">Home</a><span>›</span>
      <a href="/best-of">Best Of</a><span>›</span>
      <span aria-current="page">${escapeHtml(post.title)}</span>
    </nav>

    <a class="post-back" href="/best-of">← Back to Best Of</a>
    ${
      cover
        ? `
    <div class="post-hero-banner" style="background-image: url('/${cover}')">
      <div class="post-hero-on-photo">
        <div class="post-emoji post-emoji-on-photo">${post.emoji}</div>
        <h1>${escapeHtml(post.title)}</h1>
      </div>
    </div>`
        : `
    <div class="post-emoji">${post.emoji}</div>
    <h1>${escapeHtml(post.title)}</h1>`
    }
    <div class="blog-meta"><span class="pill">${escapeHtml(post.city)}</span><span>${fmt}</span></div>
    <div class="post-body">${post.content}</div>
    ${referralWidgetHtml()}
  </main>

  <footer class="site-footer" data-footer data-prefix="/"></footer>

  ${hasInstagramEmbed ? '<script async src="//www.instagram.com/embed.js"></script>' : ""}
  <script src="/js/data.js?v=17"></script>
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <script src="/js/supabase-config.js?v=1"></script>
  <script src="/js/common.js?v=34"></script>
  <script src="/js/auth.js?v=4"></script>
  <script src="/js/pwa.js?v=2"></script>
</body>
</html>
`;
}

function renderSitemap() {
  const urls = [
    { loc: `${SITE_URL}/`, priority: "1.0" },
    { loc: `${SITE_URL}/map`, priority: "0.9" },
    { loc: `${SITE_URL}/reviews`, priority: "0.9" },
    { loc: `${SITE_URL}/best-of`, priority: "0.8" },
    { loc: `${SITE_URL}/about`, priority: "0.5" },
    { loc: `${SITE_URL}/advertise`, priority: "0.4" },
    { loc: `${SITE_URL}/privacy`, priority: "0.2" },
    ...PLACES.map((p) => ({ loc: reviewUrl(p), priority: "0.9", lastmod: p.date })),
    ...BLOG_POSTS.map((post) => ({ loc: guideUrl(post), priority: "0.7", lastmod: post.date })),
  ];
  const body = urls
    .map((u) => {
      const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : "";
      return `  <url>\n    <loc>${u.loc}</loc>${lastmod}\n    <priority>${u.priority}</priority>\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function renderRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
}

// Netlify's declarative redirect format (https://docs.netlify.com/routing/redirects/).
// Old guide links looked like /post.html?id=<id> — now that every guide has
// its own real page at /guides/<id>/, every one of those old URLs gets a
// permanent 301 here so bookmarks, backlinks, and anything Google already
// indexed keep working instead of breaking. The trailing "!" forces the
// redirect to fire even though post.html itself still exists as a real file
// (Netlify would otherwise serve that file directly for an exact match).
// Only takes effect on hosts that read a _redirects file (Netlify, and a few
// others) — see README's "Publishing" section for the GitHub Pages caveat.
function renderRedirects() {
  const lines = BLOG_POSTS.map(
    (post) => `/post.html?id=${post.id}  /guides/${post.id}/  301!`
  );
  return lines.join("\n") + "\n";
}

// The site is actually hosted on Vercel (see README's "Publishing" section —
// that's now stale), which does NOT read the Netlify-format _redirects file
// above. Without this, /post.html?id=<x> serves 200 with only a client-side
// JS redirect, which Google Search Console flags as "Page with redirect" and
// won't index — and worse, isn't a real 301 for anyone/anything that can't
// run JS. vercel.json's redirects array is what Vercel actually honors.
function renderVercelConfig() {
  const redirects = BLOG_POSTS.map((post) => ({
    source: "/post.html",
    has: [{ type: "query", key: "id", value: post.id }],
    destination: `/guides/${post.id}/`,
    permanent: true,
  }));
  // cleanUrls strips ".html" from every page's URL (and 308-redirects any
  // request that still has it) without moving a single file on disk — every
  // top-level page and reviews/<id>.html keep living exactly where they are.
  // post.html is deliberately left reachable at its real name: its whole job
  // is catching old /post.html?id=... links (see the redirects above), and
  // this doesn't change that — it can still just also be visited at /post.
  return JSON.stringify({ cleanUrls: true, redirects }, null, 2) + "\n";
}

// ---------- Portable data export ----------
// A clean, comment-free JSON mirror of js/data.js — the same restaurant/
// review database, reshaped so it's fetchable by anything (a future API
// route, a mobile app, a script), not just this website's own <script>
// tags. Source of truth is still js/data.js; these files are generated,
// never hand-edited (same rule as reviews/*.html).
function placeForExport(place) {
  return {
    ...place,
    url: reviewUrl(place),
    photos: (place.photos || []).map((p) => ({ ...p, src: `${SITE_URL}/${p.src}` })),
  };
}

function writeDataExport() {
  const dataDir = path.join(__dirname, "data");
  fs.mkdirSync(dataDir, { recursive: true });

  const generatedAt = new Date().toISOString();

  fs.writeFileSync(
    path.join(dataDir, "places.json"),
    JSON.stringify({ generatedAt, places: PLACES.map(placeForExport) }, null, 2)
  );
  console.log("wrote data/places.json");

  fs.writeFileSync(
    path.join(dataDir, "badges.json"),
    JSON.stringify({ generatedAt, badges: BADGES }, null, 2)
  );
  console.log("wrote data/badges.json");

  fs.writeFileSync(
    path.join(dataDir, "price-guide.json"),
    JSON.stringify({ generatedAt, priceGuide: PRICE_GUIDE }, null, 2)
  );
  console.log("wrote data/price-guide.json");
}

// index.html's hero stats ("Places Rated" / "Cities" / "Avg Rating") are
// otherwise-static markup — bake the real numbers in at build time so
// they're correct on first paint (and visible to anyone/anything not
// running JS), same as everything else this script generates. js/app.js's
// animateCountUp() still runs on top of this, animating from whatever's
// already here rather than resetting to 0 (see js/common.js).
function bakeHomepageStats() {
  const indexPath = path.join(__dirname, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");

  const placesCount = PLACES.length;
  const citiesCount = new Set(PLACES.map((p) => p.city)).size;
  const avgRating = PLACES.length ? PLACES.reduce((s, p) => s + p.rating, 0) / PLACES.length : 0;

  const stats = {
    "stat-places": String(placesCount),
    "stat-cities": String(citiesCount),
    "stat-avg": avgRating.toFixed(1),
  };

  for (const [id, value] of Object.entries(stats)) {
    html = html.replace(
      new RegExp(`(<div class="num" id="${id}">)[^<]*(</div>)`),
      `$1${value}$2`
    );
  }

  fs.writeFileSync(indexPath, html);
  console.log(`updated index.html stats (${placesCount} places, ${citiesCount} cities, ${avgRating.toFixed(1)} avg)`);
}

// Same card markup as js/common.js's blogCardHtml() (browser-side) —
// duplicated here since this script runs in Node, not the browser (same
// reasoning as referralWidgetHtml()/postCoverPhoto() above).
function blogCardHtml(post) {
  const cover = postCoverPhoto(post);
  return `
    <a class="blog-card glow-card tilt-card reveal" href="/guides/${post.id}/">
      ${cover ? `<div class="blog-card-banner blog-card-banner-photo" style="background-image: url('${cover}')"></div>` : `<div class="blog-card-banner">${post.emoji}</div>`}
      <div class="blog-card-body">
        <div class="blog-meta"><span class="pill">${escapeHtml(post.city)}</span><span>${formatVisitDate(post.date)}</span></div>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt)}</p>
        <span class="read-more">Read more →</span>
      </div>
    </a>`;
}

// Replaces the content between `<!-- baked:<marker>:start -->` and
// `<!-- baked:<marker>:end -->` in `file` with `html`. Marker comments (not
// a naive "match up to the next </div>") because the content being baked in
// is itself full of nested <div>s — a marker pair is the only thing that's
// safe to find unambiguously and stays idempotent across repeated runs.
function bakeMarkedSection(file, marker, html) {
  const filePath = path.join(__dirname, file);
  const original = fs.readFileSync(filePath, "utf8");
  const start = `<!-- baked:${marker}:start -->`;
  const end = `<!-- baked:${marker}:end -->`;
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`);
  if (!pattern.test(original)) {
    throw new Error(`bakeMarkedSection: couldn't find "${marker}" markers in ${file} — did someone edit them by hand?`);
  }
  fs.writeFileSync(filePath, original.replace(pattern, `${start}${html}${end}`));
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// best-of.html's guide grid, and index.html's homepage "Best Of Guides"
// section, both render their cards purely client-side (js/best-of.js /
// js/app.js) — meaning a crawler that doesn't run JS would see an empty
// <div> and zero real links to any guide from either page. Baking the same
// card markup in at build time (JS then just overwrites it with the exact
// same HTML on load — this is what already happens with the homepage
// stats above) means the real <a href="guides/<id>/"> links are present
// in the raw HTML response, same as everything else this script generates.
function bakeBestOfGrid() {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date));
  const cards = sorted.map(blogCardHtml).join("");
  bakeMarkedSection("best-of.html", "blog-grid", cards);
  console.log(`updated best-of.html guide grid (${BLOG_POSTS.length} guides, most recent first)`);
}

function bakeHomeBlogGrid() {
  const recentPosts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const cards = recentPosts.map(blogCardHtml).join("");
  bakeMarkedSection("index.html", "home-blog", cards);
  console.log(`updated index.html "Best Of Guides" section (${recentPosts.length} most recent)`);
}

const reviewsDir = path.join(__dirname, "reviews");
fs.mkdirSync(reviewsDir, { recursive: true });

// Clear out stale review pages for places that no longer exist in data.js.
for (const f of fs.readdirSync(reviewsDir)) {
  if (f.endsWith(".html") && !PLACES.some((p) => `${p.id}.html` === f)) {
    fs.unlinkSync(path.join(reviewsDir, f));
    console.log(`removed stale reviews/${f}`);
  }
}

for (const place of PLACES) {
  const relatedPosts = BLOG_POSTS.filter((post) => post.places && post.places.includes(place.id));
  const outPath = path.join(reviewsDir, `${place.id}.html`);
  fs.writeFileSync(outPath, renderReviewPage(place, relatedPosts));
  console.log(`wrote reviews/${place.id}.html`);
}

const guidesDir = path.join(__dirname, "guides");
fs.mkdirSync(guidesDir, { recursive: true });

// Clear out stale guide folders for posts no longer in blog-data.js.
for (const d of fs.readdirSync(guidesDir)) {
  if (!BLOG_POSTS.some((post) => post.id === d)) {
    fs.rmSync(path.join(guidesDir, d), { recursive: true, force: true });
    console.log(`removed stale guides/${d}/`);
  }
}

for (const post of BLOG_POSTS) {
  const outDir = path.join(guidesDir, post.id);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), renderGuidePage(post));
  console.log(`wrote guides/${post.id}/index.html`);
}

fs.writeFileSync(path.join(__dirname, "sitemap.xml"), renderSitemap());
console.log("wrote sitemap.xml");

fs.writeFileSync(path.join(__dirname, "robots.txt"), renderRobots());
console.log("wrote robots.txt");

fs.writeFileSync(path.join(__dirname, "_redirects"), renderRedirects());
console.log("wrote _redirects");

fs.writeFileSync(path.join(__dirname, "vercel.json"), renderVercelConfig());
console.log("wrote vercel.json");

writeDataExport();

bakeHomepageStats();
bakeBestOfGrid();
bakeHomeBlogGrid();

console.log(`\nDone — ${PLACES.length} review page(s), ${BLOG_POSTS.length} guide page(s) generated.`);

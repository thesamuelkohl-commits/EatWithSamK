/* ============================================================
   COOKIE CONSENT

   Real consent, not a decorative banner: this uses Google Consent
   Mode v2, so Analytics and AdSense are held in a denied state until
   the visitor actually chooses. Google's tags still load, but until
   consent is granted they store no cookies and send no identifiers.

   The default state is set in the <head> of every page (before the
   gtag snippet, which is the only place it works), so this file only
   handles the banner UI and the update call.

   The choice is stored in localStorage under CONSENT_KEY. Clearing
   site data, or calling window.samkResetConsent() from the console,
   brings the banner back.
   ============================================================ */

(function () {
  const CONSENT_KEY = "ewsk-cookie-consent";
  const CONSENT_VERSION = 1;

  function readChoice() {
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // A bumped version invalidates old answers, so the banner can be
      // re-shown if what we ask consent for ever changes.
      return parsed && parsed.version === CONSENT_VERSION ? parsed : null;
    } catch (err) {
      // Private browsing / storage disabled: treat as "not answered yet"
      // rather than crashing. The banner just shows again next visit.
      return null;
    }
  }

  function saveChoice(granted) {
    try {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({ version: CONSENT_VERSION, granted: granted, at: new Date().toISOString() })
      );
    } catch (err) {
      /* nothing to do, the visit still respects the choice in-memory */
    }
  }

  function applyConsent(granted) {
    const state = granted ? "granted" : "denied";
    if (typeof gtag === "function") {
      gtag("consent", "update", {
        analytics_storage: state,
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
      });
    }
  }

  function dismissBanner(banner) {
    banner.classList.remove("is-visible");
    // Remove after the transition so it's out of the tab order entirely.
    setTimeout(() => banner.remove(), 350);
  }

  function showBanner() {
    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-live", "polite");
    banner.setAttribute("aria-label", "Cookie consent");
    banner.innerHTML = `
      <div class="cookie-banner-inner">
        <p class="cookie-banner-text">
          🍪 This site uses cookies for analytics and ads to keep it running.
          You can accept them or carry on with only what's needed to make the site work.
          See the <a href="/privacy">Privacy Policy</a>.
        </p>
        <div class="cookie-banner-actions">
          <button type="button" class="btn btn-ghost" data-consent="reject">Essential Only</button>
          <button type="button" class="btn btn-primary" data-consent="accept">Accept All</button>
        </div>
      </div>`;
    document.body.appendChild(banner);

    // Force a reflow so the transition has a start value to animate from,
    // then reveal. Deliberately not requestAnimationFrame: that never fires
    // while a tab is backgrounded, which would leave the banner stuck
    // off-screen for anyone who opens the site in a background tab.
    void banner.offsetHeight;
    banner.classList.add("is-visible");

    banner.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-consent]");
      if (!btn) return;
      const granted = btn.dataset.consent === "accept";
      saveChoice(granted);
      applyConsent(granted);
      dismissBanner(banner);
    });
  }

  const existing = readChoice();
  if (existing) {
    applyConsent(existing.granted);
  } else if (document.body) {
    showBanner();
  } else {
    document.addEventListener("DOMContentLoaded", showBanner);
  }

  // Escape hatch so the choice can be changed later (linked from the footer).
  window.samkResetConsent = function () {
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch (err) {
      /* ignore */
    }
    if (!document.querySelector(".cookie-banner")) showBanner();
  };
})();

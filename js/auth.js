/* ============================================================
   REAL ACCOUNTS — magic-link sign-in (Supabase) so saved places
   sync across devices, on top of the guest/browser-only favorites
   in js/common.js. Fully optional: until js/supabase-config.js is
   filled in with a real project, the "Sign In" button just explains
   that, and everything else (including saving places as a guest)
   keeps working exactly as it did before this file existed.

   How the two systems fit together:
   - js/common.js's getFavorites()/isFavorite() are the single
     synchronous source every page reads from (cards, map pins,
     review pages) — unchanged by any of this.
   - Signed OUT: that local list is the only copy, same as before.
   - Signed IN: this file mirrors it to/from the `favorites` table
     in Supabase (see supabase/favorites.sql) — toggling a heart
     still updates the local list instantly (so the UI never waits
     on the network), and syncs to your account in the background.
   ============================================================ */

const AUTH_CONFIGURED =
  typeof SUPABASE_URL !== "undefined" && SUPABASE_URL && SUPABASE_URL !== "YOUR_SUPABASE_PROJECT_URL";

const supabaseClient =
  AUTH_CONFIGURED && typeof supabase !== "undefined"
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

let currentUser = null;
let authPopoverOpen = false;
let authWidgetState = "signed-out"; // "signed-out" | "sending" | "sent"
let authError = "";

function renderAuthWidgets() {
  document.querySelectorAll("[data-auth]").forEach((el) => {
    el.innerHTML = authWidgetHtml();
  });
}

function authWidgetHtml() {
  const openAttr = authPopoverOpen ? "" : "hidden";
  const expanded = authPopoverOpen ? "true" : "false";

  if (currentUser) {
    return `
      <div class="auth-widget">
        <button type="button" class="auth-trigger auth-trigger-signedin" data-auth-toggle aria-expanded="${expanded}">👤 ${escapeForAttr(currentUser.email)}</button>
        <div class="auth-popover" data-auth-popover ${openAttr}>
          <p class="auth-popover-title">Signed in — your saved places sync across devices.</p>
          <button type="button" class="btn btn-ghost auth-signout" data-auth-signout>Sign Out</button>
        </div>
      </div>`;
  }

  const statusHtml =
    authWidgetState === "sent"
      ? `<p class="auth-status auth-status-ok">📩 Check your email for a sign-in link!</p>`
      : authError
        ? `<p class="auth-status auth-status-error">${escapeForAttr(authError)}</p>`
        : "";

  return `
    <div class="auth-widget">
      <button type="button" class="auth-trigger" data-auth-toggle aria-expanded="${expanded}">👤 Sign In</button>
      <div class="auth-popover" data-auth-popover ${openAttr}>
        <form data-auth-form>
          <p class="auth-popover-title">Sign in to save places across all your devices</p>
          <input type="email" class="auth-email" data-auth-email placeholder="you@email.com" required autocomplete="email" />
          <button type="submit" class="btn btn-primary auth-submit" ${authWidgetState === "sending" ? "disabled" : ""}>${authWidgetState === "sending" ? "Sending…" : "Send Magic Link"}</button>
          ${statusHtml}
        </form>
      </div>
    </div>`;
}

async function sendMagicLink(email) {
  if (!supabaseClient) {
    authError = "Sign-in isn't set up yet on this site — see js/supabase-config.js.";
    authWidgetState = "signed-out";
    renderAuthWidgets();
    return;
  }
  authWidgetState = "sending";
  authError = "";
  renderAuthWidgets();

  const { error } = await supabaseClient.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href.split("#")[0] },
  });

  if (error) {
    authError = error.message;
    authWidgetState = "signed-out";
  } else {
    authWidgetState = "sent";
  }
  renderAuthWidgets();
}

async function signOut() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
}

// Called by js/common.js's toggleFavorite() after every heart click —
// a no-op while signed out (typeof-checked there, so it's safe even
// if this file were ever removed).
async function onFavoriteToggled(id, active) {
  if (!supabaseClient || !currentUser) return;
  try {
    if (active) {
      await supabaseClient.from("favorites").upsert({ user_id: currentUser.id, place_id: id }, { onConflict: "user_id,place_id" });
    } else {
      await supabaseClient.from("favorites").delete().eq("place_id", id);
    }
  } catch (err) {
    console.warn("Couldn't sync this save to your account (it's still saved on this device):", err);
  }
}

// Runs right after sign-in: pushes up anything saved as a guest before
// signing in (so it isn't lost), then pulls the full, merged list back
// down as the new local cache — same shape either way, so every page's
// existing favorite rendering just picks it up via getFavorites().
async function syncFavoritesWithRemote() {
  if (!supabaseClient || !currentUser) return;

  const localIds = getFavorites();
  if (localIds.length) {
    await supabaseClient
      .from("favorites")
      .upsert(localIds.map((place_id) => ({ user_id: currentUser.id, place_id })), { onConflict: "user_id,place_id" });
  }

  const { data, error } = await supabaseClient.from("favorites").select("place_id");
  if (error) {
    console.warn("Couldn't load your saved places from your account:", error.message);
    return;
  }

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.map((row) => row.place_id)));
  } catch {
    // Storage disabled — favorites still work for this page load, just
    // won't persist locally (the account copy is unaffected either way).
  }
  hydrateFavoriteButtons();
  document.dispatchEvent(new CustomEvent("favorites:change", { detail: { bulk: true } }));
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-auth-toggle]")) {
    authPopoverOpen = !authPopoverOpen;
    renderAuthWidgets();
    return;
  }
  if (e.target.closest("[data-auth-signout]")) {
    signOut();
    return;
  }
  if (authPopoverOpen && !e.target.closest(".auth-widget")) {
    authPopoverOpen = false;
    renderAuthWidgets();
  }
});

document.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-auth-form]");
  if (!form) return;
  e.preventDefault();
  const email = form.querySelector("[data-auth-email]").value.trim();
  if (email) sendMagicLink(email);
});

(async function initAuth() {
  renderAuthWidgets();
  if (!supabaseClient) return;

  const { data } = await supabaseClient.auth.getSession();
  currentUser = data.session ? data.session.user : null;
  renderAuthWidgets();
  if (currentUser) syncFavoritesWithRemote();

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    currentUser = session ? session.user : null;
    authPopoverOpen = false;
    authWidgetState = "signed-out";
    authError = "";
    renderAuthWidgets();
    if (currentUser) syncFavoritesWithRemote();
  });
})();

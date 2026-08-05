/* ============================================================
   ADD TO HOME SCREEN — installable-app support.
   - Registers the service worker (sw.js) so Chrome/Android treat
     this site as a real installable PWA.
   - Renders a "📲 Get the App" button into every page's
     [data-install] slot: on Chrome/Android/desktop it triggers the
     native install prompt; on iOS Safari (which has no install
     prompt API) it shows the manual "Add to Home Screen" steps.
   - Hides itself entirely once the site is already running as an
     installed app.
   ============================================================ */

let deferredInstallPrompt = null;
let installState = "hidden"; // "hidden" | "available" | "ios"
let installPopoverOpen = false;

function isRunningStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function renderInstallWidgets() {
  document.querySelectorAll("[data-install]").forEach((el) => {
    el.innerHTML = installWidgetHtml();
  });
}

function installWidgetHtml() {
  if (installState === "hidden") return "";

  if (installState === "ios") {
    const openAttr = installPopoverOpen ? "" : "hidden";
    const expanded = installPopoverOpen ? "true" : "false";
    return `
      <div class="install-widget">
        <button type="button" class="install-trigger" data-install-toggle aria-expanded="${expanded}">📲 Get the App</button>
        <div class="install-popover" data-install-popover ${openAttr}>
          <p class="install-popover-title">Add Eat With Sam K to your Home Screen</p>
          <ol class="install-steps">
            <li>Tap <strong>Share</strong> <span aria-hidden="true">⬆️</span> in Safari's toolbar</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong></li>
            <li>Tap <strong>Add</strong> — you're done!</li>
          </ol>
        </div>
      </div>`;
  }

  return `<button type="button" class="install-trigger" data-install-cta>📲 Get the App</button>`;
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-install-cta]")) {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.finally(() => {
      deferredInstallPrompt = null;
    });
    return;
  }
  if (e.target.closest("[data-install-toggle]")) {
    installPopoverOpen = !installPopoverOpen;
    renderInstallWidgets();
    return;
  }
  if (installPopoverOpen && !e.target.closest(".install-widget")) {
    installPopoverOpen = false;
    renderInstallWidgets();
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installState = "available";
  renderInstallWidgets();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installState = "hidden";
  renderInstallWidgets();
});

(function initInstall() {
  if (isRunningStandalone()) return; // already installed — nothing to show

  if (isIosDevice()) {
    installState = "ios";
    renderInstallWidgets();
  }

  if ("serviceWorker" in navigator) {
    // Reuse the same data-prefix every page already sets on [data-nav]
    // (root pages: "", one level deep like reviews/<id>.html: "../") so
    // this resolves to the real sw.js no matter how deep the page is.
    const prefix = document.querySelector("[data-nav]")?.dataset.prefix || "";
    navigator.serviceWorker.register(`${prefix}sw.js`).catch(() => {});
  }
})();

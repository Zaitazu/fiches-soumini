// ============================================================================
// Fiches Soumini — Per-Actor Theming (Foundry V12–V13, ApplicationV2)
// Scoped CSS injection per Actor sheet + Theme picker FormApplication
//
// "Best method" for header theme button color in V13:
//   1) CSS rule scoped to [data-theme-button="1"] with !important (clean baseline)
//   2) JS patch (inline !important) + MutationObserver (robust against rerenders/overrides)
//      BUT observer is lightweight and only re-patches:
//        - rollables (optional but kept because you needed it)
//        - the theme header button (the problem at hand)
//
// Separate colors:
//   - content buttons:    pal.button
//   - header controls:    pal.headerButton
// ============================================================================

import { PALETTES, PALETTE_CHOICES } from "./CSS/index.js";

const MODULE_ID = "fiches-soumini";
const FLAG_KEY  = "themeChoice";

// ----------------------------------------------------------------------------
// DOM helpers (V12/V13, jQuery/HTMLElement)
// ----------------------------------------------------------------------------

function resolveHTMLElement(maybeEl) {
  if (!maybeEl) return null;
  if (maybeEl instanceof HTMLElement) return maybeEl;
  if (globalThis.jQuery && maybeEl instanceof jQuery) return maybeEl[0] ?? null;
  if (Array.isArray(maybeEl)) return maybeEl[0] instanceof HTMLElement ? maybeEl[0] : null;
  return null;
}

function getAppId(app, rootEl) {
  return app?.id || app?.appId || rootEl?.id || null;
}

function getAppRootElement(app) {
  const id = app?.id || app?.appId;
  let el = null;
  if (id) el = document.getElementById(id);
  if (!el) el = resolveHTMLElement(app?._element);
  if (!el) el = resolveHTMLElement(app?.element);
  return el;
}

// ----------------------------------------------------------------------------
// Style injection helpers
// ----------------------------------------------------------------------------

function removeInjectedStyle(rootEl) {
  const root = resolveHTMLElement(rootEl);
  const old = root?.querySelector?.(':scope > style[data-theme-style="1"]');
  if (old) old.remove();
}

/** Build strictly-scoped CSS. No global selectors to avoid leaks. */
function buildScopedCSS(prefix, pal) {
  const fond         = pal.fond        ?? "#222";
  const ruban        = pal.ruban       ?? "#444";
  const text         = pal.text        ?? "#EEE";
  const bgText       = pal.bgText      ?? ruban;
  const inputText    = pal.inputText   ?? text;
  const highlight    = pal.highlight   ?? text;

  // Separate colors
  const button       = pal.button       ?? text;                       // content buttons
  const headerButton = pal.headerButton ?? pal.button ?? pal.highlight ?? text; // header controls

  // Background image options (optional)
  const bgImage     = pal.bgImage     ?? null;
  const bgSize      = pal.bgSize      ?? "cover";
  const bgPosition  = pal.bgPosition  ?? "center";
  const bgRepeat    = pal.bgRepeat    ?? "no-repeat";
  const bgOpacity   = Number.isFinite(pal.bgOpacity) ? pal.bgOpacity : 0.15;

  const veilRGBA = (() => {
    const hex = String(fond).replace("#", "");
    const to = (i) => parseInt(
      hex.length === 3 ? hex[i] + hex[i] : hex.slice(i * 2, i * 2 + 2),
      16
    );
    const r = to(0) || 250, g = to(1) || 247, b = to(2) || 234;
    const a = Math.max(0, Math.min(1, bgOpacity));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  })();

  const contentBackgroundBlock = bgImage ? `
    background-color: ${fond};
    background-image:
      linear-gradient(${veilRGBA}, ${veilRGBA}),
      url("${bgImage}");
    background-size: ${bgSize}, ${bgSize};
    background-position: ${bgPosition}, ${bgPosition};
    background-repeat: no-repeat, ${bgRepeat};
  ` : `
    background: ${fond};
    background-color: ${fond};
  `;

  return `
    /* =========================================================================
       Root scope (no leaks)
       ========================================================================= */
    ${prefix} {
      background: ${fond};
      background-color: ${fond};
      color: ${text};

      --color-header-background: ${ruban};
      --color-select-option-bg: ${ruban};

      --color-text-primary: ${text};
      --color-text-secondary: ${text};

      --color-text-hyperlink: ${highlight};
      --color-text-hyperlink-hover: ${highlight};
      --color-text-light-highlight: ${highlight};
    }

    /* Header bar */
    ${prefix} .window-header {
      background: var(--color-header-background, ${ruban});
      color: ${text};
    }

    /* Header controls/close/etc */
    ${prefix} .window-header .header-control,
    ${prefix} .window-header .header-control i,
    ${prefix} .window-header .header-control svg {
      color: ${headerButton};
      fill: ${headerButton};
      stroke: ${headerButton};
    }

    /* Our theme button (baseline CSS, scoped + !important) */
    ${prefix} [data-theme-button="1"],
    ${prefix} [data-theme-button="1"] i,
    ${prefix} [data-theme-button="1"] svg {
      color: ${headerButton} !important;
      fill: ${headerButton} !important;
      stroke: ${headerButton} !important;
    }

    /* Content zone (bg + optional image) */
    ${prefix} .window-content {
      ${contentBackgroundBlock}
      color: ${text};
    }

    ${prefix} .application {
      background: transparent;
      color: ${text};
    }

    /* Inputs & selects */
    ${prefix} input[type="text"],
    ${prefix} input[type="number"],
    ${prefix} input[type="password"],
    ${prefix} input[type="date"],
    ${prefix} input[type="time"],
    ${prefix} input[type="search"],
    ${prefix} input[type="file"],
    ${prefix} select,
    ${prefix} textarea {
      background: ${bgText};
      color: ${inputText};
    }

    /* Headings */
    ${prefix} h4 { color: ${highlight}; }

    /* Rollables (CSS baseline; JS patch ensures final word) */
    ${prefix} .custom-system-rollable,
    ${prefix} a.custom-system-rollable,
    ${prefix} .actor-v2 .custom-system-rollable,
    ${prefix} .actor-v2 a.custom-system-rollable {
      color: ${highlight};
      text-decoration-color: ${highlight};
    }

    /* Buttons in content */
    ${prefix} .window-content a.button,
    ${prefix} .window-content button {
      color: ${button};
    }

    /* Table base: fully transparent container */
    ${prefix} table {
      background: transparent !important;
      background-color: transparent !important;
    }

    /* Keep zebra striping with very low opacity */
    ${prefix} table tbody tr:nth-child(odd)  td,
    ${prefix} table tbody tr:nth-child(odd)  th {
      background-color: rgba(0, 0, 0, 0.06) !important;
    }

    ${prefix} table tbody tr:nth-child(even) td,
    ${prefix} table tbody tr:nth-child(even) th {
      background-color: rgba(0, 0, 0, 0.10) !important;
    }
  `;
}

// ----------------------------------------------------------------------------
// Robust patches (inline !important) + lightweight observer
// ----------------------------------------------------------------------------

function setInlineImportant(el, prop, value) {
  try { el.style.setProperty(prop, value, "important"); } catch (_) {}
}

function patchRollables(rootEl, pal) {
  const root = resolveHTMLElement(rootEl);
  if (!root) return;

  const highlight = pal?.highlight ?? pal?.text ?? "#EEE";

  const nodes = root.querySelectorAll(
    ".custom-system-rollable, a.custom-system-rollable, [data-roll], [data-action='roll']"
  );

  for (const el of nodes) {
    setInlineImportant(el, "color", highlight);
    setInlineImportant(el, "text-decoration-color", highlight);

    setInlineImportant(el, "--color-text-hyperlink", highlight);
    setInlineImportant(el, "--color-text-hyperlink-hover", highlight);
    setInlineImportant(el, "--color-text-light-highlight", highlight);

    for (const child of el.querySelectorAll("i, svg, span")) {
      setInlineImportant(child, "color", highlight);
      setInlineImportant(child, "fill", highlight);
      setInlineImportant(child, "stroke", highlight);
    }
  }
}

/** Patch ONLY our theme header button (robust vs rerenders/overrides). */
function patchThemeButton(rootEl, pal) {
  const root = resolveHTMLElement(rootEl);
  if (!root) return;

  const c = pal?.headerButton ?? pal?.button ?? pal?.highlight ?? pal?.text ?? "#EEE";

  const btn = root.querySelector('[data-theme-button="1"]');
  if (!btn) return;

  setInlineImportant(btn, "color", c);

  const icon = btn.querySelector("i, svg");
  if (icon) {
    setInlineImportant(icon, "color", c);
    setInlineImportant(icon, "fill", c);
    setInlineImportant(icon, "stroke", c);
  }
}

const _themeObservers = new Map(); // appId -> MutationObserver
const _themeObsTimers = new Map(); // appId -> number (throttle)

/** Throttled patch to avoid doing work on every micro-mutation. */
function schedulePatch(appId, fn) {
  if (_themeObsTimers.get(appId)) return;
  const t = window.setTimeout(() => {
    _themeObsTimers.delete(appId);
    try { fn(); } catch (_) {}
  }, 0);
  _themeObsTimers.set(appId, t);
}

function detachThemeObserver(appId) {
  const prev = _themeObservers.get(appId);
  if (prev) {
    try { prev.disconnect(); } catch (_) {}
    _themeObservers.delete(appId);
  }
  const timer = _themeObsTimers.get(appId);
  if (timer) {
    try { clearTimeout(timer); } catch (_) {}
    _themeObsTimers.delete(appId);
  }
}

function attachThemeObserver(app, rootEl, pal) {
  const root = resolveHTMLElement(rootEl);
  if (!app || !root) return;

  const appId = getAppId(app, root);
  if (!appId) return;

  detachThemeObserver(appId);

  const obs = new MutationObserver(() => {
    schedulePatch(appId, () => {
      // keep this minimal: only what we truly need to stay correct
      patchThemeButton(root, pal);
      patchRollables(root, pal);
    });
  });

  obs.observe(root, { subtree: true, childList: true, attributes: true });
  _themeObservers.set(appId, obs);
}

// ----------------------------------------------------------------------------
// Theme application
// ----------------------------------------------------------------------------

function applyThemeToApp(app, choice) {
  if (!app?.actor || !app.rendered) return;

  const root = getAppRootElement(app);
  if (!root) return;

  const pal = PALETTES?.[choice]
           ?? PALETTES?.classic
           ?? Object.values(PALETTES ?? {})[0];

  if (!pal) return;

  const appId = getAppId(app, root) ?? "0";

  const themeId = `sheet-${appId}-${choice}`;
  root.setAttribute("data-theme-id", themeId);

  removeInjectedStyle(root);

  const style = document.createElement("style");
  style.type = "text/css";
  style.setAttribute("data-theme-style", "1");

  const prefix = `[data-theme-id="${themeId}"]`;
  style.textContent = buildScopedCSS(prefix, pal);

  root.appendChild(style);

  // Ensure the two problematic elements are correct immediately
  patchThemeButton(root, pal);
  patchRollables(root, pal);

  // Keep them correct even if the system rerenders/overrides
  attachThemeObserver(app, root, pal);
}

function getActorThemeChoice(actor) {
  const actorChoice = actor?.getFlag(MODULE_ID, FLAG_KEY);
  const fallback    = "classic";
  const first       = Object.keys(PALETTE_CHOICES ?? {})[0] ?? "classic";
  return actorChoice ?? fallback ?? first;
}

// ----------------------------------------------------------------------------
// FormApplication — Theme picker
// ----------------------------------------------------------------------------

class ActorThemeForm extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "actor-theme-picker",
      title: "Sheet Theme",
      template: "modules/fiches-soumini/templates/theme-picker.hbs",
      width: 380,
      height: "auto",
      closeOnSubmit: true,
      submitOnChange: false,
      popOut: true
    });
  }

  get actor() { return this.object; }

  async getData() {
    const canEdit = game.user.isGM || this.actor?.isOwner;
    return {
      choices: canEdit ? (PALETTE_CHOICES ?? {}) : {},
      current: getActorThemeChoice(this.actor),
      canEdit
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    const root = resolveHTMLElement(html) ?? html;

    const cancel = root?.querySelector?.('[data-action="cancel"]');
    cancel?.addEventListener("click", () => this.close());

    if (!game.user.isGM && !this.actor?.isOwner) {
      root?.querySelectorAll?.("select,button[type=submit]")?.forEach(el => {
        el.disabled = true;
      });
    }
  }

  async _updateObject(_event, formData) {
    if (!game.user.isGM && !this.actor?.isOwner) {
      ui.notifications?.warn("You don't have permission to change this sheet theme.");
      return;
    }

    const value = formData?.[FLAG_KEY] ?? formData?.themeChoice;
    if (!value) return;

    await this.actor.setFlag(MODULE_ID, FLAG_KEY, value);

    for (const app of Object.values(ui.windows)) {
      if (app?.actor?.id === this.actor.id && app.rendered) {
        applyThemeToApp(app, value);
      }
    }

    ui.notifications?.info(
      `Theme set for "${this.actor.name}": ${PALETTE_CHOICES?.[value] ?? value}`
    );
  }
}

// ----------------------------------------------------------------------------
// Header button — visible to GM/owner.
// IMPORTANT: we do NOT rely on one-shot inline styling here.
// The reliable color enforcement is done by patchThemeButton + observer.
// ----------------------------------------------------------------------------

function injectHeaderButton(app) {
  if (!app?.actor) return;
  if (!(game.user?.isGM || app.actor?.isOwner)) return;

  const root = getAppRootElement(app);
  if (!root) return;

  // We try the classic place first, but do not assume where Foundry puts controls.
  const header = root.querySelector?.(".window-header") || root.querySelector?.(".window-titlebar") || root;
  if (!header) return;

  const appId = getAppId(app, root) ?? "0";
  const domID = `fs-theme-btn-${appId}`;

  if (root.querySelector(`#${domID}, [data-theme-button="1"]`)) return;

  const closeButton =
    root.querySelector('.window-header [data-action="close"]') ||
    root.querySelector('.window-titlebar [data-action="close"]') ||
    header.querySelector?.('[data-action="close"]');

  const btn = document.createElement("button");
  btn.id = domID;
  btn.type = "button";
  btn.setAttribute("data-theme-button", "1");
  btn.className = "header-control icon";
  btn.setAttribute("data-tooltip", "Choose Sheet Theme");
  btn.innerHTML = `<i class="fas fa-palette"></i>`;
  btn.addEventListener("click", () => new ActorThemeForm(app.actor).render(true));

  if (closeButton?.parentNode) {
    closeButton.parentNode.insertBefore(btn, closeButton);
  } else {
    const title =
      root.querySelector(".window-header .window-title") ||
      root.querySelector(".window-titlebar .window-title") ||
      header.querySelector?.(".window-title");
    if (title?.parentNode) title.parentNode.insertBefore(btn, title.nextSibling);
    else header.appendChild(btn);
  }

  // Immediately enforce correct color (and observer will keep it correct)
  try {
    const choice = getActorThemeChoice(app.actor);
    const pal = PALETTES?.[choice] ?? PALETTES?.classic ?? Object.values(PALETTES ?? {})[0];
    patchThemeButton(root, pal);
  } catch (_) {}
}

// ----------------------------------------------------------------------------
// Hooks
// ----------------------------------------------------------------------------

Hooks.on("renderApplicationV2", (app) => {
  try {
    if (!app?.actor) return;

    const choice = getActorThemeChoice(app.actor);
    applyThemeToApp(app, choice);
    injectHeaderButton(app);
  } catch (err) {
    console.error(`${MODULE_ID} | Failed to apply per-actor theme`, err);
  }
});

Hooks.on("closeApplicationV2", (app) => {
  try {
    const root = getAppRootElement(app);
    const appId = getAppId(app, root);
    if (appId) detachThemeObserver(appId);
  } catch (_) {}
});

Hooks.on("updateActor", (actor, changes) => {
  if (!foundry.utils.hasProperty(changes, `flags.${MODULE_ID}.${FLAG_KEY}`)) return;

  for (const app of Object.values(ui.windows)) {
    if (app?.actor?.id === actor.id && app.rendered) {
      const choice = actor.getFlag(MODULE_ID, FLAG_KEY);
      applyThemeToApp(app, choice);
    }
  }
});

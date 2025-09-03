// ============================================================================
// Fiches Soumini — Per-Actor Theming (Foundry V12–V13, appV2)
// Full-JS scoped CSS injection + Theme FormApplication
// Button added at the very beginning of the header (left-most).
// All CSS is fully scoped to avoid cross-sheet leaks.
// ============================================================================

import { PALETTES, PALETTE_CHOICES } from "./CSS/index.js";

const MODULE_ID = "fiches-soumini";
const FLAG_KEY  = "themeChoice";

// ----------------------------------------------------------------------------
// Utilities
// ----------------------------------------------------------------------------

function removeInjectedStyle(rootEl) {
  const old = rootEl?.querySelector?.(':scope > style[data-theme-style="1"]');
  if (old) old.remove();
}

/** Build strictly-scoped CSS. No global selectors to avoid leaks. */
function buildScopedCSS(prefix, pal) {
  const fond      = pal.fond      ?? "#222";
  const ruban     = pal.ruban     ?? "#444";
  const text      = pal.text      ?? "#EEE";
  const bgText    = pal.bgText    ?? ruban;
  const inputText = pal.inputText ?? text;
  const highlight = pal.highlight ?? text;
  const button    = pal.button    ?? text;

  return `
    /* Root */
    ${prefix} {
      background: ${fond};
      background-color: ${fond};
      color: ${text};
      --color-header-background: ${ruban};
    }

    /* Common inner containers */
    ${prefix} .window-content,
    ${prefix} .application {
      background: ${fond};
      background-color: ${fond};
      color: ${text};
    }

    /* Header bar */
    ${prefix} .window-header {
      background: var(--color-header-background, ${ruban});
      color: ${text};
    }

    /* Inputs & selects (scoped only) */
    ${prefix} input[type="text"],
    ${prefix} input[type="number"],
    ${prefix} input[type="password"],
    ${prefix} input[type="date"],
    ${prefix} input[type="time"],
    ${prefix} input[type="search"],
    ${prefix} input[type="file"],
    ${prefix} select {
      background: ${bgText};
      color: ${inputText};
    }

    /* Headings */
    ${prefix} h4 {
      color: ${highlight};
    }

    /* Rollables (cover root having .actor-v2, or it being inside; plus generic class) */
    ${prefix}.actor-v2 .custom-system-rollable,
    ${prefix} .actor-v2 .custom-system-rollable,
    ${prefix} .custom-system-rollable {
      color: ${highlight};
    }

    /* Buttons text color */
    ${prefix} a.button,
    ${prefix} button {
      color: ${button};
    }
  `;
}

/** Apply theme to a single Actor sheet (hot, no full re-render). */
function applyThemeToApp(app, choice) {
  if (!app?.actor || !app.rendered) return;
  const root = app.element;
  if (!root) return;

  const pal = PALETTES[choice]
           ?? PALETTES.classic
           ?? Object.values(PALETTES)[0];

  // Unique scope per sheet instance + theme choice
  const themeId = `sheet-${app.id || app.appId || "0"}-${choice}`;
  root.setAttribute("data-theme-id", themeId);

  removeInjectedStyle(root);

  const style = document.createElement("style");
  style.type = "text/css";
  style.setAttribute("data-theme-style", "1");

  const prefix = `[data-theme-id="${themeId}"]`;
  style.textContent = buildScopedCSS(prefix, pal);

  root.appendChild(style);
}

/** Resolve theme for an Actor: flag -> "classic" -> first palette key. */
function getActorThemeChoice(actor) {
  const actorChoice = actor?.getFlag(MODULE_ID, FLAG_KEY);
  const fallback    = "classic";
  const first       = Object.keys(PALETTE_CHOICES)[0] ?? "classic";
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
      choices: canEdit ? PALETTE_CHOICES : {},
      current: getActorThemeChoice(this.actor),
      canEdit
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('[data-action="cancel"]').on("click", () => this.close());

    // Hard-disable if not allowed (double safety with getData)
    if (!game.user.isGM && !this.actor?.isOwner) {
      html.find("select,button[type=submit]").prop("disabled", true);
    }
  }

  async _updateObject(_event, formData) {
    // Permissions check
    if (!game.user.isGM && !this.actor?.isOwner) {
      ui.notifications?.warn("You don't have permission to change this sheet theme.");
      return;
    }

    const value = formData["themeChoice"];
    await this.actor.setFlag(MODULE_ID, FLAG_KEY, value);

    // Hot-apply to any open sheet of this Actor
    for (const app of Object.values(ui.windows)) {
      if (app?.actor && app.actor.id === this.actor.id && app.rendered) {
        applyThemeToApp(app, value);
      }
    }
    ui.notifications?.info(
      `Theme set for "${this.actor.name}": ${PALETTE_CHOICES[value] ?? value}`
    );
  }
}

// ----------------------------------------------------------------------------
// Header button — added as the very first element (left-most). Visible to GM/owner.
// ----------------------------------------------------------------------------

function injectHeaderButton(app) {
  if (!app?.actor) return;
  const root = app.element;
  if (!root) return;

  const header = root.querySelector(".window-header");
  if (!header) return;

  // Only GM or Actor owner can see the button
  const canEditTheme = game.user.isGM || app.actor.isOwner;
  if (!canEditTheme) return;

  // Avoid duplicates
  if (header.querySelector('[data-theme-button="1"]')) return;

  const btn = document.createElement("a");
  btn.setAttribute("data-theme-button", "1");
  btn.classList.add("header-button");
  btn.title = "Choose Sheet Theme";
  btn.innerHTML = `<i class="fas fa-palette"></i>`;
  btn.addEventListener("click", () => new ActorThemeForm(app.actor).render(true));

  // Insert as the very first child of the header (left-most)
  header.insertBefore(btn, header.firstChild);
}

// ----------------------------------------------------------------------------
// Hooks
// ----------------------------------------------------------------------------

Hooks.on("renderApplicationV2", (app) => {
  try {
    if (!app.actor) return; // only Actor sheets

    const choice = getActorThemeChoice(app.actor);
    applyThemeToApp(app, choice);
    injectHeaderButton(app);
  } catch (err) {
    console.error(`${MODULE_ID} | Failed to apply per-actor theme`, err);
  }
});

Hooks.on("updateActor", (actor, changes) => {
  // If the Actor's theme flag changed, update any open sheets for that Actor
  if (!foundry.utils.hasProperty(changes, `flags.${MODULE_ID}.${FLAG_KEY}`)) return;

  for (const app of Object.values(ui.windows)) {
    if (app?.actor && app.actor.id === actor.id && app.rendered) {
      const choice = actor.getFlag(MODULE_ID, FLAG_KEY);
      applyThemeToApp(app, choice);
    }
  }
});
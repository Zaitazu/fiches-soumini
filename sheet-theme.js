// sheet-theme.js
import { PALETTES, PALETTE_CHOICES } from "./CSS/index.js";

const MODULE_ID = "fiches-soumini";

/** Remove previously injected <style> for this sheet */
function removeInjectedStyle(rootEl) {
  const old = rootEl.querySelector(':scope > style[data-theme-style="1"]');
  if (old) old.remove();
}

/** Build CSS rules scoped to a unique prefix (data-theme-id) */
function buildScopedCSS(prefix, pal) {
  return `
    /* Root colors & header var */
    ${prefix} {
      background: ${pal.fond};
      color: ${pal.text};
      --color-header-background: ${pal.ruban};
    }

    /* appV2 header */
    ${prefix} .window-header {
      background: var(--color-header-background, ${pal.ruban});
      color: ${pal.text};
    }

    /* Inputs (adapte si besoin) */
    .application input[type="text"],
    .application input[type="number"],
    .application input[type="password"],
    .application input[type="date"],
    .application input[type="time"],
    .application input[type="search"],
    .application input[type="file"],
    .application select {
      background: ${pal.bgText};
      color: ${pal.inputText};
    }

    /* Accents */
    .application h4 {
      color: ${pal.highlight};
    }

    .actor-v2
    .custom-system-rollable {
      color: ${pal.highlight};
    }

    .application a.button, .application button{
      color: ${pal.button};
    }
  `;
}

/** Core: apply selected theme to a single Actor sheet app (without full re-render) */
function applyThemeToApp(app, choice) {
  if (!app?.actor || !app.rendered) return;
  const root = app.element;
  if (!root) return;

  const pal = PALETTES[choice] ?? PALETTES.blue;

  // Use a stable id per app + current choice
  const themeId = `sheet-${app.id || app.appId || "0"}-${choice}`;
  root.setAttribute("data-theme-id", themeId);

  // Replace previous style
  removeInjectedStyle(root);

  const style = document.createElement("style");
  style.type = "text/css";
  style.setAttribute("data-theme-style", "1");

  const prefix = `[data-theme-id="${themeId}"]`;
  style.textContent = buildScopedCSS(prefix, pal);

  root.appendChild(style);
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "themeChoice", {
    name: "Sheet Theme",
    hint: "Choose your theme (only affects your view).",
    scope: "client",
    config: true,
    type: String,
    default: "classic",
    choices: PALETTE_CHOICES,
    onChange: () => {
      // Force re-render of all currently open Actor sheets
      for (const app of Object.values(ui.windows)) {
        if (app?.actor && app.rendered) {
          app.render(true); // full refresh so theme reapplies
        }
      }
    }
  });
});

/** appV2: apply the theme whenever an Actor sheet renders */
Hooks.on("renderApplicationV2", (app) => {
  try {
    if (!app.actor) return; // only Actor sheets
    const choice = game.settings.get(MODULE_ID, "themeChoice") ?? "blue";
    applyThemeToApp(app, choice);
  } catch (err) {
    console.error(`${MODULE_ID} | Failed to apply per-user theme`, err);
  }
});

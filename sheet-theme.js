// sheet-theme.js
import { PALETTES, PALETTE_CHOICES } from "./CSS/index.js";

const MODULE_ID = "fiches-soumini";

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "themeChoice", {
    name: "Sheet Theme",
    hint: "Choose your theme (only affects your view).",
    scope: "client",
    config: true,
    type: String,
    default: "blue",
    choices: PALETTE_CHOICES,
    onChange: () => {
      for (const app of Object.values(ui.windows)) {
        if (app?.actor && app.rendered) app.render(true);
      }
    }
  });
});

function removeInjectedStyle(rootEl) {
  const old = rootEl.querySelector(':scope > style[data-theme-style="1"]');
  if (old) old.remove();
}

function buildScopedCSS(prefix, pal) {
  return `
    ${prefix} {
      background: ${pal.fond};
      color: ${pal.text};
      --color-header-background: ${pal.ruban};
    }

    ${prefix} .window-header {
      background: var(--color-header-background, ${pal.ruban});
      color: ${pal.text};
    }

    ${prefix} .application input,
    ${prefix} select {
      background: ${pal.ruban};
      color: ${pal.inputText};
    }

    ${prefix} h4 {
      color: ${pal.highlight};
    }

    .actor-v2 
    .custom-system-rollable {
      color: ${pal.highlight};
    }
  `;
}

Hooks.on("renderApplicationV2", (app) => {
  try {
    if (!app.actor) return;

    const root = app.element;
    if (!root) return;

    const choice = game.settings.get(MODULE_ID, "themeChoice") ?? "blue";
    const pal = PALETTES[choice] ?? PALETTES.blue;

    const themeId = `sheet-${app.id || app.appId || "0"}-${choice}`;
    root.setAttribute("data-theme-id", themeId);

    removeInjectedStyle(root);

    const style = document.createElement("style");
    style.type = "text/css";
    style.setAttribute("data-theme-style", "1");

    const prefix = `[data-theme-id="${themeId}"]`;
    style.textContent = buildScopedCSS(prefix, pal);

    root.appendChild(style);
  } catch (err) {
    console.error(`${MODULE_ID} | Failed to apply per-user theme`, err);
  }
});

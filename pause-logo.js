// ============================================================================
// Fiches Soumini — Global Pause Logo Override (with text under the image)
// Works on V12–V13. Inject CSS immediately + preload image.
// ============================================================================

// 1) Configure your image and size here
const FS_PAUSE_LOGO_URL = "modules/fiches-soumini/assets/pause/logo_officiel_sans_fond.png";
const FS_PAUSE_SIZE     = "15vmin";  // e.g. "22vmin" (responsive) or "160px"
const FS_PAUSE_GAP      = "0.5rem";  // small gap between logo and text
const FS_PAUSE_VERT     = "12vmin";

// 2) Immediately inject the CSS (before hooks fire), to avoid the old logo flash.
(function fsImmediatePauseCSS() {
  if (document.getElementById("fs-pause-style")) return;

  const css = `
    /* Apply our image as background, keep text below */
    #pause {
      background-image: url("${FS_PAUSE_LOGO_URL}") !important;
      background-position: center top !important;
      background-repeat: no-repeat !important;
      background-size: ${FS_PAUSE_SIZE} !important;
      padding-top: calc(${FS_PAUSE_SIZE} + ${FS_PAUSE_GAP}) !important;
      text-align: center !important;
    }

    /* Hide built-in pause icons (but not the text) */
    #pause img, #pause svg, #pause i, #pause .fa, #pause .fa-pause {
      display: none !important;
    }
  `;

  const style = document.createElement("style");
  style.id = "fs-pause-style";
  style.type = "text/css";
  style.textContent = css;
  document.head.appendChild(style);

  // 3) Preload the image ASAP so it’s ready when pause overlay shows
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = FS_PAUSE_LOGO_URL;
  document.head.appendChild(link);
})();

// 4) Safety: re-inject if a theme nukes <head> styles late (rare)
Hooks.once("init", () => {
  if (!document.getElementById("fs-pause-style")) {
    const style = document.createElement("style");
    style.id = "fs-pause-style";
    style.textContent = `
      #pause{
        background-image:url("${FS_PAUSE_LOGO_URL}")!important;
        background-position:center top!important;
        background-repeat:no-repeat!important;
        background-size:${FS_PAUSE_SIZE}!important;
        padding-top:calc(${FS_PAUSE_VERT})!important;
        text-align:center!important;
      }
      #pause img,#pause svg,#pause i,#pause .fa,#pause .fa-pause{display:none!important}
    `;
    document.head.appendChild(style);
  }
});

// 5) Extra resilience if some UI rebuilds happen
Hooks.on("canvasReady", () => {/* noop */});
Hooks.on("pause", () => {/* noop */});

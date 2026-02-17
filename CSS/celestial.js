// CSS/celestial.js
export const celestial = {
  id: "celestial",
  label: "Celestial Paladin",
  colors: {
    fond: "#948857bb",       // ivory parchment (light, low eye fatigue)
    ruban: "#C9A227",      // muted royal gold for header/inputs
    text: "#ffffff",       // slate-900 (excellent contrast on ivory & gold)
    bgText: "#c9a32767",
    button: "#d7de07ff",
    headerButton: "#ffffff",
    inputText: "#ffffff",  // same as text for strong readability
    highlight: "#d7de07ff",  // deep amber for headings/rollables text

    // NEW: background image options (optional keys)
    bgImage: null, // path to image
    bgSize: "cover",         // cover | contain | 1200px 800px ...
    bgPosition: "center",    // center | top | 50% 20% ...
    bgRepeat: "no-repeat",   // no-repeat | repeat-x | ...
    bgOpacity: 0.18,         // 0..1 overlay opacity
    bgBlend: "normal"        // normal | multiply | overlay | soft-light ...
  }
};

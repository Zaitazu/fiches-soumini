// CSS/index.js
import { blue } from "./blue.js";
import { forest } from "./forest.js";
import { classic } from "./classic.js";

export const PALETTES = {
  [blue.id]: blue.colors,
  [forest.id]: forest.colors,
  [classic.id]: classic.colors
};

export const PALETTE_CHOICES = {
  [blue.id]: blue.label,
  [forest.id]: forest.label,
  [classic.id]: classic.label
};

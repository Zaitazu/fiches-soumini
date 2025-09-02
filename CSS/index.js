// CSS/index.js
import { blue } from "./blue.js";
import { forest } from "./forest.js";
import { classic } from "./classic.js";
import { celestial } from "./celestial.js";

export const PALETTES = {
  [blue.id]: blue.colors,
  [forest.id]: forest.colors,
  [classic.id]: classic.colors,
  [celestial.id]: celestial.colors
};

export const PALETTE_CHOICES = {
  [blue.id]: blue.label,
  [forest.id]: forest.label,
  [classic.id]: classic.label,
  [celestial.id]: celestial.label
};

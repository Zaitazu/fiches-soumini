// CSS/index.js
import { classic } from "./classic.js";
import { blue } from "./blue.js";
import { forest } from "./forest.js";
import { celestial } from "./celestial.js";
import { celestialDark } from "./celestial-dark.js";

export const PALETTES = {
  [classic.id]: classic.colors,
  [blue.id]: blue.colors,
  [forest.id]: forest.colors,
  [celestial.id]: celestial.colors,
  [celestialDark.id]: celestialDark.colors
  
};

export const PALETTE_CHOICES = {
  [classic.id]: classic.label,
  [blue.id]: blue.label,
  [forest.id]: forest.label,
  [celestial.id]: celestial.label,
  [celestialDark.id]: celestialDark.label
};

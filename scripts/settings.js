export const registerSettings = function() {
  /**
   * use auto attacks pnj
   */
  game.settings.register("fiches-soumini", "AutoAttacks", {
    name: "Auto Attaques bestiaire",
    hint: "Lance automatiquement les attaques des mobs au début de leurs tours s'ils sont vivants",
    scope: "world",
    type: Boolean,
    config: true,
    default: true
  });
}
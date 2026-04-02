import { registerSettings } from "./scripts/settings.js";

/* ------------------------------------ */
/* Init                                 */
/* ------------------------------------ */
Hooks.once("setup", async function () {
  console.log("Initialisation Fiches soumini setup");
  registerSettings();
});

Hooks.once("customSystemBuilderReady", () => {
  game.settings.set(game.system.id, "initFormula", "vit");
});

/* ------------------------------------ */
/* Utils                                */
/* ------------------------------------ */
function getPJTemplateId() {
  return game.actors.getName("_PJ_Template")?.id ?? null;
}

function isPJ(actor, pjTemplateId) {
  return actor?.system?.template === pjTemplateId;
}

function getLiveActorFromCombatant(combatant) {
  if (!combatant) return null;

  const tokenId = combatant.tokenId ?? combatant.token?.id;
  if (tokenId) {
    const token = canvas.tokens?.get(tokenId);
    if (token?.actor) return token.actor;
  }

  if (combatant.actor) return combatant.actor;

  const actorId = combatant.actorId;
  if (actorId) return game.actors.get(actorId) ?? null;

  return null;
}

/* ------------------------------------ */
/* Combat start                         */
/* ------------------------------------ */
Hooks.on("combatStart", async (combat) => {
  console.log("[Soumini] Début de combat");

  const pjTemplateId = getPJTemplateId();
  if (!pjTemplateId || !combat?.combatants) return;

  for (const combatant of combat.combatants) {
    const actor = getLiveActorFromCombatant(combatant);
    if (!actor) continue;

    if (isPJ(actor, pjTemplateId)) {
      await actor.roll("end_battle", { postMessage: false });
    }
  }
});

/* ------------------------------------ */
/* Combat turn change                   */
/* ------------------------------------ */
Hooks.on("combatTurnChange", async (combat, prior, current) => {
  const autoattacks = game.settings.get("fiches-soumini", "AutoAttacks");
  console.log("[Soumini] Combat Turn Change", { prior, current });

  const pjTemplateId = getPJTemplateId();
  if (!pjTemplateId) return;

  const combatant = combat?.combatant;
  if (!combatant) return;

  const actor = getLiveActorFromCombatant(combatant);
  if (!actor) {
    console.warn("[Soumini] Aucun acteur trouvé pour le combatant courant.");
    return;
  }

  console.log("[Soumini] Tour détecté", {
    round: combat.round,
    turn: combat.turn,
    combatantId: combatant.id,
    tokenId: combatant.tokenId,
    actorId: actor.id,
    actorName: actor.name
  });

  if (isPJ(actor, pjTemplateId)) {
    console.log("[Soumini] PJ");
    await actor.roll("start_turn", { postMessage: true });
    return;
  }

  console.log("[Soumini] PNJ");
  await actor.roll("start_turn", { postMessage: true });

  if (!autoattacks) return;

  setTimeout(async () => {
    const currentCombat = game.combat;
    if (!currentCombat?.combatant) return;

    if (currentCombat.combatant.id !== combatant.id) return;

    const freshActor = getLiveActorFromCombatant(currentCombat.combatant);
    if (!freshActor) return;

    const pv = Number(freshActor.system?.props?.pv_actuel ?? 0);
    if (pv <= 0) return;

    await freshActor.roll("atqs", { postMessage: false });
  }, 200);
});

/* ------------------------------------ */
/* Combat end                           */
/* ------------------------------------ */
Hooks.on("preDeleteCombat", async (combat) => {
  console.log("[Soumini] Fin de combat");

  const pjTemplateId = getPJTemplateId();
  if (!pjTemplateId || !combat?.combatants) return;

  for (const combatant of combat.combatants) {
    const actor = getLiveActorFromCombatant(combatant);
    if (!actor) continue;

    if (isPJ(actor, pjTemplateId)) {
      await actor.roll("end_battle", { postMessage: false });
    }
  }
});
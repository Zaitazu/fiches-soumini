import { registerSettings } from "./scripts/settings.js";

const MODULE_ID = "fiches-soumini";
const CLIENT_INSTANCE_ID = foundry.utils.randomID();

/* ------------------------------------ */
/* Anti double-enregistrement           */
/* ------------------------------------ */
if (globalThis.__souminiHooksRegistered) {
  console.warn("[Soumini] Hooks déjà enregistrés, second chargement ignoré.");
} else {
  globalThis.__souminiHooksRegistered = true;

  console.log("[Soumini] custom-script.js chargé", {
    clientInstanceId: CLIENT_INSTANCE_ID,
    userId: game.user?.id,
    userName: game.user?.name,
    isGM: game.user?.isGM
  });

  /* ------------------------------------ */
  /* Init                                 */
  /* ------------------------------------ */
  Hooks.once("setup", async function () {
    console.log("Initialisation Fiches soumini setup");
    registerSettings();
  });

  Hooks.once("customSystemBuilderReady", () => {
    game.settings.set(game.system.id, "initFormula", "!vit");
  });

  Hooks.on("renderChatMessageHTML", (message, html) => {
    if (!message?.flags?.core?.initiativeRoll) return;

    html.classList.add("soumini-init-message");

    const speaker = message.speaker?.alias || "Inconnu";
    const combat = game.combat;
    if (!combat) return;

    let combatant = null;

    if (message.speaker?.token) {
      combatant = combat.combatants.find(c => c.tokenId === message.speaker.token);
    }

    if (!combatant && message.speaker?.actor) {
      combatant = combat.combatants.find(c => c.actor?.id === message.speaker.actor);
    }

    const initiative = combatant?.initiative ?? "—";

    html.querySelectorAll(".flavor-text, .dice-flavor, .message-flavor").forEach(el => el.remove());

    const messageContent = html.querySelector(".message-content");
    if (!messageContent) return;

    messageContent.replaceChildren();

    const row = document.createElement("div");
    row.className = "soumini-init-row";
    row.innerHTML = `
      <span class="soumini-init-name">
        <i class="fa-solid fa-bolt"></i> Initiative - ${speaker}
      </span>
      <span class="soumini-init-total">${initiative}</span>
    `;

    messageContent.appendChild(row);
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

  function getTurnKey(combat, combatant) {
    return [
      combat?.id ?? "no-combat",
      combat?.round ?? "no-round",
      combat?.turn ?? "no-turn",
      combatant?.id ?? "no-combatant"
    ].join("|");
  }

  function getLifecycleKey(combat, phase) {
    return [
      combat?.id ?? "no-combat",
      phase
    ].join("|");
  }

  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function canParticipateInClaim() {
    return !!game.user?.isGM;
  }

  async function claimExecution(combat, flagName, key) {
    if (!canParticipateInClaim()) {
      return false;
    }

    const claim = {
      key,
      instanceId: CLIENT_INSTANCE_ID,
      userId: game.user?.id ?? null,
      userName: game.user?.name ?? null,
      ts: Date.now()
    };

    await combat.setFlag(MODULE_ID, flagName, claim);

    await sleep(75);

    const finalClaim = combat.getFlag(MODULE_ID, flagName);

    const won = finalClaim?.key === key && finalClaim?.instanceId === CLIENT_INSTANCE_ID;

    if (!won) {
      console.log("[Soumini] Claim perdu", {
        flagName,
        key,
        myInstance: CLIENT_INSTANCE_ID,
        myUser: game.user?.name,
        finalClaim
      });
    }

    return won;
  }

  async function resetCombatLocks(combat) {
    if (!combat) return;

    const flagsToUnset = [
      "lastProcessedTurnKey",
      "turnClaim",
      "lifecycleClaim",
      "lastCombatStartKey",
      "lastCombatEndKey"
    ];

    for (const flag of flagsToUnset) {
      try {
        await combat.unsetFlag(MODULE_ID, flag);
      } catch (err) {
        console.warn(`[Soumini] Impossible de reset ${flag}`, err);
      }
    }
  }

  /* ------------------------------------ */
  /* Combat start                         */
  /* ------------------------------------ */
  Hooks.on("combatStart", async (combat) => {
    console.log("[Soumini] Début de combat reçu", {
      clientInstanceId: CLIENT_INSTANCE_ID,
      userName: game.user?.name,
      isGM: game.user?.isGM
    });

    if (!canParticipateInClaim()) return;

    const lifecycleKey = getLifecycleKey(combat, "combatStart");
    const alreadyProcessed = combat.getFlag(MODULE_ID, "lastCombatStartKey");
    if (alreadyProcessed === lifecycleKey) {
      console.log("[Soumini] combatStart déjà traité, on ignore :", lifecycleKey);
      return;
    }

    const iWon = await claimExecution(combat, "lifecycleClaim", lifecycleKey);
    if (!iWon) return;

    const processedAfterClaim = combat.getFlag(MODULE_ID, "lastCombatStartKey");
    if (processedAfterClaim === lifecycleKey) {
      console.log("[Soumini] combatStart déjà traité après claim :", lifecycleKey);
      return;
    }

    await resetCombatLocks(combat);
    await combat.setFlag(MODULE_ID, "lastCombatStartKey", lifecycleKey);

    console.log("[Soumini] Début de combat exécuté par ce client", {
      lifecycleKey,
      clientInstanceId: CLIENT_INSTANCE_ID,
      userName: game.user?.name
    });

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
    console.log("[Soumini] Combat Turn Change reçu", {
      prior,
      current,
      clientInstanceId: CLIENT_INSTANCE_ID,
      userName: game.user?.name,
      isGM: game.user?.isGM
    });

    if (!canParticipateInClaim()) return;

    const autoattacks = game.settings.get("fiches-soumini", "AutoAttacks");
    const pjTemplateId = getPJTemplateId();
    if (!pjTemplateId) return;

    const combatant = combat?.combatant;
    if (!combatant) return;

    const actor = getLiveActorFromCombatant(combatant);
    if (!actor) {
      console.warn("[Soumini] Aucun acteur trouvé pour le combatant courant.");
      return;
    }

    const turnKey = getTurnKey(combat, combatant);

    const alreadyProcessed = combat.getFlag(MODULE_ID, "lastProcessedTurnKey");
    if (alreadyProcessed === turnKey) {
      console.log("[Soumini] Tour déjà traité, on ignore :", turnKey);
      return;
    }

    const iWon = await claimExecution(combat, "turnClaim", turnKey);
    if (!iWon) return;

    const processedAfterClaim = combat.getFlag(MODULE_ID, "lastProcessedTurnKey");
    if (processedAfterClaim === turnKey) {
      console.log("[Soumini] Tour déjà traité après claim, on ignore :", turnKey);
      return;
    }

    await combat.setFlag(MODULE_ID, "lastProcessedTurnKey", turnKey);

    console.log("[Soumini] Tour détecté et exécuté par ce client", {
      round: combat.round,
      turn: combat.turn,
      combatantId: combatant.id,
      tokenId: combatant.tokenId,
      actorId: actor.id,
      actorName: actor.name,
      turnKey,
      clientInstanceId: CLIENT_INSTANCE_ID,
      userName: game.user?.name
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

      const currentTurnKey = getTurnKey(currentCombat, currentCombat.combatant);
      if (currentTurnKey !== turnKey) return;

      const processedKey = currentCombat.getFlag(MODULE_ID, "lastProcessedTurnKey");
      if (processedKey !== turnKey) return;

      const freshActor = getLiveActorFromCombatant(currentCombat.combatant);
      if (!freshActor) return;

      const pv = Number(freshActor.system?.props?.pv_actuel ?? 0);
      if (pv <= 0) return;

      await freshActor.roll("atqs", { postMessage: false });
    }, 200);
  });

  function getMainGM() {
  return game.users
    .filter(u => u.active && u.isGM)
    .sort((a, b) => a.id.localeCompare(b.id))[0] ?? null;
}

function isMainGMClient() {
  const mainGM = getMainGM();
  return !!mainGM && game.user?.id === mainGM.id;
}

/* ------------------------------------ */
/* Combat end                           */
/* ------------------------------------ */
Hooks.on("preDeleteCombat", async (combat) => {
  console.log("[Soumini] Fin de combat reçue", {
    clientInstanceId: CLIENT_INSTANCE_ID,
    userName: game.user?.name,
    isGM: game.user?.isGM
  });

  if (!canParticipateInClaim()) return;
  if (!isMainGMClient()) return;

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
}
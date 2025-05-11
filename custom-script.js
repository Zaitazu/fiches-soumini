Hooks.on('combatStart', () => {
  console.log('Début de combat !');
  const pj_template = game.actors.getName('_PJ_Template').id;
  game.combat.combatants
    .forEach(element => {
      console.log(element.actorId);
      const acteur = game.actors.get(element.actorId);
      if(acteur.system.template===pj_template){
        console.log('PJ');
        acteur.roll('end_battle',{postMessage:false});
      }
      else{
        console.log('PNJ');
      }
    });
  
    // on parcourt tout les tokens de la scène
  for (let token of canvas.tokens.objects.children) {
    // si le token est associé à un combat (onglet Rencontres de combat)
    if (token.inCombat) {
    // si le token n'a pas de propriétaire parmi les joueurs: PNJ
      if (!game.actors.get(token.actor.id).hasPlayerOwner) {
        console.log("inCombat + !hasPlayerOwner");
        console.log(game.actors.get(token.actor.id).hasPlayerOwner);
        // on passe le PNJ comme propriété de tout les joueurs: Droits / Tout les joueurs: Propriétaire
        game.actors.get(token.actor.id).update({"ownership": {default: 3}});
      // action inverse du if
      } else {
        console.log("inCombat + hasPlayerOwner");
        console.log(game.actors.get(token.actor.id).hasPlayerOwner);
        // on repasse le PNJ comme propriété du seul MJ
        game.actors.get(token.actor.id).update({"ownership": {default: 0}});
      }
    }
  }
})

Hooks.on('combatTurn', () => {
  console.log('Combat Turn');
  const pj_template = game.actors.getName('_PJ_Template').id;
  const acteur = canvas.tokens.get(game.combat.nextCombatant.tokenId).actor;

  if(acteur.system.template===pj_template){
    console.log('PJ');
    acteur.roll('start_turn',{postMessage:true});
  }
  else{
    console.log('PNJ');
    acteur.roll('start_turn',{postMessage:true});
    setTimeout(() => {
      acteur.reloadTemplate();
      acteur.roll('atqs',{postMessage:false});
    }, 500);
    
  }
  })

Hooks.on('combatRound', () => {
  console.log('Combat Round');
  const pj_template = game.actors.getName('_PJ_Template').id;
  const acteur = canvas.tokens.get(game.combat.nextCombatant.tokenId).actor;

  if(acteur.system.template===pj_template){
    console.log('PJ');
    acteur.roll('start_turn',{postMessage:true});
  }
  else{
    console.log('PNJ');
    acteur.roll('start_turn',{postMessage:true});
    setTimeout(() => {
      acteur.reloadTemplate();
      acteur.roll('atqs',{postMessage:false});
    }, 500);
  }
})

Hooks.on('preDeleteCombat', () => {
  console.log('Fin de combat !');
  const pj_template = game.actors.getName('_PJ_Template').id;
  game.combat.combatants
    .forEach(element => {
      console.log(element.actorId);
      const acteur = game.actors.get(element.actorId);
      if(acteur.system.template===pj_template){
        console.log('PJ');
        acteur.roll('end_battle',{postMessage:false});
      }
      else{
        console.log('PNJ');
      }
    });
  
    // on parcourt tout les tokens de la scène
  for (let token of canvas.tokens.objects.children) {
    // si le token est associé à un combat (onglet Rencontres de combat)
    if (token.inCombat) {
    // si le token n'a pas de propriétaire parmi les joueurs: PNJ
      if (!game.actors.get(token.actor.id).hasPlayerOwner) {
        console.log("inCombat + !hasPlayerOwner");
        console.log(game.actors.get(token.actor.id).hasPlayerOwner);
        // on passe le PNJ comme propriété de tout les joueurs: Droits / Tout les joueurs: Propriétaire
        game.actors.get(token.actor.id).update({"ownership": {default: 3}});
      // action inverse du if
      } else {
        console.log("inCombat + hasPlayerOwner");
        console.log(game.actors.get(token.actor.id).hasPlayerOwner);
        // on repasse le PNJ comme propriété du seul MJ
        game.actors.get(token.actor.id).update({"ownership": {default: 0}});
      }
    }
  }
})
Hooks.once('setup', async function() {
	console.log("Initialisation Soumini Conditions");
    console.log(CONFIG.statusEffects);
    setupIcons();
    setupConditions();
});

function setupIcons() {
  let statuses = [
    {
        id: "death",
        name: "Mort",
        img: "icons/svg/skull.svg",
    },
    {
        id: "brulure",
        name: "Brûlure",
        img: "icons/svg/fire.svg",
    },
    {
        id: "malediction",
        name: "Malédiction",
        img: "icons/svg/stoned.svg",
    },
    {
        id: "saignement",
        name: "Saignement",
        img: "icons/svg/blood.svg",
    },
    {
        id: "barriere",
        name: "Barrière",
        img: "icons/svg/holy-shield.svg",
    },
    {
        id: "poison",
        name: "Poison",
        img: "icons/svg/poison.svg",
    },
    {
        id: "gel",
        name: "Gel",
        img: "icons/svg/frozen.svg",
    },
    {
        id: "charme",
        name: "Charme",
        img: "icons/svg/sun.svg",
    },
    {
        id: "fatigue",
        name: "Fatigue",
        img: "icons/svg/unconscious.svg",
    },
  ];

  if(CONFIG.statusEffects.length == statuses.length && CONFIG.statusEffects[1].id == statuses[1].id){
    console.log("PAS DE CHANGEMENT !");
  }
  else{
    console.log("CHANGEMENT DE STATUS!");
    CONFIG.statusEffects = statuses;
  };
};

function setupConditions(){
    let BURN = {
        changes: [
            { key: "brulures", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, priority: 0, value: "${%{return entity.entity.appliedEffects.find(e => e.name === 'Brûlure')?.flags.statuscounter.value;}%}$ "},
        ],
        name: "Brûlure",
        img: "icons/svg/fire.svg",
        disabled: false,
        type: "base",
        statuses: ["brulure"],
        description: "<p>Une brûlure inflige 1 dégât brut (les dégâts bruts ignore les défenses) au début du tour de jeu du joueur ou de l'ennemi.<br>Les brûlures sont cumulables, mais il est possible pour un joueur d'utiliser son action principale pour se soigner de toutes ses brûlures.<br><br>Les Brûlures disparaissent à la fin du combat.</p>",
    };
    /////////////////////////////////////
    let POISON = {
        changes: [
            { key: "poisons", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, priority: 0, value: "${%{return entity.entity.appliedEffects.find(e => e.name === 'Poison')?.flags.statuscounter.value;}%}$"},
        ],
        name: "Poison",
        img: "icons/svg/poison.svg",
        disabled: false,
        type: "base",
        statuses: ["poison"],
        description: "<p>Le poison inflige des dégâts bruts dépendant de la puissance de celui-ci. Les dégâts sont subits au début du tour de jeu du joueur ou de l'ennemi. Le poison est non cumulable, si un poison plus fort que celui-ci déjà subit est contracter, alors le poison plus puissant prend la relève du premier.<br/>Le poison n'est pas soigné à la fin d'un combat et peut-être contracter hors-combat. Hors-combat le poison inflige ses dégâts à chaque lancer de D du joueur. Le poison peut-être soigner contre finance chez un alchimiste ou un médecin.</p>",
    };
    /////////////////////////////////////
    let MALEDICTION = {
        changes: [
            { key: "malediction", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, priority: 0, value: "${%{return entity.entity.appliedEffects.find(e => e.name === 'Malédiction')?.flags.statuscounter.value;}%}$"},
        ],
        name: "Malédiction",
        img: "icons/svg/stoned.svg",
        disabled: false,
        type: "base",
        statuses: ["malediction"],
        description: "<p>La malédiction inflige 10 dégâts bruts en cas d'echec (1 au D) en combat. La malédiction est non cumulable. </p><p>La malédiction n'est pas soigner à la fin d'un combat et peut-être contracter hors-combat. Hors-combat la malédiction inflige ses dégâts à chaque fois qu'un jet de D détermine que le joueur échoue une de ses actions. </p><p></p><p>La malédiction peut-être soigner par un prêtre contre finance dans un lieu de culte.</p>",
    };
    /////////////////////////////////////
    let GEL = {
        changes: [
            { key: "gels", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, priority: 0, value: "${%{return entity.entity.appliedEffects.find(e => e.name === 'Gel')?.flags.statuscounter.value;}%}$"},
        ],
        name: "Gel",
        img: "icons/svg/frozen.svg",
        disabled: false,
        type: "base",
        statuses: ["gel"],
        description: "<p>Le gel double le prochain dégât subit (avant le calcul de la défense).</p><p>Le gel persiste jusqu'au prochain dégât subit. Le gèle est non cumulable et il est possible pour un joueur d'utiliser son action principale pour se soigner du gèle.</p><p>Le gèle disparaît à la fin du combat.</p>",
    };
    /////////////////////////////////////
    let BLOOD = {
        changes: [
            { key: "saignements", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, priority: 0, value: "${%{return entity.entity.appliedEffects.find(e => e.name === 'Saignement')?.flags.statuscounter.value;}%}$"},
        ],
        name: "Saignement",
        img: "icons/svg/blood.svg",
        disabled: false,
        type: "base",
        statuses: ["saignement"],
        description: "<p>Un saignement ajoute 1 dégât brut à tous les dégâts subis.</p><p>Les saignements sont cumulables. Les saignements s'ajoutent une fois aux dégâts de début de tour en cas d'empoisonnement et/ou de brûlure. </p><p>Les saignements disparaissent à la fin du combat.</p>",
    };
    /////////////////////////////////////
    let SHIELD = {
        changes: [
            { key: "barriere", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, priority: 0, value: "${%{return entity.entity.appliedEffects.find(e => e.name === 'Barrière')?.flags.statuscounter.value;}%}$"},
        ],
        name: "Barrière",
        img: "icons/svg/holy-shield.svg",
        disabled: false,
        type: "base",
        statuses: ["barriere"],
        description: "<p>La barrière annule tous les dégâts de la prochain attaque subit.</p><p>La barrière est non cumulable et persiste jusqu'au prochain dégât subit ou jusqu'au lever d'un nouveau jour.</p>",
    };
    /////////////////////////////////////
    let CHARMED = {
        changes: [
            { key: "charmes", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, priority: 0, value: "${%{return entity.entity.appliedEffects.find(e => e.name === 'Charme')?.flags.statuscounter.value;}%}$"},
        ],
        name: "Charme",
        img: "icons/svg/sun.svg",
        disabled: false,
        type: "base",
        statuses: ["charme"],
        description: "<p>Attaquer une cible charmer soigne 1pv.</p><p>Le charme n'est pas cumulable. Le charme disparaît a la fin du combat.</p>",
    };
    /////////////////////////////////////
    let SLEEP = {
        changes: [
            { key: "fatigue", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, priority: 0, value: "${%{return entity.entity.appliedEffects.find(e => e.name === 'Fatigue')?.flags.statuscounter.value;}%}$"},
        ],
        name: "Fatigue",
        img: "icons/svg/unconscious.svg",
        disabled: false,
        type: "base",
        statuses: ["fatigue"],
        description: "<p>La fatigue diminue de 1 la puissance de D de toutes les attaques du joueur. </p><p>Sur un ennemi attaquant plusieurs fois par tour, cela diminue la puissance d'un seul de ses D. La fatigue n'est pas cumulable et n'est pas soigner à la fin d'un combat.</p><p>La fatigue peut-être contractée hors-combat, le MJ peut donner un état fatigue au joueur s'il ne dort pas, saute plusieurs repas, est dans un environnement trop chaud, trop froid, etc...</p><p>Hors-combat la fatigue donne un malus D-10 à tous les jets du joueur. La fatigue est soignée après une nuit de sommeil complète.</p>",
    };
    /////////////////////////////////////
    const container = game.items.find(e=>e.type=="activeEffectContainer");
    
    if(container.effects.find(e=>e.name=='Brûlure')===undefined){container.createEmbeddedDocuments("ActiveEffect", [BURN]);};
    if(container.effects.find(e=>e.name=='Malédiction')===undefined){container.createEmbeddedDocuments("ActiveEffect", [MALEDICTION]);};
    if(container.effects.find(e=>e.name=='Saignement')===undefined){container.createEmbeddedDocuments("ActiveEffect", [BLOOD]);};
    if(container.effects.find(e=>e.name=='Barrière')===undefined){container.createEmbeddedDocuments("ActiveEffect", [SHIELD]);};
    if(container.effects.find(e=>e.name=='Poison')===undefined){container.createEmbeddedDocuments("ActiveEffect", [POISON]);};
    if(container.effects.find(e=>e.name=='Gel')===undefined){container.createEmbeddedDocuments("ActiveEffect", [GEL]);};
    if(container.effects.find(e=>e.name=='Charme')===undefined){container.createEmbeddedDocuments("ActiveEffect", [CHARMED]);};
    if(container.effects.find(e=>e.name=='Fatigue')===undefined){container.createEmbeddedDocuments("ActiveEffect", [SLEEP]);};
};
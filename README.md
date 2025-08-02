# Module permettant d'utiliser les fiches pour le système SOUMINI

----------------- Pour installer les templates -----------------------
1. importer le dossier Template se trouvant dans le compendium Templates_autres
2. importer l'item Newskill
3. importer l'item NewOM
4. importer le dossier Template se trouvant dans le compendium Templates_acteurs

----------------------- Pour créer un pj -----------------------------
1. Créer un acteur de type : character (Personnage en Français)
2. Choisir le template (modèle en Français) : _PJ_Template
3. Recharger le template

----------------------- Pour créer un pnj/mob ------------------------
1. Créer un acteur de type : character (Personnage en Français)
2. Choisir le template (modèle en Français) : _Bestiaire
3. Recharger le template


---------------- Pour ajouter une compétence à un PJ -----------------
1. Drag&Drop l'item NewSkill sur la fiche du PJ (ATTENTION NE PAS MODIFIER AVANT LE DRAG&DROP !)
2. Modifier la compétence pour mettre les stats de celle voulue



--------- Pour ajouter un objet magique ou familier à un PJ ----------
1. Drag&Drop l'item NewOM sur la fiche du PJ (ATTENTION NE PAS MODIFIER AVANT LE DRAG&DROP !)
2. Modifier l'item pour mettre les stats de l'objet ou fu familier voulu
3. possibilité de noter les bonus de stats, ... directement dans l'item pour les activer seulement si l'objet est activé
exemple
Masque végétal : augmente le SEN de 2

Dans les modificateurs d'objet:
Groupe : /
Prio : 0
Clé: sen
    pour trouver la clé d'une caractéristique, elles se trouvent dans le template en cliquant sur les formules en dessous du nom de la carac dans le sommaire
op: +
Formule: ${equipe?2:0}$
    si équipé augment de 2, sinon de 0



----------------------------------------------------------------------
* En début de tour : brûlures et poison automatisé

* Malédiction et Fatigue automatisées
* Lors d'une attaque sur un token ciblé: charme automatisé

* Si utilisation du bouton "Dégâts reçus":
    - Saignement, Barrière et Gel automatisé
    - Calcul Defenses, PV Armure et points de faiblesses automatique

* Dans le compendium macro:
    - Macro : Appliquer dégâts
        Si un token est selectionné et que la macro est lancée, produit le même effet que le bouton "Dégâts reçus". Fonctionne sur PJ et Bestiaire

* Dans les paramètres "Configure Settins" se trouve le paramètre "Auto Attaques bestiaire"
    Si activé, lance tous les dés d'attaques automatiquement du mob au début de son turn order s'il est encore en vie.

Bon jeu

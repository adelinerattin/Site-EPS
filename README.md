# Site-EPS

Site statique (HTML / CSS / JS pur, sans framework, sans base de données) destiné aux
élèves d'un collège : ressources EPS classées par niveau (6e à 3e), règlement général,
et un espace dédié à la vie de collégien pour la classe de 6e dont vous êtes professeure
principale.

## Arborescence du site

```
Site-EPS/
├── index.html                 Page d'accueil : présentation + filtre/recherche
├── eps-generale.html          Règlement, tenue, AS, dispenses
├── niveau-6e.html             7 activités de 6e
├── niveau-5e.html             5 activités de 5e
├── niveau-4e.html             5 activités de 4e
├── niveau-3e.html             6 activités de 3e
├── prof-principal-6e.html     Vie de collégien (ENT, mail, devoirs, contacts...)
├── css/
│   └── style.css              Feuille de style unique, commentée par section
├── js/
│   ├── main.js                Menu hamburger, onglets de rubrique, ouverture par ancre
│   ├── recherche.js            Recherche sur tout le site (bouton 🔍 de l'en-tête)
│   ├── historique.js           Mémoire locale des résultats (auto-évaluation + quiz)
│   ├── autoeval.js             Moteur générique d'auto-évaluation (note sur 20 + retour)
│   ├── futsal-calendrier.js    Calendrier de l'AS futsal
│   ├── filter.js               Filtre/recherche de la page d'accueil (non utilisé)
│   └── quiz.js                 Moteur générique des quiz (score + correction)
└── assets/                    Dossier prévu pour vos futures images/logos
```

Aucune dépendance externe (pas de CDN, pas de build, pas de npm) : le dossier peut être
ouvert directement dans un navigateur ou déployé tel quel.

## Ce qui est prêt à l'emploi

- Navigation complète, header sticky, menu hamburger sur mobile/tablette.
- **Recherche sur tout le site** : le bouton 🔍 de l'en-tête ouvre un champ qui parcourt
  toutes les rubriques de toutes les pages et renvoie directement au bon onglet.
  Aucun index à tenir à jour : il est reconstruit automatiquement à partir des pages
  (voir `js/recherche.js`, liste `PAGES` à compléter si vous ajoutez une page).
- **« L'essentiel en 3 points »** en tête de chaque fiche activité : l'objectif, la façon
  dont l'élève est évalué, et la clé pour progresser.
- **Historique local des résultats** : chaque score d'auto-évaluation et de quiz est
  conservé dans le navigateur de l'élève pour qu'il puisse comparer ses essais. Aucune
  donnée n'est envoyée sur Internet, aucun nom n'est demandé, l'enseignante n'y a pas
  accès, et l'élève peut tout effacer d'un bouton (voir `js/historique.js`).
- 23 fiches activité dépliables (une par activité, sur les 4 pages niveau), chacune avec
  ses rubriques (acquisitions, lexique, règlement, auto-évaluation, évaluation, quiz,
  attendus, et éventuellement vidéos de démonstration et évaluation diagnostique).
- **Rubrique Règlement = vidéo + texte** : la vidéo YouTube se lit directement dans la
  page (lecteur `youtube-nocookie` intégré, l'élève ne quitte pas le site), et tous les
  points du règlement sont aussi écrits en dessous pour ceux qui préfèrent lire.
  L'encart orange « 🏫 Au collège, on adapte » signale les règles officielles que nous
  modifions (effectif, temps de possession, barème…). Pour changer une vidéo, remplacez
  l'identifiant qui suit `/embed/` dans le HTML.
- 23 quiz interactifs, avec calcul du score et correction visuelle affichée à la fin.
  Les questions des activités à vidéo portent directement sur les points du règlement
  écrits juste au-dessus.
- Un mot type de dispense ponctuelle, prêt à être recopié et signé par les familles.

## Ce qu'il vous reste à personnaliser

Cherchez ces repères directement dans le code (Ctrl+F dans votre éditeur) :

| Repère à rechercher      | Ce qu'il faut faire |
|---------------------------|----------------------|
| `MODIFIER ICI`             | Coordonnées (footer), contacts, infos AS, ENT... |
| `LIEN VIDEO A AJOUTER`     | Remplacer `href="#"` par vos liens vidéo |
| `[à compléter]` / `[...]`  | Textes, contacts et barèmes à préciser |
| `QUIZ_DATA['...']`         | Modifier/ajouter des questions de quiz (voir js/quiz.js) |

### Ajouter ou modifier une question de quiz

Dans chaque page `niveau-XX.html`, juste avant la fin de chaque fiche activité, vous
trouverez un bloc `<script>` de ce type :

```js
window.QUIZ_DATA['handball-6e'] = [
  {
    question: "Combien de pas maximum sans dribbler ?",
    options: ["2 pas", "3 pas", "4 pas"],
    correct: 1   // index de la bonne réponse (0 = premier choix)
  },
  // ... ajoutez d'autres questions ici, séparées par une virgule
];
```

Il suffit de dupliquer un objet `{ question: ..., options: [...], correct: ... }` dans le
tableau pour ajouter une question. Le moteur de quiz (`js/quiz.js`) affiche automatiquement
tout ce que vous mettez dans ce tableau.

### Activer/désactiver la rubrique "Évaluation diagnostique"

Cette rubrique est optionnelle. Dans le HTML, elle apparaît sous cette forme :

```html
<section class="rubrique rubrique--optional">
  <h4>📋 Évaluation diagnostique</h4>
  <p>...</p>
</section>
```

- Pour la retirer d'une activité : supprimez ce bloc.
- Pour l'ajouter à une activité qui ne l'a pas : copiez ce même bloc depuis une activité
  qui l'a (ex. Triathlon athlétique en 6e), et modifiez son texte.

## Déployer sur Netlify (glisser-déposer, gratuit)

1. Rendez-vous sur [app.netlify.com](https://app.netlify.com) et créez un compte gratuit
   (ou connectez-vous).
2. Sur le tableau de bord, repérez la zone « Add new site » puis « Deploy manually »
   (glissez-déposez un dossier).
3. Glissez-déposez le dossier **Site-EPS** complet (celui qui contient `index.html`)
   dans la zone indiquée.
4. Netlify publie le site en quelques secondes et vous donne une adresse du type
   `https://nom-genere-au-hasard.netlify.app`.
5. Optionnel : dans « Site settings » → « Change site name », vous pouvez choisir une
   adresse plus lisible (ex. `eps-college-xxx.netlify.app`).

Pour mettre à jour le site plus tard : modifiez vos fichiers localement, puis glissez à
nouveau le dossier complet sur la même page Netlify (onglet "Deploys" → "Deploy manually").

## Déployer sur GitHub Pages (alternative gratuite)

1. Poussez le contenu du dossier sur un dépôt GitHub (déjà fait si vous lisez ceci depuis
   votre dépôt `site-eps`).
2. Sur GitHub : Settings → Pages → Source → choisissez la branche à publier
   (ex. `main`) et le dossier `/ (root)`.
3. GitHub vous donne une adresse du type `https://votre-compte.github.io/site-eps/`.

## Tester le site en local avant de le déployer

Vous pouvez simplement double-cliquer sur `index.html` pour l'ouvrir dans votre
navigateur. Toutes les fonctionnalités (menu, filtre, quiz) fonctionnent sans serveur.

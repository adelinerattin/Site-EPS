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
│   ├── main.js                Menu hamburger + lien de navigation actif
│   ├── filter.js               Filtre/recherche de la page d'accueil
│   └── quiz.js                 Moteur générique des quiz (score + correction)
└── assets/                    Dossier prévu pour vos futures images/logos
```

Aucune dépendance externe (pas de CDN, pas de build, pas de npm) : le dossier peut être
ouvert directement dans un navigateur ou déployé tel quel.

## Ce qui est prêt à l'emploi

- Navigation complète, header sticky, menu hamburger sur mobile/tablette.
- Filtre/recherche sur la page d'accueil (par mot-clé, niveau, activité) pour retrouver
  rapidement une ressource parmi les 23 activités.
- 23 fiches activité dépliables (une par activité, sur les 4 pages niveau), chacune avec
  ses 7 ou 8 rubriques (attendus, acquisitions, éventuelle évaluation diagnostique,
  règles d'arbitrage, quiz, vidéos, lexique, référentiel).
- 23 quiz interactifs fonctionnels (4 questions chacun), avec calcul du score et
  correction visuelle affichée à la fin. Ce sont des questions d'exemple : relisez-les et
  adaptez-les à vos propres règles de classe.
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

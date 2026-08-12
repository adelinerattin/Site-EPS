/* ============================================================
   autoeval.js — Moteur generique d'auto-evaluation
   ------------------------------------------------------------
   COMMENT AJOUTER / MODIFIER LES CRITERES ?
   Vous n'avez pas besoin de toucher ce fichier ! Les criteres de
   chaque activite sont stockes dans un petit bloc <script> juste
   a cote du composant, directement dans la page niveau-XX.html
   (cherchez "AUTOEVAL_DATA" avec Ctrl+F). Chaque critere suit ce
   modele, avec les 4 niveaux de maitrise de la grille officielle :

   {
     role: "Le joueur",
     critere: "Service reglementaire",
     tiers: [
       { label: "Maîtrise insuffisante", points: 1, desc: "Le service n'est pas reglementaire." },
       { label: "Maîtrise fragile", points: 2, desc: "Le service est reussi mais de facon aleatoire." },
       { label: "Maîtrise satisfaisante", points: 3, desc: "Le service est reglementaire." },
       { label: "Très bonne maîtrise", points: 4, desc: "Le service met l'adversaire en difficulte." }
     ]
   }

   Le champ "desc" (facultatif mais recommande) rappelle a l'eleve, en
   une phrase simple, ce qu'il doit etre capable de faire pour se
   situer a ce niveau — il s'affiche sous chaque puce pour l'aider a
   s'auto-evaluer.

   Ce fichier lit ces donnees, affiche 4 puces par critere (chaque
   role recoit automatiquement un fond gris different pour regrouper
   visuellement ses criteres), calcule le total de points choisis
   puis le convertit proportionnellement en note sur 20 (quel que
   soit le total reel de points de la grille source), et affiche le
   resultat.
   ============================================================ */

window.AUTOEVAL_DATA = window.AUTOEVAL_DATA || {};

document.addEventListener("DOMContentLoaded", function () {
  var dotClass = {
    "Maîtrise insuffisante": "insuffisante",
    "Maîtrise fragile": "fragile",
    "Maîtrise satisfaisante": "satisfaisante",
    "Très bonne maîtrise": "excellente",
    "Maîtrise très satisfaisante": "excellente"
  };

  function formatPoints(n) {
    var rounded = Math.round(n * 100) / 100;
    return String(rounded).replace(".", ",");
  }

  var containers = document.querySelectorAll(".autoeval[data-autoeval-id]");

  containers.forEach(function (container) {
    var autoevalId = container.getAttribute("data-autoeval-id");
    var criteria = window.AUTOEVAL_DATA[autoevalId];

    if (!criteria || !criteria.length) {
      container.innerHTML =
        '<p class="callout callout--neutral">Auto-évaluation à compléter : aucun critère n\'a encore été ajouté pour cette activité.</p>';
      return;
    }

    renderAutoeval(container, autoevalId, criteria);
  });

  function renderAutoeval(container, autoevalId, criteria) {
    var itemsWrap = container.querySelector(".autoeval-criteria");
    var submitBtn = container.querySelector(".autoeval-submit");
    var resultBox = container.querySelector(".autoeval-result");

    /* Attribue un indice de couleur (0, 1, 2...) a chaque role selon
       son ordre d'apparition, pour regrouper visuellement ses criteres. */
    var roleIndex = {};
    var nextRoleIndex = 0;
    criteria.forEach(function (c) {
      if (!(c.role in roleIndex)) {
        roleIndex[c.role] = nextRoleIndex % 5;
        nextRoleIndex++;
      }
    });

    var html = "";
    criteria.forEach(function (c, cIndex) {
      html += '<div class="autoeval-item autoeval-item--role-' + roleIndex[c.role] + '" data-item-index="' + cIndex + '">';
      html +=
        '<p class="autoeval-item__title"><span class="autoeval-item__role">' +
        c.role +
        "</span> — " +
        c.critere +
        "</p>";
      html += '<ul class="autoeval-options">';
      c.tiers.forEach(function (tier, tIndex) {
        var inputId = autoevalId + "-c" + cIndex + "-t" + tIndex;
        var dot = dotClass[tier.label] || "insuffisante";
        html +=
          "<li>" +
          '<label class="autoeval-option" for="' + inputId + '">' +
          '<input type="radio" id="' + inputId + '" name="' + autoevalId + "-c" + cIndex + '" value="' + tier.points + '">' +
          '<span class="autoeval-option__head">' +
          '<span class="autoeval-option__dot autoeval-option__dot--' + dot + '" aria-hidden="true"></span>' +
          "<span>" + tier.label + "</span>" +
          "</span>" +
          (tier.desc ? '<span class="autoeval-option__desc">' + tier.desc + "</span>" : "") +
          "</label>" +
          "</li>";
      });
      html += "</ul>";
      html += "</div>";
    });
    itemsWrap.innerHTML = html;

    itemsWrap.querySelectorAll(".autoeval-item").forEach(function (item) {
      var labels = item.querySelectorAll(".autoeval-option");
      labels.forEach(function (label) {
        var input = label.querySelector("input");
        input.addEventListener("change", function () {
          labels.forEach(function (l) {
            l.classList.remove("is-selected");
          });
          label.classList.add("is-selected");
        });
      });
    });

    submitBtn.addEventListener("click", function () {
      var totalMax = 0;
      var totalObtained = 0;
      var allAnswered = true;

      criteria.forEach(function (c, cIndex) {
        var maxTier = c.tiers[c.tiers.length - 1].points;
        totalMax += maxTier;

        var selected = itemsWrap.querySelector(
          '.autoeval-item[data-item-index="' + cIndex + '"] input[type=radio]:checked'
        );
        if (!selected) {
          allAnswered = false;
          return;
        }
        totalObtained += parseFloat(selected.value);
      });

      if (!allAnswered) {
        resultBox.hidden = false;
        resultBox.textContent = "Choisis un niveau de maîtrise pour chaque critère avant de calculer ton score.";
        return;
      }

      var noteSur20 = totalMax > 0 ? Math.round((totalObtained / totalMax) * 20 * 2) / 2 : 0;

      /* Retour a l'eleve : on classe les criteres selon le niveau
         choisi pour lui dire ce qu'il maitrise et ce qu'il peut encore
         travailler en priorite. */
      var forts = [];
      var aTravailler = [];
      criteria.forEach(function (c, cIndex) {
        var selected = itemsWrap.querySelector(
          '.autoeval-item[data-item-index="' + cIndex + '"] input[type=radio]:checked'
        );
        if (!selected) return;
        var tierIndex = c.tiers.findIndex(function (t) {
          return String(t.points) === selected.value;
        });
        /* "eleve" = le critere reformule pour etre lu par un collegien
           (voir AUTOEVAL_DATA dans la page). On retombe sur "critere"
           si ce champ n'a pas encore ete renseigne. */
        var libelle = (c.eleve || c.critere) + " <em>(" + c.role + ")</em>";
        if (tierIndex >= 2) {
          forts.push(libelle);
        } else {
          /* Le niveau juste au-dessus indique la prochaine etape. */
          var suivant = c.tiers[Math.min(tierIndex + 1, c.tiers.length - 1)];
          aTravailler.push({ libelle: libelle, objectif: suivant && suivant.desc ? suivant.desc : "" });
        }
      });

      var html =
        "Note estimée : " + formatPoints(noteSur20) + " / 20" +
        '<span class="autoeval-result__detail">' +
        formatPoints(totalObtained) + " / " + formatPoints(totalMax) + " points cumulés sur les critères ci-dessus" +
        "</span>";

      /* Petit mot d'encouragement, adapte au score obtenu. */
      var encouragement;
      if (noteSur20 >= 16) {
        encouragement = "🌟 Bravo, tu maîtrises déjà presque tout ! Vise les derniers points ci-dessous.";
      } else if (noteSur20 >= 12) {
        encouragement = "👍 Bon travail ! Tu es sur la bonne voie, il te reste quelques points à travailler.";
      } else if (noteSur20 >= 8) {
        encouragement = "💪 C'est un bon début. Choisis 1 ou 2 points ci-dessous et entraîne-toi dessus.";
      } else {
        encouragement = "🙂 Ne te décourage pas : commence par travailler un seul point à la fois.";
      }
      html += '<p class="autoeval-result__encouragement">' + encouragement + "</p>";

      html += '<div class="autoeval-feedback">';
      if (forts.length) {
        html += '<div class="autoeval-feedback__block autoeval-feedback__block--fort">';
        html += "<p><strong>✅ Ce que tu sais déjà faire</strong></p><ul>";
        forts.forEach(function (f) { html += "<li>" + f + "</li>"; });
        html += "</ul></div>";
      }
      if (aTravailler.length) {
        html += '<div class="autoeval-feedback__block autoeval-feedback__block--progres">';
        html += "<p><strong>🎯 Ce que tu peux encore travailler</strong></p><ul>";
        aTravailler.forEach(function (f) {
          html += "<li>" + f.libelle + (f.objectif ? '<span class="autoeval-feedback__goal">👉 Ton prochain objectif : ' + f.objectif + "</span>" : "") + "</li>";
        });
        html += "</ul></div>";
      }
      if (!aTravailler.length) {
        html += '<p class="autoeval-feedback__bravo">🏆 Bravo, tu te situes au bon niveau sur tous les critères !</p>';
      }
      html += "</div>";

      resultBox.hidden = false;
      resultBox.innerHTML = html;

      /* Memoire locale : on garde la trace de l'essai pour que
         l'eleve puisse se comparer a ses tentatives precedentes
         (voir js/historique.js). */
      if (window.EPSHistorique) {
        window.EPSHistorique.ajouter("autoeval", autoevalId, { note: noteSur20, sur: 20 });
        window.EPSHistorique.afficher(
          window.EPSHistorique.conteneurApres(resultBox, "autoeval", autoevalId),
          "autoeval",
          autoevalId
        );
      }
    });

    /* A l'ouverture de la page, on reaffiche les essais deja enregistres. */
    if (window.EPSHistorique) {
      window.EPSHistorique.afficher(
        window.EPSHistorique.conteneurApres(resultBox, "autoeval", autoevalId),
        "autoeval",
        autoevalId
      );
    }
  }
});

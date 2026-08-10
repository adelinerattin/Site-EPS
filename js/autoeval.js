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
       { label: "Maîtrise insuffisante", points: 1 },
       { label: "Maîtrise fragile", points: 2 },
       { label: "Maîtrise satisfaisante", points: 3 },
       { label: "Très bonne maîtrise", points: 4 }
     ]
   }

   Ce fichier lit ces donnees, affiche 4 puces par critere, calcule
   le total de points choisis puis le convertit proportionnellement
   en note sur 20 (quel que soit le total reel de points de la
   grille source), et affiche le resultat.
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

    var html = "";
    criteria.forEach(function (c, cIndex) {
      html += '<div class="autoeval-item" data-item-index="' + cIndex + '">';
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
          '<span class="autoeval-option__dot autoeval-option__dot--' + dot + '" aria-hidden="true"></span>' +
          "<span>" + tier.label + "</span>" +
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

      resultBox.hidden = false;
      resultBox.innerHTML =
        "Note estimée : " + formatPoints(noteSur20) + " / 20" +
        '<span class="autoeval-result__detail">' +
        formatPoints(totalObtained) + " / " + formatPoints(totalMax) + " points cumulés sur les critères ci-dessus" +
        "</span>";
    });
  }
});

/* ============================================================
   futsal-calendrier.js — Affichage du calendrier de l'AS Futsal
   ------------------------------------------------------------
   COMMENT AJOUTER UN EVENEMENT ?
   Vous n'avez pas besoin de toucher ce fichier ! Modifiez le
   tableau FUTSAL_CALENDRIER directement dans as-futsal.html
   (cherchez "FUTSAL_CALENDRIER" avec Ctrl+F). Chaque evenement
   suit ce modele :

   { date: "2026-09-15", titre: "Entraînement", lieu: "Gymnase du collège", type: "entrainement" }

   - date : format AAAA-MM-JJ (permet le tri automatique du plus
     proche au plus lointain)
   - type : "entrainement", "competition" ou "date-importante"
     (determine la couleur de la puce a gauche de la ligne)
   - lieu : facultatif

   Ce fichier lit ce tableau, le trie par date et affiche la liste.
   Si le tableau est vide, un message "Calendrier à venir" s'affiche
   a la place.
   ============================================================ */

window.FUTSAL_CALENDRIER = window.FUTSAL_CALENDRIER || [];

document.addEventListener("DOMContentLoaded", function () {
  var list = document.getElementById("calendrier-liste");
  var emptyMsg = document.getElementById("calendrier-vide");
  if (!list) return;

  var events = window.FUTSAL_CALENDRIER.slice().sort(function (a, b) {
    return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
  });

  if (!events.length) {
    list.hidden = true;
    if (emptyMsg) emptyMsg.hidden = false;
    return;
  }

  list.hidden = false;
  if (emptyMsg) emptyMsg.hidden = true;

  var typeLabels = {
    entrainement: "Entraînement",
    competition: "Compétition",
    "date-importante": "Date importante"
  };

  var html = "";
  events.forEach(function (ev) {
    var dateObj = new Date(ev.date + "T00:00:00");
    var dateFormatted = isNaN(dateObj.getTime())
      ? ev.date
      : dateObj.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
    var typeClass = "calendar-item--" + (ev.type || "entrainement");
    var typeLabel = typeLabels[ev.type] || "";

    html +=
      '<li class="calendar-item ' + typeClass + '">' +
      '<span class="calendar-item__date">' + dateFormatted + "</span>" +
      '<span class="calendar-item__body">' +
      '<span class="calendar-item__title">' + ev.titre + "</span>" +
      '<span class="calendar-item__meta">' + typeLabel + (ev.lieu ? " — " + ev.lieu : "") + "</span>" +
      "</span>" +
      "</li>";
  });

  list.innerHTML = html;
});

/* ============================================================
   main.js — Comportements communs a toutes les pages
   ------------------------------------------------------------
   - Ouverture / fermeture du menu hamburger sur mobile
   - Mise en surbrillance du lien de navigation de la page en cours
   - Ouverture automatique d'une fiche <details> visee par une ancre
   Ce fichier est charge sur CHAQUE page via <script src="js/main.js" defer>.
   ============================================================ */

/* Ouvre une fiche activity-card / info-card si on arrive sur son ancre
   (#id) : au chargement de la page (lien venant d'une autre page), ET
   quand on clique un lien d'ancre sur la page elle-meme (ex. menu
   rapide "quick-nav"), qui ne recharge pas la page. */
function openDetailsFromHash() {
  if (!window.location.hash) return;
  var targetEl = document.getElementById(window.location.hash.slice(1));
  var targetDetails = targetEl && targetEl.closest ? targetEl.closest("details") : null;
  if (targetDetails) {
    targetDetails.open = true;
  }
}

window.addEventListener("hashchange", openDetailsFromHash);

document.addEventListener("DOMContentLoaded", function () {
  openDetailsFromHash();

  /* --- Menu hamburger ------------------------------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    /* Ferme le menu automatiquement quand on clique un lien (mobile) */
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* --- Lien actif dans la navigation ------------------------
     Compare le nom du fichier de la page actuelle avec le href
     de chaque lien du menu, et ajoute aria-current="page". */
  var currentFile = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".main-nav__list a").forEach(function (link) {
    var linkFile = link.getAttribute("href").split("/").pop();
    if (linkFile === currentFile) {
      link.setAttribute("aria-current", "page");
    }
  });
});

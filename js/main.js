/* ============================================================
   main.js — Comportements communs a toutes les pages
   ------------------------------------------------------------
   - Ouverture / fermeture du menu hamburger sur mobile
   - Mise en surbrillance du lien de navigation de la page en cours
   Ce fichier est charge sur CHAQUE page via <script src="js/main.js" defer>.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
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

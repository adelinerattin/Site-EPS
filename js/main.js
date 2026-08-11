/* ============================================================
   main.js — Comportements communs a toutes les pages
   ------------------------------------------------------------
   - Ouverture / fermeture du menu hamburger sur mobile
   - Mise en surbrillance du lien de navigation de la page en cours
   - Ouverture automatique d'une fiche <details> visee par une ancre
   Ce fichier est charge sur CHAQUE page via <script src="js/main.js" defer>.
   ============================================================ */

/* Onglets de rubrique dans une activity-card : evite d'empiler
   toutes les rubriques (attendus, regles, quiz...) et affiche une
   seule rubrique a la fois, choisie via une puce ".rubrique-tab".
   Chaque bouton porte aria-controls="id-de-la-rubrique-visee". */
function initRubriqueTabs() {
  document.querySelectorAll(".rubrique-tabs").forEach(function (tabs) {
    var buttons = Array.prototype.slice.call(tabs.querySelectorAll(".rubrique-tab"));
    var panels = buttons.map(function (btn) {
      return document.getElementById(btn.getAttribute("aria-controls"));
    });

    function activate(index) {
      buttons.forEach(function (btn, i) {
        btn.setAttribute("aria-selected", i === index ? "true" : "false");
      });
      panels.forEach(function (panel, i) {
        if (panel) panel.hidden = i !== index;
      });
    }

    buttons.forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        activate(index);
      });
    });

    activate(0);

    /* Expose pour openDetailsFromHash : permet d'activer directement
       le bon onglet quand on arrive via un lien d'ancre precis. */
    tabs._epsActivate = activate;
    tabs._epsPanels = panels;
  });
}

/* Ouvre une fiche activity-card / info-card si on arrive sur son ancre
   (#id) : au chargement de la page (lien venant d'une autre page), ET
   quand on clique un lien d'ancre sur la page elle-meme (ex. menu
   rapide "quick-nav"), qui ne recharge pas la page. Si l'ancre vise
   directement une rubrique gerée par des onglets, active aussi cet
   onglet pour eviter d'arriver sur un panneau masque. */
function openDetailsFromHash() {
  if (!window.location.hash) return;
  var targetEl = document.getElementById(window.location.hash.slice(1));
  if (!targetEl) return;

  var targetDetails = targetEl.closest ? targetEl.closest("details") : null;
  if (targetDetails) {
    targetDetails.open = true;
  }

  var body = targetEl.closest ? targetEl.closest(".activity-card__body, .info-card__body") : null;
  var tabs = body ? body.querySelector(".rubrique-tabs") : null;
  if (tabs && tabs._epsPanels) {
    var index = tabs._epsPanels.indexOf(targetEl);
    if (index !== -1) tabs._epsActivate(index);
  }
}

window.addEventListener("hashchange", openDetailsFromHash);

document.addEventListener("DOMContentLoaded", function () {
  initRubriqueTabs();
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

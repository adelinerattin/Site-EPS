/* ============================================================
   hero-nav.js — Navigation par boutons dans la zone hero (accueil)
   ------------------------------------------------------------
   Chaque bouton ".hero-nav__tab" correspond a un panneau
   ".hero-nav__panel" (meme valeur dans data-target / data-panel).
   Cliquer sur un bouton affiche son panneau et masque les autres.
   Recliquer sur le bouton deja actif referme le panneau.

   Ce fichier n'a rien a modifier si vous ajoutez/retirez une page :
   il suffit d'ajouter le bouton + le panneau correspondant dans
   index.html avec les memes data-target / data-panel.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  var tabs = document.querySelectorAll(".hero-nav__tab");
  var panels = document.querySelectorAll(".hero-nav__panel");

  if (!tabs.length) return; // pas sur la page d'accueil

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-target");
      var isAlreadyOpen = tab.getAttribute("aria-selected") === "true";

      /* Ferme tous les onglets/panneaux */
      tabs.forEach(function (t) {
        t.setAttribute("aria-selected", "false");
      });
      panels.forEach(function (p) {
        p.hidden = true;
      });

      /* Si l'onglet clique n'etait pas deja ouvert, on l'ouvre */
      if (!isAlreadyOpen) {
        tab.setAttribute("aria-selected", "true");
        var panel = document.querySelector('.hero-nav__panel[data-panel="' + target + '"]');
        if (panel) {
          panel.hidden = false;
          panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    });
  });
});

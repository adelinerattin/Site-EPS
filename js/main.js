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


/* ============================================================
   AFFICHAGE EN ONGLETS SUR ORDINATEUR (page "Mon entree en 6e")
   ------------------------------------------------------------
   Sur grand ecran (1200px et plus), chaque grande rubrique de la
   page devient UNE seule fiche depliable, et ses sous-rubriques
   deviennent des onglets — exactement comme les activites des
   pages de niveau.

   Le HTML de la page n'est pas duplique : c'est la meme page pour
   tout le monde, simplement reorganisee ici au chargement. En
   dessous de 1200px (telephone et tablette), cette fonction ne
   fait rien du tout et la page garde sa presentation en fiches
   depliables independantes.

   Le libelle de chaque onglet est lu dans l'attribut
   data-onglet="..." de la sous-rubrique correspondante.
   ============================================================ */
var LARGEUR_ORDINATEUR = "(min-width: 1200px)";

function transformerEnOnglets() {
  if (!window.matchMedia || !window.matchMedia(LARGEUR_ORDINATEUR).matches) return;

  var groupes = document.querySelectorAll(".info-group, .espace-parents");
  if (!groupes.length) return;

  groupes.forEach(function (groupe) {
    var parents = groupe.classList.contains("espace-parents");
    var cartes = [];
    groupe.querySelectorAll(":scope > details.info-card").forEach(function (d) {
      cartes.push(d);
    });
    if (!cartes.length) return;

    var titreEl = groupe.querySelector("h2, .espace-parents__label");
    var titre = titreEl ? titreEl.textContent.trim() : "";
    var intro = groupe.querySelector(".info-group__intro");

    var corps = document.createElement("div");
    corps.className = "activity-card__body";
    if (intro && !parents) corps.appendChild(intro);

    /* Une seule sous-rubrique : pas de barre d'onglets. */
    var avecOnglets = cartes.length > 1;
    var barre = null;
    if (avecOnglets) {
      barre = document.createElement("div");
      barre.className = "rubrique-tabs";
      barre.setAttribute("role", "tablist");
      barre.setAttribute("aria-label", "Sous-rubriques : " + titre);
      corps.appendChild(barre);
    }

    cartes.forEach(function (carte) {
      var id = carte.id;
      var libelle = carte.getAttribute("data-onglet") || "";
      var titreCarte = carte.querySelector("summary h3");
      var contenu = carte.querySelector(".info-card__body");

      var panneau = document.createElement("section");
      panneau.className = "rubrique";
      if (id) panneau.id = id;

      var h4 = document.createElement("h4");
      h4.textContent = titreCarte ? titreCarte.textContent.trim() : libelle;
      panneau.appendChild(h4);

      if (contenu) {
        while (contenu.firstChild) panneau.appendChild(contenu.firstChild);
      }
      corps.appendChild(panneau);

      if (avecOnglets) {
        var bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "rubrique-tab";
        bouton.setAttribute("role", "tab");
        if (id) bouton.setAttribute("aria-controls", id);
        bouton.textContent = libelle || h4.textContent;
        barre.appendChild(bouton);
      }
    });

    /* Chaque rubrique devient une fiche depliable, comme les activites
       des pages de niveau. */
    var fiche = document.createElement("details");
    fiche.className = "activity-card activity-card--rubrique";
    if (groupe.id) {
      /* L'ancre du sommaire doit viser la fiche elle-meme, sinon un clic
         sur le bouton correspondant ne l'ouvre pas. */
      fiche.id = groupe.id;
      if (parents) groupe.removeAttribute("id");
    }

    var resume = document.createElement("summary");
    var h3 = document.createElement("h3");
    h3.textContent = titre;
    resume.appendChild(h3);
    var plus = document.createElement("span");
    plus.className = "activity-card__toggle";
    plus.setAttribute("aria-hidden", "true");
    plus.textContent = "+";
    resume.appendChild(plus);

    fiche.appendChild(resume);
    fiche.appendChild(corps);

    if (parents) {
      /* L'espace parents garde son cadre creme, mais son en-tete est
         repris par le titre de la fiche : pas de titre en double, et la
         rubrique se referme comme les autres. */
      var presentation = groupe.querySelector(".espace-parents__intro");
      if (presentation) corps.insertBefore(presentation, corps.firstChild);
      var entete = groupe.querySelector(".espace-parents__entete");
      if (entete) entete.remove();
      cartes.forEach(function (carte) { carte.remove(); });
      groupe.appendChild(fiche);
    } else {
      groupe.replaceWith(fiche);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  transformerEnOnglets();
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

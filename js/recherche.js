/* ============================================================
   recherche.js — Moteur de recherche du site
   ------------------------------------------------------------
   COMMENT CA MARCHE ?
   Il n'y a AUCUN index a tenir a jour. Au premier usage, le
   navigateur telecharge les pages du site listees ci-dessous,
   les lit et en extrait automatiquement chaque rubrique (les
   onglets des fiches d'activite, les fiches depliables des
   autres pages). L'index est ensuite garde en memoire le temps
   de la visite (sessionStorage).
   => Si vous modifiez le texte d'une rubrique, la recherche est
      a jour toute seule. Si vous AJOUTEZ une page au site,
      ajoutez-la simplement dans la liste PAGES ci-dessous.

   Le champ de recherche et le panneau de resultats sont crees
   par ce fichier : rien a ajouter dans le HTML des pages.
   ============================================================ */

(function () {
  var PAGES = [
    { f: "index.html", n: "Accueil" },
    { f: "eps-generale.html", n: "Fonctionnement de l'EPS" },
    { f: "niveau-6e.html", n: "6ème" },
    { f: "niveau-5e.html", n: "5ème" },
    { f: "niveau-4e.html", n: "4ème" },
    { f: "niveau-3e.html", n: "3ème" },
    { f: "culture-sportive.html", n: "Culture Sportive" },
    { f: "as-futsal.html", n: "AS Futsal" },
    { f: "prof-principal-6e.html", n: "Mon entrée en 6ème" }
  ];

  var CLE_CACHE = "eps-recherche-index-v1";
  var MAX_RESULTATS = 20;

  /* Minuscules + suppression des accents, pour que "echauffement"
     trouve "échauffement" et inversement. */
  function normaliser(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function texte(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function echapper(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ----------------------------------------------------------
     Extraction des blocs de contenu d'une page
     ---------------------------------------------------------- */
  function extraire(doc, page) {
    var entrees = [];

    function ajouter(titre, contexte, ancre, contenu) {
      if (!contenu) return;
      entrees.push({
        p: page.f,
        n: page.n,
        t: titre,
        c: contexte,
        a: ancre || "",
        x: contenu.slice(0, 4000)
      });
    }

    /* --- Fiches d'activite (pages de niveau) --- */
    doc.querySelectorAll("details.activity-card").forEach(function (carte) {
      var h = carte.querySelector("summary h3");
      var titreActivite = h ? texte(h).replace(/^\d+\.\s*/, "") : "Activité";
      var rubriques = carte.querySelectorAll("section.rubrique");

      if (rubriques.length) {
        rubriques.forEach(function (r) {
          var h4 = r.querySelector("h4");
          ajouter(
            h4 ? texte(h4) : titreActivite,
            titreActivite,
            r.id || carte.id,
            texte(r)
          );
        });
      } else {
        ajouter(titreActivite, page.n, carte.id, texte(carte));
      }

      /* L'encart "L'essentiel en 3 points" est hors onglets. */
      var essentiel = carte.querySelector(".essentiel");
      if (essentiel) {
        ajouter("⭐ L'essentiel en 3 points", titreActivite, carte.id, texte(essentiel));
      }
    });

    /* --- Fiches depliables des autres pages --- */
    doc.querySelectorAll("details.info-card").forEach(function (carte) {
      var h = carte.querySelector("summary h2, summary h3");
      var titre = h ? texte(h) : "Rubrique";
      var rubriques = carte.querySelectorAll("section.rubrique");

      if (rubriques.length) {
        rubriques.forEach(function (r) {
          var h4 = r.querySelector("h4");
          ajouter(h4 ? texte(h4) : titre, titre, r.id || carte.id, texte(r));
        });
      } else {
        ajouter(titre, page.n, carte.id, texte(carte));
      }
    });

    /* --- Page d'accueil : les encarts de presentation --- */
    doc.querySelectorAll(".feature-card").forEach(function (carte) {
      var h = carte.querySelector("h3, h2");
      ajouter(h ? texte(h) : "Présentation", page.n, "", texte(carte));
    });

    return entrees;
  }

  /* ----------------------------------------------------------
     Construction (et mise en cache) de l'index
     ---------------------------------------------------------- */
  var indexPromesse = null;

  function chargerIndex() {
    if (indexPromesse) return indexPromesse;

    try {
      var cache = window.sessionStorage.getItem(CLE_CACHE);
      if (cache) {
        var donnees = JSON.parse(cache);
        if (donnees && donnees.length) {
          indexPromesse = Promise.resolve(donnees);
          return indexPromesse;
        }
      }
    } catch (e) {
      /* pas de cache disponible : on reconstruit */
    }

    var parseur = new DOMParser();
    var pageCourante = window.location.pathname.split("/").pop() || "index.html";

    indexPromesse = Promise.all(
      PAGES.map(function (page) {
        /* La page affichee est deja en memoire : inutile de la retelecharger. */
        if (page.f === pageCourante) {
          return Promise.resolve(extraire(document, page));
        }
        return fetch(page.f)
          .then(function (r) {
            if (!r.ok) throw new Error(r.status);
            return r.text();
          })
          .then(function (html) {
            return extraire(parseur.parseFromString(html, "text/html"), page);
          })
          .catch(function () {
            return [];
          });
      })
    ).then(function (listes) {
      var tout = [];
      listes.forEach(function (l) {
        tout = tout.concat(l);
      });
      tout.forEach(function (e) {
        e.nt = normaliser(e.t + " " + e.c + " " + e.n);
        e.nx = normaliser(e.x);
      });
      try {
        window.sessionStorage.setItem(CLE_CACHE, JSON.stringify(tout));
      } catch (e) {
        /* quota depasse : on garde l'index en memoire seulement */
      }
      return tout;
    });

    return indexPromesse;
  }

  /* ----------------------------------------------------------
     Recherche + classement
     ---------------------------------------------------------- */
  function chercher(index, requete) {
    var mots = normaliser(requete).split(/\s+/).filter(Boolean);
    if (!mots.length) return [];

    var resultats = [];
    index.forEach(function (e) {
      var score = 0;
      var tousPresents = true;

      mots.forEach(function (mot) {
        var dansTitre = e.nt.indexOf(mot) !== -1;
        var dansTexte = e.nx.indexOf(mot) !== -1;
        if (!dansTitre && !dansTexte) {
          tousPresents = false;
          return;
        }
        if (dansTitre) score += 10;
        if (dansTexte) score += 1;
      });

      if (tousPresents) resultats.push({ e: e, s: score, mot: mots[0] });
    });

    resultats.sort(function (a, b) {
      return b.s - a.s;
    });
    return resultats.slice(0, MAX_RESULTATS);
  }

  /* Extrait un court passage autour du premier mot trouve, avec le
     mot mis en valeur. */
  function extrait(e, mot) {
    var pos = e.nx.indexOf(mot);
    if (pos === -1) return echapper(e.x.slice(0, 150)) + "…";
    var debut = Math.max(0, pos - 60);
    var morceau = e.x.slice(debut, debut + 170);
    var html = echapper(morceau);
    var posLocale = pos - debut;
    if (posLocale >= 0) {
      /* On re-decoupe sur le texte echappe en se servant de la longueur
         du prefixe echappe, pour ne pas casser les entites HTML. */
      var avant = echapper(morceau.slice(0, posLocale));
      var trouve = echapper(morceau.slice(posLocale, posLocale + mot.length));
      var apres = echapper(morceau.slice(posLocale + mot.length));
      html = avant + "<mark>" + trouve + "</mark>" + apres;
    }
    return (debut > 0 ? "… " : "") + html + "…";
  }

  /* ----------------------------------------------------------
     Interface : bouton dans l'en-tete + panneau de resultats
     ---------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var entete = document.querySelector(".site-header__inner");
    if (!entete) return;

    var bouton = document.createElement("button");
    bouton.type = "button";
    bouton.className = "search-open";
    bouton.setAttribute("aria-expanded", "false");
    bouton.innerHTML = '<span aria-hidden="true">🔍</span><span class="search-open__label">Rechercher</span>';
    entete.appendChild(bouton);

    var panneau = document.createElement("div");
    panneau.className = "search-panel";
    panneau.hidden = true;
    panneau.innerHTML =
      '<div class="search-panel__box" role="dialog" aria-modal="true" aria-label="Recherche sur le site">' +
      '  <div class="search-panel__head">' +
      '    <label class="visually-hidden" for="site-search-input">Rechercher sur le site</label>' +
      '    <input type="search" id="site-search-input" class="search-panel__input" placeholder="Ex : échauffement, arbitre, tenue, smash…" autocomplete="off">' +
      '    <button type="button" class="search-panel__close" aria-label="Fermer la recherche">✕</button>' +
      "  </div>" +
      '  <p class="search-panel__hint">Tape au moins 2 lettres. La recherche parcourt toutes les pages du site.</p>' +
      '  <div class="search-panel__results" aria-live="polite"></div>' +
      "</div>";
    document.body.appendChild(panneau);

    var champ = panneau.querySelector(".search-panel__input");
    var zone = panneau.querySelector(".search-panel__results");
    var indice = panneau.querySelector(".search-panel__hint");

    function ouvrir() {
      panneau.hidden = false;
      bouton.setAttribute("aria-expanded", "true");
      document.body.classList.add("search-open-body");
      champ.focus();
      champ.select();
      chargerIndex();
    }

    function fermer() {
      panneau.hidden = true;
      bouton.setAttribute("aria-expanded", "false");
      document.body.classList.remove("search-open-body");
      bouton.focus();
    }

    bouton.addEventListener("click", ouvrir);
    panneau.querySelector(".search-panel__close").addEventListener("click", fermer);
    panneau.addEventListener("click", function (ev) {
      if (ev.target === panneau) fermer();
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape" && !panneau.hidden) fermer();
    });

    var minuterie = null;
    champ.addEventListener("input", function () {
      window.clearTimeout(minuterie);
      minuterie = window.setTimeout(lancer, 180);
    });

    function lancer() {
      var requete = champ.value.trim();
      if (requete.length < 2) {
        zone.innerHTML = "";
        indice.textContent = "Tape au moins 2 lettres. La recherche parcourt toutes les pages du site.";
        return;
      }
      indice.textContent = "Recherche en cours…";
      chargerIndex().then(function (index) {
        /* L'eleve a pu continuer a taper pendant le chargement. */
        if (champ.value.trim() !== requete) return;
        afficher(chercher(index, requete), requete);
      });
    }

    function afficher(resultats, requete) {
      if (!resultats.length) {
        indice.textContent = "Aucun résultat pour « " + requete + " ».";
        zone.innerHTML =
          '<p class="search-panel__empty">Essaie un autre mot, ou un mot plus court (par exemple « arbitre » plutôt que « arbitrage »).</p>';
        return;
      }

      indice.textContent =
        resultats.length + (resultats.length > 1 ? " résultats" : " résultat") + " pour « " + requete + " »";

      var html = '<ul class="search-results">';
      resultats.forEach(function (r) {
        var url = r.e.p + (r.e.a ? "#" + r.e.a : "");
        html +=
          '<li class="search-result">' +
          '<a href="' + url + '">' +
          '<span class="search-result__page">' + echapper(r.e.n) + (r.e.c && r.e.c !== r.e.n ? " › " + echapper(r.e.c) : "") + "</span>" +
          '<span class="search-result__title">' + echapper(r.e.t) + "</span>" +
          '<span class="search-result__snippet">' + extrait(r.e, r.mot) + "</span>" +
          "</a></li>";
      });
      html += "</ul>";
      zone.innerHTML = html;

      /* Si le lien pointe vers la page deja ouverte, le changement de
         hash ne recharge pas la page : on ferme le panneau pour que
         l'eleve voie la rubrique s'ouvrir. */
      zone.querySelectorAll("a").forEach(function (lien) {
        lien.addEventListener("click", fermer);
      });
    }
  });
})();

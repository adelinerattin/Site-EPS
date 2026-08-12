/* ============================================================
   historique.js — Memoire locale des resultats de l'eleve
   ------------------------------------------------------------
   A QUOI CA SERT ?
   Chaque fois qu'un eleve calcule son score d'auto-evaluation ou
   valide un quiz, le resultat est conserve pour qu'il puisse
   COMPARER ses essais dans le temps ("la derniere fois j'avais
   11/20, aujourd'hui j'ai 14/20").

   OU SONT STOCKEES LES DONNEES ?
   Uniquement dans le navigateur de l'eleve (localStorage), sur
   son propre appareil. Rien n'est envoye sur Internet, aucun nom
   n'est demande, et l'enseignante n'y a pas acces : c'est un
   outil de progres personnel, pas une note.
   L'eleve peut tout effacer avec le bouton "Effacer mon
   historique" affiche sous ses resultats.

   Si le navigateur refuse le stockage (navigation privee, reglages
   restrictifs), tout continue de fonctionner : seul l'historique
   n'apparait pas.
   ============================================================ */

window.EPSHistorique = (function () {
  var CLE = "eps-historique-v1";
  var MAX_ESSAIS = 10;

  function disponible() {
    try {
      var t = "__eps_test__";
      window.localStorage.setItem(t, "1");
      window.localStorage.removeItem(t);
      return true;
    } catch (e) {
      return false;
    }
  }

  var actif = disponible();

  function lireTout() {
    if (!actif) return {};
    try {
      return JSON.parse(window.localStorage.getItem(CLE) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function ecrireTout(donnees) {
    if (!actif) return;
    try {
      window.localStorage.setItem(CLE, JSON.stringify(donnees));
    } catch (e) {
      /* Quota depasse : on ignore silencieusement. */
    }
  }

  /* Cle unique par activite ET par type d'exercice. */
  function cle(type, id) {
    return type + ":" + id;
  }

  /* essai = { note: 14, sur: 20 } — les autres champs sont libres. */
  function ajouter(type, id, essai) {
    if (!actif) return;
    var tout = lireTout();
    var k = cle(type, id);
    var liste = tout[k] || [];
    essai.date = new Date().toISOString();
    liste.push(essai);
    if (liste.length > MAX_ESSAIS) liste = liste.slice(liste.length - MAX_ESSAIS);
    tout[k] = liste;
    ecrireTout(tout);
  }

  function lire(type, id) {
    return lireTout()[cle(type, id)] || [];
  }

  function effacer(type, id) {
    var tout = lireTout();
    delete tout[cle(type, id)];
    ecrireTout(tout);
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function nombre(n) {
    return String(Math.round(n * 100) / 100).replace(".", ",");
  }

  /* ----------------------------------------------------------
     Affichage : construit le bloc "Mes essais precedents".
     - conteneur : l'element .historique ou dessiner
     - type / id : identifient l'exercice
     - unite     : texte affiche apres le score (ex : "/ 20")
     ---------------------------------------------------------- */
  function afficher(conteneur, type, id) {
    if (!conteneur) return;

    if (!actif) {
      conteneur.innerHTML =
        '<p class="historique__vide">Ton navigateur n\'autorise pas la sauvegarde locale : tes essais ne peuvent pas être conservés.</p>';
      return;
    }

    var essais = lire(type, id);
    if (essais.length < 1) {
      conteneur.innerHTML = "";
      return;
    }

    var dernier = essais[essais.length - 1];
    var meilleur = essais.reduce(function (a, b) {
      return b.note / b.sur >= a.note / a.sur ? b : a;
    });

    var html = '<p class="historique__title">📈 Mes essais précédents</p>';

    if (essais.length > 1) {
      var precedent = essais[essais.length - 2];
      var ecart = dernier.note / dernier.sur - precedent.note / precedent.sur;
      var mot;
      if (ecart > 0.001) {
        mot = "🚀 Tu progresses : c'est mieux que la dernière fois (" +
          nombre(precedent.note) + " / " + nombre(precedent.sur) + ").";
      } else if (ecart < -0.001) {
        mot = "🙂 Un peu moins bien que la dernière fois (" +
          nombre(precedent.note) + " / " + nombre(precedent.sur) + "). Ce n'est pas grave, retente après t'être entraîné !";
      } else {
        mot = "➡️ Même résultat que la dernière fois. À toi de viser plus haut au prochain essai !";
      }
      html += '<p class="historique__compare">' + mot + "</p>";
      html += '<p class="historique__best">🏅 Ton meilleur essai : <strong>' +
        nombre(meilleur.note) + " / " + nombre(meilleur.sur) + "</strong> le " + formatDate(meilleur.date) + "</p>";
    }

    html += '<ol class="historique__list">';
    essais.slice().reverse().forEach(function (e) {
      html += "<li><span>" + formatDate(e.date) + "</span><strong>" +
        nombre(e.note) + " / " + nombre(e.sur) + "</strong></li>";
    });
    html += "</ol>";

    html += '<button type="button" class="btn btn--outline btn--sm historique__clear">🗑️ Effacer mon historique</button>';

    conteneur.innerHTML = html;

    var bouton = conteneur.querySelector(".historique__clear");
    if (bouton) {
      bouton.addEventListener("click", function () {
        effacer(type, id);
        afficher(conteneur, type, id);
      });
    }
  }

  /* Cree (une seule fois) le bloc .historique juste apres un element. */
  function conteneurApres(element, type, id) {
    if (!element) return null;
    var suivant = element.nextElementSibling;
    if (suivant && suivant.classList.contains("historique")) return suivant;
    var div = document.createElement("div");
    div.className = "historique";
    div.setAttribute("data-historique", type + ":" + id);
    element.parentNode.insertBefore(div, element.nextSibling);
    return div;
  }

  return {
    actif: actif,
    ajouter: ajouter,
    lire: lire,
    effacer: effacer,
    afficher: afficher,
    conteneurApres: conteneurApres
  };
})();

/* ============================================================
   filter.js — Filtre / recherche de la page d'accueil
   ------------------------------------------------------------
   Permet aux eleves de retrouver rapidement une ressource parmi
   toutes les activites du college, en filtrant par niveau,
   par activite, et/ou par mot-cle.

   Fonctionne avec les cartes ".resource-card" de index.html, qui
   portent chacune :
     data-niveau="6e"          (6e / 5e / 4e / 3e)
     data-activite="handball"  (slug de l'activite)
     data-search="handball 6e balle a la main ..." (texte de recherche)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  var searchInput = document.getElementById("filter-search");
  var niveauSelect = document.getElementById("filter-niveau");
  var activiteSelect = document.getElementById("filter-activite");
  var resetBtn = document.getElementById("filter-reset");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".resource-card"));
  var countEl = document.getElementById("filter-count");
  var emptyMessage = document.getElementById("filter-empty");

  if (!searchInput || !cards.length) return; // pas sur la page d'accueil

  function applyFilters() {
    var searchTerm = searchInput.value.trim().toLowerCase();
    var niveauValue = niveauSelect.value;
    var activiteValue = activiteSelect.value;
    var visibleCount = 0;

    cards.forEach(function (card) {
      var matchesSearch = !searchTerm || card.dataset.search.toLowerCase().indexOf(searchTerm) !== -1;
      var matchesNiveau = niveauValue === "tous" || card.dataset.niveau === niveauValue;
      var matchesActivite = activiteValue === "tous" || card.dataset.activite === activiteValue;

      var isVisible = matchesSearch && matchesNiveau && matchesActivite;
      card.hidden = !isVisible;
      if (isVisible) visibleCount++;
    });

    if (countEl) {
      countEl.textContent = visibleCount + " ressource" + (visibleCount !== 1 ? "s" : "") + " affichee" + (visibleCount !== 1 ? "s" : "");
    }
    if (emptyMessage) {
      emptyMessage.hidden = visibleCount !== 0;
    }
  }

  searchInput.addEventListener("input", applyFilters);
  niveauSelect.addEventListener("change", applyFilters);
  activiteSelect.addEventListener("change", applyFilters);

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      searchInput.value = "";
      niveauSelect.value = "tous";
      activiteSelect.value = "tous";
      applyFilters();
    });
  }

  applyFilters(); // initialise le compteur au chargement
});

/* ============================================================
   quiz.js — Moteur generique des quiz d'entrainement
   ------------------------------------------------------------
   COMMENT AJOUTER / MODIFIER DES QUESTIONS ?
   Vous n'avez pas besoin de toucher ce fichier ! Les questions
   de chaque activite sont stockees dans un petit bloc
   <script> juste a cote du quiz, directement dans la page
   niveau-XX.html (cherchez "QUIZ_DATA" avec Ctrl+F).
   Chaque question suit ce modele :

   {
     question: "Le texte de la question ?",
     options: ["Reponse A", "Reponse B", "Reponse C"],
     correct: 0   // index (0 = premiere reponse) de la bonne reponse
   }

   Ce fichier lit ces donnees et affiche automatiquement le quiz,
   calcule le score et affiche la correction.
   ============================================================ */

window.QUIZ_DATA = window.QUIZ_DATA || {};

document.addEventListener("DOMContentLoaded", function () {
  var quizContainers = document.querySelectorAll(".quiz[data-quiz-id]");

  quizContainers.forEach(function (container) {
    var quizId = container.getAttribute("data-quiz-id");
    var questions = window.QUIZ_DATA[quizId];

    if (!questions || !questions.length) {
      container.innerHTML =
        '<p class="callout callout--neutral">Quiz a completer : aucune question n\'a encore ete ajoutee pour cette activite.</p>';
      return;
    }

    renderQuiz(container, quizId, questions);
  });

  function renderQuiz(container, quizId, questions) {
    var questionsWrap = container.querySelector(".quiz-questions");
    var submitBtn = container.querySelector(".quiz-submit");
    var resultBox = container.querySelector(".quiz-result");

    /* Construit le HTML de chaque question */
    var html = "";
    questions.forEach(function (q, qIndex) {
      html += '<div class="quiz-question" data-question-index="' + qIndex + '">';
      html += "<p>" + (qIndex + 1) + ". " + q.question + "</p>";
      html += "<ul>";
      q.options.forEach(function (option, oIndex) {
        var inputId = quizId + "-q" + qIndex + "-o" + oIndex;
        html +=
          "<li>" +
          '<label for="' + inputId + '">' +
          '<input type="radio" id="' + inputId + '" name="' + quizId + "-q" + qIndex + '" value="' + oIndex + '">' +
          "<span>" + option + "</span>" +
          "</label>" +
          "</li>";
      });
      html += "</ul>";
      html += "</div>";
    });
    questionsWrap.innerHTML = html;

    submitBtn.addEventListener("click", function () {
      var score = 0;
      var allAnswered = true;

      questions.forEach(function (q, qIndex) {
        var questionEl = questionsWrap.querySelector(
          '.quiz-question[data-question-index="' + qIndex + '"]'
        );
        var selected = questionEl.querySelector("input[type=radio]:checked");

        if (!selected) {
          allAnswered = false;
          return;
        }

        var selectedIndex = parseInt(selected.value, 10);
        var isCorrect = selectedIndex === q.correct;
        if (isCorrect) score++;

        questionEl.classList.add(isCorrect ? "is-correct" : "is-incorrect");

        /* Marque visuellement la reponse choisie et la bonne reponse */
        var labels = questionEl.querySelectorAll("label");
        labels.forEach(function (label, oIndex) {
          if (oIndex === selectedIndex) label.classList.add("is-selected");
          if (oIndex === q.correct) label.classList.add("is-answer");
        });

        /* Desactive les champs une fois corrige */
        questionEl.querySelectorAll("input[type=radio]").forEach(function (input) {
          input.disabled = true;
        });
      });

      if (!allAnswered) {
        resultBox.hidden = false;
        resultBox.textContent = "Merci de repondre a toutes les questions avant de valider.";
        return;
      }

      resultBox.hidden = false;
      resultBox.textContent = "Score : " + score + " / " + questions.length;
      submitBtn.disabled = true;
      submitBtn.textContent = "Quiz corrige";
    });
  }
});

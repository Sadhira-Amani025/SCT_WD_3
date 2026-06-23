// app.js - Fixed button text visibility
(function() {
  // -------- STATE --------
  let currentCategory = 'java';
  let currentIndex = 0;
  let questions = [];
  let userAnswers = [];
  let timer = 15;
  let timerInterval = null;
  let isQuizActive = false;
  let isQuizStarted = false;

  // -------- DOM REFS --------
  const categoryBtns = document.querySelectorAll('.cat-btn');
  const startScreen = document.getElementById('startScreen');
  const startBtn = document.getElementById('startBtn');
  const quizInterface = document.getElementById('quizInterface');
  const questionText = document.getElementById('questionText');
  const optionsContainer = document.getElementById('optionsContainer');
  const fillInput = document.getElementById('fillInput');
  const qTypeBadge = document.getElementById('qTypeBadge');
  const qCounter = document.getElementById('qCounter');
  const progressFill = document.getElementById('progressFill');
  const timerDisplay = document.getElementById('timerDisplay');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const questionArea = document.getElementById('questionArea');
  const resultsPanel = document.getElementById('resultsPanel');
  const finalScore = document.getElementById('finalScore');
  const totalQuestionsSpan = document.getElementById('totalQuestions');
  const restartBtn = document.getElementById('restartBtn');
  const highScoreDisplay = document.getElementById('highScoreDisplay');
  const detailedResults = document.getElementById('detailedResults');

  // -------- HIGH SCORE (localStorage) --------
  function getHighScore() {
    return parseInt(localStorage.getItem('quizMasterHighScore')) || 0;
  }
  function setHighScore(score) {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem('quizMasterHighScore', score);
    }
    highScoreDisplay.textContent = getHighScore();
  }
  highScoreDisplay.textContent = getHighScore();

  // -------- HELPERS --------
  function normalizeFill(str) {
    return str.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  function getAnswerDisplay(q, answer) {
    if (q.type === 'single') {
      return q.options[answer] || answer;
    } else if (q.type === 'multi') {
      if (Array.isArray(answer)) {
        return answer.map(i => q.options[i]).join(', ');
      }
      return answer;
    } else {
      return answer;
    }
  }

  function isAnswerCorrect(qIndex) {
    const q = questions[qIndex];
    const ans = userAnswers[qIndex];
    if (ans === null || ans === undefined) return false;
    
    if (q.type === 'single') {
      return ans === q.answer;
    } else if (q.type === 'multi') {
      if (!Array.isArray(ans)) return false;
      const sortedA = [...ans].sort((a,b)=>a-b);
      const sortedQ = [...q.answer].sort((a,b)=>a-b);
      if (sortedA.length !== sortedQ.length) return false;
      return sortedA.every((val, i) => val === sortedQ[i]);
    } else if (q.type === 'fill') {
      return normalizeFill(ans) === normalizeFill(q.answer);
    }
    return false;
  }

  function computeScore() {
    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      if (isAnswerCorrect(i)) correct++;
    }
    return correct;
  }

  // -------- TIMER --------
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function startTimer() {
    stopTimer();
    timer = 15;
    timerDisplay.textContent = timer + 's';
    timerDisplay.classList.remove('warning');
    timerInterval = setInterval(() => {
      timer--;
      timerDisplay.textContent = timer + 's';
      if (timer <= 5) timerDisplay.classList.add('warning');
      if (timer <= 0) {
        stopTimer();
        const q = questions[currentIndex];
        if (q && q.type === 'fill') {
          userAnswers[currentIndex] = fillInput.value;
        }
        if (currentIndex < questions.length - 1) {
          goTo(currentIndex + 1);
        } else {
          submitQuiz();
        }
      }
    }, 1000);
  }

  // -------- RENDER --------
  function renderQuestion(index) {
    stopTimer();
    const q = questions[index];
    if (!q) {
      console.error('Question not found at index:', index);
      return;
    }

    const typeMap = { single: 'Single choice', multi: 'Multiple choice', fill: 'Fill in the blank' };
    qTypeBadge.textContent = typeMap[q.type] || 'Question';
    questionText.textContent = q.question;
    optionsContainer.innerHTML = '';
    fillInput.classList.add('hidden');
    fillInput.value = '';

    if (q.type === 'fill') {
      fillInput.classList.remove('hidden');
      if (userAnswers[index] !== null && userAnswers[index] !== undefined) {
        fillInput.value = userAnswers[index];
      }
      fillInput.oninput = function(e) {
        userAnswers[index] = e.target.value;
      };
    } else {
      const isMulti = q.type === 'multi';
      const selected = userAnswers[index];
      q.options.forEach((optText, idx) => {
        const div = document.createElement('div');
        div.className = 'option-item';
        const input = document.createElement('input');
        input.type = isMulti ? 'checkbox' : 'radio';
        input.name = `q${index}`;
        input.value = idx;
        
        if (isMulti && Array.isArray(selected) && selected.includes(idx)) {
          input.checked = true;
          div.classList.add('selected');
        } else if (!isMulti && selected === idx) {
          input.checked = true;
          div.classList.add('selected');
        }
        
        input.addEventListener('change', function() {
          if (isMulti) {
            if (!Array.isArray(userAnswers[index])) userAnswers[index] = [];
            const arr = userAnswers[index];
            if (this.checked) {
              if (!arr.includes(idx)) arr.push(idx);
            } else {
              const pos = arr.indexOf(idx);
              if (pos !== -1) arr.splice(pos, 1);
            }
            userAnswers[index] = [...arr].sort((a,b)=>a-b);
            document.querySelectorAll('.option-item').forEach((el) => {
              const chk = el.querySelector('input[type="checkbox"]');
              if (chk) {
                el.classList.toggle('selected', chk.checked);
              }
            });
          } else {
            if (this.checked) {
              userAnswers[index] = idx;
              document.querySelectorAll('.option-item').forEach((el) => {
                const radio = el.querySelector('input[type="radio"]');
                if (radio) {
                  el.classList.toggle('selected', radio.checked);
                }
              });
            }
          }
        });
        
        const label = document.createTextNode(optText);
        div.appendChild(input);
        div.appendChild(label);
        optionsContainer.appendChild(div);
      });
    }

    qCounter.textContent = `${index+1} / ${questions.length}`;
    progressFill.style.width = `${((index+1) / questions.length) * 100}%`;
    prevBtn.disabled = (index === 0);
    
    if (index === questions.length - 1) {
      nextBtn.classList.add('hidden');
      submitBtn.classList.remove('hidden');
    } else {
      nextBtn.classList.remove('hidden');
      submitBtn.classList.add('hidden');
    }
    
    if (isQuizActive) startTimer();
  }

  // -------- NAVIGATION --------
  function goTo(index) {
    if (index < 0 || index >= questions.length) return;
    const q = questions[currentIndex];
    if (q && q.type === 'fill') {
      userAnswers[currentIndex] = fillInput.value;
    }
    currentIndex = index;
    renderQuestion(index);
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) goTo(currentIndex + 1);
  }
  
  function prevQuestion() {
    if (currentIndex > 0) goTo(currentIndex - 1);
  }

  // -------- SUBMIT / RESULTS --------
  function submitQuiz() {
    stopTimer();
    isQuizActive = false;
    isQuizStarted = false;
    
    const q = questions[currentIndex];
    if (q && q.type === 'fill') {
      userAnswers[currentIndex] = fillInput.value;
    }
    
    const score = computeScore();
    finalScore.textContent = score;
    totalQuestionsSpan.textContent = questions.length;
    setHighScore(score);
    highScoreDisplay.textContent = getHighScore();
    
    let html = '';
    questions.forEach((q, idx) => {
      const correct = isAnswerCorrect(idx);
      const userAns = userAnswers[idx];
      const correctAns = q.answer;
      const userDisplay = (userAns !== null && userAns !== undefined) ? getAnswerDisplay(q, userAns) : 'Not answered';
      const correctDisplay = getAnswerDisplay(q, correctAns);
      
      html += `
        <div class="result-item ${correct ? 'correct' : 'wrong'}">
          <div class="q-text">${idx+1}. ${q.question}</div>
          <div class="answer-info">
            ${correct ? '✅ ' : '❌ '}
            Your answer: <span class="${correct ? 'correct-text' : ''}">${userDisplay}</span>
            ${!correct ? ` · Correct: <span class="correct-ans">${correctDisplay}</span>` : ''}
          </div>
        </div>
      `;
    });
    detailedResults.innerHTML = html;
    
    // Hide quiz interface and show results
    quizInterface.classList.add('hidden');
    resultsPanel.classList.remove('hidden');
  }

  // -------- START QUIZ --------
  function startQuiz() {
    if (!questions || questions.length === 0) {
      alert('No questions available for this category.');
      return;
    }
    isQuizActive = true;
    isQuizStarted = true;
    currentIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    startScreen.classList.add('hidden');
    resultsPanel.classList.add('hidden');
    quizInterface.classList.remove('hidden');
    // Make sure info bar and progress bar are visible
    document.querySelector('.info-bar').style.display = 'flex';
    document.querySelector('.progress-bar').style.display = 'block';
    renderQuestion(0);
  }

  // -------- RESTART / PLAY AGAIN (FIXED) --------
  function restartQuiz() {
    stopTimer();
    isQuizActive = false;
    isQuizStarted = false;
    
    // Reset UI - show start screen, hide everything else
    startScreen.classList.remove('hidden');
    quizInterface.classList.add('hidden');
    resultsPanel.classList.add('hidden');
    
    // Reset info bar and progress bar
    document.querySelector('.info-bar').style.display = 'none';
    document.querySelector('.progress-bar').style.display = 'none';
    
    // Reset question area
    questionArea.classList.remove('hidden');
    
    // Reset to first question but keep questions loaded
    currentIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
  }

  // -------- CATEGORY CHANGE --------
  function loadCategory(category) {
    stopTimer();
    isQuizActive = false;
    isQuizStarted = false;
    
    currentCategory = category;
    questions = QUESTION_BANK[category] || [];
    userAnswers = new Array(questions.length).fill(null);
    currentIndex = 0;
    
    categoryBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // Show start screen
    startScreen.classList.remove('hidden');
    quizInterface.classList.add('hidden');
    resultsPanel.classList.add('hidden');
    document.querySelector('.info-bar').style.display = 'none';
    document.querySelector('.progress-bar').style.display = 'none';
    questionArea.classList.remove('hidden');
  }

  // -------- EVENT BINDINGS --------
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const cat = this.dataset.category;
      if (cat !== currentCategory) {
        loadCategory(cat);
      }
    });
  });

  startBtn.addEventListener('click', startQuiz);
  prevBtn.addEventListener('click', prevQuestion);
  nextBtn.addEventListener('click', nextQuestion);
  submitBtn.addEventListener('click', function() {
    const q = questions[currentIndex];
    if (q && q.type === 'fill') {
      userAnswers[currentIndex] = fillInput.value;
    }
    submitQuiz();
  });
  restartBtn.addEventListener('click', restartQuiz);

  optionsContainer.addEventListener('click', function(e) {
    const target = e.target.closest('.option-item');
    if (target) {
      const input = target.querySelector('input');
      if (input && !e.target.closest('input')) {
        input.click();
      }
    }
  });

  fillInput.addEventListener('blur', function() {
    const q = questions[currentIndex];
    if (q && q.type === 'fill') {
      userAnswers[currentIndex] = this.value;
    }
  });

  // -------- INIT --------
  loadCategory('java');
})();
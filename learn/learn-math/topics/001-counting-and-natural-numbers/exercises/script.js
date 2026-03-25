// ── Exercise definitions ──────────────────────────────────────────
const exercises = [
  {
    id: 1, type: 'mc', correct: 'N',
    explanation: 'ℕ (blackboard bold N) is the standard symbol for the natural numbers. ℤ = integers, ℝ = reals, ℚ = rationals.'
  },
  {
    id: 2, type: 'fill', correct: 8,
    explanation: 'S(7) = 7 + 1 = <span class="ans">8</span>. The successor function simply adds 1.'
  },
  {
    id: 3, type: 'mc', correct: 'infinite',
    explanation: 'ℕ is countably infinite — it goes on forever, but its elements can be listed in order: 1, 2, 3, … The reals are uncountably infinite; ℕ is not.'
  },
  {
    id: 4, type: 'fill', correct: 3,
    explanation: 'S(0) = 1, S(S(0)) = 2, S(S(S(0))) = <span class="ans">3</span>. Applying S three times to 0 gives 3.'
  },
  {
    id: 5, type: 'mc', correct: 'wellordered',
    explanation: 'The well-ordering principle states that every non-empty subset of ℕ has a least element. This is a fundamental property that makes induction proofs work.'
  },
  {
    id: 6, type: 'mc', correct: 'depends',
    explanation: 'Both conventions exist. Number theorists and many textbooks use ℕ = {1, 2, 3, …}; set theorists and computer scientists often use ℕ₀ = {0, 1, 2, …}. Always check which convention the author uses.'
  },
  {
    id: 7, type: 'fill', correct: 8,
    explanation: 'Counting 5 then 3 more gives <span class="ans">8</span>. The order you count them does not matter — this is the "order independence" principle of counting.'
  },
  {
    id: 8, type: 'mc', correct: '-3',
    explanation: '−3 is a negative integer. Natural numbers are non-negative (and positive in most conventions). Negative numbers belong to ℤ (integers) but not ℕ.'
  },
  {
    id: 9, type: 'mc', correct: 'P4',
    explanation: 'P4 says the successor function S is injective: distinct inputs have distinct outputs. This ensures the number sequence never "loops back."'
  },
  {
    id: 10, type: 'mc', correct: 'none',
    explanation: 'When ℕ starts at 1, the number 1 has no predecessor inside ℕ — there is no natural number n such that S(n) = 1. This is exactly what Peano axiom P3 states.'
  },
];

// ── State ─────────────────────────────────────────────────────────
const state = {};
exercises.forEach(e => { state[e.id] = { answered: false, correct: false }; });

// ── Score helpers ─────────────────────────────────────────────────
function updateScore() {
  const answered = exercises.filter(e => state[e.id].answered).length;
  const correct  = exercises.filter(e => state[e.id].correct).length;
  document.getElementById('score-display').textContent = `${correct} / 10`;
  document.getElementById('progress-text').textContent = `${answered} answered`;
  document.getElementById('progress-bar-inner').style.width = `${answered * 10}%`;

  if (answered === 10) {
    const msg = document.getElementById('final-msg');
    msg.textContent = correct === 10
      ? 'Perfect score! All Peano would be proud.'
      : `${correct}/10 correct — review the highlighted exercises.`;
    msg.classList.add('show');
  }
}

// ── Multiple choice setup ─────────────────────────────────────────
function setupMC(ex) {
  const container = document.getElementById(`ch-${ex.id}`);
  const btnCheck  = document.getElementById(`chk-${ex.id}`);
  const btnReveal = document.getElementById(`rev-${ex.id}`);
  const feedback  = document.getElementById(`fb-${ex.id}`);
  const status    = document.getElementById(`st-${ex.id}`);
  const card      = document.getElementById(`ex-${ex.id}`);

  let selected = null;

  container.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state[ex.id].answered) return;
      container.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selected = btn.dataset.value;
    });
  });

  btnCheck.addEventListener('click', () => {
    if (!selected || state[ex.id].answered) return;
    mark(ex, selected === ex.correct, false);
    highlightMC(container, ex.correct, selected, false);
    showFeedback(feedback, ex.explanation, selected === ex.correct, false);
    lockMC(container, btnCheck, btnReveal, status, card, selected === ex.correct, false);
  });

  btnReveal.addEventListener('click', () => {
    if (state[ex.id].answered) return;
    mark(ex, false, true);
    highlightMC(container, ex.correct, selected, true);
    showFeedback(feedback, ex.explanation, false, true);
    lockMC(container, btnCheck, btnReveal, status, card, false, true);
  });
}

function highlightMC(container, correct, selected, revealed) {
  container.querySelectorAll('.choice-btn').forEach(btn => {
    btn.classList.remove('selected');
    if (btn.dataset.value === correct) btn.classList.add('correct-ans');
    else if (!revealed && btn.dataset.value === selected) btn.classList.add('wrong-ans');
  });
}

function lockMC(container, btnCheck, btnReveal, status, card, correct, revealed) {
  container.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);
  btnCheck.disabled = true;
  btnReveal.disabled = true;
  if (revealed) {
    status.textContent = 'revealed'; status.className = 'ex-status rev';
    card.classList.add('revealed');
  } else if (correct) {
    status.textContent = '✓ correct'; status.className = 'ex-status ok';
    card.classList.add('correct');
  } else {
    status.textContent = '✗ wrong'; status.className = 'ex-status err';
    card.classList.add('wrong');
  }
}

// ── Fill-in-the-blank setup ───────────────────────────────────────
function setupFill(ex) {
  const input     = document.getElementById(`fi-${ex.id}`);
  const btnCheck  = document.getElementById(`chk-${ex.id}`);
  const btnReveal = document.getElementById(`rev-${ex.id}`);
  const feedback  = document.getElementById(`fb-${ex.id}`);
  const status    = document.getElementById(`st-${ex.id}`);
  const card      = document.getElementById(`ex-${ex.id}`);

  input.addEventListener('keydown', e => { if (e.key === 'Enter') btnCheck.click(); });

  btnCheck.addEventListener('click', () => {
    if (state[ex.id].answered) return;
    const val = parseInt(input.value, 10);
    const ok = val === ex.correct;
    mark(ex, ok, false);
    input.classList.add(ok ? 'correct' : 'wrong');
    input.disabled = true;
    showFeedback(feedback, ex.explanation, ok, false);
    lockFill(btnCheck, btnReveal, status, card, ok, false);
  });

  btnReveal.addEventListener('click', () => {
    if (state[ex.id].answered) return;
    mark(ex, false, true);
    input.value = ex.correct;
    input.classList.add('correct');
    input.disabled = true;
    showFeedback(feedback, ex.explanation, false, true);
    lockFill(btnCheck, btnReveal, status, card, false, true);
  });
}

function lockFill(btnCheck, btnReveal, status, card, correct, revealed) {
  btnCheck.disabled = true;
  btnReveal.disabled = true;
  if (revealed) {
    status.textContent = 'revealed'; status.className = 'ex-status rev';
    card.classList.add('revealed');
  } else if (correct) {
    status.textContent = '✓ correct'; status.className = 'ex-status ok';
    card.classList.add('correct');
  } else {
    status.textContent = '✗ wrong'; status.className = 'ex-status err';
    card.classList.add('wrong');
  }
}

function mark(ex, correct, revealed) {
  state[ex.id].answered = true;
  state[ex.id].correct  = correct && !revealed;
  updateScore();
}

function showFeedback(el, explanation, correct, revealed) {
  el.innerHTML = explanation;
  el.classList.add('show');
  if (revealed)      el.classList.add('reveal-fb');
  else if (!correct) el.classList.add('wrong-fb');
}

// ── Init ──────────────────────────────────────────────────────────
exercises.forEach(ex => {
  if (ex.type === 'mc')   setupMC(ex);
  if (ex.type === 'fill') setupFill(ex);
});

// ── Reset ─────────────────────────────────────────────────────────
document.getElementById('reset-all').addEventListener('click', () => {
  location.reload();
});

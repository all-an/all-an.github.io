// Built-in English vocabulary bank, drilled alongside the questions saved in the
// browser. Each entry:
//   word     — the word being learned
//   meaning  — a one-line definition, used as the correct answer of a meaning question
//   synonyms — words with the same sense, used as the answer of a synonym question
// Meanings are kept distinct from one another, and a word never appears in another
// entry's synonyms, so wrong options borrowed from other entries are never also right.
const VOCABULARY = [
  { word: "relentless", meaning: "never stopping or easing off", synonyms: ["unrelenting", "implacable", "unremitting"] },
  { word: "meticulous", meaning: "showing great attention to detail", synonyms: ["painstaking", "scrupulous", "fastidious"] },
  { word: "candid", meaning: "honest and direct, even when it is uncomfortable", synonyms: ["frank", "forthright", "outspoken"] },
  { word: "resilient", meaning: "able to recover quickly from difficulty", synonyms: ["hardy", "tough", "adaptable"] },
  { word: "cumbersome", meaning: "heavy or awkward to carry or use", synonyms: ["unwieldy", "clunky", "burdensome"] },
  { word: "arduous", meaning: "demanding a great deal of effort", synonyms: ["strenuous", "gruelling", "laborious"] },
  { word: "concise", meaning: "saying much in few words", synonyms: ["succinct", "terse", "pithy"] },
  { word: "ambiguous", meaning: "open to more than one interpretation", synonyms: ["equivocal", "unclear", "vague"] },
  { word: "redundant", meaning: "not needed, because it repeats something already there", synonyms: ["superfluous", "surplus", "needless"] },
  { word: "thorough", meaning: "complete in every detail, leaving nothing out", synonyms: ["exhaustive", "comprehensive", "rigorous"] },
  { word: "feasible", meaning: "possible to do with the means available", synonyms: ["viable", "practicable", "workable"] },
  { word: "mitigate", meaning: "to make something bad less severe", synonyms: ["alleviate", "lessen", "temper"] },
  { word: "hinder", meaning: "to make something slower or harder to do", synonyms: ["impede", "hamper", "obstruct"] },
  { word: "streamline", meaning: "to make a process simpler and more efficient", synonyms: ["simplify", "rationalize", "optimize"] },
  { word: "scrutinize", meaning: "to examine something closely and critically", synonyms: ["inspect", "probe", "dissect"] },
  { word: "deprecate", meaning: "to mark something as outdated and discourage its use", synonyms: ["retire", "phase out", "supersede"] },
  { word: "trivial", meaning: "of little value or importance", synonyms: ["insignificant", "negligible", "petty"] },
  { word: "robust", meaning: "strong and unlikely to fail under stress", synonyms: ["sturdy", "sound", "durable"] },
  { word: "brittle", meaning: "hard but easily broken", synonyms: ["fragile", "delicate", "breakable"] },
  { word: "verbose", meaning: "using far more words than necessary", synonyms: ["wordy", "long-winded", "rambling"] },
  { word: "tedious", meaning: "long, slow and boring", synonyms: ["monotonous", "dull", "tiresome"] },
  { word: "eager", meaning: "keen and impatient to do something", synonyms: ["avid", "enthusiastic", "raring"] },
  { word: "reluctant", meaning: "unwilling and hesitant to act", synonyms: ["hesitant", "averse", "disinclined"] },
  { word: "blunt", meaning: "saying things plainly, without softening them", synonyms: ["curt", "brusque", "unvarnished"] },
  { word: "subtle", meaning: "delicate and not immediately obvious", synonyms: ["understated", "nuanced", "faint"] },
  { word: "plausible", meaning: "seeming reasonable or likely to be true", synonyms: ["believable", "credible", "convincing"] },
  { word: "inherent", meaning: "existing as a natural, inseparable part of something", synonyms: ["intrinsic", "innate", "ingrained"] },
  { word: "obsolete", meaning: "no longer in use because something better exists", synonyms: ["outdated", "antiquated", "defunct"] },
  { word: "paramount", meaning: "more important than anything else", synonyms: ["supreme", "foremost", "overriding"] },
  { word: "compelling", meaning: "so convincing or gripping that it holds your attention", synonyms: ["persuasive", "forceful", "riveting"] },
  { word: "cautious", meaning: "careful to avoid risk or mistakes", synonyms: ["wary", "prudent", "circumspect"] },
  { word: "seamless", meaning: "smooth and continuous, with no visible joins", synonyms: ["uninterrupted", "fluid", "flowing"] },
  { word: "cluttered", meaning: "full of too many things and badly organized", synonyms: ["messy", "crowded", "jumbled"] },
  { word: "daunting", meaning: "intimidating, and seeming hard to face", synonyms: ["formidable", "forbidding", "off-putting"] },
  { word: "diligent", meaning: "working steadily and carefully at a task", synonyms: ["industrious", "assiduous", "conscientious"] },
];

// The words picked on the vocabulary page live in this browser, under this key,
// as an array of words. Nothing stored yet means the whole bank is drilled.
const VOCABULARY_SELECTION_KEY = "english.vocabularySelection";

// The entries the drill should ask about, in bank order.
function selectedVocabulary() {
  try {
    const stored = JSON.parse(localStorage.getItem(VOCABULARY_SELECTION_KEY));
    if (!Array.isArray(stored)) return VOCABULARY;
    return VOCABULARY.filter(entry => stored.includes(entry.word));
  } catch {
    return VOCABULARY;
  }
}

// Persist the picked words. Storage can be blocked (private mode), so failure is
// ignored: the page still shows the choice, only the next visit forgets it.
function saveVocabularySelection(words) {
  try {
    localStorage.setItem(VOCABULARY_SELECTION_KEY, JSON.stringify(words));
  } catch {
    // Selection is a preference, not data worth interrupting the user for.
  }
}

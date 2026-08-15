// Manages the bookmarks saved by any C Programming course's "☆" step
// buttons, all stored under the shared 'c-programming-bookmarks' key in
// localStorage. Lets the student jump to a bookmarked step, add a note to
// it, remove a single bookmark, or clear all of them.

const BOOKMARKS_KEY = 'c-programming-bookmarks';

const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const clearAllBtn = document.getElementById('clearAll');

// Read the shared bookmarks list, tolerating missing or corrupt storage.
function readBookmarks() {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY)) || [];
  } catch {
    return [];
  }
}

function writeBookmarks(bookmarks) {
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
}

// Escapes text before it's inserted into innerHTML, since notes and step
// titles are free-form strings that may contain HTML-significant characters.
function escapeHtml(text) {
  const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, c => chars[c]);
}

// Render the bookmarks list, most recently saved first.
function render() {
  const bookmarks = readBookmarks().slice().sort((a, b) => b.savedAt - a.savedAt);

  clearAllBtn.style.display = bookmarks.length ? 'inline-block' : 'none';
  emptyEl.style.display = bookmarks.length ? 'none' : 'block';

  listEl.innerHTML = bookmarks.map(b => `
    <div class="bookmark" data-course="${b.courseId}" data-step="${b.stepId}">
      <div class="bookmark-main">
        <a class="bookmark-link" href="../${b.courseId}/#${b.stepId}">${escapeHtml(b.stepTitle)}</a>
        <span class="bookmark-course">${escapeHtml(b.courseName)}</span>
      </div>
      <input class="bookmark-note" type="text" placeholder="Add a note..." value="${escapeHtml(b.note || '')}" />
      <button class="bookmark-remove" title="Remove bookmark">✕</button>
    </div>`).join('');
}

// Save whatever note text is currently in an input back onto its bookmark.
function saveNote(input) {
  const row = input.closest('.bookmark');
  const bookmarks = readBookmarks();
  const entry = bookmarks.find(b => b.courseId === row.dataset.course && b.stepId === row.dataset.step);
  if (entry) {
    entry.note = input.value;
    writeBookmarks(bookmarks);
  }
}

// Remove a single bookmark and re-render.
function removeBookmark(row) {
  const bookmarks = readBookmarks().filter(b => !(b.courseId === row.dataset.course && b.stepId === row.dataset.step));
  writeBookmarks(bookmarks);
  render();
}

listEl.addEventListener('change', e => {
  if (e.target.classList.contains('bookmark-note')) saveNote(e.target);
});

listEl.addEventListener('click', e => {
  if (e.target.classList.contains('bookmark-remove')) removeBookmark(e.target.closest('.bookmark'));
});

clearAllBtn.addEventListener('click', () => {
  if (confirm('Remove all saved bookmarks?')) {
    writeBookmarks([]);
    render();
  }
});

render();

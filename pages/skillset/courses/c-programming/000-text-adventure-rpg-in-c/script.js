// Lets the visitor override this course's status (done / planned) and
// persists the choice in localStorage, under the same key convention the
// courses list reads from: 'course-status:<folder-name>'. Also lets them
// bookmark individual steps, stored under the shared 'c-programming-bookmarks'
// key that the bookmarks page (../bookmarks/) reads and manages.

const STORAGE_KEY = 'course-status:000-text-adventure-rpg-in-c';
const DEFAULT_STATUS = 'inprogress';

const COURSE_ID = '000-text-adventure-rpg-in-c';
const COURSE_NAME = 'Text Adventure RPG in C';
const BOOKMARKS_KEY = 'c-programming-bookmarks';

const STATUS_LABEL = { completed: 'Completed', inprogress: 'In progress', planned: 'Planned' };
const STATUS_CLASS = { completed: 'status-completed', inprogress: 'status-inprogress', planned: 'status-planned' };

const statusBadge = document.getElementById('statusBadge');
const markDoneBtn = document.getElementById('markDone');
const markPlannedBtn = document.getElementById('markPlanned');
const markInProgressBtn = document.getElementById('markInProgress');

// Read the saved status, falling back to the course's default.
function getStatus() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_STATUS;
}

// Reflect the current status in the badge and the buttons' active state.
function render() {
  const status = getStatus();
  statusBadge.textContent = STATUS_LABEL[status];
  statusBadge.className = `badge ${STATUS_CLASS[status]}`;
  markDoneBtn.classList.toggle('active', status === 'completed');
  markPlannedBtn.classList.toggle('active', status === 'planned');
  markInProgressBtn.classList.toggle('active', status === 'inprogress');
}

function setStatus(status) {
  localStorage.setItem(STORAGE_KEY, status);
  render();
}

markDoneBtn.addEventListener('click', () => setStatus('completed'));
markPlannedBtn.addEventListener('click', () => setStatus('planned'));
markInProgressBtn.addEventListener('click', () => setStatus('inprogress'));

render();

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

// Toggle the bookmark for one step, updating both storage and the button.
function toggleBookmark(btn) {
  const stepId = btn.dataset.step;
  const bookmarks = readBookmarks();
  const idx = bookmarks.findIndex(b => b.courseId === COURSE_ID && b.stepId === stepId);

  if (idx >= 0) {
    bookmarks.splice(idx, 1);
  } else {
    bookmarks.push({ courseId: COURSE_ID, courseName: COURSE_NAME, stepId, stepTitle: btn.dataset.title, savedAt: Date.now() });
  }
  writeBookmarks(bookmarks);
  paintBookmarkButton(btn, idx < 0);
}

function paintBookmarkButton(btn, isBookmarked) {
  btn.classList.toggle('bookmarked', isBookmarked);
  btn.textContent = isBookmarked ? '★' : '☆';
}

const bookmarkButtons = document.querySelectorAll('.bookmark-btn');
const bookmarks = readBookmarks();

bookmarkButtons.forEach(btn => {
  const marked = bookmarks.some(b => b.courseId === COURSE_ID && b.stepId === btn.dataset.step);
  paintBookmarkButton(btn, marked);
  btn.addEventListener('click', () => toggleBookmark(btn));
});

// On load, jump straight to the most recently bookmarked step in this
// course, so returning students land back where they left off.
const myBookmarks = bookmarks.filter(b => b.courseId === COURSE_ID);
if (myBookmarks.length) {
  const latest = myBookmarks.reduce((a, b) => (b.savedAt > a.savedAt ? b : a));
  const target = document.getElementById(latest.stepId);
  if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
}

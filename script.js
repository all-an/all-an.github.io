// Furthest the pupil may travel from the eye centre, in pixels.
const MAX_PUPIL_OFFSET = 8;
// How long the eyes take to glide to the Games button — keep in sync with the CSS transition.
const EYE_TRAVEL_MS = 600;

const eyes = document.querySelector('.eyes');
const pupils = document.querySelectorAll('.pupil');
const gamesLink = document.getElementById('games-link');
const copyEmailButton = document.getElementById('copy-email');
const copyToast = document.getElementById('copy-toast');
const copyToastTitle = document.getElementById('toast-title');
const copyToastDetail = document.getElementById('toast-detail');

// How long the "copied" alert stays on screen, in milliseconds.
const COPY_TOAST_MS = 2400;

// Pending timer that hides the alert, so a second click restarts the countdown.
let copyToastTimer;

// While the eyes are gliding to the Games button, they stop following the cursor.
let eyesAreTraveling = false;

// Returns the centre of an element in viewport coordinates.
function centerOf(element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

// Points every pupil toward a viewport coordinate, capped at the eye's edge.
function aimPupilsAt(targetX, targetY) {
  pupils.forEach((pupil) => {
    const eyeCenter = centerOf(pupil.parentElement);
    const deltaX = targetX - eyeCenter.x;
    const deltaY = targetY - eyeCenter.y;
    const angle = Math.atan2(deltaY, deltaX);
    // Move toward the target, but never past the eye's edge.
    const offset = Math.min(MAX_PUPIL_OFFSET, Math.hypot(deltaX, deltaY));
    pupil.style.transform = `translate(${Math.cos(angle) * offset}px, ${Math.sin(angle) * offset}px)`;
  });
}

// Follow the cursor, unless the eyes are mid-journey to the Games button.
document.addEventListener('mousemove', (event) => {
  if (eyesAreTraveling) return;
  aimPupilsAt(event.clientX, event.clientY);
});

// On Games click, glide the eyes onto the button (looking at it), then navigate.
// The Gaming link is currently commented out in index.html, so guard against it being absent.
gamesLink?.addEventListener('click', (event) => {
  event.preventDefault();
  eyesAreTraveling = true;
  const destination = gamesLink.href;

  // Slide the eyes from their current centre to the Games button's centre,
  // preserving the -50% centring offset the layout relies on.
  const target = centerOf(gamesLink);
  const start = centerOf(eyes);
  const dx = target.x - start.x;
  const dy = target.y - start.y;
  eyes.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

  // Look toward the destination while travelling there.
  aimPupilsAt(target.x, target.y);

  // Once the glide finishes, go to the Games page.
  setTimeout(() => { window.location.href = destination; }, EYE_TRAVEL_MS);
});

// Shows the alert at the bottom of the page for COPY_TOAST_MS. `isError` swaps
// the green check for a red warning so a failed copy doesn't look like a success.
function showCopyToast(title, detail, isError) {
  copyToastTitle.textContent = title;
  copyToastDetail.textContent = detail;
  copyToast.classList.toggle('is-error', isError);
  copyToast.classList.add('is-visible');
  clearTimeout(copyToastTimer);
  copyToastTimer = setTimeout(() => copyToast.classList.remove('is-visible'), COPY_TOAST_MS);
}

// Copy the address shown on the button to the clipboard and tell the visitor.
// If the browser refuses (insecure context, blocked permission), the alert still
// shows the address so it can be copied by hand.
copyEmailButton.addEventListener('click', async () => {
  const address = copyEmailButton.textContent.trim();
  // Hide the "Click to copy" tooltip until the pointer leaves, so it doesn't sit beside the alert.
  copyEmailButton.classList.add('is-copied');
  try {
    await navigator.clipboard.writeText(address);
    showCopyToast('Email address copied', address, false);
  } catch {
    showCopyToast('Could not copy automatically', address, true);
  }
});

// Bring the tooltip back once the pointer or keyboard focus has left the button.
['mouseleave', 'blur'].forEach((eventName) => {
  copyEmailButton.addEventListener(eventName, () => copyEmailButton.classList.remove('is-copied'));
});

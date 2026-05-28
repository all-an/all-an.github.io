// Furthest the pupil may travel from the eye centre, in pixels.
const MAX_PUPIL_OFFSET = 8;
// How long the eyes take to glide to the Games button — keep in sync with the CSS transition.
const EYE_TRAVEL_MS = 600;

const eyes = document.querySelector('.eyes');
const pupils = document.querySelectorAll('.pupil');
const gamesLink = document.getElementById('games-link');

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

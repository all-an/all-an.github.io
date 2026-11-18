// Renders the Profile Overview card, Language Breakdown card, and filterable
// Project cards grid using PROFILE, LANGUAGE_BREAKDOWN, CATEGORIES, and PROJECTS
// from projects-data.js.

// Populate the top Profile Overview and Language Breakdown cards once on load.
function renderOverview() {
  const profileEl = document.getElementById('profileCard');
  const langEl = document.getElementById('langCard');

  const stackChips = PROFILE.techStack
    .map((tech) => `<span class="chip">${tech}</span>`)
    .join('');

  profileEl.innerHTML = `
    <div class="section-label" style="margin-bottom:0;">Profile Overview</div>
    <div class="profile-head">
      <span class="profile-name">${PROFILE.name}</span>
      <a class="profile-handle" href="${PROFILE.githubUrl}" target="_blank" rel="noopener">@${PROFILE.handle} ↗</a>
    </div>
    <div class="profile-role">${PROFILE.role}</div>
    <div class="profile-stat">
      <span>Public Repositories:</span>
      <strong>${PROFILE.publicRepos}</strong>
    </div>
    <div class="chips">${stackChips}</div>
  `;

  const langRows = LANGUAGE_BREAKDOWN.map(
    (item) => `
      <div class="lang-row">
        <span class="lang-name">${item.language}</span>
        <span class="lang-count">${item.count}</span>
      </div>`
  ).join('');

  langEl.innerHTML = `
    <div class="section-label" style="margin-bottom:0;">Language Breakdown (${PROFILE.publicRepos} Public Repos)</div>
    <div class="lang-list">${langRows}</div>
  `;
}

// Build the HTML for a single project card linking to its public GitHub repository.
function buildProjectCard(project) {
  const catMeta = CATEGORIES[project.cat];
  const stackTags = project.stack
    .map((tag) => `<span class="chip">${tag}</span>`)
    .join('');
  // Optional status pill shown next to the project title when a project has a status field.
  const statusPill = project.status
    ? `<span class="status-pill">${project.status}</span>`
    : '';

  return `
    <a class="project-card" href="${project.url}" target="_blank" rel="noopener">
      <div class="card-top">
        <div class="card-header">
          <div class="card-title-group">
            <span class="project-title">${project.name}</span>
            ${statusPill}
          </div>
          <span class="ext-arrow" aria-hidden="true">↗</span>
        </div>
        <p class="project-desc">${project.desc}</p>
      </div>
      <div class="card-footer">
        <div class="chips">${stackTags}</div>
        <span class="cat ${catMeta.cssClass}">${catMeta.badge}</span>
      </div>
    </a>
  `;
}

// Render the project cards grouped by category, filtered by search query, category, and language.
function renderProjects() {
  const query = document.getElementById('search').value.trim().toLowerCase();
  const selectedCat = document.getElementById('catFilter').value;
  const selectedLang = document.getElementById('langFilter').value;

  let filtered = PROJECTS.slice();
  if (selectedCat) {
    filtered = filtered.filter((p) => p.cat === selectedCat);
  }
  if (selectedLang) {
    filtered = filtered.filter(
      (p) => p.lang === selectedLang || p.stack.some((s) => s.toLowerCase() === selectedLang.toLowerCase())
    );
  }
  // Search matches repository name, description, primary language, stack tags, and category title.
  if (query) {
    filtered = filtered.filter((p) => {
      const haystack = [
        p.name,
        p.desc,
        p.lang,
        p.status || '',
        p.stack.join(' '),
        CATEGORIES[p.cat].title,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  document.getElementById('count').textContent =
    filtered.length + (filtered.length === 1 ? ' project' : ' projects');
  document.getElementById('noResults').style.display = filtered.length ? 'none' : 'block';

  // Preserve the canonical category order when rendering category sections.
  const categoryOrder = Object.keys(CATEGORIES);
  const groupsHtml = categoryOrder
    .map((catKey) => {
      const items = filtered.filter((p) => p.cat === catKey);
      if (!items.length) return '';
      const cardsHtml = items.map(buildProjectCard).join('');
      return `
        <section class="cat-group">
          <h2 class="cat-group-title">${CATEGORIES[catKey].title}</h2>
          <div class="cards-grid">${cardsHtml}</div>
        </section>
      `;
    })
    .join('');

  document.getElementById('projectsContainer').innerHTML = groupsHtml;
}

document.getElementById('search').addEventListener('input', renderProjects);
document.getElementById('catFilter').addEventListener('change', renderProjects);
document.getElementById('langFilter').addEventListener('change', renderProjects);

renderOverview();
renderProjects();

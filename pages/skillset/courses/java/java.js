// Renders the Java courses list. The dataset (DATA, catLabel, catClass,
// statusLabel, statusClass) comes from java-data.js, which is loaded first.
// A course name links to its local detail page when one exists (the `page`
// field), otherwise out to its course/certificate when a real url is set
// (anything other than "#").

// A course's detail page can override its status via "Mark done" / "Mark
// planned" / "Mark in progress" buttons, saved to localStorage under
// 'course-status:<folder>'. This reads that override when present, falling
// back to the dataset value.
function effectiveStatus(d) {
  if (!d.page) return d.status;
  return localStorage.getItem('course-status:' + d.page) || d.status;
}

// Render the table for the current search query, category filter and status filter.
function render() {
  const query = document.getElementById('search').value.toLowerCase();
  const category = document.getElementById('catFilter').value;
  const status = document.getElementById('statusFilter').value;

  let rows = DATA.map(d => ({ ...d, status: effectiveStatus(d) }));
  if (category) rows = rows.filter(d => d.cat === category);
  if (status) rows = rows.filter(d => d.status === status);
  // Search matches the name, the category label, and the status label.
  if (query) rows = rows.filter(d => (d.n + ' ' + catLabel[d.cat] + ' ' + statusLabel[d.status]).toLowerCase().includes(query));

  document.getElementById('count').textContent = rows.length + ' courses';
  document.getElementById('noResults').style.display = rows.length ? 'none' : 'block';

  document.getElementById('tbody').innerHTML = rows.map((d, i) => {
    // Local detail page takes priority over an external course/certificate link.
    const name = d.page
      ? `<a href="${d.page}/">${d.n}</a>`
      : (d.url && d.url !== '#' ? `<a href="${d.url}" target="_blank" rel="noopener">${d.n}</a>` : d.n);
    return `
      <tr>
        <td><span class="idx">${i + 1}</span></td>
        <td><div class="course">${name}</div></td>
        <td><span class="cat ${catClass[d.cat]}">${catLabel[d.cat]}</span></td>
        <td><span class="status ${statusClass[d.status]}">${statusLabel[d.status]}</span></td>
      </tr>`;
  }).join('');
}

document.getElementById('search').addEventListener('input', render);
document.getElementById('catFilter').addEventListener('change', render);
document.getElementById('statusFilter').addEventListener('change', render);
render();

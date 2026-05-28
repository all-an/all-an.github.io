// Renders the algorithms list. The dataset (DATA, diffLabel, diffClass) comes
// from algorithms-data.js, which is loaded first. A row links to its local
// detail page when one exists (the `page` field); otherwise its name is plain text.

// Render the table for the current search query and difficulty filter.
function render() {
  const query = document.getElementById('search').value.toLowerCase();
  const difficulty = document.getElementById('difficultyFilter').value;

  let rows = DATA;
  if (difficulty) rows = rows.filter(d => d.cat === difficulty);
  // Search matches the name, the technique, and the difficulty label.
  if (query) rows = rows.filter(d => (d.n + ' ' + d.tech + ' ' + diffLabel[d.cat]).toLowerCase().includes(query));

  document.getElementById('count').textContent = rows.length + ' algorithms';
  document.getElementById('noResults').style.display = rows.length ? 'none' : 'block';

  document.getElementById('tbody').innerHTML = rows.map((d, i) => {
    // Link to the local detail page when one exists; otherwise show plain text.
    const href = d.page ? d.page + '/' : null;
    const rowAttrs = href ? ` class="clickable" onclick="location.href='${href}'"` : '';
    // stopPropagation keeps the name link from firing the row handler twice.
    const name = href ? `<a href="${href}" onclick="event.stopPropagation();">${d.n}</a>` : d.n;
    return `
      <tr${rowAttrs}>
        <td><span class="idx">${i + 1}</span></td>
        <td><div class="algo">${name}</div></td>
        <td><span class="diff ${diffClass[d.cat]}">${diffLabel[d.cat]}</span></td>
        <td><span class="tech">${d.tech}</span></td>
      </tr>`;
  }).join('');
}

document.getElementById('search').addEventListener('input', render);
document.getElementById('difficultyFilter').addEventListener('change', render);
render();

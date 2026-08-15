// Shared dataset for the C Programming courses list, loaded before
// c-programming.js so DATA, catLabel, catClass, statusLabel and statusClass
// are available as globals.

// Human-readable label and colour class for each category key.
const catLabel = { concepts:'Concepts', fundamentals:'Fundamentals', pointers:'Pointers & Memory', datastruct:'Data Structures', systems:'Systems & I/O', concurrency:'Concurrency' };
const catClass = { concepts:'cat-concepts', fundamentals:'cat-fundamentals', pointers:'cat-pointers', datastruct:'cat-datastruct', systems:'cat-systems', concurrency:'cat-concurrency' };

// Human-readable label and colour class for each status key.
const statusLabel = { completed:'Completed', inprogress:'In progress', planned:'Planned' };
const statusClass = { completed:'status-completed', inprogress:'status-inprogress', planned:'status-planned' };

// One entry per course: name, category key, status key, and either a local
// `page` (folder name of a detail page written in this repo) or an external
// `url` to the course/certificate ("#" when there isn't one yet).
const DATA = [
  { n: "Text Adventure RPG in C", cat: "concepts", status: "inprogress", page: "000-text-adventure-rpg-in-c" },
];

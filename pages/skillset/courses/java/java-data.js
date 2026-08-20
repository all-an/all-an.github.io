// Shared dataset for the Java courses list, loaded before java.js so DATA,
// catLabel, catClass, statusLabel and statusClass are available as globals.

// Human-readable label and colour class for each category key.
const catLabel = { concepts:'Concepts', oop:'OOP', collections:'Collections', io:'I/O', concurrency:'Concurrency' };
const catClass = { concepts:'cat-concepts', oop:'cat-oop', collections:'cat-collections', io:'cat-io', concurrency:'cat-concurrency' };

// Human-readable label and colour class for each status key.
const statusLabel = { completed:'Completed', inprogress:'In progress', planned:'Planned' };
const statusClass = { completed:'status-completed', inprogress:'status-inprogress', planned:'status-planned' };

// One entry per course: name, category key, status key, and either a local
// `page` (folder name of a detail page written in this repo) or an external
// `url` to the course/certificate ("#" when there isn't one yet).
const DATA = [
  { n: "Text Adventure RPG in Java", cat: "oop", status: "inprogress", page: "000-text-adventure-rpg-in-java" },
];

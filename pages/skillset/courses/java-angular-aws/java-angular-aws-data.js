// Shared dataset for the Java / Angular / AWS courses list, loaded before
// java-angular-aws.js so DATA, catLabel, catClass, statusLabel and
// statusClass are available as globals.

// Human-readable label and colour class for each category key.
const catLabel = { java:'Java', springboot:'Spring Boot', angular:'Angular', aws:'AWS', devops:'DevOps & Testing', fullstack:'Fullstack' };
const catClass = { java:'cat-java', springboot:'cat-springboot', angular:'cat-angular', aws:'cat-aws', devops:'cat-devops', fullstack:'cat-fullstack' };

// Human-readable label and colour class for each status key.
const statusLabel = { completed:'Completed', inprogress:'In progress', planned:'Planned' };
const statusClass = { completed:'status-completed', inprogress:'status-inprogress', planned:'status-planned' };

// One entry per course: name, category key, status key, and either a local
// `page` (folder name of a detail page written in this repo) or an external
// `url` to the course/certificate ("#" when there isn't one yet).
const DATA = [
  { n: "Full-Stack Notes App: Spring Boot, Angular & AWS on Floci", cat: "fullstack", status: "inprogress", page: "000-fullstack-notes-spring-boot-angular-floci" },
];

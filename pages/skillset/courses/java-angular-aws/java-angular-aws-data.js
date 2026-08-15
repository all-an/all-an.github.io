// Shared dataset for the Java / Angular / AWS courses list, loaded before
// java-angular-aws.js so DATA, catLabel, catClass, statusLabel and
// statusClass are available as globals.

// Human-readable label and colour class for each category key.
const catLabel = { java:'Java', springboot:'Spring Boot', angular:'Angular', aws:'AWS', devops:'DevOps & Testing' };
const catClass = { java:'cat-java', springboot:'cat-springboot', angular:'cat-angular', aws:'cat-aws', devops:'cat-devops' };

// Human-readable label and colour class for each status key.
const statusLabel = { completed:'Completed', inprogress:'In progress', planned:'Planned' };
const statusClass = { completed:'status-completed', inprogress:'status-inprogress', planned:'status-planned' };

// One entry per course: name, category key, status key, and an optional link
// to the course or certificate ("#" when there isn't one yet).
const DATA = [
  { n: "Angular Fundamentals: Components & Services", cat: "angular", status: "completed", url: "#" },
];

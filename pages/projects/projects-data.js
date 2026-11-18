// Shared dataset for the Projects / GitHub page, loaded before projects.js so
// PROFILE, LANGUAGE_BREAKDOWN, CATEGORIES, and PROJECTS are available as globals.

// High-level GitHub profile overview displayed in the top summary card.
const PROFILE = {
  name: 'Allan Pereira Abrahão',
  handle: 'all-an',
  githubUrl: 'https://github.com/all-an?tab=repositories&q=&type=public&language=&sort=',
  role: 'Full Stack Software Developer at Aubay Portugal',
  publicRepos: 154,
  techStack: [
    'Java (Spring Boot, Quarkus, GraalVM)',
    'Angular',
    'React',
    'TypeScript / JavaScript',
    'Python',
    'Go',
    'Rust',
    'Zig',
    'Odin',
    'D',
    'Nim',
    'C#',
    'PostgreSQL / MySQL',
    'Kafka',
    'RabbitMQ',
    'Redis',
    'Docker',
    'AWS / Terraform',
  ],
};

// Public repository counts by primary language across all 154 public repos.
const LANGUAGE_BREAKDOWN = [
  { language: 'Java', count: '30' },
  { language: 'HTML / Web', count: '13' },
  { language: 'JavaScript', count: '7' },
  { language: 'C#', count: '7' },
  { language: 'TypeScript', count: '6' },
  { language: 'Python', count: '4' },
  { language: 'Go / Rust / Nim', count: '2 each' },
  { language: 'Zig / D / Odin / C / C++ / Emacs Lisp / PHP / RobotFramework', count: '1 each' },
  { language: 'Markdown / Docs / Multi-language / Forks', count: '71' },
];

// Category metadata: human-readable section title, short badge label, and CSS class.
const CATEGORIES = {
  backend: {
    title: '1. Full-Stack, Backend & Distributed Systems (Java / Go / D)',
    badge: 'Backend & Distributed',
    cssClass: 'cat-backend',
  },
  crypto: {
    title: '2. Cryptocurrency & Nano (XNO) Ecosystem (Zig / Go / Java)',
    badge: 'Crypto & Nano',
    cssClass: 'cat-crypto',
  },
  systems: {
    title: '3. Systems, Editors, Games & Polyglot Explorations',
    badge: 'Systems & Games',
    cssClass: 'cat-systems',
  },
  python: {
    title: '4. Python, Automation & AI',
    badge: 'Python & AI',
    cssClass: 'cat-python',
  },
  profile: {
    title: '5. Profile & Personal Site',
    badge: 'Profile & Web',
    cssClass: 'cat-profile',
  },
  inProgress: {
    title: '6. In Progress',
    badge: 'In Progress',
    cssClass: 'cat-in-progress',
  },
};

// Notable & recently updated public repositories, grouped by category key.
const PROJECTS = [
  // 1. Full-Stack, Backend & Distributed Systems
  {
    name: 'swe-quizzes',
    cat: 'backend',
    lang: 'Java',
    stack: ['Java', 'Spring Boot 3', 'Angular 21', 'PostgreSQL', 'Terraform', 'AWS'],
    desc: 'Full-stack quiz platform using Spring Boot 3, Spring Data JPA, Flyway, PostgreSQL, Angular 21, and AWS deployment (S3 + ECS/Fargate + ALB + RDS).',
    url: 'https://github.com/all-an/swe-quizzes',
  },
  {
    name: 'Java-Kafka-Redis-Replayable-Truthstream',
    cat: 'backend',
    lang: 'Java',
    stack: ['Java', 'Spring Boot', 'Apache Kafka', 'Redis'],
    desc: 'Kafka + Redis + Spring Boot microservices demonstrating durable event sourcing where Redis state can be rebuilt at any time by replaying Kafka.',
    url: 'https://github.com/all-an/Java-Kafka-Redis-Replayable-Truthstream',
  },
  {
    name: 'rinha-2026-allan-d',
    cat: 'backend',
    lang: 'D',
    stack: ['D', 'High Performance', 'Fraud Detection'],
    desc: 'D language implementation for the Rinha de Backend 2026 fraud-detection challenge.',
    url: 'https://github.com/all-an/rinha-2026-allan-d',
  },
  {
    name: 'go-ssr-ts',
    cat: 'backend',
    lang: 'Go',
    stack: ['Go', 'TypeScript', 'SSR'],
    desc: 'Production-ready starter for Server-Side Rendered web apps in Go with TypeScript on the frontend.',
    url: 'https://github.com/all-an/go-ssr-ts',
  },
  {
    name: 'projeto-DevAgro',
    cat: 'backend',
    lang: 'Java',
    stack: ['Java', 'REST API', 'Spring'],
    desc: 'REST API for agricultural production management across farms, companies, employees, and grains.',
    url: 'https://github.com/all-an/projeto-DevAgro',
  },
  {
    name: 'security-best-practices',
    cat: 'backend',
    lang: 'Java',
    stack: ['Java', 'Security', 'Secure Coding'],
    desc: 'Collection of software security best practices, secure coding guidelines, and practical examples for Java.',
    url: 'https://github.com/all-an/security-best-practices',
  },
  {
    name: 'spring-rabbitmq',
    cat: 'backend',
    lang: 'Java',
    stack: ['Java', 'Spring Boot', 'RabbitMQ'],
    desc: 'Spring Boot microservices and asynchronous messaging with RabbitMQ.',
    url: 'https://github.com/all-an/spring-rabbitmq',
  },
  {
    name: 'docker-microservices',
    cat: 'backend',
    lang: 'JavaScript',
    stack: ['Java', 'JavaScript', 'Docker', 'PostgreSQL', 'MongoDB'],
    desc: 'Java APIs on Docker, microservices communication, PostgreSQL, MongoDB, and JavaScript.',
    url: 'https://github.com/all-an/docker-microservices',
  },
  {
    name: 'rest-spring-project',
    cat: 'backend',
    lang: 'Java',
    stack: ['Java', 'Spring Boot', 'Docker', 'Integration Tests'],
    desc: 'Complete RESTful API with Spring Boot, Docker, deployment, and integration testing.',
    url: 'https://github.com/all-an/rest-spring-project',
  },
  {
    name: 'devintransf-tdd-login-auth',
    cat: 'backend',
    lang: 'Java',
    stack: ['Java', 'Spring Boot', 'TDD', 'Auth'],
    desc: 'REST API simulating accounts, customer authentication, and transfers using Spring Boot and TDD.',
    url: 'https://github.com/all-an/devintransf-tdd-login-auth',
  },

  // 2. Cryptocurrency & Nano (XNO) Ecosystem
  {
    name: 'smallnano',
    cat: 'crypto',
    lang: 'Zig',
    stack: ['Zig', 'Block-Lattice', 'Cryptocurrency'],
    desc: 'Lightweight cryptocurrency written in Zig inspired by Nano (block-lattice, weighted voting, fast, zero fees) designed to run on low-end hardware or a $5 VPS.',
    url: 'https://github.com/all-an/smallnano',
  },
  {
    name: 'nanocryptogames',
    cat: 'crypto',
    lang: 'Go',
    stack: ['Go', 'Nano (XNO)', 'Browser Games'],
    desc: 'Collection of browser games built in Go powered by Nano (XNO).',
    url: 'https://github.com/all-an/nanocryptogames',
  },
  {
    name: 'interacting-with-nanocurrency',
    cat: 'crypto',
    lang: 'Java',
    stack: ['Java', 'Nano (XNO)', 'RPC'],
    desc: 'Nano RPC and wallet/account integration project in Java.',
    url: 'https://github.com/all-an/interacting-with-nanocurrency',
  },
  {
    name: 'nano_wallet_rpc_gr0vity_dev',
    cat: 'crypto',
    lang: 'JSON',
    stack: ['JSON', 'Nano RPC', 'Wallet'],
    desc: 'Step-by-step guide and RPC commands for managing a Nano wallet and account.',
    url: 'https://github.com/all-an/nano_wallet_rpc_gr0vity_dev',
  },

  // 3. Systems, Editors, Games & Polyglot Explorations
  {
    name: 'javavim',
    cat: 'systems',
    lang: 'Java',
    stack: ['Java', 'Text Editor', 'Vim'],
    desc: 'Vim-like modal text editor written in Java.',
    url: 'https://github.com/all-an/javavim',
  },
  {
    name: 'java-systems-programming',
    cat: 'systems',
    lang: 'Java',
    stack: ['Java', 'GraalVM', 'Native Memory'],
    desc: 'Sample code demonstrating GraalVM unmanaged and systems-level capabilities.',
    url: 'https://github.com/all-an/java-systems-programming',
  },
  {
    name: 'java-platformer',
    cat: 'systems',
    lang: 'Java',
    stack: ['Java', '2D Game', 'Platformer'],
    desc: '2D platformer game built from scratch in Java.',
    url: 'https://github.com/all-an/java-platformer',
  },
  {
    name: 'java-crazy-snakegame',
    cat: 'systems',
    lang: 'Java',
    stack: ['Java', '2D Game', 'Snake'],
    desc: 'Arcade Snake game written in Java.',
    url: 'https://github.com/all-an/java-crazy-snakegame',
  },
  {
    name: 'nim-conways-game-of-life',
    cat: 'systems',
    lang: 'Nim',
    stack: ['Nim', 'Cellular Automata'],
    desc: "Conway's Game of Life simulation implemented in Nim.",
    url: 'https://github.com/all-an/nim-conways-game-of-life',
  },
  {
    name: 'learn-nim',
    cat: 'systems',
    lang: 'Nim',
    stack: ['Nim', 'Language Study'],
    desc: 'Nim language studies, idioms, and exercises.',
    url: 'https://github.com/all-an/learn-nim',
  },
  {
    name: 'rust-complete-developers-guide',
    cat: 'systems',
    lang: 'Rust',
    stack: ['Rust', 'Systems Programming'],
    desc: 'Rust projects, ownership exercises, and systems programming practice.',
    url: 'https://github.com/all-an/rust-complete-developers-guide',
  },
  {
    name: 'emacs-and-common-lisp',
    cat: 'systems',
    lang: 'Emacs Lisp',
    stack: ['Emacs Lisp', 'Common Lisp'],
    desc: 'Emacs and Common Lisp configurations and workflow setup.',
    url: 'https://github.com/all-an/emacs-and-common-lisp',
  },

  // 4. Python, Automation & AI
  {
    name: 'automate-with-python',
    cat: 'python',
    lang: 'Python',
    stack: ['Python', 'Automation'],
    desc: 'Exercises and automation scripts from Automate the Boring Stuff with Python.',
    url: 'https://github.com/all-an/automate-with-python',
  },
  {
    name: 'sqs-standard-queue-duplicate-processing',
    cat: 'python',
    lang: 'Python',
    stack: ['Python', 'AWS SQS', 'Distributed Queues'],
    desc: 'AWS SQS standard queue duplicate-handling experiments.',
    url: 'https://github.com/all-an/sqs-standard-queue-duplicate-processing',
  },
  {
    name: 'python-alura',
    cat: 'python',
    lang: 'Python',
    stack: ['Python', 'TDD', 'Unit Testing'],
    desc: 'Test-Driven Development (TDD) with Python.',
    url: 'https://github.com/all-an/python-alura',
  },
  {
    name: 'anthropic-academy-courses',
    cat: 'python',
    lang: 'TypeScript',
    stack: ['TypeScript', 'Claude API', 'AI'],
    desc: 'Anthropic Academy course implementations.',
    url: 'https://github.com/all-an/anthropic-academy-courses',
  },

  // 5. Profile & Personal Site
  {
    name: 'all-an',
    cat: 'profile',
    lang: 'JavaScript',
    stack: ['JavaScript', 'Markdown', 'GitHub Profile'],
    desc: 'Profile README and personal website assets.',
    url: 'https://github.com/all-an/all-an',
  },
  {
    name: 'all-an.github.io',
    cat: 'profile',
    lang: 'HTML',
    stack: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages'],
    desc: 'Personal GitHub Pages site featuring interactive learning tools, skillset references, chess, and terminal.',
    url: 'https://github.com/all-an/all-an.github.io',
  },

  // 6. In Progress
  {
    name: 'ymirjdk',
    cat: 'inProgress',
    lang: 'Odin',
    status: 'In Progress',
    stack: ['Odin', 'JDK', 'JVM', 'Bytecode', 'Systems Programming'],
    desc: 'Java Development Kit (JDK) and Virtual Machine implementation written from scratch in the Odin programming language.',
    url: 'https://github.com/all-an/ymirjdk',
  },
];

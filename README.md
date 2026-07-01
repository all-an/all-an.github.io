
## [all-an.github.io](https://all-an.github.io/)

Personal website on github pages

## Run Locally

**With VS Code Live Server:**
1. Install "Live Server" extension
2. Right-click `index.html` → "Open with Live Server"

**With npm:**
```bash
npx live-server
```

**With Python:**
```bash
python -m http.server 8000
```

Then open `http://localhost:8000`

## Programming Concepts (Java)

Runnable concept projects live in `pages/skillset/concepts/`. Each folder has a
`run.sh`; the Maven projects all ship with JUnit 5 tests. Needs a JDK (and Maven
for the Maven projects).

**Maven projects** (folders with a `pom.xml`) — run the tests:
```bash
cd pages/skillset/concepts/089-memory-mapped-file
mvn test          # or: ./run.sh
```

**Single-file projects** (folders with `Main.java`) — compile and run the demo:
```bash
cd pages/skillset/concepts/015-polymorphism-dynamic-dispatch
./run.sh          # runs: javac Main.java && java Main
```

## 🌐 Connect with Me

- 💼 [LinkedIn](https://www.linkedin.com/in/allan-pereira-abrahao/)

---

## 📜 License

[![license](https://img.shields.io/github/license/hrishikeshpaul/portfolio-template?style=flat&logo=appveyor)](https://github.com/all-an/)

- Licensed under the [MIT License](http://opensource.org/licenses/mit-license.php)  
- © 2026 [Allan Pereira Abrahão](https://github.com/all-an/)
- allan8tech@gmail.com

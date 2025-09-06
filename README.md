# Allan's Web Terminal

Hi, I'm **Allan Pereira Abrahão** — a passionate Software Developer.  
This is my interactive web terminal.

A modern, interactive terminal-style portfolio website built for GitHub Pages with Firebase backend integration.

### Frontend (Client-Side)
- **HTML5/CSS3/JavaScript ES6+** - Interactive terminal interface
- **Vanilla JavaScript Modules** - No framework dependencies
- **Responsive Design** - Works on desktop and mobile
- **Real-time UI Updates** - Dynamic content rendering

## Features

- Interactive terminal interface
- Command-line navigation and portfolio exploration
- Python code execution via Pyodide
- Vim editor simulation

## Available Commands

- `help` - Show available commands
- `about` - About me
- `skills` - Technical skills
- `projects` - View projects
- `contact` - Contact form
- `vim <filename>` - Open Vim editor
- `ls` - List files in current directory
- `cat <filename>` - Display file contents  
- `download-files` - Download local files to Downloads folder
- `clear` - Clear terminal

## Vim Editor Features

The built-in vim editor supports:
- Normal, insert, and command modes
- File editing with `:w` (save), `:q` (quit), `:wq` (save & quit)
- Python/JavaScript code execution with `Ctrl+E` (current line) and `Ctrl+X` (entire file)
- Syntax highlighting and line numbers
- Local file storage in browser localStorage

---

## How to Run

### Local Development
```bash
# Clone the repository
git clone https://github.com/all-an/all-an.github.io.git
cd all-an.github.io

# Install dependencies (for testing)
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Serve locally (any HTTP server)
python -m http.server 8000
# or
npx http-server
# or
live-server
```

Open `http://localhost:8000` in your browser.

### GitHub Pages Deployment
1. Push to your GitHub repository
2. Go to repository Settings → Pages
3. Set source to "Deploy from a branch"
4. Select "main" branch and "/ (root)"
5. Your site will be available at `https://username.github.io`

## 🌐 Connect with Me

- 💼 [LinkedIn](https://www.linkedin.com/in/allanpereiraabrahao/)

---

## 📜 License

[![license](https://img.shields.io/github/license/hrishikeshpaul/portfolio-template?style=flat&logo=appveyor)](https://github.com/all-an/)

- Licensed under the [MIT License](http://opensource.org/licenses/mit-license.php)  
- © 2025 [Allan Pereira Abrahão](https://github.com/all-an/)
- allan8tech@gmail.com


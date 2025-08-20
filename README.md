# Allan's Web Terminal

A modern, interactive terminal-style portfolio website built for GitHub Pages with Firebase backend integration.

## 🏗️ Full Stack Architecture

### Frontend (Client-Side)
- **HTML5/CSS3/JavaScript ES6+** - Interactive terminal interface
- **Vanilla JavaScript Modules** - No framework dependencies
- **Responsive Design** - Works on desktop and mobile
- **Real-time UI Updates** - Dynamic content rendering
- **Client-side Authentication** - Firebase Auth integration

### Backend (Firebase Cloud Services)
- **Firebase Authentication** - User registration and login system
- **Firestore Database** - NoSQL document-based data storage
- **Cloud Security Rules** - Server-side data access control  
- **Real-time Synchronization** - Live data updates
- **Scalable Infrastructure** - Google Cloud Platform

### Data Persistence
- **User Management** - Account creation, authentication, sessions
- **File Storage** - Save/load code files with vim editor
- **Message System** - Contact form with database storage
- **User Isolation** - Each user's data is completely separate

### Security Features
- **Authentication Required** - File operations require login
- **User-based Access Control** - Users can only access their own data
- **Domain Restrictions** - API calls limited to authorized domains
- **Firestore Security Rules** - Server-side data protection

### Full Stack Data Flow
```
User Action → Client JavaScript → Firebase SDK → Google Cloud → Firestore Database
     ↓                                                              ↑
Browser UI ← Client Updates ← Real-time Listeners ← Cloud Functions
```

This architecture provides all the benefits of a traditional full stack application (user accounts, data persistence, security) while leveraging modern serverless cloud infrastructure.

Hi, I'm **Allan Pereira Abrahão** — a passionate Software Developer.  
This is my interactive terminal-style portfolio website.

## Features

- Interactive terminal interface
- Command-line navigation and portfolio exploration
- Python code execution via Pyodide
- Vim editor simulation
- Flashcard learning system
- Contact form with Firebase integration
- Tab completion
- Command history

## Firebase Setup

To enable the full-stack functionality:

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Anonymous Authentication
4. Copy your Firebase config and replace the placeholder values in `js/firebase-config.js`

## Project Structure

```
├── index.html          # Main page (GitHub Pages entry point)
├── js/
│   ├── terminal.js     # Terminal functionality
│   ├── vim.js          # Vim editor simulation
│   ├── flashcards.js   # Flashcard system
│   └── firebase-config.js # Firebase configuration
├── css/
│   └── style.css       # Styling
└── assets/             # Static assets
```

## Available Commands

- `help` - Show available commands
- `about` - About me
- `skills` - Technical skills
- `projects` - View projects
- `contact` - Contact form
- `message` - Send a message
- `python` - Execute Python code
- `vim <filename>` - Open Vim editor
- `clear` - Clear terminal

## 🔧 Technologies & Tools

- **Languages & Frameworks:** Java, JavaScript, TypeScript, Python  
- **Testing:** JUnit, TDD, BDD  
- **Databases:** PostgreSQL, MySQL, Flyway  
- **Application Servers:** WildFly, GlassFish  
- **Frontend:** AngularJS, Angular (2+), React  
- **Backend:** Spring (REST APIs), Microservices  
- **DevOps & Messaging:** Docker, Kafka, RabbitMQ  
- **Monitoring & Observability:** Grafana, Kibana
- **Cloud:** AWS

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

# Run with coverage
npm run coverage

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

### Firebase Setup (Required for contact form)
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com/)
2. Enable Firestore Database and Anonymous Authentication
3. Replace config values in `js/firebase-config.js` with your project's config
4. Set Firestore security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{document} {
      allow write: if request.auth != null;
      allow read: if false; // Only you can read via Firebase console
    }
  }
}
```

## Project Structure

```
├── index.html          # Main page (GitHub Pages entry point)
├── js/
│   ├── terminal.js     # Terminal functionality
│   ├── vim.js          # Vim editor simulation
│   ├── flashcards.js   # Flashcard system
│   └── firebase-config.js # Firebase configuration
├── css/
│   └── style.css       # Styling
├── assets/             # Static assets
├── test/               # Test files
│   ├── *.test.js       # All test files
│   └── setup.js        # Test setup
└── package.json        # NPM configuration
```

## 🌐 Connect with Me

- 💼 [LinkedIn](https://www.linkedin.com/in/allanpereiraabrahao/)

---

## 📜 License

[![license](https://img.shields.io/github/license/hrishikeshpaul/portfolio-template?style=flat&logo=appveyor)](https://github.com/all-an/)

- Licensed under the [MIT License](http://opensource.org/licenses/mit-license.php)  
- © 2021 [Allan Pereira Abrahão](https://github.com/all-an/)


// Terminal Logic

let commandHistory = [];
let historyIndex = -1;
let currentInput = '';

// DOM Elements (will be updated dynamically)
let commandInput = document.getElementById('commandInput');
let terminalContent = document.getElementById('terminalContent');
let cursor = document.querySelector('.cursor');
let typedText = document.getElementById('typedText');

// Terminal state
const terminalState = {
    currentDirectory: '',
    userName: '',
    isLoggedIn: false,
    awaitingCloudSimChoice: false,
    vimMode: false,
    vimFilename: '',
    vimContent: '',
    vimCursorRow: 0,
    vimCursorCol: 0,
    vimCurrentMode: 'normal', // 'normal', 'insert', 'command'
    vimCommandBuffer: '',
    vimLastKey: '',
};

// Available commands
const commands = {
    about: {
        description: 'About Allan',
        execute: () => showAbout()
    },
    contact: {
        description: 'Show contact information',
        execute: () => showContact()
    },
    vim: {
        description: 'Open vim editor',
        execute: (args) => openVimEditor(args[0])
    },
    help: {
        description: 'Show available commands',
        execute: () => showHelp()
    },
    whoami: {
        description: 'Display current user',
        execute: () => `${terminalState.userName}`
    },
    pwd: {
        description: 'Show current directory',
        execute: () => `/home/${terminalState.userName}${terminalState.currentDirectory === '~' ? '' : '/' + terminalState.currentDirectory}`
    },
    ls: {
        description: 'List directory contents',
        execute: async () => await executeListDirectory()
    },
    cd: {
        description: 'Change directory',
        execute: (args) => changeDirectory(args[0])
    },
    cat: {
        description: 'Display file contents',
        execute: async (args) => await catFile(args[0])
    },
    run: {
        description: 'Run project application',
        execute: () => runProject()
    },
    clear: {
        description: 'Clear terminal screen',
        execute: () => clearTerminal()
    },
    'download-files': {
        description: 'Download files to Downloads folder',
        execute: () => downloadFiles()
    },
};

// Command execution functions
function downloadFiles() {
    if (terminalState.currentDirectory === '') {
        return downloadLocalFiles();
    } else {
        return 'download-files: Command only available in local mode.';
    }
}

function downloadLocalFiles() {
    try {
        const files = JSON.parse(localStorage.getItem('local-files') || '[]');
        
        if (files.length === 0) {
            return 'No local files found to download.';
        }
        
        let downloadedCount = 0;
        files.forEach(filename => {
            const content = localStorage.getItem(`${filename}`);
            if (content !== null) {
                // Create and trigger download
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                downloadedCount++;
            }
        });
        
        return `Downloaded ${downloadedCount} local files to Downloads folder.`;
    } catch (error) {
        return `Error downloading local files: ${error.message}`;
    }
}


function showHelp() {
    let helpText = 'Available commands:\n\n';
    Object.keys(commands).forEach(cmd => {
        helpText += `  ${cmd.padEnd(12)} - ${commands[cmd].description}\n`;
    });
    return helpText;
}

function getHomeDirectoryFiles() {
    return [];
}

function getLocalFiles() {
    // Get files from localStorage for local directory
    const files = JSON.parse(localStorage.getItem('local-files') || '[]');
    
    // Extract filenames from the file objects and add any direct key files
    const filenames = files.map(file => file.filename || file).filter(Boolean);
    
    // Also check for files stored directly as keys (like hello.py)
    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
        // Skip system keys and the local-files array itself
        if (key !== 'local-files' && !key.startsWith('_') && !filenames.includes(key)) {
            // Check if it looks like a filename (has extension or is reasonable filename)
            if (key.includes('.') || key.match(/^[a-zA-Z0-9_-]+$/)) {
                filenames.push(key);
            }
        }
    }
    
    return filenames.sort();
}


function getDirectoryFiles(directory) {
    switch (directory) {
        case '~':
            return getHomeDirectoryFiles();
        case '':
            return getLocalFiles();
        default:
            return [];
    }
}

async function executeListDirectory() {
    
    // For all other cases, use sync version
    return await listDirectorySync();
}

async function listDirectorySync() {
    const files = getDirectoryFiles(terminalState.currentDirectory);
    
    // Show files for local directory
    if (terminalState.currentDirectory === '') {
        const localFiles = files.length > 0 ? files.join('  ') : '';
        
        return `📁 Local Files:
   ${localFiles || 'No files found in local storage.'}
   
   ℹ️  Note: Files are stored in browser localStorage
   📝 Use 'vim filename' to create/edit files`;
    }
    
    return files.length > 0 ? files.join('  ') : 'No files found in this directory.';
}


function getProjectFiles(directory) {
    if (directory === 'projects') {
        return {
            'README.md': `# Allan's Projects

Welcome to my project directory! Here you'll find various software projects I've developed.

No projects are currently available.`
        };
    }
    return {};
}

async function catFile(filename) {
    const homeFiles = {};
    
    if (!filename) {
        return 'cat: missing file operand\nUsage: cat <filename>';
    }
    
    // Check project-specific files first
    const projectFiles = getProjectFiles(terminalState.currentDirectory);
    if (projectFiles[filename]) {
        return projectFiles[filename];
    }
    
    // Check home directory files
    if (terminalState.currentDirectory === '~' && homeFiles[filename]) {
        return homeFiles[filename];
    }
    
    // Check Firebase for the file
    if (terminalState.currentDirectory === '~' && terminalState.isLoggedIn) {
        try {
            const result = await window.loadFile(filename);
            if (result.success) {
                return result.content;
            }
        } catch (error) {
            console.log('File not found in Firebase:', filename);
        }
    }
    
    return `cat: ${filename}: No such file or directory`;
}

function showAbout() {
    return `Allan Pereira Abrahão
Software Engineer & Full-Stack Developer

Location: Brazil
Experience: 3+ years in software development

Passionate about creating scalable, efficient solutions and solving 
complex technical challenges. Experienced in full-stack development,
cloud technologies, and system architecture.

Interests:
- Microservices architecture
- Cloud computing (AWS, Azure)
- DevOps practices
- Open source contributions`;
}

function showSkills() {
    return `Technical Skills:

Backend Technologies:
  • Java (Spring Boot, Spring Framework)
  • Go (Gin, Fiber)
  • Python (Django, Flask)
  • Node.js (Express, NestJS)

Frontend Technologies:
  • JavaScript (ES6+, TypeScript)
  • Angular (2+, RxJS)
  • React (Hooks, Redux)
  • HTML5, CSS3, SASS

Databases:
  • PostgreSQL
  • MySQL
  • MongoDB
  • Redis

DevOps & Cloud:
  • Docker & Kubernetes
  • AWS (EC2, S3, Lambda, RDS)
  • CI/CD (Jenkins, GitHub Actions)
  • Linux administration
  • Prometheus, Grafana
  • Elasticsearch, Kibana

Tools & Practices:
  • Git version control
  • Agile/Scrum methodologies
  • Test-driven development
  • Code review processes`;
}


function showContact() {
    return `Contact Information:

🔗 GitHub: <a href="https://github.com/all-an" target="_blank" style="color: #0080ff; text-decoration: underline;">https://github.com/all-an</a>
💼 LinkedIn: <a href="https://www.linkedin.com/in/allan-pereira-abrahao/" target="_blank" style="color: #0080ff; text-decoration: underline;">https://www.linkedin.com/in/allan-pereira-abrahao/</a>

Feel free to reach out for collaboration opportunities,
technical discussions, or just to say hello!`;
}




function clearTerminal() {
    // Remove all content except welcome message and current line
    const welcomeMsg = document.querySelector('.welcome-message');
    
    // Create new current line with proper structure
    const newCurrentLine = document.createElement('div');
    newCurrentLine.className = 'terminal-line current-line';
    newCurrentLine.innerHTML = `
        <span class="prompt">${getPrompt()}</span>
        <span id="typedText" class="typed-text"></span>
        <span class="cursor">_</span>
        <input type="text" id="commandInput" class="command-input" autocomplete="off" autofocus>
    `;
    
    // Clear content and rebuild
    terminalContent.innerHTML = '';
    if (welcomeMsg) terminalContent.appendChild(welcomeMsg.cloneNode(true));
    terminalContent.appendChild(document.createElement('br'));
    terminalContent.appendChild(newCurrentLine);
    
    // Re-initialize input handling after clear
    setTimeout(() => {
        reinitializeInput();
    }, 50);
    
    return '';
}

function reinitializeInput() {
    // Update DOM element references
    commandInput = document.getElementById('commandInput');
    typedText = document.getElementById('typedText');
    cursor = document.querySelector('.cursor');
    
    if (commandInput && typedText) {
        // Remove any existing listeners first to prevent duplicates
        commandInput.removeEventListener('keydown', handleKeyPress);
        commandInput.removeEventListener('input', handleInput);
        commandInput.removeEventListener('blur', ensureFocus);
        
        // Re-setup input events
        commandInput.addEventListener('keydown', handleKeyPress);
        commandInput.addEventListener('input', handleInput);
        commandInput.addEventListener('blur', ensureFocus);
        
        // Re-setup focus events for new input
        setupFocusEventsForInput(commandInput);
        
        // Ensure focus
        commandInput.focus();
    }
}

function setupFocusEventsForInput(inputElement) {
    // Remove old listeners to avoid duplicates
    document.removeEventListener('click', ensureFocus);
    document.removeEventListener('mousedown', ensureFocus);
    document.removeEventListener('mouseup', ensureFocus);
    
    // Add new listener that respects text selection
    document.addEventListener('click', (event) => {
        // Don't focus if user is selecting text
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return;
        }
        
        // Delay focus to allow text selection to complete
        setTimeout(() => ensureFocus(event), 100);
    });
}

function changeDirectory(path) {
    if (!path) {
        return 'cd: missing operand\nUsage: cd <directory>';
    }
    
    if (path === '..') {
        if (terminalState.currentDirectory.startsWith('projects/')) {
            terminalState.currentDirectory = 'projects';
            updatePrompt();
            return '';
        } else if (terminalState.currentDirectory === 'projects') {
            terminalState.currentDirectory = '~';
            updatePrompt();
            return '';
        } else if (terminalState.currentDirectory === '') {
            terminalState.currentDirectory = '~';
            updatePrompt();
            return '';
        } else if (terminalState.currentDirectory === 'firebase') {
            terminalState.currentDirectory = '~';
            updatePrompt();
            return '';
        }
    } else if (path === 'projects' && terminalState.currentDirectory === '~') {
        terminalState.currentDirectory = 'projects';
        updatePrompt();
        return '';
    } else if (terminalState.currentDirectory === 'projects') {
        // Navigate to project subdirectories
        if (path === 'portfolio-terminal') {
            terminalState.currentDirectory = 'projects/portfolio-terminal';
            updatePrompt();
            return '';
        }
    }
    
    return `cd: ${path}: No such directory`;
}

function handleTimeUp(card) {
    // Remove progress bar since time is up
    const existingBars = document.querySelectorAll('.timer-container');
    existingBars.forEach(bar => bar.parentElement.remove());
    
    addOutput('');
    addOutput('⏰ Time\'s up!');
    addOutput(`Correct answer: ${card.correct_answer || card.answer}`);
    
    // Record as incorrect with max time
    const timeScore = card.time;
    recordAnswer(false, timeScore);
    
    setTimeout(() => {
        nextQuestionOrEnd();
    }, 2000);
}



function openVimEditor(filename) {
    if (!filename) {
        filename = 'untitled.py';
    }
    
    // Create and show the modal vim editor
    if (window.VimEditor) {
        const vimEditor = new window.VimEditor();
        const modal = vimEditor.createModal(filename);
        
        // Disable body scrolling for true fullscreen
        document.body.style.overflow = 'hidden';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.margin = '0';
        document.documentElement.style.padding = '0';
        
        document.body.appendChild(modal);
        
        // Load file content into the vim editor
        loadFileIntoVimEditor(filename, vimEditor);
        
        // Make addOutput available to vim editor
        window.addOutput = addOutput;
    } else {
        return 'Error: Vim editor not available';
    }
    
    return ''; // Don't show any output, vim will handle display
}

async function loadFileIntoVimEditor(filename, vimEditor) {
    try {
        const result = await window.loadFile(filename);
        if (result.success) {
            vimEditor.initializeContent(result.content);
        } else {
            // New file - use default content
            vimEditor.initializeContent();
        }
    } catch (error) {
        // New file or error - start with default content
        vimEditor.initializeContent();
    }
}


// Terminal UI functions
function addOutput(output, isCommand = false) {
    if (output === '') return;
    
    // Handle test environment where terminalContent might not exist
    if (!terminalContent) {
        terminalContent = document.getElementById('terminalContent');
        if (!terminalContent) {
            // In test environment, just track the output
            if (typeof global !== 'undefined' && global.addOutputCalls) {
                global.addOutputCalls.push(output);
            }
            return;
        }
    }
    
    const currentLine = document.querySelector('.current-line');
    const outputDiv = document.createElement('div');
    outputDiv.className = 'output';
    
    if (isCommand) {
        outputDiv.innerHTML = `<span class="prompt">${getPrompt()}</span><span class="command">${output}</span>`;
    } else {
        outputDiv.innerHTML = output.replace(/\n/g, '<br>');
    }
    
    terminalContent.insertBefore(outputDiv, currentLine);
    scrollToBottom();
}

function getPrompt() {
    return `${terminalState.userName}${terminalState.currentDirectory}$`;
}

function updatePrompt() {
    // Create a fresh command line with updated prompt
    refreshCurrentLine();
}

function refreshCurrentLine() {
    const currentLine = document.querySelector('.current-line');
    if (!currentLine) return;
    
    // Create new current line with updated prompt
    const newCurrentLine = document.createElement('div');
    newCurrentLine.className = 'terminal-line current-line';
    newCurrentLine.innerHTML = `
        <span class="prompt">${getPrompt()}</span>
        <span id="typedText" class="typed-text"></span>
        <span class="cursor">_</span>
        <input type="text" id="commandInput" class="command-input" autocomplete="off" autofocus>
    `;
    
    // Replace the old current line with the new one
    currentLine.parentNode.replaceChild(newCurrentLine, currentLine);
    
    // Update DOM references
    commandInput = document.getElementById('commandInput');
    typedText = document.getElementById('typedText');
    cursor = document.querySelector('.cursor');
    
    // Ensure focus and setup events for new input
    ensureFocus();
    setupInputEvents();
    scrollToBottom();
}

function scrollToBottom() {
    const terminal = document.getElementById('terminal');
    terminal.scrollTop = terminal.scrollHeight;
}


// Input handling functions
function processCommand(input) {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    
    // Add command to history
    commandHistory.unshift(trimmedInput);
    historyIndex = -1;
    
    // Display the command
    addOutput(trimmedInput, true);
    
    // Parse command and arguments
    const parts = trimmedInput.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    // Execute command
    if (commands[command]) {
        const result = commands[command].execute(args);
        if (result && typeof result.then === 'function') {
            // Handle async commands
            result.then(output => {
                if (output) {
                    addOutput(output);
                }
            }).catch(error => {
                addOutput(`Error: ${error.message}`);
            });
        } else if (result) {
            addOutput(result);
        }
    } else {
        addOutput(`Command not found: ${command}. Type 'help' for available commands.`);
    }
    
    // Special command handling
    if (command === 'clear') {
        // Clear was handled in the command function
        return;
    }
    
    
}

function handleKeyPress(event) {
    
    if (event.key === 'Enter') {
        event.preventDefault();
        const input = commandInput.value;
        processCommand(input);
        commandInput.value = '';
        typedText.textContent = '';
        currentInput = '';
        return;
    }
    
    if (event.key === 'ArrowUp') {
        event.preventDefault();
        navigateHistory('up');
        return;
    }
    
    if (event.key === 'ArrowDown') {
        event.preventDefault();
        navigateHistory('down');
        return;
    }
    
    if (event.key === 'Tab') {
        event.preventDefault();
        handleTabCompletion();
        return;
    }
    
    // Update current input for history
    currentInput = commandInput.value;
}

function handleInput(event) {
    // Don't update display if in vim mode
    if (terminalState.vimMode) {
        return;
    }
    
    // Update the visual display of typed text
    if (typedText) {
        // Replace spaces with non-breaking spaces to ensure they're visible
        const value = event.target.value.replace(/ /g, '\u00A0');
        typedText.textContent = value;
    }
}

function handleTabCompletion() {
    const input = commandInput.value;
    const cursorPos = commandInput.selectionStart;
    const beforeCursor = input.substring(0, cursorPos);
    const afterCursor = input.substring(cursorPos);
    
    const completions = getCompletions(beforeCursor);
    
    if (completions.length === 1) {
        // Single completion - apply it
        const completion = completions[0];
        const newValue = completion + afterCursor;
        commandInput.value = newValue;
        typedText.textContent = newValue;
        commandInput.setSelectionRange(completion.length, completion.length);
    } else if (completions.length > 1) {
        // Multiple completions - show them
        showCompletions(completions);
    }
}

function getCompletions(input) {
    const parts = input.split(' ');
    
    if (parts.length === 1) {
        // Command completion
        const commandPrefix = parts[0];
        return Object.keys(commands)
            .filter(cmd => cmd.startsWith(commandPrefix))
            .map(cmd => cmd + ' ');
    } else if (parts.length >= 2) {
        // File/directory completion
        const command = parts[0];
        const pathPrefix = parts[parts.length - 1];
        
        if (command === 'cd' || command === 'cat' || command === 'ls') {
            return getPathCompletions(pathPrefix, input);
        }
    }
    
    return [];
}

function getPathCompletions(pathPrefix, fullInput) {
    const currentFiles = getDirectoryFiles(terminalState.currentDirectory);
    const matchingFiles = currentFiles.filter(file => file.startsWith(pathPrefix));
    
    return matchingFiles.map(file => {
        const beforeLastWord = fullInput.substring(0, fullInput.lastIndexOf(' ') + 1);
        const completion = beforeLastWord + file;
        
        // Add space after directories (those ending with /)
        if (file.endsWith('/')) {
            return completion;
        } else {
            return completion + ' ';
        }
    });
}

function showCompletions(completions) {
    if (completions.length === 0) return;
    
    // Show available completions
    const completionText = completions.map(comp => comp.trim()).join('  ');
    addOutput(`Available completions: ${completionText}`);
    
    // Find common prefix
    const commonPrefix = findCommonPrefix(completions);
    if (commonPrefix && commonPrefix.length > commandInput.value.length) {
        commandInput.value = commonPrefix;
        typedText.textContent = commonPrefix;
        commandInput.setSelectionRange(commonPrefix.length, commonPrefix.length);
    }
}

function findCommonPrefix(strings) {
    if (strings.length === 0) return '';
    if (strings.length === 1) return strings[0];
    
    const firstString = strings[0];
    let commonLength = 0;
    
    for (let i = 0; i < firstString.length; i++) {
        const char = firstString[i];
        if (strings.every(str => str[i] === char)) {
            commonLength = i + 1;
        } else {
            break;
        }
    }
    
    return firstString.substring(0, commonLength);
}

function navigateHistory(direction) {
    if (direction === 'up' && historyIndex < commandHistory.length - 1) {
        historyIndex++;
        commandInput.value = commandHistory[historyIndex];
        typedText.textContent = commandHistory[historyIndex];
    } else if (direction === 'down') {
        if (historyIndex > 0) {
            historyIndex--;
            commandInput.value = commandHistory[historyIndex];
            typedText.textContent = commandHistory[historyIndex];
        } else if (historyIndex === 0) {
            historyIndex = -1;
            commandInput.value = currentInput;
            typedText.textContent = currentInput;
        }
    }
}



// Focus management functions
// Global flag to control terminal focus management
window.terminalFocusEnabled = true;

function ensureFocus(event) {
    // Don't steal focus if user is selecting text
    if (window.getSelection && window.getSelection().toString().length > 0) {
        return;
    }
    
    // Don't steal focus if user is in the middle of a text selection
    if (event && (event.type === 'mousedown' || event.type === 'mouseup')) {
        // Check if this is part of a text selection gesture
        const selection = window.getSelection();
        if (selection && (selection.isCollapsed === false || event.detail > 1)) {
            return;
        }
    }
    
    // Always maintain focus on input to capture keyboard events, even in vim mode
    if (commandInput) {
        commandInput.focus();
    }
}


function setupFocusEvents() {
    if (!commandInput) return;
    
    // Re-focus when clicking anywhere, but allow text selection
    document.addEventListener('click', (event) => {
        // Don't focus if vim modal editor is open
        if (document.querySelector('.vim-editor-modal')) {
            return;
        }
        
        // Don't focus if user is selecting text or clicked on selectable content
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            return;
        }
        
        // Delay focus to allow text selection to complete
        setTimeout(() => ensureFocus(event), 100);
    });
    
    // Don't interfere with mousedown/mouseup for text selection
    // Only handle blur events
    commandInput.addEventListener('blur', (event) => {
        // Don't refocus if vim modal editor is open
        if (document.querySelector('.vim-editor-modal')) {
            return;
        }
        
        // Delay refocus to allow text selection
        setTimeout(() => ensureFocus(event), 50);
    });
}

function setupVisibilityEvents() {
    // Re-focus when page becomes visible
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            ensureFocus();
        }
    });
    
    // Re-focus when window gains focus
    window.addEventListener('focus', ensureFocus);
}

function setupInputEvents() {
    if (!commandInput) return;
    
    commandInput.addEventListener('keydown', handleKeyPress);
    commandInput.addEventListener('input', handleInput);
}

function initializeInputFocus() {
    if (!commandInput) return;
    
    ensureFocus();
    // Force focus after a short delay to ensure DOM is ready
    setTimeout(ensureFocus, 100);
}

function setupModalEvents() {
    // Modal events removed - using terminal-based messaging instead
}

function setupEscapeKeyHandler() {
    // ESC key handling moved to vim.js for vim mode
}

// Initialize terminal

function initTerminal() {
    initializeInputFocus();
    setupFocusEvents();
    setupVisibilityEvents();
    setupInputEvents();
    setupModalEvents();
    setupEscapeKeyHandler();
}

// Make functions globally accessible
window.clearTerminal = clearTerminal;
window.navigateHistory = navigateHistory;

// Start terminal when page loads
document.addEventListener('DOMContentLoaded', initTerminal);

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        terminalState,
        showHelp,
        getHomeDirectoryFiles,
        getDirectoryFiles,
        listDirectorySync,
        executeListDirectory,
        getProjectFiles,
        catFile,
        changeDirectory,
        showAbout,
        showSkills,
        showContact,
        processCommand,
        getPrompt,
        updatePrompt,
        refreshCurrentLine,
        navigateHistory,
        ensureFocus,
        setupFocusEvents,
        setupVisibilityEvents,
        setupInputEvents,
        initializeInputFocus,
        setupModalEvents,
        setupEscapeKeyHandler,
        initTerminal,
        openVimEditor,
        handleTabCompletion,
        getCompletions,
        getPathCompletions,
        showCompletions,
        findCommonPrefix,
        downloadFiles,
        downloadLocalFiles
    };

}
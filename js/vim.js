/**
 * Advanced Vim Editor for Web Terminal
 * Provides a real vim-like editing experience with line numbers and cursor control
 */

class VimEditor {
    constructor() {
        this.mode = 'normal';
        this.commandBuffer = '';
        this.content = '';
        this.cursorRow = 0;
        this.cursorCol = 0;
        this.currentFilename = '';
        this.lastKey = '';
        
        // DOM elements (set when modal is created)
        this.modal = null;
        this.textarea = null;
        this.contentArea = null;
        this.cursor = null;
        this.lineNumbers = null;
        this.statusLeft = null;
        this.statusRight = null;
        this.title = null;
    }

    createModalOverlay() {
        const modal = document.createElement('div');
        modal.className = 'vim-editor-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100vh;
            background: #1e1e1e;
            z-index: 10001;
            display: block;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            overflow: hidden;
        `;
        return modal;
    }

    createEditorContainer() {
        const editor = document.createElement('div');
        editor.className = 'vim-editor';
        editor.style.cssText = `
            width: 100vw;
            height: 100vh;
            background: #1e1e1e;
            border: none;
            border-radius: 0;
            display: flex;
            flex-direction: column;
            color: #d4d4d4;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        `;
        return editor;
    }

    createHeader(filename) {
        const header = document.createElement('div');
        header.style.cssText = `
            background: #2d2d30;
            padding: 8px 15px;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 18px;
        `;
        
        this.title = document.createElement('span');
        this.title.textContent = filename;
        this.title.style.fontWeight = 'bold';
        
        const commands = document.createElement('span');
        commands.style.cssText = 'font-size: 16px; color: #888;';
        commands.textContent = 'ESC :w=save :q=quit :wq=save&quit Ctrl+E=exec line Ctrl+X=exec file :t=focus terminal :c=focus code i=insert h/j/k/l=navigate';
        
        header.appendChild(this.title);
        header.appendChild(commands);
        
        return header;
    }

    createEditingArea() {
        const mainArea = document.createElement('div');
        mainArea.style.cssText = `
            flex: 1;
            display: flex;
            position: relative;
            overflow: hidden;
        `;
        
        // Create editor pane (left side)
        const editorPane = document.createElement('div');
        editorPane.className = 'vim-editor-pane';
        editorPane.style.cssText = `
            flex: 1;
            display: flex;
            position: relative;
            overflow: hidden;
        `;
        
        this.lineNumbers = this.createLineNumbers();
        const textContainer = this.createTextContainer();
        
        editorPane.appendChild(this.lineNumbers);
        editorPane.appendChild(textContainer);
        
        // Create terminal pane (right side)
        this.terminalPane = document.createElement('div');
        this.terminalPane.className = 'vim-terminal-pane';
        this.terminalPane.style.cssText = `
            flex: 1;
            display: none;
            flex-direction: column;
            border-left: 1px solid #555;
            background: #1a1a1a;
        `;
        
        // Terminal header
        const terminalHeader = document.createElement('div');
        terminalHeader.className = 'vim-terminal-header';
        terminalHeader.style.cssText = `
            padding: 5px 10px;
            background: #2a2a2a;
            color: #ccc;
            border-bottom: 1px solid #555;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        terminalHeader.innerHTML = `
            <span>Python Output</span>
            <button class="vim-terminal-close" style="background: none; border: none; color: #ccc; cursor: pointer; font-size: 16px;">&times;</button>
        `;
        
        // Terminal content (output area)
        this.terminalContent = document.createElement('div');
        this.terminalContent.className = 'vim-terminal-content';
        this.terminalContent.style.cssText = `
            flex: 1;
            padding: 10px;
            color: #00ff00;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 20px;
            overflow-y: auto;
            white-space: pre-wrap;
            background: #000;
        `;
        
        // Terminal input area
        this.terminalInputArea = document.createElement('div');
        this.terminalInputArea.style.cssText = `
            padding: 10px;
            background: #000;
            border-top: 1px solid #555;
            display: flex;
            align-items: center;
        `;
        
        const promptSpan = document.createElement('span');
        promptSpan.textContent = '>>> ';
        promptSpan.style.cssText = `
            color: #00ff00;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 20px;
        `;
        
        this.terminalInput = document.createElement('input');
        this.terminalInput.type = 'text';
        this.terminalInput.style.cssText = `
            flex: 1;
            background: transparent;
            border: none;
            outline: none;
            color: #00ff00;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 20px;
            margin-left: 5px;
        `;
        
        this.terminalInputArea.appendChild(promptSpan);
        this.terminalInputArea.appendChild(this.terminalInput);
        
        this.terminalPane.appendChild(terminalHeader);
        this.terminalPane.appendChild(this.terminalContent);
        this.terminalPane.appendChild(this.terminalInputArea);
        
        // Setup terminal input handling
        this.terminalInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                const command = this.terminalInput.value.trim();
                if (command) {
                    await this.executeTerminalCommand(command);
                    this.terminalInput.value = '';
                }
            }
        });
        
        mainArea.appendChild(editorPane);
        mainArea.appendChild(this.terminalPane);
        
        // Setup terminal close button
        const closeBtn = terminalHeader.querySelector('.vim-terminal-close');
        closeBtn.addEventListener('click', () => {
            this.hideTerminal();
        });
        
        return mainArea;
    }

    createLineNumbers() {
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'vim-line-numbers';
        lineNumbers.style.cssText = `
            background: #252526;
            border-right: 1px solid #333;
            padding: 8px 8px 8px 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 20px;
            line-height: 1.4;
            color: #858585;
            text-align: right;
            min-width: 40px;
            user-select: none;
            white-space: pre;
        `;
        return lineNumbers;
    }

    createTextContainer() {
        const textContainer = document.createElement('div');
        textContainer.style.cssText = `
            flex: 1;
            position: relative;
            overflow: auto;
        `;
        
        this.textarea = this.createHiddenTextarea();
        this.contentArea = this.createContentArea();
        this.cursor = this.createCursor();
        
        textContainer.appendChild(this.textarea);
        textContainer.appendChild(this.contentArea);
        textContainer.appendChild(this.cursor);
        
        return textContainer;
    }

    createHiddenTextarea() {
        const textarea = document.createElement('textarea');
        textarea.style.cssText = `
            position: absolute;
            top: -9999px;
            left: -9999px;
            opacity: 0;
        `;
        return textarea;
    }

    createContentArea() {
        const contentArea = document.createElement('pre');
        contentArea.className = 'vim-content';
        contentArea.style.cssText = `
            margin: 0;
            padding: 8px 12px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 20px;
            line-height: 1.4;
            color: #d4d4d4;
            background: transparent;
            white-space: pre;
            overflow: visible;
            cursor: text;
            min-height: 100%;
            position: relative;
        `;
        return contentArea;
    }

    createCursor() {
        const cursor = document.createElement('span');
        cursor.className = 'vim-cursor';
        cursor.style.cssText = `
            position: absolute;
            width: 8px;
            height: 18px;
            background: #528bff;
            z-index: 100;
            pointer-events: none;
            animation: vim-cursor-blink 1s infinite;
        `;
        
        this.ensureCursorStyles();
        
        return cursor;
    }

    ensureCursorStyles() {
        if (!document.getElementById('vim-cursor-styles')) {
            const style = document.createElement('style');
            style.id = 'vim-cursor-styles';
            style.textContent = `
                @keyframes vim-cursor-blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.3; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createStatusBar() {
        const statusBar = document.createElement('div');
        statusBar.className = 'vim-status';
        statusBar.style.cssText = `
            background: #007acc;
            color: #fff;
            padding: 4px 15px;
            font-size: 16px;
            border-top: 1px solid #333;
            display: flex;
            justify-content: space-between;
        `;
        
        this.statusLeft = document.createElement('span');
        this.statusLeft.textContent = '-- NORMAL --';
        
        this.statusRight = document.createElement('span');
        this.statusRight.textContent = 'Line 1, Col 1';
        
        statusBar.appendChild(this.statusLeft);
        statusBar.appendChild(this.statusRight);
        
        return statusBar;
    }

    createModal(filename) {
        this.currentFilename = filename;
        
        const modal = this.createModalOverlay();
        const editor = this.createEditorContainer();
        const header = this.createHeader(filename);
        const editingArea = this.createEditingArea();
        const statusBar = this.createStatusBar();
        
        editor.appendChild(header);
        editor.appendChild(editingArea);
        editor.appendChild(statusBar);
        modal.appendChild(editor);
        
        this.modal = modal;
        this.setupEventHandlers();
        
        return modal;
    }

    setupEventHandlers() {
        // Handle keydown events on the textarea for better keyboard event capture
        this.textarea.addEventListener('keydown', async (e) => {
            e.preventDefault(); // Prevent default textarea behavior
            e.stopPropagation(); // Stop event from bubbling up
            await this.handleKeydown(e);
        });
        
        // Backup handler on modal for any missed events
        this.modal.addEventListener('keydown', async (e) => {
            // Only handle if textarea didn't already handle it
            if (e.target !== this.textarea) {
                e.preventDefault();
                e.stopPropagation();
                await this.handleKeydown(e);
            }
        });
        
        // Focus management
        this.modal.addEventListener('click', () => {
            this.focusEditor();
        });
        
        // Make modal focusable so it can receive keydown events
        this.modal.setAttribute('tabindex', '-1');
        
        // Remove focus from terminal input and focus on vim editor
        const terminalInput = document.getElementById('commandInput');
        if (terminalInput) {
            terminalInput.blur();
        }
        
        // Force focus on vim editor with multiple attempts
        this.focusEditor();
    }

    focusEditor() {
        // More aggressive focus strategy to overcome terminal interference
        this.textarea.focus();
        
        // Disable terminal focus management while vim is active
        if (window.terminalFocusEnabled !== undefined) {
            window.terminalFocusEnabled = false;
        }
        
        // Multiple focus attempts with increasing delays
        setTimeout(() => {
            this.textarea.focus();
        }, 10);
        
        setTimeout(() => {
            this.textarea.focus();
        }, 50);
        
        setTimeout(() => {
            this.textarea.focus();
        }, 100);
        
        setTimeout(() => {
            this.textarea.focus();
        }, 200);
    }

    destroy() {
        // Clean up modal and all its event listeners
        if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
        }
        // Modal removal automatically cleans up its event listeners
        
        // Restore body scrolling and styles
        document.body.style.overflow = '';
        document.body.style.margin = '';
        document.body.style.padding = '';
        document.documentElement.style.overflow = '';
        document.documentElement.style.margin = '';
        document.documentElement.style.padding = '';
        
        // Re-enable terminal focus management
        if (window.terminalFocusEnabled !== undefined) {
            window.terminalFocusEnabled = true;
        }
        
        // Return focus to terminal
        const terminalInput = document.getElementById('commandInput');
        if (terminalInput) {
            setTimeout(() => {
                terminalInput.focus();
            }, 100);
        }
    }

    initializeContent(initialContent = '') {
        this.content = initialContent || '';
        this.updateDisplay();
        this.moveCursor(0, 0);
    }

    updateDisplay() {
        const lines = this.content.split('\n');
        
        // Update line numbers
        const lineNumbersText = lines.map((_, i) => 
            String(i + 1).padStart(3, ' ')
        ).join('\n');
        this.lineNumbers.textContent = lineNumbersText;
        
        // Update content with highlighting for executed lines
        this.contentArea.innerHTML = '';
        lines.forEach((line, index) => {
            const lineElement = document.createElement('div');
            lineElement.style.cssText = 'margin: 0; padding: 0; line-height: 1.4; white-space: pre;';
            
            // Check if line has execution output
            const outputMatch = line.match(/^(.*)( → .*)$/);
            if (outputMatch && index === this.cursorRow) {
                // Only highlight the output part and only when cursor is on this line
                const [, codepart, outputPart] = outputMatch;
                
                const codeSpan = document.createElement('span');
                codeSpan.textContent = codepart;
                
                const outputSpan = document.createElement('span');
                outputSpan.textContent = outputPart;
                outputSpan.style.backgroundColor = 'rgba(82, 139, 255, 0.2)';
                outputSpan.style.borderRadius = '2px';
                outputSpan.style.padding = '0 2px';
                
                lineElement.appendChild(codeSpan);
                lineElement.appendChild(outputSpan);
            } else {
                lineElement.textContent = line || ' '; // Empty lines need space to maintain height
            }
            
            this.contentArea.appendChild(lineElement);
        });
        
        
        // Update status
        this.updateStatus();
    }

    updateStatus() {
        const modeText = {
            'insert': '-- INSERT --',
            'normal': '-- NORMAL --',
            'visual': '-- VISUAL --',
            'command': this.commandBuffer
        };
        this.statusLeft.textContent = modeText[this.mode] || '';
        
        this.statusRight.textContent = `Line ${this.cursorRow + 1}, Col ${this.cursorCol + 1}`;
        
        // Update cursor appearance based on mode
        if (this.mode === 'insert') {
            this.cursor.style.background = '#528bff';
            this.cursor.style.width = '2px';
        } else {
            this.cursor.style.background = '#ff6b6b';
            this.cursor.style.width = '8px';
        }
    }

    moveCursor(row, col) {
        debugger;
        const lines = this.content.split('\n');
        const previousRow = this.cursorRow;
        
        // Clamp row
        this.cursorRow = Math.max(0, Math.min(row, lines.length - 1));
        
        // Clear execution markers from previous line if cursor moved to different line
        if (previousRow !== this.cursorRow && lines[previousRow]) {
            lines[previousRow] = this.clearExecutionComments(lines[previousRow]);
            this.content = lines.join('\n');
        }
        
        // Clamp column
        const lineLength = lines[this.cursorRow] ? lines[this.cursorRow].length : 0;
        if (this.mode === 'insert') {
            // In insert mode, cursor can go up to and including the end (after last character)
            this.cursorCol = Math.max(0, Math.min(col, lineLength));
        } else {
            // In normal mode, cursor can go up to the last character (not beyond)
            this.cursorCol = Math.max(0, Math.min(col, Math.max(0, lineLength - 1)));
        }
        
        
        // Update display to refresh highlighting
        this.updateDisplay();
        
        // Position cursor visually using actual character measurements
        this.positionCursor();
    }

    positionCursor() {
        // Get the current line content up to cursor position
        const lines = this.content.split('\n');
        const currentLine = lines[this.cursorRow] || '';
        const textBeforeCursor = currentLine.substring(0, this.cursorCol);
        
        // Use a more accurate measurement by directly measuring against the contentArea
        const computedStyle = window.getComputedStyle(this.contentArea);
        const fontSize = parseFloat(computedStyle.fontSize);
        const fontFamily = computedStyle.fontFamily;
        
        // Create a canvas for precise text measurement
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = `${fontSize}px ${fontFamily}`;
        
        // Measure the actual displayed text width
        const textWidth = context.measureText(textBeforeCursor).width;
        
        // Calculate actual line height
        const lineHeight = parseFloat(computedStyle.lineHeight);
        const actualLineHeight = isNaN(lineHeight) ? fontSize * 1.4 : lineHeight;
        
        // Calculate position relative to the container
        const paddingLeft = parseInt(computedStyle.paddingLeft, 10) || 0;
        const paddingTop = parseInt(computedStyle.paddingTop, 10) || 0;
        
        // Position cursor relative to contentArea
        const top = this.cursorRow * actualLineHeight + paddingTop;
        const left = textWidth + paddingLeft;
        
        
        
        this.cursor.style.top = `${top}px`;
        this.cursor.style.left = `${left}px`;
        
        
        
        // Update cursor height to match line height
        this.cursor.style.height = `${actualLineHeight}px`;
        
        
        // Scroll into view if needed
        this.scrollCursorIntoView(top, left, actualLineHeight);
    }
    
    scrollCursorIntoView(top, left, lineHeight) {
        const container = this.contentArea.parentElement;
        const cursorRect = {
            top: top,
            bottom: top + lineHeight,
            left: left,
            right: left + (this.mode === 'insert' ? 2 : 8)
        };
        
        if (cursorRect.top < container.scrollTop) {
            container.scrollTop = cursorRect.top - 20;
        } else if (cursorRect.bottom > container.scrollTop + container.clientHeight) {
            container.scrollTop = cursorRect.bottom - container.clientHeight + 20;
        }
        
        if (cursorRect.left < container.scrollLeft) {
            container.scrollLeft = cursorRect.left - 20;
        } else if (cursorRect.right > container.scrollLeft + container.clientWidth) {
            container.scrollLeft = cursorRect.right - container.clientWidth + 20;
        }
    }

    insertChar(char) {
        const lines = this.content.split('\n');
        const line = lines[this.cursorRow] || '';
        
        // Clear any execution comments when line content changes
        const lineWithoutComments = this.clearExecutionComments(line);
        
        const newLine = lineWithoutComments.slice(0, this.cursorCol) + char + lineWithoutComments.slice(this.cursorCol);
        lines[this.cursorRow] = newLine;
        this.content = lines.join('\n');
        
        this.cursorCol++;
        
        this.updateDisplay();
        
        // Force DOM update then reposition cursor
        requestAnimationFrame(() => {
            this.positionCursor();
        });
    }

    deleteChar() {
        const lines = this.content.split('\n');
        const line = lines[this.cursorRow] || '';
        
        if (this.cursorCol > 0) {
            // Clear any execution comments when line content changes
            const lineWithoutComments = this.clearExecutionComments(line);
            
            // Delete character before cursor
            const newLine = lineWithoutComments.slice(0, this.cursorCol - 1) + lineWithoutComments.slice(this.cursorCol);
            lines[this.cursorRow] = newLine;
            this.content = lines.join('\n');
            this.cursorCol--;
        } else if (this.cursorRow > 0) {
            // Join with previous line
            const prevLine = lines[this.cursorRow - 1] || '';
            const currentLine = lines[this.cursorRow] || '';
            lines[this.cursorRow - 1] = prevLine + currentLine;
            lines.splice(this.cursorRow, 1);
            this.content = lines.join('\n');
            this.cursorRow--;
            this.cursorCol = prevLine.length;
        }
        
        this.updateDisplay();
        
        // Force DOM update then reposition cursor
        requestAnimationFrame(() => {
            this.positionCursor();
        });
    }

    insertNewLine() {
        const lines = this.content.split('\n');
        let line = lines[this.cursorRow] || '';
        
        // Clear execution comments before splitting the line
        line = this.clearExecutionComments(line);
        
        const beforeCursor = line.slice(0, this.cursorCol);
        const afterCursor = line.slice(this.cursorCol);
        
        lines[this.cursorRow] = beforeCursor;
        lines.splice(this.cursorRow + 1, 0, afterCursor);
        this.content = lines.join('\n');
        
        this.cursorRow++;
        this.cursorCol = 0;
        this.updateDisplay();
        
        // Force DOM update then reposition cursor
        requestAnimationFrame(() => {
            this.positionCursor();
        });
    }

    async handleKeydown(e) {
        // Handle Ctrl shortcuts (work in any mode)
        if (e.ctrlKey && (e.key === 'e' || e.key === 'E' || e.code === 'KeyE')) {
            e.preventDefault();
            await this.executeCurrentLineToTerminal();
            return;
        }
        
        if (e.ctrlKey && (e.key === 'x' || e.key === 'X' || e.code === 'KeyX')) {
            e.preventDefault();
            console.log('Ctrl+X pressed - executing all code');
            await this.executeAllCodeToTerminal();
            return;
        }
        
        if (this.mode === 'insert') {
            this.handleInsertMode(e);
        } else if (this.mode === 'normal') {
            this.handleNormalMode(e);
        } else if (this.mode === 'command') {
            await this.handleCommandMode(e);
        }
    }

    handleInsertMode(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            this.mode = 'normal';
            this.moveCursor(this.cursorRow, Math.max(0, this.cursorCol - 1));
            this.updateStatus();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this.insertNewLine();
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            this.deleteChar();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.insertChar('    ');
        } else if (e.key.length === 1) {
            e.preventDefault();
            
            
            this.insertChar(e.key);
        }
    }

    handleNormalMode(e) {
        e.preventDefault();
        const lines = this.content.split('\n');
        
        
        switch (e.key) {
            case 'h': // Left
                this.moveCursor(this.cursorRow, this.cursorCol - 1);
                break;
            case 'j': // Down
                this.moveCursor(this.cursorRow + 1, this.cursorCol);
                break;
            case 'k': // Up
                this.moveCursor(this.cursorRow - 1, this.cursorCol);
                break;
            case 'l': // Right
                this.moveCursor(this.cursorRow, this.cursorCol + 1);
                break;
            case 'w': // Next word
                this.moveToNextWord();
                break;
            case 'b': // Previous word
                this.moveToPrevWord();
                break;
            case 'i': // Insert mode
                this.clearExecutionCommentsFromCurrentLine();
                this.mode = 'insert';
                this.updateStatus();
                break;
            case 'a': // Insert after cursor
                this.clearExecutionCommentsFromCurrentLine();
                this.mode = 'insert';
                // Move cursor one position to the right (after current character)
                this.moveCursor(this.cursorRow, this.cursorCol + 1);
                break;
            case 'A': // Insert at end of line
                this.clearExecutionCommentsFromCurrentLine();
                const lineForA = lines[this.cursorRow] || '';
                this.mode = 'insert';
                this.moveCursor(this.cursorRow, lineForA.length);
                break;
            case 'I': // Insert at beginning of line
                this.clearExecutionCommentsFromCurrentLine();
                this.mode = 'insert';
                this.moveCursor(this.cursorRow, 0);
                break;
            case 'o': // Open line below
                lines.splice(this.cursorRow + 1, 0, '');
                this.content = lines.join('\n');
                this.mode = 'insert';
                this.moveCursor(this.cursorRow + 1, 0);
                this.updateDisplay();
                break;
            case 'O': // Open line above
                lines.splice(this.cursorRow, 0, '');
                this.content = lines.join('\n');
                this.mode = 'insert';
                this.moveCursor(this.cursorRow, 0);
                this.updateDisplay();
                break;
            case 'x': // Delete character
                this.deleteCharAtCursor();
                break;
            case 'dd': // Delete line (handled with double key)
                this.handleDoubleKey('d');
                break;
            case '0': // Beginning of line
                this.moveCursor(this.cursorRow, 0);
                break;
            case '$': // End of line
                const lineForDollar = lines[this.cursorRow] || '';
                this.moveCursor(this.cursorRow, Math.max(0, lineForDollar.length - 1));
                break;
            case 'g':
                // Handle gg (go to top)
                if (this.lastKey === 'g') {
                    this.moveCursor(0, 0);
                    this.lastKey = '';
                } else {
                    this.lastKey = 'g';
                    setTimeout(() => { this.lastKey = ''; }, 1000);
                }
                break;
            case 'G': // Go to bottom
                this.moveCursor(lines.length - 1, 0);
                break;
            case ':':
                this.mode = 'command';
                this.commandBuffer = ':';
                this.updateStatus();
                break;
        }
    }

    async handleCommandMode(e) {
        if (e.key === 'Enter') {
            await this.executeCommand();
        } else if (e.key === 'Escape') {
            this.mode = 'normal';
            this.commandBuffer = '';
            this.updateStatus();
        } else if (e.key === 'Backspace') {
            if (this.commandBuffer.length > 1) {
                this.commandBuffer = this.commandBuffer.slice(0, -1);
            } else {
                this.mode = 'normal';
                this.commandBuffer = '';
            }
            this.updateStatus();
        } else if (e.key.length === 1) {
            this.commandBuffer += e.key;
            this.updateStatus();
        }
    }

    moveToNextWord() {
        const lines = this.content.split('\n');
        const line = lines[this.cursorRow] || '';
        let col = this.cursorCol;
        
        // Skip current word
        while (col < line.length && /\w/.test(line[col])) col++;
        // Skip whitespace
        while (col < line.length && /\s/.test(line[col])) col++;
        
        if (col >= line.length && this.cursorRow < lines.length - 1) {
            // Move to next line
            this.moveCursor(this.cursorRow + 1, 0);
        } else {
            this.moveCursor(this.cursorRow, col);
        }
    }

    moveToPrevWord() {
        const lines = this.content.split('\n');
        const line = lines[this.cursorRow] || '';
        let col = this.cursorCol - 1;
        
        // Skip whitespace
        while (col >= 0 && /\s/.test(line[col])) col--;
        // Skip word
        while (col >= 0 && /\w/.test(line[col])) col--;
        
        if (col < 0 && this.cursorRow > 0) {
            // Move to previous line
            const prevLine = lines[this.cursorRow - 1] || '';
            this.moveCursor(this.cursorRow - 1, Math.max(0, prevLine.length - 1));
        } else {
            this.moveCursor(this.cursorRow, Math.max(0, col + 1));
        }
    }

    deleteCharAtCursor() {
        const lines = this.content.split('\n');
        const line = lines[this.cursorRow] || '';
        
        if (this.cursorCol < line.length) {
            const newLine = line.slice(0, this.cursorCol) + line.slice(this.cursorCol + 1);
            lines[this.cursorRow] = newLine;
            this.content = lines.join('\n');
            this.updateDisplay();
        }
    }

    async executeCommand() {
        const cmd = this.commandBuffer.substring(1); // Remove the ':'
        
        if (cmd === 'q' || cmd === 'quit') {
            // Quit without saving
            this.destroy();
            if (window.addOutput) {
                window.addOutput('Vim editor closed.');
            }
        } else if (cmd === 'w' || cmd === 'write') {
            // Save file
            await this.saveFile(this.currentFilename);
        } else if (cmd === 'wq' || cmd === 'x') {
            // Save and quit - wait for save to complete
            const saveSuccess = await this.saveFile(this.currentFilename);
            if (saveSuccess) {
                this.destroy();
                if (window.addOutput) {
                    window.addOutput('File saved and vim editor closed.');
                }
            }
            // If save failed, stay in the editor
        } else if (cmd.startsWith('w ')) {
            // Save as
            const newFilename = cmd.substring(2).trim();
            await this.saveFile(newFilename);
            this.currentFilename = newFilename;
            this.title.textContent = newFilename;
        } else if (cmd.startsWith('o ')) {
            // Open file
            const filename = cmd.substring(2).trim();
            this.loadFile(filename);
        } else if (cmd === 'py' || cmd === 'python') {
            // Execute Python code
            await this.executePython();
        } else if (cmd === 'py -l' || cmd === 'python -l') {
            // Execute Python code on current line
            await this.executePythonLine();
        } else if (cmd === 'js' || cmd === 'javascript') {
            // Execute JavaScript code
            await this.executeJavaScript();
        } else if (cmd === 'js -l' || cmd === 'javascript -l') {
            // Execute JavaScript code on current line
            await this.executeJavaScriptLine();
        } else if (cmd === 't' || cmd === 'terminal') {
            // Focus terminal
            this.focusTerminal();
        } else if (cmd === 'c' || cmd === 'code') {
            // Focus code editor
            this.focusCode();
        } else {
            // Unknown command
            this.statusLeft.textContent = `Unknown command: ${cmd}`;
            setTimeout(() => {
                this.updateStatus();
            }, 2000);
        }
        
        this.mode = 'normal';
        this.commandBuffer = '';
        this.updateStatus();
    }

    async saveFile(filename) {
        try {
            const result = await window.saveFile(filename, this.content);
            
            if (window.addOutput) {
                window.addOutput(`File saved: ${filename}`);
            }
            this.statusLeft.textContent = `"${filename}" saved`;
            setTimeout(() => {
                this.updateStatus();
            }, 2000);
            return true; // Success
        } catch (error) {
            console.error('Save error details:', error);
            let errorMessage = `Error: Failed to save file. ${error.message}`;
            if (error.message.includes('logged in')) {
                errorMessage = 'Error: Please login first to save files.';
            } else if (error.message.includes('network')) {
                errorMessage = 'Error: Network connection failed. Check your internet connection.';
            }
            if (window.addOutput) {
                window.addOutput(errorMessage);
            }
            this.statusLeft.textContent = 'Save failed';
            setTimeout(() => {
                this.updateStatus();
            }, 2000);
            return false; // Failure
        }
    }

    async loadFile(filename) {
        try {
            const result = await window.loadFile(filename);
            if (result.success) {
                this.content = result.content;
                this.currentFilename = filename;
                this.title.textContent = filename;
                this.updateDisplay();
                this.moveCursor(0, 0);
            } else {
                // New file - start empty
                this.content = '';
                this.currentFilename = filename;
                this.title.textContent = filename;
                this.updateDisplay();
                this.moveCursor(0, 0);
            }
        } catch (error) {
            // New file or error - start empty
            this.content = '';
            this.currentFilename = filename;
            this.title.textContent = filename;
            this.updateDisplay();
            this.moveCursor(0, 0);
        }
    }

    async executePython() {
        try {
            this.statusLeft.textContent = 'Executing Python code...';
            
            // Wait for Pyodide to load if not already loaded
            if (!window.pyodide) {
                if (window.pyodideLoadPromise) {
                    this.statusLeft.textContent = 'Loading Pyodide...';
                    await window.pyodideLoadPromise;
                } else {
                    throw new Error('Pyodide not available');
                }
            }

            const code = this.content;
            
            if (!code.trim()) {
                this.statusLeft.textContent = 'No Python code to execute';
                setTimeout(() => this.updateStatus(), 2000);
                return;
            }

            // Execute Python code and capture output
            let output = "";
            window.pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
            `);

            try {
                const result = await window.pyodide.runPythonAsync(code);
                
                // Get captured output
                const stdout = window.pyodide.runPython("sys.stdout.getvalue()");
                const stderr = window.pyodide.runPython("sys.stderr.getvalue()");
                
                // Combine outputs
                output = stdout;
                if (stderr) {
                    output += (output ? '\n' : '') + 'Error: ' + stderr;
                }
                if (result !== undefined && result !== null && result !== '') {
                    output += (output ? '\n' : '') + 'Result: ' + String(result);
                }
                
                // Reset stdout/stderr
                window.pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
                `);
                
            } catch (error) {
                output = `Python Error: ${error.toString()}`;
                
                // Reset stdout/stderr on error
                try {
                    window.pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
                    `);
                } catch {}
            }

            // Show output in terminal if available
            if (window.addOutput) {
                const finalOutput = output || '(no output)';
                window.addOutput(`Python execution result:\n${finalOutput}`);
            }
            
            this.statusLeft.textContent = 'Python code executed';
            setTimeout(() => this.updateStatus(), 3000);
            
        } catch (error) {
            this.statusLeft.textContent = `Python execution failed: ${error.message}`;
            setTimeout(() => this.updateStatus(), 3000);
        }
    }

    async executePythonLine() {
        try {
            this.statusLeft.textContent = 'Executing Python line...';
            
            // Wait for Pyodide to load if not already loaded
            if (!window.pyodide) {
                if (window.pyodideLoadPromise) {
                    this.statusLeft.textContent = 'Loading Pyodide...';
                    await window.pyodideLoadPromise;
                } else {
                    throw new Error('Pyodide not available');
                }
            }

            const lines = this.content.split('\n');
            const currentLine = lines[this.cursorRow];
            
            if (!currentLine || !currentLine.trim()) {
                this.statusLeft.textContent = 'No code on current line';
                setTimeout(() => this.updateStatus(), 2000);
                return;
            }

            // First, execute the entire file to define functions/variables
            try {
                await window.pyodide.runPythonAsync(this.content);
            } catch (error) {
                // If there's an error in the full file, continue anyway
                console.warn('Error running full file:', error);
            }

            // Now execute just the current line and capture output
            let output = "";
            window.pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
            `);

            try {
                const result = await window.pyodide.runPythonAsync(currentLine.trim());
                
                // Get captured output
                const stdout = window.pyodide.runPython("sys.stdout.getvalue()");
                const stderr = window.pyodide.runPython("sys.stderr.getvalue()");
                
                // Combine outputs
                output = stdout;
                if (stderr) {
                    output += (output ? ' ' : '') + stderr;
                }
                if (result !== undefined && result !== null && result !== '') {
                    output += (output ? ' ' : '') + String(result);
                }
                
                // Reset stdout/stderr
                window.pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
                `);
                
            } catch (error) {
                output = `Error: ${error.toString()}`;
                
                // Reset stdout/stderr on error
                try {
                    window.pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
                    `);
                } catch {}
            }

            // Add the result as a $ marker at the end of the current line
            if (output) {
                const cleanOutput = output.replace(/\n/g, ' ').trim();
                const newLine = currentLine.includes(' →') 
                    ? currentLine.replace(/ →.*$/, ` → ${cleanOutput}`)
                    : `${currentLine} → ${cleanOutput}`;
                    
                lines[this.cursorRow] = newLine;
                this.content = lines.join('\n');
                this.updateDisplay();
            }
            
            this.statusLeft.textContent = 'Line executed';
            setTimeout(() => this.updateStatus(), 2000);
            
        } catch (error) {
            this.statusLeft.textContent = `Line execution failed: ${error.message}`;
            setTimeout(() => this.updateStatus(), 3000);
        }
    }

    clearExecutionComments(line) {
        // Remove → execution output markers from the line
        return line.replace(/ →.*$/, '');
    }

    clearExecutionCommentsFromCurrentLine() {
        // Clear execution comments from current line and update display
        const lines = this.content.split('\n');
        if (lines[this.cursorRow]) {
            lines[this.cursorRow] = this.clearExecutionComments(lines[this.cursorRow]);
            this.content = lines.join('\n');
            this.updateDisplay();
        }
    }

    showTerminal() {
        this.terminalPane.style.display = 'flex';
        // Adjust editor pane width when terminal is shown
        const editorPane = this.terminalPane.previousElementSibling;
        editorPane.style.flex = '1';
    }

    hideTerminal() {
        this.terminalPane.style.display = 'none';
        // Restore editor pane to full width
        const editorPane = this.terminalPane.previousElementSibling;
        editorPane.style.flex = 'none';
        editorPane.style.width = '100%';
    }

    addTerminalOutput(output, isError = false) {
        const outputDiv = document.createElement('div');
        outputDiv.style.cssText = `
            margin: 2px 0;
            color: ${isError ? '#ff5555' : '#00ff00'};
        `;
        outputDiv.textContent = output;
        this.terminalContent.appendChild(outputDiv);
        
        // Auto-scroll to bottom
        this.terminalContent.scrollTop = this.terminalContent.scrollHeight;
    }

    clearTerminal() {
        this.terminalContent.innerHTML = '';
    }

    async executeCurrentLineToTerminal() {
        const lines = this.content.split('\n');
        const currentLine = lines[this.cursorRow] || '';
        const cleanLine = this.clearExecutionComments(currentLine);
        
        if (!cleanLine.trim()) {
            return;
        }
        
        // Detect if this looks like JavaScript or Python code
        const isJavaScriptCode = this.detectJavaScriptCode(this.content);
        
        if (isJavaScriptCode) {
            await this.executeJavaScriptLine();
        } else {
            await this.executePythonCurrentLine(cleanLine, lines, currentLine);
        }
    }

    async executePythonCurrentLine(cleanLine, lines, currentLine) {
        let output = '';
        
        try {
            if (!window.pyodide) {
                output = 'Error: Python environment not loaded';
            } else {
                // First, set up stdout capture
                await window.pyodide.runPython(`
import sys
import io
old_stdout = sys.stdout
sys.stdout = captured_output = io.StringIO()
                `);
                
                // Execute the line (works for both expressions and statements)
                let result;
                try {
                    result = await window.pyodide.runPython(cleanLine);
                } catch (error) {
                    // If execution fails, show the error
                    await window.pyodide.runPython('sys.stdout = old_stdout');
                    output = `Error: ${error.message}`;
                    return;
                }
                
                // Get any printed output
                const printedOutput = await window.pyodide.runPython(`
output = captured_output.getvalue()
sys.stdout = old_stdout
output
                `);
                
                // Determine what to show
                if (printedOutput && printedOutput.trim()) {
                    // If something was printed, show that
                    output = printedOutput.trim();
                } else if (result !== undefined && result !== null && result !== '') {
                    // If there's a non-empty result, show it
                    output = String(result);
                } else {
                    // For statements with no output (like assignments), don't show anything
                    return; // Don't add any output marker
                }
            }
        } catch (error) {
            // Restore stdout on error
            try {
                await window.pyodide.runPython('sys.stdout = old_stdout');
            } catch {}
            output = `Error: ${error.message}`;
        }
        
        // Add the result inline in the editor
        if (output && output.trim() && output !== 'None') {
            const cleanOutput = output.replace(/\n/g, ' ').trim();
            const newLine = currentLine.includes(' →') 
                ? currentLine.replace(/ →.*$/, ` → ${cleanOutput}`)
                : `${currentLine} → ${cleanOutput}`;
                
            lines[this.cursorRow] = newLine;
            this.content = lines.join('\n');
            this.updateDisplay();
        }
        
        this.statusLeft.textContent = 'Line executed';
        setTimeout(() => this.updateStatus(), 2000);
    }

    async executeAllCodeToTerminal() {
        console.log('executeAllCodeToTerminal called');
        const cleanContent = this.content
            .split('\n')
            .map(line => this.clearExecutionComments(line))
            .join('\n')
            .trim();
        
        console.log('Clean content:', cleanContent);
        
        if (!cleanContent) {
            console.log('No content to execute');
            return;
        }
        
        // Detect if this looks like JavaScript or Python code
        const isJavaScriptCode = this.detectJavaScriptCode(cleanContent);
        
        if (isJavaScriptCode) {
            await this.executeJavaScriptAllCodeToTerminal(cleanContent);
        } else {
            await this.executePythonAllCodeToTerminal(cleanContent);
        }
    }

    async executeJavaScriptAllCodeToTerminal(cleanContent) {
        console.log('Showing terminal and executing JavaScript...');
        this.showTerminal();
        this.clearTerminal(); // Clear previous output
        this.addTerminalOutput('>>> Executing JavaScript file...', false);
        this.addTerminalOutput('', false);
        
        try {
            // Execute JavaScript directly
            this.addTerminalOutput('Executing JavaScript code...', true);
            
            // Capture console.log output
            const originalConsoleLog = console.log;
            let output = [];
            console.log = (...args) => {
                output.push(args.join(' '));
            };

            try {
                // Execute the JavaScript code
                const result = eval(this.content);
                
                // Handle result display
                if (result !== undefined) {
                    output.push(String(result));
                }
                
                // Show captured output
                if (output.length > 0) {
                    output.forEach(line => {
                        this.addTerminalOutput(line, false);
                    });
                }
                
                if (output.length === 0) {
                    this.addTerminalOutput('(no output)', false);
                }
                
            } finally {
                // Restore console.log
                console.log = originalConsoleLog;
            }
            
        } catch (error) {
            this.addTerminalOutput(`Error: ${error.message}`, true);
        }
    }

    async executePythonAllCodeToTerminal(cleanContent) {
        console.log('Showing terminal and executing Python...');
        this.showTerminal();
        this.clearTerminal(); // Clear previous output
        this.addTerminalOutput('>>> Executing Python file...', false);
        this.addTerminalOutput('', false);
        
        // Check if we're in local - use local Python3
        if (window.terminalState && window.terminalState.currentDirectory === 'local') {
            try {
                this.addTerminalOutput('Using local Python3 environment...', false);
                this.addTerminalOutput('Note: Saving file and opening in system Python3', false);
                
                // Save the file first
                await this.saveFile(this.currentFilename);
                
                // Create a message to the user about using local Python
                this.addTerminalOutput(`To execute: python3 ${this.currentFilename}`, false);
                this.addTerminalOutput('Run this command in your terminal after the file is downloaded.', false);
                
                return;
            } catch (error) {
                this.addTerminalOutput(`Error: ${error.message}`, true);
                return;
            }
        }
        
        try {
            if (!window.pyodide) {
                this.addTerminalOutput('Error: Python environment not loaded', true);
                return;
            }
            
            // Capture stdout to show print statements and execution
            await window.pyodide.runPython(`
                import sys
                import io
                
                # Redirect stdout to capture prints
                old_stdout = sys.stdout
                sys.stdout = captured_output = io.StringIO()
            `);
            
            // Clear Python globals to start fresh
            await window.pyodide.runPython(`
                # Clear user-defined variables but keep builtins and our capture variables
                user_vars = [var for var in globals().keys() if not var.startswith('_') and var not in dir(__builtins__) and var not in ['old_stdout', 'captured_output', 'sys', 'io']]
                for var in user_vars:
                    del globals()[var]
            `);
            
            // Execute the code
            const result = await window.pyodide.runPython(cleanContent);
            
            // Get captured output (print statements)
            const capturedOutput = await window.pyodide.runPython(`
                output = captured_output.getvalue()
                sys.stdout = old_stdout
                output
            `);
            
            // Show captured print statements
            if (capturedOutput && capturedOutput.trim()) {
                capturedOutput.split('\n').forEach(line => {
                    if (line.trim()) {
                        this.addTerminalOutput(line, false);
                    }
                });
            }
            
            // Show final result if there's a return value
            if (result !== undefined && result !== null) {
                if (capturedOutput && capturedOutput.trim()) {
                    this.addTerminalOutput('', false); // Add space between prints and result
                }
                this.addTerminalOutput(`=> ${String(result)}`, false);
            }
            
            // If no output at all, show completion message
            if ((!capturedOutput || !capturedOutput.trim()) && (result === undefined || result === null)) {
                this.addTerminalOutput('(no output)', false);
            }
            
        } catch (error) {
            // Restore stdout even on error
            try {
                await window.pyodide.runPython('sys.stdout = old_stdout');
            } catch {}
            this.addTerminalOutput(`Error: ${error.message}`, true);
        }
    }

    // Detect if code looks like JavaScript based on syntax patterns
    detectJavaScriptCode(code) {
        // Look for JavaScript-specific patterns
        const javascriptPatterns = [
            /function\s+\w+\s*\(/,   // function definitions
            /const\s+\w+\s*=/,       // const bindings
            /let\s+\w+\s*=/,         // let bindings
            /var\s+\w+\s*=/,         // var bindings
            /console\.log\s*\(/,     // console.log
            /=>\s*[\{\w]/,           // arrow functions
            /class\s+\w+\s*\{/,      // class definitions
            /\.\w+\s*\(/,            // method calls
            /document\./,            // DOM access
            /window\./,              // window object
        ];
        
        // Count how many JavaScript patterns we find
        let jsScore = 0;
        for (const pattern of javascriptPatterns) {
            if (pattern.test(code)) {
                jsScore++;
            }
        }
        
        // Look for Python-specific patterns that would indicate it's NOT JavaScript
        const pythonPatterns = [
            /def\s+\w+\s*\(/,       // function definitions
            /import\s+\w+/,         // imports
            /from\s+\w+\s+import/,  // from imports
            /if\s+__name__\s*==\s*["']__main__["']/,  // main guard
            /print\s*\(/,           // print function (not macro)
            /class\s+\w+\s*[:（]/,  // class definitions
        ];
        
        let pythonScore = 0;
        for (const pattern of pythonPatterns) {
            if (pattern.test(code)) {
                pythonScore++;
            }
        }
        
        // If we have more JavaScript patterns than Python patterns, it's probably JavaScript
        return jsScore > pythonScore && jsScore > 0;
    }

    focusTerminal() {
        this.showTerminal();
        this.terminalInput.focus();
        this.statusLeft.textContent = 'Terminal focused';
        setTimeout(() => this.updateStatus(), 2000);
    }

    focusCode() {
        this.textarea.focus();
        this.statusLeft.textContent = 'Code editor focused';
        setTimeout(() => this.updateStatus(), 2000);
    }

    async executeTerminalCommand(command) {
        // Echo the command
        this.addTerminalOutput(`>>> ${command}`, false);
        
        try {
            if (!window.pyodide) {
                this.addTerminalOutput('Error: Python environment not loaded', true);
                return;
            }
            
            // Set up stdout capture
            await window.pyodide.runPython(`
import sys
import io
old_stdout = sys.stdout
sys.stdout = captured_output = io.StringIO()
            `);
            
            // Execute the command
            let result;
            try {
                result = await window.pyodide.runPython(command);
            } catch {
                result = null;
            }
            
            // Get printed output
            const printedOutput = await window.pyodide.runPython(`
output = captured_output.getvalue()
sys.stdout = old_stdout
output
            `);
            
            // Show results
            if (printedOutput && printedOutput.trim()) {
                printedOutput.split('\n').forEach(line => {
                    if (line.trim()) {
                        this.addTerminalOutput(line, false);
                    }
                });
            }
            
            if (result !== undefined && result !== null) {
                this.addTerminalOutput(String(result), false);
            }
            
        } catch (error) {
            // Restore stdout on error
            try {
                await window.pyodide.runPython('sys.stdout = old_stdout');
            } catch {}
            this.addTerminalOutput(`Error: ${error.message}`, true);
        }
    }

    async executeJavaScript() {
        try {
            this.statusLeft.textContent = 'Executing JavaScript code...';
            
            // Execute JavaScript directly

            const code = this.content;
            
            if (!code.trim()) {
                this.statusLeft.textContent = 'No JavaScript code to execute';
                setTimeout(() => this.updateStatus(), 2000);
                return;
            }

            // Prepare for JavaScript execution
            
            // Capture console.log output
            const originalConsoleLog = console.log;
            let output = [];
            console.log = (...args) => {
                output.push(args.join(' '));
            };

            try {
                // Execute the JavaScript code
                const result = eval(code);
                
                // Handle result display
                if (result !== undefined) {
                    output.push(String(result));
                }
                
                // JavaScript execution complete
                
            } finally {
                // Restore console.log
                console.log = originalConsoleLog;
            }

            // Show output in terminal if available
            if (window.addOutput) {
                const finalOutput = output.length > 0 ? output.join('\n') : '(no output)';
                window.addOutput(`JavaScript execution result:\n${finalOutput}`);
            }
            
            this.statusLeft.textContent = 'JavaScript code executed';
            setTimeout(() => this.updateStatus(), 3000);
            
        } catch (error) {
            this.statusLeft.textContent = `JavaScript execution failed: ${error.message}`;
            setTimeout(() => this.updateStatus(), 3000);
        }
    }

    async executeJavaScriptLine() {
        try {
            this.statusLeft.textContent = 'Executing JavaScript line...';
            
            // Execute JavaScript directly

            const lines = this.content.split('\n');
            const currentLine = lines[this.cursorRow];
            
            if (!currentLine || !currentLine.trim()) {
                this.statusLeft.textContent = 'No code on current line';
                setTimeout(() => this.updateStatus(), 2000);
                return;
            }

            // Prepare for JavaScript execution
            
            // Capture console.log output
            const originalConsoleLog = console.log;
            let output = [];
            console.log = (...args) => {
                output.push(args.join(' '));
            };

            try {
                // Execute all content up to current line for context
                const contextLines = lines.slice(0, this.cursorRow + 1);
                const contextCode = contextLines.join('\n');
                const result = eval(contextCode);
                
                if (result !== undefined) {
                    output.push(String(result));
                }
                
                // Find relevant output (last few lines that might be from current line)
                let lineOutput = '';
                if (output.length > 0) {
                    // Take the last output that's not a variable declaration
                    const relevantOutput = output.filter(line => 
                        !line.startsWith('Variable ') && 
                        !line.startsWith('Function ') && 
                        !line.startsWith('Struct ')
                    );
                    if (relevantOutput.length > 0) {
                        lineOutput = relevantOutput[relevantOutput.length - 1];
                    }
                }
                
            } finally {
                // Restore console.log
                console.log = originalConsoleLog;
            }

            // Add the result as a → marker at the end of the current line
            if (lineOutput && lineOutput.trim()) {
                const cleanOutput = lineOutput.replace(/\n/g, ' ').trim();
                const newLine = currentLine.includes(' →') 
                    ? currentLine.replace(/ →.*$/, ` → ${cleanOutput}`)
                    : `${currentLine} → ${cleanOutput}`;
                    
                lines[this.cursorRow] = newLine;
                this.content = lines.join('\n');
                this.updateDisplay();
            } else if (output.length > 0) {
                // If no specific line output but there was some output, mark as executed
                const newLine = currentLine.includes(' →') 
                    ? currentLine.replace(/ →.*$/, ' → executed')
                    : `${currentLine} → executed`;
                    
                lines[this.cursorRow] = newLine;
                this.content = lines.join('\n');
                this.updateDisplay();
            }
            
            this.statusLeft.textContent = 'JavaScript line executed';
            setTimeout(() => this.updateStatus(), 2000);
            
        } catch (error) {
            this.statusLeft.textContent = `JavaScript line execution failed: ${error.message}`;
            setTimeout(() => this.updateStatus(), 3000);
        }
    }
}

// Make VimEditor available globally
if (typeof window !== 'undefined') {
    window.VimEditor = VimEditor;
}

// Export for Node.js if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VimEditor;
}
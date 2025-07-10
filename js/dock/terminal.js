export function initTerminal() {
    const terminalWindow = document.getElementById('terminal-window');
    const terminalContent = document.getElementById('terminal-content');
    const header = terminalWindow.querySelector('.window-header');
    const closeBtn = terminalWindow.querySelector('.close-btn');
    const minBtn = terminalWindow.querySelector('.min-btn');
    const maxBtn = terminalWindow.querySelector('.max-btn');
    
    let isMaximized = false;
    let originalStyle = {};
    let commandHistory = [];
    let historyIndex = -1;
    let currentDirectory = '~';
    let username = 'user';
    let currentInput = null;
    
    // Virtual file system
    const fileSystem = {
        '~': {
            type: 'directory',
            contents: {
                'Desktop': { type: 'directory', contents: {} },
                'Documents': { type: 'directory', contents: {
                    'notes.txt': { type: 'file', content: 'My personal notes...' },
                    'projects': { type: 'directory', contents: {
                        'website': { type: 'directory', contents: {} },
                        'app': { type: 'directory', contents: {} }
                    }},
                    'readme.md': { type: 'file', content: '# Welcome to my documents' }
                }},
                'Downloads': { type: 'directory', contents: {} },
                'Pictures': { type: 'directory', contents: {
                    'vacation.jpg': { type: 'file', content: 'Binary image data...' },
                    'family.png': { type: 'file', content: 'Binary image data...' }
                }},
                'Music': { type: 'directory', contents: {} },
                'Movies': { type: 'directory', contents: {} }
            }
        }
    };

    // NEW: State management functions
    function saveTerminalState() {
        const terminalState = {
            isOpen: !terminalWindow.classList.contains('hidden'),
            width: terminalWindow.style.width,
            height: terminalWindow.style.height,
            left: terminalWindow.style.left,
            top: terminalWindow.style.top,
            isMaximized: isMaximized,
            currentDirectory: currentDirectory,
            commandHistory: commandHistory,
            historyIndex: historyIndex,
            terminalContent: terminalContent.innerHTML
        };
        localStorage.setItem('terminalState', JSON.stringify(terminalState));
    }

    function restoreTerminalState() {
        const terminalState = JSON.parse(localStorage.getItem('terminalState')) || {};
        
        if (terminalState.isOpen) {
            terminalWindow.classList.remove('hidden');
            terminalWindow.style.width = terminalState.width || '800px';
            terminalWindow.style.height = terminalState.height || '500px';
            terminalWindow.style.left = terminalState.left || `${(window.innerWidth - 800) / 2}px`;
            terminalWindow.style.top = terminalState.top || `${(window.innerHeight - 500) / 2}px`;
            terminalWindow.style.zIndex = 2000;
            
            isMaximized = terminalState.isMaximized || false;
            currentDirectory = terminalState.currentDirectory || '~';
            commandHistory = terminalState.commandHistory || [];
            historyIndex = terminalState.historyIndex || -1;
            
            // Restore terminal content
            if (terminalState.terminalContent) {
                terminalContent.innerHTML = terminalState.terminalContent;
                // Re-attach event listeners to the restored input
                const inputs = terminalContent.querySelectorAll('.terminal-input');
                if (inputs.length > 0) {
                    currentInput = inputs[inputs.length - 1];
                    currentInput.addEventListener('keydown', handleKeyDown);
                    currentInput.focus();
                } else {
                    createNewInputLine();
                }
            } else {
                initializeTerminal();
            }
            
            scrollToBottom();
        }
    }

    function getUsername() {
        return localStorage.getItem('terminal-username') || 'user';
    }

    function createInputLine() {
        const inputLine = document.createElement('div');
        inputLine.className = 'terminal-input-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'terminal-prompt';
        prompt.textContent = `${username}@MacBook-Air ${currentDirectory} % `;
        
        const input = document.createElement('input');
        input.className = 'terminal-input';
        input.type = 'text';
        input.autocomplete = 'off';
        input.spellcheck = false;
        
        inputLine.appendChild(prompt);
        inputLine.appendChild(input);
        
        return { inputLine, input };
    }

    function addOutput(text, className = 'terminal-result') {
        const line = document.createElement('div');
        line.className = `terminal-line ${className}`;
        line.textContent = text;
        terminalContent.appendChild(line);
        scrollToBottom();
    }

    function scrollToBottom() {
        terminalContent.parentElement.scrollTop = terminalContent.parentElement.scrollHeight;
    }

    function initializeTerminal() {
        username = getUsername();
        
        // Clear content
        terminalContent.innerHTML = '';
        
        // Add welcome message
        addOutput(`Last login: ${new Date().toLocaleString()} on ttys000`);
        addOutput('Type "help" to see available commands.');
        addOutput('');
        
        // Create first input line
        createNewInputLine();
    }

    function createNewInputLine() {
        const { inputLine, input } = createInputLine();
        terminalContent.appendChild(inputLine);
        currentInput = input;
        
        // Focus the input
        input.focus();
        
        // Add event listeners
        input.addEventListener('keydown', handleKeyDown);
        
        scrollToBottom();
        saveTerminalState(); // Save state when creating new input line
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            const command = currentInput.value.trim();
            
            // Show the command that was entered
            const commandLine = document.createElement('div');
            commandLine.className = 'terminal-line terminal-prompt-line';
            commandLine.textContent = `${username}@MacBook-Air ${currentDirectory} % ${command}`;
            
            // Replace input line with command line
            currentInput.parentElement.replaceWith(commandLine);
            
            if (command) {
                // Add to history
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                
                // Execute command
                executeCommand(command);
            }
            
            // Create new input line
            createNewInputLine();
            
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                currentInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                currentInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                currentInput.value = '';
            }
        }
    }

    // UPDATED: Open terminal window with state saving
    function openTerminalWindow() {
        terminalWindow.classList.remove('hidden');
        terminalWindow.style.width = '800px';
        terminalWindow.style.height = '500px';
        terminalWindow.style.left = `${(window.innerWidth - 800) / 2}px`;
        terminalWindow.style.top = `${(window.innerHeight - 500) / 2}px`;
        terminalWindow.style.zIndex = 2000;
        
        // Always reinitialize
        commandHistory = [];
        historyIndex = -1;
        currentDirectory = '~';
        initializeTerminal();
        saveTerminalState();
    }

    // Click terminal icon to open
    document.getElementById('terminal-icon').onclick = openTerminalWindow;

    // UPDATED: Window controls with state saving
    closeBtn.onclick = () => {
        terminalWindow.classList.add('hidden');
        saveTerminalState();
    };

    minBtn.onclick = () => {
        terminalWindow.classList.add('hidden');
        saveTerminalState();
    };

    maxBtn.onclick = () => {
        if (!isMaximized) {
            originalStyle = {
                width: terminalWindow.style.width,
                height: terminalWindow.style.height,
                top: terminalWindow.style.top,
                left: terminalWindow.style.left,
            };
            terminalWindow.style.top = '0px';
            terminalWindow.style.left = '0px';
            terminalWindow.style.width = '100vw';
            terminalWindow.style.height = '100vh';
            isMaximized = true;
        } else {
            terminalWindow.style.width = originalStyle.width || '800px';
            terminalWindow.style.height = originalStyle.height || '500px';
            terminalWindow.style.left = originalStyle.left || `${(window.innerWidth - 800) / 2}px`;
            terminalWindow.style.top = originalStyle.top || `${(window.innerHeight - 500) / 2}px`;
            isMaximized = false;
        }
        saveTerminalState();
    };

    // UPDATED: Draggable header with state saving
    header.addEventListener('mousedown', function(e) {
        if (isMaximized) return;
        e.preventDefault();
        
        let startX = e.clientX;
        let startY = e.clientY;
        let startLeft = parseInt(terminalWindow.style.left, 10) || terminalWindow.offsetLeft;
        let startTop = parseInt(terminalWindow.style.top, 10) || terminalWindow.offsetTop;
        
        function onMouseMove(e) {
            terminalWindow.style.left = (startLeft + e.clientX - startX) + 'px';
            terminalWindow.style.top = (startTop + e.clientY - startY) + 'px';
        }
        
        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.userSelect = '';
            saveTerminalState(); // Save state after dragging
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = 'none';
    });

    // Keep input focused when clicking in terminal
    terminalWindow.addEventListener('click', () => {
        if (currentInput) {
            currentInput.focus();
        }
    });

    // Execute command function
    function executeCommand(command) {
        const args = command.split(' ');
        const cmd = args[0].toLowerCase();
        
        switch (cmd) {
            case 'help':
                addOutput('Available commands:');
                addOutput('  ls          - List directory contents');
                addOutput('  cd [dir]    - Change directory');
                addOutput('  pwd         - Show current directory');
                addOutput('  whoami      - Show current user');
                addOutput('  date        - Show current date and time');
                addOutput('  echo [text] - Display text');
                addOutput('  clear       - Clear terminal');
                addOutput('  cat [file]  - Display file contents');
                addOutput('  mkdir [dir] - Create directory');
                addOutput('  touch [file]- Create file');
                addOutput('  rm [file]   - Remove file');
                addOutput('  history     - Show command history');
                addOutput('  find [name] - Find files/directories');
                addOutput('  tree        - Show directory tree');
                break;
                
            case 'ls':
                listDirectory(args[1]);
                break;
                
            case 'cd':
                changeDirectory(args[1] || '~');
                break;
                
            case 'cat':
                if (args[1]) {
                    displayFile(args[1]);
                } else {
                    addOutput('cat: missing file operand', 'terminal-error');
                }
                break;
                
            case 'mkdir':
                if (args[1]) {
                    createDirectory(args[1]);
                } else {
                    addOutput('mkdir: missing operand', 'terminal-error');
                }
                break;
                
            case 'touch':
                if (args[1]) {
                    createFile(args[1]);
                } else {
                    addOutput('touch: missing file operand', 'terminal-error');
                }
                break;
                
            case 'rm':
                if (args[1]) {
                    removeFile(args[1]);
                } else {
                    addOutput('rm: missing operand', 'terminal-error');
                }
                break;
                
            case 'find':
                if (args[1]) {
                    findFiles(args[1]);
                } else {
                    addOutput('find: missing search term', 'terminal-error');
                }
                break;
                
            case 'tree':
                showTree();
                break;
                
            case 'clear':
                terminalContent.innerHTML = '';
                break;
                
            case 'pwd':
                addOutput(currentDirectory === '~' ? `/Users/${username}` : `/Users/${username}/${currentDirectory}`);
                break;
                
            case 'whoami':
                addOutput(username);
                break;
                
            case 'date':
                addOutput(new Date().toString());
                break;
                
            case 'echo':
                addOutput(args.slice(1).join(' '));
                break;
                
            case 'history':
                commandHistory.forEach((cmd, index) => {
                    addOutput(`${String(index + 1).padStart(4)} ${cmd}`);
                });
                break;
                
            case 'uname':
                addOutput('Darwin MacBook-Air 21.1.0 Darwin Kernel Version 21.1.0');
                break;
                
            case 'uptime':
                addOutput(`${new Date().toLocaleTimeString()} up 2 days, 14:32, 1 user, load averages: 1.23 1.45 1.67`);
                break;
                
            default:
                addOutput(`zsh: command not found: ${cmd}`, 'terminal-error');
        }
    }

    // Helper functions
    function getCurrentDirectory() {
        if (currentDirectory === '~') {
            return fileSystem['~'];
        }
        
        const parts = currentDirectory.split('/').filter(p => p);
        let current = fileSystem['~'];
        
        for (const part of parts) {
            if (current.contents && current.contents[part]) {
                current = current.contents[part];
            } else {
                return null;
            }
        }
        return current;
    }

    function listDirectory(path) {
        let targetDir;
        
        if (path) {
            // List specific directory
            const currentDir = getCurrentDirectory();
            if (currentDir && currentDir.contents && currentDir.contents[path]) {
                if (currentDir.contents[path].type === 'directory') {
                    targetDir = currentDir.contents[path];
                } else {
                    addOutput(`ls: ${path}: Not a directory`, 'terminal-error');
                    return;
                }
            } else {
                addOutput(`ls: ${path}: No such file or directory`, 'terminal-error');
                return;
            }
        } else {
            targetDir = getCurrentDirectory();
        }
        
        if (targetDir && targetDir.contents) {
            const items = Object.keys(targetDir.contents).sort();
            if (items.length === 0) {
                return; // Empty directory
            }
            
            items.forEach(item => {
                const itemData = targetDir.contents[item];
                if (itemData.type === 'directory') {
                    addOutput(item + '/');
                } else {
                    addOutput(item);
                }
            });
        }
    }

    function changeDirectory(path) {
        if (path === '~' || path === '') {
            currentDirectory = '~';
            return;
        }
        
        if (path === '..') {
            if (currentDirectory !== '~') {
                const parts = currentDirectory.split('/').filter(p => p);
                parts.pop();
                currentDirectory = parts.length > 0 ? parts.join('/') : '~';
            }
            return;
        }
        
        const currentDir = getCurrentDirectory();
        if (currentDir && currentDir.contents && currentDir.contents[path]) {
            if (currentDir.contents[path].type === 'directory') {
                currentDirectory = currentDirectory === '~' ? path : `${currentDirectory}/${path}`;
            } else {
                addOutput(`cd: not a directory: ${path}`, 'terminal-error');
            }
        } else {
            addOutput(`cd: no such file or directory: ${path}`, 'terminal-error');
        }
    }

    function displayFile(filename) {
        const currentDir = getCurrentDirectory();
        if (currentDir && currentDir.contents && currentDir.contents[filename]) {
            const file = currentDir.contents[filename];
            if (file.type === 'file') {
                addOutput(file.content || `Contents of ${filename}`);
            } else {
                addOutput(`cat: ${filename}: Is a directory`, 'terminal-error');
            }
        } else {
            addOutput(`cat: ${filename}: No such file or directory`, 'terminal-error');
        }
    }

    function createDirectory(dirname) {
        const currentDir = getCurrentDirectory();
        if (currentDir && currentDir.contents) {
            if (!currentDir.contents[dirname]) {
                currentDir.contents[dirname] = { type: 'directory', contents: {} };
                addOutput(`Created directory: ${dirname}`);
            } else {
                addOutput(`mkdir: ${dirname}: File exists`, 'terminal-error');
            }
        }
    }

    function createFile(filename) {
        const currentDir = getCurrentDirectory();
        if (currentDir && currentDir.contents) {
            if (!currentDir.contents[filename]) {
                currentDir.contents[filename] = { type: 'file', content: '' };
                addOutput(`Created file: ${filename}`);
            } else {
                // Touch updates timestamp if file exists
                addOutput(`Updated: ${filename}`);
            }
        }
    }

    function removeFile(filename) {
        const currentDir = getCurrentDirectory();
        if (currentDir && currentDir.contents && currentDir.contents[filename]) {
            delete currentDir.contents[filename];
            addOutput(`Removed: ${filename}`);
        } else {
            addOutput(`rm: ${filename}: No such file or directory`, 'terminal-error');
        }
    }

    function findFiles(searchTerm) {
        function searchInDirectory(dir, path = '') {
            const results = [];
            if (dir.contents) {
                Object.keys(dir.contents).forEach(name => {
                    const fullPath = path ? `${path}/${name}` : name;
                    if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
                        results.push(fullPath);
                    }
                    if (dir.contents[name].type === 'directory') {
                        results.push(...searchInDirectory(dir.contents[name], fullPath));
                    }
                });
            }
            return results;
        }
        
        const results = searchInDirectory(fileSystem['~']);
        if (results.length > 0) {
            results.forEach(result => addOutput(result));
        } else {
            addOutput(`No files found matching: ${searchTerm}`);
        }
    }

    function showTree(dir = fileSystem['~'], prefix = '', isLast = true) {
        if (dir.contents) {
            const items = Object.keys(dir.contents).sort();
            items.forEach((name, index) => {
                const isLastItem = index === items.length - 1;
                const currentPrefix = prefix + (isLastItem ? '└── ' : '├── ');
                const nextPrefix = prefix + (isLastItem ? '    ' : '│   ');
                
                addOutput(currentPrefix + name + (dir.contents[name].type === 'directory' ? '/' : ''));
                
                if (dir.contents[name].type === 'directory') {
                    showTree(dir.contents[name], nextPrefix, isLastItem);
                }
            });
        }
    }

    // NEW: Auto-save state periodically
    function autoSaveState() {
        setInterval(() => {
            if (!terminalWindow.classList.contains('hidden')) {
                saveTerminalState();
            }
        }, 3000);
    }

    // NEW: Initialize everything and restore state
    function initialize() {
        restoreTerminalState();
        autoSaveState();
    }

    // Initialize the terminal
    initialize();
}

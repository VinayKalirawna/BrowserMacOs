export function initSafari() {
    const safariWindow = document.getElementById('safari-window');
    const safariUrlInput = document.getElementById('safari-url');
    const safariBrowser = document.getElementById('safari-browser');
    const header = safariWindow.querySelector('.window-header');
    const closeBtn = safariWindow.querySelector('.close-btn');
    const minBtn = safariWindow.querySelector('.min-btn');
    const maxBtn = safariWindow.querySelector('.max-btn');

    let isMaximized = false;
    let originalStyle = {};

    // NEW: State management functions
    function saveSafariState() {
        const safariState = {
            isOpen: !safariWindow.classList.contains('hidden'),
            width: safariWindow.style.width,
            height: safariWindow.style.height,
            left: safariWindow.style.left,
            top: safariWindow.style.top,
            isMaximized: isMaximized,
            currentUrl: safariBrowser.src,
            urlInputValue: safariUrlInput.value
        };
        localStorage.setItem('safariState', JSON.stringify(safariState));
    }

    function restoreSafariState() {
        const safariState = JSON.parse(localStorage.getItem('safariState')) || {};
        
        if (safariState.isOpen) {
            safariWindow.classList.remove('hidden');
            safariWindow.style.width = safariState.width || '800px';
            safariWindow.style.height = safariState.height || '600px';
            safariWindow.style.left = safariState.left || `${(window.innerWidth - 800) / 2}px`;
            safariWindow.style.top = safariState.top || `${(window.innerHeight - 600) / 2}px`;
            safariWindow.style.zIndex = 2000;
            
            isMaximized = safariState.isMaximized || false;
            
            // Restore browser content and URL input
            if (safariState.currentUrl) {
                safariBrowser.src = safariState.currentUrl;
            }
            if (safariState.urlInputValue) {
                safariUrlInput.value = safariState.urlInputValue;
            }
        }
    }

    // UPDATED: Open Safari window with state saving
    function openSafariWindow() {
        safariWindow.classList.remove('hidden');
        safariWindow.style.width = '800px';
        safariWindow.style.height = '600px';
        safariWindow.style.left = `${(window.innerWidth - 800) / 2}px`;
        safariWindow.style.top = `${(window.innerHeight - 600) / 2}px`;
        safariWindow.style.zIndex = 2000;

        // Only clear if opening fresh (not restoring)
        const safariState = JSON.parse(localStorage.getItem('safariState')) || {};
        if (!safariState.isOpen) {
            safariUrlInput.value = '';
            safariBrowser.src = '';
        }
        
        saveSafariState();
    }

    // Click safari icon to open
    document.getElementById('safari-icon').addEventListener('click', openSafariWindow);

    // UPDATED: Draggable Window with state saving
    header.addEventListener('mousedown', function(e) {
        if (isMaximized) return;
        let shiftX = e.clientX - safariWindow.getBoundingClientRect().left;
        let shiftY = e.clientY - safariWindow.getBoundingClientRect().top;
        
        function moveAt(pageX, pageY) {
            safariWindow.style.left = pageX - shiftX + 'px';
            safariWindow.style.top = pageY - shiftY + 'px';
        }
        
        function onMouseMove(e) { moveAt(e.pageX, e.pageY); }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', function() {
            document.removeEventListener('mousemove', onMouseMove);
            saveSafariState(); // Save state after dragging
        }, { once: true });
    });

    // UPDATED: Close Button with state saving
    closeBtn.addEventListener('click', () => {
        safariWindow.classList.add('hidden');
        localStorage.removeItem('safari-last-url');
        safariBrowser.src = '';
        safariUrlInput.value = '';
        if (isMaximized) {
            safariWindow.style.width = '800px';
            safariWindow.style.height = '600px';
            isMaximized = false;
        }
        saveSafariState();
    });

    // UPDATED: Minimize Button with state saving
    minBtn.addEventListener('click', () => {
        safariWindow.classList.add('hidden');
        saveSafariState();
    });

    // UPDATED: Maximize/Restore Button with state saving
    maxBtn.addEventListener('click', () => {
        if (!isMaximized) {
            originalStyle = {
                width: safariWindow.style.width,
                height: safariWindow.style.height,
                top: safariWindow.style.top,
                left: safariWindow.style.left,
            };
            safariWindow.style.top = '0px';
            safariWindow.style.left = '0px';
            safariWindow.style.width = '100vw';
            safariWindow.style.height = '100vh';
            isMaximized = true;
        } else {
            safariWindow.style.width = originalStyle.width || '800px';
            safariWindow.style.height = originalStyle.height || '600px';
            safariWindow.style.left = originalStyle.left || `${(window.innerWidth - 800) / 2}px`;
            safariWindow.style.top = originalStyle.top || `${(window.innerHeight - 600) / 2}px`;
            isMaximized = false;
        }
        saveSafariState();
    });

    // UPDATED: Search Bar Functionality with state saving
    safariUrlInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            let value = this.value.trim();
            let url;
            if (value.match(/^https?:\/\//) || value.match(/\.[a-z]{2,}$/i)) {
                url = value.match(/^https?:\/\//) ? value : 'https://' + value;
            } else {
                url = 'https://www.bing.com/search?q=' + encodeURIComponent(value);
            }
            safariBrowser.src = url;
            localStorage.setItem('safari-last-url', url);
            saveSafariState();
        }
    });

    // NEW: Save state when URL input changes
    safariUrlInput.addEventListener('input', () => {
        saveSafariState();
    });

    // NEW: Auto-save state periodically
    function autoSaveState() {
        setInterval(() => {
            if (!safariWindow.classList.contains('hidden')) {
                saveSafariState();
            }
        }, 5000); // Save every 5 seconds if safari is open
    }

    // NEW: Initialize everything and restore state
    function initialize() {
        restoreSafariState();
        autoSaveState();
    }

    // Initialize the safari
    initialize();
}

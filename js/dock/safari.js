export function initSafari() {
    const safariWindow = document.getElementById('safari-window');
    registerWindow(safariWindow);
    const safariUrlInput = document.getElementById('safari-url');
    const safariBrowser = document.getElementById('safari-browser');
    const header = safariWindow.querySelector('.window-header');
    const closeBtn = safariWindow.querySelector('.close-btn');
    const minBtn = safariWindow.querySelector('.min-btn');
    const maxBtn = safariWindow.querySelector('.max-btn');

    let isMaximized = false;
    let originalStyle = {};

    //Open Safari window with state saving
    function openSafariWindow() {
        safariWindow.classList.remove('hidden');
        safariWindow.style.width = '800px';
        safariWindow.style.height = '600px';
        safariWindow.style.left = `${(window.innerWidth - 800) / 2}px`;
        safariWindow.style.top = `${(window.innerHeight - 600) / 2}px`;
        bringWindowToFront(safariWindow);

        const safariState = JSON.parse(localStorage.getItem('safariState')) || {};
        if (!safariState.isOpen) {
            safariUrlInput.value = '';
            safariBrowser.src = '';
        }
        
    }

    // Click safari icon to open
    document.getElementById('safari-icon').addEventListener('click', () => {
        if (safariWindow.classList.contains('hidden')) {
            openSafariWindow();
        } else {
            bringWindowToFront(safariWindow);
        }
    });

    //Draggable Window with state saving
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
        }, { once: true });
    });

    //Close Button with state saving
    closeBtn.addEventListener('click', () => {
        safariWindow.classList.add('hidden');
        localStorage.removeItem('safari-last-url');
        safariBrowser.src = '';
        safariUrlInput.value = '';
        if (isMaximized) {
            safariWindow.classList.remove('maximized');
            safariWindow.style.width = '800px';
            safariWindow.style.height = '600px';
            isMaximized = false;
        }
    });

    //Minimize Button with state saving
    minBtn.addEventListener('click', () => {
        safariWindow.classList.add('hidden');
    });

    //Maximize/Restore Button - Enhanced to match Finder
    maxBtn.addEventListener('click', () => {
        if (!isMaximized) {
            originalStyle = {
                width: safariWindow.style.width,
                height: safariWindow.style.height,
                top: safariWindow.style.top,
                left: safariWindow.style.left,
                zIndex: safariWindow.style.zIndex
            };
            
            // Add maximized class and set individual properties (like Finder)
            safariWindow.classList.add('maximized');
            safariWindow.style.top = '24px';
            safariWindow.style.left = '0px';
            safariWindow.style.width = '100vw';
            safariWindow.style.height = 'calc(100vh - 24px)';
            safariWindow.style.zIndex = '10001';
            isMaximized = true;
        } else {
            // Remove maximized class and restore original values (like Finder)
            safariWindow.classList.remove('maximized');
            safariWindow.style.width = originalStyle.width || '800px';
            safariWindow.style.height = originalStyle.height || '600px';
            safariWindow.style.left = originalStyle.left || `${(window.innerWidth - 800) / 2}px`;
            safariWindow.style.top = originalStyle.top || `${(window.innerHeight - 600) / 2}px`;
            safariWindow.style.zIndex = originalStyle.zIndex || '2000';
            isMaximized = false;
        }

    });

    // Add escape key handler for fullscreen (matching Finder)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMaximized && !safariWindow.classList.contains('hidden')) {
            maxBtn.click(); 
        }
    });

    //  Search Bar Functionality with state saving
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
        }
    });

    // Save state when URL input changes
    safariUrlInput.addEventListener('input', () => {
    });
}

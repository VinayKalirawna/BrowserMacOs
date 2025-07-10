export function initMenuBar() {
    const appleLogo = document.querySelector('.apple-logo') 
    const contextMenu = document.getElementById('Apple-logo-context-menu')
    
    appleLogo.addEventListener('click', (e) => {
        e.stopPropagation()
        
        // Toggle menu visibility
        if (contextMenu.style.display === 'none' || contextMenu.style.display === '') {
            contextMenu.style.display = 'block'
        } else {
            contextMenu.style.display = 'none'
        }
    })
    
    // Hide menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target) && e.target !== appleLogo) {
            contextMenu.style.display = 'none'
        }
    })

    // Battery Icon
    const batteryIcon = document.getElementById('bat-icon'); 
    const batteryMenu = document.getElementById('battery-icon-context-menu');
    
    batteryIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Toggle menu visibility
        if (batteryMenu.style.display === 'none' || batteryMenu.style.display === '') {
            batteryMenu.style.display = 'block';
        } else {
            batteryMenu.style.display = 'none';
        }
    });
    
    // Hide menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!batteryMenu.contains(e.target) && !batteryIcon.contains(e.target)) {
            batteryMenu.style.display = 'none';
        }
    });
    
    // Add click functionality to Battery Settings
    const batterySettings = batteryMenu.querySelector('.battery-item');
    batterySettings.addEventListener('click', () => {

        console.log('Opening Battery Settings...');
        batteryMenu.style.display = 'none';
    });

    
    // Wifi funtionality
    const wifiIcon = document.getElementById('wifi-icon');
    const wifiMenu = document.getElementById('wifi-icon-context-menu');
    
    // Show/hide menu on wifi icon click
    wifiIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (wifiMenu.style.display === 'none' || wifiMenu.style.display === '') {
            wifiMenu.style.display = 'block';
        } else {
            wifiMenu.style.display = 'none';
        }
    });
    
    // Hide menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!wifiMenu.contains(e.target) && !wifiIcon.contains(e.target)) {
            wifiMenu.style.display = 'none';
        }
    });
    
    // Handle Wi-Fi toggle
    const wifiToggle = document.getElementById('wifi-toggle-switch');
    wifiToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            console.log('Wi-Fi turned on');
        } else {
            console.log('Wi-Fi turned off');
        }
    });
    
    // Handle network selection
    const networkItem = document.querySelector('.wifi-network');
    networkItem.addEventListener('click', () => {
        console.log('Network selected: Airtel_vina');
    });
    
    // Handle other networks
    const otherNetworks = document.querySelector('.other-networks');
    otherNetworks.addEventListener('click', () => {
        console.log('Show other networks');
        wifiMenu.style.display = 'none';
    });
    
    // Handle Wi-Fi settings
    const wifiSettings = document.querySelector('.wifi-settings');
    wifiSettings.addEventListener('click', () => {
        console.log('Opening Wi-Fi Settings...');
        wifiMenu.style.display = 'none';
    });

    // for search

    const searchIcon = document.getElementById('search-icon');
    const searchMenu = document.querySelector('.search-icon-context-menu');
    const searchInput = searchMenu.querySelector('.search-input input');
    const searchBrowser = document.getElementById('search-browser');

    // Show search interface on search icon click
    searchIcon.addEventListener('click', (e) => {
        e.stopPropagation();

        if (searchMenu.style.display === 'none' || searchMenu.style.display === '') {
            searchMenu.style.display = 'block';
            setTimeout(() => {
                searchInput.focus();
            }, 100);
        } else {
            searchMenu.style.display = 'none';
            searchBrowser.style.display = 'none';
        }
    });

    // Hide menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchMenu.contains(e.target) && !searchIcon.contains(e.target)) {
            searchMenu.style.display = 'none';
            searchBrowser.style.display = 'none';
        }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {

        if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
            e.preventDefault();
            searchMenu.style.display = 'block';
            searchInput.focus();
        }

        // Hide search with Escape
        if (e.key === 'Escape' && searchMenu.style.display === 'block') {
            searchMenu.style.display = 'none';
            searchBrowser.style.display = 'none';
        }
    });

    // Handle search input with live search
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();


        clearTimeout(searchTimeout);

        if (query.length > 0) {

            searchTimeout = setTimeout(() => {
                performBingSearch(query);
            }, 500);
        } else {
            searchBrowser.style.display = 'none';
        }
    });

    // Handle Enter key for immediate search
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                performBingSearch(query);
            }
        }
    });

    // Function to perform Bing search
    function performBingSearch(query) {
        const encodedQuery = encodeURIComponent(query);

        const bingSearchUrl = `https://www.bing.com/search?q=${encodedQuery}`;

        try {
            searchBrowser.src = bingSearchUrl;
            searchBrowser.style.display = 'block';


            searchMenu.style.height = 'auto';
            searchMenu.style.maxHeight = '80vh';
        } catch (error) {
            console.error('Search error:', error);

            window.open(bingSearchUrl, '_blank');
        }
    }

    // Handle iframe load errors (CORS issues)
    searchBrowser.addEventListener('error', () => {
        console.log('Iframe blocked, opening in new tab');
        const query = searchInput.value.trim();
        if (query) {
            window.open(`https://www.bing.com/search?q=${encodeURIComponent(query)}`, '_blank');
        }
    });

    // Control Icons Toggle Functionality
    
    const themeControlIcon = document.getElementById('theme-toggle'); // Your theme control icon
    const controlsPanel = document.getElementById('controls-icon-context-menu');

    // Show/hide controls panel when theme control icon is clicked
    themeControlIcon.addEventListener('click', function (e) {
        e.stopPropagation();

        if (controlsPanel.style.display === 'none' || controlsPanel.style.display === '') {
            controlsPanel.style.display = 'block';
        } else {
            controlsPanel.style.display = 'none';
        }
    });

    // Hide controls panel when clicking outside
    document.addEventListener('click', function (e) {
        if (!controlsPanel.contains(e.target) && !themeControlIcon.contains(e.target)) {
            controlsPanel.style.display = 'none';
        }
    });

    // Control Icons Toggle Functionality
    const controlIcons = document.querySelectorAll('.control-icon-first');

    controlIcons.forEach(icon => {
        icon.addEventListener('click', function (e) {
            e.stopPropagation();

            // Toggle selected state
            this.classList.toggle('selected');

            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);

            // Log the state change for debugging
            const iconId = this.id;
            const isSelected = this.classList.contains('selected');

            switch (iconId) {
                case 'contorl-icon-wifi':
                    console.log(`WiFi ${isSelected ? 'ON - Connected to Airtel' : 'OFF'}`);
                    break;
                case 'control-icon-bluetooth':
                    console.log(`Bluetooth ${isSelected ? 'ON' : 'OFF'}`);
                    break;
                case 'control-icon-airdrop':
                    console.log(`AirDrop ${isSelected ? 'ON - Everyone' : 'OFF'}`);
                    break;
            }
        });
    });

    // Create brightness overlay element
    const brightnessOverlay = document.createElement('div');
    brightnessOverlay.className = 'brightness-overlay';
    document.body.appendChild(brightnessOverlay);

    // Brightness Slider Functionality
    const brightnessSlider = document.getElementById('brightness-slider');
    const sliderFill = document.querySelector('.slider-fill');
    const sliderThumb = document.querySelector('.slider-thumb');
    const brightnessPercentage = document.getElementById('brightness-percentage');

    let isDragging = false;
    let currentBrightness = 100;

    // Update slider visual elements
    function updateSliderVisuals(value) {
        const percentage = (value - 10) / 90; // Normalize to 0-1 range (10-100 becomes 0-1)
        const fillWidth = percentage * 100;
        const thumbPosition = percentage * 100; // Percentage of container width
        
        sliderFill.style.width = fillWidth + '%';
        sliderThumb.style.left = thumbPosition + '%';
        
        // Update percentage display if you want to show it
        if (brightnessPercentage) {
            brightnessPercentage.textContent = Math.round(value) + '%';
        }
    }
    // Apply brightness to the page
    function applyBrightness(value) {
        const brightness = value / 100;
        const overlayOpacity = 1 - brightness;

        // Method 1: Using overlay (works on all browsers)
        brightnessOverlay.style.backgroundColor = `rgba(0, 0, 0, ${overlayOpacity})`;

        // Method 2: Using CSS filter (alternative method)
        // document.documentElement.style.filter = `brightness(${brightness})`;

        // Store brightness preference
        localStorage.setItem('screenBrightness', value);

        currentBrightness = value;
    }

    // Handle slider input
    brightnessSlider.addEventListener('input', function (e) {
        const value = parseFloat(e.target.value);
        updateSliderVisuals(value);
        applyBrightness(value);
    });

    // Handle mouse events for custom thumb
    let sliderRect;

    function startDrag(e) {
        isDragging = true;
        sliderRect = document.querySelector('.brightness-slider-wrapper').getBoundingClientRect();
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
        handleDrag(e);
    }

    // Handle mouse events for horizontal custom thumb
    function handleDrag(e) {
        if (!isDragging) return;
        
        const x = e.clientX - sliderRect.left;
        const containerWidth = sliderRect.width;
        const percentage = Math.max(0, Math.min(1, x / containerWidth)); // Use full container width
        const value = 10 + (percentage * 90); // Convert to 10-100 range
        
        brightnessSlider.value = value;
        updateSliderVisuals(value);
        applyBrightness(value);
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
    }

    // Add mouse event listeners
    sliderThumb.addEventListener('mousedown', startDrag);
    document.querySelector('.brightness-slider-wrapper').addEventListener('mousedown', startDrag);

    // Keyboard support
    brightnessSlider.addEventListener('keydown', function (e) {
        let newValue = parseFloat(this.value);

        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowRight':
                newValue = Math.min(100, newValue + 5);
                break;
            case 'ArrowDown':
            case 'ArrowLeft':
                newValue = Math.max(10, newValue - 5);
                break;
            case 'Home':
                newValue = 100;
                break;
            case 'End':
                newValue = 10;
                break;
            default:
                return;
        }

        e.preventDefault();
        this.value = newValue;
        updateSliderVisuals(newValue);
        applyBrightness(newValue);
    });

    // Load saved brightness on page load
    document.addEventListener('DOMContentLoaded', function () {
        const savedBrightness = localStorage.getItem('screenBrightness');
        const initialBrightness = savedBrightness ? parseFloat(savedBrightness) : 100;

        brightnessSlider.value = initialBrightness;
        updateSliderVisuals(initialBrightness);
        applyBrightness(initialBrightness);
    });

    // Reset brightness when page unloads (optional)
    window.addEventListener('beforeunload', function () {
        // Uncomment if you want to reset brightness on page leave
        // applyBrightness(100);
    });

    // Sound Slider Functionality
    const soundSlider = document.getElementById('sound-slider');
    const soundSliderFill = document.querySelector('.sound .slider-fill');
    const soundSliderThumb = document.querySelector('.sound .slider-thumb');

    let isSoundDragging = false;
    let currentVolume = 100;

    // Update sound slider visual elements
    function updateSoundSliderVisuals(value) {
        const percentage = (value - 10) / 90; // Normalize to 0-1 range (10-100 becomes 0-1)
        const fillWidth = percentage * 100;
        const thumbPosition = percentage * 100;

        soundSliderFill.style.width = fillWidth + '%';
        soundSliderThumb.style.left = thumbPosition + '%';
    }

    // Apply volume control (you can customize this function)
    function applyVolume(value) {
        const volume = value / 100;

        // Method 1: Control HTML5 audio/video elements
        const audioElements = document.querySelectorAll('audio, video');
        audioElements.forEach(element => {
            element.volume = volume;
        });

        // Method 2: Control Web Audio API (if you're using it)
        // if (window.audioContext && window.gainNode) {
        //     window.gainNode.gain.value = volume;
        // }

        // Store volume preference
        localStorage.setItem('systemVolume', value);

        currentVolume = value;
        console.log(`Volume set to: ${value}%`);
    }

    // Handle sound slider input
    soundSlider.addEventListener('input', function (e) {
        const value = parseFloat(e.target.value);
        updateSoundSliderVisuals(value);
        applyVolume(value);
    });

    // Handle mouse events for custom sound thumb dragging
    let soundSliderRect;

    function startSoundDrag(e) {
        isSoundDragging = true;
        soundSliderRect = document.querySelector('.sound-slider-wrapper').getBoundingClientRect();
        document.addEventListener('mousemove', handleSoundDrag);
        document.addEventListener('mouseup', stopSoundDrag);
        handleSoundDrag(e);
    }

    function handleSoundDrag(e) {
        if (!isSoundDragging) return;

        const x = e.clientX - soundSliderRect.left;
        const containerWidth = soundSliderRect.width;
        const percentage = Math.max(0, Math.min(1, x / containerWidth));
        const value = 10 + (percentage * 90);

        soundSlider.value = value;
        updateSoundSliderVisuals(value);
        applyVolume(value);
    }

    function stopSoundDrag() {
        isSoundDragging = false;
        document.removeEventListener('mousemove', handleSoundDrag);
        document.removeEventListener('mouseup', stopSoundDrag);
    }

    // Add mouse event listeners for sound
    soundSliderThumb.addEventListener('mousedown', startSoundDrag);
    document.querySelector('.sound-slider-wrapper').addEventListener('mousedown', startSoundDrag);

    // Keyboard support for sound slider
    soundSlider.addEventListener('keydown', function (e) {
        let newValue = parseFloat(this.value);

        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowRight':
                newValue = Math.min(100, newValue + 5);
                break;
            case 'ArrowDown':
            case 'ArrowLeft':
                newValue = Math.max(10, newValue - 5);
                break;
            case 'Home':
                newValue = 100;
                break;
            case 'End':
                newValue = 10;
                break;
            default:
                return;
        }

        e.preventDefault();
        this.value = newValue;
        updateSoundSliderVisuals(newValue);
        applyVolume(newValue);
    });

    // Initialize sound on page load
    function initSound() {
        const savedVolume = localStorage.getItem('systemVolume');
        const initialVolume = savedVolume ? parseFloat(savedVolume) : 100;

        soundSlider.value = initialVolume;
        updateSoundSliderVisuals(initialVolume);
        applyVolume(initialVolume);
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', initSound);

    // Also initialize immediately if DOM is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSound);
    } else {
        initSound();
    }

    // Real-time Date and Time Display
    function updateDateTime() {
        const now = new Date();
        
        // Format time (12-hour format with AM/PM)
        const timeOptions = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        };
        const timeString = now.toLocaleTimeString('en-US', timeOptions);
        
        // Format date (Day, Month, Date)
        const dateOptions = {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        };
        const dateString = now.toLocaleDateString('en-US', dateOptions);
        
        // Update the display elements
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');
        
        if (timeElement) {
            timeElement.textContent = timeString;
        }
        
        if (dateElement) {
            dateElement.textContent = dateString;
        }
    }

    // Update immediately when page loads
    updateDateTime();

    // Update every second (1000 milliseconds)
    setInterval(updateDateTime, 1000);

}


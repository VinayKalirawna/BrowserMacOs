export function initCamera() {
    const photoBoothWindow = document.getElementById('photo-booth-window');
    registerWindow(photoBoothWindow);
    const header = photoBoothWindow.querySelector('.window-header');
    const closeBtn = photoBoothWindow.querySelector('.close-btn');
    const minBtn = photoBoothWindow.querySelector('.min-btn');
    const maxBtn = photoBoothWindow.querySelector('.max-btn');
    let isMaximized = false;
    let originalStyle = {};

    // Camera logic variables
    let stream;
    let cameraReady = false;
    let photos = JSON.parse(localStorage.getItem('photo-booth-photos') || '[]');

    // NEW: State management functions
    function saveCameraState() {
        const cameraState = {
            isOpen: !photoBoothWindow.classList.contains('hidden'),
            width: photoBoothWindow.style.width,
            height: photoBoothWindow.style.height,
            left: photoBoothWindow.style.left,
            top: photoBoothWindow.style.top,
            isMaximized: isMaximized
        };
        localStorage.setItem('cameraState', JSON.stringify(cameraState));
    }

    function restoreCameraState() {
        const cameraState = JSON.parse(localStorage.getItem('cameraState')) || {};
        
        if (cameraState.isOpen) {
            photoBoothWindow.classList.remove('hidden');
            photoBoothWindow.style.width = cameraState.width || '800px';
            photoBoothWindow.style.height = cameraState.height || '620px';
            photoBoothWindow.style.left = cameraState.left || `${(window.innerWidth - 800) / 2}px`;
            photoBoothWindow.style.top = cameraState.top || `${(window.innerHeight - 620) / 2}px`;
            photoBoothWindow.style.zIndex = 2000;
            bringWindowToFront(photoBoothWindow); 
            
            isMaximized = cameraState.isMaximized || false;
            if (isMaximized) {
                photoBoothWindow.classList.add('maximized');
            }
            
            startCamera();
            loadSavedPhotos();
        }
    }

    //Open Photo Booth window when camera icon is clicked
    document.getElementById('camera-icon').onclick = () => {
        if (photoBoothWindow.classList.contains('hidden')) {
            photoBoothWindow.classList.remove('hidden');
            photoBoothWindow.style.width = '800px';
            photoBoothWindow.style.height = '620px';
            photoBoothWindow.style.left = `${(window.innerWidth - 800) / 2}px`;
            photoBoothWindow.style.top = `${(window.innerHeight - 620) / 2}px`;
            photoBoothWindow.style.zIndex = 2000;
            startCamera();
            loadSavedPhotos();
            saveCameraState();
            bringWindowToFront(photoBoothWindow);
        } else {
            bringWindowToFront(photoBoothWindow);
        };
    };

    // UPDATED: Window controls
    closeBtn.onclick = () => {
        photoBoothWindow.classList.add('hidden');
        stopCamera();
        saveCameraState();
    };
    
    minBtn.onclick = () => {
        photoBoothWindow.classList.add('hidden');
        stopCamera();
        saveCameraState();
    };
    
    // UPDATED: Maximize/restore functionality
    maxBtn.onclick = () => {
        if (!isMaximized) {
            originalStyle = {
                width: photoBoothWindow.style.width,
                height: photoBoothWindow.style.height,
                top: photoBoothWindow.style.top,
                left: photoBoothWindow.style.left,
                zIndex: photoBoothWindow.style.zIndex
            };

            photoBoothWindow.style.top = '0px';
            photoBoothWindow.style.left = '0px';
            photoBoothWindow.style.width = '100vw';
            photoBoothWindow.style.height = 'calc(100vh - 24px)';
            photoBoothWindow.style.zIndex = '10001'; 
            photoBoothWindow.classList.add('maximized');
            isMaximized = true;
        } else {
            photoBoothWindow.style.width = originalStyle.width || '800px';
            photoBoothWindow.style.height = originalStyle.height || '620px';
            photoBoothWindow.style.left = originalStyle.left || `${(window.innerWidth - 800) / 2}px`;
            photoBoothWindow.style.top = originalStyle.top || `${(window.innerHeight - 620) / 2}px`;
            photoBoothWindow.style.zIndex = originalStyle.zIndex || '2000';
            photoBoothWindow.classList.remove('maximized');
            isMaximized = false;
        }
        saveCameraState();
    };

    // UPDATED: Draggable header
    header.addEventListener('mousedown', function (e) {
        if (isMaximized) return;
        e.preventDefault();

        let startX = e.clientX;
        let startY = e.clientY;
        let startLeft = parseInt(photoBoothWindow.style.left, 10) || photoBoothWindow.offsetLeft;
        let startTop = parseInt(photoBoothWindow.style.top, 10) || photoBoothWindow.offsetTop;

        function onMouseMove(e) {
            photoBoothWindow.style.left = (startLeft + e.clientX - startX) + 'px';
            photoBoothWindow.style.top = (startTop + e.clientY - startY) + 'px';
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.userSelect = '';
            saveCameraState(); // Save state after dragging
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        document.body.style.userSelect = 'none';
    });

    // Camera initialization
    async function startCamera() {
        const video = document.getElementById('camera-preview');
        
        try {
            if (!stream) {
                console.log('Requesting camera access...');
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        width: { ideal: 1280 }, 
                        height: { ideal: 720 },
                        facingMode: 'user'
                    }
                });
                
                video.srcObject = stream;
                
                video.onloadedmetadata = () => {
                    console.log('Camera ready!');
                    cameraReady = true;
                    video.play();
                };
            } else {
                video.srcObject = stream;
                cameraReady = true;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Camera access denied or not available. Please allow camera permissions and try again.');
        }
    }

    function stopCamera() {
        const video = document.getElementById('camera-preview');
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            video.srcObject = null;
            cameraReady = false;
        }
    }

    // Photo capture functionality
    const canvas = document.getElementById('photo-canvas');
    document.getElementById('capture-btn').onclick = function () {
        console.log('Capture button clicked');
        
        if (!cameraReady) {
            console.log('Camera not ready yet');
            alert('Camera is not ready yet. Please wait a moment.');
            return;
        }

        const video = document.getElementById('camera-preview');
        
        if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
            console.log('Video not loaded properly');
            alert('Video not loaded properly. Please try again.');
            return;
        }

        try {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            console.log(`Capturing photo: ${canvas.width}x${canvas.height}`);
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imgData = canvas.toDataURL('image/jpeg', 0.9);
            console.log('Photo captured successfully');
            
            savePhoto(imgData);
            addToGallery(imgData);
            
            showCaptureFlash();
            
        } catch (error) {
            console.error('Error capturing photo:', error);
            alert('Error capturing photo. Please try again.');
        }
    };

    // Save photo to localStorage
    function savePhoto(dataUrl) {
        const photo = {
            id: Date.now(),
            dataUrl: dataUrl,
            timestamp: new Date().toISOString()
        };
        
        photos.unshift(photo);
        
        if (photos.length > 50) {
            photos = photos.slice(0, 50);
        }
        
        localStorage.setItem('photo-booth-photos', JSON.stringify(photos));
        console.log('Photo saved to localStorage');
    }

    // Load saved photos from localStorage
    function loadSavedPhotos() {
        const gallery = document.getElementById('gallery-strip');
        if (!gallery) return;
        
        gallery.innerHTML = '';
        
        photos.forEach(photo => {
            addToGallery(photo.dataUrl, false);
        });
        
        console.log(`Loaded ${photos.length} saved photos`);
    }

    // Add photo to gallery strip
    function addToGallery(dataUrl, shouldSave = true) {
        const gallery = document.getElementById('gallery-strip');
        
        if (!gallery) {
            console.error('Gallery strip not found');
            return;
        }
        
        try {
            const img = document.createElement('img');
            img.src = dataUrl;
            img.className = 'gallery-thumb';
            img.alt = 'Captured photo';
            
            img.onerror = () => {
                console.error('Failed to load captured image');
                img.remove();
            };
            
            img.onload = () => {
                console.log('Photo successfully loaded in gallery');
            };
            
            img.onclick = () => {
                viewFullSizePhoto(dataUrl);
            };
            
            gallery.prepend(img);
            
            console.log('Successfully added photo to gallery');
            
        } catch (error) {
            console.error('Error adding photo to gallery:', error);
        }
    }

    // View full-size photo (like macOS Photo Booth)
    function viewFullSizePhoto(dataUrl) {
        const fullSizeWindow = window.open('', '_blank');
        fullSizeWindow.document.write(`
            <html>
                <head>
                    <title>Photo Booth - Full Size</title>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 20px; 
                            background: #000; 
                            display: flex; 
                            justify-content: center; 
                            align-items: center; 
                            min-height: 100vh;
                        }
                        img { 
                            max-width: 100%; 
                            max-height: 100vh; 
                            border-radius: 8px;
                            box-shadow: 0 4px 20px rgba(255,255,255,0.1);
                        }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" alt="Full size photo" />
                </body>
            </html>
        `);
    }

    // Capture flash effect
    function showCaptureFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: white;
            z-index: 9999;
            opacity: 0.8;
            pointer-events: none;
        `;
        
        document.body.appendChild(flash);
        
        setTimeout(() => {
            flash.remove();
        }, 150);
    }

    // NEW: Auto-save state periodically
    function autoSaveState() {
        setInterval(() => {
            if (!photoBoothWindow.classList.contains('hidden')) {
                saveCameraState();
            }
        }, 5000);
    }

    // NEW: Initialize everything and restore state
    function initialize() {
        restoreCameraState();
        autoSaveState();
    }

    // Initialize the camera
    initialize();
}

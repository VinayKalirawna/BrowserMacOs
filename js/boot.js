document.addEventListener('DOMContentLoaded', function() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const appleLogo = document.getElementById('appleLogo');
    const startupSound = document.getElementById('startupSound');
    
    // Boot sequence messages
    const bootMessages = [
        "Starting up...",
        "Loading system components...",
        "Initializing hardware...",
        "Loading user interface...",
        "Preparing desktop...",
        "Almost ready...",
        "Welcome to macOS"
    ];
    
    let currentProgress = 0;
    let messageIndex = 0;
    let audioPlayed = false;
    
    // Function to play audio
    function playStartupSound() {
        if (!audioPlayed) {
            startupSound.play().then(() => {
                console.log('Startup sound is playing');
                audioPlayed = true;
            }).catch(e => {
                console.log('Audio play failed:', e);
                // Show user instruction to click for audio
                progressText.textContent = "Click anywhere to start with sound";
            });
        }
    }
    
    // Enable audio on any user interaction
    function enableAudioOnInteraction() {
        playStartupSound();
        document.removeEventListener('click', enableAudioOnInteraction);
        document.removeEventListener('keydown', enableAudioOnInteraction);
        document.removeEventListener('touchstart', enableAudioOnInteraction);
    }
    
    // Add event listeners for user interaction
    document.addEventListener('click', enableAudioOnInteraction);
    document.addEventListener('keydown', enableAudioOnInteraction);
    document.addEventListener('touchstart', enableAudioOnInteraction);
    
    // Try to play audio immediately (may be blocked)
    setTimeout(() => {
        playStartupSound();
    }, 500);
    
    // Start logo pulse animation
    setTimeout(() => {
        if (appleLogo.parentElement) {
            appleLogo.parentElement.classList.add('pulse');
        }
    }, 2000);
    
    // Progress bar animation
    setTimeout(() => {
        startBootSequence();
    }, 3000);
    
    function startBootSequence() {
        const interval = setInterval(() => {
            currentProgress += Math.random() * 15 + 5;
            
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(interval);
                
                progressText.textContent = bootMessages[bootMessages.length - 1];
                progressFill.style.width = '100%';
                
                setTimeout(() => {
                    window.location.href = 'desktop.html';
                }, 2000);
                
            } else {
                progressFill.style.width = currentProgress + '%';
                
                const newMessageIndex = Math.floor((currentProgress / 100) * (bootMessages.length - 1));
                if (newMessageIndex !== messageIndex && newMessageIndex < bootMessages.length - 1) {
                    messageIndex = newMessageIndex;
                    progressText.textContent = bootMessages[messageIndex];
                }
            }
        }, 500);
    }
});

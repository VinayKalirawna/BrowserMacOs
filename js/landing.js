document.addEventListener('DOMContentLoaded', function() {
    const functionalityItems = document.querySelectorAll('.functionality-item');
    const startButton = document.getElementById('startButton');
    
    let currentItemIndex = 0;
    let currentCharIndex = 0;
    let isTyping = false;
    
    // Typewriter effect function
    function typewriterEffect() {
        if (currentItemIndex >= functionalityItems.length) {
            // All items typed, show start button
            setTimeout(() => {
                startButton.classList.add('show');
            }, 500);
            return;
        }
        
        const currentItem = functionalityItems[currentItemIndex];
        const text = currentItem.getAttribute('data-text');
        
        if (!isTyping) {
            // Start typing this item
            isTyping = true;
            currentItem.classList.add('typing');
            currentCharIndex = 0;
            currentItem.textContent = '';
        }
        
        if (currentCharIndex < text.length) {
            // Add next character
            currentItem.textContent += text.charAt(currentCharIndex);
            currentCharIndex++;
            
            // Random typing speed for more natural effect
            const typingSpeed = Math.random() * 50 + 30; // 30-80ms
            setTimeout(typewriterEffect, typingSpeed);
        } else {
            // Finished typing this item
            currentItem.classList.add('completed');
            isTyping = false;
            currentItemIndex++;
            
            // Pause before starting next item
            setTimeout(typewriterEffect, 800);
        }
    }
    
    // Start the typewriter effect after a short delay
    setTimeout(() => {
        typewriterEffect();
    }, 1000);
    
    // Handle start button click
    startButton.addEventListener('click', function() {
        // Add click animation
        this.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            // Redirect to boot page
            window.location.href = 'boot.html';
        }, 200);
    });
});

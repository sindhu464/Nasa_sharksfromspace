// This simple script adds the 'visible' class to a scene when you scroll to it,
// which triggers all the CSS animations.
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Optional: remove class to re-animate on scroll up
                // entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the scene is visible
    });

    const scenes = document.querySelectorAll('.scene');
    scenes.forEach(scene => {
        observer.observe(scene);
    });

    // --- Scene 1 Data Stream Generator ---
    const dataStreamElement = document.querySelector('.data-stream');
    if (dataStreamElement) {
        let streamContent = '';
        for (let i = 0; i < 500; i++) {
            for (let j = 0; j < 150; j++) {
                streamContent += Math.random() > 0.5 ? '1' : '0';
            }
            streamContent += '\n';
        }
        dataStreamElement.textContent = streamContent;
    }
});
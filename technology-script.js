document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the section is visible
    });

    const slides = document.querySelectorAll('.story-slide');
    slides.forEach(slide => {
        observer.observe(slide);
    });
});
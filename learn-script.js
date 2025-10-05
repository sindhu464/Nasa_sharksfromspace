document.addEventListener('DOMContentLoaded', () => {

    // --- Scroll-Reveal Animation Logic ---
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.getAttribute('data-delay')) || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');
    elementsToReveal.forEach(el => { revealObserver.observe(el); });

    // --- Facts Carousel Logic ---
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    const prevBtn = document.querySelector('.nav-button.prev');
    const nextBtn = document.querySelector('.nav-button.next');
    if (carouselWrapper && prevBtn && nextBtn) {
        const scrollAmount = carouselWrapper.querySelector('.fact-card').offsetWidth + 20;
        prevBtn.addEventListener('click', () => carouselWrapper.scrollBy({ left: -scrollAmount, behavior: 'smooth' }));
        nextBtn.addEventListener('click', () => carouselWrapper.scrollBy({ left: scrollAmount, behavior: 'smooth' }));
    }

    // --- NEW: Parallax Scrolling Effect for Featured Cards ---
    const parallaxCards = document.querySelectorAll('.featured-card');
    
    function handleParallax() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        parallaxCards.forEach(card => {
            const cardTop = card.offsetTop;
            const cardHeight = card.offsetHeight;
            const windowHeight = window.innerHeight;

            // Check if the card is in the viewport
            if (scrollTop + windowHeight > cardTop && scrollTop < cardTop + cardHeight) {
                // Calculate the parallax effect
                const parallaxValue = (scrollTop + windowHeight - cardTop) * 0.2; // Adjust 0.2 to change speed
                card.style.backgroundPositionY = `calc(50% - ${parallaxValue}px)`;
            }
        });
    }

    // Use requestAnimationFrame for smooth performance
    function animationLoop() {
        handleParallax();
        requestAnimationFrame(animationLoop);
    }

    // Only run parallax on larger screens where it looks best
    if (window.innerWidth > 900) {
        animationLoop();
    }
});
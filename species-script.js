document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const speciesCards = document.querySelectorAll('.species-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Manage active button state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');

            speciesCards.forEach(card => {
                const category = card.getAttribute('data-category');

                // If filter is 'all' or the category matches, show the card
                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    // A small timeout to allow display property to apply before animating
                    setTimeout(() => {
                        card.style.transform = 'scale(1)';
                        card.style.opacity = '1';
                    }, 10);
                } else {
                    // Hide the card
                    card.style.transform = 'scale(0.9)';
                    card.style.opacity = '0';
                    // A timeout to allow animation before setting display to none
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 400); // Should match the transition duration in CSS
                }
            });
        });
    });
});
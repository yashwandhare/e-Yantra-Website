document.addEventListener('DOMContentLoaded', () => {
    const filterContainer = document.querySelector('.filter-controls');
    if (!filterContainer) return;

    const filterButtons = filterContainer.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card[data-status]');
    const noResultsMessage = document.getElementById('no-results');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state on buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');
            let visibleProjects = 0;

            // Filter project cards
            projectCards.forEach(card => {
                const cardStatus = card.getAttribute('data-status');

                if (filterValue === 'all' || filterValue === cardStatus) {
                    card.classList.remove('hide');
                    visibleProjects++;
                } else {
                    card.classList.add('hide');
                }
            });

            // Show or hide the 'no results' message
            if (noResultsMessage) {
                noResultsMessage.style.display = visibleProjects === 0 ? 'block' : 'none';
            }
        });
    });
});
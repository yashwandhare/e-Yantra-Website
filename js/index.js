class EYantraApp {
    constructor() {
        // Initialize all features when a new instance is created.
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeLiveUpdates();
        this.initializeCounters();
        this.initializeScrollAnimations();
        this.initializeCursorGlow();
    }
    
    // Centralize event listeners for better management.
    setupEventListeners() {
        this.initializeMobileMenu();
        this.setupSmoothScrolling();
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    // 1. INTERACTIVE CURSOR GLOW
    // Creates a radial gradient that follows the mouse cursor.
    initializeCursorGlow() {
        const glowElement = document.querySelector('.cursor-glow');
        if (!glowElement) return;

        document.addEventListener('mousemove', (e) => {
            // Use requestAnimationFrame to ensure smooth, performant animation.
            requestAnimationFrame(() => {
                glowElement.style.setProperty('--x', `${e.clientX}px`);
                glowElement.style.setProperty('--y', `${e.clientY}px`);
            });
        });
    }

    // 2. ON-SCROLL FADE-IN & FADE-OUT ANIMATIONS
    // Uses IntersectionObserver to efficiently detect when elements enter or leave the viewport.
    initializeScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-fade-in, .animate-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Add 'in-view' class when element is intersecting (visible)
                // Remove it when it's not, allowing for fade-out animations.
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% of the element is visible
            rootMargin: '0px 0px -50px 0px' // Adjust viewport margin to trigger a bit earlier
        });

        animatedElements.forEach((el, index) => {
            // Apply a dynamic stagger delay for a more fluid appearance of card grids.
            el.style.setProperty('--stagger-delay', `${(index % 3) * 100}ms`);
            observer.observe(el)
        });
    }

    // 3. PERFORMANCE-OPTIMIZED NUMBER SCROLL ANIMATION
    // Animates numbers counting up when they scroll into view.
    initializeCounters() {
        const statsSection = document.getElementById('stats');
        if (!statsSection) return;

        const observer = new IntersectionObserver((entries, observer) => {
            // Trigger animation only once when the section is visible.
            if (entries[0].isIntersecting) {
                const counters = statsSection.querySelectorAll('h3[data-target]');
                counters.forEach(counter => {
                    if (counter.dataset.animated) return; // Prevent re-animation
                    counter.dataset.animated = 'true';
                    this.animateCount(counter);
                });
                observer.unobserve(statsSection); // Stop observing after animation runs.
            }
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }

    animateCount(element) {
        const target = +element.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        let startTimestamp = null;

        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * target);
            element.innerText = `${currentValue}+`;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // 4. LIVE UPDATES INFINITE SCROLLER
    // Duplicates content to create a seamless, infinite scrolling effect.
    initializeLiveUpdates() {
        const content = document.querySelector('.live-updates-content');
        if (content && content.children.length > 0) {
            // A simple and effective way to duplicate content for the animation.
            content.innerHTML += content.innerHTML;
        }
    }
    
    // 5. SMOOTH SCROLLING FOR ANCHOR LINKS
    // Handles smooth navigation to different sections of the page.
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    if (this.isMenuOpen) this.closeMobileMenu(); // Close mobile menu on click
                    
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // 6. RESPONSIVE MOBILE MENU
    // Toggles the visibility of the mobile navigation menu.
    initializeMobileMenu() {
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.navMenu = document.getElementById('navMenu');
        this.isMenuOpen = false;

        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.mobileMenuBtn.classList.toggle('active', this.isMenuOpen);
        this.navMenu.classList.toggle('active', this.isMenuOpen);
        document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        if (this.isMenuOpen) {
            this.toggleMobileMenu();
        }
    }
}

// Instantiate the app once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    new EYantraApp();
});
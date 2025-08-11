// ===== MAIN APPLICATION ===== //

class EYantraApp {
    constructor() {
        this.isMenuOpen = false;
        this.lastScrollY = 0;
        this.ticking = false;
        this.scrollDirection = 'up';
        this.animatedElements = new Set();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeScrollEffects();
        this.initializeMobileMenu();
        this.setupSmoothScrolling();
        this.initializeScrollAnimations();
        this.initializeLiveUpdates();
        this.initializeStaggeredAnimations();
        this.initializeVisibilityAnimations();
    }

    // ===== EVENT LISTENERS ===== //
    setupEventListeners() {
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    // ===== VISIBILITY ANIMATIONS ===== //
    initializeVisibilityAnimations() {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -80px 0px'
        };

        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animatedElements.add(entry.target);
                    
                    // Add staggered delay based on grid position
                    const container = entry.target.parentNode;
                    const cards = Array.from(container.children);
                    const index = cards.indexOf(entry.target);
                    
                    // Reset and animate
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(40px) scale(0.9)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                        
                        // Add entrance class for additional effects
                        entry.target.classList.add('card-visible');
                    }, index * 150); // 150ms stagger
                    
                    visibilityObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all cards
        document.querySelectorAll('.activity-card, .project-card').forEach(card => {
            visibilityObserver.observe(card);
        });
    }

    // ===== STAGGERED ANIMATIONS ===== //
    initializeStaggeredAnimations() {
        // Add CSS class for cards that are visible
        const style = document.createElement('style');
        style.textContent = `
            .card-visible {
                animation: cardPulse 2s ease-out 1s;
            }
            
            @keyframes cardPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }
        `;
        document.head.appendChild(style);
    }

    // ===== SCROLL ANIMATIONS ===== //
    initializeScrollAnimations() {
        // Initial state - cards are visible by default
        const cards = document.querySelectorAll('.activity-card, .project-card');
        cards.forEach(card => {
            // Cards start visible, will be animated on intersection
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        });
        
        this.animateOnScroll();
    }

    handleScroll() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > this.lastScrollY) {
            this.scrollDirection = 'down';
        } else {
            this.scrollDirection = 'up';
        }
        
        this.lastScrollY = currentScrollY;
        
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.updateNavbar();
                this.updateHeroParallax();
                this.animateOnScroll();
                this.addScrollMomentum();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    // ===== SCROLL MOMENTUM EFFECT ===== //
    addScrollMomentum() {
        const cards = document.querySelectorAll('.activity-card, .project-card');
        const scrollSpeed = Math.abs(this.lastScrollY - (this.previousScrollY || 0));
        
        if (scrollSpeed > 5) {
            cards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (isVisible) {
                    const momentum = Math.min(scrollSpeed * 0.1, 3);
                    card.style.transform = `translateY(${this.scrollDirection === 'down' ? momentum : -momentum}px)`;
                    
                    setTimeout(() => {
                        card.style.transform = '';
                    }, 150);
                }
            });
        }
        
        this.previousScrollY = this.lastScrollY;
    }

    // ===== FLOATING NAVBAR CONTROL ===== //
    updateNavbar() {
        const navbar = document.querySelector('.top-bar');
        const scrollTop = this.lastScrollY;

        if (navbar) {
            if (this.scrollDirection === 'up' || scrollTop < 100) {
                navbar.classList.add('show');
                navbar.classList.remove('hide');
            } else if (this.scrollDirection === 'down' && scrollTop > 200) {
                navbar.classList.add('hide');
                navbar.classList.remove('show');
            }
        }
    }

    // ===== HERO PARALLAX EFFECT ===== //
    updateHeroParallax() {
        const hero = document.querySelector('.hero');
        const heroImg = document.querySelector('.hero-bg img');
        const scrollTop = this.lastScrollY;
        const heroHeight = hero ? hero.offsetHeight : 0;
        
        if (hero && heroImg && scrollTop < heroHeight) {
            const scrollProgress = scrollTop / heroHeight;
            const translateY = scrollTop * 0.3;
            heroImg.style.transform = `translateY(${translateY}px)`;
            
            if (scrollProgress > 0.1) {
                hero.classList.add('scrolled');
            } else {
                hero.classList.remove('scrolled');
            }
        }
    }

    // ===== LIVE UPDATES ===== //
    initializeLiveUpdates() {
        const liveContent = document.querySelector('.live-updates-content');
        if (liveContent) {
            const clone = liveContent.cloneNode(true);
            liveContent.parentNode.appendChild(clone);
        }
    }

    // ===== SMOOTH SCROLLING ===== //
    setupSmoothScrolling() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = 120;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    this.smoothScrollTo(targetPosition, 1000);
                    this.closeMobileMenu();
                }
            });
        });
    }

    smoothScrollTo(target, duration) {
        const start = window.pageYOffset;
        const distance = target - start;
        let startTime = null;

        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = this.easeInOutCubic(timeElapsed, start, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };

        requestAnimationFrame(animation);
    }

    easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }

    // ===== NAVIGATION ===== //
    initializeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');

        if (mobileMenuBtn && navMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Handle dropdown clicks on mobile
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (toggle) {
                toggle.addEventListener('click', (e) => {
                    if (window.innerWidth <= 767) {
                        e.preventDefault();
                        dropdown.classList.toggle('active');
                    }
                });
            }
        });
    }

    toggleMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');

        if (mobileMenuBtn && navMenu) {
            this.isMenuOpen = !this.isMenuOpen;
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
        }
    }

    closeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navMenu = document.getElementById('navMenu');

        if (mobileMenuBtn && navMenu && this.isMenuOpen) {
            this.isMenuOpen = false;
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ===== SCROLL EFFECTS ===== //
    initializeScrollEffects() {
        // Cards are visible by default now
        const fadeElements = document.querySelectorAll('.activity-card, .project-card');
        fadeElements.forEach((element) => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        });
    }

    animateOnScroll() {
        // This method now handles continuous scroll effects
        const elements = document.querySelectorAll('.section-header');
        const windowHeight = window.innerHeight;

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight * 0.8 && !element.classList.contains('animated')) {
                element.classList.add('animated');
                element.style.animationPlayState = 'running';
            }
        });
    }

    // ===== UTILITY FUNCTIONS ===== //
    handleResize() {
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
        
        this.animateOnScroll();
    }

    handleDocumentClick(e) {
        const navMenu = document.getElementById('navMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (this.isMenuOpen && navMenu && mobileMenuBtn) {
            if (!navMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                this.closeMobileMenu();
            }
        }
    }

    handleKeydown(e) {
        if (e.key === 'Escape' && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }
}

// ===== INITIALIZE APPLICATION ===== //
document.addEventListener('DOMContentLoaded', () => {
    const app = new EYantraApp();
    console.log('SVPC e-Yantra Club website loaded successfully!');
});

// ===== PERFORMANCE OPTIMIZATIONS ===== //
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== ERROR HANDLING ===== //
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

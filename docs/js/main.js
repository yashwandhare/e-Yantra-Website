// ===== MAIN APPLICATION ===== //

class EYantraApp {
    constructor() {
        this.isMenuOpen = false;
        this.isLoginModalOpen = false;
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
        this.initializeLoginModal();
        this.initializeAboutUsButton();
    }

    // ===== EVENT LISTENERS ===== //
    setupEventListeners() {
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    // ===== LOGIN MODAL FUNCTIONALITY ===== //
    initializeLoginModal() {
        const loginBtn = document.getElementById('loginBtn');
        const modal = document.getElementById('loginModal');
        const modalClose = document.getElementById('modalClose');
        const loginForm = document.getElementById('loginForm');
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordInput = document.getElementById('password');
        const forgotPasswordLink = document.getElementById('forgotPassword');

        if (loginBtn && modal) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginModal();
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.hideLoginModal();
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideLoginModal();
                }
            });
        }

        if (passwordToggle && passwordInput) {
            passwordToggle.addEventListener('click', () => {
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                
                const icon = passwordToggle.querySelector('i');
                if (type === 'text') {
                    icon.className = 'fas fa-eye-slash';
                } else {
                    icon.className = 'fas fa-eye';
                }
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            this.isLoginModalOpen = true;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus trap
            const firstInput = modal.querySelector('#username');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 200);
            }
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            this.isLoginModalOpen = false;
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset form
            const form = document.getElementById('loginForm');
            if (form) {
                form.reset();
            }
            
            // Reset loading state
            const submitBtn = document.getElementById('loginSubmit');
            if (submitBtn) {
                submitBtn.classList.remove('loading');
            }
        }
    }

    async handleLogin() {
        const form = document.getElementById('loginForm');
        const submitBtn = document.getElementById('loginSubmit');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (!form || !submitBtn || !usernameInput || !passwordInput) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');

        try {
            // Simulate API call - replace with actual backend call
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.showNotification('Login successful!', 'success');
                
                // Store auth token
                localStorage.setItem('authToken', data.token);
                
                // Redirect based on user role
                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        window.location.href = '/admin/dashboard';
                    } else {
                        window.location.href = '/dashboard';
                    }
                }, 1000);
            } else {
                this.showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Connection error. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
        }
    }

    handleForgotPassword() {
        this.showNotification('Please contact admin for password reset', 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 12px;
                    padding: 1rem 1.5rem;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                    z-index: 3000;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                    font-size: 0.9rem;
                }
                .notification.show { transform: translateX(0); }
                .notification-success { border-left: 4px solid #10b981; color: #065f46; }
                .notification-error { border-left: 4px solid #ef4444; color: #7f1d1d; }
                .notification-info { border-left: 4px solid #3b82f6; color: #1e40af; }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ===== ABOUT US BUTTON FUNCTIONALITY ===== //
    initializeAboutUsButton() {
        const aboutUsBtn = document.getElementById('aboutUsBtn');
        if (aboutUsBtn) {
            aboutUsBtn.addEventListener('click', () => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                    aboutSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
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
                    
                    const container = entry.target.parentNode;
                    const cards = Array.from(container.children);
                    const index = cards.indexOf(entry.target);
                    
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(40px) scale(0.9)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0) scale(1)';
                        
                        entry.target.classList.add('card-visible');
                    }, index * 150);
                    
                    visibilityObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('.activity-card, .project-card').forEach(card => {
            visibilityObserver.observe(card);
        });
    }

    // ===== STAGGERED ANIMATIONS ===== //
    initializeStaggeredAnimations() {
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
        const cards = document.querySelectorAll('.activity-card, .project-card');
        cards.forEach(card => {
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
        const fadeElements = document.querySelectorAll('.activity-card, .project-card');
        fadeElements.forEach((element) => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        });
    }

    animateOnScroll() {
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
        if (e.key === 'Escape') {
            if (this.isLoginModalOpen) {
                this.hideLoginModal();
            } else if (this.isMenuOpen) {
                this.closeMobileMenu();
            }
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

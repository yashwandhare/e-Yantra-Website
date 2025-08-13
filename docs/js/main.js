// ===== MAIN APPLICATION ===== //

class EYantraApp {
    constructor() {
        this.isMenuOpen = false;
        this.isLoginModalOpen = false;
        this.lastScrollY = 0;
        this.previousScrollY = 0;
        this.ticking = false;
        this.scrollDirection = 'up';
        this.animatedElements = new Set();
        this.observers = new Map(); // Track observers for cleanup
        this.debounceTimers = new Map(); // Debounce timers
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
        this.initializeViewAllProjectsButton(); // Added
        this.initializePreloadImages(); // Added
        this.setupProgressiveEnhancement(); // Added
    }

    // ===== EVENT LISTENERS ===== //
    setupEventListeners() {
        // Use throttled scroll handler for better performance
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16), { passive: true });
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250), { passive: true });
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Add visibility change listener for performance
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Add beforeunload for cleanup
        window.addEventListener('beforeunload', this.cleanup.bind(this));
    }

    // ===== PERFORMANCE UTILITIES ===== //
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    debounce(func, wait) {
        return (...args) => {
            const key = func.name;
            clearTimeout(this.debounceTimers.get(key));
            this.debounceTimers.set(key, setTimeout(() => func.apply(this, args), wait));
        }
    }

    // ===== PROGRESSIVE ENHANCEMENT ===== //
    setupProgressiveEnhancement() {
        // Check for required features
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            this.initializeFallbackAnimations();
        }

        // Prefer reduced motion support
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.disableAnimations();
        }

        // Check connection quality
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.optimizeForSlowConnection();
            }
        }
    }

    // ===== LOGIN MODAL FUNCTIONALITY (Enhanced) ===== //
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
                    passwordToggle.setAttribute('aria-label', 'Hide password');
                } else {
                    icon.className = 'fas fa-eye';
                    passwordToggle.setAttribute('aria-label', 'Show password');
                }
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });

            // Add real-time validation
            const inputs = loginForm.querySelectorAll('input[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', this.validateField.bind(this));
                input.addEventListener('input', this.clearValidationError.bind(this));
            });
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleForgotPassword();
            });
        }
    }

    // ===== FORM VALIDATION ===== //
    validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        
        field.classList.remove('error');
        
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }

        if (field.type === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }

        return true;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            display: block;
        `;
    }

    clearValidationError(e) {
        const field = e.target;
        field.classList.remove('error');
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            this.isLoginModalOpen = true;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Enhanced focus management
            const firstInput = modal.querySelector('#username');
            if (firstInput) {
                setTimeout(() => {
                    firstInput.focus();
                    firstInput.select(); // Select existing text if any
                }, 200);
            }

            // Add escape key listener specifically for modal
            this.modalKeyHandler = (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(e, modal);
                }
            };
            modal.addEventListener('keydown', this.modalKeyHandler);
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            this.isLoginModalOpen = false;
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Clean up form and validation
            const form = document.getElementById('loginForm');
            if (form) {
                form.reset();
                // Clear all validation errors
                form.querySelectorAll('.field-error').forEach(error => error.remove());
                form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));
            }
            
            // Reset loading state
            const submitBtn = document.getElementById('loginSubmit');
            if (submitBtn) {
                submitBtn.classList.remove('loading');
            }

            // Remove modal-specific key listener
            if (this.modalKeyHandler) {
                modal.removeEventListener('keydown', this.modalKeyHandler);
            }
        }
    }

    // ===== ACCESSIBILITY - FOCUS TRAP ===== //
    trapFocus(e, modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    // ===== ENHANCED LOGIN HANDLER ===== //
    async handleLogin() {
        const form = document.getElementById('loginForm');
        const submitBtn = document.getElementById('loginSubmit');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (!form || !submitBtn || !usernameInput || !passwordInput) return;

        // Validate all fields before submission
        const isValidForm = Array.from(form.querySelectorAll('input[required]'))
            .every(input => this.validateField({ target: input }));

        if (!isValidForm) {
            this.showNotification('Please fix the errors above', 'error');
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Enhanced fetch with timeout and retry logic
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username, 
                    password,
                    timestamp: Date.now(), // Prevent replay attacks
                    device: navigator.userAgent // Basic device fingerprinting
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const data = await response.json();

            if (response.ok) {
                this.showNotification('Login successful! Redirecting...', 'success');
                
                // Store auth data securely
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }

                if (data.user) {
                    sessionStorage.setItem('userData', JSON.stringify(data.user));
                }
                
                // Redirect with fallback
                setTimeout(() => {
                    const redirectUrl = this.getRedirectUrl(data.user?.role);
                    try {
                        window.location.href = redirectUrl;
                    } catch (error) {
                        window.location.replace(redirectUrl);
                    }
                }, 1000);
            } else {
                this.showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.name === 'AbortError') {
                this.showNotification('Request timeout. Please try again.', 'error');
            } else if (!navigator.onLine) {
                this.showNotification('No internet connection. Please check your connection.', 'error');
            } else {
                this.showNotification('Connection error. Please try again.', 'error');
            }
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    getRedirectUrl(role) {
        const urlMap = {
            'admin': '/admin/dashboard',
            'moderator': '/moderator/dashboard',
            'member': '/member/dashboard'
        };
        
        return urlMap[role] || '/dashboard';
    }

    handleForgotPassword() {
        // Enhanced forgot password with modal option
        if (confirm('Would you like to be redirected to the password reset page?')) {
            window.open('/forgot-password', '_blank');
        } else {
            this.showNotification('Please contact admin at eyantra@svpcet.ac.in for password reset', 'info');
        }
    }

    // ===== ENHANCED NOTIFICATIONS ===== //
    showNotification(message, type = 'info', duration = 3000) {
        // Prevent duplicate notifications
        const existingNotification = document.querySelector(`.notification[data-message="${message}"]`);
        if (existingNotification) return;

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('data-message', message);
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" aria-label="Close notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Enhanced styles with close button
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
                    max-width: 350px;
                    font-size: 0.9rem;
                    cursor: pointer;
                }
                .notification.show { transform: translateX(0); }
                .notification-success { border-left: 4px solid #10b981; color: #065f46; }
                .notification-error { border-left: 4px solid #ef4444; color: #7f1d1d; }
                .notification-info { border-left: 4px solid #3b82f6; color: #1e40af; }
                .notification-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    opacity: 0.6;
                    margin-left: auto;
                    padding: 0.25rem;
                    border-radius: 4px;
                    transition: opacity 0.2s ease;
                }
                .notification-close:hover { opacity: 1; }
                .notification:hover .notification-close { opacity: 0.8; }
            `;
            document.head.appendChild(styles);
        }

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeNotification(notification);
        });

        // Click to dismiss
        notification.addEventListener('click', () => {
            this.removeNotification(notification);
        });

        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove with longer duration for error messages
        const finalDuration = type === 'error' ? duration * 1.5 : duration;
        setTimeout(() => {
            this.removeNotification(notification);
        }, finalDuration);
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }

    // ===== VIEW ALL PROJECTS BUTTON ===== //
    initializeViewAllProjectsButton() {
        const viewAllBtn = document.getElementById('viewAllProjectsBtn');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Add loading state
                const originalText = viewAllBtn.innerHTML;
                viewAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                viewAllBtn.disabled = true;
                
                setTimeout(() => {
                    try {
                        window.location.href = 'projects.html';
                    } catch (error) {
                        // Fallback
                        window.location.replace('projects.html');
                    }
                }, 500);
            });
        }
    }

    // ===== PRELOAD CRITICAL IMAGES ===== //
    initializePreloadImages() {
        const criticalImages = [
            'images/hero-bg.jpg',
            'images/projects-bg.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = src;
            link.as = 'image';
            document.head.appendChild(link);
        });
    }

    // ===== ENHANCED VISIBILITY ANIMATIONS ===== //
    initializeVisibilityAnimations() {
        const observerOptions = {
            threshold: [0.1, 0.25], // Multiple thresholds for progressive animation
            rootMargin: '0px 0px -50px 0px'
        };

        const visibilityObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animatedElements.add(entry.target);
                    this.animateElement(entry.target);
                }
            });
        }, observerOptions);

        // Store observer for cleanup
        this.observers.set('visibility', visibilityObserver);

        document.querySelectorAll('.activity-card, .project-card').forEach(card => {
            visibilityObserver.observe(card);
        });
    }

    animateElement(element) {
        const container = element.parentNode;
        const cards = Array.from(container.children);
        const index = cards.indexOf(element);
        
        element.style.opacity = '0';
        element.style.transform = 'translateY(40px) scale(0.9)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
            element.classList.add('card-visible');
        }, Math.min(index * 100, 500)); // Cap delay at 500ms
    }

    // ===== PERFORMANCE OPTIMIZATIONS ===== //
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when tab is not visible
            this.pauseAnimations();
        } else {
            // Resume animations when tab becomes visible
            this.resumeAnimations();
        }
    }

    pauseAnimations() {
        document.querySelectorAll('.live-updates-content').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        document.querySelectorAll('.live-updates-content').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }

    optimizeForSlowConnection() {
        // Disable heavy animations for slow connections
        const style = document.createElement('style');
        style.textContent = `
            * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            .live-updates-content {
                animation: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    disableAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        `;
        document.head.appendChild(style);
    }

    initializeFallbackAnimations() {
        // Fallback for browsers without IntersectionObserver
        const elements = document.querySelectorAll('.activity-card, .project-card');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0) scale(1)';
                element.classList.add('card-visible');
            }, index * 200);
        });
    }

    // ===== ENHANCED SCROLL EFFECTS ===== //
    addScrollMomentum() {
        const cards = document.querySelectorAll('.activity-card, .project-card');
        const scrollSpeed = Math.abs(this.lastScrollY - this.previousScrollY);
        
        if (scrollSpeed > 3) { // Reduced threshold for smoother effect
            cards.forEach((card, index) => {
                const rect = card.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                
                if (isVisible) {
                    const momentum = Math.min(scrollSpeed * 0.05, 2); // Reduced intensity
                    const direction = this.scrollDirection === 'down' ? momentum : -momentum;
                    
                    card.style.transform = `translateY(${direction}px)`;
                    
                    setTimeout(() => {
                        if (card.style.transform === `translateY(${direction}px)`) {
                            card.style.transform = '';
                        }
                    }, 100); // Faster return to original position
                }
            });
        }
        
        this.previousScrollY = this.lastScrollY;
    }

    // ===== CLEANUP ===== //
    cleanup() {
        // Clean up observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();

        // Clear debounce timers
        this.debounceTimers.forEach(timer => {
            clearTimeout(timer);
        });
        this.debounceTimers.clear();

        // Remove event listeners if needed
        document.body.style.overflow = '';
    }

    // ===== REST OF THE METHODS (Keep as-is) ===== //
    // ... (keeping all your existing methods: handleScroll, updateNavbar, updateHeroParallax, 
    // initializeLiveUpdates, setupSmoothScrolling, smoothScrollTo, easeInOutCubic,
    // initializeMobileMenu, toggleMobileMenu, closeMobileMenu, initializeScrollEffects,
    // animateOnScroll, handleResize, handleDocumentClick, handleKeydown, etc.)

    // [Rest of your existing methods remain unchanged...]
    
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

    initializeLiveUpdates() {
        const liveContent = document.querySelector('.live-updates-content');
        if (liveContent) {
            const clone = liveContent.cloneNode(true);
            liveContent.parentNode.appendChild(clone);
        }
    }

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
    
    // Add service worker registration for PWA capabilities
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
    
    console.log('SVPC e-Yantra Club website loaded successfully!');
});

// ===== ENHANCED PERFORMANCE OPTIMIZATIONS ===== //
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Enhanced lazy loading with fade-in effect
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease';
                
                img.src = img.dataset.src || img.src;
                img.onload = () => {
                    img.style.opacity = '1';
                    img.classList.remove('lazy');
                };
                
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px', // Start loading images 50px before they come into view
        threshold: 0.01
    });

    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== ENHANCED ERROR HANDLING ===== //
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    
    // Optional: Send error to analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.error?.message || 'Unknown error',
            fatal: false
        });
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    
    // Optional: Send error to analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.reason?.message || 'Unhandled promise rejection',
            fatal: false
        });
    }
});

// ===== NETWORK MONITORING ===== //
window.addEventListener('online', () => {
    console.log('Connection restored');
    // Optional: Show notification that connection is restored
});

window.addEventListener('offline', () => {
    console.log('Connection lost');
    // Optional: Show offline notification
});

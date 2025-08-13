// ===== PROJECTS PAGE APPLICATION ===== //

class ProjectsApp {
    constructor() {
        this.currentFilter = 'all';
        this.projects = [];
        this.isLoading = false;
        this.observers = new Map(); // Track observers for cleanup
        this.debounceTimers = new Map();
        this.animationFrameId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeBackButton();
        this.initializeSortDropdown();
        this.initializeLazyLoading();
        this.initializeProgressiveEnhancement();
        this.loadProjects();
        this.updateStats();
        this.initializeAccessibility();
    }

    // ===== PROGRESSIVE ENHANCEMENT ===== //
    initializeProgressiveEnhancement() {
        // Check for required features
        if (!('IntersectionObserver' in window)) {
            this.initializeFallbackAnimations();
        }

        // Respect user preferences
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

    // ===== EVENT LISTENERS ===== //
    setupEventListeners() {
        // Use passive listeners and debouncing for performance
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250), { passive: true });
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 16), { passive: true });
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Cleanup on page unload
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

    // ===== ENHANCED BACK BUTTON ===== //
    initializeBackButton() {
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateBack();
            });

            // Add keyboard support
            backBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.navigateBack();
                }
            });
        }
    }

    navigateBack() {
        // Add loading state
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.style.opacity = '0.7';
            backBtn.style.pointerEvents = 'none';
        }

        // Smooth transition
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0.8';

        // Use history API if available, fallback to direct navigation
        setTimeout(() => {
            try {
                if (document.referrer && document.referrer.includes(window.location.origin)) {
                    window.history.back();
                } else {
                    window.location.href = 'index.html';
                }
            } catch (error) {
                window.location.href = 'index.html';
            }
        }, 200);
    }

    // ===== ENHANCED SORT DROPDOWN ===== //
    initializeSortDropdown() {
        const sortOptions = document.querySelectorAll('.sort-option');
        const sortBtn = document.getElementById('sortBtn');
        const sortDropdown = document.querySelector('.sort-dropdown');

        if (!sortOptions.length || !sortBtn) return;

        sortOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = option.dataset.filter;
                this.setFilter(filter);
                
                // Update active state with animation
                sortOptions.forEach(opt => {
                    opt.classList.remove('active');
                    opt.style.transform = 'translateX(0)';
                });
                option.classList.add('active');
                option.style.transform = 'translateX(3px)';
                
                // Update button text with animation
                const span = sortBtn.querySelector('span');
                if (span) {
                    span.style.opacity = '0';
                    setTimeout(() => {
                        span.textContent = option.textContent;
                        span.style.opacity = '1';
                    }, 150);
                }

                // Close dropdown
                if (sortDropdown) {
                    sortDropdown.classList.remove('active');
                }
            });

            // Add keyboard support
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });
        });

        // Mobile dropdown toggle
        if (window.innerWidth <= 767) {
            sortBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (sortDropdown) {
                    sortDropdown.classList.toggle('active');
                }
            });
        }
    }

    // ===== ENHANCED FILTER FUNCTIONALITY ===== //
    setFilter(filter) {
        if (this.currentFilter === filter) return; // Prevent unnecessary work
        
        this.currentFilter = filter;
        this.filterProjects();
    }

    filterProjects() {
        const projectCards = document.querySelectorAll('.project-card');
        const noResults = document.getElementById('noResults');
        let visibleCount = 0;
        const animationPromises = [];

        // Cancel any ongoing animation
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // First pass: count and prepare animations
        projectCards.forEach(card => {
            const status = card.dataset.status;
            const shouldShow = this.currentFilter === 'all' || status === this.currentFilter;
            if (shouldShow) {
                visibleCount++;
            }
        });

        // Second pass: animate cards with staggered timing
        projectCards.forEach((card, index) => {
            const status = card.dataset.status;
            const shouldShow = this.currentFilter === 'all' || status === this.currentFilter;

            const animationPromise = new Promise((resolve) => {
                setTimeout(() => {
                    this.animationFrameId = requestAnimationFrame(() => {
                        if (shouldShow) {
                            this.showCard(card);
                        } else {
                            this.hideCard(card);
                        }
                        resolve();
                    });
                }, index * 50);
            });

            animationPromises.push(animationPromise);
        });

        // Show/hide no results after all animations
        Promise.all(animationPromises).then(() => {
            if (noResults) {
                if (visibleCount === 0) {
                    noResults.style.display = 'flex';
                    noResults.style.opacity = '0';
                    requestAnimationFrame(() => {
                        noResults.style.transition = 'opacity 0.3s ease';
                        noResults.style.opacity = '1';
                    });
                } else {
                    noResults.style.opacity = '0';
                    setTimeout(() => {
                        noResults.style.display = 'none';
                    }, 300);
                }
            }
        });
    }

    showCard(card) {
        card.classList.remove('filter-out');
        card.classList.add('filter-in');
        card.style.display = 'block';
        
        // Trigger reflow for smooth animation
        card.offsetHeight;
        
        requestAnimationFrame(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        });
    }

    hideCard(card) {
        card.classList.remove('filter-in');
        card.classList.add('filter-out');
        
        requestAnimationFrame(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px) scale(0.8)';
            
            setTimeout(() => {
                if (card.classList.contains('filter-out')) {
                    card.style.display = 'none';
                }
            }, 300);
        });
    }

    // ===== LAZY LOADING IMPLEMENTATION ===== //
    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadImage(entry.target);
                        imageObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            // Store observer for cleanup
            this.observers.set('images', imageObserver);

            // Observe all lazy images
            document.querySelectorAll('.lazy-image[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            this.loadAllImages();
        }
    }

    loadImage(img) {
        // Create a new image element to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
            // Fade in effect
            img.style.transition = 'opacity 0.3s ease';
            img.style.opacity = '0';
            
            // Set the actual source
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            
            // Fade in
            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });
            
            // Remove lazy class
            img.classList.remove('lazy-image');
        };

        imageLoader.onerror = () => {
            // Fallback image or error handling
            img.style.background = '#f0f0f0';
            img.classList.remove('lazy-image');
        };

        // Start loading
        imageLoader.src = img.dataset.src;
    }

    loadAllImages() {
        // Fallback: load all images immediately
        document.querySelectorAll('.lazy-image[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            img.classList.remove('lazy-image');
        });
    }

    // ===== ENHANCED PROJECTS LOADING ===== //
    loadProjects() {
        const loadingState = document.getElementById('loadingState');
        const projectsGrid = document.getElementById('projectsGrid');

        this.isLoading = true;

        // Add loading animation enhancement
        if (loadingState) {
            const spinner = loadingState.querySelector('.loading-spinner');
            if (spinner) {
                spinner.style.animation = 'spin 1s linear infinite';
            }
        }

        // Simulate loading with realistic timing
        setTimeout(() => {
            if (loadingState) {
                loadingState.style.opacity = '0';
                loadingState.style.transform = 'translateY(-20px)';
                
                setTimeout(() => {
                    loadingState.style.display = 'none';
                }, 300);
            }
            
            if (projectsGrid) {
                projectsGrid.classList.add('loaded');
                projectsGrid.style.opacity = '1';
                projectsGrid.style.transform = 'translateY(0)';
            }
            
            this.isLoading = false;
            this.initializeProjectCards();
            
        }, Math.random() * 800 + 500); // Realistic loading time
    }

    // ===== ENHANCED PROJECT CARDS ===== //
    initializeProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach((card, index) => {
            // Add staggered entrance animation
            card.style.animationDelay = `${index * 0.1}s`;
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.9)';
            
            // Animate in
            setTimeout(() => {
                requestAnimationFrame(() => {
                    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0) scale(1)';
                });
            }, index * 100);
            
            // Add enhanced interactions
            this.setupCardInteractions(card, index);
        });
    }

    setupCardInteractions(card, index) {
        const viewBtn = card.querySelector('.project-overlay .btn');
        const tags = card.querySelectorAll('.tag');

        // View details button
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewProjectDetails(card);
            });

            // Add keyboard support
            viewBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.viewProjectDetails(card);
                }
            });
        }

        // Tag interactions
        tags.forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.stopPropagation();
                this.filterByTag(tag.textContent);
            });
        });

        // Card hover optimization
        let hoverTimeout;
        card.addEventListener('mouseenter', () => {
            clearTimeout(hoverTimeout);
            card.style.willChange = 'transform';
        });

        card.addEventListener('mouseleave', () => {
            hoverTimeout = setTimeout(() => {
                card.style.willChange = 'auto';
            }, 300);
        });
    }

    // ===== PROJECT DETAILS ===== //
    viewProjectDetails(card) {
        const title = card.querySelector('h3')?.textContent || 'Unknown Project';
        const status = card.dataset.status;
        
        // Add visual feedback
        const viewBtn = card.querySelector('.project-overlay .btn');
        if (viewBtn) {
            viewBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            viewBtn.disabled = true;
        }

        // Simulate loading
        setTimeout(() => {
            this.showNotification(`Opening details for: ${title}`, 'info');
            
            // Reset button
            if (viewBtn) {
                viewBtn.innerHTML = 'View Details';
                viewBtn.disabled = false;
            }
            
            // Here you can add logic to open project details modal or navigate to project page
            console.log('View project details:', { title, status });
        }, 500);
    }

    filterByTag(tagText) {
        this.showNotification(`Filtering by tag: ${tagText}`, 'info');
        // Implement tag-based filtering if needed
    }

    // ===== ENHANCED STATS UPDATE ===== //
    updateStats() {
        const projectCards = document.querySelectorAll('.project-card');
        const totalElement = document.getElementById('totalProjects');
        const workingElement = document.getElementById('workingProjects');
        const completedElement = document.getElementById('completedProjects');

        // Count projects
        let total = projectCards.length;
        let working = 0;
        let completed = 0;

        projectCards.forEach(card => {
            const status = card.dataset.status;
            if (status === 'working') working++;
            if (status === 'completed') completed++;
        });

        // Animate counters with delay for visual appeal
        setTimeout(() => this.animateCounter(totalElement, total), 500);
        setTimeout(() => this.animateCounter(workingElement, working), 700);
        setTimeout(() => this.animateCounter(completedElement, completed), 900);
    }

    // ===== IMPROVED COUNTER ANIMATION ===== //
    animateCounter(element, target) {
        if (!element) return;

        const start = parseInt(element.textContent) || 0;
        const range = target - start;
        const duration = 1000;
        const startTime = performance.now();

        // Add pulsing effect during animation
        element.style.transform = 'scale(1.1)';
        element.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Enhanced easing function
            const easeOutElastic = 1 - Math.pow(1 - progress, 3) * Math.cos(progress * Math.PI * 2);
            const current = Math.round(start + (range * easeOutElastic));
            
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                // Final pulse effect
                element.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    // ===== ACCESSIBILITY ENHANCEMENTS ===== //
    initializeAccessibility() {
        // Add ARIA live region for filter announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'filter-announcements';
        document.body.appendChild(liveRegion);

        // Add keyboard navigation for project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'article');
            card.setAttribute('aria-label', `Project ${index + 1}: ${card.querySelector('h3')?.textContent}`);
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const viewBtn = card.querySelector('.project-overlay .btn');
                    if (viewBtn) {
                        viewBtn.click();
                    }
                }
            });
        });
    }

    announceFilterChange(filter, count) {
        const liveRegion = document.getElementById('filter-announcements');
        if (liveRegion) {
            liveRegion.textContent = `Showing ${count} ${filter === 'all' ? 'total' : filter} projects`;
        }
    }

    // ===== ENHANCED NOTIFICATION SYSTEM ===== //
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

        // Enhanced styles
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
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }
            `;
            document.head.appendChild(styles);
        }

        // Close functionality
        const closeBtn = notification.querySelector('.notification-close');
        const closeNotification = () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        };

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeNotification();
        });

        notification.addEventListener('click', closeNotification);

        document.body.appendChild(notification);
        
        // Show with slight delay for smooth animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove
        setTimeout(closeNotification, duration);
    }

    // ===== PERFORMANCE OPTIMIZATIONS ===== //
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause heavy operations when tab is not visible
            this.pauseAnimations();
        } else {
            this.resumeAnimations();
        }
    }

    pauseAnimations() {
        const spinners = document.querySelectorAll('.fa-spin');
        spinners.forEach(spinner => {
            spinner.style.animationPlayState = 'paused';
        });
    }

    resumeAnimations() {
        const spinners = document.querySelectorAll('.fa-spin');
        spinners.forEach(spinner => {
            spinner.style.animationPlayState = 'running';
        });
    }

    optimizeForSlowConnection() {
        // Disable heavy animations for slow connections
        const style = document.createElement('style');
        style.textContent = `
            .project-card {
                transition: transform 0.1s ease !important;
            }
            .project-card:hover {
                transform: translateY(-5px) scale(1.02) !important;
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
            }
        `;
        document.head.appendChild(style);
    }

    initializeFallbackAnimations() {
        // Fallback for browsers without IntersectionObserver
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
            }, index * 200);
        });
    }

    // ===== SCROLL HANDLING ===== //
    handleScroll() {
        // Add scroll-based optimizations if needed
        const scrollTop = window.pageYOffset;
        
        // Update navbar visibility based on scroll (if needed)
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }

    // ===== UTILITY FUNCTIONS ===== //
    handleResize() {
        // Re-initialize mobile-specific functionality if needed
        if (window.innerWidth <= 767) {
            this.initializeMobileOptimizations();
        }
    }

    initializeMobileOptimizations() {
        // Add mobile-specific optimizations
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            // Reduce hover effects on mobile
            card.style.willChange = 'auto';
        });
    }

    handleDocumentClick(e) {
        // Close dropdown when clicking outside
        const sortDropdown = document.querySelector('.sort-dropdown');
        if (sortDropdown && !sortDropdown.contains(e.target)) {
            sortDropdown.classList.remove('active');
        }
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            // Close any open modals or dropdowns
            const sortDropdown = document.querySelector('.sort-dropdown.active');
            if (sortDropdown) {
                sortDropdown.classList.remove('active');
            }
        }
    }

    // ===== CLEANUP ===== //
    cleanup() {
        // Clean up observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();

        // Clear timers
        this.debounceTimers.forEach(timer => {
            clearTimeout(timer);
        });
        this.debounceTimers.clear();

        // Cancel animation frames
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

// ===== INITIALIZE APPLICATION ===== //
document.addEventListener('DOMContentLoaded', () => {
    const app = new ProjectsApp();
    
    // Add service worker registration if available
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered:', registration))
            .catch(error => console.log('SW registration failed:', error));
    }
    
    console.log('Projects page loaded successfully!');
});

// ===== ERROR HANDLING ===== //
window.addEventListener('error', (e) => {
    console.error('Projects page error:', e.error);
    
    // Optional: Send to analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.error?.message || 'Unknown error',
            fatal: false
        });
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});

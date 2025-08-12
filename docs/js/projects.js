// ===== PROJECTS PAGE APPLICATION ===== //

class ProjectsApp {
    constructor() {
        this.currentFilter = 'all';
        this.projects = [];
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeLoginModal();
        this.initializeBackButton();
        this.initializeSortDropdown();
        this.loadProjects();
        this.updateStats();
    }

    // ===== EVENT LISTENERS ===== //
    setupEventListeners() {
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        document.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    // ===== BACK BUTTON FUNCTIONALITY ===== //
    initializeBackButton() {
        const backBtn = document.getElementById('backBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                // Add smooth transition before navigation
                document.body.style.opacity = '0.8';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 200);
            });
        }
    }

    // ===== SORT DROPDOWN FUNCTIONALITY ===== //
    initializeSortDropdown() {
        const sortOptions = document.querySelectorAll('.sort-option');
        const sortBtn = document.getElementById('sortBtn');

        sortOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = option.dataset.filter;
                this.setFilter(filter);
                
                // Update active state
                sortOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Update button text
                if (sortBtn) {
                    const span = sortBtn.querySelector('span');
                    if (span) {
                        span.textContent = option.textContent;
                    }
                }
            });
        });
    }

    // ===== FILTER FUNCTIONALITY ===== //
    setFilter(filter) {
        this.currentFilter = filter;
        this.filterProjects();
    }

    filterProjects() {
        const projectCards = document.querySelectorAll('.project-card');
        const noResults = document.getElementById('noResults');
        let visibleCount = 0;

        // First pass: count visible items
        projectCards.forEach(card => {
            const status = card.dataset.status;
            const shouldShow = this.currentFilter === 'all' || status === this.currentFilter;
            if (shouldShow) {
                visibleCount++;
            }
        });

        // Second pass: animate cards
        projectCards.forEach((card, index) => {
            const status = card.dataset.status;
            const shouldShow = this.currentFilter === 'all' || status === this.currentFilter;

            setTimeout(() => {
                if (shouldShow) {
                    card.classList.remove('filter-out');
                    card.classList.add('filter-in');
                    card.style.display = 'block';
                } else {
                    card.classList.remove('filter-in');
                    card.classList.add('filter-out');
                    setTimeout(() => {
                        if (card.classList.contains('filter-out')) {
                            card.style.display = 'none';
                        }
                    }, 300);
                }
            }, index * 50);
        });

        // Show/hide no results
        setTimeout(() => {
            if (noResults) {
                noResults.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        }, 300);
    }

    // ===== PROJECTS LOADING ===== //
    loadProjects() {
        const loadingState = document.getElementById('loadingState');
        const projectsGrid = document.getElementById('projectsGrid');

        this.isLoading = true;

        // Simulate loading time
        setTimeout(() => {
            if (loadingState) {
                loadingState.style.display = 'none';
            }
            if (projectsGrid) {
                projectsGrid.classList.add('loaded');
            }
            this.isLoading = false;
            this.initializeProjectCards();
        }, 1000);
    }

    // ===== PROJECT CARDS INITIALIZATION ===== //
    initializeProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach((card, index) => {
            // Add staggered entrance animation
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Add click handler for view details
            const viewBtn = card.querySelector('.project-overlay .btn');
            if (viewBtn) {
                viewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.viewProjectDetails(card);
                });
            }
        });
    }

    // ===== PROJECT DETAILS ===== //
    viewProjectDetails(card) {
        const title = card.querySelector('h3').textContent;
        this.showNotification(`Opening details for: ${title}`, 'info');
        
        // Here you can add logic to open project details modal or navigate to project page
        console.log('View project details:', title);
    }

    // ===== STATS UPDATE ===== //
    updateStats() {
        const projectCards = document.querySelectorAll('.project-card');
        const totalElement = document.getElementById('totalProjects');
        const workingElement = document.getElementById('workingProjects');
        const completedElement = document.getElementById('completedProjects');

        // Always count from all cards, not filtered ones
        let total = projectCards.length;
        let working = 0;
        let completed = 0;

        projectCards.forEach(card => {
            const status = card.dataset.status;
            if (status === 'working') working++;
            if (status === 'completed') completed++;
        });

        // Update counters with smooth animation
        this.animateCounter(totalElement, total);
        this.animateCounter(workingElement, working);
        this.animateCounter(completedElement, completed);
    }

    // ===== IMPROVED COUNTER ANIMATION ===== //
    animateCounter(element, target) {
        if (!element) return;

        const start = parseInt(element.textContent) || 0;
        const range = target - start;
        const duration = 800;
        const startTime = performance.now();

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (range * easeOut));
            
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };

        requestAnimationFrame(updateCounter);
    }

    // ===== LOGIN MODAL (Reused from main.js) ===== //
    initializeLoginModal() {
        const loginBtn = document.getElementById('loginBtn');
        const modal = document.getElementById('loginModal');
        const modalClose = document.getElementById('modalClose');
        const loginForm = document.getElementById('loginForm');
        const passwordToggle = document.getElementById('passwordToggle');
        const passwordInput = document.getElementById('password');

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
    }

    showLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            const firstInput = modal.querySelector('#username');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 200);
            }
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            const form = document.getElementById('loginForm');
            if (form) {
                form.reset();
            }
        }
    }

    async handleLogin() {
        const submitBtn = document.getElementById('loginSubmit');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (!submitBtn || !usernameInput || !passwordInput) return;

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }

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

            if (response.ok) {
                const data = await response.json();
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
                const data = await response.json();
                this.showNotification(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Connection error. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
        }
    }

    // ===== NOTIFICATION SYSTEM ===== //
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        `;

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
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ===== UTILITY FUNCTIONS ===== //
    handleResize() {
        // Handle responsive adjustments if needed
    }

    handleDocumentClick(e) {
        // Handle clicks outside dropdowns
        const sortDropdown = document.querySelector('.sort-dropdown');
        if (sortDropdown && !sortDropdown.contains(e.target)) {
            // Close dropdown if clicking outside
        }
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.hideLoginModal();
        }
    }
}

// ===== INITIALIZE APPLICATION ===== //
document.addEventListener('DOMContentLoaded', () => {
    const app = new ProjectsApp();
    console.log('Projects page loaded successfully!');
});

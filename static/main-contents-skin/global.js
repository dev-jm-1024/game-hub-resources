// Apple macOS/iOS 스타일 전역 JavaScript

// 전역 변수 및 설정
const AppConfig = {
    theme: 'auto', // 'light', 'dark', 'auto'
    animations: true,
    reducedMotion: false,
    debug: false
};

// 유틸리티 함수들
const Utils = {
    // 디바운스 함수
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 스로틀 함수
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 요소가 뷰포트에 있는지 확인
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    // 부드러운 스크롤
    smoothScrollTo(element, duration = 800) {
        const targetPosition = element.offsetTop;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    },

    // 로컬 스토리지 헬퍼
    storage: {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('localStorage not available:', e);
            }
        },
        get(key) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.warn('localStorage not available:', e);
                return null;
            }
        },
        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn('localStorage not available:', e);
            }
        }
    },

    // 쿠키 헬퍼
    cookie: {
        set(name, value, days = 30) {
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        },
        get(name) {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
            }
            return null;
        },
        remove(name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }
    },

    // 포맷팅 함수들
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    },

    formatNumber(num) {
        return new Intl.NumberFormat().format(num);
    },

    // 상대적 시간 표시
    timeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

        if (diffInSeconds < 60) return '방금 전';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}달 전`;
        return `${Math.floor(diffInSeconds / 31536000)}년 전`;
    }
};

// 테마 관리자
const ThemeManager = {
    init() {
        this.loadTheme();
        this.setupThemeToggle();
        this.watchSystemTheme();
    },

    loadTheme() {
        const savedTheme = Utils.storage.get('theme') || 'auto';
        AppConfig.theme = savedTheme;
        this.applyTheme(savedTheme);
    },

    applyTheme(theme) {
        const root = document.documentElement;

        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            root.setAttribute('data-theme', theme);
        }

        // 테마 변경 이벤트 발생
        document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
    },

    toggleTheme() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(AppConfig.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];

        AppConfig.theme = nextTheme;
        Utils.storage.set('theme', nextTheme);
        this.applyTheme(nextTheme);
    },

    setupThemeToggle() {
        const toggleButtons = document.querySelectorAll('[data-theme-toggle]');
        toggleButtons.forEach(button => {
            button.addEventListener('click', () => this.toggleTheme());
        });
    },

    watchSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (AppConfig.theme === 'auto') {
                this.applyTheme('auto');
            }
        });
    }
};

// 애니메이션 관리자
const AnimationManager = {
    init() {
        this.checkReducedMotion();
        this.setupScrollAnimations();
        this.setupHoverEffects();
    },

    checkReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        AppConfig.reducedMotion = prefersReducedMotion;

        if (prefersReducedMotion) {
            document.body.classList.add('reduced-motion');
        }
    },

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // 스크롤 애니메이션 요소들 관찰
        const animatedElements = document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-reveal');
        animatedElements.forEach(el => observer.observe(el));
    },

    setupHoverEffects() {
        // 카드 호버 효과
        const cards = document.querySelectorAll('.card, .content-card, .feature-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!AppConfig.reducedMotion) {
                    card.style.transform = 'translateY(-4px)';
                }
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }
};

// 알림 시스템
const NotificationManager = {
    container: null,

    init() {
        this.createContainer();
    },

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 400px;
        `;
        document.body.appendChild(this.container);
    },

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type]}</div>
            <div class="notification-message">${message}</div>
            <button class="notification-close" onclick="this.parentElement.remove()">✕</button>
        `;

        this.container.appendChild(notification);

        // 자동 제거
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);
        }

        // 애니메이션
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        });

        return notification;
    },

    success(message, duration) {
        return this.show(message, 'success', duration);
    },

    error(message, duration) {
        return this.show(message, 'error', duration);
    },

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    },

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
};

// 로딩 관리자
const LoadingManager = {
    overlay: null,

    init() {
        this.createOverlay();
    },

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-spinner"></div>
        `;
        document.body.appendChild(this.overlay);
    },

    show() {
        this.overlay.classList.add('active');
    },

    hide() {
        this.overlay.classList.remove('active');
    }
};

// 모달 관리자
const ModalManager = {
    activeModal: null,

    init() {
        this.setupModalTriggers();
        this.setupKeyboardHandlers();
    },

    setupModalTriggers() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-modal-trigger]');
            if (trigger) {
                const modalId = trigger.dataset.modalTrigger;
                this.open(modalId);
            }

            const closeBtn = e.target.closest('[data-modal-close]');
            if (closeBtn) {
                this.close();
            }
        });
    },

    setupKeyboardHandlers() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.close();
            }
        });
    },

    open(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        this.activeModal = modal;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // 포커스 트랩
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    },

    close() {
        if (this.activeModal) {
            this.activeModal.classList.remove('active');
            document.body.style.overflow = '';
            this.activeModal = null;
        }
    }
};

// 스크롤 투 탑 버튼
const ScrollToTop = {
    button: null,

    init() {
        this.createButton();
        this.setupScrollListener();
    },

    createButton() {
        this.button = document.createElement('button');
        this.button.className = 'scroll-to-top';
        this.button.innerHTML = '↑';
        this.button.setAttribute('aria-label', '맨 위로 이동');

        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        document.body.appendChild(this.button);
    },

    setupScrollListener() {
        const toggleButton = Utils.throttle(() => {
            if (window.pageYOffset > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        }, 100);

        window.addEventListener('scroll', toggleButton);
    }
};

// 폼 검증 시스템
const FormValidator = {
    init() {
        this.setupFormValidation();
    },

    setupFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });

            // 실시간 검증
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    },

    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    },

    validateField(field) {
        const value = field.value.trim();
        const rules = field.dataset.rules ? field.dataset.rules.split('|') : [];
        let isValid = true;
        let errorMessage = '';

        // 필수 필드 검증
        if (rules.includes('required') && !value) {
            isValid = false;
            errorMessage = '필수 입력 항목입니다.';
        }

        // 이메일 검증
        if (rules.includes('email') && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = '올바른 이메일 형식이 아닙니다.';
            }
        }

        // 최소 길이 검증
        const minLength = rules.find(rule => rule.startsWith('min:'));
        if (minLength && value) {
            const min = parseInt(minLength.split(':')[1]);
            if (value.length < min) {
                isValid = false;
                errorMessage = `최소 ${min}자 이상 입력해주세요.`;
            }
        }

        // 에러 메시지 표시
        this.showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    },

    showFieldError(field, message) {
        let errorElement = field.parentNode.querySelector('.field-error');

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }

        errorElement.textContent = message;
        field.classList.toggle('error', !!message);
    }
};

// 검색 기능
const SearchManager = {
    init() {
        this.setupSearchInputs();
    },

    setupSearchInputs() {
        const searchInputs = document.querySelectorAll('[data-search]');
        searchInputs.forEach(input => {
            const searchHandler = Utils.debounce((value) => {
                this.performSearch(value, input.dataset.search);
            }, 300);

            input.addEventListener('input', (e) => {
                searchHandler(e.target.value);
            });
        });
    },

    performSearch(query, target) {
        if (!query.trim()) {
            this.clearSearch(target);
            return;
        }

        const targetElements = document.querySelectorAll(`[data-searchable="${target}"]`);
        targetElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            const matches = text.includes(query.toLowerCase());
            element.style.display = matches ? '' : 'none';
        });
    },

    clearSearch(target) {
        const targetElements = document.querySelectorAll(`[data-searchable="${target}"]`);
        targetElements.forEach(element => {
            element.style.display = '';
        });
    }
};

// 키보드 단축키
const KeyboardShortcuts = {
    shortcuts: {
        'ctrl+k': () => {
            const searchInput = document.querySelector('[data-search]');
            if (searchInput) {
                searchInput.focus();
            }
        },
        'escape': () => {
            ModalManager.close();
        },
        'ctrl+/': () => {
            this.showHelp();
        }
    },

    init() {
        document.addEventListener('keydown', (e) => {
            const key = this.getKeyCombo(e);
            if (this.shortcuts[key]) {
                e.preventDefault();
                this.shortcuts[key]();
            }
        });
    },

    getKeyCombo(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    },

    showHelp() {
        NotificationManager.info('단축키: Ctrl+K (검색), Escape (닫기), Ctrl+/ (도움말)');
    }
};

// 초기화 함수
function initializeApp() {
    // DOM이 준비되면 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        try {
            ThemeManager.init();
            AnimationManager.init();
            NotificationManager.init();
            LoadingManager.init();
            ModalManager.init();
            ScrollToTop.init();
            FormValidator.init();
            SearchManager.init();
            KeyboardShortcuts.init();

            // 로딩 완료 이벤트
            document.dispatchEvent(new CustomEvent('appready'));

            if (AppConfig.debug) {
                console.log('App initialized successfully');
            }
        } catch (error) {
            console.error('App initialization failed:', error);
        }
    }
}

// 전역 API 노출
window.App = {
    config: AppConfig,
    utils: Utils,
    theme: ThemeManager,
    animations: AnimationManager,
    notifications: NotificationManager,
    loading: LoadingManager,
    modal: ModalManager,
    validator: FormValidator,
    search: SearchManager
};

// 앱 초기화
initializeApp();
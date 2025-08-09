// Mac OS/iOS 스타일 헤더 JavaScript

class HeaderManager {
    constructor() {
        this.header = null;
        this.isScrolled = false;
        this.lastScrollY = 0;
        this.isHidden = false;
        this.searchInput = null;
        this.mobileMenuButton = null;
        this.profileDropdown = null;

        // 타이머 및 이벤트 리스너 관리
        this.timers = new Set();
        this.eventListeners = new Map();
        this.observers = new Set();

        // 성능 최적화
        this.isInitialized = false;
        this.rafId = null;
        this.lastRafTime = 0;

        // 메모리 누수 방지
        this.boundMethods = new Map();

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        this.header = document.querySelector('.site-header');
        if (!this.header) return;

        // 메서드 바인딩 캐시
        this.bindMethods();

        this.setupScrollBehavior();
        this.setupSearch();
        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupProfileMenu();
        this.setupKeyboardNavigation();
        this.setupThemeHandling();
        this.setupAccessibility();

        this.isInitialized = true;
    }

    // 메서드 바인딩 캐시로 메모리 최적화
    bindMethods() {
        const methodsToCache = [
            'handleScroll',
            'handleResize',
            'handleClick',
            'handleKeydown',
            'handleVisibilityChange'
        ];

        methodsToCache.forEach(methodName => {
            if (this[methodName]) {
                this.boundMethods.set(methodName, this[methodName].bind(this));
            }
        });
    }

    // 이벤트 리스너 추가 헬퍼
    addEventListener(element, event, handler, options = {}) {
        const key = `${element.constructor.name}-${event}`;

        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }

        const boundHandler = typeof handler === 'string'
            ? this.boundMethods.get(handler) || this[handler].bind(this)
            : handler.bind(this);

        element.addEventListener(event, boundHandler, options);
        this.eventListeners.get(key).push({ element, event, handler: boundHandler, options });
    }

    // 타이머 관리 헬퍼
    setTimeout(callback, delay) {
        const timer = setTimeout(() => {
            this.timers.delete(timer);
            callback();
        }, delay);

        this.timers.add(timer);
        return timer;
    }

    setInterval(callback, delay) {
        const timer = setInterval(callback, delay);
        this.timers.add(timer);
        return timer;
    }

    // 프로필 메뉴 설정 - 드롭다운 수정
    setupProfileMenu() {
        const profileButton = this.header.querySelector('.user-profile');
        const dropdownBtn = this.header.querySelector('.profile-dropdown-btn');
        const dropdownMenu = this.header.querySelector('.user-actions.dropdown-menu');

        if (!profileButton || !dropdownBtn || !dropdownMenu) return;

        console.log('프로필 메뉴 설정 시작');

        // 드롭다운 버튼 클릭
        dropdownBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('드롭다운 버튼 클릭됨');
            this.toggleProfileDropdown();
        });

        // 프로필 영역 전체 클릭
        profileButton.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-dropdown-btn')) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleProfileDropdown();
            }
        });

        // 외부 클릭시 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.logged-user')) {
                this.closeProfileDropdown();
            }
        });

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeProfileDropdown();
            }
        });

        // 프로필 이미지 오류 처리
        const profileImg = profileButton.querySelector('.profile-img');
        if (profileImg) {
            profileImg.addEventListener('error', () => {
                profileImg.src = '/static/images/default-profile.png';
            });
        }

        console.log('프로필 메뉴 설정 완료');
    }

    toggleProfileDropdown() {
        const dropdownMenu = this.header.querySelector('.user-actions.dropdown-menu');
        const dropdownBtn = this.header.querySelector('.profile-dropdown-btn');

        if (!dropdownMenu || !dropdownBtn) return;

        const isOpen = dropdownMenu.classList.contains('show');

        if (isOpen) {
            this.closeProfileDropdown();
        } else {
            this.openProfileDropdown();
        }
    }

    openProfileDropdown() {
        const dropdownMenu = this.header.querySelector('.user-actions.dropdown-menu');
        const dropdownBtn = this.header.querySelector('.profile-dropdown-btn');

        if (!dropdownMenu || !dropdownBtn) {
            console.error('드롭다운 요소를 찾을 수 없음');
            return;
        }

        // 강제로 스타일 적용
        dropdownMenu.style.display = 'block';
        dropdownMenu.style.opacity = '1';
        dropdownMenu.style.transform = 'translateY(0)';
        dropdownMenu.style.zIndex = '10000';
        dropdownMenu.style.position = 'absolute';
        dropdownMenu.style.top = '100%';
        dropdownMenu.style.right = '0';

        dropdownMenu.classList.add('show');
        dropdownBtn.setAttribute('aria-expanded', 'true');

        console.log('✅ 드롭다운 열림 - show 클래스 및 강제 스타일 적용됨');
        console.log('드롭다운 메뉴 표시 상태:', getComputedStyle(dropdownMenu).display);
        console.log('드롭다운 메뉴 z-index:', getComputedStyle(dropdownMenu).zIndex);
        console.log('드롭다운 메뉴 opacity:', getComputedStyle(dropdownMenu).opacity);

        // 첫 번째 버튼에 포커스
        const firstButton = dropdownMenu.querySelector('.logout-btn');
        if (firstButton) {
            setTimeout(() => firstButton.focus(), 100);
        }
    }

    closeProfileDropdown() {
        const dropdownMenu = this.header.querySelector('.user-actions.dropdown-menu');
        const dropdownBtn = this.header.querySelector('.profile-dropdown-btn');

        if (!dropdownMenu || !dropdownBtn) return;

        // 강제로 스타일 제거
        dropdownMenu.style.display = 'none';
        dropdownMenu.style.opacity = '0';
        dropdownMenu.style.transform = 'translateY(-10px)';

        dropdownMenu.classList.remove('show');
        dropdownBtn.setAttribute('aria-expanded', 'false');

        console.log('🔒 드롭다운 닫힘');
    }

    // 스크롤 동작 설정 - Apple 스타일 (최적화)
    setupScrollBehavior() {
        this.handleScroll = () => {
            if (this.rafId) return;

            this.rafId = requestAnimationFrame((currentTime) => {
                // 16ms 간격으로 제한 (60fps)
                if (currentTime - this.lastRafTime >= 16) {
                    this.updateHeaderOnScroll();
                    this.lastRafTime = currentTime;
                }
                this.rafId = null;
            });
        };

        this.addEventListener(window, 'scroll', this.handleScroll, { passive: true });
        this.updateHeaderOnScroll();
    }

    updateHeaderOnScroll() {
        const currentScrollY = window.pageYOffset;
        const scrollThreshold = 10;
        const hideThreshold = 100;

        if (currentScrollY > scrollThreshold && !this.isScrolled) {
            this.isScrolled = true;
            this.header.classList.add('scrolled');
        } else if (currentScrollY <= scrollThreshold && this.isScrolled) {
            this.isScrolled = false;
            this.header.classList.remove('scrolled');
        }

        if (window.innerWidth <= 768) {
            const scrollDelta = currentScrollY - this.lastScrollY;
            const isScrollingDown = scrollDelta > 0;
            const isScrollingUp = scrollDelta < 0;

            if (isScrollingDown && currentScrollY > hideThreshold && !this.isHidden) {
                this.hideHeader();
            } else if (isScrollingUp && this.isHidden) {
                this.showHeader();
            }
        } else {
            this.showHeader();
        }

        this.lastScrollY = currentScrollY;
    }

    hideHeader() {
        this.isHidden = true;
        this.header.classList.add('hide');
        this.header.classList.remove('show');
    }

    showHeader() {
        this.isHidden = false;
        this.header.classList.add('show');
        this.header.classList.remove('hide');
    }

    // 기본 메서드들 (간소화)
    setupSearch() {
        this.searchInput = this.header.querySelector('#search-input');
        if (!this.searchInput) return;

        // 간단한 검색 기능만 유지
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = this.searchInput.value.trim();
                if (query) {
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    setupMobileMenu() {
        // 기본 모바일 메뉴 기능
    }

    setupDropdowns() {
        // 기본 드롭다운 기능 (프로필 메뉴에서 처리)
    }

    setupKeyboardNavigation() {
        // 기본 키보드 네비게이션
    }

    setupThemeHandling() {
        // 기본 테마 처리
    }

    setupAccessibility() {
        // 기본 접근성 기능
    }

    closeAllDropdowns() {
        this.closeProfileDropdown();
    }

    // 사용자 정보 업데이트
    updateUserInfo(userInfo) {
        const profileName = this.header.querySelector('.user-nickname');
        const profileImg = this.header.querySelector('.profile-img');

        if (profileName) {
            profileName.textContent = userInfo.nickname || userInfo.name;
        }

        if (profileImg && userInfo.profileImage) {
            profileImg.src = userInfo.profileImage;
            profileImg.alt = `${userInfo.nickname || userInfo.name} 프로필 이미지`;
        }
    }

    updateHeaderState(state) {
        this.header.classList.remove('loading', 'error', 'success');
        if (state) {
            this.header.classList.add(state);
        }
    }

    destroy() {
        // RAF 취소
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // 모든 타이머 정리
        this.timers.forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        this.timers.clear();

        // 모든 이벤트 리스너 제거
        this.eventListeners.forEach(listeners => {
            listeners.forEach(({ element, event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.eventListeners.clear();

        // 옵저버 정리
        this.observers.forEach(observer => {
            if (observer.disconnect) observer.disconnect();
            if (observer.unobserve) observer.unobserve();
        });
        this.observers.clear();

        // 바인딩된 메서드 정리
        this.boundMethods.clear();

        // DOM 참조 해제
        this.header = null;
        this.searchInput = null;
        this.mobileMenuButton = null;
        this.profileDropdown = null;

        // 상태 초기화
        this.isInitialized = false;

        document.body.style.overflow = '';

        console.log('🧹 HeaderManager 메모리 정리 완료');
    }

    // 메모리 사용량 모니터링
    getMemoryUsage() {
        return {
            timers: this.timers.size,
            eventListeners: Array.from(this.eventListeners.values()).reduce((sum, arr) => sum + arr.length, 0),
            observers: this.observers.size,
            boundMethods: this.boundMethods.size,
            isInitialized: this.isInitialized
        };
    }
}

// 헤더 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.headerManager = new HeaderManager();
});

// 전역 헤더 API
window.Header = {
    updateUserInfo: (userInfo) => {
        if (window.headerManager) {
            window.headerManager.updateUserInfo(userInfo);
        }
    },

    showLoading: () => {
        if (window.headerManager) {
            window.headerManager.updateHeaderState('loading');
        }
    },

    hideLoading: () => {
        if (window.headerManager) {
            window.headerManager.updateHeaderState(null);
        }
    },

    closeAllMenus: () => {
        if (window.headerManager) {
            window.headerManager.closeAllDropdowns();
        }
    }
};
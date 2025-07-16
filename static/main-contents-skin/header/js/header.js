// Apple macOS/iOS 스타일 헤더 JavaScript

class HeaderManager {
    constructor() {
        this.header = null;
        this.isScrolled = false;
        this.lastScrollY = 0;
        this.isHidden = false;
        this.searchInput = null;
        this.mobileMenuButton = null;
        this.profileDropdown = null;
        this.notificationDropdown = null;

        this.init();
    }

    init() {
        this.header = document.querySelector('header');
        if (!this.header) return;

        this.setupScrollBehavior();
        this.setupSearch();
        this.setupMobileMenu();
        this.setupDropdowns();
        this.setupNotifications();
        this.setupProfileMenu();
        this.setupKeyboardNavigation();
    }

    // 스크롤 동작 설정
    setupScrollBehavior() {
        const handleScroll = () => {
            const currentScrollY = window.pageYOffset;
            const scrollThreshold = 10;

            // 스크롤 상태 업데이트
            if (currentScrollY > scrollThreshold && !this.isScrolled) {
                this.isScrolled = true;
                this.header.classList.add('scrolled');
            } else if (currentScrollY <= scrollThreshold && this.isScrolled) {
                this.isScrolled = false;
                this.header.classList.remove('scrolled');
            }

            // 헤더 숨김/표시 (모바일에서)
            if (window.innerWidth <= 768) {
                const scrollDelta = currentScrollY - this.lastScrollY;

                if (scrollDelta > 5 && currentScrollY > 100 && !this.isHidden) {
                    this.hideHeader();
                } else if (scrollDelta < -5 && this.isHidden) {
                    this.showHeader();
                }
            }

            this.lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', Utils.throttle(handleScroll, 16));
    }

    hideHeader() {
        this.isHidden = true;
        this.header.style.transform = 'translateY(-100%)';
    }

    showHeader() {
        this.isHidden = false;
        this.header.style.transform = 'translateY(0)';
    }

    // 검색 기능 설정
    setupSearch() {
        this.searchInput = this.header.querySelector('.search-form input[type="text"]');
        if (!this.searchInput) return;

        const searchContainer = this.searchInput.parentElement;
        const searchResults = this.createSearchResults();

        // 검색 입력 이벤트
        this.searchInput.addEventListener('input', Utils.debounce((e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                this.performSearch(query, searchResults);
            } else {
                this.hideSearchResults(searchResults);
            }
        }, 300));

        // 검색 포커스 이벤트
        this.searchInput.addEventListener('focus', () => {
            searchContainer.classList.add('focused');
        });

        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                searchContainer.classList.remove('focused');
                this.hideSearchResults(searchResults);
            }, 200);
        });

        // 키보드 네비게이션
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.searchInput.blur();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this.executeSearch(this.searchInput.value);
            }
        });
    }

    createSearchResults() {
        const results = document.createElement('div');
        results.className = 'search-results';
        results.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--background-tertiary);
            border: 1px solid var(--separator-non-opaque);
            border-radius: 12px;
            box-shadow: var(--shadow-heavy);
            max-height: 400px;
            overflow-y: auto;
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        `;

        this.searchInput.parentElement.appendChild(results);
        return results;
    }

    async performSearch(query, resultsContainer) {
        try {
            // 로딩 상태 표시
            resultsContainer.innerHTML = `
                <div class="search-loading">
                    <div class="loading-spinner"></div>
                    <span>검색 중...</span>
                </div>
            `;
            this.showSearchResults(resultsContainer);

            // 실제 검색 API 호출 (예시)
            const results = await this.searchAPI(query);
            this.displaySearchResults(results, resultsContainer);
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = `
                <div class="search-error">검색 중 오류가 발생했습니다.</div>
            `;
        }
    }

    async searchAPI(query) {
        // 실제 API 호출 대신 모의 데이터 반환
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { type: 'page', title: '홈페이지', url: '/' },
                    { type: 'post', title: `"${query}"에 대한 게시물`, url: '/posts' },
                    { type: 'user', title: `"${query}" 사용자`, url: '/users' }
                ]);
            }, 500);
        });
    }

    displaySearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="search-no-results">검색 결과가 없습니다.</div>
            `;
            return;
        }

        const html = results.map(result => `
            <a href="${result.url}" class="search-result-item">
                <div class="search-result-icon">${this.getResultIcon(result.type)}</div>
                <div class="search-result-content">
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-type">${this.getResultType(result.type)}</div>
                </div>
            </a>
        `).join('');

        container.innerHTML = html;
    }

    getResultIcon(type) {
        const icons = {
            page: '📄',
            post: '📝',
            user: '👤'
        };
        return icons[type] || '📄';
    }

    getResultType(type) {
        const types = {
            page: '페이지',
            post: '게시물',
            user: '사용자'
        };
        return types[type] || '페이지';
    }

    showSearchResults(container) {
        container.style.opacity = '1';
        container.style.visibility = 'visible';
        container.style.transform = 'translateY(0)';
    }

    hideSearchResults(container) {
        container.style.opacity = '0';
        container.style.visibility = 'hidden';
        container.style.transform = 'translateY(-10px)';
    }

    executeSearch(query) {
        if (query.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    }

    // 모바일 메뉴 설정
    setupMobileMenu() {
        this.mobileMenuButton = this.header.querySelector('.mobile-menu-button');
        if (!this.mobileMenuButton) return;

        this.mobileMenuButton.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // 모바일 메뉴 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.mobile-menu-button') &&
                !e.target.closest('.mobile-menu')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.mobileMenuButton.classList.toggle('active');
        const mobileMenu = document.querySelector('.mobile-menu');

        if (mobileMenu) {
            mobileMenu.classList.toggle('active');
        } else {
            this.createMobileMenu();
        }
    }

    createMobileMenu() {
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu active';
        mobileMenu.innerHTML = `
            <div class="mobile-menu-content">
                <nav class="mobile-nav">
                    <a href="/" class="mobile-nav-item">홈</a>
                    <a href="/posts" class="mobile-nav-item">게시물</a>
                    <a href="/about" class="mobile-nav-item">소개</a>
                    <a href="/contact" class="mobile-nav-item">연락처</a>
                </nav>
                <div class="mobile-menu-user">
                    <div class="mobile-user-info">
                        <div class="mobile-user-avatar">U</div>
                        <div class="mobile-user-name">사용자</div>
                    </div>
                    <div class="mobile-user-actions">
                        <a href="/profile" class="mobile-user-action">프로필</a>
                        <a href="/settings" class="mobile-user-action">설정</a>
                        <a href="/logout" class="mobile-user-action">로그아웃</a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(mobileMenu);
    }

    closeMobileMenu() {
        this.mobileMenuButton.classList.remove('active');
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.remove('active');
            setTimeout(() => mobileMenu.remove(), 300);
        }
    }

    // 드롭다운 설정
    setupDropdowns() {
        const dropdownTriggers = this.header.querySelectorAll('[data-dropdown]');

        dropdownTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown(trigger);
            });
        });

        // 외부 클릭 시 드롭다운 닫기
        document.addEventListener('click', () => {
            this.closeAllDropdowns();
        });
    }

    toggleDropdown(trigger) {
        const dropdown = trigger.nextElementSibling;
        if (!dropdown) return;

        const isActive = dropdown.classList.contains('active');

        // 다른 드롭다운 모두 닫기
        this.closeAllDropdowns();

        // 현재 드롭다운 토글
        if (!isActive) {
            dropdown.classList.add('active');
            trigger.classList.add('active');
        }
    }

    closeAllDropdowns() {
        const dropdowns = this.header.querySelectorAll('.header-dropdown');
        const triggers = this.header.querySelectorAll('[data-dropdown]');

        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        triggers.forEach(trigger => trigger.classList.remove('active'));
    }

    // 알림 설정
    setupNotifications() {
        const notificationButton = this.header.querySelector('.header-notifications');
        if (!notificationButton) return;

        notificationButton.addEventListener('click', () => {
            this.toggleNotifications();
        });

        // 알림 개수 업데이트
        this.updateNotificationCount();
    }

    toggleNotifications() {
        let notificationPanel = document.querySelector('.notification-panel');

        if (!notificationPanel) {
            notificationPanel = this.createNotificationPanel();
        }

        notificationPanel.classList.toggle('active');
    }

    createNotificationPanel() {
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-header">
                <h3>알림</h3>
                <button class="mark-all-read">모두 읽음</button>
            </div>
            <div class="notification-list">
                <div class="notification-item">
                    <div class="notification-icon">💬</div>
                    <div class="notification-content">
                        <div class="notification-title">새 댓글이 있습니다</div>
                        <div class="notification-time">5분 전</div>
                    </div>
                </div>
                <div class="notification-item">
                    <div class="notification-icon">👍</div>
                    <div class="notification-content">
                        <div class="notification-title">게시물에 좋아요가 눌렸습니다</div>
                        <div class="notification-time">1시간 전</div>
                    </div>
                </div>
            </div>
            <div class="notification-footer">
                <a href="/notifications">모든 알림 보기</a>
            </div>
        `;

        document.body.appendChild(panel);
        return panel;
    }

    updateNotificationCount() {
        const badge = this.header.querySelector('.header-notifications-badge');
        if (!badge) return;

        // 실제로는 API에서 알림 개수를 가져와야 함
        const count = 2;
        badge.style.display = count > 0 ? 'block' : 'none';
    }

    // 프로필 메뉴 설정
    setupProfileMenu() {
        const profileButton = this.header.querySelector('.header-profile');
        if (!profileButton) return;

        profileButton.addEventListener('click', () => {
            this.toggleProfileMenu();
        });
    }

    toggleProfileMenu() {
        let profileMenu = document.querySelector('.profile-menu');

        if (!profileMenu) {
            profileMenu = this.createProfileMenu();
        }

        profileMenu.classList.toggle('active');
    }

    createProfileMenu() {
        const menu = document.createElement('div');
        menu.className = 'profile-menu';
        menu.innerHTML = `
            <div class="profile-menu-header">
                <div class="profile-menu-avatar">U</div>
                <div class="profile-menu-info">
                    <div class="profile-menu-name">사용자</div>
                    <div class="profile-menu-email">user@example.com</div>
                </div>
            </div>
            <div class="profile-menu-items">
                <a href="/profile" class="profile-menu-item">
                    <span class="profile-menu-icon">👤</span>
                    프로필
                </a>
                <a href="/settings" class="profile-menu-item">
                    <span class="profile-menu-icon">⚙️</span>
                    설정
                </a>
                <a href="/help" class="profile-menu-item">
                    <span class="profile-menu-icon">❓</span>
                    도움말
                </a>
                <div class="profile-menu-divider"></div>
                <a href="/logout" class="profile-menu-item">
                    <span class="profile-menu-icon">🚪</span>
                    로그아웃
                </a>
            </div>
        `;

        document.body.appendChild(menu);
        return menu;
    }

    // 키보드 네비게이션 설정
    setupKeyboardNavigation() {
        // 검색 단축키 (Ctrl/Cmd + K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (this.searchInput) {
                    this.searchInput.focus();
                }
            }
        });

        // 탭 네비게이션
        const navItems = this.header.querySelectorAll('.nav-link');
        navItems.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const direction = e.key === 'ArrowRight' ? 1 : -1;
                    const nextIndex = (index + direction + navItems.length) % navItems.length;
                    navItems[nextIndex].focus();
                }
            });
        });
    }

    // 헤더 상태 업데이트
    updateHeaderState(state) {
        switch (state) {
            case 'loading':
                this.header.classList.add('loading');
                break;
            case 'loaded':
                this.header.classList.remove('loading');
                break;
            case 'error':
                this.header.classList.add('error');
                break;
        }
    }

    // 사용자 정보 업데이트
    updateUserInfo(userInfo) {
        const profileName = this.header.querySelector('.header-profile-name');
        const profileAvatar = this.header.querySelector('.header-profile-avatar');

        if (profileName) {
            profileName.textContent = userInfo.name;
        }

        if (profileAvatar) {
            profileAvatar.textContent = userInfo.name.charAt(0).toUpperCase();
        }
    }
}

// 헤더 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.headerManager = new HeaderManager();
});

// 전역 헤더 API
window.Header = {
    updateNotificationCount: (count) => {
        if (window.headerManager) {
            window.headerManager.updateNotificationCount(count);
        }
    },

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
            window.headerManager.updateHeaderState('loaded');
        }
    }
};
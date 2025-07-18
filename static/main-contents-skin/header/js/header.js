// Mac OS/iOS 스타일 헤더 JavaScript

// 중복 선언 방지
if (typeof HeaderManager === 'undefined') {
    class HeaderManager {
        constructor() {
            this.header = null;
            this.isScrolled = false;
            this.lastScrollY = 0;
            this.isHidden = false;
            this.searchInput = null;
            this.mobileMenuButton = null;
            this.profileDropdown = null;
            this.scrollTimeout = null;
            this.searchTimeout = null;

            this.init();
        }

        init() {
            this.header = document.querySelector('.site-header');
            if (!this.header) return;

            this.setupScrollBehavior();
            this.setupSearch();
            this.setupMobileMenu();
            this.setupDropdowns();
            this.setupProfileMenu();
            this.setupKeyboardNavigation();
            this.setupThemeHandling();
            this.setupAccessibility();
        }

        // 스크롤 동작 설정 - Apple 스타일
        setupScrollBehavior() {
            let ticking = false;

            const handleScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.updateHeaderOnScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });
            
            // 초기 상태 설정
            this.updateHeaderOnScroll();
        }

        updateHeaderOnScroll() {
            const currentScrollY = window.pageYOffset;
            const scrollThreshold = 10;
            const hideThreshold = 100;

            // 스크롤 상태 업데이트 (글래스모피즘 효과)
            if (currentScrollY > scrollThreshold && !this.isScrolled) {
                this.isScrolled = true;
                this.header.classList.add('scrolled');
            } else if (currentScrollY <= scrollThreshold && this.isScrolled) {
                this.isScrolled = false;
                this.header.classList.remove('scrolled');
            }

            // 모바일에서 헤더 숨김/표시 (Apple Safari 스타일)
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
                // 데스크톱에서는 항상 표시
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

        // 검색 기능 설정 - Apple 스타일
        setupSearch() {
            this.searchInput = this.header.querySelector('#search-input');
            if (!this.searchInput) return;

            const searchForm = this.searchInput.closest('.search-form');
            const searchButton = searchForm.querySelector('.search-btn');

            // 검색 입력 이벤트
            this.searchInput.addEventListener('input', (e) => {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.handleSearchInput(e.target.value);
                }, 300);
            });

            // 검색 포커스 이벤트 (Apple 스타일 애니메이션)
            this.searchInput.addEventListener('focus', () => {
                searchForm.classList.add('focused');
                this.searchInput.parentElement.style.transform = 'scale(1.02)';
            });

            this.searchInput.addEventListener('blur', () => {
                searchForm.classList.remove('focused');
                this.searchInput.parentElement.style.transform = '';
                
                // 검색 결과 숨기기 (딜레이 추가)
                setTimeout(() => {
                    this.hideSearchResults();
                }, 200);
            });

            // 키보드 네비게이션
            this.searchInput.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'Escape':
                        this.searchInput.blur();
                        this.hideSearchResults();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.executeSearch(this.searchInput.value);
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.navigateSearchResults('down');
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.navigateSearchResults('up');
                        break;
                }
            });

            // 검색 버튼 클릭
            if (searchButton) {
                searchButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.executeSearch(this.searchInput.value);
                });
            }
        }

        handleSearchInput(query) {
            if (query.length < 2) {
                this.hideSearchResults();
                return;
            }

            this.showSearchSuggestions(query);
        }

        showSearchSuggestions(query) {
            // 실제 구현에서는 API 호출
            const suggestions = this.getMockSuggestions(query);
            this.renderSearchSuggestions(suggestions);
        }

        getMockSuggestions(query) {
            const mockData = [
                { type: 'game', title: `${query} 게임`, url: `/games?q=${query}` },
                { type: 'post', title: `${query} 관련 게시물`, url: `/board?q=${query}` },
                { type: 'user', title: `${query} 사용자`, url: `/users?q=${query}` }
            ];
            return mockData.slice(0, 5);
        }

        renderSearchSuggestions(suggestions) {
            let resultsContainer = this.header.querySelector('.search-results');
            
            if (!resultsContainer) {
                resultsContainer = this.createSearchResultsContainer();
            }

            if (suggestions.length === 0) {
                resultsContainer.innerHTML = `
                    <div class="search-no-results">
                        <div class="no-results-icon">🔍</div>
                        <div class="no-results-text">검색 결과가 없습니다</div>
                    </div>
                `;
            } else {
                const html = suggestions.map((item, index) => `
                    <div class="search-result-item ${index === 0 ? 'active' : ''}" data-url="${item.url}">
                        <div class="search-result-icon">${this.getResultIcon(item.type)}</div>
                        <div class="search-result-content">
                            <div class="search-result-title">${item.title}</div>
                            <div class="search-result-type">${this.getResultType(item.type)}</div>
                        </div>
                    </div>
                `).join('');
                
                resultsContainer.innerHTML = html;
            }

            this.showSearchResults();
        }

        createSearchResultsContainer() {
            const container = document.createElement('div');
            container.className = 'search-results';
            container.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: var(--background-tertiary);
                border: 1px solid var(--separator-non-opaque);
                border-radius: 12px;
                box-shadow: var(--shadow-heavy);
                max-height: 300px;
                overflow-y: auto;
                z-index: 1001;
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px) scale(0.95);
                transition: all var(--animation-duration) var(--animation-ease);
                margin-top: 8px;
            `;

            // 클릭 이벤트 추가
            container.addEventListener('click', (e) => {
                const item = e.target.closest('.search-result-item');
                if (item) {
                    window.location.href = item.dataset.url;
                }
            });

            this.searchInput.parentElement.appendChild(container);
            return container;
        }

        showSearchResults() {
            const container = this.header.querySelector('.search-results');
            if (container) {
                container.style.opacity = '1';
                container.style.visibility = 'visible';
                container.style.transform = 'translateY(0) scale(1)';
            }
        }

        hideSearchResults() {
            const container = this.header.querySelector('.search-results');
            if (container) {
                container.style.opacity = '0';
                container.style.visibility = 'hidden';
                container.style.transform = 'translateY(-10px) scale(0.95)';
            }
        }

        navigateSearchResults(direction) {
            const container = this.header.querySelector('.search-results');
            if (!container) return;

            const items = container.querySelectorAll('.search-result-item');
            const activeItem = container.querySelector('.search-result-item.active');
            
            if (items.length === 0) return;

            let newIndex = 0;
            if (activeItem) {
                const currentIndex = Array.from(items).indexOf(activeItem);
                newIndex = direction === 'down' 
                    ? (currentIndex + 1) % items.length
                    : (currentIndex - 1 + items.length) % items.length;
            }

            // 활성 상태 업데이트
            items.forEach(item => item.classList.remove('active'));
            items[newIndex].classList.add('active');

            // 스크롤 조정
            items[newIndex].scrollIntoView({ block: 'nearest' });
        }

        getResultIcon(type) {
            const icons = {
                game: '🎮',
                post: '📝',
                user: '👤'
            };
            return icons[type] || '📄';
        }

        getResultType(type) {
            const types = {
                game: '게임',
                post: '게시물',
                user: '사용자'
            };
            return types[type] || '결과';
        }

        executeSearch(query) {
            if (query.trim()) {
                // 검색 실행 애니메이션
                this.searchInput.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.searchInput.style.transform = '';
                    window.location.href = `/search?q=${encodeURIComponent(query)}`;
                }, 100);
            }
        }

        // 모바일 메뉴 설정 - Apple 스타일
        setupMobileMenu() {
            this.mobileMenuButton = this.header.querySelector('.mobile-menu-btn');
            if (!this.mobileMenuButton) return;

            this.mobileMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMobileMenu();
            });

            // 외부 클릭 시 메뉴 닫기
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.mobile-nav') && !e.target.closest('.mobile-menu-btn')) {
                    this.closeMobileMenu();
                }
            });

            // ESC 키로 메뉴 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeMobileMenu();
                }
            });
        }

        toggleMobileMenu() {
            const isExpanded = this.mobileMenuButton.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }

        openMobileMenu() {
            this.mobileMenuButton.setAttribute('aria-expanded', 'true');
            
            const mobileNav = this.header.querySelector('.mobile-nav');
            if (mobileNav) {
                mobileNav.classList.add('show');
                
                // 메뉴 내용 복사 (네비게이션에서)
                this.populateMobileMenu();
            }

            // 바디 스크롤 방지
            document.body.style.overflow = 'hidden';
        }

        closeMobileMenu() {
            this.mobileMenuButton.setAttribute('aria-expanded', 'false');
            
            const mobileNav = this.header.querySelector('.mobile-nav');
            if (mobileNav) {
                mobileNav.classList.remove('show');
            }

            // 바디 스크롤 복원
            document.body.style.overflow = '';
        }

        populateMobileMenu() {
            const mobileNavContent = this.header.querySelector('.mobile-nav-content');
            const mainNav = document.querySelector('.nav-menu');
            
            if (mobileNavContent && mainNav) {
                // 네비게이션 메뉴 복사
                mobileNavContent.innerHTML = mainNav.innerHTML;
                
                // 모바일 전용 스타일 적용
                mobileNavContent.classList.add('mobile-nav-menu');
            }
        }

        // 드롭다운 설정 - Apple 스타일
        setupDropdowns() {
            const dropdownTriggers = this.header.querySelectorAll('[aria-haspopup="true"]');

            dropdownTriggers.forEach(trigger => {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggleDropdown(trigger);
                });

                // 키보드 접근성
                trigger.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleDropdown(trigger);
                    }
                });
            });

            // 외부 클릭 시 드롭다운 닫기
            document.addEventListener('click', () => {
                this.closeAllDropdowns();
            });
        }

        toggleDropdown(trigger) {
            const dropdown = trigger.nextElementSibling;
            if (!dropdown || !dropdown.classList.contains('dropdown-menu')) return;

            const isOpen = dropdown.classList.contains('show');

            // 다른 드롭다운 모두 닫기
            this.closeAllDropdowns();

            if (!isOpen) {
                // 드롭다운 열기
                dropdown.classList.add('show');
                trigger.setAttribute('aria-expanded', 'true');
                
                // 첫 번째 메뉴 항목에 포커스
                const firstItem = dropdown.querySelector('.logout-btn, .dropdown-link');
                if (firstItem) {
                    setTimeout(() => firstItem.focus(), 100);
                }
            }
        }

        closeAllDropdowns() {
            const dropdowns = this.header.querySelectorAll('.dropdown-menu');
            const triggers = this.header.querySelectorAll('[aria-haspopup="true"]');

            dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
            triggers.forEach(trigger => trigger.setAttribute('aria-expanded', 'false'));
        }

        // 프로필 메뉴 설정
        setupProfileMenu() {
            const profileButton = this.header.querySelector('.user-profile');
            if (!profileButton) return;

            profileButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown(profileButton.querySelector('.profile-dropdown-btn'));
            });

            // 프로필 이미지 오류 처리
            const profileImg = profileButton.querySelector('.profile-img');
            if (profileImg) {
                profileImg.addEventListener('error', () => {
                    profileImg.src = '/static/images/default-profile.png';
                });
            }
        }

        // 키보드 네비게이션 설정
        setupKeyboardNavigation() {
            // Cmd/Ctrl + K로 검색 포커스
            document.addEventListener('keydown', (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    if (this.searchInput) {
                        this.searchInput.focus();
                        this.searchInput.select();
                    }
                }
            });

            // 탭 네비게이션 개선
            const focusableElements = this.header.querySelectorAll(
                'a, button, input, [tabindex]:not([tabindex="-1"])'
            );

            focusableElements.forEach((element, index) => {
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Tab') {
                        // 탭 순서 관리는 브라우저에 맡김
                        return;
                    }
                    
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        // 수평 네비게이션 (언어 선택 등)
                        const parent = element.closest('.lang-options, .guest-user');
                        if (parent) {
                            e.preventDefault();
                            const siblings = parent.querySelectorAll('a, button');
                            const currentIndex = Array.from(siblings).indexOf(element);
                            const nextIndex = e.key === 'ArrowRight' 
                                ? (currentIndex + 1) % siblings.length
                                : (currentIndex - 1 + siblings.length) % siblings.length;
                            siblings[nextIndex].focus();
                        }
                    }
                });
            });
        }

        // 테마 처리 설정
        setupThemeHandling() {
            // 시스템 테마 변경 감지
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', () => {
                this.handleThemeChange();
            });

            // 초기 테마 설정
            this.handleThemeChange();
        }

        handleThemeChange() {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            
            // 테마 변경 이벤트 발생
            document.dispatchEvent(new CustomEvent('themechange', { 
                detail: { isDark } 
            }));
        }

        // 접근성 설정
        setupAccessibility() {
            // 고대비 모드 감지
            const contrastQuery = window.matchMedia('(prefers-contrast: high)');
            contrastQuery.addEventListener('change', () => {
                this.handleContrastChange();
            });

            // 애니메이션 감소 모드 감지
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            motionQuery.addEventListener('change', () => {
                this.handleMotionChange();
            });

            // 초기 설정
            this.handleContrastChange();
            this.handleMotionChange();
        }

        handleContrastChange() {
            const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
            this.header.classList.toggle('high-contrast', highContrast);
        }

        handleMotionChange() {
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.header.classList.toggle('reduced-motion', reducedMotion);
        }

        // 헤더 상태 업데이트
        updateHeaderState(state) {
            this.header.classList.remove('loading', 'error', 'success');
            
            if (state) {
                this.header.classList.add(state);
            }
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

        // 알림 개수 업데이트
        updateNotificationCount(count) {
            // 향후 알림 기능 추가 시 사용
            const badge = this.header.querySelector('.notification-badge');
            if (badge) {
                badge.textContent = count > 99 ? '99+' : count.toString();
                badge.style.display = count > 0 ? 'block' : 'none';
            }
        }

        // 정리 메서드
        destroy() {
            // 이벤트 리스너 정리
            clearTimeout(this.scrollTimeout);
            clearTimeout(this.searchTimeout);
            
            // 바디 스타일 복원
            document.body.style.overflow = '';
        }
    }
}

// 헤더 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.headerManager = new HeaderManager();
});

// 전역 헤더 API - Apple 스타일
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
            window.headerManager.updateHeaderState(null);
        }
    },

    showError: () => {
        if (window.headerManager) {
            window.headerManager.updateHeaderState('error');
        }
    },

    showSuccess: () => {
        if (window.headerManager) {
            window.headerManager.updateHeaderState('success');
        }
    },

    focusSearch: () => {
        if (window.headerManager && window.headerManager.searchInput) {
            window.headerManager.searchInput.focus();
        }
    },

    closeAllMenus: () => {
        if (window.headerManager) {
            window.headerManager.closeAllDropdowns();
            window.headerManager.closeMobileMenu();
        }
    }
};
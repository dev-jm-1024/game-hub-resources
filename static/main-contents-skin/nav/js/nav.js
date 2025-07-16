// Apple macOS/iOS 스타일 네비게이션 JavaScript

class NavigationManager {
    constructor() {
        this.nav = null;
        this.activeItem = null;
        this.isCollapsed = false;
        this.searchInput = null;
        this.dropdownItems = new Map();

        this.init();
    }

    init() {
        this.nav = document.querySelector('.global-nav');
        if (!this.nav) return;

        this.setupNavigation();
        this.setupSearch();
        this.setupDropdowns();
        this.setupUserActions();
        this.setupKeyboardNavigation();
        this.setupScrollBehavior();
        this.loadNavState();
    }

    setupNavigation() {
        const navItems = this.nav.querySelectorAll('.nav-link');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleNavClick(e, item);
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleNavClick(e, item);
                }
            });
        });

        // 현재 페이지에 해당하는 네비게이션 항목 활성화
        this.setActiveItem();
    }

    handleNavClick(e, item) {
        const hasDropdown = item.hasAttribute('data-dropdown');

        if (hasDropdown) {
            e.preventDefault();
            this.toggleDropdown(item);
        } else {
            this.setActiveItem(item);
        }
    }

    setActiveItem(item = null) {
        // 기존 활성 항목 제거
        if (this.activeItem) {
            this.activeItem.classList.remove('active');
        }

        if (item) {
            this.activeItem = item;
            item.classList.add('active');
        } else {
            // 현재 URL에 기반하여 활성 항목 찾기
            const currentPath = window.location.pathname;
            const navItems = this.nav.querySelectorAll('.nav-link');

            navItems.forEach(navItem => {
                const href = navItem.getAttribute('href');
                if (href && currentPath.startsWith(href) && href !== '/') {
                    this.activeItem = navItem;
                    navItem.classList.add('active');
                }
            });
        }

        // 활성 항목 변경 이벤트 발생
        if (this.activeItem) {
            this.nav.dispatchEvent(new CustomEvent('navchange', {
                detail: { activeItem: this.activeItem }
            }));
        }
    }

    setupSearch() {
        this.searchInput = this.nav.querySelector('.nav-search-input');
        if (!this.searchInput) return;

        const searchHandler = Utils.debounce((query) => {
            this.filterNavItems(query);
        }, 200);

        this.searchInput.addEventListener('input', (e) => {
            searchHandler(e.target.value);
        });

        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });
    }

    filterNavItems(query) {
        const navItems = this.nav.querySelectorAll('.nav-item');
        const searchTerm = query.toLowerCase().trim();

        if (!searchTerm) {
            this.clearSearch();
            return;
        }

        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const text = link.textContent.toLowerCase();
            const matches = text.includes(searchTerm);

            item.style.display = matches ? '' : 'none';

            if (matches && searchTerm.length > 0) {
                this.highlightSearchTerm(link, searchTerm);
            }
        });
    }

    highlightSearchTerm(element, term) {
        const text = element.textContent;
        const regex = new RegExp(`(${term})`, 'gi');
        const highlightedText = text.replace(regex, '<mark>$1</mark>');

        const textElement = element.querySelector('.nav-text');
        if (textElement) {
            textElement.innerHTML = highlightedText;
        }
    }

    clearSearch() {
        this.searchInput.value = '';
        const navItems = this.nav.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.style.display = '';
            const textElement = item.querySelector('.nav-text');
            if (textElement) {
                textElement.innerHTML = textElement.textContent;
            }
        });
    }

    setupDropdowns() {
        const dropdownTriggers = this.nav.querySelectorAll('[data-dropdown]');

        dropdownTriggers.forEach(trigger => {
            const dropdownId = trigger.getAttribute('data-dropdown');
            const dropdown = this.nav.querySelector(`#${dropdownId}`);

            if (dropdown) {
                this.dropdownItems.set(trigger, dropdown);

                // 드롭다운 항목 클릭 이벤트
                const dropdownLinks = dropdown.querySelectorAll('.nav-dropdown-link');
                dropdownLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        this.setActiveDropdownItem(link);
                    });
                });
            }
        });
    }

    toggleDropdown(trigger) {
        const dropdown = this.dropdownItems.get(trigger);
        if (!dropdown) return;

        const isActive = trigger.classList.contains('active');

        // 다른 드롭다운 모두 닫기
        this.closeAllDropdowns();

        if (!isActive) {
            trigger.classList.add('active');
            dropdown.classList.add('active');

            // 애니메이션을 위한 높이 계산
            const height = dropdown.scrollHeight;
            dropdown.style.maxHeight = height + 'px';
        }
    }

    closeAllDropdowns() {
        this.dropdownItems.forEach((dropdown, trigger) => {
            trigger.classList.remove('active');
            dropdown.classList.remove('active');
            dropdown.style.maxHeight = '0px';
        });
    }

    setActiveDropdownItem(item) {
        // 같은 드롭다운의 다른 항목들에서 active 클래스 제거
        const dropdown = item.closest('.nav-dropdown');
        const siblingItems = dropdown.querySelectorAll('.nav-dropdown-link');

        siblingItems.forEach(sibling => {
            sibling.classList.remove('active');
        });

        item.classList.add('active');
    }

    setupUserActions() {
        const userActions = this.nav.querySelectorAll('.nav-user-action');

        userActions.forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = action.dataset.action;
                this.handleUserAction(actionType, e);
            });
        });
    }

    handleUserAction(actionType, event) {
        switch (actionType) {
            case 'profile':
                this.navigateToProfile();
                break;
            case 'settings':
                this.navigateToSettings();
                break;
            case 'logout':
                this.handleLogout(event);
                break;
            default:
                console.warn('Unknown user action:', actionType);
        }
    }

    navigateToProfile() {
        window.location.href = '/profile';
    }

    navigateToSettings() {
        window.location.href = '/settings';
    }

    handleLogout(event) {
        event.preventDefault();

        if (confirm('정말 로그아웃하시겠습니까?')) {
            // 로그아웃 처리
            this.performLogout();
        }
    }

    async performLogout() {
        try {
            App.loading.show();

            // 로그아웃 API 호출
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': this.getCSRFToken()
                }
            });

            if (response.ok) {
                App.notifications.success('로그아웃되었습니다.');
                window.location.href = '/login';
            } else {
                throw new Error('로그아웃 실패');
            }
        } catch (error) {
            App.notifications.error('로그아웃 중 오류가 발생했습니다.');
            console.error('Logout error:', error);
        } finally {
            App.loading.hide();
        }
    }

    getCSRFToken() {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag ? metaTag.getAttribute('content') : '';
    }

    setupKeyboardNavigation() {
        const navItems = this.nav.querySelectorAll('.nav-link');

        navItems.forEach((item, index) => {
            item.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowDown':
                        e.preventDefault();
                        this.focusNextItem(index, navItems);
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.focusPreviousItem(index, navItems);
                        break;
                    case 'Home':
                        e.preventDefault();
                        navItems[0].focus();
                        break;
                    case 'End':
                        e.preventDefault();
                        navItems[navItems.length - 1].focus();
                        break;
                }
            });
        });
    }

    focusNextItem(currentIndex, items) {
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus();
    }

    focusPreviousItem(currentIndex, items) {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items[prevIndex].focus();
    }

    setupScrollBehavior() {
        let scrollTimeout;

        this.nav.addEventListener('scroll', () => {
            this.nav.classList.add('scrolling');

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.nav.classList.remove('scrolling');
            }, 150);
        });
    }

    // 네비게이션 상태 저장/로드
    saveNavState() {
        const state = {
            activeItem: this.activeItem ? this.activeItem.getAttribute('href') : null,
            isCollapsed: this.isCollapsed,
            openDropdowns: []
        };

        this.dropdownItems.forEach((dropdown, trigger) => {
            if (trigger.classList.contains('active')) {
                state.openDropdowns.push(trigger.getAttribute('data-dropdown'));
            }
        });

        Utils.storage.set('navState', state);
    }

    loadNavState() {
        const state = Utils.storage.get('navState');
        if (!state) return;

        // 드롭다운 상태 복원
        state.openDropdowns.forEach(dropdownId => {
            const trigger = this.nav.querySelector(`[data-dropdown="${dropdownId}"]`);
            if (trigger) {
                this.toggleDropdown(trigger);
            }
        });

        // 축소 상태 복원
        if (state.isCollapsed) {
            this.toggleCollapse();
        }
    }

    // 네비게이션 축소/확장
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.nav.classList.toggle('collapsed', this.isCollapsed);

        // 상태 저장
        this.saveNavState();

        // 이벤트 발생
        this.nav.dispatchEvent(new CustomEvent('navcollapse', {
            detail: { isCollapsed: this.isCollapsed }
        }));
    }

    // 배지 업데이트
    updateBadge(itemHref, count) {
        const navItem = this.nav.querySelector(`[href="${itemHref}"]`);
        if (!navItem) return;

        let badge = navItem.querySelector('.nav-badge');

        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'nav-badge';
                navItem.appendChild(badge);
            }
            badge.textContent = count > 99 ? '99+' : count.toString();
        } else if (badge) {
            badge.remove();
        }
    }

    // 동적 네비게이션 항목 추가
    addNavItem(item) {
        const navList = this.nav.querySelector('.nav-list');
        if (!navList) return;

        const navItem = document.createElement('li');
        navItem.className = 'nav-item';
        navItem.innerHTML = `
            <a href="${item.href}" class="nav-link">
                <div class="nav-icon">${item.icon}</div>
                <span class="nav-text">${item.text}</span>
                ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
            </a>
        `;

        navList.appendChild(navItem);

        // 이벤트 리스너 추가
        const link = navItem.querySelector('.nav-link');
        link.addEventListener('click', (e) => {
            this.handleNavClick(e, link);
        });
    }

    // 네비게이션 항목 제거
    removeNavItem(href) {
        const navItem = this.nav.querySelector(`[href="${href}"]`);
        if (navItem) {
            navItem.closest('.nav-item').remove();
        }
    }

    // 컨텍스트 메뉴 설정
    setupContextMenu() {
        const navItems = this.nav.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.showContextMenu(e, item);
            });
        });
    }

    showContextMenu(event, item) {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'nav-context-menu active';
        contextMenu.innerHTML = `
            <div class="nav-context-item" data-action="favorite">즐겨찾기 추가</div>
            <div class="nav-context-item" data-action="hide">숨기기</div>
            <div class="nav-context-separator"></div>
            <div class="nav-context-item danger" data-action="remove">제거</div>
        `;

        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';

        document.body.appendChild(contextMenu);

        // 컨텍스트 메뉴 항목 클릭 이벤트
        contextMenu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleContextAction(action, item);
            }
            contextMenu.remove();
        });

        // 외부 클릭 시 메뉴 닫기
        setTimeout(() => {
            document.addEventListener('click', () => {
                contextMenu.remove();
            }, { once: true });
        }, 0);
    }

    handleContextAction(action, item) {
        switch (action) {
            case 'favorite':
                this.toggleFavorite(item);
                break;
            case 'hide':
                this.hideNavItem(item);
                break;
            case 'remove':
                this.removeNavItem(item.querySelector('.nav-link').getAttribute('href'));
                break;
        }
    }

    toggleFavorite(item) {
        item.classList.toggle('favorite');
        const isFavorite = item.classList.contains('favorite');

        App.notifications.info(
            isFavorite ? '즐겨찾기에 추가되었습니다.' : '즐겨찾기에서 제거되었습니다.'
        );
    }

    hideNavItem(item) {
        item.style.display = 'none';
        App.notifications.info('항목이 숨겨졌습니다.');
    }
}

// 네비게이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// 전역 네비게이션 API
window.Navigation = {
    setActive: (href) => {
        if (window.navigationManager) {
            const item = document.querySelector(`[href="${href}"]`);
            if (item) {
                window.navigationManager.setActiveItem(item);
            }
        }
    },

    updateBadge: (href, count) => {
        if (window.navigationManager) {
            window.navigationManager.updateBadge(href, count);
        }
    },

    addItem: (item) => {
        if (window.navigationManager) {
            window.navigationManager.addNavItem(item);
        }
    },

    removeItem: (href) => {
        if (window.navigationManager) {
            window.navigationManager.removeNavItem(href);
        }
    },

    toggleCollapse: () => {
        if (window.navigationManager) {
            window.navigationManager.toggleCollapse();
        }
    }
};
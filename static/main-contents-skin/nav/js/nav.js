// Mac OS/iOS 스타일 네비게이션 JavaScript

// 중복 선언 방지
if (typeof NavigationManager === 'undefined') {
    class NavigationManager {
        constructor() {
            this.nav = null;
            this.activeItem = null;
            this.isCollapsed = false;
            this.dropdownItems = new Map();
            this.currentPath = window.location.pathname;
            this.scrollTimeout = null;
            this.resizeTimeout = null;

            this.init();
        }

        init() {
            this.nav = document.querySelector('.nav');
            if (!this.nav) return;

            this.setupNavigation();
            this.setupDropdowns();
            this.setupScrollBehavior();
            this.setupKeyboardNavigation();
            this.setupMobileOptimization();
            this.setupAccessibility();
            this.setActiveItem();
        }

        setupNavigation() {
            const navItems = this.nav.querySelectorAll('.nav-link');

            navItems.forEach(item => {
                // 클릭 이벤트
                item.addEventListener('click', (e) => {
                    this.handleNavClick(e, item);
                });

                // 키보드 이벤트
                item.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleNavClick(e, item);
                    }
                });

                // 호버 효과 강화
                item.addEventListener('mouseenter', () => {
                    this.handleNavHover(item, true);
                });

                item.addEventListener('mouseleave', () => {
                    this.handleNavHover(item, false);
                });
            });
        }

        handleNavClick(e, item) {
            const hasDropdown = item.classList.contains('dropdown-trigger');

            if (hasDropdown) {
                e.preventDefault();
                this.toggleDropdown(item);
            } else {
                // 일반 네비게이션 링크
                this.setActiveItem(item);
                
                // 부드러운 페이지 전환 효과
                if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    this.navigateWithTransition(item.href);
                }
            }
        }

        handleNavHover(item, isEntering) {
            if (isEntering) {
                // 호버 시 미세한 애니메이션
                item.style.transform = 'translateY(-1px)';
                
                // 드롭다운이 있는 경우 미리 준비
                if (item.classList.contains('dropdown-trigger')) {
                    this.preloadDropdown(item);
                }
            } else {
                // 호버 해제 시 원래 위치
                if (!item.classList.contains('active')) {
                    item.style.transform = '';
                }
            }
        }

        navigateWithTransition(url) {
            // 페이지 전환 애니메이션
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '0.95';

            setTimeout(() => {
                window.location.href = url;
            }, 150);
        }

        setActiveItem(item = null) {
            // 기존 활성 항목 제거
            if (this.activeItem) {
                this.activeItem.classList.remove('active');
                this.activeItem.style.transform = '';
            }

            if (item) {
                this.activeItem = item;
                item.classList.add('active');
                this.updateActiveIndicator(item);
            } else {
                // 현재 URL에 기반하여 활성 항목 찾기
                this.findActiveItemByPath();
            }

            // 활성 항목 변경 이벤트 발생
            if (this.activeItem) {
                this.nav.dispatchEvent(new CustomEvent('navchange', {
                    detail: { 
                        activeItem: this.activeItem,
                        path: this.currentPath 
                    }
                }));
            }
        }

        findActiveItemByPath() {
            const navItems = this.nav.querySelectorAll('.nav-link');
            let bestMatch = null;
            let bestMatchLength = 0;

            navItems.forEach(navItem => {
                const href = navItem.getAttribute('href');
                if (href && this.currentPath.startsWith(href) && href.length > bestMatchLength) {
                    bestMatch = navItem;
                    bestMatchLength = href.length;
                }
            });

            if (bestMatch) {
                this.activeItem = bestMatch;
                bestMatch.classList.add('active');
                this.updateActiveIndicator(bestMatch);
            }
        }

        updateActiveIndicator(item) {
            let indicator = this.nav.querySelector('.nav-indicator');
            
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.className = 'nav-indicator';
                this.nav.appendChild(indicator);
            }

            // 인디케이터 위치 계산
            const rect = item.getBoundingClientRect();
            const navRect = this.nav.getBoundingClientRect();
            
            indicator.style.left = (rect.left - navRect.left) + 'px';
            indicator.style.width = rect.width + 'px';
            indicator.classList.add('active');
        }

        setupDropdowns() {
            const dropdownTriggers = this.nav.querySelectorAll('.dropdown-trigger');

            dropdownTriggers.forEach(trigger => {
                const dropdownMenu = trigger.nextElementSibling;
                
                if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
                    this.dropdownItems.set(trigger, dropdownMenu);

                    // 드롭다운 항목 클릭 이벤트
                    const dropdownLinks = dropdownMenu.querySelectorAll('.dropdown-link');
                    dropdownLinks.forEach(link => {
                        link.addEventListener('click', (e) => {
                            this.handleDropdownClick(e, link, trigger);
                        });
                    });
                }
            });

            // 외부 클릭 시 드롭다운 닫기
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.has-dropdown')) {
                    this.closeAllDropdowns();
                }
            });
        }

        toggleDropdown(trigger) {
            const dropdown = this.dropdownItems.get(trigger);
            if (!dropdown) return;

            const isOpen = dropdown.classList.contains('show');

            // 다른 드롭다운 모두 닫기
            this.closeAllDropdowns();

            if (!isOpen) {
                // 드롭다운 열기
                this.openDropdown(trigger, dropdown);
            }
        }

        openDropdown(trigger, dropdown) {
            trigger.setAttribute('aria-expanded', 'true');
            dropdown.classList.add('show');

            // 첫 번째 항목에 포커스
            const firstItem = dropdown.querySelector('.dropdown-link');
            if (firstItem) {
                setTimeout(() => firstItem.focus(), 100);
            }

            // 드롭다운 애니메이션 트리거
            requestAnimationFrame(() => {
                dropdown.style.transform = 'translateX(-50%) translateY(0) scale(1)';
            });
        }

        closeAllDropdowns() {
            this.dropdownItems.forEach((dropdown, trigger) => {
                trigger.setAttribute('aria-expanded', 'false');
                dropdown.classList.remove('show');
                dropdown.style.transform = 'translateX(-50%) translateY(-10px) scale(0.95)';
            });
        }

        preloadDropdown(trigger) {
            const dropdown = this.dropdownItems.get(trigger);
            if (!dropdown) return;

            // 드롭다운 내용 미리 로드 (필요시)
            if (dropdown.dataset.preload === 'true') {
                // API 호출 등으로 내용 로드
                this.loadDropdownContent(dropdown);
            }
        }

        async loadDropdownContent(dropdown) {
            // 실제 구현에서는 API 호출
            try {
                // 예시: 게시판 목록 동적 로드
                const response = await fetch('/api/boards');
                const boards = await response.json();
                
                this.updateDropdownContent(dropdown, boards);
            } catch (error) {
                console.error('Failed to load dropdown content:', error);
            }
        }

        updateDropdownContent(dropdown, items) {
            const existingItems = dropdown.querySelectorAll('.dropdown-item');
            
            // 기존 항목 제거 (빈 상태 제외)
            existingItems.forEach(item => {
                if (!item.classList.contains('empty-state')) {
                    item.remove();
                }
            });

            if (items.length === 0) {
                // 빈 상태 표시
                const emptyState = document.createElement('div');
                emptyState.className = 'dropdown-item empty-state';
                emptyState.innerHTML = '<span class="empty-text">항목이 없습니다</span>';
                dropdown.appendChild(emptyState);
            } else {
                // 새 항목 추가
                items.forEach(item => {
                    const dropdownItem = document.createElement('li');
                    dropdownItem.className = 'dropdown-item';
                    dropdownItem.innerHTML = `
                        <a class="dropdown-link" href="${item.url}">
                            <span class="dropdown-text">${item.name}</span>
                        </a>
                    `;
                    dropdown.appendChild(dropdownItem);
                });
            }
        }

        handleDropdownClick(e, link, trigger) {
            // 드롭다운 항목 클릭 시 처리
            this.setActiveDropdownItem(link);
            this.closeAllDropdowns();
            
            // 부모 네비게이션 항목도 활성화
            this.setActiveItem(trigger);
        }

        setActiveDropdownItem(item) {
            // 같은 드롭다운의 다른 항목들에서 active 클래스 제거
            const dropdown = item.closest('.dropdown-menu');
            const siblingItems = dropdown.querySelectorAll('.dropdown-link');

            siblingItems.forEach(sibling => {
                sibling.classList.remove('active');
            });

            item.classList.add('active');
        }

        setupScrollBehavior() {
            let lastScrollY = window.pageYOffset;

            const handleScroll = () => {
                const currentScrollY = window.pageYOffset;
                const scrollThreshold = 10;

                // 스크롤 상태 업데이트
                if (currentScrollY > scrollThreshold) {
                    this.nav.classList.add('scrolled');
                } else {
                    this.nav.classList.remove('scrolled');
                }

                // 모바일에서 스크롤 방향에 따른 숨김/표시
                if (window.innerWidth <= 768) {
                    const scrollDelta = currentScrollY - lastScrollY;
                    
                    if (scrollDelta > 5 && currentScrollY > 100) {
                        this.hideNav();
                    } else if (scrollDelta < -5) {
                        this.showNav();
                    }
                }

                lastScrollY = currentScrollY;
            };

            window.addEventListener('scroll', this.throttle(handleScroll, 16), { passive: true });
        }

        hideNav() {
            this.nav.classList.add('hide');
            this.nav.classList.remove('show');
        }

        showNav() {
            this.nav.classList.add('show');
            this.nav.classList.remove('hide');
        }

        setupKeyboardNavigation() {
            const navItems = this.nav.querySelectorAll('.nav-link');

            navItems.forEach((item, index) => {
                item.addEventListener('keydown', (e) => {
                    switch (e.key) {
                        case 'ArrowLeft':
                            e.preventDefault();
                            this.focusPreviousItem(index, navItems);
                            break;
                        case 'ArrowRight':
                            e.preventDefault();
                            this.focusNextItem(index, navItems);
                            break;
                        case 'Home':
                            e.preventDefault();
                            navItems[0].focus();
                            break;
                        case 'End':
                            e.preventDefault();
                            navItems[navItems.length - 1].focus();
                            break;
                        case 'Escape':
                            this.closeAllDropdowns();
                            break;
                    }
                });
            });

            // 드롭다운 키보드 네비게이션
            this.setupDropdownKeyboardNavigation();
        }

        setupDropdownKeyboardNavigation() {
            this.dropdownItems.forEach((dropdown, trigger) => {
                const dropdownLinks = dropdown.querySelectorAll('.dropdown-link');
                
                dropdownLinks.forEach((link, index) => {
                    link.addEventListener('keydown', (e) => {
                        switch (e.key) {
                            case 'ArrowUp':
                                e.preventDefault();
                                const prevIndex = (index - 1 + dropdownLinks.length) % dropdownLinks.length;
                                dropdownLinks[prevIndex].focus();
                                break;
                            case 'ArrowDown':
                                e.preventDefault();
                                const nextIndex = (index + 1) % dropdownLinks.length;
                                dropdownLinks[nextIndex].focus();
                                break;
                            case 'Escape':
                                this.closeAllDropdowns();
                                trigger.focus();
                                break;
                            case 'Tab':
                                if (e.shiftKey) {
                                    // Shift+Tab: 이전 항목
                                    if (index === 0) {
                                        this.closeAllDropdowns();
                                        trigger.focus();
                                        e.preventDefault();
                                    }
                                } else {
                                    // Tab: 다음 항목
                                    if (index === dropdownLinks.length - 1) {
                                        this.closeAllDropdowns();
                                    }
                                }
                                break;
                        }
                    });
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

        setupMobileOptimization() {
            // 모바일에서 가로 스크롤 최적화
            const navContainer = this.nav.querySelector('.nav-container');
            if (!navContainer) return;

            let isScrolling = false;
            let scrollTimeout;

            navContainer.addEventListener('scroll', () => {
                isScrolling = true;
                
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    isScrolling = false;
                    this.updateScrollIndicator();
                }, 150);
            });

            // 터치 스와이프 지원
            this.setupTouchNavigation(navContainer);
            
            // 리사이즈 이벤트
            window.addEventListener('resize', this.debounce(() => {
                this.handleResize();
            }, 250));
        }

        setupTouchNavigation(container) {
            let startX = 0;
            let scrollLeft = 0;
            let isDown = false;

            container.addEventListener('touchstart', (e) => {
                isDown = true;
                startX = e.touches[0].pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
            }, { passive: true });

            container.addEventListener('touchmove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.touches[0].pageX - container.offsetLeft;
                const walk = (x - startX) * 2;
                container.scrollLeft = scrollLeft - walk;
            });

            container.addEventListener('touchend', () => {
                isDown = false;
            });
        }

        updateScrollIndicator() {
            const indicator = this.nav.querySelector('.nav-scroll-indicator');
            if (!indicator) return;

            const container = this.nav.querySelector('.nav-container');
            const scrollPercentage = container.scrollLeft / (container.scrollWidth - container.clientWidth);
            
            indicator.style.opacity = scrollPercentage > 0 ? '0.3' : '0';
        }

        handleResize() {
            // 리사이즈 시 드롭다운 위치 재계산
            this.closeAllDropdowns();
            
            // 활성 인디케이터 위치 업데이트
            if (this.activeItem) {
                this.updateActiveIndicator(this.activeItem);
            }
        }

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
            this.nav.classList.toggle('high-contrast', highContrast);
        }

        handleMotionChange() {
            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.nav.classList.toggle('reduced-motion', reducedMotion);
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
            const navMenu = this.nav.querySelector('.nav-menu');
            if (!navMenu) return;

            const navItem = document.createElement('li');
            navItem.className = 'nav-item';
            navItem.innerHTML = `
                <a href="${item.href}" class="nav-link">
                    <span class="nav-text">${item.text}</span>
                    ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
                </a>
            `;

            navMenu.appendChild(navItem);

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

        // 네비게이션 상태 업데이트
        updateNavState(state) {
            this.nav.classList.remove('loading', 'error');
            
            if (state) {
                this.nav.classList.add(state);
            }
        }

        // 유틸리티 함수들
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }

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
        }

        // 정리 메서드
        destroy() {
            clearTimeout(this.scrollTimeout);
            clearTimeout(this.resizeTimeout);
            
            // 이벤트 리스너 정리
            this.dropdownItems.clear();
        }
    }
}

// 네비게이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// 전역 네비게이션 API - Apple 스타일
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

    showLoading: () => {
        if (window.navigationManager) {
            window.navigationManager.updateNavState('loading');
        }
    },

    hideLoading: () => {
        if (window.navigationManager) {
            window.navigationManager.updateNavState(null);
        }
    },

         closeAllDropdowns: () => {
         if (window.navigationManager) {
             window.navigationManager.closeAllDropdowns();
         }
     }
 };
// Mac OS/iOS 스타일 네비게이션 JavaScript

class NavigationManager {
    constructor() {
        this.nav = null;
        this.activeItem = null;
        this.currentPath = window.location.pathname;
        this.dropdownItems = new Map();

        this.init();
    }

    init() {
        this.nav = document.querySelector('.nav');
        if (!this.nav) return;

        this.setupNavigation();
        this.setupDropdowns();
        this.setupScrollBehavior();
        this.setupKeyboardNavigation();
        this.setActiveItem();
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

            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-1px)';
            });

            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('active')) {
                    item.style.transform = '';
                }
            });
        });
    }

    handleNavClick(e, item) {
        const hasDropdown = item.classList.contains('dropdown-trigger');

        if (hasDropdown) {
            e.preventDefault();
            this.toggleDropdown(item);
        } else {
            this.setActiveItem(item);

            if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                this.navigateWithTransition(item.href);
            }
        }
    }

    navigateWithTransition(url) {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '0.95';

        setTimeout(() => {
            window.location.href = url;
        }, 150);
    }

    setActiveItem(item = null) {
        if (this.activeItem) {
            this.activeItem.classList.remove('active');
            this.activeItem.style.transform = '';
        }

        if (item) {
            this.activeItem = item;
            item.classList.add('active');
            this.updateActiveIndicator(item);
        } else {
            this.findActiveItemByPath();
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

                const dropdownLinks = dropdownMenu.querySelectorAll('.dropdown-link');
                dropdownLinks.forEach(link => {
                    link.addEventListener('click', (e) => {
                        this.handleDropdownClick(e, link, trigger);
                    });
                });
            }
        });

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
        this.closeAllDropdowns();

        if (!isOpen) {
            this.openDropdown(trigger, dropdown);
        }
    }

    openDropdown(trigger, dropdown) {
        trigger.setAttribute('aria-expanded', 'true');
        dropdown.classList.add('show');

        const firstItem = dropdown.querySelector('.dropdown-link');
        if (firstItem) {
            setTimeout(() => firstItem.focus(), 100);
        }
    }

    closeAllDropdowns() {
        this.dropdownItems.forEach((dropdown, trigger) => {
            trigger.setAttribute('aria-expanded', 'false');
            dropdown.classList.remove('show');
        });
    }

    handleDropdownClick(e, link, trigger) {
        this.setActiveDropdownItem(link);
        this.closeAllDropdowns();
        this.setActiveItem(trigger);
    }

    setActiveDropdownItem(item) {
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

            if (currentScrollY > scrollThreshold) {
                this.nav.classList.add('scrolled');
            } else {
                this.nav.classList.remove('scrolled');
            }

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
    }

    focusNextItem(currentIndex, items) {
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus();
    }

    focusPreviousItem(currentIndex, items) {
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        items[prevIndex].focus();
    }

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

    updateNavState(state) {
        this.nav.classList.remove('loading', 'error');
        if (state) {
            this.nav.classList.add(state);
        }
    }

    destroy() {
        this.dropdownItems.clear();
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
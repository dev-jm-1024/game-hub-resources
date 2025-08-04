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

        if (!dropdownMenu || !dropdownBtn) return;

        dropdownMenu.classList.add('show');
        dropdownBtn.setAttribute('aria-expanded', 'true');

        console.log('드롭다운 열림');

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

        dropdownMenu.classList.remove('show');
        dropdownBtn.setAttribute('aria-expanded', 'false');
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
        clearTimeout(this.scrollTimeout);
        clearTimeout(this.searchTimeout);
        document.body.style.overflow = '';
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
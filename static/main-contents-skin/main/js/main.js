/**
 * Apple macOS/iOS 스타일 메인 콘텐츠 JavaScript - PC 최적화
 * 게임 허브 메인 페이지 인터랙션 및 애니메이션 처리
 */

class MainContentController {
    constructor() {
        this.isInitialized = false;
        this.observers = new Map();
        this.animations = new Map();
        this.performanceMetrics = {
            loadTime: 0,
            interactionCount: 0,
            errorCount: 0
        };

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        const startTime = performance.now();

        try {
            this.setupEventListeners();
            this.initializeAnimations();
            this.setupIntersectionObservers();
            this.initializeHeroSection();
            this.initializeGameCards();
            this.initializeCommunitySection();
            this.initializeWidgets();
            this.initializeKeyboardNavigation();

            this.performanceMetrics.loadTime = performance.now() - startTime;
            this.isInitialized = true;

            console.log(`메인 콘텐츠 초기화 완료: ${this.performanceMetrics.loadTime.toFixed(2)}ms`);
        } catch (error) {
            console.error('메인 콘텐츠 초기화 실패:', error);
            this.performanceMetrics.errorCount++;
        }
    }

    setupEventListeners() {
        // 리사이즈 이벤트 (디바운스 적용)
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));

        // 스크롤 이벤트 (스로틀 적용)
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16));

        // 포커스 이벤트
        document.addEventListener('focusin', (e) => {
            this.handleFocusIn(e);
        });

        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
    }

    initializeAnimations() {
        // CSS 애니메이션 지원 확인
        if (!this.supportsAnimations()) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
            return;
        }

        // 스태거 애니메이션 설정
        this.setupStaggeredAnimations();

        // 패럴랙스 효과 초기화
        this.initializeParallax();
    }

    setupIntersectionObservers() {
        // 메인 콘텐츠 요소들의 가시성 감지
        const observerOptions = {
            root: null,
            rootMargin: '50px',
            threshold: [0.1, 0.5, 0.9]
        };

        const mainObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElementIn(entry.target);
                }
            });
        }, observerOptions);

        // 관찰할 요소들 등록
        const elementsToObserve = [
            '.hero-section',
            '.featured-games-section',
            '.community-section',
            '.widget',
            '.game-card',
            '.post-item',
            '.stat-card'
        ];

        elementsToObserve.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                mainObserver.observe(element);
            });
        });

        this.observers.set('main', mainObserver);
    }

    initializeHeroSection() {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        // 히어로 통계 카운터 애니메이션
        this.initializeStatCounters();

        // 히어로 버튼 인터랙션
        this.initializeHeroButtons();

        // 배경 장식 애니메이션
        this.initializeHeroDecorations();
    }

    initializeStatCounters() {
        const statItems = document.querySelectorAll('.stat-item');

        statItems.forEach(item => {
            const numberElement = item.querySelector('.stat-number');
            if (!numberElement) return;

            const targetText = numberElement.textContent;
            const targetNumber = parseInt(targetText.replace(/[^\d]/g, ''));

            if (isNaN(targetNumber)) return;

            // 카운터 애니메이션 설정
            item.addEventListener('mouseenter', () => {
                this.animateCounter(numberElement, targetNumber, targetText);
            });
        });
    }

    animateCounter(element, targetNumber, originalText) {
        if (element.dataset.animated === 'true') return;

        element.dataset.animated = 'true';
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 이징 함수 적용
            const easeProgress = this.easeOutCubic(progress);
            const currentNumber = Math.floor(targetNumber * easeProgress);

            // 숫자 포맷팅
            const formattedNumber = this.formatNumber(currentNumber);
            const suffix = originalText.replace(/[\d,]/g, '');
            element.textContent = formattedNumber + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = originalText;
                setTimeout(() => {
                    element.dataset.animated = 'false';
                }, 2000);
            }
        };

        requestAnimationFrame(animate);
    }

    initializeHeroButtons() {
        const heroButtons = document.querySelectorAll('.hero-actions .btn-primary, .hero-actions .btn-secondary');

        heroButtons.forEach(button => {
            // 마우스 인터랙션
            button.addEventListener('mouseenter', () => {
                this.createRippleEffect(button);
            });

            // 클릭 피드백
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e);
                this.trackInteraction('hero_button_click', {
                    button: button.textContent.trim(),
                    href: button.getAttribute('href')
                });
            });

            // 키보드 접근성
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleButtonClick(e);
                }
            });
        });
    }

    initializeHeroDecorations() {
        const decorationOrbs = document.querySelectorAll('.decoration-orb');

        decorationOrbs.forEach((orb, index) => {
            // 마우스 추적 효과
            document.addEventListener('mousemove', this.throttle((e) => {
                const rect = orb.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const deltaX = (e.clientX - centerX) * 0.1;
                const deltaY = (e.clientY - centerY) * 0.1;

                orb.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            }, 16));
        });
    }

    initializeGameCards() {
        const gameCards = document.querySelectorAll('.game-card');

        gameCards.forEach(card => {
            // 3D 틸트 효과
            this.add3DTiltEffect(card);

            // 이미지 로딩 처리
            this.handleImageLoading(card);

            // 클릭 인터랙션
            card.addEventListener('click', (e) => {
                this.handleGameCardClick(e, card);
            });

            // 키보드 네비게이션
            const link = card.querySelector('.game-title a');
            if (link) {
                link.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.createClickAnimation(card);
                    }
                });
            }
        });
    }

    add3DTiltEffect(element) {
        element.addEventListener('mouseenter', () => {
            element.style.transformStyle = 'preserve-3d';
        });

        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = (e.clientX - centerX) / rect.width;
            const deltaY = (e.clientY - centerY) / rect.height;

            const rotateX = deltaY * -10;
            const rotateY = deltaX * 10;

            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    }

    handleImageLoading(card) {
        const img = card.querySelector('.game-image');
        if (!img || img.tagName !== 'IMG') return;

        // 로딩 스켈레톤 표시
        const thumbnail = card.querySelector('.game-thumbnail');
        thumbnail.classList.add('loading');

        img.addEventListener('load', () => {
            thumbnail.classList.remove('loading');
            thumbnail.classList.add('loaded');

            // 이미지 페이드 인 애니메이션
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';

            requestAnimationFrame(() => {
                img.style.opacity = '1';
            });
        });

        img.addEventListener('error', () => {
            thumbnail.classList.remove('loading');
            thumbnail.classList.add('error');

            // 에러 시 플레이스홀더 표시
            const placeholder = document.createElement('div');
            placeholder.className = 'placeholder-image';
            placeholder.textContent = '🎮';
            thumbnail.appendChild(placeholder);
        });
    }

    initializeCommunitySection() {
        const communitySection = document.querySelector('.community-section');
        if (!communitySection) return;

        // 통계 카드 애니메이션
        this.initializeStatCards();

        // 포스트 아이템 인터랙션
        this.initializePostItems();

        // 실시간 업데이트 시뮬레이션
        this.simulateRealTimeUpdates();
    }

    initializeStatCards() {
        const statCards = document.querySelectorAll('.stat-card');

        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.animateStatCard(card);
            });

            // 클릭 시 관련 페이지로 이동
            card.addEventListener('click', () => {
                this.handleStatCardClick(card);
            });
        });
    }

    animateStatCard(card) {
        const number = card.querySelector('.stat-number');
        if (!number) return;

        // 숫자 증가 애니메이션
        const originalValue = parseInt(number.textContent.replace(/[^\d]/g, ''));
        const increment = Math.floor(originalValue * 0.1);

        number.textContent = (originalValue + increment).toLocaleString();

        setTimeout(() => {
            number.textContent = originalValue.toLocaleString();
        }, 1000);
    }

    initializePostItems() {
        const postItems = document.querySelectorAll('.post-item');

        postItems.forEach(item => {
            // 호버 효과
            item.addEventListener('mouseenter', () => {
                this.highlightPostItem(item);
            });

            item.addEventListener('mouseleave', () => {
                this.unhighlightPostItem(item);
            });

            // 클릭 인터랙션
            const link = item.querySelector('.post-title a');
            if (link) {
                link.addEventListener('click', (e) => {
                    this.handlePostClick(e, item);
                });
            }
        });
    }

    highlightPostItem(item) {
        // 관련 포스트 미리보기 확장
        const preview = item.querySelector('.post-preview');
        if (preview) {
            preview.style.webkitLineClamp = '3';
        }

        // 메타 정보 강조
        const meta = item.querySelector('.post-meta');
        if (meta) {
            meta.style.opacity = '1';
        }
    }

    unhighlightPostItem(item) {
        const preview = item.querySelector('.post-preview');
        if (preview) {
            preview.style.webkitLineClamp = '2';
        }

        const meta = item.querySelector('.post-meta');
        if (meta) {
            meta.style.opacity = '0.7';
        }
    }

    initializeWidgets() {
        // 신규 게임 위젯
        this.initializeNewGamesWidget();

        // 카테고리 위젯
        this.initializeCategoryWidget();

        // 랭킹 위젯
        this.initializeRankingWidget();
    }

    initializeNewGamesWidget() {
        const newGameItems = document.querySelectorAll('.new-game-item');

        newGameItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.animateNewGameItem(item);
            });

            const link = item.querySelector('.new-game-title a');
            if (link) {
                link.addEventListener('click', (e) => {
                    this.trackInteraction('new_game_click', {
                        game: link.textContent.trim()
                    });
                });
            }
        });
    }

    animateNewGameItem(item) {
        const badge = item.querySelector('.new-badge');
        if (badge) {
            badge.style.animation = 'none';
            badge.offsetHeight; // 리플로우 강제 실행
            badge.style.animation = 'pulse 0.5s ease-in-out';
        }
    }

    initializeCategoryWidget() {
        const categoryItems = document.querySelectorAll('.category-item');

        categoryItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.animateCategoryItem(item);
            });

            item.addEventListener('click', (e) => {
                this.handleCategoryClick(e, item);
            });
        });
    }

    animateCategoryItem(item) {
        const icon = item.querySelector('.category-icon');
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
            setTimeout(() => {
                icon.style.transform = 'scale(1) rotate(0deg)';
            }, 200);
        }
    }

    initializeRankingWidget() {
        const rankingItems = document.querySelectorAll('.ranking-item');

        rankingItems.forEach((item, index) => {
            // 순차적 애니메이션
            item.style.animationDelay = `${index * 0.1}s`;

            item.addEventListener('mouseenter', () => {
                this.animateRankingItem(item);
            });
        });
    }

    animateRankingItem(item) {
        const medal = item.querySelector('.rank-medal');
        if (medal) {
            medal.style.animation = 'bounce 0.6s ease-in-out';
            setTimeout(() => {
                medal.style.animation = '';
            }, 600);
        }
    }

    initializeKeyboardNavigation() {
        // 탭 네비게이션 개선
        const focusableElements = document.querySelectorAll(`
            .hero-actions a,
            .game-title a,
            .post-title a,
            .new-game-title a,
            .category-item,
            .section-link
        `);

        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                this.handleElementFocus(element);
            });

            element.addEventListener('blur', () => {
                this.handleElementBlur(element);
            });
        });
    }

    handleElementFocus(element) {
        // 포커스 시 부모 요소 강조
        const parent = element.closest('.game-card, .post-item, .widget');
        if (parent) {
            parent.classList.add('focused');
        }

        // 스크롤 위치 조정
        this.ensureElementVisible(element);
    }

    handleElementBlur(element) {
        const parent = element.closest('.game-card, .post-item, .widget');
        if (parent) {
            parent.classList.remove('focused');
        }
    }

    ensureElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isVisible) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    // 이벤트 핸들러들
    handleResize() {
        // 레이아웃 재계산
        this.updateLayoutMetrics();

        // 애니메이션 재설정
        this.resetAnimations();
    }

    handleScroll() {
        const scrollY = window.scrollY;

        // 패럴랙스 효과 업데이트
        this.updateParallaxEffect(scrollY);

        // 히어로 섹션 스케일 효과
        this.updateHeroScale(scrollY);
    }

    updateParallaxEffect(scrollY) {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const decorationGrid = heroSection.querySelector('.decoration-grid');
        if (decorationGrid) {
            const translateY = scrollY * 0.5;
            decorationGrid.style.transform = `translateY(${translateY}px)`;
        }
    }

    updateHeroScale(scrollY) {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;

        const scale = Math.max(0.8, 1 - scrollY * 0.0005);
        const opacity = Math.max(0.3, 1 - scrollY * 0.001);

        heroSection.style.transform = `scale(${scale})`;
        heroSection.style.opacity = opacity;
    }

    handleFocusIn(e) {
        // 포커스 링 스타일 개선
        if (e.target.matches('a, button, input, textarea, select')) {
            e.target.classList.add('focus-visible');
        }
    }

    handleKeyDown(e) {
        // 키보드 단축키 처리
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    this.focusSearchInput();
                    break;
                case 'g':
                    e.preventDefault();
                    this.navigateToGames();
                    break;
                case 'b':
                    e.preventDefault();
                    this.navigateToBoard();
                    break;
            }
        }
    }

    handleButtonClick(e) {
        const button = e.target.closest('a, button');
        if (!button) return;

        // 클릭 애니메이션
        this.createClickAnimation(button);

        // 햅틱 피드백 시뮬레이션
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    handleGameCardClick(e, card) {
        const link = card.querySelector('.game-title a');
        if (!link) return;

        // 카드 클릭 시 링크로 이동
        if (!e.target.closest('a')) {
            link.click();
        }

        this.trackInteraction('game_card_click', {
            game: link.textContent.trim()
        });
    }

    handlePostClick(e, item) {
        this.createClickAnimation(item);

        this.trackInteraction('post_click', {
            post: e.target.textContent.trim()
        });
    }

    handleStatCardClick(card) {
        const icon = card.querySelector('.stat-icon');
        const label = card.querySelector('.stat-label');

        if (label) {
            const labelText = label.textContent.trim();
            let targetUrl = '/';

            switch (labelText) {
                case '오늘의 게시글':
                    targetUrl = '/board?date=today';
                    break;
                case '온라인 유저':
                    targetUrl = '/users/online';
                    break;
                case '인기 토론':
                    targetUrl = '/board?sort=popular';
                    break;
            }

            window.location.href = targetUrl;
        }
    }

    handleCategoryClick(e, item) {
        e.preventDefault();

        this.createClickAnimation(item);

        setTimeout(() => {
            window.location.href = item.getAttribute('href');
        }, 150);
    }

    // 유틸리티 메서드들
    createRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';

        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    createClickAnimation(element) {
        element.style.transform = 'scale(0.95)';
        element.style.transition = 'transform 0.1s ease';

        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 100);
    }

    animateElementIn(element) {
        if (element.classList.contains('animated')) return;

        element.classList.add('animated');
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';

        requestAnimationFrame(() => {
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    setupStaggeredAnimations() {
        const groups = [
            '.games-grid .game-card',
            '.posts-list .post-item',
            '.community-stats .stat-card',
            '.ranking-list .ranking-item'
        ];

        groups.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                element.style.animationDelay = `${index * 0.1}s`;
            });
        });
    }

    initializeParallax() {
        if (!this.supportsAnimations()) return;

        const parallaxElements = document.querySelectorAll('.decoration-orb');

        parallaxElements.forEach(element => {
            element.style.willChange = 'transform';
        });
    }

    simulateRealTimeUpdates() {
        // 실시간 업데이트 시뮬레이션 (실제 구현 시 WebSocket 사용)
        setInterval(() => {
            this.updateRandomStats();
        }, 30000); // 30초마다 업데이트
    }

    updateRandomStats() {
        const statNumbers = document.querySelectorAll('.stat-number');

        statNumbers.forEach(number => {
            const currentValue = parseInt(number.textContent.replace(/[^\d]/g, ''));
            const change = Math.floor(Math.random() * 10) - 5; // -5 ~ +5
            const newValue = Math.max(0, currentValue + change);

            if (change !== 0) {
                number.textContent = newValue.toLocaleString();
                number.style.color = change > 0 ? 'var(--system-green)' : 'var(--system-red)';

                setTimeout(() => {
                    number.style.color = '';
                }, 1000);
            }
        });
    }

    // 유틸리티 메서드들
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

    supportsAnimations() {
        return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    updateLayoutMetrics() {
        // 레이아웃 메트릭 업데이트
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        // 모바일 레이아웃 조정
        if (viewport.width <= 768) {
            document.documentElement.classList.add('mobile-layout');
        } else {
            document.documentElement.classList.remove('mobile-layout');
        }
    }

    resetAnimations() {
        // 애니메이션 재설정
        this.animations.forEach(animation => {
            if (animation.cancel) {
                animation.cancel();
            }
        });
        this.animations.clear();
    }

    trackInteraction(eventName, data = {}) {
        // 사용자 인터랙션 추적
        this.performanceMetrics.interactionCount++;

        // 실제 구현 시 분석 도구로 전송
        console.log(`인터랙션 추적: ${eventName}`, data);
    }

    focusSearchInput() {
        // 헤더의 검색 입력 필드에 포커스
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    navigateToGames() {
        window.location.href = '/games';
    }

    navigateToBoard() {
        window.location.href = '/board';
    }

    // 정리 메서드
    destroy() {
        // 이벤트 리스너 제거
        this.observers.forEach(observer => {
            observer.disconnect();
        });

        // 애니메이션 정리
        this.resetAnimations();

        // 메모리 정리
        this.observers.clear();
        this.animations.clear();

        console.log('메인 콘텐츠 컨트롤러 정리 완료');
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.mainContentController = new MainContentController();
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (window.mainContentController) {
        window.mainContentController.destroy();
    }
});

// CSS 스타일 추가 (JavaScript로 동적 생성)
const additionalStyles = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .loading .game-image {
        opacity: 0.3;
        animation: pulse 1.5s ease-in-out infinite;
    }
    
    .focused {
        outline: 2px solid var(--system-blue);
        outline-offset: 2px;
        border-radius: var(--border-radius-medium);
    }
    
    .mobile-layout .hero-stats {
        flex-direction: column;
    }
    
    .mobile-layout .content-grid {
        flex-direction: column;
    }
    
    @keyframes bounce {
        0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
        }
        40%, 43% {
            transform: translate3d(0, -30px, 0);
        }
        70% {
            transform: translate3d(0, -15px, 0);
        }
        90% {
            transform: translate3d(0, -4px, 0);
        }
    }
`;

// 스타일 시트 추가
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
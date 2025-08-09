// Apple macOS/iOS & Samsung OneUI 스타일 게시판 홈 JavaScript

// 네임스페이스 정의
window.BoardSkin = window.BoardSkin || {};
window.BoardSkin.MainBoard = {

    // 설정
    config: {
        animationDuration: 300,
        staggerDelay: 100,
        scrollThreshold: 50,
        autoRefreshInterval: 30000 // 30초
    },

    // 상태
    state: {
        isLoading: false,
        lastRefresh: Date.now(),
        intersectionObserver: null,
        scrollPosition: 0,
        isInitialized: false,
        rafId: null,
        lastRafTime: 0
    },

    // 메모리 관리
    memory: {
        timers: new Set(),
        eventListeners: new Map(),
        observers: new Set(),
        boundMethods: new Map(),
        vueInstances: new Set()
    },

    // 초기화
    init() {
        if (this.state.isInitialized) return;

        console.log('BoardSkin.MainBoard 초기화 시작');

        // 메서드 바인딩 캐시
        this.bindMethods();

        this.setupIntersectionObserver();
        this.setupScrollEffects();
        this.setupPerformanceOptimizations();
        this.setupAccessibility();
        this.setupAutoRefresh();
        this.setupErrorHandling();

        this.state.isInitialized = true;
        console.log('BoardSkin.MainBoard 초기화 완료');
    },

    // 메서드 바인딩 캐시
    bindMethods() {
        const methodsToCache = [
            'handleScroll',
            'handleResize',
            'handleVisibilityChange',
            'animateElementEntry',
            'updateScrollEffects'
        ];

        methodsToCache.forEach(methodName => {
            if (this[methodName]) {
                this.memory.boundMethods.set(methodName, this[methodName].bind(this));
            }
        });
    },

    // 최적화된 이벤트 리스너 추가
    addEventListener(element, event, handler, options = {}) {
        const key = `${element.constructor.name}-${event}`;

        if (!this.memory.eventListeners.has(key)) {
            this.memory.eventListeners.set(key, []);
        }

        const boundHandler = typeof handler === 'string'
            ? this.memory.boundMethods.get(handler) || this[handler].bind(this)
            : handler.bind(this);

        element.addEventListener(event, boundHandler, options);
        this.memory.eventListeners.get(key).push({ element, event, handler: boundHandler, options });
    },

    // 최적화된 타이머 관리
    setTimeout(callback, delay) {
        const timer = setTimeout(() => {
            this.memory.timers.delete(timer);
            callback();
        }, delay);

        this.memory.timers.add(timer);
        return timer;
    },

    setInterval(callback, delay) {
        const timer = setInterval(callback, delay);
        this.memory.timers.add(timer);
        return timer;
    },

    // Intersection Observer 설정
    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const options = {
            root: null,
            rootMargin: '50px',
            threshold: [0.1, 0.5, 0.9]
        };

        this.state.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElementEntry(entry.target);
                }
            });
        }, options);

        // 관찰할 요소들 등록
        document.querySelectorAll('.board-card, .stats-card, .post-item').forEach(element => {
            this.state.intersectionObserver.observe(element);
        });
    },

    // 요소 진입 애니메이션
    animateElementEntry(element) {
        if (element.classList.contains('animated')) return;

        element.classList.add('animated');

        // GSAP 애니메이션이 있으면 사용, 없으면 CSS 애니메이션 사용
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(element, {
                y: 30,
                opacity: 0,
                scale: 0.95
            }, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.6,
                ease: "power2.out"
            });
        } else {
            element.style.animation = 'slideInUp 0.6s ease-out forwards';
        }
    },

    // 스크롤 효과 설정 (최적화)
    setupScrollEffects() {
        this.handleScroll = () => {
            if (this.state.rafId) return;

            this.state.rafId = requestAnimationFrame((currentTime) => {
                // 16ms 간격으로 제한 (60fps)
                if (currentTime - this.state.lastRafTime >= 16) {
                    this.updateScrollEffects();
                    this.state.lastRafTime = currentTime;
                }
                this.state.rafId = null;
            });
        };

        this.addEventListener(window, 'scroll', this.handleScroll, { passive: true });
    },

    // 스크롤 효과 업데이트
    updateScrollEffects() {
        const scrollY = window.pageYOffset;
        const scrollDelta = scrollY - this.state.scrollPosition;
        this.state.scrollPosition = scrollY;

        // 패럴랙스 효과
        this.updateParallaxEffect(scrollY);

        // 플로팅 버튼 숨김/표시
        this.updateFloatingButton(scrollDelta);
    },

    // 패럴랙스 효과
    updateParallaxEffect(scrollY) {
        const decorations = document.querySelectorAll('.absolute');
        decorations.forEach((decoration, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrollY * speed);
            decoration.style.transform = `translateY(${yPos}px)`;
        });
    },

    // 플로팅 버튼 상태 업데이트
    updateFloatingButton(scrollDelta) {
        const floatingBtn = document.querySelector('.floating-action-btn');
        if (!floatingBtn) return;

        if (scrollDelta > this.config.scrollThreshold) {
            floatingBtn.style.transform = 'translateY(100px) scale(0.8)';
            floatingBtn.style.opacity = '0.7';
        } else if (scrollDelta < -this.config.scrollThreshold) {
            floatingBtn.style.transform = 'translateY(0) scale(1)';
            floatingBtn.style.opacity = '1';
        }
    },

    // 성능 최적화 설정
    setupPerformanceOptimizations() {
        // 이미지 지연 로딩
        this.setupLazyLoading();

        // 메모리 관리
        this.setupMemoryManagement();

        // 디바운스된 리사이즈 핸들러
        this.setupResizeHandler();
    },

    // 이미지 지연 로딩
    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    },

    // 메모리 관리
    setupMemoryManagement() {
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // 주기적 메모리 정리
        setInterval(() => {
            this.performMemoryCleanup();
        }, 60000); // 1분마다
    },

    // 리사이즈 핸들러
    setupResizeHandler() {
        let resizeTimeout;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    },

    // 리사이즈 처리
    handleResize() {
        // 모바일/데스크톱 전환 시 레이아웃 재계산
        const isMobile = window.innerWidth <= 768;
        document.body.classList.toggle('mobile-layout', isMobile);

        // 애니메이션 재설정
        this.resetAnimations();
    },

    // 접근성 설정
    setupAccessibility() {
        // 키보드 네비게이션
        this.setupKeyboardNavigation();

        // 스크린 리더 지원
        this.setupScreenReaderSupport();

        // 고대비 모드 감지
        this.setupHighContrastMode();
    },

    // 키보드 네비게이션
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Tab':
                    this.handleTabNavigation(e);
                    break;
                case 'Enter':
                case ' ':
                    this.handleActivation(e);
                    break;
                case 'Escape':
                    this.handleEscape(e);
                    break;
            }
        });
    },

    // 탭 네비게이션 처리
    handleTabNavigation(e) {
        const focusableElements = document.querySelectorAll(`
            .post-item,
            .board-option,
            button,
            a[href],
            input,
            select,
            textarea,
            [tabindex]:not([tabindex="-1"])
        `);

        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);

        if (e.shiftKey) {
            // Shift + Tab (이전 요소)
            if (currentIndex > 0) {
                e.preventDefault();
                focusableElements[currentIndex - 1].focus();
            }
        } else {
            // Tab (다음 요소)
            if (currentIndex < focusableElements.length - 1) {
                e.preventDefault();
                focusableElements[currentIndex + 1].focus();
            }
        }
    },

    // 활성화 처리 (Enter/Space)
    handleActivation(e) {
        const target = e.target;

        if (target.classList.contains('post-item')) {
            e.preventDefault();
            target.click();
        } else if (target.classList.contains('board-option')) {
            e.preventDefault();
            target.click();
        }
    },

    // ESC 키 처리
    handleEscape(e) {
        // 모달 닫기
        const modal = document.querySelector('[v-if="showWriteModal"]');
        if (modal && modal.style.display !== 'none') {
            // Vue 인스턴스에 이벤트 전달
            if (window.vueApp) {
                window.vueApp.showWriteModal = false;
            }
        }
    },

    // 스크린 리더 지원
    setupScreenReaderSupport() {
        // 동적 콘텐츠에 aria-live 속성 추가
        const dynamicElements = document.querySelectorAll('.stats-card');
        dynamicElements.forEach(element => {
            element.setAttribute('aria-live', 'polite');
        });
    },

    // 고대비 모드 감지
    setupHighContrastMode() {
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');

        const handleHighContrast = (e) => {
            document.body.classList.toggle('high-contrast', e.matches);
        };

        highContrastQuery.addEventListener('change', handleHighContrast);
        handleHighContrast(highContrastQuery);
    },

    // 자동 새로고침 설정 (최적화)
    setupAutoRefresh() {
        // 페이지가 보일 때만 새로고침
        this.autoRefreshTimer = this.setInterval(() => {
            if (document.visibilityState === 'visible' && !this.state.isLoading) {
                this.refreshStats();
            }
        }, this.config.autoRefreshInterval);

        // 페이지 가시성 변경 감지
        this.addEventListener(document, 'visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                // 페이지가 숨겨지면 모든 애니메이션 일시정지
                this.pauseAnimations();
            } else {
                // 페이지가 다시 보이면 애니메이션 재개
                this.resumeAnimations();
            }
        });
    },

    // 애니메이션 일시정지
    pauseAnimations() {
        if (typeof gsap !== 'undefined') {
            gsap.globalTimeline.pause();
        }

        // CSS 애니메이션 일시정지
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    },

    // 애니메이션 재개
    resumeAnimations() {
        if (typeof gsap !== 'undefined') {
            gsap.globalTimeline.resume();
        }

        // CSS 애니메이션 재개
        document.querySelectorAll('*').forEach(el => {
            el.style.animationPlayState = 'running';
        });
    },

    // 통계 새로고침 (비활성화 - API 엔드포인트가 없음)
    async refreshStats() {
        // API 엔드포인트가 구현되기 전까지 비활성화
        console.log('통계 새로고침 기능은 현재 비활성화되어 있습니다.');
        return;

        /* 추후 API 구현 시 활성화
        if (this.state.isLoading) return;

        this.state.isLoading = true;

        try {
            const response = await fetch('/api/v1/board/stats');
            if (response.ok) {
                const stats = await response.json();
                this.updateStatsDisplay(stats);
            }
        } catch (error) {
            console.error('통계 새로고침 실패:', error);
        } finally {
            this.state.isLoading = false;
            this.state.lastRefresh = Date.now();
        }
        */
    },

    // 통계 표시 업데이트
    updateStatsDisplay(stats) {
        const statsElements = {
            totalPosts: document.querySelector('[data-stat="totalPosts"]'),
            totalBoards: document.querySelector('[data-stat="totalBoards"]'),
            todayPosts: document.querySelector('[data-stat="todayPosts"]')
        };

        Object.keys(statsElements).forEach(key => {
            const element = statsElements[key];
            if (element && stats[key] !== undefined) {
                this.animateNumberChange(element, stats[key]);
            }
        });
    },

    // 숫자 변경 애니메이션
    animateNumberChange(element, newValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeProgress = this.easeOutCubic(progress);
            const currentNumber = Math.round(currentValue + (newValue - currentValue) * easeProgress);

            element.textContent = currentNumber.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    },

    // 이징 함수
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    },

    // 에러 처리 설정
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript 오류:', e.error);
            this.showErrorNotification('페이지 로딩 중 오류가 발생했습니다.');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promise 거부:', e.reason);
            this.showErrorNotification('데이터 로딩 중 오류가 발생했습니다.');
        });
    },

    // 에러 알림 표시
    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="glass rounded-xl p-4 mb-4 border border-red-500/20 bg-red-500/10">
                <div class="flex items-center">
                    <i class="bi bi-exclamation-triangle text-red-400 mr-3"></i>
                    <span class="text-white">${message}</span>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    },

    // 애니메이션 재설정
    resetAnimations() {
        document.querySelectorAll('.animated').forEach(element => {
            element.classList.remove('animated');
            if (this.state.intersectionObserver) {
                this.state.intersectionObserver.observe(element);
            }
        });
    },

    // 메모리 정리
    performMemoryCleanup() {
        // 사용하지 않는 이벤트 리스너 정리
        const unusedElements = document.querySelectorAll('.removed, .hidden');
        unusedElements.forEach(element => {
            element.remove();
        });
    },

    // 정리
    cleanup() {
        if (this.state.intersectionObserver) {
            this.state.intersectionObserver.disconnect();
        }

        // 모든 타이머 정리
        clearInterval(this.autoRefreshTimer);
        clearTimeout(this.resizeTimeout);
    },

    // Vue.js 앱 초기화 (메모리 최적화)
    initVueApp() {
        if (!window.Vue) return;

        const { createApp } = Vue;

        const app = createApp({
            data() {
                return {
                    showWriteModal: false
                }
            },
            methods: {
                closeWriteModal() {
                    this.showWriteModal = false;
                }
            },
            mounted() {
                // GSAP 애니메이션 (조건부 실행)
                if (typeof gsap !== 'undefined' && !document.hidden) {
                    this.initGSAPAnimations();
                }
            },
            beforeUnmount() {
                // Vue 인스턴스 정리
                if (typeof gsap !== 'undefined') {
                    gsap.killTweensOf('*');
                }
            },
            methods: {
                initGSAPAnimations() {
                    // 성능을 위해 애니메이션을 지연 실행
                    requestIdleCallback(() => {
                        gsap.registerPlugin();

                        // Stagger animation for board cards (최적화)
                        const boardCards = document.querySelectorAll('.board-card');
                        if (boardCards.length > 0) {
                            gsap.fromTo(boardCards, {
                                y: 30,
                                opacity: 0
                            }, {
                                y: 0,
                                opacity: 1,
                                duration: 0.6,
                                stagger: 0.1,
                                ease: "power2.out"
                            });
                        }

                        // Floating elements animation (성능 최적화)
                        const floatingBtn = document.querySelector('.floating-action-btn');
                        if (floatingBtn) {
                            gsap.to(floatingBtn, {
                                y: -5,
                                duration: 3,
                                repeat: -1,
                                yoyo: true,
                                ease: "power2.inOut"
                            });
                        }
                    });
                },

                closeWriteModal() {
                    this.showWriteModal = false;
                }
            }
        });

        // 앱 마운트 및 메모리에 등록
        const appElement = document.querySelector('#app');
        if (appElement) {
            const vueInstance = app.mount('#app');
            this.memory.vueInstances.add(vueInstance);
            window.vueApp = vueInstance;
        }
    },

    // 메모리 정리 메서드
    destroy() {
        console.log('🧹 MainBoard 메모리 정리 시작...');

        // RAF 취소
        if (this.state.rafId) {
            cancelAnimationFrame(this.state.rafId);
            this.state.rafId = null;
        }

        // 모든 타이머 정리
        this.memory.timers.forEach(timer => {
            clearTimeout(timer);
            clearInterval(timer);
        });
        this.memory.timers.clear();

        // 모든 이벤트 리스너 제거
        this.memory.eventListeners.forEach(listeners => {
            listeners.forEach(({ element, event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.memory.eventListeners.clear();

        // 옵저버 정리
        this.memory.observers.forEach(observer => {
            if (observer.disconnect) observer.disconnect();
            if (observer.unobserve) observer.unobserve();
        });
        this.memory.observers.clear();

        // Vue 인스턴스 정리
        this.memory.vueInstances.forEach(instance => {
            if (instance.$destroy) instance.$destroy();
        });
        this.memory.vueInstances.clear();

        // GSAP 애니메이션 정리
        if (typeof gsap !== 'undefined') {
            gsap.killTweensOf('.board-card, .floating-action-btn, .post-item');
        }

        // 바인딩된 메서드 정리
        this.memory.boundMethods.clear();

        // 상태 초기화
        this.state.isInitialized = false;
        this.state.intersectionObserver = null;

        console.log('✅ MainBoard 메모리 정리 완료');
    },

    // 메모리 사용량 모니터링
    getMemoryUsage() {
        return {
            timers: this.memory.timers.size,
            eventListeners: Array.from(this.memory.eventListeners.values()).reduce((sum, arr) => sum + arr.length, 0),
            observers: this.memory.observers.size,
            vueInstances: this.memory.vueInstances.size,
            boundMethods: this.memory.boundMethods.size,
            isInitialized: this.state.isInitialized
        };
    }
};

// 전역 메모리 관리 시스템
window.MemoryManager = {
    instances: new Set(),

    register(instance) {
        this.instances.add(instance);
    },

    unregister(instance) {
        this.instances.delete(instance);
    },

    cleanup() {
        console.log('🧹 전역 메모리 정리 시작...');

        this.instances.forEach(instance => {
            if (instance.destroy) {
                instance.destroy();
            }
        });

        // GSAP 정리
        if (typeof gsap !== 'undefined') {
            gsap.killTweensOf('*');
            gsap.globalTimeline.clear();
        }

        // Vue 인스턴스 정리
        if (window.vueApp && window.vueApp.$destroy) {
            window.vueApp.$destroy();
        }

        this.instances.clear();
        console.log('✅ 전역 메모리 정리 완료');
    },

    getMemoryUsage() {
        const usage = {
            totalInstances: this.instances.size,
            details: []
        };

        this.instances.forEach(instance => {
            if (instance.getMemoryUsage) {
                usage.details.push({
                    name: instance.constructor.name,
                    usage: instance.getMemoryUsage()
                });
            }
        });

        return usage;
    }
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    BoardSkin.MainBoard.init();

    // 메모리 관리자에 등록
    window.MemoryManager.register(BoardSkin.MainBoard);

    // Vue.js 앱 초기화
    if (typeof Vue !== 'undefined') {
        BoardSkin.MainBoard.initVueApp();
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    window.MemoryManager.cleanup();
});

// 페이지 숨김 시 리소스 절약
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 페이지가 숨겨지면 불필요한 애니메이션 정지
        if (typeof gsap !== 'undefined') {
            gsap.globalTimeline.pause();
        }
    } else {
        // 페이지가 다시 보이면 애니메이션 재개
        if (typeof gsap !== 'undefined') {
            gsap.globalTimeline.resume();
        }
    }
});

// 전역 API 노출
window.MainBoard = BoardSkin.MainBoard;

// 전역 네비게이션 함수들
window.navigateToPost = function(element) {
    const boardId = element.dataset.boardId;
    const postId = element.dataset.postId;
    if (boardId && postId) {
        location.href = `/board/${boardId}/${postId}/view`;
    }
};

window.navigateToWrite = function(element) {
    const boardId = element.dataset.boardId;
    if (boardId) {
        location.href = `/board/new?boardId=${boardId}`;
    }
};

// Vue.js와 연동
document.addEventListener('DOMContentLoaded', () => {
    // Vue 앱 인스턴스를 전역에서 접근 가능하도록
    if (typeof Vue !== 'undefined') {
        const vueAppElement = document.querySelector('#app');
        if (vueAppElement && vueAppElement.__vue_app__) {
            window.vueApp = vueAppElement.__vue_app__.config.globalProperties;
        }
    }
});

// 성능 모니터링
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`게시판 홈 로드 시간: ${loadTime.toFixed(2)}ms`);

        // 성능 메트릭 수집
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);
                });
            });

            observer.observe({ entryTypes: ['navigation', 'paint'] });
        }
    });
}

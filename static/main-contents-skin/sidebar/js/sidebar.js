// Apple macOS/iOS 스타일 사이드바 JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Vue.js 로드 확인
    if (typeof Vue === 'undefined') {
        console.error('Vue.js가 로드되지 않았습니다. CDN 연결을 확인해주세요.');
        return;
    }

    const { createApp, ref, onMounted, watch, nextTick } = Vue;

    // Apple 스타일 사이드바 매니저
    class AppleSidebarManager {
        constructor() {
            this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            this.isVisible = false;
            this.observers = new Map();

            this.init();
        }

        init() {
            this.setupIntersectionObserver();
            this.setupScrollEffects();
            this.setupAccessibility();
            this.setupResponsiveHandling();
        }

        setupIntersectionObserver() {
            if (!('IntersectionObserver' in window)) return;

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateElement(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: '50px 0px'
                }
            );

            this.observers.set('intersection', observer);
        }

        setupScrollEffects() {
            if (this.prefersReducedMotion) return;

            let ticking = false;
            const scrollHandler = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        this.updateScrollEffects();
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            window.addEventListener('scroll', scrollHandler, { passive: true });
        }

        updateScrollEffects() {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;

            const scrollY = window.scrollY;
            const opacity = Math.max(0.8, 1 - (scrollY / 1000));

            sidebar.style.opacity = opacity;
        }

        setupAccessibility() {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;

            // 키보드 네비게이션 지원
            const focusableElements = sidebar.querySelectorAll(`
                .section-link,
                .game-link,
                .notice-link,
                .event-link,
                .quick-link
            `);

            focusableElements.forEach(element => {
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        element.click();
                    }
                });

                element.addEventListener('focus', () => {
                    this.ensureElementVisible(element);
                });
            });
        }

        setupResponsiveHandling() {
            let resizeTimeout;

            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 150);
            });

            this.handleResize();
        }

        handleResize() {
            const isMobile = window.innerWidth <= 768;
            const sidebar = document.querySelector('.sidebar');

            if (sidebar && isMobile) {
                this.setupMobileSidebar(sidebar);
            }
        }

        setupMobileSidebar(sidebar) {
            // 모바일 사이드바 토글 버튼 생성
            if (!document.querySelector('.sidebar-toggle')) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'sidebar-toggle';
                toggleBtn.innerHTML = '☰';
                toggleBtn.setAttribute('aria-label', '사이드바 토글');

                document.body.appendChild(toggleBtn);

                toggleBtn.addEventListener('click', () => {
                    this.toggleMobileSidebar();
                });
            }

            // 오버레이 생성
            if (!document.querySelector('.sidebar-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);

                overlay.addEventListener('click', () => {
                    this.closeMobileSidebar();
                });
            }
        }

        toggleMobileSidebar() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');

            if (sidebar && overlay) {
                const isActive = sidebar.classList.contains('active');

                if (isActive) {
                    this.closeMobileSidebar();
                } else {
                    this.openMobileSidebar();
                }
            }
        }

        openMobileSidebar() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');

            if (sidebar && overlay) {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }

        closeMobileSidebar() {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');

            if (sidebar && overlay) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }

        animateElement(element) {
            if (this.prefersReducedMotion) return;

            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';

            requestAnimationFrame(() => {
                element.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            });
        }

        ensureElementVisible(element) {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;

            const rect = element.getBoundingClientRect();
            const sidebarRect = sidebar.getBoundingClientRect();

            const isVisible = rect.top >= sidebarRect.top &&
                rect.bottom <= sidebarRect.bottom;

            if (!isVisible) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }

        cleanup() {
            this.observers.forEach(observer => observer.disconnect());
            this.observers.clear();
        }
    }

    // Apple 스타일 애니메이션 유틸리티
    const useAppleAnimation = (elementRef) => {
        const animate = () => {
            nextTick(() => {
                if (elementRef.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    const children = elementRef.value.children;

                    Array.from(children).forEach((child, index) => {
                        child.style.opacity = '0';
                        child.style.transform = 'translateY(20px)';

                        setTimeout(() => {
                            child.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                            child.style.opacity = '1';
                            child.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        };
        return { animate };
    };

    // 루트 Vue 앱 생성
    const app = GlobalApp.createApp({
        setup() {
            const isLoading = ref(true);
            const popularGamesData = ref([]);
            const recentGamesData = ref([]);
            const noticesData = ref([]);
            const eventsData = ref([]);

            // 데이터 로드 시뮬레이션
            onMounted(() => {
                // Apple 스타일 로딩 애니메이션
                const loadingDuration = 1200; // 1.2초로 단축

                setTimeout(() => {
                    popularGamesData.value = window.popularGamesData || [];
                    recentGamesData.value = window.recentGamesData || [];
                    noticesData.value = window.noticesData || [];
                    eventsData.value = window.eventsData || [];
                    isLoading.value = false;
                }, loadingDuration);
            });

            return {
                isLoading,
                popularGamesData,
                recentGamesData,
                noticesData,
                eventsData,
            };
        },
        template: `
            <div v-if="isLoading" class="sidebar-loading-container">
                <widget-skeleton v-for="n in 4" :key="n" :index="n"></widget-skeleton>
            </div>
            <div v-else class="sidebar-content-container">
                <popular-games-widget :games="popularGamesData" class="sidebar-widget"></popular-games-widget>
                <recent-games-widget :games="recentGamesData" class="sidebar-widget"></recent-games-widget>
                <notice-widget :notices="noticesData" class="sidebar-widget"></notice-widget>
                <event-banner-widget :events="eventsData" class="sidebar-widget"></event-banner-widget>
                <sidebar-footer class="sidebar-widget"></sidebar-footer>
            </div>
        `
    });

    // 개선된 스켈레톤 UI 컴포넌트
    app.component('widget-skeleton', {
        props: ['index'],
        setup(props) {
            const skeletonRef = ref(null);

            onMounted(() => {
                if (skeletonRef.value) {
                    skeletonRef.value.style.animationDelay = `${props.index * 0.1}s`;
                }
            });

            return { skeletonRef };
        },
        template: `
            <section class="sidebar-section sidebar-skeleton" ref="skeletonRef">
                <div class="sidebar-skeleton-title"></div>
                <div class="sidebar-skeleton-item" v-for="n in 4" :key="n"></div>
            </section>
        `
    });

    // 인기 게임 순위 위젯
    app.component('popular-games-widget', {
        props: ['games'],
        setup(props) {
            const listRef = ref(null);
            const { animate } = useAppleAnimation(listRef);

            onMounted(() => {
                setTimeout(animate, 100);
            });

            watch(() => props.games, () => {
                setTimeout(animate, 50);
            });

            return { listRef };
        },
        template: `
            <section class="popular-games-section sidebar-section" aria-labelledby="popular-games-title">
                <div class="section-header">
                    <h3 class="section-title" id="popular-games-title">
                        <span class="title-icon" aria-hidden="true">🏆</span>
                        인기 게임 순위
                    </h3>
                    <a href="/games?sort=popular" class="section-link" aria-label="인기 게임 전체 순위 보기">더보기</a>
                </div>
                <div class="games-ranking" role="region" aria-label="인기 게임 순위 목록">
                    <ol class="ranking-list" v-if="games && games.length > 0" ref="listRef">
                        <li v-for="(game, index) in games" :key="game.id" class="ranking-item" role="listitem">
                            <div class="ranking-content">
                                <span class="ranking-number" :aria-label="index + 1 + '위'">{{ index + 1 }}</span>
                                <div class="game-info">
                                    <a class="game-link" :href="'/games/' + game.id" 
                                       :aria-label="game.title + ' 게임 보기'"
                                       @click="handleLinkClick">{{ game.title }}</a>
                                </div>
                            </div>
                        </li>
                    </ol>
                    <div class="empty-state" v-else role="status">
                        <lottie-player
                            autoplay
                            loop
                            mode="normal"
                            src="/lottie/game-ghost.json"
                            style="width: 80px; height: 80px;">
                        </lottie-player>
                        <p class="empty-text">인기 게임이 없습니다</p>
                    </div>
                </div>
            </section>
        `,
        methods: {
            handleLinkClick(event) {
                // Apple 스타일 클릭 피드백
                const link = event.currentTarget;
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            }
        }
    });

    // 최근 업로드 게임 위젯
    app.component('recent-games-widget', {
        props: ['games'],
        setup(props) {
            const listRef = ref(null);
            const { animate } = useAppleAnimation(listRef);

            onMounted(() => {
                setTimeout(animate, 200);
            });

            watch(() => props.games, () => {
                setTimeout(animate, 50);
            });

            return { listRef };
        },
        template: `
            <section class="recent-games-section sidebar-section" aria-labelledby="recent-games-title">
                <div class="section-header">
                    <h3 class="section-title" id="recent-games-title">
                        <span class="title-icon" aria-hidden="true">🆕</span>
                        최근 업로드 게임
                    </h3>
                    <a href="/games?sort=newest" class="section-link" aria-label="최근 업로드 게임 전체 보기">더보기</a>
                </div>
                <div class="recent-games-list" role="region" aria-label="최근 업로드 게임 목록">
                    <ul class="game-items" v-if="games && games.length > 0" ref="listRef">
                        <li v-for="game in games" :key="game.id" class="game-item" role="listitem">
                            <div class="game-info">
                                <a class="game-link" :href="'/games/' + game.id" 
                                   :aria-label="game.title + ' 게임 보기'"
                                   @click="handleLinkClick">{{ game.title }}</a>
                                <div class="game-meta">
                                    <span class="upload-date">
                                        {{ formatDate(game.uploadDate) }}
                                    </span>
                                </div>
                            </div>
                        </li>
                    </ul>
                    <div class="empty-state" v-else role="status">
                        <lottie-player
                            autoplay
                            loop
                            mode="normal"
                            src="/lottie/game-ghost.json"
                            style="width: 80px; height: 80px;">
                        </lottie-player>
                        <p class="empty-text">최근 업로드된 게임이 없습니다</p>
                    </div>
                </div>
            </section>
        `,
        methods: {
            handleLinkClick(event) {
                const link = event.currentTarget;
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            },
            formatDate(date) {
                if (!date) return '';
                return new Date(date).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric'
                });
            }
        }
    });

    // 공지사항 위젯
    app.component('notice-widget', {
        props: ['notices'],
        setup(props) {
            const listRef = ref(null);
            const { animate } = useAppleAnimation(listRef);

            onMounted(() => {
                setTimeout(animate, 300);
            });

            watch(() => props.notices, () => {
                setTimeout(animate, 50);
            });

            return { listRef };
        },
        template: `
            <section class="notice-section sidebar-section" aria-labelledby="notice-title">
                <div class="section-header">
                    <h3 class="section-title" id="notice-title">
                        <span class="title-icon" aria-hidden="true">📢</span>
                        공지사항
                    </h3>
                    <a href="/board/notice" class="section-link" aria-label="공지사항 전체 보기">더보기</a>
                </div>
                <div class="notice-list" role="region" aria-label="공지사항 목록">
                    <ul class="notice-items" v-if="notices && notices.length > 0" ref="listRef">
                        <li v-for="notice in notices" :key="notice.id" class="notice-item" role="listitem">
                            <a class="notice-link" :href="'/board/notice/' + notice.id" 
                               :aria-label="notice.title + ' 공지사항 보기'"
                               @click="handleLinkClick">{{ notice.title }}</a>
                        </li>
                    </ul>
                    <div class="empty-state" v-else role="status">
                        <lottie-player
                            autoplay
                            loop
                            mode="normal"
                            src="/lottie/empty-document.json"
                            style="width: 80px; height: 80px;">
                        </lottie-player>
                        <p class="empty-text">공지사항이 없습니다</p>
                    </div>
                </div>
            </section>
        `,
        methods: {
            handleLinkClick(event) {
                const link = event.currentTarget;
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            }
        }
    });

    // 이벤트 배너 위젯
    app.component('event-banner-widget', {
        props: ['events'],
        setup(props) {
            const listRef = ref(null);
            const { animate } = useAppleAnimation(listRef);

            onMounted(() => {
                setTimeout(animate, 400);
            });

            watch(() => props.events, () => {
                setTimeout(animate, 50);
            });

            return { listRef };
        },
        template: `
            <section class="event-banner-section sidebar-section" aria-labelledby="event-title">
                <div class="section-header">
                    <h3 class="section-title" id="event-title">
                        <span class="title-icon" aria-hidden="true">🎉</span>
                        이벤트
                    </h3>
                    <a href="/events" class="section-link" aria-label="이벤트 전체 보기">더보기</a>
                </div>
                <div class="event-list" role="region" aria-label="이벤트 목록">
                    <div class="event-items" v-if="events && events.length > 0" ref="listRef">
                        <div v-for="event in events" :key="event.id" class="event-item" role="article">
                            <a class="event-link" :href="'/events/' + event.id" 
                               :aria-label="event.title + ' 이벤트 보기'"
                               @click="handleLinkClick">
                                <h4 class="event-title">{{ event.title }}</h4>
                                <p class="event-description">{{ event.description }}</p>
                            </a>
                        </div>
                    </div>
                    <div class="empty-state" v-else role="status">
                        <lottie-player
                            autoplay
                            loop
                            mode="normal"
                            src="/lottie/confetti.json"
                            style="width: 80px; height: 80px;">
                        </lottie-player>
                        <p class="empty-text">진행 중인 이벤트가 없습니다</p>
                    </div>
                </div>
            </section>
        `,
        methods: {
            handleLinkClick(event) {
                const link = event.currentTarget;
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            }
        }
    });

    // 사이드바 푸터 컴포넌트
    app.component('sidebar-footer', {
        setup() {
            const footerRef = ref(null);

            onMounted(() => {
                if (footerRef.value && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    setTimeout(() => {
                        footerRef.value.style.opacity = '0';
                        footerRef.value.style.transform = 'translateY(20px)';

                        setTimeout(() => {
                            footerRef.value.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                            footerRef.value.style.opacity = '1';
                            footerRef.value.style.transform = 'translateY(0)';
                        }, 50);
                    }, 500);
                }
            });

            return { footerRef };
        },
        template: `
            <section class="sidebar-footer" ref="footerRef">
                <div class="quick-links">
                    <a href="/help" class="quick-link" aria-label="도움말 페이지로 이동" @click="handleLinkClick">
                        <span class="link-icon" aria-hidden="true">❓</span>
                        도움말
                    </a>
                    <a href="/contact" class="quick-link" aria-label="문의하기 페이지로 이동" @click="handleLinkClick">
                        <span class="link-icon" aria-hidden="true">✉️</span>
                        문의하기
                    </a>
                    <a href="/feedback" class="quick-link" aria-label="피드백 보내기 페이지로 이동" @click="handleLinkClick">
                        <span class="link-icon" aria-hidden="true">💭</span>
                        피드백
                    </a>
                </div>
            </section>
        `,
        methods: {
            handleLinkClick(event) {
                const link = event.currentTarget;
                link.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    link.style.transform = '';
                }, 150);
            }
        }
    });

    // Vue 앱 마운트
    app.mount('#sidebar-app');

    // Apple 사이드바 매니저 초기화
    window.appleSidebarManager = new AppleSidebarManager();

    // 전역 API 노출
    window.AppleSidebar = {
        toggle: () => window.appleSidebarManager.toggleMobileSidebar(),
        open: () => window.appleSidebarManager.openMobileSidebar(),
        close: () => window.appleSidebarManager.closeMobileSidebar(),
        refresh: () => {
            window.appleSidebarManager.cleanup();
            window.appleSidebarManager = new AppleSidebarManager();
        }
    };

    // 테마 변경 감지
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeQuery.addEventListener('change', (e) => {
        // 다크 모드 변경 시 사이드바 스타일 업데이트
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.style.transition = 'all 0.3s ease-out';
            setTimeout(() => {
                sidebar.style.transition = '';
            }, 300);
        }
    });

    // 성능 모니터링
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`사이드바 로드 시간: ${loadTime.toFixed(2)}ms`);
        });
    }

    // 페이지 언로드 시 정리
    window.addEventListener('beforeunload', () => {
        if (window.appleSidebarManager) {
            window.appleSidebarManager.cleanup();
        }
    });
});
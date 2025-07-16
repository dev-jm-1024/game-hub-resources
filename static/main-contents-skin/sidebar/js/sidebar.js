document.addEventListener('DOMContentLoaded', () => {
    const { createApp, ref, onMounted, watch, nextTick } = Vue;

    // 루트 Vue 앱 생성
    const app = GlobalApp.createApp({
        // 루트 컴포넌트 설정
        setup() {
            const isLoading = ref(true);
            const popularGamesData = ref([]);
            const recentGamesData = ref([]);
            const noticesData = ref([]);
            const eventsData = ref([]);

            // 데이터를 비동기적으로 로드하는 것을 시뮬레이션
            onMounted(() => {
                setTimeout(() => {
                    popularGamesData.value = window.popularGamesData || [];
                    recentGamesData.value = window.recentGamesData || [];
                    noticesData.value = window.noticesData || [];
                    eventsData.value = window.eventsData || [];
                    isLoading.value = false;
                }, 1500); // 1.5초 딜레이
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
                <widget-skeleton v-for="n in 4" :key="n"></widget-skeleton>
            </div>
            <div v-else class="sidebar-content-container">
                <popular-games-widget :games="popularGamesData"></popular-games-widget>
                <recent-games-widget :games="recentGamesData"></recent-games-widget>
                <notice-widget :notices="noticesData"></notice-widget>
                <event-banner-widget :events="eventsData"></event-banner-widget>
                <sidebar-footer></sidebar-footer>
            </div>
        `
    });

    // 공통 애니메이션 로직
    const useStaggerAnimation = (elementRef) => {
        const animate = () => {
            nextTick(() => {
                if (elementRef.value) {
                    gsap.from(elementRef.value.children, {
                        duration: 0.5,
                        y: 20,
                        opacity: 0,
                        stagger: 0.1,
                        ease: 'power2.out'
                    });
                }
            });
        };
        return { animate };
    };

    // 스켈레톤 UI 컴포넌트
    app.component('widget-skeleton', {
        template: `
            <section class="sidebar-section sidebar-skeleton">
                <div class="sidebar-skeleton-title"></div>
                <div class="sidebar-skeleton-item" v-for="n in 5" :key="n">
                    <div class="sidebar-skeleton-text"></div>
                </div>
            </section>
        `
    });

    // 인기 게임 순위 위젯
    app.component('popular-games-widget', {
        props: ['games'],
        setup(props) {
            const listRef = ref(null);
            const { animate } = useStaggerAnimation(listRef);
            onMounted(animate);
            watch(() => props.games, animate);
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
                                    <a class="game-link" :href="'/games/' + game.id" :aria-label="game.title + ' 게임 보기'">{{ game.title }}</a>
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
                            style="width: 120px; height: 120px;">
                        </lottie-player>
                        <p class="empty-text">인기 게임이 없습니다.</p>
                    </div>
                </div>
            </section>
        `
    });

     // 최근 업로드 게임 위젯
    app.component('recent-games-widget', {
        props: ['games'],
        setup(props) {
            const listRef = ref(null);
            const { animate } = useStaggerAnimation(listRef);
            onMounted(animate);
            watch(() => props.games, animate);
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
                             <a class="game-link" :href="'/games/' + game.id" :aria-label="game.title + ' 게임 보기'">{{ game.title }}</a>
                        </li>
                    </ul>
                    <div class="empty-state" v-else role="status">
                        <lottie-player
                            autoplay
                            loop
                            mode="normal"
                            src="/lottie/game-ghost.json"
                            style="width: 120px; height: 120px;">
                        </lottie-player>
                        <p class="empty-text">최근 업로드된 게임이 없습니다.</p>
                    </div>
                </div>
            </section>
        `
    });

    // 공지사항 위젯
    app.component('notice-widget', {
        props: ['notices'],
        setup(props) {
            const listRef = ref(null);
            const { animate } = useStaggerAnimation(listRef);
            onMounted(animate);
            watch(() => props.notices, animate);
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
                            <a class="notice-link" :href="'/board/notice/' + notice.id" :aria-label="notice.title + ' 공지사항 보기'">{{ notice.title }}</a>
                        </li>
                    </ul>
                    <div class="empty-state" v-else role="status">
                        <lottie-player
                            autoplay
                            loop
                            mode="normal"
                            src="/lottie/empty-document.json"
                            style="width: 120px; height: 120px;">
                        </lottie-player>
                        <p class="empty-text">공지사항이 없습니다.</p>
                    </div>
                </div>
            </section>
        `
    });

    // 이벤트 배너 위젯
    app.component('event-banner-widget', {
        props: ['events'],
         setup(props) {
            const listRef = ref(null);
            const { animate } = useStaggerAnimation(listRef);
            onMounted(animate);
            watch(() => props.events, animate);
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
                             <a class="event-link" :href="'/events/' + event.id" :aria-label="event.title + ' 이벤트 보기'">
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
                            style="width: 120px; height: 120px;">
                        </lottie-player>
                        <p class="empty-text">진행 중인 이벤트가 없습니다.</p>
                    </div>
                </div>
            </section>
        `
    });
    
    // 사이드바 푸터 컴포넌트
    app.component('sidebar-footer', {
        template: `
            <section class="sidebar-footer">
                <div class="quick-links">
                    <a href="/help" class="quick-link" aria-label="도움말 페이지로 이동">
                        <span class="link-icon" aria-hidden="true">❓</span>
                        도움말
                    </a>
                    <a href="/contact" class="quick-link" aria-label="문의하기 페이지로 이동">
                        <span class="link-icon" aria-hidden="true">✉️</span>
                        문의하기
                    </a>
                    <a href="/feedback" class="quick-link" aria-label="피드백 보내기 페이지로 이동">
                        <span class="link-icon" aria-hidden="true">💭</span>
                        피드백
                    </a>
                </div>
            </section>
        `
    });

    app.mount('#sidebar-app');
});
// Apple macOS/iOS 스타일 메인 JavaScript

class MainContentManager {
    constructor() {
        this.content = null;
        this.currentPage = 1;
        this.isLoading = false;
        this.intersectionObserver = null;

        this.init();
    }

    init() {
        this.content = document.querySelector('.content-main');
        if (!this.content) return;

        this.setupInfiniteScroll();
        this.setupInteractions();
        this.setupAnimations();
        this.setupSearch();
        this.setupFilters();
        this.setupModals();
    }

    setupInfiniteScroll() {
        const loadMoreTrigger = document.querySelector('.load-more-trigger');
        if (!loadMoreTrigger) return;

        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !this.isLoading) {
                        this.loadMoreContent();
                    }
                });
            },
            { threshold: 0.1 }
        );

        this.intersectionObserver.observe(loadMoreTrigger);
    }

    async loadMoreContent() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingIndicator();

        try {
            const response = await fetch(`/api/content?page=${this.currentPage + 1}`);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                this.appendContent(data.items);
                this.currentPage++;
            } else {
                this.hideLoadMoreTrigger();
            }
        } catch (error) {
            console.error('Failed to load more content:', error);
            App.notifications.error('콘텐츠 로드 중 오류가 발생했습니다.');
        } finally {
            this.isLoading = false;
            this.hideLoadingIndicator();
        }
    }

    appendContent(items) {
        const container = document.querySelector('.content-container');
        if (!container) return;

        items.forEach(item => {
            const element = this.createContentElement(item);
            container.appendChild(element);

            // 애니메이션 트리거
            requestAnimationFrame(() => {
                element.classList.add('fade-in');
            });
        });
    }

    createContentElement(item) {
        const element = document.createElement('div');
        element.className = 'content-item';
        element.innerHTML = `
            <div class="content-card">
                <div class="card-header">
                    <h3 class="card-title">${item.title}</h3>
                    <span class="card-date">${Utils.formatDate(item.date)}</span>
                </div>
                <div class="card-content">
                    <p>${item.excerpt}</p>
                </div>
                <div class="card-footer">
                    <div class="card-meta">
                        <span class="card-author">${item.author}</span>
                        <span class="card-views">${item.views} 조회</span>
                    </div>
                    <div class="card-actions">
                        <button class="card-btn primary" onclick="MainContent.viewItem('${item.id}')">
                            자세히 보기
                        </button>
                    </div>
                </div>
            </div>
        `;

        return element;
    }

    setupInteractions() {
        // 좋아요 버튼
        this.content.addEventListener('click', (e) => {
            if (e.target.matches('.like-btn')) {
                this.toggleLike(e.target);
            }
        });

        // 공유 버튼
        this.content.addEventListener('click', (e) => {
            if (e.target.matches('.share-btn')) {
                this.shareContent(e.target);
            }
        });

        // 댓글 토글
        this.content.addEventListener('click', (e) => {
            if (e.target.matches('.comment-toggle')) {
                this.toggleComments(e.target);
            }
        });

        // 탭 전환
        this.content.addEventListener('click', (e) => {
            if (e.target.matches('.tab-item')) {
                this.switchTab(e.target);
            }
        });
    }

    toggleLike(button) {
        const isLiked = button.classList.contains('liked');
        const countElement = button.querySelector('.like-count');
        let count = parseInt(countElement.textContent) || 0;

        if (isLiked) {
            button.classList.remove('liked');
            count--;
            button.innerHTML = `👍 ${count}`;
        } else {
            button.classList.add('liked');
            count++;
            button.innerHTML = `❤️ ${count}`;
        }

        // 애니메이션 효과
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }

    shareContent(button) {
        const contentId = button.dataset.contentId;
        const title = button.dataset.title;
        const url = window.location.href;

        if (navigator.share) {
            navigator.share({
                title: title,
                url: url
            });
        } else {
            // 폴백: 클립보드에 복사
            navigator.clipboard.writeText(url).then(() => {
                App.notifications.success('링크가 클립보드에 복사되었습니다.');
            });
        }
    }

    toggleComments(button) {
        const contentItem = button.closest('.content-item');
        const commentsSection = contentItem.querySelector('.comments-section');

        if (!commentsSection) {
            this.loadComments(contentItem, button.dataset.contentId);
        } else {
            commentsSection.style.display =
                commentsSection.style.display === 'none' ? 'block' : 'none';
        }
    }

    async loadComments(contentItem, contentId) {
        try {
            const response = await fetch(`/api/comments/${contentId}`);
            const comments = await response.json();

            const commentsSection = document.createElement('div');
            commentsSection.className = 'comments-section';
            commentsSection.innerHTML = this.renderComments(comments);

            contentItem.appendChild(commentsSection);
        } catch (error) {
            console.error('Failed to load comments:', error);
            App.notifications.error('댓글 로드 중 오류가 발생했습니다.');
        }
    }

    renderComments(comments) {
        const commentsHtml = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-avatar">${comment.author.charAt(0)}</div>
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-time">${Utils.timeAgo(comment.createdAt)}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            </div>
        `).join('');

        return `
            <div class="comments-list">
                ${commentsHtml}
            </div>
            <div class="comment-form">
                <textarea class="comment-input" placeholder="댓글을 입력하세요..."></textarea>
                <button class="comment-submit">댓글 작성</button>
            </div>
        `;
    }

    switchTab(tabButton) {
        const tabContainer = tabButton.closest('.tab-navigation');
        const tabContent = tabContainer.nextElementSibling;

        // 모든 탭 비활성화
        tabContainer.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
        });

        // 선택된 탭 활성화
        tabButton.classList.add('active');

        // 탭 콘텐츠 전환
        const targetTab = tabButton.dataset.tab;
        const contentPanes = tabContent.querySelectorAll('.tab-pane');

        contentPanes.forEach(pane => {
            pane.style.display = pane.id === targetTab ? 'block' : 'none';
        });
    }

    setupAnimations() {
        // 콘텐츠 영역이 없으면 애니메이션 설정 건너뛰기
        if (!this.content) return;

        // 예시: 스크롤에 따라 요소 나타나는 효과
        const animatedElements = this.content.querySelectorAll('.fade-in-on-scroll');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => observer.observe(el));

        // 패럴랙스 효과
        this.setupParallax();
    }

    setupParallax() {
        // 콘텐츠 영역이 없으면 시차 효과 설정 건너뛰기
        if (!this.content) return;

        const parallaxBg = this.content.querySelector('.parallax-background');
        if (!parallaxBg) return;

        const handleScroll = () => {
            const scrolled = window.scrollY;
            parallaxBg.style.transform = `translateY(${scrolled * 0.5}px)`;
        };

        window.addEventListener('scroll', handleScroll);
    }

    setupSearch() {
        const header = document.querySelector('.site-header');
        if (!header) return;

        const searchForm = header.querySelector('.search-form');
        const searchInput = header.querySelector('#search-input');
        const resultsContainer = header.querySelector('.search-results-container'); // 가상의 결과 컨테이너

        if (!searchForm || !searchInput) return;

        let debounceTimer;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const query = e.target.value;
                if (query.length > 1) {
                    this.performSearch(query, resultsContainer);
                } else if (resultsContainer) {
                    this.clearSearchResults(resultsContainer);
                }
            }, 300);
        });

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value;
            if (query) {
                // 검색 페이지로 리디렉션 또는 즉시 검색 실행
                window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        });
    }

    async performSearch(query, resultsContainer) {
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '<div class="loading-spinner"></div>'; // 로딩 표시

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            this.displaySearchResults(results, resultsContainer);
        } catch (error) {
            console.error('Search failed:', error);
            resultsContainer.innerHTML = '<p class="error-message">검색 중 오류가 발생했습니다.</p>';
        }
    }

    displaySearchResults(results, container) {
        if (!container) return;

        this.clearSearchResults(container);

        if (results.length === 0) {
            container.innerHTML = '<p>검색 결과가 없습니다.</p>';
            return;
        }

        const list = document.createElement('ul');
        list.className = 'search-results-list';

        results.forEach(result => {
            const item = document.createElement('li');
            item.className = 'search-result-item';
            item.innerHTML = `
                <a href="${result.url}">
                    <span class="result-title">${result.title}</span>
                    <span class="result-category">${result.category}</span>
                </a>
            `;
            list.appendChild(item);
        });

        container.appendChild(list);
    }

    clearSearchResults(container) {
        if (container) {
            container.innerHTML = '';
        }
    }

    setupFilters() {
        if (!this.content) return;
        
        const filterContainer = this.content.querySelector('.filter-container');
        if (!filterContainer) return;

        filterContainer.addEventListener('click', (e) => {
            if (e.target.matches('.filter-btn')) {
                const filter = e.target.dataset.filter;
                this.applyFilter(filter);
            } else if (e.target.matches('.sort-option')) {
                const sortBy = e.target.dataset.sort;
                this.applySorting(sortBy);
            }
        });
    }

    applyFilter(filter) {
        console.log(`Filtering by: ${filter}`);
        // 필터링 로직 구현 (예: API 요청 또는 DOM 조작)
    }

    applySorting(sortBy) {
        console.log(`Sorting by: ${sortBy}`);
        // 정렬 로직 구현 (예: API 요청 또는 DOM 조작)
    }

    setupModals() {
        if (!this.content) return;

        this.content.addEventListener('click', (e) => {
            const image = e.target.closest('.modal-trigger');
            if (image) {
                e.preventDefault();
                this.openImageModal(image);
            }
        });
    }

    openImageModal(image) {
        const src = image.src || image.href;
        const alt = image.alt || '이미지';
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <img src="${src}" alt="${alt}" class="modal-image">
                <button class="modal-close">×</button>
            </div>
        `;

        document.body.appendChild(modal);

        // 모달 닫기 이벤트
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                modal.remove();
            }
        });

        // ESC 키로 닫기
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    }

    showLoadingIndicator() {
        const indicator = document.querySelector('.loading-indicator');
        if (indicator) {
            indicator.style.display = 'block';
        }
    }

    hideLoadingIndicator() {
        const indicator = document.querySelector('.loading-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    hideLoadMoreTrigger() {
        const trigger = document.querySelector('.load-more-trigger');
        if (trigger) {
            trigger.style.display = 'none';
        }
    }

    viewItem(itemId) {
        window.location.href = `/item/${itemId}`;
    }

    // 페이지 전환 애니메이션
    transitionToPage(url) {
        document.body.classList.add('page-transitioning');

        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }
}

// 메인 콘텐츠 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.mainContentManager = new MainContentManager();
});

// 전역 메인 콘텐츠 API
window.MainContent = {
    loadMore: () => {
        if (window.mainContentManager) {
            window.mainContentManager.loadMoreContent();
        }
    },

    viewItem: (itemId) => {
        if (window.mainContentManager) {
            window.mainContentManager.viewItem(itemId);
        }
    },

    applyFilter: (filter) => {
        if (window.mainContentManager) {
            window.mainContentManager.applyFilter(filter);
        }
    },

    search: (query) => {
        if (window.mainContentManager) {
            const searchResults = document.querySelector('.search-results');
            window.mainContentManager.performSearch(query, searchResults);
        }
    }
};
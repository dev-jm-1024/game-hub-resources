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
        // 스크롤 애니메이션
        const animatedElements = document.querySelectorAll('.scroll-reveal');

        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            animationObserver.observe(el);
        });

        // 패럴랙스 효과
        this.setupParallax();
    }

    setupParallax() {
        const parallaxElements = document.querySelectorAll('.parallax');

        const handleScroll = () => {
            const scrollTop = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        };

        window.addEventListener('scroll', Utils.throttle(handleScroll, 16));
    }

    setupSearch() {
        const searchForm = document.querySelector('.search-form');
        if (!searchForm) return;

        const searchInput = searchForm.querySelector('.search-input');
        const searchResults = document.querySelector('.search-results');

        searchInput.addEventListener('input', Utils.debounce((e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                this.performSearch(query, searchResults);
            } else {
                this.clearSearchResults(searchResults);
            }
        }, 300));
    }

    async performSearch(query, resultsContainer) {
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();

            this.displaySearchResults(results, resultsContainer);
        } catch (error) {
            console.error('Search error:', error);
            App.notifications.error('검색 중 오류가 발생했습니다.');
        }
    }

    displaySearchResults(results, container) {
        if (!results || results.length === 0) {
            container.innerHTML = '<div class="no-results">검색 결과가 없습니다.</div>';
            return;
        }

        const html = results.map(result => `
            <div class="search-result-item">
                <h4 class="result-title">${result.title}</h4>
                <p class="result-excerpt">${result.excerpt}</p>
                <div class="result-meta">
                    <span class="result-date">${Utils.formatDate(result.date)}</span>
                    <span class="result-type">${result.type}</span>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    clearSearchResults(container) {
        container.innerHTML = '';
    }

    setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const sortSelect = document.querySelector('.sort-select');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.applyFilter(button.dataset.filter);
            });
        });

        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.applySorting(e.target.value);
            });
        }
    }

    applyFilter(filter) {
        const items = document.querySelectorAll('.content-item');

        items.forEach(item => {
            const itemType = item.dataset.type;
            const shouldShow = filter === 'all' || itemType === filter;

            if (shouldShow) {
                item.style.display = '';
                item.classList.add('fade-in');
            } else {
                item.style.display = 'none';
                item.classList.remove('fade-in');
            }
        });
    }

    applySorting(sortBy) {
        const container = document.querySelector('.content-container');
        const items = Array.from(container.querySelectorAll('.content-item'));

        items.sort((a, b) => {
            switch (sortBy) {
                case 'date':
                    return new Date(b.dataset.date) - new Date(a.dataset.date);
                case 'title':
                    return a.dataset.title.localeCompare(b.dataset.title);
                case 'views':
                    return parseInt(b.dataset.views) - parseInt(a.dataset.views);
                default:
                    return 0;
            }
        });

        items.forEach(item => container.appendChild(item));
    }

    setupModals() {
        // 이미지 모달
        this.content.addEventListener('click', (e) => {
            if (e.target.matches('.zoomable-image')) {
                this.openImageModal(e.target);
            }
        });
    }

    openImageModal(image) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <img src="${image.src}" alt="${image.alt}" class="modal-image">
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
// Apple macOS/iOS 스타일 게시글 목록 JavaScript

// 네임스페이스 정의
window.BoardSkin = window.BoardSkin || {};
window.BoardSkin.PostSkin = window.BoardSkin.PostSkin || {};

BoardSkin.PostSkin.List = {
    // 설정
    config: {
        animationDuration: 300,
        debounceDelay: 300,
        searchMinLength: 2,
        itemsPerPage: 20
    },

    // 상태
    state: {
        isLoading: false,
        currentPage: 1,
        totalPages: 1,
        searchQuery: '',
        sortBy: 'latest',
        filterBy: 'all'
    },

    // DOM 요소
    elements: {},

    // 초기화
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupTable();
        this.setupSearch();
        this.setupPagination();
        
        console.log('BoardSkin.PostSkin.List initialized');
    },

    // DOM 요소 캐싱
    cacheElements() {
        this.elements = {
            container: document.querySelector('.post-list-container'),
            table: document.querySelector('.post-table'),
            tableBody: document.querySelector('.post-table tbody'),
            writeButton: document.querySelector('.write-button'),
            searchInput: document.querySelector('#search-input'),
            sortSelect: document.querySelector('#sort-select'),
            filterSelect: document.querySelector('#filter-select'),
            pagination: document.querySelector('.pagination'),
            loadingIndicator: document.querySelector('.loading-indicator')
        };
    },

    // 이벤트 바인딩
    bindEvents() {
        // 테이블 행 클릭 이벤트
        if (this.elements.tableBody) {
            this.elements.tableBody.addEventListener('click', this.handleRowClick.bind(this));
        }

        // 글쓰기 버튼 클릭
        if (this.elements.writeButton) {
            this.elements.writeButton.addEventListener('click', this.handleWriteClick.bind(this));
        }

        // 검색 입력
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', 
                this.debounce(this.handleSearch.bind(this), this.config.debounceDelay)
            );
        }

        // 정렬 변경
        if (this.elements.sortSelect) {
            this.elements.sortSelect.addEventListener('change', this.handleSortChange.bind(this));
        }

        // 필터 변경
        if (this.elements.filterSelect) {
            this.elements.filterSelect.addEventListener('change', this.handleFilterChange.bind(this));
        }

        // 키보드 네비게이션
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // 윈도우 리사이즈
        window.addEventListener('resize', 
            this.debounce(this.handleResize.bind(this), this.config.debounceDelay)
        );
    },

    // 테이블 설정
    setupTable() {
        if (!this.elements.table) return;

        // 테이블 행에 호버 효과 추가
        this.addTableHoverEffects();
        
        // 반응형 테이블 처리
        this.handleResponsiveTable();
    },

    // 테이블 호버 효과
    addTableHoverEffects() {
        const rows = this.elements.tableBody?.querySelectorAll('tr');
        if (!rows) return;

        rows.forEach(row => {
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = 'var(--system-gray6)';
            });

            row.addEventListener('mouseleave', () => {
                row.style.backgroundColor = '';
            });
        });
    },

    // 검색 설정
    setupSearch() {
        if (!this.elements.searchInput) return;

        // 검색 입력 필드에 플레이스홀더 애니메이션
        this.animateSearchPlaceholder();
    },

    // 페이지네이션 설정
    setupPagination() {
        if (!this.elements.pagination) return;

        const paginationItems = this.elements.pagination.querySelectorAll('.pagination-item');
        paginationItems.forEach(item => {
            item.addEventListener('click', this.handlePaginationClick.bind(this));
        });
    },

    // 이벤트 핸들러들
    handleRowClick(event) {
        const row = event.target.closest('tr');
        if (!row) return;

        // 로딩 상태 표시
        this.showLoading(true);

        // 게시글 ID 추출 (data 속성이나 다른 방법으로)
        const postId = row.dataset.postId;
        const boardId = row.dataset.boardId || this.getBoardIdFromUrl();

        if (postId && boardId) {
            // 게시글 상세 페이지로 이동
            window.location.href = `/board/${boardId}/posts/${postId}`;
        }
    },

    handleWriteClick(event) {
        event.preventDefault();
        
        // 버튼 애니메이션
        this.animateButton(event.target);

        // 글쓰기 페이지로 이동
        const boardId = this.getBoardIdFromUrl();
        if (boardId) {
            window.location.href = `/board/${boardId}/new`;
        }
    },

    handleSearch(event) {
        const query = event.target.value.trim();
        
        if (query.length >= this.config.searchMinLength || query.length === 0) {
            this.state.searchQuery = query;
            this.state.currentPage = 1;
            this.performSearch();
        }
    },

    handleSortChange(event) {
        this.state.sortBy = event.target.value;
        this.state.currentPage = 1;
        this.refreshList();
    },

    handleFilterChange(event) {
        this.state.filterBy = event.target.value;
        this.state.currentPage = 1;
        this.refreshList();
    },

    handlePaginationClick(event) {
        event.preventDefault();
        
        const page = parseInt(event.target.dataset.page);
        if (page && page !== this.state.currentPage) {
            this.state.currentPage = page;
            this.refreshList();
        }
    },

    handleKeyDown(event) {
        // 키보드 단축키
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'f':
                case 'F':
                    // 검색 포커스
                    event.preventDefault();
                    this.elements.searchInput?.focus();
                    break;
                case 'n':
                case 'N':
                    // 새 글 작성
                    event.preventDefault();
                    this.elements.writeButton?.click();
                    break;
            }
        }

        // ESC 키로 검색 초기화
        if (event.key === 'Escape' && this.elements.searchInput === document.activeElement) {
            this.elements.searchInput.value = '';
            this.state.searchQuery = '';
            this.refreshList();
        }
    },

    handleResize() {
        this.handleResponsiveTable();
    },

    // 유틸리티 함수들
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
    },

    getBoardIdFromUrl() {
        const path = window.location.pathname;
        const match = path.match(/\/board\/([^\/]+)/);
        return match ? match[1] : null;
    },

    // 애니메이션 함수들
    animateButton(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    },

    animateSearchPlaceholder() {
        const searchInput = this.elements.searchInput;
        if (!searchInput) return;

        const placeholders = [
            '게시글 제목으로 검색...',
            '작성자로 검색...',
            '내용으로 검색...'
        ];
        
        let currentIndex = 0;
        
        setInterval(() => {
            if (searchInput !== document.activeElement && !searchInput.value) {
                searchInput.placeholder = placeholders[currentIndex];
                currentIndex = (currentIndex + 1) % placeholders.length;
            }
        }, 3000);
    },

    // 데이터 처리 함수들
    performSearch() {
        this.showLoading(true);
        
        // 실제 구현에서는 서버 API 호출
        setTimeout(() => {
            this.filterTableRows();
            this.showLoading(false);
        }, 500);
    },

    filterTableRows() {
        const rows = this.elements.tableBody?.querySelectorAll('tr');
        if (!rows) return;

        const query = this.state.searchQuery.toLowerCase();

        rows.forEach(row => {
            const title = row.querySelector('td:nth-child(2)')?.textContent?.toLowerCase() || '';
            const author = row.querySelector('td:nth-child(3)')?.textContent?.toLowerCase() || '';
            
            const matches = title.includes(query) || author.includes(query) || query === '';
            
            row.style.display = matches ? '' : 'none';
            
            if (matches) {
                row.style.animation = 'fadeIn 0.3s ease-out';
            }
        });

        // 검색 결과 없음 메시지 표시
        this.toggleEmptyMessage();
    },

    refreshList() {
        this.showLoading(true);
        
        // 실제 구현에서는 서버에서 데이터를 가져옴
        setTimeout(() => {
            this.updateTable();
            this.updatePagination();
            this.showLoading(false);
        }, 500);
    },

    updateTable() {
        // 테이블 업데이트 로직
        console.log('Table updated with:', {
            page: this.state.currentPage,
            sort: this.state.sortBy,
            filter: this.state.filterBy,
            search: this.state.searchQuery
        });
    },

    updatePagination() {
        // 페이지네이션 업데이트 로직
        if (!this.elements.pagination) return;

        // 현재 페이지 하이라이트
        const items = this.elements.pagination.querySelectorAll('.pagination-item');
        items.forEach(item => {
            item.classList.toggle('active', 
                parseInt(item.dataset.page) === this.state.currentPage
            );
        });
    },

    toggleEmptyMessage() {
        const visibleRows = Array.from(this.elements.tableBody?.querySelectorAll('tr') || [])
            .filter(row => row.style.display !== 'none');

        let emptyMessage = this.elements.container?.querySelector('.empty-search-message');
        
        if (visibleRows.length === 0 && this.state.searchQuery) {
            if (!emptyMessage) {
                emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-search-message';
                emptyMessage.innerHTML = `
                    <p>검색 결과가 없습니다.</p>
                    <p class="text-sm">다른 키워드로 검색해보세요.</p>
                `;
                this.elements.container?.appendChild(emptyMessage);
            }
        } else if (emptyMessage) {
            emptyMessage.remove();
        }
    },

    // 반응형 테이블 처리
    handleResponsiveTable() {
        if (!this.elements.table) return;

        const isMobile = window.innerWidth <= 768;
        
        // 모바일에서 일부 컬럼 숨김/표시
        const hideOnMobile = this.elements.table.querySelectorAll('.hide-mobile');
        hideOnMobile.forEach(element => {
            element.style.display = isMobile ? 'none' : '';
        });
    },

    // 로딩 상태 관리
    showLoading(show) {
        this.state.isLoading = show;
        
        if (this.elements.container) {
            this.elements.container.classList.toggle('loading', show);
        }

        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = show ? 'block' : 'none';
        }

        // 버튼 비활성화
        if (this.elements.writeButton) {
            this.elements.writeButton.disabled = show;
        }
    },

    // 에러 처리
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        this.elements.container?.prepend(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },

    // 성공 메시지
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        this.elements.container?.prepend(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    BoardSkin.PostSkin.List.init();
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    // 필요한 정리 작업
});

// 전역 함수로 노출 (필요한 경우)
window.PostList = BoardSkin.PostSkin.List; 
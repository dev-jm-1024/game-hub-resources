// Apple macOS/iOS 스타일 게시글 상세 JavaScript

// 네임스페이스 정의
window.BoardSkin = window.BoardSkin || {};
window.BoardSkin.PostSkin = window.BoardSkin.PostSkin || {};

BoardSkin.PostSkin.Detail = {
    // 설정
    config: {
        animationDuration: 300,
        confirmDeleteDelay: 3000,
        autoSaveInterval: 30000,
        maxImageSize: 5 * 1024 * 1024 // 5MB
    },

    // 상태
    state: {
        isLoading: false,
        isEditing: false,
        postData: {},
        unsavedChanges: false,
        deleteConfirmTimer: null
    },

    // DOM 요소
    elements: {},

    // 초기화
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupCSRF();
        this.setupImageViewer();
        this.setupKeyboardShortcuts();
        
        console.log('BoardSkin.PostSkin.Detail initialized');
    },

    // DOM 요소 캐싱
    cacheElements() {
        this.elements = {
            container: document.querySelector('.post-detail-container'),
            title: document.querySelector('#post-title'),
            content: document.querySelector('#post-content'),
            editForm: document.querySelector('#updatePosts'),
            deleteForm: document.querySelector('#deletePosts'),
            editButton: document.querySelector('button[type="submit"]', document.querySelector('#updatePosts')),
            deleteButton: document.querySelector('button[type="submit"]', document.querySelector('#deletePosts')),
            backLink: document.querySelector('.back-to-list'),
            commentSection: document.querySelector('#comment-section'),
            postImage: document.querySelector('.post-image'),
            postMeta: document.querySelectorAll('.post-meta-value'),
            actionButtons: document.querySelector('.post-actions')
        };
    },

    // 이벤트 바인딩
    bindEvents() {
        // 수정 버튼 클릭
        if (this.elements.editForm) {
            this.elements.editForm.addEventListener('submit', this.handleEdit.bind(this));
        }

        // 삭제 버튼 클릭
        if (this.elements.deleteForm) {
            this.elements.deleteForm.addEventListener('submit', this.handleDelete.bind(this));
        }

        // 뒤로가기 링크
        if (this.elements.backLink) {
            this.elements.backLink.addEventListener('click', this.handleBackClick.bind(this));
        }

        // 이미지 클릭 (확대보기)
        if (this.elements.postImage) {
            this.elements.postImage.addEventListener('click', this.handleImageClick.bind(this));
        }

        // 페이지 이탈 경고
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

        // 키보드 이벤트
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // 스크롤 이벤트 (읽기 진행률)
        window.addEventListener('scroll', this.throttle(this.handleScroll.bind(this), 100));
    },

    // CSRF 토큰 설정
    setupCSRF() {
        this.csrfToken = document.querySelector('meta[name="_csrf"]')?.content || '';
        this.csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content || '';
    },

    // 이미지 뷰어 설정
    setupImageViewer() {
        if (!this.elements.postImage) return;

        // 이미지 로딩 처리
        this.elements.postImage.addEventListener('load', () => {
            this.elements.postImage.style.opacity = '1';
        });

        this.elements.postImage.addEventListener('error', () => {
            this.showImageError();
        });
    },

    // 키보드 단축키 설정
    setupKeyboardShortcuts() {
        this.keyboardShortcuts = {
            'e': () => this.elements.editButton?.click(),
            'd': () => this.showDeleteConfirmation(),
            'Escape': () => this.hideDeleteConfirmation(),
            'b': () => this.elements.backLink?.click()
        };
    },

    // 이벤트 핸들러들
    handleEdit(event) {
        event.preventDefault();
        
        // 버튼 애니메이션
        this.animateButton(this.elements.editButton);

        // 수정 페이지로 이동
        const form = event.target;
        const formData = new FormData(form);
        const postId = formData.get('postId');
        const boardId = formData.get('boardId');

        if (postId && boardId) {
            window.location.href = `/board/posts/edit?postId=${postId}&boardId=${boardId}`;
        }
    },

    handleDelete(event) {
        event.preventDefault();
        
        // 삭제 확인 모달 표시
        this.showDeleteConfirmation(event.target);
    },

    confirmDelete(form) {
        this.showLoading(true);

        const formData = new FormData(form);
        const boardId = formData.get('boardId');
        const postId = formData.get('postId');

        // 삭제 API 호출
        fetch(`/api/v1/board/${boardId}/posts/${postId}/deactivate`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                [this.csrfHeader]: this.csrfToken
            },
            body: new URLSearchParams(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            this.showSuccess('게시글이 삭제되었습니다.');
            
            // 2초 후 목록으로 이동
            setTimeout(() => {
                window.location.href = `/board/${boardId}/view`;
            }, 2000);
        })
        .catch(error => {
            console.error('삭제 실패:', error);
            this.showError('삭제 중 오류가 발생했습니다: ' + error.message);
        })
        .finally(() => {
            this.showLoading(false);
            this.hideDeleteConfirmation();
        });
    },

    handleBackClick(event) {
        event.preventDefault();
        
        // 애니메이션과 함께 뒤로가기
        this.animatePageTransition(() => {
            window.history.back();
        });
    },

    handleImageClick(event) {
        event.preventDefault();
        this.openImageModal(event.target);
    },

    handleBeforeUnload(event) {
        if (this.state.unsavedChanges) {
            event.preventDefault();
            event.returnValue = '저장하지 않은 변경사항이 있습니다. 정말 떠나시겠습니까?';
            return event.returnValue;
        }
    },

    handleKeyDown(event) {
        // 모달이 열려있으면 무시
        if (document.querySelector('.modal.show')) return;

        const key = event.key;
        const shortcut = this.keyboardShortcuts[key];

        if (shortcut && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            shortcut();
        }
    },

    handleScroll() {
        this.updateReadingProgress();
    },

    // 삭제 확인 모달
    showDeleteConfirmation(form) {
        const modal = this.createDeleteModal();
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // 확인 버튼 이벤트
        const confirmBtn = modal.querySelector('.confirm-delete');
        const cancelBtn = modal.querySelector('.cancel-delete');

        confirmBtn.addEventListener('click', () => {
            this.confirmDelete(form);
        });

        cancelBtn.addEventListener('click', () => {
            this.hideDeleteConfirmation();
        });

        // ESC 키로 닫기
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideDeleteConfirmation();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    },

    hideDeleteConfirmation() {
        const modal = document.querySelector('.delete-confirmation-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    },

    createDeleteModal() {
        const modal = document.createElement('div');
        modal.className = 'delete-confirmation-modal modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>게시글 삭제</h3>
                </div>
                <div class="modal-body">
                    <p>이 게시글을 정말 삭제하시겠습니까?</p>
                    <p class="warning-text">삭제된 게시글은 복구할 수 없습니다.</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="cancel-delete">취소</button>
                    <button type="button" class="confirm-delete">삭제</button>
                </div>
            </div>
        `;

        // 모달 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .delete-confirmation-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .delete-confirmation-modal.show {
                opacity: 1;
            }
            
            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }
            
            .modal-content {
                position: relative;
                background: var(--background-primary);
                border-radius: var(--border-radius-large);
                padding: var(--spacing-xl);
                max-width: 400px;
                width: 90%;
                box-shadow: var(--shadow-card);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .delete-confirmation-modal.show .modal-content {
                transform: scale(1);
            }
            
            .modal-header h3 {
                margin: 0 0 var(--spacing-md) 0;
                color: var(--label-primary);
                text-align: center;
            }
            
            .modal-body p {
                margin: 0 0 var(--spacing-sm) 0;
                color: var(--label-secondary);
                text-align: center;
            }
            
            .warning-text {
                color: var(--system-red) !important;
                font-size: 14px;
            }
            
            .modal-actions {
                display: flex;
                gap: var(--spacing-md);
                margin-top: var(--spacing-lg);
                justify-content: center;
            }
            
            .modal-actions button {
                padding: 10px 20px;
                border-radius: var(--border-radius-medium);
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .cancel-delete {
                background: var(--system-gray5);
                color: var(--label-primary);
            }
            
            .confirm-delete {
                background: var(--system-red);
                color: white;
            }
            
            .cancel-delete:hover {
                background: var(--system-gray4);
            }
            
            .confirm-delete:hover {
                background: #D70015;
            }
        `;
        
        if (!document.querySelector('#delete-modal-styles')) {
            style.id = 'delete-modal-styles';
            document.head.appendChild(style);
        }

        return modal;
    },

    // 이미지 모달
    openImageModal(img) {
        const modal = document.createElement('div');
        modal.className = 'image-modal modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="image-modal-content">
                <img src="${img.src}" alt="${img.alt}" />
                <button class="close-modal">&times;</button>
            </div>
        `;

        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // 닫기 이벤트
        const closeBtn = modal.querySelector('.close-modal');
        const backdrop = modal.querySelector('.modal-backdrop');

        [closeBtn, backdrop].forEach(element => {
            element.addEventListener('click', () => {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
            });
        });
    },

    // 읽기 진행률 업데이트
    updateReadingProgress() {
        const contentElement = this.elements.content;
        if (!contentElement) return;

        const scrollTop = window.pageYOffset;
        const contentTop = contentElement.offsetTop;
        const contentHeight = contentElement.offsetHeight;
        const windowHeight = window.innerHeight;

        const progress = Math.min(100, Math.max(0, 
            ((scrollTop - contentTop + windowHeight) / contentHeight) * 100
        ));

        // 진행률 표시 (필요한 경우)
        this.showReadingProgress(progress);
    },

    showReadingProgress(progress) {
        let progressBar = document.querySelector('.reading-progress');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.className = 'reading-progress';
            progressBar.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: var(--primary-blue);
                z-index: 999;
                transition: width 0.1s ease;
            `;
            document.body.appendChild(progressBar);
        }

        progressBar.style.width = `${progress}%`;
    },

    // 유틸리티 함수들
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    animateButton(button) {
        if (!button) return;
        
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    },

    animatePageTransition(callback) {
        if (this.elements.container) {
            this.elements.container.style.opacity = '0.8';
            this.elements.container.style.transform = 'translateX(-20px)';
        }
        
        setTimeout(callback, 200);
    },

    showImageError() {
        if (this.elements.postImage) {
            this.elements.postImage.style.display = 'none';
            
            const errorMsg = document.createElement('div');
            errorMsg.className = 'image-error';
            errorMsg.textContent = '이미지를 불러올 수 없습니다.';
            errorMsg.style.cssText = `
                padding: var(--spacing-lg);
                text-align: center;
                color: var(--label-tertiary);
                background: var(--background-secondary);
                border-radius: var(--border-radius-medium);
            `;
            
            this.elements.postImage.parentNode.appendChild(errorMsg);
        }
    },

    // 상태 관리
    showLoading(show) {
        this.state.isLoading = show;
        
        if (this.elements.container) {
            this.elements.container.classList.toggle('loading', show);
        }

        // 버튼 비활성화
        if (this.elements.actionButtons) {
            const buttons = this.elements.actionButtons.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.disabled = show;
            });
        }
    },

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        this.elements.container?.prepend(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        this.elements.container?.prepend(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    },

    // 댓글 관련 (향후 확장)
    initCommentSystem() {
        if (this.elements.commentSection) {
            // 댓글 시스템 초기화
            console.log('Comment system initialized');
        }
    }
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    BoardSkin.PostSkin.Detail.init();
});

// 전역 함수로 노출
window.PostDetail = BoardSkin.PostSkin.Detail; 
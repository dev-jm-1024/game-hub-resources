// 댓글 신고 기능 전용 JavaScript

// 네임스페이스 정의
window.BoardSkin = window.BoardSkin || {};
window.BoardSkin.CommentSkin = window.BoardSkin.CommentSkin || {};

BoardSkin.CommentSkin.Report = {
    // 설정
    config: {
        animationDuration: 300,
        confirmationDelay: 2000,
        maxNotificationStack: 3
    },

    // 상태
    state: {
        isReporting: {},  // 댓글별 신고 진행 상태 {commentId: boolean}
        reportedComments: new Set(), // 신고한 댓글 ID들
        isLoggedIn: false,
        activeNotifications: []
    },

    // DOM 요소
    elements: {
        commentSection: null,
        commentList: null
    },

    // 초기화
    init() {
        this.cacheElements();
        this.setupCSRF();
        this.loadInitialData();
        this.bindEvents();
        this.createReportButtons();

        console.log('BoardSkin.CommentSkin.Report initialized');
    },

    // DOM 요소 캐싱
    cacheElements() {
        this.elements = {
            commentSection: document.querySelector('#comment-section'),
            commentList: document.querySelector('.comment-list, .comment-view, [data-comment-list]')
        };
    },

    // CSRF 토큰 설정
    setupCSRF() {
        this.csrfToken = document.querySelector('meta[name="_csrf"]')?.content || '';
        this.csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content || '';
    },

    // 초기 데이터 로드
    loadInitialData() {
        // 로그인 상태 확인
        this.state.isLoggedIn = window.postDetailData?.isLoggedIn || false;

        // 서버에서 전달받은 댓글 신고 상태 로드
        if (window.userCommentReportMap) {
            Object.keys(window.userCommentReportMap).forEach(commentId => {
                if (window.userCommentReportMap[commentId]) {
                    this.state.reportedComments.add(parseInt(commentId));
                }
            });
        }

        console.log('댓글 신고 시스템 초기화 - isLoggedIn:', this.state.isLoggedIn, 'reportedComments:', Array.from(this.state.reportedComments));
    },

    // 이벤트 바인딩
    bindEvents() {
        if (!this.elements.commentSection) return;

        // 댓글 섹션에서 신고 버튼 클릭 이벤트 위임
        this.elements.commentSection.addEventListener('click', (e) => {
            const reportButton = e.target.closest('.comment-report-button');
            if (reportButton) {
                e.preventDefault();
                const commentId = parseInt(reportButton.getAttribute('data-comment-id'));
                this.handleReportClick(commentId);
            }
        });

        // 키보드 단축키 (댓글에 포커스된 상태에서 Ctrl+Shift+R로 신고)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R' && this.state.isLoggedIn) {
                e.preventDefault();
                // 현재 포커스된 댓글의 신고 버튼을 찾아서 실행
                const focusedComment = document.activeElement.closest('.comment-item, [data-comment-id]');
                if (focusedComment) {
                    const commentId = parseInt(focusedComment.getAttribute('data-comment-id'));
                    if (commentId) {
                        this.handleReportClick(commentId);
                    }
                }
            }
        });
    },

    // 댓글 신고 버튼 생성
    createReportButtons() {
        if (!this.state.isLoggedIn) {
            console.log('로그인하지 않아서 댓글 신고 버튼을 생성하지 않습니다.');
            return;
        }

        // 신고 버튼 스타일 추가
        this.addReportButtonStyles();

        // 모든 댓글에 신고 버튼 추가
        this.addReportButtonsToComments();
    },

    // 댓글 신고 버튼 스타일 추가
    addReportButtonStyles() {
        if (document.querySelector('#comment-report-styles')) return;

        const style = document.createElement('style');
        style.id = 'comment-report-styles';
        style.textContent = `
            .comment-report-button {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                font-size: 12px;
                color: #dc3545;
                background-color: transparent;
                border: 1px solid #dc3545;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-left: 8px;
                opacity: 0.7;
            }

            .comment-report-button:hover {
                background-color: #dc3545;
                color: white;
                opacity: 1;
                transform: translateY(-1px);
            }

            .comment-report-button:disabled {
                opacity: 0.4;
                cursor: not-allowed;
                transform: none;
            }

            .comment-report-button.reported {
                background-color: #6c757d;
                border-color: #6c757d;
                color: white;
                opacity: 0.8;
            }

            .comment-report-button.reported:hover {
                background-color: #5a6268;
                border-color: #5a6268;
                opacity: 1;
            }

            .comment-report-icon {
                font-size: 10px;
            }

            .comment-report-text {
                font-weight: 500;
            }

            /* 신고 완료 애니메이션 */
            @keyframes commentReportSuccess {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .comment-report-button.success-animation {
                animation: commentReportSuccess 0.4s ease;
            }

            /* 댓글 영역에서 신고 버튼 위치 조정 */
            .comment-actions {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 8px;
            }

            .comment-meta {
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                gap: 8px;
            }
        `;

        document.head.appendChild(style);
    },

    // 모든 댓글에 신고 버튼 추가
    addReportButtonsToComments() {
        // 댓글 요소들을 찾기 (다양한 클래스명 대응)
        const commentElements = document.querySelectorAll(
            '.comment-item, [data-comment-id], .comment-content, .comment-wrapper'
        );

        commentElements.forEach(commentElement => {
            const commentId = this.extractCommentId(commentElement);
            if (commentId && !commentElement.querySelector('.comment-report-button')) {
                this.addReportButtonToComment(commentElement, commentId);
            }
        });
    },

    // 댓글 ID 추출
    extractCommentId(element) {
        // data-comment-id 속성에서 추출
        let commentId = element.getAttribute('data-comment-id');
        if (commentId) return parseInt(commentId);

        // 다른 방법으로 댓글 ID 찾기
        const idElement = element.querySelector('[data-comment-id]');
        if (idElement) {
            return parseInt(idElement.getAttribute('data-comment-id'));
        }

        // 좋아요/싫어요 버튼에서 댓글 ID 추출
        const likeButton = element.querySelector('.comment-like-button, [data-comment-id]');
        if (likeButton) {
            commentId = likeButton.getAttribute('data-comment-id');
            if (commentId) return parseInt(commentId);
        }

        return null;
    },

    // 개별 댓글에 신고 버튼 추가
    addReportButtonToComment(commentElement, commentId) {
        const isReported = this.state.reportedComments.has(commentId);

        // 신고 버튼 생성
        const reportButton = document.createElement('button');
        reportButton.type = 'button';
        reportButton.className = 'comment-report-button';
        reportButton.setAttribute('data-comment-id', commentId);

        if (isReported) {
            reportButton.classList.add('reported');
            reportButton.disabled = true;
            reportButton.innerHTML = `
                <span class="comment-report-icon">✅</span>
                <span class="comment-report-text">신고완료</span>
            `;
        } else {
            reportButton.innerHTML = `
                <span class="comment-report-icon">🚨</span>
                <span class="comment-report-text">신고</span>
            `;
        }

        // 버튼을 적절한 위치에 추가
        this.insertReportButtonToComment(commentElement, reportButton);
    },

    // 댓글에 신고 버튼 삽입
    insertReportButtonToComment(commentElement, reportButton) {
        // 1순위: .comment-actions 또는 .comment-meta 요소가 있으면 그 안에
        let targetElement = commentElement.querySelector('.comment-actions, .comment-meta');

        if (targetElement) {
            targetElement.appendChild(reportButton);
            return;
        }

        // 2순위: 좋아요/싫어요 버튼이 있는 영역에
        const reactionButtons = commentElement.querySelector('.comment-like-button, .comment-dislike-button');
        if (reactionButtons) {
            const parent = reactionButtons.parentElement;
            parent.appendChild(reportButton);
            return;
        }

        // 3순위: 댓글 메타 정보 영역에 (작성자, 시간 등)
        targetElement = commentElement.querySelector('.comment-header, .comment-info');
        if (targetElement) {
            targetElement.appendChild(reportButton);
            return;
        }

        // 4순위: 댓글 요소 마지막에
        commentElement.appendChild(reportButton);
    },

    // 신고 클릭 핸들러
    async handleReportClick(commentId) {
        if (!this.state.isLoggedIn) {
            this.showNotification('로그인이 필요합니다.', 'warning');
            return;
        }

        if (!commentId) {
            this.showNotification('댓글 정보를 찾을 수 없습니다.', 'error');
            return;
        }

        if (this.state.isReporting[commentId]) {
            return; // 이미 신고 처리 중
        }

        if (this.state.reportedComments.has(commentId)) {
            this.showNotification('이미 신고한 댓글입니다.', 'warning');
            return;
        }

        // 신고 확인 모달 표시
        this.showReportConfirmation(commentId);
    },

    // 신고 확인 모달 표시
    showReportConfirmation(commentId) {
        const modal = this.createReportModal(commentId);
        document.body.appendChild(modal);

        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // 확인 버튼 이벤트
        const confirmBtn = modal.querySelector('.confirm-comment-report');
        const cancelBtn = modal.querySelector('.cancel-comment-report');

        confirmBtn.addEventListener('click', () => {
            this.confirmReport(commentId);
            this.hideReportConfirmation();
        });

        cancelBtn.addEventListener('click', () => {
            this.hideReportConfirmation();
        });

        // ESC 키로 닫기
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideReportConfirmation();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    },

    // 신고 확인 모달 숨기기
    hideReportConfirmation() {
        const modal = document.querySelector('.comment-report-confirmation-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    },

    // 신고 확인 모달 생성
    createReportModal(commentId) {
        const modal = document.createElement('div');
        modal.className = 'comment-report-confirmation-modal modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>댓글 신고</h3>
                </div>
                <div class="modal-body">
                    <p>이 댓글을 신고하시겠습니까?</p>
                    <p class="info-text">신고는 취소할 수 없으며, 관리자가 검토합니다.</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="cancel-comment-report">취소</button>
                    <button type="button" class="confirm-comment-report">신고하기</button>
                </div>
            </div>
        `;

        // 모달 스타일 추가
        this.addReportModalStyles();

        return modal;
    },

    // 신고 모달 스타일 추가
    addReportModalStyles() {
        if (document.querySelector('#comment-report-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'comment-report-modal-styles';
        style.textContent = `
            .comment-report-confirmation-modal {
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
            
            .comment-report-confirmation-modal.show {
                opacity: 1;
            }
            
            .comment-report-confirmation-modal .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }
            
            .comment-report-confirmation-modal .modal-content {
                position: relative;
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 380px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .comment-report-confirmation-modal.show .modal-content {
                transform: scale(1);
            }
            
            .comment-report-confirmation-modal .modal-header h3 {
                margin: 0 0 16px 0;
                color: #dc3545;
                text-align: center;
                font-size: 17px;
            }
            
            .comment-report-confirmation-modal .modal-body p {
                margin: 0 0 8px 0;
                color: #333;
                text-align: center;
                line-height: 1.5;
                font-size: 15px;
            }
            
            .comment-report-confirmation-modal .info-text {
                color: #666 !important;
                font-size: 13px;
            }
            
            .comment-report-confirmation-modal .modal-actions {
                display: flex;
                gap: 12px;
                margin-top: 20px;
                justify-content: center;
            }
            
            .comment-report-confirmation-modal .modal-actions button {
                padding: 9px 18px;
                border-radius: 6px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 13px;
            }
            
            .comment-report-confirmation-modal .cancel-comment-report {
                background: #f8f9fa;
                color: #6c757d;
                border: 1px solid #dee2e6;
            }
            
            .comment-report-confirmation-modal .confirm-comment-report {
                background: #dc3545;
                color: white;
            }
            
            .comment-report-confirmation-modal .cancel-comment-report:hover {
                background: #e9ecef;
            }
            
            .comment-report-confirmation-modal .confirm-comment-report:hover {
                background: #c82333;
            }
        `;

        document.head.appendChild(style);
    },

    // 신고 확정 처리
    async confirmReport(commentId) {
        if (this.state.isReporting[commentId]) return;

        this.state.isReporting[commentId] = true;
        const reportButton = document.querySelector(`[data-comment-id="${commentId}"].comment-report-button`);

        try {
            // 버튼 상태 변경
            if (reportButton) {
                reportButton.disabled = true;
                reportButton.querySelector('.comment-report-text').textContent = '신고중...';
            }

            // API 호출
            const response = await fetch(`/api/v1/board/posts/comments/${commentId}/reactions/report`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    [this.csrfHeader]: this.csrfToken
                }
            });

            const resultText = await response.text();

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('이미 신고한 댓글입니다.');
                } else if (response.status === 400) {
                    throw new Error('자신의 댓글은 신고할 수 없습니다.');
                } else if (response.status === 401) {
                    throw new Error('로그인이 필요합니다.');
                } else if (response.status === 404) {
                    throw new Error('댓글이 존재하지 않습니다.');
                } else {
                    throw new Error(resultText || `서버 오류 (${response.status})`);
                }
            }

            // 신고 성공 처리
            this.handleReportSuccess(commentId, reportButton);
            this.showNotification('댓글 신고가 접수되었습니다.', 'success');

            console.log('댓글 신고 처리 성공:', resultText);

        } catch (error) {
            console.error('댓글 신고 처리 실패:', error);
            this.showNotification('댓글 신고 실패: ' + error.message, 'error');

            // 버튼 상태 복원
            if (reportButton) {
                reportButton.disabled = false;
                reportButton.querySelector('.comment-report-text').textContent = '신고';
            }
        } finally {
            this.state.isReporting[commentId] = false;
        }
    },

    // 신고 성공 처리
    handleReportSuccess(commentId, reportButton) {
        if (!reportButton) return;

        // 상태 업데이트
        this.state.reportedComments.add(commentId);

        // 버튼 상태 변경
        reportButton.classList.add('reported', 'success-animation');
        reportButton.disabled = true;
        reportButton.querySelector('.comment-report-icon').textContent = '✅';
        reportButton.querySelector('.comment-report-text').textContent = '신고완료';

        // 애니메이션 클래스 제거
        setTimeout(() => {
            reportButton.classList.remove('success-animation');
        }, 400);
    },

    // 사용자 친화적인 알림 표시 함수
    showNotification(message, type = 'info') {
        // 알림 스택 관리
        if (this.state.activeNotifications.length >= this.config.maxNotificationStack) {
            const oldestNotification = this.state.activeNotifications.shift();
            this.hideNotification(oldestNotification);
        }

        // 알림 요소 생성
        const notification = document.createElement('div');
        notification.className = `comment-report-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="알림 닫기">×</button>
            </div>
        `;

        // 알림 스타일 적용
        this.applyNotificationStyles(notification, type);

        // 스택 위치 계산
        const stackOffset = this.state.activeNotifications.length * 60;
        notification.style.top = `${20 + stackOffset}px`;

        // 내부 요소 이벤트 바인딩
        this.bindNotificationEvents(notification);

        // DOM에 추가
        document.body.appendChild(notification);
        this.state.activeNotifications.push(notification);

        // 애니메이션으로 나타나기
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);

        // 자동으로 사라지기
        setTimeout(() => {
            this.hideNotification(notification);
        }, type === 'error' ? 6000 : 4000);
    },

    // 알림 스타일 적용
    applyNotificationStyles(notification, type) {
        const styles = {
            position: 'fixed',
            right: '20px',
            padding: '12px 16px',
            borderRadius: '8px',
            color: 'white',
            fontSize: '13px',
            zIndex: '10000',
            maxWidth: '350px',
            minWidth: '280px',
            wordWrap: 'break-word',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease-in-out',
            opacity: '0',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        };

        const typeColors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8'
        };

        Object.assign(notification.style, styles);
        notification.style.backgroundColor = typeColors[type] || typeColors.info;

        if (type === 'warning') {
            notification.style.color = '#212529';
        }
    },

    // 알림 이벤트 바인딩
    bindNotificationEvents(notification) {
        const closeButton = notification.querySelector('.notification-close');
        const content = notification.querySelector('.notification-content');

        // 내부 콘텐츠 스타일
        Object.assign(content.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        });

        // 닫기 버튼 스타일
        Object.assign(closeButton.style, {
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0',
            marginLeft: 'auto',
            opacity: '0.7',
            lineHeight: '1'
        });

        closeButton.addEventListener('mouseenter', () => closeButton.style.opacity = '1');
        closeButton.addEventListener('mouseleave', () => closeButton.style.opacity = '0.7');
        closeButton.addEventListener('click', () => this.hideNotification(notification));

        // 클릭하면 즉시 사라지기
        notification.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                this.hideNotification(notification);
            }
        });
    },

    // 알림 숨기기 함수
    hideNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';

            // 스택에서 제거
            const index = this.state.activeNotifications.indexOf(notification);
            if (index > -1) {
                this.state.activeNotifications.splice(index, 1);
            }

            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);

            // 남은 알림들 위치 재조정
            this.repositionNotifications();
        }
    },

    // 알림 위치 재조정
    repositionNotifications() {
        this.state.activeNotifications.forEach((notification, index) => {
            const stackOffset = index * 60;
            notification.style.top = `${20 + stackOffset}px`;
        });
    },

    // 타입별 아이콘 반환
    getNotificationIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || icons.info;
    }
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 서버에서 전달된 댓글 신고 데이터를 전역 변수로 설정
    if (typeof userCommentReportMap !== 'undefined') {
        window.userCommentReportMap = userCommentReportMap;
    }

    BoardSkin.CommentSkin.Report.init();
});

// 댓글 목록이 동적으로 업데이트될 때 신고 버튼 재생성을 위한 함수
window.refreshCommentReportButtons = function() {
    if (BoardSkin.CommentSkin.Report.state.isLoggedIn) {
        BoardSkin.CommentSkin.Report.addReportButtonsToComments();
    }
};

// 전역 함수로 노출
window.CommentReport = BoardSkin.CommentSkin.Report;
// 게시글 신고 기능 전용 JavaScript

// 네임스페이스 정의
window.BoardSkin = window.BoardSkin || {};
window.BoardSkin.PostSkin = window.BoardSkin.PostSkin || {};

BoardSkin.PostSkin.Report = {
    // 설정
    config: {
        animationDuration: 300,
        confirmationDelay: 2000
    },

    // 상태
    state: {
        isReporting: false,
        isReported: false,
        postId: null,
        isLoggedIn: false
    },

    // DOM 요소
    elements: {},

    // 초기화
    init() {
        this.cacheElements();
        this.setupCSRF();
        this.loadInitialData();
        this.bindEvents();
        this.createReportButton();

        console.log('BoardSkin.PostSkin.Report initialized');
    },

    // DOM 요소 캐싱
    cacheElements() {
        this.elements = {
            container: document.querySelector('.post-detail-container'),
            postActions: document.querySelector('.post-actions'),
            navigationActions: document.querySelector('.navigation-actions'),
            postReactions: document.querySelector('.post-reactions')
        };
    },

    // CSRF 토큰 설정
    setupCSRF() {
        this.csrfToken = document.querySelector('meta[name="_csrf"]')?.content || '';
        this.csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content || '';
    },

    // 초기 데이터 로드
    loadInitialData() {
        if (!window.postDetailData) {
            console.log('postDetailData가 없습니다 - 신고 기능 비활성화');
            return;
        }

        const { postId, isLoggedIn, isUserReported } = window.postDetailData;
        this.state.postId = postId;
        this.state.isLoggedIn = isLoggedIn;
        this.state.isReported = isUserReported || false;

        console.log('신고 시스템 초기화 - postId:', this.state.postId, 'isLoggedIn:', this.state.isLoggedIn, 'isReported:', this.state.isReported);
    },

    // 이벤트 바인딩
    bindEvents() {
        // 문서 전체에서 신고 버튼 클릭 이벤트 위임
        document.addEventListener('click', (e) => {
            if (e.target.closest('.report-button')) {
                e.preventDefault();
                this.handleReportClick();
            }
        });

        // 키보드 단축키 (Ctrl+R로 신고)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'r' && this.state.isLoggedIn) {
                e.preventDefault();
                this.handleReportClick();
            }
        });
    },

    // 신고 버튼 생성
    createReportButton() {
        if (!this.state.isLoggedIn || !this.state.postId) {
            console.log('로그인하지 않았거나 postId가 없어서 신고 버튼을 생성하지 않습니다.');
            return;
        }

        // 신고 버튼 생성
        const reportButton = document.createElement('button');
        reportButton.type = 'button';
        reportButton.className = 'report-button';

        // 이미 신고한 경우 초기 상태 설정
        if (this.state.isReported) {
            reportButton.classList.add('reported');
            reportButton.disabled = true;
            reportButton.innerHTML = `
                <span class="report-icon">✅</span>
                <span class="report-text">신고 완료</span>
            `;
        } else {
            reportButton.innerHTML = `
                <span class="report-icon">🚨</span>
                <span class="report-text">신고하기</span>
            `;
        }

        // 신고 버튼 스타일 추가
        this.addReportButtonStyles();

        // 버튼을 적절한 위치에 추가
        this.insertReportButton(reportButton);
    },

    // 신고 버튼 스타일 추가
    addReportButtonStyles() {
        if (document.querySelector('#report-button-styles')) return;

        const style = document.createElement('style');
        style.id = 'report-button-styles';
        style.textContent = `
            .report-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                font-size: 14px;
                color: #dc3545;
                background-color: transparent;
                border: 2px solid #dc3545;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 10px;
            }

            .report-button:hover {
                background-color: #dc3545;
                color: white;
                transform: translateY(-1px);
            }

            .report-button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .report-button.reported {
                background-color: #6c757d;
                border-color: #6c757d;
                color: white;
            }

            .report-button.reported:hover {
                background-color: #5a6268;
                border-color: #5a6268;
            }

            .report-icon {
                font-size: 16px;
            }

            .report-text {
                font-weight: 500;
            }

            /* 신고 완료 애니메이션 */
            @keyframes reportSuccess {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .report-button.success-animation {
                animation: reportSuccess 0.5s ease;
            }
        `;

        document.head.appendChild(style);
    },

    // 신고 버튼을 적절한 위치에 삽입
    insertReportButton(reportButton) {
        // 1순위: post-reactions 영역이 있으면 그 뒤에
        if (this.elements.postReactions) {
            const reportContainer = document.createElement('div');
            reportContainer.className = 'report-container';
            reportContainer.style.cssText = 'text-align: center; margin: 15px 0;';
            reportContainer.appendChild(reportButton);

            this.elements.postReactions.insertAdjacentElement('afterend', reportContainer);
            return;
        }

        // 2순위: navigation-actions 영역이 있으면 그 앞에
        if (this.elements.navigationActions) {
            const reportContainer = document.createElement('div');
            reportContainer.className = 'report-container';
            reportContainer.style.cssText = 'text-align: center; margin: 15px 0;';
            reportContainer.appendChild(reportButton);

            this.elements.navigationActions.insertAdjacentElement('beforebegin', reportContainer);
            return;
        }

        // 3순위: 컨테이너 마지막에
        if (this.elements.container) {
            const reportContainer = document.createElement('div');
            reportContainer.className = 'report-container';
            reportContainer.style.cssText = 'text-align: center; margin: 15px 0;';
            reportContainer.appendChild(reportButton);

            this.elements.container.appendChild(reportContainer);
        }
    },

    // 신고 클릭 핸들러
    async handleReportClick() {
        if (!this.state.isLoggedIn) {
            this.showError('로그인이 필요합니다.');
            return;
        }

        if (!this.state.postId) {
            this.showError('게시물 정보를 찾을 수 없습니다.');
            return;
        }

        if (this.state.isReporting) {
            return; // 이미 신고 처리 중
        }

        if (this.state.isReported) {
            this.showError('이미 신고한 게시물입니다.');
            return;
        }

        // 신고 확인 모달 표시
        this.showReportConfirmation();
    },

    // 신고 확인 모달 표시
    showReportConfirmation() {
        const modal = this.createReportModal();
        document.body.appendChild(modal);

        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // 확인 버튼 이벤트
        const confirmBtn = modal.querySelector('.confirm-report');
        const cancelBtn = modal.querySelector('.cancel-report');

        confirmBtn.addEventListener('click', () => {
            this.confirmReport();
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
        const modal = document.querySelector('.report-confirmation-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    },

    // 신고 확인 모달 생성
    createReportModal() {
        const modal = document.createElement('div');
        modal.className = 'report-confirmation-modal modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>게시글 신고</h3>
                </div>
                <div class="modal-body">
                    <p>이 게시글을 신고하시겠습니까?</p>
                    <p class="info-text">신고는 취소할 수 없으며, 관리자가 검토합니다.</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="cancel-report">취소</button>
                    <button type="button" class="confirm-report">신고하기</button>
                </div>
            </div>
        `;

        // 모달 스타일 추가
        this.addReportModalStyles();

        return modal;
    },

    // 신고 모달 스타일 추가
    addReportModalStyles() {
        if (document.querySelector('#report-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'report-modal-styles';
        style.textContent = `
            .report-confirmation-modal {
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
            
            .report-confirmation-modal.show {
                opacity: 1;
            }
            
            .report-confirmation-modal .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }
            
            .report-confirmation-modal .modal-content {
                position: relative;
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            
            .report-confirmation-modal.show .modal-content {
                transform: scale(1);
            }
            
            .report-confirmation-modal .modal-header h3 {
                margin: 0 0 16px 0;
                color: #dc3545;
                text-align: center;
                font-size: 18px;
            }
            
            .report-confirmation-modal .modal-body p {
                margin: 0 0 8px 0;
                color: #333;
                text-align: center;
                line-height: 1.5;
            }
            
            .report-confirmation-modal .info-text {
                color: #666 !important;
                font-size: 14px;
            }
            
            .report-confirmation-modal .modal-actions {
                display: flex;
                gap: 12px;
                margin-top: 20px;
                justify-content: center;
            }
            
            .report-confirmation-modal .modal-actions button {
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
                border: none;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
            }
            
            .report-confirmation-modal .cancel-report {
                background: #f8f9fa;
                color: #6c757d;
                border: 1px solid #dee2e6;
            }
            
            .report-confirmation-modal .confirm-report {
                background: #dc3545;
                color: white;
            }
            
            .report-confirmation-modal .cancel-report:hover {
                background: #e9ecef;
            }
            
            .report-confirmation-modal .confirm-report:hover {
                background: #c82333;
            }
        `;

        document.head.appendChild(style);
    },

    // 신고 확정 처리
    async confirmReport() {
        if (this.state.isReporting) return;

        this.state.isReporting = true;
        const reportButton = document.querySelector('.report-button');

        try {
            // 버튼 상태 변경
            if (reportButton) {
                reportButton.disabled = true;
                reportButton.querySelector('.report-text').textContent = '신고 중...';
            }

            // API 호출
            const response = await fetch(`/api/v1/board/posts/${this.state.postId}/reactions/report`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    [this.csrfHeader]: this.csrfToken
                }
            });

            const resultText = await response.text();

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('이미 신고한 게시물입니다.');
                } else if (response.status === 400) {
                    throw new Error('자신의 게시물은 신고할 수 없습니다.');
                } else if (response.status === 401) {
                    throw new Error('로그인이 필요합니다.');
                } else if (response.status === 404) {
                    throw new Error('게시물이 존재하지 않습니다.');
                } else {
                    throw new Error(resultText || `서버 오류 (${response.status})`);
                }
            }

            // 신고 성공 처리
            this.handleReportSuccess(reportButton);
            this.showSuccess('신고가 접수되었습니다.');

            console.log('신고 처리 성공:', resultText);

        } catch (error) {
            console.error('신고 처리 실패:', error);
            this.showError('신고 처리 실패: ' + error.message);

            // 버튼 상태 복원
            if (reportButton) {
                reportButton.disabled = false;
                reportButton.querySelector('.report-text').textContent = '신고하기';
            }
        } finally {
            this.state.isReporting = false;
        }
    },

    // 신고 성공 처리
    handleReportSuccess(reportButton) {
        if (!reportButton) return;

        this.state.isReported = true;

        // 버튼 상태 변경
        reportButton.classList.add('reported', 'success-animation');
        reportButton.disabled = true;
        reportButton.querySelector('.report-icon').textContent = '✅';
        reportButton.querySelector('.report-text').textContent = '신고 완료';

        // 애니메이션 클래스 제거
        setTimeout(() => {
            reportButton.classList.remove('success-animation');
        }, 500);
    },

    // 성공 메시지 표시
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'report-success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
            animation: slideInRight 0.3s ease;
        `;

        // 애니메이션 CSS 추가
        if (!document.querySelector('#report-animation-styles')) {
            const animStyle = document.createElement('style');
            animStyle.id = 'report-animation-styles';
            animStyle.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(animStyle);
        }

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => successDiv.remove(), 300);
        }, this.config.confirmationDelay);
    },

    // 에러 메시지 표시
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'report-error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1001;
            box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => errorDiv.remove(), 300);
        }, 3000);
    }
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    BoardSkin.PostSkin.Report.init();
});

// 전역 함수로 노출
window.PostDetailReport = BoardSkin.PostSkin.Report;
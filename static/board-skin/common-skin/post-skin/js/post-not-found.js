// Apple macOS/iOS 스타일 게시글 없음 에러 페이지 JavaScript

// 네임스페이스 정의
window.PostSkin = window.PostSkin || {};

PostSkin.NotFound = {
    // 설정
    config: {
        animationDuration: 300,
        retryInterval: 5000, // 5초
        maxRetries: 3,
        redirectDelay: 10000 // 10초
    },

    // 상태
    state: {
        retryCount: 0,
        isRetrying: false,
        redirectTimer: null,
        errorType: 'not-found' // not-found, deleted, private, server-error
    },

    // DOM 요소
    elements: {},

    // 초기화
    init() {
        this.cacheElements();
        this.detectErrorType();
        this.bindEvents();
        this.setupAnimations();
        this.startRedirectTimer();
        
        console.log('PostSkin.NotFound initialized');
    },

    // DOM 요소 캐싱
    cacheElements() {
        this.elements = {
            container: document.querySelector('.error-container'),
            card: document.querySelector('.error-card'),
            icon: document.querySelector('.error-icon'),
            title: document.querySelector('.error-title'),
            message: document.querySelector('.error-message'),
            code: document.querySelector('.error-code'),
            actions: document.querySelector('.error-actions'),
            primaryButton: document.querySelector('.primary-button'),
            secondaryButton: document.querySelector('.secondary-button'),
            tertiaryButton: document.querySelector('.tertiary-button'),
            details: document.querySelector('.error-details'),
            suggestions: document.querySelector('.error-suggestions')
        };
    },

    // 에러 타입 감지
    detectErrorType() {
        // URL이나 에러 메시지를 기반으로 에러 타입 결정
        const url = window.location.pathname;
        const errorMessage = this.elements.message?.textContent || '';
        
        if (errorMessage.includes('삭제') || errorMessage.includes('delete')) {
            this.state.errorType = 'deleted';
        } else if (errorMessage.includes('권한') || errorMessage.includes('private')) {
            this.state.errorType = 'private';
        } else if (errorMessage.includes('서버') || errorMessage.includes('server')) {
            this.state.errorType = 'server-error';
        } else {
            this.state.errorType = 'not-found';
        }

        this.updateErrorDisplay();
    },

    // 이벤트 바인딩
    bindEvents() {
        // 기본 버튼 (게시판 목록으로)
        if (this.elements.primaryButton) {
            this.elements.primaryButton.addEventListener('click', this.handlePrimaryAction.bind(this));
        }

        // 뒤로가기 버튼
        if (this.elements.secondaryButton) {
            this.elements.secondaryButton.addEventListener('click', this.handleSecondaryAction.bind(this));
        }

        // 홈으로 가기 버튼
        if (this.elements.tertiaryButton) {
            this.elements.tertiaryButton.addEventListener('click', this.handleTertiaryAction.bind(this));
        }

        // 키보드 단축키
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // 페이지 가시성 변경 (탭 전환 감지)
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // 온라인/오프라인 상태 변경
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
    },

    // 애니메이션 설정
    setupAnimations() {
        if (!this.elements.card) return;

        // 카드 등장 애니메이션
        this.elements.card.style.opacity = '0';
        this.elements.card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            this.elements.card.style.transition = 'all 0.6s ease-out';
            this.elements.card.style.opacity = '1';
            this.elements.card.style.transform = 'translateY(0)';
        }, 100);

        // 아이콘 애니메이션
        if (this.elements.icon) {
            this.startIconAnimation();
        }
    },

    // 아이콘 애니메이션 시작
    startIconAnimation() {
        const icon = this.elements.icon;
        if (!icon) return;

        // 플로팅 애니메이션
        icon.style.animation = 'float 3s ease-in-out infinite';
        
        // 주기적으로 아이콘 변경 (서버 에러의 경우)
        if (this.state.errorType === 'server-error') {
            setInterval(() => {
                icon.style.animation = 'spin 1s linear';
                setTimeout(() => {
                    icon.style.animation = 'float 3s ease-in-out infinite';
                }, 1000);
            }, 10000);
        }
    },

    // 리다이렉트 타이머 시작
    startRedirectTimer() {
        if (this.state.errorType === 'server-error') {
            // 서버 에러는 자동 리다이렉트하지 않음
            return;
        }

        let countdown = this.config.redirectDelay / 1000;
        
        const countdownElement = document.createElement('div');
        countdownElement.className = 'redirect-countdown';
        countdownElement.textContent = `${countdown}초 후 게시판 목록으로 이동합니다.`;
        
        if (this.elements.details) {
            this.elements.details.appendChild(countdownElement);
        }

        this.state.redirectTimer = setInterval(() => {
            countdown--;
            countdownElement.textContent = `${countdown}초 후 게시판 목록으로 이동합니다.`;
            
            if (countdown <= 0) {
                clearInterval(this.state.redirectTimer);
                this.redirectToBoards();
            }
        }, 1000);
    },

    // 에러 표시 업데이트
    updateErrorDisplay() {
        if (!this.elements.card) return;

        // 에러 타입별 클래스 추가
        this.elements.card.classList.add(this.state.errorType);

        // 아이콘 업데이트
        if (this.elements.icon) {
            this.elements.icon.className = `error-icon ${this.state.errorType}`;
        }

        // 타입별 맞춤 메시지
        this.updateErrorMessage();
        this.updateSuggestions();
    },

    // 에러 메시지 업데이트
    updateErrorMessage() {
        const messages = {
            'not-found': {
                title: '게시글을 찾을 수 없습니다',
                message: '요청하신 게시글이 존재하지 않거나 삭제되었을 수 있습니다.'
            },
            'deleted': {
                title: '삭제된 게시글입니다',
                message: '이 게시글은 작성자 또는 관리자에 의해 삭제되었습니다.'
            },
            'private': {
                title: '접근 권한이 없습니다',
                message: '이 게시글을 볼 수 있는 권한이 없습니다. 로그인이 필요하거나 비공개 게시글일 수 있습니다.'
            },
            'server-error': {
                title: '서버 오류가 발생했습니다',
                message: '일시적인 서버 문제로 게시글을 불러올 수 없습니다. 잠시 후 다시 시도해주세요.'
            }
        };

        const errorInfo = messages[this.state.errorType] || messages['not-found'];
        
        if (this.elements.title) {
            this.elements.title.textContent = errorInfo.title;
        }
        
        if (this.elements.message) {
            this.elements.message.textContent = errorInfo.message;
        }
    },

    // 제안사항 업데이트
    updateSuggestions() {
        if (!this.elements.suggestions) return;

        const suggestions = {
            'not-found': [
                'URL을 다시 확인해보세요',
                '게시판 목록에서 다른 게시글을 찾아보세요',
                '검색 기능을 이용해보세요'
            ],
            'deleted': [
                '게시판 목록에서 다른 게시글을 확인해보세요',
                '비슷한 주제의 다른 게시글을 찾아보세요'
            ],
            'private': [
                '로그인 상태를 확인해보세요',
                '게시글 작성자에게 문의해보세요',
                '관리자에게 문의해보세요'
            ],
            'server-error': [
                '페이지를 새로고침해보세요',
                '잠시 후 다시 시도해보세요',
                '문제가 지속되면 관리자에게 문의해주세요'
            ]
        };

        const suggestionList = suggestions[this.state.errorType] || suggestions['not-found'];
        
        this.elements.suggestions.innerHTML = '';
        suggestionList.forEach(suggestion => {
            const li = document.createElement('li');
            li.textContent = suggestion;
            this.elements.suggestions.appendChild(li);
        });
    },

    // 이벤트 핸들러들
    handlePrimaryAction(event) {
        event.preventDefault();
        this.animateButtonClick(event.target);
        
        setTimeout(() => {
            this.redirectToBoards();
        }, 200);
    },

    handleSecondaryAction(event) {
        event.preventDefault();
        this.animateButtonClick(event.target);
        
        setTimeout(() => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                this.redirectToBoards();
            }
        }, 200);
    },

    handleTertiaryAction(event) {
        event.preventDefault();
        this.animateButtonClick(event.target);
        
        setTimeout(() => {
            window.location.href = '/';
        }, 200);
    },

    handleKeyDown(event) {
        switch (event.key) {
            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    // 새로고침 허용
                    return;
                }
                // R키로 재시도
                event.preventDefault();
                this.retryLoad();
                break;
            case 'Escape':
                // ESC로 뒤로가기
                this.handleSecondaryAction(event);
                break;
            case 'Enter':
                // Enter로 게시판 목록
                this.handlePrimaryAction(event);
                break;
        }
    },

    handleVisibilityChange() {
        if (document.hidden) {
            // 탭이 숨겨졌을 때 타이머 일시정지
            if (this.state.redirectTimer) {
                clearInterval(this.state.redirectTimer);
            }
        } else {
            // 탭이 다시 보일 때 타이머 재시작
            this.startRedirectTimer();
        }
    },

    handleOnline() {
        this.showNetworkStatus('온라인 상태로 복구되었습니다.', 'success');
        
        if (this.state.errorType === 'server-error') {
            setTimeout(() => {
                this.retryLoad();
            }, 1000);
        }
    },

    handleOffline() {
        this.showNetworkStatus('인터넷 연결이 끊어졌습니다.', 'error');
    },

    // 유틸리티 함수들
    animateButtonClick(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    },

    retryLoad() {
        if (this.state.isRetrying) return;
        
        this.state.retryCount++;
        if (this.state.retryCount > this.config.maxRetries) {
            this.showError('최대 재시도 횟수를 초과했습니다.');
            return;
        }

        this.state.isRetrying = true;
        this.showLoading(true);

        setTimeout(() => {
            window.location.reload();
        }, 1000);
    },

    redirectToBoards() {
        this.showLoading(true);
        
        // 부드러운 전환 애니메이션
        if (this.elements.card) {
            this.elements.card.style.transform = 'translateY(-20px)';
            this.elements.card.style.opacity = '0';
        }
        
        setTimeout(() => {
            window.location.href = '/board';
        }, 300);
    },

    showLoading(show) {
        if (this.elements.container) {
            this.elements.container.classList.toggle('loading', show);
        }

        // 버튼 비활성화
        const buttons = this.elements.actions?.querySelectorAll('button, a');
        buttons?.forEach(button => {
            button.disabled = show;
            button.style.pointerEvents = show ? 'none' : '';
        });
    },

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--system-red);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-notification';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--system-green);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    },

    showNetworkStatus(message, type) {
        const statusDiv = document.createElement('div');
        statusDiv.className = `network-status ${type}`;
        statusDiv.textContent = message;
        statusDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? 'var(--system-green)' : 'var(--system-red)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideUp 0.3s ease-out;
        `;
        
        document.body.appendChild(statusDiv);
        
        setTimeout(() => {
            statusDiv.remove();
        }, 3000);
    },

    // 정리
    destroy() {
        if (this.state.redirectTimer) {
            clearInterval(this.state.redirectTimer);
        }
    }
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    PostSkin.NotFound.init();
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    PostSkin.NotFound.destroy();
});

// 전역 함수로 노출
window.PostNotFound = PostSkin.NotFound;

// 추가 CSS 애니메이션 정의
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideUp {
        from {
            transform: translate(-50%, 100%);
            opacity: 0;
        }
        to {
            transform: translate(-50%, 0);
            opacity: 1;
        }
    }
    
    .redirect-countdown {
        margin-top: 16px;
        padding: 8px;
        background: rgba(0, 122, 255, 0.1);
        border-radius: 6px;
        font-size: 14px;
        color: var(--primary-blue);
        text-align: center;
    }
`;

if (!document.querySelector('#post-not-found-styles')) {
    style.id = 'post-not-found-styles';
    document.head.appendChild(style);
} 
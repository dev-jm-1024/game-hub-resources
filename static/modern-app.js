// 현대적인 웹 애플리케이션 JavaScript

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', function() {
    
    // 앱 초기화
    initializeApp();
    
    // 이벤트 리스너 설정
    setupEventListeners();
    
    // 애니메이션 초기화
    initializeAnimations();
    
    // 검색 기능 초기화
    initializeSearch();
    
    // 언어 선택기 초기화
    initializeLanguageSelector();
    
    console.log('🚀 Modern Game Hub App initialized');
});

// 앱 초기화 함수
function initializeApp() {
    // 페이지 로딩 애니메이션
    const mainContent = document.querySelector('main.content-main');
    const sidebar = document.querySelector('.sidebar');
    
    if (mainContent) {
        mainContent.classList.add('fade-in');
    }
    
    if (sidebar) {
        sidebar.classList.add('slide-in');
    }
    
    // 카드들에 순차적 애니메이션 적용
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in');
        }, index * 100);
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    
    // 네비게이션 활성화
    setupNavigation();
    
    // 버튼 클릭 이벤트
    setupButtons();
    
    // 카드 호버 효과
    setupCardHoverEffects();
    
    // 폼 검증
    setupFormValidation();
}

// 네비게이션 설정
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item a');
    const currentPath = window.location.pathname;
    
    navItems.forEach(item => {
        // 현재 페이지 활성화
        if (item.getAttribute('href') === currentPath) {
            item.classList.add('active');
        }
        
        // 클릭 이벤트
        item.addEventListener('click', function(e) {
            // 모든 네비게이션 아이템에서 active 클래스 제거
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // 클릭된 아이템에 active 클래스 추가
            this.classList.add('active');
            
            // 페이지 전환 애니메이션
            const mainContent = document.querySelector('main.content-main');
            if (mainContent) {
                mainContent.style.opacity = '0';
                mainContent.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    mainContent.style.opacity = '1';
                    mainContent.style.transform = 'translateY(0)';
                }, 150);
            }
        });
    });
}

// 버튼 설정
function setupButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // 클릭 효과
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // 로딩 상태 (필요한 경우)
            if (this.classList.contains('btn-primary')) {
                const originalText = this.textContent;
                this.textContent = '처리 중...';
                this.disabled = true;
                
                // 실제 처리 후 복원 (예시)
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                }, 2000);
            }
        });
    });
}

// 카드 호버 효과
function setupCardHoverEffects() {
    const cards = document.querySelectorAll('.card, .game-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
            this.style.boxShadow = 'var(--shadow-lg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'var(--shadow)';
        });
    });
}

// 폼 검증
function setupFormValidation() {
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateInput(this);
            }
        });
    });
}

// 입력 검증
function validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    
    // 에러 상태 초기화
    input.classList.remove('error');
    removeErrorMessage(input);
    
    // 필수 입력 검증
    if (input.required && !value) {
        showInputError(input, '필수 입력 항목입니다.');
        return false;
    }
    
    // 이메일 검증
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showInputError(input, '올바른 이메일 형식이 아닙니다.');
            return false;
        }
    }
    
    // 성공 상태
    input.classList.add('success');
    return true;
}

// 입력 에러 표시
function showInputError(input, message) {
    input.classList.add('error');
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = 'var(--error)';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '4px';
    
    input.parentNode.appendChild(errorElement);
}

// 에러 메시지 제거
function removeErrorMessage(input) {
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// 애니메이션 초기화
function initializeAnimations() {
    // 스크롤 애니메이션
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // 관찰할 요소들
    const animateElements = document.querySelectorAll('.section, .card, .game-card');
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

// 검색 기능 초기화
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            
            // 디바운싱
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                performSearch(query);
            }, 300);
        });
        
        // 엔터키 검색
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(this.value.trim());
            }
        });
    }
}

// 검색 실행
function performSearch(query) {
    console.log('🔍 검색:', query);
    
    if (!query) {
        showAllItems();
        return;
    }
    
    // 검색 결과 필터링
    const searchableItems = document.querySelectorAll('.game-card, .list-item');
    let visibleCount = 0;
    
    searchableItems.forEach(item => {
        const title = item.querySelector('.game-card-title, .list-item-title')?.textContent.toLowerCase();
        const description = item.querySelector('.game-card-description, .list-item-subtitle')?.textContent.toLowerCase();
        
        const isMatch = title?.includes(query.toLowerCase()) || description?.includes(query.toLowerCase());
        
        if (isMatch) {
            item.style.display = '';
            item.classList.add('fade-in');
            visibleCount++;
        } else {
            item.style.display = 'none';
            item.classList.remove('fade-in');
        }
    });
    
    // 검색 결과 없음 메시지
    showSearchResults(visibleCount, query);
}

// 모든 아이템 표시
function showAllItems() {
    const items = document.querySelectorAll('.game-card, .list-item');
    items.forEach(item => {
        item.style.display = '';
        item.classList.add('fade-in');
    });
    
    // 검색 결과 메시지 제거
    const resultMessage = document.querySelector('.search-result-message');
    if (resultMessage) {
        resultMessage.remove();
    }
}

// 검색 결과 표시
function showSearchResults(count, query) {
    // 기존 메시지 제거
    const existingMessage = document.querySelector('.search-result-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // 새 메시지 생성
    const message = document.createElement('div');
    message.className = 'search-result-message';
    message.style.textAlign = 'center';
    message.style.padding = '20px';
    message.style.color = 'var(--gray-600)';
    message.style.fontSize = '14px';
    
    if (count === 0) {
        message.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>"${query}"에 대한 검색 결과가 없습니다</h3>
                <p>다른 검색어를 시도해보세요.</p>
            </div>
        `;
    } else {
        message.textContent = `"${query}"에 대한 검색 결과: ${count}개`;
    }
    
    // 검색 결과를 표시할 컨테이너 찾기
    const container = document.querySelector('.game-grid') || document.querySelector('.list');
    if (container) {
        container.parentNode.insertBefore(message, container);
    }
}

// 언어 선택기 초기화
function initializeLanguageSelector() {
    const languageButtons = document.querySelectorAll('.language-selector button');
    
    languageButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 모든 버튼에서 active 클래스 제거
            languageButtons.forEach(btn => btn.classList.remove('active'));
            
            // 클릭된 버튼에 active 클래스 추가
            this.classList.add('active');
            
            // 언어 변경 처리
            const selectedLanguage = this.dataset.lang;
            changeLanguage(selectedLanguage);
        });
    });
}

// 언어 변경
function changeLanguage(lang) {
    console.log('🌐 언어 변경:', lang);
    
    // 실제 구현에서는 서버로 요청을 보내거나 로컬 스토리지에 저장
    localStorage.setItem('selectedLanguage', lang);
    
    // 페이지 새로고침 또는 동적 텍스트 변경
    // location.reload();
}

// 토스트 알림 표시
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 토스트 스타일
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateY(-20px)',
        transition: 'all 0.3s ease-in-out'
    });
    
    // 타입별 배경색
    const colors = {
        info: 'var(--info)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)'
    };
    toast.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 100);
    
    // 자동 제거
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 로딩 상태 표시
function showLoading(element) {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '⏳ 로딩 중...';
    
    Object.assign(loader.style, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        color: 'var(--gray-500)',
        fontSize: '14px'
    });
    
    element.style.position = 'relative';
    element.appendChild(loader);
    
    return loader;
}

// 로딩 상태 제거
function hideLoading(element) {
    const loader = element.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

// 유틸리티 함수들
const Utils = {
    
    // 디바운싱
    debounce: function(func, wait) {
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
    
    // 스로틀링
    throttle: function(func, limit) {
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
    
    // 요소 애니메이션
    animateElement: function(element, animation) {
        element.style.animation = animation;
        element.addEventListener('animationend', () => {
            element.style.animation = '';
        }, { once: true });
    },
    
    // 스크롤 최상단으로
    scrollToTop: function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
};

// 전역 함수 노출
window.GameHubApp = {
    showToast,
    showLoading,
    hideLoading,
    Utils
};

// 개발 모드에서만 로그 출력
if (window.location.hostname === 'localhost') {
    console.log('🎮 Game Hub App - Development Mode');
    console.log('Available functions:', Object.keys(window.GameHubApp));
} 
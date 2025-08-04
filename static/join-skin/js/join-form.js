// join-form.js - 디자인 애니메이션 및 UX 개선
document.addEventListener('DOMContentLoaded', function() {

    // 애니메이션 및 인터랙션 관련 함수들
    const AnimationManager = {

        // 상태 메시지 애니메이션 표시
        showStatusMessage: function(element, message, type = 'info') {
            if (!element) return;

            element.textContent = message;
            element.className = `status-message ${type} show`;

            // 메시지가 있을 때만 애니메이션 적용
            if (message) {
                element.style.animation = 'statusSlideIn 0.3s ease-out';
            }
        },

        // 상태 메시지 숨기기
        hideStatusMessage: function(element) {
            if (!element) return;

            element.style.animation = 'statusSlideOut 0.2s ease-in';
            setTimeout(() => {
                element.textContent = '';
                element.className = 'status-message';
            }, 200);
        },

        // 버튼 로딩 상태
        setButtonLoading: function(button, isLoading) {
            if (!button) return;

            if (isLoading) {
                button.classList.add('loading');
                button.disabled = true;
                button.dataset.originalText = button.textContent;
            } else {
                button.classList.remove('loading');
                button.disabled = false;
                if (button.dataset.originalText) {
                    button.textContent = button.dataset.originalText;
                }
            }
        },

        // 입력 필드 성공 애니메이션
        showFieldSuccess: function(input) {
            if (!input) return;

            input.style.borderColor = '#34c759';
            input.style.boxShadow = '0 0 0 4px rgba(52, 199, 89, 0.1)';

            // 체크마크 아이콘 추가
            this.addSuccessIcon(input);

            setTimeout(() => {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            }, 2000);
        },

        // 입력 필드 에러 애니메이션
        showFieldError: function(input) {
            if (!input) return;

            input.style.borderColor = '#ff3b30';
            input.style.boxShadow = '0 0 0 4px rgba(255, 59, 48, 0.1)';

            // 흔들기 애니메이션
            input.style.animation = 'shake 0.5s ease-in-out';

            setTimeout(() => {
                input.style.borderColor = '';
                input.style.boxShadow = '';
                input.style.animation = '';
            }, 2000);
        },

        // 성공 아이콘 추가
        addSuccessIcon: function(input) {
            const wrapper = input.parentElement;
            let icon = wrapper.querySelector('.success-icon');

            if (!icon) {
                icon = document.createElement('div');
                icon.className = 'success-icon';
                icon.innerHTML = '✓';
                icon.style.cssText = `
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #34c759;
                    font-weight: bold;
                    font-size: 16px;
                    animation: checkmarkPop 0.3s ease-out;
                `;
                wrapper.style.position = 'relative';
                wrapper.appendChild(icon);
            }

            // 2초 후 제거
            setTimeout(() => {
                if (icon && icon.parentElement) {
                    icon.remove();
                }
            }, 2000);
        },

        // 폼 제출 성공 애니메이션
        showSubmitSuccess: function() {
            const form = document.getElementById('joinForm');
            if (!form) return;

            form.style.animation = 'successPulse 0.6s ease-out';

            // 성공 오버레이 표시
            this.showSuccessOverlay();
        },

        // 성공 오버레이 표시
        showSuccessOverlay: function() {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(52, 199, 89, 0.1);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                animation: overlayFadeIn 0.3s ease-out;
            `;

            overlay.innerHTML = `
                <div style="
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    animation: successModalSlideUp 0.4s ease-out;
                ">
                    <div style="
                        width: 60px;
                        height: 60px;
                        background: #34c759;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin: 0 auto 20px;
                        animation: checkmarkBounce 0.6s ease-out;
                    ">
                        <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </div>
                    <h3 style="color: #1d1d1f; margin-bottom: 10px;">회원가입 성공!</h3>
                    <p style="color: #86868b;">잠시 후 메인 페이지로 이동합니다.</p>
                </div>
            `;

            document.body.appendChild(overlay);

            // 3초 후 제거
            setTimeout(() => {
                overlay.remove();
            }, 3000);
        }
    };

    // 파일 업로드 UX 개선
    const FileUploadManager = {
        init: function() {
            const fileInput = document.getElementById('files');
            if (!fileInput) return;

            // 드래그 앤 드롭 기능 추가
            this.setupDragAndDrop(fileInput);

            // 파일 선택 시 미리보기
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelection(e.target);
            });
        },

        setupDragAndDrop: function(fileInput) {
            const dropZone = fileInput.parentElement;

            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, this.preventDefaults, false);
            });

            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => {
                    dropZone.style.borderColor = '#007aff';
                    dropZone.style.background = '#f0f8ff';
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, () => {
                    dropZone.style.borderColor = '';
                    dropZone.style.background = '';
                }, false);
            });

            dropZone.addEventListener('drop', (e) => {
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    this.handleFileSelection(fileInput);
                }
            }, false);
        },

        preventDefaults: function(e) {
            e.preventDefault();
            e.stopPropagation();
        },

        handleFileSelection: function(fileInput) {
            const file = fileInput.files[0];
            if (!file) return;

            // 파일 크기 체크
            if (file.size > 5 * 1024 * 1024) {
                AnimationManager.showStatusMessage(
                    fileInput.parentElement.querySelector('.file-status') || this.createFileStatus(fileInput),
                    '파일 크기는 5MB 이하로 업로드해주세요.',
                    'error'
                );
                fileInput.value = '';
                return;
            }

            // 이미지 파일 체크
            if (!file.type.startsWith('image/')) {
                AnimationManager.showStatusMessage(
                    fileInput.parentElement.querySelector('.file-status') || this.createFileStatus(fileInput),
                    '이미지 파일만 업로드 가능합니다.',
                    'error'
                );
                fileInput.value = '';
                return;
            }

            // 파일 정보 표시
            this.showFileInfo(fileInput, file);

            // 이미지 미리보기
            this.showImagePreview(fileInput, file);
        },

        createFileStatus: function(fileInput) {
            const status = document.createElement('div');
            status.className = 'file-status status-message';
            fileInput.parentElement.appendChild(status);
            return status;
        },

        showFileInfo: function(fileInput, file) {
            const statusElement = fileInput.parentElement.querySelector('.file-status') || this.createFileStatus(fileInput);
            const fileSize = (file.size / 1024 / 1024).toFixed(2);

            AnimationManager.showStatusMessage(
                statusElement,
                `${file.name} (${fileSize}MB) - 업로드 준비 완료`,
                'success'
            );
        },

        showImagePreview: function(fileInput, file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                let preview = fileInput.parentElement.querySelector('.image-preview');

                if (!preview) {
                    preview = document.createElement('div');
                    preview.className = 'image-preview';
                    preview.style.cssText = `
                        margin-top: 12px;
                        text-align: center;
                        animation: fadeInUp 0.3s ease-out;
                    `;
                    fileInput.parentElement.appendChild(preview);
                }

                preview.innerHTML = `
                    <img src="${e.target.result}" alt="미리보기" style="
                        max-width: 120px;
                        max-height: 120px;
                        border-radius: 12px;
                        object-fit: cover;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        border: 2px solid #e5e5e7;
                    ">
                    <p style="
                        font-size: 12px;
                        color: #86868b;
                        margin-top: 8px;
                    ">프로필 사진 미리보기</p>
                `;
            };
            reader.readAsDataURL(file);
        }
    };

    // 입력 필드 인터랙션 개선
    const InputManager = {
        init: function() {
            // 모든 입력 필드에 포커스 효과 추가
            const inputs = document.querySelectorAll('input, select');
            inputs.forEach(input => {
                this.setupInputEffects(input);
            });
        },

        setupInputEffects: function(input) {
            // 포커스 시 라벨 애니메이션
            input.addEventListener('focus', () => {
                const label = input.parentElement.querySelector('label');
                if (label) {
                    label.style.transform = 'translateY(-2px)';
                    label.style.color = '#007aff';
                    label.style.transition = 'all 0.2s ease';
                }
            });

            input.addEventListener('blur', () => {
                const label = input.parentElement.querySelector('label');
                if (label) {
                    label.style.transform = '';
                    label.style.color = '';
                }
            });

            // 입력 시 실시간 유효성 검사 시각적 피드백
            input.addEventListener('input', () => {
                if (input.value.length > 0) {
                    input.style.borderColor = '#34c759';
                } else {
                    input.style.borderColor = '';
                }
            });
        }
    };

    // CSS 애니메이션 추가
    const style = document.createElement('style');
    style.textContent = `
        @keyframes statusSlideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes statusSlideOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-5px); }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        @keyframes checkmarkPop {
            0% { transform: translateY(-50%) scale(0); }
            50% { transform: translateY(-50%) scale(1.2); }
            100% { transform: translateY(-50%) scale(1); }
        }
        
        @keyframes successPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
        }
        
        @keyframes overlayFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes successModalSlideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes checkmarkBounce {
            0% { transform: scale(0) rotate(0deg); }
            50% { transform: scale(1.2) rotate(180deg); }
            100% { transform: scale(1) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    // 초기화
    FileUploadManager.init();
    InputManager.init();

    // 전역에서 사용할 수 있도록 노출
    window.FormAnimations = AnimationManager;
});

// 기존 JS와 연동하기 위한 이벤트 리스너들
document.addEventListener('DOMContentLoaded', function() {
    // 중복 확인 버튼 클릭 시 로딩 애니메이션
    const checkButtons = document.querySelectorAll('#checkIdBtn, #checkEmailBtn');
    checkButtons.forEach(button => {
        const originalClickHandler = button.onclick;

        button.addEventListener('click', function() {
            window.FormAnimations?.setButtonLoading(this, true);

            // 1초 후 로딩 해제 (실제 응답 시간에 맞춰 조정)
            setTimeout(() => {
                window.FormAnimations?.setButtonLoading(this, false);
            }, 1000);
        });
    });

    // 폼 제출 시 애니메이션
    const form = document.getElementById('joinForm');
    if (form) {
        form.addEventListener('submit', function() {
            const submitBtn = document.getElementById('joinBtn');
            window.FormAnimations?.setButtonLoading(submitBtn, true);
        });
    }
});
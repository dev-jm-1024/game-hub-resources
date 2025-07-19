// Apple macOS/iOS 스타일 게시글 작성 폼 JavaScript

// 네임스페이스 정의
window.BoardSkin = window.BoardSkin || {};
window.BoardSkin.PostSkin = window.BoardSkin.PostSkin || {};

BoardSkin.PostSkin.Form = {
    // 설정
    config: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxFiles: 5,
        autoSaveInterval: 30000, // 30초
        minTitleLength: 2,
        minContentLength: 10,
        maxTitleLength: 100,
        maxContentLength: 10000
    },

    // 상태
    state: {
        isSubmitting: false,
        isDirty: false,
        selectedFiles: [],
        autoSaveTimer: null,
        validationErrors: {}
    },

    // DOM 요소
    elements: {},

    // 초기화
    init() {
        this.cacheElements();
        this.bindEvents();
        this.setupCSRF();
        this.setupFileUpload();
        this.setupValidation();
        this.startAutoSave();
        this.restoreFromStorage();
        
        console.log('BoardSkin.PostSkin.Form initialized');
    },

    // DOM 요소 캐싱
    cacheElements() {
        this.elements = {
            form: document.querySelector('#postForm'),
            titleInput: document.querySelector('#title'),
            contentTextarea: document.querySelector('#content'),
            boardSelect: document.querySelector('#boardId'),
            fileInput: document.querySelector('#files'),
            submitButton: document.querySelector('button[type="submit"]'),
            cancelButton: document.querySelector('button[type="button"]'),
            filePreview: document.querySelector('.file-preview') || this.createFilePreview(),
            charCounters: {}
        };

        // 문자 카운터 생성
        this.createCharCounters();
    },

    // 이벤트 바인딩
    bindEvents() {
        // 폼 제출
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // 입력 필드 변경사항 추적
        [this.elements.titleInput, this.elements.contentTextarea, this.elements.boardSelect].forEach(element => {
            if (element) {
                element.addEventListener('input', this.handleInputChange.bind(this));
                element.addEventListener('blur', this.validateField.bind(this));
            }
        });

        // 파일 입력 변경
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        }

        // 취소 버튼
        if (this.elements.cancelButton) {
            this.elements.cancelButton.addEventListener('click', this.handleCancel.bind(this));
        }

        // 페이지 이탈 경고
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

        // 키보드 단축키
        document.addEventListener('keydown', this.handleKeyDown.bind(this));

        // 드래그 앤 드롭
        this.setupDragAndDrop();
    },

    // CSRF 토큰 설정
    setupCSRF() {
        this.csrfToken = document.querySelector('meta[name="_csrf"]')?.content || '';
        this.csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content || '';
    },

    // 파일 업로드 설정
    setupFileUpload() {
        if (!this.elements.fileInput) return;

        // 파일 입력 스타일링
        this.styleFileInput();
        
        // 파일 미리보기 컨테이너 생성
        if (!this.elements.filePreview.parentNode) {
            this.elements.fileInput.parentNode.appendChild(this.elements.filePreview);
        }
    },

    // 유효성 검사 설정
    setupValidation() {
        this.validators = {
            title: (value) => {
                const trimmed = value.trim();
                if (trimmed.length < this.config.minTitleLength) {
                    return `제목은 최소 ${this.config.minTitleLength}자 이상이어야 합니다.`;
                }
                if (trimmed.length > this.config.maxTitleLength) {
                    return `제목은 최대 ${this.config.maxTitleLength}자까지 입력 가능합니다.`;
                }
                return null;
            },
            
            content: (value) => {
                const trimmed = value.trim();
                if (trimmed.length < this.config.minContentLength) {
                    return `내용은 최소 ${this.config.minContentLength}자 이상이어야 합니다.`;
                }
                if (trimmed.length > this.config.maxContentLength) {
                    return `내용은 최대 ${this.config.maxContentLength}자까지 입력 가능합니다.`;
                }
                return null;
            },

            boardId: (value) => {
                if (!value || value === '') {
                    return '카테고리를 선택해주세요.';
                }
                return null;
            }
        };
    },

    // 자동 저장 시작
    startAutoSave() {
        this.state.autoSaveTimer = setInterval(() => {
            if (this.state.isDirty) {
                this.saveToStorage();
            }
        }, this.config.autoSaveInterval);
    },

    // 이벤트 핸들러들
    handleSubmit(event) {
        event.preventDefault();
        
        if (this.state.isSubmitting) return;

        // 유효성 검사
        if (!this.validateForm()) {
            this.showValidationErrors();
            return;
        }

        this.submitForm();
    },

    async submitForm() {
        this.state.isSubmitting = true;
        this.showLoading(true);

        try {
            const formData = new FormData();
            
            // 게시글 데이터
            const postData = {
                postTitle: this.elements.titleInput.value.trim(),
                postContent: this.elements.contentTextarea.value.trim()
            };

            formData.append("data", new Blob([JSON.stringify(postData)], { type: "application/json" }));

            // 파일 첨부
            this.state.selectedFiles.forEach(file => {
                formData.append("files", file);
            });

            const boardId = this.elements.boardSelect.value;

            const response = await fetch(`/api/v1/board/${boardId}/posts`, {
                method: "POST",
                headers: {
                    [this.csrfHeader]: this.csrfToken
                },
                body: formData,
                credentials: "include"
            });

            if (response.ok) {
                this.showSuccess('게시글이 성공적으로 작성되었습니다.');
                this.clearStorage();
                this.state.isDirty = false;
                
                setTimeout(() => {
                    window.location.href = `/board/${boardId}/view`;
                }, 1500);
            } else {
                const errorText = await response.text();
                throw new Error(errorText || '작성 실패');
            }

        } catch (error) {
            console.error("작성 실패:", error);
            this.showError("작성 실패: " + error.message);
        } finally {
            this.state.isSubmitting = false;
            this.showLoading(false);
        }
    },

    handleInputChange(event) {
        this.state.isDirty = true;
        this.updateCharCounter(event.target);
        this.clearFieldError(event.target);
        
        // 실시간 유효성 검사 (디바운스 적용)
        clearTimeout(this.validationTimeout);
        this.validationTimeout = setTimeout(() => {
            this.validateField(event);
        }, 500);
    },

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.processSelectedFiles(files);
    },

    handleCancel(event) {
        event.preventDefault();
        
        if (this.state.isDirty) {
            if (confirm('작성 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                this.clearStorage();
                window.history.back();
            }
        } else {
            window.history.back();
        }
    },

    handleBeforeUnload(event) {
        if (this.state.isDirty && !this.state.isSubmitting) {
            event.preventDefault();
            event.returnValue = '작성 중인 내용이 있습니다. 정말 떠나시겠습니까?';
            return event.returnValue;
        }
    },

    handleKeyDown(event) {
        // Ctrl+S로 임시저장
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
            event.preventDefault();
            this.saveToStorage();
            this.showSuccess('임시저장되었습니다.');
        }

        // Ctrl+Enter로 제출
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            this.elements.submitButton?.click();
        }
    },

    // 파일 처리
    processSelectedFiles(files) {
        const validFiles = [];
        const errors = [];

        files.forEach(file => {
            // 파일 타입 검사
            if (!this.config.allowedFileTypes.includes(file.type)) {
                errors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`);
                return;
            }

            // 파일 크기 검사
            if (file.size > this.config.maxFileSize) {
                errors.push(`${file.name}: 파일 크기가 너무 큽니다. (최대 ${this.formatFileSize(this.config.maxFileSize)})`);
                return;
            }

            validFiles.push(file);
        });

        // 최대 파일 수 검사
        if (this.state.selectedFiles.length + validFiles.length > this.config.maxFiles) {
            errors.push(`최대 ${this.config.maxFiles}개까지만 업로드 가능합니다.`);
            return;
        }

        if (errors.length > 0) {
            this.showError(errors.join('\n'));
        }

        if (validFiles.length > 0) {
            this.state.selectedFiles.push(...validFiles);
            this.updateFilePreview();
            this.state.isDirty = true;
        }
    },

    updateFilePreview() {
        this.elements.filePreview.innerHTML = '';

        if (this.state.selectedFiles.length === 0) {
            this.elements.filePreview.style.display = 'none';
            return;
        }

        this.elements.filePreview.style.display = 'block';

        this.state.selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${this.formatFileSize(file.size)}</span>
                </div>
                <button type="button" class="file-remove-button" data-index="${index}">×</button>
            `;

            // 이미지 미리보기
            if (file.type.startsWith('image/')) {
                const img = document.createElement('img');
                img.className = 'file-thumbnail';
                img.onload = () => URL.revokeObjectURL(img.src);
                img.src = URL.createObjectURL(file);
                fileItem.insertBefore(img, fileItem.firstChild);
            }

            this.elements.filePreview.appendChild(fileItem);
        });

        // 파일 삭제 버튼 이벤트
        this.elements.filePreview.addEventListener('click', (e) => {
            if (e.target.classList.contains('file-remove-button')) {
                const index = parseInt(e.target.dataset.index);
                this.removeFile(index);
            }
        });
    },

    removeFile(index) {
        this.state.selectedFiles.splice(index, 1);
        this.updateFilePreview();
        this.state.isDirty = true;
    },

    // 드래그 앤 드롭 설정
    setupDragAndDrop() {
        const dropZone = this.elements.fileInput.closest('.form-file-wrapper') || this.elements.fileInput;

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        dropZone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.processSelectedFiles(files);
        });
    },

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    },

    // 유효성 검사
    validateField(event) {
        const field = event.target;
        const fieldName = field.id || field.name;
        const validator = this.validators[fieldName];

        if (validator) {
            const error = validator(field.value);
            if (error) {
                this.state.validationErrors[fieldName] = error;
                this.showFieldError(field, error);
            } else {
                delete this.state.validationErrors[fieldName];
                this.clearFieldError(field);
            }
        }
    },

    validateForm() {
        this.state.validationErrors = {};

        Object.keys(this.validators).forEach(fieldName => {
            const field = this.elements[fieldName + 'Input'] || this.elements[fieldName + 'Textarea'] || this.elements[fieldName + 'Select'];
            if (field) {
                const error = this.validators[fieldName](field.value);
                if (error) {
                    this.state.validationErrors[fieldName] = error;
                }
            }
        });

        return Object.keys(this.state.validationErrors).length === 0;
    },

    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    },

    clearFieldError(field) {
        field.classList.remove('invalid');
        
        const errorDiv = field.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.remove();
        }
    },

    showValidationErrors() {
        Object.keys(this.state.validationErrors).forEach(fieldName => {
            const field = document.querySelector(`#${fieldName}`) || 
                          document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.showFieldError(field, this.state.validationErrors[fieldName]);
            }
        });

        // 첫 번째 에러 필드로 스크롤
        const firstErrorField = document.querySelector('.invalid');
        if (firstErrorField) {
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstErrorField.focus();
        }
    },

    // 문자 카운터
    createCharCounters() {
        [this.elements.titleInput, this.elements.contentTextarea].forEach(element => {
            if (element) {
                const counter = document.createElement('div');
                counter.className = 'char-counter';
                element.parentNode.appendChild(counter);
                
                this.elements.charCounters[element.id] = counter;
                this.updateCharCounter(element);
            }
        });
    },

    updateCharCounter(element) {
        const counter = this.elements.charCounters[element.id];
        if (!counter) return;

        const current = element.value.length;
        const max = element.id === 'title' ? this.config.maxTitleLength : this.config.maxContentLength;
        
        counter.textContent = `${current}/${max}`;
        counter.classList.toggle('over-limit', current > max);
    },

    // 파일 입력 스타일링
    styleFileInput() {
        if (!this.elements.fileInput) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'file-input-wrapper';
        wrapper.innerHTML = `
            <div class="file-input-display">
                <span class="file-input-text">이미지 파일을 선택하거나 드래그하세요</span>
                <span class="file-input-info">최대 ${this.config.maxFiles}개, ${this.formatFileSize(this.config.maxFileSize)} 이하</span>
            </div>
        `;

        this.elements.fileInput.parentNode.insertBefore(wrapper, this.elements.fileInput);
        wrapper.appendChild(this.elements.fileInput);
    },

    createFilePreview() {
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        preview.style.display = 'none';
        return preview;
    },

    // 로컬 스토리지 관리
    saveToStorage() {
        const data = {
            title: this.elements.titleInput?.value || '',
            content: this.elements.contentTextarea?.value || '',
            boardId: this.elements.boardSelect?.value || '',
            timestamp: Date.now()
        };

        localStorage.setItem('post-draft', JSON.stringify(data));
    },

    restoreFromStorage() {
        try {
            const saved = localStorage.getItem('post-draft');
            if (saved) {
                const data = JSON.parse(saved);
                
                // 24시간 이내 데이터만 복원
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    if (data.title && this.elements.titleInput) {
                        this.elements.titleInput.value = data.title;
                    }
                    if (data.content && this.elements.contentTextarea) {
                        this.elements.contentTextarea.value = data.content;
                    }
                    if (data.boardId && this.elements.boardSelect) {
                        this.elements.boardSelect.value = data.boardId;
                    }

                    if (data.title || data.content) {
                        this.showSuccess('임시저장된 내용을 복원했습니다.');
                        this.state.isDirty = true;
                    }
                }
            }
        } catch (error) {
            console.error('Failed to restore from storage:', error);
        }
    },

    clearStorage() {
        localStorage.removeItem('post-draft');
    },

    // 유틸리티 함수들
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    showLoading(show) {
        this.elements.form?.classList.toggle('loading', show);
        
        if (this.elements.submitButton) {
            this.elements.submitButton.disabled = show;
            this.elements.submitButton.textContent = show ? '작성 중...' : '작성 완료';
        }
    },

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        this.elements.form?.prepend(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        this.elements.form?.prepend(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    },

    // 정리
    destroy() {
        if (this.state.autoSaveTimer) {
            clearInterval(this.state.autoSaveTimer);
        }
        
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }
    }
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    BoardSkin.PostSkin.Form.init();
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    BoardSkin.PostSkin.Form.destroy();
});

// 전역 함수로 노출
window.PostForm = BoardSkin.PostSkin.Form; 
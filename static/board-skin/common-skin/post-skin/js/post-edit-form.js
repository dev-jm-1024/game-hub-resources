// Apple macOS/iOS 스타일 게시글 수정 폼 JavaScript

// 네임스페이스 정의
window.BoardSkin = window.BoardSkin || {};
window.BoardSkin.PostSkin = window.BoardSkin.PostSkin || {};

BoardSkin.PostSkin.EditForm = {
    // 설정
    config: {
        autoSaveInterval: 30000, // 30초
        minTitleLength: 2,
        minContentLength: 10,
        maxTitleLength: 100,
        maxContentLength: 10000,
        changeDetectionDelay: 500
    },

    // 상태
    state: {
        isSubmitting: false,
        hasChanges: false,
        originalData: {},
        currentData: {},
        autoSaveTimer: null,
        validationErrors: {}
    },

    // DOM 요소
    elements: {},

    // 초기화
    init() {
        this.cacheElements();
        this.storeOriginalData();
        this.bindEvents();
        this.setupCSRF();
        this.setupValidation();
        this.setupChangeDetection();
        this.startAutoSave();
        this.showEditNotice();
        
        console.log('BoardSkin.PostSkin.EditForm initialized');
    },

    // DOM 요소 캐싱
    cacheElements() {
        this.elements = {
            form: document.querySelector('#postForm'),
            titleInput: document.querySelector('#title'),
            contentTextarea: document.querySelector('#content'),
            boardIdInput: document.querySelector('input[name="boardId"]'),
            postIdInput: document.querySelector('input[name="postId"]'),
            submitButton: document.querySelector('button[type="submit"]'),
            cancelButton: document.querySelector('button[type="button"]'),
            charCounters: {}
        };

        // 문자 카운터 생성
        this.createCharCounters();
    },

    // 원본 데이터 저장
    storeOriginalData() {
        this.state.originalData = {
            title: this.elements.titleInput?.value || '',
            content: this.elements.contentTextarea?.value || '',
            boardId: this.elements.boardIdInput?.value || '',
            postId: this.elements.postIdInput?.value || ''
        };

        this.state.currentData = { ...this.state.originalData };
    },

    // 이벤트 바인딩
    bindEvents() {
        // 폼 제출
        if (this.elements.form) {
            this.elements.form.addEventListener('submit', this.handleSubmit.bind(this));
        }

        // 입력 필드 변경사항 추적
        [this.elements.titleInput, this.elements.contentTextarea].forEach(element => {
            if (element) {
                element.addEventListener('input', this.handleInputChange.bind(this));
                element.addEventListener('blur', this.validateField.bind(this));
            }
        });

        // 취소 버튼
        if (this.elements.cancelButton) {
            this.elements.cancelButton.addEventListener('click', this.handleCancel.bind(this));
        }

        // 페이지 이탈 경고
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

        // 키보드 단축키
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    },

    // CSRF 토큰 설정
    setupCSRF() {
        this.csrfToken = document.querySelector('meta[name="_csrf"]')?.content || '';
        this.csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.content || '';
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
            }
        };
    },

    // 변경사항 감지 설정
    setupChangeDetection() {
        this.changeDetectionTimer = null;
    },

    // 자동 저장 시작
    startAutoSave() {
        this.state.autoSaveTimer = setInterval(() => {
            if (this.state.hasChanges) {
                this.saveToStorage();
            }
        }, this.config.autoSaveInterval);
    },

    // 수정 알림 표시
    showEditNotice() {
        const notice = document.createElement('div');
        notice.className = 'edit-notice';
        notice.innerHTML = '기존 게시글을 수정하고 있습니다. 변경사항은 자동으로 감지됩니다.';
        
        this.elements.form?.parentNode?.insertBefore(notice, this.elements.form);
    },

    // 이벤트 핸들러들
    handleSubmit(event) {
        event.preventDefault();
        
        if (this.state.isSubmitting) return;

        // 변경사항 확인
        if (!this.state.hasChanges) {
            this.showWarning('변경된 내용이 없습니다.');
            return;
        }

        // 유효성 검사
        if (!this.validateForm()) {
            this.showValidationErrors();
            return;
        }

        // 변경 확인 모달 표시
        this.showChangeConfirmation();
    },

    async submitForm() {
        this.state.isSubmitting = true;
        this.showLoading(true);

        try {
            const data = {
                postTitle: this.elements.titleInput.value.trim(),
                postContent: this.elements.contentTextarea.value.trim(),
                boardId: this.state.currentData.boardId,
                postId: this.state.currentData.postId
            };

            const response = await fetch(`/api/v1/board/${data.boardId}/posts/${data.postId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    [this.csrfHeader]: this.csrfToken
                },
                credentials: "include",
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.showSuccess('게시글이 성공적으로 수정되었습니다.');
                this.clearStorage();
                this.state.hasChanges = false;
                
                setTimeout(() => {
                    window.location.href = "/board";
                }, 1500);
            } else {
                const errorText = await response.text();
                throw new Error(errorText || '수정 실패');
            }

        } catch (error) {
            console.error("수정 실패:", error);
            this.showError("수정 실패: " + error.message);
        } finally {
            this.state.isSubmitting = false;
            this.showLoading(false);
        }
    },

    handleInputChange(event) {
        const field = event.target;
        const fieldName = field.id || field.name;
        
        // 현재 데이터 업데이트
        this.state.currentData[fieldName] = field.value;
        
        // 변경사항 감지
        this.detectChanges();
        
        // 문자 카운터 업데이트
        this.updateCharCounter(field);
        
        // 필드 에러 제거
        this.clearFieldError(field);
        
        // 실시간 유효성 검사 (디바운스 적용)
        clearTimeout(this.validationTimeout);
        this.validationTimeout = setTimeout(() => {
            this.validateField(event);
        }, 500);
    },

    handleCancel(event) {
        event.preventDefault();
        
        if (this.state.hasChanges) {
            if (confirm('수정 중인 내용이 있습니다. 정말 취소하시겠습니까?')) {
                this.clearStorage();
                window.history.back();
            }
        } else {
            window.history.back();
        }
    },

    handleBeforeUnload(event) {
        if (this.state.hasChanges && !this.state.isSubmitting) {
            event.preventDefault();
            event.returnValue = '수정 중인 내용이 있습니다. 정말 떠나시겠습니까?';
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

        // Ctrl+Z로 되돌리기
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            if (confirm('원본 내용으로 되돌리시겠습니까?')) {
                this.restoreOriginalData();
            }
        }
    },

    // 변경사항 감지
    detectChanges() {
        const hasChanges = 
            this.state.currentData.title !== this.state.originalData.title ||
            this.state.currentData.content !== this.state.originalData.content;

        if (hasChanges !== this.state.hasChanges) {
            this.state.hasChanges = hasChanges;
            this.updateChangeIndicators();
            this.updateUnsavedWarning();
        }
    },

    updateChangeIndicators() {
        // 제목 필드 변경 표시
        if (this.elements.titleInput) {
            const isChanged = this.state.currentData.title !== this.state.originalData.title;
            this.elements.titleInput.classList.toggle('modified', isChanged);
            this.toggleModifiedIndicator(this.elements.titleInput, isChanged);
        }

        // 내용 필드 변경 표시
        if (this.elements.contentTextarea) {
            const isChanged = this.state.currentData.content !== this.state.originalData.content;
            this.elements.contentTextarea.classList.toggle('modified', isChanged);
            this.toggleModifiedIndicator(this.elements.contentTextarea, isChanged);
        }

        // 제출 버튼 상태 업데이트
        if (this.elements.submitButton) {
            this.elements.submitButton.disabled = !this.state.hasChanges;
            this.elements.submitButton.textContent = this.state.hasChanges ? '수정 완료' : '변경사항 없음';
        }
    },

    toggleModifiedIndicator(field, isModified) {
        let indicator = field.parentNode.querySelector('.modified-indicator');
        
        if (isModified && !indicator) {
            indicator = document.createElement('div');
            indicator.className = 'modified-indicator';
            indicator.textContent = '수정됨';
            field.parentNode.appendChild(indicator);
        } else if (!isModified && indicator) {
            indicator.remove();
        }
    },

    updateUnsavedWarning() {
        let warning = document.querySelector('.unsaved-changes-warning');
        
        if (this.state.hasChanges && !warning) {
            warning = document.createElement('div');
            warning.className = 'unsaved-changes-warning';
            warning.textContent = '저장되지 않은 변경사항이 있습니다.';
            document.body.appendChild(warning);
            
            setTimeout(() => {
                warning.classList.add('show');
            }, 100);
        } else if (!this.state.hasChanges && warning) {
            warning.classList.remove('show');
            setTimeout(() => {
                warning.remove();
            }, 300);
        }
    },

    // 변경 확인 모달
    showChangeConfirmation() {
        const modal = this.createChangeConfirmationModal();
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // 확인 버튼 이벤트
        const confirmBtn = modal.querySelector('.confirm-button');
        const cancelBtn = modal.querySelector('.confirm-cancel-button');

        confirmBtn.addEventListener('click', () => {
            this.hideChangeConfirmation();
            this.submitForm();
        });

        cancelBtn.addEventListener('click', () => {
            this.hideChangeConfirmation();
        });

        // ESC 키로 닫기
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.hideChangeConfirmation();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    },

    hideChangeConfirmation() {
        const modal = document.querySelector('.confirm-modal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    },

    createChangeConfirmationModal() {
        const modal = document.createElement('div');
        modal.className = 'confirm-modal modal';
        
        const changes = this.getChangesSummary();
        
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="confirm-modal-content">
                <div class="confirm-modal-title">변경사항 저장</div>
                <div class="confirm-modal-message">
                    <p>다음 내용이 수정됩니다:</p>
                    <ul class="changes-list">
                        ${changes.map(change => `<li>${change}</li>`).join('')}
                    </ul>
                    <p>저장하시겠습니까?</p>
                </div>
                <div class="confirm-modal-actions">
                    <button type="button" class="confirm-cancel-button form-button">취소</button>
                    <button type="button" class="confirm-button form-button">저장</button>
                </div>
            </div>
        `;

        return modal;
    },

    getChangesSummary() {
        const changes = [];
        
        if (this.state.currentData.title !== this.state.originalData.title) {
            changes.push('제목 변경');
        }
        
        if (this.state.currentData.content !== this.state.originalData.content) {
            changes.push('내용 변경');
        }
        
        return changes;
    },

    // 원본 데이터 복원
    restoreOriginalData() {
        if (this.elements.titleInput) {
            this.elements.titleInput.value = this.state.originalData.title;
        }
        
        if (this.elements.contentTextarea) {
            this.elements.contentTextarea.value = this.state.originalData.content;
        }

        this.state.currentData = { ...this.state.originalData };
        this.state.hasChanges = false;
        this.updateChangeIndicators();
        this.updateUnsavedWarning();
        
        this.showSuccess('원본 내용으로 복원되었습니다.');
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
            const field = this.elements[fieldName + 'Input'] || this.elements[fieldName + 'Textarea'];
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

    // 로컬 스토리지 관리
    saveToStorage() {
        const data = {
            ...this.state.currentData,
            originalData: this.state.originalData,
            timestamp: Date.now()
        };

        localStorage.setItem('post-edit-draft', JSON.stringify(data));
    },

    restoreFromStorage() {
        try {
            const saved = localStorage.getItem('post-edit-draft');
            if (saved) {
                const data = JSON.parse(saved);
                
                // 24시간 이내 데이터만 복원
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    if (data.postId === this.state.originalData.postId) {
                        if (data.title && this.elements.titleInput) {
                            this.elements.titleInput.value = data.title;
                            this.state.currentData.title = data.title;
                        }
                        if (data.content && this.elements.contentTextarea) {
                            this.elements.contentTextarea.value = data.content;
                            this.state.currentData.content = data.content;
                        }

                        this.detectChanges();
                        this.showSuccess('임시저장된 내용을 복원했습니다.');
                    }
                }
            }
        } catch (error) {
            console.error('Failed to restore from storage:', error);
        }
    },

    clearStorage() {
        localStorage.removeItem('post-edit-draft');
    },

    // 상태 관리 및 메시지
    showLoading(show) {
        this.elements.form?.classList.toggle('loading', show);
        
        if (this.elements.submitButton) {
            this.elements.submitButton.disabled = show || !this.state.hasChanges;
            if (show) {
                this.elements.submitButton.textContent = '수정 중...';
            } else {
                this.elements.submitButton.textContent = this.state.hasChanges ? '수정 완료' : '변경사항 없음';
            }
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

    showWarning(message) {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'warning-message';
        warningDiv.textContent = message;
        
        this.elements.form?.prepend(warningDiv);
        
        setTimeout(() => {
            warningDiv.remove();
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
        
        if (this.changeDetectionTimer) {
            clearTimeout(this.changeDetectionTimer);
        }
    }
};

// DOM 로드 완료 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    BoardSkin.PostSkin.EditForm.init();
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    BoardSkin.PostSkin.EditForm.destroy();
});

// 전역 함수로 노출
window.PostEditForm = BoardSkin.PostSkin.EditForm; 
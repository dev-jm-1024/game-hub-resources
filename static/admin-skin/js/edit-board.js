document.addEventListener('DOMContentLoaded', function() {
    // CSRF 토큰 가져오기
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

    if (!csrfToken || !csrfHeader) {
        console.error('CSRF 토큰을 찾을 수 없습니다');
        return;
    }

    // 상태 메시지 표시 함수
    function showStatusMessage(messageElement, message, type) {
        messageElement.textContent = message;
        messageElement.className = 'status-message ' + type;
        messageElement.style.display = 'block';

        if (type === 'success') {
            setTimeout(function() {
                hideStatusMessage(messageElement);
            }, 3000);
        }
    }

    // 상태 메시지 숨김 함수
    function hideStatusMessage(messageElement) {
        messageElement.style.display = 'none';
    }

    // 필드 에러 스타일 적용 함수
    function showFieldError(inputElement) {
        inputElement.classList.add('field-error');
    }

    // 필드 에러 스타일 제거 함수
    function clearFieldError(inputElement) {
        inputElement.classList.remove('field-error');
    }

    // 모든 중복확인 버튼에 이벤트 리스너 설정
    const checkButtons = document.querySelectorAll('.check-btn');

    checkButtons.forEach(function(checkBtn) {
        const boardId = checkBtn.getAttribute('data-board-id');
        if (!boardId) return;

        // DOM 요소 가져오기
        const nameInput = document.getElementById('newName-' + boardId);
        const submitBtn = document.getElementById('submitBtn-' + boardId);
        const statusMessage = document.getElementById('statusMessage-' + boardId);
        const confirmedNameInput = document.getElementById('confirmedName-' + boardId);
        const editForm = document.getElementById('editForm-' + boardId);

        if (!nameInput || !submitBtn || !statusMessage || !confirmedNameInput || !editForm) {
            console.error('게시판 ' + boardId + '의 필수 요소를 찾을 수 없습니다');
            return;
        }

        // 이름 입력 시 중복확인 상태 초기화
        nameInput.addEventListener('input', function() {
            submitBtn.disabled = true;
            hideStatusMessage(statusMessage);
            clearFieldError(nameInput);
        });

        // 중복확인 버튼 클릭 이벤트
        checkBtn.addEventListener('click', function() {
            const boardName = nameInput.value.trim();

            // 입력값 검증
            if (!boardName) {
                showStatusMessage(statusMessage, "게시판 이름을 입력해주세요.", "warning");
                showFieldError(nameInput);
                return;
            }

            // 게시판 이름 길이 검증 (2-20자)
            if (boardName.length < 2 || boardName.length > 20) {
                showStatusMessage(statusMessage, "게시판 이름은 2자 이상 20자 이하로 입력해주세요.", "warning");
                showFieldError(nameInput);
                return;
            }

            // 특수문자 검증 (한글, 영문, 숫자, 공백만 허용)
            const nameRegex = /^[가-힣a-zA-Z0-9\s]+$/;
            if (!nameRegex.test(boardName)) {
                showStatusMessage(statusMessage, "게시판 이름은 한글, 영문, 숫자만 사용할 수 있습니다.", "warning");
                showFieldError(nameInput);
                return;
            }

            // 중복확인 버튼 비활성화
            checkBtn.disabled = true;
            checkBtn.textContent = "확인 중...";

            // FormData 생성
            const formData = new FormData();
            formData.append('boardName', boardName);

            // 서버에 중복확인 요청
            fetch('/admin/api/v1/board/create/check-name', {
                method: 'POST',
                headers: {
                    [csrfHeader]: csrfToken
                },
                body: formData
            })
                .then(function(response) {
                    if (response.ok) {
                        return response.text().then(function(message) {
                            showStatusMessage(statusMessage, message, "success");
                            clearFieldError(nameInput);
                            confirmedNameInput.value = boardName;
                            submitBtn.disabled = false;
                        });
                    } else if (response.status === 406) {
                        return response.text().then(function(message) {
                            showStatusMessage(statusMessage, message, "error");
                            showFieldError(nameInput);
                        });
                    } else if (response.status === 400) {
                        return response.text().then(function(message) {
                            showStatusMessage(statusMessage, message, "warning");
                            showFieldError(nameInput);
                        });
                    } else {
                        throw new Error('서버 응답 오류');
                    }
                })
                .catch(function(error) {
                    console.error('중복확인 오류:', error);
                    showStatusMessage(statusMessage, "중복확인 중 오류가 발생했습니다. 다시 시도해주세요.", "error");
                })
                .finally(function() {
                    checkBtn.disabled = false;
                    checkBtn.textContent = "중복확인";
                });
        });

        // 폼 제출 이벤트 처리 (새로 추가)
        editForm.addEventListener('submit', function(e) {
            e.preventDefault(); // 기본 폼 제출 방지

            const newName = confirmedNameInput.value;
            if (!newName) {
                showStatusMessage(statusMessage, "먼저 중복확인을 완료해주세요.", "warning");
                return;
            }

            // 제출 버튼 비활성화
            submitBtn.disabled = true;
            submitBtn.textContent = "수정 중...";

            // FormData 생성
            const formData = new FormData();
            formData.append('newName', newName);

            // 서버에 이름 수정 요청
            fetch('/admin/api/v1/board/' + boardId + '/name', {
                method: 'POST',
                headers: {
                    [csrfHeader]: csrfToken
                },
                body: formData
            })
                .then(function(response) {
                    if (response.ok) {
                        return response.text().then(function(message) {
                            showStatusMessage(statusMessage, message, "success");
                            // 성공 시 2초 후 리다이렉트
                            setTimeout(function() {
                                window.location.href = '/admin/board-status';
                            }, 2000);
                        });
                    } else {
                        return response.text().then(function(message) {
                            showStatusMessage(statusMessage, message || "수정에 실패했습니다.", "error");
                        });
                    }
                })
                .catch(function(error) {
                    console.error('수정 오류:', error);
                    showStatusMessage(statusMessage, "수정 중 오류가 발생했습니다. 다시 시도해주세요.", "error");
                })
                .finally(function() {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "게시판 이름 수정";
                });
        });
    });
});
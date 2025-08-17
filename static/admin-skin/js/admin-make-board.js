// DOM 요소가 로드될 때까지 기다리기
document.addEventListener('DOMContentLoaded', function() {

    // CSRF 토큰 가져오기
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

    if (!csrfToken || !csrfHeader) {
        console.error('CSRF 토큰을 찾을 수 없습니다');
        return;
    }

    // DOM 요소 가져오기
    const checkBoardNameBtn = document.getElementById('checkBoardNameBtn');
    const boardNameInput = document.getElementById('boardNameToCheck');
    const submitBtn = document.getElementById('submitBtn');
    const statusMessage = document.getElementById('statusMessage');
    const createBoardForm = document.getElementById('createBoardForm');
    const checkNameForm = document.getElementById('checkNameForm');
    const confirmedBoardNameInput = document.getElementById('confirmedBoardName');
    const createBoardSection = document.getElementById('createBoardSection');
    const confirmedNameDisplay = document.getElementById('confirmedNameDisplay');

    // 요소 존재 확인
    if (!checkBoardNameBtn) {
        console.error('checkBoardName 버튼을 찾을 수 없습니다');
        return;
    }
    if (!boardNameInput) {
        console.error('boardName 입력 필드를 찾을 수 없습니다');
        return;
    }
    if (!submitBtn) {
        console.error('submit 버튼을 찾을 수 없습니다');
        return;
    }

    let isNameChecked = false;
    let isNameAvailable = false;

    // 게시판 이름 입력 시 중복확인 상태 초기화
    boardNameInput.addEventListener('input', function() {
        isNameChecked = false;
        isNameAvailable = false;
        submitBtn.disabled = true;
        createBoardSection.style.display = 'none';
        hideStatusMessage();
        clearFieldError();
    });

    // 중복확인 폼 제출 이벤트
    checkNameForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const boardName = boardNameInput.value.trim();

        // 입력값 검증
        if (!boardName) {
            showStatusMessage("게시판 이름을 입력해주세요.", "warning");
            showFieldError();
            return;
        }

        // 게시판 이름 길이 검증 (2-20자)
        if (boardName.length < 2 || boardName.length > 20) {
            showStatusMessage("게시판 이름은 2자 이상 20자 이하로 입력해주세요.", "warning");
            showFieldError();
            return;
        }

        // 특수문자 검증 (한글, 영문, 숫자, 공백만 허용)
        const nameRegex = /^[가-힣a-zA-Z0-9\s]+$/;
        if (!nameRegex.test(boardName)) {
            showStatusMessage("게시판 이름은 한글, 영문, 숫자만 사용할 수 있습니다.", "warning");
            showFieldError();
            return;
        }

        // 중복확인 버튼 비활성화
        checkBoardNameBtn.disabled = true;
        checkBoardNameBtn.textContent = "확인 중...";

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
            .then(response => {
                if (response.ok) {
                    return response.text().then(message => {
                        showStatusMessage(message, "success");
                        isNameChecked = true;
                        isNameAvailable = true;
                        clearFieldError();

                        // 확인된 이름을 생성 폼에 설정
                        confirmedBoardNameInput.value = boardName;
                        confirmedNameDisplay.textContent = `확인된 게시판 이름: ${boardName}`;

                        // 게시판 생성 섹션 표시 및 버튼 활성화
                        createBoardSection.style.display = 'block';
                        submitBtn.disabled = false;
                    });
                } else if (response.status === 406) {
                    return response.text().then(message => {
                        showStatusMessage(message, "error");
                        isNameChecked = true;
                        isNameAvailable = false;
                        showFieldError();
                    });
                } else if (response.status === 400) {
                    return response.text().then(message => {
                        showStatusMessage(message, "warning");
                        showFieldError();
                    });
                } else {
                    throw new Error('서버 응답 오류');
                }
            })
            .catch(error => {
                console.error('중복확인 오류:', error);
                showStatusMessage("중복확인 중 오류가 발생했습니다. 다시 시도해주세요.", "error");
                isNameChecked = false;
                isNameAvailable = false;
            })
            .finally(() => {
                checkBoardNameBtn.disabled = false;
                checkBoardNameBtn.textContent = "이름 중복확인";
            });
    });

    // 게시판 생성 폼 제출 이벤트
    createBoardForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!isNameChecked || !isNameAvailable) {
            showStatusMessage("먼저 게시판 이름 중복확인을 완료해주세요.", "warning");
            return;
        }

        // 제출 버튼 비활성화
        submitBtn.disabled = true;
        submitBtn.textContent = "생성 중...";

        // FormData 생성
        const formData = new FormData(createBoardForm);

        // 서버에 게시판 생성 요청
        fetch('/admin/api/v1/board/create', {
            method: 'POST',
            headers: {
                [csrfHeader]: csrfToken
            },
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    return response.text().then(message => {
                        showStatusMessage(message, "success");
                        // 성공 시 리다이렉트
                        setTimeout(() => {
                            window.location.href = '/admin/board-status';
                        }, 1500);
                    });
                } else {
                    return response.text().then(message => {
                        showStatusMessage(message || "게시판 생성에 실패했습니다.", "error");
                        // 실패 시 현재 페이지 유지
                    });
                }
            })
            .catch(error => {
                console.error('게시판 생성 오류:', error);
                showStatusMessage("게시판 생성 중 오류가 발생했습니다. 다시 시도해주세요.", "error");
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = "게시판 생성";
            });
    });

    // 상태 메시지 표시 함수
    function showStatusMessage(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';

        // 성공 메시지의 경우 3초 후 자동 숨김
        if (type === 'success') {
            setTimeout(() => {
                hideStatusMessage();
            }, 3000);
        }
    }

    // 상태 메시지 숨김 함수
    function hideStatusMessage() {
        statusMessage.style.display = 'none';
    }

    // 필드 에러 스타일 적용 함수
    function showFieldError() {
        boardNameInput.classList.add('field-error');
    }

    // 필드 에러 스타일 제거 함수
    function clearFieldError() {
        boardNameInput.classList.remove('field-error');
    }

}); // DOMContentLoaded 이벤트 끝
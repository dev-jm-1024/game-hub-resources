document.addEventListener('DOMContentLoaded', function() {
    // CSRF 토큰 가져오기
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content');

    if (!csrfToken || !csrfHeader) {
        console.error('CSRF 토큰을 찾을 수 없습니다');
        return;
    }

    // 모든 활성화/비활성화 폼에 이벤트 리스너 설정
    const boardForms = document.querySelectorAll('form[action*="/admin/api/v1/board/"]');

    boardForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // 기본 폼 제출 방지

            const formAction = form.getAttribute('action');
            const submitButton = form.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;

            // 버튼 비활성화 및 텍스트 변경
            submitButton.disabled = true;
            submitButton.textContent = "처리 중...";

            // FormData 생성
            const formData = new FormData(form);

            // AJAX 요청
            fetch(formAction, {
                method: 'POST',
                headers: {
                    [csrfHeader]: csrfToken
                },
                body: formData
            })
                .then(function(response) {
                    return response.text().then(function(message) {
                        if (response.ok) {
                            // 성공 시
                            alert('성공: ' + message);
                            // 페이지 새로고침하여 상태 업데이트 반영
                            window.location.reload();
                        } else {
                            // 실패 시
                            alert('오류: ' + message);
                        }
                    });
                })
                .catch(function(error) {
                    console.error('요청 오류:', error);
                    alert('요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
                })
                .finally(function() {
                    // 버튼 상태 복원
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                });
        });
    });
});
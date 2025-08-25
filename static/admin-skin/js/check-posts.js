document.addEventListener('DOMContentLoaded', function() {
    // 삭제 확인 팝업 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
        .delete-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .delete-modal-content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            text-align: center;
            min-width: 300px;
        }
        
        .delete-modal h3 {
            margin: 0 0 20px 0;
            color: #333;
            font-size: 18px;
        }
        
        .delete-modal-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
        }
        
        .delete-modal button {
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .confirm-btn {
            background-color: #dc3545;
            color: white;
        }
        
        .confirm-btn:hover {
            background-color: #c82333;
        }
        
        .cancel-btn {
            background-color: #6c757d;
            color: white;
        }
        
        .cancel-btn:hover {
            background-color: #5a6268;
        }
    `;
    document.head.appendChild(style);

    // 삭제 확인 모달 HTML 생성
    const modalHTML = `
        <div id="deleteModal" class="delete-modal">
            <div class="delete-modal-content">
                <h3>게시물을 삭제하시겠습니까?</h3>
                <p>삭제된 게시물은 복구할 수 없습니다.</p>
                <div class="delete-modal-buttons">
                    <button type="button" class="confirm-btn" id="confirmDelete">삭제</button>
                    <button type="button" class="cancel-btn" id="cancelDelete">취소</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // 모달 요소들 가져오기
    const deleteModal = document.getElementById('deleteModal');
    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    let currentForm = null; // 현재 삭제할 폼을 저장

    // 모든 게시물 삭제 폼에 이벤트 리스너 설정
    const deleteForms = document.querySelectorAll('form[action*="/deactivate"]');

    deleteForms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // 기본 폼 제출 방지

            currentForm = form; // 현재 폼 저장
            deleteModal.style.display = 'flex'; // 모달 표시
        });
    });

    // 삭제 확인 버튼 클릭
    confirmBtn.addEventListener('click', function() {
        if (!currentForm) return;

        // 삭제 버튼 비활성화
        const submitButton = currentForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = '삭제 중...';
        }

        // FormData를 사용해서 폼 데이터 전송
        const formData = new FormData(currentForm);

        // 폼의 action URL 가져오기
        const actionUrl = currentForm.getAttribute('action');

        // 서버에 삭제 요청 (폼 데이터 전송)
        fetch(actionUrl, {
            method: 'POST',
            body: formData
        })
            .then(function(response) {
                if (response.ok) {
                    return response.text().then(function(message) {
                        alert('✅ ' + (message || '게시물이 성공적으로 삭제되었습니다.'));
                        // 성공 시 페이지 새로고침
                        window.location.reload();
                    });
                } else {
                    return response.text().then(function(message) {
                        alert('❌ ' + (message || '게시물 삭제에 실패했습니다.'));
                    });
                }
            })
            .catch(function(error) {
                console.error('삭제 오류:', error);
                alert('❌ 게시물 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
            })
            .finally(function() {
                // 버튼 상태 복원
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = '게시물 삭제';
                }
                hideModal();
            });
    });

    // 취소 버튼 클릭
    cancelBtn.addEventListener('click', function() {
        hideModal();
    });

    // 모달 외부 클릭 시 닫기
    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            hideModal();
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && deleteModal.style.display === 'flex') {
            hideModal();
        }
    });

    // 모달 숨기기 함수
    function hideModal() {
        deleteModal.style.display = 'none';
        currentForm = null;
    }
});
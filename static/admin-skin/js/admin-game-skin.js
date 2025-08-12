// CSRF 토큰 가져오기
function getCsrfToken() {
    return document.querySelector('meta[name="_csrf"]').getAttribute('content');
}

function getCsrfHeader() {
    return document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
}

// 공통 헤더 생성
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };

    const csrfToken = getCsrfToken();
    const csrfHeader = getCsrfHeader();

    if (csrfToken && csrfHeader) {
        headers[csrfHeader] = csrfToken;
    }

    return headers;
}

// 탭 전환 함수
function showTab(tabName) {
    // 모든 탭 비활성화
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // 모든 탭 pane 숨기기
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // 선택된 탭 활성화
    document.getElementById(`tab-${tabName}`).classList.add('active');
    document.getElementById(`${tabName}-pane`).classList.add('active');
}

// 검토 시작
function moveToReview(button) {
    const gameId = button.dataset.gameId;
    if (confirm('이 게임을 검토 단계로 이동하시겠습니까?')) {
        fetch(`/api/v1/admin/games/${gameId}/review`, {
            method: 'PATCH',
            headers: getHeaders()
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('검토 단계로 이동했습니다.');
                    location.reload();
                } else {
                    alert('오류가 발생했습니다: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('서버 오류가 발생했습니다.');
            });
    }
}

// 게임 승인
function approveGame(button) {
    const gameId = button.dataset.gameId;
    if (confirm('이 게임을 승인하시겠습니까? 승인 후 사용자에게 공개됩니다.')) {
        fetch(`/api/v1/admin/games/${gameId}/approve`, {
            method: 'PATCH',
            headers: getHeaders()
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('게임이 승인되어 활성화되었습니다.');
                    location.reload();
                } else {
                    alert('오류가 발생했습니다: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('서버 오류가 발생했습니다.');
            });
    }
}

// 게임 거부
function rejectGame(button) {
    const gameId = button.dataset.gameId;
    const reason = prompt('거부 사유를 입력해주세요:');
    if (reason && confirm('이 게임을 거부하시겠습니까?')) {
        fetch(`/api/v1/admin/games/${gameId}/reject`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ reason: reason })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('게임이 거부되었습니다.');
                    location.reload();
                } else {
                    alert('오류가 발생했습니다: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('서버 오류가 발생했습니다.');
            });
    }
}

// 게임 정지
function suspendGame(button) {
    const gameId = button.dataset.gameId;
    if (confirm('이 게임을 정지하시겠습니까? 사용자에게 더 이상 노출되지 않습니다.')) {
        fetch(`/api/v1/admin/games/${gameId}/suspend`, {
            method: 'PATCH',
            headers: getHeaders()
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('게임이 정지되었습니다.');
                    location.reload();
                } else {
                    alert('오류가 발생했습니다: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('서버 오류가 발생했습니다.');
            });
    }
}

// 게임 서비스 종료
function deactivateGame(button) {
    const gameId = button.dataset.gameId;
    if (confirm('이 게임 서비스를 종료하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        fetch(`/api/v1/admin/games/${gameId}/deactivate`, {
            method: 'PATCH',
            headers: getHeaders()
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('게임 서비스가 종료되었습니다.');
                    location.reload();
                } else {
                    alert('오류가 발생했습니다: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('서버 오류가 발생했습니다.');
            });
    }
}

// 게임 재활성화
function reactivateGame(button) {
    const gameId = button.dataset.gameId;
    if (confirm('이 게임을 다시 활성화하시겠습니까?')) {
        fetch(`/api/v1/admin/games/${gameId}/reactivate`, {
            method: 'PATCH',
            headers: getHeaders()
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('게임이 재활성화되었습니다.');
                    location.reload();
                } else {
                    alert('오류가 발생했습니다: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('서버 오류가 발생했습니다.');
            });
    }
}

// 노출/숨김 토글
function toggleVisibility(button) {
    const gameId = button.dataset.gameId;
    const isVisible = button.dataset.visible === 'true';
    const action = isVisible ? '숨기기' : '노출하기';

    if (confirm(`이 게임을 ${action} 하시겠습니까?`)) {
        fetch(`/api/v1/admin/games/${gameId}/toggle-visibility`, {
            method: 'PATCH',
            headers: getHeaders()
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`게임이 ${action} 되었습니다.`);
                    location.reload();
                } else {
                    alert('오류가 발생했습니다: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('서버 오류가 발생했습니다.');
            });
    }
}

// 게임 플레이
function playGame(button) {
    const gameId = button.dataset.gameId;
    fetch(`/api/v1/admin/games/${gameId}/play-url`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.playUrl) {
                window.open(data.playUrl, '_blank');
            } else {
                alert('게임 플레이 URL을 찾을 수 없습니다.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('서버 오류가 발생했습니다.');
        });
}

// 파일 다운로드
function downloadFile(button) {
    const fileUrl = button.dataset.fileUrl;
    if (fileUrl && fileUrl !== '') {
        window.open(fileUrl, '_blank');
    } else {
        alert('다운로드할 파일이 없습니다.');
    }
}
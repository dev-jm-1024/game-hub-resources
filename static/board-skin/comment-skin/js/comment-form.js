// comment-form.js
document.addEventListener('DOMContentLoaded', function() {
  const commentForm = document.getElementById('commentForm');

  if (commentForm) {
    // 폼 제출 이벤트를 가로채서 AJAX로 처리하되, 기본 form 태그 방식처럼 동작
    commentForm.addEventListener('submit', function(e) {
      e.preventDefault(); // 기본 제출 방지 (AJAX로 처리하기 위해)

      const formData = new FormData(commentForm);
      const commentContent = formData.get('commentContent');

      // 댓글 내용 검증
      if (!commentContent || commentContent.trim() === '') {
        showNotification('댓글 내용을 입력해주세요.', 'warning');
        return;
      }

      // 제출 버튼 비활성화 (중복 제출 방지)
      const submitButton = commentForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = '등록 중...';

      // form의 action과 method를 사용하여 AJAX 요청
      fetch(commentForm.action, {
        method: commentForm.method.toUpperCase(),
        body: formData
      })
          .then(response => {
            return response.text().then(message => {
              if (response.ok) {
                // 성공 처리
                showNotification(message || '댓글이 성공적으로 등록되었습니다.', 'success');
                commentForm.reset(); // 폼 초기화

                // 댓글 목록 새로고침 (선택사항)
                setTimeout(() => {
                  refreshCommentList();
                }, 500);

              } else {
                // 실패 처리
                let displayMessage = message || '댓글 등록에 실패했습니다.';

                // HTTP 상태 코드별 메시지 처리
                switch (response.status) {
                  case 400:
                    displayMessage = message || '잘못된 요청입니다. 입력 내용을 확인해주세요.';
                    break;
                  case 401:
                    displayMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
                    break;
                  case 403:
                    displayMessage = '권한이 없습니다.';
                    break;
                  case 500:
                    displayMessage = message || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                    break;
                }

                showNotification(displayMessage, 'error');
              }
            });
          })
          .catch(error => {
            console.error('댓글 등록 오류:', error);
            showNotification('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.', 'error');
          })
          .finally(() => {
            // 제출 버튼 다시 활성화
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
          });
    });
  }
});

// 사용자 친화적인 알림 표시 함수
function showNotification(message, type = 'info') {
  // 기존 알림이 있다면 제거
  const existingNotification = document.querySelector('.comment-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // 알림 요소 생성
  const notification = document.createElement('div');
  notification.className = `comment-notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="알림 닫기">×</button>
        </div>
    `;

  // 알림 스타일 적용
  const styles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '0',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    zIndex: '9999',
    maxWidth: '400px',
    minWidth: '300px',
    wordWrap: 'break-word',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out',
    opacity: '0',
    fontFamily: 'Arial, sans-serif'
  };

  // 타입별 배경색 설정
  const typeColors = {
    'success': '#28a745',
    'error': '#dc3545',
    'warning': '#ffc107',
    'info': '#17a2b8'
  };

  Object.assign(notification.style, styles);
  notification.style.backgroundColor = typeColors[type] || typeColors.info;

  // 경고 메시지의 경우 텍스트 색상 조정
  if (type === 'warning') {
    notification.style.color = '#212529';
  }

  // 내부 콘텐츠 스타일
  const content = notification.querySelector('.notification-content');
  Object.assign(content.style, {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 20px',
    gap: '10px'
  });

  // 닫기 버튼 스타일
  const closeButton = notification.querySelector('.notification-close');
  Object.assign(closeButton.style, {
    background: 'none',
    border: 'none',
    color: 'inherit',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0',
    marginLeft: 'auto',
    opacity: '0.7',
    lineHeight: '1'
  });

  closeButton.addEventListener('mouseenter', () => closeButton.style.opacity = '1');
  closeButton.addEventListener('mouseleave', () => closeButton.style.opacity = '0.7');
  closeButton.addEventListener('click', () => hideNotification(notification));

  // DOM에 추가
  document.body.appendChild(notification);

  // 애니메이션으로 나타나기
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
  }, 10);

  // 5초 후 자동으로 사라지기
  setTimeout(() => {
    hideNotification(notification);
  }, 5000);

  // 클릭하면 즉시 사라지기 (닫기 버튼 외의 영역)
  notification.addEventListener('click', function(e) {
    if (!e.target.classList.contains('notification-close')) {
      hideNotification(notification);
    }
  });
}

// 알림 숨기기 함수
function hideNotification(notification) {
  if (notification && notification.parentNode) {
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// 타입별 아이콘 반환
function getNotificationIcon(type) {
  const icons = {
    'success': '✅',
    'error': '❌',
    'warning': '⚠️',
    'info': 'ℹ️'
  };
  return icons[type] || icons.info;
}

// 댓글 목록 새로고침 함수
function refreshCommentList() {
  // 현재 페이지를 새로고침하지 않고 댓글 목록만 업데이트하는 방법
  // 1. 페이지 새로고침 (가장 간단한 방법)
  // window.location.reload();

  // 2. 댓글 목록 영역만 다시 로드하는 방법 (더 좋은 UX)
  const commentListContainer = document.querySelector('#comment-section .comment-list, .comment-view, [data-comment-list]');

  if (commentListContainer) {
    // 현재 페이지의 댓글 목록을 다시 가져오기
    const currentUrl = window.location.pathname;

    fetch(currentUrl, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest' // AJAX 요청임을 표시
      }
    })
        .then(response => response.text())
        .then(html => {
          // 응답에서 댓글 목록 부분만 추출
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const newCommentList = doc.querySelector('#comment-section .comment-list, .comment-view, [data-comment-list]');

          if (newCommentList) {
            commentListContainer.innerHTML = newCommentList.innerHTML;
          }
        })
        .catch(error => {
          console.log('댓글 목록 새로고침 실패:', error);
          // 실패하면 페이지 새로고침
          // window.location.reload();
        });
  }
}

// 폼 입력 시 실시간 검증 및 UX 개선
document.addEventListener('DOMContentLoaded', function() {
  const commentInput = document.querySelector('#commentForm input[name="commentContent"]');

  if (commentInput) {
    // 엔터키로 제출
    commentInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        commentForm.dispatchEvent(new Event('submit'));
      }
    });

    // 입력 시 글자 수 제한
    commentInput.addEventListener('input', function() {
      const maxLength = 500;
      if (this.value.length > maxLength) {
        this.value = this.value.substring(0, maxLength);
        showNotification(`댓글은 최대 ${maxLength}자까지 입력 가능합니다.`, 'warning');
      }
    });

    // 입력 필드 포커스 시 이전 경고 메시지 제거
    commentInput.addEventListener('focus', function() {
      const existingWarning = document.querySelector('.comment-notification.notification-warning');
      if (existingWarning) {
        hideNotification(existingWarning);
      }
    });

    // 플레이스홀더 추가 (없는 경우)
    if (!commentInput.placeholder) {
      commentInput.placeholder = '댓글을 입력하세요...';
    }
  }
});
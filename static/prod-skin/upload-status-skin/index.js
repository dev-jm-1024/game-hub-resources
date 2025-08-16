function showTab(tabName) {
    // 모든 탭 비활성화
    document.querySelectorAll('.status-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');

    // 선택된 탭 활성화
    document.getElementById('tab-' + tabName).classList.add('active');
    document.getElementById(tabName + '-games').style.display = 'block';
}

function toggleDetails(button) {
    const details = button.closest('.game-card').querySelector('.game-details');
    const icon = button.querySelector('i');

    if (details.style.display === 'none') {
        details.style.display = 'block';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
        button.innerHTML = '<i class="fas fa-chevron-up me-1"></i>접기';
    } else {
        details.style.display = 'none';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
        button.innerHTML = '<i class="fas fa-chevron-down me-1"></i>상세보기';
    }
}

// 페이지 로드 시 첫 번째 탭 표시
document.addEventListener('DOMContentLoaded', function() {
    showTab('pending');
});
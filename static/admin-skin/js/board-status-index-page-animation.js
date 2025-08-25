document.addEventListener('DOMContentLoaded', function() {
    console.log('GSAP 애니메이션 스크립트 시작');

    // GSAP가 로드되었는지 확인
    if (typeof gsap === 'undefined') {
        console.error('GSAP가 로드되지 않았습니다!');
        return;
    }

    console.log('GSAP 로드 완료');

    // 페이지 로드 시 페이드인 효과
    gsap.fromTo('body',
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    // 버튼들에 호버 효과 추가
    const buttons = document.querySelectorAll('.btn-edit, .btn-create');

    buttons.forEach(button => {
        // 마우스 오버 효과
        button.addEventListener('mouseenter', function() {
            gsap.to(this, {
                y: -3,
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)"
            });
        });

        // 마우스 아웃 효과
        button.addEventListener('mouseleave', function() {
            gsap.to(this, {
                y: 0,
                scale: 1,
                duration: 0.3,
                ease: "power2.out",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
            });
        });
    });

    // 정보 수정 버튼 클릭 효과
    const editButton = document.querySelector('.btn-edit');
    if (editButton) {
        editButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('정보 수정 버튼 클릭됨!');

            const targetUrl = '/admin/board-status/edit';

            // 클릭 효과: 버튼 축소
            gsap.to(this, {
                scale: 0.95,
                duration: 0.1,
                ease: "power2.out"
            });

            // 페이지 전환 애니메이션
            const tl = gsap.timeline({
                onComplete: function() {
                    console.log('애니메이션 완료, 페이지 이동:', targetUrl);
                    window.location.href = targetUrl;
                }
            });

            // 복잡한 페이드아웃 효과
            tl.to('.container', {
                y: -50,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            })
                .to('body', {
                    opacity: 0,
                    duration: 0.2,
                    ease: "power2.in"
                }, "-=0.2");
        });
    }

    // 게시판 만들기 버튼 클릭 효과
    const createButton = document.querySelector('.btn-create');
    if (createButton) {
        createButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('게시판 만들기 버튼 클릭됨!');

            const targetUrl = '/admin/board-status/board/create';

            // 클릭 효과: 버튼 축소
            gsap.to(this, {
                scale: 0.95,
                duration: 0.1,
                ease: "power2.out"
            });

            // 페이지 전환 애니메이션 (다른 효과)
            const tl = gsap.timeline({
                onComplete: function() {
                    console.log('애니메이션 완료, 페이지 이동:', targetUrl);
                    window.location.href = targetUrl;
                }
            });

            // 슬라이드 아웃 효과
            tl.to('.container', {
                x: -100,
                opacity: 0,
                duration: 0.4,
                ease: "power2.in"
            })
                .to('body', {
                    opacity: 0,
                    duration: 0.2,
                    ease: "power2.in"
                }, "-=0.2");
        });
    }

    // 테이블 로우에 스태거 애니메이션 (있을 경우)
    const tableRows = document.querySelectorAll('.board-table tbody tr');
    if (tableRows.length > 0) {
        gsap.fromTo(tableRows,
            { opacity: 0, y: 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.3
            }
        );
    }

    // 액션 버튼들에도 애니메이션
    const actionButtons = document.querySelectorAll('.action-buttons .btn');
    if (actionButtons.length > 0) {
        gsap.fromTo(actionButtons,
            { opacity: 0, y: -20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.2
            }
        );
    }

    console.log('GSAP 애니메이션 설정 완료');
});
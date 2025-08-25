document.addEventListener('DOMContentLoaded', function() {
    console.log('Edit Board GSAP 애니메이션 스크립트 시작');

    // GSAP가 로드되었는지 확인
    if (typeof gsap === 'undefined') {
        console.error('GSAP가 로드되지 않았습니다!');
        return;
    }

    console.log('GSAP 로드 완료');

    // 페이지 로드 시 오른쪽에서 슬라이드인 효과 (다음 페이지에서 온 느낌)
    gsap.fromTo('body',
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
    );

    // 네비게이션 버튼들에 호버 효과
    const navButtons = document.querySelectorAll('.nav-btn');

    navButtons.forEach(button => {
        // 마우스 오버 효과
        button.addEventListener('mouseenter', function() {
            gsap.to(this, {
                scale: 1.05,
                y: -2,
                duration: 0.3,
                ease: "power2.out",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)"
            });
        });

        // 마우스 아웃 효과
        button.addEventListener('mouseleave', function() {
            gsap.to(this, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: "power2.out",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
            });
        });
    });

    // 이전 페이지 버튼 클릭 효과
    const backButton = document.querySelector('.back-btn');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('이전 페이지 버튼 클릭됨!');

            const targetUrl = '/admin/board-status';

            // 클릭 효과
            gsap.to(this, {
                scale: 0.95,
                duration: 0.1,
                ease: "power2.out"
            });

            // 이전 페이지로 돌아가는 애니메이션 (왼쪽으로 슬라이드아웃)
            const tl = gsap.timeline({
                onComplete: function() {
                    console.log('애니메이션 완료, 이전 페이지로 이동:', targetUrl);
                    window.location.href = targetUrl;
                }
            });

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

    // 홈 버튼 클릭 효과
    const homeButton = document.querySelector('.home-btn');
    if (homeButton) {
        homeButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('홈 버튼 클릭됨!');

            const targetUrl = '/admin';

            // 클릭 효과
            gsap.to(this, {
                scale: 0.95,
                duration: 0.1,
                ease: "power2.out"
            });

            // 홈으로 가는 애니메이션 (위로 축소되며 사라지는 효과)
            const tl = gsap.timeline({
                onComplete: function() {
                    console.log('애니메이션 완료, 홈으로 이동:', targetUrl);
                    window.location.href = targetUrl;
                }
            });

            tl.to('.container', {
                scale: 0.8,
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

    // 기존 "게시판 관리로 돌아가기" 링크에도 애니메이션 적용
    const backLinkButton = document.querySelector('.back-btn-link');
    if (backLinkButton) {
        backLinkButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('게시판 관리로 돌아가기 링크 클릭됨!');

            const targetUrl = '/admin/board-status';

            // 부드러운 페이드아웃 효과
            const tl = gsap.timeline({
                onComplete: function() {
                    console.log('애니메이션 완료, 게시판 관리로 이동:', targetUrl);
                    window.location.href = targetUrl;
                }
            });

            tl.to('.container', {
                y: 20,
                opacity: 0,
                duration: 0.3,
                ease: "power2.in"
            })
                .to('body', {
                    opacity: 0,
                    duration: 0.2,
                    ease: "power2.in"
                }, "-=0.1");
        });
    }

    // 게시판 수정 항목들에 스태거 애니메이션
    const boardItems = document.querySelectorAll('.board-edit-item');
    if (boardItems.length > 0) {
        gsap.fromTo(boardItems,
            { opacity: 0, y: 30, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.3
            }
        );
    }

    // 네비게이션 버튼들 애니메이션
    const navButtonsAnimation = document.querySelectorAll('.nav-btn');
    if (navButtonsAnimation.length > 0) {
        gsap.fromTo(navButtonsAnimation,
            { opacity: 0, y: -30 },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.1
            }
        );
    }

    // 제목 애니메이션
    const title = document.querySelector('h2');
    if (title) {
        gsap.fromTo(title,
            { opacity: 0, y: -20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                delay: 0.2
            }
        );
    }

    console.log('Edit Board GSAP 애니메이션 설정 완료');
});
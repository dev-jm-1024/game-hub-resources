// Apple macOS/iOS 스타일 푸터 JavaScript

class AppleFooterManager {
    constructor() {
        this.footer = null;
        this.backToTopBtn = null;
        this.intersectionObserver = null;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isScrolling = false;

        this.init();
    }

    init() {
        this.footer = document.querySelector('.site-footer');
        if (!this.footer) return;

        this.setupBackToTop();
        this.setupFooterAnimations();
        this.setupSocialLinks();
        this.setupContactLinks();
        this.setupAccessibility();
        this.setupResponsiveHandling();
        this.setupPerformanceOptimizations();
    }

    setupBackToTop() {
        this.backToTopBtn = this.footer.querySelector('.back-to-top');
        if (!this.backToTopBtn) {
            this.createBackToTopButton();
        }

        this.backToTopBtn.addEventListener('click', () => {
            this.scrollToTop();
        });

        // 스크롤 위치에 따라 버튼 표시/숨김
        let ticking = false;
        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.toggleBackToTopButton();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    createBackToTopButton() {
        this.backToTopBtn = document.createElement('button');
        this.backToTopBtn.className = 'back-to-top';
        this.backToTopBtn.innerHTML = `
            <svg class="back-to-top-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M10 4l6 6H4l6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        this.backToTopBtn.setAttribute('aria-label', '맨 위로 이동');

        document.body.appendChild(this.backToTopBtn);
    }

    toggleBackToTopButton() {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const threshold = windowHeight * 0.3;

        if (scrollPosition > threshold) {
            this.backToTopBtn.classList.add('visible');
        } else {
            this.backToTopBtn.classList.remove('visible');
        }
    }

    scrollToTop() {
        if (this.isScrolling) return;

        this.isScrolling = true;

        // Apple 스타일 부드러운 스크롤
        const startPosition = window.pageYOffset;
        const startTime = performance.now();
        const duration = 800;

        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

        const animateScroll = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeOutCubic(progress);

            const currentPosition = startPosition * (1 - easeProgress);
            window.scrollTo(0, currentPosition);

            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                this.isScrolling = false;
            }
        };

        requestAnimationFrame(animateScroll);
    }

    setupFooterAnimations() {
        if (this.prefersReducedMotion) return;

        // 푸터 섹션 애니메이션
        const footerSections = this.footer.querySelectorAll('.footer-section');

        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateFooterSection(entry.target);
                        this.intersectionObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '50px 0px'
            }
        );

        footerSections.forEach(section => {
            this.intersectionObserver.observe(section);
        });

        // 푸터 전체 애니메이션
        this.animateFooterEntrance();
    }

    animateFooterSection(section) {
        if (this.prefersReducedMotion) return;

        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';

        requestAnimationFrame(() => {
            section.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        });
    }

    animateFooterEntrance() {
        if (this.prefersReducedMotion) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.footer.style.opacity = '0';
                        this.footer.style.transform = 'translateY(50px)';

                        requestAnimationFrame(() => {
                            this.footer.style.transition = 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                            this.footer.style.opacity = '1';
                            this.footer.style.transform = 'translateY(0)';
                        });

                        observer.unobserve(this.footer);
                    }
                });
            },
            { threshold: 0.1 }
        );

        observer.observe(this.footer);
    }

    setupSocialLinks() {
        const socialLinks = this.footer.querySelectorAll('.social-link');

        socialLinks.forEach(link => {
            this.setupSocialLinkInteraction(link);
        });
    }

    setupSocialLinkInteraction(link) {
        // 호버 효과 강화
        link.addEventListener('mouseenter', () => {
            if (this.prefersReducedMotion) return;

            const icon = link.querySelector('.social-icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(5deg)';
            }
        });

        link.addEventListener('mouseleave', () => {
            const icon = link.querySelector('.social-icon');
            if (icon) {
                icon.style.transform = '';
            }
        });

        // 클릭 애니메이션
        link.addEventListener('click', (e) => {
            this.animateSocialClick(link);
            this.trackSocialClick(link);
        });

        // 터치 지원
        link.addEventListener('touchstart', () => {
            link.style.transform = 'scale(0.95)';
        });

        link.addEventListener('touchend', () => {
            setTimeout(() => {
                link.style.transform = '';
            }, 150);
        });
    }

    animateSocialClick(link) {
        if (this.prefersReducedMotion) return;

        // 클릭 애니메이션
        link.style.transform = 'scale(0.9)';

        setTimeout(() => {
            link.style.transform = 'scale(1.05)';

            setTimeout(() => {
                link.style.transform = '';
            }, 100);
        }, 100);
    }

    trackSocialClick(link) {
        const platform = this.getSocialPlatform(link);

        if (platform) {
            // 분석 이벤트 전송
            this.sendAnalyticsEvent('social_click', {
                platform: platform,
                url: link.href,
                timestamp: new Date().toISOString()
            });
        }
    }

    getSocialPlatform(link) {
        const classList = Array.from(link.classList);
        const platforms = ['twitter', 'facebook', 'instagram', 'youtube', 'linkedin'];

        return platforms.find(platform => classList.includes(platform)) || 'unknown';
    }

    setupContactLinks() {
        const contactLinks = this.footer.querySelectorAll('.contact-link');

        contactLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleContactClick(link, e);
            });

            // 호버 효과
            link.addEventListener('mouseenter', () => {
                if (this.prefersReducedMotion) return;

                link.style.transform = 'translateY(-2px)';
            });

            link.addEventListener('mouseleave', () => {
                link.style.transform = '';
            });
        });
    }

    handleContactClick(link, event) {
        const href = link.getAttribute('href');

        if (href && href.startsWith('mailto:')) {
            // 이메일 클릭 추적
            this.sendAnalyticsEvent('contact_email_click', {
                email: href.replace('mailto:', ''),
                timestamp: new Date().toISOString()
            });

            // 클릭 피드백
            this.showContactFeedback(link, '이메일 앱을 여는 중...');
        }
    }

    showContactFeedback(element, message) {
        const feedback = document.createElement('div');
        feedback.className = 'contact-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--system-blue);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 1000;
        `;

        element.style.position = 'relative';
        element.appendChild(feedback);

        requestAnimationFrame(() => {
            feedback.style.opacity = '1';
        });

        setTimeout(() => {
            feedback.style.opacity = '0';
            setTimeout(() => {
                feedback.remove();
            }, 300);
        }, 2000);
    }

    setupAccessibility() {
        // 키보드 네비게이션 지원
        const focusableElements = this.footer.querySelectorAll(`
            .legal-link,
            .quick-link,
            .social-link,
            .contact-link,
            .back-to-top
        `);

        focusableElements.forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });

            element.addEventListener('focus', () => {
                this.ensureElementVisible(element);
            });
        });

        // 스크린 리더 지원
        this.setupScreenReaderSupport();
    }

    setupScreenReaderSupport() {
        // 동적 콘텐츠 업데이트 시 스크린 리더에 알림
        const copyrightElement = this.footer.querySelector('.copyright-text');
        if (copyrightElement) {
            copyrightElement.setAttribute('aria-live', 'polite');
            this.updateCopyrightYear();
        }

        // 소셜 링크에 더 자세한 설명 추가
        const socialLinks = this.footer.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            const platform = this.getSocialPlatform(link);
            const currentLabel = link.getAttribute('aria-label') || '';

            if (platform && !currentLabel.includes('새 창')) {
                link.setAttribute('aria-label', `${currentLabel} (새 창에서 열림)`);
            }
        });
    }

    ensureElementVisible(element) {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isVisible) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    setupResponsiveHandling() {
        let resizeTimeout;

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 150);
        });

        this.handleResize();
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;

        // 모바일에서 애니메이션 최적화
        if (isMobile && !this.prefersReducedMotion) {
            this.optimizeForMobile();
        }

        // 백투탑 버튼 위치 조정
        this.adjustBackToTopPosition();
    }

    optimizeForMobile() {
        // 모바일에서 복잡한 애니메이션 비활성화
        const footerSections = this.footer.querySelectorAll('.footer-section');
        footerSections.forEach(section => {
            section.style.animation = 'none';
            section.style.transform = 'none';
            section.style.opacity = '1';
        });
    }

    adjustBackToTopPosition() {
        if (!this.backToTopBtn) return;

        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;

        if (isSmallMobile) {
            this.backToTopBtn.style.bottom = '16px';
            this.backToTopBtn.style.right = '16px';
        } else if (isMobile) {
            this.backToTopBtn.style.bottom = '24px';
            this.backToTopBtn.style.right = '24px';
        } else {
            this.backToTopBtn.style.bottom = '32px';
            this.backToTopBtn.style.right = '32px';
        }
    }

    setupPerformanceOptimizations() {
        // 이미지 지연 로딩 (소셜 아이콘 등)
        this.setupLazyLoading();

        // 메모리 누수 방지
        this.setupMemoryManagement();
    }

    setupLazyLoading() {
        if (!('IntersectionObserver' in window)) return;

        const images = this.footer.querySelectorAll('img');
        if (images.length === 0) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }

                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => {
            imageObserver.observe(img);
        });
    }

    setupMemoryManagement() {
        // 페이지 언로드 시 이벤트 리스너 정리
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // 가비지 컬렉션 최적화
        this.setupGarbageCollection();
    }

    setupGarbageCollection() {
        // 주기적으로 불필요한 참조 정리
        setInterval(() => {
            this.cleanupUnusedReferences();
        }, 60000); // 1분마다
    }

    cleanupUnusedReferences() {
        // 더 이상 사용되지 않는 DOM 참조 정리
        const elements = this.footer.querySelectorAll('.removed');
        elements.forEach(element => {
            element.remove();
        });
    }

    // 유틸리티 메서드들
    sendAnalyticsEvent(eventName, data) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }

        // 자체 분석 시스템
        if (window.analytics) {
            window.analytics.track(eventName, data);
        }

        // 콘솔 로그 (개발 환경)
        if (process.env.NODE_ENV === 'development') {
            console.log(`Analytics Event: ${eventName}`, data);
        }
    }

    updateCopyrightYear() {
        const copyrightElement = this.footer.querySelector('.copyright-text');
        if (copyrightElement) {
            const currentYear = new Date().getFullYear();
            const text = copyrightElement.textContent;

            if (text && !text.includes(currentYear.toString())) {
                copyrightElement.textContent = text.replace(/\d{4}/, currentYear);
            }
        }
    }

    // 다크 모드 감지 및 처리
    setupThemeHandling() {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

        darkModeQuery.addEventListener('change', (e) => {
            this.handleThemeChange(e.matches);
        });

        this.handleThemeChange(darkModeQuery.matches);
    }

    handleThemeChange(isDark) {
        this.footer.classList.toggle('dark-mode', isDark);

        // 테마 변경 애니메이션
        if (!this.prefersReducedMotion) {
            this.footer.style.transition = 'all 0.3s ease-out';
            setTimeout(() => {
                this.footer.style.transition = '';
            }, 300);
        }
    }

    // 정리 메서드
    cleanup() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }

        // 모든 타이머 정리
        clearInterval(this.garbageCollectionInterval);

        // 이벤트 리스너 정리
        window.removeEventListener('scroll', this.scrollHandler);
        window.removeEventListener('resize', this.resizeHandler);
    }

    // 공개 API
    refresh() {
        this.cleanup();
        this.init();
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `footer-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="닫기">×</button>
            </div>
        `;

        this.footer.appendChild(notification);

        // 자동 제거
        setTimeout(() => {
            notification.remove();
        }, 5000);

        // 수동 제거
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// 테마 감지 및 처리
class AppleThemeManager {
    constructor() {
        this.darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.init();
    }

    init() {
        this.darkModeQuery.addEventListener('change', (e) => {
            this.handleThemeChange(e.matches);
        });

        this.handleThemeChange(this.darkModeQuery.matches);
    }

    handleThemeChange(isDark) {
        document.body.classList.toggle('dark-mode', isDark);

        // 테마 변경 이벤트 전송
        window.dispatchEvent(new CustomEvent('themechange', {
            detail: { isDark }
        }));
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 푸터 매니저 초기화
    window.appleFooterManager = new AppleFooterManager();

    // 테마 매니저 초기화
    window.appleThemeManager = new AppleThemeManager();

    // 전역 API 노출
    window.AppleFooter = {
        refresh: () => window.appleFooterManager.refresh(),
        scrollToTop: () => window.appleFooterManager.scrollToTop(),
        scrollToSection: (id) => window.appleFooterManager.scrollToSection(id),
        showNotification: (msg, type) => window.appleFooterManager.showNotification(msg, type)
    };
});

// 성능 모니터링
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`푸터 로드 시간: ${loadTime.toFixed(2)}ms`);
    });
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (window.appleFooterManager) {
        window.appleFooterManager.cleanup();
    }
});
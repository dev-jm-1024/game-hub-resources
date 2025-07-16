// Apple macOS/iOS 스타일 푸터 JavaScript

class FooterManager {
    constructor() {
        this.footer = null;
        this.newsletterForm = null;
        this.languageSelector = null;
        this.scrollToTopBtn = null;

        this.init();
    }

    init() {
        this.footer = document.querySelector('.site-footer');
        if (!this.footer) return;

        this.setupNewsletter();
        this.setupLanguageSelector();
        this.setupScrollToTop();
        this.setupSocialLinks();
        this.setupAppStoreLinks();
        this.setupFooterAnimations();
    }

    setupNewsletter() {
        this.newsletterForm = this.footer.querySelector('.newsletter-form');
        if (!this.newsletterForm) return;

        const emailInput = this.newsletterForm.querySelector('.newsletter-input');
        const submitBtn = this.newsletterForm.querySelector('.newsletter-btn');

        this.newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNewsletterSubmit(emailInput.value, submitBtn);
        });

        // 실시간 이메일 검증
        emailInput.addEventListener('input', (e) => {
            this.validateEmail(e.target);
        });
    }

    validateEmail(input) {
        const email = input.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email && !emailRegex.test(email)) {
            input.classList.add('error');
            this.showFieldError(input, '올바른 이메일 주소를 입력해주세요.');
        } else {
            input.classList.remove('error');
            this.hideFieldError(input);
        }
    }

    showFieldError(input, message) {
        let errorElement = input.parentNode.querySelector('.field-error');

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            errorElement.style.cssText = `
                color: var(--system-red);
                font-size: 12px;
                margin-top: 4px;
                font-family: 'SF Pro Text', sans-serif;
            `;
            input.parentNode.appendChild(errorElement);
        }

        errorElement.textContent = message;
    }

    hideFieldError(input) {
        const errorElement = input.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    async handleNewsletterSubmit(email, button) {
        if (!email || !this.validateEmailFormat(email)) {
            App.notifications.error('올바른 이메일 주소를 입력해주세요.');
            return;
        }

        const originalText = button.textContent;
        button.textContent = '구독 중...';
        button.disabled = true;

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (response.ok) {
                App.notifications.success('뉴스레터 구독이 완료되었습니다!');
                this.newsletterForm.reset();
                this.showSubscriptionSuccess();
            } else {
                throw new Error(result.message || '구독 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            App.notifications.error(error.message || '구독 중 오류가 발생했습니다.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    validateEmailFormat(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showSubscriptionSuccess() {
        const form = this.newsletterForm;
        const successMessage = document.createElement('div');
        successMessage.className = 'subscription-success';
        successMessage.innerHTML = `
            <div class="success-icon">✓</div>
            <div class="success-text">구독해주셔서 감사합니다!</div>
        `;
        successMessage.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--system-green);
            font-size: 14px;
            margin-top: 12px;
        `;

        form.appendChild(successMessage);

        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }

    setupLanguageSelector() {
        this.languageSelector = this.footer.querySelector('.language-selector');
        if (!this.languageSelector) return;

        this.languageSelector.addEventListener('click', () => {
            this.showLanguageOptions();
        });
    }

    showLanguageOptions() {
        const options = [
            { code: 'ko', name: '한국어', flag: '🇰🇷' },
            { code: 'en', name: 'English', flag: '🇺🇸' },
            { code: 'ja', name: '日本語', flag: '🇯🇵' },
            { code: 'zh', name: '中文', flag: '🇨🇳' }
        ];

        const dropdown = document.createElement('div');
        dropdown.className = 'language-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            background: var(--background-tertiary);
            border: 1px solid var(--separator-non-opaque);
            border-radius: 8px;
            box-shadow: var(--shadow-heavy);
            min-width: 120px;
            z-index: 1000;
        `;

        const optionsHtml = options.map(option => `
            <div class="language-option" data-lang="${option.code}">
                <span class="language-flag">${option.flag}</span>
                <span class="language-name">${option.name}</span>
            </div>
        `).join('');

        dropdown.innerHTML = optionsHtml;

        // 옵션 클릭 이벤트
        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.language-option');
            if (option) {
                this.changeLanguage(option.dataset.lang);
                dropdown.remove();
            }
        });

        this.languageSelector.appendChild(dropdown);

        // 외부 클릭 시 닫기
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!this.languageSelector.contains(e.target)) {
                    dropdown.remove();
                }
            }, { once: true });
        }, 0);
    }

    changeLanguage(langCode) {
        // 언어 변경 로직
        Utils.cookie.set('language', langCode, 365);
        App.notifications.info('언어가 변경되었습니다. 페이지를 새로고침합니다.');

        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    setupScrollToTop() {
        this.scrollToTopBtn = this.footer.querySelector('.scroll-to-top');
        if (!this.scrollToTopBtn) {
            this.createScrollToTopButton();
        }

        this.scrollToTopBtn.addEventListener('click', () => {
            this.scrollToTop();
        });

        // 스크롤 위치에 따라 버튼 표시/숨김
        window.addEventListener('scroll', Utils.throttle(() => {
            this.toggleScrollToTopButton();
        }, 100));
    }

    createScrollToTopButton() {
        this.scrollToTopBtn = document.createElement('button');
        this.scrollToTopBtn.className = 'scroll-to-top';
        this.scrollToTopBtn.innerHTML = '↑';
        this.scrollToTopBtn.setAttribute('aria-label', '맨 위로 이동');

        document.body.appendChild(this.scrollToTopBtn);
    }

    toggleScrollToTopButton() {
        const scrollPosition = window.pageYOffset;
        const windowHeight = window.innerHeight;

        if (scrollPosition > windowHeight * 0.5) {
            this.scrollToTopBtn.classList.add('visible');
        } else {
            this.scrollToTopBtn.classList.remove('visible');
        }
    }

    scrollToTop() {
        const scrollDuration = 800;
        const scrollStep = -window.scrollY / (scrollDuration / 15);

        const scrollInterval = setInterval(() => {
            if (window.scrollY !== 0) {
                window.scrollBy(0, scrollStep);
            } else {
                clearInterval(scrollInterval);
            }
        }, 15);
    }

    setupSocialLinks() {
        const socialLinks = this.footer.querySelectorAll('.social-link');

        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackSocialClick(e.target);
            });

            // 호버 효과 강화
            link.addEventListener('mouseenter', () => {
                this.animateSocialIcon(link, 'enter');
            });

            link.addEventListener('mouseleave', () => {
                this.animateSocialIcon(link, 'leave');
            });
        });
    }

    trackSocialClick(link) {
        const platform = link.className.split(' ').find(cls =>
            ['facebook', 'twitter', 'instagram', 'linkedin', 'github'].includes(cls)
        );

        if (platform) {
            // 분석 이벤트 전송
            this.sendAnalyticsEvent('social_click', { platform });
        }
    }

    animateSocialIcon(link, action) {
        if (action === 'enter') {
            link.style.transform = 'translateY(-2px) scale(1.1)';
        } else {
            link.style.transform = '';
        }
    }

    setupAppStoreLinks() {
        const appStoreLinks = this.footer.querySelectorAll('.app-store-link');

        appStoreLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.trackAppStoreClick(e.target);
            });
        });
    }

    trackAppStoreClick(link) {
        const store = link.href.includes('apple') ? 'app_store' : 'google_play';
        this.sendAnalyticsEvent('app_store_click', { store });
    }

    setupFooterAnimations() {
        // 푸터 섹션 애니메이션
        const footerSections = this.footer.querySelectorAll('.footer-section');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, { threshold: 0.1 });

        footerSections.forEach(section => {
            observer.observe(section);
        });

        // 상태 인디케이터 애니메이션
        this.animateStatusIndicator();
    }

    animateStatusIndicator() {
        const statusIndicator = this.footer.querySelector('.status-indicator');
        if (!statusIndicator) return;

        // 서버 상태 확인
        this.checkServerStatus().then(isOnline => {
            statusIndicator.style.backgroundColor = isOnline ?
                'var(--system-green)' : 'var(--system-red)';
        });
    }

    async checkServerStatus() {
        try {
            const response = await fetch('/api/health', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    sendAnalyticsEvent(eventName, data) {
        // 분석 도구로 이벤트 전송 (예: Google Analytics)
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, data);
        }

        // 자체 분석 시스템으로 전송
        if (window.analytics) {
            window.analytics.track(eventName, data);
        }
    }

    // 푸터 상태 업데이트
    updateFooterStatus(status) {
        const statusElement = this.footer.querySelector('.footer-status');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    // 저작권 연도 자동 업데이트
    updateCopyrightYear() {
        const copyrightElement = this.footer.querySelector('.footer-copyright');
        if (copyrightElement) {
            const currentYear = new Date().getFullYear();
            copyrightElement.innerHTML = copyrightElement.innerHTML.replace(
                /\d{4}/,
                currentYear
            );
        }
    }

    // 뉴스레터 구독자 수 업데이트
    updateSubscriberCount(count) {
        const countElement = this.footer.querySelector('.subscriber-count');
        if (countElement) {
            countElement.textContent = Utils.formatNumber(count);
        }
    }

    // 동적 링크 추가
    addFooterLink(sectionId, linkData) {
        const section = this.footer.querySelector(`#${sectionId}`);
        if (!section) return;

        const linksList = section.querySelector('.footer-links');
        if (!linksList) return;

        const linkItem = document.createElement('li');
        linkItem.className = 'footer-link-item';
        linkItem.innerHTML = `
            <a href="${linkData.url}" class="footer-link">
                ${linkData.icon ? `<span class="footer-link-icon">${linkData.icon}</span>` : ''}
                ${linkData.text}
            </a>
        `;

        linksList.appendChild(linkItem);
    }

    // 푸터 위젯 추가
    addFooterWidget(widgetData) {
        const footerContent = this.footer.querySelector('.footer-content');
        if (!footerContent) return;

        const widget = document.createElement('div');
        widget.className = 'footer-section';
        widget.innerHTML = `
            <h3 class="footer-title">${widgetData.title}</h3>
            <div class="footer-widget-content">
                ${widgetData.content}
            </div>
        `;

        footerContent.appendChild(widget);
    }
}

// 푸터 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.footerManager = new FooterManager();
});

// 전역 푸터 API
window.Footer = {
    updateStatus: (status) => {
        if (window.footerManager) {
            window.footerManager.updateFooterStatus(status);
        }
    },

    updateSubscriberCount: (count) => {
        if (window.footerManager) {
            window.footerManager.updateSubscriberCount(count);
        }
    },

    addLink: (sectionId, linkData) => {
        if (window.footerManager) {
            window.footerManager.addFooterLink(sectionId, linkData);
        }
    },

    addWidget: (widgetData) => {
        if (window.footerManager) {
            window.footerManager.addFooterWidget(widgetData);
        }
    }
};
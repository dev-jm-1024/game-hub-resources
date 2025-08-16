document.addEventListener('DOMContentLoaded', function() {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;

    const gameIframe = gameContainer.querySelector('.game-iframe');
    if (!gameIframe) return;

    // 크기 조정 관련 요소들
    const sizeControlToggle = document.getElementById('sizeControlToggle');
    const sizeControlContent = document.getElementById('sizeControlContent');
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const autoFitBtn = document.getElementById('autoFitBtn');
    const resetSizeBtn = document.getElementById('resetSizeBtn');
    const saveSizeBtn = document.getElementById('saveSizeBtn');
    const presetBtns = document.querySelectorAll('.preset-btn');

    // 오디오 관련 요소들
    const audioPrompt = document.getElementById('audioPrompt');
    const enableAudioBtn = document.getElementById('enableAudioBtn');

    let audioContextResumed = false;
    let gameLoaded = false;
    let baseGameWidth = 540;  // 감지된 기본 게임 크기
    let baseGameHeight = 960;
    let currentScale = 100;   // 현재 크기 비율

    console.log('게임 iframe 감지 시작:', gameIframe.src);

    // 🔥 크기 조정 패널 토글
    sizeControlToggle.addEventListener('click', function() {
        const isExpanded = sizeControlContent.classList.contains('show');
        if (isExpanded) {
            sizeControlContent.classList.remove('show');
            sizeControlToggle.classList.remove('expanded');
            sizeControlToggle.textContent = '▼';
        } else {
            sizeControlContent.classList.add('show');
            sizeControlToggle.classList.add('expanded');
            sizeControlToggle.textContent = '▲';
        }
    });

    // 🔥 슬라이더로 크기 조정
    sizeSlider.addEventListener('input', function() {
        currentScale = parseInt(this.value);
        sizeValue.textContent = currentScale + '%';
        applyGameSize(currentScale);
        updatePresetButtons(currentScale);
    });

    // 🔥 프리셋 버튼들
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetSize = parseInt(this.dataset.size);
            setGameScale(targetSize);
        });
    });

    // 🔥 자동 맞춤 버튼
    autoFitBtn.addEventListener('click', function() {
        console.log('🎯 자동 맞춤 시도');
        const containerWidth = gameContainer.offsetWidth - 40;
        const containerHeight = window.innerHeight * 0.8;

        // 컨테이너에 딱 맞는 크기 계산
        const widthScale = (containerWidth / baseGameWidth) * 100;
        const heightScale = (containerHeight / baseGameHeight) * 100;
        const optimalScale = Math.min(widthScale, heightScale);

        console.log(`📊 자동 맞춤 계산: ${Math.round(optimalScale)}%`);
        setGameScale(Math.round(optimalScale));
    });

    // 🔥 기본 크기 리셋
    resetSizeBtn.addEventListener('click', function() {
        console.log('🔄 기본 크기로 리셋');
        setGameScale(100);
    });

    // 🔥 크기 저장 (localStorage)
    saveSizeBtn.addEventListener('click', function() {
        localStorage.setItem('preferredGameSize', currentScale.toString());
        console.log(`💾 게임 크기 저장됨: ${currentScale}%`);

        // 저장 완료 표시
        const originalText = saveSizeBtn.textContent;
        saveSizeBtn.textContent = '✅ 저장됨';
        saveSizeBtn.style.background = '#10b981';
        setTimeout(() => {
            saveSizeBtn.textContent = originalText;
            saveSizeBtn.style.background = '';
        }, 2000);
    });

    // 🔥 게임 크기 설정 함수
    function setGameScale(scale) {
        currentScale = Math.max(50, Math.min(200, scale)); // 50%~200% 제한
        sizeSlider.value = currentScale;
        sizeValue.textContent = currentScale + '%';
        applyGameSize(currentScale);
        updatePresetButtons(currentScale);
    }

    // 🔥 실제 크기 적용
    function applyGameSize(scale) {
        const scaleRatio = scale / 100;
        const newWidth = Math.round(baseGameWidth * scaleRatio);
        const newHeight = Math.round(baseGameHeight * scaleRatio);

        console.log(`🎮 게임 크기 조정: ${scale}% (${newWidth}x${newHeight}px)`);

        gameIframe.style.width = newWidth + 'px';
        gameIframe.style.height = newHeight + 'px';

        // 스크롤 숨기기
        gameIframe.style.overflow = 'hidden';
        gameIframe.scrolling = 'no';
    }

    // 🔥 프리셋 버튼 활성화 표시
    function updatePresetButtons(currentScale) {
        presetBtns.forEach(btn => {
            const btnScale = parseInt(btn.dataset.size);
            if (Math.abs(btnScale - currentScale) <= 2) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // iframe 로드 완료 후 처리
    gameIframe.addEventListener('load', function() {
        console.log('iframe 로드 완료');
        gameLoaded = true;

        setTimeout(() => {
            if (!audioContextResumed) {
                showAudioPrompt();
            }
            detectGameSize(gameIframe);

            // 저장된 크기 불러오기
            const savedSize = localStorage.getItem('preferredGameSize');
            if (savedSize) {
                console.log(`💾 저장된 크기 불러오기: ${savedSize}%`);
                setGameScale(parseInt(savedSize));
            }
        }, 2000);
    });

    // 게임 크기 감지 (기존 함수 유지하되 baseGameWidth/Height 설정)
    function detectGameSize(iframe) {
        console.log('=== 게임 크기 감지 시작 ===');

        try {
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
                const canvases = iframeDoc.querySelectorAll('canvas');
                if (canvases.length > 0) {
                    let maxCanvasWidth = 0;
                    let maxCanvasHeight = 0;

                    canvases.forEach((canvas) => {
                        if (canvas.width > maxCanvasWidth) {
                            maxCanvasWidth = canvas.width;
                            maxCanvasHeight = canvas.height;
                        }
                    });

                    if (maxCanvasWidth > 0 && maxCanvasHeight > 0) {
                        baseGameWidth = maxCanvasWidth;
                        baseGameHeight = maxCanvasHeight;
                        console.log(`🎯 기본 게임 크기 설정: ${baseGameWidth}x${baseGameHeight}px`);

                        // 기본 크기로 일단 설정
                        applyGameSize(currentScale);
                    }
                }
            }
        } catch (e) {
            console.error('크기 감지 중 오류:', e);
        }
    }

    // 오디오 관련 기능들 (기존과 동일)
    function showAudioPrompt() {
        if (audioPrompt) {
            audioPrompt.style.display = 'flex';
        }
    }

    function hideAudioPrompt() {
        if (audioPrompt) {
            audioPrompt.style.display = 'none';
        }
    }

    function enableGameAudio() {
        try {
            gameIframe.contentWindow.postMessage({
                type: 'ENABLE_AUDIO',
                action: 'resume'
            }, '*');
            audioContextResumed = true;
            console.log('✅ 게임 오디오 활성화 요청 전송');
        } catch (e) {
            console.log('오디오 활성화 메시지 전송 실패:', e.message);
        }
    }

    // 오디오 버튼 이벤트
    if (enableAudioBtn) {
        enableAudioBtn.addEventListener('click', function() {
            enableGameAudio();
            hideAudioPrompt();
        });
    }

    gameContainer.addEventListener('click', function() {
        if (!audioContextResumed) {
            enableGameAudio();
            hideAudioPrompt();
        }
    });

    // 전체화면 기능
    const fullscreenBtn = gameContainer.querySelector('.fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function() {
            if (gameIframe.requestFullscreen) {
                gameIframe.requestFullscreen();
            } else if (gameIframe.webkitRequestFullscreen) {
                gameIframe.webkitRequestFullscreen();
            } else if (gameIframe.msRequestFullscreen) {
                gameIframe.msRequestFullscreen();
            }
        });
    }

    console.log('동적 크기 조정 시스템 초기화 완료');
});
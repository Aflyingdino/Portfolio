
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
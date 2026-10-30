/* ============================================================
   VYANJAN RESTAURANT – MAIN JAVASCRIPT
   Vanilla JS only – no jQuery, no frameworks
   ============================================================ */

(function () {
    'use strict';

    /* ---------- 1. STICKY NAVBAR ON SCROLL ---------- */
    function initStickyNavbar() {
        const navbar = document.getElementById('mainNavbar');
        if (!navbar) return;

        function handleScroll() {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    /* ---------- 2. SMOOTH SCROLL FOR ANCHOR LINKS ---------- */
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(function (link) {
            link.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#' || targetId.length < 2) return;

                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();

                const navHeight = document.getElementById('mainNavbar');
                const offset = navHeight ? navHeight.offsetHeight + 10 : 90;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({ top: top, behavior: 'smooth' });

                // Close mobile menu if open
                const navCollapse = document.getElementById('navMenu');
                if (navCollapse && navCollapse.classList.contains('show')) {
                    const toggler = document.querySelector('.navbar-toggler');
                    if (toggler) toggler.click();
                }
            });
        });
    }

    /* ---------- 3. ACTIVE NAV LINK ON SCROLL ---------- */
    function initActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        if (!sections.length || !navLinks.length) return;

        function updateActive() {
            let current = '';
            const scrollPos = window.pageYOffset + 120;

            sections.forEach(function (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(function (link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', updateActive, { passive: true });
        updateActive();
    }

    /* ---------- 4. SCROLL REVEAL (INTERSECTION OBSERVER) ---------- */
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        if (!revealElements.length) return;

        // Fallback for browsers without IntersectionObserver
        if (!('IntersectionObserver' in window)) {
            revealElements.forEach(function (el) { el.classList.add('active'); });
            return;
        }

        const observer = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
        );

        revealElements.forEach(function (el) { observer.observe(el); });
    }

    /* ---------- 5. MENU FILTERING ---------- */
    function initMenuFilter() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const menuItems = document.querySelectorAll('.menu-item');
        if (!filterButtons.length || !menuItems.length) return;

        filterButtons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const filter = this.getAttribute('data-filter');

                // Update active button
                filterButtons.forEach(function (b) { b.classList.remove('active'); });
                this.classList.add('active');

                // Filter items
                menuItems.forEach(function (item) {
                    const category = item.getAttribute('data-category');
                    const show = filter === 'all' || category === filter;

                    if (show) {
                        item.classList.remove('hide');
                        // Re-trigger a small fade animation
                        item.style.animation = 'none';
                        // Force reflow
                        void item.offsetWidth;
                        item.style.animation = 'fadeUp 0.5s ease both';
                    } else {
                        item.classList.add('hide');
                    }
                });
            });
        });
    }

    /* ---------- 6. GALLERY LIGHTBOX ---------- */
    function initLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        const lightbox = document.getElementById('lightbox');
        if (!galleryItems.length || !lightbox) return;

        const lightboxImg = lightbox.querySelector('.lightbox-img');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');

        const images = [];
        let currentIndex = 0;

        galleryItems.forEach(function (item, index) {
            const href = item.getAttribute('href');
            const title = item.getAttribute('data-title') || '';
            const alt = item.querySelector('img') ? item.querySelector('img').alt : '';
            images.push({ src: href, title: title || alt });

            item.addEventListener('click', function (e) {
                e.preventDefault();
                currentIndex = index;
                openLightbox();
            });
        });

        function openLightbox() {
            const imgData = images[currentIndex];
            lightboxImg.src = imgData.src;
            lightboxImg.alt = imgData.title;
            lightboxCaption.textContent = imgData.title;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }

        function showPrev() {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            openLightbox();
        }

        function showNext() {
            currentIndex = (currentIndex + 1) % images.length;
            openLightbox();
        }

        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', showPrev);
        nextBtn.addEventListener('click', showNext);

        // Close on backdrop click
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });
    }

    /* ---------- 7. HIGHLIGHT CURRENT DAY IN OPENING HOURS ---------- */
    function initCurrentDayHighlight() {
        const rows = document.querySelectorAll('.hours-row');
        if (!rows.length) return;

        // getDay(): 0 = Sunday, 1 = Monday ... 6 = Saturday
        const today = new Date().getDay();

        rows.forEach(function (row) {
            const dayNum = parseInt(row.getAttribute('data-day'), 10);
            if (dayNum === today) {
                row.classList.add('today');
            }
        });
    }

    /* ---------- 8. BACK TO TOP BUTTON ---------- */
    function initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;

        function toggleVisibility() {
            if (window.scrollY > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }

        window.addEventListener('scroll', toggleVisibility, { passive: true });

        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        toggleVisibility();
    }

    /* ---------- 9. LAZY IMAGE FALLBACK (if native unsupported) ---------- */
    function initImageFallback() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        if (!images.length) return;

        // Native lazy loading is widely supported; fallback for very old browsers
        if ('loading' in HTMLImageElement.prototype) return;

        images.forEach(function (img) {
            const dataSrc = img.getAttribute('src');
            if (!dataSrc) return;
            img.setAttribute('data-src', dataSrc);
            img.removeAttribute('src');

            const obs = new IntersectionObserver(function (entries, o) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        const src = el.getAttribute('data-src');
                        if (src) {
                            el.setAttribute('src', src);
                            el.removeAttribute('data-src');
                        }
                        o.unobserve(el);
                    }
                });
            });
            obs.observe(img);
        });
    }

    /* ---------- 10. INITIALIZE ON DOM READY ---------- */
    function init() {
        initStickyNavbar();
        initSmoothScroll();
        initActiveNavLink();
        initScrollReveal();
        initMenuFilter();
        initLightbox();
        initCurrentDayHighlight();
        initBackToTop();
        initImageFallback();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
(function () {
    'use strict';

    // -----------------------------------------------
    // Configuración del negocio (editar aquí)
    // -----------------------------------------------

    var BUSINESS = {
        timeZone: 'America/Managua',
        // Lunes a domingo, 8:00 a 20:00 (según el rótulo de la puerta)
        openHour: 8,
        closeHour: 20
    };

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasIO = 'IntersectionObserver' in window;


    // -----------------------------------------------
    // Letra por letra + desenfoque en titulares
    // -----------------------------------------------

    var DEFAULT_CHAR_DELAY = 30;

    document.querySelectorAll('[data-split-chars]').forEach(function (el) {
        var text = el.textContent.replace(/\s+/g, ' ').trim();
        var words = text.split(' ');
        var step = parseInt(el.getAttribute('data-char-delay'), 10) || DEFAULT_CHAR_DELAY;
        var start = parseInt(el.getAttribute('data-char-start'), 10) || 0;
        var charIndex = 0;

        // Texto legible para lectores de pantalla; las letras sueltas se ocultan.
        var readable = document.createElement('span');
        readable.className = 'sr-only';
        readable.textContent = text;

        var visual = document.createElement('span');
        visual.setAttribute('aria-hidden', 'true');

        words.forEach(function (word, wi) {
            var wordSpan = document.createElement('span');
            wordSpan.className = 'word';

            Array.from(word).forEach(function (letter) {
                var span = document.createElement('span');
                span.className = 'char';
                span.textContent = letter;
                span.style.transitionDelay = (start + charIndex * step) + 'ms';
                wordSpan.appendChild(span);
                charIndex++;
            });

            visual.appendChild(wordSpan);

            if (wi < words.length - 1) {
                visual.appendChild(document.createTextNode(' '));
                charIndex++;
            }
        });

        el.textContent = '';
        el.appendChild(readable);
        el.appendChild(visual);
        el.classList.add('is-split');
    });

    function showChars(el) {
        el.querySelectorAll('.char').forEach(function (c) { c.classList.add('is-visible'); });
    }

    function observeOnce(selector, onVisible, options) {
        var els = document.querySelectorAll(selector);
        if (!els.length) return;

        if (reduceMotion || !hasIO) {
            els.forEach(onVisible);
            return;
        }

        var watched = new Map();
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                (watched.get(entry.target) || []).forEach(onVisible);
                watched.delete(entry.target);
                io.unobserve(entry.target);
            });
        }, options || { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

        els.forEach(function (el) {
            // Un elemento recortado con clip-path no tiene área visible:
            // se observa su contenedor y se anima el elemento.
            var target = el.hasAttribute('data-write') ? el.parentElement : el;
            if (!watched.has(target)) {
                watched.set(target, []);
                io.observe(target);
            }
            watched.get(target).push(el);
        });
    }

    observeOnce('[data-split-chars]', showChars);


    // -----------------------------------------------
    // Apariciones al hacer scroll (fade, línea, script)
    // -----------------------------------------------

    observeOnce('[data-reveal], [data-draw], [data-write]', function (el) {
        el.classList.add('is-visible');
    });


    // -----------------------------------------------
    // Escenario fijo: fundido entre fotos por sección
    // -----------------------------------------------

    var layers = Array.prototype.slice.call(document.querySelectorAll('.stage-layer'));
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));
    var activeLayer = null;

    function loadLayer(layer) {
        if (!layer) return;
        layer.querySelectorAll('[data-src]').forEach(function (media) {
            media.src = media.getAttribute('data-src');
            media.removeAttribute('data-src');
            if (media.tagName === 'SOURCE') media.parentNode.load();
        });
    }

    function activateLayer(id) {
        if (activeLayer === id) return;
        activeLayer = id;

        layers.forEach(function (layer, i) {
            var isActive = layer.getAttribute('data-layer') === id;
            var video = layer.querySelector('video');

            if (isActive) {
                loadLayer(layer);
                loadLayer(layers[i + 1]); // precarga la siguiente
            }

            layer.classList.toggle('is-active', isActive);

            if (video) {
                if (isActive) {
                    var p = video.play();
                    if (p && p.catch) p.catch(function () {});
                } else {
                    video.pause();
                }
            }
        });
    }

    if (sections.length && layers.length) {
        if (hasIO) {
            var ratios = {};
            var sectionObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    ratios[entry.target.getAttribute('data-section')] =
                        entry.isIntersecting ? entry.intersectionRatio : 0;
                });

                // La sección más visible manda.
                var best = null;
                var bestRatio = 0;
                Object.keys(ratios).forEach(function (key) {
                    if (ratios[key] > bestRatio) {
                        bestRatio = ratios[key];
                        best = key;
                    }
                });

                if (best && bestRatio >= 0.3) activateLayer(best);
            }, { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1] });

            sections.forEach(function (section) { sectionObserver.observe(section); });
        } else {
            activateLayer(sections[0].getAttribute('data-section'));
        }

        // Cuando la página terminó de cargar, trae el resto de fotos sin bloquear.
        window.addEventListener('load', function () {
            setTimeout(function () { layers.forEach(loadLayer); }, 1200);
        });
    }


    // -----------------------------------------------
    // Header: fondo con desenfoque al hacer scroll
    // -----------------------------------------------

    var header = document.getElementById('siteHeader');
    var ticker = document.querySelector('.ticker');

    function onScroll() {
        if (!header) return;
        var threshold = ticker ? ticker.offsetHeight : 40;
        header.classList.toggle('is-scrolled', window.scrollY > threshold);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();


    // -----------------------------------------------
    // Menú móvil
    // -----------------------------------------------

    var navToggle = document.getElementById('navToggle');
    var mobileMenu = document.getElementById('mobileMenu');

    function setMenu(open) {
        if (!navToggle || !mobileMenu) return;
        navToggle.classList.toggle('is-open', open);
        mobileMenu.classList.toggle('is-open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        mobileMenu.setAttribute('aria-hidden', String(!open));
        document.body.style.overflow = open ? 'hidden' : '';
    }

    if (navToggle && mobileMenu) {
        navToggle.addEventListener('click', function () {
            setMenu(!mobileMenu.classList.contains('is-open'));
        });

        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () { setMenu(false); });
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                setMenu(false);
                navToggle.focus();
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 768 && mobileMenu.classList.contains('is-open')) setMenu(false);
        });
    }


    // -----------------------------------------------
    // Navegación del menú: resaltar la sección visible
    // -----------------------------------------------

    var menuNav = document.getElementById('menuNav');
    var menuNavLinks = document.querySelectorAll('[data-menu-nav]');
    var menuSections = document.querySelectorAll('[data-menu-section]');

    function centerNavLink(link) {
        if (!menuNav || menuNav.scrollWidth <= menuNav.clientWidth) return;
        var target = link.offsetLeft - (menuNav.clientWidth - link.offsetWidth) / 2;
        menuNav.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    if (menuSections.length && hasIO) {
        var menuObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var id = entry.target.getAttribute('data-menu-section');

                menuNavLinks.forEach(function (link) {
                    var isActive = link.getAttribute('data-menu-nav') === id;
                    link.classList.toggle('is-active', isActive);
                    if (isActive) {
                        link.setAttribute('aria-current', 'true');
                        centerNavLink(link);
                    } else {
                        link.removeAttribute('aria-current');
                    }
                });
            });
        }, { threshold: 0.1, rootMargin: '-20% 0px -60% 0px' });

        menuSections.forEach(function (section) { menuObserver.observe(section); });
    }


    // -----------------------------------------------
    // Pestañas del menú (calientes / fríos)
    // -----------------------------------------------

    function activateTab(group, tab, focus) {
        var tabs = group.querySelectorAll('[role="tab"]');
        tabs.forEach(function (t) {
            var isActive = t === tab;
            t.classList.toggle('is-active', isActive);
            t.setAttribute('aria-selected', String(isActive));
            t.tabIndex = isActive ? 0 : -1;
            var panel = document.getElementById(t.getAttribute('aria-controls'));
            if (panel) {
                panel.classList.toggle('is-active', isActive);
                panel.hidden = !isActive;
            }
        });
        if (focus) tab.focus();
    }

    document.querySelectorAll('[data-tabs]').forEach(function (group) {
        var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));

        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () { activateTab(group, tab, false); });
            tab.addEventListener('keydown', function (e) {
                var next = null;
                if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
                if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
                if (next) {
                    e.preventDefault();
                    activateTab(group, next, true);
                }
            });
        });

        // Enlaces del tipo menu.html#frios abren la pestaña correspondiente.
        var hash = window.location.hash.replace('#', '');
        var fromHash = hash && group.querySelector('[data-tab-hash="' + hash + '"]');
        if (fromHash) activateTab(group, fromHash, false);
    });


    // -----------------------------------------------
    // Logo animado del footer (se reproduce una vez)
    // -----------------------------------------------

    observeOnce('[data-footer-logo]', function (el) {
        el.classList.add('is-playing');
    }, { threshold: 0.35 });


    // -----------------------------------------------
    // Sliders de fotos (Swiper)
    // -----------------------------------------------

    if (window.Swiper) {
        document.querySelectorAll('[data-swiper]').forEach(function (el) {
            new window.Swiper(el, {
                slidesPerView: 1.5,
                spaceBetween: 8,
                loop: true,
                grabCursor: true,
                speed: reduceMotion ? 0 : 700,
                keyboard: { enabled: true, onlyInViewport: true },
                a11y: {
                    prevSlideMessage: 'Foto anterior',
                    nextSlideMessage: 'Foto siguiente',
                    paginationBulletMessage: 'Ir a la foto {{index}}'
                },
                navigation: {
                    prevEl: el.querySelector('.swiper-button-prev'),
                    nextEl: el.querySelector('.swiper-button-next')
                },
                pagination: {
                    el: el.querySelector('.swiper-pagination'),
                    clickable: true
                },
                breakpoints: {
                    0: { slidesPerView: 1.15, spaceBetween: 6 },
                    768: { slidesPerView: 1.5, spaceBetween: 12 },
                    1400: { slidesPerView: 2.15, spaceBetween: 14 }
                }
            });
        });
    }


    // -----------------------------------------------
    // Scroll suave para anclas (compensa header + nav del menú)
    // -----------------------------------------------

    function stickyOffset() {
        var headerHeight = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--header-height'), 10) || 72;
        return headerHeight + (menuNav ? menuNav.offsetHeight : 0);
    }

    document.querySelectorAll('a[href*="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            var href = link.getAttribute('href');
            var hash = href.substring(href.indexOf('#'));
            if (!hash || hash === '#') return;

            var samePage = href.charAt(0) === '#' ||
                link.pathname.replace(/\/index\.html$/, '/') === window.location.pathname.replace(/\/index\.html$/, '/');
            if (!samePage) return;

            var target;
            try { target = document.querySelector(hash); } catch (err) { return; }
            if (!target) return;

            e.preventDefault();
            var top = target.getBoundingClientRect().top + window.scrollY;
            var y = top - stickyOffset();
            // Los paneles de pantalla completa se alinean al borde superior.
            if (target.hasAttribute('data-section')) y = top;

            window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
            if (history.replaceState) history.replaceState(null, '', hash);
        });
    });


    // -----------------------------------------------
    // Abierto / cerrado según la hora de Managua
    // -----------------------------------------------

    function managuaHour() {
        try {
            var parts = new Intl.DateTimeFormat('en-US', {
                timeZone: BUSINESS.timeZone,
                hour: 'numeric',
                minute: 'numeric',
                hourCycle: 'h23'
            }).formatToParts(new Date());
            var h = 0, m = 0;
            parts.forEach(function (p) {
                if (p.type === 'hour') h = parseInt(p.value, 10) % 24;
                if (p.type === 'minute') m = parseInt(p.value, 10);
            });
            return h + m / 60;
        } catch (err) {
            return null;
        }
    }

    function formatHour(h) {
        var suffix = h >= 12 ? 'PM' : 'AM';
        var hh = h % 12 === 0 ? 12 : h % 12;
        return hh + ' ' + suffix;
    }

    function updateOpenStatus() {
        var els = document.querySelectorAll('[data-open-status]');
        if (!els.length) return;
        var now = managuaHour();
        if (now === null) return;

        var isOpen = now >= BUSINESS.openHour && now < BUSINESS.closeHour;
        var label = isOpen
            ? 'Abierto ahora · hasta las ' + formatHour(BUSINESS.closeHour)
            : 'Cerrado · abrimos a las ' + formatHour(BUSINESS.openHour);
        // Versión corta para lugares donde el horario ya está escrito al lado.
        var shortLabel = isOpen ? 'Abierto ahora' : 'Cerrado ahora';

        els.forEach(function (el) {
            el.classList.toggle('is-open', isOpen);
            el.classList.toggle('is-closed', !isOpen);
            var text = el.querySelector('[data-open-text]');
            if (text) text.textContent = el.getAttribute('data-open-status') === 'short' ? shortLabel : label;
            el.hidden = false;
        });
    }

    updateOpenStatus();
    setInterval(updateOpenStatus, 60 * 1000);


    // -----------------------------------------------
    // Año del copyright
    // -----------------------------------------------

    document.querySelectorAll('[data-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });

})();

(function () {
    'use strict';

    // -----------------------------------------------
    // Configuración del negocio (editar aquí)
    // -----------------------------------------------

    var TIME_ZONE = 'America/Managua';

    // Horarios por sucursal. days: 0 = domingo … 6 = sábado. Horas en formato 24 h.
    var BRANCHES = [
        { id: 'batahola', name: 'Batahola', days: [0, 1, 2, 3, 4, 5, 6], open: 8, close: 20 },
        { id: 'natura', name: 'Plaza Natura', days: [1, 2, 3, 4, 5, 6], open: 8, close: 18 },
        { id: 'distrito', name: 'Distrito Diseño', days: [1, 2, 3, 4, 5, 6], open: 9, close: 18 }
    ];

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var saveData = !!(navigator.connection && navigator.connection.saveData);
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

        // Texto completo para lectores de pantalla; las letras sueltas se ocultan.
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

    observeOnce('[data-split-chars]', function (el) {
        el.querySelectorAll('.char').forEach(function (c) { c.classList.add('is-visible'); });
    });


    // -----------------------------------------------
    // Apariciones al hacer scroll y logo animado
    // -----------------------------------------------

    observeOnce('[data-reveal], [data-write]', function (el) {
        el.classList.add('is-visible');
    });

    observeOnce('[data-logo-anim]', function (el) {
        el.classList.add('is-playing');
    }, { threshold: 0.3 });


    // -----------------------------------------------
    // Escenario fijo: videos que se funden por sección
    // -----------------------------------------------

    var layers = Array.prototype.slice.call(document.querySelectorAll('.stage-layer'));
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-section]'));
    var portraitQuery = window.matchMedia('(max-aspect-ratio: 1/1)');
    var allowVideo = !reduceMotion && !saveData;
    var activeLayer = null;

    function layerVideo(layer) {
        return layer ? layer.querySelector('video[data-land]') : null;
    }

    function loadLayer(layer) {
        var video = layerVideo(layer);
        if (!video || !allowVideo) return;
        var src = video.getAttribute(portraitQuery.matches ? 'data-port' : 'data-land');
        if (video.getAttribute('data-current') === src) return;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('data-current', src);
        video.src = src;
    }

    function playLayer(layer) {
        var video = layerVideo(layer);
        if (!video || !allowVideo) return;
        var p = video.play();
        if (p && p.catch) p.catch(function () {});
    }

    function activateLayer(id) {
        if (activeLayer === id) return;
        activeLayer = id;

        layers.forEach(function (layer, i) {
            var isActive = layer.getAttribute('data-layer') === id;
            layer.classList.toggle('is-active', isActive);

            if (isActive) {
                loadLayer(layer);
                loadLayer(layers[i + 1]); // la siguiente queda lista
                playLayer(layer);
            } else {
                var video = layerVideo(layer);
                if (video) video.pause();
            }
        });
    }

    if (sections.length && layers.length) {
        // Sin IntersectionObserver, arranca el primero. Con él, el primer aviso
        // (inmediato) activa la sección visible: si se entra con un ancla, no se
        // descarga de más el video de la portada.
        if (!hasIO) activateLayer(sections[0].getAttribute('data-section'));

        if (hasIO) {
            var ratios = {};
            var sectionObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    ratios[entry.target.getAttribute('data-section')] =
                        entry.isIntersecting ? entry.intersectionRatio : 0;
                });

                // Manda la sección más visible.
                var best = null;
                var bestRatio = 0;
                Object.keys(ratios).forEach(function (key) {
                    if (ratios[key] > bestRatio) {
                        bestRatio = ratios[key];
                        best = key;
                    }
                });

                if (best && bestRatio >= 0.3) {
                    activateLayer(best);
                    playLayer(layers.filter(function (l) { return l.getAttribute('data-layer') === best; })[0]);
                } else if (bestRatio < 0.08) {
                    // Ninguna sección con video a la vista (galería, footer): pausa.
                    layers.forEach(function (layer) {
                        var video = layerVideo(layer);
                        if (video) video.pause();
                    });
                }
            }, { threshold: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1] });

            sections.forEach(function (section) { sectionObserver.observe(section); });
        }

        // Si cambia la orientación, cambia el corte del video (16:9 o 9:16).
        var onOrientation = function () {
            layers.forEach(function (layer) {
                var video = layerVideo(layer);
                if (video && video.getAttribute('data-current')) {
                    loadLayer(layer);
                    if (layer.classList.contains('is-active')) playLayer(layer);
                }
            });
        };
        if (portraitQuery.addEventListener) portraitQuery.addEventListener('change', onOrientation);
        else if (portraitQuery.addListener) portraitQuery.addListener(onOrientation);

        // Pausa el video cuando la pestaña no está visible.
        document.addEventListener('visibilitychange', function () {
            layers.forEach(function (layer) {
                var video = layerVideo(layer);
                if (!video) return;
                if (document.hidden) video.pause();
                else if (layer.classList.contains('is-active')) playLayer(layer);
            });
        });
    }


    // -----------------------------------------------
    // Header: fondo con desenfoque al hacer scroll
    // -----------------------------------------------

    var header = document.getElementById('siteHeader');
    var strip = document.querySelector('.strip');

    function onScroll() {
        if (!header) return;
        var threshold = strip ? strip.offsetHeight : 40;
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
            if (window.innerWidth > 820 && mobileMenu.classList.contains('is-open')) setMenu(false);
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

    // Scroll-spy: la sección activa es la última cuyo inicio ya pasó bajo la barra.
    if (menuSections.length) {
        var currentMenu = null;
        var spyQueued = false;
        var centerTimer = null;

        var spy = function () {
            spyQueued = false;
            var line = stickyOffset() + 48;
            var current = null;
            menuSections.forEach(function (section) {
                if (section.getBoundingClientRect().top <= line) current = section;
            });
            var id = current ? current.getAttribute('data-menu-section') : null;
            if (id === currentMenu) return;
            currentMenu = id;

            menuNavLinks.forEach(function (link) {
                var isActive = link.getAttribute('data-menu-nav') === id;
                link.classList.toggle('is-active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'true');
                    // Se centra cuando el scroll de la página termina, para no
                    // interrumpir el desplazamiento suave hacia la sección.
                    clearTimeout(centerTimer);
                    centerTimer = setTimeout(function () { centerNavLink(link); }, 220);
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        };

        window.addEventListener('scroll', function () {
            if (!spyQueued) {
                spyQueued = true;
                requestAnimationFrame(spy);
            }
            // Mientras la página se mueve, se pospone el centrado de la barra.
            if (centerTimer) {
                clearTimeout(centerTimer);
                var active = menuNav && menuNav.querySelector('.menu-nav-link.is-active');
                if (active) centerTimer = setTimeout(function () { centerNavLink(active); }, 220);
            }
        }, { passive: true });
        window.addEventListener('load', spy);
        spy();
    }


    // -----------------------------------------------
    // Scroll con compensación del header (y la nav del menú)
    // -----------------------------------------------

    function stickyOffset() {
        var headerHeight = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--header-height'), 10) || 72;
        return headerHeight + (menuNav ? menuNav.offsetHeight : 0);
    }

    // Posición en el documento sin contar transformaciones: las animaciones de
    // entrada desplazan los elementos unos px mientras se revelan.
    function absTop(el) {
        var y = 0;
        while (el) {
            y += el.offsetTop;
            el = el.offsetParent;
        }
        return y;
    }

    function scrollToEl(target, smooth) {
        var top = absTop(target);
        // Los paneles de pantalla completa se alinean al borde superior.
        var y = target.hasAttribute('data-section') ? top : top - stickyOffset();
        window.scrollTo({ top: y, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
    }


    // Al entrar con un ancla (index.html#plaza-natura, menu.html#cocteles,
    // menu.html#helado…) se reajusta cuando cargan la página y las fuentes,
    // que pueden mover el contenido. Si la persona ya empezó a moverse, no se toca.
    var userMoved = false;
    ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (type) {
        window.addEventListener(type, function () { userMoved = true; }, { passive: true, once: true });
    });

    function settleHash() {
        if (userMoved) return;
        var hash = window.location.hash.slice(1);
        if (!hash || !/^[\w-]+$/.test(hash)) return;
        var target = document.getElementById(hash);
        if (target) {
            scrollToEl(target, false);
            return;
        }
        var tab = document.querySelector('[data-tab-hash~="' + hash + '"]');
        var group = tab && tab.closest('[data-tabs]');
        if (group) {
            window.scrollTo({ top: absTop(group) - stickyOffset() - 24, behavior: 'auto' });
        }
    }

    window.addEventListener('load', settleHash);
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { setTimeout(settleHash, 60); });
    }


    // -----------------------------------------------
    // Pestañas del menú (calientes / fríos)
    // -----------------------------------------------

    function activateTab(group, tab, focus) {
        group.querySelectorAll('[role="tab"]').forEach(function (t) {
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

        // menu.html#frios o #calientes: abre la pestaña y baja directo a ella.
        var hash = window.location.hash.replace('#', '');
        var fromHash = hash && /^[\w-]+$/.test(hash) && group.querySelector('[data-tab-hash~="' + hash + '"]');
        if (fromHash) activateTab(group, fromHash, false);
    });


    // -----------------------------------------------
    // Galerías (Swiper)
    // -----------------------------------------------

    if (window.Swiper) {
        document.querySelectorAll('[data-swiper]').forEach(function (el) {
            new window.Swiper(el, {
                slidesPerView: 1.25,
                spaceBetween: 10,
                loop: true,
                grabCursor: true,
                speed: reduceMotion ? 0 : 800,
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
                    640: { slidesPerView: 2.2, spaceBetween: 12 },
                    1024: { slidesPerView: 3.2, spaceBetween: 14 },
                    1600: { slidesPerView: 4.2, spaceBetween: 14 }
                }
            });
        });
    }


    // -----------------------------------------------
    // Scroll suave para anclas de la misma página
    // -----------------------------------------------

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
            scrollToEl(target, true);
            if (history.replaceState) history.replaceState(null, '', hash);
        });
    });


    // -----------------------------------------------
    // Abierto / cerrado según la hora de Managua
    // -----------------------------------------------

    var WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

    // Día de la semana y hora decimal en Managua (o en ?hora=AAAA-MM-DDTHH:MM para pruebas).
    function managuaNow() {
        try {
            var test = /[?&]hora=([\d\-T:]+)/.exec(window.location.search);
            var date = test ? new Date(test[1] + ':00-06:00') : new Date();
            var parts = new Intl.DateTimeFormat('en-US', {
                timeZone: TIME_ZONE,
                weekday: 'short',
                hour: 'numeric',
                minute: 'numeric',
                hourCycle: 'h23'
            }).formatToParts(date);
            var now = { day: 0, hour: 0 };
            var minutes = 0;
            parts.forEach(function (p) {
                if (p.type === 'weekday') now.day = WEEKDAYS[p.value];
                if (p.type === 'hour') now.hour = parseInt(p.value, 10) % 24;
                if (p.type === 'minute') minutes = parseInt(p.value, 10);
            });
            now.hour += minutes / 60;
            return now;
        } catch (err) {
            return null;
        }
    }

    function formatHour(h) {
        var suffix = h >= 12 ? 'PM' : 'AM';
        var hh = h % 12 === 0 ? 12 : h % 12;
        return hh + ' ' + suffix;
    }

    function isOpen(branch, now) {
        return branch.days.indexOf(now.day) !== -1 && now.hour >= branch.open && now.hour < branch.close;
    }

    // Próxima apertura: { inDays: 0 (hoy), 1 (mañana)…, day, hour }.
    function nextOpening(branch, now) {
        if (branch.days.indexOf(now.day) !== -1 && now.hour < branch.open) {
            return { inDays: 0, day: now.day, hour: branch.open };
        }
        for (var k = 1; k <= 7; k++) {
            var d = (now.day + k) % 7;
            if (branch.days.indexOf(d) !== -1) return { inDays: k, day: d, hour: branch.open };
        }
        return null;
    }

    function whenLabel(next) {
        var when = next.inDays === 0 ? 'hoy' : next.inDays === 1 ? 'mañana' : 'el ' + DAY_NAMES[next.day];
        return when + ' a las ' + formatHour(next.hour);
    }

    function joinNames(names) {
        if (names.length <= 1) return names.join('');
        return names.slice(0, -1).join(', ') + ' y ' + names[names.length - 1];
    }

    function setStatus(el, open, text) {
        el.classList.toggle('is-open', open);
        el.classList.toggle('is-closed', !open);
        var target = el.querySelector('[data-open-text]');
        if (target) target.textContent = text;
        el.hidden = false;
    }

    function updateOpenStatus() {
        var now = managuaNow();
        if (!now) return;

        // Estado por sucursal (panel Visítanos).
        BRANCHES.forEach(function (branch) {
            document.querySelectorAll('[data-branch-status="' + branch.id + '"]').forEach(function (el) {
                var open = isOpen(branch, now);
                var text = open
                    ? 'Abierto ahora · cierra a las ' + formatHour(branch.close)
                    : 'Cerrado · abre ' + whenLabel(nextOpening(branch, now));
                setStatus(el, open, text);
            });
        });

        // Resumen de las tres sucursales (franja superior).
        var openNow = BRANCHES.filter(function (b) { return isOpen(b, now); });
        var summary;
        if (openNow.length === BRANCHES.length) {
            summary = 'Abierto ahora en nuestras ' + BRANCHES.length + ' sucursales';
        } else if (openNow.length) {
            summary = 'Abierto ahora en ' + joinNames(openNow.map(function (b) { return b.name; }));
        } else {
            var soonest = BRANCHES.map(function (b) { return nextOpening(b, now); })
                .filter(Boolean)
                .sort(function (a, b) { return (a.inDays * 24 + a.hour) - (b.inDays * 24 + b.hour); })[0];
            summary = soonest ? 'Cerrado · abrimos ' + whenLabel(soonest) : 'Cerrado';
        }
        document.querySelectorAll('[data-open-status]').forEach(function (el) {
            setStatus(el, openNow.length > 0, summary);
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

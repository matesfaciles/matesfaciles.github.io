/**
 * MATESFACILES 27 (y panel oculto) — CORE SYSTEM v7.0
 * ------------------------------------------------------------------
 * Gestión global: consentimiento de cookies RGPD propio (sin TermsFeed),
 * carga de Google Tag Manager / Analytics SOLO tras aceptar, seguridad
 * "double escape" y footer glassmorphism gamer (negro + cian/turquesa).
 *
 * Seguro para cargar con <script src>, async o defer, en <head>.
 */
(function () {
    'use strict';

    if (window.__cccCoreLoaded) return;
    window.__cccCoreLoaded = true;

    var VERSION = 'Matesfaciles 27';
    var GA_ID = 'G-KFVQX643H7';           // Measurement ID de Google Analytics 4
    var GTM_ID = 'GTM-KFVQX643H7';        // Contenedor de Google Tag Manager
    var CONSENT_KEY = 'cc27_consent_v1';
    var CONSENT_TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180 días (estándar RGPD)
    var head = document.head || document.getElementsByTagName('head')[0];

    /* ============================================================
       TIPOGRAFÍA (Space Grotesk + Inter, Google Fonts)
       Se carga vía <link> dinámico: solo tipografía, sin cookies,
       sin JavaScript de seguimiento y sin identificadores únicos.
       ============================================================ */
    function loadFonts() {
        if (document.getElementById('cc27-fonts')) return;
        var l = document.createElement('link');
        l.id = 'cc27-fonts';
        l.rel = 'stylesheet';
        l.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap';
        head.appendChild(l);
    }

    /* ============================================================
       1. ESTILOS GLOBALES — GLASSMORPHISM GAMER (NEGRO + CIAN)
       ============================================================ */
    function injectStyles() {
        if (document.getElementById('cc27-core-styles')) return;
        var style = document.createElement('style');
        style.id = 'cc27-core-styles';
        style.textContent = `
        :root {
            --primary: #00e6ff;
            --primary-rgb: 0, 230, 255;
            --primary-hover: #6fffff;
            --bg: #05060a;
            --surface: rgba(13, 17, 27, 0.72);
            --surface-solid: #0d1119;
            --interactive: rgba(23, 29, 42, 0.8);
            --border: rgba(0, 230, 255, 0.16);
            --text-main: #f2f7ff;
            --text-soft: #c3cad6;
            --text-muted: #70798a;
            --font-display: 'Space Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
            --font-body: 'Inter', 'Space Grotesk', ui-sans-serif, system-ui, sans-serif;
            --transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
            --glass-blur: blur(16px);
            --glow: 0 0 22px rgba(var(--primary-rgb), 0.35);
        }

        html { scroll-behavior: smooth; }
        body { font-family: var(--font-display); background: var(--bg); color: var(--text-main); }

        /* ---------- BANNER DE COOKIES PROPIO (RGPD) ---------- */
        #cc27-banner {
            position: fixed; left: 0; right: 0; bottom: 0; top: auto;
            z-index: 2147483000;
            display: flex; align-items: center; justify-content: space-between; gap: 26px;
            padding: 20px max(5%, calc((100% - 1200px) / 2)) calc(20px + env(safe-area-inset-bottom, 0px));
            background: rgba(6, 8, 13, 0.88);
            -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur);
            border-top: 1px solid rgba(var(--primary-rgb), 0.45);
            box-shadow: 0 -16px 48px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(var(--primary-rgb), 0.12);
            color: var(--text-main); font-family: var(--font-display);
            animation: cc27-in 0.35s ease-out both;
        }
        @keyframes cc27-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

        #cc27-banner .cc27-main {
            flex: 1 1 auto; min-width: 0;
            padding-left: 16px; border-left: 2px solid var(--primary);
        }
        #cc27-banner h3 { margin: 0 0 6px; font-size: 1rem; font-weight: 700; letter-spacing: 0.01em; }
        #cc27-banner h3 i { color: var(--primary); margin-right: 6px; }
        #cc27-banner p { margin: 0; font-family: var(--font-body); font-size: 0.88rem; line-height: 1.55; color: var(--text-soft); max-width: 78ch; }
        #cc27-banner a { color: var(--primary); text-decoration: underline; text-underline-offset: 3px; }

        #cc27-banner .cc27-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 10px; flex: 0 0 auto; }

        .cc27-btn {
            -webkit-appearance: none; appearance: none;
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            min-width: 130px; min-height: 44px; padding: 0 22px;
            border-radius: 10px; cursor: pointer;
            font-family: var(--font-display); font-size: 0.9rem; font-weight: 600; letter-spacing: 0.01em;
            transition: var(--transition); touch-action: manipulation;
            -webkit-tap-highlight-color: transparent; user-select: none;
        }
        .cc27-btn:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
        .cc27-btn:active { transform: translateY(1px); }

        .cc27-btn.accept {
            background: linear-gradient(135deg, var(--primary), #00ffc3);
            color: #03181c; border: 1px solid var(--primary); font-weight: 700;
        }
        .cc27-btn.accept:hover { box-shadow: var(--glow); filter: brightness(1.08); }

        .cc27-btn.reject {
            background: transparent; color: var(--primary);
            border: 1px solid rgba(var(--primary-rgb), 0.55);
        }
        .cc27-btn.reject:hover { background: rgba(var(--primary-rgb), 0.1); border-color: var(--primary); }

        .cc27-btn.settings {
            background: var(--interactive); color: var(--text-soft);
            border: 1px solid var(--border);
        }
        .cc27-btn.settings:hover { color: var(--text-main); border-color: var(--primary); }

        /* ---------- CENTRO DE PREFERENCIAS (MODAL) ---------- */
        #cc27-overlay {
            position: fixed; inset: 0; z-index: 2147483646;
            background: rgba(3, 4, 8, 0.72);
            -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center; padding: 18px;
        }
        #cc27-overlay[hidden] { display: none; }

        #cc27-modal {
            width: min(720px, 100%); max-height: min(88vh, 760px); overflow-y: auto;
            background: rgba(10, 13, 20, 0.92);
            -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur);
            border: 1px solid rgba(var(--primary-rgb), 0.35);
            border-radius: 18px;
            box-shadow: 0 24px 80px rgba(0, 0, 0, 0.85), 0 0 40px rgba(var(--primary-rgb), 0.12);
            font-family: var(--font-display); color: var(--text-main);
            animation: cc27-in 0.25s ease-out both;
        }

        #cc27-modal header.cc27-mhead {
            position: sticky; top: 0; z-index: 2;
            display: flex; justify-content: space-between; align-items: center; gap: 12px;
            padding: 18px 24px; background: rgba(13, 17, 27, 0.9);
            border-bottom: 1px solid var(--border);
        }
        #cc27-modal header.cc27-mhead h2 { margin: 0; font-size: 1.15rem; color: var(--primary); letter-spacing: 0.02em; }
        #cc27-modal header.cc27-mhead h2 i { margin-right: 8px; }
        .cc27-close {
            width: 36px; height: 36px; border-radius: 10px; cursor: pointer;
            background: var(--interactive); border: 1px solid var(--border); color: var(--primary);
            font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: var(--transition);
        }
        .cc27-close:hover { background: var(--primary); color: #000; }

        .cc27-intro { padding: 18px 24px 4px; font-family: var(--font-body); font-size: 0.9rem; line-height: 1.6; color: var(--text-soft); }
        .cc27-intro a { color: var(--primary); }

        .cc27-group {
            margin: 16px 24px; padding: 16px 18px;
            background: rgba(16, 21, 32, 0.6);
            border: 1px solid var(--border); border-radius: 14px;
        }
        .cc27-group .row { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
        .cc27-group h4 { margin: 0 0 4px; font-size: 0.95rem; font-weight: 700; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .cc27-group h4 i { color: var(--primary); }
        .cc27-group .tag { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.06em; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
        .cc27-group .tag.always { background: rgba(var(--primary-rgb), 0.14); color: var(--primary); border: 1px solid rgba(var(--primary-rgb), 0.35); }
        .cc27-group .tag.optional { background: rgba(255, 215, 0, 0.1); color: #ffd75e; border: 1px solid rgba(255, 215, 0, 0.3); }
        .cc27-group p { margin: 8px 0 0; font-family: var(--font-body); font-size: 0.83rem; line-height: 1.55; color: var(--text-muted); }

        /* Interruptor tipo pill (táctil) */
        .cc27-switch { position: relative; flex: 0 0 auto; width: 52px; height: 28px; }
        .cc27-switch input { opacity: 0; width: 100%; height: 100%; margin: 0; position: absolute; inset: 0; cursor: pointer; z-index: 2; }
        .cc27-switch .track {
            position: absolute; inset: 0; border-radius: 999px; transition: var(--transition);
            background: #1b2230; border: 1px solid var(--border);
        }
        .cc27-switch .track::after {
            content: ''; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%;
            background: #6b7688; transition: var(--transition);
        }
        .cc27-switch input:checked + .track { background: rgba(var(--primary-rgb), 0.25); border-color: var(--primary); box-shadow: inset 0 0 10px rgba(var(--primary-rgb), 0.25); }
        .cc27-switch input:checked + .track::after { transform: translateX(24px); background: var(--primary); box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.8); }
        .cc27-switch input:disabled + .track { opacity: 0.65; }
        .cc27-switch input:disabled { cursor: not-allowed; }
        .cc27-switch input:focus-visible + .track { outline: 2px solid var(--primary); outline-offset: 3px; }

        .cc27-tablewrap { margin: 16px 24px 4px; overflow-x: auto; }
        .cc27-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; font-family: var(--font-body); }
        .cc27-table th, .cc27-table td { border: 1px solid var(--border); padding: 8px 10px; text-align: left; color: var(--text-soft); }
        .cc27-table th { background: rgba(var(--primary-rgb), 0.08); color: var(--primary); font-family: var(--font-display); }

        #cc27-modal footer.cc27-mfoot {
            position: sticky; bottom: 0;
            display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px;
            padding: 16px 24px calc(16px + env(safe-area-inset-bottom, 0px));
            background: rgba(13, 17, 27, 0.92); border-top: 1px solid var(--border);
        }

        /* Botón flotante para reabrir preferencias */
        #cc27-reopen {
            position: fixed; left: 14px; bottom: 14px; z-index: 2147482000;
            width: 44px; height: 44px; border-radius: 50%; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            background: rgba(10, 13, 20, 0.85); color: var(--primary);
            border: 1px solid rgba(var(--primary-rgb), 0.45);
            -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur);
            box-shadow: 0 0 14px rgba(var(--primary-rgb), 0.25);
            transition: var(--transition); font-size: 1.05rem;
        }
        #cc27-reopen:hover { box-shadow: var(--glow); transform: scale(1.08); }

        @media (max-width: 768px) {
            #cc27-banner { flex-direction: column; align-items: stretch; gap: 14px; padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px)); max-height: 92vh; overflow-y: auto; }
            #cc27-banner .cc27-main { padding-left: 10px; }
            #cc27-banner .cc27-actions { flex-direction: column; width: 100%; }
            .cc27-btn { width: 100%; min-height: 48px; }
            .cc27-group { margin-inline: 14px; }
            #cc27-modal header.cc27-mhead, .cc27-intro, #cc27-modal footer.cc27-mfoot { padding-left: 16px; padding-right: 16px; }
            #cc27-modal footer.cc27-mfoot .cc27-btn { flex: 1 1 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
            #cc27-banner, #cc27-modal { animation: none; }
        }

        /* ---------- FOOTER GLASSMORPHISM GAMER ---------- */
        .academic-footer {
            position: relative;
            background: linear-gradient(180deg, rgba(8, 11, 18, 0.9), rgba(5, 6, 10, 0.98));
            -webkit-backdrop-filter: var(--glass-blur); backdrop-filter: var(--glass-blur);
            border-top: 1px solid rgba(var(--primary-rgb), 0.35);
            padding: 60px 5% 40px; margin-top: 80px;
            color: var(--text-main); font-family: var(--font-display);
        }
        .academic-footer::before {
            content: ''; position: absolute; top: -1px; left: 10%; right: 10%; height: 1px;
            background: linear-gradient(90deg, transparent, var(--primary), transparent);
            box-shadow: 0 0 18px var(--primary);
        }
        .footer-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 36px; max-width: 1200px; margin: 0 auto 36px;
        }
        .footer-col h4 {
            color: var(--primary); margin: 0 0 18px; font-weight: 700;
            letter-spacing: 0.08em; font-size: 0.86rem; text-transform: uppercase;
        }
        .footer-col h4 i { margin-right: 8px; }
        .footer-col a, .footer-col button.cc27-linkbtn {
            display: block; color: var(--text-muted); text-decoration: none; margin-bottom: 12px;
            background: none; border: none; font-family: inherit; font-size: 0.9rem;
            cursor: pointer; padding: 0; text-align: left; transition: color 0.2s ease, transform 0.2s ease;
        }
        .footer-col a:hover, .footer-col button.cc27-linkbtn:hover { color: var(--primary); transform: translateX(3px); }
        .footer-col a:focus-visible, .footer-col button.cc27-linkbtn:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
        .footer-brand { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 10px; }
        .footer-brand .accent { color: var(--primary); text-shadow: 0 0 14px rgba(var(--primary-rgb), 0.7); }
        .footer-note { color: var(--text-muted); font-family: var(--font-body); font-size: 0.85rem; margin: 10px 0 0; line-height: 1.65; }
        .footer-social { display: flex; gap: 12px; margin-top: 16px; }
        .footer-social a {
            width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center;
            background: var(--interactive); border: 1px solid var(--border); color: var(--text-soft);
            font-size: 1rem; transition: var(--transition); margin-bottom: 0;
        }
        .footer-social a:hover { color: #03181c; background: var(--primary); border-color: var(--primary); box-shadow: var(--glow); transform: translateY(-3px); }
        .legal-box {
            background: rgba(13, 17, 27, 0.6); padding: 18px 22px; border-radius: 12px;
            border: 1px solid var(--border); font-family: var(--font-body);
            font-size: 0.78rem; color: var(--text-muted); text-align: left; margin: 26px auto 0;
            max-width: 1200px; line-height: 1.65;
        }
        .legal-box strong { color: var(--primary); font-family: var(--font-display); }
        .footer-copy { text-align: center; color: var(--text-muted); font-size: 0.8rem; margin-top: 26px; font-family: var(--font-body); }
        .footer-copy .accent { color: var(--primary); }

        @media (max-width: 768px) {
            .academic-footer { padding: 44px 5% 30px; margin-top: 56px; }
            .footer-grid { grid-template-columns: 1fr 1fr; gap: 26px; }
            .footer-col button.cc27-linkbtn { text-align: center; width: 100%; }
            .footer-col a { text-align: center; }
        }
        @media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }
        `;
        head.appendChild(style);
    }

    /* ============================================================
       2. CONSENTIMIENTO RGPD PROPIO (sin TermsFeed)
       ============================================================ */
    function readConsent() {
        try {
            var raw = localStorage.getItem(CONSENT_KEY);
            if (!raw) return null;
            var c = JSON.parse(raw);
            if (!c || typeof c !== 'object' || !c.ts) return null;
            if (Date.now() - c.ts > CONSENT_TTL_MS) return null; // caducidad → volver a preguntar
            return c;
        } catch (e) { return null; }
    }

    function writeConsent(prefs) {
        var c = {
            necessary: true,
            analytics: !!prefs.analytics,
            ads: !!prefs.ads,
            ts: Date.now(),
            version: 7
        };
        try { localStorage.setItem(CONSENT_KEY, JSON.stringify(c)); } catch (e) { }
        try {
            // Cookie espejo (informativa) con SameSite según LOPDGDD / LSSI
            var secure = location.protocol === 'https:' ? '; Secure' : '';
            document.cookie = 'cc27_consent=' + encodeURIComponent(JSON.stringify({ a: c.analytics ? 1 : 0, ad: c.ads ? 1 : 0 })) + '; max-age=' + (CONSENT_TTL_MS / 1000) + '; path=/; SameSite=Lax' + secure;
        } catch (e) { }
        window.__cccConsent = c;
        dispatchConsent(c);
        return c;
    }

    function dispatchConsent(c) {
        try {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'ccc27_consentUpdate',
                gdpr: true,
                analytics_storage: c.analytics ? 'granted' : 'denied',
                ad_storage: c.ads ? 'granted' : 'denied',
                functionality_storage: 'granted',
                personalization_storage: c.analytics ? 'granted' : 'denied',
                security_storage: 'granted'
            });
        } catch (e) { }
        var ev;
        try { ev = new CustomEvent('ccc27-consent', { detail: c }); }
        catch (err) { ev = document.createEvent('CustomEvent'); ev.initCustomEvent('ccc27-consent', false, false, c); }
        document.dispatchEvent(ev);
    }

    /* ---------- Carga condicional de GTM + GA4 (SOLO tras aceptar) ---------- */
    var trackersLoaded = false;
    function loadTrackers(c) {
        if (trackersLoaded || !c || !c.analytics) return;
        trackersLoaded = true;

        // dataLayer + gtag stub (Google exige empujar "arguments", no un array)
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', GA_ID, { anonymize_ip: true });

        // Google Tag Manager
        (function (w, d, s, l, i) {
            w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
            var f = d.getElementsByTagName(s)[0], j = d.createElement(s), dl = l !== 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.id = 'cc27-gtm';
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', GTM_ID);

        // Google Analytics 4 (gtag.js)
        var ga = document.createElement('script');
        ga.async = true;
        ga.id = 'cc27-ga';
        ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
        head.appendChild(ga);
    }

    function removeTrackers() {
        trackersLoaded = false;
        ['cc27-gtm', 'cc27-ga'].forEach(function (id) {
            var s = document.getElementById(id);
            if (s && s.parentNode) s.parentNode.removeChild(s);
        });
        try {
            delete window.gtag;
            if (window.dataLayer) window.dataLayer = [];
        } catch (e) { }
    }

    /* ---------- UI: banner + centro de preferencias ---------- */
    var bannerEl = null, overlayEl = null, reopenBtn = null;

    function buildBanner() {
        if (bannerEl || overlayEl || !document.body) return;
        bannerEl = document.createElement('div');
        bannerEl.id = 'cc27-banner';
        bannerEl.setAttribute('role', 'dialog');
        bannerEl.setAttribute('aria-live', 'polite');
        bannerEl.setAttribute('aria-label', 'Preferencias de cookies');
        bannerEl.innerHTML =
            '<div class="cc27-main">' +
            '<h3><i class="fa-solid fa-cookie-bite"></i>Cookies en ' + VERSION + '</h3>' +
            '<p>Usamos <strong>cookies técnicas necesarias</strong> para que la web funcione y recuerde tu identidad anónima en el chat. ' +
            'Con tu <strong>consentimiento expreso</strong> (Arts. 6.1.a y 7 RGPD) activaríamos <strong>Google Analytics y Google Tag Manager</strong> ' +
            'para analizar el tráfico de forma agregada. Puedes aceptar, rechazar o configurar; tu elección es válida 180 días y puedes cambiarla cuando quieras. ' +
            'Más información en nuestra <a href="/privacidad">Política de Privacidad</a>.</p>' +
            '</div>' +
            '<div class="cc27-actions">' +
            '<button type="button" class="cc27-btn settings" data-act="settings"><i class="fa-solid fa-sliders"></i> Configurar</button>' +
            '<button type="button" class="cc27-btn reject" data-act="reject"><i class="fa-solid fa-xmark"></i> Rechazar</button>' +
            '<button type="button" class="cc27-btn accept" data-act="accept"><i class="fa-solid fa-check"></i> Aceptar todas</button>' +
            '</div>';

        bannerEl.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-act]');
            if (!btn) return;
            var act = btn.getAttribute('data-act');
            if (act === 'accept') {
                closeBanner();
                writeConsent({ analytics: true, ads: true });
                loadTrackers(window.__cccConsent);
                addReopen();
            } else if (act === 'reject') {
                closeBanner();
                writeConsent({ analytics: false, ads: false });
                removeTrackers();
                addReopen();
            } else if (act === 'settings') {
                closeBanner();
                openPreferences(true);
            }
        });
        document.body.appendChild(bannerEl);
    }

    function closeBanner() {
        if (bannerEl) { bannerEl.remove(); bannerEl = null; }
    }

    function addReopen() {
        if (reopenBtn || document.getElementById('cc27-reopen')) return;
        reopenBtn = document.createElement('button');
        reopenBtn.id = 'cc27-reopen';
        reopenBtn.type = 'button';
        reopenBtn.title = 'Preferencias de cookies';
        reopenBtn.setAttribute('aria-label', 'Abrir preferencias de cookies');
        reopenBtn.innerHTML = '<i class="fa-solid fa-cookie"></i>';
        reopenBtn.addEventListener('click', function () { openPreferences(false); });
        document.body.appendChild(reopenBtn);
    }

    function openPreferences(firstRun) {
        if (overlayEl || !document.body) return;
        var c = readConsent() || { analytics: false, ads: false };

        overlayEl = document.createElement('div');
        overlayEl.id = 'cc27-overlay';
        overlayEl.setAttribute('role', 'dialog');
        overlayEl.setAttribute('aria-modal', 'true');
        overlayEl.setAttribute('aria-label', 'Centro de preferencias de cookies');
        overlayEl.innerHTML =
            '<div id="cc27-modal">' +
            '<header class="cc27-mhead"><h2><i class="fa-solid fa-shield-halved"></i>Centro de preferencias</h2>' +
            '<button type="button" class="cc27-close" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button></header>' +

            '<p class="cc27-intro">Gestiona aquí tu consentimiento conforme al <strong>RGPD (UE) 2016/679</strong>, la <strong>LOPDGDD</strong> y la directiva ePrivacy (LSSI Art. 22.2). Las cookies opcionales <strong>NO se instalan</strong> hasta que las actives y guardes. Consulta la <a href="/privacidad">Política de Privacidad</a>.</p>' +

            '<div class="cc27-group">' +
            '<div class="row"><h4><i class="fa-solid fa-gears"></i> Necesarias / técnicas <span class="tag always">Siempre activas</span></h4>' +
            '<label class="cc27-switch"><input type="checkbox" checked disabled aria-label="Cookies necesarias, siempre activas"><span class="track"></span></label></div>' +
            '<p>Imprescindibles para el funcionamiento del sitio: identificador anónimo de dispositivo del chat (persistencia en tu navegador), verificación de edad +14, tema visual, favoritos de juegos y el registro de tu consentimiento. Base legal: interés legítimo y excepción de cookies técnicas (Art. 6.1.f RGPD / Considerando 25 ePrivacy). No requieren consentimiento y no ceden datos a terceros con fines publicitarios.</p>' +
            '</div>' +

            '<div class="cc27-group">' +
            '<div class="row"><h4><i class="fa-solid fa-chart-simple"></i> Analíticas (Google Analytics 4 / Tag Manager) <span class="tag optional">Opcionales</span></h4>' +
            '<label class="cc27-switch"><input type="checkbox" data-pref="analytics"' + (c.analytics ? ' checked' : '') + ' aria-label="Cookies de analítica"><span class="track"></span></label></div>' +
            '<p>Medición anónima y agregada del tráfico (páginas vistas, origen, dispositivo) mediante Google LLC. Solo se cargan si las activas: antes de aceptar, ni GTM ni gtag.js realizan ninguna petición. Datos tratados potencialmente fuera de la UE (cláusulas contractuales tipo de Google). Duración: hasta 14 meses.</p>' +
            '</div>' +

            '<div class="cc27-group">' +
            '<div class="row"><h4><i class="fa-solid fa-bullhorn"></i> Publicidad / marketing <span class="tag optional">Opcionales</span></h4>' +
            '<label class="cc27-switch"><input type="checkbox" data-pref="ads"' + (c.ads ? ' checked' : '') + ' aria-label="Cookies de publicidad"><span class="track"></span></label></div>' +
            '<p>Desactivadas por defecto: esta plataforma no sirve publicidad. Si en el futuro se integraran redes de anuncios, este interruptor controlaría su instalación. Puedes rechazarlas sin que afecte al servicio.</p>' +
            '</div>' +

            '<div class="cc27-tablewrap"><table class="cc27-table" summary="Listado de cookies utilizadas">' +
            '<thead><tr><th>Nombre</th><th>Tipo</th><th>Finalidad</th><th>Duración</th></tr></thead>' +
            '<tbody>' +
            '<tr><td>cc_device_id</td><td>Técnica (localStorage + cookie)</td><td>Identidad anónima en el chat y moderación</td><td>5 años</td></tr>' +
            '<tr><td>cc27_consent_v1</td><td>Técnica (localStorage)</td><td>Registro probatorio de tu consentimiento</td><td>180 días</td></tr>' +
            '<tr><td>age_ok_cc</td><td>Técnica (localStorage)</td><td>Verificación de edad +14</td><td>Hasta borrado manual</td></tr>' +
            '<tr><td>_cl_popup_v1 · _cl_favorites</td><td>Técnica (localStorage)</td><td>Popup de bienvenida y favoritos del panel interactivo</td><td>Hasta borrado manual</td></tr>' +
            '<tr><td>_ga · _ga_* · _gid</td><td>Opcional · Analítica</td><td>Solo si aceptas: Google Analytics 4 / Tag Manager</td><td>Hasta 14 meses</td></tr>' +
            '</tbody></table></div>' +

            '<footer class="cc27-mfoot">' +
            '<button type="button" class="cc27-btn reject" data-act="save"><i class="fa-solid fa-floppy-disk"></i> Guardar selección</button>' +
            '<button type="button" class="cc27-btn reject" data-act="rejectall"><i class="fa-solid fa-xmark"></i> Rechazar todo</button>' +
            '<button type="button" class="cc27-btn accept" data-act="acceptall"><i class="fa-solid fa-check"></i> Aceptar todas</button>' +
            '</footer></div>';

        document.body.appendChild(overlayEl);

        function closeOverlay() {
            if (overlayEl) { overlayEl.remove(); overlayEl = null; }
            document.removeEventListener('keydown', onKey);
            if (!readConsent()) buildBanner(); // sin decisión registrada: reaparece el banner
            else addReopen();
        }

        function onKey(e) { if (e.key === 'Escape') closeOverlay(); }

        overlayEl.querySelector('.cc27-close').addEventListener('click', closeOverlay);
        overlayEl.addEventListener('mousedown', function (e) { if (e.target === overlayEl && !firstRun) closeOverlay(); });
        document.addEventListener('keydown', onKey);

        overlayEl.addEventListener('click', function (e) {
            var btn = e.target.closest('[data-act]');
            if (!btn) return;
            var act = btn.getAttribute('data-act');
            var prefs = { analytics: false, ads: false };
            if (act === 'acceptall') { prefs.analytics = true; prefs.ads = true; }
            else if (act === 'rejectall') { prefs = { analytics: false, ads: false }; }
            else if (act === 'save') {
                overlayEl.querySelectorAll('[data-pref]').forEach(function (inp) {
                    prefs[inp.getAttribute('data-pref')] = inp.checked;
                });
            }
            var saved = writeConsent(prefs);
            if (saved.analytics) loadTrackers(saved); else removeTrackers();
            closeOverlay();
            addReopen();
        });
    }

    /* Enlace clásico del footer: #open_preferences_center sigue funcionando */
    document.addEventListener('click', function (e) {
        if (e.target.closest('#open_preferences_center')) {
            e.preventDefault();
            openPreferences(false);
        }
    }, false);

    /* ============================================================
       3. SEGURIDAD "DOUBLE ESCAPE" (botón del pánico académico)
       ============================================================ */
    var lastEscape = 0;
    document.addEventListener('keydown', function (e) {
        if ((e.key !== 'Escape' && e.key !== 'Esc') || e.repeat) return; // mantener pulsado no cuenta
        var now = Date.now();
        if (now - lastEscape <= 500) {
            lastEscape = 0;
            document.title = 'Google Classroom';
            var oldIcons = document.querySelectorAll('link[rel~="icon"]');
            for (var i = 0; i < oldIcons.length; i++) oldIcons[i].remove();
            var link = document.createElement('link');
            link.rel = 'icon';
            link.href = 'https://ssl.gstatic.com/classroom/favicon.png';
            head.appendChild(link);
            window.location.replace('https://classroom.google.com');
        } else {
            lastEscape = now;
        }
    });

    /* ============================================================
       4. FOOTER GLASSMORPHISM GAMER (se oculta en la home: el easter egg debe seguir invisible)
       ============================================================ */
    function injectFooter() {
        if (document.querySelector('.academic-footer') || !document.body) return;
        var year = new Date().getFullYear();
        var footer = document.createElement('footer');
        footer.className = 'academic-footer';
        // En Matesfaciles (index) el footer NO puede delatar el secreto: se oculta salvo que el panel esté desbloqueado
        var isHome = /^\/(index\.html)?$/i.test(location.pathname);
        if (isHome) footer.style.display = 'none';
        footer.innerHTML = `
            <div class="footer-grid">
                <div class="footer-col">
                    <p class="footer-brand">√ MATES<span class="accent">FACILES</span> <span class="accent">27</span></p>
                    <p class="footer-note">Matemáticas para todos los cursos, explicadas de verdad: teoría clara, calculadoras interactivas y glosario completo de símbolos. Negro profundo, neón cian y optimizado para el móvil.</p>
                    <div class="footer-social">
                        <a href="https://whatsapp.com/channel/0029Vb6QYRC6buMLgJKnJm3h" target="_blank" rel="noopener noreferrer" aria-label="Canal de WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
                        <a href="/" aria-label="Inicio"><i class="fa-solid fa-house"></i></a>
                        <a href="/chat" aria-label="Comunidad"><i class="fa-solid fa-comment-dots"></i></a>
                    </div>
                </div>
                <div class="footer-col">
                    <h4><i class="fa-solid fa-compass"></i> Navegación</h4>
                    <a href="/">Matemáticas</a>
                    <a href="/#bloque-calculadora">Calculadora científica</a>
                    <a href="/chat">Comunidad +14</a>
                    <a href="/#bloque-numeros">Números y Álgebra</a>
                    <a href="/#bloque-geometria">Geometría y Funciones</a>
                    <a href="/#bloque-simbolos">Glosario de símbolos</a>
                </div>
                <div class="footer-col">
                    <h4><i class="fa-solid fa-scale-balanced"></i> Área Legal</h4>
                    <a href="/privacidad">Política de Privacidad</a>
                    <a href="/condiciones">Términos de Uso</a>
                    <a href="/aviso-legal">Aviso Legal</a>
                    <a href="/copyright">Copyright / DMCA</a>
                    <button type="button" class="cc27-linkbtn" id="open_preferences_center"><i class="fa-solid fa-cookie-bite"></i> Configuración de Cookies</button>
                </div>
            </div>
            <div class="legal-box">
                <strong>Cláusula de exención de responsabilidad:</strong> Matesfaciles 27 es una plataforma educativa de libre acceso. Algunos recursos y calculadoras interactivas pueden usar herramientas de terceros; al ejecutarlos quedan fuera del alcance de nuestra Política de Privacidad. El uso del procesador matemático implica la aceptación de estas condiciones. Material sujeto a la Ley de Propiedad Intelectual para uso puramente académico.
            </div>
            <p class="footer-copy">Hecho con <span class="accent">◆</span> para estudiantes — <span class="accent">MATESFACILES 27</span> · CORE v7.0 · © ${year} · Cumplimiento RGPD / LOPDGDD / LSSI</p>
        `;
        document.body.appendChild(footer);
        // La home revela el footer solo cuando el secreto √(0/0) se activa (clase en <body>)
        if (isHome) {
            var reveal = function () {
                if (document.body.classList.contains('vault-open')) footer.style.display = '';
            };
            new MutationObserver(reveal).observe(document.body, { attributes: true, attributeFilter: ['class'] });
        }
    }

    /* ============================================================
       5. ARRANQUE
       ============================================================ */
    function init() {
        loadFonts();
        injectFooter();

        var c = readConsent();
        if (c) {
            window.__cccConsent = c;
            dispatchConsent(c);              // deja constancia en dataLayer/evento
            if (c.analytics) loadTrackers(c);
            addReopen();
        } else {
            buildBanner();                   // sin decisión previa: nada se carga hasta aceptar
        }
    }

    injectStyles();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();

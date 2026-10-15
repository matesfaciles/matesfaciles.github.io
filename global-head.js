/**
 * MATESFACILES CORE SYSTEM v5.1
 * Gestión global, seguridad académica, UI de cookies y cumplimiento legal.
 *
 * Seguro para cargar con <script src>, async o defer, en <head> o al final de <body>.
 */
(function () {
	'use strict';

	// Evita doble ejecución si el script se incluye dos veces.
	if (window.__matesfacilesCoreLoaded) return;
	window.__matesfacilesCoreLoaded = true;

	var GA_ID = 'G-KFVQX643H7';
	var TERMSFEED_SRC = 'https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js';
	var head = document.head || document.getElementsByTagName('head')[0];

	// ---------------------------------------------------------------
	// 1. ESTILOS GLOBALES + BANNER DE COOKIES + MODAL + FOOTER
	// ---------------------------------------------------------------
	function injectStyles() {
		if (document.getElementById('mf-core-styles')) return;

		var style = document.createElement('style');
		style.id = 'mf-core-styles';
		style.textContent = `
        :root {
            --primary: #00e6ff;
            --primary-rgb: 0, 230, 255;
            --primary-hover: #5effff;
            --bg: #0a0b0d;
            --surface: #14161d;
            --interactive: #1e222b;
            --border: rgba(0, 230, 255, 0.15);
            --text-main: #ffffff;
            --text-soft: #c3cad6;
            --text-muted: #70798a;
            /* Sin peticiones a Google Fonts (evita enviar la IP del usuario antes del consentimiento). */
            --font: 'Space Grotesk', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            --transition: all 0.2s ease;
        }

        /* =============================================================
           BANNER DE COOKIES (TermsFeed) - fila en escritorio, columna en móvil
           ============================================================= */
        #termsfeed-com---nb,
        .termsfeed-com---nb {
            position: fixed !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            top: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            z-index: 2147483000 !important;

            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 28px !important;

            padding: 20px max(5%, calc((100% - 1200px) / 2)) calc(20px + env(safe-area-inset-bottom, 0px)) !important;

            background: rgba(10, 11, 13, 0.97) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            backdrop-filter: blur(14px) !important;
            border: 0 !important;
            border-top: 1px solid rgba(var(--primary-rgb), 0.45) !important;
            border-radius: 0 !important;
            box-shadow: 0 -16px 48px rgba(0, 0, 0, 0.7) !important;

            color: var(--text-main) !important;
            font-family: var(--font) !important;
            pointer-events: auto !important;
            animation: mf-cc-in 0.35s ease-out both;
        }

        /* Solo fuerza display:flex mientras el banner NO esté oculto por la librería. */
        #termsfeed-com---nb:not([hidden]):not([style*="display: none"]):not([style*="display:none"]),
        .termsfeed-com---nb:not([hidden]):not([style*="display: none"]):not([style*="display:none"]) {
            display: flex !important;
        }

        @keyframes mf-cc-in {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        /* Contenedor de texto: ocupa el espacio sobrante */
        #termsfeed-com---nb .cc-nb-main-container,
        .termsfeed-com---nb .cc-nb-main-container {
            flex: 1 1 auto !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 0 0 16px !important;
            border-left: 2px solid var(--primary) !important;
            background: transparent !important;
            pointer-events: auto !important;
        }

        #termsfeed-com---nb .cc-nb-title,
        .termsfeed-com---nb .cc-nb-title {
            margin: 0 0 6px !important;
            padding: 0 !important;
            font-family: var(--font) !important;
            font-size: 1rem !important;
            font-weight: 700 !important;
            letter-spacing: 0.01em !important;
            line-height: 1.3 !important;
            color: var(--text-main) !important;
            text-transform: none !important;
        }

        #termsfeed-com---nb .cc-nb-text,
        .termsfeed-com---nb .cc-nb-text,
        #termsfeed-com---nb p {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 72ch !important;
            font-family: var(--font) !important;
            font-size: 0.9rem !important;
            line-height: 1.55 !important;
            color: var(--text-soft) !important;
        }

        #termsfeed-com---nb a,
        .termsfeed-com---nb a {
            color: var(--primary) !important;
            text-decoration: underline !important;
            text-decoration-thickness: 1px !important;
            text-underline-offset: 3px !important;
            border: 0 !important;
            font-family: var(--font) !important;
            font-size: inherit !important;
            pointer-events: auto !important;
        }

        /* Contenedor de botones */
        #termsfeed-com---nb .cc-nb-buttons-container,
        #termsfeed-com---nb .cc-nb-buttons,
        .termsfeed-com---nb .cc-nb-buttons-container,
        .termsfeed-com---nb .cc-nb-buttons {
            display: flex !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            justify-content: flex-end !important;
            flex: 0 0 auto !important;
            gap: 10px !important;
            margin: 0 !important;
            padding: 0 !important;
            background: transparent !important;
            position: relative !important;
            z-index: 1 !important;
            pointer-events: auto !important;
        }

        /* Botones: base compartida (todas las clases de botón de TermsFeed) */
        #termsfeed-com---nb .cc-nb-okagree,
        #termsfeed-com---nb .cc-nb-reject,
        #termsfeed-com---nb .cc-nb-changep,
        .termsfeed-com---nb .cc-nb-okagree,
        .termsfeed-com---nb .cc-nb-reject,
        .termsfeed-com---nb .cc-nb-changep {
            -webkit-appearance: none !important;
            appearance: none !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-sizing: border-box !important;
            position: relative !important;
            z-index: 1 !important;
            min-width: 120px !important;
            min-height: 44px !important;
            margin: 0 !important;
            padding: 0 22px !important;
            border-radius: 6px !important;
            font-family: var(--font) !important;
            font-size: 0.9rem !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            letter-spacing: 0.01em !important;
            text-transform: none !important;
            white-space: nowrap !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
            pointer-events: auto !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: transparent !important;
            -webkit-user-select: none !important;
            user-select: none !important;
        }

        /* Aceptar: relleno cian */
        #termsfeed-com---nb .cc-nb-okagree,
        .termsfeed-com---nb .cc-nb-okagree {
            background: var(--primary) !important;
            color: #04181c !important;
            border: 1px solid var(--primary) !important;
        }
        #termsfeed-com---nb .cc-nb-okagree:hover,
        .termsfeed-com---nb .cc-nb-okagree:hover {
            background: var(--primary-hover) !important;
            border-color: var(--primary-hover) !important;
            box-shadow: 0 0 18px rgba(var(--primary-rgb), 0.35) !important;
        }

        /* Rechazar: mismo tamaño y peso visual que Aceptar, contorno cian */
        #termsfeed-com---nb .cc-nb-reject,
        .termsfeed-com---nb .cc-nb-reject {
            background: transparent !important;
            color: var(--primary) !important;
            border: 1px solid rgba(var(--primary-rgb), 0.6) !important;
        }
        #termsfeed-com---nb .cc-nb-reject:hover,
        .termsfeed-com---nb .cc-nb-reject:hover {
            background: rgba(var(--primary-rgb), 0.1) !important;
            border-color: var(--primary) !important;
        }

        /* Preferencias: botón discreto */
        #termsfeed-com---nb .cc-nb-changep,
        .termsfeed-com---nb .cc-nb-changep {
            background: var(--interactive) !important;
            color: var(--text-soft) !important;
            border: 1px solid var(--border) !important;
        }
        #termsfeed-com---nb .cc-nb-changep:hover,
        .termsfeed-com---nb .cc-nb-changep:hover {
            color: var(--text-main) !important;
            border-color: var(--primary) !important;
        }

        #termsfeed-com---nb .cc-nb-okagree:active,
        #termsfeed-com---nb .cc-nb-reject:active,
        #termsfeed-com---nb .cc-nb-changep:active,
        .termsfeed-com---nb .cc-nb-okagree:active,
        .termsfeed-com---nb .cc-nb-reject:active,
        .termsfeed-com---nb .cc-nb-changep:active {
            transform: translateY(1px) !important;
        }

        #termsfeed-com---nb .cc-nb-okagree:focus-visible,
        #termsfeed-com---nb .cc-nb-reject:focus-visible,
        #termsfeed-com---nb .cc-nb-changep:focus-visible,
        .termsfeed-com---nb .cc-nb-okagree:focus-visible,
        .termsfeed-com---nb .cc-nb-reject:focus-visible,
        .termsfeed-com---nb .cc-nb-changep:focus-visible {
            outline: 2px solid var(--primary) !important;
            outline-offset: 3px !important;
        }

        /* Móvil: columna, ancho completo y botones apilados */
        @media (max-width: 768px) {
            #termsfeed-com---nb,
            .termsfeed-com---nb {
                flex-direction: column !important;
                align-items: stretch !important;
                justify-content: flex-start !important;
                gap: 16px !important;
                width: 100% !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
                padding: 18px 16px calc(16px + env(safe-area-inset-bottom, 0px)) !important;
            }

            #termsfeed-com---nb .cc-nb-main-container,
            .termsfeed-com---nb .cc-nb-main-container {
                flex: 0 0 auto !important;
                width: 100% !important;
                padding-left: 12px !important;
            }

            #termsfeed-com---nb .cc-nb-text,
            .termsfeed-com---nb .cc-nb-text,
            #termsfeed-com---nb p {
                max-width: 100% !important;
                font-size: 0.88rem !important;
            }

            #termsfeed-com---nb .cc-nb-buttons-container,
            #termsfeed-com---nb .cc-nb-buttons,
            .termsfeed-com---nb .cc-nb-buttons-container,
            .termsfeed-com---nb .cc-nb-buttons {
                flex-direction: column !important;
                flex-wrap: nowrap !important;
                align-items: stretch !important;
                justify-content: flex-start !important;
                width: 100% !important;
                gap: 10px !important;
            }

            #termsfeed-com---nb .cc-nb-okagree,
            #termsfeed-com---nb .cc-nb-reject,
            #termsfeed-com---nb .cc-nb-changep,
            .termsfeed-com---nb .cc-nb-okagree,
            .termsfeed-com---nb .cc-nb-reject,
            .termsfeed-com---nb .cc-nb-changep {
                width: 100% !important;
                min-height: 48px !important;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            #termsfeed-com---nb,
            .termsfeed-com---nb { animation: none !important; }
        }

        /* =============================================================
           CENTRO DE PREFERENCIAS (MODAL) - se mantiene la interfaz interna
           ============================================================= */
        .termsfeed-com---pc-overlay,
        .termsfeed-com---pc-dialog {
            z-index: 2147483647 !important;
        }

        .termsfeed-com---pc-dialog {
            background: rgba(4, 4, 4, 0.95) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            backdrop-filter: blur(10px) !important;
            align-items: center !important;
            justify-content: center !important;
        }

        .termsfeed-com---pc-dialog:not([hidden]):not([style*="display: none"]):not([style*="display:none"]) {
            display: flex !important;
        }

        .cc-pc-container {
            background: var(--bg) !important;
            border: 1px solid var(--border) !important;
            border-radius: 10px !important;
            font-family: var(--font) !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(var(--primary-rgb), 0.1) !important;
            color: var(--text-main) !important;
            max-width: 900px !important;
            width: 95% !important;
            overflow: hidden !important;
        }

        .cc-pc-head {
            background: var(--surface) !important;
            border-bottom: 1px solid var(--border) !important;
            padding: 20px 30px !important;
        }

        .cc-pc-head-title-text {
            color: var(--primary) !important;
            font-family: var(--font) !important;
            font-weight: 700 !important;
            letter-spacing: 0.04em !important;
            font-size: 0.9rem !important;
            margin-bottom: 4px !important;
        }

        #cc-pc-head-title-headline {
            color: var(--text-main) !important;
            font-family: var(--font) !important;
            font-weight: 600 !important;
            font-size: 1.3rem !important;
        }

        .cc-pc-head-close {
            background: var(--interactive) !important;
            border: 1px solid var(--border) !important;
            color: var(--primary) !important;
            border-radius: 6px !important;
            width: 32px !important;
            height: 32px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
            pointer-events: auto !important;
        }

        .cc-pc-head-close:hover {
            background: var(--primary) !important;
            color: #000 !important;
        }

        .cc-pc-head-lang-select {
            background: var(--interactive) !important;
            color: var(--text-main) !important;
            border: 1px solid var(--border) !important;
            border-radius: 6px !important;
            font-family: var(--font) !important;
            padding: 6px 12px !important;
            outline: none !important;
        }

        .cc-cp-body { background: transparent !important; }

        .cc-cp-body-tabs {
            background: #0f1115 !important;
            border-right: 1px solid var(--border) !important;
            padding: 20px 15px !important;
        }

        .cc-cp-body-tabs-item { margin-bottom: 8px !important; }

        .cc-cp-body-tabs-item-link {
            background: transparent !important;
            color: var(--text-muted) !important;
            border: 1px solid transparent !important;
            border-radius: 6px !important;
            font-family: var(--font) !important;
            font-weight: 500 !important;
            padding: 12px 16px !important;
            text-align: left !important;
            width: 100% !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
            font-size: 0.9rem !important;
            pointer-events: auto !important;
        }

        .cc-cp-body-tabs-item-link:hover {
            color: var(--text-main) !important;
            background: var(--interactive) !important;
        }

        .cc-cp-body-tabs-item[active="true"] .cc-cp-body-tabs-item-link {
            background: var(--surface) !important;
            color: var(--primary) !important;
            font-weight: 600 !important;
            border-color: var(--border) !important;
            border-left: 3px solid var(--primary) !important;
        }

        .cc-cp-body-content {
            padding: 35px !important;
            background: transparent !important;
        }

        .cc-cp-body-content-entry-title {
            font-family: var(--font) !important;
            color: var(--primary) !important;
            font-weight: 600 !important;
            font-size: 1.3rem !important;
            margin-bottom: 15px !important;
        }

        .cc-cp-body-content-entry-text {
            font-family: var(--font) !important;
            color: #9ba4b4 !important;
            font-size: 0.95rem !important;
            line-height: 1.6 !important;
            margin-bottom: 20px !important;
        }

        .cc-cp-body-content-entry-text a {
            color: var(--primary) !important;
            text-decoration: none !important;
            border-bottom: 1px dashed var(--primary) !important;
        }

        .cc-custom-checkbox {
            background: var(--surface) !important;
            border: 1px solid var(--border) !important;
            padding: 14px 20px !important;
            border-radius: 8px !important;
            display: flex !important;
            align-items: center !important;
            gap: 15px !important;
            margin-top: 25px !important;
            width: fit-content !important;
        }

        .cc-custom-checkbox label {
            font-family: var(--font) !important;
            font-weight: 600 !important;
            color: var(--text-main) !important;
            font-size: 0.9rem !important;
            letter-spacing: 0.02em !important;
            cursor: pointer !important;
        }

        .cc-custom-checkbox label.is-inactive { color: var(--text-muted) !important; }

        .cc-custom-checkbox input[type="checkbox"] {
            accent-color: var(--primary) !important;
            transform: scale(1.3) !important;
            cursor: pointer !important;
            pointer-events: auto !important;
        }

        .cc-cp-foot {
            background: var(--surface) !important;
            border-top: 1px solid var(--border) !important;
            padding: 20px 30px !important;
            display: flex !important;
            justify-content: flex-end !important;
        }

        .cc-cp-foot-byline { display: none !important; }

        .cc-cp-foot-save {
            background: var(--primary) !important;
            color: #04181c !important;
            border: none !important;
            border-radius: 6px !important;
            padding: 12px 30px !important;
            font-family: var(--font) !important;
            font-weight: 700 !important;
            font-size: 0.9rem !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
            pointer-events: auto !important;
            touch-action: manipulation !important;
        }

        .cc-cp-foot-save:hover {
            background: var(--primary-hover) !important;
            box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.3) !important;
        }

        @media (max-width: 768px) {
            .cc-pc-head { padding: 16px 18px !important; }
            .cc-cp-body-content { padding: 20px !important; }
            .cc-cp-foot { padding: 14px 18px !important; }
            .cc-cp-foot-save { width: 100% !important; }
        }

        /* =============================================================
           FOOTER TÉCNICO DE MATESFACILES
           ============================================================= */
        .academic-footer {
            background: var(--surface);
            border-top: 1px solid var(--border);
            padding: 60px 5%;
            margin-top: 80px;
            color: var(--text-main);
            font-family: var(--font);
            text-align: center;
        }

        .footer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto 40px;
        }

        .footer-col-wide { grid-column: span 2; }

        .footer-col h4 {
            color: var(--primary);
            margin: 0 0 20px;
            font-weight: 700;
            letter-spacing: 0.04em;
            font-size: 0.95rem;
        }

        .footer-col a,
        #open_preferences_center {
            display: block;
            color: var(--text-muted);
            text-decoration: none;
            margin-bottom: 12px;
            transition: color 0.2s ease;
            background: none;
            border: none;
            font-family: inherit;
            font-size: 0.9rem;
            cursor: pointer;
            padding: 0;
            width: 100%;
            text-align: center;
        }

        .footer-col a:hover,
        #open_preferences_center:hover { color: var(--primary); }

        .footer-col a:focus-visible,
        #open_preferences_center:focus-visible {
            outline: 2px solid var(--primary);
            outline-offset: 3px;
        }

        .footer-note {
            color: var(--text-muted);
            font-size: 0.85rem;
            margin: 10px 0 0;
            line-height: 1.6;
        }

        .legal-box {
            background: #0f1115;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid var(--border);
            font-size: 0.8rem;
            color: #9ba4b4;
            text-align: left;
            margin-top: 30px;
            line-height: 1.6;
        }

        @media (max-width: 768px) {
            .academic-footer { padding: 40px 5%; margin-top: 56px; }
            .footer-grid { grid-template-columns: 1fr; gap: 28px; }
            .footer-col-wide { grid-column: auto; }
        }
    `;
		head.appendChild(style);
	}

	// ---------------------------------------------------------------
	// 2. GOOGLE ANALYTICS (bloqueado hasta consentimiento) + TERMSFEED
	// ---------------------------------------------------------------

	// gtag y dataLayer DEBEN ser globales para que gtag.js los encuentre.
	// Google exige empujar el objeto "arguments" (no un array con spread).
	window.dataLayer = window.dataLayer || [];
	window.gtag = window.gtag || function () {
		window.dataLayer.push(arguments);
	};

	var analyticsReady = false;
	function setupAnalytics() {
		if (analyticsReady) return;
		analyticsReady = true;

		window.gtag('js', new Date());
		window.gtag('config', GA_ID);

		// Script marcado para TermsFeed: no se ejecuta hasta que el usuario acepte "tracking".
		// Debe existir en el DOM ANTES de llamar a cookieconsent.run().
		var gaScript = document.createElement('script');
		gaScript.type = 'text/plain';
		gaScript.setAttribute('data-cookie-consent', 'tracking');
		gaScript.async = true;
		gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
		head.appendChild(gaScript);
	}

	var consentStarted = false;
	function runCookieConsent() {
		if (consentStarted) return;
		if (!window.cookieconsent || typeof window.cookieconsent.run !== 'function') return;
		consentStarted = true;

		window.cookieconsent.run({
			"notice_banner_type": "simple",
			"consent_type": "express",
			"palette": "dark",
			"language": "es",
			"website_name": "Matesfaciles",
			"website_privacy_policy_url": "/privacidad",
			"open_preferences_center_selector": "#open_preferences_center",
			"notice_banner_reject_button_hide": false
		});
	}

	function loadTermsFeed() {
		if (window.cookieconsent) { runCookieConsent(); return; }
		if (document.querySelector('script[data-mf-termsfeed]')) return;

		var tfScript = document.createElement('script');
		tfScript.src = TERMSFEED_SRC;
		tfScript.async = true;
		tfScript.setAttribute('data-mf-termsfeed', '1');
		tfScript.onload = runCookieConsent;
		tfScript.onerror = function () {
			console.warn('[Matesfaciles] No se pudo cargar TermsFeed Cookie Consent.');
		};
		head.appendChild(tfScript);
	}

	function loadLegalScripts() {
		setupAnalytics();
		loadTermsFeed();
	}

	// ---------------------------------------------------------------
	// 3. SEGURIDAD "DOUBLE ESCAPE" (botón del pánico académico)
	// ---------------------------------------------------------------
	var lastEscape = 0;
	document.addEventListener('keydown', function (e) {
		if ((e.key !== 'Escape' && e.key !== 'Esc') || e.repeat) return; // e.repeat: mantener pulsada no cuenta

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

	// ---------------------------------------------------------------
	// 4. FOOTER ACADÉMICO
	// ---------------------------------------------------------------
	function injectFooter() {
		if (document.querySelector('.academic-footer') || !document.body) return;

		var year = new Date().getFullYear();
		var footer = document.createElement('footer');
		footer.className = 'academic-footer';
		footer.innerHTML = `
            <div class="footer-grid">
                <div class="footer-col">
                    <h4>ÍNDICE TEMÁTICO</h4>
                    <a href="#num-alg">Aritmética y Álgebra</a>
                    <a href="#geom-func">Geometría y Funciones</a>
                    <a href="#est-prob">Estadística y Azar</a>
                </div>
                <div class="footer-col">
                    <h4>ÁREA LEGAL</h4>
                    <a href="/privacidad">Política de Privacidad</a>
                    <a href="/condiciones">Términos de Uso</a>
                    <a href="/aviso-legal">Aviso Legal</a>
                    <button type="button" id="open_preferences_center">Configuración de Cookies</button>
                </div>
                <div class="footer-col footer-col-wide">
                    <h4>MATESFACILES EDU</h4>
                    <p class="footer-note">
                        Plataforma de Cálculo Científico v5.1<br>
                        © ${year} Matesfaciles. Todos los derechos reservados. Material sujeto a la Ley de Propiedad Intelectual para uso puramente académico.
                    </p>
                </div>
            </div>
            <div class="legal-box">
                <strong>Cláusula de Exención de Responsabilidad:</strong> Matesfaciles es una plataforma educativa de libre acceso. Algunos recursos, calculadoras interactivas o algoritmos alojados en secciones externas pueden redirigir a herramientas de terceros. En el momento en el que un usuario hace clic o ejecuta comandos que accedan a dichos recursos, estará saliendo de la jurisdicción principal de Matesfaciles y, por tanto, fuera de los efectos de nuestra Política de Privacidad y Términos de Uso. El uso del procesador matricial implica la aceptación de estas condiciones.
            </div>
        `;
		document.body.appendChild(footer);
	}

	// ---------------------------------------------------------------
	// 5. ARRANQUE (válido con async/defer o con el DOM ya cargado)
	// ---------------------------------------------------------------
	function init() {
		// Orden importante: el footer (con #open_preferences_center) debe existir
		// antes de cookieconsent.run() para que TermsFeed enlace el botón.
		injectFooter();
		loadLegalScripts();
	}

	injectStyles();

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init, { once: true });
	} else {
		init();
	}
})();

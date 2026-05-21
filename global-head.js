/**
 * COCACOLALANDIA CORE SYSTEM v4.2
 * Gestión Global de Temas, Seguridad, UI de Cookies y Cumplimiento Legal
 */

(function() {
    const head = document.head;

    // --- 1. MOTOR DE ESTILOS GLOBALES E INYECCIÓN DE UI ---
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --primary: #ff003c;
            --primary-rgb: 255, 0, 60;
            --bg: #080808;
            --surface: #121212;
            --border: rgba(255, 255, 255, 0.1);
            --font: 'Space Grotesk', sans-serif;
            --transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        /* --- TEMAS DINÁMICOS --- */
        body.theme-matrix { --primary: #00ff41; --primary-rgb: 0, 255, 65; --bg: #000; }
        body.theme-vaporwave { --primary: #ff00ff; --primary-rgb: 255, 0, 255; --bg: #2d004d; }
        body.theme-cyberpunk { --primary: #fcee0a; --primary-rgb: 252, 238, 10; --bg: #000; }
        body.theme-blood { --primary: #ff4d4d; --primary-rgb: 255, 77, 77; --bg: #1a0000; }
        
        /* --- REDISEÑO TOTAL TERMSFEED (COOKIES UI - BANNER INFERIOR) --- */
        #termsfeed-com---nb {
            background: rgba(10, 10, 10, 0.96) !important;
            backdrop-filter: blur(15px) !important;
            border-top: 2px solid var(--primary) !important;
            padding: 25px 5% !important;
            font-family: var(--font) !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.8) !important;
        }

        #termsfeed-com---nb p, #termsfeed-com---nb a, .cc-nb-title {
            font-family: var(--font) !important;
            color: #eee !important;
        }

        #termsfeed-com---nb a { color: var(--primary) !important; text-decoration: underline !important; }

        /* Botones del Banner */
        .cc-nb-okagree {
            background: var(--primary) !important;
            color: white !important;
            border-radius: 12px !important;
            padding: 12px 30px !important;
            font-family: var(--font) !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            border: none !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
        }

        .cc-nb-okagree:hover { transform: translateY(-2px) !important; box-shadow: 0 5px 15px rgba(var(--primary-rgb), 0.4) !important; }

        .cc-nb-reject, .cc-nb-changep {
            background: rgba(255,255,255,0.05) !important;
            color: #ccc !important;
            border: 1px solid var(--border) !important;
            border-radius: 12px !important;
            padding: 12px 25px !important;
            font-family: var(--font) !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
        }

        /* --- INTERFACE REESCRITA 100% PARA O CENTRO DE PREFERENCIAS (MODAL GRANDE) --- */
        
        /* Fondo externo do modal */
        .termsfeed-com---pc-dialog {
            background: rgba(4, 4, 4, 0.9) !important;
            backdrop-filter: blur(16px) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }

        /* Estrutura base nova */
        .cc-pc-container {
            background: #0f0f0f !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 20px !important;
            font-family: var(--font) !important;
            box-shadow: 0 30px 70px rgba(0, 0, 0, 0.8), 0 0 50px rgba(var(--primary-rgb), 0.05) !important;
            color: #ffffff !important;
            max-width: 880px !important;
            width: 92% !important;
            overflow: hidden !important;
        }

        /* Cabecera limpa sen bloques grises */
        .cc-pc-head {
            background: transparent !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
            padding: 25px 35px !important;
        }
        .cc-pc-head-title-text {
            color: var(--primary) !important;
            font-family: var(--font) !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 2px !important;
            font-size: 1.1rem !important;
            margin-bottom: 4px !important;
        }
        #cc-pc-head-title-headline {
            color: #ffffff !important;
            font-family: var(--font) !important;
            font-weight: 500 !important;
            font-size: 1.4rem !important;
        }
        .cc-pc-head-close {
            background: rgba(255, 255, 255, 0.03) !important;
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
            color: #ffffff !important;
            border-radius: 50% !important;
            width: 36px !important;
            height: 36px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
        }
        .cc-pc-head-close:hover {
            background: var(--primary) !important;
            border-color: var(--primary) !important;
            transform: scale(1.05) !important;
        }
        .cc-pc-head-lang-select {
            background: #161616 !important;
            color: #ffffff !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 8px !important;
            font-family: var(--font) !important;
            padding: 6px 12px !important;
            outline: none !important;
        }

        /* Bloque de distribución interna */
        .cc-cp-body {
            background: transparent !important;
        }

        /* Menú lateral (Lista de seccións) */
        .cc-cp-body-tabs {
            background: #131313 !important;
            border-right: 1px solid rgba(255, 255, 255, 0.03) !important;
            padding: 25px 20px !important;
        }
        .cc-cp-body-tabs-item {
            margin-bottom: 6px !important;
        }
        .cc-cp-body-tabs-item-link {
            background: transparent !important;
            color: #777777 !important;
            border: none !important;
            border-radius: 10px !important;
            font-family: var(--font) !important;
            font-weight: 500 !important;
            padding: 14px 18px !important;
            text-align: left !important;
            width: 100% !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
            font-size: 0.95rem !important;
        }
        .cc-cp-body-tabs-item-link:hover {
            color: #ffffff !important;
            background: rgba(255, 255, 255, 0.02) !important;
        }
        /* Cando a sección está activa */
        .cc-cp-body-tabs-item[active="true"] .cc-cp-body-tabs-item-link {
            background: rgba(255, 255, 255, 0.04) !important;
            color: #ffffff !important;
            font-weight: 600 !important;
            border-left: 3px solid var(--primary) !important;
            border-radius: 4px 10px 10px 4px !important;
        }

        /* Panel de contidos á dereita */
        .cc-cp-body-content {
            padding: 40px !important;
            background: transparent !important;
        }
        .cc-cp-body-content-entry-title {
            font-family: var(--font) !important;
            color: #ffffff !important;
            font-weight: 600 !important;
            font-size: 1.5rem !important;
            margin-bottom: 20px !important;
        }
        .cc-cp-body-content-entry-text {
            font-family: var(--font) !important;
            color: #a0a0a0 !important;
            font-size: 0.95rem !important;
            line-height: 1.7 !important;
            margin-bottom: 16px !important;
        }
        .cc-cp-body-content-entry-text a {
            color: var(--primary) !important;
            text-decoration: none !important;
            font-weight: 500 !important;
        }
        .cc-cp-body-content-entry-text a:hover {
            text-decoration: underline !important;
        }

        /* Checkboxes integrados como interruptores elegantes */
        .cc-custom-checkbox {
            background: #141414 !important;
            border: 1px solid rgba(255, 255, 255, 0.05) !important;
            padding: 16px 24px !important;
            border-radius: 12px !important;
            display: flex !important;
            align-items: center !important;
            gap: 16px !important;
            margin-top: 30px !important;
            width: fit-content !important;
        }
        .cc-custom-checkbox label {
            font-family: var(--font) !important;
            font-weight: 600 !important;
            color: var(--primary) !important;
            font-size: 0.9rem !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            cursor: pointer !important;
        }
        .cc-custom-checkbox label.is-inactive {
            color: #444444 !important;
        }
        .cc-custom-checkbox input[type="checkbox"] {
            accent-color: var(--primary) !important;
            transform: scale(1.2) !important;
            cursor: pointer !important;
        }

        /* Pe do modal */
        .cc-cp-foot {
            background: transparent !important;
            border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
            padding: 25px 35px !important;
            display: flex !important;
            justify-content: flex-end !important;
        }
        
        /* OCULTAR COMPLETAMENTE TODO RASTRO DE TERMSFEED */
        .cc-cp-foot-byline {
            display: none !important;
        }
        
        /* Botón de gardar as preferencias */
        .cc-cp-foot-save {
            background: var(--primary) !important;
            color: #ffffff !important;
            border: none !important;
            border-radius: 10px !important;
            padding: 14px 35px !important;
            font-family: var(--font) !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            font-size: 0.85rem !important;
            letter-spacing: 1px !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
        }
        .cc-cp-foot-save:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(var(--primary-rgb), 0.4) !important;
        }

        /* --- FOOTER REDISEÑADO DE COCACOLALANDIA --- */
        .coca-footer {
            background: var(--surface);
            border-top: 1px solid var(--border);
            padding: 60px 5%;
            margin-top: 100px;
            color: white;
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
        .footer-col h4 { color: var(--primary); margin-bottom: 20px; font-weight: 700; }
        
        /* Estilos unificados para enlaces y el botón de ajustes */
        .footer-col a, #open_preferences_center {
            display: block; 
            color: #888; 
            text-decoration: none; 
            margin-bottom: 10px;
            transition: 0.3s; 
            background: none; 
            border: none; 
            font-family: inherit; 
            font-size: 0.95rem; 
            cursor: pointer;
            padding: 0;
            width: 100%;
            text-align: center;
        }
        
        /* Efecto Hover unificado (Desplazamiento e iluminación) */
        .footer-col a:hover, #open_preferences_center:hover { 
            color: var(--primary); 
            transform: translateX(5px); 
        }
        
        .legal-box {
            background: rgba(255,255,255,0.02);
            padding: 20px; border-radius: 15px; border: 1px solid var(--border);
            font-size: 0.8rem; color: #555; text-align: left; margin-top: 30px;
        }
    `;
    head.appendChild(style);

    // --- 2. GESTIÓN DE COOKIES Y ANALYTICS (TERMSFEED) ---
    const loadLegalScripts = () => {
        const tfScript = document.createElement('script');
        tfScript.src = "https://www.termsfeed.com/public/cookie-consent/4.2.0/cookie-consent.js";
        head.appendChild(tfScript);

        tfScript.onload = () => {
            cookieconsent.run({
                "notice_banner_type": "simple",
                "consent_type": "express",
                "palette": "dark",
                "language": "es",
                "website_name": "Cocacolalandia",
                "website_privacy_policy_url": "https://matesfaciles.github.io/privacidad"
            });
        };

        const gaID = 'G-KFVQX643H7';
        const gaScript = document.createElement('script');
        gaScript.type = "text/plain";
        gaScript.setAttribute('data-cookie-consent', 'tracking');
        gaScript.async = true;
        gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaID}`;
        head.appendChild(gaScript);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', gaID);
    };

    // --- 3. LÓGICA DE EVENTOS Y TEMAS ---
    const applyTheme = () => {
        const hoy = new Date();
        const d = hoy.getDate();
        const m = hoy.getMonth() + 1;
        if (m === 10 && d === 31) document.body.classList.add('event-halloween');
        else if (m === 3 && d === 8) document.body.classList.add('event-8m');
        else {
            const saved = localStorage.getItem('cocacola-pref-theme');
            if (saved && saved !== 'classic') document.body.classList.add(saved);
        }
    };

    // --- 4. GADGET DE SEGURIDAD "DOUBLE ESCAPE" ---
    let escCount = 0;
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            escCount++;
            setTimeout(() => escCount = 0, 500);
            if (escCount === 2) {
                document.title = "Google Classroom";
                const link = document.createElement('link');
                link.rel = 'icon'; link.href = 'https://ssl.gstatic.com/classroom/favicon.png';
                head.appendChild(link);
                window.location.replace("https://classroom.google.com");
            }
        }
    });

    // --- 5. INYECCIÓN DINÁMICA DEL FOOTER ---
    window.addEventListener('DOMContentLoaded', () => {
        applyTheme();
        loadLegalScripts();

        const footer = document.createElement('footer');
        footer.className = 'coca-footer';
        footer.innerHTML = `
            <div class="footer-grid">
                <div class="footer-col">
                    <h4>NAVEGACIÓN</h4>
                    <a href="/">Inicio</a>
                    <a href="/juegos">Juegos Desbloqueados</a>
                    <a href="/chat">Chat Global</a>
                </div>
                <div class="footer-col">
                    <h4>LEGAL</h4>
                    <a href="/privacidad">Privacidad</a>
                    <a href="/condiciones">Términos de Uso</a>
                    <a href="/aviso-legal">Aviso Legal</a>
                    <a href="/copyright">Reclamaciones de Copyright</a>
                    <button id="open_preferences_center">Ajustes de Cookies</button>
                </div>
                <div class="footer-col" style="grid-column: span 2;">
                    <h4>COCACOLALANDIA</h4>
                    <p style="color:#555; font-size:0.9rem;">Versión 26.4.0. <br>© 2026 Cocacolalandia. Todos los derechos reservados. Según la Ley de Propiedad Intelectual Española, este sitio web está protegido por derechos de autor.</p>
                </div>
            </div>
            <div class="legal-box">
                <strong>Disclaimer:</strong> Cocacolalandia es un sitio web proveedor de juegos. Sin embargo, esos juegos no son almacenados por Cocacolalandia, ni son programados por Cocacolalandia. En el momento en el que un usuario haga click en un botón para acceder a un juego, estará saliendo de la propiedad de Cocacolalandia y, por tanto, fuera de los efectos de la Política de Privacidad, Condiciones de Uso, Copyright y del Aviso Legal. No estamos afiliados con The Coca-Cola Company. Todas las marcas pertenecen a sus respectivos dueños.
            </div>
        `;
        document.body.appendChild(footer);

        const cookBtn = document.getElementById('open_preferences_center');
        if (cookBtn) {
            cookBtn.onclick = () => {
                if (typeof cookieconsent !== 'undefined') cookieconsent.openPreferencesCenter();
            };
        }
    });
})();
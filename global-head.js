/**
 * MATESFACILES CORE SYSTEM v5.0
 * Gestión Global, Seguridad Académica, UI de Cookies y Cumplimiento Legal
 */

(function() {
    const head = document.head;

    // --- 1. MOTOR DE ESTILOS GLOBALES E INYECCIÓN DE UI DE COOKIES ---
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --primary: #00e6ff;
            --primary-rgb: 0, 230, 255;
            --bg: #0a0b0d;
            --surface: #14161d;
            --interactive: #1e222b;
            --border: rgba(0, 230, 255, 0.15);
            --text-main: #ffffff;
            --text-muted: #70798a;
            --font: 'Space Grotesk', sans-serif;
            --transition: all 0.25s ease;
        }

        /* --- REDISEÑO TOTAL TERMSFEED (BANNER INFERIOR MINIMALISTA TÉCNICO) --- */
        #termsfeed-com---nb {
            background: rgba(10, 11, 13, 0.98) !important;
            backdrop-filter: blur(12px) !important;
            border-top: 1px solid var(--primary) !important;
            padding: 20px 5% !important;
            font-family: var(--font) !important;
            box-shadow: 0 -10px 40px rgba(0,0,0,0.9) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
        }

        #termsfeed-com---nb p, #termsfeed-com---nb a, .cc-nb-title {
            font-family: var(--font) !important;
            color: var(--text-main) !important;
            font-size: 0.95rem !important;
        }

        .cc-nb-title {
            color: var(--primary) !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            margin-bottom: 8px !important;
        }

        #termsfeed-com---nb a { 
            color: var(--primary) !important; 
            text-decoration: none !important;
            border-bottom: 1px dashed var(--primary) !important;
        }

        /* Botones del Banner */
        .cc-nb-buttons-container {
            display: flex !important;
            gap: 12px !important;
        }

        .cc-nb-okagree {
            background: var(--primary) !important;
            color: #0a0b0d !important;
            border-radius: 6px !important;
            padding: 10px 24px !important;
            font-family: var(--font) !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            border: none !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
        }

        .cc-nb-okagree:hover { 
            background: #5effff !important;
            box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.4) !important; 
        }

        .cc-nb-reject, .cc-nb-changep {
            background: var(--interactive) !important;
            color: var(--text-main) !important;
            border: 1px solid var(--border) !important;
            border-radius: 6px !important;
            padding: 10px 20px !important;
            font-family: var(--font) !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
        }

        .cc-nb-reject:hover, .cc-nb-changep:hover {
            background: #272c38 !important;
            border-color: var(--primary) !important;
        }

        /* --- CENTRO DE PREFERENCIAS DE COOKIES (MODAL ESTILO CONSOLA) --- */
        
        .termsfeed-com---pc-dialog {
            background: rgba(4, 4, 4, 0.95) !important;
            backdrop-filter: blur(10px) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
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
            text-transform: uppercase !important;
            letter-spacing: 0.1em !important;
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

        .cc-cp-body {
            background: transparent !important;
        }

        .cc-cp-body-tabs {
            background: #0f1115 !important;
            border-right: 1px solid var(--border) !important;
            padding: 20px 15px !important;
        }

        .cc-cp-body-tabs-item {
            margin-bottom: 8px !important;
        }

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
            text-transform: uppercase !important;
            letter-spacing: 0.05em !important;
            cursor: pointer !important;
        }

        .cc-custom-checkbox label.is-inactive {
            color: var(--text-muted) !important;
        }

        .cc-custom-checkbox input[type="checkbox"] {
            accent-color: var(--primary) !important;
            transform: scale(1.3) !important;
            cursor: pointer !important;
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
            color: #0a0b0d !important;
            border: none !important;
            border-radius: 6px !important;
            padding: 12px 30px !important;
            font-family: var(--font) !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            font-size: 0.85rem !important;
            letter-spacing: 0.05em !important;
            cursor: pointer !important;
            transition: var(--transition) !important;
        }

        .cc-cp-foot-save:hover {
            background: #5effff !important;
            box-shadow: 0 0 15px rgba(var(--primary-rgb), 0.3) !important;
        }

        /* --- FOOTER TÉCNICO DE MATESFACILES --- */
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
        .footer-col h4 { 
            color: var(--primary); 
            margin-bottom: 20px; 
            font-weight: 700; 
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-size: 0.95rem;
        }
        
        .footer-col a, #open_preferences_center {
            display: block; 
            color: var(--text-muted); 
            text-decoration: none; 
            margin-bottom: 12px;
            transition: 0.2s; 
            background: none; 
            border: none; 
            font-family: inherit; 
            font-size: 0.9rem; 
            cursor: pointer;
            padding: 0;
            width: 100%;
            text-align: center;
        }
        
        .footer-col a:hover, #open_preferences_center:hover { 
            color: var(--primary); 
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
                "website_name": "Matesfaciles",
                "website_privacy_policy_url": "/privacidad"
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

    // --- 3. GADGET DE SEGURIDAD "DOUBLE ESCAPE" (Botón del pánico académico) ---
    let escCount = 0;
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            escCount++;
            setTimeout(() => escCount = 0, 500);
            if (escCount === 2) {
                document.title = "Google Classroom";
                const link = document.createElement('link');
                link.rel = 'icon'; 
                link.href = 'https://ssl.gstatic.com/classroom/favicon.png';
                head.appendChild(link);
                window.location.replace("https://classroom.google.com");
            }
        }
    });

    // --- 4. INYECCIÓN DINÁMICA DEL FOOTER ACADÉMICO ---
    window.addEventListener('DOMContentLoaded', () => {
        loadLegalScripts();

        const footer = document.createElement('footer');
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
                    <button id="open_preferences_center">Configuración de Cookies</button>
                </div>
                <div class="footer-col" style="grid-column: span 2;">
                    <h4>MATESFACILES EDU</h4>
                    <p style="color:var(--text-muted); font-size:0.85rem; margin-top: 10px;">
                        Plataforma de Cálculo Científico v5.0<br>
                        © 2026 Matesfaciles. Todos los derechos reservados. Material sujeto a la Ley de Propiedad Intelectual para uso puramente académico.
                    </p>
                </div>
            </div>
            <div class="legal-box">
                <strong>Cláusula de Exención de Responsabilidad:</strong> Matesfaciles es una plataforma educativa de libre acceso. Algunos recursos, calculadoras interactivas o algoritmos alojados en secciones externas pueden redirigir a herramientas de terceros. En el momento en el que un usuario hace clic o ejecuta comandos que accedan a dichos recursos, estará saliendo de la jurisdicción principal de Matesfaciles y, por tanto, fuera de los efectos de nuestra Política de Privacidad y Términos de Uso. El uso del procesador matricial implica la aceptación de estas condiciones.
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
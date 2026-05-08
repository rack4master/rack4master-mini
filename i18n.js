// i18n.js
// Internationalization for Rack4Master mini
// Languages: en (default), es, ca
// ASCII-only. var, no ES6 syntax.

var i18n = (function() {

    var currentLang = 'en';
    var onChangeCb  = null;

    // ----------------------------------------------------------------
    // UI STRINGS
    // ----------------------------------------------------------------
    var UI = {
        en: {
            // Header / transport
            'brand.sub':        'Intelligent EQ Auto-mastering',
            'btn.play':         'Play',
            'btn.stop':         'Stop',
            'btn.loop':         'Loop',
            'btn.bypass':       'FX',
            'btn.wav':          'WAV',
            'btn.save':         'Save preset',
            'btn.load':         'Load preset',
            'btn.clearall':     'Clear all',
            // Drop zone
            'drop.title':       'Drop your audio here',
            'drop.sub':         'or click to select a file',
            'drop.formats':     'MP3 - WAV - OGG - FLAC - AAC',
            // Pre-idle
            'idle.msg':         'Load an audio file to start.',
            // Mode bar
            'mode.analysis':    'Analysis',
            'mode.analysis.sub':'Intelligent Auto-EQ',
            'mode.presets':     'Presets',
            'mode.presets.sub': 'Styles and genres',
            // Workspace idle
            'ws.idle.left':     'Select a mode above to start',
            'ws.idle.right':    'Select an item from the list to adjust its parameters',
            // Status bar
            'status.ready':     'Auto-Master ready \xb7 Transparent analysis \xb7 100% browser',
            // Footer
            'foot.copyright':   '\xa9 2026 Rack4Master. All rights reserved.',
            'foot.local':       'Runs locally in your browser. No data stored or tracked.',
            'foot.privacy':     'Privacy',
            'foot.legal':       'Legal',
            'foot.terms':       'Terms',
            // Menu
            'menu.language':    'Language',
            'menu.help':        'Help'
        },
        es: {
            'brand.sub':        'Auto-masterizacion inteligente con EQ',
            'btn.play':         'Play',
            'btn.stop':         'Stop',
            'btn.loop':         'Loop',
            'btn.bypass':       'FX',
            'btn.wav':          'WAV',
            'btn.save':         'Guardar preset',
            'btn.load':         'Cargar preset',
            'btn.clearall':     'Borrar todo',
            'drop.title':       'Arrastra tu audio aqui',
            'drop.sub':         'o haz clic para seleccionar un archivo',
            'drop.formats':     'MP3 - WAV - OGG - FLAC - AAC',
            'idle.msg':         'Carga un archivo de audio para empezar.',
            'mode.analysis':    'Analisis',
            'mode.analysis.sub':'Auto-EQ inteligente',
            'mode.presets':     'Presets',
            'mode.presets.sub': 'Estilos y generos',
            'ws.idle.left':     'Selecciona un modo arriba para empezar',
            'ws.idle.right':    'Selecciona un elemento de la lista para ajustar sus parametros',
            'status.ready':     'Auto-Master listo \xb7 Analisis transparente \xb7 100% navegador',
            'foot.copyright':   '\xa9 2026 Rack4Master. Todos los derechos reservados.',
            'foot.local':       'Se ejecuta localmente en tu navegador. No se almacena ni rastrea ningun dato.',
            'foot.privacy':     'Privacidad',
            'foot.legal':       'Legal',
            'foot.terms':       'Condiciones',
            'menu.language':    'Idioma',
            'menu.help':        'Ayuda'
        },
        ca: {
            'brand.sub':        'Auto-masteritzacio intelligentamb EQ',
            'btn.play':         'Play',
            'btn.stop':         'Stop',
            'btn.loop':         'Loop',
            'btn.bypass':       'FX',
            'btn.wav':          'WAV',
            'btn.save':         'Desar preset',
            'btn.load':         'Carregar preset',
            'btn.clearall':     'Esborrar-ho tot',
            'drop.title':       'Arrossega el teu audio aqui',
            'drop.sub':         'o fes clic per seleccionar un fitxer',
            'drop.formats':     'MP3 - WAV - OGG - FLAC - AAC',
            'idle.msg':         'Carrega un fitxer d\'audio per comencar.',
            'mode.analysis':    'Analisi',
            'mode.analysis.sub':'Auto-EQ intelligent',
            'mode.presets':     'Presets',
            'mode.presets.sub': 'Estils i generes',
            'ws.idle.left':     'Selecciona un mode a dalt per comencar',
            'ws.idle.right':    'Selecciona un element de la llista per ajustar els seus parametres',
            'status.ready':     'Auto-Master a punt \xb7 Analisi transparent \xb7 100% navegador',
            'foot.copyright':   '\xa9 2026 Rack4Master. Tots els drets reservats.',
            'foot.local':       'S\'executa localment al teu navegador. Cap dada emmagatzemada ni rastrejada.',
            'foot.privacy':     'Privacitat',
            'foot.legal':       'Legal',
            'foot.terms':       'Condicions',
            'menu.language':    'Idioma',
            'menu.help':        'Ajuda'
        }
    };

    // ----------------------------------------------------------------
    // MODAL CONTENT
    // ----------------------------------------------------------------
    var MODALS = {
        en: {
            privacy: {
                title: 'PRIVACY',
                body: '<p><strong>Last updated: May 2026</strong></p>' +
                      '<p>Rack4Master is a browser-based audio mastering application designed to operate entirely on the user\'s device.</p>' +
                      '<h3>1. Local Processing</h3><p>All audio processing takes place locally within the user\'s browser using standard web technologies such as the Web Audio API. Audio files selected by users are never uploaded, transmitted, or stored on any server.</p>' +
                      '<h3>2. No Personal Data Collection</h3><p>Rack4Master does not collect, store, analyze, or process personal data.</p>' +
                      '<h3>3. No Accounts</h3><p>The application does not require user registration, login, or identity verification.</p>' +
                      '<h3>4. No Analytics or Tracking</h3><p>This website does not use analytics platforms, tracking technologies, advertising systems, or profiling tools.</p>' +
                      '<h3>5. Cookies</h3><p>Rack4Master does not set cookies. External services accessed voluntarily by users (such as donation platforms) may use their own cookies independently.</p>' +
                      '<h3>6. Third-Party Services</h3><p>If users choose to support the project through external payment providers, those services operate under their own privacy policies.</p>' +
                      '<h3>7. User Responsibility</h3><p>Because all processing occurs locally, users retain full control over their files and data.</p>' +
                      '<h3>8. Contact</h3><p>Privacy inquiries: <a href="mailto:rackmaster@proton.me">rackmaster@proton.me</a></p>'
            },
            legal: {
                title: 'LEGAL',
                body: '<p>Rack4Master is an independent software project.</p>' +
                      '<p><strong>Project name:</strong> Rack4Master<br>' +
                      '<strong>Project type:</strong> Browser-based audio mastering tool<br>' +
                      '<strong>Contact:</strong> <a href="mailto:rackmaster@proton.me">rackmaster@proton.me</a></p>' +
                      '<p>This website provides software tools intended for local use within the user\'s browser. The project is published under an editorial project identity. Public disclosure of personal identity is not required except where mandated by applicable law. All content is provided for informational and software usage purposes only.</p>' +
                      '<h3>Open Source License</h3><p>The source code of this application is released under the MIT License. You can view, modify, and distribute the code freely.<br>' +
                      '<a href="https://github.com/rack4master/rack4master" target="_blank">GitHub repository</a><br>' +
                      'Created by: Francesc Llorens Cerda</p>'
            },
            terms: {
                title: 'TERMS OF USE',
                body: '<p>By using Rack4Master, you agree to the following terms.</p>' +
                      '<h3>1. Software Nature</h3><p>Rack4Master is experimental audio processing software provided free of charge.</p>' +
                      '<h3>2. Local Operation</h3><p>The software runs entirely within the user\'s browser. The project does not access, monitor, or store user files.</p>' +
                      '<h3>3. No Warranty</h3><p>The software is provided "as is", without warranties of any kind. No guarantee is made regarding audio quality, compatibility, or availability. Users are responsible for maintaining backups.</p>' +
                      '<h3>4. Limitation of Liability</h3><p>Rack4Master and its author shall not be liable for data loss, audio degradation or indirect damages.</p>' +
                      '<h3>5. Copyright & User Responsibility</h3><p>Users are solely responsible for ensuring they possess the necessary rights or permissions to process any audio material. The project assumes no responsibility for copyright infringement by users.</p>' +
                      '<h3>6. Acceptable Use</h3><p>Users agree not to use the software for unlawful purposes.</p>' +
                      '<h3>7. Changes</h3><p>The project may modify or discontinue the software at any time without notice.</p>' +
                      '<h3>8. Governing Law and Jurisdiction</h3><p>These terms are governed by the laws of Spain. Any dispute arising from the use of the software shall be submitted to the courts of Spain.</p>'
            }
        },
        es: {
            privacy: {
                title: 'PRIVACIDAD',
                body: '<p><strong>Ultima actualizacion: mayo 2026</strong></p>' +
                      '<p>Rack4Master es una aplicacion de masterizacion de audio basada en navegador, disenada para funcionar completamente en el dispositivo del usuario.</p>' +
                      '<h3>1. Procesamiento local</h3><p>Todo el procesamiento de audio se realiza localmente en el navegador del usuario mediante tecnologias web estandar como la Web Audio API. Los archivos de audio seleccionados por los usuarios nunca se suben, transmiten ni almacenan en ningun servidor.</p>' +
                      '<h3>2. Sin recopilacion de datos personales</h3><p>Rack4Master no recopila, almacena, analiza ni procesa datos personales.</p>' +
                      '<h3>3. Sin cuentas</h3><p>La aplicacion no requiere registro, inicio de sesion ni verificacion de identidad.</p>' +
                      '<h3>4. Sin analitica ni rastreo</h3><p>Este sitio web no utiliza plataformas de analitica, tecnologias de rastreo, sistemas publicitarios ni herramientas de perfilado.</p>' +
                      '<h3>5. Cookies</h3><p>Rack4Master no establece cookies. Los servicios externos a los que los usuarios accedan voluntariamente (como plataformas de donacion) pueden usar sus propias cookies de forma independiente.</p>' +
                      '<h3>6. Servicios de terceros</h3><p>Si los usuarios eligen apoyar el proyecto a traves de proveedores de pago externos, esos servicios operan bajo sus propias politicas de privacidad.</p>' +
                      '<h3>7. Responsabilidad del usuario</h3><p>Como todo el procesamiento ocurre localmente, los usuarios mantienen el control total sobre sus archivos y datos.</p>' +
                      '<h3>8. Contacto</h3><p>Consultas de privacidad: <a href="mailto:rackmaster@proton.me">rackmaster@proton.me</a></p>'
            },
            legal: {
                title: 'LEGAL',
                body: '<p>Rack4Master es un proyecto de software independiente.</p>' +
                      '<p><strong>Nombre del proyecto:</strong> Rack4Master<br>' +
                      '<strong>Tipo de proyecto:</strong> Herramienta de masterizacion de audio basada en navegador<br>' +
                      '<strong>Contacto:</strong> <a href="mailto:rackmaster@proton.me">rackmaster@proton.me</a></p>' +
                      '<p>Este sitio web proporciona herramientas de software destinadas al uso local en el navegador del usuario. El proyecto se publica bajo una identidad de proyecto editorial. La divulgacion publica de la identidad personal no es necesaria salvo cuando lo exija la legislacion aplicable.</p>' +
                      '<h3>Licencia Open Source</h3><p>El codigo fuente de esta aplicacion se publica bajo la Licencia MIT. Puedes ver, modificar y distribuir el codigo libremente.<br>' +
                      '<a href="https://github.com/rack4master/rack4master" target="_blank">Repositorio en GitHub</a><br>' +
                      'Creado por: Francesc Llorens Cerda</p>'
            },
            terms: {
                title: 'CONDICIONES DE USO',
                body: '<p>Al utilizar Rack4Master, aceptas los siguientes terminos.</p>' +
                      '<h3>1. Naturaleza del software</h3><p>Rack4Master es software experimental de procesamiento de audio proporcionado de forma gratuita.</p>' +
                      '<h3>2. Funcionamiento local</h3><p>El software se ejecuta completamente en el navegador del usuario. El proyecto no accede, supervisa ni almacena archivos de usuario.</p>' +
                      '<h3>3. Sin garantia</h3><p>El software se proporciona "tal cual", sin garantias de ningun tipo. No se ofrece ninguna garantia sobre la calidad del audio, la compatibilidad o la disponibilidad. Los usuarios son responsables de mantener copias de seguridad.</p>' +
                      '<h3>4. Limitacion de responsabilidad</h3><p>Rack4Master y su autor no seran responsables de perdida de datos, degradacion del audio ni danos indirectos.</p>' +
                      '<h3>5. Derechos de autor y responsabilidad del usuario</h3><p>Los usuarios son los unicos responsables de asegurarse de que poseen los derechos o permisos necesarios para procesar cualquier material de audio. El proyecto no asume ninguna responsabilidad por infracciones de derechos de autor cometidas por los usuarios.</p>' +
                      '<h3>6. Uso aceptable</h3><p>Los usuarios se comprometen a no utilizar el software para fines ilegales.</p>' +
                      '<h3>7. Cambios</h3><p>El proyecto puede modificar o interrumpir el software en cualquier momento sin previo aviso.</p>' +
                      '<h3>8. Ley aplicable y jurisdiccion</h3><p>Estos terminos se rigen por las leyes de Espana. Cualquier disputa derivada del uso del software se sometera a los tribunales de Espana.</p>'
            }
        },
        ca: {
            privacy: {
                title: 'PRIVACITAT',
                body: '<p><strong>Darrera actualitzacio: maig 2026</strong></p>' +
                      '<p>Rack4Master es una aplicacio de masteritzacio d\'audio basada en navegador, dissenyada per funcionar completament al dispositiu de l\'usuari.</p>' +
                      '<h3>1. Processament local</h3><p>Tot el processament d\'audio es realitza localment al navegador de l\'usuari mitjancant tecnologies web estandard com la Web Audio API. Els fitxers d\'audio seleccionats pels usuaris mai no es pengen, transmeten ni emmagatzemen a cap servidor.</p>' +
                      '<h3>2. Sense recopilacio de dades personals</h3><p>Rack4Master no recopila, emmagatzema, analitza ni processa dades personals.</p>' +
                      '<h3>3. Sense comptes</h3><p>L\'aplicacio no requereix registre, inici de sessio ni verificacio d\'identitat.</p>' +
                      '<h3>4. Sense analitica ni rastre</h3><p>Aquest lloc web no utilitza plataformes d\'analitica, tecnologies de rastre, sistemes publicitaris ni eines de perfilat.</p>' +
                      '<h3>5. Galetes</h3><p>Rack4Master no estableix galetes. Els serveis externs als quals els usuaris accedeixin voluntariament poden utilitzar les seves propies galetes de manera independent.</p>' +
                      '<h3>6. Serveis de tercers</h3><p>Si els usuaris trien donar suport al projecte a traves de proveidors de pagament externs, aquests serveis operen sota les seves propies politiques de privacitat.</p>' +
                      '<h3>7. Responsabilitat de l\'usuari</h3><p>Com que tot el processament es realitza localment, els usuaris mantenen el control total sobre els seus fitxers i dades.</p>' +
                      '<h3>8. Contacte</h3><p>Consultes de privacitat: <a href="mailto:rackmaster@proton.me">rackmaster@proton.me</a></p>'
            },
            legal: {
                title: 'LEGAL',
                body: '<p>Rack4Master es un projecte de programari independent.</p>' +
                      '<p><strong>Nom del projecte:</strong> Rack4Master<br>' +
                      '<strong>Tipus de projecte:</strong> Eina de masteritzacio d\'audio basada en navegador<br>' +
                      '<strong>Contacte:</strong> <a href="mailto:rackmaster@proton.me">rackmaster@proton.me</a></p>' +
                      '<p>Aquest lloc web proporciona eines de programari destinades a l\'us local al navegador de l\'usuari. El projecte es publica sota una identitat de projecte editorial. La divulgacio publica de la identitat personal no es necessaria excepte quan ho exigeixi la legislacio aplicable.</p>' +
                      '<h3>Llicencia Open Source</h3><p>El codi font d\'aquesta aplicacio es publica sota la llicencia MIT. Pots veure, modificar i distribuir el codi lliurement.<br>' +
                      '<a href="https://github.com/rack4master/rack4master" target="_blank">Repositori a GitHub</a><br>' +
                      'Creat per: Francesc Llorens Cerda</p>'
            },
            terms: {
                title: 'CONDICIONS D\'US',
                body: '<p>En utilitzar Rack4Master, acceptes els termes seguents.</p>' +
                      '<h3>1. Naturalesa del programari</h3><p>Rack4Master es programari experimental de processament d\'audio proporcionat de forma gratuita.</p>' +
                      '<h3>2. Funcionament local</h3><p>El programari s\'executa completament al navegador de l\'usuari. El projecte no accedeix, supervisa ni emmagatzema fitxers d\'usuari.</p>' +
                      '<h3>3. Sense garantia</h3><p>El programari es proporciona "tal qual", sense garanties de cap tipus. No s\'ofereix cap garantia sobre la qualitat de l\'audio, la compatibilitat o la disponibilitat.</p>' +
                      '<h3>4. Limitacio de responsabilitat</h3><p>Rack4Master i el seu autor no seran responsables de perdua de dades, degradacio de l\'audio ni danys indirectes.</p>' +
                      '<h3>5. Drets d\'autor i responsabilitat de l\'usuari</h3><p>Els usuaris son els unics responsables d\'assegurar-se que posseeixen els drets o permisos necessaris per processar qualsevol material d\'audio.</p>' +
                      '<h3>6. Us acceptable</h3><p>Els usuaris es comprometen a no utilitzar el programari per a finalitats illegals.</p>' +
                      '<h3>7. Canvis</h3><p>El projecte pot modificar o interrompre el programari en qualsevol moment sense previo avis.</p>' +
                      '<h3>8. Llei aplicable i jurisdiccio</h3><p>Aquests termes es regeixen per les lleis d\'Espanya. Qualsevol disputa derivada de l\'us del programari se sotmetra als tribunals d\'Espanya.</p>'
            }
        }
    };

    // ----------------------------------------------------------------
    // DOM MAPPING: data-i18n attribute -> element + property
    // ----------------------------------------------------------------
    var DOM_MAP = [
        // [selector, key, property]  property: 'text' | 'html' | 'title' | 'placeholder'
        ['p.sub',                          'brand.sub',        'text'],
        ['#playPauseBtn',                  'btn.play',         'text-icon'],   // keep icon
        ['#stopBtn',                       'btn.stop',         'text-icon'],
        ['#loopBtn',                       'btn.loop',         'text-icon'],
        ['#downloadBtn',                   'btn.wav',          'text-icon'],
        ['.drop-title',                    'drop.title',       'text'],
        ['.drop-sub',                      'drop.sub',         'text'],
        ['.drop-formats',                  'drop.formats',     'text'],
        ['#preIdle',                       'idle.msg',         'html'],
        ['.mode-btn:nth-child(1) .mode-btn-label', 'mode.analysis',   'text'],
        ['.mode-btn:nth-child(1) .mode-btn-sub',   'mode.analysis.sub','text'],
        ['.mode-btn:nth-child(2) .mode-btn-label', 'mode.presets',    'text'],
        ['.mode-btn:nth-child(2) .mode-btn-sub',   'mode.presets.sub','text'],
        ['#statusText',                    'status.ready',     'text'],
        ['#clearBtn',                      'btn.clearall',     'text-icon'],
        // Footer
        ['.copyright-text:first-of-type',  'foot.copyright',   'text'],
        ['.copyright-text:last-of-type',   'foot.local',       'text'],
        ['[data-modal="privacy"]',         'foot.privacy',     'text'],
        ['[data-modal="legal"]',           'foot.legal',       'text'],
        ['[data-modal="terms"]',           'foot.terms',       'text'],
        // Menu
        ['[data-i18n-label="menu.language"]', 'menu.language', 'text'],
        ['[data-i18n="menu.help"]',        'menu.help',        'text']
    ];

    function applyLang(lang) {
        var strings = UI[lang] || UI['en'];
        DOM_MAP.forEach(function(entry) {
            var sel  = entry[0];
            var key  = entry[1];
            var prop = entry[2];
            var val  = strings[key];
            if (!val) return;
            try {
                var els = document.querySelectorAll(sel);
                els.forEach(function(el) {
                    if (prop === 'text') {
                        el.textContent = val;
                    } else if (prop === 'html') {
                        el.innerHTML = '<i class="fas fa-info-circle"></i> ' + val;
                    } else if (prop === 'text-icon') {
                        // Preserve first <i> tag, replace text node after it
                        var icon = el.querySelector('i');
                        if (icon) {
                            el.textContent = ' ' + val;
                            el.insertBefore(icon, el.firstChild);
                        } else {
                            el.textContent = val;
                        }
                    } else if (prop === 'title') {
                        el.title = val;
                    } else if (prop === 'placeholder') {
                        el.placeholder = val;
                    }
                });
            } catch(e) {}
        });
    }

    function setLang(lang) {
        if (!UI[lang]) lang = 'en';
        currentLang = lang;
        try { localStorage.setItem('r4m_lang', lang); } catch(e) {}
        applyLang(lang);
        if (onChangeCb) onChangeCb(lang);
    }

    function getLang() { return currentLang; }

    function getModal(key, lang) {
        var l = MODALS[lang] || MODALS['en'];
        return l[key] || MODALS['en'][key] || null;
    }

    function init(defaultLang, onChangeFn) {
        onChangeCb = onChangeFn || null;
        var saved = null;
        try { saved = localStorage.getItem('r4m_lang'); } catch(e) {}
        var lang = saved || defaultLang || 'en';
        setLang(lang);
    }

    return {
        init:     init,
        setLang:  setLang,
        getLang:  getLang,
        getModal: getModal
    };

}());

// uiControls.js
// Main UI controller: file load, wavesurfer, transport, mode bar, shared slider renderer.
// ASCII-only. var, no ES6 syntax.

var wsurfer     = null;
var currentMode = null;   // 'analysis' or 'presets'
var lastMetrics = null;   // cached analysis result
var loopEnabled    = false;
var currentFileName = '';

function setupUI() {
    initWaveSurfer();
    bindFileZone();
    initLoopOverlay();
    bindTransport();
    bindModeBar();
    bindActions();
    setControlsDisabled(true); // sin audio: todo deshabilitado
}

// Habilita o deshabilita todos los controles que requieren audio cargado
function setControlsDisabled(disabled) {
    var ids = ['playPauseBtn','stopBtn','loopBtn','bypassBtn','downloadBtn',
               'savePresetBtn','loadPresetBtn','clearBtn'];
    ids.forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.disabled = disabled;
    });
}

/* ---- WAVESURFER ---- */

function initWaveSurfer() {
    wsurfer = WaveSurfer.create({
        container:     '#waveform',
        waveColor:     '#3d2d6e',
        progressColor: '#6c4eff',
        cursorColor:   '#c084fc',
        height:        150,
        normalize:     true,
        responsive:    true,
        backend:       'MediaElement',
        interact:      true
    });

    wsurfer.on('ready', function() {
        document.getElementById('playPauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled      = false;
        document.getElementById('loopBtn').disabled      = false;
        document.getElementById('dropPlaceholder').classList.add('hidden');
        document.getElementById('preIdle').style.display = 'none';
        document.getElementById('modeBar').style.display = 'flex';
        document.getElementById('workspace').style.display = 'flex';
        setControlsDisabled(false);
        updateTime();
        // Connect waveform media element to audio engine
        // WaveSurfer v6 MediaElement backend: el elemento esta en wsurfer.backend.media
        var mediaEl = null;
        if (wsurfer.backend && wsurfer.backend.media) {
            mediaEl = wsurfer.backend.media;
        } else if (wsurfer.getMediaElement && wsurfer.getMediaElement()) {
            mediaEl = wsurfer.getMediaElement();
        }
        if (mediaEl) {
            audioEngine.connectToMedia(mediaEl);
            if (typeof updateBypassBtnGlobal === 'function') updateBypassBtnGlobal();
        }
    });

    wsurfer.on('audioprocess', function() {
        updateTime();
        if (loopEnabled && window._loopCheckEnd) window._loopCheckEnd();
    });
    wsurfer.on('seek',         function() { updateTime(); });
    wsurfer.on('finish', function() {
        if (loopEnabled) { if(window._loopSeekStart) window._loopSeekStart(); setTimeout(function(){ wsurfer.play(); }, 50); }
        else setIconPlay();
    });
}

function updateTime() {
    if (!wsurfer) return;
    var cur = wsurfer.getCurrentTime(), dur = wsurfer.getDuration();
    document.getElementById('timeDisplay').textContent = fmtT(cur) + ' / ' + fmtT(dur);
}

function fmtT(s) {
    if (!s || isNaN(s)) return '00:00';
    var m = Math.floor(s / 60), sec = Math.floor(s % 60);
    return (m < 10 ? '0' : '') + m + ':' + (sec < 10 ? '0' : '') + sec;
}

function setIconPlay()  { document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i> Play'; }
function setIconPause() { document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i> Pause'; }

/* ---- FILE LOADING ---- */

function bindFileZone() {
    var container = document.getElementById('waveformContainer');

    container.addEventListener('click', function(e) {
        if (e.target.closest && e.target.closest('.loop-handle')) return;
        if (document.getElementById('dropPlaceholder').classList.contains('hidden')) return;
        var inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'audio/*';
        inp.onchange = function() { if (inp.files[0]) loadAudioFile(inp.files[0]); };
        inp.click();
    });

    container.addEventListener('dragover', function(e) {
        e.preventDefault();
        container.classList.add('drag-over');
    });
    container.addEventListener('dragleave', function() { container.classList.remove('drag-over'); });
    container.addEventListener('drop', function(e) {
        e.preventDefault();
        container.classList.remove('drag-over');
        var f = e.dataTransfer.files[0];
        if (f) loadAudioFile(f);
    });
}

function loadAudioFile(file) {
    var url = URL.createObjectURL(file);

    // Decode buffer for analysis and WAV export
    var reader = new FileReader();
    reader.onload = function(e) {
        var actx = audioEngine.getCtx();
        actx.decodeAudioData(e.target.result, function(buf) {
            audioEngine.setBuffer(buf);
        });
    };
    reader.readAsArrayBuffer(file);

    // Load into WaveSurfer
    wsurfer.load(url);
    currentFileName = file.name.replace(/\.[^.]+$/, ''); // sin extension
    setStatus('Archivo: ' + file.name);
    resetWorkspace();
}

function resetWorkspace() {
    currentMode = null;
    lastMetrics = null;
    loopEnabled = false;
    document.getElementById('loopBtn').classList.remove('active');
    presetsUI.clearActive();
    audioEngine.resetParams();
    document.getElementById('modeAnalysisBtn').classList.remove('mode-btn-active');
    document.getElementById('modePresetsBtn').classList.remove('mode-btn-active');
    idleLeft();
    idleRight();
}

function idleLeft() {
    document.getElementById('wsLeft').innerHTML =
        '<div class="ws-idle-msg"><i class="fas fa-hand-point-up"></i>' +
        '<p>Selecciona un modo arriba para empezar</p></div>';
}
function idleRight() {
    document.getElementById('wsRight').innerHTML =
        '<div class="ws-right-idle"><i class="fas fa-sliders-h"></i>' +
        '<p>Selecciona un elemento de la lista para ajustar sus parametros</p></div>';
}

/* ---- MODE BAR ---- */

function bindModeBar() {
    document.getElementById('modeAnalysisBtn').addEventListener('click', function() {
        if (currentMode === 'analysis') return;
        currentMode = 'analysis';
        document.getElementById('modeAnalysisBtn').classList.add('mode-btn-active');
        document.getElementById('modePresetsBtn').classList.remove('mode-btn-active');
        idleRight();
        startAnalysisMode();
    });

    document.getElementById('modePresetsBtn').addEventListener('click', function() {
        if (currentMode === 'presets') return;
        currentMode = 'presets';
        document.getElementById('modePresetsBtn').classList.add('mode-btn-active');
        document.getElementById('modeAnalysisBtn').classList.remove('mode-btn-active');
        idleRight();
        startPresetsMode();
    });
}

/* ---- ANALYSIS MODE ---- */

function startAnalysisMode() {
    var wsLeft  = document.getElementById('wsLeft');
    var wsRight = document.getElementById('wsRight');
    var _ctx = audioEngine.getCtx(); if (_ctx.state==='suspended') _ctx.resume();

    if (lastMetrics) {
        // Re-render with cached results
        reportUI.renderReport(lastMetrics, wsLeft, wsRight, function(finding, liveParams, onChange) {
            renderFindingEditor(wsRight, finding, liveParams, onChange);
        });
        return;
    }

    reportUI.showAnalyzing(wsLeft);

    var abuf = audioEngine.getAudioBuffer();
    if (!abuf) {
        wsLeft.innerHTML =
            '<div class="ws-idle-msg"><i class="fas fa-exclamation-triangle"></i>' +
            '<p>Carga un archivo de audio primero para analizar</p></div>';
        return;
    }

    analyzeBuffer(abuf, function(metrics) {
        lastMetrics = metrics;
        console.log('[ANALYSIS] Metricas:', metrics);
        reportUI.renderReport(metrics, wsLeft, wsRight, function(finding, liveParams, onChange) {
            renderFindingEditor(wsRight, finding, liveParams, onChange);
        });
    });
}

// Render editor panel for a finding (analysis mode)
function renderFindingEditor(wsRight, finding, liveParams, onChange) {
    if (!finding) { idleRight(); return; }

    var sev = finding.sev;
    var hdrCls = sev === 'fix' ? 'ehdr-fix' : sev === 'warn' ? 'ehdr-warn' : 'ehdr-ok';
    var icon   = sev === 'fix' ? 'fas fa-times-circle' :
                 sev === 'warn' ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';

    if (!finding.sliders || finding.sliders.length === 0) {
        wsRight.innerHTML =
            '<div class="editor-panel">' +
            '<div class="editor-hdr ' + hdrCls + '">' +
            '<i class="' + icon + ' ehdr-icon"></i>' +
            '<div class="ehdr-text"><b>' + finding.label + '</b><p>' + finding.detail + '</p></div></div>' +
            '<div class="editor-no-params"><i class="fas fa-check"></i> Sin correcciones para este elemento.</div>' +
            '</div>';
        return;
    }

    renderSliderPanel(wsRight, finding.label, finding.detail, hdrCls, icon, finding.sliders, liveParams, onChange);
}

/* ---- PRESETS MODE ---- */

function startPresetsMode() {
    var wsLeft  = document.getElementById('wsLeft');
    var wsRight = document.getElementById('wsRight');
    var _ctx = audioEngine.getCtx(); if (_ctx.state==='suspended') _ctx.resume();

    presetsUI.render(wsLeft, wsRight, function(pr, workingParams, sliderDefs, onChange) {
        renderPresetEditor(wsRight, pr, workingParams, sliderDefs, onChange);
    });
}

// Render editor panel for a preset (presets mode)
function renderPresetEditor(wsRight, pr, workingParams, sliderDefs, onChange) {
    if (!sliderDefs || sliderDefs.length === 0) {
        wsRight.innerHTML =
            '<div class="editor-panel">' +
            '<div class="editor-hdr ehdr-preset">' +
            '<i class="fas fa-sliders-h ehdr-icon"></i>' +
            '<div class="ehdr-text"><b>' + pr.name + '</b><p>' + pr.desc + '</p></div></div>' +
            '<div class="editor-no-params"><i class="fas fa-equals"></i> Preset neutral: sin parametros activos.</div>' +
            '</div>';
        return;
    }

    renderSliderPanel(wsRight, pr.name, pr.desc, 'ehdr-preset', 'fas fa-sliders-h', sliderDefs, workingParams, onChange);
}

/* ---- SHARED SLIDER PANEL RENDERER ---- */

// Renders header + one slider per entry in sliderDefs into container.
// sliderDefs: [{ key, label, min, max, step, unit, dec, def }]
// currentVals: object with current values for each key
// onChange(key, newVal) called on slider input
var SLIDER_ICONS = {
        'lowShelfGain': 'fas fa-chevron-down',
        'highShelfGain': 'fas fa-chevron-up',
        'midGain': 'fas fa-minus',
        'harshGain': 'fas fa-exclamation',
        'compIntensity': 'fas fa-compress-alt',
        'compRatio': 'fas fa-compress-alt',
        'compThreshold': 'fas fa-level-down-alt',
        'compAttack': 'fas fa-bolt',
        'compRelease': 'fas fa-history',
        'compMakeup': 'fas fa-plus-circle',
        'satDrive': 'fas fa-fire',
        'stereoWidth': 'fas fa-arrows-alt-h',
        'limiterDrive': 'fas fa-shield-alt',
    };

function renderSliderPanel(container, title, subtitle, hdrCls, icon, sliderDefs, currentVals, onChange) {
    var html = '<div class="editor-panel">';
    html += '<div class="editor-hdr ' + hdrCls + '">';
    html += '<i class="' + icon + ' ehdr-icon"></i>';
    html += '<div class="ehdr-text"><b>' + title + '</b><p>' + subtitle + '</p></div>';
    html += '</div>';
    html += '<div class="editor-sliders">';

    for (var i = 0; i < sliderDefs.length; i++) {
        var sd  = sliderDefs[i];
        var val = (currentVals[sd.key] !== undefined) ? currentVals[sd.key] : sd.min;
        var dec = (sd.dec !== undefined && sd.dec !== null) ? sd.dec : 1;
        var displayVal = parseFloat(val).toFixed(dec) + (sd.unit ? ' ' + sd.unit : '');

        html += '<div class="param-row">';
        html += '<div class="param-row-top">';
        var sIcon = SLIDER_ICONS[sd.key] || 'fas fa-sliders-h';
        html += '<span class="param-icon"><i class="' + sIcon + '"></i></span>';
        html += '<span class="param-label">' + sd.label + '</span>';
        html += '<span class="param-val" id="pv_' + i + '">' + displayVal + '</span>';
        html += '</div>';
        html += '<input type="range" class="param-range" id="ps_' + i + '"' +
                ' data-key="' + sd.key + '" data-dec="' + dec + '" data-unit="' + (sd.unit || '') + '"' +
                ' min="' + sd.min + '" max="' + sd.max + '" step="' + sd.step + '" value="' + val + '">';
        // Restore-to-default button (only if def is defined and differs from current)
        if (sd.def !== undefined) {
            html += '<div class="param-restore-row">' +
                    '<button class="param-restore" id="pr_' + i + '" data-def="' + sd.def + '" data-idx="' + i + '">' +
                    'Restaurar (' + parseFloat(sd.def).toFixed(dec) + (sd.unit ? ' ' + sd.unit : '') + ')' +
                    '</button></div>';
        }
        html += '</div>';
    }

    html += '</div></div>';
    container.innerHTML = html;

    // Wire slider events - container.querySelector evita colisiones de ID entre paneles
    for (var j = 0; j < sliderDefs.length; j++) {
        (function(idx, cb) {
            var slider = container.querySelector('#ps_' + idx);
            var valEl  = container.querySelector('#pv_' + idx);
            if (!slider || !valEl) return;
            var dec  = parseInt(slider.getAttribute('data-dec'), 10) || 1;
            var unit = slider.getAttribute('data-unit') || '';
            var key  = slider.getAttribute('data-key');
            slider.addEventListener('input', function() {
                var v = parseFloat(slider.value);
                valEl.textContent = v.toFixed(dec) + (unit ? ' ' + unit : '');
                if (cb) cb(key, v);
            });
        }(j, onChange));
    }

    // Wire restore buttons
    for (var r = 0; r < sliderDefs.length; r++) {
        (function(idx, cb) {
            var btn    = container.querySelector('#pr_' + idx);
            var slider = container.querySelector('#ps_' + idx);
            var valEl  = container.querySelector('#pv_' + idx);
            if (!btn || !slider || !valEl) return;
            btn.addEventListener('click', function() {
                var defVal = parseFloat(btn.getAttribute('data-def'));
                var dec    = parseInt(slider.getAttribute('data-dec'), 10) || 1;
                var unit   = slider.getAttribute('data-unit') || '';
                var key    = slider.getAttribute('data-key');
                slider.value = defVal;
                valEl.textContent = defVal.toFixed(dec) + (unit ? ' ' + unit : '');
                if (cb) cb(key, defVal);
            });
        }(r, onChange));
    }
}


/* ---- LOOP OVERLAY DRAG HANDLERS ---- */
function initLoopOverlay() {
    var overlay   = document.getElementById('loopOverlay');
    var regionEl  = document.getElementById('loopRegionRect');
    var startH    = document.getElementById('loopStartHandle');
    var endH      = document.getElementById('loopEndHandle');
    var waveBox   = document.getElementById('waveformContainer');
    var loopS = 0.1, loopE = 0.9;

    function paint() {
        startH.style.left  = (loopS * 100) + '%';
        endH.style.left    = (loopE * 100) + '%';
        regionEl.style.left  = (loopS * 100) + '%';
        regionEl.style.width = ((loopE - loopS) * 100) + '%';
    }

    function dragHandle(handle, isStart) {
        handle.addEventListener('mousedown', function(e) {
            e.stopPropagation(); e.preventDefault();
            function move(ev) {
                var b = waveBox.getBoundingClientRect();
                var p = Math.max(0, Math.min(1, (ev.clientX - b.left) / b.width));
                if (isStart) loopS = Math.min(p, loopE - 0.02);
                else         loopE = Math.max(p, loopS + 0.02);
                paint();
                if (wsurfer && loopEnabled) wsurfer.seekTo(loopS);
            }
            function up() { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); }
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
        });
        handle.addEventListener('touchstart', function(e) {
            e.stopPropagation(); e.preventDefault();
            function move(ev) {
                var t = ev.touches[0], b = waveBox.getBoundingClientRect();
                var p = Math.max(0, Math.min(1, (t.clientX - b.left) / b.width));
                if (isStart) loopS = Math.min(p, loopE - 0.02);
                else         loopE = Math.max(p, loopS + 0.02);
                paint();
            }
            function up() { handle.removeEventListener('touchmove', move); handle.removeEventListener('touchend', up); }
            handle.addEventListener('touchmove', move, {passive:false});
            handle.addEventListener('touchend', up);
        }, {passive:false});
    }

    dragHandle(startH, true);
    dragHandle(endH,   false);
    paint();

    // Hook: seek al inicio del loop
    window._loopSeekStart = function() { if (wsurfer) wsurfer.seekTo(loopS); };
    // Hook: comprobar si el cabezal supero loopE y hacer seek a loopS
    window._loopCheckEnd = function() {
        if (!wsurfer) return;
        var dur = wsurfer.getDuration();
        if (!dur) return;
        var cur = wsurfer.getCurrentTime();
        if (cur >= loopE * dur) {
            wsurfer.seekTo(loopS);
        }
    };
}

/* ---- TRANSPORT ---- */

function bindTransport() {
    document.getElementById('playPauseBtn').addEventListener('click', function() {
        if (!wsurfer) return;
        audioEngine.getCtx().resume();
        if (wsurfer.isPlaying()) { wsurfer.pause(); setIconPlay(); }
        else { wsurfer.play(); setIconPause(); }
    });

    document.getElementById('stopBtn').addEventListener('click', function() {
        if (!wsurfer) return;
        wsurfer.stop(); setIconPlay();
    });

    document.getElementById('loopBtn').addEventListener('click', function() {
        if (!wsurfer) return;
        loopEnabled = !loopEnabled;
        document.getElementById('loopBtn').classList.toggle('active', loopEnabled);
        document.getElementById('loopOverlay').style.display = loopEnabled ? '' : 'none';
    });
}

/* ---- ACTIONS (bypass, export, save/load JSON, clear) ---- */

function bindActions() {
    var bypassBtn = document.getElementById('bypassBtn');

    bypassBtn.addEventListener('click', function() {
        var isOn = audioEngine.isEffectsOn();
        audioEngine.setBypass(isOn);
        bypassBtn.classList.toggle('active', !isOn);
    });

    window.updateBypassBtnGlobal = function() {
        bypassBtn.classList.toggle('active', !!audioEngine.isEffectsOn());
    };

    // WAV export
    document.getElementById('downloadBtn').addEventListener('click', function() {
        setStatus('Exportando WAV...');
        audioEngine.exportWAV(
            function(pct) { setStatus('Exportando WAV... ' + pct + '%'); },
            function(blob) {
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url; a.download = 'mastered.wav'; a.click();
                setTimeout(function() { URL.revokeObjectURL(url); }, 3000);
                setStatus('WAV exportado correctamente.');
            },
            function(err) { setStatus('Error al exportar: ' + err); }
        );
    });

    // Save preset JSON
    document.getElementById('savePresetBtn').addEventListener('click', function() {
        var suggested = currentFileName || 'MiPreset';
        var name = prompt('Nombre del preset:', suggested);
        if (name === null) return; // usuario cancelo
        if (!name.trim()) name = suggested;
        audioEngine.savePreset(name, currentMode, presetsUI.getActiveId());
    });

    // Load preset JSON
    document.getElementById('loadPresetBtn').addEventListener('click', function() {
        document.getElementById('loadPresetInput').click();
    });
    document.getElementById('loadPresetInput').addEventListener('change', function() {
        var file = this.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            audioEngine.loadPreset(e.target.result,
                function(obj) {
                    setStatus('Preset JSON cargado: ' + obj.name);
                    // Restaurar modo y preset si el JSON lo indica
                    if (obj.mode === 'presets' && obj.presetId) {
                        currentMode = 'presets';
                        document.getElementById('modePresetsBtn').classList.add('mode-btn-active');
                        document.getElementById('modeAnalysisBtn').classList.remove('mode-btn-active');
                        startPresetsMode();
                        presetsUI.restorePreset(obj.presetId, obj.params,
                            document.getElementById('wsLeft'),
                            document.getElementById('wsRight'),
                            function(pr, workingParams, sliderDefs, onChange) {
                                renderPresetEditor(document.getElementById('wsRight'), pr, workingParams, sliderDefs, onChange);
                            }
                        );
                    } else if (obj.mode === 'presets') {
                        currentMode = 'presets';
                        document.getElementById('modePresetsBtn').classList.add('mode-btn-active');
                        document.getElementById('modeAnalysisBtn').classList.remove('mode-btn-active');
                        startPresetsMode();
                    }
                },
                function(err) { setStatus('Error al cargar preset: ' + err); }
            );
        };
        reader.readAsText(file);
        this.value = '';
    });

    // Clear / full reset
    document.getElementById('clearBtn').addEventListener('click', function() {
        if (!confirm('Borrar todo y empezar de nuevo?')) return;
        if (wsurfer) { try { wsurfer.stop(); wsurfer.empty(); } catch(e) {} }
        audioEngine.resetParams();
        audioEngine.disconnect();
        loopEnabled = false;
        bypassBtn.classList.remove('active');
        document.getElementById('loopOverlay').style.display = 'none';
        setIconPlay();
        document.getElementById('preIdle').style.display    = '';
        document.getElementById('modeBar').style.display    = 'none';
        document.getElementById('workspace').style.display  = 'none';
        document.getElementById('dropPlaceholder').classList.remove('hidden');
        setControlsDisabled(true);
        document.getElementById('loopBtn').classList.remove('active');
        document.getElementById('timeDisplay').textContent  = '00:00 / 00:00';
        lastMetrics  = null;
        currentMode  = null;
        presetsUI.clearActive();
        setStatus('Reseteado. Carga un nuevo archivo.');
    });
}

/* ---- STATUS ---- */

function setStatus(msg) {
    var el = document.getElementById('statusText');
    if (el) el.textContent = msg;
}

// presetsUI.js
// Preset cards in ws-left. Selecting one opens only its relevant (non-neutral) params
// as sliders in ws-right via onRightRender callback.
// ASCII-only. var, no ES6 syntax.

var presetsUI = (function() {

    var activeId = null;

    var CATEGORY_ORDER  = ['General', 'Genero', 'Estilo'];
    var CATEGORY_LABELS = { 'General':'General', 'Genero':'Generos', 'Estilo':'Estilo' };

    // Neutral baseline (must match audioEngine defaults)
    var NEUTRAL = {
        lowShelfGain:0, highShelfGain:0, midGain:0, harshGain:0,
        compRatio:1, compThreshold:-24, compAttack:0.003, compRelease:0.25,
        compMakeup:0, satDrive:0, stereoWidth:1.0, limiterDrive:0
    };

    // Full metadata for every param (ranges, labels, display decimals)
    var PARAM_META = {
        lowShelfGain:  { label:'Graves (150 Hz)',     min:-4,    max:4,    step:0.1,  unit:'dB', dec:1 },
        highShelfGain: { label:'Agudos (5 kHz)',      min:-4,    max:5,    step:0.1,  unit:'dB', dec:1 },
        midGain:       { label:'Medios (1.5 kHz)',    min:-3,    max:3,    step:0.1,  unit:'dB', dec:1 },
        harshGain:     { label:'Presencia (3.5 kHz)', min:-4,    max:3,    step:0.1,  unit:'dB', dec:1 },
        compRatio:     { label:'Ratio compresor',     min:1,     max:6,    step:0.1,  unit:':1', dec:1 },
        compThreshold: { label:'Umbral compresor',    min:-30,   max:0,    step:0.5,  unit:'dB', dec:1 },
        compAttack:    { label:'Ataque compresor',    min:0.001, max:0.05, step:0.001,unit:'s',  dec:3 },
        compRelease:   { label:'Release compresor',   min:0.05,  max:0.5,  step:0.01, unit:'s',  dec:2 },
        compMakeup:    { label:'Makeup gain',         min:0,     max:6,    step:0.1,  unit:'dB', dec:1 },
        satDrive:      { label:'Saturacion',          min:0,     max:1,    step:0.01, unit:'',   dec:2 },
        stereoWidth:   { label:'Anchura estereo',     min:0.5,   max:1.8,  step:0.01, unit:'x',  dec:2 },
        limiterDrive:  { label:'Limiter drive',       min:0,     max:4,    step:0.1,  unit:'dB', dec:1 },
        compIntensity: { label:'Intensidad compresion', min:0,     max:1,    step:0.01, unit:'',   dec:2 }
    };

    // Tolerance thresholds for "differs from neutral"
    var EPS = {
        lowShelfGain:0.05, highShelfGain:0.05, midGain:0.05, harshGain:0.05,
        compRatio:0.05, compThreshold:0.5, compAttack:0.001, compRelease:0.01,
        compMakeup:0.05, satDrive:0.01, stereoWidth:0.02, limiterDrive:0.05
    };

    var COMP_KEYS = ['compRatio','compThreshold','compAttack','compRelease','compMakeup'];

    function getRelevantKeys(params) {
        var keys = [];
        var hasComp = false;
        for (var k in NEUTRAL) {
            if (COMP_KEYS.indexOf(k) !== -1) {
                var eps = EPS[k] !== undefined ? EPS[k] : 0.05;
                if (Math.abs(params[k] - NEUTRAL[k]) > eps) hasComp = true;
                continue; // no aiadir individualmente
            }
            var eps = EPS[k] !== undefined ? EPS[k] : 0.05;
            if (Math.abs(params[k] - NEUTRAL[k]) > eps) keys.push(k);
        }
        if (hasComp) keys.push('compIntensity');
        return keys;
    }

    // Mini EQ bar preview: low, mid, harsh, high
    function eqBars(p) {
        var vals   = [p.lowShelfGain, p.midGain, p.harshGain, p.highShelfGain];
        var labels = ['B', 'M', 'P', 'A'];
        // Si todos los valores EQ son 0, mostrar barras planas con color neutro
        var allFlat = vals[0]===0 && vals[1]===0 && vals[2]===0 && vals[3]===0;
        var html   = '<div class="preset-eq">';
        for (var i = 0; i < 4; i++) {
            var v   = Math.max(-3, Math.min(3, vals[i]));
            var pct, cls;
            if (allFlat) {
                pct = 50; cls = 'bar-flat';
            } else {
                pct = Math.round(((v + 3) / 6) * 100);
                cls = v > 0.1 ? 'bar-up' : (v < -0.1 ? 'bar-down' : 'bar-zero');
            }
            html += '<div class="eq-bar-wrap" title="' + labels[i] + ': ' + (v > 0 ? '+' : '') + v.toFixed(1) + ' dB">';
            html += '<div class="eq-bar ' + cls + '" style="height:' + pct + '%"></div>';
            html += '</div>';
        }
        html += '</div>';
        return html;
    }

    // Compressor dot intensity indicator
    function compDots(p) {
        var intensity = 0;
        if (p.compRatio >= 2)   intensity++;
        if (p.compRatio >= 2.5) intensity++;
        if (p.compRatio >= 3)   intensity++;
        var html = '<span class="comp-dots" title="Compresion">';
        for (var i = 0; i < 3; i++) {
            html += '<span class="comp-dot' + (i < intensity ? ' comp-dot-on' : '') + '"></span>';
        }
        html += '</span>';
        return html;
    }

    function render(wsLeft, wsRight, onRightRender) {
        // Group presets by category
        var groups = {};
        for (var i = 0; i < PRESETS.length; i++) {
            var pr = PRESETS[i];
            if (!groups[pr.category]) groups[pr.category] = [];
            groups[pr.category].push(pr);
        }

        var html = '<div class="presets-inner">';
        for (var c = 0; c < CATEGORY_ORDER.length; c++) {
            var cat  = CATEGORY_ORDER[c];
            var list = groups[cat];
            if (!list || !list.length) continue;
            html += '<div class="presets-group">';
            html += '<p class="presets-cat-label">' + CATEGORY_LABELS[cat] + '</p>';
            html += '<div class="presets-grid">';
            for (var j = 0; j < list.length; j++) {
                var pr  = list[j];
                var act = (pr.id === activeId) ? ' preset-active' : '';
                html += '<div class="preset-card' + act + '" data-id="' + pr.id + '" title="' + pr.desc + '">';
                html += '<div class="preset-card-top">';
                html += '<span class="preset-name">' + pr.name + '</span>';
                html += compDots(pr.params);
                html += '</div>';
                html += eqBars(pr.params);
                html += '</div>';
            }
            html += '</div></div>';
        }
        html += '</div>';
        wsLeft.innerHTML = html;

        // Wire card clicks
        var cards = wsLeft.querySelectorAll('.preset-card');
        for (var k = 0; k < cards.length; k++) {
            (function(card) {
                card.addEventListener('click', function() {
                    applyAndEdit(card.getAttribute('data-id'), wsLeft, wsRight, onRightRender);
                });
            }(cards[k]));
        }

        // Restore active card state if returning to presets mode
        if (activeId) applyAndEdit(activeId, wsLeft, wsRight, onRightRender);
    }

    function applyAndEdit(id, wsLeft, wsRight, onRightRender) {
        // Find preset
        var pr = null;
        for (var i = 0; i < PRESETS.length; i++) {
            if (PRESETS[i].id === id) { pr = PRESETS[i]; break; }
        }
        if (!pr) return;

        // Resume audio context if needed
        var actx = audioEngine.getCtx();
        if (actx.state === 'suspended') actx.resume();

        // Working copy of params (user may tweak via sliders)
        var workingParams = {};
        for (var k in pr.params) workingParams[k] = pr.params[k];

        audioEngine.applyParams(workingParams);
        audioEngine.setBypass(false);

        activeId = id;

        // Highlight active card
        var cards = wsLeft.querySelectorAll('.preset-card');
        for (var j = 0; j < cards.length; j++) {
            if (cards[j].getAttribute('data-id') === id) cards[j].classList.add('preset-active');
            else cards[j].classList.remove('preset-active');
        }

        // Build slider defs only for params that differ from neutral
        var relKeys    = getRelevantKeys(pr.params);
        // Guardar comp targets del preset para interpolacion
        var compTarget = {
            compRatio:     pr.params.compRatio,
            compThreshold: pr.params.compThreshold,
            compAttack:    pr.params.compAttack,
            compRelease:   pr.params.compRelease,
            compMakeup:    pr.params.compMakeup
        };
        var compNeutral = {
            compRatio:1, compThreshold:-24, compAttack:0.003, compRelease:0.25, compMakeup:0
        };

        var sliderDefs = [];
        for (var k = 0; k < relKeys.length; k++) {
            var key  = relKeys[k];
            var meta = PARAM_META[key];
            if (!meta) continue;
            var defVal = key === 'compIntensity' ? 1.0 : pr.params[key];
            sliderDefs.push({
                key:  key,
                label:meta.label,
                min:  meta.min,
                max:  meta.max,
                step: meta.step,
                unit: meta.unit,
                dec:  meta.dec,
                def:  defVal
            });
        }

        // Inicializar workingParams con los valores de comp del preset
        for (var ck in compTarget) workingParams[ck] = compTarget[ck];

        onRightRender(pr, workingParams, sliderDefs, function(key, val) {
            if (key === 'compIntensity') {
                // Interpolar entre neutro (0) y preset target (1)
                var t = val;
                for (var ck in compTarget) {
                    workingParams[ck] = compNeutral[ck] + t * (compTarget[ck] - compNeutral[ck]);
                }
            } else {
                workingParams[key] = val;
            }
            audioEngine.applyParams(workingParams);
        });

        if (typeof updateBypassBtnGlobal === 'function') updateBypassBtnGlobal();
    }

    function clearActive() { activeId = null; }

    // restorePreset: selecciona la tarjeta del preset y aplica los params guardados
    function restorePreset(id, savedParams, wsLeft, wsRight, onRightRender) {
        // Encontrar preset base para meta (sliderDefs)
        var pr = null;
        for (var i = 0; i < PRESETS.length; i++) {
            if (PRESETS[i].id === id) { pr = PRESETS[i]; break; }
        }
        if (!pr) return;

        // Aplicar los params guardados (pueden diferir del preset original si el usuario movio sliders)
        var workingParams = {};
        for (var k in savedParams) workingParams[k] = savedParams[k];
        audioEngine.applyParams(workingParams);
        audioEngine.setBypass(false);
        activeId = id;

        // Construir sliderDefs usando el mismo mecanismo que applyAndEdit
        var compTarget = {
            compRatio: pr.params.compRatio, compThreshold: pr.params.compThreshold,
            compAttack: pr.params.compAttack, compRelease: pr.params.compRelease,
            compMakeup: pr.params.compMakeup
        };
        var compNeutral = { compRatio:1, compThreshold:-24, compAttack:0.003, compRelease:0.25, compMakeup:0 };

        var relKeys    = getRelevantKeys(pr.params);
        var sliderDefs = [];
        for (var k = 0; k < relKeys.length; k++) {
            var key  = relKeys[k];
            var meta = PARAM_META[key];
            if (!meta) continue;
            var defVal = key === 'compIntensity' ? 1.0 : pr.params[key];
            sliderDefs.push({ key:key, label:meta.label, min:meta.min, max:meta.max,
                step:meta.step, unit:meta.unit, dec:meta.dec, def:defVal });
        }

        // Reconstruir el wsLeft con las tarjetas (para mostrar el highlight)
        render(wsLeft, wsRight, onRightRender);

        // Llamar onRightRender con los params GUARDADOS (no los del preset base)
        // para que los sliders reflejen los valores reales
        onRightRender(pr, workingParams, sliderDefs, function(key, val) {
            if (key === 'compIntensity') {
                var t = val;
                for (var ck in compTarget) {
                    workingParams[ck] = compNeutral[ck] + t * (compTarget[ck] - compNeutral[ck]);
                }
            } else {
                workingParams[key] = val;
            }
            audioEngine.applyParams(workingParams);
        });

        if (typeof updateBypassBtnGlobal === 'function') updateBypassBtnGlobal();
    }

    return {
        render:         render,
        clearActive:    clearActive,
        getActiveId:    function() { return activeId; },
        restorePreset:  restorePreset
    };
}());

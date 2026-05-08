// reportUI.js
// Renders analysis findings into ws-left.
// Clicking a finding opens a contextual slider editor in ws-right.
// ASCII-only. var, no ES6 syntax.

var reportUI = (function() {

    var SEV = { OK:'ok', WARN:'warn', FIX:'fix' };

    var NEUTRAL = {
        lowShelfGain:0, highShelfGain:0, midGain:0, harshGain:0,
        compRatio:1, compThreshold:-24, compAttack:0.003, compRelease:0.25,
        compMakeup:0, satDrive:0, stereoWidth:1.0, limiterDrive:0
    };

    // Each finding: sev, label, detail, params (keys to change), sliders (defs with contextual ranges)
    function buildFindings(m) {
        var findings = [];

        // 1. HIGH SHELF / brightness
        if (m.brightness > 0.7) {
            findings.push({ sev:SEV.WARN, label:'Exceso de agudos',
                detail:'La pista suena brillante o sibilante. Reduccion de altos recomendada.',
                params:{ highShelfGain:-2.0 },
                sliders:[{ key:'highShelfGain', label:'Atenuacion altos (dB)', min:-4, max:0, step:0.1, unit:'dB', def:-2.0 }]
            });
        } else if (m.brightness < 0.3) {
            findings.push({ sev:SEV.FIX, label:'Agudos apagados',
                detail:'Falta presencia y aire. Se realzan los altos para dar vida.',
                params:{ highShelfGain:3.0 },
                sliders:[{ key:'highShelfGain', label:'Realce altos (dB)', min:0, max:5, step:0.1, unit:'dB', def:3.0 }]
            });
        } else {
            findings.push({ sev:SEV.OK, label:'Agudos correctos',
                detail:'El espectro alto esta bien equilibrado.',
                params:{}, sliders:[]
            });
        }

        // 2. LOW SHELF / bass
        if (m.bassRatio < 0.2) {
            findings.push({ sev:SEV.FIX, label:'Graves escasos',
                detail:'Poca energia en bajos. Refuerzo de graves recomendado.',
                params:{ lowShelfGain:2.5 },
                sliders:[{ key:'lowShelfGain', label:'Refuerzo graves (dB)', min:0, max:4, step:0.1, unit:'dB', def:2.5 }]
            });
        } else if (m.bassRatio > 0.45) {
            findings.push({ sev:SEV.WARN, label:'Graves excesivos',
                detail:'Los bajos tapan el resto de la mezcla. Atenuacion recomendada.',
                params:{ lowShelfGain:-1.5 },
                sliders:[{ key:'lowShelfGain', label:'Atenuacion graves (dB)', min:-3, max:0, step:0.1, unit:'dB', def:-1.5 }]
            });
        } else {
            findings.push({ sev:SEV.OK, label:'Graves equilibrados',
                detail:'El rango de bajos esta bien representado.',
                params:{}, sliders:[]
            });
        }

        // 3. HARSHNESS / 2-5 kHz
        if (m.harshRatio > 0.35) {
            findings.push({ sev:SEV.FIX, label:'Dureza pronunciada (2-5 kHz)',
                detail:'Alta energia entre 2-5 kHz. Puede causar fatiga auditiva.',
                params:{ harshGain:-2.5 },
                sliders:[{ key:'harshGain', label:'Reduccion dureza (dB)', min:-4, max:0, step:0.1, unit:'dB', def:-2.5 }]
            });
        } else if (m.harshRatio > 0.2) {
            findings.push({ sev:SEV.WARN, label:'Cierta dureza en medios-altos',
                detail:'Ligero exceso de presencia en la zona 2-5 kHz.',
                params:{ harshGain:-1.5 },
                sliders:[{ key:'harshGain', label:'Reduccion dureza (dB)', min:-3, max:0, step:0.1, unit:'dB', def:-1.5 }]
            });
        } else {
            findings.push({ sev:SEV.OK, label:'Medios-altos limpios',
                detail:'Sin exceso de energia en la zona de sibilancias.',
                params:{}, sliders:[]
            });
        }

        // 4. MID / 500-3000 Hz
        if (m.midRatio < 0.35) {
            findings.push({ sev:SEV.WARN, label:'Medios hundidos (zona vocal)',
                detail:'Poca energia vocal. Realce en 1.5 kHz recomendado.',
                params:{ midGain:1.5 },
                sliders:[{ key:'midGain', label:'Realce zona vocal (dB)', min:0, max:3, step:0.1, unit:'dB', def:1.5 }]
            });
        } else if (m.midRatio > 0.65) {
            findings.push({ sev:SEV.WARN, label:'Exceso de medios',
                detail:'La zona vocal domina demasiado. Reduccion suave recomendada.',
                params:{ midGain:-1.0 },
                sliders:[{ key:'midGain', label:'Atenuacion medios (dB)', min:-2, max:0, step:0.1, unit:'dB', def:-1.0 }]
            });
        } else {
            findings.push({ sev:SEV.OK, label:'Medios equilibrados',
                detail:'La zona vocal esta bien proporcionada.',
                params:{}, sliders:[]
            });
        }

        // 5. DYNAMIC RANGE / compressor
        if (m.dynamicRange > 18) {
            findings.push({ sev:SEV.FIX, label:'Rango dinamico muy amplio',
                detail:'Picos muy altos sobre el cuerpo. Compresion notable recomendada.',
                params:{ compRatio:2.5, compThreshold:-18, compMakeup:1.5, limiterDrive:2 },
                sliders:[
                    { key:'compRatio',    label:'Ratio compresor',   min:1,  max:4,  step:0.1, unit:':1', def:2.5, dec:1 },
                    { key:'compThreshold',label:'Umbral compresor',  min:-24,max:-6, step:0.5, unit:'dB', def:-18, dec:1 },
                    { key:'compMakeup',   label:'Makeup gain',       min:0,  max:4,  step:0.1, unit:'dB', def:1.5, dec:1 },
                    { key:'limiterDrive', label:'Limiter drive',     min:0,  max:4,  step:0.1, unit:'dB', def:2,   dec:1 }
                ]
            });
        } else if (m.dynamicRange > 12) {
            findings.push({ sev:SEV.WARN, label:'Dinamica moderadamente amplia',
                detail:'Se aplica compresion media para cohesion.',
                params:{ compRatio:1.8, compThreshold:-16, compMakeup:1.0, limiterDrive:1 },
                sliders:[
                    { key:'compRatio',    label:'Ratio compresor',   min:1,  max:3,  step:0.1, unit:':1', def:1.8, dec:1 },
                    { key:'compThreshold',label:'Umbral compresor',  min:-22,max:-8, step:0.5, unit:'dB', def:-16, dec:1 },
                    { key:'compMakeup',   label:'Makeup gain',       min:0,  max:3,  step:0.1, unit:'dB', def:1.0, dec:1 },
                    { key:'limiterDrive', label:'Limiter drive',     min:0,  max:3,  step:0.1, unit:'dB', def:1,   dec:1 }
                ]
            });
        } else if (m.dynamicRange < 8) {
            findings.push({ sev:SEV.OK, label:'Mezcla ya comprimida',
                detail:'La dinamica es ajustada. Sin compresion adicional.',
                params:{}, sliders:[]
            });
        } else {
            findings.push({ sev:SEV.OK, label:'Dinamica normal',
                detail:'Compresion ligera de pegamento aplicada.',
                params:{ compRatio:1.2, compThreshold:-14, compMakeup:0.5 },
                sliders:[
                    { key:'compRatio',    label:'Ratio compresor',   min:1,  max:2,  step:0.1, unit:':1', def:1.2, dec:1 },
                    { key:'compThreshold',label:'Umbral compresor',  min:-20,max:-8, step:0.5, unit:'dB', def:-14, dec:1 },
                    { key:'compMakeup',   label:'Makeup gain',       min:0,  max:2,  step:0.1, unit:'dB', def:0.5, dec:1 }
                ]
            });
        }

        // 6. TRANSIENTS / crest factor
        if (m.crestFactor > 8) {
            findings.push({ sev:SEV.WARN, label:'Transientes agresivos',
                detail:'Picos instantaneos altos. Ajuste de ataque del compresor.',
                params:{ compAttack:0.008, compRelease:0.3 },
                sliders:[
                    { key:'compAttack',  label:'Ataque compresor (s)', min:0.001, max:0.03, step:0.001, unit:'s', def:0.008, dec:3 },
                    { key:'compRelease', label:'Release compresor (s)',min:0.05,  max:0.5,  step:0.01,  unit:'s', def:0.3,   dec:2 }
                ]
            });
        }

        // 7. SATURATION / harmonic warmth
        if (m.dynamicRange > 14 && m.brightness < 0.6) {
            findings.push({ sev:SEV.WARN, label:'Falta calor armonico',
                detail:'Dinamica amplia y espectro oscuro. Se anade saturacion suave.',
                params:{ satDrive:0.3 },
                sliders:[{ key:'satDrive', label:'Saturacion / Calor', min:0, max:0.8, step:0.01, unit:'', def:0.3, dec:2 }]
            });
        }

        // 8. STEREO WIDTH
        if (m.stereoWidth < 0.2 && m.stereoCanExpand) {
            findings.push({ sev:SEV.WARN, label:'Mezcla casi mono',
                detail:'Los canales son casi identicos. Expansion estereo recomendada.',
                params:{ stereoWidth:1.3 },
                sliders:[{ key:'stereoWidth', label:'Anchura estereo', min:1.0, max:1.8, step:0.01, unit:'x', def:1.3, dec:2 }]
            });
        } else if (m.stereoWidth > 0.8) {
            findings.push({ sev:SEV.WARN, label:'Anchura estereo excesiva',
                detail:'Puede causar cancelaciones de fase en mono.',
                params:{ stereoWidth:0.8 },
                sliders:[{ key:'stereoWidth', label:'Anchura estereo', min:0.5, max:1.2, step:0.01, unit:'x', def:0.8, dec:2 }]
            });
        } else {
            findings.push({ sev:SEV.OK, label:'Anchura estereo correcta',
                detail:'El campo estereo es coherente.',
                params:{}, sliders:[]
            });
        }

        return findings;
    }

    function mergeParams(findings, activeSet) {
        var merged = {};
        for (var k in NEUTRAL) merged[k] = NEUTRAL[k];
        for (var i = 0; i < findings.length; i++) {
            if (activeSet[i]) {
                var p = findings[i].params;
                for (var k in p) merged[k] = p[k];
            }
        }
        return merged;
    }

    function fmtTime(s) {
        if (!s || isNaN(s)) return '0:00';
        var m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function showAnalyzing(wsLeft) {
        wsLeft.innerHTML = '<div class="ws-analyzing"><i class="fas fa-spinner fa-spin"></i> Analizando pista...</div>';
    }

    // onRightRender(finding, currentParams, onChange) -- called when user clicks a finding row
    function renderReport(m, wsLeft, wsRight, onRightRender) {
        var findings    = buildFindings(m);
        var activeSet   = {};
        for (var i = 0; i < findings.length; i++) activeSet[i] = true;

        // Live param object: starts at merged defaults, then overridden by sliders
        var liveParams = mergeParams(findings, activeSet);
        audioEngine.applyParams(liveParams);

        var selectedIdx = -1;

        function reapply() {
            // Recompute merge but keep any live overrides on active findings
            var base = mergeParams(findings, activeSet);
            for (var k in base) {
                if (liveParams[k] === undefined) liveParams[k] = base[k];
            }
            // For deactivated findings, reset their params to neutral
            for (var i = 0; i < findings.length; i++) {
                if (!activeSet[i]) {
                    var p = findings[i].params;
                    for (var k in p) liveParams[k] = NEUTRAL[k];
                }
            }
            audioEngine.applyParams(liveParams);
        }

        function renderLeft() {
            var html = '<div class="ws-left-inner">';
            html += '<div class="analysis-stats-bar">';
            html += '<span class="astat">LUFS <b>' + m.loudnessDB.toFixed(1) + ' dB</b></span>';
            html += '<span class="astat">Pico <b>'  + m.peakDB.toFixed(1)     + ' dB</b></span>';
            html += '<span class="astat">DR <b>'    + m.dynamicRange.toFixed(1)+ ' dB</b></span>';
            html += '<span class="astat"><b>'       + fmtTime(m.duration)      + '</b></span>';
            html += '</div>';
            html += '<div class="findings-list">';

            for (var i = 0; i < findings.length; i++) {
                var f   = findings[i];
                var on  = activeSet[i];
                var sel = (i === selectedIdx) ? ' fr-selected' : '';
                html += '<div class="finding-row fr-' + f.sev + sel + '" data-idx="' + i + '">';
                html += '<span class="fr-badge">';
                if (f.sev === 'fix')  html += '<i class="fas fa-times-circle"></i>';
                else if (f.sev === 'warn') html += '<i class="fas fa-exclamation-triangle"></i>';
                else html += '<i class="fas fa-check-circle"></i>';
                html += '</span>';
                html += '<span class="fr-label' + (on ? '' : ' fr-label-off') + '">' + f.label + '</span>';
                if (f.sliders.length > 0) {
                    html += '<label class="toggle-sw" onclick="event.stopPropagation()">';
                    html += '<input type="checkbox" class="toggle-inp fr-toggle" data-idx="' + i + '"' + (on ? ' checked' : '') + '>';
                    html += '<span class="toggle-track"><span class="toggle-thumb"></span></span>';
                    html += '</label>';
                } else {
                    html += '<span class="fr-na">&#8212;</span>';
                }
                html += '</div>';
            }

            html += '</div></div>';
            wsLeft.innerHTML = html;

            // Wire row clicks
            var rows = wsLeft.querySelectorAll('.finding-row');
            for (var j = 0; j < rows.length; j++) {
                (function(row) {
                    row.addEventListener('click', function() {
                        selectedIdx = parseInt(row.getAttribute('data-idx'), 10);
                        renderLeft();
                        onRightRender(findings[selectedIdx], liveParams, function(key, val) {
                            liveParams[key] = val;
                            audioEngine.applyParams(liveParams);
                        });
                    });
                }(rows[j]));
            }

            // Wire toggles
            var toggles = wsLeft.querySelectorAll('.fr-toggle');
            for (var t = 0; t < toggles.length; t++) {
                (function(tog) {
                    tog.addEventListener('change', function() {
                        var idx = parseInt(tog.getAttribute('data-idx'), 10);
                        activeSet[idx] = tog.checked;
                        // If re-activating: restore finding defaults into liveParams
                        if (tog.checked) {
                            var p = findings[idx].params;
                            for (var k in p) liveParams[k] = p[k];
                        }
                        reapply();
                        renderLeft();
                        if (selectedIdx === idx) {
                            onRightRender(findings[selectedIdx], liveParams, function(key, val) {
                                liveParams[key] = val;
                                audioEngine.applyParams(liveParams);
                            });
                        }
                    });
                }(toggles[t]));
            }
        }

        renderLeft();
    }

    return {
        showAnalyzing: showAnalyzing,
        renderReport:  renderReport
    };
}());

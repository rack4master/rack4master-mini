// audioEngine.js
// Real-time Web Audio chain: MediaElementSource -> EQ -> Comp -> Sat -> Width -> Limiter -> dest
// Bypass: crossfade dryGain/wetGain (no clicks)

var audioEngine = (function() {

    var actx        = null;
    var mediaSource = null;
    var dryGain     = null;
    var wetGain     = null;
    var lowShelf    = null;
    var highShelf   = null;
    var peakMid     = null;
    var peakHarsh   = null;
    var comp        = null;
    var makeupG     = null;
    var shaper      = null;
    var splitter    = null;
    var midG        = null;
    var sideG       = null;
    var merger      = null;
    var limiter     = null;
    var effectsOn   = true;
    var audioBuffer = null;

    var params = {
        lowShelfGain: 0, highShelfGain: 0, midGain: 0, harshGain: 0,
        compRatio: 1, compThreshold: -24, compAttack: 0.003, compRelease: 0.25,
        compMakeup: 0, satDrive: 0, stereoWidth: 1.0, limiterDrive: 0
    };

    function getCtx() {
        if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
        return actx;
    }

    function dbToLin(db) { return Math.pow(10, db / 20); }

    function makeSatCurve(drive) {
        var n = 256, curve = new Float32Array(n), k = drive > 0 ? drive * 10 : 0;
        for (var i = 0; i < n; i++) {
            var x = (i * 2 / (n - 1)) - 1;
            curve[i] = k > 0 ? (3 + k) * x / Math.PI * (Math.PI / (3 + k * (x < 0 ? -x : x))) : x;
        }
        return curve;
    }

    function connectToMedia(mediaElement) {
        var ctx = getCtx();
        if (ctx.state === 'suspended') ctx.resume();
        if (mediaSource) { try { mediaSource.disconnect(); } catch(e) {} }

        mediaSource = ctx.createMediaElementSource(mediaElement);

        dryGain = ctx.createGain(); dryGain.gain.value = 0;

        lowShelf = ctx.createBiquadFilter(); lowShelf.type = 'lowshelf'; lowShelf.frequency.value = 150; lowShelf.gain.value = params.lowShelfGain;
        highShelf = ctx.createBiquadFilter(); highShelf.type = 'highshelf'; highShelf.frequency.value = 5000; highShelf.gain.value = params.highShelfGain;
        peakMid = ctx.createBiquadFilter(); peakMid.type = 'peaking'; peakMid.frequency.value = 1500; peakMid.Q.value = 0.8; peakMid.gain.value = params.midGain;
        peakHarsh = ctx.createBiquadFilter(); peakHarsh.type = 'peaking'; peakHarsh.frequency.value = 3500; peakHarsh.Q.value = 1.2; peakHarsh.gain.value = params.harshGain;

        comp = ctx.createDynamicsCompressor();
        comp.ratio.value = params.compRatio; comp.threshold.value = params.compThreshold;
        comp.attack.value = params.compAttack; comp.release.value = params.compRelease; comp.knee.value = 6;

        makeupG = ctx.createGain(); makeupG.gain.value = dbToLin(params.compMakeup);

        shaper = ctx.createWaveShaper(); shaper.curve = makeSatCurve(params.satDrive); shaper.oversample = '2x';

        splitter = ctx.createChannelSplitter(2);
        midG = ctx.createGain(); midG.gain.value = 1.0;
        sideG = ctx.createGain(); sideG.gain.value = params.stereoWidth;
        merger = ctx.createChannelMerger(2);

        limiter = ctx.createDynamicsCompressor();
        limiter.ratio.value = 20; limiter.threshold.value = -0.5 - params.limiterDrive;
        limiter.attack.value = 0.001; limiter.release.value = 0.1; limiter.knee.value = 0;

        wetGain = ctx.createGain(); wetGain.gain.value = 1;

        // Wire wet chain
        mediaSource.connect(lowShelf);
        lowShelf.connect(highShelf); highShelf.connect(peakMid); peakMid.connect(peakHarsh);
        peakHarsh.connect(comp); comp.connect(makeupG); makeupG.connect(shaper);
        shaper.connect(splitter);
        splitter.connect(midG, 0); splitter.connect(sideG, 1);
        midG.connect(merger, 0, 0); sideG.connect(merger, 0, 1);
        merger.connect(limiter); limiter.connect(wetGain); wetGain.connect(ctx.destination);

        // Wire dry (bypass) path
        mediaSource.connect(dryGain); dryGain.connect(ctx.destination);

        effectsOn = true;
    }

    function setBypass(bypassed) {
        if (!wetGain || !dryGain) { effectsOn = !bypassed; return; }
        effectsOn = !bypassed;
        var ctx = getCtx(), now = ctx.currentTime, F = 0.05;
        if (bypassed) {
            wetGain.gain.setTargetAtTime(0, now, F);
            dryGain.gain.setTargetAtTime(1, now, F);
        } else {
            dryGain.gain.setTargetAtTime(0, now, F);
            wetGain.gain.setTargetAtTime(1, now, F);
        }
    }

    function applyParams(p) {
        if (p) { for (var k in p) { if (params.hasOwnProperty(k)) params[k] = p[k]; } }
        if (!lowShelf) return;
        var ctx = getCtx(); if (ctx.state === 'suspended') ctx.resume();
        var now = ctx.currentTime, T = 0.05;
        lowShelf.gain.setTargetAtTime(params.lowShelfGain,   now, T);
        highShelf.gain.setTargetAtTime(params.highShelfGain, now, T);
        peakMid.gain.setTargetAtTime(params.midGain,         now, T);
        peakHarsh.gain.setTargetAtTime(params.harshGain,     now, T);
        comp.ratio.setTargetAtTime(params.compRatio,         now, T);
        comp.threshold.setTargetAtTime(params.compThreshold, now, T);
        comp.attack.setTargetAtTime(params.compAttack,       now, T);
        comp.release.setTargetAtTime(params.compRelease,     now, T);
        if (makeupG) makeupG.gain.setTargetAtTime(dbToLin(params.compMakeup), now, T);
        if (shaper)  shaper.curve = makeSatCurve(params.satDrive);
        if (sideG)   sideG.gain.setTargetAtTime(params.stereoWidth,           now, T);
        if (limiter) limiter.threshold.setTargetAtTime(-0.5 - params.limiterDrive, now, T);
    }

    function resetParams() {
        params = { lowShelfGain: 0, highShelfGain: 0, midGain: 0, harshGain: 0,
            compRatio: 1, compThreshold: -24, compAttack: 0.003, compRelease: 0.25,
            compMakeup: 0, satDrive: 0, stereoWidth: 1.0, limiterDrive: 0 };
        applyParams(null);
    }

    function setBuffer(buf)   { audioBuffer = buf; }
    function getAudioBuffer() { return audioBuffer; }
    function getParams()      { return params; }
    function isEffectsOn()  { return effectsOn; }

    function disconnect() {
        if (mediaSource) { try { mediaSource.disconnect(); } catch(e) {} mediaSource = null; }
        lowShelf=highShelf=peakMid=peakHarsh=comp=makeupG=shaper=splitter=midG=sideG=merger=limiter=wetGain=dryGain=null;
    }

    function savePreset(name, mode, presetId) {
        var obj = {
            name:     name     || 'Preset',
            date:     new Date().toISOString().slice(0,10),
            mode:     mode     || null,
            presetId: presetId || null,
            params:   {}
        };
        for (var k in params) obj.params[k] = params[k];
        var blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a'); a.href = url; a.download = (name || 'preset') + '.json'; a.click();
        setTimeout(function() { URL.revokeObjectURL(url); }, 3000);
    }

    function loadPreset(json, onDone, onError) {
        try {
            var obj = JSON.parse(json);
            if (!obj.params) throw new Error('Formato de preset invalido');
            applyParams(obj.params);
            if (onDone) onDone(obj); // devuelve objeto completo: name, mode, presetId, params
        } catch(e) { if (onError) onError(e.message); }
    }

    function exportWAV(onProgress, onDone, onError) {
        if (!audioBuffer) { onError('No hay audio decodificado'); return; }
        var numCh = audioBuffer.numberOfChannels, len = audioBuffer.length, sr = audioBuffer.sampleRate;
        var offline = new OfflineAudioContext(numCh, len, sr);

        function dbL(db) { return Math.pow(10, db/20); }
        var ls = offline.createBiquadFilter(); ls.type='lowshelf'; ls.frequency.value=150; ls.gain.value=params.lowShelfGain;
        var hs = offline.createBiquadFilter(); hs.type='highshelf'; hs.frequency.value=5000; hs.gain.value=params.highShelfGain;
        var pm = offline.createBiquadFilter(); pm.type='peaking'; pm.frequency.value=1500; pm.Q.value=0.8; pm.gain.value=params.midGain;
        var ph = offline.createBiquadFilter(); ph.type='peaking'; ph.frequency.value=3500; ph.Q.value=1.2; ph.gain.value=params.harshGain;
        var cp = offline.createDynamicsCompressor(); cp.ratio.value=params.compRatio; cp.threshold.value=params.compThreshold; cp.attack.value=params.compAttack; cp.release.value=params.compRelease; cp.knee.value=6;
        var mk = offline.createGain(); mk.gain.value=dbL(params.compMakeup);
        var ws = offline.createWaveShaper(); ws.curve=makeSatCurve(params.satDrive); ws.oversample='2x';
        var sp = offline.createChannelSplitter(2);
        var mg = offline.createGain(); mg.gain.value=1;
        var sg = offline.createGain(); sg.gain.value=params.stereoWidth;
        var mr = offline.createChannelMerger(2);
        var li = offline.createDynamicsCompressor(); li.ratio.value=20; li.threshold.value=-0.5-params.limiterDrive; li.attack.value=0.001; li.release.value=0.1; li.knee.value=0;

        var src = offline.createBufferSource(); src.buffer = audioBuffer;
        src.connect(ls); ls.connect(hs); hs.connect(pm); pm.connect(ph); ph.connect(cp);
        cp.connect(mk); mk.connect(ws); ws.connect(sp);
        sp.connect(mg,0); sp.connect(sg,1); mg.connect(mr,0,0); sg.connect(mr,0,1);
        mr.connect(li); li.connect(offline.destination);
        src.start(0);

        if (onProgress) onProgress(10);
        offline.oncomplete = function(e) {
            if (onProgress) onProgress(80);
            onDone(bufferToWAV(e.renderedBuffer));
            if (onProgress) onProgress(100);
        };
        offline.onerror = function(err) { onError(err); };
        offline.startRendering();
    }

    function bufferToWAV(buf) {
        var nC=buf.numberOfChannels, sr=buf.sampleRate, n=buf.length;
        var ab=new ArrayBuffer(44+n*nC*2), dv=new DataView(ab), pos=0;
        function ws(s){for(var i=0;i<s.length;i++)dv.setUint8(pos++,s.charCodeAt(i));}
        function u32(v){dv.setUint32(pos,v,true);pos+=4;}
        function u16(v){dv.setUint16(pos,v,true);pos+=2;}
        ws('RIFF');u32(36+n*nC*2);ws('WAVE');ws('fmt ');u32(16);u16(1);u16(nC);u32(sr);u32(sr*nC*2);u16(nC*2);u16(16);
        ws('data');u32(n*nC*2);
        var chs=[]; for(var c=0;c<nC;c++) chs.push(buf.getChannelData(c));
        for(var i=0;i<n;i++) for(var c=0;c<nC;c++){
            var s=Math.max(-1,Math.min(1,chs[c][i]));
            dv.setInt16(pos,s<0?s*32768:s*32767,true);pos+=2;
        }
        return new Blob([ab],{type:'audio/wav'});
    }

    return {
        getCtx: getCtx, connectToMedia: connectToMedia, setBuffer: setBuffer, getAudioBuffer: getAudioBuffer,
        setBypass: setBypass, applyParams: applyParams, resetParams: resetParams,
        getParams: getParams, isEffectsOn: isEffectsOn,
        savePreset: savePreset, loadPreset: loadPreset,
        exportWAV: exportWAV, disconnect: disconnect
    };
}());

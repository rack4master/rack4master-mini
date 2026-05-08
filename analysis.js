// analysis.js
// Input: AudioBuffer, callback(metrics)
// All strings/comments ASCII-only for XAMPP Latin-1 compatibility

function analyzeBuffer(buffer, callback) {
    var sampleRate   = buffer.sampleRate;
    var numChannels  = buffer.numberOfChannels;
    var ch0          = buffer.getChannelData(0);
    var channelData;

    // Mix to mono
    if (numChannels > 1) {
        var ch1 = buffer.getChannelData(1);
        channelData = new Float32Array(ch0.length);
        for (var i = 0; i < ch0.length; i++) {
            channelData[i] = (ch0[i] + ch1[i]) * 0.5;
        }
    } else {
        channelData = ch0;
    }

    // RMS, peak
    var sumSq = 0, peak = 0, abss;
    for (var i = 0; i < channelData.length; i++) {
        abss  = channelData[i] < 0 ? -channelData[i] : channelData[i];
        sumSq += channelData[i] * channelData[i];
        if (abss > peak) peak = abss;
    }
    var rms          = Math.sqrt(sumSq / channelData.length);
    var crestFactor  = peak / (rms + 1e-9);
    var loudnessDB   = 20 * Math.log(rms  + 1e-9) / Math.LN10;
    var peakDB       = 20 * Math.log(peak + 1e-9) / Math.LN10;
    var dynamicRange = peakDB - loudnessDB;

    // FFT spectral analysis
    var FFT_SIZE    = 2048;
    var HOP         = FFT_SIZE;
    var totalWins   = Math.floor((channelData.length - FFT_SIZE) / HOP) + 1;
    var MAX_WINS    = 800;
    var stepWin     = Math.max(1, Math.floor(totalWins / MAX_WINS));
    var binWidth    = sampleRate / FFT_SIZE;

    // Hann window (pre-computed)
    var hannWin = new Float32Array(FFT_SIZE);
    for (var i = 0; i < FFT_SIZE; i++) {
        hannWin[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (FFT_SIZE - 1)));
    }

    // In-place Cooley-Tukey FFT (radix-2, decimation-in-time)
    function fft(re, im) {
        var N    = re.length;
        var bits = Math.round(Math.log(N) / Math.LN2);
        var i, j, rev, len, ang, wRe0, wIm0, wRe, wIm, nwRe, uRe, uIm, vRe, vIm, tr, ti;
        for (i = 0; i < N; i++) {
            rev = 0;
            for (j = 0; j < bits; j++) {
                if (i & (1 << j)) rev |= (1 << (bits - 1 - j));
            }
            if (i < rev) {
                tr = re[i]; re[i] = re[rev]; re[rev] = tr;
                ti = im[i]; im[i] = im[rev]; im[rev] = ti;
            }
        }
        for (len = 2; len <= N; len <<= 1) {
            ang  = 2 * Math.PI / len;
            wRe0 = Math.cos(ang);
            wIm0 = -Math.sin(ang);
            for (i = 0; i < N; i += len) {
                wRe = 1; wIm = 0;
                for (j = 0; j < (len >> 1); j++) {
                    uRe = re[i + j];
                    uIm = im[i + j];
                    vRe = re[i + j + (len >> 1)] * wRe - im[i + j + (len >> 1)] * wIm;
                    vIm = re[i + j + (len >> 1)] * wIm + im[i + j + (len >> 1)] * wRe;
                    re[i + j]              = uRe + vRe;
                    im[i + j]              = uIm + vIm;
                    re[i + j + (len >> 1)] = uRe - vRe;
                    im[i + j + (len >> 1)] = uIm - vIm;
                    nwRe = wRe * wRe0 - wIm * wIm0;
                    wIm  = wRe * wIm0 + wIm * wRe0;
                    wRe  = nwRe;
                }
            }
        }
    }

    var bassEnergy = 0, midEnergy = 0, highEnergy = 0, harshEnergy = 0;
    var centroidSum = 0, numFrames = 0;
    var real = new Float32Array(FFT_SIZE);
    var imag = new Float32Array(FFT_SIZE);

    for (var win = 0; win < totalWins; win += stepWin) {
        var start = win * HOP;
        if (start + FFT_SIZE > channelData.length) break;
        for (var i = 0; i < FFT_SIZE; i++) {
            real[i] = channelData[start + i] * hannWin[i];
            imag[i] = 0;
        }
        fft(real, imag);
        var frameEnergy = 0, frameCentroid = 0, f, mag, en;
        for (var k = 0; k < (FFT_SIZE >> 1); k++) {
            f   = k * binWidth;
            mag = Math.sqrt(real[k] * real[k] + imag[k] * imag[k]);
            en  = mag * mag;
            frameEnergy   += en;
            frameCentroid += f * en;
            // Bands (non-overlapping for ratio calc):
            //   bass:  60-150 Hz
            //   mid:   500-3000 Hz (refined vocal range)
            //   high:  5000+ Hz
            if      (f >= 60   && f < 150)   bassEnergy  += en;
            else if (f >= 500  && f < 3000)  midEnergy   += en;
            else if (f >= 5000)              highEnergy  += en;
            // harsh: 2000-5000 Hz (presence/sibilance zone, separate metric)
            if (f >= 2000 && f <= 5000)      harshEnergy += en;
        }
        if (frameEnergy > 0) {
            centroidSum += frameCentroid / frameEnergy;
            numFrames++;
        }
    }

    var totalEnergy   = bassEnergy + midEnergy + highEnergy;
    if (totalEnergy < 1e-10) totalEnergy = 1e-10;
    var bassRatio     = bassEnergy  / totalEnergy;
    var midRatio      = midEnergy   / totalEnergy;
    var highRatio     = highEnergy  / totalEnergy;
    var harshRatio    = harshEnergy / totalEnergy;
    var avgCentroid   = numFrames > 0 ? centroidSum / numFrames : 0;
    var brightness    = Math.min(1, avgCentroid / (sampleRate * 0.5));

    // Stereo width: 1 - inter-channel correlation (subsampled)
    var stereoWidth    = 0;
    var stereoCanExpand = false;
    if (numChannels >= 2) {
        var left  = buffer.getChannelData(0);
        var right = buffer.getChannelData(1);
        var sumLR = 0, sumL2 = 0, sumR2 = 0;
        var st = Math.max(1, Math.floor(left.length / 50000));
        for (var i = 0; i < left.length; i += st) {
            sumLR += left[i] * right[i];
            sumL2 += left[i] * left[i];
            sumR2 += right[i] * right[i];
        }
        var denom  = Math.sqrt(sumL2 * sumR2);
        var corr   = denom > 0 ? sumLR / denom : 1;
        stereoWidth = 1 - corr;
        // Expanding a narrow-stereo signal only makes sense
        // if the material has enough high-frequency content
        stereoCanExpand = (brightness > 0.4);
    }

    callback({
        loudnessDB:      loudnessDB,
        peakDB:          peakDB,
        dynamicRange:    dynamicRange,
        rms:             rms,
        peak:            peak,
        crestFactor:     crestFactor,
        bassRatio:       bassRatio,
        midRatio:        midRatio,
        highRatio:       highRatio,
        harshRatio:      harshRatio,
        brightness:      brightness,
        spectralCentroid: avgCentroid,
        stereoWidth:     stereoWidth,
        stereoCanExpand: stereoCanExpand,
        duration:        buffer.duration
    });
}

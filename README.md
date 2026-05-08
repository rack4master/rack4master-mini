# RACK4MASTER mini

**Intelligent EQ Auto-mastering — 100% in-browser**

---

## Description

Rack4Master mini is a web-based auto-mastering application that runs entirely in your browser, requiring no external servers or installations. It analyzes the spectrum and dynamics of any audio file, suggests intelligent corrections, and applies a professional processing chain in real-time, delivering exportable high-quality WAV results.

---

## Key Features

### Input Formats
Supports drag-and-drop or file selection for **MP3, WAV, OGG, FLAC, and AAC** formats.

### Waveform Visualization
Interactive visual player with waveform rendering based on **WaveSurfer.js v6**. The playhead is clickable and draggable for easy track navigation.

### Transport & Navigation
- Play / Pause / Stop with keyboard shortcuts (`Space`, `S`).
- Real-time display of current time and total duration.
- **Adjustable Loop Region**: Draggable S (Start) and E (End) handles on the waveform to define specific repeat zones.

### Processing Chain (Web Audio API)
The audio engine implements a wet/dry chain with click-free crossfading:

| Stage | Description |
|---|---|
| Low Shelf EQ | Bass boost or cut (150 Hz). |
| High Shelf EQ | Treble boost or cut (5 kHz). |
| Mid Peak EQ | Vocal range control (1.5 kHz). |
| Harsh Peak EQ | Presence and sibilance control (3.5 kHz). |
| Compressor | DynamicsCompressor with ratio, threshold, attack, release, and makeup gain. |
| Saturation | WaveShaper with a configurable soft-clip curve. |
| Stereo Width | Independent M/S control for the side channel. |
| Limiter | High-ratio compressor at -0.5 dB, fully configurable. |

The **ON/OFF** button provides a full bypass with smooth crossfading between the dry and processed signals.

### Analysis Mode — Intelligent Auto-EQ
Analyzes the decoded buffer using a proprietary FFT (Cooley-Tukey radix-2) and generates a report with up to 8 automatic diagnostics:

- Excessive or lacking highs (spectral brightness).
- Excessive or lacking lows (60–150 Hz energy ratio).
- Harshness in the 2–5 kHz range (listening fatigue).
- Recessed or dominant mids (vocal range 500–3000 Hz).
- Excessive or normal dynamic range (suggests appropriate compression).
- Aggressive transients (crest factor).
- Lack of harmonic warmth (suggests saturation).
- Stereo field issues (too narrow or excessively wide).

Each diagnostic includes an **on/off toggle** and a **fine-tuning slider** to adjust the suggested parameters in real-time while listening.

### Presets Mode — 16 Ready-to-use Styles

**General**
Neutral · Soft Mastering · Broadcast

**Genres**
Rock · Pop · Jazz · Blues · Ballad · Folk · Country · Urban/Hip-Hop · Latin

**Style**
Warm Vintage · Bright & Open · Punchy · Lo-Fi

Each preset features a thumbnail showing EQ bars and compression points. Once selected, it applies instantly and opens a fine-tuning panel with sliders for relevant parameters (neutral parameters are hidden). Compression is exposed via a single **Intensity** slider that interpolates between neutral and target values.

### Exporting
- **WAV**: Offline rendering via `OfflineAudioContext` using the same processing chain, exported as a 16-bit PCM stereo WAV.
- **Preset JSON**: Save and load your full parameter configurations in JSON format to reuse across different sessions.

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `S` | Stop |
| `L` | Loop on/off |
| `B` | Bypass on/off |

---

## Requirements

- A modern browser with **Web Audio API** and **OfflineAudioContext** support.
- A local web server (XAMPP, Live Server, etc.) to avoid CORS restrictions.
- No Node.js, bundlers, or npm dependencies required.

### CDN Dependencies
- [WaveSurfer.js 6.6.4](https://unpkg.com/wavesurfer.js@6.6.4)
- [Font Awesome 6.0.0-beta3](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3)

---

> **🎚️ Need more control?**
> If you are looking for granular adjustments and a professional mastering rack, check out the full version: [rack4master](https://github.com/rack4master/rack4master.github.io).

---

## 💰 Donate

If you find RACK4MASTER-MINI useful, you can support the project with a donation:

[![Donate with PayPal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/donate?business=73KKE6DVSJ8WY&no_recurring=1&currency_code=EUR)


*Rack4Master mini — professional audio processing, right in your browser.*

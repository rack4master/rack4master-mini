# RACK4MASTER mini

**Intelligent EQ Auto-mastering — 100% en el navegador**

---

## Descripción

Rack4Master mini es una aplicación web de mastering automático que funciona íntegramente en el navegador, sin servidores externos ni instalaciones. Analiza el espectro y la dinámica de cualquier archivo de audio, sugiere correcciones inteligentes y aplica una cadena de procesado profesional en tiempo real, con resultados exportables en WAV.

---

## Características principales

### Formatos de entrada
Soporta arrastrar y soltar o selección de archivo en los formatos **MP3, WAV, OGG, FLAC y AAC**.

### Visualización de forma de onda
Reproductor visual con waveform interactivo basado en **WaveSurfer.js v6**. El cabezal de reproducción es clickable y arrastrble para navegar por la pista.

### Transporte
- Play / Pause / Stop con atajos de teclado (`Space`, `S`)
- Visualización de tiempo actual y duración
- **Loop con región ajustable**: los manejadores S (Start) y E (End) son arrastrables sobre la forma de onda para definir exactamente la zona a repetir

### Cadena de procesado (Web Audio API)
El motor de audio implementa una cadena wet/dry con crossfade sin clics:

| Etapa | Descripción |
|---|---|
| EQ Low Shelf | Realce o atenuación de graves (150 Hz) |
| EQ High Shelf | Realce o atenuación de agudos (5 kHz) |
| EQ Peak Mid | Control de la zona vocal (1.5 kHz) |
| EQ Peak Harsh | Control de presencia/sibilancias (3.5 kHz) |
| Compresor | DynamicsCompressor con ratio, umbral, ataque, release y makeup |
| Saturación | WaveShaper con curva suave configurable |
| Anchura estéreo | Control M/S independiente de canal lateral |
| Limiter | Compresor de alta ratio a -0.5 dB, configurable |

El botón **ON/OFF** hace bypass completo con crossfade suave entre la señal seca y la procesada.

### Modo Análisis — Auto-EQ inteligente
Analiza el buffer decodificado mediante una FFT propia (Cooley-Tukey radix-2) y genera un informe con hasta 8 diagnósticos automáticos:

- Exceso o defecto de agudos (brightness espectral)
- Exceso o defecto de graves (ratio de energía 60–150 Hz)
- Dureza en la zona 2–5 kHz (fatiga auditiva)
- Medios hundidos o dominantes (zona vocal 500–3000 Hz)
- Rango dinámico excesivo o normal (sugiere compresión apropiada)
- Transientes agresivos (crest factor)
- Falta de calor armónico (sugiere saturación)
- Campo estéreo demasiado estrecho o excesivamente ancho

Cada diagnóstico incluye un **toggle on/off** y un **slider de ajuste fino** para modificar el parámetro sugerido en tiempo real mientras se escucha la pista.

### Modo Presets — 16 estilos listos para usar

**General**
Neutral · Mastering Suave · Broadcast

**Géneros**
Rock · Pop · Jazz · Blues · Balada · Folk · Country · Urban/Hip-Hop · Latino

**Estilo**
Warm Vintage · Bright & Open · Punchy · Lo-Fi

Cada preset muestra una miniatura con barras de EQ y puntos de compresión. Al seleccionarlo se aplica instantáneamente y se abre un panel de ajuste fino con sliders para los parámetros relevantes (los parámetros neutros se omiten). La compresión se expone como un único slider de **Intensidad** que interpola entre el valor neutro y el target del preset.

### Exportación
- **WAV**: renderizado offline mediante `OfflineAudioContext` con la misma cadena de procesado, exportado como WAV 16-bit PCM estéreo.
- **Preset JSON**: guarda y carga la configuración completa de parámetros en formato JSON para reutilizar entre sesiones.

### Atajos de teclado

| Tecla | Acción |
|---|---|
| `Space` | Play / Pause |
| `S` | Stop |
| `L` | Loop on/off |
| `B` | Bypass on/off |

---

## Requisitos

- Navegador moderno con soporte de **Web Audio API** y **OfflineAudioContext**
- Servidor web local (XAMPP, Live Server, etc.) para evitar restricciones CORS
- No requiere Node.js, bundler ni dependencias npm

### Dependencias CDN
- [WaveSurfer.js 6.6.4](https://unpkg.com/wavesurfer.js@6.6.4)
- [Font Awesome 6.0.0-beta3](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3)

---
**🎚️ Need more control?**
 If you are looking for granular adjustments and a professional mastering rack, check out the full version: [rack4master](https://rack4master.github.io/).

---

*Rack4Master mini — procesado de audio profesional, sin salir del navegador.*

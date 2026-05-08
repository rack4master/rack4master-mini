// presets.js
// All params mapped to audioEngine 12-param format:
// lowShelfGain, highShelfGain, midGain, harshGain,
// compRatio, compThreshold, compAttack, compRelease,
// compMakeup, satDrive, stereoWidth, limiterDrive

var PRESETS = [

  // ---- GENERAL ----
  {
    id: 'neutral', name: 'Neutral', category: 'General',
    desc: 'Sin procesado. Cadena activa a cero.',
    params: { lowShelfGain:0, highShelfGain:0, midGain:0, harshGain:0,
      compRatio:1, compThreshold:-24, compAttack:0.003, compRelease:0.25,
      compMakeup:0, satDrive:0, stereoWidth:1.0, limiterDrive:0 }
  },
  {
    id: 'mastering', name: 'Mastering Suave', category: 'General',
    desc: 'Compresion de pegamento ligera. EQ plano.',
    params: { lowShelfGain:0, highShelfGain:0, midGain:0, harshGain:0,
      compRatio:1.5, compThreshold:-8, compAttack:0.03, compRelease:0.3,
      compMakeup:1, satDrive:0, stereoWidth:1.0, limiterDrive:0.5 }
  },
  {
    id: 'broadcast', name: 'Broadcast', category: 'General',
    desc: 'Loudness controlado para radio/streaming.',
    params: { lowShelfGain:-0.5, highShelfGain:0.5, midGain:0, harshGain:-0.5,
      compRatio:2, compThreshold:-12, compAttack:0.01, compRelease:0.15,
      compMakeup:2, satDrive:0, stereoWidth:1.0, limiterDrive:1.5 }
  },

  // ---- GENEROS ----
  {
    id: 'rock', name: 'Rock', category: 'Genero',
    desc: 'Cuerpo, presencia y pegada. Saturacion suave.',
    params: { lowShelfGain:1, highShelfGain:1, midGain:-1, harshGain:1,
      compRatio:2.5, compThreshold:-16, compAttack:0.015, compRelease:0.15,
      compMakeup:2, satDrive:0.2, stereoWidth:1.0, limiterDrive:1 }
  },
  {
    id: 'pop', name: 'Pop', category: 'Genero',
    desc: 'Brillante, ancho y comercial.',
    params: { lowShelfGain:1, highShelfGain:1.5, midGain:-1, harshGain:1.5,
      compRatio:2.5, compThreshold:-16, compAttack:0.01, compRelease:0.12,
      compMakeup:2.5, satDrive:0, stereoWidth:1.2, limiterDrive:1 }
  },
  {
    id: 'jazz', name: 'Jazz', category: 'Genero',
    desc: 'Dinamico, abierto y natural. Minima compresion.',
    params: { lowShelfGain:0, highShelfGain:1.5, midGain:-1, harshGain:0.5,
      compRatio:1.5, compThreshold:-22, compAttack:0.03, compRelease:0.2,
      compMakeup:0.5, satDrive:0, stereoWidth:1.0, limiterDrive:1 }
  },
  {
    id: 'blues', name: 'Blues', category: 'Genero',
    desc: 'Calido y expresivo. Graves presentes.',
    params: { lowShelfGain:1, highShelfGain:0.5, midGain:-1, harshGain:0.5,
      compRatio:2, compThreshold:-18, compAttack:0.02, compRelease:0.18,
      compMakeup:1.5, satDrive:0, stereoWidth:1.0, limiterDrive:1 }
  },
  {
    id: 'ballad', name: 'Balada', category: 'Genero',
    desc: 'Suave y envolvente. Espacioso.',
    params: { lowShelfGain:1, highShelfGain:1, midGain:-1, harshGain:1,
      compRatio:2, compThreshold:-20, compAttack:0.025, compRelease:0.2,
      compMakeup:1.5, satDrive:0, stereoWidth:1.1, limiterDrive:1 }
  },
  {
    id: 'folk', name: 'Folk', category: 'Genero',
    desc: 'Natural y transparente. Compresion minima.',
    params: { lowShelfGain:0.5, highShelfGain:0.5, midGain:-1, harshGain:0.5,
      compRatio:1.5, compThreshold:-20, compAttack:0.025, compRelease:0.2,
      compMakeup:1, satDrive:0, stereoWidth:1.0, limiterDrive:1 }
  },
  {
    id: 'country', name: 'Country', category: 'Genero',
    desc: 'Cuerpo en graves, brillo en agudos. Presencia vocal.',
    params: { lowShelfGain:1.5, highShelfGain:1, midGain:-1, harshGain:1.5,
      compRatio:2, compThreshold:-18, compAttack:0.015, compRelease:0.15,
      compMakeup:2, satDrive:0, stereoWidth:1.0, limiterDrive:1 }
  },
  {
    id: 'urban', name: 'Urban / Hip-Hop', category: 'Genero',
    desc: 'Compresion agresiva. Punch y loudness.',
    params: { lowShelfGain:-1, highShelfGain:0.5, midGain:-1, harshGain:1,
      compRatio:3, compThreshold:-14, compAttack:0.01, compRelease:0.1,
      compMakeup:3, satDrive:0, stereoWidth:1.0, limiterDrive:1 }
  },
  {
    id: 'latino', name: 'Latino', category: 'Genero',
    desc: 'Ritmo, brillo y energia. Agudos realzados.',
    params: { lowShelfGain:1, highShelfGain:2, midGain:-1, harshGain:1.5,
      compRatio:2, compThreshold:-18, compAttack:0.015, compRelease:0.15,
      compMakeup:2, satDrive:0, stereoWidth:1.0, limiterDrive:1 }
  },

  // ---- ESTILO ----
  {
    id: 'warm-vintage', name: 'Warm Vintage', category: 'Estilo',
    desc: 'Calor armonico y graves redondos. Sabor analogico.',
    params: { lowShelfGain:1.5, highShelfGain:-1, midGain:0.5, harshGain:-1,
      compRatio:2, compThreshold:-16, compAttack:0.025, compRelease:0.2,
      compMakeup:1.5, satDrive:0.4, stereoWidth:0.9, limiterDrive:1 }
  },
  {
    id: 'bright-open', name: 'Bright & Open', category: 'Estilo',
    desc: 'Agudos aireados y campo estereo amplio.',
    params: { lowShelfGain:-0.5, highShelfGain:3, midGain:0, harshGain:0.5,
      compRatio:1.5, compThreshold:-20, compAttack:0.02, compRelease:0.2,
      compMakeup:1, satDrive:0, stereoWidth:1.3, limiterDrive:1 }
  },
  {
    id: 'punchy', name: 'Punchy', category: 'Estilo',
    desc: 'Transientes controlados. Impacto maximo.',
    params: { lowShelfGain:1, highShelfGain:1, midGain:-1.5, harshGain:0.5,
      compRatio:3, compThreshold:-14, compAttack:0.005, compRelease:0.1,
      compMakeup:3, satDrive:0.1, stereoWidth:1.0, limiterDrive:1.5 }
  },
  {
    id: 'lofi', name: 'Lo-Fi', category: 'Estilo',
    desc: 'Saturacion y reduccion de agudos. Textura retro.',
    params: { lowShelfGain:1, highShelfGain:-2.5, midGain:0.5, harshGain:-2,
      compRatio:2, compThreshold:-16, compAttack:0.02, compRelease:0.2,
      compMakeup:1.5, satDrive:0.5, stereoWidth:0.85, limiterDrive:1 }
  }
];

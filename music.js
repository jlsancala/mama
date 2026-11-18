(() => {
  const TEMPO = 100;
  const MUSIC_VOLUME = 0.32;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!AudioContext || !OfflineAudioContext) return;

  const surprise = document.querySelector('.surprise');
  const envelopeToggle = document.querySelector('.envelope-toggle');
  const musicControls = document.querySelector('.music-controls');
  const musicToggle = document.querySelector('.music-toggle');
  const musicLabel = document.querySelector('.music-label');

  // Happy Birthday in C major. Each pair is [MIDI note, duration in beats].
  const melody = [
    [67, 0.75], [67, 0.25], [69, 1], [67, 1], [72, 1], [71, 2],
    [67, 0.75], [67, 0.25], [69, 1], [67, 1], [74, 1], [72, 2],
    [67, 0.75], [67, 0.25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
    [77, 0.75], [77, 0.25], [76, 1], [72, 1], [74, 1], [72, 2],
  ];

  // Quiet, low arpeggios give the music-box melody a warm accompaniment.
  const chords = [
    [0, [48, 52, 55]], [4, [47, 50, 55]],
    [6, [48, 52, 55]], [9, [47, 50, 55]], [10, [48, 52, 55]],
    [12, [48, 52, 55]], [16, [53, 57, 60]],
    [19, [53, 57, 60]], [22, [47, 50, 55]], [23, [48, 52, 55]],
  ];

  let context;
  let song;
  let source;
  let output;
  let playbackVersion = 0;
  let musicEnabled = true;

  function updateControl(playing) {
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.title = playing ? 'Turn birthday music off' : 'Turn birthday music on';
    musicLabel.textContent = playing ? 'Music on' : 'Music off';
  }

  function addNote(renderer, midi, start, duration, volume) {
    const frequency = 440 * 2 ** ((midi - 69) / 12);

    // Soft sine-wave harmonics and a natural decay, rather than a harsh beep.
    [1, 0.25, 0.06].forEach((strength, index) => {
      const oscillator = renderer.createOscillator();
      const envelope = renderer.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency * (index + 1);
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(volume * strength, start + 0.012);
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(envelope);
      envelope.connect(renderer.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    });
  }

  function renderSong(sampleRate) {
    const beat = 60 / TEMPO;
    const totalBeats = melody.reduce((total, [, beats]) => total + beats, 0);
    const duration = totalBeats * beat + 2.5;
    const renderer = new OfflineAudioContext(1, Math.ceil(sampleRate * duration), sampleRate);
    let cursor = 0.15;

    melody.forEach(([midi, beats]) => {
      addNote(renderer, midi, cursor, beats * beat + 0.3, 0.34);
      cursor += beats * beat;
    });

    chords.forEach(([offset, notes]) => {
      notes.forEach((midi, index) => {
        addNote(renderer, midi, 0.15 + offset * beat + index * 0.11, beat * 2.2, 0.055);
      });
    });

    // Render once locally, then loop the buffer with a little breathing room.
    return renderer.startRendering();
  }

  function resumeAudio() {
    if (!context) context = new AudioContext();
    return context.resume();
  }

  async function startMusic() {
    if (source) return;
    const version = ++playbackVersion;

    try {
      const resumed = resumeAudio();
      if (!song) song = renderSong(context.sampleRate);
      const [, buffer] = await Promise.all([resumed, song]);

      // Closing the envelope or switching music off cancels pending playback.
      if (version !== playbackVersion || !musicEnabled || !surprise.open) return;
      if (context.state !== 'running') {
        updateControl(false);
        return;
      }

      source = context.createBufferSource();
      output = context.createGain();
      source.buffer = buffer;
      source.loop = true;
      output.gain.setValueAtTime(0, context.currentTime);
      output.gain.linearRampToValueAtTime(MUSIC_VOLUME, context.currentTime + 0.2);
      source.connect(output);
      output.connect(context.destination);
      source.start();
      updateControl(true);
    } catch {
      // The card remains usable if the browser cannot start audio; allow retry.
      if (version === playbackVersion) {
        song = null;
        updateControl(false);
      }
    }
  }

  function stopMusic() {
    playbackVersion++;

    if (source) {
      const previousSource = source;
      const previousOutput = output;
      const now = context.currentTime;
      previousOutput.gain.cancelScheduledValues(now);
      previousOutput.gain.setValueAtTime(previousOutput.gain.value, now);
      previousOutput.gain.linearRampToValueAtTime(0, now + 0.06);
      previousSource.stop(now + 0.07);
      previousSource.onended = () => {
        previousSource.disconnect();
        previousOutput.disconnect();
      };
      source = null;
      output = null;
    }

    updateControl(false);
  }

  envelopeToggle.addEventListener('click', event => {
    if (event.defaultPrevented) return;
    if (surprise.open) {
      stopMusic();
    } else if (musicEnabled) {
      // Unlock audio in the gesture, before the native disclosure opens.
      try {
        resumeAudio().catch(() => updateControl(false));
      } catch {
        updateControl(false);
      }
    }
  });

  surprise.addEventListener('toggle', () => {
    // Wait for the actual open state, including when the song is already cached.
    if (!surprise.open) {
      stopMusic();
    } else if (musicEnabled) {
      startMusic();
    }
  });

  musicToggle.addEventListener('click', () => {
    if (source) {
      musicEnabled = false;
      stopMusic();
    } else {
      musicEnabled = true;
      startMusic();
    }
  });

  window.addEventListener('pagehide', stopMusic);
  musicControls.hidden = false;
})();

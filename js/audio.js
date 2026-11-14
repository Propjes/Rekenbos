RB.Sound = (function () {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, delay, dur, type, vol) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    ensure: ensure,
    setMuted: function (m) { muted = m; },
    isMuted: function () { return muted; },
    click: function () { tone(620, 0, 0.08, "triangle", 0.15); },
    correct: function () {
      const n = [523.25, 659.25, 783.99];
      for (let i = 0; i < n.length; i++) tone(n[i], i * 0.09, 0.28, "triangle", 0.22);
    },
    wrong: function () {
      tone(196, 0, 0.28, "sine", 0.16);
      tone(185, 0.06, 0.28, "sine", 0.1);
    },
    unlock: function () {
      const n = [659.25, 783.99, 1046.5, 1318.5];
      for (let i = 0; i < n.length; i++) tone(n[i], i * 0.07, 0.22, "square", 0.07);
    },
    fanfare: function () {
      const n = [392, 523.25, 659.25, 783.99, 1046.5];
      for (let i = 0; i < n.length; i++) tone(n[i], i * 0.11, 0.32, "triangle", 0.2);
    }
  };
})();

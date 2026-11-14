window.RB = window.RB || {};

RB.util = (function () {
  function rand(min, max) {
    return min + Math.random() * (max - min);
  }
  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }
  function dist2D(ax, az, bx, bz) {
    const dx = ax - bx, dz = az - bz;
    return Math.sqrt(dx * dx + dz * dz);
  }
  function load(key, fallback) {
    try {
      const v = window.localStorage.getItem("rekenbos_" + key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try {
      window.localStorage.setItem("rekenbos_" + key, JSON.stringify(value));
    } catch (e) { /* localStorage niet beschikbaar */ }
  }
  return { rand, randInt, pick, shuffle, clamp, dist2D, load, save };
})();

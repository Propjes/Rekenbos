(function () {
  const U = RB.util;

  const ROUNDS = 10;
  const WALK_SPEED = 7;
  const PICK_RADIUS = 2.2;
  const WORLD_R = 50;

  // ---------- renderer / scene ----------
  const holder = document.getElementById("canvasHolder");
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputEncoding = THREE.sRGBEncoding;
  holder.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 5, 12);

  const world = RB.World.build(scene);

  // ---------- opslag ----------
  try {
    window.localStorage.removeItem("rekenbos_costumes");
    window.localStorage.removeItem("rekenbos_equipped");
  } catch (e) { /* localStorage niet beschikbaar */ }
  let unlocked = [];
  let equipped = null;
  let totalStars = U.load("totalStars", 0);

  // ---------- staat ----------
  const state = {
    mode: "start",          // start | playing | ended
    animal: null,           // {group, head, body}
    animalKind: null,
    pos: new THREE.Vector3(0, 0, 0),
    heading: 0,
    bobPhase: 0,
    jumpT: -1,
    round: 0,
    roundId: 0,
    paused: false,
    wasMoving: false,
    sum: null,
    signs: [],
    stars: 0,
    phase: "idle",          // idle | waiting | resolving
    particles: []
  };

  const keys = {};
  let msgTimer = null;

  // ---------- UI refs ----------
  const el = {
    hud: document.getElementById("hud"),
    sumPanel: document.getElementById("sumPanel"),
    roundLabel: document.getElementById("roundLabel"),
    starLabel: document.getElementById("starLabel"),
    message: document.getElementById("message"),
    startScreen: document.getElementById("startScreen"),
    endScreen: document.getElementById("endScreen"),
    costumeScreen: document.getElementById("costumeScreen"),
    costumeGrid: document.getElementById("costumeGrid"),
    endStars: document.getElementById("endStars"),
    endCostumes: document.getElementById("endCostumes"),
    totalStars: document.getElementById("totalStars"),
    muteBtn: document.getElementById("muteBtn")
  };

  function showMessage(text, ms) {
    el.message.textContent = text;
    el.message.classList.remove("hidden");
    el.message.style.opacity = "1";
    if (msgTimer) clearTimeout(msgTimer);
    msgTimer = setTimeout(function () {
      el.message.style.opacity = "0";
      setTimeout(function () { el.message.classList.add("hidden"); }, 300);
    }, ms || 1800);
  }

  function updateHud() {
    el.sumPanel.textContent = state.sum ? state.sum.text : "";
    el.roundLabel.textContent = "Som " + state.round + " van " + ROUNDS;
    el.starLabel.textContent = "⭐ " + state.stars;
  }

  // ---------- bordjes met antwoorden ----------
  function numberTexture(n, disabled) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    g.beginPath(); g.arc(128, 128, 118, 0, Math.PI * 2);
    g.fillStyle = disabled ? "#a89c8c" : "#f0c987";
    g.fill();
    g.lineWidth = 16;
    g.strokeStyle = disabled ? "#6f665c" : "#8b5a2b";
    g.stroke();
    g.fillStyle = disabled ? "#5f574e" : "#4a2c14";
    g.font = "bold 118px 'Comic Sans MS', sans-serif";
    g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(String(n), 128, 136);
    if (disabled) {
      g.strokeStyle = "#c0392b";
      g.lineWidth = 20;
      g.beginPath();
      g.moveTo(58, 58); g.lineTo(198, 198);
      g.moveTo(198, 58); g.lineTo(58, 198);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.anisotropy = 4;
    return t;
  }

  function createSign(number, x, z) {
    const g = new THREE.Group();
    const wood = new THREE.MeshLambertMaterial({ color: 0x7a4a21 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.7, 10), wood);
    post.position.y = 0.85;
    post.castShadow = true;
    g.add(post);
    const tex = numberTexture(number, false);
    const face = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 32),
      new THREE.MeshLambertMaterial({ map: tex })
    );
    face.position.set(0, 1.85, 0.012);
    g.add(face);
    const backFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 32),
      new THREE.MeshLambertMaterial({ map: tex })
    );
    backFace.position.set(0, 1.85, -0.012);
    backFace.rotation.y = Math.PI;
    g.add(backFace);
    g.position.set(x, 0, z);
    g.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(g);
    return { group: g, face: face, backFace: backFace, number: number, active: true, baseX: x, baseZ: z, shake: 0, seed: Math.random() * 10 };
  }

  function removeSigns() {
    for (let i = 0; i < state.signs.length; i++) scene.remove(state.signs[i].group);
    state.signs = [];
  }

  function spawnSigns() {
    removeSigns();
    const options = state.sum.options;
    const spots = [];
    let tries = 0;
    while (spots.length < options.length && tries < 600) {
      tries++;
      const a = U.rand(0, Math.PI * 2), r = U.rand(9, 26);
      const x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (U.dist2D(x, z, state.pos.x, state.pos.z) < 7) continue;
      let ok = true;
      for (let i = 0; i < spots.length; i++) {
        if (U.dist2D(x, z, spots[i].x, spots[i].z) < 7) { ok = false; break; }
      }
      if (!ok) continue;
      for (let j = 0; j < world.colliders.length; j++) {
        const c = world.colliders[j];
        if (U.dist2D(x, z, c.x, c.z) < c.r + 2.2) { ok = false; break; }
      }
      if (ok) spots.push({ x: x, z: z });
    }
    for (let i = 0; i < options.length; i++) {
      const s = spots[i % spots.length];
      state.signs.push(createSign(options[i], s.x, s.z));
    }
  }

  // ---------- sommen ----------
  function nextRound() {
    state.round++;
    state.roundId++;
    state.sum = RB.Sums.generate();
    state.phase = "waiting";
    spawnSigns();
    updateHud();
  }

  function clearRound() {
    removeSigns();
    state.phase = "idle";
  }

  // ---------- deeltjes (sterren bij goed antwoord) ----------
  function starBurst(pos) {
    for (let i = 0; i < 14; i++) {
      const m = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.12, 0),
        new THREE.MeshBasicMaterial({ color: 0xffd94a })
      );
      m.position.copy(pos);
      scene.add(m);
      const a = U.rand(0, Math.PI * 2);
      state.particles.push({
        mesh: m,
        vel: new THREE.Vector3(Math.cos(a) * U.rand(1.5, 4), U.rand(3, 6.5), Math.sin(a) * U.rand(1.5, 4)),
        life: U.rand(0.7, 1.1)
      });
    }
  }

  // ---------- kostuums ----------
  function equipCostume(id) {
    if (!state.animal) return;
    const ud = state.animal.group.userData;
    if (ud.costume) {
      if (ud.costume.parent) ud.costume.parent.remove(ud.costume);
      ud.costume = null;
    }
    const c = RB.Costumes.byId(id);
    if (!c) return;
    const obj = c.build(state.animalKind);
    const anchor = c.on === "head" ? state.animal.head : state.animal.group;
    anchor.add(obj);
    ud.costume = obj;
    equipped = id;
    U.save("equipped", equipped);
  }

  function unlockNextCostume() {
    if (unlocked.length >= RB.Costumes.list.length) return null;
    const c = RB.Costumes.list[unlocked.length];
    unlocked.push(c.id);
    U.save("costumes", unlocked);
    equipCostume(c.id);
    return c;
  }

  function refreshCostumeGrid() {
    el.costumeGrid.innerHTML = "";
    RB.Costumes.list.forEach(function (c) {
      const has = unlocked.indexOf(c.id) !== -1;
      const b = document.createElement("button");
      b.className = "costumeTile" + (has ? "" : " locked") + (equipped === c.id ? " equipped" : "");
      b.innerHTML = '<span class="emoji">' + (has ? c.emoji : "🔒") + "</span>" + c.name;
      if (has) {
        b.addEventListener("click", function () {
          RB.Sound.ensure(); RB.Sound.click();
          equipCostume(c.id);
          refreshCostumeGrid();
        });
      }
      el.costumeGrid.appendChild(b);
    });
  }

  // ---------- goed / fout ----------
  function handleCorrect(sign) {
    state.stars++;
    RB.Sound.correct();
    state.jumpT = 0;
    starBurst(sign.group.position.clone().setY(1.9));
    const c = unlockNextCostume();
    if (c) {
      RB.Sound.unlock();
      showMessage("Goed zo! ⭐ Nieuw kostuum: " + c.emoji + " " + c.name + "!", 2200);
    } else {
      showMessage("Goed zo! ⭐", 1800);
    }
    updateHud();
    const id = state.roundId;
    const wasLast = state.round >= ROUNDS;
    clearRound();
    setTimeout(function () {
      if (id !== state.roundId || state.mode !== "playing") return;
      if (wasLast) endGame();
      else nextRound();
    }, 1500);
  }

  function handleWrong(sign) {
    RB.Sound.wrong();
    sign.active = false;
    sign.shake = 0.5;
    const disabledTex = numberTexture(sign.number, true);
    sign.face.material.map = disabledTex;
    sign.backFace.material.map = disabledTex;
    sign.face.material.needsUpdate = true;
    sign.backFace.material.needsUpdate = true;
    showMessage("Probeer het nog eens! 🍂", 1600);
    state.phase = "waiting";
  }

  function checkSigns() {
    if (state.phase !== "waiting") return;
    for (let i = 0; i < state.signs.length; i++) {
      const s = state.signs[i];
      if (!s.active) continue;
      if (U.dist2D(state.pos.x, state.pos.z, s.baseX, s.baseZ) < PICK_RADIUS) {
        state.phase = "resolving";
        if (s.number === state.sum.answer) handleCorrect(s);
        else handleWrong(s);
        return;
      }
    }
  }

  // ---------- einde ----------
  function endGame() {
    state.mode = "ended";
    state.phase = "idle";
    totalStars += state.stars;
    U.save("totalStars", totalStars);
    RB.Sound.fanfare();
    el.hud.classList.add("hidden");
    el.endStars.textContent = "⭐ " + state.stars + " van de " + ROUNDS + " sterren!";
    let emojis = "";
    for (let i = 0; i < unlocked.length; i++) {
      const c = RB.Costumes.byId(unlocked[i]);
      if (c) emojis += c.emoji + " ";
    }
    el.endCostumes.textContent = unlocked.length
      ? "Je kostuums: " + emojis
      : "Maak sommen goed om kostuums te verdienen!";
    el.endScreen.classList.remove("hidden");
  }

  function startGame(kind, chosenShow, otherShow) {
    state.animalKind = kind;
    if (otherShow) scene.remove(otherShow.group);
    if (chosenShow) {
      state.animal = chosenShow;
      state.animal.group.position.set(0, 0, 0);
    } else {
      const builder = kind === "koala" ? RB.Animals.koala : RB.Animals.eekhoorn;
      state.animal = builder();
      state.animal.group.position.copy(state.pos);
      scene.add(state.animal.group);
    }
    if (equipped) equipCostume(equipped);
    state.mode = "playing";
    state.round = 0;
    state.stars = 0;
    el.startScreen.classList.add("hidden");
    el.endScreen.classList.add("hidden");
    el.hud.classList.remove("hidden");
    nextRound();
    showMessage(kind === "koala" ? "Succes, koala! 🐨" : "Succes, eekhoorn! 🐿️", 1800);
  }

  // ---------- startscherm: beide dieren laten zien ----------
  const koalaShow = RB.Animals.koala();
  koalaShow.group.position.set(-2.4, 0, 0);
  scene.add(koalaShow.group);
  const squirrelShow = RB.Animals.eekhoorn();
  squirrelShow.group.position.set(2.4, 0, 0);
  scene.add(squirrelShow.group);

  // ---------- knoppen ----------
  document.querySelectorAll(".animalBtn[data-animal]").forEach(function (b) {
    b.addEventListener("click", function () {
      RB.Sound.ensure();
      RB.Sound.click();
      const kind = b.getAttribute("data-animal");
      const chosen = kind === "koala" ? koalaShow : squirrelShow;
      const other = kind === "koala" ? squirrelShow : koalaShow;
      startGame(kind, chosen, other);
    });
  });

  let costumeReturn = "start";
  function openCostumes(from) {
    costumeReturn = from;
    RB.Sound.ensure(); RB.Sound.click();
    if (from === "play") state.paused = true;
    refreshCostumeGrid();
    el.costumeScreen.classList.remove("hidden");
    if (from === "start") el.startScreen.classList.add("hidden");
    if (from === "end") el.endScreen.classList.add("hidden");
  }
  document.getElementById("costumeBtnStart").addEventListener("click", function () { openCostumes("start"); });
  document.getElementById("costumeBtnEnd").addEventListener("click", function () { openCostumes("end"); });
  document.getElementById("costumeBtnHud").addEventListener("click", function () { openCostumes("play"); });
  document.getElementById("costumeClose").addEventListener("click", function () {
    RB.Sound.click();
    el.costumeScreen.classList.add("hidden");
    state.paused = false;
    if (costumeReturn === "start") {
      el.startScreen.classList.remove("hidden");
      el.totalStars.textContent = totalStars > 0 ? "⭐ In totaal verdiend: " + totalStars : "";
    } else if (costumeReturn === "end") {
      el.endScreen.classList.remove("hidden");
    }
  });

  document.getElementById("againBtn").addEventListener("click", function () {
    RB.Sound.ensure(); RB.Sound.click();
    el.endScreen.classList.add("hidden");
    el.hud.classList.remove("hidden");
    state.mode = "playing";
    state.round = 0;
    state.stars = 0;
    state.pos.set(0, 0, 0);
    if (state.animal) state.animal.group.position.set(0, 0, 0);
    nextRound();
  });

  el.muteBtn.addEventListener("click", function () {
    RB.Sound.ensure();
    RB.Sound.setMuted(!RB.Sound.isMuted());
    el.muteBtn.textContent = RB.Sound.isMuted() ? "🔇" : "🔊";
  });

  // ---------- toetsen ----------
  window.addEventListener("keydown", function (e) {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].indexOf(k) !== -1) e.preventDefault();
  });
  window.addEventListener("keyup", function (e) { keys[e.key.toLowerCase()] = false; });

  window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  el.totalStars.textContent = totalStars > 0 ? "⭐ In totaal verdiend: " + totalStars : "";

  // ---------- hoofdloop ----------
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    world.update(dt, t);

    if (state.mode === "start") {
      koalaShow.group.rotation.y += dt * 0.35;
      squirrelShow.group.rotation.y += dt * 0.35;
      camera.position.set(Math.sin(t * 0.15) * 11, 5, Math.cos(t * 0.15) * 11);
      camera.lookAt(0, 1.2, 0);
    } else if (state.mode === "playing" && state.animal && !state.paused) {
      const fwd = new THREE.Vector3();
      camera.getWorldDirection(fwd);
      fwd.y = 0;
      fwd.normalize();
      const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();

      let ix = 0, iy = 0;
      if (keys["arrowup"] || keys["w"]) iy += 1;
      if (keys["arrowdown"] || keys["s"]) iy -= 1;
      if (keys["arrowright"] || keys["d"]) ix += 1;
      if (keys["arrowleft"] || keys["a"]) ix -= 1;
      let mx = fwd.x * iy + right.x * ix;
      let mz = fwd.z * iy + right.z * ix;
      const moving = (mx !== 0 || mz !== 0);
      if (moving) {
        const len = Math.sqrt(mx * mx + mz * mz);
        mx /= len; mz /= len;
        state.pos.x += mx * WALK_SPEED * dt;
        state.pos.z += mz * WALK_SPEED * dt;
        const c = world.collide(state.pos.x, state.pos.z);
        state.pos.x = c[0]; state.pos.z = c[1];
        const target = Math.atan2(mx, mz);
        let diff = target - state.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const turnRate = state.wasMoving ? 6.5 : 3.5;
        state.heading += diff * Math.min(1, dt * turnRate);
        state.bobPhase += dt * 12;
      }
      state.wasMoving = moving;

      let y = 0;
      if (moving) y += Math.abs(Math.sin(state.bobPhase)) * 0.09;
      if (state.jumpT >= 0) {
        state.jumpT += dt;
        if (state.jumpT < 0.6) y += Math.sin(Math.PI * state.jumpT / 0.6) * 0.7;
        else state.jumpT = -1;
      }
      state.pos.y = y;
      state.animal.group.position.copy(state.pos);
      state.animal.group.rotation.y = state.heading;

      const desired = new THREE.Vector3(
        state.pos.x - Math.sin(state.heading) * 13,
        state.pos.y + 5.5,
        state.pos.z - Math.cos(state.heading) * 13
      );
      camera.position.lerp(desired, Math.min(1, dt * 4));
      camera.lookAt(state.pos.x, state.pos.y + 1.0, state.pos.z);

      // bordjes: wiebelen + schudden
      for (let i = 0; i < state.signs.length; i++) {
        const s = state.signs[i];
        const fy = 1.85 + Math.sin(t * 2 + s.seed) * 0.05;
        s.face.position.y = fy;
        s.backFace.position.y = fy;
        if (s.shake > 0) {
          s.shake -= dt;
          s.group.position.x = s.baseX + Math.sin(s.shake * 40) * s.shake * 0.35;
          s.group.position.z = s.baseZ;
        } else {
          s.group.position.x = s.baseX;
          s.group.position.z = s.baseZ;
        }
      }

      checkSigns();
    }

    // deeltjes
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.life -= dt;
      p.vel.y -= 6 * dt;
      p.mesh.position.addScaledVector(p.vel, dt);
      p.mesh.scale.setScalar(Math.max(0.01, p.life));
      p.mesh.rotation.x += dt * 5;
      p.mesh.rotation.y += dt * 4;
      if (p.life <= 0) {
        scene.remove(p.mesh);
        state.particles.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
  }

  animate();

  window.RB_DEBUG = { state: state, shows: [koalaShow, squirrelShow], scene: scene, world: world, camera: camera, equip: equipCostume };
})();

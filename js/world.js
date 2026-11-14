RB.World = (function () {
  const U = RB.util;

  const FOLIAGE = [0xd35400, 0xe67e22, 0xf39c12, 0xc0392b, 0xa04000, 0xe74c3c, 0xb7791f, 0x7d9b3a];
  const LEAF = [0xd35400, 0xe67e22, 0xf39c12, 0xc0392b, 0xa04000, 0xe74c3c, 0xd4a017, 0xb7791f];
  const SHRUB = [0x9c4a1a, 0xb85c1e, 0x8a6d2f, 0xa03e2d, 0x7d6b2a];

  function build(scene) {
    const colliders = [];
    const dynamic = []; // objecten met update(dt, t)

    scene.background = new THREE.Color(0xf2cf9f);
    scene.fog = new THREE.Fog(0xf2cf9f, 45, 95);

    const hemi = new THREE.HemisphereLight(0xfff2df, 0x9a7648, 0.95);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffe3b3, 1.15);
    sun.position.set(25, 35, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -50; sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50; sun.shadow.camera.bottom = -50;
    sun.shadow.camera.far = 100;
    scene.add(sun);

    // Grond
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(70, 48),
      new THREE.MeshLambertMaterial({ color: 0xb5893f })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Speetje in het midden (lichtere plek)
    const clearing = new THREE.Mesh(
      new THREE.CircleGeometry(7, 32),
      new THREE.MeshLambertMaterial({ color: 0xc79c5c })
    );
    clearing.rotation.x = -Math.PI / 2;
    clearing.position.y = 0.02;
    clearing.receiveShadow = true;
    scene.add(clearing);

    // Bodem rond de bomen iets donkerder
    for (let i = 0; i < 24; i++) {
      const a = U.rand(0, Math.PI * 2), r = U.rand(6, 48);
      const patch = new THREE.Mesh(
        new THREE.CircleGeometry(U.rand(1.5, 3.5), 12),
        new THREE.MeshLambertMaterial({ color: 0x9c7434 })
      );
      patch.rotation.x = -Math.PI / 2;
      patch.position.set(Math.cos(a) * r, 0.015, Math.sin(a) * r);
      patch.receiveShadow = true;
      scene.add(patch);
    }

    // ---------- Bomen met herfstbladeren ----------
    function tree(x, z) {
      const g = new THREE.Group();
      const h = U.rand(2.4, 3.4);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.42, h, 10),
        new THREE.MeshLambertMaterial({ color: 0x6b4226 })
      );
      trunk.position.y = h / 2;
      trunk.castShadow = true;
      g.add(trunk);
      const blobs = U.randInt(2, 4);
      for (let i = 0; i < blobs; i++) {
        const r = U.rand(1.1, 1.9);
        const blob = new THREE.Mesh(
          new THREE.IcosahedronGeometry(r, 0),
          new THREE.MeshLambertMaterial({ color: U.pick(FOLIAGE) })
        );
        blob.position.set(U.rand(-0.9, 0.9), h + U.rand(0.3, 1.2), U.rand(-0.9, 0.9));
        blob.rotation.set(U.rand(0, 3), U.rand(0, 3), U.rand(0, 3));
        blob.castShadow = true;
        g.add(blob);
      }
      g.position.set(x, 0, z);
      scene.add(g);
      colliders.push({ x: x, z: z, r: 0.9 });
    }
    for (let i = 0; i < 30; i++) {
      const a = U.rand(0, Math.PI * 2);
      const r = U.rand(9, 50);
      tree(Math.cos(a) * r, Math.sin(a) * r);
    }

    // ---------- Struiken ----------
    for (let i = 0; i < 18; i++) {
      const a = U.rand(0, Math.PI * 2), r = U.rand(6, 42);
      const bush = new THREE.Mesh(
        new THREE.SphereGeometry(U.rand(0.6, 1.1), 10, 8),
        new THREE.MeshLambertMaterial({ color: U.pick(SHRUB) })
      );
      bush.scale.y = 0.65;
      bush.position.set(Math.cos(a) * r, 0.35, Math.sin(a) * r);
      bush.castShadow = true;
      scene.add(bush);
    }

    // ---------- Graspolletjes ----------
    const grassGeo = new THREE.ConeGeometry(0.14, 0.55, 6);
    const grassMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const grass = new THREE.InstancedMesh(grassGeo, grassMat, 160);
    const dummy = new THREE.Object3D();
    const grassColors = [0xb5a642, 0xc9a227, 0x9c8f3a, 0xd4b04a];
    for (let i = 0; i < 160; i++) {
      const a = U.rand(0, Math.PI * 2), r = U.rand(2, 48);
      dummy.position.set(Math.cos(a) * r, 0.27, Math.sin(a) * r);
      dummy.rotation.set(U.rand(-0.15, 0.15), U.rand(0, Math.PI * 2), U.rand(-0.15, 0.15));
      dummy.scale.setScalar(U.rand(0.7, 1.4));
      dummy.updateMatrix();
      grass.setMatrixAt(i, dummy.matrix);
      grass.setColorAt(i, new THREE.Color(U.pick(grassColors)));
    }
    grass.instanceMatrix.needsUpdate = true;
    if (grass.instanceColor) grass.instanceColor.needsUpdate = true;
    scene.add(grass);

    // ---------- Paddenstoelen (decoratie) ----------
    const capColors = [0xc0392b, 0xe67e22, 0xd4a017, 0xe74c3c, 0xf5ead6];
    let mushroomCount = 0;
    for (let i = 0; i < 40; i++) {
      mushroomCount++;
      const a = U.rand(0, Math.PI * 2), r = U.rand(4, 44);
      const g = new THREE.Group();
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.09, 0.35, 8),
        new THREE.MeshLambertMaterial({ color: 0xf5ead6 })
      );
      stem.position.y = 0.17;
      stem.castShadow = true;
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshLambertMaterial({ color: U.pick(capColors) })
      );
      cap.position.y = 0.34;
      cap.castShadow = true;
      g.add(stem); g.add(cap);
      g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      g.scale.setScalar(U.rand(0.8, 1.6));
      scene.add(g);
    }

    // ---------- Stenen ----------
    for (let i = 0; i < 10; i++) {
      const a = U.rand(0, Math.PI * 2), r = U.rand(5, 46);
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(U.rand(0.3, 0.8), 0),
        new THREE.MeshLambertMaterial({ color: 0x8d8577 })
      );
      rock.position.set(Math.cos(a) * r, 0.2, Math.sin(a) * r);
      rock.rotation.set(U.rand(0, 3), U.rand(0, 3), U.rand(0, 3));
      rock.castShadow = true;
      scene.add(rock);
    }

    // ---------- Vallende herfstbladeren op de grond ----------
    const groundLeafGeo = new THREE.PlaneGeometry(0.34, 0.34);
    const groundLeafMat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const groundLeaves = new THREE.InstancedMesh(groundLeafGeo, groundLeafMat, 450);
    for (let i = 0; i < 450; i++) {
      const a = U.rand(0, Math.PI * 2), r = U.rand(1, 52);
      dummy.position.set(Math.cos(a) * r, 0.03, Math.sin(a) * r);
      dummy.rotation.set(-Math.PI / 2 + U.rand(-0.12, 0.12), U.rand(0, Math.PI * 2), U.rand(-0.12, 0.12));
      dummy.scale.setScalar(U.rand(0.7, 1.5));
      dummy.updateMatrix();
      groundLeaves.setMatrixAt(i, dummy.matrix);
      groundLeaves.setColorAt(i, new THREE.Color(U.pick(LEAF)));
    }
    groundLeaves.instanceMatrix.needsUpdate = true;
    if (groundLeaves.instanceColor) groundLeaves.instanceColor.needsUpdate = true;
    scene.add(groundLeaves);

    // ---------- Vallende bladeren in de lucht ----------
    const COUNT = 60;
    const fallGeo = new THREE.PlaneGeometry(0.24, 0.24);
    const fallMat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const falling = new THREE.InstancedMesh(fallGeo, fallMat, COUNT);
    const flakes = [];
    for (let i = 0; i < COUNT; i++) {
      flakes.push({
        x: U.rand(-45, 45), y: U.rand(0.5, 14), z: U.rand(-45, 45),
        speed: U.rand(0.5, 1.3), phase: U.rand(0, Math.PI * 2), spin: U.rand(0.5, 2)
      });
      falling.setColorAt(i, new THREE.Color(U.pick(LEAF)));
    }
    if (falling.instanceColor) falling.instanceColor.needsUpdate = true;
    scene.add(falling);

    dynamic.push({
      update: function (dt, t) {
        for (let i = 0; i < COUNT; i++) {
          const f = flakes[i];
          f.y -= f.speed * dt;
          f.x += Math.sin(t * 0.8 + f.phase) * dt * 0.7;
          f.z += Math.cos(t * 0.6 + f.phase) * dt * 0.5;
          if (f.y < 0.05) {
            f.y = U.rand(9, 15);
            f.x = U.rand(-45, 45);
            f.z = U.rand(-45, 45);
          }
          dummy.position.set(f.x, f.y, f.z);
          dummy.rotation.set(t * f.spin + f.phase, f.phase, t * f.spin * 0.7);
          dummy.scale.setScalar(1);
          dummy.updateMatrix();
          falling.setMatrixAt(i, dummy.matrix);
        }
        falling.instanceMatrix.needsUpdate = true;
      }
    });

    // ---------- kleine bosdiertjes: slakjes, egeltjes en vogeltjes ----------
    const critters = [];
    function addCritter(g, cx, cz, r, speed, air, h) {
      const c = {
        g: g, cx: cx, cz: cz, r: r,
        a: U.rand(0, Math.PI * 2), speed: speed,
        phase: U.rand(0, Math.PI * 2),
        air: !!air, h: h || 0, wingL: null, wingR: null
      };
      scene.add(g);
      critters.push(c);
      return c;
    }

    for (let i = 0; i < 4; i++) {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), new THREE.MeshLambertMaterial({ color: 0xa89468 }));
      body.scale.set(1.5, 0.55, 1);
      body.position.y = 0.10;
      body.castShadow = true;
      const shell = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshLambertMaterial({ color: 0x8a6a3a }));
      shell.position.set(-0.05, 0.17, 0);
      shell.castShadow = true;
      const stalkMat = new THREE.MeshLambertMaterial({ color: 0xa89468 });
      const e1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.15, 6), stalkMat);
      const e2 = e1.clone();
      e1.position.set(0.10, 0.22, 0.07);
      e2.position.set(0.10, 0.22, -0.07);
      const eyeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const b1 = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 5), eyeMat);
      const b2 = b1.clone();
      b1.position.set(0.10, 0.30, 0.07);
      b2.position.set(0.10, 0.30, -0.07);
      g.add(body, shell, e1, e2, b1, b2);
      const a0 = U.rand(0, Math.PI * 2), r0 = U.rand(8, 28);
      addCritter(g, Math.cos(a0) * r0, Math.sin(a0) * r0, U.rand(1.5, 3), U.rand(0.05, 0.1));
    }

    for (let i = 0; i < 3; i++) {
      const g = new THREE.Group();
      const spikes = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), new THREE.MeshLambertMaterial({ color: 0x5f4326, flatShading: true }));
      spikes.position.y = 0.26;
      spikes.castShadow = true;
      const skin = new THREE.Mesh(new THREE.SphereGeometry(0.30, 12, 8), new THREE.MeshLambertMaterial({ color: 0xa8845c }));
      skin.position.y = 0.20;
      skin.castShadow = true;
      const snout = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), new THREE.MeshLambertMaterial({ color: 0xc9a876 }));
      snout.position.set(0, 0.16, 0.26);
      const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), new THREE.MeshLambertMaterial({ color: 0x222222 }));
      nose.position.set(0, 0.18, 0.38);
      const eyeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 5), eyeMat);
      const e2 = e1.clone();
      e1.position.set(0.09, 0.24, 0.22);
      e2.position.set(-0.09, 0.24, 0.22);
      g.add(spikes, skin, snout, nose, e1, e2);
      const a0 = U.rand(0, Math.PI * 2), r0 = U.rand(8, 26);
      addCritter(g, Math.cos(a0) * r0, Math.sin(a0) * r0, U.rand(2.5, 5), U.rand(0.08, 0.16));
    }

    for (let i = 0; i < 2; i++) {
      const g = new THREE.Group();
      const color = i === 0 ? 0x4a90d9 : 0xd9534f;
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), new THREE.MeshLambertMaterial({ color: color }));
      body.scale.set(0.9, 0.9, 1.3);
      body.castShadow = true;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), new THREE.MeshLambertMaterial({ color: color }));
      head.position.set(0, 0.07, 0.13);
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.1, 8), new THREE.MeshLambertMaterial({ color: 0xf39c12 }));
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, 0.06, 0.25);
      const eyeMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), eyeMat);
      const e2 = e1.clone();
      e1.position.set(0.05, 0.09, 0.18);
      e2.position.set(-0.05, 0.09, 0.18);
      const wingMat = new THREE.MeshLambertMaterial({ color: color });
      const wgL = new THREE.BoxGeometry(0.22, 0.02, 0.12);
      wgL.translate(-0.11, 0, 0);
      const wgR = new THREE.BoxGeometry(0.22, 0.02, 0.12);
      wgR.translate(0.11, 0, 0);
      const wl = new THREE.Mesh(wgL, wingMat);
      wl.position.set(0.06, 0.05, 0);
      const wr = new THREE.Mesh(wgR, wingMat);
      wr.position.set(-0.06, 0.05, 0);
      g.add(body, head, beak, e1, e2, wl, wr);
      const c = addCritter(g, 0, 0, U.rand(10, 20), U.rand(0.12, 0.25) * (Math.random() < 0.5 ? -1 : 1), true, U.rand(6, 9));
      c.wingL = wl;
      c.wingR = wr;
    }

    dynamic.push({
      update: function (dt, t) {
        for (let i = 0; i < critters.length; i++) {
          const c = critters[i];
          c.a += c.speed * dt;
          const x = c.cx + Math.cos(c.a) * c.r;
          const z = c.cz + Math.sin(c.a) * c.r;
          const s = c.speed >= 0 ? 1 : -1;
          const heading = Math.atan2(-Math.sin(c.a) * s, Math.cos(c.a) * s);
          if (c.air) {
            c.g.position.set(x, c.h + Math.sin(t * 0.7 + c.phase) * 0.5, z);
            const flap = Math.sin(t * 16 + c.phase) * 0.7;
            if (c.wingL) {
              c.wingL.rotation.z = flap;
              c.wingR.rotation.z = -flap;
            }
          } else {
            c.g.position.set(x, 0.02 + Math.abs(Math.sin(t * 6 + c.phase)) * 0.02, z);
          }
          c.g.rotation.y = heading;
        }
      }
    });

    function update(dt, t) {
      for (let i = 0; i < dynamic.length; i++) dynamic[i].update(dt, t);
    }

    function collide(px, pz) {
      // duw de speler uit bomen
      for (let i = 0; i < colliders.length; i++) {
        const c = colliders[i];
        const d = U.dist2D(px, pz, c.x, c.z);
        if (d < c.r + 0.6 && d > 0.0001) {
          const push = (c.r + 0.6 - d) / d;
          px += (px - c.x) * push;
          pz += (pz - c.z) * push;
        }
      }
      const d = Math.sqrt(px * px + pz * pz);
      const maxR = 52;
      if (d > maxR) { px = px / d * maxR; pz = pz / d * maxR; }
      return [px, pz];
    }

    return { update: update, collide: collide, colliders: colliders, creatureCount: critters.length, mushroomCount: mushroomCount };
  }

  return { build: build };
})();

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
    const capColors = [0xc0392b, 0xe67e22, 0xd4a017];
    for (let i = 0; i < 16; i++) {
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

    return { update: update, collide: collide, colliders: colliders };
  }

  return { build: build };
})();

RB.Costumes = (function () {
  function mat(color) {
    return new THREE.MeshLambertMaterial({ color: color });
  }
  function add(parent, geo, color, x, y, z) {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  }

  // on: "head" = attach aan de kop (lokale coördinaten t.o.v. kopcentrum),
  //     "body" = attach aan het lijf (lokale coördinaten t.o.v. grond onder het dier)
  const list = [
    {
      id: "hoed", name: "Pompoenhoedje", emoji: "🎃", on: "head",
      build: function (kind) {
        const k = kind === "koala";
        const g = new THREE.Group();
        const brimY = k ? 0.44 : 0.36;
        const brimR = k ? 0.42 : 0.36;
        add(g, new THREE.CylinderGeometry(brimR, brimR + 0.02, 0.06, 20), 0xd35400, 0, brimY, 0);
        add(g, new THREE.CylinderGeometry(0.24, 0.28, 0.24, 20), 0xe67e22, 0, brimY + 0.12, 0);
        add(g, new THREE.CylinderGeometry(0.04, 0.05, 0.12, 8), 0x5d8a3a, 0, brimY + 0.30, 0);
        return g;
      }
    },
    {
      id: "sjaal", name: "Rode sjaal", emoji: "🧣", on: "head",
      build: function (kind) {
        const k = kind === "koala";
        const g = new THREE.Group();
        const y = k ? -0.38 : -0.30;
        const r = k ? 0.34 : 0.30;
        const t = add(g, new THREE.TorusGeometry(r, 0.10, 10, 20), 0xc0392b, 0, y, 0);
        t.rotation.x = Math.PI / 2;
        const tail = add(g, new THREE.BoxGeometry(0.14, 0.34, 0.06), 0xc0392b, 0.16, y - 0.20, 0.33);
        tail.rotation.z = 0.2;
        return g;
      }
    },
    {
      id: "bril", name: "Zonnebril", emoji: "🕶️", on: "head",
      build: function (kind) {
        const k = kind === "koala";
        const g = new THREE.Group();
        const black = 0x1a1a1a;
        const y = k ? 0.12 : 0.08;
        const z = k ? 0.46 : 0.40;
        const dx = k ? 0.18 : 0.15;
        const w = k ? 0.20 : 0.18;
        const h = k ? 0.14 : 0.12;
        add(g, new THREE.BoxGeometry(w, h, 0.06), black, dx, y, z);
        add(g, new THREE.BoxGeometry(w, h, 0.06), black, -dx, y, z);
        add(g, new THREE.BoxGeometry(0.10, 0.04, 0.05), black, 0, y, z + 0.04);
        return g;
      }
    },
    {
      id: "tas", name: "Rugzakje", emoji: "🎒", on: "body",
      build: function () {
        const g = new THREE.Group();
        add(g, new THREE.BoxGeometry(0.52, 0.56, 0.28), 0x27ae60, 0, 0.82, -0.52);
        add(g, new THREE.BoxGeometry(0.30, 0.22, 0.05), 0x1e8449, 0, 0.72, -0.66);
        return g;
      }
    },
    {
      id: "kroon", name: "Kroontje", emoji: "👑", on: "head",
      build: function (kind) {
        const k = kind === "koala";
        const g = new THREE.Group();
        const baseY = k ? 0.44 : 0.36;
        const r = k ? 0.24 : 0.21;
        add(g, new THREE.CylinderGeometry(r, r + 0.02, 0.16, 16), 0xf1c40f, 0, baseY, 0);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          add(g, new THREE.ConeGeometry(0.05, 0.14, 6), 0xf1c40f, Math.cos(a) * (r - 0.02), baseY + 0.12, Math.sin(a) * (r - 0.02));
        }
        return g;
      }
    },
    {
      id: "strik", name: "Roze strikje", emoji: "🎀", on: "head",
      build: function (kind) {
        const k = kind === "koala";
        const g = new THREE.Group();
        const ax = k ? 0.40 : 0.21;
        const ay = k ? 0.64 : 0.60;
        const az = k ? -0.05 : 0.04;
        const l = add(g, new THREE.ConeGeometry(0.12, 0.22, 8), 0xe84393, ax - 0.10, ay, az + 0.02);
        const r = add(g, new THREE.ConeGeometry(0.12, 0.22, 8), 0xe84393, ax + 0.10, ay, az + 0.02);
        l.rotation.z = 1.2;
        r.rotation.z = -1.2;
        add(g, new THREE.SphereGeometry(0.07, 10, 8), 0xc2185b, ax, ay, az + 0.04);
        return g;
      }
    },
    {
      id: "blad", name: "Herfstblad", emoji: "🍁", on: "head",
      build: function (kind) {
        const k = kind === "koala";
        const g = new THREE.Group();
        const y = k ? 0.50 : 0.42;
        const leaf = add(g, new THREE.SphereGeometry(0.30, 14, 10), 0xe67e22, 0.12, y, 0.02);
        leaf.scale.set(1, 0.18, 0.62);
        leaf.rotation.z = -0.35;
        add(g, new THREE.CylinderGeometry(0.02, 0.03, 0.22, 6), 0x7c4a1e, 0.02, y - 0.04, 0.02).rotation.z = 0.5;
        return g;
      }
    },
    {
      id: "krans", name: "Bladerkrans", emoji: "🍂", on: "head",
      build: function (kind) {
        const k = kind === "koala";
        const g = new THREE.Group();
        const r = k ? 0.50 : 0.42;
        const colors = [0xd35400, 0xe67e22, 0xf39c12, 0xc0392b, 0xa04000];
        const ring = add(g, new THREE.TorusGeometry(r, 0.06, 10, 24), 0x8b4513, 0, 0.05, 0);
        ring.rotation.x = Math.PI / 2 - 0.15;
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          const leaf = add(g, new THREE.SphereGeometry(0.09, 8, 6), colors[i % colors.length],
            Math.cos(a) * r, 0.05 + Math.sin(a) * 0.06, Math.sin(a) * r);
          leaf.scale.set(1, 0.4, 0.7);
        }
        return g;
      }
    }
  ];

  function byId(id) {
    for (let i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  return { list: list, byId: byId };
})();

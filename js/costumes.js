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

  // Elk kostuum bouwt een groep op het dier (oorsprong = grond onder het dier).
  const list = [
    {
      id: "hoed", name: "Pompoenhoedje", emoji: "🎃",
      build: function () {
        const g = new THREE.Group();
        add(g, new THREE.CylinderGeometry(0.42, 0.44, 0.06, 20), 0xd35400, 0, 1.98, 0);   // rand
        add(g, new THREE.CylinderGeometry(0.26, 0.30, 0.24, 20), 0xe67e22, 0, 2.10, 0);   // bol
        add(g, new THREE.CylinderGeometry(0.04, 0.05, 0.12, 8), 0x5d8a3a, 0, 2.26, 0);     // steeltje
        return g;
      }
    },
    {
      id: "sjaal", name: "Rode sjaal", emoji: "🧣",
      build: function () {
        const g = new THREE.Group();
        const t = add(g, new THREE.TorusGeometry(0.33, 0.10, 10, 20), 0xc0392b, 0, 1.10, 0);
        t.rotation.x = Math.PI / 2;
        const tail = add(g, new THREE.BoxGeometry(0.14, 0.34, 0.06), 0xc0392b, 0.16, 0.92, 0.36);
        tail.rotation.z = 0.2;
        return g;
      }
    },
    {
      id: "bril", name: "Zonnebril", emoji: "🕶️",
      build: function () {
        const g = new THREE.Group();
        const black = 0x1a1a1a;
        add(g, new THREE.BoxGeometry(0.20, 0.14, 0.06), black, 0.18, 1.62, 0.42);
        add(g, new THREE.BoxGeometry(0.20, 0.14, 0.06), black, -0.18, 1.62, 0.42);
        add(g, new THREE.BoxGeometry(0.10, 0.04, 0.05), black, 0, 1.62, 0.44);
        return g;
      }
    },
    {
      id: "tas", name: "Rugzakje", emoji: "🎒",
      build: function () {
        const g = new THREE.Group();
        add(g, new THREE.BoxGeometry(0.52, 0.56, 0.28), 0x27ae60, 0, 0.82, -0.52);
        add(g, new THREE.BoxGeometry(0.30, 0.22, 0.05), 0x1e8449, 0, 0.72, -0.66);
        return g;
      }
    },
    {
      id: "kroon", name: "Kroontje", emoji: "👑",
      build: function () {
        const g = new THREE.Group();
        add(g, new THREE.CylinderGeometry(0.24, 0.26, 0.16, 16), 0xf1c40f, 0, 1.98, 0);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          add(g, new THREE.ConeGeometry(0.05, 0.14, 6), 0xf1c40f, Math.cos(a) * 0.22, 2.10, Math.sin(a) * 0.22);
        }
        return g;
      }
    },
    {
      id: "strik", name: "Roze strikje", emoji: "🎀",
      build: function () {
        const g = new THREE.Group();
        const l = add(g, new THREE.ConeGeometry(0.12, 0.22, 8), 0xe84393, 0.40, 1.80, 0.10);
        const r = add(g, new THREE.ConeGeometry(0.12, 0.22, 8), 0xe84393, 0.52, 1.80, 0.10);
        l.rotation.z = 1.2; r.rotation.z = -1.2;
        add(g, new THREE.SphereGeometry(0.07, 10, 8), 0xc2185b, 0.46, 1.80, 0.12);
        return g;
      }
    },
    {
      id: "blad", name: "Herfstblad", emoji: "🍁",
      build: function () {
        const g = new THREE.Group();
        const leaf = add(g, new THREE.SphereGeometry(0.30, 14, 10), 0xe67e22, 0.12, 2.02, 0.02);
        leaf.scale.set(1, 0.18, 0.62);
        leaf.rotation.z = -0.35;
        add(g, new THREE.CylinderGeometry(0.02, 0.03, 0.22, 6), 0x7c4a1e, 0.02, 1.98, 0.02).rotation.z = 0.5;
        return g;
      }
    },
    {
      id: "krans", name: "Bladerkrans", emoji: "🍂",
      build: function () {
        const g = new THREE.Group();
        const colors = [0xd35400, 0xe67e22, 0xf39c12, 0xc0392b, 0xa04000];
        const ring = add(g, new THREE.TorusGeometry(0.50, 0.06, 10, 24), 0x8b4513, 0, 1.55, 0);
        ring.rotation.x = Math.PI / 2 - 0.15;
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * Math.PI * 2;
          const leaf = add(g, new THREE.SphereGeometry(0.09, 8, 6), colors[i % colors.length],
            Math.cos(a) * 0.50, 1.55 + Math.sin(a) * 0.06, Math.sin(a) * 0.50);
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

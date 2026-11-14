RB.Animals = (function () {
  function mat(color) {
    return new THREE.MeshLambertMaterial({ color: color });
  }
  function part(geo, color, x, y, z, parent) {
    const m = new THREE.Mesh(geo, mat(color));
    m.position.set(x, y, z);
    m.castShadow = true;
    parent.add(m);
    return m;
  }

  function buildKoala() {
    const g = new THREE.Group();
    const grey = 0x9aa3ab, light = 0xc9ced4, pink = 0xe8a0a8, black = 0x222222;

    part(new THREE.SphereGeometry(0.55, 24, 18), grey, 0, 0.78, 0, g);            // lijf
    part(new THREE.SphereGeometry(0.42, 20, 14), light, 0, 0.72, 0.22, g);         // buik
    part(new THREE.SphereGeometry(0.20, 14, 10), grey, 0.55, 0.85, 0.08, g);       // armen
    part(new THREE.SphereGeometry(0.20, 14, 10), grey, -0.55, 0.85, 0.08, g);
    part(new THREE.SphereGeometry(0.22, 14, 10), grey, 0.26, 0.22, 0.28, g);       // voeten
    part(new THREE.SphereGeometry(0.22, 14, 10), grey, -0.26, 0.22, 0.28, g);

    const head = new THREE.Group();
    head.position.set(0, 1.5, 0.05);
    g.add(head);
    part(new THREE.SphereGeometry(0.48, 24, 18), grey, 0, 0, 0, head);             // kop
    part(new THREE.SphereGeometry(0.30, 16, 12), grey, 0.40, 0.32, -0.02, head);   // oren
    part(new THREE.SphereGeometry(0.30, 16, 12), grey, -0.40, 0.32, -0.02, head);
    part(new THREE.SphereGeometry(0.17, 12, 8), pink, 0.40, 0.32, 0.16, head);     // binnenkant oren
    part(new THREE.SphereGeometry(0.17, 12, 8), pink, -0.40, 0.32, 0.16, head);
    const nose = part(new THREE.SphereGeometry(0.14, 14, 10), black, 0, -0.02, 0.44, head);
    nose.scale.set(0.8, 1.3, 0.7);
    part(new THREE.SphereGeometry(0.06, 10, 8), black, 0.18, 0.12, 0.42, head);    // ogen
    part(new THREE.SphereGeometry(0.06, 10, 8), black, -0.18, 0.12, 0.42, head);

    return { group: g, head: head, body: g };
  }

  function buildSquirrel() {
    const g = new THREE.Group();
    const brown = 0xa0622d, dark = 0x7c4a1e, light = 0xd9b382, black = 0x222222, pink = 0xe8a0a8;

    part(new THREE.SphereGeometry(0.50, 24, 18), brown, 0, 0.72, 0, g);           // lijf
    part(new THREE.SphereGeometry(0.36, 18, 14), light, 0, 0.68, 0.24, g);         // buik
    part(new THREE.SphereGeometry(0.16, 12, 8), brown, 0.48, 0.78, 0.10, g);      // armen
    part(new THREE.SphereGeometry(0.16, 12, 8), brown, -0.48, 0.78, 0.10, g);
    part(new THREE.SphereGeometry(0.20, 14, 10), dark, 0.24, 0.20, 0.28, g);      // voeten
    part(new THREE.SphereGeometry(0.20, 14, 10), dark, -0.24, 0.20, 0.28, g);

    const tail = part(new THREE.TorusGeometry(0.42, 0.17, 12, 20), dark, 0, 0.95, -0.48, g);
    tail.rotation.x = -0.5;
    part(new THREE.SphereGeometry(0.16, 12, 8), light, 0, 1.38, -0.72, g);        // staartpunt

    const head = new THREE.Group();
    head.position.set(0, 1.38, 0.06);
    g.add(head);
    part(new THREE.SphereGeometry(0.40, 22, 16), brown, 0, 0, 0, head);            // kop
    const earL = part(new THREE.ConeGeometry(0.13, 0.30, 10), brown, 0.20, 0.42, -0.02, head);
    const earR = part(new THREE.ConeGeometry(0.13, 0.30, 10), brown, -0.20, 0.42, -0.02, head);
    earL.rotation.z = -0.15; earR.rotation.z = 0.15;
    part(new THREE.ConeGeometry(0.07, 0.18, 8), pink, 0.20, 0.40, 0.04, head);
    part(new THREE.ConeGeometry(0.07, 0.18, 8), pink, -0.20, 0.40, 0.04, head);
    part(new THREE.SphereGeometry(0.055, 10, 8), black, 0.15, 0.08, 0.36, head);  // ogen
    part(new THREE.SphereGeometry(0.055, 10, 8), black, -0.15, 0.08, 0.36, head);
    part(new THREE.SphereGeometry(0.05, 8, 6), pink, 0, -0.05, 0.40, head);       // neusje

    return { group: g, head: head, body: g };
  }

  return {
    koala: buildKoala,
    eekhoorn: buildSquirrel
  };
})();

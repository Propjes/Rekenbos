# 🍂 Rekenbos 🍁

Een 3D-browsergame voor kinderen in **groep 3** (±6 jaar). Kies een **koala** 🐨 of **eekhoorn** 🐿️, wandel door een kleurrijk **herfstbos** en loop naar het houten bordje met het goede antwoord.

## Spelen

- Dubbelklik `index.html` (werkt direct, geen installatie), óf start een lokale server:
  ```bash
  python3 -m http.server 8000
  ```
  en open daarna http://localhost:8000
- Beweeg met de **pijltjestoetsen** of **WASD**.
- Boven in beeld zie je de som (bijv. `7 + 5 = ?`). In het bos staan drie bordjes met getallen — loop naar het bordje met het **goede antwoord**.
- Goed antwoord: een ⭐ ster, een vrolijk geluidje en een **nieuw kostuum** (pompoenhoedje, sjaal, zonnebril, rugzakje, kroontje, strikje, herfstblad of bladerkrans). Fout antwoord: probeer het gewoon nog eens bij een ander bordje.
- Met de **🍁-knop rechtsonder** (tijdens het spelen, maar ook op het start- en eindscherm) open je het kostuummenu. Daar kies je uit de kostuums die je **al gewonnen hebt**; de rest staat vergrendeld (🔒). Tijdens het menu pauzeert het spel even.
- Na 10 sommen zie je een eindscherm met je sterren en kostuums. **Kostuums beginnen elke keer fris**: bij het opstarten van het spel worden gewonnen kostuums automatisch gewist. Alleen de sterrenteller wordt bewaard (localStorage). Handmatig resetten kan via de console: `localStorage.removeItem('rekenbos_totalStars')`.

## Sommen (groep 3-niveau)

- Alleen **optellen en aftrekken** met **hele getallen**.
- Operanden én uitkomst liggen altijd tussen **0 en 20** (aftrekken nooit onder nul).
- Per som verschijnen 3 antwoordbordjes: het goede antwoord plus 2 plausible afleiders (binnen 0–20).

## Techniek

- [Three.js](https://threejs.org) r149 (lokaal in `vendor/three.min.js`, dus het spel werkt offline), plain HTML/CSS/JS, geen build-stap.
- Geluidjes worden live gemaakt met WebAudio (`js/audio.js`), er zijn geen geluidsbestanden nodig.
- Bestandsstructuur:
  - `index.html` — schermen en HUD
  - `css/style.css` — opmaak
  - `js/core.js` — helpers (random, opslag)
  - `js/sums.js` — somgeneratie
  - `js/animals.js` — koala en eekhoorn (gebaut uit 3D-vormen)
  - `js/costumes.js` — kostuums
  - `js/world.js` — het herfstbos (bomen, struiken, paddenstoelen, vallende bladeren)
  - `js/game.js` — spellogica, camera, answering

## Aanpasbaar

In `js/game.js` bovenaan: `ROUNDS` (aantal sommen per spel), `WALK_SPEED`, `PICK_RADIUS`.
In `js/sums.js`: de regels voor de sommen (nu: 0–20, hele getallen).

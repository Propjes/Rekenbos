RB.Sums = (function () {
  const U = RB.util;

  // Groep 3: hele getallen, optellen en aftrekken, operanden en uitkomst in 0..20.
  function generate() {
    const plus = Math.random() < 0.5;
    let a, b, op, answer;
    if (plus) {
      a = U.randInt(0, 20);
      b = U.randInt(0, 20 - a);
      op = "+";
      answer = a + b;
    } else {
      a = U.randInt(0, 20);
      b = U.randInt(0, a);
      op = "−";
      answer = a - b;
    }
    const options = new Set([answer]);
    while (options.size < 3) {
      const d = answer + U.randInt(-3, 3);
      if (d !== answer && d >= 0 && d <= 20) options.add(d);
    }
    return {
      a: a,
      b: b,
      op: op,
      answer: answer,
      text: a + " " + op + " " + b + " = ?",
      options: U.shuffle(Array.from(options))
    };
  }

  return { generate: generate };
})();

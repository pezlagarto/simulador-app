function factorial(n) {
  if (n < 0) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i += 1) r *= i;
  return r;
}

export function calcularMMC(lam, mu, c, horasDia) {
  if (![lam, mu, c, horasDia].every(Number.isFinite)) return null;
  if (lam <= 0 || mu <= 0 || c <= 0 || horasDia <= 0) return null;

  const a = lam / mu;
  const rho = lam / (c * mu);

  if (rho >= 1) return null;

  let suma = 0;
  for (let n = 0; n < c; n += 1) {
    suma += Math.pow(a, n) / factorial(n);
  }

  const terminoFinal = Math.pow(a, c) / (factorial(c) * (1 - rho));
  const P0 = 1 / (suma + terminoFinal);

  const Lq = (P0 * Math.pow(a, c) * rho) / (factorial(c) * Math.pow(1 - rho, 2));
  const L = Lq + a;
  const Wq = Lq / lam;
  const W = Wq + (1 / mu);
  const tiempoPerdidoMin = Lq * horasDia * 60;

  const P = [];
  for (let n = 0; n <= 10; n += 1) {
    let pn;
    if (n < c) {
      pn = (Math.pow(a, n) / factorial(n)) * P0;
    } else {
      pn = (Math.pow(a, n) / (factorial(c) * Math.pow(c, n - c))) * P0;
    }
    P.push(pn);
  }

  return {
    modelo: "mmc",
    Lq,
    L,
    Wq,
    W,
    P0,
    utilizacion: rho,
    tiempoPerdidoMin,
    P,
    lambdaEfectiva: lam,
    servidores: c
  };
}
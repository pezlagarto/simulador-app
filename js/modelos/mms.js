function factorial(n) {
  if (n < 0) return NaN;
  let r = 1;
  for (let i = 2; i <= n; i += 1) r *= i;
  return r;
}

export function calcularMMS(lam, mu, s, horasDia) {
  if (![lam, mu, s, horasDia].every(Number.isFinite)) return null;
  if (lam <= 0 || mu <= 0 || s <= 0 || horasDia <= 0) return null;

  const a = lam / mu;
  const rho = lam / (s * mu);

  if (rho >= 1) return null;

  let suma = 0;
  for (let n = 0; n < s; n += 1) {
    suma += Math.pow(a, n) / factorial(n);
  }

  const terminoFinal = Math.pow(a, s) / (factorial(s) * (1 - rho));
  const P0 = 1 / (suma + terminoFinal);

  const Lq = (P0 * Math.pow(a, s) * rho) / (factorial(s) * Math.pow(1 - rho, 2));
  const L = Lq + a;
  const Wq = Lq / lam;
  const W = Wq + (1 / mu);
  const tiempoPerdidoMin = Lq * horasDia * 60;

  const P = [];
  for (let n = 0; n <= 10; n += 1) {
    let pn;
    if (n < s) {
      pn = (Math.pow(a, n) / factorial(n)) * P0;
    } else {
      pn = (Math.pow(a, n) / (factorial(s) * Math.pow(s, n - s))) * P0;
    }
    P.push(pn);
  }

  return {
    modelo: "mms",
    Lq,
    L,
    Wq,
    W,
    P0,
    utilizacion: rho,
    tiempoPerdidoMin,
    P,
    lambdaEfectiva: lam,
    servidores: s
  };
}
export function calcularMM1(lam, mu, horasDia) {
  if (![lam, mu, horasDia].every(Number.isFinite)) return null;
  if (lam <= 0 || mu <= 0 || horasDia <= 0) return null;
  if (lam >= mu) return null;

  const rho = lam / mu;
  const P0 = 1 - rho;
  const Lq = (rho * rho) / (1 - rho);
  const L = rho / (1 - rho);
  const Wq = Lq / lam;
  const W = 1 / (mu - lam);
  const tiempoPerdidoMin = Lq * horasDia * 60;

  const P = [];
  for (let n = 0; n <= 10; n += 1) {
    P.push(P0 * Math.pow(rho, n));
  }

  return {
    modelo: "mm1",
    Lq,
    L,
    Wq,
    W,
    P0,
    utilizacion: rho,
    tiempoPerdidoMin,
    P,
    lambdaEfectiva: lam,
    servidores: 1
  };
}
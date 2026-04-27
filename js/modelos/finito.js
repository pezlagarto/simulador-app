export function calcularFinito(N, s, lam, mu, horasDia) {
  if (![N, s, lam, mu, horasDia].every(Number.isFinite)) return null;
  if (N <= 0 || s <= 0 || lam <= 0 || mu <= 0 || horasDia <= 0) return null;
  if (s > N) return null;

  const lambda_n = [];
  const mu_n = [];
  const coef = new Array(N + 1).fill(0);
  const P = new Array(N + 1).fill(0);

  for (let n = 0; n <= N; n += 1) {
    lambda_n.push((N - n) * lam);
    mu_n.push(Math.min(n, s) * mu);
  }

  coef[0] = 1;

  for (let n = 1; n <= N; n += 1) {
    coef[n] = mu_n[n] === 0 ? 0 : coef[n - 1] * (lambda_n[n - 1] / mu_n[n]);
  }

  const suma = coef.reduce((acc, val) => acc + val, 0);
  const P0 = suma !== 0 ? 1 / suma : 0;

  for (let n = 0; n <= N; n += 1) {
    P[n] = coef[n] * P0;
  }

  let Lq = 0;
  let L = 0;
  let servidoresOcupados = 0;
  let lambdaEfectiva = 0;

  for (let n = 0; n <= N; n += 1) {
    const enCola = Math.max(0, n - s);
    Lq += enCola * P[n];
    L += n * P[n];
    servidoresOcupados += Math.min(n, s) * P[n];
    lambdaEfectiva += lambda_n[n] * P[n];
  }

  const Wq = lambdaEfectiva > 0 ? Lq / lambdaEfectiva : 0;
  const W = lambdaEfectiva > 0 ? L / lambdaEfectiva : 0;
  const utilizacion = s > 0 ? servidoresOcupados / s : 0;
  const tiempoPerdidoMin = Lq * horasDia * 60;

  // Probabilidad de espera
  let sumaEspera = 0;

  for (let n = s; n <= N; n += 1) {
    const lambdaEstado = (N - n) * lam;
    sumaEspera += lambdaEstado * P[n];
  }

  const probEspera = lambdaEfectiva > 0 ? sumaEspera / lambdaEfectiva : 0;

  console.log("Probabilidad de espera:", probEspera);

  return {
    modelo: "finito",
    Lq,
    L,
    Wq,
    W,
    P0,
    utilizacion,
    tiempoPerdidoMin,
    P,
    lambdaEfectiva,
    servidores: s,
    N,
    probEspera
  };
}
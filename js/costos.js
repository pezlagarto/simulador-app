export function calcularCostos(resultado, horas, costoEspera, costoTerminal, servidores) {
  const costoEsperaDiario = resultado.Lq * horas * costoEspera;
  const costoTerminalDiario = servidores * costoTerminal;
  const costoTotal = costoEsperaDiario + costoTerminalDiario;

  return {
    costoEsperaDiario,
    costoTerminalDiario,
    costoTotal
  };
}

export function evaluarConfiguracionesOptimas({
  N,
  lam,
  mu,
  horas,
  costoEspera,
  costoTerminal,
  calcularFinito
}) {
  const resultados = [];

  for (let s = 1; s <= N; s += 1) {
    const res = calcularFinito(N, s, lam, mu, horas);
    if (!res) continue;

    const costoEsperaDiario = res.Lq * horas * costoEspera;
    const costoTerminalDiario = s * costoTerminal;
    const costoTotal = costoEsperaDiario + costoTerminalDiario;

    resultados.push({
      s,
      Lq: res.Lq,
      Wq: res.Wq,
      costoEsperaDiario,
      costoTerminalDiario,
      costoTotal
    });
  }

  resultados.sort((a, b) => a.costoTotal - b.costoTotal);
  return resultados;
}
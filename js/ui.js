import { calcularMM1 } from "./modelos/mm1.js";
import { calcularMMS } from "./modelos/mms.js";
import { calcularMMC } from "./modelos/mmc.js";
import { calcularFinito } from "./modelos/finito.js";

import { calcularCostos, evaluarConfiguracionesOptimas } from "./costos.js";
import { renderizarGraficos, destruirGraficos } from "./charts.js";

let debounceTimer = null;
let statusTimer = null;

function formatearNumero(valor, decimales = 4) {
  return Number(valor).toFixed(decimales);
}

function formatearMoneda(valor) {
  return `$${Number(valor).toFixed(2)}`;
}

function setStatus(texto, activo = false) {
  const chip = document.getElementById("statusChip");
  if (!chip) return;

  chip.textContent = texto;
  chip.classList.toggle("active", activo);
}

function programarEstadoListo() {
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    setStatus("Listo", false);
  }, 900);
}

function obtenerValores() {
  return {
    modelo: document.getElementById("modelo")?.value || "finito",
    N: parseInt(document.getElementById("N")?.value, 10),
    s: parseInt(document.getElementById("s")?.value, 10),
    lam: parseFloat(document.getElementById("lam")?.value),
    mu: parseFloat(document.getElementById("mu")?.value),
    horas: parseFloat(document.getElementById("horas")?.value),
    costoEspera: parseFloat(document.getElementById("costoEspera")?.value) || 0,
    costoTerminal: parseFloat(document.getElementById("costoTerminal")?.value) || 0
  };
}

function actualizarTextosModelo(modelo) {
  const badge = document.getElementById("badgeModelo");
  const title = document.getElementById("mainTitle");
  const subtitle = document.getElementById("mainSubtitle");
  const tags = document.getElementById("heroTags");
  const miniBadge = document.getElementById("miniBadgeModelo");
  const descText = document.getElementById("descText");

  const infoModelo = document.getElementById("infoModelo");
  const infoServidores = document.getElementById("infoServidores");
  const infoEntrada = document.getElementById("infoEntrada");
  const infoServicio = document.getElementById("infoServicio");
  const infoCondicion = document.getElementById("infoCondicion");
  const infoCapacidad = document.getElementById("infoCapacidad");

  const cardN = document.getElementById("cardN");
  const cardS = document.getElementById("cardS");
  const optimizationSection = document.getElementById("optimizationSection");
  const labelCostoServidor = document.getElementById("labelCostoServidor");
  const labelCostoSistema = document.getElementById("labelCostoSistema");

  if (!badge || !title || !subtitle || !tags || !miniBadge || !descText) return;

  title.textContent = "Simulador de teoría de cola";
  badge.textContent = "Teoría de cola · Simulador interactivo";

  if (modelo === "mm1") {
    subtitle.textContent = "Modelo M/M/1 con llegadas Poisson, servicio exponencial y un servidor.";
    tags.innerHTML = `
      <span>1 servidor</span>
      <span>Cola infinita</span>
      <span>λ &lt; μ</span>
    `;
    miniBadge.textContent = "M/M/1";
    descText.textContent = "Sistema con un solo servidor y tiempos de llegada y servicio aleatorios.";

    if (infoModelo) infoModelo.textContent = "M/M/1";
    if (infoServidores) infoServidores.textContent = "1";
    if (infoEntrada) infoEntrada.textContent = "Infinita";
    if (infoServicio) infoServicio.textContent = "Exponencial";
    if (infoCondicion) infoCondicion.textContent = "λ < μ";
    if (infoCapacidad) infoCapacidad.textContent = "Infinita";

    cardN?.classList.add("is-hidden");
    cardS?.classList.add("is-hidden");
    optimizationSection?.classList.add("is-hidden");
    if (labelCostoServidor) labelCostoServidor.textContent = "Costo por servidor por día";
    if (labelCostoSistema) labelCostoSistema.textContent = "Costo de servidores";
    return;
  }

  if (modelo === "mms") {
    subtitle.textContent = "Modelo M/M/s con múltiples servidores y cola infinita.";
    tags.innerHTML = `
      <span>Múltiples servidores</span>
      <span>Cola infinita</span>
      <span>λ &lt; sμ</span>
    `;
    miniBadge.textContent = "M/M/s";
    descText.textContent = "Sistema con varios servidores en paralelo y comportamiento tipo Erlang C.";

    if (infoModelo) infoModelo.textContent = "M/M/s";
    if (infoServidores) infoServidores.textContent = "Múltiples";
    if (infoEntrada) infoEntrada.textContent = "Infinita";
    if (infoServicio) infoServicio.textContent = "Exponencial";
    if (infoCondicion) infoCondicion.textContent = "λ < sμ";
    if (infoCapacidad) infoCapacidad.textContent = "Infinita";

    cardN?.classList.add("is-hidden");
    cardS?.classList.remove("is-hidden");
    optimizationSection?.classList.add("is-hidden");
    if (labelCostoServidor) labelCostoServidor.textContent = "Costo por servidor por día";
    if (labelCostoSistema) labelCostoSistema.textContent = "Costo de servidores";
    return;
  }

  if (modelo === "mmc") {
    subtitle.textContent = "Modelo M/M/c con varios canales de servicio.";
    tags.innerHTML = `
      <span>c servidores</span>
      <span>Cola infinita</span>
      <span>λ &lt; cμ</span>
    `;
    miniBadge.textContent = "M/M/c";
    descText.textContent = "Sistema con varios canales de atención y distribución exponencial.";

    if (infoModelo) infoModelo.textContent = "M/M/c";
    if (infoServidores) infoServidores.textContent = "Múltiples";
    if (infoEntrada) infoEntrada.textContent = "Infinita";
    if (infoServicio) infoServicio.textContent = "Exponencial";
    if (infoCondicion) infoCondicion.textContent = "λ < cμ";
    if (infoCapacidad) infoCapacidad.textContent = "Infinita";

    cardN?.classList.add("is-hidden");
    cardS?.classList.remove("is-hidden");
    optimizationSection?.classList.add("is-hidden");
    if (labelCostoServidor) labelCostoServidor.textContent = "Costo por servidor por día";
    if (labelCostoSistema) labelCostoSistema.textContent = "Costo de servidores";
    return;
  }

  subtitle.textContent = "Modelo de población finita para analizar espera, utilización y costos.";
  tags.innerHTML = `
    <span>Población finita</span>
    <span>Varios servidores</span>
    <span>s ≤ N</span>
  `;
  miniBadge.textContent = "Población finita";
  descText.textContent = "Sistema con número limitado de clientes fuente y servidores compartidos.";

  if (infoModelo) infoModelo.textContent = "Población finita";
  if (infoServidores) infoServidores.textContent = "Variables";
  if (infoEntrada) infoEntrada.textContent = "Población limitada";
  if (infoServicio) infoServicio.textContent = "Exponencial";
  if (infoCondicion) infoCondicion.textContent = "s ≤ N";
  if (infoCapacidad) infoCapacidad.textContent = "Finita";

  cardN?.classList.remove("is-hidden");
  cardS?.classList.remove("is-hidden");
  optimizationSection?.classList.remove("is-hidden");
  if (labelCostoServidor) labelCostoServidor.textContent = "Costo por servidor por día";
  if (labelCostoSistema) labelCostoSistema.textContent = "Costo de servidores";
}

function actualizarTablas(resultado) {
  const metricasBody = document.querySelector("#metricasTable tbody");
  const probBody = document.querySelector("#probTable tbody");

  if (!metricasBody || !probBody) return;

  if (resultado.modelo === "mm1") {
    metricasBody.innerHTML = `
      <tr><td>Modelo</td><td>M/M/1</td></tr>
      <tr><td>Utilización (ρ)</td><td>${formatearNumero(resultado.utilizacion, 4)}</td></tr>
      <tr><td>Probabilidad de sistema vacío (P0)</td><td>${formatearNumero(resultado.P0, 4)}</td></tr>
      <tr><td>Número promedio en cola (Lq)</td><td>${formatearNumero(resultado.Lq)}</td></tr>
      <tr><td>Número promedio en sistema (L)</td><td>${formatearNumero(resultado.L)}</td></tr>
      <tr><td>Tiempo promedio en cola (Wq)</td><td>${formatearNumero(resultado.Wq)} h</td></tr>
      <tr><td>Tiempo promedio en sistema (W)</td><td>${formatearNumero(resultado.W)} h</td></tr>
    `;
  } else if (resultado.modelo === "mms") {
    metricasBody.innerHTML = `
      <tr><td>Modelo</td><td>M/M/s</td></tr>
      <tr><td>Servidores</td><td>${resultado.servidores}</td></tr>
      <tr><td>Utilización (ρ)</td><td>${formatearNumero(resultado.utilizacion, 4)}</td></tr>
      <tr><td>Probabilidad de sistema vacío (P0)</td><td>${formatearNumero(resultado.P0, 4)}</td></tr>
      <tr><td>Número promedio en cola (Lq)</td><td>${formatearNumero(resultado.Lq)}</td></tr>
      <tr><td>Número promedio en sistema (L)</td><td>${formatearNumero(resultado.L)}</td></tr>
      <tr><td>Tiempo promedio en cola (Wq)</td><td>${formatearNumero(resultado.Wq)} h</td></tr>
      <tr><td>Tiempo promedio en sistema (W)</td><td>${formatearNumero(resultado.W)} h</td></tr>
    `;
  } else if (resultado.modelo === "mmc") {
    metricasBody.innerHTML = `
      <tr><td>Modelo</td><td>M/M/c</td></tr>
      <tr><td>Canales</td><td>${resultado.servidores}</td></tr>
      <tr><td>Utilización (ρ)</td><td>${formatearNumero(resultado.utilizacion, 4)}</td></tr>
      <tr><td>Probabilidad de sistema vacío (P0)</td><td>${formatearNumero(resultado.P0, 4)}</td></tr>
      <tr><td>Número promedio en cola (Lq)</td><td>${formatearNumero(resultado.Lq)}</td></tr>
      <tr><td>Número promedio en sistema (L)</td><td>${formatearNumero(resultado.L)}</td></tr>
      <tr><td>Tiempo promedio en cola (Wq)</td><td>${formatearNumero(resultado.Wq)} h</td></tr>
      <tr><td>Tiempo promedio en sistema (W)</td><td>${formatearNumero(resultado.W)} h</td></tr>
    `;
  } else {
    metricasBody.innerHTML = `
      <tr><td>Modelo</td><td>Población finita</td></tr>
      <tr><td>Población (N)</td><td>${resultado.N}</td></tr>
      <tr><td>Servidores (s)</td><td>${resultado.servidores}</td></tr>
      <tr><td>Número promedio en cola (Lq)</td><td>${formatearNumero(resultado.Lq)}</td></tr>
      <tr><td>Número promedio en sistema (L)</td><td>${formatearNumero(resultado.L)}</td></tr>
      <tr><td>Tiempo promedio en cola (Wq)</td><td>${formatearNumero(resultado.Wq)} h</td></tr>
      <tr><td>Tiempo promedio en sistema (W)</td><td>${formatearNumero(resultado.W)} h</td></tr>
      <tr><td>Utilización</td><td>${formatearNumero(resultado.utilizacion * 100, 2)}%</td></tr>
      <tr><td>Tasa efectiva</td><td>${formatearNumero(resultado.lambdaEfectiva, 4)} req/h</td></tr>
    `;
  }

  probBody.innerHTML = resultado.P
    .map((valor, i) => `<tr><td>Estado ${i}</td><td>${formatearNumero(valor)}</td></tr>`)
    .join("");
}

function actualizarInterpretacion(resultado) {
  const interpretation = document.getElementById("interpretation");
  const quickSummary = document.getElementById("quickSummary");

  if (!interpretation || !quickSummary) return;

  if (resultado.utilizacion < 0.2) {
    interpretation.textContent =
      "El sistema presenta baja carga. La espera es mínima y existe capacidad disponible.";
  } else if (resultado.utilizacion < 0.8) {
    interpretation.textContent =
      "El sistema tiene una utilización moderada. Funciona bien, aunque la espera puede crecer si aumenta la demanda.";
  } else {
    interpretation.textContent =
      "El sistema tiene alta utilización. Está cerca de saturarse y puede generar congestión.";
  }

  quickSummary.textContent =
    `Lq=${formatearNumero(resultado.Lq)} | Wq=${formatearNumero(resultado.Wq)} h | Utilización=${formatearNumero(resultado.utilizacion * 100, 2)}%`;
}

function actualizarCostosEnVista(costos) {
  const espera = document.getElementById("costoEsperaResult");
  const terminal = document.getElementById("costoTerminalResult");
  const total = document.getElementById("costoTotalResult");

  if (espera) espera.textContent = formatearMoneda(costos.costoEsperaDiario);
  if (terminal) terminal.textContent = formatearMoneda(costos.costoTerminalDiario);
  if (total) total.textContent = formatearMoneda(costos.costoTotal);
}

function limpiarResultados(mensaje = "Corrige los valores para mostrar resultados.") {
  const ids = [
    "lqResult",
    "timeResult",
    "wqResult",
    "utilResult",
    "costoEsperaResult",
    "costoTerminalResult",
    "costoTotalResult",
    "optimoS",
    "costoMinimo",
    "ahorro"
  ];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = "--";
  });

  const interpretation = document.getElementById("interpretation");
  const quickSummary = document.getElementById("quickSummary");
  const tablaOptimos = document.getElementById("tablaOptimos");
  const metricasBody = document.querySelector("#metricasTable tbody");
  const probBody = document.querySelector("#probTable tbody");
  const optimizacionResumen = document.getElementById("optimizacionResumen");

  if (interpretation) interpretation.textContent = mensaje;
  if (quickSummary) {
    quickSummary.textContent = "El modelo se actualiza automáticamente cuando cambias cualquier dato.";
  }
  if (tablaOptimos) tablaOptimos.innerHTML = "";
  if (metricasBody) metricasBody.innerHTML = "";
  if (probBody) probBody.innerHTML = "";
  if (optimizacionResumen) {
    optimizacionResumen.textContent = "Aquí aparecerá la mejor configuración según el costo total.";
  }

  destruirGraficos();
}

function actualizarOptimizacion(valores) {
  const { modelo, N, lam, mu, horas, costoEspera, costoTerminal, s } = valores;
  const optimoS = document.getElementById("optimoS");
  const costoMinimo = document.getElementById("costoMinimo");
  const ahorro = document.getElementById("ahorro");
  const tablaOptimos = document.getElementById("tablaOptimos");
  const optimizacionResumen = document.getElementById("optimizacionResumen");

  if (!optimoS || !costoMinimo || !ahorro || !tablaOptimos || !optimizacionResumen) return;

  if (modelo !== "finito") {
    optimoS.textContent = "--";
    costoMinimo.textContent = "--";
    ahorro.textContent = "--";
    tablaOptimos.innerHTML = "";
    optimizacionResumen.textContent = "La optimización automática solo está activa para población finita.";
    return;
  }

  const resultados = evaluarConfiguracionesOptimas({
    N,
    lam,
    mu,
    horas,
    costoEspera,
    costoTerminal,
    calcularFinito
  });

  if (!resultados.length) {
    optimoS.textContent = "--";
    costoMinimo.textContent = "--";
    ahorro.textContent = "--";
    tablaOptimos.innerHTML = "";
    optimizacionResumen.textContent = "No hay configuraciones válidas para optimizar.";
    return;
  }

  const mejor = resultados[0];
  const actual = resultados.find((item) => item.s === s);

  optimoS.textContent = mejor.s;
  costoMinimo.textContent = formatearMoneda(mejor.costoTotal);
  ahorro.textContent = actual
    ? formatearMoneda(Math.max(0, actual.costoTotal - mejor.costoTotal))
    : "--";

  tablaOptimos.innerHTML = resultados
    .map((r) => `
      <tr ${r.s === mejor.s ? 'style="background: rgba(141, 246, 202, 0.10);"' : ""}>
        <td>${r.s}</td>
        <td>${formatearNumero(r.Lq)}</td>
        <td>${formatearNumero(r.Wq)}</td>
        <td>${formatearMoneda(r.costoEsperaDiario)}</td>
        <td>${formatearMoneda(r.costoTerminalDiario)}</td>
        <td>${formatearMoneda(r.costoTotal)}</td>
      </tr>
    `)
    .join("");

  optimizacionResumen.textContent =
    `La mejor configuración es ${mejor.s} servidor(es), con un costo mínimo de ${formatearMoneda(mejor.costoTotal)} por día.`;
}

function calcularSegunModelo(valores) {
  const { modelo, N, s, lam, mu, horas } = valores;

  if (![lam, mu, horas].every(Number.isFinite)) {
    return { error: "Completa todos los campos numéricos." };
  }

  if (lam <= 0 || mu <= 0 || horas <= 0) {
    return { error: "Todos los valores deben ser mayores que 0." };
  }

  if (modelo === "mm1") {
    const res = calcularMM1(lam, mu, horas);
    if (!res) return { error: "En M/M/1 debe cumplirse λ < μ." };
    return { resultado: res, servidoresUsados: 1 };
  }

  if (modelo === "mms") {
    if (!Number.isFinite(s) || s <= 0) return { error: "En M/M/s, s debe ser mayor que 0." };
    const res = calcularMMS(lam, mu, s, horas);
    if (!res) return { error: "En M/M/s debe cumplirse λ < sμ." };
    return { resultado: res, servidoresUsados: s };
  }

  if (modelo === "mmc") {
    if (!Number.isFinite(s) || s <= 0) return { error: "En M/M/c, c debe ser mayor que 0." };
    const res = calcularMMC(lam, mu, s, horas);
    if (!res) return { error: "En M/M/c debe cumplirse λ < cμ." };
    return { resultado: res, servidoresUsados: s };
  }

  if (![N, s].every(Number.isFinite)) {
    return { error: "Completa N y s." };
  }

  if (N <= 0 || s <= 0) {
    return { error: "N y s deben ser mayores que 0." };
  }

  if (s > N) {
    return { error: "s no puede ser mayor que N." };
  }

  const res = calcularFinito(N, s, lam, mu, horas);
  if (!res) return { error: "No se pudo calcular el modelo finito." };

  return { resultado: res, servidoresUsados: s };
}

function actualizarResultados(mostrarFeedback = true) {
  const valores = obtenerValores();

  // 🔥 CONTROLAR VISIBILIDAD
  const bloqueProb = document.getElementById("bloqueProbEspera");
  const bloqueCond = document.getElementById("bloqueCondicion");

  if (valores.modelo === "finito") {
    if (bloqueProb) bloqueProb.style.display = "block";
    if (bloqueCond) bloqueCond.style.display = "block";
  } else {
    if (bloqueProb) bloqueProb.style.display = "none";
    if (bloqueCond) bloqueCond.style.display = "none";
  }

  
  actualizarTextosModelo(valores.modelo);

  const { resultado, servidoresUsados, error } = calcularSegunModelo(valores);

  if (error) {
    limpiarResultados(error);
    setStatus("Revisa datos", false);
    return;
  }

  const lqResult = document.getElementById("lqResult");
  const timeResult = document.getElementById("timeResult");
  const wqResult = document.getElementById("wqResult");
  const utilResult = document.getElementById("utilResult");

  if (lqResult) lqResult.textContent = formatearNumero(resultado.Lq);
  if (timeResult) timeResult.textContent = `${formatearNumero(resultado.tiempoPerdidoMin, 2)} min`;
  if (wqResult) wqResult.textContent = `${formatearNumero(resultado.Wq)} h`;
  if (utilResult) utilResult.textContent = `${formatearNumero(resultado.utilizacion * 100, 2)}%`;

  // NUEVO: probabilidad de espera y condición
  const probEsperaEl = document.getElementById("probEsperaResult");
  const cumpleEl = document.getElementById("cumpleResult");

  if (probEsperaEl) {
    if (resultado.probEspera !== undefined) {
      probEsperaEl.textContent = `${(resultado.probEspera * 100).toFixed(2)}%`;
    } else {
      probEsperaEl.textContent = "No aplica";
    }
  }

  if (cumpleEl) {
    if (resultado.probEspera !== undefined) {
      if (resultado.probEspera <= 0.5) {
        cumpleEl.textContent = "✔ Cumple";
        cumpleEl.style.color = "#4ade80";
      } else {
        cumpleEl.textContent = "❌ No cumple";
        cumpleEl.style.color = "#f87171";
      }
    } else {
      cumpleEl.textContent = "--";
      cumpleEl.style.color = "";
    }
  }

  actualizarInterpretacion(resultado);

  const costos = calcularCostos(
    resultado,
    valores.horas,
    valores.costoEspera,
    valores.costoTerminal,
    servidoresUsados
  );

  actualizarCostosEnVista(costos);
  actualizarTablas(resultado);

  destruirGraficos();
  renderizarGraficos(resultado);

  actualizarOptimizacion(valores);

  if (mostrarFeedback) {
    setStatus("Actualizado", true);
    programarEstadoListo();
  } else {
    setStatus("Listo", false);
  }
}

function recalculoAutomatico() {
  clearTimeout(debounceTimer);
  clearTimeout(statusTimer);

  setStatus("Actualizando...", false);

  debounceTimer = setTimeout(() => {
    actualizarResultados(false);
  }, 350);
}

function sincronizarInputYRange(inputId, rangeId, valueId, decimales = 0) {
  const input = document.getElementById(inputId);
  const range = document.getElementById(rangeId);
  const value = document.getElementById(valueId);

  if (!input || !range || !value) return;

  const actualizarVista = (val) => {
    value.textContent = Number(val).toFixed(decimales);
  };

  range.addEventListener("input", () => {
    input.value = range.value;
    actualizarVista(range.value);
    recalculoAutomatico();
  });

  input.addEventListener("input", () => {
    const val = parseFloat(input.value);
    if (Number.isNaN(val)) return;

    const min = parseFloat(input.min);
    const max = parseFloat(input.max);

    let normalizado = val;
    if (!Number.isNaN(min) && normalizado < min) normalizado = min;
    if (!Number.isNaN(max) && normalizado > max) normalizado = max;

    input.value = normalizado;
    range.value = normalizado;
    actualizarVista(normalizado);
    recalculoAutomatico();
  });

  actualizarVista(input.value);
}

function conectarEventos() {
  sincronizarInputYRange("N", "NRange", "NValue", 0);
  sincronizarInputYRange("s", "sRange", "sValue", 0);
  sincronizarInputYRange("lam", "lamRange", "lamValue", 1);
  sincronizarInputYRange("mu", "muRange", "muValue", 1);
  sincronizarInputYRange("horas", "horasRange", "horasValue", 0);
  sincronizarInputYRange("costoEspera", "costoEsperaRange", "costoEsperaValue", 0);
  sincronizarInputYRange("costoTerminal", "costoTerminalRange", "costoTerminalValue", 0);

  const modelo = document.getElementById("modelo");
  if (modelo) {
    modelo.addEventListener("change", () => {
      actualizarResultados(true);
    });
  }
}

function configurarTema() {
  const switchTema = document.getElementById("themeSwitch");
  const icono = document.getElementById("themeIcon");

  if (!switchTema || !icono) return;

  const temaGuardado = localStorage.getItem("tema");

  if (temaGuardado === "light") {
    document.body.classList.add("light-theme");
    switchTema.checked = true;
    icono.textContent = "🌞";
  } else {
    document.body.classList.remove("light-theme");
    switchTema.checked = false;
    icono.textContent = "🌙";
  }

  switchTema.addEventListener("change", () => {
    if (switchTema.checked) {
      document.body.classList.add("light-theme");
      localStorage.setItem("tema", "light");
      icono.textContent = "🌞";
    } else {
      document.body.classList.remove("light-theme");
      localStorage.setItem("tema", "dark");
      icono.textContent = "🌙";
    }
  // 🔄 solo refresca gráficos, no todo
  const valores = obtenerValores();
  const { resultado } = calcularSegunModelo(valores);

  if (resultado) {
    destruirGraficos();
    renderizarGraficos(resultado);
  }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  conectarEventos();
  configurarTema();
  actualizarResultados(false);
});
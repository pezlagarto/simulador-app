let metricasChart = null;
let probChart = null;

function obtenerColoresTema() {
  const textoColor =
    getComputedStyle(document.body).getPropertyValue("--text").trim() || "#ffffff";
  const gridColor =
    getComputedStyle(document.body).getPropertyValue("--border").trim() || "rgba(255,255,255,0.08)";

  return { textoColor, gridColor };
}

export function destruirGraficos() {
  if (metricasChart) {
    metricasChart.destroy();
    metricasChart = null;
  }

  if (probChart) {
    probChart.destroy();
    probChart = null;
  }
}

export function renderizarGraficos(resultado) {
  const canvasMetricas = document.getElementById("metricasChart");
  const canvasProb = document.getElementById("probChart");

  if (!canvasMetricas || !canvasProb) return;

  destruirGraficos();

  const { textoColor, gridColor } = obtenerColoresTema();
  const estados = resultado.P.map((_, i) => `Estado ${i}`);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        labels: {
          color: textoColor,
          font: { size: 12, weight: "bold" }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: textoColor },
        grid: { color: gridColor }
      },
      y: {
        beginAtZero: true,
        ticks: { color: textoColor },
        grid: { color: gridColor }
      }
    }
  };

  metricasChart = new Chart(canvasMetricas, {
    type: "bar",
    data: {
      labels: ["Lq", "L", "Wq(min)", "W(min)", "Util %", "P0"],
      datasets: [{
        label: "Métricas",
        data: [
          resultado.Lq,
          resultado.L,
          resultado.Wq * 60,
          resultado.W * 60,
          resultado.utilizacion * 100,
          resultado.P0
        ],
        backgroundColor: [
          "rgba(93, 145, 255, 0.8)",
          "rgba(105, 227, 255, 0.82)",
          "rgba(141, 246, 202, 0.82)",
          "rgba(255, 199, 106, 0.85)",
          "rgba(140, 246, 202, 0.70)",
          "rgba(180, 145, 255, 0.75)"
        ],
        borderWidth: 2,
        borderRadius: 10
      }]
    },
    options: commonOptions
  });

  probChart = new Chart(canvasProb, {
    type: "line",
    data: {
      labels: estados,
      datasets: [{
        label: "Probabilidades P(n)",
        data: resultado.P,
        borderColor: "#69e3ff",
        backgroundColor: "rgba(105, 227, 255, 0.2)",
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#69e3ff",
        pointRadius: 4,
        tension: 0.35,
        fill: true,
        borderWidth: 3
      }]
    },
    options: commonOptions
  });
}
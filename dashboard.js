// ==========================================================
// DASHBOARD ÉTICA SOCIAL – MULTIEMPRESA + EDICIÓN + PDF
// ==========================================================
console.log("✅ Dashboard Ética Social cargado correctamente");

// ================= RESPONSABLES POR EMPRESA =================
const responsablesPorEmpresa = {
  RAPEL: {
    "POOL TAMAYO RODRIGUEZ": ["EL PAPAYO", "LIMONES"],
    "FLOR PULACHE VIERA": ["LOS OLIVARES"],
    "SERGIO VIERA GIRON": ["SAN VICENTE"],
    "YHANELLY LUZON VENEGAS": ["ALGARROBOS"],
    "ALEXANDER MARTINEZ JUAREZ": ["APROA"],
    "ROBERTO MOLERO": ["PLANTA RAPEL"]
  },
  VERFRUT: {
    "ALEX ZAPATA SUÁREZ": ["PUNTA ARENAS"],
    "ELBER CASTRO BAYONA": ["SANTA ROSA", "SANTA ROSA II"],
    "ALEX TINEO RAMOS": ["OLIVARES BAJO"]
  }
};

const TOTAL_META = 12;

// ================= DASHBOARD GENERAL =================
function generarDashboard() {
  const data = JSON.parse(localStorage.getItem("etica_sesiones_2026") || "[]");
  if (!data.length) {
    alert("No hay registros para mostrar el avance.");
    return;
  }

  const empresa = document.getElementById("empresa")?.value || "RAPEL";
  const responsables = responsablesPorEmpresa[empresa];

  const modal = document.getElementById("dashboardModal");
  const cont = document.getElementById("contenidoDashboard");
  modal.classList.remove("hidden");
  cont.innerHTML = "";

  const mesSeleccionado =
    document.getElementById("mesFiltro")?.value || "2026-02";

  // ===== RESUMEN =====
  const resumen = {};
  Object.entries(responsables).forEach(([nombre, sectores]) => {
    resumen[nombre] = {
      sectores,
      CAP: 0,
      CHK: 0,
      REF: 0,
      total: 0,
      porcentaje: 0,
      estado: "Pendiente"
    };
  });

  const dataFiltrada = data.filter(s =>
    s.empresa === empresa &&
    s.fecha?.slice(0, 7) === mesSeleccionado
  );

  dataFiltrada.forEach(s => {
    const responsable = Object.keys(resumen).find(n =>
      resumen[n].sectores.includes(s.sector)
    );
    if (!responsable) return;
    resumen[responsable][s.actividad]++;
    resumen[responsable].total++;
  });

  Object.values(resumen).forEach(r => {
    r.porcentaje = Math.round((r.total / TOTAL_META) * 100);
    r.estado =
      r.porcentaje >= 75 ? "🟢 Al día" :
      r.porcentaje >= 40 ? "🟡 En seguimiento" :
      "🔴 Retrasado";
  });

  // ===== HTML =====
  let html = `
  <div class="dashboard-header">
    <h2>📊 Avance ${empresa}</h2>
    <div class="acciones-superior">
      <button class="btn-secundario" onclick="cerrarDashboard()">⬅ Volver</button>
      <button class="btn-secundario" onclick="exportarPDF()">📄 PDF</button>
    </div>
  </div>

  <div class="filtro-mes">
    <label>Mes:</label>
    <input type="month" id="mesFiltro" value="${mesSeleccionado}">
    <button class="btn-principal" onclick="generarDashboard()">🔁 Actualizar</button>
  </div>

  <table class="tabla-avance">
    <thead>
      <tr>
        <th>Responsable</th><th>Sectores</th>
        <th>CAP</th><th>CHK</th><th>REF</th>
        <th>Total</th><th>%</th><th>Estado</th>
      </tr>
    </thead><tbody>`;

  Object.entries(resumen).forEach(([nombre, r]) => {
    html += `
    <tr class="fila-responsable" data-resp="${nombre}">
      <td class="link">${nombre}</td>
      <td>${r.sectores.join(" / ")}</td>
      <td>${r.CAP}</td>
      <td>${r.CHK}</td>
      <td>${r.REF}</td>
      <td>${r.total}</td>
      <td>${r.porcentaje}%</td>
      <td>${r.estado}</td>
    </tr>`;
  });

  html += `
  </tbody></table>

  <canvas id="graficoCircular"></canvas>
  <canvas id="graficoPorcentaje"></canvas>

  <div id="detalleResponsable" class="modal hidden"></div>`;

  cont.innerHTML = html;

  document.querySelectorAll(".fila-responsable").forEach(f =>
    f.addEventListener("click", () =>
      mostrarDetalleResponsable(
        f.dataset.resp,
        dataFiltrada,
        resumen,
        empresa
      )
    )
  );

  setTimeout(() => dibujarGraficos(resumen), 200);
}

// ================= GRÁFICOS =================
function dibujarGraficos(resumen) {
  const nombres = Object.keys(resumen);

  new Chart(document.getElementById("graficoCircular"), {
    type: "doughnut",
    data: {
      labels: ["CAP", "CHK", "REF"],
      datasets: [{
        data: [
          nombres.reduce((a,n)=>a+resumen[n].CAP,0),
          nombres.reduce((a,n)=>a+resumen[n].CHK,0),
          nombres.reduce((a,n)=>a+resumen[n].REF,0)
        ],
        backgroundColor:["#fff176","#66bb6a","#d7a77a"]
      }]
    }
  });

  new Chart(document.getElementById("graficoPorcentaje"), {
    type: "bar",
    data: {
      labels: nombres,
      datasets: [{
        label:"% Cumplimiento",
        data: nombres.map(n=>resumen[n].porcentaje),
        backgroundColor: nombres.map(n =>
          resumen[n].porcentaje>=75?"#66bb6a":
          resumen[n].porcentaje>=40?"#ffd54f":"#ef5350")
      }]
    },
    options:{scales:{y:{max:100,beginAtZero:true}}}
  });
}

// ================= DETALLE EDITABLE =================
function mostrarDetalleResponsable(nombre, data, resumen, empresa) {
  const modal = document.getElementById("detalleResponsable");
  const info = resumen[nombre];
  const sesiones = data.filter(s => info.sectores.includes(s.sector));

  modal.classList.remove("hidden");
  modal.innerHTML = `
  <div class="panel-modal">
    <h3>${nombre}</h3>
    <table class="tabla-detalle">
      <thead>
        <tr>
          <th>Fecha</th><th>Actividad</th><th>Sector</th>
          <th>Cumpl.</th><th>Cant.</th><th>Obs.</th>
        </tr>
      </thead><tbody>
      ${sesiones.map(s=>`
        <tr>
          <td>${s.fecha}</td>
          <td>${s.actividad}</td>
          <td>${s.sector}</td>
          <td>
            <select data-fecha="${s.fecha}" data-sector="${s.sector}" data-campo="cumplimiento">
              <option value="CUMPLIDO" ${s.cumplimiento==="CUMPLIDO"?"selected":""}>CUMPLIDO</option>
              <option value="NO_CUMPLIDO" ${s.cumplimiento==="NO_CUMPLIDO"?"selected":""}>NO_CUMPLIDO</option>
              <option value="PENDIENTE" ${s.cumplimiento==="PENDIENTE"?"selected":""}>PENDIENTE</option>
            </select>
          </td>
          <td><input type="number" data-fecha="${s.fecha}" data-sector="${s.sector}"
              data-campo="cantidadCapacitados" value="${s.cantidadCapacitados||0}"></td>
          <td><input data-fecha="${s.fecha}" data-sector="${s.sector}"
              data-campo="observaciones" value="${s.observaciones||""}"></td>
        </tr>`).join("")}
      </tbody>
    </table>
    <button class="btn-secundario" onclick="cerrarDetalle()">Cerrar</button>
  </div>`;

  modal.querySelectorAll("select, input").forEach(el=>{
    el.addEventListener("change",()=>{
      actualizarCampo(
        el.dataset.fecha,
        el.dataset.sector,
        el.dataset.campo,
        el.value,
        empresa
      );
    });
  });
}

// ================= ACTUALIZAR =================
function actualizarCampo(fecha, sector, campo, valor, empresa) {
  let data = JSON.parse(localStorage.getItem("etica_sesiones_2026") || "[]");
  data.forEach(s=>{
    if(s.fecha===fecha && s.sector===sector && s.empresa===empresa){
      s[campo]=valor;
    }
  });
  localStorage.setItem("etica_sesiones_2026", JSON.stringify(data));
  generarDashboard();
}

// ================= CIERRES =================
function cerrarDetalle(){
  document.getElementById("detalleResponsable").classList.add("hidden");
}
function cerrarDashboard(){
  document.getElementById("dashboardModal").classList.add("hidden");
}
function exportarPDF(){
  html2pdf().from(document.getElementById("contenidoDashboard")).save();
}

// ====== GLOBAL ======
window.generarDashboard = generarDashboard;
window.cerrarDashboard = cerrarDashboard;
window.exportarPDF = exportarPDF;
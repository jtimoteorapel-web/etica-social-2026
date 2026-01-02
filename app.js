const API = null;  // modo DEMO: sin conexión al backend
// ============================================
// MODO DEMO CON PERSISTENCIA + RESPALDO AUTO
// Sistema Ética Social – Verfrut / Rapel 2026
// ============================================
console.log("Sistema Ética Social – MODO DEMO COMPLETO");

// ================= VARIABLES =================
let sesiones = []; // registros locales
let sectores = [
  "EL PAPAYO","LIMONES","LOS OLIVARES","SAN VICENTE",
  "ALGARROBOS","APROA","PLANTA RAPEL",
  "PUNTA ARENAS","SANTA ROSA","SANTA ROSA II","OLIVARES BAJO"
];
let empresas = ["RAPEL","VERFRUT"];

const STORAGE_KEY = "etica_sesiones_2026";
const BACKUP_KEY  = "etica_backup_2026";

const $ = s => document.querySelector(s);
const headDias = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

// ================= LOGIN DEMO =================
$("#btnLogin").onclick = () => {
  const user = $("#u").value.trim();
  const pass = $("#p").value.trim();

  if (!user || !pass) {
    alert("Ingrese usuario y contraseña.");
    return;
  }

  const usuariosDemo = ["joel","jorge","olga"];
  if (!usuariosDemo.includes(user.toLowerCase())) {
    alert("Usuario no registrado.");
    return;
  }

  $("#login").classList.add("hidden");
  $("#app").classList.remove("hidden");
  $("#userBox").textContent = `Conectado como: ${user.toUpperCase()}`;

  cargaCatalogos();
  cargarLocal();
  verificarBackupAutomatico();
  pintaCalendario(new Date($("#mes").value + "-01"));
};

// ================= CATÁLOGOS =================
function cargaCatalogos(){
  $("#empresa").innerHTML = empresas.map(e=>`<option value="${e}">${e}</option>`).join("");
  $("#f_sector").innerHTML = sectores.map(s=>`<option value="${s}">${s}</option>`).join("");
}

// ================= BOTONES =================
$("#btnCarga").onclick = () =>
  pintaCalendario(new Date($("#mes").value + "-01"));

$("#btnCSV").onclick = exportarCSV;
$("#f_guardar").onclick = guardarSesion;

// ================= REGISTRO =================
function guardarSesion(){
  const sesion = {
    empresa: $("#empresa").value,
    sector: $("#f_sector").value,
    fecha: $("#f_fecha").value,
    actividad: $("#f_actividad").value,
    horaInicio: $("#f_hi").value,
    horaFin: $("#f_hf").value,
    cumplimiento: $("#f_cump").value,
    enviadoEnFecha: $("#f_env").checked,
    cantidadCapacitados: parseInt($("#f_cant").value || "0"),
    area: $("#f_area").value,
    rutaOCodigo: $("#f_ruta").value,
    observaciones: $("#f_obs").value,
    motivoRetraso: $("#f_mot").value
  };

  if (!sesion.fecha || !sesion.sector || !sesion.actividad) {
    alert("Complete fecha, sector y actividad.");
    return;
  }

  // Evitar duplicados
  sesiones = sesiones.filter(s =>
    !(s.fecha === sesion.fecha &&
      s.sector === sesion.sector &&
      s.actividad === sesion.actividad &&
      s.empresa === sesion.empresa)
  );

  sesiones.push(sesion);
  guardarLocal();

  alert("✅ Sesión registrada correctamente.");
  pintaCalendario(new Date($("#mes").value + "-01"));
  limpiarFormulario();
}

// ================= LOCAL STORAGE =================
function guardarLocal(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sesiones));
}

function cargarLocal(){
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) sesiones = JSON.parse(data);
}

// ================= UTILIDADES =================
function limpiarFormulario(){
  ["#f_fecha","#f_area","#f_ruta","#f_obs","#f_mot"].forEach(id=>{
    const el = document.querySelector(id);
    if (el) el.value = "";
  });
  $("#f_cant").value = "";
  $("#f_env").checked = false;
}

function rangoMes(fecha0){
  const y = fecha0.getFullYear(), m = fecha0.getMonth();
  return {
    first: new Date(y, m, 1),
    last : new Date(y, m + 1, 0)
  };
}

function pintaCabeceras(){
  headDias.forEach(d=>{
    const h = document.createElement("div");
    h.className = "celda";
    h.innerHTML = `<strong>${d}</strong>`;
    $("#calendario").appendChild(h);
  });
}

function htmlItem(s){
  const clase =
    s.actividad === "CAP" ? "cap" :
    s.actividad === "CHK" ? "chk" : "ref";
  return `<span class="item ${clase}">${s.actividad} – ${s.sector}</span>`;
}

// ================= CALENDARIO =================
function pintaCalendario(fecha0){
  $("#calendario").innerHTML = "";
  pintaCabeceras();

  const { first, last } = rangoMes(fecha0);
  const offset = (first.getDay() + 6) % 7;

  for(let i=0;i<offset;i++){
    $("#calendario").appendChild(document.createElement("div"));
  }

  for(let d=1; d<=last.getDate(); d++){
    const div = document.createElement("div");
    div.className = "celda";

    const date = new Date(first.getFullYear(), first.getMonth(), d);
    const iso  = date.toISOString().slice(0,10);

    div.innerHTML = `<span class="dia">${d}</span>`;

    sesiones
      .filter(s => s.fecha === iso)
      .forEach(s => div.innerHTML += htmlItem(s));

    $("#calendario").appendChild(div);
  }
}

// ================= EXPORTAR CSV =================
function exportarCSV(nombre="sesiones_etica_social.csv"){
  if (sesiones.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  const encabezados = Object.keys(sesiones[0]);
  const filas = sesiones.map(o =>
    encabezados.map(k => `"${o[k] ?? ""}"`).join(",")
  );

  const contenido = [encabezados.join(","), ...filas].join("\n");
  const blob = new Blob([contenido], { type:"text/csv;charset=utf-8" });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();

  URL.revokeObjectURL(url);
}

// ================= RESPALDO AUTO =================
function verificarBackupAutomatico(){
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const ultimo = JSON.parse(localStorage.getItem(BACKUP_KEY) || "{}");

  if (!ultimo.mes || ultimo.mes !== mesActual) {
    generarBackupAutomatico(mesActual);
  }
}

function generarBackupAutomatico(mes){
  if (sesiones.length === 0) return;

  const nombre = `backup_etica_${String(mes).padStart(2,"0")}_2026.csv`;
  exportarCSV(nombre);
  localStorage.setItem(BACKUP_KEY, JSON.stringify({ mes }));
}

// ================= DASHBOARD LINK =================
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnDashboard");
  if (btn) {
    btn.addEventListener("click", () => {
      if (typeof generarDashboard === "function") {
        generarDashboard();
      } else {
        alert("Dashboard no cargado.");
      }
    });
  }
});
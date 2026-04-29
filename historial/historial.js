"use strict";

/* ============================================================
   historial.js — Techos Rojos · Sakura POS
   Compatible con historial.html (versión limpia sin merge)
   ============================================================ */

// ─── ESTADO ───────────────────────────────
let historial = [];
let filtroEstado = "todos";
let filtroBusqueda = "";
let pedidoActivo = null;

// ─── DATOS DEMO ───────────────────────────
// Se cargan solo si localStorage está vacío
const DEMO_DATA = [
  {
    id: "B-0021",
    tipo: "mesa",
    mesa: "Mesa 3",
    items: [
      { name: "Tonkotsu Ramen", qty: 2, price: 11.0 },
      { name: "Gyoza x4", qty: 1, price: 8.5 },
      { name: "Matcha Latte", qty: 2, price: 4.5 },
    ],
    cajero: "Laura M.",
    hora: "15:42",
    fecha: fechaHoy(),
    estado: "cobrado",
  },
  {
    id: "B-0020",
    tipo: "domicilio",
    mesa: "—",
    items: [
      { name: "Sushi California", qty: 3, price: 6.0 },
      { name: "Sopa Miso", qty: 1, price: 4.5 },
    ],
    cajero: "Andrés G.",
    hora: "15:18",
    fecha: fechaHoy(),
    estado: "cobrado",
  },
  {
    id: "B-0019",
    tipo: "rapido",
    mesa: "—",
    items: [
      { name: "Ramen Miso", qty: 1, price: 11.5 },
      { name: "Dorayaki", qty: 2, price: 4.0 },
      { name: "Sake Frío", qty: 1, price: 7.0 },
    ],
    cajero: "Mariana R.",
    hora: "14:55",
    fecha: fechaHoy(),
    estado: "pendiente",
  },
  {
    id: "B-0018",
    tipo: "mesa",
    mesa: "Mesa 1",
    items: [
      { name: "Yakitori Combo", qty: 1, price: 13.0 },
      { name: "Té Genmaicha", qty: 2, price: 3.5 },
    ],
    cajero: "Carlos V.",
    hora: "14:30",
    fecha: fechaHoy(),
    estado: "cobrado",
  },
  {
    id: "B-0017",
    tipo: "domicilio",
    mesa: "—",
    items: [
      { name: "Spicy Tantan", qty: 1, price: 13.0 },
      { name: "Mochi Helado", qty: 2, price: 5.0 },
    ],
    cajero: "Laura M.",
    hora: "14:05",
    fecha: fechaHoy(),
    estado: "cancelado",
  },
  {
    id: "B-0016",
    tipo: "rapido",
    mesa: "—",
    items: [
      { name: "Shoyu Ramen", qty: 1, price: 11.0 },
      { name: "Ebi Tempura Roll", qty: 1, price: 9.0 },
      { name: "Sake Frío", qty: 1, price: 7.0 },
    ],
    cajero: "Andrés G.",
    hora: "13:40",
    fecha: fechaHoy(),
    estado: "cobrado",
  },
  {
    id: "B-0015",
    tipo: "mesa",
    mesa: "Mesa 5",
    items: [
      { name: "Bento Salmon", qty: 2, price: 12.5 },
      { name: "Ensalada Wakame", qty: 2, price: 6.0 },
      { name: "Refresco", qty: 3, price: 3.5 },
    ],
    cajero: "Mariana R.",
    hora: "13:10",
    fecha: fechaHoy(),
    estado: "cobrado",
  },
];

// ─── HELPERS ──────────────────────────────
function fechaHoy() {
  return new Date().toISOString().slice(0, 10);
}

function fmt(n) {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function calcSubtotal(items) {
  return items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
}

function calcTotal(items) {
  return calcSubtotal(items) * 1.1;
}

function labelTipo(tipo) {
  return (
    { mesa: "Mesa", domicilio: "Domicilio", rapido: "Rápido" }[tipo] || tipo
  );
}

function colorTipo(tipo) {
  return (
    { mesa: "#ff8c42", domicilio: "#4caf50", rapido: "#E94E2E" }[tipo] || "#888"
  );
}

function labelEstado(estado) {
  return (
    { cobrado: "Cobrado", pendiente: "Pendiente", cancelado: "Cancelado" }[
      estado
    ] || estado
  );
}

function resumen(items) {
  return items.map((i) => i.name + (i.qty > 1 ? " x" + i.qty : "")).join(" · ");
}

// ─── PERSISTENCIA ─────────────────────────
function cargarHistorial() {
  let data = JSON.parse(localStorage.getItem("historial_data") || "null");

  // Si no hay datos guardados → usar demo
  if (!data || data.length === 0) {
    data = DEMO_DATA;
    localStorage.setItem("historial_data", JSON.stringify(data));
  }

  // Importar último pedido de Rápido si existe y no está ya en el historial
  try {
    const rapido = JSON.parse(localStorage.getItem("akane_order"));
    if (rapido && rapido.id && !data.some((p) => p.id === rapido.id)) {
      data.unshift({
        id: rapido.id,
        tipo: "rapido",
        mesa: "—",
        items: (rapido.items || []).map((i) => ({
          name: i.name,
          qty: i.qty || 1,
          price: i.price || 0,
        })),
        cajero: rapido.cashier || "—",
        hora: new Date(rapido.time || Date.now()).toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        fecha: fechaHoy(),
        estado: "cobrado",
      });
      localStorage.setItem("historial_data", JSON.stringify(data));
    }
  } catch (_) {}

  historial = data;
}

function guardarHistorial() {
  localStorage.setItem("historial_data", JSON.stringify(historial));
}

// API pública para que otros módulos registren pedidos
window.registrarPedidoHistorial = function (pedido) {
  const data = JSON.parse(localStorage.getItem("historial_data") || "[]");
  if (!data.some((p) => p.id === pedido.id)) {
    data.unshift(pedido);
    localStorage.setItem("historial_data", JSON.stringify(data));
  }
};

// ─── FILTRADO ─────────────────────────────
function filtrarHistorial() {
  const inicio = document.getElementById("filterFechaInicio").value; // 'YYYY-MM-DD' o ''
  const fin = document.getElementById("filterFechaFin").value;

  return historial.filter((p) => {
    // Filtro por rango de fechas (solo si se seleccionó alguna)
    if (inicio && p.fecha < inicio) return false;
    if (fin && p.fecha > fin) return false;

    // Filtro por estado
    if (filtroEstado !== "todos" && p.estado !== filtroEstado) return false;

    // Búsqueda libre
    if (filtroBusqueda) {
      const q = filtroBusqueda.toLowerCase();
      const txt = [
        p.id,
        p.tipo,
        p.mesa,
        p.cajero,
        ...p.items.map((i) => i.name),
      ]
        .join(" ")
        .toLowerCase();
      if (!txt.includes(q)) return false;
    }

    return true;
  });
}

// ─── STATS ────────────────────────────────
function actualizarStats() {
  const hoy = fechaHoy();
  // Stats siempre sobre TODOS los pedidos de hoy (sin importar el filtro activo)
  const hoyData = historial.filter(
    (p) => p.fecha === hoy && p.estado !== "cancelado",
  );

  const ventas = hoyData.reduce((s, p) => s + calcTotal(p.items), 0);
  const nMesas = hoyData.filter((p) => p.tipo === "mesa").length;
  const nDomicilios = hoyData.filter((p) => p.tipo === "domicilio").length;
  const promedio = hoyData.length > 0 ? ventas / hoyData.length : 0;

  document.getElementById("statVentasVal").textContent = fmt(ventas);
  document.getElementById("statMesasVal").textContent = nMesas;
  document.getElementById("statDomiciliosVal").textContent = nDomicilios;
  document.getElementById("statPromedioVal").textContent = fmt(promedio);
}

// ─── RENDER TABLA ─────────────────────────
function render() {
  const body = document.getElementById("tableBody");
  const filtrados = filtrarHistorial();

  body.innerHTML = "";

  if (filtrados.length === 0) {
    body.innerHTML = `
      <div class="no-results">
        <span class="no-results-icon">🔍</span>
        Sin resultados para esta búsqueda
      </div>`;
    return;
  }

  filtrados.forEach((p, idx) => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.style.animationDelay = idx * 35 + "ms";

    const labelEstadoStr = labelEstado(p.estado);
    const resumenStr = resumen(p.items);
    const totalStr = fmt(calcTotal(p.items));
    const color = colorTipo(p.tipo);
    const nombreTipo = p.mesa && p.mesa !== "—" ? p.mesa : labelTipo(p.tipo);

    row.innerHTML = `
      <span class="row-id">${p.id}</span>
      <span class="row-fecha">${p.fecha || "—"}</span>
      <span class="row-items" title="${resumenStr}">${resumenStr}</span>
      <span class="row-total">${totalStr}</span>
      <span class="row-estado ${p.estado}">${labelEstadoStr}</span>
      <div style="display:flex;justify-content:flex-end;">
        <button class="btn-ver" data-id="${p.id}">Ver detalle</button>
      </div>
    `;

    // Click en el botón "Ver detalle"
    row.querySelector(".btn-ver").addEventListener("click", (e) => {
      e.stopPropagation();
      abrirModal(p.id);
    });

    // Click en la fila completa también abre el modal
    row.addEventListener("click", () => abrirModal(p.id));

    body.appendChild(row);
  });
}

// ─── MODAL ────────────────────────────────
function abrirModal(id) {
  const pedido = historial.find((p) => p.id === id);
  if (!pedido) return;
  pedidoActivo = pedido;

  const sub = calcSubtotal(pedido.items);
  const tot = sub * 1.1;

  // Rellena encabezado
  document.getElementById("modalTitle").textContent = "Detalle del pedido";
  document.getElementById("modalId").textContent = pedido.id;

  // Info grid
  document.getElementById("modalTipo").textContent =
    labelTipo(pedido.tipo) +
    (pedido.mesa && pedido.mesa !== "—" ? " · " + pedido.mesa : "");
  document.getElementById("modalHora").textContent = pedido.hora || "—";
  document.getElementById("modalCajero").textContent = pedido.cajero || "—";
  document.getElementById("modalEstado").textContent = labelEstado(
    pedido.estado,
  );

  // Items
  const ul = document.getElementById("modalItems");
  ul.innerHTML = "";
  pedido.items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.name}</span>
      <span>x${item.qty || 1}</span>
      <strong>${fmt(item.price * (item.qty || 1))}</strong>
    `;
    ul.appendChild(li);
  });

  // Total
  document.getElementById("modalTotalVal").textContent = fmt(tot);

  // Mostrar modal
  document.getElementById("modalOverlay").classList.add("open");
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  pedidoActivo = null;
}

// ─── TOAST ────────────────────────────────
function mostrarToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2800);
}

// ─── IMPRIMIR ─────────────────────────────
function imprimirPedido() {
  if (!pedidoActivo) return;
  window.print();
}

// ─── EVENT LISTENERS ──────────────────────
function bindEventos() {
  // Búsqueda por texto
  document.getElementById("searchInput").addEventListener("input", (e) => {
    filtroBusqueda = e.target.value.trim();
    render();
  });

  // Filtros de fecha
  document
    .getElementById("filterFechaInicio")
    .addEventListener("change", render);
  document.getElementById("filterFechaFin").addEventListener("change", render);

  // Tabs de estado
  document.querySelectorAll(".tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tabs button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filtroEstado = btn.dataset.estado;
      render();
    });
  });

  // Modal — botón X
  document.getElementById("closeModal").addEventListener("click", cerrarModal);

  // Modal — botón Cerrar
  document
    .getElementById("btnCerrarModal")
    .addEventListener("click", cerrarModal);

  // Modal — click fuera del modal
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) cerrarModal();
  });

  // Modal — botón Imprimir
  document
    .getElementById("btnImprimir")
    .addEventListener("click", imprimirPedido);

  // Tecla ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
  });
}

// ─── INIT ─────────────────────────────────
function init() {
  cargarHistorial();
  actualizarStats();
  render();
  bindEventos();
}

document.addEventListener("DOMContentLoaded", init);

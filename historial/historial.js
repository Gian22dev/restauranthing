/* ============================================================
   historial.js — Techos Rojos · Sakura POS
   Vista: Historial (pantalla 11 del flujo)

   Fuentes de datos:
   - localStorage "akane_order"     → pedidos del módulo Rápido
   - localStorage "historial_data"  → array central de todos los pedidos
   - localStorage "inventario"      → referencia de insumos

   Escritura de pedidos:
   Cada módulo (domicilios, mesas, rápido) debería llamar a
   registrarPedidoHistorial(pedido) al completar una transacción.
   Esa función se expone globalmente para que otros módulos la usen.
   ============================================================ */

"use strict";

// ─────────────────────────────────────────
//  ESTADO GLOBAL
// ─────────────────────────────────────────
let historial = [];
let filtroEstado = "todos";
let filtroTipo = "todos";
let filtroBusqueda = "";
let pedidoActivo = null;
let idiomaActual = "es";

// ─────────────────────────────────────────
//  TRADUCCIONES
// ─────────────────────────────────────────
const T = {
  es: {
    breadcrumb: "履歴 · HISTORIAL",
    pageTitle: "Historial",
    pageSubtitle: "Consulta ventas, mesas y turnos por fecha",
    exportLabel: "Exportar",
    statVentas: "VENTAS HOY",
    statVentasSub: "del turno actual",
    statMesas: "MESAS",
    statMesasSub: "pedidos de mesa",
    statDomicilios: "DOMICILIOS",
    statDomiciliosSub: "pedidos a domicilio",
    statPromedio: "TICKET PROMEDIO",
    statPromedioSub: "por pedido",
    searchPlaceholder: "Buscar pedido, mesa o cajero...",
    tabTodos: "Todos",
    tabCobrado: "Cobrados",
    tabPendiente: "Pendientes",
    tabCancelado: "Cancelados",
    thId: "ID",
    thTipo: "TIPO",
    thItems: "ITEMS",
    thTotal: "TOTAL",
    thHora: "HORA",
    thCajero: "CAJERO",
    thEstado: "ESTADO",
    noResults: "Sin resultados para esta búsqueda",
    modalTitle: "Detalle del pedido",
    modalLabelTipo: "Tipo",
    modalLabelHora: "Hora",
    modalLabelCajero: "Cajero",
    modalLabelEstado: "Estado",
    modalLabelItems: "Productos del pedido",
    modalLabelSubtotal: "Subtotal",
    modalLabelImpuesto: "Impuestos (10%)",
    modalLabelTotal: "Total",
    btnCancelar: "Cancelar pedido",
    btnCerrar: "Cerrar",
    toastCancelado: "Pedido cancelado correctamente",
    toastExportado: "Historial exportado como CSV",
    tipoMesa: "Mesa",
    tipoDomicilio: "Domicilio",
    tipoRapido: "Rápido",
    estadoCobrado: "Cobrado",
    estadoPendiente: "Pendiente",
    estadoCancelado: "Cancelado",
  },
  zh: {
    breadcrumb: "履歴 · 历史记录",
    pageTitle: "历史记录",
    pageSubtitle: "按日期查询销售、桌台和班次",
    exportLabel: "导出",
    statVentas: "今日销售",
    statVentasSub: "当前班次",
    statMesas: "桌台",
    statMesasSub: "桌台订单",
    statDomicilios: "外卖",
    statDomiciliosSub: "外卖订单",
    statPromedio: "平均客单价",
    statPromedioSub: "每笔订单",
    searchPlaceholder: "搜索订单、桌台或收银员...",
    tabTodos: "全部",
    tabCobrado: "已结账",
    tabPendiente: "待处理",
    tabCancelado: "已取消",
    thId: "编号",
    thTipo: "类型",
    thItems: "项目",
    thTotal: "合计",
    thHora: "时间",
    thCajero: "收银员",
    thEstado: "状态",
    noResults: "没有找到相关结果",
    modalTitle: "订单详情",
    modalLabelTipo: "类型",
    modalLabelHora: "时间",
    modalLabelCajero: "收银员",
    modalLabelEstado: "状态",
    modalLabelItems: "订单产品",
    modalLabelSubtotal: "小计",
    modalLabelImpuesto: "税费 (10%)",
    modalLabelTotal: "合计",
    btnCancelar: "取消订单",
    btnCerrar: "关闭",
    toastCancelado: "订单已成功取消",
    toastExportado: "历史记录已导出为CSV",
    tipoMesa: "桌台",
    tipoDomicilio: "外卖",
    tipoRapido: "快速",
    estadoCobrado: "已结账",
    estadoPendiente: "待处理",
    estadoCancelado: "已取消",
  },
};

// ─────────────────────────────────────────
//  DATOS DE DEMO (se usan si localStorage está vacío)
// ─────────────────────────────────────────
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
    fecha: hoy(),
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
    fecha: hoy(),
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
    fecha: hoy(),
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
    fecha: hoy(),
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
    fecha: hoy(),
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
    fecha: hoy(),
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
    fecha: hoy(),
    estado: "cobrado",
  },
];

// ─────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────
function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function fmtMoney(n) {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

function calcSubtotal(items) {
  return items.reduce((s, i) => s + i.price * (i.qty || 1), 0);
}

function calcTotal(items) {
  const sub = calcSubtotal(items);
  return sub * 1.1; // +10% impuestos
}

function labelTipo(tipo) {
  const t = T[idiomaActual];
  return (
    { mesa: t.tipoMesa, domicilio: t.tipoDomicilio, rapido: t.tipoRapido }[
      tipo
    ] || tipo
  );
}

function colorTipo(tipo) {
  return (
    { mesa: "#ff8c42", domicilio: "#4caf50", rapido: "#E94E2E" }[tipo] || "#888"
  );
}

function labelEstado(estado) {
  const t = T[idiomaActual];
  return (
    {
      cobrado: t.estadoCobrado,
      pendiente: t.estadoPendiente,
      cancelado: t.estadoCancelado,
    }[estado] || estado
  );
}

function resumenItems(items) {
  return items
    .map((i) => `${i.name}${i.qty > 1 ? " x" + i.qty : ""}`)
    .join(" · ");
}

// ─────────────────────────────────────────
//  PERSISTENCIA
// ─────────────────────────────────────────
function cargarHistorial() {
  let data = JSON.parse(localStorage.getItem("historial_data")) || [];

  // Si no hay nada, cargar demo
  if (data.length === 0) {
    data = DEMO_DATA;
    localStorage.setItem("historial_data", JSON.stringify(data));
  }

  // Intentar importar el último pedido de Rápido si no está ya
  try {
    const ultimoRapido = JSON.parse(localStorage.getItem("akane_order"));
    if (ultimoRapido && ultimoRapido.id) {
      const yaExiste = data.some((p) => p.id === ultimoRapido.id);
      if (!yaExiste) {
        const nuevo = {
          id: ultimoRapido.id,
          tipo: "rapido",
          mesa: "—",
          items: (ultimoRapido.items || []).map((i) => ({
            name: i.name,
            qty: i.qty || 1,
            price: i.price || 0,
          })),
          cajero: ultimoRapido.cashier || "—",
          hora: new Date(ultimoRapido.time || Date.now()).toLocaleTimeString(
            "es-CO",
            { hour: "2-digit", minute: "2-digit" },
          ),
          fecha: hoy(),
          estado: "cobrado",
        };
        data.unshift(nuevo);
        localStorage.setItem("historial_data", JSON.stringify(data));
      }
    }
  } catch (_) {
    /* silent */
  }

  historial = data;
}

function guardarHistorial() {
  localStorage.setItem("historial_data", JSON.stringify(historial));
}

/**
 * API pública para que otros módulos registren pedidos.
 * Ejemplo de uso en domicilios.js:
 *   registrarPedidoHistorial({ id, tipo, mesa, items, cajero, hora, fecha, estado })
 */
window.registrarPedidoHistorial = function (pedido) {
  const data = JSON.parse(localStorage.getItem("historial_data")) || [];
  const yaExiste = data.some((p) => p.id === pedido.id);
  if (!yaExiste) {
    data.unshift(pedido);
    localStorage.setItem("historial_data", JSON.stringify(data));
  }
};

// ─────────────────────────────────────────
//  FILTRADO
// ─────────────────────────────────────────
function filtrarHistorial() {
  const hoyStr = hoy();
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const ayerStr = ayer.toISOString().slice(0, 10);
  const semanaStr = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  })();
  const mesStr = (() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  })();

  const fechaFiltro = document.getElementById("filterFecha").value;

  return historial.filter((p) => {
    // Filtro fecha
    if (fechaFiltro === "hoy" && p.fecha !== hoyStr) return false;
    if (fechaFiltro === "ayer" && p.fecha !== ayerStr) return false;
    if (fechaFiltro === "semana" && p.fecha < semanaStr) return false;
    if (fechaFiltro === "mes" && p.fecha < mesStr) return false;

    // Filtro tipo
    if (filtroTipo !== "todos" && p.tipo !== filtroTipo) return false;

    // Filtro estado
    if (filtroEstado !== "todos" && p.estado !== filtroEstado) return false;

    // Búsqueda texto
    if (filtroBusqueda) {
      const q = filtroBusqueda.toLowerCase();
      const haystack = [
        p.id,
        p.tipo,
        p.mesa,
        p.cajero,
        ...p.items.map((i) => i.name),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

// ─────────────────────────────────────────
//  STATS
// ─────────────────────────────────────────
function actualizarStats() {
  const hoyStr = hoy();
  const hoyData = historial.filter(
    (p) => p.fecha === hoyStr && p.estado !== "cancelado",
  );

  const ventas = hoyData.reduce((s, p) => s + calcTotal(p.items), 0);
  const mesas = hoyData.filter((p) => p.tipo === "mesa").length;
  const domicilios = hoyData.filter((p) => p.tipo === "domicilio").length;
  const promedio = hoyData.length > 0 ? ventas / hoyData.length : 0;

  document.getElementById("statVentasVal").textContent = fmtMoney(ventas);
  document.getElementById("statMesasVal").textContent = mesas;
  document.getElementById("statDomiciliosVal").textContent = domicilios;
  document.getElementById("statPromedioVal").textContent = fmtMoney(promedio);
}

// ─────────────────────────────────────────
//  RENDER TABLA
// ─────────────────────────────────────────
function render() {
  const body = document.getElementById("tableBody");
  const filtrados = filtrarHistorial();

  body.innerHTML = "";

  if (filtrados.length === 0) {
    body.innerHTML = `
      <div class="no-results">
        <span>🔍</span>
        ${T[idiomaActual].noResults}
      </div>`;
    return;
  }

  filtrados.forEach((p, idx) => {
    const row = document.createElement("div");
    row.className = "table-row";
    row.style.animationDelay = idx * 40 + "ms";

    const resumen = resumenItems(p.items);
    const tipo = labelTipo(p.tipo);
    const estado = labelEstado(p.estado);
    const color = colorTipo(p.tipo);
    const mesa = p.mesa && p.mesa !== "—" ? p.mesa : tipo;
    const total = fmtMoney(calcTotal(p.items));

    row.innerHTML = `
      <span class="row-id">${p.id}</span>
      <span class="row-tipo">
        <span class="tipo-dot" style="background:${color};"></span>
        ${mesa}
      </span>
      <span class="row-items" title="${resumen}">${resumen}</span>
      <span class="row-total">${total}</span>
      <span class="row-hora">${p.hora || "—"}</span>
      <span class="row-cajero">${p.cajero || "—"}</span>
      <span class="badge ${p.estado}">${estado}</span>
      <div style="display:flex;justify-content:flex-end;">
        <button class="btn-ver" data-id="${p.id}">Ver detalle</button>
      </div>
    `;

    row.querySelector(".btn-ver").addEventListener("click", (e) => {
      e.stopPropagation();
      abrirModal(p.id);
    });

    row.addEventListener("click", () => abrirModal(p.id));
    body.appendChild(row);
  });
}

// ─────────────────────────────────────────
//  MODAL
// ─────────────────────────────────────────
function abrirModal(id) {
  const pedido = historial.find((p) => p.id === id);
  if (!pedido) return;
  pedidoActivo = pedido;

  const t = T[idiomaActual];
  const overlay = document.getElementById("modalOverlay");
  const sub = calcSubtotal(pedido.items);
  const imp = sub * 0.1;
  const tot = sub + imp;

  document.getElementById("modalTitle").textContent = t.modalTitle;
  document.getElementById("modalId").textContent = pedido.id;
  document.getElementById("modalLabelTipo").textContent = t.modalLabelTipo;
  document.getElementById("modalTipo").textContent =
    labelTipo(pedido.tipo) +
    (pedido.mesa && pedido.mesa !== "—" ? ` · ${pedido.mesa}` : "");
  document.getElementById("modalLabelHora").textContent = t.modalLabelHora;
  document.getElementById("modalHora").textContent = pedido.hora || "—";
  document.getElementById("modalLabelCajero").textContent = t.modalLabelCajero;
  document.getElementById("modalCajero").textContent = pedido.cajero || "—";
  document.getElementById("modalLabelEstado").textContent = t.modalLabelEstado;
  document.getElementById("modalEstado").textContent = labelEstado(
    pedido.estado,
  );
  document.getElementById("modalLabelItems").textContent = t.modalLabelItems;
  document.getElementById("modalLabelSubtotal").textContent =
    t.modalLabelSubtotal;
  document.getElementById("modalLabelImpuesto").textContent =
    t.modalLabelImpuesto;
  document.getElementById("modalLabelTotal").textContent = t.modalLabelTotal;
  document.getElementById("modalSubtotal").textContent = fmtMoney(sub);
  document.getElementById("modalImpuesto").textContent = fmtMoney(imp);
  document.getElementById("modalTotal").innerHTML =
    `<strong>${fmtMoney(tot)}</strong>`;
  document.getElementById("btnCancelarPedido").textContent = t.btnCancelar;
  document.getElementById("btnCerrarModal").textContent = t.btnCerrar;

  // Ocultar botón cancelar si ya está cancelado o cobrado
  const btnCancel = document.getElementById("btnCancelarPedido");
  btnCancel.style.display = pedido.estado === "pendiente" ? "" : "none";

  // Items
  const itemsEl = document.getElementById("modalItems");
  itemsEl.innerHTML = "";
  pedido.items.forEach((i) => {
    const div = document.createElement("div");
    div.className = "modal-item-row";
    div.innerHTML = `
      <span class="modal-item-name">${i.name}</span>
      <span class="modal-item-qty">x${i.qty || 1}</span>
      <span class="modal-item-price">${fmtMoney(i.price * (i.qty || 1))}</span>
    `;
    itemsEl.appendChild(div);
  });

  overlay.classList.add("open");
}

function cerrarModal() {
  document.getElementById("modalOverlay").classList.remove("open");
  pedidoActivo = null;
}

function cancelarPedidoActivo() {
  if (!pedidoActivo) return;
  const idx = historial.findIndex((p) => p.id === pedidoActivo.id);
  if (idx === -1) return;

  historial[idx].estado = "cancelado";
  guardarHistorial();
  actualizarStats();
  render();
  cerrarModal();
  mostrarToast(T[idiomaActual].toastCancelado);
}

// ─────────────────────────────────────────
//  EXPORTAR CSV
// ─────────────────────────────────────────
function exportarCSV() {
  const filtrados = filtrarHistorial();
  const t = T[idiomaActual];
  const encabezado = [
    t.thId,
    t.thTipo,
    t.thItems,
    t.thTotal,
    t.thHora,
    t.thCajero,
    t.thEstado,
  ].join(",");

  const filas = filtrados.map((p) =>
    [
      p.id,
      labelTipo(p.tipo),
      '"' + resumenItems(p.items).replace(/"/g, '""') + '"',
      calcTotal(p.items).toFixed(0),
      p.hora || "",
      p.cajero || "",
      labelEstado(p.estado),
    ].join(","),
  );

  const csv = [encabezado, ...filas].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `historial_${hoy()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarToast(T[idiomaActual].toastExportado);
}

// ─────────────────────────────────────────
//  IDIOMA
// ─────────────────────────────────────────
function cambiarIdioma() {
  idiomaActual = idiomaActual === "es" ? "zh" : "es";
  const t = T[idiomaActual];

  document.getElementById("breadcrumb").textContent = t.breadcrumb;
  document.getElementById("pageTitle").textContent = t.pageTitle;
  document.getElementById("pageSubtitle").textContent = t.pageSubtitle;
  document.getElementById("exportLabel").textContent = t.exportLabel;
  document.getElementById("statVentas").textContent = t.statVentas;
  document.getElementById("statVentasSub").textContent = t.statVentasSub;
  document.getElementById("statMesas").textContent = t.statMesas;
  document.getElementById("statMesasSub").textContent = t.statMesasSub;
  document.getElementById("statDomicilios").textContent = t.statDomicilios;
  document.getElementById("statDomiciliosSub").textContent =
    t.statDomiciliosSub;
  document.getElementById("statPromedio").textContent = t.statPromedio;
  document.getElementById("statPromedioSub").textContent = t.statPromedioSub;
  document.getElementById("searchInput").placeholder = t.searchPlaceholder;
  document.getElementById("tabTodos").textContent = t.tabTodos;
  document.getElementById("tabCobrado").textContent = t.tabCobrado;
  document.getElementById("tabPendiente").textContent = t.tabPendiente;
  document.getElementById("tabCancelado").textContent = t.tabCancelado;
  document.getElementById("thId").textContent = t.thId;
  document.getElementById("thTipo").textContent = t.thTipo;
  document.getElementById("thItems").textContent = t.thItems;
  document.getElementById("thTotal").textContent = t.thTotal;
  document.getElementById("thHora").textContent = t.thHora;
  document.getElementById("thCajero").textContent = t.thCajero;
  document.getElementById("thEstado").textContent = t.thEstado;

  document.getElementById("langToggle").textContent =
    idiomaActual === "es" ? "中文" : "ES";

  render();
}

// ─────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────
function mostrarToast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2800);
}

// ─────────────────────────────────────────
//  EVENT LISTENERS
// ─────────────────────────────────────────
function bindEventos() {
  // Búsqueda
  document.getElementById("searchInput").addEventListener("input", (e) => {
    filtroBusqueda = e.target.value.trim();
    render();
  });

  // Selector fecha
  document
    .getElementById("filterFecha")
    .addEventListener("change", () => render());

  // Selector tipo
  document.getElementById("filterTipo").addEventListener("change", (e) => {
    filtroTipo = e.target.value;
    render();
  });

  // Tabs estado
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

  // Idioma
  document
    .getElementById("langToggle")
    .addEventListener("click", cambiarIdioma);

  // Exportar
  document.getElementById("exportBtn").addEventListener("click", exportarCSV);

  // Modal: cerrar
  document.getElementById("closeModal").addEventListener("click", cerrarModal);
  document
    .getElementById("btnCerrarModal")
    .addEventListener("click", cerrarModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) cerrarModal();
  });

  // Modal: cancelar pedido
  document.getElementById("btnCancelarPedido").addEventListener("click", () => {
    if (confirm(`¿Cancelar el pedido ${pedidoActivo?.id}?`)) {
      cancelarPedidoActivo();
    }
  });

  // Tecla ESC cierra modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarModal();
  });
}

// ─────────────────────────────────────────
//  INIT
// ─────────────────────────────────────────
function init() {
  cargarHistorial();
  actualizarStats();
  render();
  bindEventos();
}

document.addEventListener("DOMContentLoaded", init);

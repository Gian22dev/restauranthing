// Estado global
let filtroActual = "todos";
let busquedaActual = "";
let idiomaActual = "es";

// Traducciones
const traducciones = {
  es: {
    pageTitle: "Domicilios",
    pageSubtitle: "Gestiona los pedidos a domicilio del día",
    newBtn: "+ Nuevo domicilio",
    statPending: "PENDIENTES",
    statRoute: "EN RUTA",
    statDelivered: "ENTREGADOS",
    searchPlaceholder: "Buscar pedido, cliente o dirección",
    tabAll: "Todos",
    tabPending: "Pendientes",
    tabRoute: "En ruta",
    tabDelivered: "Entregados",
    noResults: "No se encontraron pedidos",
    modalTitle: "Nuevo Domicilio",
    labelNombre: "Nombre del cliente",
    labelTelefono: "Teléfono",
    labelDireccion: "Dirección",
    labelItems: "Items del pedido",
    labelTotal: "Total",
    placeholderNombre: "Ej: Juan Pérez",
    placeholderTelefono: "310 123 4567",
    placeholderDireccion: "Cra 45 #12-30",
    placeholderItems: "Ej: Sushi x2, Ramen",
    placeholderTotal: "$45.000",
    btnSubmit: "Crear Domicilio",
    confirmDelete: "¿Estás seguro de eliminar el domicilio de",
    confirmDeleteDir: "Dirección:",
    items: "items",
    titleBack: "Retroceder estado",
    titleForward: "Avanzar estado",
    titleDelete: "Eliminar"
  },
  zh: {
    pageTitle: "外卖订单",
    pageSubtitle: "管理今日外卖订单",
    newBtn: "+ 新建外卖",
    statPending: "待处理",
    statRoute: "配送中",
    statDelivered: "已完成",
    searchPlaceholder: "搜索订单、客户或地址",
    tabAll: "全部",
    tabPending: "待处理",
    tabRoute: "配送中",
    tabDelivered: "已完成",
    noResults: "未找到订单",
    modalTitle: "新建外卖订单",
    labelNombre: "客户姓名",
    labelTelefono: "电话",
    labelDireccion: "地址",
    labelItems: "订单项目",
    labelTotal: "总价",
    placeholderNombre: "例如：张三",
    placeholderTelefono: "310 123 4567",
    placeholderDireccion: "某某街123号",
    placeholderItems: "例如：寿司 x2，拉面",
    placeholderTotal: "$45.000",
    btnSubmit: "创建订单",
    confirmDelete: "确定要删除",
    confirmDeleteDir: "地址：",
    items: "个项目",
    titleBack: "后退状态",
    titleForward: "前进状态",
    titleDelete: "删除"
  }
};

// Función para cambiar idioma
function cambiarIdioma() {
  idiomaActual = idiomaActual === "es" ? "zh" : "es";
  const t = traducciones[idiomaActual];
  
  // Actualizar textos
  document.getElementById("pageTitle").textContent = t.pageTitle;
  document.getElementById("pageSubtitle").textContent = t.pageSubtitle;
  document.getElementById("newBtn").textContent = t.newBtn;
  document.getElementById("statPending").textContent = t.statPending;
  document.getElementById("statRoute").textContent = t.statRoute;
  document.getElementById("statDelivered").textContent = t.statDelivered;
  document.getElementById("searchInput").placeholder = t.searchPlaceholder;
  document.getElementById("tabAll").textContent = t.tabAll;
  document.getElementById("tabPending").textContent = t.tabPending;
  document.getElementById("tabRoute").textContent = t.tabRoute;
  document.getElementById("tabDelivered").textContent = t.tabDelivered;
  
  // Actualizar botón de idioma
  document.getElementById("langToggle").textContent = idiomaActual === "es" ? "中文" : "ES";
  
  // Actualizar render
  render();
}

const pedidos = [
  {
    id: 1,
    nombre: "Laura Mendoza",
    estado: "pendiente",
    direccion: "Cra 45 #12-30",
    telefono: "310 123 4567",
    items: ["Sushi California x2", "Sopa Miso"],
    total: "$48.000",
    hora: "14:30"
  },
  {
    id: 2,
    nombre: "Andrés Gómez",
    estado: "ruta",
    direccion: "Cll 10 #5-22",
    telefono: "311 234 5678",
    items: ["Ramen Tonkotsu", "Gyoza x6"],
    total: "$32.500",
    hora: "14:15"
  },
  {
    id: 3,
    nombre: "Mariana Ríos",
    estado: "pendiente",
    direccion: "Av Nutibara #80-15",
    telefono: "312 345 6789",
    items: ["Bento Salmon", "Ensalada Wakame", "Refresco"],
    total: "$76.000",
    hora: "14:45"
  },
  {
    id: 4,
    nombre: "Carlos Vega",
    estado: "entregado",
    direccion: "Cra 30 #8-45",
    telefono: "313 456 7890",
    items: ["Yakitori Combo"],
    total: "$22.000",
    hora: "13:20"
  }
];

const container = document.getElementById("cards");
const searchInput = document.querySelector('.filters input');
const tabs = document.querySelectorAll('.tabs button');
const nuevoBtn = document.querySelector('.btn-primary');

// Función para actualizar estadísticas
function actualizarStats() {
  const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
  const ruta = pedidos.filter(p => p.estado === 'ruta').length;
  const entregados = pedidos.filter(p => p.estado === 'entregado').length;

  document.querySelectorAll('.stat')[0].querySelector('h2').textContent = pendientes;
  document.querySelectorAll('.stat')[1].querySelector('h2').textContent = ruta;
  document.querySelectorAll('.stat')[2].querySelector('h2').textContent = entregados;
}

// Función para filtrar pedidos
function filtrarPedidos() {
  return pedidos.filter(p => {
    const coincideFiltro = filtroActual === 'todos' || p.estado === filtroActual;
    const coincideBusqueda = busquedaActual === "" || 
      p.nombre.toLowerCase().includes(busquedaActual.toLowerCase()) ||
      p.direccion.toLowerCase().includes(busquedaActual.toLowerCase());
    return coincideFiltro && coincideBusqueda;
  });
}

// Función para avanzar estado del pedido
function avanzarEstado(id, e) {
  e.stopPropagation();
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return;

  const estados = ['pendiente', 'ruta', 'entregado'];
  const actualIndex = estados.indexOf(pedido.estado);
  
  if (actualIndex < estados.length - 1) {
    pedido.estado = estados[actualIndex + 1];
    render();
    actualizarStats();
  }
}

// Función para retroceder estado del pedido
function retrocederEstado(id, e) {
  e.stopPropagation();
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return;

  const estados = ['pendiente', 'ruta', 'entregado'];
  const actualIndex = estados.indexOf(pedido.estado);
  
  if (actualIndex > 0) {
    pedido.estado = estados[actualIndex - 1];
    render();
    actualizarStats();
  }
}

// Función para eliminar pedido con confirmación
function eliminarPedido(id, e) {
  e.stopPropagation();
  const pedido = pedidos.find(p => p.id === id);
  if (!pedido) return;
  
  const t = traducciones[idiomaActual];
  const confirmacion = confirm(`${t.confirmDelete} ${pedido.nombre}?\n\n${t.confirmDeleteDir} ${pedido.direccion}`);
  
  if (confirmacion) {
    const index = pedidos.findIndex(p => p.id === id);
    if (index > -1) {
      pedidos.splice(index, 1);
      render();
      actualizarStats();
    }
  }
}

// Función para mostrar modal de nuevo domicilio
function mostrarModalNuevo() {
  const t = traducciones[idiomaActual];
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>${t.modalTitle}</h2>
        <button class="close-modal">&times;</button>
      </div>
      <form id="nuevoDomicilioForm">
        <div class="form-group">
          <label>${t.labelNombre}</label>
          <input type="text" name="nombre" required placeholder="${t.placeholderNombre}">
        </div>
        <div class="form-group">
          <label>${t.labelTelefono}</label>
          <input type="tel" name="telefono" required placeholder="${t.placeholderTelefono}">
        </div>
        <div class="form-group">
          <label>${t.labelDireccion}</label>
          <input type="text" name="direccion" required placeholder="${t.placeholderDireccion}">
        </div>
        <div class="form-group">
          <label>${t.labelItems}</label>
          <textarea name="items" rows="3" placeholder="${t.placeholderItems}"></textarea>
        </div>
        <div class="form-group">
          <label>${t.labelTotal}</label>
          <input type="text" name="total" required placeholder="${t.placeholderTotal}">
        </div>
        <button type="submit" class="btn-submit">${t.btnSubmit}</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // Cerrar modal
  modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  // Enviar formulario
  modal.querySelector('#nuevoDomicilioForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const nuevoPedido = {
      id: Date.now(),
      nombre: formData.get('nombre'),
      estado: 'pendiente',
      direccion: formData.get('direccion'),
      telefono: formData.get('telefono'),
      items: formData.get('items').split(',').map(i => i.trim()),
      total: formData.get('total'),
      hora: new Date().toLocaleTimeString(idiomaActual === 'es' ? 'es-CO' : 'zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    pedidos.push(nuevoPedido);
    render();
    actualizarStats();
    modal.remove();
  });
}

// Renderizar pedidos
function render() {
  container.innerHTML = "";
  const filtrados = filtrarPedidos();
  const t = traducciones[idiomaActual];

  if (filtrados.length === 0) {
    container.innerHTML = `<div class="no-results">${t.noResults}</div>`;
    return;
  }

  filtrados.forEach(p => {
    const div = document.createElement("div");
    div.className = `card ${p.estado}`;

    const puedeRetroceder = p.estado !== 'pendiente';
    const puedeAvanzar = p.estado !== 'entregado';

    div.innerHTML = `
      <div class="card-header">
        <div class="card-id">#${p.id}</div>
        <span class="badge ${p.estado}">
          ${p.estado.toUpperCase()}
        </span>
      </div>

      <div class="card-client">
        <strong>${p.nombre}</strong>
      </div>

      <div class="card-details">
        <p class="direccion">📍 ${p.direccion}</p>
        <p class="telefono">📞 ${p.telefono}</p>
        <p class="hora">🕐 ${p.hora}</p>
      </div>

      <div class="items-preview">
        ${p.items.slice(0, 2).map(i => `<span class="item-tag">${i}</span>`).join('')}
        ${p.items.length > 2 ? `<span class="item-tag more">+${p.items.length - 2}</span>` : ''}
      </div>

      <div class="footer">
        <span>${p.items.length} ${t.items}</span>
        <span class="total">${p.total}</span>
      </div>

      <div class="card-actions">
        ${puedeRetroceder ? `<button class="btn-action btn-back" onclick="retrocederEstado(${p.id}, event)" title="${t.titleBack}">◀</button>` : '<button class="btn-action btn-black" title="${t.titleBack}">◀</button>'}
        ${puedeAvanzar ? `<button class="btn-action btn-forward" onclick="avanzarEstado(${p.id}, event)" title="${t.titleForward}">▶</button>` : '<button class="btn-action btn-black" title="${t.titleForward}">▶</button>'}
        <button class="btn-action btn-delete" onclick="eliminarPedido(${p.id}, event)" title="${t.titleDelete}">🗑</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// Event listeners
searchInput.addEventListener('input', (e) => {
  busquedaActual = e.target.value;
  render();
});

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    filtroActual = tab.dataset.filtro;
    render();
  });
});

nuevoBtn.addEventListener('click', mostrarModalNuevo);

// Botón de idioma
document.getElementById('langToggle').addEventListener('click', cambiarIdioma);

// Inicializar
render();
actualizarStats();
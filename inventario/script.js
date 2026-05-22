let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
let movimientos = [];
let idiomaActual = "es";

// Traducciones
const traducciones = {
  es: {
    pageTitle: "Inventario",
    pageSubtitle: "Gestiona el inventario del restaurante",
    newBtn: "+ Nuevo producto",
    breadcrumb: "庫存 · INVENTORY",
    searchPlaceholder: "Buscar producto...",
    tabStock: "Stock",
    tabCrear: "Agregar",
    tabMov: "Movimiento",
    thNombre: "Nombre",
    thTipo: "Tipo",
    thStock: "Stock",
    placeholderNombre: "Nombre",
    placeholderStock: "Stock",
    optGramos: "Gr",
    optUnidad: "Unidad",
    btnCrear: "Crear",
    optEntrada: "Entrada",
    optSalida: "Salida",
    optAjuste: "Ajuste",
    btnAplicar: "Aplicar",
    toastCreado: "Producto creado correctamente",
    toastCampos: "Completa todos los campos",
    toastMovimiento: "Movimiento registrado"
  },
  zh: {
    pageTitle: "库存管理",
    pageSubtitle: "管理餐厅库存",
    newBtn: "+ 新建产品",
    breadcrumb: "庫存 · 库存",
    searchPlaceholder: "搜索产品...",
    tabStock: "库存",
    tabCrear: "添加",
    tabMov: "变动",
    thNombre: "名称",
    thTipo: "类型",
    thStock: "数量",
    placeholderNombre: "名称",
    placeholderStock: "数量",
    optGramos: "克",
    optUnidad: "个",
    btnCrear: "创建",
    optEntrada: "入库",
    optSalida: "出库",
    optAjuste: "调整",
    btnAplicar: "应用",
    toastCreado: "产品创建成功",
    toastCampos: "请填写所有字段",
    toastMovimiento: "变动已记录"
  }
};

// Función para cambiar idioma
function cambiarIdioma() {
  idiomaActual = idiomaActual === "es" ? "zh" : "es";
  const t = traducciones[idiomaActual];
  
  document.getElementById("pageTitle").textContent = t.pageTitle;
  document.getElementById("pageSubtitle").textContent = t.pageSubtitle;
  document.getElementById("newBtn").textContent = t.newBtn;
  document.getElementById("breadcrumb").textContent = t.breadcrumb;
  document.getElementById("search").placeholder = t.searchPlaceholder;
  document.getElementById("tabStock").textContent = t.tabStock;
  document.getElementById("tabCrear").textContent = t.tabCrear;
  document.getElementById("tabMov").textContent = t.tabMov;
  document.getElementById("thNombre").textContent = t.thNombre;
  document.getElementById("thTipo").textContent = t.thTipo;
  document.getElementById("thStock").textContent = t.thStock;
  document.getElementById("nombre").placeholder = t.placeholderNombre;
  document.getElementById("stockInput").placeholder = t.placeholderStock;
  document.getElementById("optGramos").textContent = t.optGramos;
  document.getElementById("optUnidad").textContent = t.optUnidad;
  document.getElementById("btnCrear").textContent = t.btnCrear;
  document.getElementById("optEntrada").textContent = t.optEntrada;
  document.getElementById("optSalida").textContent = t.optSalida;
  document.getElementById("optAjuste").textContent = t.optAjuste;
  document.getElementById("btnAplicar").textContent = t.btnAplicar;
  
  document.getElementById("langToggle").textContent = idiomaActual === "es" ? "中文" : "ES";
}

// ================= CREAR =================
function crearInsumo() {
    const nombre = document.getElementById("nombre").value.trim();
    const tipo = document.getElementById("tipo").value;
    const stockValue = document.getElementById("stockInput").value;

    // VALIDACIÓN
    if (!nombre || stockValue === "") {
        mostrarToast(traducciones[idiomaActual].toastCampos);
        return;
    }

    const stock = parseFloat(stockValue);

    const nuevo = {
        id: Date.now(),
        nombre,
        tipo,
        stock
    };

    inventario.push(nuevo);
    guardar();
    render();

    // LIMPIAR FORM
    document.getElementById("nombre").value = "";
    document.getElementById("stockInput").value = "";
    document.getElementById("tipo").value = "Gr";

    mostrarToast(traducciones[idiomaActual].toastCreado);
}

// ================= MOVIMIENTOS =================
function registrarMovimiento() {
    const id = parseInt(document.getElementById("insumoSelect").value);
    const cantidad = parseFloat(document.getElementById("cantidadMov").value);
    const tipo = document.getElementById("tipoMov").value;

    const insumo = inventario.find(i => i.id === id);

    if (!insumo) return;

    if (tipo === "entrada") {
        insumo.stock += cantidad;
    }

    if (tipo === "salida") {
        insumo.stock -= cantidad;
    }

    if (tipo === "ajuste") {
        insumo.stock = cantidad;
    }

    movimientos.push({
        tipo,
        insumoId: id,
        cantidad,
        fecha: new Date()
    });

    guardar();
    render();
    mostrarToast(traducciones[idiomaActual].toastMovimiento);
}

// ================= AUTOMÁTICO (VENTAS) =================
function aplicarVenta(receta) {
    receta.ingredientes.forEach(ing => {
        const insumo = inventario.find(i => i.id === ing.insumoId);
        if (insumo) {
            insumo.stock -= ing.cantidad;
        }
    });

    guardar();
    render();
}

// ================= UI =================
function render() {
    const tbody = document.getElementById("tablaBody");
    const select = document.getElementById("insumoSelect");

    tbody.innerHTML = "";
    select.innerHTML = "";

    inventario.forEach(i => {

        tbody.innerHTML += `
            <tr>
                <td>${i.nombre}</td>
                <td>${i.tipo}</td>
                <td style="color:${i.stock <= 0 ? 'red' : '#333'}">
                    ${i.stock}
                </td>
            </tr>
        `;

        select.innerHTML += `<option value="${i.id}">${i.nombre}</option>`;
    });
}

function guardar() {
    localStorage.setItem("inventario", JSON.stringify(inventario));
}

function cambiarSeccion(id, btn) {
    document.querySelectorAll(".seccion").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");

    document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

function filtrar() {
    const texto = document.getElementById("search").value.toLowerCase();
    const filas = document.querySelectorAll("#tablaBody tr");

    filas.forEach(f => {
        f.style.display = f.innerText.toLowerCase().includes(texto) ? "" : "none";
    });
}

function mostrarToast(mensaje) {
    const toast = document.getElementById("toast");
    toast.innerText = mensaje;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// init
render();
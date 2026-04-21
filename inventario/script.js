let inventario = JSON.parse(localStorage.getItem("inventario")) || [];
let movimientos = [];

// ================= CREAR =================
function crearInsumo() {
    const nombre = document.getElementById("nombre").value.trim();
    const tipo = document.getElementById("tipo").value;
    const stockValue = document.getElementById("stockInput").value;

    // VALIDACIÓN
    if (!nombre || stockValue === "") {
        mostrarToast("Completa todos los campos");
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
    document.getElementById("tipo").value = "gramos";

    mostrarToast("Producto creado correctamente");
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
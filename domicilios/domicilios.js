// --- DATOS Y ESTADO ---
let pedidos = [
    { id: 1, nombre: "Carlos Ruiz", direccion: "Cra 51B #94-10", telefono: "3157894422", total: "38500", estado: "pendiente", hora: "19:30" }
];
let filtroActual = 'todos';

// --- SELECTORES ---
const cardsContainer = document.getElementById('cardsContainer');
const btnNuevo = document.getElementById('btnNuevo');
const searchInput = document.getElementById('searchInput');

// --- FUNCIONES ---

function render() {
    cardsContainer.innerHTML = '';
    const busqueda = searchInput.value.toLowerCase();
    
    const filtrados = pedidos.filter(p => {
        const matchesFiltro = filtroActual === 'todos' || p.estado === filtroActual;
        const matchesBusqueda = p.nombre.toLowerCase().includes(busqueda) || p.direccion.toLowerCase().includes(busqueda);
        return matchesFiltro && matchesBusqueda;
    });

    if (filtrados.length === 0) {
        cardsContainer.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #9a8f89; padding: 40px;">No hay pedidos para mostrar</div>`;
    }

    filtrados.forEach(p => {
        const card = document.createElement('div');
        card.className = `card ${p.estado}`;
        
        let actionBtn = '';
        if (p.estado === 'pendiente') {
            actionBtn = `<button class="btn-action btn-forward" onclick="cambiarEstado(${p.id}, 'ruta')">Despachar</button>`;
        } else if (p.estado === 'ruta') {
            actionBtn = `<button class="btn-action btn-forward" onclick="cambiarEstado(${p.id}, 'entregado')">Finalizar</button>`;
        }

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <div><span class="status-dot"></span> <small style="font-weight:700; color:#9a8f89;">${p.estado.toUpperCase()}</small></div>
                <button onclick="borrarPedido(${p.id})" style="border:none; background:none; color:#9a8f89; cursor:pointer; font-size:1.1rem;"><i class='bx bx-trash'></i></button>
            </div>
            <strong>${p.nombre}</strong>
            <p style="font-size:0.85rem; color:#4a4540; margin:4px 0;">📍 ${p.direccion}</p>
            <p style="font-size:0.85rem; color:#4a4540; margin:4px 0;">📞 ${p.telefono} | 🕐 ${p.hora}</p>
            <div class="total">$ ${Number(p.total).toLocaleString('es-CO')}</div>
            <div class="card-actions">${actionBtn}</div>
        `;
        cardsContainer.appendChild(card);
    });
    actualizarContadores();
}

function cambiarEstado(id, nuevoEstado) {
    const p = pedidos.find(item => item.id === id);
    if (p) p.estado = nuevoEstado;
    render();
}

function borrarPedido(id) {
    if(confirm("¿Eliminar este pedido?")) {
        pedidos = pedidos.filter(p => p.id !== id);
        render();
    }
}

function actualizarContadores() {
    document.getElementById('countPendientes').innerText = pedidos.filter(p => p.estado === 'pendiente').length;
    document.getElementById('countRuta').innerText = pedidos.filter(p => p.estado === 'ruta').length;
    document.getElementById('countEntregados').innerText = pedidos.filter(p => p.estado === 'entregado').length;
}

// --- LÓGICA DEL MODAL ---
btnNuevo.onclick = () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <h2 style="font-family:'Noto Serif SC'; color:#b41800; margin-bottom:20px;">Nuevo Pedido</h2>
            <form id="formNuevo">
                <div class="form-group">
                    <label>Nombre Cliente</label>
                    <input type="text" id="mNombre" required placeholder="Ej: Juan Perez">
                </div>
                <div class="form-group">
                    <label>Teléfono (Máx 10)</label>
                    <input type="text" id="mTel" required maxlength="10" placeholder="Solo números" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                </div>
                <div class="form-group">
                    <label>Dirección</label>
                    <input type="text" id="mDir" required placeholder="Calle, Carrera...">
                </div>
                <div class="form-group">
                    <label>Total (Máx 7)</label>
                    <input type="text" id="mTot" required maxlength="7" placeholder="Sin puntos" oninput="this.value = this.value.replace(/[^0-9]/g, '')">
                </div>
                <button type="submit" class="btn-submit">Guardar Domicilio</button>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };

    document.getElementById('formNuevo').onsubmit = (e) => {
        e.preventDefault();
        const nuevo = {
            id: Date.now(),
            nombre: document.getElementById('mNombre').value,
            direccion: document.getElementById('mDir').value,
            telefono: document.getElementById('mTel').value,
            total: document.getElementById('mTot').value,
            estado: 'pendiente',
            hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
        };
        pedidos.push(nuevo);
        overlay.remove();
        render();
    };
};

// --- EVENTOS INICIALES ---
searchInput.oninput = render;

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroActual = btn.dataset.filter;
        render();
    };
});

// Arrancar
render();
/* ============================================================
   MENU.JS — Gestión de productos del menú
   ============================================================ */

const grid = document.getElementById("menu-grid");
const modal = document.getElementById("modal");
const addBtn = document.getElementById("add-product");
const closeBtn = document.getElementById("close");
const saveBtn = document.getElementById("save");

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");

const filter = document.getElementById("category-filter");
const modalTitle = document.getElementById("modal-title");

let products = [];
let editingIndex = null;
let userRole = "admin"; // Cambiar a "mesero" para probar restricciones

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

/* ── Local Storage ──────────────────────────────────────── */
function saveToStorage() {
  localStorage.setItem('tr_menu_products', JSON.stringify(products));
}

function loadFromStorage() {
  const stored = localStorage.getItem('tr_menu_products');
  if (stored) {
    products = JSON.parse(stored);
  }
}

/* ── Render menu grid ───────────────────────────────────── */
function render() {
  const selectedCategory = filter.value;
  grid.innerHTML = "";

  if (!products.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:3rem 1rem;color:var(--muted);">No hay productos. Crea uno para empezar.</p>';
    return;
  }

  products.forEach((product, idx) => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) return;

    const card = document.createElement("div");
    card.className = `card ${product.active ? "" : "inactive"}`;

    const badgeText = product.active ? "Activo" : "Inactivo";
    const badgeColor = product.active ? "var(--red)" : "var(--muted)";

    card.innerHTML = `
      <div class="card-header">
        <h3>${escapeHtml(product.name)}</h3>
        <span class="card-badge">${badgeText}</span>
      </div>
      
      <p>${escapeHtml(product.description || "Sin descripción")}</p>
      
      <div class="card-price">$${Number(product.price).toFixed(2)}</div>
      
      <div class="card-meta">
        <span>${product.category}</span>
        <span>${new Date(product.created || Date.now()).toLocaleDateString('es-CO')}</span>
      </div>
      
      <div class="card-actions">
        <button onclick="editProduct(${idx})" title="Editar">✏️ Editar</button>
        <button onclick="toggleProduct(${idx})" title="Cambiar estado">${product.active ? "🔴 Desactivar" : "🟢 Activar"}</button>
        <button onclick="deleteProduct(${idx})" title="Eliminar" style="color:#b41800;border-color:#b41800;">🗑 Borrar</button>
      </div>
    `;

    // Si es mesero, desactivar botones
    if (userRole === "mesero") {
      card.querySelectorAll("button").forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
      });
    }

    grid.appendChild(card);
  });
}

/* ── Update category filter ─────────────────────────────── */
function updateCategories() {
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  const currentValue = filter.value;

  filter.innerHTML = '<option value="all">Todas las categorías</option>';

  if (categories.length) {
    const optgroup = document.createElement("optgroup");
    optgroup.label = "Categorías";
    categories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      optgroup.appendChild(option);
    });
    filter.appendChild(optgroup);
  }

  filter.value = currentValue || "all";
}

/* ── Add product ────────────────────────────────────────── */
addBtn.onclick = () => {
  if (userRole === "mesero") {
    alert("🔒 No tienes permisos para agregar productos");
    return;
  }
  clearForm();
  editingIndex = null;
  modalTitle.textContent = "➕ Nuevo producto";
  modal.classList.remove("hidden");
};

/* ── Edit product ───────────────────────────────────────── */
window.editProduct = (idx) => {
  if (userRole === "mesero") return;

  const product = products[idx];
  nameInput.value = product.name || "";
  priceInput.value = product.price || "";
  categoryInput.value = product.category || "";
  descriptionInput.value = product.description || "";

  editingIndex = idx;
  modalTitle.textContent = "✏️ Editar producto";
  modal.classList.remove("hidden");
};

/* ── Save product ───────────────────────────────────────── */
saveBtn.onclick = () => {
  const name = nameInput.value.trim();
  const price = parseFloat(priceInput.value);
  const category = categoryInput.value.trim();
  const description = descriptionInput.value.trim();

  // Validación
  if (!name) {
    alert("⚠️ El nombre es obligatorio");
    return;
  }
  if (isNaN(price) || price < 0) {
    alert("⚠️ El precio debe ser un número válido");
    return;
  }
  if (!category) {
    alert("⚠️ La categoría es obligatoria");
    return;
  }

  const product = {
    name,
    price,
    category,
    description,
    active: editingIndex !== null ? products[editingIndex].active : true,
    created: editingIndex !== null ? products[editingIndex].created : Date.now()
  };

  if (editingIndex !== null) {
    products[editingIndex] = product;
  } else {
    products.push(product);
  }

  saveToStorage();
  modal.classList.add("hidden");
  updateCategories();
  render();
};

/* ── Toggle product ─────────────────────────────────────── */
window.toggleProduct = (idx) => {
  if (userRole === "mesero") return;
  products[idx].active = !products[idx].active;
  saveToStorage();
  render();
};

/* ── Delete product ─────────────────────────────────────── */
window.deleteProduct = (idx) => {
  if (userRole === "mesero") return;
  if (confirm(`¿Estás seguro de que deseas eliminar "${products[idx].name}"?`)) {
    products.splice(idx, 1);
    saveToStorage();
    updateCategories();
    render();
  }
};

/* ── Clear form ────────────────────────────────────────── */
function clearForm() {
  nameInput.value = "";
  priceInput.value = "";
  categoryInput.value = "";
  descriptionInput.value = "";
}

/* ── Close modal ────────────────────────────────────────── */
closeBtn.onclick = () => modal.classList.add("hidden");

// Cerrar modal al presionar ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.classList.add("hidden");
  }
});

/* ── Filter change ──────────────────────────────────────── */
filter.onchange = render;

/* ── Escape HTML ────────────────────────────────────────── */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ── Init ───────────────────────────────────────────────── */
loadFromStorage();
updateCategories();
render();
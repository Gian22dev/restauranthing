const grid = document.getElementById("menu-grid");
const modal = document.getElementById("modal");
const addBtn = document.getElementById("add-product");
const closeBtn = document.getElementById("close");
const saveBtn = document.getElementById("save");

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const categoryInput = document.getElementById("category");

const filter = document.getElementById("category-filter");

let products = [];
let editingIndex = null;

// 🔐 Simulación de rol
let userRole = "admin"; // cambiar a "mesero" para probar

// Crear tarjeta
function render() {
  const selected = filter.value; // 👈 guardamos selección

  grid.innerHTML = "";

  products.forEach((p, i) => {
    if (selected !== "all" && p.category !== selected) return;

    const card = document.createElement("div");
    card.className = "card " + (p.active ? "" : "inactive");

    card.innerHTML = `
      <h3>${p.name}</h3>
      <p>$${p.price}</p>
      <p>${p.category}</p>
      <div class="card-actions">
        <button onclick="edit(${i})">Editar</button>
        <button onclick="toggle(${i})">
          ${p.active ? "🟢 Activo" : "🔴 Inactivo"}
        </button>
      </div>
    `;

    if (userRole === "mesero") {
      card.querySelectorAll("button").forEach(b => b.disabled = true);
    }

    grid.appendChild(card);
  });

  updateCategories(selected); // 👈 le pasamos la selección
}

// Categorías dinámicas
function updateCategories(selected = "all") {
  const cats = [...new Set(products.map(p => p.category))];

  filter.innerHTML = `<option value="all">Todas</option>`;

  cats.forEach(c => {
    filter.innerHTML += `<option value="${c}">${c}</option>`;
  });

  filter.value = selected; // 👈 RESTAURA selección
}

// Agregar
addBtn.onclick = () => {
  if (userRole === "mesero") return alert("No autorizado");
  clearForm(); // 👈 LIMPIA EL FORM
  editingIndex = null;
  modal.classList.remove("hidden");
};

// Guardar
saveBtn.onclick = () => {
  const product = {
    name: nameInput.value,
    price: Number(priceInput.value),
    category: categoryInput.value,
    active: true
  };

  if (editingIndex !== null) {
    products[editingIndex] = product;
  } else {
    products.push(product);
  }

  modal.classList.add("hidden");
  render();
};

// Editar
window.edit = (i) => {
  if (userRole === "mesero") return;

  const p = products[i];
  nameInput.value = p.name;
  priceInput.value = p.price;
  categoryInput.value = p.category;

  editingIndex = i;
  modal.classList.remove("hidden");
};

// Activar / desactivar
window.toggle = (i) => {
  if (userRole === "mesero") return;
  products[i].active = !products[i].active;
  render();
};

function clearForm() {
  nameInput.value = "";
  priceInput.value = "";
  categoryInput.value = "";
}

// Cerrar modal
closeBtn.onclick = () => modal.classList.add("hidden");

// Filtro
filter.onchange = render;

// Inicial
render();
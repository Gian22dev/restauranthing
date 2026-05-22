/* ============================================
    Akané POS — Lógica de la rama "Rápido"
   ============================================ */

// ---------- Datos ----------
const PRODUCTS = [
  { id: 'p1', name: 'Tonkotsu Ramen', cn: '猪骨', category: 'Ramen', price: 12.5 },
  { id: 'p2', name: 'Shoyu Ramen', cn: '酱油', category: 'Ramen', price: 11.0 },
  { id: 'p3', name: 'Miso Ramen', cn: '味噌', category: 'Ramen', price: 11.5 },
  { id: 'p4', name: 'Spicy Tantan', cn: '担担', category: 'Ramen', price: 13.0 },
  { id: 'p5', name: 'Salmon Nigiri', cn: '三文鱼', category: 'Sushi', price: 6.0 },
  { id: 'p6', name: 'Tuna Roll', cn: '金枪鱼', category: 'Sushi', price: 8.5 },
  { id: 'p7', name: 'Ebi Tempura Roll', cn: '天妇罗虾', category: 'Sushi', price: 9.0 },
  { id: 'p8', name: 'Matcha Latte', cn: '抹茶拿铁', category: 'Bebidas', price: 4.5 },
  { id: 'p9', name: 'Sake Frío', cn: '清酒', category: 'Bebidas', price: 7.0 },
  { id: 'p10', name: 'Té Genmaicha', cn: '玄米茶', category: 'Bebidas', price: 3.5 },
  { id: 'p11', name: 'Mochi Helado', cn: '麻糬冰淇淋', category: 'Postres', price: 5.0 },
  { id: 'p12', name: 'Dorayaki', cn: '铜锣烧', category: 'Postres', price: 4.0 },
];



const CATEGORIES = ['Todos', 'Ramen', 'Sushi', 'Bebidas', 'Postres'];
const CATEGORY_CN = {
  'Todos': '全部',
  'Ramen': '拉面',
  'Sushi': '寿司',
  'Bebidas': '饮料',
  'Postres': '甜点'
};

// ---------- Estado ----------
const state = {
  step: 'turno',
  register: 'Caja 01',
  cashier: '',
  query: '',
  activeCat: 'Todos',
  cart: [],
};

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const fmt = (n) => `$${n.toFixed(2)}`;

// ---------- Fecha ----------
function renderDate() {
  const d = new Date();
  $('#todayDate').textContent = d.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

// ---------- Stepper ----------
function renderStepper() {
  $$('.step').forEach((el) => {
    const n = el.dataset.step;
    el.classList.remove('active', 'done');

    if (state.step === 'turno' && n === '1') el.classList.add('active');

    if (state.step === 'productos') {
      if (n === '1') el.classList.add('done');
      if (n === '2') el.classList.add('active');
    }
  });

  $$('.step').forEach((el) => {
    const bullet = el.querySelector('.step-bullet');
    bullet.textContent = el.classList.contains('done') ? '✓' : el.dataset.step;
  });
}

// ---------- GENERADOR DE PEDIDOS ----------
function getDayLetter() {
  const days = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  return days[new Date().getDay()];
}

function getOrderNumber() {
  const now = new Date();
  const todayKey = now.toDateString();

  let data = JSON.parse(localStorage.getItem('akane_counter')) || {
    date: todayKey,
    count: 0
  };

  const cutoffHour = 19;

  if (data.date !== todayKey || now.getHours() >= cutoffHour) {
    data = { date: todayKey, count: 0 };
  }

  data.count++;
  localStorage.setItem('akane_counter', JSON.stringify(data));

  return `${getDayLetter()}-${String(data.count).padStart(4, '0')}`;
}

// ---------- Turno ----------
function bindShiftForm() {
  const registerEl = $('#register');
  const cashierEl = $('#cashier');
  const btn = $('#openShiftBtn');

  const updateBtn = () => {
    btn.disabled = !cashierEl.value.trim();
  };

  cashierEl.addEventListener('input', (e) => {
    state.cashier = e.target.value;
    updateBtn();
  });

  registerEl.addEventListener('change', (e) => {
    state.register = e.target.value;
  });

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    if (!state.cashier.trim()) return;

    btn.textContent = 'Iniciando...';
    btn.disabled = true;

    setTimeout(() => {
      state.step = 'productos';
      goToView('productos');
    }, 400);
  });
}

// ---------- Vistas ----------
function goToView(view) {
  $$('.view').forEach((v) => v.classList.remove('active'));
  $(`#view-${view}`).classList.add('active');

  renderStepper();

  if (view === 'productos') {
    $('#shiftChip').textContent = `${state.register} · ${state.cashier}`;
  }
}

// ---------- Categorías ----------
function renderCategories() {
  const wrap = $('#categories');
  wrap.innerHTML = '';

  CATEGORIES.forEach((c) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-btn' + (c === state.activeCat ? ' active' : '');
    btn.textContent = c;

    // 👉 CLICK (igual que antes)
    btn.addEventListener('click', () => {
      state.activeCat = c;
      renderCategories();
      renderProducts();
    });

    // 👉 HOVER → cambiar a chino
    btn.addEventListener('mouseenter', () => {
      btn.textContent = CATEGORY_CN[c] || c;
    });

    // 👉 SALIR → volver a español
    btn.addEventListener('mouseleave', () => {
      btn.textContent = c;
    });

    wrap.appendChild(btn);
  });
}







// ---------- Productos ----------
function getFilteredProducts() {
  const q = state.query.toLowerCase();

  return PRODUCTS.filter((p) => {
    const inCat = state.activeCat === 'Todos' || p.category === state.activeCat;
    const inQuery = p.name.toLowerCase().includes(q) || p.cn.includes(state.query);
    return inCat && inQuery;
  });
}

function renderProducts() {
  const grid = $('#productGrid');
  const list = getFilteredProducts();

  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = '<p class="empty-state">Sin resultados.</p>';
    return;
  }

  list.forEach((p) => {
    const card = document.createElement('article');
    card.className = 'product-card';

    card.innerHTML = `
      <div class="product-head">
        <div>
          <p class="product-cn font-display">${p.cn}</p>
          <h3 class="product-name">${p.name}</h3>
          <p class="product-cat">${p.category}</p>
        </div>
        <span class="product-price">${fmt(p.price)}</span>
      </div>
      <button class="btn-ghost">Agregar al pedido</button>
    `;

    card.querySelector('button').addEventListener('click', () => addToCart(p));
    grid.appendChild(card);
  });
}

// ---------- Carrito ----------
function addToCart(p) {
  const existing = state.cart.find((i) => i.id === p.id);
  if (existing) existing.qty++;
  else state.cart.push({ ...p, qty: 1 });

  renderCart();
}

function renderCart() {
  const list = $('#cartList');
  const empty = $('#cartEmpty');
  const count = $('#cartCount');
  const goBtn = $('#goCheckout');

  count.textContent = state.cart.length;

  if (state.cart.length === 0) {
    empty.style.display = '';
    list.hidden = true;
    goBtn.disabled = true;
    return;
  }

  empty.style.display = 'none';
  list.hidden = false;
  list.innerHTML = '';

  let subtotal = 0;

  state.cart.forEach((i) => {
    subtotal += i.price * i.qty;

    const li = document.createElement('li');
    li.textContent = `${i.name} x${i.qty}`;
    list.appendChild(li);
  });

  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  $('#subtotal').textContent = fmt(subtotal);
  $('#tax').textContent = fmt(tax);
  $('#total').textContent = fmt(total);

  goBtn.disabled = false;
}

// ---------- Búsqueda ----------
function bindSearch() {
  $('#search').addEventListener('input', (e) => {
    state.query = e.target.value;
    renderProducts();
  });
}

// ---------- Checkout (FIXED) ----------
function bindCheckout() {
  $('#goCheckout').addEventListener('click', () => {
    if (state.cart.length === 0) return;

    const orderId = getOrderNumber();

    const orderData = {
      id: orderId,
      items: state.cart,
      register: state.register,
      cashier: state.cashier,
      time: new Date().toISOString()
    };

    // ✅ GUARDAR pedido correctamente
    localStorage.setItem('akane_order', JSON.stringify(orderData));

    // 👉 IR A CAJA
    window.location.href = "caja.html";
  });
}

// ---------- Init ----------
function init() {
  renderDate();
  renderStepper();
  bindShiftForm();
  renderCategories();
  renderProducts();
  renderCart();
  bindSearch();
  bindCheckout();
}

document.addEventListener('DOMContentLoaded', init);

/* ============================================
    Akané POS — Caja (versión conectada)
============================================ */

const state = {
  method: 'efectivo',
  received: 0,
  discount: 0,
  order: [],
  shiftData: null
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const fmt = (n) => `$${n.toFixed(2)}`;


/* ---------- INIT DATA ---------- */
function loadData() {
  const orderData = JSON.parse(localStorage.getItem('akane_order'));

  if (orderData) {
    state.order = orderData.items || [];

    const el = document.getElementById('orderId');
    if (el) {
      el.textContent = `Pedido #${orderData.id}`;
    }

    // ✅ AQUÍ el cambio importante
    $('#shiftName').textContent = `#${orderData.id}`;
  } else {
    $('#shiftName').textContent = '—';
  }

  state.shiftData = JSON.parse(localStorage.getItem('akane_shift')) || {};

  // UI info
  $('#cashierName').textContent = state.shiftData.cashier || '—';
  $('#registerName').textContent = state.shiftData.register || '—';
}


/* ---------- Fecha ---------- */
function renderDate() {
  $('#todayDate').textContent = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

/* ---------- Pedido ---------- */
function renderOrder() {
  const list = $('#orderList');
  list.innerHTML = '';

  if (state.order.length === 0) {
    list.innerHTML = `<p class="muted-sm">Sin productos.</p>`;
    return;
  }

  state.order.forEach((i) => {
    const li = document.createElement('li');
    li.className = 'order-item';
    li.innerHTML = `
      <span class="order-qty">${i.qty}×</span>
      <div>
        <p class="order-name">${i.name}</p>
        <p class="order-meta">${i.cn} · ${fmt(i.price)}</p>
      </div>
      <span class="order-price">${fmt(i.price * i.qty)}</span>
    `;
    list.appendChild(li);
  });
}

/* ---------- Totales ---------- */
function calcTotals() {
  const subtotal = state.order.reduce((s, i) => s + i.price * i.qty, 0);
  const discountAmt = subtotal * (state.discount / 100);
  const taxable = subtotal - discountAmt;
  const tax = taxable * 0.10;
  const total = taxable + tax;

  return { subtotal, discountAmt, tax, total };
}

function renderTotals() {
  const { subtotal, discountAmt, tax, total } = calcTotals();

  $('#subtotal').textContent = fmt(subtotal);
  $('#discountRow').textContent = `- ${fmt(discountAmt)}`;
  $('#tax').textContent = fmt(tax);
  $('#total').textContent = fmt(total);
  $('#bigTotal').textContent = fmt(total);

  renderChange();
}

/* ---------- Métodos ---------- */
function bindPayMethods() {
  $$('.pay-option').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.pay-option').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      state.method = btn.dataset.method;

      const labels = {
        efectivo: 'Efectivo',
        tarjeta: 'Tarjeta',
        qr: 'Pago QR',
        mixto: 'Mixto',
      };

      $('#paySummaryMethod').textContent = `Pago: ${labels[state.method]}`;
      $('#cashPanel').style.display =
        state.method === 'efectivo' ? '' : 'none';

      $('#qrPanel').style.display =
        state.method === 'qr' ? '' : 'none';
    });
  });
}

/* ---------- Cambio ---------- */
function renderChange() {
  const { total } = calcTotals();
  const change = Math.max(0, state.received - total);
  $('#change').textContent = fmt(change);
}

function bindCash() {
  $('#received').addEventListener('input', (e) => {
    state.received = parseFloat(e.target.value) || 0;
    renderChange();
  });

  $$('.quick-cash button').forEach((b) => {
    b.addEventListener('click', () => {
      const amt = b.dataset.amt;
      const { total } = calcTotals();

      state.received = amt === 'exact' ? total : parseFloat(amt);
      $('#received').value = state.received.toFixed(2);

      renderChange();
    });
  });
}

/* ---------- Descuento ---------- */
function bindDiscount() {
  $('#discount').addEventListener('input', (e) => {
    let v = parseFloat(e.target.value) || 0;
    v = Math.max(0, Math.min(100, v));

    state.discount = v;
    renderTotals();
  });
}

/* ---------- Cobro ---------- */
function bindPay() {
  $('#payBtn').addEventListener('click', () => {
    const { total } = calcTotals();

    if (state.method === 'efectivo' && state.received < total) {
      alert('Monto insuficiente.');
      return;
    }

    // limpiar pedido
    localStorage.removeItem('akane_order');

    $('#modalSummary').textContent =
      `Pedido #${document.getElementById('orderId')?.textContent.replace('Pedido #', '')} cobrado (${fmt(total)})`;

    $('#successModal').hidden = false;
  });

  $('#modalClose').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  $('#cancelBtn').addEventListener('click', () => {
    if (confirm('¿Cancelar pedido?')) {
      localStorage.removeItem('akane_order');
      window.location.href = 'index.html';
    }
  });
}

/* ---------- Init ---------- */
function init() {
  loadData(); // 👈 IMPORTANTE: primero cargar datos
  renderDate();
  renderOrder();
  renderTotals();
  bindPayMethods();
  bindCash();
  bindDiscount();
  bindPay();
}

document.addEventListener('DOMContentLoaded', init);

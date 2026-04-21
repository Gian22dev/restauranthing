const tablesGrid = document.querySelector('.tables-grid');
const addButton = document.getElementById('add-table');
const removeButton = document.getElementById('remove-table');
const modalOverlay = document.getElementById('table-modal-overlay');
const modalTitle = document.getElementById('table-modal-title');
const modalState = document.getElementById('table-modal-state');
const toggleStateButton = document.getElementById('toggle-table-state');
const viewBillButton = document.getElementById('view-bill');
const billSection = document.getElementById('bill-section');
const billBody = document.getElementById('bill-body');
const billTotal = document.getElementById('bill-total');
const splitInput = document.getElementById('split-count');
const splitAmount = document.getElementById('split-amount');
const closeModalButton = document.getElementById('close-modal');

const sampleOrders = {
  1: [
    { name: 'Ensalada César', price: 120 },
    { name: 'Pollo a la plancha', price: 220 },
    { name: 'Coca-Cola', price: 45 }
  ],
  2: [
    { name: 'Tacos al pastor', price: 90 },
    { name: 'Agua de jamaica', price: 35 },
    { name: 'Churros', price: 70 }
  ],
  3: [
    { name: 'Sopa del dia', price: 85 },
    { name: 'Filete empanizado', price: 240 },
    { name: 'Refresco', price: 40 }
  ],
  4: [
    { name: 'Pizza familiar', price: 300 },
    { name: 'Agua mineral', price: 35 },
    { name: 'Brownie', price: 75 }
  ],
  5: [
    { name: 'Hamburguesa doble', price: 185 },
    { name: 'Papas fritas', price: 70 },
    { name: 'Malteada', price: 95 }
  ],
  6: [
    { name: 'Pasta carbonara', price: 175 },
    { name: 'Pan de ajo', price: 40 },
    { name: 'Agua fresca', price: 35 }
  ]
};

let activeTable = null;

const updateRemoveState = () => {
  removeButton.disabled = tablesGrid.children.length <= 1;
};

const createTableCard = (number) => {
  const table = document.createElement('div');
  table.className = 'table active';
  table.dataset.tableNumber = number;

  const icon = document.createElement('div');
  icon.className = 'icon';
  icon.textContent = '\uD83C\uDF7D\uFE0F';

  const label = document.createElement('p');
  label.textContent = `Mesa ${number}`;

  table.appendChild(icon);
  table.appendChild(label);
  return table;
};

const calculateTotal = (items) => items.reduce((sum, item) => sum + item.price, 0);

const renderBill = (tableNumber) => {
  const items = sampleOrders[tableNumber] || [
    { name: 'Plato basico', price: 80 },
    { name: 'Bebida', price: 30 }
  ];

  billBody.innerHTML = '';
  const total = calculateTotal(items);

  items.forEach((item) => {
    const billItem = document.createElement('div');
    billItem.className = 'bill-item';

    const name = document.createElement('span');
    name.textContent = item.name;

    const price = document.createElement('strong');
    price.textContent = `$${item.price.toFixed(2)}`;

    billItem.appendChild(name);
    billItem.appendChild(price);
    billBody.appendChild(billItem);
  });

  billTotal.textContent = `$${total.toFixed(2)}`;
  updateSplit(total);
};

const updateSplit = (totalAmount = null) => {
  const total = totalAmount === null ? parseFloat(billTotal.textContent.replace('$', '')) || 0 : totalAmount;
  const people = Math.max(1, Number(splitInput.value) || 1);
  const amountPerPerson = total / people;
  splitAmount.textContent = `$${amountPerPerson.toFixed(2)}`;
};

const updateModalState = (table) => {
  const isActive = table.classList.contains('active');
  modalState.textContent = `Estado: ${isActive ? 'Activa' : 'Inactiva'}`;
  toggleStateButton.textContent = isActive ? 'Desactivar mesa' : 'Activar mesa';
};

const openModal = (table) => {
  activeTable = table;
  const tableNumber = table.dataset.tableNumber || Array.from(tablesGrid.children).indexOf(table) + 1;
  modalTitle.textContent = `Mesa ${tableNumber}`;
  updateModalState(table);
  billSection.classList.add('hidden');
  billBody.innerHTML = '';
  billTotal.textContent = '$0.00';
  splitInput.value = '1';
  splitAmount.textContent = '$0.00';
  modalOverlay.classList.remove('hidden');
};

const closeModal = () => {
  modalOverlay.classList.add('hidden');
  activeTable = null;
};

const toggleTableState = () => {
  if (!activeTable) return;
  activeTable.classList.toggle('active');
  activeTable.classList.toggle('inactive');
  updateModalState(activeTable);
};

if (tablesGrid) {
  tablesGrid.addEventListener('click', (event) => {
    const table = event.target.closest('.table');
    if (!table || !tablesGrid.contains(table)) return;
    openModal(table);
  });
}

addButton.addEventListener('click', () => {
  const nextNumber = tablesGrid.children.length + 1;
  tablesGrid.appendChild(createTableCard(nextNumber));
  updateRemoveState();
});

removeButton.addEventListener('click', () => {
  if (tablesGrid.children.length > 1) {
    tablesGrid.lastElementChild.remove();
    updateRemoveState();
  }
});

toggleStateButton.addEventListener('click', toggleTableState);

viewBillButton.addEventListener('click', () => {
  if (!activeTable) return;
  billSection.classList.remove('hidden');
  renderBill(activeTable.dataset.tableNumber);
});

closeModalButton.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (event) => {
  if (event.target === modalOverlay) {
    closeModal();
  }
});

splitInput.addEventListener('input', () => updateSplit());

updateRemoveState();

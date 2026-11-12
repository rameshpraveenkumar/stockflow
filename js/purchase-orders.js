/**
 * STOCKFLOW - Purchase Orders Management Page Logic
 * Handles PO creation with multi-item rows, receiving workflows, partial receiving, stock incrementation, and status updates.
 */

let viewingOrderId = null;

document.addEventListener('DOMContentLoaded', () => {
  initPurchaseOrdersPage();
});

function initPurchaseOrdersPage() {
  refreshOrdersPage();
  setupEventListeners();
  loadSupplierOptions();
}

function refreshOrdersPage() {
  renderSummaryKPIs();
  renderOrdersTable();
  updateSidebarBadges();
}

function renderSummaryKPIs() {
  const metrics = DataStore.calculateMetrics();
  document.getElementById('kpi-po-total').textContent = metrics.totalOrders;
  document.getElementById('kpi-po-pending').textContent = metrics.pendingOrdersCount;
  document.getElementById('kpi-po-received').textContent = metrics.receivedOrdersCount;
  document.getElementById('kpi-po-value').textContent = `$${metrics.totalPurchaseValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function loadSupplierOptions() {
  const select = document.getElementById('po-supplier');
  if (!select) return;

  const suppliers = DataStore.getSuppliers().filter(s => s.status === 'Active');
  let html = '<option value="" disabled selected>Select Supplier</option>';
  suppliers.forEach(s => {
    html += `<option value="${s.id}">${s.name}</option>`;
  });
  select.innerHTML = html;
}

function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('search-orders');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderOrdersTable();
    });
  }

  // Filter Status
  const statusFilter = document.getElementById('filter-po-status');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      renderOrdersTable();
    });
  }

  // Open Create PO Modal
  const createBtn = document.getElementById('open-create-po-btn');
  if (createBtn) {
    createBtn.addEventListener('click', () => {
      openCreatePOModal();
    });
  }

  // Add Item Line Row Button
  const addItemBtn = document.getElementById('add-po-item-row-btn');
  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => {
      addPOItemRow();
    });
  }

  // Form Submit
  const poForm = document.getElementById('create-po-form');
  if (poForm) {
    poForm.addEventListener('submit', handleCreatePOSubmit);
  }

  // Receiving Form Submit
  const receivingForm = document.getElementById('receive-po-form');
  if (receivingForm) {
    receivingForm.addEventListener('submit', handleReceivePOSubmit);
  }
}

function renderOrdersTable() {
  const tbody = document.getElementById('orders-tbody');
  const emptyState = document.getElementById('orders-empty-state');
  if (!tbody) return;

  const searchQuery = (document.getElementById('search-orders')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('filter-po-status')?.value || '';

  let orders = DataStore.getPurchaseOrders();

  if (searchQuery) {
    orders = orders.filter(o => 
      o.id.toLowerCase().includes(searchQuery) || 
      o.supplierName.toLowerCase().includes(searchQuery) ||
      o.items.some(i => i.productName.toLowerCase().includes(searchQuery))
    );
  }

  if (statusFilter) {
    orders = orders.filter(o => o.status === statusFilter);
  }

  if (orders.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tbody.innerHTML = orders.map(po => {
    let statusBadgeClass = 'badge-pending';
    if (po.status === 'Received') statusBadgeClass = 'badge-received';
    else if (po.status === 'Partially Received') statusBadgeClass = 'badge-partially-received';
    else if (po.status === 'Cancelled') statusBadgeClass = 'badge-cancelled';

    return `
      <tr class="hover:bg-cream/60 dark:hover:bg-charcoal-700/40 transition">
        <td class="py-3 px-4 font-mono font-bold text-xs text-charcoal dark:text-cream whitespace-nowrap">
          ${po.id}
        </td>
        <td class="py-3 px-4">
          <span class="font-bold text-xs text-charcoal dark:text-cream block">${po.supplierName}</span>
          <span class="text-[10px] text-charcoal/50 dark:text-cream/50">${po.items.length} line items</span>
        </td>
        <td class="py-3 px-4 font-mono text-xs text-charcoal/70 dark:text-cream/70 whitespace-nowrap">
          ${po.orderDate}
        </td>
        <td class="py-3 px-4 font-mono text-xs text-charcoal/70 dark:text-cream/70 whitespace-nowrap">
          ${po.expectedDate || 'Not specified'}
        </td>
        <td class="py-3 px-4 text-center font-mono text-xs font-semibold whitespace-nowrap">
          ${po.items.reduce((sum, i) => sum + i.qty, 0)} units
        </td>
        <td class="py-3 px-4 text-end font-mono text-xs font-bold text-brand">
          $${po.totalAmount.toFixed(2)}
        </td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${statusBadgeClass}">
            ${po.status}
          </span>
        </td>
        <td class="py-3 px-4 text-end">
          <div class="flex items-center justify-end gap-1.5">
            <button 
              type="button" 
              onclick="openViewPOModal('${po.id}')" 
              class="px-2.5 py-1 rounded-lg border border-charcoal/20 dark:border-charcoal-700 hover:bg-cream dark:hover:bg-charcoal-700 text-[11px] font-semibold text-charcoal dark:text-cream transition"
              title="View Order Details"
            >
              View
            </button>
            ${po.status !== 'Received' && po.status !== 'Cancelled' ? `
              <button 
                type="button" 
                onclick="openReceivePOModal('${po.id}')" 
                class="px-2.5 py-1 rounded-lg bg-brand hover:bg-brand-600 text-white text-[11px] font-semibold transition"
                title="Receive Shipment"
              >
                Receive
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons({ root: tbody });
}

/**
 * CREATE PURCHASE ORDER MODAL
 */
function openCreatePOModal(prefillProductId = null) {
  const modal = document.getElementById('create-po-modal');
  const form = document.getElementById('create-po-form');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('po-order-date').value = new Date().toISOString().split('T')[0];
  
  // Set expected date to 5 days ahead
  const expected = new Date();
  expected.setDate(expected.getDate() + 5);
  document.getElementById('po-expected-date').value = expected.toISOString().split('T')[0];

  // Clear rows
  const container = document.getElementById('po-item-rows-container');
  container.innerHTML = '';

  // Add first row
  addPOItemRow(prefillProductId);

  modal.classList.remove('hidden');
}

function closeCreatePOModal() {
  const modal = document.getElementById('create-po-modal');
  if (modal) modal.classList.add('hidden');
}

function addPOItemRow(selectedProductId = null) {
  const container = document.getElementById('po-item-rows-container');
  if (!container) return;

  const products = DataStore.getProducts();
  const rowId = 'po-row-' + Date.now() + '-' + Math.floor(Math.random() * 100);

  let optionsHtml = '<option value="" disabled selected>Select Product</option>';
  products.forEach(p => {
    const isSelected = selectedProductId && selectedProductId === p.id ? 'selected' : '';
    optionsHtml += `<option value="${p.id}" data-cost="${p.costPrice}" data-supplier="${p.supplierId}" ${isSelected}>${p.name} ($${p.costPrice.toFixed(2)})</option>`;
  });

  const row = document.createElement('div');
  row.id = rowId;
  row.className = 'po-item-row grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-cream/50 dark:bg-charcoal-900 border border-charcoal/10 text-xs';

  row.innerHTML = `
    <div class="col-span-5">
      <select class="po-row-product w-full h-9 px-2 rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal/20 dark:border-charcoal-700 text-xs focus:ring-2 focus:ring-brand/40">
        ${optionsHtml}
      </select>
    </div>
    <div class="col-span-2">
      <input type="number" min="1" value="20" class="po-row-qty w-full h-9 px-2 rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal/20 dark:border-charcoal-700 text-xs text-center font-mono font-bold focus:ring-2 focus:ring-brand/40" placeholder="Qty">
    </div>
    <div class="col-span-2">
      <input type="number" step="0.01" min="0" class="po-row-cost w-full h-9 px-2 rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal/20 dark:border-charcoal-700 text-xs font-mono text-end" placeholder="Unit $">
    </div>
    <div class="col-span-2 text-end font-mono font-bold text-brand po-row-total">
      $0.00
    </div>
    <div class="col-span-1 text-center">
      <button type="button" class="text-charcoal/40 hover:text-danger p-1" onclick="this.closest('.po-item-row').remove(); recalculatePOTotals();">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    </div>
  `;

  container.appendChild(row);
  if (window.lucide) window.lucide.createIcons({ root: row });

  const productSelect = row.querySelector('.po-row-product');
  const qtyInput = row.querySelector('.po-row-qty');
  const costInput = row.querySelector('.po-row-cost');

  function updateRow() {
    const selected = productSelect.options[productSelect.selectedIndex];
    if (selected && selected.value) {
      if (!costInput.value || productSelect.dataset.lastVal !== selected.value) {
        costInput.value = selected.dataset.cost;
        productSelect.dataset.lastVal = selected.value;

        // Auto select supplier if none chosen yet
        const supplierSelect = document.getElementById('po-supplier');
        if (supplierSelect && !supplierSelect.value && selected.dataset.supplier) {
          supplierSelect.value = selected.dataset.supplier;
        }
      }
    }

    const qty = parseInt(qtyInput.value, 10) || 0;
    const cost = parseFloat(costInput.value) || 0;
    const lineTotal = qty * cost;
    row.querySelector('.po-row-total').textContent = `$${lineTotal.toFixed(2)}`;
    recalculatePOTotals();
  }

  productSelect.addEventListener('change', updateRow);
  qtyInput.addEventListener('input', updateRow);
  costInput.addEventListener('input', updateRow);

  if (selectedProductId) {
    updateRow();
  }
}

function recalculatePOTotals() {
  const rows = document.querySelectorAll('.po-item-row');
  let subtotal = 0;

  rows.forEach(r => {
    const qty = parseInt(r.querySelector('.po-row-qty').value, 10) || 0;
    const cost = parseFloat(r.querySelector('.po-row-cost').value) || 0;
    subtotal += (qty * cost);
  });

  const totalEl = document.getElementById('po-grand-total');
  if (totalEl) totalEl.textContent = `$${subtotal.toFixed(2)}`;
}

function handleCreatePOSubmit(e) {
  e.preventDefault();

  const supplierId = document.getElementById('po-supplier').value;
  const orderDate = document.getElementById('po-order-date').value;
  const expectedDate = document.getElementById('po-expected-date').value;
  const notes = document.getElementById('po-notes').value.trim();

  if (!supplierId) {
    showToast('Please select a supplier.', 'error');
    return;
  }

  const supplier = DataStore.getSuppliers().find(s => s.id === supplierId);
  const rows = document.querySelectorAll('.po-item-row');
  const items = [];

  rows.forEach(r => {
    const select = r.querySelector('.po-row-product');
    const productId = select.value;
    const qty = parseInt(r.querySelector('.po-row-qty').value, 10) || 0;
    const unitCost = parseFloat(r.querySelector('.po-row-cost').value) || 0;

    if (productId && qty > 0) {
      const prod = DataStore.getProductById(productId);
      items.push({
        productId,
        productName: prod ? prod.name : 'Product',
        qty,
        unitCost
      });
    }
  });

  if (items.length === 0) {
    showToast('Please add at least one valid product line with quantity.', 'error');
    return;
  }

  const newPO = DataStore.createPurchaseOrder({
    supplierId,
    supplierName: supplier ? supplier.name : 'Supplier',
    orderDate,
    expectedDate,
    items,
    notes,
    status: 'Pending'
  });

  showToast(`Purchase Order ${newPO.id} created successfully!`, 'success');
  closeCreatePOModal();
  refreshOrdersPage();
}

/**
 * VIEW ORDER DETAILS MODAL
 */
function openViewPOModal(orderId) {
  viewingOrderId = orderId;
  const order = DataStore.getPurchaseOrders().find(o => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById('view-po-modal');
  document.getElementById('view-po-id').textContent = order.id;
  document.getElementById('view-po-supplier').textContent = order.supplierName;
  document.getElementById('view-po-date').textContent = order.orderDate;
  document.getElementById('view-po-expected').textContent = order.expectedDate || 'N/A';
  document.getElementById('view-po-status').textContent = order.status;
  document.getElementById('view-po-total').textContent = `$${order.totalAmount.toFixed(2)}`;
  document.getElementById('view-po-notes').textContent = order.notes || 'No notes specified.';

  const itemsContainer = document.getElementById('view-po-items-tbody');
  itemsContainer.innerHTML = order.items.map(item => `
    <tr class="border-b border-charcoal/5 dark:border-charcoal-700/60">
      <td class="py-2.5 font-bold text-charcoal dark:text-cream">${item.productName}</td>
      <td class="py-2.5 text-center font-mono font-bold">${item.qty}</td>
      <td class="py-2.5 text-center font-mono text-success font-semibold">${item.receivedQty || 0}</td>
      <td class="py-2.5 text-end font-mono">$${item.unitCost.toFixed(2)}</td>
      <td class="py-2.5 text-end font-mono font-bold text-brand">$${item.lineTotal.toFixed(2)}</td>
    </tr>
  `).join('');

  modal.classList.remove('hidden');
}

function closeViewPOModal() {
  const modal = document.getElementById('view-po-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * RECEIVE ORDER MODAL (PARTIAL / FULL RECEIVING LOGIC)
 */
function openReceivePOModal(orderId) {
  viewingOrderId = orderId;
  const order = DataStore.getPurchaseOrders().find(o => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById('receive-po-modal');
  document.getElementById('receive-po-id').textContent = order.id;
  document.getElementById('receive-po-supplier').textContent = order.supplierName;

  const tbody = document.getElementById('receive-po-tbody');
  tbody.innerHTML = order.items.map(item => {
    const remaining = item.qty - (item.receivedQty || 0);
    return `
      <tr class="border-b border-charcoal/5 dark:border-charcoal-700/60 receive-line" data-prod-id="${item.productId}">
        <td class="py-3">
          <span class="font-bold text-charcoal dark:text-cream block">${item.productName}</span>
          <span class="text-[10px] text-charcoal/50">Total Ordered: ${item.qty} • Already Received: ${item.receivedQty || 0}</span>
        </td>
        <td class="py-3 text-center font-mono font-bold text-amber-600">
          ${remaining}
        </td>
        <td class="py-3 text-end">
          <input 
            type="number" 
            min="0" 
            max="${remaining}" 
            value="${remaining}" 
            class="receive-input-qty w-20 h-9 px-2 rounded-lg bg-cream/70 dark:bg-charcoal-900 border border-charcoal/20 dark:border-charcoal-700 text-xs font-mono font-bold text-center focus:ring-2 focus:ring-brand/40"
            ${remaining === 0 ? 'disabled' : ''}
          >
        </td>
      </tr>
    `;
  }).join('');

  modal.classList.remove('hidden');
}

function closeReceivePOModal() {
  const modal = document.getElementById('receive-po-modal');
  if (modal) modal.classList.add('hidden');
}

function handleReceivePOSubmit(e) {
  e.preventDefault();
  if (!viewingOrderId) return;

  const rows = document.querySelectorAll('.receive-line');
  const lines = [];

  rows.forEach(r => {
    const productId = r.dataset.prodId;
    const input = r.querySelector('.receive-input-qty');
    const newlyReceivedQty = parseInt(input.value, 10) || 0;
    if (newlyReceivedQty > 0) {
      lines.push({ productId, newlyReceivedQty });
    }
  });

  if (lines.length === 0) {
    showToast('Please specify a positive received quantity for at least one item.', 'warning');
    return;
  }

  // Execute critical business logic
  const result = DataStore.receivePurchaseOrderItems(viewingOrderId, lines);

  if (result.success) {
    showToast(`Successfully received ${result.totalUnitsNewlyReceived} units! Inventory updated.`, 'success');
    closeReceivePOModal();
    refreshOrdersPage();
  } else {
    showToast(result.message || 'Error processing receiving.', 'error');
  }
}

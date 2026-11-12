/**
 * STOCKFLOW - Suppliers Management Page Logic
 * Handles supplier directory, add/edit modal, detail drawer with purchase history, and search.
 */

let editingSupplierId = null;
let deletingSupplierId = null;

document.addEventListener('DOMContentLoaded', () => {
  initSuppliersPage();
});

function initSuppliersPage() {
  refreshSuppliersList();
  setupEventListeners();
}

function refreshSuppliersList() {
  syncSupplierProductCounts();
  renderSuppliersGrid();
  renderSupplierKPIs();
  updateSidebarBadges();
}

function syncSupplierProductCounts() {
  const suppliers = DataStore.getSuppliers();
  const products = DataStore.getProducts();

  suppliers.forEach(sup => {
    sup.productsSupplied = products.filter(p => p.supplierId === sup.id).length;
  });
  DataStore.saveSuppliers(suppliers);
}

function renderSupplierKPIs() {
  const suppliers = DataStore.getSuppliers();
  const orders = DataStore.getPurchaseOrders();

  const totalEl = document.getElementById('kpi-total-suppliers');
  const activeEl = document.getElementById('kpi-active-suppliers');
  const ordersEl = document.getElementById('kpi-total-orders-placed');

  if (totalEl) totalEl.textContent = suppliers.length;
  if (activeEl) activeEl.textContent = suppliers.filter(s => s.status === 'Active').length;
  if (ordersEl) ordersEl.textContent = `${orders.length} Invoices`;
}

function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('search-suppliers');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderSuppliersGrid();
    });
  }

  // Open Add Supplier Modal
  const addBtn = document.getElementById('open-add-supplier-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openSupplierModal();
    });
  }

  // Supplier Form Submit
  const form = document.getElementById('supplier-form');
  if (form) {
    form.addEventListener('submit', handleSupplierFormSubmit);
  }

  // Confirm Delete
  const confirmDeleteBtn = document.getElementById('confirm-delete-supplier-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (deletingSupplierId) {
        DataStore.deleteSupplier(deletingSupplierId);
        showToast('Supplier successfully removed.', 'success');
        closeDeleteModal();
        refreshSuppliersList();
      }
    });
  }
}

function renderSuppliersGrid() {
  const container = document.getElementById('suppliers-container');
  const emptyState = document.getElementById('suppliers-empty-state');
  if (!container) return;

  const searchQuery = (document.getElementById('search-suppliers')?.value || '').toLowerCase().trim();
  let suppliers = DataStore.getSuppliers();

  if (searchQuery) {
    suppliers = suppliers.filter(s => 
      s.name.toLowerCase().includes(searchQuery) || 
      (s.contactPerson && s.contactPerson.toLowerCase().includes(searchQuery)) || 
      (s.email && s.email.toLowerCase().includes(searchQuery)) ||
      (s.address && s.address.toLowerCase().includes(searchQuery))
    );
  }

  if (suppliers.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = suppliers.map(sup => `
    <div class="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-charcoal/10 dark:border-charcoal-700 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
            <i data-lucide="truck" class="w-5 h-5"></i>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sup.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-700'}">
            ${sup.status}
          </span>
        </div>

        <div>
          <h3 class="font-display font-bold text-base text-charcoal dark:text-cream">${sup.name}</h3>
          <span class="text-xs text-brand font-semibold block mt-0.5">${sup.contactPerson || 'Primary Representative'}</span>
        </div>

        <div class="space-y-1.5 text-xs text-charcoal/70 dark:text-cream/70 pt-1">
          <div class="flex items-center gap-2">
            <i data-lucide="mail" class="w-3.5 h-3.5 text-charcoal/40 dark:text-cream/40 flex-shrink-0"></i>
            <span class="truncate">${sup.email || 'N/A'}</span>
          </div>
          <div class="flex items-center gap-2">
            <i data-lucide="phone" class="w-3.5 h-3.5 text-charcoal/40 dark:text-cream/40 flex-shrink-0"></i>
            <span>${sup.phone || 'N/A'}</span>
          </div>
          <div class="flex items-center gap-2">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-charcoal/40 dark:text-cream/40 flex-shrink-0"></i>
            <span class="truncate">${sup.address || 'Standard Hub'}</span>
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-charcoal/10 dark:border-charcoal-700 flex items-center justify-between text-xs">
        <span class="font-semibold text-charcoal/70 dark:text-cream/70">${sup.productsSupplied || 0} Products</span>
        <div class="flex items-center gap-1.5">
          <button 
            type="button" 
            onclick="openSupplierDetailModal('${sup.id}')" 
            class="px-2 py-1 rounded-lg border border-charcoal/20 dark:border-charcoal-700 hover:bg-cream dark:hover:bg-charcoal-700 text-charcoal dark:text-cream text-[11px] font-semibold transition"
          >
            History
          </button>
          <button 
            type="button" 
            onclick="openSupplierModal('${sup.id}')" 
            class="p-1.5 rounded-lg text-charcoal/60 dark:text-cream/60 hover:text-brand hover:bg-cream dark:hover:bg-charcoal-700 transition"
            title="Edit Supplier"
          >
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button 
            type="button" 
            onclick="openDeleteSupplierModal('${sup.id}')" 
            class="p-1.5 rounded-lg text-charcoal/60 dark:text-cream/60 hover:text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            title="Delete Supplier"
          >
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons({ root: container });
}

function openSupplierModal(id = null) {
  editingSupplierId = id;
  const modal = document.getElementById('supplier-modal');
  const title = document.getElementById('supplier-modal-title');
  const form = document.getElementById('supplier-form');
  if (!modal || !form) return;

  form.reset();

  if (id) {
    const suppliers = DataStore.getSuppliers();
    const sup = suppliers.find(s => s.id === id);
    if (!sup) return;
    title.textContent = 'Edit Supplier';
    document.getElementById('supplier-name').value = sup.name;
    document.getElementById('supplier-contact').value = sup.contactPerson || '';
    document.getElementById('supplier-email').value = sup.email || '';
    document.getElementById('supplier-phone').value = sup.phone || '';
    document.getElementById('supplier-address').value = sup.address || '';
    document.getElementById('supplier-status').value = sup.status || 'Active';
  } else {
    title.textContent = 'Add New Supplier';
  }

  modal.classList.remove('hidden');
}

function closeSupplierModal() {
  const modal = document.getElementById('supplier-modal');
  if (modal) modal.classList.add('hidden');
  editingSupplierId = null;
}

function handleSupplierFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('supplier-name').value.trim();
  const contactPerson = document.getElementById('supplier-contact').value.trim();
  const email = document.getElementById('supplier-email').value.trim();
  const phone = document.getElementById('supplier-phone').value.trim();
  const address = document.getElementById('supplier-address').value.trim();
  const status = document.getElementById('supplier-status').value;

  if (!name || !email) {
    showToast('Supplier company name and email are required.', 'error');
    return;
  }

  const supplierData = { name, contactPerson, email, phone, address, status };

  if (editingSupplierId) {
    DataStore.updateSupplier(editingSupplierId, supplierData);
    showToast(`Updated supplier "${name}".`, 'success');
  } else {
    DataStore.addSupplier(supplierData);
    showToast(`Added new supplier "${name}".`, 'success');
  }

  closeSupplierModal();
  refreshSuppliersList();
}

function openSupplierDetailModal(id) {
  const sup = DataStore.getSuppliers().find(s => s.id === id);
  if (!sup) return;

  const modal = document.getElementById('supplier-detail-modal');
  document.getElementById('detail-sup-name').textContent = sup.name;
  document.getElementById('detail-sup-contact').textContent = sup.contactPerson || 'N/A';
  document.getElementById('detail-sup-email').textContent = sup.email || 'N/A';
  document.getElementById('detail-sup-phone').textContent = sup.phone || 'N/A';
  document.getElementById('detail-sup-address').textContent = sup.address || 'N/A';
  document.getElementById('detail-sup-status').textContent = sup.status;

  // Products Supplied List
  const products = DataStore.getProducts().filter(p => p.supplierId === id);
  const prodContainer = document.getElementById('detail-sup-products');
  if (products.length === 0) {
    prodContainer.innerHTML = `<span class="text-xs text-charcoal/50">No products currently linked to this supplier.</span>`;
  } else {
    prodContainer.innerHTML = products.map(p => `
      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream dark:bg-charcoal-900 border border-charcoal/10 text-xs text-charcoal dark:text-cream">
        <i data-lucide="package" class="w-3.5 h-3.5 text-brand"></i>
        <span>${p.name} (${p.stock} units)</span>
      </span>
    `).join('');
  }

  // Order History List
  const orders = DataStore.getPurchaseOrders().filter(o => o.supplierId === id);
  const ordersContainer = document.getElementById('detail-sup-orders');
  if (orders.length === 0) {
    ordersContainer.innerHTML = `<div class="text-xs text-charcoal/50 text-center py-4">No purchase orders placed with this vendor yet.</div>`;
  } else {
    ordersContainer.innerHTML = orders.map(o => `
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-cream/50 dark:bg-charcoal-900/50 border border-charcoal/5 text-xs">
        <div>
          <span class="font-mono font-bold text-charcoal dark:text-cream block">${o.id}</span>
          <span class="text-[10px] text-charcoal/50 dark:text-cream/50">Ordered: ${o.orderDate}</span>
        </div>
        <div class="text-end">
          <span class="font-bold text-brand block">$${o.totalAmount.toFixed(2)}</span>
          <span class="text-[10px] font-bold ${o.status === 'Received' ? 'text-success' : 'text-warning'}">${o.status}</span>
        </div>
      </div>
    `).join('');
  }

  if (window.lucide) window.lucide.createIcons();
  modal.classList.remove('hidden');
}

function closeSupplierDetailModal() {
  const modal = document.getElementById('supplier-detail-modal');
  if (modal) modal.classList.add('hidden');
}

function openDeleteSupplierModal(id) {
  deletingSupplierId = id;
  const sup = DataStore.getSuppliers().find(s => s.id === id);
  if (!sup) return;

  document.getElementById('delete-supplier-name').textContent = sup.name;
  const modal = document.getElementById('delete-supplier-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-supplier-modal');
  if (modal) modal.classList.add('hidden');
  deletingSupplierId = null;
}

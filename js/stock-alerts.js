/**
 * STOCKFLOW - Stock Alerts Page Logic
 * Handles automatic threshold calculation, out-of-stock triggers, 1-click PO generation, and fast stock adjustment.
 */

let adjustingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
  initStockAlertsPage();
});

function initStockAlertsPage() {
  refreshStockAlertsPage();
  setupEventListeners();
}

function refreshStockAlertsPage() {
  renderAlertsKPIs();
  renderAlertsTable();
  updateSidebarBadges();
}

function renderAlertsKPIs() {
  const alerts = DataStore.getStockAlerts();
  const outOfStockCount = alerts.filter(a => a.stock === 0).length;
  const lowStockCount = alerts.filter(a => a.stock > 0).length;
  const estCost = alerts.reduce((sum, a) => sum + (a.estimatedReorderCost || 0), 0);

  document.getElementById('kpi-alert-total').textContent = alerts.length;
  document.getElementById('kpi-alert-outofstock').textContent = outOfStockCount;
  document.getElementById('kpi-alert-lowstock').textContent = lowStockCount;
  document.getElementById('kpi-alert-estcost').textContent = `$${estCost.toFixed(2)}`;
}

function setupEventListeners() {
  const searchInput = document.getElementById('search-alerts');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderAlertsTable();
    });
  }

  const severityFilter = document.getElementById('filter-severity');
  if (severityFilter) {
    severityFilter.addEventListener('change', () => {
      renderAlertsTable();
    });
  }

  const adjustForm = document.getElementById('stock-adjust-form');
  if (adjustForm) {
    adjustForm.addEventListener('submit', handleStockAdjustSubmit);
  }
}

function renderAlertsTable() {
  const tbody = document.getElementById('alerts-tbody');
  const emptyState = document.getElementById('alerts-empty-state');
  if (!tbody) return;

  const searchQuery = (document.getElementById('search-alerts')?.value || '').toLowerCase().trim();
  const severityFilter = document.getElementById('filter-severity')?.value || '';

  let alerts = DataStore.getStockAlerts();

  if (searchQuery) {
    alerts = alerts.filter(a => 
      a.name.toLowerCase().includes(searchQuery) || 
      a.sku.toLowerCase().includes(searchQuery) ||
      a.categoryName.toLowerCase().includes(searchQuery)
    );
  }

  if (severityFilter) {
    alerts = alerts.filter(a => a.severity.toLowerCase().replace(/\s+/g, '-') === severityFilter);
  }

  if (alerts.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  tbody.innerHTML = alerts.map(item => {
    let badgeClass = 'badge-low-stock';
    if (item.stock === 0) badgeClass = 'badge-out-of-stock';
    else if (item.severity === 'Critical') badgeClass = 'badge-low-stock';

    return `
      <tr class="hover:bg-cream/60 dark:hover:bg-charcoal-700/40 transition">
        <td class="py-3 px-4">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg ${item.stock === 0 ? 'bg-red-100 text-danger' : 'bg-amber-100 text-warning'} flex items-center justify-center font-bold text-xs flex-shrink-0">
              <i data-lucide="${item.stock === 0 ? 'alert-octagon' : 'alert-triangle'}" class="w-4 h-4"></i>
            </div>
            <div>
              <span class="font-bold text-xs text-charcoal dark:text-cream block">${item.name}</span>
              <span class="text-[10px] text-charcoal/50 dark:text-cream/50">${item.categoryName} • Supplier: ${item.supplierName}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-xs font-semibold text-charcoal/80 dark:text-cream/80">
          ${item.sku}
        </td>
        <td class="py-3 px-4 text-center font-mono font-bold text-xs ${item.stock === 0 ? 'text-danger' : 'text-warning'}">
          ${item.stock}
        </td>
        <td class="py-3 px-4 text-center font-mono text-xs text-charcoal/60 dark:text-cream/60">
          ${item.threshold}
        </td>
        <td class="py-3 px-4 text-center font-mono text-xs font-bold text-brand whitespace-nowrap">
          +${item.suggestedReorder} units
          <span class="text-[10px] text-charcoal/50 dark:text-cream/50 block">($${item.estimatedReorderCost.toFixed(2)})</span>
        </td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${badgeClass}">
            ${item.severity}
          </span>
        </td>
        <td class="py-3 px-4 text-end">
          <div class="flex items-center justify-end gap-1.5">
            <button 
              type="button" 
              onclick="openStockAdjustModal('${item.id}')" 
              class="px-2.5 py-1 rounded-lg border border-charcoal/20 dark:border-charcoal-700 hover:bg-cream dark:hover:bg-charcoal-700 text-[11px] font-semibold text-charcoal dark:text-cream whitespace-nowrap transition"
              title="Audit Shelf Count"
            >
              Audit Count
            </button>
            <button 
              type="button" 
              onclick="reorderDirectlyFromAlert('${item.id}')" 
              class="px-2.5 py-1 rounded-lg bg-brand hover:bg-brand-600 text-white text-[11px] font-semibold whitespace-nowrap transition"
              title="Create Purchase Order"
            >
              Reorder Now
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons({ root: tbody });
}

/**
 * 1-Click Purchase Order Generation from Alert
 */
function reorderDirectlyFromAlert(productId) {
  const product = DataStore.getProductById(productId);
  if (!product) return;

  const suggestedQty = Math.max(product.threshold * 2 - product.stock, 25);
  const total = suggestedQty * product.costPrice;

  // Generate PO immediately
  const po = DataStore.createPurchaseOrder({
    supplierId: product.supplierId,
    supplierName: product.supplierName,
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    status: 'Pending',
    items: [
      {
        productId: product.id,
        productName: product.name,
        qty: suggestedQty,
        unitCost: product.costPrice
      }
    ],
    notes: `Automated reorder created from low-stock safety threshold alert.`
  });

  showToast(`Created Purchase Order ${po.id} for ${suggestedQty} units of ${product.name}!`, 'success');
  refreshStockAlertsPage();
}

/**
 * Audit / Stock Adjust Modal
 */
function openStockAdjustModal(id) {
  adjustingProductId = id;
  const prod = DataStore.getProductById(id);
  if (!prod) return;

  const modal = document.getElementById('stock-adjust-modal');
  document.getElementById('adjust-product-name').textContent = prod.name;
  document.getElementById('adjust-current-stock').textContent = prod.stock;
  document.getElementById('adjust-new-stock').value = prod.stock;

  modal.classList.remove('hidden');
}

function closeStockAdjustModal() {
  const modal = document.getElementById('stock-adjust-modal');
  if (modal) modal.classList.add('hidden');
  adjustingProductId = null;
}

function handleStockAdjustSubmit(e) {
  e.preventDefault();
  if (!adjustingProductId) return;

  const newQty = parseInt(document.getElementById('adjust-new-stock').value, 10);
  const reason = document.getElementById('adjust-reason').value;

  if (isNaN(newQty) || newQty < 0) {
    showToast('Please enter a valid count.', 'error');
    return;
  }

  DataStore.adjustStock(adjustingProductId, newQty, reason);
  showToast('Verified stock updated successfully.', 'success');
  closeStockAdjustModal();
  refreshStockAlertsPage();
}

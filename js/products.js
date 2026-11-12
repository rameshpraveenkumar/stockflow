/**
 * STOCKFLOW - Products Management Page Logic
 * Handles product listing, filtering, search, sorting, modal CRUD, stock adjustment, and CSV export.
 */

let currentProducts = [];
let filteredProducts = [];
let currentPage = 1;
const pageSize = 10;
let currentSort = { column: 'name', asc: true };
let editingProductId = null;
let deletingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
  initProductsPage();
});

function initProductsPage() {
  loadCategoryFilterOptions();
  loadSupplierFormOptions();
  refreshProductList();
  setupEventListeners();
}

function refreshProductList() {
  currentProducts = DataStore.getProducts();
  applyFiltersAndSort();
  renderKPIs();
  updateSidebarBadges();
}

function renderKPIs() {
  const metrics = DataStore.calculateMetrics();
  const totalEl = document.getElementById('kpi-prod-total');
  const inStockEl = document.getElementById('kpi-prod-instock');
  const lowStockEl = document.getElementById('kpi-prod-low');
  const outOfStockEl = document.getElementById('kpi-prod-out');

  if (totalEl) totalEl.textContent = metrics.totalProducts;
  if (inStockEl) inStockEl.textContent = metrics.inStockCount;
  if (lowStockEl) lowStockEl.textContent = metrics.lowStockCount;
  if (outOfStockEl) outOfStockEl.textContent = metrics.outOfStockCount;
}

function loadCategoryFilterOptions() {
  const select = document.getElementById('filter-category');
  const modalSelect = document.getElementById('product-category');
  if (!select) return;

  const categories = DataStore.getCategories();
  let filterHtml = '<option value="">All Categories</option>';
  let modalHtml = '<option value="" disabled selected>Select Category</option>';

  categories.forEach(cat => {
    filterHtml += `<option value="${cat.id}">${cat.name}</option>`;
    modalHtml += `<option value="${cat.id}">${cat.name}</option>`;
  });

  select.innerHTML = filterHtml;
  if (modalSelect) modalSelect.innerHTML = modalHtml;
}

function loadSupplierFormOptions() {
  const modalSelect = document.getElementById('product-supplier');
  if (!modalSelect) return;

  const suppliers = DataStore.getSuppliers();
  let html = '<option value="" disabled selected>Select Primary Supplier</option>';
  suppliers.forEach(sup => {
    html += `<option value="${sup.id}">${sup.name}</option>`;
  });
  modalSelect.innerHTML = html;
}

function setupEventListeners() {
  // Search Input
  const searchInput = document.getElementById('search-products');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentPage = 1;
      applyFiltersAndSort();
    });
  }

  // Filter Category
  const catSelect = document.getElementById('filter-category');
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      currentPage = 1;
      applyFiltersAndSort();
    });
  }

  // Filter Stock Status
  const statusSelect = document.getElementById('filter-status');
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      currentPage = 1;
      applyFiltersAndSort();
    });
  }

  // Export CSV
  const exportBtn = document.getElementById('export-products-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportProductsCSV();
    });
  }

  // Add Product Button Opens Modal
  const addBtn = document.getElementById('open-add-product-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openProductModal();
    });
  }

  // Product Form Submit
  const form = document.getElementById('product-form');
  if (form) {
    form.addEventListener('submit', handleProductFormSubmit);
  }

  // Stock Adjustment Form Submit
  const adjustForm = document.getElementById('stock-adjust-form');
  if (adjustForm) {
    adjustForm.addEventListener('submit', handleStockAdjustSubmit);
  }

  // Delete Confirmation Modal Button
  const confirmDeleteBtn = document.getElementById('confirm-delete-product-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (deletingProductId) {
        DataStore.deleteProduct(deletingProductId);
        showToast('Product successfully deleted.', 'success');
        closeDeleteModal();
        refreshProductList();
      }
    });
  }
}

function applyFiltersAndSort() {
  const searchQuery = (document.getElementById('search-products')?.value || '').toLowerCase().trim();
  const categoryFilter = document.getElementById('filter-category')?.value || '';
  const statusFilter = document.getElementById('filter-status')?.value || '';

  filteredProducts = currentProducts.filter(p => {
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery) || 
      p.sku.toLowerCase().includes(searchQuery) || 
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery));

    const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;

    let matchesStatus = true;
    if (statusFilter === 'in-stock') {
      matchesStatus = p.stock > p.threshold;
    } else if (statusFilter === 'low-stock') {
      matchesStatus = p.stock > 0 && p.stock <= p.threshold;
    } else if (statusFilter === 'out-of-stock') {
      matchesStatus = p.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort
  filteredProducts.sort((a, b) => {
    let valA = a[currentSort.column];
    let valB = b[currentSort.column];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return currentSort.asc ? -1 : 1;
    if (valA > valB) return currentSort.asc ? 1 : -1;
    return 0;
  });

  renderTable();
  renderPagination();
}

function sortBy(column) {
  if (currentSort.column === column) {
    currentSort.asc = !currentSort.asc;
  } else {
    currentSort.column = column;
    currentSort.asc = true;
  }
  applyFiltersAndSort();
}

function renderTable() {
  const tbody = document.getElementById('products-tbody');
  const emptyState = document.getElementById('products-empty-state');
  if (!tbody) return;

  if (filteredProducts.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const start = (currentPage - 1) * pageSize;
  const paginated = filteredProducts.slice(start, start + pageSize);

  const skuThumbnailMap = {
    'GRN-RICE-001': '../assets/images/products/product-rice.jpg',
    'OIL-SUN-002': '../assets/images/products/product-oil.jpg',
    'GRN-SUG-003': '../assets/images/products/product-sugar.jpg',
    'GRN-WHT-004': '../assets/images/products/product-flour.jpg',
    'DRY-MLK-005': '../assets/images/products/product-milk.jpg',
    'BEV-TEA-006': '../assets/images/products/product-tea.jpg',
    'HGY-SOP-007': '../assets/images/products/product-soap.jpg',
    'CLN-DET-008': '../assets/images/products/product-detergent.jpg',
    'BEV-COF-011': '../assets/images/products/product-coffee.jpg',
    'GRN-OAT-012': '../assets/images/products/product-cereal.jpg',
    'OIL-OLV-013': '../assets/images/products/product-oil.jpg',
    'SNK-DKC-014': '../assets/images/products/product-chocolate.jpg',
    'SNK-CRN-019': '../assets/images/products/product-cereal.jpg',
    'BEV-GRN-020': '../assets/images/products/product-tea.jpg',
    'SNK-CHK-026': '../assets/images/products/product-chocolate.jpg',
    'BEV-ALM-027': '../assets/images/products/product-milk.jpg'
  };

  tbody.innerHTML = paginated.map(p => {
    let statusClass = 'badge-in-stock';
    let statusLabel = 'In Stock';
    if (p.stock === 0) {
      statusClass = 'badge-out-of-stock';
      statusLabel = 'Out of Stock';
    } else if (p.stock <= p.threshold) {
      statusClass = 'badge-low-stock';
      statusLabel = 'Low Stock';
    }

    const thumbSrc = p.image || skuThumbnailMap[p.sku];
    const thumbHtml = thumbSrc 
      ? `<img src="${thumbSrc}" alt="${p.name}" class="w-9 h-9 rounded-xl object-cover flex-shrink-0 border border-charcoal/10 dark:border-charcoal-700 shadow-sm" onerror="this.outerHTML='<div class=\\'w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 font-bold text-xs\\'><i data-lucide=\\'package\\' class=\\'w-4 h-4\\'></i></div>'">`
      : `<div class="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 font-bold text-xs"><i data-lucide="${p.icon || 'package'}" class="w-4 h-4"></i></div>`;

    return `
      <tr class="hover:bg-cream/60 dark:hover:bg-charcoal-700/40 transition">
        <td class="py-3 px-4">
          <div class="flex items-center gap-3">
            ${thumbHtml}
            <div>
              <span class="font-bold text-charcoal dark:text-cream block">${p.name}</span>
              <span class="text-[10px] text-charcoal/50 dark:text-cream/50">${p.unit || 'Standard'}</span>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 font-mono text-xs font-semibold text-charcoal/80 dark:text-cream/80">
          ${p.sku}
        </td>
        <td class="py-3 px-4 text-xs text-charcoal/70 dark:text-cream/70">
          ${p.categoryName || 'Unassigned'}
        </td>
        <td class="py-3 px-4 text-center font-mono font-bold ${p.stock === 0 ? 'text-danger' : (p.stock <= p.threshold ? 'text-warning' : 'text-charcoal dark:text-cream')}">
          ${p.stock}
        </td>
        <td class="py-3 px-4 text-end font-mono text-xs text-charcoal/70 dark:text-cream/70">
          $${p.costPrice.toFixed(2)}
        </td>
        <td class="py-3 px-4 text-end font-mono text-xs font-bold text-charcoal dark:text-cream">
          $${p.sellingPrice.toFixed(2)}
        </td>
        <td class="py-3 px-4 text-center">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${statusClass}">
            ${statusLabel}
          </span>
        </td>
        <td class="py-3 px-4 text-end">
          <div class="flex items-center justify-end gap-1.5">
            <button 
              type="button" 
              onclick="openStockAdjustModal('${p.id}')" 
              class="p-1.5 rounded-lg text-charcoal/60 dark:text-cream/60 hover:text-brand hover:bg-cream dark:hover:bg-charcoal-700 transition" 
              title="Adjust Stock Quantity"
            >
              <i data-lucide="sliders" class="w-4 h-4"></i>
            </button>
            <button 
              type="button" 
              onclick="openProductModal('${p.id}')" 
              class="p-1.5 rounded-lg text-charcoal/60 dark:text-cream/60 hover:text-brand hover:bg-cream dark:hover:bg-charcoal-700 transition" 
              title="Edit Product"
            >
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button 
              type="button" 
              onclick="openDeleteModal('${p.id}')" 
              class="p-1.5 rounded-lg text-charcoal/60 dark:text-cream/60 hover:text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition" 
              title="Delete Product"
            >
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons({ root: tbody });
}

function renderPagination() {
  const container = document.getElementById('products-pagination');
  if (!container) return;

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const startItem = filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredProducts.length);

  container.innerHTML = `
    <span class="text-xs text-charcoal/60 dark:text-cream/60">
      Showing <strong>${startItem}-${endItem}</strong> of <strong>${filteredProducts.length}</strong> products
    </span>
    <div class="flex items-center gap-1.5">
      <button 
        type="button" 
        ${currentPage <= 1 ? 'disabled' : ''} 
        onclick="changePage(${currentPage - 1})"
        class="px-2.5 py-1 rounded-lg border border-charcoal/15 dark:border-charcoal-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream dark:hover:bg-charcoal-700 transition"
      >
        Prev
      </button>
      <span class="px-2 text-xs font-bold text-brand">Page ${currentPage} of ${totalPages}</span>
      <button 
        type="button" 
        ${currentPage >= totalPages ? 'disabled' : ''} 
        onclick="changePage(${currentPage + 1})"
        class="px-2.5 py-1 rounded-lg border border-charcoal/15 dark:border-charcoal-700 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream dark:hover:bg-charcoal-700 transition"
      >
        Next
      </button>
    </div>
  `;
}

function changePage(page) {
  currentPage = page;
  renderTable();
  renderPagination();
}

/**
 * Product Modal (Add / Edit)
 */
function openProductModal(id = null) {
  editingProductId = id;
  const modal = document.getElementById('product-modal');
  const title = document.getElementById('product-modal-title');
  const form = document.getElementById('product-form');
  if (!modal || !form) return;

  form.reset();

  if (id) {
    const prod = DataStore.getProductById(id);
    if (!prod) return;
    title.textContent = 'Edit Product';
    document.getElementById('product-name').value = prod.name;
    document.getElementById('product-sku').value = prod.sku;
    document.getElementById('product-barcode').value = prod.barcode || '';
    document.getElementById('product-category').value = prod.categoryId;
    document.getElementById('product-supplier').value = prod.supplierId;
    document.getElementById('product-unit').value = prod.unit || '';
    document.getElementById('product-cost').value = prod.costPrice;
    document.getElementById('product-price').value = prod.sellingPrice;
    document.getElementById('product-stock').value = prod.stock;
    document.getElementById('product-threshold').value = prod.threshold;
    document.getElementById('product-description').value = prod.description || '';
  } else {
    title.textContent = 'Add New Product';
  }

  modal.classList.remove('hidden');
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.add('hidden');
  editingProductId = null;
}

function handleProductFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('product-name').value.trim();
  const sku = document.getElementById('product-sku').value.trim();
  const barcode = document.getElementById('product-barcode').value.trim();
  const categoryId = document.getElementById('product-category').value;
  const supplierId = document.getElementById('product-supplier').value;
  const unit = document.getElementById('product-unit').value.trim();
  const costPrice = parseFloat(document.getElementById('product-cost').value) || 0;
  const sellingPrice = parseFloat(document.getElementById('product-price').value) || 0;
  const stock = parseInt(document.getElementById('product-stock').value, 10) || 0;
  const threshold = parseInt(document.getElementById('product-threshold').value, 10) || 15;
  const description = document.getElementById('product-description').value.trim();

  if (!name || !sku || !categoryId || !supplierId) {
    showToast('Please fill out all required fields.', 'error');
    return;
  }

  const category = DataStore.getCategories().find(c => c.id === categoryId);
  const supplier = DataStore.getSuppliers().find(s => s.id === supplierId);

  const productData = {
    name,
    sku,
    barcode,
    categoryId,
    categoryName: category ? category.name : '',
    supplierId,
    supplierName: supplier ? supplier.name : '',
    unit,
    costPrice,
    sellingPrice,
    stock,
    threshold,
    description,
    icon: 'package'
  };

  if (editingProductId) {
    DataStore.updateProduct(editingProductId, productData);
    showToast(`Updated product "${name}".`, 'success');
  } else {
    DataStore.addProduct(productData);
    showToast(`Added product "${name}".`, 'success');
  }

  closeProductModal();
  refreshProductList();
}

/**
 * Stock Adjustment Modal
 */
let adjustingProductId = null;

function openStockAdjustModal(id) {
  adjustingProductId = id;
  const prod = DataStore.getProductById(id);
  if (!prod) return;

  const modal = document.getElementById('stock-adjust-modal');
  document.getElementById('adjust-product-name').textContent = prod.name;
  document.getElementById('adjust-current-stock').textContent = prod.stock;
  document.getElementById('adjust-new-stock').value = prod.stock;
  document.getElementById('adjust-reason').value = 'Physical Stock Audit';

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
    showToast('Please enter a valid non-negative quantity.', 'error');
    return;
  }

  DataStore.adjustStock(adjustingProductId, newQty, reason);
  showToast('Stock quantity updated.', 'success');
  closeStockAdjustModal();
  refreshProductList();
}

/**
 * Delete Confirmation Modal
 */
function openDeleteModal(id) {
  deletingProductId = id;
  const prod = DataStore.getProductById(id);
  if (!prod) return;

  document.getElementById('delete-product-name').textContent = prod.name;
  const modal = document.getElementById('delete-product-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-product-modal');
  if (modal) modal.classList.add('hidden');
  deletingProductId = null;
}

/**
 * Export Products to CSV
 */
function exportProductsCSV() {
  const products = DataStore.getProducts();
  const headers = ['Product ID', 'Product Name', 'SKU', 'Barcode', 'Category', 'Supplier', 'Cost Price', 'Selling Price', 'Stock Qty', 'Threshold', 'Stock Status'];
  
  const rows = products.map(p => {
    let status = p.stock === 0 ? 'Out of Stock' : (p.stock <= p.threshold ? 'Low Stock' : 'In Stock');
    return [
      p.id,
      p.name,
      p.sku,
      p.barcode || '',
      p.categoryName,
      p.supplierName,
      p.costPrice.toFixed(2),
      p.sellingPrice.toFixed(2),
      p.stock,
      p.threshold,
      status
    ];
  });

  DataStore.exportToCSV(headers, rows, `stockflow-products-${new Date().toISOString().split('T')[0]}.csv`);
  showToast('Product list exported to CSV.', 'success');
}

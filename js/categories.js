/**
 * STOCKFLOW - Categories Management Page Logic
 * Handles category listing, product counts, add/edit modal, safe deletion checks, and search.
 */

let editingCategoryId = null;
let deletingCategoryId = null;

document.addEventListener('DOMContentLoaded', () => {
  initCategoriesPage();
});

function initCategoriesPage() {
  refreshCategoriesList();
  setupEventListeners();
}

function refreshCategoriesList() {
  DataStore.syncCategoryCounts();
  renderCategoriesGrid();
  renderCategoryKPIs();
  updateSidebarBadges();
}

function renderCategoryKPIs() {
  const categories = DataStore.getCategories();
  const products = DataStore.getProducts();

  const totalCatEl = document.getElementById('kpi-total-categories');
  const totalAssignedEl = document.getElementById('kpi-total-categorized-products');

  if (totalCatEl) totalCatEl.textContent = categories.length;
  if (totalAssignedEl) totalAssignedEl.textContent = `${products.length} Products Assigned`;
}

function setupEventListeners() {
  // Search
  const searchInput = document.getElementById('search-categories');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderCategoriesGrid();
    });
  }

  // Open Add Category Modal
  const addBtn = document.getElementById('open-add-category-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      openCategoryModal();
    });
  }

  // Form Submit
  const form = document.getElementById('category-form');
  if (form) {
    form.addEventListener('submit', handleCategoryFormSubmit);
  }

  // Confirm Delete
  const confirmDeleteBtn = document.getElementById('confirm-delete-category-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (deletingCategoryId) {
        const result = DataStore.deleteCategory(deletingCategoryId);
        if (!result.success) {
          showToast(result.message, 'error');
        } else {
          showToast('Category successfully deleted.', 'success');
          closeDeleteModal();
          refreshCategoriesList();
        }
      }
    });
  }
}

function renderCategoriesGrid() {
  const container = document.getElementById('categories-container');
  const emptyState = document.getElementById('categories-empty-state');
  if (!container) return;

  const searchQuery = (document.getElementById('search-categories')?.value || '').toLowerCase().trim();
  let categories = DataStore.getCategories();

  if (searchQuery) {
    categories = categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery) || 
      (c.description && c.description.toLowerCase().includes(searchQuery))
    );
  }

  if (categories.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = categories.map(cat => `
    <div class="p-5 rounded-2xl bg-white dark:bg-charcoal-800 border border-charcoal/10 dark:border-charcoal-700 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between">
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
            <i data-lucide="folder" class="w-5 h-5"></i>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cream dark:bg-charcoal-900 border border-charcoal/10 text-charcoal/70 dark:text-cream/70">
            ${cat.productCount || 0} Products
          </span>
        </div>
        <div>
          <h3 class="font-display font-bold text-base text-charcoal dark:text-cream">${cat.name}</h3>
          <p class="text-xs text-charcoal/60 dark:text-cream/60 mt-1 line-clamp-2">${cat.description || 'General retail category.'}</p>
        </div>
      </div>

      <div class="pt-3 border-t border-charcoal/10 dark:border-charcoal-700 flex items-center justify-between text-xs text-charcoal/50 dark:text-cream/50">
        <span>Created: ${cat.createdAt || '2026-10-10'}</span>
        <div class="flex items-center gap-1.5">
          <button 
            type="button" 
            onclick="openCategoryModal('${cat.id}')" 
            class="p-1.5 rounded-lg text-charcoal/60 dark:text-cream/60 hover:text-brand hover:bg-cream dark:hover:bg-charcoal-700 transition"
            title="Edit Category"
          >
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button 
            type="button" 
            onclick="openDeleteCategoryModal('${cat.id}')" 
            class="p-1.5 rounded-lg text-charcoal/60 dark:text-cream/60 hover:text-danger hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            title="Delete Category"
          >
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons({ root: container });
}

function openCategoryModal(id = null) {
  editingCategoryId = id;
  const modal = document.getElementById('category-modal');
  const title = document.getElementById('category-modal-title');
  const form = document.getElementById('category-form');
  if (!modal || !form) return;

  form.reset();

  if (id) {
    const categories = DataStore.getCategories();
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    title.textContent = 'Edit Category';
    document.getElementById('category-name').value = cat.name;
    document.getElementById('category-description').value = cat.description || '';
  } else {
    title.textContent = 'Add Category';
  }

  modal.classList.remove('hidden');
}

function closeCategoryModal() {
  const modal = document.getElementById('category-modal');
  if (modal) modal.classList.add('hidden');
  editingCategoryId = null;
}

function handleCategoryFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('category-name').value.trim();
  const description = document.getElementById('category-description').value.trim();

  if (!name) {
    showToast('Category name is required.', 'error');
    return;
  }

  if (editingCategoryId) {
    DataStore.updateCategory(editingCategoryId, { name, description });
    showToast(`Updated category "${name}".`, 'success');
  } else {
    DataStore.addCategory({ name, description });
    showToast(`Created category "${name}".`, 'success');
  }

  closeCategoryModal();
  refreshCategoriesList();
}

function openDeleteCategoryModal(id) {
  deletingCategoryId = id;
  const categories = DataStore.getCategories();
  const cat = categories.find(c => c.id === id);
  if (!cat) return;

  document.getElementById('delete-category-name').textContent = cat.name;
  const warningText = document.getElementById('delete-category-warning');
  
  const assigned = DataStore.getProducts().filter(p => p.categoryId === id).length;
  if (assigned > 0) {
    warningText.innerHTML = `
      <span class="text-danger font-bold block mt-1">
        Warning: This category has ${assigned} active product(s) assigned. You must reassign or remove them before deleting.
      </span>
    `;
    document.getElementById('confirm-delete-category-btn').disabled = true;
  } else {
    warningText.innerHTML = `This category currently has zero products assigned and can be safely removed.`;
    document.getElementById('confirm-delete-category-btn').disabled = false;
  }

  const modal = document.getElementById('delete-category-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-category-modal');
  if (modal) modal.classList.add('hidden');
  deletingCategoryId = null;
}

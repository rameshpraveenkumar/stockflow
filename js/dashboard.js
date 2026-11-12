/**
 * STOCKFLOW - Shared Dashboard UI & Interactions
 * Handles sidebar collapse, mobile drawer, topbar search, notifications, profile menu, and live badge updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Enforce session/demo user
  const user = Auth.requireAuth();

  initSidebar();
  initTopBar(user);
  updateSidebarBadges();

  if (window.lucide) {
    window.lucide.createIcons();
  }
});

/**
 * Sidebar Navigation & Responsive Drawer
 */
function initSidebar() {
  const sidebar = document.getElementById('dashboard-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const collapseDesktopBtn = document.getElementById('sidebar-collapse-desktop');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      const isClosed = sidebar.classList.contains('-translate-x-full') || (document.documentElement.getAttribute('dir') === 'rtl' && sidebar.classList.contains('translate-x-full'));
      
      if (isClosed) {
        sidebar.classList.remove('-translate-x-full', 'translate-x-full');
        if (sidebarOverlay) sidebarOverlay.classList.remove('hidden');
      } else {
        closeMobileSidebar();
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeMobileSidebar);
  }

  function closeMobileSidebar() {
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    if (sidebar) {
      sidebar.classList.add(isRtl ? 'translate-x-full' : '-translate-x-full');
    }
    if (sidebarOverlay) {
      sidebarOverlay.classList.add('hidden');
    }
  }

  // Active Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.sidebar-nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('sidebar-nav-active', 'bg-brand', 'text-white', 'shadow-sm');
      link.classList.remove('text-charcoal/70', 'text-charcoal/80', 'dark:text-cream/70', 'hover:bg-cream', 'dark:hover:bg-charcoal-800', 'dark:hover:bg-charcoal-700/60');
      const icon = link.querySelector('i');
      if (icon) {
        icon.classList.remove('text-brand');
        icon.classList.add('text-white');
      }
    }
  });

  // Handle direction change to reset mobile sidebar transform class
  window.addEventListener('directionchange', (e) => {
    const isRtl = e.detail.dir === 'rtl';
    if (sidebar && sidebar.classList.contains('mobile-closed')) {
      sidebar.classList.remove('-translate-x-full', 'translate-x-full');
      sidebar.classList.add(isRtl ? 'translate-x-full' : '-translate-x-full');
    }
  });
}

/**
 * TopBar: Notifications, Global Search, Profile Dropdown
 */
function initTopBar(user) {
  // Update retailer profile name, email, and role badges
  updateUserDisplay(user);

  window.addEventListener('auth-role-changed', (e) => {
    updateUserDisplay(e.detail);
  });

  function updateUserDisplay(currentUser) {
    const userNameEls = document.querySelectorAll('.retailer-name-display');
    userNameEls.forEach(el => el.textContent = currentUser.name || 'Store Manager');

    const userEmailEls = document.querySelectorAll('.retailer-email-display');
    userEmailEls.forEach(el => el.textContent = currentUser.email || 'retailer@stockflow.demo');

    const userRoleEls = document.querySelectorAll('.retailer-role-display');
    userRoleEls.forEach(el => el.textContent = currentUser.role || 'Store Manager (Admin)');

    const userRoleBadges = document.querySelectorAll('.retailer-role-badge');
    userRoleBadges.forEach(badge => {
      badge.textContent = currentUser.roleShort || (currentUser.roleKey === 'user' ? 'Associate' : 'Manager');
      const displayCls = badge.closest('#user-profile-dropdown') ? 'inline-flex' : 'hidden sm:inline-flex';
      if (currentUser.roleKey === 'user') {
        badge.className = `retailer-role-badge ${displayCls} items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20`;
      } else {
        badge.className = `retailer-role-badge ${displayCls} items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/15 text-brand border border-brand/20`;
      }
    });

    // Update avatar initials
    const initials = (currentUser.name || 'Alex Morgan')
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    const avatarInitialsEls = document.querySelectorAll('.retailer-avatar-initials');
    avatarInitialsEls.forEach(el => el.textContent = initials || 'AM');
  }

  // Profile Dropdown Toggle
  const profileBtn = document.getElementById('user-profile-btn');
  const profileDropdown = document.getElementById('user-profile-dropdown');
  if (profileBtn && profileDropdown) {
    // Inject active role badge and role switcher into profile dropdown if not already present
    if (!profileDropdown.querySelector('.role-switch-container')) {
      const activeRole = user.roleKey || 'admin';
      const activeClass = 'role-switch-btn px-2 py-1 rounded bg-brand text-white font-semibold text-center transition';
      const inactiveClass = 'role-switch-btn px-2 py-1 rounded bg-cream dark:bg-charcoal-700 text-charcoal dark:text-cream font-medium text-center hover:bg-cream-200 transition';
      const switcherDiv = document.createElement('div');
      switcherDiv.className = 'role-switch-container px-3 py-2 border-b border-charcoal/10 dark:border-charcoal-700 bg-cream/40 dark:bg-charcoal-900/40';
      switcherDiv.innerHTML = `
        <div class="flex items-center justify-between text-[11px] mb-1.5">
          <span class="text-charcoal/60 dark:text-cream/60 font-medium">Active Role:</span>
          <span class="retailer-role-badge inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/15 text-brand border border-brand/20">${user.roleShort || 'Manager'}</span>
        </div>
        <div class="grid grid-cols-2 gap-1 text-[11px]">
          <button type="button" data-role="admin" class="${activeRole === 'admin' ? activeClass : inactiveClass}">Admin</button>
          <button type="button" data-role="user" class="${activeRole === 'user' ? activeClass : inactiveClass}">User</button>
        </div>
      `;
      profileDropdown.insertBefore(switcherDiv, profileDropdown.children[1] || null);

      switcherDiv.querySelectorAll('.role-switch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetRole = btn.getAttribute('data-role');
          const updated = Auth.switchRole(targetRole);
          showToast(`Switched active role to: ${updated.role}`, 'info');

          // Update active button state
          switcherDiv.querySelectorAll('.role-switch-btn').forEach(b => {
            if (b.getAttribute('data-role') === targetRole) {
              b.className = activeClass;
            } else {
              b.className = inactiveClass;
            }
          });
        });
      });
    }

    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('hidden');
      closeNotifications();
    });
  }

  // Notifications Dropdown Toggle
  const notifBtn = document.getElementById('notifications-btn');
  const notifDropdown = document.getElementById('notifications-dropdown');
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
      closeProfile();
      renderNotificationsList();
    });
  }

  function closeProfile() {
    if (profileDropdown) profileDropdown.classList.add('hidden');
  }

  function closeNotifications() {
    if (notifDropdown) notifDropdown.classList.add('hidden');
  }

  // Global click outside to close dropdowns
  document.addEventListener('click', () => {
    closeProfile();
    closeNotifications();
  });

  // Prevent dropdown contents click from closing
  if (profileDropdown) profileDropdown.addEventListener('click', e => e.stopPropagation());
  if (notifDropdown) notifDropdown.addEventListener('click', e => e.stopPropagation());

  // Logout triggers
  const logoutBtns = document.querySelectorAll('.logout-trigger');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
    });
  });

  // Global Quick Search
  const searchInput = document.getElementById('global-quick-search');
  const searchResults = document.getElementById('global-search-results');
  if (searchInput && searchResults) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        searchResults.classList.add('hidden');
        return;
      }

      const products = DataStore.getProducts();
      const orders = DataStore.getPurchaseOrders();

      const matchedProds = products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        p.categoryName.toLowerCase().includes(q)
      ).slice(0, 4);

      const matchedOrders = orders.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.supplierName.toLowerCase().includes(q)
      ).slice(0, 3);

      if (matchedProds.length === 0 && matchedOrders.length === 0) {
        searchResults.innerHTML = `
          <div class="p-3 text-xs text-charcoal/60 dark:text-cream/60 text-center">
            No products or orders found for "${q}".
          </div>
        `;
      } else {
        let html = '';
        if (matchedProds.length > 0) {
          html += `<div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50 bg-cream/50 dark:bg-charcoal-900">Products</div>`;
          matchedProds.forEach(p => {
            html += `
              <a href="products.html" class="flex items-center justify-between px-3 py-2 text-xs hover:bg-cream dark:hover:bg-charcoal-700 transition">
                <div>
                  <span class="font-bold text-charcoal dark:text-cream block">${p.name}</span>
                  <span class="text-[10px] text-charcoal/50 dark:text-cream/50">${p.sku} • ${p.categoryName}</span>
                </div>
                <span class="font-mono font-bold ${p.stock <= p.threshold ? 'text-danger' : 'text-success'}">${p.stock} units</span>
              </a>
            `;
          });
        }

        if (matchedOrders.length > 0) {
          html += `<div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50 bg-cream/50 dark:bg-charcoal-900 border-t border-charcoal/10 dark:border-charcoal-700">Purchase Orders</div>`;
          matchedOrders.forEach(o => {
            html += `
              <a href="purchase-orders.html" class="flex items-center justify-between px-3 py-2 text-xs hover:bg-cream dark:hover:bg-charcoal-700 transition">
                <div>
                  <span class="font-mono font-bold text-charcoal dark:text-cream block">${o.id}</span>
                  <span class="text-[10px] text-charcoal/50 dark:text-cream/50">${o.supplierName}</span>
                </div>
                <span class="font-bold text-brand">$${o.totalAmount.toFixed(2)}</span>
              </a>
            `;
          });
        }

        searchResults.innerHTML = html;
      }

      searchResults.classList.remove('hidden');
    });

    // Close search results on escape or blur
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') searchResults.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
      }
    });
  }
}

/**
 * Render Live Notifications in Dropdown
 */
function renderNotificationsList() {
  const container = document.getElementById('notifications-list-container');
  if (!container) return;

  const alerts = DataStore.getStockAlerts();
  const orders = DataStore.getPurchaseOrders().filter(o => o.status === 'Pending' || o.status === 'Partially Received');

  if (alerts.length === 0 && orders.length === 0) {
    container.innerHTML = `
      <div class="p-4 text-center text-xs text-charcoal/60 dark:text-cream/60">
        <i data-lucide="check-circle" class="w-6 h-6 text-success mx-auto mb-1"></i>
        <span>All stock levels healthy. No pending alerts.</span>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  let html = '';
  // Top 3 stock alerts
  alerts.slice(0, 3).forEach(alert => {
    html += `
      <a href="stock-alerts.html" class="flex items-start gap-2.5 p-3 rounded-lg hover:bg-cream dark:hover:bg-charcoal-700/60 transition text-xs border-b border-charcoal/5 dark:border-charcoal-700">
        <div class="w-7 h-7 rounded-md bg-red-100 text-danger flex items-center justify-center flex-shrink-0 mt-0.5">
          <i data-lucide="alert-triangle" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-charcoal dark:text-cream truncate">${alert.name}</div>
          <div class="text-[11px] text-danger">${alert.stock === 0 ? 'Out of stock!' : `${alert.stock} units remaining (Threshold: ${alert.threshold})`}</div>
        </div>
      </a>
    `;
  });

  // Top 2 pending orders
  orders.slice(0, 2).forEach(order => {
    html += `
      <a href="purchase-orders.html" class="flex items-start gap-2.5 p-3 rounded-lg hover:bg-cream dark:hover:bg-charcoal-700/60 transition text-xs">
        <div class="w-7 h-7 rounded-md bg-amber-100 text-brand flex items-center justify-center flex-shrink-0 mt-0.5">
          <i data-lucide="truck" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-bold text-charcoal dark:text-cream">${order.id} (${order.status})</div>
          <div class="text-[11px] text-charcoal/60 dark:text-cream/60 truncate">${order.supplierName} • $${order.totalAmount.toFixed(2)}</div>
        </div>
      </a>
    `;
  });

  container.innerHTML = html;
  if (window.lucide) window.lucide.createIcons();
}

/**
 * Dynamic Badge Counter Updates for Sidebar
 */
function updateSidebarBadges() {
  const alertsBadge = document.getElementById('sidebar-alerts-badge');
  const poBadge = document.getElementById('sidebar-po-badge');

  if (alertsBadge) {
    const alerts = DataStore.getStockAlerts();
    if (alerts.length > 0) {
      alertsBadge.textContent = alerts.length;
      alertsBadge.classList.remove('hidden');
    } else {
      alertsBadge.classList.add('hidden');
    }
  }

  if (poBadge) {
    const orders = DataStore.getPurchaseOrders();
    const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Partially Received').length;
    if (pendingCount > 0) {
      poBadge.textContent = pendingCount;
      poBadge.classList.remove('hidden');
    } else {
      poBadge.classList.add('hidden');
    }
  }

  // Topbar unread notification indicator dot
  const notifDot = document.getElementById('notif-unread-dot');
  if (notifDot) {
    const alerts = DataStore.getStockAlerts();
    if (alerts.length > 0) {
      notifDot.classList.remove('hidden');
    } else {
      notifDot.classList.add('hidden');
    }
  }
}

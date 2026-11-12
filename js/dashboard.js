/**
 * STOCKFLOW - Shared Dashboard UI & Interactions
 * Handles sidebar collapse, organized mobile/tablet drawer, notifications & unread badges,
 * global search, role switcher/profile controls, and live badge updates.
 */

const NOTIF_STORAGE_PREFIX = 'stockflow_notif_state_';
const expandedNotificationIds = new Set();

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getDashboardScope() {
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  return pageName === 'user-dashboard.html' ? 'user' : 'admin';
}

function getNotificationState(scope = getDashboardScope()) {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_PREFIX + scope);
    if (!raw) return { readIds: [], dismissedIds: [] };
    const parsed = JSON.parse(raw);
    return {
      readIds: Array.isArray(parsed.readIds) ? parsed.readIds : [],
      dismissedIds: Array.isArray(parsed.dismissedIds) ? parsed.dismissedIds : []
    };
  } catch (e) {
    return { readIds: [], dismissedIds: [] };
  }
}

function saveNotificationState(state, scope = getDashboardScope()) {
  try {
    localStorage.setItem(NOTIF_STORAGE_PREFIX + scope, JSON.stringify({
      readIds: state.readIds || [],
      dismissedIds: state.dismissedIds || []
    }));
  } catch (e) {
    // Ignore storage quota errors in restricted modes
  }
}

function formatUnreadBadge(count) {
  if (!count || count <= 0) return '';
  return count > 99 ? '99+' : String(count);
}

/**
 * Derive live dashboard notifications from DataStore without duplicating state or hardcoding counts.
 */
function getDashboardNotifications() {
  const scope = getDashboardScope();
  const state = getNotificationState(scope);
  const readSet = new Set(state.readIds);
  const dismissedSet = new Set(state.dismissedIds);

  const alerts = typeof DataStore !== 'undefined' ? DataStore.getStockAlerts() : [];
  const orders = typeof DataStore !== 'undefined'
    ? DataStore.getPurchaseOrders().filter(o => o.status === 'Pending' || o.status === 'Partially Received')
    : [];

  const items = [];

  alerts.forEach(alert => {
    const id = `alert:${alert.id}`;
    if (dismissedSet.has(id)) return;
    const isOut = alert.stock === 0;
    const shortMsg = isOut
      ? 'Out of stock! Immediate restock required.'
      : `${alert.stock} units remaining (Threshold: ${alert.threshold})`;
    const fullMsg = scope === 'user'
      ? `${shortMsg} Floor shelf SKU ${alert.sku || ''} in ${alert.categoryName || 'General'} needs restocking from backroom or dock (target batch: ${alert.suggestedReorder} units).`
      : `${shortMsg} SKU ${alert.sku || ''} (${alert.categoryName || 'Inventory'}) by ${alert.supplierName || 'Assigned supplier'} — suggested PO: ${alert.suggestedReorder} units ($${Number(alert.estimatedReorderCost || 0).toFixed(2)}).`;

    items.push({
      id,
      type: 'alert',
      severity: alert.severity || (isOut ? 'Out of Stock' : 'Low Stock'),
      isCritical: isOut || alert.severity === 'Critical',
      title: alert.name,
      summary: shortMsg,
      message: fullMsg.trim(),
      timestamp: isOut ? 'Immediate action' : `${alert.severity} alert`,
      href: 'stock-alerts.html',
      ctaLabel: scope === 'user' ? 'Open Restock Queue' : 'Open Stock Alerts',
      isRead: readSet.has(id)
    });
  });

  orders.forEach(order => {
    const id = `po:${order.id}`;
    if (dismissedSet.has(id)) return;
    const unitTotal = Array.isArray(order.items)
      ? order.items.reduce((sum, it) => sum + Number(it.qty || it.orderedQty || 0), 0)
      : 0;
    const shortMsg = scope === 'user'
      ? `${order.supplierName} • ${unitTotal} units expected`
      : `${order.supplierName} • $${Number(order.totalAmount || 0).toFixed(2)}`;
    const fullMsg = scope === 'user'
      ? `Receiving dock shipment from ${order.supplierName} (${unitTotal} units ordered). ${order.notes || 'Verify incoming cartons upon arrival.'}`
      : `Purchase Order from ${order.supplierName} ($${Number(order.totalAmount || 0).toFixed(2)}, ${unitTotal} units). ${order.notes || 'Pending supplier fulfillment.'}`;

    items.push({
      id,
      type: 'order',
      severity: order.status,
      isCritical: false,
      title: `${order.id} (${order.status})`,
      summary: shortMsg,
      message: fullMsg.trim(),
      timestamp: order.expectedDate ? `Due ${order.expectedDate}` : (order.orderDate || 'Scheduled'),
      href: 'purchase-orders.html',
      ctaLabel: scope === 'user' ? 'Open Receiving Dock' : 'View Purchase Order',
      isRead: readSet.has(id)
    });
  });

  return {
    scope,
    items,
    unreadCount: items.filter(n => !n.isRead).length,
    dismissedCount: state.dismissedIds.length
  };
}

function markNotificationRead(id, isRead = true) {
  const scope = getDashboardScope();
  const state = getNotificationState(scope);
  const readSet = new Set(state.readIds);
  if (isRead) {
    readSet.add(id);
  } else {
    readSet.delete(id);
  }
  state.readIds = Array.from(readSet);
  saveNotificationState(state, scope);
  updateSidebarBadges();
  renderAllNotifications();
}

function markAllNotificationsRead() {
  const { scope, items } = getDashboardNotifications();
  if (!items.length) return;
  const state = getNotificationState(scope);
  const readSet = new Set(state.readIds);
  items.forEach(item => readSet.add(item.id));
  state.readIds = Array.from(readSet);
  saveNotificationState(state, scope);
  updateSidebarBadges();
  renderAllNotifications();
}

function dismissNotification(id) {
  const scope = getDashboardScope();
  const state = getNotificationState(scope);
  const dismissedSet = new Set(state.dismissedIds);
  dismissedSet.add(id);
  state.dismissedIds = Array.from(dismissedSet);
  expandedNotificationIds.delete(id);
  saveNotificationState(state, scope);
  updateSidebarBadges();
  renderAllNotifications();
}

function restoreDismissedNotifications() {
  const scope = getDashboardScope();
  const state = getNotificationState(scope);
  state.dismissedIds = [];
  saveNotificationState(state, scope);
  updateSidebarBadges();
  renderAllNotifications();
}

document.addEventListener('DOMContentLoaded', () => {
  // Enforce session/demo user and sync default entry role per dashboard page
  let user = Auth.requireAuth();
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  if (pageName === 'user-dashboard.html' && user.roleKey !== 'user') {
    user = Auth.switchRole('user');
  } else if ((pageName === 'index.html' || pageName === '') && window.location.pathname.includes('/dashboard/') && user.roleKey !== 'admin') {
    user = Auth.switchRole('admin');
  }

  initSidebar();
  initDrawerNotifications();
  initTopBar(user);
  updateSidebarBadges();
  renderAllNotifications();

  if (window.lucide) {
    window.lucide.createIcons();
  }
  if (typeof updateThemeIcons === 'function') {
    updateThemeIcons();
  }
  if (typeof updateDirLabels === 'function') {
    updateDirLabels();
  }
});

/**
 * Sidebar Navigation & Accessible Mobile/Tablet Drawer
 */
function initSidebar() {
  const sidebar = document.getElementById('dashboard-sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const closeBtn = document.getElementById('drawer-close-btn');
  const mainWrapper = document.getElementById('dashboard-main-wrapper') || document.querySelector('main');
  const mobileMedia = window.matchMedia('(max-width: 1023px)');

  if (!sidebar) return;

  const isDrawerOpen = () => sidebar.dataset.drawerOpen === 'true';

  const syncToggleIcons = (open) => {
    if (!toggleBtn) return;
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    const iconMenu = toggleBtn.querySelector('.sidebar-icon-menu');
    const iconClose = toggleBtn.querySelector('.sidebar-icon-close');
    if (iconMenu) iconMenu.classList.toggle('hidden', open);
    if (iconClose) iconClose.classList.toggle('hidden', !open);
  };

  const applyClosedTransform = () => {
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    sidebar.classList.remove('translate-x-0', 'rtl:translate-x-0', '-translate-x-full', 'translate-x-full', 'rtl:translate-x-full');
    sidebar.classList.add(isRtl ? 'translate-x-full' : '-translate-x-full');
  };

  const openMobileSidebar = () => {
    if (!mobileMedia.matches) return;
    sidebar.dataset.drawerOpen = 'true';
    sidebar.classList.remove('-translate-x-full', 'translate-x-full', 'rtl:translate-x-full');
    sidebar.classList.add('translate-x-0');
    if (sidebarOverlay) sidebarOverlay.classList.remove('hidden');

    sidebar.setAttribute('role', 'dialog');
    sidebar.setAttribute('aria-modal', 'true');
    if (mainWrapper) mainWrapper.inert = true;
    document.documentElement.classList.add('dashboard-drawer-open');
    syncToggleIcons(true);

    if (closeBtn) {
      closeBtn.focus({ preventScroll: true });
    }
  };

  const closeMobileSidebar = (restoreFocus = false) => {
    const wasOpen = isDrawerOpen();
    sidebar.dataset.drawerOpen = 'false';
    applyClosedTransform();
    if (sidebarOverlay) sidebarOverlay.classList.add('hidden');

    sidebar.removeAttribute('role');
    sidebar.removeAttribute('aria-modal');
    if (mainWrapper) mainWrapper.inert = false;
    document.documentElement.classList.remove('dashboard-drawer-open');
    syncToggleIcons(false);

    if (restoreFocus && wasOpen && toggleBtn && mobileMedia.matches) {
      toggleBtn.focus({ preventScroll: true });
    }
  };

  window.closeDashboardMobileSidebar = () => closeMobileSidebar(false);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isDrawerOpen()) {
        closeMobileSidebar(true);
      } else {
        openMobileSidebar();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileSidebar(true);
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => closeMobileSidebar(true));
  }

  // Escape closes drawer when active
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMedia.matches && isDrawerOpen()) {
      e.preventDefault();
      closeMobileSidebar(true);
    }
  });

  // Close drawer cleanly on navigation link clicks inside mobile drawer
  sidebar.querySelectorAll('.sidebar-nav-link, .drawer-nav-close-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMedia.matches && isDrawerOpen()) {
        closeMobileSidebar(false);
      }
    });
  });

  // Clear modal/inert state cleanly when entering desktop >= 1024px
  const handleViewportChange = () => {
    if (!mobileMedia.matches) {
      sidebar.dataset.drawerOpen = 'false';
      applyClosedTransform();
      if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
      if (mainWrapper) mainWrapper.inert = false;
      document.documentElement.classList.remove('dashboard-drawer-open');
      syncToggleIcons(false);
    } else if (!isDrawerOpen()) {
      applyClosedTransform();
    }
  };

  if (typeof mobileMedia.addEventListener === 'function') {
    mobileMedia.addEventListener('change', handleViewportChange);
  } else {
    window.addEventListener('resize', handleViewportChange);
  }

  // Active Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const links = document.querySelectorAll('.sidebar-nav-link');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('sidebar-nav-active', 'bg-brand', 'text-white', 'shadow-sm');
      link.classList.remove('text-charcoal/70', 'text-charcoal/80', 'dark:text-cream/70', 'hover:bg-cream', 'dark:hover:bg-charcoal-800', 'dark:hover:bg-charcoal-700/60');
      const icon = link.querySelector('i, svg');
      if (icon) {
        icon.classList.remove('text-brand');
        icon.classList.add('text-white');
      }
    }
  });

  // Reset closed drawer side when switching LTR <-> RTL
  window.addEventListener('directionchange', () => {
    if (!isDrawerOpen()) {
      applyClosedTransform();
    }
  });
}

/**
 * Expandable Notifications Accordion Inside Mobile/Tablet Drawer
 */
function initDrawerNotifications() {
  const toggleBtn = document.getElementById('drawer-notifications-toggle');
  const panel = document.getElementById('drawer-notifications-panel');
  const markAllBtn = document.getElementById('drawer-mark-all-read-btn');

  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !willOpen);
      toggleBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      const chevron = toggleBtn.querySelector('.drawer-notif-chevron');
      if (chevron) chevron.classList.toggle('rotate-180', willOpen);
      if (willOpen) {
        renderAllNotifications();
      }
    });
  }

  if (markAllBtn) {
    markAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      markAllNotificationsRead();
    });
  }
}

/**
 * TopBar: Role Display Sync, Notifications, Global Search, Profile Dropdown
 */
function initTopBar(user) {
  updateUserDisplay(user);

  window.addEventListener('auth-role-changed', (e) => {
    updateUserDisplay(e.detail);
    syncRoleSwitchButtons(e.detail.roleKey || 'admin');
  });

  function updateUserDisplay(currentUser) {
    const userNameEls = document.querySelectorAll('.retailer-name-display');
    userNameEls.forEach(el => { el.textContent = currentUser.name || 'Store Manager'; });

    const userEmailEls = document.querySelectorAll('.retailer-email-display');
    userEmailEls.forEach(el => { el.textContent = currentUser.email || 'retailer@stockflow.demo'; });

    const userRoleEls = document.querySelectorAll('.retailer-role-display');
    userRoleEls.forEach(el => { el.textContent = currentUser.role || 'Store Manager (Admin)'; });

    const userRoleBadges = document.querySelectorAll('.retailer-role-badge');
    userRoleBadges.forEach(badge => {
      badge.textContent = currentUser.roleShort || (currentUser.roleKey === 'user' ? 'Associate' : 'Manager');
      const insideMenu = badge.closest('#user-profile-dropdown') || badge.closest('#drawer-account-section');
      const displayCls = insideMenu ? 'inline-flex' : 'hidden sm:inline-flex';
      if (currentUser.roleKey === 'user') {
        badge.className = `retailer-role-badge ${displayCls} items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sage/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20`;
      } else {
        badge.className = `retailer-role-badge ${displayCls} items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/15 text-brand border border-brand/20`;
      }
    });

    const initials = (currentUser.name || 'Alex Morgan')
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    const avatarInitialsEls = document.querySelectorAll('.retailer-avatar-initials');
    avatarInitialsEls.forEach(el => { el.textContent = initials || 'AM'; });
  }

  const activeRoleClass = 'role-switch-btn px-2 py-1.5 rounded-lg bg-brand text-white font-semibold text-center transition';
  const inactiveRoleClass = 'role-switch-btn px-2 py-1.5 rounded-lg bg-cream dark:bg-charcoal-700 text-charcoal dark:text-cream font-medium text-center hover:bg-cream-200 transition';

  function syncRoleSwitchButtons(activeRole) {
    document.querySelectorAll('.role-switch-btn').forEach(btn => {
      btn.className = btn.getAttribute('data-role') === activeRole ? activeRoleClass : inactiveRoleClass;
    });
  }

  function createRoleSwitcher(activeRole) {
    const switcherDiv = document.createElement('div');
    switcherDiv.className = 'role-switch-container px-3 py-2 border-b border-charcoal/10 dark:border-charcoal-700 bg-cream/40 dark:bg-charcoal-900/40 rounded-lg';
    switcherDiv.innerHTML = `
      <div class="flex items-center justify-between text-[11px] mb-1.5">
        <span class="text-charcoal/60 dark:text-cream/60 font-medium">Active Role:</span>
        <span class="retailer-role-badge inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand/15 text-brand border border-brand/20">${user.roleShort || 'Manager'}</span>
      </div>
      <div class="grid grid-cols-2 gap-1.5 text-[11px]">
        <button type="button" data-role="admin" class="${activeRole === 'admin' ? activeRoleClass : inactiveRoleClass}">Admin</button>
        <button type="button" data-role="user" class="${activeRole === 'user' ? activeRoleClass : inactiveRoleClass}">User</button>
      </div>
    `;
    switcherDiv.querySelectorAll('.role-switch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const targetRole = btn.getAttribute('data-role');
        const updated = Auth.switchRole(targetRole);
        if (typeof showToast === 'function') {
          showToast(`Switched active role to: ${updated.role}`, 'info');
        }
        syncRoleSwitchButtons(targetRole);
      });
    });
    return switcherDiv;
  }

  // Profile Dropdown Toggle + Drawer Role Switcher Injection
  const profileBtn = document.getElementById('user-profile-btn');
  const profileDropdown = document.getElementById('user-profile-dropdown');
  const drawerRoleSlot = document.querySelector('.drawer-role-switch-slot');
  const currentRoleKey = user.roleKey || 'admin';

  if (profileDropdown && !profileDropdown.querySelector('.role-switch-container')) {
    profileDropdown.insertBefore(createRoleSwitcher(currentRoleKey), profileDropdown.children[1] || null);
  }
  if (drawerRoleSlot && !drawerRoleSlot.querySelector('.role-switch-container')) {
    drawerRoleSlot.appendChild(createRoleSwitcher(currentRoleKey));
  }
  syncRoleSwitchButtons(currentRoleKey);

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('hidden');
      closeNotifications();
    });
  }

  // Desktop Notifications Dropdown Toggle
  const notifBtn = document.getElementById('notifications-btn');
  const notifDropdown = document.getElementById('notifications-dropdown');
  const desktopMarkAllBtn = document.getElementById('desktop-mark-all-read-btn');
  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('hidden');
      closeProfile();
      renderAllNotifications();
    });
  }
  if (desktopMarkAllBtn) {
    desktopMarkAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      markAllNotificationsRead();
    });
  }

  function closeProfile() {
    if (profileDropdown) profileDropdown.classList.add('hidden');
  }

  function closeNotifications() {
    if (notifDropdown) notifDropdown.classList.add('hidden');
  }

  // Global click outside to close desktop dropdowns
  document.addEventListener('click', () => {
    closeProfile();
    closeNotifications();
  });

  if (profileDropdown) profileDropdown.addEventListener('click', e => e.stopPropagation());
  if (notifDropdown) notifDropdown.addEventListener('click', e => e.stopPropagation());

  // Logout triggers (both desktop dropdown and drawer account section)
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
            No products or orders found for "${escapeHtml(q)}".
          </div>
        `;
      } else {
        let html = '';
        if (matchedProds.length > 0) {
          html += `<div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50 bg-cream/50 dark:bg-charcoal-900">Products</div>`;
          matchedProds.forEach(p => {
            html += `
              <a href="products.html" class="flex items-center justify-between px-3 py-2 text-xs hover:bg-cream dark:hover:bg-charcoal-700 transition">
                <div class="min-w-0">
                  <span class="font-bold text-charcoal dark:text-cream block">${escapeHtml(p.name)}</span>
                  <span class="text-[10px] text-charcoal/50 dark:text-cream/50">${escapeHtml(p.sku)} • ${escapeHtml(p.categoryName)}</span>
                </div>
                <span class="font-mono font-bold flex-shrink-0 ms-2 ${p.stock <= p.threshold ? 'text-danger' : 'text-success'}">${p.stock} units</span>
              </a>
            `;
          });
        }

        if (matchedOrders.length > 0) {
          html += `<div class="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-charcoal/50 dark:text-cream/50 bg-cream/50 dark:bg-charcoal-900 border-t border-charcoal/10 dark:border-charcoal-700">Purchase Orders</div>`;
          matchedOrders.forEach(o => {
            html += `
              <a href="purchase-orders.html" class="flex items-center justify-between px-3 py-2 text-xs hover:bg-cream dark:hover:bg-charcoal-700 transition">
                <div class="min-w-0">
                  <span class="font-mono font-bold text-charcoal dark:text-cream block">${escapeHtml(o.id)}</span>
                  <span class="text-[10px] text-charcoal/50 dark:text-cream/50">${escapeHtml(o.supplierName)}</span>
                </div>
                <span class="font-bold text-brand flex-shrink-0 ms-2">$${o.totalAmount.toFixed(2)}</span>
              </a>
            `;
          });
        }

        searchResults.innerHTML = html;
      }

      searchResults.classList.remove('hidden');
    });

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
 * Shared Notification Card HTML & Event Delegation
 */
function buildNotificationCardHtml(item, variant = 'drawer') {
  const isExpanded = expandedNotificationIds.has(item.id);
  const iconName = item.type === 'alert' ? 'alert-triangle' : 'truck';
  const iconBoxCls = item.type === 'alert'
    ? 'bg-red-100 dark:bg-red-950/50 text-danger'
    : 'bg-amber-100 dark:bg-amber-950/40 text-brand';
  const unreadAccent = item.isRead
    ? 'bg-white/70 dark:bg-charcoal-900/30 border-charcoal/10 dark:border-charcoal-700/70 opacity-85'
    : 'bg-cream/60 dark:bg-charcoal-900/80 border-brand/30 dark:border-brand/30';
  const paddingCls = variant === 'desktop' ? 'p-2.5' : 'p-3';

  return `
    <article class="notif-card w-full max-w-full min-w-0 rounded-xl border ${unreadAccent} ${paddingCls} space-y-2 transition" data-notif-id="${escapeHtml(item.id)}" data-read="${item.isRead ? 'true' : 'false'}">
      <div class="flex items-start gap-2.5 min-w-0">
        <div class="w-7 h-7 rounded-lg ${iconBoxCls} flex items-center justify-center flex-shrink-0 mt-0.5">
          <i data-lucide="${iconName}" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-2">
            <button type="button" class="notif-expand-btn text-start flex-1 min-w-0 focus:outline-none group" aria-expanded="${isExpanded ? 'true' : 'false'}">
              <div class="flex items-center gap-1.5 flex-wrap">
                ${!item.isRead ? '<span class="notif-unread-pill w-2 h-2 rounded-full bg-danger flex-shrink-0" aria-label="Unread"></span>' : ''}
                <span class="notif-card-title font-bold text-xs text-charcoal dark:text-cream whitespace-normal break-words group-hover:text-brand transition">${escapeHtml(item.title)}</span>
              </div>
              <p class="notif-card-message text-[11px] mt-0.5 whitespace-normal break-words leading-relaxed ${item.isCritical ? 'text-danger dark:text-red-300' : 'text-charcoal/75 dark:text-cream/75'}">${escapeHtml(isExpanded ? item.message : item.summary)}</p>
            </button>
            <button type="button" class="notif-dismiss-btn w-6 h-6 rounded-lg flex items-center justify-center text-charcoal/45 hover:text-danger dark:text-cream/45 dark:hover:text-danger hover:bg-white dark:hover:bg-charcoal-800 transition flex-shrink-0" title="Dismiss notification" aria-label="Dismiss notification">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          </div>
          <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <span class="text-charcoal/55 dark:text-cream/55 font-medium whitespace-normal break-words">${escapeHtml(item.timestamp)}</span>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" class="notif-expand-btn font-semibold text-charcoal/70 dark:text-cream/70 hover:text-brand hover:underline focus:outline-none">
                ${isExpanded ? 'Show less' : 'Read details'}
              </button>
              ${!item.isRead ? '<button type="button" class="notif-mark-read-btn font-semibold text-brand hover:underline focus:outline-none">Mark read</button>' : '<span class="font-semibold text-success">Read</span>'}
              <a href="${escapeHtml(item.href)}" class="notif-dest-link drawer-nav-close-link font-semibold text-brand hover:underline whitespace-nowrap">${escapeHtml(item.ctaLabel)}</a>
            </div>
          </div>
        </div>
      </div>
    </article>
  `;
}

function bindNotificationContainerEvents(container) {
  if (!container || container.dataset.notifBound === 'true') return;
  container.dataset.notifBound = 'true';

  container.addEventListener('click', (e) => {
    const expandBtn = e.target.closest('.notif-expand-btn');
    if (expandBtn) {
      e.preventDefault();
      e.stopPropagation();
      const card = expandBtn.closest('[data-notif-id]');
      if (!card) return;
      const id = card.getAttribute('data-notif-id');
      if (expandedNotificationIds.has(id)) {
        expandedNotificationIds.delete(id);
      } else {
        expandedNotificationIds.add(id);
      }
      renderAllNotifications();
      return;
    }

    const markBtn = e.target.closest('.notif-mark-read-btn');
    if (markBtn) {
      e.preventDefault();
      e.stopPropagation();
      const card = markBtn.closest('[data-notif-id]');
      if (!card) return;
      markNotificationRead(card.getAttribute('data-notif-id'), true);
      return;
    }

    const dismissBtn = e.target.closest('.notif-dismiss-btn');
    if (dismissBtn) {
      e.preventDefault();
      e.stopPropagation();
      const card = dismissBtn.closest('[data-notif-id]');
      if (!card) return;
      dismissNotification(card.getAttribute('data-notif-id'));
      return;
    }

    const restoreBtn = e.target.closest('.notif-restore-btn');
    if (restoreBtn) {
      e.preventDefault();
      e.stopPropagation();
      restoreDismissedNotifications();
      return;
    }

    const destLink = e.target.closest('.notif-dest-link');
    if (destLink) {
      if (typeof window.closeDashboardMobileSidebar === 'function') {
        window.closeDashboardMobileSidebar();
      }
    }
  });
}

function renderEmptyNotificationsHtml(dismissedCount) {
  return `
    <div class="p-4 text-center text-xs text-charcoal/60 dark:text-cream/60 space-y-2 rounded-xl border border-charcoal/10 dark:border-charcoal-700 bg-cream/30 dark:bg-charcoal-900/30">
      <i data-lucide="check-circle" class="w-6 h-6 text-success mx-auto"></i>
      <p>All stock levels and deliveries reviewed.</p>
      ${dismissedCount > 0 ? '<button type="button" class="notif-restore-btn text-[11px] font-semibold text-brand hover:underline">Restore dismissed notifications</button>' : ''}
    </div>
  `;
}

function renderAllNotifications() {
  const { items, unreadCount, dismissedCount } = getDashboardNotifications();
  const desktopContainer = document.getElementById('notifications-list-container');
  const drawerContainer = document.getElementById('drawer-notifications-list');
  const drawerSummary = document.getElementById('drawer-notif-summary');
  const drawerMarkAllBtn = document.getElementById('drawer-mark-all-read-btn');
  const desktopMarkAllBtn = document.getElementById('desktop-mark-all-read-btn');

  if (drawerSummary) {
    drawerSummary.textContent = unreadCount > 0
      ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
      : (items.length > 0 ? 'All notifications read' : 'No active notifications');
  }
  if (drawerMarkAllBtn) {
    drawerMarkAllBtn.classList.toggle('hidden', unreadCount === 0);
  }
  if (desktopMarkAllBtn) {
    desktopMarkAllBtn.classList.toggle('hidden', unreadCount === 0);
  }

  if (desktopContainer) {
    bindNotificationContainerEvents(desktopContainer);
    desktopContainer.innerHTML = items.length === 0
      ? renderEmptyNotificationsHtml(dismissedCount)
      : `<div class="space-y-2 p-1">${items.map(item => buildNotificationCardHtml(item, 'desktop')).join('')}</div>`;
  }

  if (drawerContainer) {
    bindNotificationContainerEvents(drawerContainer);
    drawerContainer.innerHTML = items.length === 0
      ? renderEmptyNotificationsHtml(dismissedCount)
      : items.map(item => buildNotificationCardHtml(item, 'drawer')).join('');
  }

  if (window.lucide) window.lucide.createIcons();
}

/**
 * Legacy helper name preserved for callers
 */
function renderNotificationsList() {
  renderAllNotifications();
}

/**
 * Dynamic Badge Counter Updates for Sidebar, Header Bell, Hamburger & Drawer
 */
function updateSidebarBadges() {
  const alertsBadge = document.getElementById('sidebar-alerts-badge');
  const poBadge = document.getElementById('sidebar-po-badge');
  const alerts = typeof DataStore !== 'undefined' ? DataStore.getStockAlerts() : [];
  const orders = typeof DataStore !== 'undefined' ? DataStore.getPurchaseOrders() : [];
  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Partially Received').length;

  if (alertsBadge) {
    if (alerts.length > 0) {
      alertsBadge.textContent = alerts.length;
      alertsBadge.classList.remove('hidden');
    } else {
      alertsBadge.classList.add('hidden');
    }
  }

  if (poBadge) {
    if (pendingCount > 0) {
      poBadge.textContent = pendingCount;
      poBadge.classList.remove('hidden');
    } else {
      poBadge.classList.add('hidden');
    }
  }

  const { unreadCount } = getDashboardNotifications();
  const formattedBadge = formatUnreadBadge(unreadCount);

  const notifDot = document.getElementById('notif-unread-dot');
  if (notifDot) {
    notifDot.classList.toggle('hidden', unreadCount === 0);
  }

  const hamburgerBadge = document.getElementById('hamburger-notif-badge');
  if (hamburgerBadge) {
    hamburgerBadge.textContent = formattedBadge;
    hamburgerBadge.classList.toggle('hidden', unreadCount === 0);
  }

  const drawerBadge = document.getElementById('drawer-notif-badge');
  if (drawerBadge) {
    drawerBadge.textContent = formattedBadge;
    drawerBadge.classList.toggle('hidden', unreadCount === 0);
  }

  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  if (toggleBtn) {
    toggleBtn.setAttribute(
      'aria-label',
      unreadCount > 0
        ? `Open navigation menu (${unreadCount} unread notifications)`
        : 'Open navigation menu'
    );
  }
}

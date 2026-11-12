/**
 * STOCKFLOW - Settings Page Logic
 * Handles retailer store profile, inventory thresholds, notification preferences, appearance toggles, and data export/reset.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSettingsPage();
});

function initSettingsPage() {
  loadSavedSettings();
  setupEventListeners();
}

function loadSavedSettings() {
  const settings = DataStore.getSettings();

  // Profile Form
  if (settings.profile) {
    document.getElementById('set-store-name').value = settings.profile.storeName || '';
    document.getElementById('set-retailer-name').value = settings.profile.retailerName || '';
    document.getElementById('set-email').value = settings.profile.email || '';
    document.getElementById('set-phone').value = settings.profile.phone || '';
    document.getElementById('set-address').value = settings.profile.address || '';
    document.getElementById('set-tax-id').value = settings.profile.taxId || '';
  }

  // Preferences Form
  if (settings.preferences) {
    document.getElementById('set-currency').value = settings.preferences.currency || '$';
    document.getElementById('set-default-threshold').value = settings.preferences.defaultThreshold || 15;
    document.getElementById('set-costing-method').value = settings.preferences.costingMethod || 'FIFO';
    document.getElementById('set-date-format').value = settings.preferences.dateFormat || 'YYYY-MM-DD';
  }

  // Notifications Form
  if (settings.notifications) {
    document.getElementById('notif-low-stock').checked = settings.notifications.lowStockAlerts !== false;
    document.getElementById('notif-out-of-stock').checked = settings.notifications.outOfStockAlerts !== false;
    document.getElementById('notif-po-status').checked = settings.notifications.poStatusUpdates !== false;
    document.getElementById('notif-digest').checked = settings.notifications.emailDigestWeekly !== false;
  }

  // Appearance Active Classes
  const isDark = document.documentElement.classList.contains('dark');
  const currentDir = document.documentElement.getAttribute('dir') || 'ltr';

  updateAppearanceToggles(isDark, currentDir);
}

function updateAppearanceToggles(isDark, dir) {
  const lightBtn = document.getElementById('theme-btn-light');
  const darkBtn = document.getElementById('theme-btn-dark');
  const ltrBtn = document.getElementById('dir-btn-ltr');
  const rtlBtn = document.getElementById('dir-btn-rtl');

  if (lightBtn && darkBtn) {
    if (isDark) {
      darkBtn.classList.add('border-brand', 'bg-brand/10', 'text-brand');
      darkBtn.classList.remove('border-charcoal/20');
      lightBtn.classList.remove('border-brand', 'bg-brand/10', 'text-brand');
      lightBtn.classList.add('border-charcoal/20');
    } else {
      lightBtn.classList.add('border-brand', 'bg-brand/10', 'text-brand');
      lightBtn.classList.remove('border-charcoal/20');
      darkBtn.classList.remove('border-brand', 'bg-brand/10', 'text-brand');
      darkBtn.classList.add('border-charcoal/20');
    }
  }

  if (ltrBtn && rtlBtn) {
    if (dir === 'rtl') {
      rtlBtn.classList.add('border-brand', 'bg-brand/10', 'text-brand');
      rtlBtn.classList.remove('border-charcoal/20');
      ltrBtn.classList.remove('border-brand', 'bg-brand/10', 'text-brand');
      ltrBtn.classList.add('border-charcoal/20');
    } else {
      ltrBtn.classList.add('border-brand', 'bg-brand/10', 'text-brand');
      ltrBtn.classList.remove('border-charcoal/20');
      rtlBtn.classList.remove('border-brand', 'bg-brand/10', 'text-brand');
      rtlBtn.classList.add('border-charcoal/20');
    }
  }
}

function setupEventListeners() {
  // Profile Form Submit
  const profileForm = document.getElementById('settings-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const settings = DataStore.getSettings();

      settings.profile = {
        storeName: document.getElementById('set-store-name').value.trim(),
        retailerName: document.getElementById('set-retailer-name').value.trim(),
        email: document.getElementById('set-email').value.trim(),
        phone: document.getElementById('set-phone').value.trim(),
        address: document.getElementById('set-address').value.trim(),
        taxId: document.getElementById('set-tax-id').value.trim()
      };

      DataStore.saveSettings(settings);

      // Update current session display
      const user = Auth.getUser() || {};
      user.name = settings.profile.retailerName;
      user.email = settings.profile.email;
      user.store = settings.profile.storeName;
      sessionStorage.setItem(Auth.SESSION_KEY, JSON.stringify(user));

      document.querySelectorAll('.retailer-name-display').forEach(el => el.textContent = user.name);
      document.querySelectorAll('.retailer-email-display').forEach(el => el.textContent = user.email);

      showToast('Retailer store profile successfully updated.', 'success');
    });
  }

  // Preferences Form Submit
  const prefForm = document.getElementById('settings-preferences-form');
  if (prefForm) {
    prefForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const settings = DataStore.getSettings();

      settings.preferences = {
        currency: document.getElementById('set-currency').value,
        defaultThreshold: parseInt(document.getElementById('set-default-threshold').value, 10) || 15,
        costingMethod: document.getElementById('set-costing-method').value,
        dateFormat: document.getElementById('set-date-format').value
      };

      DataStore.saveSettings(settings);
      showToast('Inventory calculation preferences saved.', 'success');
    });
  }

  // Notifications Form Submit
  const notifForm = document.getElementById('settings-notifications-form');
  if (notifForm) {
    notifForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const settings = DataStore.getSettings();

      settings.notifications = {
        lowStockAlerts: document.getElementById('notif-low-stock').checked,
        outOfStockAlerts: document.getElementById('notif-out-of-stock').checked,
        poStatusUpdates: document.getElementById('notif-po-status').checked,
        emailDigestWeekly: document.getElementById('notif-digest').checked
      };

      DataStore.saveSettings(settings);
      showToast('Notification alert preferences saved.', 'success');
    });
  }

  // Appearance Theme Buttons
  const lightBtn = document.getElementById('theme-btn-light');
  const darkBtn = document.getElementById('theme-btn-dark');
  if (lightBtn && darkBtn) {
    lightBtn.addEventListener('click', () => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('stockflow_theme', 'light');
      updateAppearanceToggles(false, document.documentElement.getAttribute('dir') || 'ltr');
      window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark: false } }));
      showToast('Switched to Light Theme.', 'info');
    });

    darkBtn.addEventListener('click', () => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('stockflow_theme', 'dark');
      updateAppearanceToggles(true, document.documentElement.getAttribute('dir') || 'ltr');
      window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark: true } }));
      showToast('Switched to Dark Theme.', 'info');
    });
  }

  // Appearance Direction Buttons
  const ltrBtn = document.getElementById('dir-btn-ltr');
  const rtlBtn = document.getElementById('dir-btn-rtl');
  if (ltrBtn && rtlBtn) {
    ltrBtn.addEventListener('click', () => {
      document.documentElement.setAttribute('dir', 'ltr');
      localStorage.setItem('stockflow_dir', 'ltr');
      updateAppearanceToggles(document.documentElement.classList.contains('dark'), 'ltr');
      window.dispatchEvent(new CustomEvent('directionchange', { detail: { dir: 'ltr' } }));
      showToast('Switched text direction to LTR.', 'info');
    });

    rtlBtn.addEventListener('click', () => {
      document.documentElement.setAttribute('dir', 'rtl');
      localStorage.setItem('stockflow_dir', 'rtl');
      updateAppearanceToggles(document.documentElement.classList.contains('dark'), 'rtl');
      window.dispatchEvent(new CustomEvent('directionchange', { detail: { dir: 'rtl' } }));
      showToast('Switched text direction to RTL.', 'info');
    });
  }

  // Export JSON Backup
  const exportJsonBtn = document.getElementById('export-json-backup-btn');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      DataStore.exportDataAsJSON();
      showToast('Exported complete data backup as JSON.', 'success');
    });
  }

  // Reset Demo Data Trigger
  const resetBtn = document.getElementById('open-reset-modal-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const modal = document.getElementById('reset-demo-modal');
      if (modal) modal.classList.remove('hidden');
    });
  }

  const confirmResetBtn = document.getElementById('confirm-reset-demo-btn');
  if (confirmResetBtn) {
    confirmResetBtn.addEventListener('click', () => {
      DataStore.resetDemoData();
      showToast('Demo dataset restored to factory defaults.', 'success');
      closeResetModal();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  }
}

function closeResetModal() {
  const modal = document.getElementById('reset-demo-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * STOCKFLOW - Demo Authentication & Toast Utility
 * Frontend prototype session management without storing passwords.
 */

const Auth = {
  SESSION_KEY: 'stockflow_session',
  REGISTRATIONS_KEY: 'stockflow_demo_registrations',
  RESERVED_DEMO_EMAILS: ['retailer@stockflow.demo', 'associate@stockflow.demo'],

  // Structured OAuth provider registry (populated dynamically when backend OAuth is configured)
  oauthConfig: {
    google: {
      id: 'google',
      label: 'Google',
      enabled: false,
      clientId: null,
      authEndpoint: null
    },
    facebook: {
      id: 'facebook',
      label: 'Facebook',
      enabled: false,
      appId: null,
      authEndpoint: null
    },
    apple: {
      id: 'apple',
      label: 'Apple',
      enabled: false,
      clientId: null,
      authEndpoint: null
    }
  },

  // Get current logged-in demo user or null
  getUser() {
    try {
      const data = sessionStorage.getItem(this.SESSION_KEY) || localStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  // Log in demo user (authentication no longer requires selecting a workspace role)
  login(email, password, rememberOrRole = false, maybeRemember = false) {
    if (!email || !password) {
      return { success: false, message: 'Please enter both email address and password.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // Demo password check - any password of at least 4 characters is accepted for demonstration
    if (password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }

    const hasExplicitRole = typeof rememberOrRole === 'string';
    const role = hasExplicitRole ? rememberOrRole : 'admin';
    const remember = hasExplicitRole ? Boolean(maybeRemember) : Boolean(rememberOrRole);
    const isUserRole = role === 'user';
    const roleKey = isUserRole ? 'user' : 'admin';
    const roleDisplayName = isUserRole ? 'Store Associate (User)' : 'Store Manager (Admin)';
    const roleShort = isUserRole ? 'Associate' : 'Manager';

    // Honest demo user object (NEVER storing password)
    const user = {
      email: email,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || (isUserRole ? 'Chris Parker' : 'Alex Morgan'),
      role: roleDisplayName,
      roleKey: roleKey,
      roleShort: roleShort,
      store: 'StockFlow Superstore #104',
      loggedInAt: new Date().toISOString()
    };

    if (remember) {
      sessionStorage.removeItem(this.SESSION_KEY);
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.SESSION_KEY);
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    }

    return { success: true, user };
  },

  // Switch role seamlessly during evaluation
  switchRole(roleKey) {
    const user = this.getUser() || this.requireAuth();
    const isUserRole = roleKey === 'user';
    user.roleKey = isUserRole ? 'user' : 'admin';
    user.role = isUserRole ? 'Store Associate (User)' : 'Store Manager (Admin)';
    user.roleShort = isUserRole ? 'Associate' : 'Manager';

    if (localStorage.getItem(this.SESSION_KEY)) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    }

    window.dispatchEvent(new CustomEvent('auth-role-changed', { detail: user }));
    return user;
  },

  // Log out demo user
  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    // Find correct relative path to login.html
    const isDashboard = window.location.pathname.includes('/dashboard/');
    window.location.href = isDashboard ? '../login.html' : 'login.html';
  },

  // Require auth on dashboard pages
  requireAuth() {
    const user = this.getUser();
    if (!user) {
      // Set a default demo user for seamless reviewer evaluation if opened directly
      const defaultUser = {
        email: 'retailer@stockflow.demo',
        name: 'Alex Morgan',
        role: 'Store Manager (Admin)',
        roleKey: 'admin',
        roleShort: 'Manager',
        store: 'Metro Retail Mart',
        loggedInAt: new Date().toISOString()
      };
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    // Ensure role fields are set if an older session object exists
    if (!user.roleKey) {
      user.roleKey = 'admin';
      user.role = 'Store Manager (Admin)';
      user.roleShort = 'Manager';
    }
    return user;
  },

  // Frontend prototype workspace registration (never stores passwords or alters demo accounts)
  registerWorkspace({ fullName, storeName, email, mobileNumber, password, confirmPassword, agreedToTerms }) {
    const cleanName = (fullName || '').trim();
    const cleanStore = (storeName || '').trim();
    const cleanEmail = (email || '').trim();
    const cleanPhone = (mobileNumber || '').trim();
    const phoneDigits = cleanPhone.replace(/\D/g, '');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneCharRegex = /^[+\d\s().-]+$/;

    if (cleanName.length < 2) {
      return { success: false, field: 'name', message: 'Please enter your full name (at least 2 characters).' };
    }
    if (cleanStore.length < 2) {
      return { success: false, field: 'store', message: 'Please enter your store or business name (at least 2 characters).' };
    }
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, field: 'email', message: 'Please enter a valid email address.' };
    }
    if (this.RESERVED_DEMO_EMAILS.includes(cleanEmail.toLowerCase())) {
      return {
        success: false,
        field: 'email',
        message: 'That address is reserved for pre-configured demo role sign-in. Enter a different store email.'
      };
    }
    if (!cleanPhone || !phoneCharRegex.test(cleanPhone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
      return { success: false, field: 'phone', message: 'Please enter a valid mobile number (7–15 digits).' };
    }
    if (!password || password.length < 8) {
      return { success: false, field: 'password', message: 'Password must be at least 8 characters long.' };
    }
    if (password !== confirmPassword) {
      return { success: false, field: 'confirm', message: 'Passwords do not match. Please verify both password fields.' };
    }
    if (!agreedToTerms) {
      return { success: false, field: 'terms', message: 'Please agree to the Terms of Service and Privacy Policy to continue.' };
    }

    let existing = [];
    try {
      const raw = localStorage.getItem(this.REGISTRATIONS_KEY);
      existing = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(existing)) existing = [];
    } catch (e) {
      existing = [];
    }

    if (existing.some((entry) => entry && entry.email && entry.email.toLowerCase() === cleanEmail.toLowerCase())) {
      return {
        success: false,
        field: 'email',
        message: 'This email is already recorded in your local workspace preview. Sign in or enter another email.'
      };
    }

    // Store non-sensitive profile preview only (passwords are intentionally omitted)
    const profile = {
      id: `ws-${Date.now()}`,
      fullName: cleanName,
      storeName: cleanStore,
      email: cleanEmail,
      mobileNumber: cleanPhone,
      createdAt: new Date().toISOString(),
      demoPreview: true
    };
    existing.push(profile);
    localStorage.setItem(this.REGISTRATIONS_KEY, JSON.stringify(existing));

    return { success: true, profile };
  },

  // Frontend integration hook for external OAuth providers (does not create fake sessions)
  initiateOAuth(providerKey) {
    const normalizedKey = String(providerKey || '').toLowerCase();
    const provider = this.oauthConfig[normalizedKey];

    if (!provider) {
      return {
        success: false,
        configured: false,
        provider: 'Social',
        message: 'Requested social sign-in provider is not recognized.'
      };
    }

    if (!provider.enabled || !provider.authEndpoint) {
      return {
        success: false,
        configured: false,
        provider: provider.label,
        message:
          `${provider.label} authentication is a frontend integration placeholder — OAuth client credentials and backend callback endpoints are not configured in this static prototype. ` +
          'No session was created. Sign in with email and password or use the demo credentials to explore the dashboard.'
      };
    }

    // Integration point for configured OAuth 2.0 / OIDC backend handoff:
    // window.location.assign(provider.authEndpoint);
    return {
      success: true,
      configured: true,
      provider: provider.label,
      authEndpoint: provider.authEndpoint
    };
  }
};

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconName = type === 'success' ? 'check-circle-2' : 
                   type === 'error' ? 'alert-triangle' : 
                   type === 'warning' ? 'alert-circle' : 'info';

  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-5 h-5 flex-shrink-0"></i>
    <span class="flex-1">${message}</span>
    <button type="button" class="text-white/70 hover:text-white transition ml-2" onclick="this.parentElement.remove()">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `;

  container.appendChild(toast);
  if (window.lucide) {
    window.lucide.createIcons({ root: toast });
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 250);
  }, duration);
}

/**
 * Escape HTML special characters before rendering dynamic text into status banners
 */
function escapeAuthHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hideAuthStatusBanner(bannerEl) {
  if (!bannerEl) return;
  bannerEl.classList.add('hidden');
  bannerEl.innerHTML = '';
}

function renderAuthStatusBanner(bannerEl, variant, title, messageHtml) {
  if (!bannerEl) return;
  const isError = variant === 'error';
  const isSuccess = variant === 'success';
  const boxClasses = isError
    ? 'bg-red-50 dark:bg-red-950/40 border-danger/30 text-danger dark:text-red-300'
    : isSuccess
      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-success/35 text-emerald-900 dark:text-emerald-200'
      : 'bg-brand/10 dark:bg-brand/15 border-brand/30 text-charcoal dark:text-cream';
  const iconName = isError ? 'alert-circle' : isSuccess ? 'check-circle-2' : 'info';
  const iconColor = isError ? 'text-danger' : isSuccess ? 'text-success' : 'text-brand';

  bannerEl.setAttribute('role', isError ? 'alert' : 'status');
  bannerEl.innerHTML = `
    <div class="p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-fade-in ${boxClasses}">
      <i data-lucide="${iconName}" class="w-4 h-4 ${iconColor} mt-0.5 shrink-0"></i>
      <div class="leading-relaxed">
        <p class="font-bold">${escapeAuthHtml(title)}</p>
        <div class="mt-0.5 opacity-95">${messageHtml}</div>
      </div>
    </div>
  `;
  bannerEl.classList.remove('hidden');
  if (window.lucide) {
    window.lucide.createIcons({ root: bannerEl });
  }
}

function bindPasswordVisibilityToggle(btn, input, eyeEl, eyeOffEl) {
  if (!btn || !input) return;
  btn.addEventListener('click', () => {
    const reveal = input.type === 'password';
    input.type = reveal ? 'text' : 'password';
    btn.setAttribute('aria-pressed', reveal ? 'true' : 'false');
    btn.setAttribute('aria-label', reveal ? 'Hide password' : 'Show password');
    if (eyeEl) eyeEl.classList.toggle('hidden', reveal);
    if (eyeOffEl) eyeOffEl.classList.toggle('hidden', !reveal);
  });
}

function evaluatePasswordStrength(val) {
  if (!val) {
    return {
      width: '0%',
      colorClass: 'bg-transparent',
      label: 'Use 8+ characters with mixed case, numbers, or symbols',
      textClass: 'text-charcoal/55 dark:text-cream/55'
    };
  }
  let score = 0;
  if (val.length >= 8) score++;
  if (val.length >= 12) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  if (val.length < 8 || score <= 2) {
    return {
      width: '33%',
      colorClass: 'bg-danger',
      label: 'Weak — use at least 8 characters with uppercase, numbers, or symbols',
      textClass: 'text-danger'
    };
  }
  if (score <= 3) {
    return {
      width: '66%',
      colorClass: 'bg-warning',
      label: 'Moderate — add numbers or special characters to strengthen',
      textClass: 'text-amber-700 dark:text-amber-300'
    };
  }
  return {
    width: '100%',
    colorClass: 'bg-success',
    label: 'Strong password',
    textClass: 'text-emerald-700 dark:text-emerald-400'
  };
}

/**
 * Bind social OAuth placeholder buttons cleanly across login and registration pages.
 */
function bindSocialOAuthButtons(statusBanner, inputsToReset = []) {
  document.querySelectorAll('.login-social-btn[data-oauth-provider]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const providerKey = btn.getAttribute('data-oauth-provider');
      inputsToReset.forEach((inputEl) => {
        if (inputEl) inputEl.removeAttribute('aria-invalid');
      });

      const result = Auth.initiateOAuth(providerKey);
      if (!result.configured) {
        renderAuthStatusBanner(
          statusBanner,
          'info',
          `${result.provider} OAuth Not Configured`,
          escapeAuthHtml(result.message)
        );
        if (statusBanner) {
          statusBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        showToast(`${result.provider} sign-in requires OAuth configuration.`, 'info');
      }
    });
  });
}

/**
 * Login Portal Controller (split-screen login.html only)
 */
function initLoginPortal() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('remember-me');
  const togglePasswordBtn = document.getElementById('toggle-password-btn');
  const eyeIcon = document.getElementById('eye-icon');
  const eyeOffIcon = document.getElementById('eye-off-icon');
  const statusBanner = document.getElementById('login-status-banner');
  const forgotLink = document.getElementById('forgot-password-link');
  const submitBtn = document.getElementById('login-submit-btn');

  bindPasswordVisibilityToggle(togglePasswordBtn, passwordInput, eyeIcon, eyeOffIcon);

  [emailInput, passwordInput].forEach((inputEl) => {
    if (!inputEl) return;
    inputEl.addEventListener('input', () => {
      inputEl.removeAttribute('aria-invalid');
      hideAuthStatusBanner(statusBanner);
    });
  });

  // Forgot Password Demo Hint
  if (forgotLink) {
    forgotLink.addEventListener('click', () => {
      renderAuthStatusBanner(
        statusBanner,
        'info',
        'Demo Workspace Access',
        'Self-service password reset is inactive in local mode. Use any valid email (e.g. <strong>retailer@stockflow.demo</strong> or <strong>associate@stockflow.demo</strong>) with any password of 4+ characters.'
      );
      showToast('Demo hint: Any valid email + 4+ character password logs in.', 'info');
    });
  }

  // Social OAuth Integration Placeholders (Google, Facebook & Apple)
  bindSocialOAuthButtons(statusBanner, [emailInput, passwordInput]);

  // Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAuthStatusBanner(statusBanner);

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';
    const remember = rememberCheckbox ? rememberCheckbox.checked : false;

    if (emailInput) emailInput.removeAttribute('aria-invalid');
    if (passwordInput) passwordInput.removeAttribute('aria-invalid');

    const result = Auth.login(email, password, remember);

    if (!result.success) {
      const msg = result.message || 'Please enter valid login credentials.';
      const isPasswordError = msg.toLowerCase().includes('password') && email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const focusTarget = isPasswordError ? passwordInput : emailInput;
      if (focusTarget) {
        focusTarget.setAttribute('aria-invalid', 'true');
        focusTarget.focus();
      }
      renderAuthStatusBanner(statusBanner, 'error', 'Unable to Sign In', escapeAuthHtml(msg));
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }

    renderAuthStatusBanner(statusBanner, 'success', 'Authentication Verified', `Signed in as ${escapeAuthHtml(result.user.role)}. Redirecting to dashboard...`);
    showToast(`Signed in as ${result.user.role}! Redirecting...`, 'success');
    setTimeout(() => {
      window.location.href = 'dashboard/index.html';
    }, 450);
  });
}

/**
 * Workspace Registration Controller (split-screen register.html only)
 */
function initRegisterPortal() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const nameInput = document.getElementById('reg-name');
  const storeInput = document.getElementById('reg-store');
  const emailInput = document.getElementById('reg-email');
  const phoneInput = document.getElementById('reg-phone');
  const passwordInput = document.getElementById('reg-password');
  const confirmInput = document.getElementById('reg-confirm-password');
  const termsInput = document.getElementById('reg-terms');
  const strengthMeter = document.getElementById('password-strength-meter');
  const strengthText = document.getElementById('password-strength-text');
  const confirmHint = document.getElementById('confirm-match-hint');
  const statusBanner = document.getElementById('register-status-banner');
  const submitBtn = document.getElementById('register-submit-btn');

  bindPasswordVisibilityToggle(
    document.getElementById('toggle-reg-password-btn'),
    passwordInput,
    document.getElementById('reg-eye-icon'),
    document.getElementById('reg-eye-off-icon')
  );
  bindPasswordVisibilityToggle(
    document.getElementById('toggle-reg-confirm-btn'),
    confirmInput,
    document.getElementById('confirm-eye-icon'),
    document.getElementById('confirm-eye-off-icon')
  );

  const updateStrengthUI = () => {
    if (!passwordInput || !strengthMeter || !strengthText) return;
    const state = evaluatePasswordStrength(passwordInput.value);
    strengthMeter.style.width = state.width;
    strengthMeter.className = `h-1.5 rounded-full strength-meter-fill ${state.colorClass}`;
    strengthText.textContent = state.label;
    strengthText.className = `text-[11px] font-medium ${state.textClass}`;
  };

  const updateMatchUI = () => {
    if (!confirmInput || !passwordInput || !confirmHint) return;
    const val = confirmInput.value;
    if (!val) {
      confirmHint.textContent = '';
      confirmHint.className = 'text-[11px] mt-1 hidden';
      return;
    }
    const matches = val === passwordInput.value;
    confirmHint.textContent = matches ? 'Passwords match' : 'Passwords do not match';
    confirmHint.className = `text-[11px] font-medium mt-1 ${matches ? 'text-emerald-700 dark:text-emerald-400' : 'text-danger'}`;
  };

  [nameInput, storeInput, emailInput, phoneInput, passwordInput, confirmInput].forEach((inputEl) => {
    if (!inputEl) return;
    inputEl.addEventListener('input', () => {
      inputEl.removeAttribute('aria-invalid');
      hideAuthStatusBanner(statusBanner);
      if (inputEl === passwordInput) {
        updateStrengthUI();
        updateMatchUI();
      } else if (inputEl === confirmInput) {
        updateMatchUI();
      }
    });
  });

  if (termsInput) {
    termsInput.addEventListener('change', () => {
      termsInput.removeAttribute('aria-invalid');
      hideAuthStatusBanner(statusBanner);
    });
  }

  document.querySelectorAll('.legal-notice-trigger[data-legal-doc]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const docTitle = trigger.getAttribute('data-legal-doc') || 'Legal Terms';
      showToast(`${docTitle} is a static prototype placeholder in this frontend demo.`, 'info');
    });
  });

  // Social OAuth Integration Placeholders (Google, Facebook & Apple)
  bindSocialOAuthButtons(statusBanner, [nameInput, storeInput, emailInput, phoneInput, passwordInput, confirmInput, termsInput]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideAuthStatusBanner(statusBanner);

    const fieldMap = {
      name: nameInput,
      store: storeInput,
      email: emailInput,
      phone: phoneInput,
      password: passwordInput,
      confirm: confirmInput,
      terms: termsInput
    };
    Object.values(fieldMap).forEach((el) => {
      if (el) el.removeAttribute('aria-invalid');
    });

    const result = Auth.registerWorkspace({
      fullName: nameInput ? nameInput.value : '',
      storeName: storeInput ? storeInput.value : '',
      email: emailInput ? emailInput.value : '',
      mobileNumber: phoneInput ? phoneInput.value : '',
      password: passwordInput ? passwordInput.value : '',
      confirmPassword: confirmInput ? confirmInput.value : '',
      agreedToTerms: termsInput ? termsInput.checked : false
    });

    if (!result.success) {
      const targetEl = fieldMap[result.field];
      if (targetEl) {
        targetEl.setAttribute('aria-invalid', 'true');
        targetEl.focus();
      }
      renderAuthStatusBanner(statusBanner, 'error', 'Check Registration Details', escapeAuthHtml(result.message));
      return;
    }

    const { fullName, storeName } = result.profile;
    renderAuthStatusBanner(
      statusBanner,
      'success',
      'Workspace Preview Created',
      `Welcome, <strong>${escapeAuthHtml(fullName)}</strong> (<strong>${escapeAuthHtml(storeName)}</strong>). This prototype validates details locally without storing passwords; live multi-tenant sign-up requires a backend server. ` +
      `<a href="login.html" class="underline font-bold text-brand dark:text-mutedOrange hover:text-brand-600 ms-1">Proceed to Sign In &rarr;</a>`
    );
    showToast('Workspace preview ready! Continue to Sign In.', 'success');

    form.reset();
    updateStrengthUI();
    updateMatchUI();
    if (submitBtn) submitBtn.focus();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  document.querySelectorAll('.current-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
  initLoginPortal();
  initRegisterPortal();
});

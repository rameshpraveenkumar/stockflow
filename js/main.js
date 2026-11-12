/**
 * STOCKFLOW - Main Public Interactions & Navigation
 * Handles sticky nav, mobile drawer, back-to-top, FAQ accordions, and pricing billing toggle.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initStickyHeader();
  initNavDropdowns();
  initMobileAccordions();
  initMobileMenu();
  initBeforeAfterSlider();
  initChallengesCarousel();
  initBackToTop();
  initFaqAccordions();
  initPricingToggle();
  initActiveNav();
  initDynamicYear();
  initFooterNewsletter();
  initFooterLegalModals();
  initSocialLinks();
  initContactPage();
  initTestHooks();
});

/**
 * Sticky Navigation Bar with subtle shadow and blur
 */
function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('nav-scrolled');
    } else {
      header.classList.remove('nav-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Mobile Navigation Drawer
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const header = document.querySelector('header');
  if (!menuBtn || !mobileMenu) return;

  const getIcons = () => ({
    iconMenu: menuBtn.querySelector('.icon-menu'),
    iconClose: menuBtn.querySelector('.icon-close')
  });

  const closeMenu = (restoreFocus = false) => {
    if (mobileMenu.classList.contains('hidden')) return;
    mobileMenu.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
    const { iconMenu, iconClose } = getIcons();
    if (iconMenu) iconMenu.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
    if (restoreFocus) menuBtn.focus();
  };

  const openMenu = () => {
    mobileMenu.classList.remove('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    const { iconMenu, iconClose } = getIcons();
    if (iconMenu) iconMenu.classList.add('hidden');
    if (iconClose) iconClose.classList.remove('hidden');
  };

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when clicking mobile links
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => closeMenu());
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      closeMenu(true);
    }
  });

  // Close when clicking outside the header/drawer
  document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('hidden') && header && !header.contains(e.target)) {
      closeMenu();
    }
  });

  // Reset mobile drawer when resizing up to desktop nav breakpoint (>=1280px)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1280) {
      closeMenu();
    }
  });
}

/**
 * Back to Top Floating Button
 */
function initBackToTop() {
  const btn = document.getElementById('back-to-top-btn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
      btn.classList.add('opacity-100', 'translate-y-0');
    } else {
      btn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      btn.classList.remove('opacity-100', 'translate-y-0');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/**
 * Unified Navigation Dropdowns (Home & Dashboard - Mouse, Keyboard & Touch)
 */
function initNavDropdowns() {
  const legacyHomeContainer = document.querySelector('.home-dropdown-container');
  const legacyHomeBtn = document.getElementById('home-dropdown-btn');
  const legacyHomeMenu = document.getElementById('home-dropdown-menu');

  const containers = [
    ...document.querySelectorAll('[data-nav-dropdown], [data-dropdown], .home-dropdown-container, .dashboard-dropdown-container')
  ].filter((el, idx, arr) => arr.indexOf(el) === idx);
  if (!containers.length && legacyHomeBtn && legacyHomeMenu) {
    const parent = legacyHomeBtn.parentElement;
    if (parent) containers.push(parent);
  }
  if (!containers.length) return;

  const controllers = [];

  const closeAllExcept = (activeCtrl) => {
    controllers.forEach((ctrl) => {
      if (ctrl !== activeCtrl) ctrl.close();
    });
  };

  containers.forEach((container) => {
    const btn = container.querySelector('[data-dropdown-trigger], #home-dropdown-btn, #dashboard-dropdown-btn');
    const menu = container.querySelector('[data-dropdown-menu], #home-dropdown-menu, #dashboard-dropdown-menu');
    if (!btn || !menu) return;

    const getChevron = () =>
      btn.querySelector('.home-chevron, .dashboard-chevron, .dropdown-chevron, [data-dropdown-chevron], [data-lucide="chevron-down"]');
    const items = [...menu.querySelectorAll('a[role="menuitem"], a')];
    let hoverTimeout = null;

    const open = (focusTargetIndex = -1) => {
      clearTimeout(hoverTimeout);
      closeAllExcept(ctrl);
      menu.classList.remove('hidden', 'opacity-0', 'translate-y-1', 'pointer-events-none');
      btn.setAttribute('aria-expanded', 'true');
      const chevron = getChevron();
      if (chevron) chevron.classList.add('rotate-180');
      if (focusTargetIndex >= 0 && items[focusTargetIndex]) {
        items[focusTargetIndex].focus();
      }
    };

    const close = () => {
      clearTimeout(hoverTimeout);
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      const chevron = getChevron();
      if (chevron) chevron.classList.remove('rotate-180');
    };

    const ctrl = { container, btn, menu, open, close };
    controllers.push(ctrl);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !menu.classList.contains('hidden');
      if (isOpen) {
        close();
      } else {
        open();
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        open(0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        open(items.length - 1);
      } else if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
        e.preventDefault();
        close();
        btn.focus();
      }
    });

    menu.addEventListener('keydown', (e) => {
      if (!items.length) return;
      const currentIdx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIdx = (currentIdx + 1) % items.length;
        items[nextIdx].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIdx = (currentIdx - 1 + items.length) % items.length;
        items[prevIdx].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        items[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        items[items.length - 1].focus();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        close();
        btn.focus();
      }
    });

    container.addEventListener('mouseenter', () => {
      if (window.innerWidth >= 1280) open();
    });
    container.addEventListener('mouseleave', () => {
      if (window.innerWidth >= 1280) {
        hoverTimeout = setTimeout(close, 180);
      }
    });

    container.addEventListener('focusout', (e) => {
      if (!e.relatedTarget || !container.contains(e.relatedTarget)) {
        close();
      }
    });

    items.forEach((link) => {
      link.addEventListener('click', () => {
        close();
      });
    });
  });

  document.addEventListener('click', (e) => {
    controllers.forEach((ctrl) => {
      if (!ctrl.container.contains(e.target)) {
        ctrl.close();
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      controllers.forEach((ctrl) => {
        if (!ctrl.menu.classList.contains('hidden')) {
          ctrl.close();
          ctrl.btn.focus();
        }
      });
    }
  });
}

/**
 * Mobile Navigation Accordions (Home & Dashboard)
 */
function initMobileAccordions() {
  const pairs = [
    { btnId: 'mobile-home-btn', subId: 'mobile-home-sublinks', chevSel: '.mobile-home-chevron' },
    { btnId: 'mobile-dashboard-btn', subId: 'mobile-dashboard-sublinks', chevSel: '.mobile-dashboard-chevron' }
  ];

  pairs.forEach(({ btnId, subId, chevSel }) => {
    const btn = document.getElementById(btnId);
    const sublinks = document.getElementById(subId);
    if (!btn || !sublinks) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isClosed = sublinks.classList.contains('hidden');
      sublinks.classList.toggle('hidden', !isClosed);
      btn.setAttribute('aria-expanded', isClosed ? 'true' : 'false');
      const chevron = btn.querySelector(chevSel);
      if (chevron) chevron.classList.toggle('rotate-180', isClosed);
    });
  });
}

/**
 * Active Navigation Link Indicator
 */
function initActiveNav() {
  const rawLastSegment = window.location.pathname.split('/').pop() || '';
  const isRootHome = window.location.pathname === '/' || window.location.pathname === '';
  const currentPath = rawLastSegment || (isRootHome ? 'index.html' : '');
  const currentSlug = currentPath.replace(/\.html$/i, '');
  const isDashboardRoute = window.location.pathname.includes('/dashboard/');
  const isHome1 = !isDashboardRoute && (isRootHome || currentSlug === 'index');
  const isHome2 = !isDashboardRoute && currentSlug === 'home-2';

  const homeBtn = document.getElementById('home-dropdown-btn');
  const mobileHomeBtn = document.getElementById('mobile-home-btn');
  if (isHome1 || isHome2) {
    if (homeBtn) {
      homeBtn.classList.add('text-brand', 'dark:text-mutedOrange', 'font-semibold');
      homeBtn.classList.remove('text-charcoal/80', 'dark:text-cream/80');
    }
    if (mobileHomeBtn) {
      mobileHomeBtn.classList.add('text-brand', 'dark:text-mutedOrange', 'font-semibold');
    }
  }

  if (isHome1) {
    document.querySelectorAll('a[href$="index.html"].home-dropdown-item').forEach((el) => {
      el.classList.add('text-brand', 'dark:text-mutedOrange', 'font-bold', 'bg-brand/5', 'dark:bg-charcoal-700/50');
      el.setAttribute('aria-current', 'page');
    });
  } else if (isHome2) {
    document.querySelectorAll('a[href$="home-2.html"].home-dropdown-item').forEach((el) => {
      el.classList.add('text-brand', 'dark:text-mutedOrange', 'font-bold', 'bg-brand/5', 'dark:bg-charcoal-700/50');
      el.setAttribute('aria-current', 'page');
    });
  }

  const dashboardBtn = document.getElementById('dashboard-dropdown-btn');
  const mobileDashboardBtn = document.getElementById('mobile-dashboard-btn');
  if (isDashboardRoute) {
    if (dashboardBtn) {
      dashboardBtn.classList.add('text-brand', 'dark:text-mutedOrange', 'font-semibold');
      dashboardBtn.classList.remove('text-charcoal/80', 'dark:text-cream/80');
    }
    if (mobileDashboardBtn) {
      mobileDashboardBtn.classList.add('text-brand', 'dark:text-mutedOrange', 'font-semibold');
    }
    const targetSuffix = currentSlug === 'user-dashboard' ? 'dashboard/user-dashboard.html' : 'dashboard/index.html';
    document.querySelectorAll(`.dashboard-dropdown-item[href$="${targetSuffix}"]`).forEach((el) => {
      el.classList.add('text-brand', 'dark:text-mutedOrange', 'font-bold', 'bg-brand/5', 'dark:bg-charcoal-700/50');
      el.setAttribute('aria-current', 'page');
    });
  }

  const navLinks = document.querySelectorAll('.nav-link:not(#home-dropdown-btn):not(.home-dropdown-item):not(#dashboard-dropdown-btn):not(.dashboard-dropdown-item)');
  navLinks.forEach((link) => {
    const rawHref = link.getAttribute('href') || '';
    const hrefName = rawHref.split('/').pop() || '';
    const hrefSlug = hrefName.replace(/\.html$/i, '');
    if (currentSlug && hrefSlug === currentSlug) {
      link.classList.add('text-brand', 'dark:text-mutedOrange', 'font-semibold');
      link.classList.remove('text-charcoal/70', 'text-charcoal/80', 'dark:text-cream/80');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/**
 * Interactive FAQ Accordions
 */
function initFaqAccordions() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach((item) => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.setAttribute('aria-expanded', item.classList.contains('active') ? 'true' : 'false');

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      items.forEach((other) => {
        if (other !== item) {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-trigger');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      const willOpen = !isActive;
      item.classList.toggle('active', willOpen);
      trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });
}

/**
 * Pricing Billing Toggle (Monthly / Annual)
 */
function initPricingToggle() {
  const toggle = document.getElementById('billing-toggle');
  if (!toggle) return;

  const monthlyPrices = document.querySelectorAll('.price-monthly');
  const annualPrices = document.querySelectorAll('.price-annual');
  const periodLabels = document.querySelectorAll('.price-period');

  toggle.addEventListener('change', () => {
    const isAnnual = toggle.checked;

    monthlyPrices.forEach(el => el.classList.toggle('hidden', isAnnual));
    annualPrices.forEach(el => el.classList.toggle('hidden', !isAnnual));
    periodLabels.forEach(el => el.textContent = isAnnual ? '/ month (billed annually)' : '/ month');
  });
}

/**
 * Dynamic Footer Year
 */
function initDynamicYear() {
  const yearEls = document.querySelectorAll('.current-year-display');
  const currentYear = new Date().getFullYear();
  yearEls.forEach(el => {
    el.textContent = currentYear;
  });
}

/**
 * Footer Newsletter / Demo Update Form
 */
function initFooterNewsletter() {
  const forms = document.querySelectorAll('.footer-newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value.trim()) {
        const val = input.value.trim();
        input.value = '';
        if (typeof showToast === 'function') {
          showToast(`Thank you! Demo briefing sent to ${val}.`, 'success');
        } else {
          alert(`Thank you! Demo briefing sent to ${val}.`);
        }
      }
    });
  });
}

/**
 * Footer Legal Notice Popups
 */
function initFooterLegalModals() {
  const legalTriggers = document.querySelectorAll('.legal-notice-trigger');
  legalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const topic = btn.getAttribute('data-topic') || 'Legal Information';
      const msg = `STOCKFLOW Demo Prototype: All simulated data is stored locally in your browser. No live credit card transactions or third-party trackers are active.`;
      if (typeof showToast === 'function') {
        showToast(`${topic}: ${msg}`, 'info', 5000);
      } else {
        alert(`${topic}\n\n${msg}`);
      }
    });
  });
}

/**
 * Interactive Before & After Image Comparison Slider
 */
function initBeforeAfterSlider() {
  const containers = document.querySelectorAll('.ba-container');
  if (!containers.length) return;

  containers.forEach((container) => {
    const clipWrapper = container.querySelector('.ba-clip-wrapper, .ba-after-wrapper');
    const handle = container.querySelector('.ba-handle');
    const clipImage = container.querySelector('.ba-clip-image, .ba-after-image');
    if (!clipWrapper || !handle || !clipImage) return;

    let isDragging = false;

    handle.setAttribute('role', 'slider');
    handle.setAttribute('tabindex', '0');
    handle.setAttribute('aria-label', 'Image comparison slider');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.setAttribute('aria-valuenow', '50');

    const updateImageWidth = () => {
      const containerWidth = container.offsetWidth;
      clipImage.style.width = `${containerWidth}px`;
    };

    updateImageWidth();
    window.addEventListener('resize', updateImageWidth);

    const updatePosition = (percentage) => {
      const clamped = Math.max(2, Math.min(98, percentage));
      clipWrapper.style.width = `${clamped}%`;
      handle.style.left = `${clamped}%`;
      handle.setAttribute('aria-valuenow', Math.round(clamped).toString());
    };

    const calculatePercentageFromClientX = (clientX) => {
      const rect = container.getBoundingClientRect();
      const offsetX = clientX - rect.left;
      return (offsetX / rect.width) * 100;
    };

    const onPointerDown = (e) => {
      isDragging = true;
      try {
        handle.setPointerCapture(e.pointerId);
      } catch (err) {}
      const pct = calculatePercentageFromClientX(e.clientX);
      updatePosition(pct);
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const pct = calculatePercentageFromClientX(e.clientX);
      updatePosition(pct);
    };

    const onPointerUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        if (handle.hasPointerCapture(e.pointerId)) {
          handle.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}
    };

    handle.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointerdown', (e) => {
      if (e.target !== handle && !handle.contains(e.target)) {
        onPointerDown(e);
      }
    });

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // Keyboard support (Physical horizontal left/right matching slider track)
    handle.addEventListener('keydown', (e) => {
      const current = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
      const step = 5;
      if (e.key === 'ArrowLeft') {
        updatePosition(current - step);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        updatePosition(current + step);
        e.preventDefault();
      } else if (e.key === 'Home') {
        updatePosition(2);
        e.preventDefault();
      } else if (e.key === 'End') {
        updatePosition(98);
        e.preventDefault();
      }
    });
  });
}

/**
 * Single-Card Interactive Carousel for Section 9
 * "Why Retailers Need Better Inventory Visibility"
 */
function initChallengesCarousel() {
  const carousel = document.getElementById('challenges-carousel');
  if (!carousel) return;

  const scenarios = [
    {
      badge: 'Challenge 01: Weekend Stockouts',
      title: 'Eliminating the Friday Afternoon Stock Mystery',
      problem: 'Store managers discover on Saturday morning that their top-selling items ran completely dry, losing hundreds of dollars in high-margin weekend foot-traffic sales.',
      solution: 'STOCKFLOW automatic reorder threshold notifications calculate run-rate velocity and alert buyers 48 hours prior to shelf depletion, triggering supplier POs in two clicks.',
      impact: 'Zero surprise weekend stockouts & protected sales revenue'
    },
    {
      badge: 'Challenge 02: Receiving Discrepancies',
      title: 'Ending Unverified Supplier Invoices & Disputes',
      problem: 'Vendors invoice for 50 cases of detergent, but only 38 arrived on the pallet. Discrepancies get lost on paper delivery notes until month-end payment reconciliation.',
      solution: 'Direct purchase order receiving lets store clerks record exact delivered quantities item by item. Inventory balances immediately reflect only physical inventory in hand.',
      impact: '100% invoice audit trail with supplier discrepancy tracking'
    },
    {
      badge: 'Challenge 03: Dead Capital Traps',
      title: 'Freeing Tied-Up Cash in Slow-Moving Shelves',
      problem: 'Capital sits locked up in slow-turnover specialty merchandise that has not moved in 60 days, leaving zero liquidity to invest in high-velocity seasonal demand items.',
      solution: 'Real-time category valuation reports rank every department by inventory turnover velocity and gross margin contribution, showing exactly where capital is stalled.',
      impact: 'Clear working capital reallocation & optimized cash flow'
    }
  ];

  let currentIndex = 0;
  let autoTimer = null;

  const badgeEl = carousel.querySelector('#carousel-badge');
  const titleEl = carousel.querySelector('#carousel-title');
  const problemEl = carousel.querySelector('#carousel-problem');
  const solutionEl = carousel.querySelector('#carousel-solution');
  const impactEl = carousel.querySelector('#carousel-impact');
  const prevBtn = carousel.querySelector('#carousel-prev');
  const nextBtn = carousel.querySelector('#carousel-next');
  const dotsContainer = carousel.querySelector('#carousel-dots');
  const card = carousel.querySelector('#carousel-card');

  if (!titleEl || !card) return;

  const render = (idx) => {
    card.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => {
      const item = scenarios[idx];
      if (badgeEl) badgeEl.textContent = item.badge;
      if (titleEl) titleEl.textContent = item.title;
      if (problemEl) problemEl.textContent = item.problem;
      if (solutionEl) solutionEl.textContent = item.solution;
      if (impactEl) impactEl.textContent = item.impact;

      card.classList.remove('opacity-0', 'translate-y-2');
      if (window.lucide) window.lucide.createIcons();
      updateDots(idx);
    }, 150);
  };

  const updateDots = (activeIdx) => {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll('button');
    dots.forEach((dot, i) => {
      if (i === activeIdx) {
        dot.className = 'h-2.5 w-8 rounded-full bg-brand transition-all duration-300 focus:outline-none';
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.className = 'h-2.5 w-2.5 rounded-full bg-charcoal/20 dark:bg-cream/20 hover:bg-charcoal/40 transition-all duration-300 focus:outline-none';
        dot.removeAttribute('aria-current');
      }
    });
  };

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    scenarios.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `h-2.5 rounded-full transition-all duration-300 focus:outline-none ${i === 0 ? 'w-8 bg-brand' : 'w-2.5 bg-charcoal/20 dark:bg-cream/20'}`;
      dot.setAttribute('aria-label', `Go to challenge ${i + 1}`);
      dot.addEventListener('click', () => {
        currentIndex = i;
        render(currentIndex);
        resetTimer();
      });
      dotsContainer.appendChild(dot);
    });
  }

  const prev = () => {
    currentIndex = (currentIndex - 1 + scenarios.length) % scenarios.length;
    render(currentIndex);
    resetTimer();
  };

  const next = () => {
    currentIndex = (currentIndex + 1) % scenarios.length;
    render(currentIndex);
    resetTimer();
  };

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  const resetTimer = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      currentIndex = (currentIndex + 1) % scenarios.length;
      render(currentIndex);
    }, 8000);
  };

  carousel.addEventListener('mouseenter', () => {
    if (autoTimer) clearInterval(autoTimer);
  });
  carousel.addEventListener('mouseleave', resetTimer);

  resetTimer();
}

/**
 * Shared Contact Page Configuration
 * Supply official business email addresses and a live form submission endpoint before launch.
 * Leaving values empty renders labeled placeholder blocks instead of fabricated contact details.
 */
const STOCKFLOW_CONTACT_CONFIG = {
  generalEmail: '',
  supportEmail: '',
  salesEmail: '',
  formEndpoint: ''
};

function initContactPage() {
  const channelSlots = document.querySelectorAll('[data-contact-channel]');
  const channelMap = {
    general: STOCKFLOW_CONTACT_CONFIG.generalEmail,
    support: STOCKFLOW_CONTACT_CONFIG.supportEmail,
    sales: STOCKFLOW_CONTACT_CONFIG.salesEmail
  };

  channelSlots.forEach((slot) => {
    const channel = slot.getAttribute('data-contact-channel');
    const configuredEmail = (channelMap[channel] || '').trim();
    if (configuredEmail) {
      const link = document.createElement('a');
      link.href = `mailto:${configuredEmail}`;
      link.textContent = configuredEmail;
      link.className = 'inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline break-all';
      slot.replaceChildren(link);
    }
  });

  const form = document.getElementById('contact-page-form');
  if (!form) return;

  const statusBox = document.getElementById('contact-form-status');
  const submitBtn = document.getElementById('contact-submit-btn');
  const nameInput = document.getElementById('contact-full-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');

  const errorEls = {
    name: document.getElementById('contact-error-name'),
    email: document.getElementById('contact-error-email'),
    subject: document.getElementById('contact-error-subject'),
    message: document.getElementById('contact-error-message')
  };

  const setFieldError = (input, errorEl, message) => {
    if (!input || !errorEl) return;
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      input.classList.add('border-danger', 'focus:border-danger');
      errorEl.textContent = message;
      errorEl.classList.remove('hidden');
    } else {
      input.removeAttribute('aria-invalid');
      input.classList.remove('border-danger', 'focus:border-danger');
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }
  };

  const showStatusBanner = (variant, heading, detail) => {
    if (!statusBox) return;
    const variantClasses = {
      error: 'border-danger/30 bg-danger/10 text-charcoal dark:text-cream',
      warning: 'border-warning/40 bg-warning/10 text-charcoal dark:text-cream',
      success: 'border-success/30 bg-success/10 text-charcoal dark:text-cream'
    };
    const titleColor = {
      error: 'text-danger',
      warning: 'text-warning',
      success: 'text-success'
    };

    statusBox.className = `rounded-2xl border p-4 text-sm ${variantClasses[variant] || variantClasses.warning}`;
    statusBox.innerHTML = '';

    const titleEl = document.createElement('p');
    titleEl.className = `font-display font-bold text-sm ${titleColor[variant] || 'text-brand'}`;
    titleEl.textContent = heading;

    const descEl = document.createElement('p');
    descEl.className = 'mt-1 text-xs leading-relaxed text-charcoal/80 dark:text-cream/80';
    descEl.textContent = detail;

    statusBox.appendChild(titleEl);
    statusBox.appendChild(descEl);
    statusBox.classList.remove('hidden');
  };

  [
    { input: nameInput, errorEl: errorEls.name },
    { input: emailInput, errorEl: errorEls.email },
    { input: subjectInput, errorEl: errorEls.subject },
    { input: messageInput, errorEl: errorEls.message }
  ].forEach(({ input, errorEl }) => {
    if (!input) return;
    input.addEventListener('input', () => setFieldError(input, errorEl, ''));
    input.addEventListener('change', () => setFieldError(input, errorEl, ''));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (statusBox) statusBox.classList.add('hidden');

    const fullName = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const subject = (subjectInput?.value || '').trim();
    const message = (messageInput?.value || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    let firstInvalid = null;

    if (fullName.length < 2) {
      setFieldError(nameInput, errorEls.name, 'Please enter your full name (at least 2 characters).');
      firstInvalid = firstInvalid || nameInput;
    } else {
      setFieldError(nameInput, errorEls.name, '');
    }

    if (!email) {
      setFieldError(emailInput, errorEls.email, 'Please enter your email address.');
      firstInvalid = firstInvalid || emailInput;
    } else if (!emailRegex.test(email)) {
      setFieldError(emailInput, errorEls.email, 'Please enter a valid email address (for example, name@company.com).');
      firstInvalid = firstInvalid || emailInput;
    } else {
      setFieldError(emailInput, errorEls.email, '');
    }

    if (!subject) {
      setFieldError(subjectInput, errorEls.subject, 'Please select an enquiry type.');
      firstInvalid = firstInvalid || subjectInput;
    } else {
      setFieldError(subjectInput, errorEls.subject, '');
    }

    if (message.length < 10) {
      setFieldError(messageInput, errorEls.message, 'Please enter at least 10 characters describing how we can help.');
      firstInvalid = firstInvalid || messageInput;
    } else {
      setFieldError(messageInput, errorEls.message, '');
    }

    if (firstInvalid) {
      showStatusBanner(
        'error',
        'Please complete the highlighted fields.',
        'Check your name, email address, enquiry type, and message before submitting.'
      );
      firstInvalid.focus();
      return;
    }

    const endpoint = (STOCKFLOW_CONTACT_CONFIG.formEndpoint || '').trim();
    if (!endpoint) {
      showStatusBanner(
        'warning',
        'Enquiry details validated.',
        `Thank you, ${fullName}. Your enquiry details passed form validation. Automated email sending is not enabled on this preview form.`
      );
      if (typeof window.showToast === 'function') {
        window.showToast('Enquiry details validated. Email delivery is not enabled here.', 'info', 4000);
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ fullName, email, subject, message })
      });
      if (!response.ok) {
        throw new Error(`Submission returned HTTP ${response.status}`);
      }
      form.reset();
      showStatusBanner(
        'success',
        'Enquiry submitted successfully.',
        'Your message was delivered to the configured STOCKFLOW contact endpoint.'
      );
      if (typeof window.showToast === 'function') {
        window.showToast('Your enquiry has been sent.', 'success');
      }
    } catch (err) {
      showStatusBanner(
        'error',
        'Unable to submit enquiry right now.',
        err instanceof Error ? err.message : 'Unexpected network error while contacting the configured form endpoint.'
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
      }
    }
  });
}

/**
 * Shared Footer Social Media Configuration
 * Update any non-empty URL below when official STOCKFLOW profiles go live.
 */
const STOCKFLOW_SOCIAL_LINKS = {
  instagram: '', // e.g. 'https://instagram.com/stockflow'
  facebook: '',  // e.g. 'https://facebook.com/stockflow'
  linkedin: '',  // e.g. 'https://linkedin.com/company/stockflow'
  x: ''          // e.g. 'https://x.com/stockflow'
};

const SOCIAL_PLATFORM_LABELS = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  x: 'X (Twitter)'
};

function initSocialLinks() {
  const socialLinks = document.querySelectorAll('#footer-social-links .social-link');
  socialLinks.forEach((link) => {
    const platform = link.getAttribute('data-platform');
    const url = (STOCKFLOW_SOCIAL_LINKS[platform] || '').trim();
    const label = SOCIAL_PLATFORM_LABELS[platform] || 'Social profile';

    if (url && url !== '#') {
      link.setAttribute('href', url);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      link.removeAttribute('aria-disabled');
    } else {
      link.setAttribute('href', '#footer-social-links');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.setAttribute('aria-disabled', 'true');
      link.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof window.showToast === 'function') {
          window.showToast(`${label} profile URL is not configured yet.`, 'info');
        }
      });
    }
  });
}

/**
 * Non-blocking Toast Notification Helper for Public Pages
 */
if (typeof window.showToast !== 'function') {
  window.showToast = function (message, type = 'info', duration = 3800) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const iconMap = {
      success: 'check-circle-2',
      error: 'alert-circle',
      warning: 'alert-triangle',
      info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i data-lucide="${iconMap[type] || 'info'}" class="w-4 h-4 flex-shrink-0"></i>
      <span class="flex-1 text-xs sm:text-sm leading-snug">${message}</span>
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
  };
}

/**
 * URL Test Hooks for QA Verification (scroll & dropdown state)
 */
function initTestHooks() {
  try {
    const params = new URLSearchParams(window.location.search);
    const testDropdown = params.get('test_dropdown');
    const testScroll = params.get('test_scroll');

    if (testDropdown) {
      const targetId = testDropdown === 'dashboard' ? 'dashboard-dropdown-btn' : 'home-dropdown-btn';
      const menuId = testDropdown === 'dashboard' ? 'dashboard-dropdown-menu' : 'home-dropdown-menu';
      const btn = document.getElementById(targetId);
      const menu = document.getElementById(menuId);
      if (btn && menu) {
        menu.classList.remove('hidden', 'opacity-0', 'translate-y-1', 'pointer-events-none');
        btn.setAttribute('aria-expanded', 'true');
      }
    }

    if (testScroll) {
      const target = document.getElementById(testScroll);
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    }
  } catch (_) {}
}

/**
 * STOCKFLOW - Main Public Interactions & Navigation
 * Handles sticky nav, mobile drawer, back-to-top, FAQ accordions, and pricing billing toggle.
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initHomeDropdown();
  initMobileHomeAccordion();
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
  initTestHooks();

  if (window.lucide) {
    window.lucide.createIcons();
  }
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
  if (!menuBtn || !mobileMenu) return;

  const iconMenu = menuBtn.querySelector('.icon-menu');
  const iconClose = menuBtn.querySelector('.icon-close');

  menuBtn.addEventListener('click', () => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !isExpanded);

    if (isExpanded) {
      mobileMenu.classList.add('hidden');
      if (iconMenu) iconMenu.classList.remove('hidden');
      if (iconClose) iconClose.classList.add('hidden');
    } else {
      mobileMenu.classList.remove('hidden');
      if (iconMenu) iconMenu.classList.add('hidden');
      if (iconClose) iconClose.classList.remove('hidden');
    }
  });

  // Close when clicking mobile links
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (iconMenu) iconMenu.classList.remove('hidden');
      if (iconClose) iconClose.classList.add('hidden');
    });
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
 * Home Navigation Dropdown (Desktop)
 */
function initHomeDropdown() {
  const container = document.querySelector('.home-dropdown-container');
  const btn = document.getElementById('home-dropdown-btn');
  const menu = document.getElementById('home-dropdown-menu');
  if (!btn || !menu) return;

  const chevron = btn.querySelector('.home-chevron, .dropdown-chevron');
  let hoverTimeout = null;

  const openMenu = () => {
    clearTimeout(hoverTimeout);
    menu.classList.remove('hidden', 'opacity-0', 'translate-y-1', 'pointer-events-none');
    btn.setAttribute('aria-expanded', 'true');
    if (chevron) chevron.classList.add('rotate-180');
  };

  const closeMenu = () => {
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    if (chevron) chevron.classList.remove('rotate-180');
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Desktop hover support with debounce
  if (container) {
    container.addEventListener('mouseenter', () => {
      if (window.innerWidth >= 1024) openMenu();
    });
    container.addEventListener('mouseleave', () => {
      if (window.innerWidth >= 1024) {
        hoverTimeout = setTimeout(closeMenu, 180);
      }
    });
  }

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      closeMenu();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
      closeMenu();
      btn.focus();
    }
  });

  // Close when clicking dropdown items
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });
}

/**
 * Mobile Home Accordion Menu
 */
function initMobileHomeAccordion() {
  const btn = document.getElementById('mobile-home-btn');
  const sublinks = document.getElementById('mobile-home-sublinks');
  if (!btn || !sublinks) return;

  const chevron = btn.querySelector('.mobile-home-chevron');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isClosed = sublinks.classList.contains('hidden');
    if (isClosed) {
      sublinks.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      if (chevron) chevron.classList.add('rotate-180');
    } else {
      sublinks.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      if (chevron) chevron.classList.remove('rotate-180');
    }
  });
}

/**
 * Active Navigation Link Indicator
 */
function initActiveNav() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const isHome1 = currentPath === 'index.html' || currentPath === '';
  const isHome2 = currentPath === 'home-2.html';

  // Highlight top-level Home button if on either Home 1 or Home 2
  const homeBtn = document.getElementById('home-dropdown-btn');
  const mobileHomeBtn = document.getElementById('mobile-home-btn');
  if (isHome1 || isHome2) {
    if (homeBtn) {
      homeBtn.classList.add('text-brand', 'font-semibold');
      homeBtn.classList.remove('text-charcoal/80', 'dark:text-cream/80');
    }
    if (mobileHomeBtn) {
      mobileHomeBtn.classList.add('text-brand', 'font-semibold');
    }
  }

  // Style active links in dropdown
  if (isHome1) {
    document.querySelectorAll('a[href="index.html"].home-dropdown-item').forEach(el => {
      el.classList.add('text-brand', 'font-bold', 'bg-brand/5', 'dark:bg-charcoal-700/50');
    });
  } else if (isHome2) {
    document.querySelectorAll('a[href="home-2.html"].home-dropdown-item').forEach(el => {
      el.classList.add('text-brand', 'font-bold', 'bg-brand/5', 'dark:bg-charcoal-700/50');
    });
  }

  // Other navigation links
  const navLinks = document.querySelectorAll('.nav-link:not(#home-dropdown-btn):not(.home-dropdown-item)');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('text-brand', 'font-semibold');
      link.classList.remove('text-charcoal/70', 'text-charcoal/80');
    }
  });
}

/**
 * Interactive FAQ Accordions
 */
function initFaqAccordions() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all others
      items.forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      if (isActive) {
        item.classList.remove('active');
      } else {
        item.classList.add('active');
      }
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
      const btn = document.getElementById('home-dropdown-btn');
      const menu = document.getElementById('home-dropdown-menu');
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

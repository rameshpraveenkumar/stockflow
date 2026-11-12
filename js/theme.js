/**
 * STOCKFLOW - Theme Management
 * Handles Instant Theme (Light/Dark) with LocalStorage persistence.
 */

(function () {
  // Immediately apply stored preferences or URL param to prevent flash of unstyled theme
  const urlParams = new URLSearchParams(window.location.search);
  const testTheme = urlParams.get('test_theme');
  const savedTheme = testTheme || localStorage.getItem('stockflow_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
});

/**
 * Initialize Light / Dark theme toggles across all pages
 */
function initThemeToggle() {
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  updateThemeIcons();

  themeToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('stockflow_theme', isDark ? 'dark' : 'light');
      updateThemeIcons();

      // Dispatch custom event so Chart.js and other components can adapt
      window.dispatchEvent(new CustomEvent('themechange', { detail: { isDark } }));
    });
  });
}

function updateThemeIcons() {
  const isDark = document.documentElement.classList.contains('dark');
  const lightIcons = document.querySelectorAll('.theme-icon-light');
  const darkIcons = document.querySelectorAll('.theme-icon-dark');

  lightIcons.forEach((el) => {
    el.style.display = isDark ? 'inline-block' : 'none';
  });
  darkIcons.forEach((el) => {
    el.style.display = isDark ? 'none' : 'inline-block';
  });
}

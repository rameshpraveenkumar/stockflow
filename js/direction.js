/**
 * STOCKFLOW - Direction (LTR/RTL) Management
 * Handles Instant Direction Switching with LocalStorage persistence.
 */

(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const testDir = urlParams.get('test_dir');
  const savedDir = testDir || localStorage.getItem('stockflow_dir') || 'ltr';
  document.documentElement.setAttribute('dir', savedDir);
})();

document.addEventListener('DOMContentLoaded', () => {
  initDirectionToggle();
});

/**
 * Initialize LTR / RTL direction toggle
 */
function initDirectionToggle() {
  const dirToggles = document.querySelectorAll('.dir-toggle-btn');
  updateDirLabels();

  dirToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'ltr' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', newDir);
      localStorage.setItem('stockflow_dir', newDir);
      updateDirLabels();

      // Dispatch event in case components need realignment
      window.dispatchEvent(new CustomEvent('directionchange', { detail: { dir: newDir } }));
    });
  });
}

function updateDirLabels() {
  const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
  const dirToggles = document.querySelectorAll('.dir-toggle-btn');
  dirToggles.forEach((btn) => {
    const nextDir = currentDir === 'ltr' ? 'RTL' : 'LTR';
    btn.setAttribute('aria-label', `Switch text direction (Current: ${currentDir.toUpperCase()}, click for ${nextDir})`);
    btn.setAttribute('title', `Switch text direction (Current: ${currentDir.toUpperCase()})`);
  });
  const dirLabels = document.querySelectorAll('.dir-toggle-label');
  dirLabels.forEach((label) => {
    label.textContent = currentDir.toUpperCase();
  });
}

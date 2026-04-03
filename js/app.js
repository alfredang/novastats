/* ===== APP INITIALIZATION ===== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme
  UI.initTheme();

  // Theme toggle
  const themeBtn = $('#themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', () => UI.toggleTheme());

  // Sidebar navigation — update hash on click
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const mod = item.dataset.module;
      window.location.hash = mod === 'data-input' ? '' : mod;
      UI.switchModule(mod);
    });
  });

  // Mobile tab navigation — update hash on click
  $$('.mobile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const mod = tab.dataset.module;
      window.location.hash = mod === 'data-input' ? '' : mod;
      UI.switchModule(mod);
    });
  });

  // Export buttons
  const exportCSVBtn = $('#exportCSV');
  const exportResultsBtn = $('#exportResults');
  const printBtn = $('#printResults');
  if (exportCSVBtn) exportCSVBtn.addEventListener('click', () => ExportManager.exportCSV());
  if (exportResultsBtn) exportResultsBtn.addEventListener('click', () => ExportManager.exportResults());
  if (printBtn) printBtn.addEventListener('click', () => ExportManager.printResults());

  // Export dropdown toggle
  const exportDropdown = $('#exportDropdown');
  const exportMenu = $('#exportMenu');
  if (exportDropdown && exportMenu) {
    exportDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      exportMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => {
      exportMenu.classList.remove('show');
    });
  }

  // Render data input panel (always available)
  UI.renderDataInputPanel();

  // Hash-based routing: support URLs like /novastats/#regression or /novastats/regression
  const routeFromURL = () => {
    // Check hash first: #regression, #correlation, etc.
    let route = window.location.hash.replace('#', '').replace('/', '').trim();

    // Also check pathname for /novastats/regression style URLs
    if (!route) {
      const path = window.location.pathname;
      const segments = path.split('/').filter(Boolean);
      // Last segment might be a module name (ignore 'novastats', 'index.html')
      const last = segments[segments.length - 1];
      if (last && last !== 'novastats' && !last.includes('.html') && UI.modules[last]) {
        route = last;
      }
    }

    return route && UI.modules[route] ? route : 'data-input';
  };

  // Navigate to initial route
  const initialModule = routeFromURL();
  UI.switchModule(initialModule);

  // Handle browser back/forward
  window.addEventListener('hashchange', () => {
    const mod = routeFromURL();
    UI.switchModule(mod);
  });

  // Listen for data changes to refresh active module
  AppState.onUpdate((type) => {
    if (type === 'data') {
      // Refresh variable selectors in active module if needed
    }
  });

  // Window resize handler for charts
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Re-render active module's charts
      const mod = AppState.activeModule;
      if (UI.modules[mod] && UI.modules[mod].render && mod !== 'data-input') {
        UI.modules[mod].render();
      }
    }, 300);
  });
});

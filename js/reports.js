/**
 * STOCKFLOW - Reports & Analytics Page Logic
 * Handles interactive Chart.js visualizations, inventory valuation summaries, top products by value, and CSV reports export.
 */

let valuationChart = null;
let movementChart = null;
let categoryShareChart = null;
let poSpendingChart = null;

document.addEventListener('DOMContentLoaded', () => {
  initReportsPage();
});

function initReportsPage() {
  renderReportMetrics();
  renderTopValuedProductsTable();
  renderCategoryBreakdownTable();
  initReportCharts();
  setupEventListeners();

  window.addEventListener('themechange', () => {
    initReportCharts();
  });
  window.addEventListener('directionchange', () => {
    initReportCharts();
  });
}

function renderReportMetrics() {
  const metrics = DataStore.calculateMetrics();
  const products = DataStore.getProducts();

  document.getElementById('rep-cost-valuation').textContent = `$${metrics.totalStockValueCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  document.getElementById('rep-retail-valuation').textContent = `$${metrics.totalStockValueRetail.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  
  const grossProfitSpread = metrics.totalStockValueRetail - metrics.totalStockValueCost;
  const marginPct = metrics.totalStockValueRetail > 0 ? ((grossProfitSpread / metrics.totalStockValueRetail) * 100).toFixed(1) : '0.0';
  
  document.getElementById('rep-profit-margin').textContent = `+$${grossProfitSpread.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${marginPct}% Margin)`;
  document.getElementById('rep-total-units').textContent = `${metrics.totalUnitsInStock} Units`;
  const skuSub = document.getElementById('rep-sku-sublabel');
  if (skuSub) skuSub.textContent = `Across ${products.length} product SKUs`;
}

function renderTopValuedProductsTable() {
  const tbody = document.getElementById('top-valued-tbody');
  if (!tbody) return;

  const products = DataStore.getProducts();
  const sorted = [...products].sort((a, b) => (b.stock * b.costPrice) - (a.stock * a.costPrice)).slice(0, 6);

  tbody.innerHTML = sorted.map((p, idx) => {
    const totalCost = p.stock * p.costPrice;
    const totalRetail = p.stock * p.sellingPrice;

    return `
      <tr class="hover:bg-cream/60 dark:hover:bg-charcoal-700/40 transition">
        <td class="py-2.5 px-3 font-bold text-charcoal/50 text-center">#${idx + 1}</td>
        <td class="py-2.5 px-3">
          <span class="font-bold text-charcoal dark:text-cream block">${p.name}</span>
          <span class="text-[10px] text-charcoal/50">${p.categoryName} • ${p.sku}</span>
        </td>
        <td class="py-2.5 px-3 text-center font-mono font-bold">${p.stock}</td>
        <td class="py-2.5 px-3 text-end font-mono">$${p.costPrice.toFixed(2)}</td>
        <td class="py-2.5 px-3 text-end font-mono font-bold text-brand">$${totalCost.toFixed(2)}</td>
        <td class="py-2.5 px-3 text-end font-mono text-success font-semibold">$${totalRetail.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
}

function renderCategoryBreakdownTable() {
  const tbody = document.getElementById('category-breakdown-tbody');
  if (!tbody) return;

  const categories = DataStore.getCategories();
  const products = DataStore.getProducts();

  tbody.innerHTML = categories.map(cat => {
    const catProds = products.filter(p => p.categoryId === cat.id);
    const totalUnits = catProds.reduce((sum, p) => sum + p.stock, 0);
    const costVal = catProds.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
    const retailVal = catProds.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);

    return `
      <tr class="hover:bg-cream/60 dark:hover:bg-charcoal-700/40 transition">
        <td class="py-2.5 px-3 font-bold text-charcoal dark:text-cream">${cat.name}</td>
        <td class="py-2.5 px-3 text-center font-mono">${catProds.length}</td>
        <td class="py-2.5 px-3 text-center font-mono">${totalUnits}</td>
        <td class="py-2.5 px-3 text-end font-mono font-bold text-brand">$${costVal.toFixed(2)}</td>
        <td class="py-2.5 px-3 text-end font-mono text-success font-semibold">$${retailVal.toFixed(2)}</td>
      </tr>
    `;
  }).join('');
}

function setupEventListeners() {
  const exportBtn = document.getElementById('export-valuation-csv-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportValuationReport();
    });
  }

  const rangeSelect = document.getElementById('report-time-range');
  if (rangeSelect) {
    rangeSelect.addEventListener('change', () => {
      showToast(`Reports adjusted for: ${rangeSelect.options[rangeSelect.selectedIndex].text}`, 'info');
      initReportCharts();
    });
  }
}

function exportValuationReport() {
  const products = DataStore.getProducts();
  const headers = ['Product Name', 'SKU', 'Category', 'Available Stock', 'Wholesale Cost Price', 'Total Cost Valuation', 'Retail Selling Price', 'Total Projected Retail Revenue', 'Gross Profit Potential'];
  
  const rows = products.map(p => {
    const totalCost = p.stock * p.costPrice;
    const totalRetail = p.stock * p.sellingPrice;
    const profit = totalRetail - totalCost;

    return [
      p.name,
      p.sku,
      p.categoryName,
      p.stock,
      p.costPrice.toFixed(2),
      totalCost.toFixed(2),
      p.sellingPrice.toFixed(2),
      totalRetail.toFixed(2),
      profit.toFixed(2)
    ];
  });

  DataStore.exportToCSV(headers, rows, `stockflow-valuation-report-${new Date().toISOString().split('T')[0]}.csv`);
  showToast('Valuation and Margin report exported to CSV.', 'success');
}

function initReportCharts() {
  if (typeof Chart === 'undefined') return;
  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#E8E8E2' : '#242A27';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  const categories = DataStore.getCategories();
  const products = DataStore.getProducts();

  const catNames = categories.map(c => c.name);
  const costByCat = categories.map(c => {
    const catProds = products.filter(p => p.categoryId === c.id);
    return parseFloat(catProds.reduce((sum, p) => sum + (p.stock * p.costPrice), 0).toFixed(2));
  });
  const retailByCat = categories.map(c => {
    const catProds = products.filter(p => p.categoryId === c.id);
    return parseFloat(catProds.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0).toFixed(2));
  });

  // Chart 1: Category Valuation Comparison (Cost vs Retail)
  const valCtx = document.getElementById('chartCategoryValuation');
  if (valCtx) {
    if (valuationChart) valuationChart.destroy();
    valuationChart = new Chart(valCtx, {
      type: 'bar',
      data: {
        labels: catNames,
        datasets: [
          {
            label: 'Cost Value Basis ($)',
            data: costByCat,
            backgroundColor: '#E88743',
            borderRadius: 6
          },
          {
            label: 'Retail Potential ($)',
            data: retailByCat,
            backgroundColor: '#32845A',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { size: 11 } } }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 10 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { size: 10 } }
          }
        }
      }
    });
  }

  // Chart 2: Category Share Donut
  const catShareCtx = document.getElementById('chartCategoryShare');
  if (catShareCtx) {
    if (categoryShareChart) categoryShareChart.destroy();
    categoryShareChart = new Chart(catShareCtx, {
      type: 'doughnut',
      data: {
        labels: catNames,
        datasets: [{
          data: costByCat,
          backgroundColor: ['#E88743', '#D99A32', '#32845A', '#A7B7A5', '#3B82F6', '#8B5CF6'],
          borderWidth: 2,
          borderColor: isDark ? '#242A27' : '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { size: 10 }, boxWidth: 10 }
          }
        }
      }
    });
  }

  // Chart 3: Monthly Purchase Procurement Spending
  const poCtx = document.getElementById('chartPOSpending');
  if (poCtx) {
    if (poSpendingChart) poSpendingChart.destroy();
    poSpendingChart = new Chart(poCtx, {
      type: 'line',
      data: {
        labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
        datasets: [{
          label: 'Supplier Procurement Spending ($)',
          data: [1240, 1560, 1420, 1890, 2150, 1780],
          borderColor: '#E88743',
          backgroundColor: 'rgba(232, 135, 67, 0.1)',
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#E88743',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: textColor, font: { size: 11 } } }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { size: 10 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, font: { size: 10 } }
          }
        }
      }
    });
  }
}

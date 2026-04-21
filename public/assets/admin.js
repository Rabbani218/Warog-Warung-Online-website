const adminStore = createStore({ orders: [], inventory: [], dashboard: { daily: [], monthly: [], alerts: [] }, recipes: [] });

function currency(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function renderDashboard(state) {
  const root = document.getElementById("dashboardStats");
  if (!root) {
    return;
  }

  root.innerHTML = "";

  const dailyPeak = Math.max(...state.dashboard.daily.map((item) => Number(item.revenue) || 0), 0);
  const monthlyPeak = Math.max(...state.dashboard.monthly.map((item) => Number(item.revenue) || 0), 0);

  root.innerHTML = `
    <article class="stat-card"><span>Pendapatan 7 Hari</span><strong>${currency(state.dashboard.daily.reduce((sum, item) => sum + Number(item.revenue || 0), 0))}</strong></article>
    <article class="stat-card"><span>Pendapatan 6 Bulan</span><strong>${currency(state.dashboard.monthly.reduce((sum, item) => sum + Number(item.revenue || 0), 0))}</strong></article>
    <article class="stat-card"><span>Alert Stok</span><strong>${state.dashboard.alerts.length}</strong></article>
  `;

  const makeBars = (items, peak, labelKey) =>
    items
      .map(
        (item) => `
          <div class="space-y-2">
            <div class="row justify-between text-xs uppercase tracking-[0.2em] text-stone-500"><span>${item.period}</span><span>${currency(item.revenue)}</span></div>
            <div class="h-3 rounded-full bg-amber-100 overflow-hidden"><div class="h-full rounded-full bg-emerald-600" style="width:${peak ? (Number(item.revenue) / peak) * 100 : 0}%"></div></div>
          </div>
        `
      )
      .join("");

  const bars = document.createElement("section");
  bars.className = "panel-inner mt-4 grid gap-6 lg:grid-cols-2";
  bars.innerHTML = `
    <div>
      <h3 class="chalk-title text-xl">Grafik Harian</h3>
      <div class="space-y-4 mt-4">${makeBars(state.dashboard.daily, dailyPeak, "daily")}</div>
    </div>
    <div>
      <h3 class="chalk-title text-xl">Grafik Bulanan</h3>
      <div class="space-y-4 mt-4">${makeBars(state.dashboard.monthly, monthlyPeak, "monthly")}</div>
    </div>
  `;

  root.appendChild(bars);

  if (state.dashboard.alerts.length) {
    const alertBox = document.createElement("div");
    alertBox.className = "mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900";
    alertBox.innerHTML = `<strong>Inventory Alert:</strong> ${state.dashboard.alerts.map((item) => `${item.ingredient_name} (${item.stock_qty} ${item.unit})`).join(", ")}`;
    root.appendChild(alertBox);
  }
}

function renderRecipes(state) {
  const root = document.getElementById("recipeTable");
  if (!root) {
    return;
  }

  root.innerHTML = state.recipes
    .map(
      (recipe) => `
        <div class="row justify-between border-b border-amber-100 py-3">
          <div>
            <strong>${recipe.menu_name}</strong>
            <p class="text-xs text-stone-500">${recipe.ingredient_name}</p>
          </div>
          <span class="badge">${recipe.qty_needed} ${recipe.unit}</span>
        </div>
      `
    )
    .join("");
}

function renderOrders(state) {
  const root = document.getElementById("adminOrders");
  root.innerHTML = "";

  for (const order of state.orders) {
    const card = document.createElement("article");
    card.className = "menu-item";
    card.innerHTML = `
      <div class="row">
        <strong>${order.transaction_code}</strong>
        <span class="badge">${order.status}</span>
        <span class="badge">${order.payment_status || "NO_TX"}</span>
      </div>
      <p>Meja: ${order.table_number} | Total: Rp ${Number(order.grand_total || 0).toLocaleString("id-ID")}</p>
      <label>Metode
        <select data-method>
          <option>CASH</option>
          <option>QRIS</option>
          <option>DEBIT</option>
          <option>CREDIT</option>
        </select>
      </label>
      <button data-pay>Validasi Pembayaran</button>
    `;

    card.querySelector("[data-pay]").addEventListener("click", async () => {
      try {
        const payment_method = card.querySelector("[data-method]").value;
        await apiFetch(`/api/admin/orders/${order.id}/pay`, {
          method: "PATCH",
          body: JSON.stringify({ payment_method })
        });
        await refreshData();
      } catch (error) {
        alert(error.message);
      }
    });

    root.appendChild(card);
  }
}

function renderInventory(state) {
  const root = document.getElementById("inventoryTable");
  root.innerHTML = state.inventory
    .map(
      (item) =>
        `<div class="row justify-between border-b border-amber-100 py-3"><strong>${item.ingredient_name}</strong><span class="${Number(item.stock_qty) <= Number(item.minimum_stock) ? "text-red-600 font-semibold" : "text-stone-700"}">${item.stock_qty} ${item.unit}</span></div>`
    )
    .join("");
}

adminStore.subscribe((state) => {
  renderDashboard(state);
  renderOrders(state);
  renderInventory(state);
  renderRecipes(state);
});

async function refreshData() {
  const [orders, inventory, dashboard, recipes] = await Promise.all([
    apiFetch("/api/admin/orders", { method: "GET" }),
    apiFetch("/api/admin/inventory", { method: "GET" }),
    apiFetch("/api/admin/dashboard", { method: "GET" }),
    apiFetch("/api/admin/recipes", { method: "GET" })
  ]);

  adminStore.setState({ orders, inventory, dashboard, recipes });
}

refreshData().catch((error) => alert(error.message));
setInterval(() => {
  refreshData().catch(() => {});
}, 5000);

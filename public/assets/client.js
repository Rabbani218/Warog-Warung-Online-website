const clientStore = createStore({ menus: [], cart: [] });

function renderMenus(state) {
  const root = document.getElementById("menuList");
  root.innerHTML = "";

  for (const menu of state.menus) {
    const card = document.createElement("article");
    card.className = "menu-item tray-card";
    card.innerHTML = `
      <h3>${menu.menu_name}</h3>
      <p>Rp ${Number(menu.price).toLocaleString("id-ID")}</p>
      <label>Qty <input type="number" min="1" value="1" data-qty /></label>
      <label>Catatan <input placeholder="contoh: tidak pakai gula" data-note /></label>
      <button data-add>Tambah ke Cart</button>
    `;

    card.querySelector("[data-add]").addEventListener("click", () => {
      const qty = Number(card.querySelector("[data-qty]").value || 1);
      const note = card.querySelector("[data-note]").value || "";
      const current = clientStore.getState().cart;
      clientStore.setState({
        cart: [...current, { menu_id: menu.id, qty, note }]
      });
      writeOutput(`Cart terisi ${clientStore.getState().cart.length} item.`);
    });

    root.appendChild(card);
  }
}

function writeOutput(text) {
  document.getElementById("clientOutput").textContent = text;
}

async function loadMenus() {
  const menus = await apiFetch("/api/client/menus", { method: "GET" });
  clientStore.setState({ menus });
}

async function onCheckout(event) {
  event.preventDefault();
  const form = new FormData(event.target);
  const payload = {
    table_number: form.get("table_number"),
    customer_name: form.get("customer_name"),
    tax_percent: Number(form.get("tax_percent") || 0),
    discount_amount: Number(form.get("discount_amount") || 0),
    items: clientStore.getState().cart
  };

  const checkout = await apiFetch("/api/client/orders/checkout", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  const split = await apiFetch(`/api/client/orders/${checkout.data.order_id}/split`, {
    method: "GET"
  });

  writeOutput(JSON.stringify(split, null, 2));
  clientStore.setState({ cart: [] });
}

clientStore.subscribe(renderMenus);

document.getElementById("checkoutForm").addEventListener("submit", (event) => {
  onCheckout(event).catch((error) => writeOutput(error.message));
});

loadMenus().catch((error) => writeOutput(error.message));

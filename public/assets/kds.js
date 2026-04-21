const kdsStore = createStore({ queue: [] });

function renderQueue(state) {
  const root = document.getElementById("kdsQueue");
  root.innerHTML = "";

  for (const order of state.queue) {
    const card = document.createElement("article");
    card.className = "menu-item kds-card";
    card.innerHTML = `
      <div class="row">
        <strong>${order.transaction_code}</strong>
        <span class="badge">${order.status}</span>
      </div>
      <p>Meja ${order.table_number} - ${order.customer_name || "Guest"}</p>
      <div class="row">
        <button data-processing>Processing</button>
        <button class="secondary" data-completed>Completed</button>
      </div>
    `;

    card.querySelector("[data-processing]").addEventListener("click", () => {
      updateStatus(order.id, "PROCESSING");
    });
    card.querySelector("[data-completed]").addEventListener("click", () => {
      updateStatus(order.id, "COMPLETED");
    });

    root.appendChild(card);
  }
}

kdsStore.subscribe(renderQueue);

async function refreshQueue() {
  const queue = await apiFetch("/api/kds/orders/queue", { method: "GET" });
  kdsStore.setState({ queue });
}

async function updateStatus(orderId, status) {
  await apiFetch(`/api/kds/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
  await refreshQueue();
}

refreshQueue().catch((error) => alert(error.message));

const source = new EventSource("/api/kds/orders/stream", { withCredentials: true });
source.onmessage = () => {
  refreshQueue().catch(() => {});
};

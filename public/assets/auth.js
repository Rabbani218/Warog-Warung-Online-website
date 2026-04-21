async function refreshSessionBadge() {
  const badge = document.getElementById("sessionBadge");
  if (!badge) {
    return;
  }

  try {
    const result = await apiFetch("/api/auth/me", { method: "GET" });
    badge.textContent = `${result.user.full_name} • ${result.user.role}`;
  } catch (error) {
    badge.textContent = "Belum login";
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const output = document.getElementById("loginOutput");

  try {
    const result = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });

    output.textContent = `Login berhasil sebagai ${result.user.role}.`;
    await refreshSessionBadge();

    if (result.user.role === "KITCHEN") {
      window.location.href = "/kds.html";
      return;
    }

    if (result.user.role === "ADMIN" || result.user.role === "CASHIER") {
      window.location.href = "/admin.html";
      return;
    }

    window.location.href = "/client.html";
  } catch (error) {
    output.textContent = error.message;
  }
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", handleLogin);
  refreshSessionBadge();
}
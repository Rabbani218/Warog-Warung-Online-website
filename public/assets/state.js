function createStore(initialState) {
  let state = initialState;
  const listeners = [];

  function getState() {
    return state;
  }

  function setState(partial) {
    state = { ...state, ...partial };
    for (const listener of listeners) {
      listener(state);
    }
  }

  function subscribe(listener) {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) {
        listeners.splice(idx, 1);
      }
    };
  }

  return { getState, setState, subscribe };
}

async function ensureCsrfToken() {
  const existing = localStorage.getItem("csrfToken");
  if (existing) {
    return existing;
  }

  const response = await fetch("/api/csrf-token", { credentials: "include" });
  const data = await response.json();
  localStorage.setItem("csrfToken", data.csrfToken);
  return data.csrfToken;
}

async function apiFetch(url, options = {}) {
  const token = await ensureCsrfToken();
  const mergedHeaders = {
    "Content-Type": "application/json",
    "x-csrf-token": token,
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers: mergedHeaders
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(errorData.message || "Request failed");
  }

  return response.json().catch(() => ({}));
}

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function parseJsonResponse(res, fallback) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : fallback;
  } catch {
    data = fallback;
  }
  return data;
}

export async function getTemas() {
  const res = await fetch(`${BASE}/temas`);
  if (!res.ok) throw new Error("Error al cargar temas");
  return res.json();
}

export async function getAventuras() {
  const res = await fetch(`${BASE}/aventuras`);
  if (!res.ok) throw new Error("No se pudo cargar aventuras");
  return res.json();
}

export async function getMenuItems() {
  const res = await fetch(`${BASE}/menu`);
  const data = await parseJsonResponse(res, []);
  if (!res.ok) throw new Error("No se pudo cargar el menú");
  return data;
}

export async function getHomeContent() {
  const res = await fetch(`${BASE}/home`);
  const data = await parseJsonResponse(res, {});
  if (!res.ok) throw new Error("No se pudo cargar la página de inicio");
  return data;
}

export async function getMisiones() {
  const res = await fetch(`${BASE}/misiones`);
  const data = await parseJsonResponse(res, []);
  if (!res.ok) throw new Error("No se pudo cargar las misiones");
  return data;
}

export async function getMisionDetail(id) {
  const res = await fetch(`${BASE}/misiones/${encodeURIComponent(id)}`);
  const data = await parseJsonResponse(res, null);
  if (!res.ok) throw new Error(data?.error || "No se pudo cargar la misión");
  return data;
}

// Auth API
export async function login({ email, password }) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await parseJsonResponse(res, {});
  if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");
  return data;
}

export async function registerUser({ fullName, phone, email, username, password }) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, phone, email, username, password })
  });
  const data = await parseJsonResponse(res, {});
  if (!res.ok) throw new Error(data.message || "Error al registrarse");
  return data;
}

// Forgot/Reset password API
export async function forgotPassword(email) {
  const res = await fetch(`${BASE}/auth/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await parseJsonResponse(res, {});
  if (!res.ok) throw new Error(data.message || "No se pudo iniciar la recuperación");
  return data;
}

export async function resetPassword({ token, password }) {
  const res = await fetch(`${BASE}/auth/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password })
  });
  const data = await parseJsonResponse(res, {});
  if (!res.ok) throw new Error(data.message || "No se pudo restablecer la contraseña");
  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await parseJsonResponse(res, {});
  if (!res.ok) throw new Error(data.message || "No se pudo cambiar la contraseña");
  return data;
}

// Levels API
export async function getNiveles() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/niveles`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  const data = await parseJsonResponse(res, []);
  if (!res.ok) throw new Error(data.message || "No se pudo cargar niveles");
  return data;
}

export async function completeNivel(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/niveles/${encodeURIComponent(id)}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  const data = await parseJsonResponse(res, {});
  if (!res.ok) throw new Error(data.message || "No se pudo marcar nivel");
  return data;
}

// Misiones: marcar como completada
export async function completeMision(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/misiones/${encodeURIComponent(id)}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  const data = await parseJsonResponse(res, {});
  if (!res.ok) throw new Error(data.message || "No se pudo marcar misión");
  return data;
}

// Misiones: marcar como completada con resumen (best-effort)
export async function completeMisionSummary(id, summary) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE}/misiones/${encodeURIComponent(id)}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ summary })
  });
  const data = await parseJsonResponse(res, {});
  if (!res.ok) throw new Error(data.message || "No se pudo marcar misi��n");
  return data;
}

const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

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

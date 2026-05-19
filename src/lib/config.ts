export const API_BASE_URL = (
  window.__ENV__?.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080"
).replace(/\/$/, "");

export const GRAPHQL_URL = `${API_BASE_URL}/graphql`;

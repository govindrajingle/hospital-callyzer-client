import apiClient from "./apiClient";

export async function listRoles() {
  const res = await apiClient.get("/roles");
  return res.data.data;
}

export async function createRole(payload) {
  const res = await apiClient.post("/roles", payload);
  return res.data.data;
}

export async function updateRole(id, payload) {
  const res = await apiClient.put(`/roles/${id}`, payload);
  return res.data.data;
}

import apiClient from "./apiClient";

export const getRoles = async () => {
  const response = await apiClient.get("/role-masters");
  return response.data.data;
};

export const createRole = async (roleData) => {
  const response = await apiClient.post("/role-masters", roleData);
  return response.data.data;
};

export const updateRole = async (id, updates) => {
  const response = await apiClient.put(`/role-masters/${id}`, updates);
  return response.data.data;
};

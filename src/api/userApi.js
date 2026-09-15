import apiClient from "./apiClient";

export const getUsers = async () => {
  const response = await apiClient.get("/users");
  return response.data.data;
};

export const createUser = async (userData) => {
  const response = await apiClient.post("/users", userData);
  return response.data.data;
};

export const updateUser = async (id, updates) => {
  const response = await apiClient.put(`/users/${id}`, updates);
  return response.data.data;
};

export const deactivateUser = async (id) => {
  const response = await apiClient.patch(`/users/${id}/deactivate`);
  return response.data.data;
};

export const activateUser = async (id) => {
  const response = await apiClient.patch(`/users/${id}/activate`);
  return response.data.data;
};

export const resetUserPassword = async (id, newPassword) => {
  const response = await apiClient.patch(`/users/${id}/reset-password`, {
    newPassword,
  });
  return response.data.data;
};

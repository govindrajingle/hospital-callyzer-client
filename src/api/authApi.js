import apiClient from "./apiClient";

export const login = async (username, password) => {
  const response = await apiClient.post("/auth/login", { username, password });
  return response.data.data; // { token, user }
};

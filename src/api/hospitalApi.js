import apiClient from "./apiClient";

export const getHospitals = async () => {
  const response = await apiClient.get("/hospitals");
  return response.data.data;
};

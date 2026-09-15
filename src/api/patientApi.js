import apiClient from "./apiClient";

export const getPatients = async ({ limit = 50, offset = 0 } = {}) => {
  const response = await apiClient.get("/patients", {
    params: { limit, offset },
  });
  return response.data; // { success, data, pagination }
};

export const searchPatients = async ({ name, mobile, mrn } = {}) => {
  const response = await apiClient.get("/patients/search", {
    params: { name, mobile, mrn },
  });
  return response.data.data;
};

export const getPatientById = async (id) => {
  const response = await apiClient.get(`/patients/${id}`);
  return response.data.data;
};

export const checkDuplicate = async (mobile, dateOfBirth) => {
  const response = await apiClient.get("/patients/check-duplicate", {
    params: { mobile, dateOfBirth },
  });
  return response.data.data; // { hasPotentialDuplicates, duplicates }
};

// Returns a normalized result instead of throwing on the expected 409
// duplicate case, so the calling component can handle "needs confirmation"
// as a normal outcome rather than an error path.
export const createPatient = async (patientData) => {
  try {
    const response = await apiClient.post("/patients", patientData);
    return { success: true, patient: response.data.data };
  } catch (error) {
    if (error.response && error.response.status === 409) {
      return {
        success: false,
        duplicate: true,
        duplicates: error.response.data.data.possibleDuplicates,
      };
    }
    throw error;
  }
};

export const updatePatient = async (id, updates) => {
  const response = await apiClient.put(`/patients/${id}`, updates);
  return response.data.data;
};

export const deactivatePatient = async (id) => {
  const response = await apiClient.patch(`/patients/${id}/deactivate`);
  return response.data.data;
};

export const activatePatient = async (id) => {
  const response = await apiClient.patch(`/patients/${id}/activate`);
  return response.data.data;
};

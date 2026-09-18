import apiClient from "./apiClient";

export const getAppointmentTypes = async () => {
  const response = await apiClient.get("/appointments/types");
  return response.data.data;
};

// Powers the booking form's slot picker: this doctor's own consultation-
// hours grid for the day (their working hours + lunch break — either
// custom-set via doctorScheduleApi or the clinic default) with each slot
// flagged available/booked/past/on-break. excludeAppointmentId lets edit
// mode treat the appointment's own current slot as available (not "booked
// by itself"). Returns { schedule, slots }.
export const getAvailableSlots = async ({ doctorId, date, excludeAppointmentId } = {}) => {
  const response = await apiClient.get("/appointments/available-slots", {
    params: { doctorId, date, excludeAppointmentId },
  });
  return response.data.data;
};

export const getAppointments = async ({ view, date } = {}) => {
  const response = await apiClient.get("/appointments", { params: { view, date } });
  return response.data.data;
};

export const getMyAppointments = async ({ view, date } = {}) => {
  const response = await apiClient.get("/appointments/mine", { params: { view, date } });
  return response.data.data;
};

export const getAppointmentsByPatient = async (patientId) => {
  const response = await apiClient.get(`/appointments/patient/${patientId}`);
  return response.data.data;
};

export const getAppointmentById = async (id) => {
  const response = await apiClient.get(`/appointments/${id}`);
  return response.data.data;
};

// Returns a normalized result instead of throwing on the expected 422
// "confirm new category" case, so the form can treat it as a normal
// outcome (show a confirm dialog) rather than an error path — same pattern
// patientApi.createPatient uses for the 409 duplicate case.
export const createAppointment = async (appointmentData) => {
  try {
    const response = await apiClient.post("/appointments", appointmentData);
    return { success: true, appointment: response.data.data };
  } catch (error) {
    if (error.response?.status === 422 && error.response.data?.data?.code === "NEW_TYPE_CONFIRMATION_REQUIRED") {
      return { success: false, needsTypeConfirmation: true, typeName: error.response.data.data.typeName };
    }
    if (error.response?.status === 409) {
      return { success: false, slotConflict: true, message: error.response.data.message };
    }
    throw error;
  }
};

export const updateAppointment = async (id, updates) => {
  try {
    const response = await apiClient.put(`/appointments/${id}`, updates);
    return { success: true, appointment: response.data.data };
  } catch (error) {
    if (error.response?.status === 422 && error.response.data?.data?.code === "NEW_TYPE_CONFIRMATION_REQUIRED") {
      return { success: false, needsTypeConfirmation: true, typeName: error.response.data.data.typeName };
    }
    if (error.response?.status === 409) {
      return { success: false, slotConflict: true, message: error.response.data.message };
    }
    throw error;
  }
};

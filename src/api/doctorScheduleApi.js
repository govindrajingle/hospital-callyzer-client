import apiClient from "./apiClient";

// A doctor's own consultation-hours master form — the appointment slot
// picker builds its grid from whatever this returns (either the doctor's
// saved hours, or the clinic default of 9 AM-9 PM with a 1-3 PM break).
export const getMySchedule = async () => {
  const response = await apiClient.get("/doctor-schedule/mine");
  return response.data.data;
};

export const updateMySchedule = async (schedule) => {
  const response = await apiClient.put("/doctor-schedule/mine", schedule);
  return response.data.data;
};

// Admin/Receptionist read-only lookup (booking-form context); Admin-only override.
export const getScheduleForDoctor = async (doctorId) => {
  const response = await apiClient.get(`/doctor-schedule/${doctorId}`);
  return response.data.data;
};

export const updateScheduleForDoctor = async (doctorId, schedule) => {
  const response = await apiClient.put(`/doctor-schedule/${doctorId}`, schedule);
  return response.data.data;
};

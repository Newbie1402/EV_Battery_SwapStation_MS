import { apiClient } from "./apiClient";

// ==================== BASE URLs ====================
const BASE_URL = "/auth-user/api/admin";
const BASE_URL_STAFF = `${BASE_URL}/staff`;
const BASE_URL_DRIVERS = `${BASE_URL}/drivers`;
const BASE_URL_USERS = `${BASE_URL}/users`;
const BASE_URL_VEHICLES = `${BASE_URL}/vehicles`;
const BASE_URL_REGISTRATIONS = `${BASE_URL}/registrations`;

// ==================== STAFF MANAGEMENT ====================
export const getStaffById = async (employeeId) => apiClient.get(`${BASE_URL_STAFF}/${employeeId}`);
export const getAllStaff = async () => apiClient.get(BASE_URL_STAFF);
export const updateStaff = async (employeeId, data) => apiClient.put(`${BASE_URL_STAFF}/${employeeId}`, data);

// ==================== DRIVER MANAGEMENT ====================
export const getAllDrivers = async () => apiClient.get(BASE_URL_DRIVERS);
export const getDriverById = async (employeeId) => apiClient.get(`${BASE_URL_DRIVERS}/${employeeId}`);

// ==================== USER ACCOUNT MANAGEMENT ====================
export const deactivateUser = async (userId) => apiClient.put(`${BASE_URL_USERS}/${userId}/deactivate`);
export const activateUser = async (userId) => apiClient.put(`${BASE_URL_USERS}/${userId}/activate`);

// ==================== VEHICLE MANAGEMENT ====================
export const getVehicleById = async (vehicleId) => apiClient.get(`${BASE_URL_VEHICLES}/${vehicleId}`);
export const getAllVehicles = async () => apiClient.get(BASE_URL_VEHICLES);
export const getUnassignedVehicles = async () => apiClient.get(`${BASE_URL_VEHICLES}/unassigned`);
export const createVehicle = async (data) => apiClient.post(BASE_URL_VEHICLES, data);
export const updateVehicle = async (vehicleId, data) => apiClient.put(`${BASE_URL_VEHICLES}/${vehicleId}`, data);
export const revokeVehicle = async (vehicleId) => apiClient.post(`${BASE_URL_VEHICLES}/${vehicleId}/revoke`);
export const uploadVehicleImage = async (vehicleId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`${BASE_URL_VEHICLES}/${vehicleId}/image`, formData, { headers: { "Content-Type": "multipart/form-data" } });
};
export const deleteVehicleImage = async (vehicleId) => apiClient.delete(`${BASE_URL_VEHICLES}/${vehicleId}/image`);
export const deleteVehicle = async (vehicleId) => apiClient.delete(`${BASE_URL_VEHICLES}/${vehicleId}`);

// ==================== REGISTRATION MANAGEMENT ====================
export const getPendingRegistrations = async (role) => apiClient.get(`${BASE_URL_REGISTRATIONS}/pending`, { params: role ? { role } : {} });
export const approveRegistration = async (data) => apiClient.post(`${BASE_URL_REGISTRATIONS}/approve`, data);

export const adminApi = {
    getStaffById,
    getAllStaff,
    updateStaff,
    getAllDrivers,
    getDriverById,
    deactivateUser,
    activateUser,
    getVehicleById,
    getAllVehicles,
    getUnassignedVehicles,
    createVehicle,
    updateVehicle,
    revokeVehicle,
    uploadVehicleImage,
    deleteVehicleImage,
    deleteVehicle,
    getPendingRegistrations,
    approveRegistration,
};
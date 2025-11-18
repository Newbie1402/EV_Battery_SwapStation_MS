import { apiClient } from "./apiClient";

// ==================== BASE URLs ====================
const BASE_URL = "/auth-user/api/admin";
const BASE_URL_STAFF = `${BASE_URL}/staff`;
const BASE_URL_DRIVERS = `${BASE_URL}/drivers`;
const BASE_URL_USERS = `${BASE_URL}/users`;
const BASE_URL_VEHICLES = `${BASE_URL}/vehicles`;

// ==================== STAFF MANAGEMENT ====================

/**
 * Lấy chi tiết nhân viên theo mã nhân viên
 * @param {string} employeeId
 * @returns {Promise<Object>}
 */
export const getStaffById = async (employeeId) => {
    const response = await apiClient.get(`${BASE_URL_STAFF}/${employeeId}`);
    return response;
};

/**
 * Lấy danh sách tất cả nhân viên trạm
 * @returns {Promise<Array>}
 */
export const getAllStaff = async () => {
    const response = await apiClient.get(BASE_URL_STAFF);
    return response;
};

/**
 * Cập nhật thông tin nhân viên
 * @param {string} employeeId
 * @param {object} data - {phone, fullName, birthday, address}
 * @returns {Promise<Object>}
 */
export const updateStaff = async (employeeId, data) => {
    const response = await apiClient.put(`${BASE_URL_STAFF}/${employeeId}`, data);
    return response;
};

// ==================== DRIVER MANAGEMENT ====================

/**
 * Lấy danh sách tất cả tài xế
 * @returns {Promise<Array>}
 */
export const getAllDrivers = async () => {
    const response = await apiClient.get(BASE_URL_DRIVERS);
    return response;
};

/**
 * Lấy chi tiết tài xế theo mã nhân viên
 * @param {string} employeeId
 * @returns {Promise<Object>}
 */
export const getDriverById = async (employeeId) => {
    const response = await apiClient.get(`${BASE_URL_DRIVERS}/${employeeId}`);
    return response;
};

// ==================== USER ACCOUNT MANAGEMENT ====================

/**
 * Vô hiệu hóa tài khoản người dùng
 * @param {number} userId
 * @returns {Promise<string>}
 */
export const deactivateUser = async (userId) => {
    const response = await apiClient.put(`${BASE_URL_USERS}/${userId}/deactivate`);
    return response;
};

/**
 * Kích hoạt tài khoản người dùng
 * @param {number} userId
 * @returns {Promise<string>}
 */
export const activateUser = async (userId) => {
    const response = await apiClient.put(`${BASE_URL_USERS}/${userId}/activate`);
    return response;
};

// ==================== VEHICLE MANAGEMENT ====================

/**
 * Lấy chi tiết phương tiện theo vehicleId
 * @param {string} vehicleId
 * @returns {Promise<Object>}
 */
export const getVehicleById = async (vehicleId) => {
    const response = await apiClient.get(`${BASE_URL_VEHICLES}/${vehicleId}`);
    return response;
};

/**
 * Lấy tất cả phương tiện
 * @returns {Promise<Array>}
 */
export const getAllVehicles = async () => {
    const response = await apiClient.get(BASE_URL_VEHICLES);
    return response;
};

/**
 * Lấy danh sách phương tiện chưa cấp phát
 * @returns {Promise<Array>}
 */
export const getUnassignedVehicles = async () => {
    const response = await apiClient.get(`${BASE_URL_VEHICLES}/unassigned`);
    return response;
};

/**
 * Thêm phương tiện mới vào hệ thống
 * @param {object} data - {vin, model, licensePlate, batteryType, batteryCapacity, notes}
 * @returns {Promise<Object>}
 */
export const createVehicle = async (data) => {
    const response = await apiClient.post(BASE_URL_VEHICLES, data);
    return response;
};

/**
 * Cập nhật thông tin phương tiện và cấp phát cho tài xế
 * @param {string} vehicleId
 * @param {object} data - {employeeId, model, licensePlate, batteryType, batteryCapacity, status}
 * @returns {Promise<Object>}
 */
export const updateVehicle = async (vehicleId, data) => {
    const response = await apiClient.put(`${BASE_URL_VEHICLES}/${vehicleId}`, data);
    return response;
};

/**
 * Thu hồi phương tiện từ tài xế (bỏ gán)
 * @param {string} vehicleId
 * @returns {Promise<Object>}
 */
export const revokeVehicle = async (vehicleId) => {
    const response = await apiClient.post(`${BASE_URL_VEHICLES}/${vehicleId}/revoke`);
    return response;
};

/**
 * Upload ảnh phương tiện lên AWS S3
 * @param {string} vehicleId
 * @param {File} file
 * @returns {Promise<Object>}
 */
export const uploadVehicleImage = async (vehicleId, file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(
        `${BASE_URL_VEHICLES}/${vehicleId}/image`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response;
};

/**
 * Xóa ảnh phương tiện khỏi AWS S3
 * @param {string} vehicleId
 * @returns {Promise<void>}
 */
export const deleteVehicleImage = async (vehicleId) => {
    const response = await apiClient.delete(`${BASE_URL_VEHICLES}/${vehicleId}/image`);
    return response;
};

/**
 * Xóa phương tiện khỏi hệ thống (soft delete)
 * @param {string} vehicleId
 * @returns {Promise<void>}
 */
export const deleteVehicle = async (vehicleId) => {
    const response = await apiClient.delete(`${BASE_URL_VEHICLES}/${vehicleId}`);
    return response;
};

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
};
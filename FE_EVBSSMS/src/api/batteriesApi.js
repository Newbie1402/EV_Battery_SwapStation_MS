import { apiClient } from "./apiClient";

/**
 * Battery API
 * Base URL: /station/api/batteries
 */

const BASE_URL = "/station/api/batteries";

/**
 * Battery Status Constants
 */
export const BATTERY_STATUS = {
    FULL: "FULL",
    CHARGING: "CHARGING",
    IN_USE: "IN_USE",
    DEFECTIVE: "DEFECTIVE",
    MAINTENANCE: "MAINTENANCE",
    IN_STOCK: "IN_STOCK",
};

/**
 * Battery Owner Type Constants
 */
export const BATTERY_OWNER_TYPE = {
    STATION: "STATION",
    VEHICLE: "VEHICLE",
};

/**
 * Lấy tất cả batteries
 * GET /station/api/batteries/getall
 * @returns {Promise<Object>}
 */
export const getAllBatteries = async () => {
    return await apiClient.get(`${BASE_URL}/getall`);
};

/**
 * Lấy chi tiết battery theo ID
 * GET /station/api/batteries/get/{id}
 * @param {number} id - Battery ID
 * @returns {Promise<Object>}
 */
export const getBatteryById = async (id) => {
    return await apiClient.get(`${BASE_URL}/get/${id}`);
};

/**
 * Tìm battery theo mã pin (battery code)
 * POST /station/api/batteries/get/batterycode
 * @param {string} code - Battery code
 * @returns {Promise<Object>}
 */
export const getBatteryByCode = async (code) => {
    return await apiClient.post(`${BASE_URL}/get/batterycode`, { code });
};

/**
 * Xử lý sự kiện giữ pin (Hold Battery)
 * POST /station/api/batteries/event/hold
 * @param {string} batteryCode - Battery code
 * @returns {Promise<Object>}
 */
export const holdBattery = async (batteryCode) => {
    return await apiClient.post(`${BASE_URL}/event/hold`, { batteryCode });
};

/**
 * Xử lý sự kiện hoán đổi pin từ trạm sang trạm
 * POST /station/api/batteries/event/swapstation-to-station
 * @param {Object} data - Swap event data
 * @param {string} data.batteryId
 * @param {string} data.oldStationId
 * @param {string} data.newStationId
 * @param {string} data.swapStatus
 * @returns {Promise<Object>}
 */
export const swapStationToStation = async (data) => {
    return await apiClient.post(`${BASE_URL}/event/swapstation-to-station`, data);
};

/**
 * Tạo battery mới (Admin only)
 * POST /station/api/batteries/create
 * @param {Object} data - Battery data
 * @param {string} data.model
 * @param {number} data.capacity
 * @param {number} data.soh - State of Health
 * @param {number} data.soc - State of Charge
 * @param {string} data.status - BATTERY_STATUS
 * @param {string} data.ownerType - BATTERY_OWNER_TYPE
 * @param {string} data.referenceId
 * @returns {Promise<Object>}
 */
export const createBattery = async (data) => {
    return await apiClient.post(`${BASE_URL}/create`, data);
};

/**
 * Thêm battery vào trạm (Admin only)
 * POST /station/api/batteries/add-battery
 * @param {Object} data
 * @param {string} data.stationCode - Mã trạm
 * @param {string} data.batteryCode - Mã pin
 * @returns {Promise<Object>}
 */
export const addBatteryToStation = async (data) => {
    return await apiClient.post(`${BASE_URL}/add-battery`, data);
};

/**
 * Xử lý sự kiện hoán đổi pin từ xe sang trạm
 * POST /station/api/batteries/event/swapverhice-to-station
 * @param {Object} data - Swap event data
 * @param {string} data.oldBatteryId
 * @param {string} data.newBatteryId
 * @param {string} data.verhiceId
 * @param {string} data.stationId
 * @returns {Promise<Object>}
 */
export const swapStationToVehicle = async (data) => {
    return await apiClient.post(`${BASE_URL}/event/swapverhice-to-station`, data);
}

/**
 * Cập nhật battery (Admin only)
 * PUT /station/api/batteries/update/{id}
 * @param {string} batteryCode
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} data.model
 * @param {number} data.capacity
 * @param {number} data.soh
 * @param {number} data.soc
 * @param {string} data.status
 * @param {string} data.ownerType
 * @param {string} data.referenceId
 * @returns {Promise<Object>}
 */
export const updateBattery = async (batteryCode, data) => {
    return await apiClient.put(`${BASE_URL}/update/${batteryCode}`, data);
};

/**
 * Xóa battery (Admin only)
 * DELETE /station/api/batteries/delete/{id}
 * Chỉ áp dụng với pin ngưng hoạt động
 * @param {number} id - Battery ID
 * @returns {Promise<Object>}
 */
export const deleteBattery = async (id) => {
    return await apiClient.delete(`${BASE_URL}/delete/${id}`);
};

/**
 * Update health battery
 * PATCH /station/api/batteries/update-health/{batteryCode}
 * @param {string} batteryCode
 * @request soc, soh
 */
export const updateHealthBattery = async (batteryCode, data) => {
    return await apiClient.patch(`${BASE_URL}/update-health/${batteryCode}`, data);
}

// Export all battery API
export const batteriesApi = {
    // Get operations
    getAllBatteries,
    getBatteryById,
    getBatteryByCode,

    // Event operations
    holdBattery,
    swapStationToStation,
    swapStationToVehicle,

    // CRUD operations
    createBattery,
    addBatteryToStation,
    updateBattery,
    deleteBattery,
    updateHealthBattery,

    // Constants
    BATTERY_STATUS,
    BATTERY_OWNER_TYPE,
};

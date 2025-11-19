import { apiClient } from "./apiClient";

/**
 * Station API
 * Base URL: /api/stations
 */

const BASE_URL = "/station/api/stations";

/**
 * Lấy tất cả stations
 * GET /api/stations/getAll
 * @returns {Promise<Object>} Response với data là array của stations
 */
export const getAllStations = async () => {
    return await apiClient.get(`${BASE_URL}/getAll`);
};

/**
 * Lấy chi tiết station theo ID
 * GET /api/stations/{id}
 * @param {number} id - Station ID
 * @returns {Promise<Object>} Station object
 */
export const getStationById = async (id) => {
    const res = await apiClient.get(`${BASE_URL}/${id}`);
    return res || null;
};

/**
 * Tạo station mới (Admin only)
 * POST /api/stations/create
 */
export const createStation = async (data) => {
    const res = await apiClient.post(`${BASE_URL}/create`, data);
    return res?.data?.data || res || null;
};

/**
 * Cập nhật station (Admin only)
 * PUT /api/stations/update/{id}
 */
export const updateStation = async (id, data) => {
    const res = await apiClient.put(`${BASE_URL}/update/${id}`, data);
    return res || null;
};

/**
 * Xóa station (Admin only)
 * DELETE /api/stations/delete/{id}
 */
export const deleteStation = async (id) => {
    return await apiClient.delete(`${BASE_URL}/delete/${id}`);
};

/**
 * Tìm trạm gần nhất
 * POST /api/stations/nearest
 * @returns {Promise<Array>} Array các trạm gần nhất, mỗi item có distanceKm
 */
export const findNearestStations = async (latitude, longitude) => {
    const response = await apiClient.post(`${BASE_URL}/nearest`, { latitude, longitude });
    // Response shape: { statusCode, message, data: [...] }
    const data = response?.data || [];
    const message = response?.message || "";
    return { data, message };
};

/**
 * Thêm nhân viên vào trạm (Admin/Manager)
 * POST /station/api/stations/staffs/{stationId}
 * @param {number|string} stationId
 * @param {{ staffCode: string }} payload
 * @returns {Promise<Object>} Thông tin trạm sau khi thêm nhân viên, bao gồm batteries và staffCode
 */
export const addStaffToStation = async (stationId, payload) => {
    // payload: { staffCode }
    const res = await apiClient.post(`${BASE_URL}/staffs/${stationId}`, payload);
    return res?.data || res || null;
};

/** Station Status Enum */
export const STATION_STATUS = {
    ACTIVE: "ACTIVE",
    OFFLINE: "OFFLINE",
    MAINTENANCE: "MAINTENANCE",
};

export const stationApi = {
    getAllStations,
    getStationById,
    createStation,
    updateStation,
    deleteStation,
    findNearestStations,
    addStaffToStation,
    STATION_STATUS,
};

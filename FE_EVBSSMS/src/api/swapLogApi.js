import { apiClient } from "@/api/apiClient.js";

/**
 * Swap Log API
 * Base URL: /api/swaplog
 */

const BASE_URL = "station/api/swaplog";

/**
 * 1. Tạo bản ghi đổi pin mới
 * POST /api/swaplog
 * @param {Object} swapLogData - { driverId, stationId, batteryId, swapTime }
 * @returns {Promise<Object>} SwapLogResponse
 */
export const createSwapLog = async (swapLogData) => {
    const res = await apiClient.post(BASE_URL, swapLogData, {
        successMessage: "Tạo bản ghi đổi pin thành công!",
    });
    return res?.data || res;
};

/**
 * 2. Lấy bản ghi đổi pin theo ID cua Station
 * GET /api/swaplog/verhicle-station/station/{StationId}
 * @param {number} StationId - Station ID
 * @returns {Promise<Object>} SwapLogResponse
 */
export const getSwapLogByStationId = async (StationId) => {
    const res = await apiClient.get(`${BASE_URL}/verhicle-station/station/${StationId}`);
    return res?.data || res;
};

/**
 * GET /api/swaplog/verhicle-station/getall
 * Lấy tất cả bản ghi đổi pin
 * @returns {Promise<Object>} Response với data là array của SwapLogResponse
 */
export const getAllSwapLogs = async () => {
    const res = await apiClient.get(`${BASE_URL}/verhicle-station/getall`);
    return res?.data || res;
}

export const swapLogApi = {
    createSwapLog,
    getSwapLogByStationId,
    getAllSwapLogs,
};
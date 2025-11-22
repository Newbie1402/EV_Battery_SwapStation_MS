import {apiClient} from "@/api/apiClient.js";

/**
 * Battery Transfer API
 * Base URL: /api/battery-transfer
 */

const BASE_URL = "station/api/battery-transfer";

/**
 * 1. Tạo yêu cầu chuyển pin mới
 * POST /api/battery-transfer/request
 * @param {Object} transferData - { "stationCode": "string","requestedQuantity": 0, "batteryModel": "string", "reason": "string" }
 * @returns {Promise<Object>} BatteryTransferResponse
 * {
 *     "id": 0,
 *     "stationCode": "string",
 *     "stationName": "string",
 *     "requestedQuantity": 0,
 *     "batteryModel": "string",
 *     "reason": "string",
 *     "status": "PENDING",
 *     "createdAt": "2025-11-22T14:59:08.844Z",
 *     "processedAt": "2025-11-22T14:59:08.844Z",
 *     "adminNote": "string"
 *   }
 */
export const createBatteryTransferRequest = async (transferData) => {
    const res = await apiClient.post(`${BASE_URL}/request`, transferData);
    return res;
}
/**
 * 2. Lấy tất cả yêu cầu chuyển pin
 * GET /api/battery-transfer/request/all
    * @returns {Promise<Array>} Danh sách tất cả yêu cầu chuyển pin
    */
export const getAllBatteryTransferRequests = async () => {
    const res = await apiClient.get(`${BASE_URL}/request/all`);
    return res || [];
};
/**
 * 3. Xử lý yêu cầu chuyển pin
 * PUT /api/battery-transfer/request/status/{id}
 * @param {number} id - Yêu cầu chuyển pin ID
 * @param {string} status - Trạng thái mới (APPROVED, REJECTED)
 * @param {string} adminNote - Ghi chú của admin
 * @returns {Promise<Object>} BatteryTransferResponse
 */
export const processBatteryTransferRequest = async (id, status, adminNote) => {
    const res = await apiClient.put(`${BASE_URL}/request/status/${id}?newStatus=${status}&adminNote=${adminNote}`);
    return res;
};

/**
 * 4. Lấy yêu cầu chuyển pin theo ID
 * GET /api/battery-transfer/request/{id}
 * @param {number} id - Yêu cầu chuyển pin ID
 * @returns {Promise<Object>} BatteryTransferResponse
 */
export const getBatteryTransferRequestById = async (id) => {
    const res = await apiClient.get(`${BASE_URL}/request/${id}`);
    return res;
};

/**
 * 5. Lay yêu cầu chuyển pin theo mã trạm
 * GET /api/battery-transfer/request/station/{stationCode}
 * @param {string} stationCode - Mã trạm
 * @returns {Promise<Array>} Danh sách yêu cầu chuyển pin của trạm
 */
export const getBatteryTransferRequestsByStationCode = async (stationCode) => {
    const res = await apiClient.get(`${BASE_URL}/request/station/${stationCode}`);
    return res || [];
};

export const batteryTransferApi = {
    createBatteryTransferRequest,
    getAllBatteryTransferRequests,
    processBatteryTransferRequest,
    getBatteryTransferRequestById,
    getBatteryTransferRequestsByStationCode
};
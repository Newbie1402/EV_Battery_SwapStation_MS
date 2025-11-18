import { apiClient } from "./apiClient";

// ==================== BASE URLs ====================
const BASE_URL = "/auth-user/api/driver/vehicles";

// ==================== USER MANAGEMENT ====================

/**
 * Lấy tất cả phương tiện được cấp phát cho tài xe
 * @returns
 * [
 *     {
 *       "vehicleId": "string",
 *       "vin": "string",
 *       "model": "string",
 *       "licensePlate": "string",
 *       "batteryType": "string",
 *       "batteryCapacity": 0.1,
 *       "status": "ACTIVE",
 *       "notes": "string",
 *       "imageUrl": "string",
 *       "employeeId": "string",
 *       "driverName": "string",
 *       "createdAt": "2025-11-18T12:03:30.302Z",
 *       "updatedAt": "2025-11-18T12:03:30.302Z"
 *     }
 *   ]
 */
export const getDriverVehicles = async () => {
    return await apiClient.get(`${BASE_URL}`);
};

/**
 * Lấy thông tin chi tiết một phương tiện
 * @param {string} vehicleId
 * @returns
 *       "vehicleId": "string",
 *       "vin": "string",
 *       "model": "string",
 *       "licensePlate": "string",
 *       "batteryType": "string",
 *       "batteryCapacity": 0.1,
 *       "status": "ACTIVE",
 *       "notes": "string",
 *       "imageUrl": "string",
 *       "employeeId": "string",
 *       "driverName": "string",
 *       "createdAt": "2025-11-18T12:03:30.302Z",
 *       "updatedAt": "2025-11-18T12:03:30.302Z"
 */
export const getVehiclesDetail = async (vehicleId) => {
    return await apiClient.get(`${BASE_URL}/${vehicleId}`);
};

export const driverApi = {
    getDriverVehicles,
    getVehiclesDetail,
};
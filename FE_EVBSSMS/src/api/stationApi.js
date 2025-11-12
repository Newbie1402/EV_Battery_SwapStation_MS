import { apiClient } from "./apiClient";

/**
 * Station API
 * Base URL: /api/v1/stations
 */

const BASE_URL = "/api/v1/stations";

/**
 * Lấy tất cả stations với phân trang
 * @param {number} page - Số trang (default: 0)
 * @param {number} size - Kích thước trang (default: 10)
 * @returns {Promise<Object>}
 */
export const getAllStations = async (page = 0, size = 10) => {
    // return await apiClient.get(`${BASE_URL}?page=${page}&size=${size}`);
    // Dữ liệu giả lập
    const stations = [
        {
            stationId: "ST001",
            stationName: "Trạm EV Quận 1",
            address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
            city: "TP.HCM",
            status: "ACTIVE",
            openingHours: "06:00 - 22:00",
            totalSlots: 10,
            availableSlots: 3,
            phone: "0901234567"
        },
        {
            stationId: "ST002",
            stationName: "Trạm EV Quận 7",
            address: "88 Tân Phú, Quận 7, TP.HCM",
            city: "TP.HCM",
            status: "ACTIVE",
            openingHours: "07:00 - 21:00",
            totalSlots: 8,
            availableSlots: 0,
            phone: "0907654321"
        },
        {
            stationId: "ST003",
            stationName: "Trạm EV Biên Hòa",
            address: "25 Võ Thị Sáu, Biên Hòa, Đồng Nai",
            city: "Đồng Nai",
            status: "ACTIVE",
            openingHours: "24/7",
            totalSlots: 12,
            availableSlots: 7,
            phone: "0912345678"
        },
        {
            stationId: "ST004",
            stationName: "Trạm EV Bình Dương",
            address: "100 Đại Lộ Bình Dương, Thủ Dầu Một",
            city: "Bình Dương",
            status: "INACTIVE",
            openingHours: "08:00 - 20:00",
            totalSlots: 6,
            availableSlots: 0,
            phone: "0934567890"
        }
    ];
    // Phân trang
    const start = page * size;
    const end = start + size;
    const content = stations.slice(start, end);
    return {
        content,
        totalPages: Math.ceil(stations.length / size),
        totalElements: stations.length,
        page,
        size
    };
};

/**
 * Lấy chi tiết station theo ID
 * @param {string} id - Station ID
 * @returns {Promise<Object>}
 */
export const getStationById = async (id) => {
    return await apiClient.get(`${BASE_URL}/${id}`);
};

/**
 * Tìm kiếm stations theo location
 * @param {Object} params - Query parameters
 * @param {string} params.city - Thành phố
 * @param {string} params.district - Quận/Huyện
 * @param {number} params.page - Số trang
 * @param {number} params.size - Kích thước trang
 * @returns {Promise<Object>}
 */
export const searchStations = async (params = {}) => {
    const queryParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
            queryParams.append(key, params[key]);
        }
    });

    return await apiClient.get(`${BASE_URL}/search?${queryParams.toString()}`);
};

/**
 * Lấy danh sách stations gần người dùng
 * @param {number} latitude - Vĩ độ
 * @param {number} longitude - Kinh độ
 * @param {number} radius - Bán kính (km)
 * @returns {Promise<Array>}
 */
export const getNearbyStations = async (latitude, longitude, radius = 5) => {
    return await apiClient.get(`${BASE_URL}/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
};

/**
 * Tạo station mới (Admin only)
 * @param {Object} data - Station data
 * @returns {Promise<Object>}
 */
export const createStation = async (data) => {
    return await apiClient.post(BASE_URL, data);
};

/**
 * Cập nhật station (Admin only)
 * @param {string} id - Station ID
 * @param {Object} data - Dữ liệu cập nhật
 * @returns {Promise<Object>}
 */
export const updateStation = async (id, data) => {
    return await apiClient.put(`${BASE_URL}/${id}`, data);
};

/**
 * Xóa station (Admin only)
 * @param {string} id - Station ID
 * @returns {Promise<Object>}
 */
export const deleteStation = async (id) => {
    return await apiClient.delete(`${BASE_URL}/${id}`);
};

// Export all station API
export const stationApi = {
    getAllStations,
    getStationById,
    searchStations,
    getNearbyStations,
    createStation,
    updateStation,
    deleteStation,
};

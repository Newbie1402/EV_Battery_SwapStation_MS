import {apiClient} from "@/api/apiClient.js";

/**
 * Support ticket API
 * Base URL : /api/support-tickets
 */

const BASE_URL = "auth-user/api/support-tickets";

/**
 * 1. Tạo yêu cầu hỗ trợ mới
 * POST /api/support-tickets
 * @param {string} ticketType - Loại yêu cầu (e.g., "BATTERY_ISSUE("Sự cố pin"),
 *     VEHICLE_MALFUNCTION("Hỏng hóc phương tiện"),
 *     STATION_EQUIPMENT("Sự cố thiết bị trạm"),
 *     SWAP_FAILURE("Lỗi quá trình đổi pin"),
 *     PAYMENT_ISSUE("Vấn đề thanh toán"),
 *     SERVICE_QUALITY("Chất lượng dịch vụ"),
 *     OTHER("Khác"))
 *     @param {string} title - Tiêu đề ngắn gọn về vấn đề
 *     @param {string} priority - Mức độ ưu tiên (LOW, MEDIUM, HIGH), mac dinh MEDIUM
 *     @param {string} description - Mô tả chi tiết về vấn đề
 *     @param {string} incidentTime - Thời gian xảy ra sự cố (ISO 8601)
 * @returns {Promise<Object>} SupportTicketResponse
    * {
    *     "ticketId": "TKT-1763828621932-66000056",
 "status": "SENT",
 "message": "Support ticket đã gửi. Xử lý trong 24 giờ."
    * }
 */
export const createSupportTicket = async (ticketType, title, priority, description,incidentTime) => {
    return await apiClient.post(`${BASE_URL}?ticketType=${ticketType}&title=${title}&priority=${priority}&description=${description}&incidentTime=${incidentTime}`);
};

/**
 * 2. Lấy chi tiết yêu cầu hỗ trợ theo ID
 * GET /api/support-tickets/{ticketId}
    * @param {string} ticketId - Mã yêu cầu hỗ trợ
    * @returns {Promise<Object>} SupportTicketDetailResponse
 */
export const getSupportTicketById = async (ticketId) => {
    if (!ticketId) return null;
    return await apiClient.get(`${BASE_URL}/${ticketId}`);
};

/**
 * 3. Lấy tất cả yêu cầu hỗ trợ của người dùng
 * GET /api/support-tickets
 * @returns {Promise<Array>} Danh sách SupportTicketSummaryResponse
 */
export const getSupportTickets = async () => {
    return await apiClient.get(`${BASE_URL}`);
};

/**
 * 4. Cap nhật trạng thái yêu cầu hỗ trợ
 * PATCH /api/support-tickets/{ticketId}/status
 * @param {string} ticketId - Mã yêu cầu hỗ trợ
    * @param {object} data - gom co: status =  (OPEN, IN_PROGRESS, RESOLVED, CLOSED), notes
    * @returns {Promise<Object>} SupportTicketResponse
 */
export const updateSupportTicketStatus = async (ticketId, data) => {
    return await apiClient.patch(`${BASE_URL}/${ticketId}/status`, data);
};
// Thêm mới: lấy ticket theo employeeId (driver/staff)
export const getSupportTicketsByEmployeeId = async (employeeId) => {
    if (!employeeId) return [];
    return await apiClient.get(`${BASE_URL}/employee/${employeeId}`);
};

export const supportTicketApi = {
    createSupportTicket,
    getSupportTicketById,
    getSupportTickets,
    updateSupportTicketStatus,
    getSupportTicketsByEmployeeId,
};
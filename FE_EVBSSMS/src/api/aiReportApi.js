import axiosInstance from "@/api/axiosInstance.js";

/**
 * AI report analyze API
 * Base URL : /api/report
    */
const BASE_URL = "billing/api/report";

const normalize = (payload) => {
    if (payload && typeof payload === 'object' && 'data' in payload) return payload;
    return { data: payload };
};

/**
 * 1. Gửi dữ liệu để phân tích báo cáo AI
 * POST /api/report/analyze
 * @param {object} reportData - Dữ liệu báo cáo cần phân tích
 * @returns {Promise<Object>} AIReportResponse
 * {
 *     "reportId": "RPT-1763828621932-66000056",
 *     "status": "PROCESSING",
 *     "message": "Báo cáo đang được phân tích."
 * }
 */
export const analyzeAIReport = async (reportData) => {
    const body = await axiosInstance.post(`${BASE_URL}/analyze`, reportData);
    return normalize(body);
};

/**
 * 2. Lấy kết quả phân tích báo cáo AI
 * GET /api/report/analyze-all
 * @returns {Promise<Object>} AIReportDetailResponse
 */
export const getAIReport = async () => {
    const body = await axiosInstance.get(`${BASE_URL}/analyze-all`);
    return normalize(body);
};

export const aiReportApi = {
    analyzeAIReport,
    getAIReport
};
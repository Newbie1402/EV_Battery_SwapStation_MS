import { apiClient } from "./apiClient";

/**
 * vnpay API
 * Base URL: /api/vnpay
 */

const BASE_URL = "/vnpay";

/** Tạo VNPAY
 * POST /api/vnpay/create
 * request body: { paymentId, type (PACKAGE) }
 */
export const createVnpay = async (data) => {
    const res = await apiClient.post(`${BASE_URL}/create`, data);
    return res || null;
}

export const vnpayApi = {
    createVnpay,
}
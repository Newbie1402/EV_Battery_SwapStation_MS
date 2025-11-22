import { apiClient } from "./apiClient";

/**
 * vnpay API
 * Base URL: /api/vnpay
 */

const BASE_URL = "billing/api/vnpay";

/** Tạo VNPAY
 * POST /api/vnpay/create
 * request body: { paymentId, type (PACKAGE) }
 */
export const createVnpay = async (data) => {
    const res = await apiClient.post(`${BASE_URL}/create`, data);
    return res || null;
}

/** Gửi dữ liệu VNPAY về server
 * GET /api/vnpay/callback
 * query params: { vnp_Amount, vnp_BankCode, vnp_BankTranNo, vnp_CardType, vnp_OrderInfo, vnp_PayDate, vnp_ResponseCode, vnp_TmnCode, vnp_TransactionNo, vnp_TxnRef, vnp_SecureHash }
 */
export const vnpayCallback = async (params) => {
    const res = await apiClient.get(`${BASE_URL}/callback`, { params });
    return res || null;
}

export const vnpayApi = {
    createVnpay,
    vnpayCallback
}
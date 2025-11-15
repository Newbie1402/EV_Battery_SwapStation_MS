import { apiClient } from "./apiClient";

/**
 * payment API
 * Base URL: /api/payments
 */

const BASE_URL = "/payments";

/**
 * Lấy tất cả payments
 * GET /api/payments/all
 * @returns {Promise<Object>} Response với data là array của payments
 */
export const getAllPayments = async () => {
    return await apiClient.get(`${BASE_URL}/all`);
};

/** Lấy tất cả payment packages
 * GET /api/payments/package
 * @returns {Promise<Array>} Danh sách tất cả payment packages
 */
export const getAllPaymentPackages = async () => {
    const res = await apiClient.get(`${BASE_URL}/package`);
    return res?.data || [] || res;
}

/**
 * Lấy chi tiết payment package theo ID
 * GET /api/payments/package/{id}
 * @param {number} id - Payment Package ID
 * @returns {Promise<Object>} Payment Package object
 */
export const getPaymentPackageById = async (id) => {
    const res = await apiClient.get(`${BASE_URL}/package/${id}`);
    return res || null;
};
/**
 * Tạo payment package mới
 * POST /api/payments/package
 * request body: {
 * customerId, totalAmount, method ( CASH, VNPAY, MOMO), status (PENDING, SUCCESS, FAILED, REFUNDED), transactionId, description, paymentTime, packageId, startDate, endDate}
 */
export const createPaymentPackage = async (data) => {
    const res = await apiClient.post(`${BASE_URL}/package`, data);
    return res?.data?.data || res.data || null || res;
};

/** Tạo VNPAY
 * POST /api/payments/vnpay/create_qr
 * request body: { amount, orderInfo, returnUrl, ipAddress }
 */
export const createVnpay = async (data) => {
    const res = await apiClient.post(`${BASE_URL}/vnpay/create_qr`, data);
    return res?.data || res || null;
}

export const paymentStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
};

export const paymentMethod = {
    CASH: 'CASH',
    VNPAY: 'VNPAY',
    MOMO: 'MOMO',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CREDIT_CARD: 'CREDIT_CARD',
};

export const packageStatus = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    EXPIRED: 'EXPIRED',
};

export const paymentApi = {
    getAllPayments,
    getAllPaymentPackages,
    getPaymentPackageById,
    createPaymentPackage,
    paymentStatus,
    paymentMethod,
    packageStatus,
};
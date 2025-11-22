import { apiClient } from "./apiClient";

/**
 * payment API
 * Base URL: /api/payments
 */

const BASE_URL = "billing/api/payments";

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
    return res || [];
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
/** Lấy tất cả payment swap
 * GET /api/payments/swap
 * @returns {Promise<Array>} Danh sách tất cả payment swap
 */
export const getAllPaymentSwap = async () => {
    const res = await apiClient.get(`${BASE_URL}/swap`);
    return res || [];
}

/**
 * Lấy chi tiết payment swap theo ID
 * GET /api/payments/swap/{id}
 * @param {number} id - Payment swap ID
 * @returns {Promise<Object>} Payment swap object
 */
export const getPaymentSwapById = async (id) => {
    const res = await apiClient.get(`${BASE_URL}/swap/${id}`);
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
/**
 * Tạo payment swap mới
 * POST /api/payments/swap
 * request body: {
 * customerId, totalAmount, method ( CASH, VNPAY), status (PENDING, SUCCESS, FAILED, REFUNDED), transactionId, description, paymentTime, bookingId, swapLogId}
 */
export const createSwapPackage = async (data) => {
    const res = await apiClient.post(`${BASE_URL}/swap`, data);
    return res?.data?.data || res.data || null || res;
};

/**
 * Xác nhận payment với method CASH
 * POST /api/payments/single/confirm/{paymentId}
 * @param {number} paymentId - Payment ID
 * @returns {Promise<Object>}
 */
export const confirmCashPayment = async (paymentId) => {
    const res = await apiClient.post(`${BASE_URL}/single/confirm/${paymentId}`, {});
    return res || null;
};

/**
 * Lấy tất cả thanh toán của customer
 * GET /api/payments/customer/{customerId}
 * @param {string} customerId - Customer ID
 * @returns {Promise<Array>} Danh sách tất cả payments của customer
 */
export const getPaymentsByCustomer = async (customerId) => {
    const res = await apiClient.get(`${BASE_URL}/customer/${customerId}`);
    return res || [];
};

export const paymentStatus = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED',
};

export const paymentMethod = {
    CASH: 'CASH',
    VNPAY: 'VNPAY',
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
    getAllPaymentSwap,
    getPaymentPackageById,
    getPaymentSwapById,
    createPaymentPackage,
    createSwapPackage,
    confirmCashPayment,
    getPaymentsByCustomer,
    paymentStatus,
    paymentMethod,
    packageStatus,
};
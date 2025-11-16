export const formatDate = (iso) => new Date(iso).toLocaleString();

/**
 * Format số thành định dạng tiền tệ Việt Nam
 * @param {number} amount - Số tiền cần format
 * @returns {string} Chuỗi đã format (VD: 200.000đ)
 */
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "0đ";
    return new Intl.NumberFormat('vi-VN', {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + 'đ';
};


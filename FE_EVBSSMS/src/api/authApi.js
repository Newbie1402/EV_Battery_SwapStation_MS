/**
 * Mock API cho authentication
 * Trong production, thay bằng API thực
 */

// Mock users database
const mockUsers = [
    {
        userId: "admin001",
        email: "admin@evbss.vn",
        password: "admin123",
        role: "ADMIN",
        name: "Quản trị viên"
    },
    {
        userId: "staff001",
        email: "staff@evbss.vn",
        password: "staff123",
        role: "STAFF",
        name: "Nhân viên trạm"
    },
    {
        userId: "driver001",
        email: "driver@evbss.vn",
        password: "driver123",
        role: "DRIVER",
        name: "Nguyễn Văn A"
    },
];

/**
 * Login API (Mock)
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{userId, token, role, name}>}
 */
export const login = async (email, password) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Find user
    const user = mockUsers.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        throw new Error("Email hoặc mật khẩu không đúng!");
    }

    // Generate mock token
    const token = `mock_token_${user.userId}_${Date.now()}`;

    return {
        userId: user.userId,
        token: token,
        role: user.role,
        name: user.name,
    };
};

/**
 * Register API (Mock)
 * @param {object} data - {name, email, password, phone}
 * @returns {Promise<{userId, token, role, name}>}
 */
export const register = async (data) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email exists
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) {
        throw new Error("Email đã được sử dụng!");
    }

    // Create new user (mock)
    const newUser = {
        userId: `driver${Date.now().toString().slice(-6)}`,
        email: data.email,
        password: data.password,
        role: "DRIVER", // Default role for registration
        name: data.name,
        phone: data.phone,
    };

    // Add to mock database
    mockUsers.push(newUser);

    // Generate mock token
    const token = `mock_token_${newUser.userId}_${Date.now()}`;

    return {
        userId: newUser.userId,
        token: token,
        role: newUser.role,
        name: newUser.name,
    };
};

/**
 * Logout API (Mock)
 */
export const logout = async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
};

/**
 * Get current user info (Mock)
 */
export const getCurrentUser = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const userId = localStorage.getItem("userId");
    const user = mockUsers.find(u => u.userId === userId);

    if (!user) {
        throw new Error("Không tìm thấy thông tin người dùng!");
    }

    return {
        userId: user.userId,
        email: user.email,
        role: user.role,
        name: user.name,
    };
};

// Export all auth API
export const authApi = {
    login,
    register,
    logout,
    getCurrentUser,
};


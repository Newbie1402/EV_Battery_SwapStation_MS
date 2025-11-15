package com.boilerplate.auth.controller;

import com.boilerplate.auth.model.dto.response.OAuth2UserInfo;
import com.boilerplate.auth.service.OAuth2Service;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Controller xử lý OAuth2 flow với Google
 * Dùng để test trước khi có Frontend
 * Sau khi có FE, chỉ cần đổi redirectUri
 */
@Controller
@RequestMapping("/oauth2")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "OAuth2 Flow", description = "APIs xử lý OAuth2 flow với Google (dùng để test)")
public class OAuth2Controller {

    private final OAuth2Service oauth2Service;

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    // URI chính xác đã đăng ký trong Google Cloud Console
    private final String REDIRECT_URI = "http://localhost:9001/oauth2/callback";

    /**
     * Endpoint khởi đầu - Redirect đến Google OAuth2
     */
    @GetMapping("/login")
    @Operation(summary = "Đăng nhập Google", description = "Redirect đến trang đăng nhập Google")
    public RedirectView loginWithGoogle() {
        if (googleClientId == null || googleClientId.isEmpty()) {
            log.error("GOOGLE_CLIENT_ID chưa được cấu hình!");
            throw new IllegalStateException("Cấu hình OAuth2 chưa đầy đủ. Vui lòng kiểm tra file .env");
        }

        log.info("Redirect đến Google OAuth2 login page");
        log.info("CLIENT_ID: {} ({}...)", googleClientId.length(), googleClientId.substring(0, 10));
        log.info("REDIRECT_URI: {}", REDIRECT_URI);

        // URL đăng nhập Google OAuth2 với redirect URI đã đăng ký trong Google Cloud Console
        String googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth?" +
                "client_id=" + googleClientId +
                "&response_type=token id_token" +
                "&scope=openid email profile" +
                "&redirect_uri=" + URLEncoder.encode(REDIRECT_URI, StandardCharsets.UTF_8) +
                "&nonce=" + System.currentTimeMillis();

        log.info("Full Google Auth URL: {}", googleAuthUrl);

        return new RedirectView(googleAuthUrl);
    }

    /**
     * Callback endpoint - Nhận token từ Google
     * Google sẽ redirect về: http://localhost:8080/oauth2/callback#id_token=xxx&access_token=yyy
     */
    @GetMapping("/callback")
    @Operation(summary = "OAuth2 Callback", description = "Nhận token từ Google sau khi đăng nhập thành công")
    public void handleCallback(HttpServletResponse response) throws IOException {
        log.info("Nhận callback từ Google OAuth2");

        // Trả về HTML page để parse token từ URL fragment nào làm FE thì sẽ predict về FE
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
                <title>Google OAuth2 Callback</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 800px;
                        margin: 50px auto;
                        padding: 20px;
                    }
                    .container {
                        border: 1px solid #ddd;
                        padding: 20px;
                        border-radius: 8px;
                        background: #f9f9f9;
                    }
                    .token-box {
                        background: #fff;
                        padding: 15px;
                        border: 1px solid #ccc;
                        border-radius: 4px;
                        word-wrap: break-word;
                        margin: 10px 0;
                    }
                    .btn {
                        background: #4285f4;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        margin: 5px;
                    }
                    .btn:hover {
                        background: #357ae8;
                    }
                    .success {
                        color: green;
                        font-weight: bold;
                    }
                    .error {
                        color: red;
                        font-weight: bold;
                    }
                    #userInfo {
                        margin-top: 20px;
                        padding: 15px;
                        background: #e8f5e9;
                        border-radius: 4px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🔐 Google OAuth2 Login</h1>
                    <p id="status">Đang xử lý đăng nhập...</p>
                    
                    <div id="tokenSection" style="display:none;">
                        <h3>✅ Đăng nhập Google thành công!</h3>
                        
                        <!-- Google ID Token Section -->
                        <div style="margin-bottom: 20px;">
                            <h4 style="color: #1976d2;">🔵 Google ID Token (từ Google):</h4>
                            <p><em>Token này chỉ chứa thông tin từ Google, không có role từ hệ thống</em></p>
                            <div class="token-box" id="googleIdTokenBox"></div>
                            <button class="btn" onclick="copyGoogleToken()" style="background: #1976d2;">📋 Copy Google ID Token</button>
                            <button class="btn" onclick="decodeGoogleToken()" style="background: #1976d2;">🔍 Decode Google Token</button>
                        </div>

                        <!-- JWT Access Token Section - CHỈ HIỂN THỊ SAU KHI ĐĂNG NHẬP THÀNH CÔNG -->
                        <div style="margin-bottom: 20px; display: none;" id="jwtTokenSection">
                            <h4 style="color: #388e3c;">🟢 JWT Access Token (từ hệ thống của bạn):</h4>
                            <p><em>Token này chứa thông tin role và được dùng để truy cập API</em></p>
                            <div class="token-box" id="jwtAccessTokenBox"></div>
                            <button class="btn" onclick="copyJWTToken()" style="background: #388e3c;">📋 Copy JWT Token</button>
                            <button class="btn" onclick="decodeJWTToken()" style="background: #388e3c;">🔍 Decode JWT Token</button>
                        </div>
                        
                        <div id="userInfo"></div>
                        <div id="jwtInfo" style="display: none;"></div>
                        
                        <h3>📝 Tiếp theo, sử dụng Google ID Token để đăng ký/đăng nhập:</h3>
                        <button class="btn" onclick="testRegister()">🧪 Test Đăng Ký</button>
                        <button class="btn" onclick="testLogin()">🔑 Test Đăng Nhập</button>
                        
                        <div id="apiResult" style="margin-top: 20px;"></div>
                    </div>
                </div>
                
                <script>
                    // Parse token từ URL fragment
                    function parseToken() {
                        const hash = window.location.hash.substring(1);
                        const params = new URLSearchParams(hash);
                        const idToken = params.get('id_token');
                        const googleAccessToken = params.get('access_token'); // Đây là Google Access Token, KHÔNG phải JWT của hệ thống
                        
                        if (idToken) {
                            document.getElementById('status').className = 'success';
                            document.getElementById('status').textContent = '✅ Xác thực thành công!';
                            document.getElementById('tokenSection').style.display = 'block';
                            document.getElementById('googleIdTokenBox').textContent = idToken;
                            
                            // Lưu token vào localStorage
                            localStorage.setItem('googleIdToken', idToken);
                            
                            // Decode Google ID Token để hiển thị thông tin user
                            decodeGoogleToken();
                        } else {
                            document.getElementById('status').className = 'error';
                            document.getElementById('status').textContent = '❌ Không nhận được token từ Google!';
                        }
                        
                        // Lưu Google Access Token (dùng để gọi Google APIs, không phải JWT của hệ thống)
                        if (googleAccessToken) {
                            localStorage.setItem('googleAccessToken', googleAccessToken);
                        }
                    }
                    
                    // Decode Google ID Token
                    function decodeGoogleToken() {
                        const token = localStorage.getItem('googleIdToken');
                        if (!token) return;
                        
                        try {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            document.getElementById('userInfo').innerHTML = `
                                <h4>Thông tin User từ Google:</h4>
                                <p><strong>Email:</strong> ${payload.email}</p>
                                <p><strong>Tên:</strong> ${payload.name}</p>
                                <p><strong>Google ID:</strong> ${payload.sub}</p>
                                <p><strong>Avatar:</strong> <img src="${payload.picture}" width="50" style="border-radius: 50%;"/></p>
                            `;
                        } catch (e) {
                            console.error('Lỗi decode Google ID token:', e);
                        }
                    }
                    
                    // Decode JWT Access Token từ hệ thống
                    function decodeJWTToken() {
                        const token = localStorage.getItem('accessToken'); // JWT từ hệ thống
                        if (!token) return;
                        
                        try {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            let roleInfo = '<h4>Thông tin từ JWT Access Token của hệ thống:</h4>';
                            roleInfo += `<p><strong>Username:</strong> ${payload.sub || 'N/A'}</p>`;
                            roleInfo += `<p><strong>Role:</strong> ${payload.role || payload.roles || 'N/A'}</p>`;
                            roleInfo += `<p><strong>Full Name:</strong> ${payload.fullName || 'N/A'}</p>`;
                            roleInfo += `<p><strong>Email:</strong> ${payload.email || 'N/A'}</p>`;
                            roleInfo += `<p><strong>Issued At:</strong> ${new Date(payload.iat * 1000).toLocaleString()}</p>`;
                            roleInfo += `<p><strong>Expires At:</strong> ${new Date(payload.exp * 1000).toLocaleString()}</p>`;
                            
                            document.getElementById('jwtInfo').innerHTML = roleInfo;
                            document.getElementById('jwtInfo').style.display = 'block';
                        } catch (e) {
                            console.error('Lỗi decode JWT token:', e);
                        }
                    }
                    
                    // Copy Google ID token
                    function copyGoogleToken() {
                        const token = document.getElementById('googleIdTokenBox').textContent;
                        navigator.clipboard.writeText(token);
                        alert('✅ Đã copy Google ID Token vào clipboard!');
                    }
                    
                    // Copy JWT token
                    function copyJWTToken() {
                        const token = localStorage.getItem('accessToken');
                        if (token) {
                            navigator.clipboard.writeText(token);
                            alert('✅ Đã copy JWT Access Token vào clipboard!');
                        } else {
                            alert('❌ Chưa có JWT Access Token! Vui lòng đăng nhập trước.');
                        }
                    }
                    
                    // Test đăng ký
                    async function testRegister() {
                        const idToken = localStorage.getItem('googleIdToken');
                        const resultDiv = document.getElementById('apiResult');
                        
                        try {
                            resultDiv.innerHTML = '<p>⏳ Đang gọi API đăng ký...</p>';
                            
                            const response = await fetch('http://localhost:9001/api/auth/oauth2/google/register', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    idToken: idToken,
                                    phone: "0987654321",
                                    role: "DRIVER",
                                    identityCard: "123456789012",
                                    address: "123 Đường ABC, Quận 1, TP.HCM",
                                    birthday: "1990-01-15"
                                })
                            });
                            
                            const data = await response.json();
                            
                            // Nếu đăng ký thành công, lưu JWT tokens
                            if (data.accessToken) {
                                localStorage.setItem('accessToken', data.accessToken);
                                localStorage.setItem('refreshToken', data.refreshToken);
                                
                                // Hiển thị section JWT Token
                                document.getElementById('jwtTokenSection').style.display = 'block';
                                document.getElementById('jwtAccessTokenBox').textContent = data.accessToken;
                                
                                // Decode JWT để hiển thị thông tin
                                decodeJWTToken();
                            }
                            
                            resultDiv.innerHTML = `
                                <h4>Kết quả đăng ký:</h4>
                                <div class="token-box">${JSON.stringify(data, null, 2)}</div>
                            `;
                        } catch (error) {
                            resultDiv.innerHTML = `<p class="error">❌ Lỗi: ${error.message}</p>`;
                        }
                    }
                    
                    // Test đăng nhập
                    async function testLogin() {
                        const idToken = localStorage.getItem('googleIdToken');
                        const resultDiv = document.getElementById('apiResult');
                        
                        try {
                            resultDiv.innerHTML = '<p>⏳ Đang gọi API đăng nhập...</p>';
                            
                            const response = await fetch('http://localhost:9001/api/auth/oauth2/google/login', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    idToken: idToken
                                })
                            });
                            
                            const data = await response.json();
                            
                            // Nếu đăng nhập thành công, lưu JWT tokens
                            if (data.accessToken) {
                                localStorage.setItem('accessToken', data.accessToken);
                                localStorage.setItem('refreshToken', data.refreshToken);
                                
                                // Hiển thị section JWT Token
                                document.getElementById('jwtTokenSection').style.display = 'block';
                                document.getElementById('jwtAccessTokenBox').textContent = data.accessToken;
                                
                                // Decode JWT để hiển thị thông tin
                                decodeJWTToken();
                            }
                            
                            resultDiv.innerHTML = `
                                <h4>Kết quả đăng nhập:</h4>
                                <div class="token-box">${JSON.stringify(data, null, 2)}</div>
                            `;
                        } catch (error) {
                            resultDiv.innerHTML = `<p class="error">❌ Lỗi: ${error.message}</p>`;
                        }
                    }
                    
                    // Chạy khi page load
                    parseToken();
                </script>
            </body>
            </html>
        """;

        response.setContentType("text/html; charset=UTF-8");
        response.getWriter().write(html);
    }

    /**
     * Endpoint kiểm tra token (dùng để debug)
     */
    @PostMapping("/verify-token")
    @ResponseBody
    @Operation(summary = "Verify Google Token", description = "Verify Google ID Token và trả về thông tin user")
    public OAuth2UserInfo verifyToken(@RequestBody String idToken) {
        log.info("Verify Google ID Token");
        return oauth2Service.verifyGoogleToken(idToken);
    }
}

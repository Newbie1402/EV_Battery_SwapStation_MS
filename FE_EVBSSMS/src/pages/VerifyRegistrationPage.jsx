import { useEffect, useState, useRef } from "react"; // [Sửa 1] Thêm useRef
import { useLocation, useNavigate } from "react-router-dom";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Zap } from "lucide-react";

export default function VerifyRegistrationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateStatus, updateUser, user } = useAuthStore();

  // [Sửa 2] Dùng useRef để chặn gọi 2 lần
  const hasCalledVerify = useRef(false);

  const searchParams = new URLSearchParams(location.search);
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const doVerify = async (value) => {
    if (!value) {
      toast.error("Vui lòng nhập token xác nhận!");
      return;
    }
    setIsVerifying(true);
    try {
      await authApi.confirmRegistration(value);

      updateStatus("ACTIVE");
      if (user) {
        updateUser({ ...user, isVerified: true, status: "ACTIVE" });
      }
      setIsSuccess(true);
      toast.success("Xác nhận đăng ký thành công! Tài khoản đã được kích hoạt.");

      setTimeout(() => {
        const role = user?.role;
        switch (role) {
          case "DRIVER":
            navigate("/driver/dashboard");
            break;
          case "STAFF":
            navigate("/staff/dashboard");
            break;
          case "ADMIN":
            navigate("/admin/dashboard");
            break;
          default:
            navigate("/");
        }
      }, 1500);
    } catch (error) {
      // Nếu lỗi là do đã verify rồi (status 400 hoặc message tương tự),
      // có thể coi là thành công hoặc báo user biết.
      console.error(error);
      toast.error(error?.data || error?.message || "Token không hợp lệ hoặc đã hết hạn!");
      setIsSuccess(false);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    // [Sửa 3] Logic kiểm tra useRef
    if (initialToken) {
      if (hasCalledVerify.current) {
        // Nếu đã gọi rồi thì return luôn, không làm gì cả
        return;
      }

      // Đánh dấu đã gọi
      hasCalledVerify.current = true;
      doVerify(initialToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
        {/* ... Phần UI giữ nguyên không đổi ... */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-300/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="w-full max-w-md relative z-10">
          <Card className="shadow-2xl border-0">
            <CardHeader>
              <div className="flex items-center justify-center mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl font-bold text-gray-900">Xác nhận đăng ký</CardTitle>
              <CardDescription className="text-center text-gray-600">Nhập token được gửi qua email để kích hoạt tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                    placeholder="Nhập token (UUID)"
                    value={token}
                    onChange={(e) => setToken(e.target.value.trim())}
                    disabled={isVerifying || isSuccess}
                    className="h-11"
                />
              </div>
              <Button
                  className="w-full h-11 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold shadow-lg"
                  onClick={() => doVerify(token)}
                  disabled={isVerifying || !token || isSuccess}
              >
                {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Đang xác nhận...
                    </>
                ) : isSuccess ? (
                    <>
                      <ShieldCheck className="w-5 h-5 mr-2" />
                      Thành công!
                    </>
                ) : (
                    "Xác nhận đăng ký"
                )}
              </Button>
              <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded p-3 space-y-1">
                <p>• Token có hiệu lực trong 48 giờ sau khi được Admin phê duyệt.</p>
                <p>• Nếu token hết hạn hãy liên hệ bộ phận hỗ trợ.</p>
                <p>• Sau khi xác nhận bạn sẽ được chuyển đến trang phù hợp với vai trò.</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button variant="outline" className="w-full" onClick={() => navigate("/login")} disabled={isVerifying}>Quay lại đăng nhập</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
  );
}
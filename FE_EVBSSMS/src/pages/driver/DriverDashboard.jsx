import { motion as Motion } from "framer-motion";
import { Battery, MapPin, Calendar, Clock, Zap } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useCustomQuery from "@/hooks/useCustomQuery";
import { bookingApi, subscriptionPackageApi, stationApi } from "@/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function DriverDashboard() {
    const { userId, employeeId } = useAuthStore();
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState(null);

    const fadeVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    // Fetch bookings của driver (lấy nhiều để thống kê)
    const { data: bookingsRes, isLoading: loadingBookings } = useCustomQuery(
        ["driver-bookings", userId],
        () => bookingApi.getBookingsByDriver(userId, 0, 100),
        { enabled: !!userId }
    );
    const bookingsContent = bookingsRes?.content || bookingsRes?.data?.content || bookingsRes?.data || bookingsRes || [];
    const bookings = Array.isArray(bookingsContent) ? bookingsContent : [];

    // Fetch active subscription bằng employeeId (theo yêu cầu)
    const { data: activeSubscription, isLoading: loadingActiveSub } = useCustomQuery(
        ["driver-active-subscription", employeeId],
        () => subscriptionPackageApi.getActiveSubscriptionByUserId(employeeId),
        { enabled: !!employeeId }
    );

    // Lấy trạm gần nhất (nếu có vị trí người dùng)
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            () => {},
            { enableHighAccuracy: true, timeout: 8000 }
        );
    }, []);

    const { data: nearestRes } = useCustomQuery(
        ["nearest-stations", userLocation?.lat, userLocation?.lng],
        () => stationApi.findNearestStations(userLocation.lat, userLocation.lng),
        { enabled: !!userLocation }
    );
    const nearestStations = nearestRes?.data || nearestRes || [];
    const nearestStation = Array.isArray(nearestStations) && nearestStations.length > 0 ? nearestStations[0] : null;

    // Derive metrics
    const completedBookings = bookings.filter(b => b.bookingStatus === "COMPLETE");
    const lastCompleted = completedBookings.sort((a,b)=> new Date(b.completedTime || b.updatedAt || 0) - new Date(a.completedTime || a.updatedAt || 0))[0];

    // Lượt đổi pin tổng
    const totalSwaps = completedBookings.length;

    // Trạng thái pin hiện tại (nếu có booking gần nhất chưa hoàn thành → mô phỏng SOC; nếu không fallback giả lập)
    // (Không có API trực tiếp cho pin của xe driver nên hiển thị placeholder)
    const batteryStatusPercent = 92; // TODO: thay bằng API khi có

    // Lần đổi gần nhất (thời gian tương đối)
    const timeSinceLastSwap = (() => {
        if (!lastCompleted?.completedTime) return "Chưa có";
        const diffMs = Date.now() - new Date(lastCompleted.completedTime).getTime();
        const diffDays = Math.floor(diffMs / (1000*60*60*24));
        if (diffDays === 0) return "Hôm nay";
        if (diffDays === 1) return "1 ngày trước";
        return `${diffDays} ngày trước`;
    })();

    // Trạm gần nhất hiển thị tên + khoảng cách
    const nearestStationDisplay = nearestStation ? `${nearestStation.stationName} - ${nearestStation.distanceKm?.toFixed(1)}km` : (userLocation ? "Đang tải..." : "Chưa bật định vị");

    // Gói hiện tại (active)
    const activePackageName = activeSubscription?.packagePlanName || activeSubscription?.name || "Chưa có";
    const packageRemainingDays = (() => {
        if (!activeSubscription?.endDate) return null;
        const end = new Date(activeSubscription.endDate);
        const diff = Math.ceil((end.getTime() - Date.now()) / (1000*60*60*24));
        return diff > 0 ? diff : 0;
    })();

    // Recent bookings (lấy 5 gần nhất bất kể trạng thái, ưu tiên mới nhất)
    const recentBookings = bookings
        .sort((a,b)=> new Date(b.createdAt||b.scheduledTime) - new Date(a.createdAt||a.scheduledTime))
        .slice(0,5)
        .map(b => ({
            id: b.id,
            station: b.stationId || "Trạm không rõ",
            date: b.scheduledTime ? new Date(b.scheduledTime).toLocaleDateString("vi-VN") : "--",
            time: b.scheduledTime ? new Date(b.scheduledTime).toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit"}) : "--",
            status: b.bookingStatus
        }));

    const getStatusBadge = (status) => {
        const statusMap = {
            CONFIRM: { label: "Đã duyệt", variant: "default" },
            COMPLETE: { label: "Hoàn thành", variant: "secondary" },
            PENDING: { label: "Chờ duyệt", variant: "outline" },
            CANCEL: { label: "Đã hủy", variant: "destructive" },
        };
        return statusMap[status] || { label: status, variant: "outline" };
    };

    // Cards theo thiết kế mới
    const summaryCards = [
        { label: "Trạng thái pin", value: `${batteryStatusPercent}%`, icon: Battery },
        { label: "Lần đổi gần nhất", value: timeSinceLastSwap, icon: Zap },
        { label: "Trạm gần nhất", value: nearestStationDisplay, icon: MapPin },
        { label: "Gói đăng ký", value: activePackageName + (packageRemainingDays!=null?` (Còn ${packageRemainingDays} ngày)`:""), icon: Calendar },
    ];

    const loadingAny = loadingBookings || loadingActiveSub;

    // Khôi phục weekdayCounts và cost comparison
    const weekdayCounts = (() => {
        const init = {CN:0,T2:0,T3:0,T4:0,T5:0,T6:0,T7:0};
        completedBookings.forEach(b => {
            if (!b.completedTime) return; const day = new Date(b.completedTime).getDay();
            const map = {0:"CN",1:"T2",2:"T3",3:"T4",4:"T5",5:"T6",6:"T7"};
            init[map[day]] += 1;
        });
        return init;
    })();
    const powerswapCost = completedBookings.length * 50000;
    const traditionalCost = completedBookings.length * 75000;
    const stationUsageMap = {};
    completedBookings.forEach(b => { if(b.stationId) { stationUsageMap[b.stationId] = (stationUsageMap[b.stationId]||0)+1; }});
    const topStations = Object.entries(stationUsageMap).sort((a,b)=>b[1]-a[1]).slice(0,4);

    const barFrequencyData = {
        labels: ["CN","T2","T3","T4","T5","T6","T7"],
        datasets: [{
            label: "Số lần đổi",
            data: ["CN","T2","T3","T4","T5","T6","T7"].map(d=>weekdayCounts[d]),
            backgroundColor: "#10b981",
            borderRadius: 6,
        }]
    };
    const barCostData = {
        labels: ["PowerSwap","Sạc thường"],
        datasets: [{
            label: "Chi phí (đ)",
            data: [powerswapCost, traditionalCost],
            backgroundColor: ["#2563eb","#94a3b8"],
            borderRadius: 6,
        }]
    };
    const stationDoughnutData = {
        labels: topStations.map(([stationId])=> stationId),
        datasets: [{
            label: "Lượt đổi",
            data: topStations.map(([,count])=>count),
            backgroundColor: ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd"],
            borderWidth: 2,
        }]
    };
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { ticks: { color: '#475569', beginAtZero: true }, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { ticks: { color: '#475569' }, grid: { display:false } } }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 text-gray-900 overflow-x-hidden">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <Motion.div initial="hidden" animate="visible" variants={fadeVariants} transition={{ duration: 0.8 }} className="mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full mb-4">
                            <Zap className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm font-medium text-emerald-700">Driver Dashboard</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                            <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                Chào mừng trở lại!
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600">ID: <span className="font-semibold text-gray-800">{userId}</span></p>
                    </Motion.div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {summaryCards.map((c, idx) => (
                            <Motion.div key={c.label} initial="hidden" animate="visible" variants={fadeVariants} transition={{ duration: 0.6, delay: idx*0.05 }}>
                                <Card className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all">
                                    <CardContent className="p-6 flex items-center gap-5">
                                        <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-md">
                                            <c.icon className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-500 font-medium truncate">{c.label}</p>
                                            {loadingAny ? <Skeleton className="h-6 w-24 mt-1" /> : <p className="text-lg font-bold text-gray-900 truncate">{c.value}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Motion.div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <Motion.div initial="hidden" animate="visible" variants={fadeVariants} transition={{ duration: 0.8, delay: 0.2 }} className="mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Thao tác nhanh</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[{title:"Đặt lịch đổi pin",desc:"Tìm và đặt lịch tại trạm gần bạn",icon:Calendar,to:"/driver/stations"},
                              {title:"Xem lịch của tôi",desc:"Quản lý các lịch đã đặt",icon:Clock,to:"/driver/bookings"},
                              {title:"Tìm trạm gần nhất",desc:"Xem danh sách trạm đổi pin",icon:MapPin,to:"/driver/stations"}].map((action, idx) => (
                                <Motion.div key={action.title} initial="hidden" animate="visible" variants={fadeVariants} transition={{ duration: 0.6, delay: 0.3 + idx*0.05 }}>
                                    <Card onClick={()=>navigate(action.to)} className="cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100 bg-white rounded-3xl">
                                        <CardHeader className="p-8">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg">
                                                <action.icon className="w-8 h-8 text-white" strokeWidth={2} />
                                            </div>
                                            <CardTitle className="text-xl mb-3 text-gray-800">{action.title}</CardTitle>
                                            <CardDescription className="text-gray-600 leading-relaxed">{action.desc}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                </Motion.div>
                            ))}
                        </div>
                    </Motion.div>

                    {/* Recent Bookings */}
                    <Motion.div initial="hidden" animate="visible" variants={fadeVariants} transition={{ duration: 0.8, delay: 0.3 }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-bold text-gray-800">Lịch đổi pin gần đây</h2>
                            <Button variant="ghost" onClick={() => navigate("/driver/bookings")} className="text-emerald-600 hover:text-emerald-700 font-semibold">Xem tất cả →</Button>
                        </div>
                        <Card className="border-gray-100 shadow-lg rounded-3xl overflow-hidden bg-white">
                            <CardContent className="p-0">
                                {loadingBookings ? (
                                    <div className="p-6 space-y-3">
                                        {[...Array(3)].map((_,i)=><Skeleton key={i} className="h-16 w-full" />)}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {recentBookings.map((booking, idx) => (
                                            <Motion.div key={booking.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.05 }} className="p-6 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-cyan-50/50 transition-all">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-start gap-4 min-w-0">
                                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg">
                                                            <Battery className="w-7 h-7 text-white" strokeWidth={2} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-gray-900 mb-1 text-lg truncate">{booking.station}</h3>
                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.date}</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{booking.time}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge variant={getStatusBadge(booking.status).variant} className="font-medium whitespace-nowrap">{getStatusBadge(booking.status).label}</Badge>
                                                </div>
                                            </Motion.div>
                                        ))}
                                        {recentBookings.length === 0 && (
                                            <div className="p-6 text-sm text-gray-500">Chưa có lịch nào.</div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Motion.div>

                    {/* Charts Section */}
                    <Motion.div initial="hidden" animate="visible" variants={fadeVariants} transition={{duration:0.8, delay:0.4}} className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6 bg-white/90 border border-gray-100 rounded-2xl shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-800">Tần suất đổi pin (Tuần)</h3>
                            <div className="h-64">
                                {loadingBookings ? <Skeleton className="h-full w-full" /> : <Bar data={barFrequencyData} options={commonOptions} />}
                            </div>
                        </Card>
                        <Card className="p-6 bg-white/90 border border-gray-100 rounded-2xl shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-800">So sánh chi phí (ước tính)</h3>
                            <div className="h-64">
                                {loadingBookings ? <Skeleton className="h-full w-full" /> : <Bar data={barCostData} options={{...commonOptions, indexAxis:'y'}} />}
                            </div>
                        </Card>
                        <Card className="p-6 bg-white/90 border border-gray-100 rounded-2xl shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-800">Top trạm sử dụng</h3>
                            <div className="h-64 flex items-center justify-center">
                                {loadingBookings ? <Skeleton className="h-full w-full" /> : topStations.length>0 ? <Doughnut data={stationDoughnutData} options={{maintainAspectRatio:false, plugins:{legend:{position:'right'}}}} /> : <p className="text-sm text-gray-500">Chưa có dữ liệu.</p>}
                            </div>
                        </Card>
                        <Card className="p-6 bg-white/90 border border-gray-100 rounded-2xl shadow-sm">
                            <h3 className="text-lg font-bold mb-4 text-gray-800">Tổng quan gói</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p><span className="font-medium text-gray-700">Tên gói:</span> {activePackageName}</p>
                                <p><span className="font-medium text-gray-700">Còn lại:</span> {packageRemainingDays!=null? packageRemainingDays + ' ngày':'--'}</p>
                                <p><span className="font-medium text-gray-700">Lượt đổi hoàn thành:</span> {activeSubscription?.usedSwaps || "N/A"}</p>
                                <p><span className="font-medium text-gray-700">Tổng lượt đổi tháng:</span> {activeSubscription?.packageMaxSwapPerMonth || "0"}</p>
                            </div>
                        </Card>
                    </Motion.div>
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import { Calendar, MapPin, Battery, Clock, Search, CheckCircle, XCircle, Home, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { bookingApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const getStatusBadge = (status) => {
    const statusConfig = {
        PENDING: { label: "Đang chờ xác nhận", variant: "warning", className: "bg-yellow-100 text-yellow-800" },
        CONFIRM: { label: "Đã xác nhận", variant: "info", className: "bg-blue-100 text-blue-800" },
        SUCCESS: { label: "Hoàn thành giao dịch", variant: "success", className: "bg-green-100 text-green-800" },
        CANCEL: { label: "Đã hủy", variant: "destructive", className: "bg-red-100 text-red-800" },
    };
    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
};

const getPaymentTypeBadge = (type) => {
    return type === "PER_SWAP" ? (
        <Badge variant="outline">Trả theo lần</Badge>
    ) : (
        <Badge variant="outline" className="bg-purple-50 text-purple-700">Gói tháng</Badge>
    );
};

export default function MyBookingsPage() {
    const { userId, role } = useAuthStore();
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    const fadeVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    // Fetch bookings của driver
    const { data, isLoading, refetch } = useCustomQuery(
        ["myBookings", userId, page],
        () => bookingApi.getBookingsByDriver(userId, page, 10),
        { enabled: !!userId }
    );

    const bookings = data?.content || [];
    const totalPages = data?.totalPages || 0;

    // Cancel booking mutation
    const cancelBookingMutation = useCustomMutation(
        ({ id, cancelData }) => bookingApi.cancelBooking(id, cancelData),
        null,
        {
            onSuccess: () => {
                toast.success("Đã hủy booking thành công!");
                setIsCancelDialogOpen(false);
                setSelectedBooking(null);
                setCancelReason("");
                refetch();
            },
        }
    );

    // Filter bookings theo tab và search
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch = 
            booking.station?.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.id?.toString().includes(searchQuery);
        
        const matchesTab = 
            activeTab === "all" ||
            (activeTab === "upcoming" && ["PENDING", "CONFIRM"].includes(booking.bookingStatus)) ||
            (activeTab === "completed" && booking.bookingStatus === "SUCCESS") ||
            (activeTab === "cancelled" && booking.bookingStatus === "CANCEL");

        return matchesSearch && matchesTab;
    });

    const handleCancelBooking = (booking) => {
        setSelectedBooking(booking);
        setIsCancelDialogOpen(true);
    };

    const confirmCancelBooking = () => {
        if (!cancelReason.trim()) {
            toast.error("Vui lòng nhập lý do hủy");
            return;
        }

        cancelBookingMutation.mutate({
            id: selectedBooking.id,
            cancelData: {
                cancelReason,
                cancelledBy: "DRIVER",
            },
        });
    };

    const formatDateTime = (dateString) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
        } catch {
            return dateString;
        }
    };

    const driverMenuItems = [
        { label: "Trang chủ", path: "/driver/dashboard", icon: Home },
        { label: "Trạm đổi pin", path: "/driver/stations", icon: MapPin },
        { label: "Lịch của tôi", path: "/driver/bookings", icon: Calendar },
    ];

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 text-gray-900 overflow-x-hidden">
            <Header menuItems={driverMenuItems} role={role || "DRIVER"} />
            <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-700">Quản lý lịch hẹn</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                                Lịch đặt của tôi
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600">Quản lý tất cả các lịch đổi pin của bạn</p>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="mb-6"
                    >
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo ID hoặc tên trạm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 rounded-xl border-gray-200 shadow-sm"
                            />
                        </div>
                    </motion.div>

                    {/* Tabs */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8, delay: 0.3 }}
                    >
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
                            <TabsList className="grid w-full grid-cols-4 h-12 rounded-xl bg-white shadow-sm">
                                <TabsTrigger value="all" className="rounded-lg">Tất cả</TabsTrigger>
                                <TabsTrigger value="upcoming" className="rounded-lg">Sắp tới</TabsTrigger>
                                <TabsTrigger value="completed" className="rounded-lg">Hoàn thành</TabsTrigger>
                                <TabsTrigger value="cancelled" className="rounded-lg">Đã hủy</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </motion.div>

                    {/* Bookings List */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-6 w-3/4 mb-2" />
                                        <Skeleton className="h-4 w-full" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-20 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeVariants}
                            transition={{ duration: 0.8 }}
                            className="text-center py-16 bg-white rounded-3xl shadow-lg"
                        >
                            <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                Không có lịch đặt nào
                            </h3>
                            <p className="text-gray-500 mb-6 text-lg">
                                {searchQuery ? "Không tìm thấy kết quả phù hợp" : "Bạn chưa có lịch đặt nào"}
                            </p>
                            <Button
                                onClick={() => window.location.href = "/driver/stations"}
                                className="h-12 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg font-semibold"
                            >
                                Đặt lịch ngay
                            </Button>
                        </motion.div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {filteredBookings.map((booking, idx) => (
                                    <motion.div
                                        key={booking.id}
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeVariants}
                                        transition={{ duration: 0.6, delay: 0.4 + idx * 0.1 }}
                                    >
                                        <Card className="hover:shadow-xl transition-all transform hover:-translate-y-1 border-gray-100 rounded-3xl overflow-hidden bg-white">
                                            <CardHeader className="pb-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-xl mb-2 text-gray-800">
                                                            {booking.station?.stationName || "Trạm đổi pin"}
                                                        </CardTitle>
                                                        <CardDescription className="flex items-center gap-1.5">
                                                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                            <span className="text-gray-600">{booking.station?.address}</span>
                                                        </CardDescription>
                                                    </div>
                                                    {getStatusBadge(booking.bookingStatus)}
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4 pb-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex items-center gap-3 text-sm bg-blue-50 p-3 rounded-xl">
                                                        <Calendar className="h-5 w-5 text-blue-500" />
                                                        <div>
                                                            <span className="text-gray-600 block text-xs mb-0.5">Thời gian:</span>
                                                            <span className="font-semibold text-gray-800">
                                                                {formatDateTime(booking.scheduledTime)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-sm bg-emerald-50 p-3 rounded-xl">
                                                        <Battery className="h-5 w-5 text-emerald-500" />
                                                        <div>
                                                            <span className="text-gray-600 block text-xs mb-0.5">Loại pin:</span>
                                                            <span className="font-semibold text-gray-800">
                                                                {booking.batteryModel?.modelName || "N/A"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3 text-sm bg-purple-50 p-3 rounded-xl">
                                                        <Clock className="h-5 w-5 text-purple-500" />
                                                        <div>
                                                            <span className="text-gray-600 block text-xs mb-0.5">Đặt lúc:</span>
                                                            <span className="font-semibold text-gray-800">
                                                                {formatDateTime(booking.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm p-3">
                                                        {getPaymentTypeBadge(booking.paymentType)}
                                                    </div>
                                                </div>

                                                {booking.notes && (
                                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl text-sm border border-gray-100">
                                                        <span className="font-semibold text-gray-700">Ghi chú: </span>
                                                        <span className="text-gray-600">{booking.notes}</span>
                                                    </div>
                                                )}

                                                {booking.bookingStatus === "CANCEL" && booking.cancelReason && (
                                                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl text-sm border border-red-100">
                                                        <span className="font-semibold text-red-700">Lý do hủy: </span>
                                                        <span className="text-red-600">{booking.cancelReason}</span>
                                                    </div>
                                                )}
                                            </CardContent>

                                            <CardFooter className="gap-2 bg-gray-50 pt-4">
                                                {booking.bookingStatus === "PENDING" && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleCancelBooking(booking)}
                                                        className="rounded-xl"
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1.5" />
                                                        Hủy lịch
                                                    </Button>
                                                )}
                                                {booking.bookingStatus === "CONFIRM" && (
                                                    <>
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 px-4 py-2">
                                                            <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                                            Đã xác nhận - Vui lòng đến đúng giờ
                                                        </Badge>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCancelBooking(booking)}
                                                            className="rounded-xl"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1.5" />
                                                            Hủy
                                                        </Button>
                                                    </>
                                                )}
                                                {booking.bookingStatus === "SUCCESS" && (
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 px-4 py-2">
                                                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                                        Đã hoàn thành
                                                    </Badge>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeVariants}
                                    transition={{ duration: 0.8 }}
                                    className="mt-12 flex justify-center gap-3"
                                >
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="h-12 px-6 rounded-xl border-gray-200 shadow-sm font-medium"
                                    >
                                        ← Trang trước
                                    </Button>
                                    <div className="flex items-center px-6 py-3 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 shadow-sm font-medium">
                                        Trang <span className="mx-1.5 font-bold text-purple-600">{page + 1}</span> / {totalPages}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                        className="h-12 px-6 rounded-xl border-gray-200 shadow-sm font-medium"
                                    >
                                        Trang sau →
                                    </Button>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <Footer />

            {/* Cancel Dialog */}
            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hủy lịch</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn hủy lịch đặt này không?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                        <label className="text-sm font-medium">
                            Lý do hủy <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            placeholder="Nhập lý do hủy lịch..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setIsCancelDialogOpen(false);
                            setCancelReason("");
                        }}>
                            Đóng
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCancelBooking}
                            disabled={cancelBookingMutation.isLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {cancelBookingMutation.isLoading ? "Đang hủy..." : "Xác nhận hủy"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

import { useState } from "react";
import { Calendar, MapPin, Battery, Clock, Search, CheckCircle, XCircle, Home } from "lucide-react";
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
            <div className="pt-20">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch đặt của tôi</h1>
                        <p className="text-gray-600">Quản lý tất cả các lịch đổi pin của bạn</p>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo ID hoặc tên trạm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="all">Tất cả</TabsTrigger>
                            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
                            <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
                            <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
                        </TabsList>
                    </Tabs>

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
                        <div className="text-center py-12">
                            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Không có lịch đặt nào
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchQuery ? "Không tìm thấy kết quả phù hợp" : "Bạn chưa có lịch đặt nào"}
                            </p>
                            <Button onClick={() => window.location.href = "/driver/stations"}>
                                Đặt lịch ngay
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {filteredBookings.map((booking) => (
                                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg mb-1">
                                                        {booking.station?.stationName || "Trạm đổi pin"}
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {booking.station?.address}
                                                    </CardDescription>
                                                </div>
                                                {getStatusBadge(booking.bookingStatus)}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <span className="text-gray-600">Thời gian:</span>
                                                        <span className="ml-2 font-medium">
                                                            {formatDateTime(booking.scheduledTime)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <Battery className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <span className="text-gray-600">Loại pin:</span>
                                                        <span className="ml-2 font-medium">
                                                            {booking.batteryModel?.modelName || "N/A"}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <span className="text-gray-600">Đặt lúc:</span>
                                                        <span className="ml-2 font-medium">
                                                            {formatDateTime(booking.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm">
                                                    {getPaymentTypeBadge(booking.paymentType)}
                                                </div>
                                            </div>

                                            {booking.notes && (
                                                <div className="bg-gray-50 p-3 rounded text-sm">
                                                    <span className="font-medium text-gray-700">Ghi chú: </span>
                                                    <span className="text-gray-600">{booking.notes}</span>
                                                </div>
                                            )}

                                            {booking.bookingStatus === "CANCEL" && booking.cancelReason && (
                                                <div className="bg-red-50 p-3 rounded text-sm">
                                                    <span className="font-medium text-red-700">Lý do hủy: </span>
                                                    <span className="text-red-600">{booking.cancelReason}</span>
                                                </div>
                                            )}
                                        </CardContent>

                                        <CardFooter className="gap-2">
                                            {booking.bookingStatus === "PENDING" && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleCancelBooking(booking)}
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Hủy lịch
                                                </Button>
                                            )}
                                            {booking.bookingStatus === "CONFIRM" && (
                                                <>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Đã xác nhận - Vui lòng đến đúng giờ
                                                    </Badge>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleCancelBooking(booking)}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Hủy
                                                    </Button>
                                                </>
                                            )}
                                            {booking.bookingStatus === "SUCCESS" && (
                                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Đã hoàn thành
                                                </Badge>
                                            )}
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                    >
                                        Trang trước
                                    </Button>
                                    <span className="px-4 py-2 text-sm text-gray-700">
                                        Trang {page + 1} / {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={page >= totalPages - 1}
                                    >
                                        Trang sau
                                    </Button>
                                </div>
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

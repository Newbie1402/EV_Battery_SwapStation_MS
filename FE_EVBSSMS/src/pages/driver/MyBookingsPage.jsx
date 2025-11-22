import { useState, useMemo, useEffect } from "react";
import {
    Calendar, Search, Eye, XCircle, CreditCard, Star,
    ChevronLeft, ChevronRight, Download
} from "lucide-react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { bookingApi, ratingApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import BookingPaymentDialog from "@/components/BookingPaymentDialog";
import RatingDialog from "@/components/RatingDialog";
import { Badge } from "@/components/ui/badge";

export default function MyBookingsPage() {
    const { employeeId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [paymentFilter, setPaymentFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("");
    const [detailBooking, setDetailBooking] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [paymentDialog, setPaymentDialog] = useState({ open: false, booking: null });
    const [ratingDialog, setRatingDialog] = useState({ open: false, booking: null });
    const [ratingStates, setRatingStates] = useState({}); // { bookingId: 'loading' | 'rated' | 'unrated' }

    const pageSize = 10;

    const { data, isLoading, refetch } = useCustomQuery(
        ["myBookings", employeeId],
        () => bookingApi.getBookingsByDriver(employeeId, 0, 200),
        { enabled: !!employeeId }
    );

    const bookings = useMemo(() => data?.content || [], [data]);

    // Kiểm tra rating status cho các booking SUCCESS
    useEffect(() => {
        if (!bookings.length) return;

        const checkRatingsForBookings = async () => {
            const successBookings = bookings.filter(b => b.bookingStatus === 'SUCCESS');

            for (const booking of successBookings) {
                if (ratingStates[booking.id]) continue; // Đã kiểm tra rồi

                setRatingStates(prev => ({ ...prev, [booking.id]: 'loading' }));

                try {
                    const ratingResponse = await ratingApi.getRatingByBookingId(booking.id);
                    const ratingData = ratingResponse?.data || ratingResponse;

                    if (ratingData && ratingData.id) {
                        setRatingStates(prev => ({ ...prev, [booking.id]: 'rated' }));
                    } else {
                        setRatingStates(prev => ({ ...prev, [booking.id]: 'unrated' }));
                    }
                } catch (error) {
                    console.error(`Error checking rating for booking ${booking.id}:`, error);
                    setRatingStates(prev => ({ ...prev, [booking.id]: 'unrated' }));
                }
            }
        };

        checkRatingsForBookings();
    }, [bookings, ratingStates]);

    const formatDateTime = (dateString) => {
        try { return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi }); } catch { return dateString; }
    };

    const renderStatusBadge = (status) => {
        const config = {
            SUCCESS: { label: "Hoàn thành", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
            CONFIRM: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700 border-blue-200" },
            PENDING: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
            CANCEL: { label: "Đã hủy", className: "bg-red-100 text-red-700 border-red-200" }
        };
        const style = config[status] || config.PENDING;
        return (
            <Badge variant="outline" className={`${style.className} border font-medium`}>
                {style.label}
            </Badge>
        );
    };

    const renderPaymentBadge = (booking) => {
        const isPaid = booking.isPaid;
        return (
            <Badge variant="outline" className={`${isPaid ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"} border font-medium`}>
                {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
            </Badge>
        );
    };

    // Filter Logic
    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const matchesSearch = !searchQuery ||
                b.station?.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.station?.stationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.id?.toString().includes(searchQuery);
            const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;
            const matchesPayment = paymentFilter === 'ALL' || b.paymentType === paymentFilter;
            const matchesDate = !dateFilter || (b.scheduledTime && b.scheduledTime.startsWith(dateFilter));
            return matchesSearch && matchesStatus && matchesPayment && matchesDate;
        });
    }, [bookings, searchQuery, statusFilter, paymentFilter, dateFilter]);

    // Pagination Logic
    const totalItems = filteredBookings.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = totalItems === 0 ? 0 : page * pageSize + 1;
    const endIndex = Math.min((page + 1) * pageSize, totalItems);
    const paginated = filteredBookings.slice(page * pageSize, page * pageSize + pageSize);

    const cancelBookingMutation = useCustomMutation(
        ({ id, cancelData }) => bookingApi.cancelBooking(id, cancelData),
        null,
        { onSuccess: () => { toast.success("Đã hủy booking thành công!"); setIsCancelDialogOpen(false); setSelectedBooking(null); setCancelReason(""); refetch(); } }
    );

    const handleCancelBooking = (booking) => { setSelectedBooking(booking); setIsCancelDialogOpen(true); };
    const confirmCancelBooking = () => {
        if (!cancelReason.trim()) { toast.error("Vui lòng nhập lý do hủy"); return; }
        cancelBookingMutation.mutate({ id: selectedBooking.id, cancelData: { cancelReason, cancelledBy: "DRIVER" } });
    };

    const handleViewDetail = (booking) => { setDetailBooking(booking); setIsDetailOpen(true); };
    const closeDetail = () => { setIsDetailOpen(false); setDetailBooking(null); };
    const openPaymentDialog = (e, booking) => {
        e.stopPropagation(); // Ngăn click row
        setPaymentDialog({ open: true, booking });
    };
    const closePaymentDialog = () => { setPaymentDialog({ open: false, booking: null }); };
    const openRatingDialog = (e, booking) => {
        e.stopPropagation(); // Ngăn click row
        setRatingDialog({ open: true, booking });
    };
    const closeRatingDialog = () => { setRatingDialog({ open: false, booking: null }); };
    const handleRatingSubmitted = (bookingId) => {
        // Cập nhật rating state sau khi submit thành công
        setRatingStates(prev => ({ ...prev, [bookingId]: 'rated' }));
        refetch();
    };

    // Function để render rating button với hiệu ứng
    const renderRatingButton = (booking) => {
        const ratingState = ratingStates[booking.id];
        const hasRating = ratingState === 'rated';
        const isLoading = ratingState === 'loading';

        return (
            <Button
                size="sm"
                onClick={(e) => openRatingDialog(e, booking)}
                disabled={isLoading}
                className={`h-8 px-3 text-xs cursor-pointer gap-1 transition-all duration-500 ease-in-out transform ${
                    hasRating 
                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-200/50 scale-105' 
                        : isLoading
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse shadow-lg shadow-yellow-200/50'
                }`}
            >
                {isLoading ? (
                    <>
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        <span>Kiểm tra...</span>
                    </>
                ) : hasRating ? (
                    <>
                        <Star className="w-3 h-3 fill-current" />
                        <span>Đã đánh giá</span>
                    </>
                ) : (
                    <>
                        <Star className="w-3 h-3" />
                        <span>Đánh giá</span>
                    </>
                )}
            </Button>
        );
    };

    return (
        <div className="w-full bg-slate-50 text-slate-900 min-h-full">
            <div className="container mx-auto px-4 max-w-7xl pt-8">
                {/* Simple fade in effect */}
                <div className="transition-all duration-500 ease-in-out opacity-100">

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Lịch Sử Đặt Lịch</h1>
                            <p className="text-slate-500 mt-1">Quản lý các lịch hẹn đổi pin sắp tới và lịch sử giao dịch.</p>
                        </div>
                        <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 gap-2 shadow-sm cursor-pointer">
                            <Download className="w-4 h-4" /> Xuất dữ liệu
                        </Button>
                    </div>

                    {/* Main Content Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

                        {/* Filters Toolbar */}
                        <div className="p-5 border-b border-slate-100 space-y-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-grow relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e)=>{setSearchQuery(e.target.value); setPage(0);}}
                                        placeholder="Tìm kiếm tên trạm, mã trạm hoặc ID..."
                                        className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    />
                                </div>

                                {/* Filters Group */}
                                <div className="flex flex-wrap gap-3">
                                    <Select value={statusFilter} onValueChange={(v)=>{setStatusFilter(v); setPage(0);}}>
                                        <SelectTrigger className="h-10 w-[160px] bg-slate-50 border-slate-200 cursor-pointer">
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL" className="cursor-pointer">Tất cả trạng thái</SelectItem>
                                            <SelectItem value="PENDING" className="cursor-pointer">Chờ xác nhận</SelectItem>
                                            <SelectItem value="CONFIRM" className="cursor-pointer">Đã xác nhận</SelectItem>
                                            <SelectItem value="SUCCESS" className="cursor-pointer">Hoàn thành</SelectItem>
                                            <SelectItem value="CANCEL" className="cursor-pointer">Đã hủy</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={paymentFilter} onValueChange={(v)=>{setPaymentFilter(v); setPage(0);}}>
                                        <SelectTrigger className="h-10 w-[160px] bg-slate-50 border-slate-200 cursor-pointer">
                                            <SelectValue placeholder="Thanh toán" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL" className="cursor-pointer">Tất cả P.Thức</SelectItem>
                                            <SelectItem value="PER_SWAP" className="cursor-pointer">Trả theo lần</SelectItem>
                                            <SelectItem value="PACKAGE" className="cursor-pointer">Gói tháng</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e)=>{setDateFilter(e.target.value); setPage(0);}}
                                            className="h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50/80">
                                    <TableRow className="border-slate-100 hover:bg-transparent">
                                        <TableHead className="px-6 py-3 font-semibold text-slate-700">Mã Trạm</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-slate-700">Thời Gian Hẹn</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-slate-700">Trạng Thái</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-slate-700">Thanh Toán</TableHead>
                                        <TableHead className="px-6 py-3 font-semibold text-slate-700">Model Pin</TableHead>
                                        <TableHead className="px-6 py-3 text-right font-semibold text-slate-700">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-12 text-center text-slate-500">Đang tải dữ liệu...</TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoading && paginated.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-slate-500">
                                                    <Calendar className="w-10 h-10 mb-2 text-slate-300" />
                                                    <p>Không tìm thấy lịch đặt nào</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!isLoading && paginated.map(b => (
                                        <TableRow
                                            key={b.id}
                                            className="hover:bg-slate-50 transition-colors cursor-pointer border-slate-100 group"
                                            onClick={() => handleViewDetail(b)}
                                        >
                                            <TableCell className="px-6 py-4 text-sm font-medium text-slate-700">
                                                {b.station?.stationCode || b.stationId || 'N/A'}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-slate-600">
                                                {formatDateTime(b.scheduledTime)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                {renderStatusBadge(b.bookingStatus)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                {renderPaymentBadge(b)}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-sm text-slate-600">
                                                {b.batteryModelId || "Mặc định"}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleViewDetail(b)}
                                                        className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>

                                                    {!b.isPaid && b.paymentId && b.bookingStatus !== 'CANCEL' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => openPaymentDialog(e, b)}
                                                            className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white text-xs cursor-pointer gap-1"
                                                        >
                                                            <CreditCard className="w-3 h-3" /> Thanh toán
                                                        </Button>
                                                    )}

                                                    {b.bookingStatus === 'SUCCESS' && renderRatingButton(b)}

                                                    {b.bookingStatus === 'PENDING' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleCancelBooking(b)}
                                                            className="h-8 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs cursor-pointer gap-1"
                                                        >
                                                            <XCircle className="w-3 h-3" /> Hủy
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                            <span className="text-sm text-slate-500">
                                Hiển thị <span className="font-semibold text-slate-900">{startIndex} - {endIndex}</span> trên <span className="font-semibold text-slate-900">{totalItems}</span> kết quả
                            </span>
                            <div className="inline-flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="h-8 px-3 gap-1 cursor-pointer bg-white hover:bg-slate-100"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="h-8 px-3 gap-1 cursor-pointer bg-white hover:bg-slate-100"
                                >
                                    Sau <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-xl bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Chi tiết lịch đặt</DialogTitle>
                        <DialogDescription>Thông tin chi tiết về giao dịch đổi pin #{detailBooking?.id}</DialogDescription>
                    </DialogHeader>
                    {detailBooking && (
                        <div className="space-y-5 py-2 text-sm">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-slate-500">Mã trạm</p>
                                    <p className="font-semibold text-base text-slate-900">{detailBooking?.stationId || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500">Mã Thanh Toán</p>
                                    <p className="font-medium font-mono">{detailBooking?.paymentId || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500">Thời gian lên lịch</p>
                                    <p className="font-medium">{formatDateTime(detailBooking.scheduledTime)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500">Ngày tạo</p>
                                    <p className="font-medium">{formatDateTime(detailBooking.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 mb-1">Trạng thái</p>
                                    {renderStatusBadge(detailBooking.bookingStatus)}
                                </div>
                                <div>
                                    <p className="text-slate-500 mb-1">Thanh toán</p>
                                    {renderPaymentBadge(detailBooking)}
                                </div>
                            </div>

                            {detailBooking.notes && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <p className="text-slate-600">
                                        <span className="font-semibold text-slate-700 block mb-1">Ghi chú:</span>
                                        {detailBooking.notes}
                                    </p>
                                </div>
                            )}

                            {detailBooking.cancelReason && detailBooking.bookingStatus === 'CANCEL' && (
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <p className="text-red-700">
                                        <span className="font-semibold block mb-1">Lý do hủy:</span>
                                        {detailBooking.cancelReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="gap-2 sm:gap-0">
                        {detailBooking && detailBooking.bookingStatus === 'PENDING' && (
                            <Button
                                variant="destructive"
                                onClick={() => handleCancelBooking(detailBooking)}
                                className="cursor-pointer"
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Hủy lịch
                            </Button>
                        )}
                        <Button variant="outline" onClick={closeDetail} className="cursor-pointer">Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận hủy lịch</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn hủy lịch đặt này không? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-4">
                        <label className="text-sm font-medium text-slate-700">Lý do hủy <span className="text-red-500">*</span></label>
                        <Textarea
                            placeholder="Nhập lý do hủy lịch..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                            className="bg-slate-50 border-slate-200 focus:bg-white"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setIsCancelDialogOpen(false); setCancelReason(""); }} className="cursor-pointer">Đóng</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmCancelBooking}
                            disabled={cancelBookingMutation.isLoading}
                            className="bg-red-600 hover:bg-red-700 cursor-pointer"
                        >
                            {cancelBookingMutation.isLoading ? "Đang hủy..." : "Xác nhận hủy"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Payment Dialog */}
            <BookingPaymentDialog
                open={paymentDialog.open}
                onOpenChange={closePaymentDialog}
                booking={paymentDialog.booking}
                onSuccess={() => { toast.success("Thanh toán thành công!"); closePaymentDialog(); refetch(); }}
            />

            {/* Rating Dialog */}
            <RatingDialog
                open={ratingDialog.open}
                onOpenChange={closeRatingDialog}
                booking={ratingDialog.booking}
                driverId={employeeId}
                onRatingSubmitted={handleRatingSubmitted}
            />
        </div>
    );
}
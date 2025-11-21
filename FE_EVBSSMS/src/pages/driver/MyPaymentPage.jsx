import { useState, useMemo } from "react";
import {
    Search, CreditCard, Package, Receipt, Eye, Download,
    Filter, Calendar, ArrowUpDown, RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import useCustomQuery from "@/hooks/useCustomQuery";
import { paymentApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/utils/format";

export default function MyPaymentPage() {
    const { employeeId } = useAuthStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [methodFilter, setMethodFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("");
    const [detailPayment, setDetailPayment] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("swap");

    const { data, isLoading } = useCustomQuery(
        ["myPayments", employeeId],
        () => paymentApi.getPaymentsByCustomer(employeeId),
        {
            enabled: !!employeeId,
            onError: () => toast.error("Không thể tải lịch sử thanh toán")
        }
    );

    const paymentData = data?.data || data || {};
    const swapPayments = paymentData.swapPayments || [];
    const packagePayments = paymentData.packagePayments || [];

    // Animation variants (giống StationListPage)
    const fadeVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const formatDateTime = (dateString) => {
        try {
            return format(new Date(dateString), "dd/MM/yyyy - HH:mm", { locale: vi });
        } catch {
            return dateString || "N/A";
        }
    };

    const renderStatusBadge = (status) => {
        const config = {
            SUCCESS: { label: "Thành công", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200" },
            PENDING: { label: "Đang chờ", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200" },
            FAILED: { label: "Thất bại", className: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200" },
            REFUNDED: { label: "Hoàn tiền", className: "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200" }
        };

        const style = config[status] || { label: status, className: "bg-slate-100 text-slate-700" };

        return (
            <Badge variant="outline" className={`${style.className} font-semibold border`}>
                {style.label}
            </Badge>
        );
    };

    const renderMethodBadge = (method) => {
        const labelMap = {
            CASH: "Tiền mặt",
            VNPAY: "VNPAY",
            BANK_TRANSFER: "Chuyển khoản",
            CREDIT_CARD: "Thẻ tín dụng"
        };
        return <span className="text-slate-600 font-medium text-sm">{labelMap[method] || method}</span>;
    };

    // Filter Logic
    const filterData = (payments) => {
        return payments.filter(p => {
            const matchesSearch = !searchQuery ||
                p.id?.toString().includes(searchQuery) ||
                p.bookingId?.toString().includes(searchQuery) ||
                p.stationId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.packageId?.toString().includes(searchQuery);
            const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
            const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;
            const matchesDate = !dateFilter || (p.createdAt && p.createdAt.startsWith(dateFilter));
            return matchesSearch && matchesStatus && matchesMethod && matchesDate;
        });
    };

    const filteredSwapPayments = useMemo(() => filterData(swapPayments), [swapPayments, searchQuery, statusFilter, methodFilter, dateFilter]);
    const filteredPackagePayments = useMemo(() => filterData(packagePayments), [packagePayments, searchQuery, statusFilter, methodFilter, dateFilter]);

    const handleViewDetail = (payment) => {
        setDetailPayment(payment);
        setIsDetailOpen(true);
    };

    // Helper component cho Status Chip Filter
    const StatusChip = ({ label, value, active, onClick }) => (
        <button
            onClick={onClick}
            className={`
                flex h-9 items-center justify-center px-4 rounded-full text-sm font-medium transition-all duration-200 border
                ${active
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }
            `}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen w-full bg-slate-50/50 text-slate-900 pb-12">
            <div className="container mx-auto px-4 max-w-7xl pt-8">

                {/* Header Section */}
                <motion.div
                    initial="hidden" animate="visible" variants={fadeVariants} transition={{ duration: 0.5 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8"
                >
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">Lịch Sử Thanh Toán</h1>
                        <p className="text-slate-500 font-medium">Quản lý và theo dõi chi tiêu dịch vụ đổi pin của bạn.</p>
                    </div>
                    <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 gap-2 shadow-sm">
                        <Download className="w-4 h-4" /> Xuất Báo Cáo
                    </Button>
                </motion.div>

                {/* Stats Cards - Giống style MyPackagesPage */}
                <motion.div
                    initial="hidden" animate="visible" variants={fadeVariants} transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                    {[
                        { title: "Thanh toán đổi pin", value: paymentData.totalSwapPayments, icon: CreditCard, color: "text-blue-600", bg: "bg-blue-50" },
                        { title: "Thanh toán gói", value: paymentData.totalPackagePayments, icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
                        { title: "Tổng chi tiêu", value: paymentData.totalAmount, icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-50", isCurrency: true }
                    ].map((stat, index) => (
                        <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                                        {isLoading ? (
                                            <Skeleton className="h-8 w-32" />
                                        ) : (
                                            <h3 className={`text-2xl font-bold ${stat.color}`}>
                                                {stat.isCurrency ? formatCurrency(stat.value || 0) : (stat.value || 0)}
                                            </h3>
                                        )}
                                    </div>
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>

                {/* Main Content Box */}
                <motion.div
                    initial="hidden" animate="visible" variants={fadeVariants} transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                    {/* Filters Toolbar */}
                    <div className="p-5 border-b border-slate-100 bg-white space-y-4">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between">
                            {/* Search & Basic Filters */}
                            <div className="flex flex-1 flex-col sm:flex-row gap-3">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <Input
                                        placeholder="Tìm theo mã GD, trạm, gói..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                                        <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
                                            <SelectValue placeholder="Phương thức" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">Tất cả P.Thức</SelectItem>
                                            <SelectItem value="CASH">Tiền mặt</SelectItem>
                                            <SelectItem value="VNPAY">VNPAY</SelectItem>
                                            <SelectItem value="BANK_TRANSFER">Chuyển khoản</SelectItem>
                                            <SelectItem value="CREDIT_CARD">Thẻ tín dụng</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="relative">
                                        <Input
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="w-auto bg-slate-50 border-slate-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Status Filters */}
                        <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div className="h-4 w-[1px] bg-slate-200 mx-1 flex-shrink-0"></div>
                            <StatusChip label="Tất cả" value="ALL" active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} />
                            <StatusChip label="Thành công" value="SUCCESS" active={statusFilter === 'SUCCESS'} onClick={() => setStatusFilter('SUCCESS')} />
                            <StatusChip label="Đang chờ" value="PENDING" active={statusFilter === 'PENDING'} onClick={() => setStatusFilter('PENDING')} />
                            <StatusChip label="Thất bại" value="FAILED" active={statusFilter === 'FAILED'} onClick={() => setStatusFilter('FAILED')} />
                            <StatusChip label="Hoàn tiền" value="REFUNDED" active={statusFilter === 'REFUNDED'} onClick={() => setStatusFilter('REFUNDED')} />
                        </div>
                    </div>

                    {/* Tabs & Table */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-5 pt-2 border-b border-slate-100 bg-slate-50/50">
                            <TabsList className="bg-transparent h-auto p-0 gap-6">
                                <TabsTrigger
                                    value="swap"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Giao dịch đổi pin ({filteredSwapPayments.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="package"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-1 py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    Giao dịch gói cước ({filteredPackagePayments.length})
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-0">
                            <TabsContent value="swap" className="m-0">
                                <PaymentTable
                                    data={filteredSwapPayments}
                                    isLoading={isLoading}
                                    onViewDetail={handleViewDetail}
                                    type="swap"
                                    renderStatus={renderStatusBadge}
                                    renderMethod={renderMethodBadge}
                                    formatDateTime={formatDateTime}
                                />
                            </TabsContent>
                            <TabsContent value="package" className="m-0">
                                <PaymentTable
                                    data={filteredPackagePayments}
                                    isLoading={isLoading}
                                    onViewDetail={handleViewDetail}
                                    type="package"
                                    renderStatus={renderStatusBadge}
                                    renderMethod={renderMethodBadge}
                                    formatDateTime={formatDateTime}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </motion.div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-lg bg-white">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Receipt className="w-5 h-5 text-blue-600" />
                            Chi tiết hóa đơn
                        </DialogTitle>
                        <DialogDescription>
                            Mã giao dịch: <span className="font-mono font-medium text-slate-900">#{detailPayment?.id}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {detailPayment && (
                        <div className="py-4 space-y-6">
                            {/* Amount Highlight */}
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
                                <p className="text-slate-500 text-sm mb-1">Tổng thanh toán</p>
                                <p className="text-3xl font-black text-blue-600">{formatCurrency(detailPayment.totalAmount)}</p>
                                <div className="mt-3 flex justify-center">
                                    {renderStatusBadge(detailPayment.status)}
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <p className="text-slate-500">Thời gian tạo</p>
                                    <p className="font-medium">{formatDateTime(detailPayment.createdAt)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-500">Phương thức</p>
                                    <p className="font-medium">{renderMethodBadge(detailPayment.method)}</p>
                                </div>

                                {detailPayment.bookingId && (
                                    <>
                                        <div className="col-span-2 pt-2 border-t border-slate-100"></div>
                                        <div className="space-y-1">
                                            <p className="text-slate-500">Mã Booking</p>
                                            <p className="font-medium">#{detailPayment.bookingId}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-500">Trạm đổi</p>
                                            <p className="font-medium flex items-center gap-1">
                                                {detailPayment.stationId || "N/A"}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {detailPayment.packageId && (
                                    <>
                                        <div className="col-span-2 pt-2 border-t border-slate-100"></div>
                                        <div className="col-span-2 space-y-1">
                                            <p className="text-slate-500">Thông tin gói</p>
                                            <p className="font-medium">Gói dịch vụ #{detailPayment.packageId}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            {detailPayment.description && (
                                <div className="bg-blue-50/50 p-3 rounded-lg text-sm text-slate-700 border border-blue-100">
                                    <span className="font-semibold">Ghi chú: </span>{detailPayment.description}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailOpen(false)} className="w-full sm:w-auto">Đóng</Button>
                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                            <Download className="w-4 h-4 mr-2" /> Tải hóa đơn
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Sub-component: Table to reduce redundancy
function PaymentTable({ data, isLoading, onViewDetail, type, renderStatus, renderMethod, formatDateTime }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent bg-slate-50/80 border-slate-100">
                        <TableHead className="w-[180px] font-semibold text-slate-700">Thời gian</TableHead>
                        <TableHead className="font-semibold text-slate-700">
                            {type === 'swap' ? 'Thông tin Trạm / Booking' : 'Thông tin Gói dịch vụ'}
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 text-right">Số tiền</TableHead>
                        <TableHead className="font-semibold text-slate-700">Phương thức</TableHead>
                        <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                        <TableHead className="text-right w-[100px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        [...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-8 ml-auto rounded-full" /></TableCell>
                            </TableRow>
                        ))
                    ) : data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-64 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <Receipt className="w-12 h-12 mb-3 text-slate-200" />
                                    <p className="text-lg font-medium text-slate-600">Chưa có giao dịch nào</p>
                                    <p className="text-sm">Các giao dịch của bạn sẽ xuất hiện ở đây</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((p) => (
                            <TableRow key={p.id} className="hover:bg-slate-50 border-slate-100 transition-colors group">
                                <TableCell className="font-medium text-slate-600 text-sm">
                                    {formatDateTime(p.createdAt)}
                                </TableCell>
                                <TableCell>
                                    {type === 'swap' ? (
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">{p.stationId || 'Trạm không xác định'}</span>
                                            <span className="text-xs text-slate-500 font-mono">#{p.bookingId}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">Gói #{p.packageId}</span>
                                            <span className="text-xs text-slate-500">Đăng ký gói cước</span>
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-bold text-slate-900">
                                    {formatCurrency(p.totalAmount)}
                                </TableCell>
                                <TableCell>{renderMethod(p.method)}</TableCell>
                                <TableCell>{renderStatus(p.status)}</TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onViewDetail(p)}
                                        className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
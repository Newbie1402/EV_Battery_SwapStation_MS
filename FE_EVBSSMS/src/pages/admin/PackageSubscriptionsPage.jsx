import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCustomQuery from "@/hooks/useCustomQuery";
import {
    Users,
    ArrowLeft,
    Search,
    CheckCircle,
    XCircle,
    Clock,
    Package,
    Calendar,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { subscriptionPackageApi } from "@/api/subscriptionPackageApi";
import { formatDate } from "@/utils/format";

export default function PackageSubscriptionsPage() {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch subscriptions by packagePlanId
    const { data: subscriptionsWrapper, isLoading } = useCustomQuery(
        ["subscriptions", packageId],
        () => subscriptionPackageApi.getSubscriptionsByPackagePlanId(packageId)
    );

    const subscriptionsData = subscriptionsWrapper?.data || subscriptionsWrapper || [];
    const subscriptions = Array.isArray(subscriptionsData) ? subscriptionsData : [];

    // Get package name from first subscription if available
    const packageName = subscriptions.length > 0 ? subscriptions[0].packagePlanName : "Gói dịch vụ";

    const getStatusBadge = (status) => {
        const statusMap = {
            ACTIVE: {
                label: "Đang hoạt động",
                color: "bg-green-100 text-green-700",
                icon: CheckCircle
            },
            EXPIRED: {
                label: "Hết hạn",
                color: "bg-red-100 text-red-700",
                icon: XCircle
            },
            CANCELLED: {
                label: "Đã hủy",
                color: "bg-gray-100 text-gray-700",
                icon: XCircle
            },
            PENDING: {
                label: "Chờ xử lý",
                color: "bg-yellow-100 text-yellow-700",
                icon: Clock
            },
        };
        return statusMap[status] || {
            label: status,
            color: "bg-gray-100 text-gray-700",
            icon: AlertCircle
        };
    };

    const filterSubscriptions = (subscriptions) => {
        if (!searchQuery) return subscriptions;
        return subscriptions.filter(
            (sub) =>
                sub.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.packagePlanName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredSubscriptions = filterSubscriptions(subscriptions);

    // Statistics
    const activeCount = subscriptions.filter(s => s.status === "ACTIVE").length;
    const expiredCount = subscriptions.filter(s => s.status === "EXPIRED").length;

    return (
        <div className="w-full min-h-screen bg-white text-gray-900">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/admin/packages")}
                            className="mb-4 gap-2 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay lại
                        </Button>

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                                    <span className="text-[#135bec]">
                                        Người dùng đăng ký
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Gói: <span className="font-semibold text-gray-800">{packageName}</span>
                                    <span className="mx-2">•</span>
                                    <span className="font-semibold text-gray-800">{subscriptions.length} người dùng</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-green-600">{activeCount} đang hoạt động</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-red-600">{expiredCount} hết hạn</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tổng đăng ký</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {subscriptions.length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Đang hoạt động</p>
                                        <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Hết hạn</p>
                                        <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Tỷ lệ hoạt động</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {subscriptions.length > 0 ? Math.round((activeCount / subscriptions.length) * 100) : 0}%
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search */}
                    <div>
                        <Card className="mb-6">
                            <CardContent className="pt-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        placeholder="Tìm kiếm theo User ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 cursor-text"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Subscriptions List */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-40 w-full" />
                            ))}
                        </div>
                    ) : filteredSubscriptions.length === 0 ? (
                        <div>
                            <Card>
                                <CardContent className="pt-12 pb-12 text-center">
                                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">Chưa có người dùng nào đăng ký gói này</p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredSubscriptions.map((subscription) => {
                                const statusInfo = getStatusBadge(subscription.status);
                                const StatusIcon = statusInfo.icon;
                                const usagePercent = subscription.packageMaxSwapPerMonth > 0
                                    ? Math.round((subscription.usedSwaps / subscription.packageMaxSwapPerMonth) * 100)
                                    : 0;

                                return (
                                    <div key={subscription.id}>
                                        <Card className="hover:shadow-lg transition-all">
                                            <CardContent className="p-6">
                                                <div className="flex items-start gap-4">
                                                    {/* Avatar */}
                                                    <Avatar className="w-16 h-16">
                                                        <AvatarFallback className="bg-[#135bec] text-white text-xl font-bold">
                                                            {subscription.userId?.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    {/* Subscription Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                User ID: {subscription.userId}
                                                            </h3>
                                                            <Badge className={`${statusInfo.color} flex items-center gap-1`}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                {statusInfo.label}
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Package className="w-4 h-4 text-[#135bec]" />
                                                                <div>
                                                                    <p className="font-medium text-gray-900">{subscription.packagePlanName}</p>
                                                                    <p className="text-xs text-gray-500">{subscription.packagePlanType}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {subscription.usedSwaps} / {subscription.packageMaxSwapPerMonth}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">Lượt đã dùng ({usagePercent}%)</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Calendar className="w-4 h-4 text-purple-500" />
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {formatDate(subscription.startDate)}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">Ngày bắt đầu</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <Calendar className="w-4 h-4 text-red-500" />
                                                                <div>
                                                                    <p className="font-medium text-gray-900">
                                                                        {formatDate(subscription.endDate)}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">Ngày kết thúc</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Usage Progress Bar */}
                                                        <div className="mt-4">
                                                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                                                <span>Tiến độ sử dụng</span>
                                                                <span>{usagePercent}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all ${
                                                                        usagePercent >= 90 ? 'bg-red-500' :
                                                                        usagePercent >= 70 ? 'bg-yellow-500' :
                                                                        'bg-green-500'
                                                                    }`}
                                                                    style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

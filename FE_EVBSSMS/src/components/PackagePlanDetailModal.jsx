import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import { PACKAGE_PLAN_STATUS, PACKAGE_PLAN_TYPE } from "@/api/packagePlanApi";
import { AlertTriangle } from "lucide-react";

/**
 * Modal hiển thị chi tiết Package Plan
 * Props:
 * - open: boolean
 * - onOpenChange: (open:boolean) => void
 * - data: object | undefined (kết quả getPackagePlanById)
 * - loading: boolean
 * - error: boolean
 * - onRetry: () => void
 */
export function PackagePlanDetailModal({ open, onOpenChange, data, loading, error, onRetry }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Chi tiết gói dịch vụ</DialogTitle>
                    <DialogDescription>
                        Xem thông tin cấu hình của gói dịch vụ bạn đang sử dụng
                    </DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : error ? (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-md flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1 text-sm text-red-700">
                            Không thể tải chi tiết gói. Vui lòng thử lại.
                        </div>
                        <Button size="sm" variant="outline" onClick={onRetry}>Thử lại</Button>
                    </div>
                ) : data ? (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold mb-1">{data.packageName || data.packagePlanName}</h3>
                                <p className="text-sm text-slate-600">{data.description || "Không có mô tả"}</p>
                            </div>
                            {data.status && (
                                <Badge className={data.status === PACKAGE_PLAN_STATUS.ACTIVE ? "bg-green-600" : "bg-gray-500"}>
                                    {data.status === PACKAGE_PLAN_STATUS.ACTIVE ? "Đang hoạt động" : "Không hoạt động"}
                                </Badge>
                            )}
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500">Loại gói</p>
                                <p className="font-medium">
                                    {data.packageType === PACKAGE_PLAN_TYPE.YEARLY ? "Gói năm" : "Gói tháng"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500">Giá</p>
                                <p className="font-medium text-blue-600">{formatCurrency(data.price || data.amount || 0)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500">Giới hạn lượt/tháng</p>
                                <p className="font-medium">{data.maxSwapPerMonth ?? data.swapLimit ?? "N/A"}</p>
                            </div>
                            {data.durationDays && (
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-500">Số ngày sử dụng</p>
                                    <p className="font-medium">{data.durationDays} ngày</p>
                                </div>
                            )}
                        </div>
                        {data.note && (
                            <div className="text-xs text-slate-500 bg-slate-50 border rounded p-3">
                                {data.note}
                            </div>
                        )}
                        <div className="flex justify-end">
                            <Button variant="secondary" onClick={() => onOpenChange(false)}>Đóng</Button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">Không có dữ liệu hiển thị.</p>
                )}
            </DialogContent>
        </Dialog>
    );
}


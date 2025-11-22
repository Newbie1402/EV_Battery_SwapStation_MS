import useCustomQuery from "@/hooks/useCustomQuery";
import { adminApi } from "@/api/adminApi";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Car } from "lucide-react";

/**
 * VehicleDetailDialog
 * Props:
 * - open: boolean
 * - onOpenChange: (open: boolean) => void
 * - vehicleId: string | number | null
 */
export default function VehicleDetailDialog({ open, onOpenChange, vehicleId }) {
  const { data: vehicleDetail, isLoading: isLoadingDetail } = useCustomQuery(
    ["vehicleDetail", vehicleId],
    () => adminApi.getVehicleById(vehicleId),
    { enabled: !!vehicleId && open }
  );

  const getStatusBadge = (status) => {
    const statusMap = {
      ACTIVE: { label: "Hoạt động", className: "bg-green-500" },
      INACTIVE: { label: "Không hoạt động", className: "bg-gray-500" },
      MAINTENANCE: { label: "Bảo trì", className: "bg-yellow-500" },
    };
    return statusMap[status] || { label: status, className: "bg-gray-500" };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết phương tiện</DialogTitle>
          <DialogDescription>Thông tin đầy đủ về phương tiện</DialogDescription>
        </DialogHeader>

        {isLoadingDetail ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : vehicleDetail ? (
          <div className="space-y-6">
            {/* Vehicle Image */}
            <div className="w-full h-64 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center overflow-hidden">
              {vehicleDetail.imageUrl ? (
                <img
                  src={vehicleDetail.imageUrl}
                  alt={vehicleDetail.model}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Car className="w-24 h-24 text-white" />)
              }
            </div>

            {/* Vehicle Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-slate-500">VIN</p>
                <p className="font-semibold text-slate-900">{vehicleDetail.vin}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Biển số</p>
                <p className="font-semibold text-slate-900">{vehicleDetail.licensePlate}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Model</p>
                <p className="font-semibold text-slate-900">{vehicleDetail.model || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Trạng thái</p>
                <Badge className={`${getStatusBadge(vehicleDetail.status).className} text-white w-fit`}>
                  {getStatusBadge(vehicleDetail.status).label}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Loại pin</p>
                <p className="font-semibold text-slate-900">{vehicleDetail.batteryType || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Dung lượng pin</p>
                <p className="font-semibold text-slate-900">
                  {vehicleDetail.batteryCapacity ? `${vehicleDetail.batteryCapacity} kWh` : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Mã nhân viên</p>
                <p className="font-semibold text-slate-900">{vehicleDetail.employeeId || "Chưa cấp phát"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Tài xế</p>
                <p className="font-semibold text-emerald-600">{vehicleDetail.driverName || "—"}</p>
              </div>
              <div className="space-y-1 col-span-2">
                <p className="text-sm text-slate-500">Ghi chú</p>
                <p className="font-semibold text-slate-900">{vehicleDetail.notes || "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Ngày tạo</p>
                <p className="font-semibold text-slate-900">
                  {new Date(vehicleDetail.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-slate-500">Cập nhật lần cuối</p>
                <p className="font-semibold text-slate-900">
                  {new Date(vehicleDetail.updatedAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">Không tìm thấy thông tin phương tiện</div>
        )}
      </DialogContent>
    </Dialog>
  );
}


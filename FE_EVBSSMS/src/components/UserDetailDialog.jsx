import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Building2 } from "lucide-react";

// Component hiển thị chi tiết người dùng (dùng dữ liệu đã chọn, không tự fetch)
// Props: open, onOpenChange, user, getStatusBadge, getUserInitials, stationInfo
export default function UserDetailDialog({ open, onOpenChange, user, getStatusBadge, getUserInitials, stationInfo }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
          <DialogDescription>Thông tin chi tiết về người dùng</DialogDescription>
        </DialogHeader>
        {user && (
          <div className="space-y-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4">
              <Avatar className="w-24 h-24">
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-2xl">
                  {getUserInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{user.fullName}</h3>
                <p className="text-slate-500">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className={`${getStatusBadge(user.status).className} text-white`}>
                    {getStatusBadge(user.status).label}
                  </Badge>
                  <Badge variant="outline">{user.role}</Badge>
                </div>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Số điện thoại</p>
                <p className="font-semibold text-slate-900">{user.phone}</p>
              </div>
              <div>
                <p className="text-slate-500">Ngày sinh</p>
                <p className="font-semibold text-slate-900">
                  {user.birthday ? new Date(user.birthday).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">CCCD</p>
                <p className="font-semibold text-slate-900">{user.identityCard}</p>
              </div>
              <div>
                <p className="text-slate-500">Mã nhân viên</p>
                <p className="font-semibold text-slate-900">{user.employeeId}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-500">Địa chỉ</p>
                <p className="font-semibold text-slate-900">{user.address || "Chưa cập nhật"}</p>
              </div>
            </div>

            {/* Station Info for STAFF */}
            {user.role === "STAFF" && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Trạm làm việc
                </h4>
                {stationInfo ? (
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 space-y-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{stationInfo.stationName}</p>
                        <p className="text-sm text-slate-600">Mã trạm: {stationInfo.stationCode}</p>
                        {stationInfo.address && (
                          <p className="text-sm text-slate-600 mt-1">Địa chỉ: {stationInfo.address}</p>
                        )}
                        {stationInfo.phoneNumber && (
                          <p className="text-sm text-slate-600">SĐT: {stationInfo.phoneNumber}</p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {stationInfo.status && (
                            <Badge variant="outline" className="text-xs">
                              {stationInfo.status === "ACTIVE" ? "Hoạt động" : stationInfo.status}
                            </Badge>
                          )}
                          {stationInfo.totalSlots && (
                            <Badge variant="outline" className="text-xs">
                              {stationInfo.availableSlots || 0}/{stationInfo.totalSlots} slots
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/20">
                    <p className="text-sm text-slate-500 text-center">Chưa được phân công trạm</p>
                  </div>
                )}
              </div>
            )}

            {/* Vehicles */}
            {user.vehicles && user.vehicles.length > 0 && (
              <div>
                <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Phương tiện ({user.vehicles.length})
                </h4>
                <div className="space-y-3">
                  {user.vehicles.map((vehicle) => (
                    <div key={vehicle.vehicleId} className="p-3 border rounded-lg space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{vehicle.model || "Xe điện"}</p>
                        <Badge>{vehicle.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-600">Biển số: {vehicle.licensePlate}</p>
                      <p className="text-sm text-slate-600">VIN: {vehicle.vin}</p>
                      {vehicle.batteryCapacity && (
                        <p className="text-sm text-slate-600">Pin: {vehicle.batteryCapacity} kWh</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


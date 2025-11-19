import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";

// Component hiển thị chi tiết người dùng (dùng dữ liệu đã chọn, không tự fetch)
// Props: open, onOpenChange, user, getStatusBadge, getUserInitials
export default function UserDetailDialog({ open, onOpenChange, user, getStatusBadge, getUserInitials }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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


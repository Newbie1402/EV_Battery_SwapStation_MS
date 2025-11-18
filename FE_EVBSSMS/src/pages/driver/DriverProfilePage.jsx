import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { userApi } from "@/api/userApi";
import { driverApi } from "@/api/driverApi";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import toast from "react-hot-toast";
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    CreditCard,
    Car,
    Edit,
    Save,
    X,
    Camera,
    Zap,
    Battery,
    Shield,
    AlertCircle,
    Eye,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function DriverProfilePage() {
    const { user, updateUser, status } = useAuthStore();
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [profileForm, setProfileForm] = useState({
        fullName: user?.fullName || "",
        phone: user?.phone || "",
        birthday: user?.birthday || "",
        address: user?.address || "",
    });

    // Fetch user profile
    const { isLoading: isLoadingProfile, refetch: refetchProfile } = useCustomQuery(
        ["userProfile"],
        userApi.getProfileUser
    );

    // Fetch driver vehicles
    const { data: vehiclesData, isLoading: isLoadingVehicles } = useCustomQuery(
        ["driverVehicles"],
        driverApi.getDriverVehicles
    );

    // Fetch vehicle detail
    const { data: vehicleDetail, isLoading: isLoadingDetail } = useCustomQuery(
        ["vehicleDetail", selectedVehicleId],
        () => driverApi.getVehiclesDetail(selectedVehicleId),
        {
            enabled: !!selectedVehicleId && isDetailDialogOpen,
        }
    );

    // Update profile mutation
    const updateProfileMutation = useCustomMutation(
        (data) => userApi.updateProfileUser(data),
        null,
        {
            onSuccess: (response) => {
                updateUser(response.data || response);
                setIsEditingProfile(false);
                toast.success("Cập nhật thông tin thành công!");
                refetchProfile();
            },
        }
    );

    const handleProfileChange = (e) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleSaveProfile = () => {
        updateProfileMutation.mutate({
            fullName: profileForm.fullName,
            phone: profileForm.phone,
            birthday: profileForm.birthday,
            address: profileForm.address,
        });
    };

    const handleCancelEdit = () => {
        setIsEditingProfile(false);
        setProfileForm({
            fullName: user?.fullName || "",
            phone: user?.phone || "",
            birthday: user?.birthday || "",
            address: user?.address || "",
        });
    };

    const handleViewDetail = (vehicleId) => {
        setSelectedVehicleId(vehicleId);
        setIsDetailDialogOpen(true);
    };

    const getUserInitials = () => {
        if (user?.fullName) {
            const names = user.fullName.trim().split(" ");
            if (names.length >= 2) {
                return (names[names.length - 1][0] + names[0][0]).toUpperCase();
            }
            return user.fullName.substring(0, 2).toUpperCase();
        }
        return "DR";
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            ACTIVE: { label: "Hoạt động", className: "bg-green-100 text-green-800" },
            INACTIVE: { label: "Không hoạt động", className: "bg-gray-100 text-gray-800" },
            MAINTENANCE: { label: "Bảo trì", className: "bg-yellow-100 text-yellow-800" },
            PENDING_VERIFICATION: { label: "Chờ xác thực", className: "bg-orange-100 text-orange-800" },
            PENDING_APPROVAL: { label: "Chờ duyệt", className: "bg-blue-100 text-blue-800" },
        };
        return statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    };

    const getVehicleStatusBadge = (status) => {
        const statusMap = {
            ACTIVE: { label: "Hoạt động", className: "bg-green-500" },
            INACTIVE: { label: "Không hoạt động", className: "bg-gray-500" },
            MAINTENANCE: { label: "Bảo trì", className: "bg-yellow-500" },
        };
        return statusMap[status] || { label: status, className: "bg-gray-500" };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Thông tin cá nhân</h1>
                    <p className="text-slate-600">Quản lý thông tin tài khoản và phương tiện của bạn</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Avatar Card */}
                        <Card className="border-0 shadow-lg">
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <Avatar className="w-32 h-32">
                                            {user?.avatar && (
                                                <AvatarImage src={user.avatar} alt={user.fullName} />
                                            )}
                                            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-3xl">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#135bec] text-white rounded-full flex items-center justify-center hover:bg-[#135bec]/90 transition shadow-lg">
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 mt-4">
                                        {user?.fullName || "Tài xế"}
                                    </h2>
                                    <p className="text-sm text-slate-500">{user?.email}</p>
                                    <div className="mt-3">
                                        <Badge className={getStatusBadge(status || user?.status).className}>
                                            {getStatusBadge(status || user?.status).label}
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                {/* Quick Stats */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                            <User className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Vai trò</p>
                                            <p className="font-semibold text-slate-900">Tài xế</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <Car className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-slate-500">Số phương tiện</p>
                                            <p className="font-semibold text-slate-900">
                                                {vehiclesData?.length || 0} xe
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <CreditCard className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-slate-500">CCCD</p>
                                            <p className="font-semibold text-slate-900">
                                                {user?.identityCard || "Chưa cập nhật"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Account Status Warning */}
                        {(status === "PENDING_VERIFICATION" || user?.status === "PENDING_VERIFICATION") && (
                            <Card className="border-0 shadow-lg bg-orange-50">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-orange-900 mb-1">
                                                Tài khoản chưa xác thực
                                            </h3>
                                            <p className="text-sm text-orange-700">
                                                Vui lòng xác thực email để sử dụng đầy đủ dịch vụ.
                                            </p>
                                            <Button className="mt-3 bg-orange-600 hover:bg-orange-700" size="sm">
                                                Xác thực ngay
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information Card */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl">Thông tin cá nhân</CardTitle>
                                        <CardDescription>
                                            Cập nhật thông tin liên hệ của bạn
                                        </CardDescription>
                                    </div>
                                    {!isEditingProfile ? (
                                        <Button
                                            onClick={() => {
                                                setIsEditingProfile(true);
                                                setProfileForm({
                                                    fullName: user?.fullName || "",
                                                    phone: user?.phone || "",
                                                    birthday: user?.birthday || "",
                                                    address: user?.address || "",
                                                });
                                            }}
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Chỉnh sửa
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleSaveProfile}
                                                size="sm"
                                                className="gap-2 bg-[#135bec] hover:bg-[#135bec]/90"
                                                disabled={updateProfileMutation.isPending}
                                            >
                                                <Save className="w-4 h-4" />
                                                Lưu
                                            </Button>
                                            <Button
                                                onClick={handleCancelEdit}
                                                size="sm"
                                                variant="outline"
                                                className="gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Hủy
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoadingProfile ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Full Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName" className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-500" />
                                                Họ và tên
                                            </Label>
                                            {isEditingProfile ? (
                                                <Input
                                                    id="fullName"
                                                    name="fullName"
                                                    value={profileForm.fullName}
                                                    onChange={handleProfileChange}
                                                    placeholder="Nhập họ và tên"
                                                />
                                            ) : (
                                                <p className="text-sm text-slate-900 font-medium py-2 px-3 bg-slate-50 rounded-md">
                                                    {user?.fullName || "Chưa cập nhật"}
                                                </p>
                                            )}
                                        </div>

                                        {/* Email (Read-only) */}
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-slate-500" />
                                                Email
                                            </Label>
                                            <p className="text-sm text-slate-900 font-medium py-2 px-3 bg-slate-50 rounded-md">
                                                {user?.email || "Chưa cập nhật"}
                                            </p>
                                        </div>

                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-slate-500" />
                                                Số điện thoại
                                            </Label>
                                            {isEditingProfile ? (
                                                <Input
                                                    id="phone"
                                                    name="phone"
                                                    value={profileForm.phone}
                                                    onChange={handleProfileChange}
                                                    placeholder="Nhập số điện thoại"
                                                />
                                            ) : (
                                                <p className="text-sm text-slate-900 font-medium py-2 px-3 bg-slate-50 rounded-md">
                                                    {user?.phone || "Chưa cập nhật"}
                                                </p>
                                            )}
                                        </div>

                                        {/* Birthday */}
                                        <div className="space-y-2">
                                            <Label htmlFor="birthday" className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-500" />
                                                Ngày sinh
                                            </Label>
                                            {isEditingProfile ? (
                                                <Input
                                                    id="birthday"
                                                    name="birthday"
                                                    type="date"
                                                    value={profileForm.birthday}
                                                    onChange={handleProfileChange}
                                                />
                                            ) : (
                                                <p className="text-sm text-slate-900 font-medium py-2 px-3 bg-slate-50 rounded-md">
                                                    {user?.birthday
                                                        ? new Date(user.birthday).toLocaleDateString("vi-VN")
                                                        : "Chưa cập nhật"}
                                                </p>
                                            )}
                                        </div>

                                        {/* Address */}
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="address" className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-500" />
                                                Địa chỉ
                                            </Label>
                                            {isEditingProfile ? (
                                                <Textarea
                                                    id="address"
                                                    name="address"
                                                    value={profileForm.address}
                                                    onChange={handleProfileChange}
                                                    placeholder="Nhập địa chỉ"
                                                    rows={2}
                                                />
                                            ) : (
                                                <p className="text-sm text-slate-900 font-medium py-2 px-3 bg-slate-50 rounded-md">
                                                    {user?.address || "Chưa cập nhật"}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Vehicles Card */}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="text-xl">Phương tiện của tôi</CardTitle>
                                <CardDescription>
                                    Danh sách phương tiện được cấp phát
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingVehicles ? (
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <Skeleton key={i} className="h-32 w-full" />
                                        ))}
                                    </div>
                                ) : vehiclesData && vehiclesData.length > 0 ? (
                                    <div className="space-y-4">
                                        {vehiclesData.map((vehicle) => (
                                            <div
                                                key={vehicle.vehicleId}
                                                className="border rounded-lg p-4 hover:shadow-md transition"
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Vehicle Image */}
                                                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                                        {vehicle.imageUrl ? (
                                                            <img
                                                                src={vehicle.imageUrl}
                                                                alt={vehicle.model}
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <Car className="w-12 h-12 text-white" />
                                                        )}
                                                    </div>

                                                    {/* Vehicle Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="text-lg font-semibold text-slate-900">
                                                                    {vehicle.model || "Xe điện"}
                                                                </h3>
                                                                <p className="text-sm text-slate-500">
                                                                    {vehicle.licensePlate}
                                                                </p>
                                                            </div>
                                                            <Badge
                                                                className={`${
                                                                    getVehicleStatusBadge(vehicle.status)
                                                                        .className
                                                                } text-white`}
                                                            >
                                                                {
                                                                    getVehicleStatusBadge(vehicle.status)
                                                                        .label
                                                                }
                                                            </Badge>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="w-4 h-4 text-slate-400"/>
                                                                <span className="text-slate-600">
                                                                    VIN: {vehicle.vin}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Battery className="w-4 h-4 text-slate-400"/>
                                                                <span className="text-slate-600">
                                                                    {vehicle.batteryCapacity} kWh
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Zap className="w-4 h-4 text-slate-400"/>
                                                                <span className="text-slate-600">
                                                                    {vehicle.batteryType || "N/A"}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Car className="w-4 h-4 text-slate-400"/>
                                                                <span className="text-slate-600">
                                                                    {vehicle.model || "N/A"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* View Detail Button */}
                                                        <div className="mt-3 pt-3 border-t">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleViewDetail(vehicle.vehicleId)}
                                                                className="w-full cursor-pointer"
                                                            >
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                Xem chi tiết
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                            <Car className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 mb-2">Chưa có phương tiện nào</p>
                                        <p className="text-sm text-slate-400">
                                            Liên hệ quản trị viên để được cấp phát phương tiện
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Vehicle Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={(open) => {
                setIsDetailDialogOpen(open);
                if (!open) setSelectedVehicleId(null);
            }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết phương tiện</DialogTitle>
                        <DialogDescription>Thông tin đầy đủ về phương tiện của bạn</DialogDescription>
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
                                    <Car className="w-24 h-24 text-white" />
                                )}
                            </div>

                            {/* Vehicle Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        VIN
                                    </p>
                                    <p className="font-semibold text-slate-900">{vehicleDetail.vin}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Biển số
                                    </p>
                                    <p className="font-semibold text-slate-900">{vehicleDetail.licensePlate}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <Car className="w-4 h-4" />
                                        Model
                                    </p>
                                    <p className="font-semibold text-slate-900">{vehicleDetail.model || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500">Trạng thái</p>
                                    <Badge className={`${getVehicleStatusBadge(vehicleDetail.status).className} text-white w-fit`}>
                                        {getVehicleStatusBadge(vehicleDetail.status).label}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <Zap className="w-4 h-4" />
                                        Loại pin
                                    </p>
                                    <p className="font-semibold text-slate-900">{vehicleDetail.batteryType || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <Battery className="w-4 h-4" />
                                        Dung lượng pin
                                    </p>
                                    <p className="font-semibold text-slate-900">
                                        {vehicleDetail.batteryCapacity ? `${vehicleDetail.batteryCapacity} kWh` : "—"}
                                    </p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <p className="text-sm text-slate-500">Ghi chú</p>
                                    <p className="font-semibold text-slate-900">{vehicleDetail.notes || "—"}</p>
                                </div>

                                <Separator className="col-span-2" />

                                <div className="space-y-1">
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Ngày tạo
                                    </p>
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
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Cập nhật lần cuối
                                    </p>
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
                        <div className="text-center py-8 text-slate-500 flex flex-col items-center gap-3">
                            <AlertCircle className="w-12 h-12 text-slate-300" />
                            <p>Không tìm thấy thông tin phương tiện</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


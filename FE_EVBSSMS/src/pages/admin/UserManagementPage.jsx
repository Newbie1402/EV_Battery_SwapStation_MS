import { useState } from "react";
import { adminApi } from "@/api/adminApi";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import toast from "react-hot-toast";
import {
    Users,
    Search,
    Filter,
    UserCheck,
    UserX,
    Eye,
    Car,
    Shield, Mail, Phone, IdCardIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Id from "zod/v4/locales/id.js";

export default function UserManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    // Fetch drivers
    const { data: driversData, isLoading: isLoadingDrivers, refetch: refetchDrivers } = useCustomQuery(
        ["drivers"],
        adminApi.getAllDrivers
    );

    // Fetch staff
    const { data: staffData, isLoading: isLoadingStaff, refetch: refetchStaff } = useCustomQuery(
        ["staff"],
        adminApi.getAllStaff
    );

    // Activate user mutation
    const activateMutation = useCustomMutation(
        (userId) => adminApi.activateUser(userId),
        null,
        {
            onSuccess: () => {
                toast.success("Kích hoạt tài khoản thành công!");
                refetchDrivers();
                refetchStaff();
            },
        }
    );

    // Deactivate user mutation
    const deactivateMutation = useCustomMutation(
        (userId) => adminApi.deactivateUser(userId),
        null,
        {
            onSuccess: () => {
                toast.success("Vô hiệu hóa tài khoản thành công!");
                refetchDrivers();
                refetchStaff();
            },
        }
    );

    const getStatusBadge = (status) => {
        const statusMap = {
            ACTIVE: { label: "Hoạt động", className: "bg-green-500" },
            INACTIVE: { label: "Không hoạt động", className: "bg-gray-500" },
            PENDING_VERIFICATION: { label: "Chờ xác thực", className: "bg-orange-500" },
            PENDING_APPROVAL: { label: "Chờ duyệt", className: "bg-blue-500" },
        };
        return statusMap[status] || { label: status, className: "bg-gray-500" };
    };

    const getUserInitials = (fullName) => {
        if (!fullName) return "U";
        const names = fullName.trim().split(" ");
        if (names.length >= 2) {
            return (names[names.length - 1][0] + names[0][0]).toUpperCase();
        }
        return fullName.substring(0, 2).toUpperCase();
    };

    const handleViewDetail = (user) => {
        setSelectedUser(user);
        setIsDetailDialogOpen(true);
    };

    const handleActivate = (userId) => {
        if (confirm("Bạn có chắc chắn muốn kích hoạt tài khoản này?")) {
            activateMutation.mutate(userId);
        }
    };

    const handleDeactivate = (userId) => {
        if (confirm("Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?")) {
            deactivateMutation.mutate(userId);
        }
    };

    const filterUsers = (users) => {
        if (!searchQuery) return users;
        return users.filter(
            (user) =>
                user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.phone?.includes(searchQuery) ||
                user.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const renderUserTable = (users, isLoading) => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                    ))}
                </div>
            );
        }

        const filteredUsers = filterUsers(users || []);

        if (filteredUsers.length === 0) {
            return (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">Không tìm thấy người dùng nào</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <Avatar className="w-16 h-16">
                                    {user.avatar && <AvatarImage src={user.avatar} alt={user.fullName} />}
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-lg">
                                        {getUserInitials(user.fullName)}
                                    </AvatarFallback>
                                </Avatar>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold text-slate-900">
                                            {user.fullName}
                                        </h3>
                                        <Badge className={`${getStatusBadge(user.status).className} text-white`}>
                                            {getStatusBadge(user.status).label}
                                        </Badge>
                                        {user.isVerified && (
                                            <Badge variant="outline" className="text-green-600 border-green-600">
                                                <Shield className="w-3 h-3 mr-1" />
                                                Đã xác thực
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                        <div className={"flex items-center gap-1"}>
                                            <Mail className="w-4 h-4"/>
                                            {user.email}</div>
                                        <div className={"flex items-center gap-1"}>
                                            <Phone className="w-4 h-4"/>
                                            {user.phone}</div>
                                        <div className={"flex items-center gap-1"}>
                                            <IdCardIcon className="w-4 h-4 mr-1" />
                                            {user.employeeId}</div>
                                        {user.vehicles && user.vehicles.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                <Car className="w-4 h-4" />
                                                {user.vehicles.length} phương tiện
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewDetail(user)}
                                        className="cursor-pointer"
                                    >
                                        <Eye className="w-4 h-4 mr-1" />
                                        Chi tiết
                                    </Button>
                                    {user.status === 'ACTIVE' ? (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeactivate(user.id)}
                                        >
                                            <UserX className="w-4 h-4 mr-1" />
                                            Vô hiệu hóa
                                        </Button>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => handleActivate(user.id)}
                                        >
                                            <UserCheck className="w-4 h-4 mr-1" />
                                            Kích hoạt
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý người dùng</h1>
                <p className="text-slate-600">Quản lý tài xế và nhân viên trong hệ thống</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Tổng tài xế</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {driversData?.length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <Shield className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Tổng nhân viên</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {staffData?.length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Đang hoạt động</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {[...(driversData || []), ...(staffData|| [])].filter(
                                        (u) => u.isActive
                                    ).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <UserX className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Chờ xác thực</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {[...(driversData || []), ...(staffData || [])].filter(
                                        (u) => u.status === "PENDING_VERIFICATION"
                                    ).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filter */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <Input
                                placeholder="Tìm kiếm theo tên, email, số điện thoại, mã nhân viên..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Lọc
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* User Tables */}
            <Tabs defaultValue="drivers" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="drivers">Tài xế</TabsTrigger>
                    <TabsTrigger value="staff">Nhân viên</TabsTrigger>
                </TabsList>

                <TabsContent value="drivers">
                    {renderUserTable(driversData, isLoadingDrivers)}
                </TabsContent>

                <TabsContent value="staff">
                    {renderUserTable(staffData, isLoadingStaff)}
                </TabsContent>
            </Tabs>

            {/* User Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chi tiết người dùng</DialogTitle>
                        <DialogDescription>Thông tin chi tiết về người dùng</DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="space-y-6">
                            {/* Avatar & Basic Info */}
                            <div className="flex items-center gap-4">
                                <Avatar className="w-24 h-24">
                                    {selectedUser.avatar && (
                                        <AvatarImage src={selectedUser.avatar} alt={selectedUser.fullName} />
                                    )}
                                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-2xl">
                                        {getUserInitials(selectedUser.fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedUser.fullName}</h3>
                                    <p className="text-slate-500">{selectedUser.email}</p>
                                    <div className="flex gap-2 mt-2">
                                        <Badge className={`${getStatusBadge(selectedUser.status).className} text-white`}>
                                            {getStatusBadge(selectedUser.status).label}
                                        </Badge>
                                        <Badge variant="outline">{selectedUser.role}</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Số điện thoại</p>
                                    <p className="font-semibold text-slate-900">{selectedUser.phone}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Ngày sinh</p>
                                    <p className="font-semibold text-slate-900">
                                        {selectedUser.birthday
                                            ? new Date(selectedUser.birthday).toLocaleDateString("vi-VN")
                                            : "Chưa cập nhật"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500">CCCD</p>
                                    <p className="font-semibold text-slate-900">{selectedUser.identityCard}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Mã nhân viên</p>
                                    <p className="font-semibold text-slate-900">{selectedUser.employeeId}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-slate-500">Địa chỉ</p>
                                    <p className="font-semibold text-slate-900">
                                        {selectedUser.address || "Chưa cập nhật"}
                                    </p>
                                </div>
                            </div>

                            {/* Vehicles */}
                            {selectedUser.vehicles && selectedUser.vehicles.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <Car className="w-5 h-5" />
                                        Phương tiện ({selectedUser.vehicles.length})
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedUser.vehicles.map((vehicle) => (
                                            <div
                                                key={vehicle.vehicleId}
                                                className="p-3 border rounded-lg space-y-1"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold">{vehicle.model || "Xe điện"}</p>
                                                    <Badge>{vehicle.status}</Badge>
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    Biển số: {vehicle.licensePlate}
                                                </p>
                                                <p className="text-sm text-slate-600">VIN: {vehicle.vin}</p>
                                                {vehicle.batteryCapacity && (
                                                    <p className="text-sm text-slate-600">
                                                        Pin: {vehicle.batteryCapacity} kWh
                                                    </p>
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
        </div>
    );
}


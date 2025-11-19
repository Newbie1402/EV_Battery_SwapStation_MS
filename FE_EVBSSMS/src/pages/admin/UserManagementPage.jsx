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
    Shield, Mail, Phone, IdCardIcon, UserPlus, ShieldCheck, ShieldX
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import UserDetailDialog from "@/components/UserDetailDialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export default function UserManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [confirmState, setConfirmState] = useState({ action: null, userId: null });
    // State cho tab đăng ký chờ duyệt
    const [registrationRoleFilter, setRegistrationRoleFilter] = useState("ALL");
    const [rejectDialog, setRejectDialog] = useState({ open: false, userId: null, reason: "" });
    const [approveTarget, setApproveTarget] = useState(null);

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

    // Fetch pending registrations
    const { data: pendingRegistrationsData, isLoading: isLoadingPending, refetch: refetchPending } = useCustomQuery(
        ["pendingRegistrations", registrationRoleFilter],
        () => adminApi.getPendingRegistrations(registrationRoleFilter === "ALL" ? undefined : registrationRoleFilter)
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

    // Approve/Reject registration mutation
    const approveMutation = useCustomMutation(
        (payload) => adminApi.approveRegistration(payload),
        null,
        {
            onSuccess: () => {
                toast.success("Đã xử lý đăng ký!");
                setApproveTarget(null);
                setRejectDialog({ open: false, userId: null, reason: "" });
                refetchPending();
            },
        }
    );

    const openConfirm = (action, userId) => setConfirmState({ action, userId });
    const closeConfirm = () => setConfirmState({ action: null, userId: null });

    const executeConfirm = () => {
        if (!confirmState.userId || !confirmState.action) return;
        switch (confirmState.action) {
            case "activate":
                activateMutation.mutate(confirmState.userId);
                break;
            case "deactivate":
                deactivateMutation.mutate(confirmState.userId);
                break;
            default:
                break;
        }
        closeConfirm();
    };

    const isPendingConfirm = confirmState.action === "activate" ? activateMutation.isPending : confirmState.action === "deactivate" ? deactivateMutation.isPending : false;

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
        openConfirm("activate", userId);
    };

    const handleDeactivate = (userId) => {
        openConfirm("deactivate", userId);
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
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
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

    // Helper: render danh sách đăng ký chờ duyệt
    const renderPendingRegistrations = () => {
        const regs = pendingRegistrationsData || [];
        const filtered = !searchQuery ? regs : regs.filter(r => {
            const q = searchQuery.toLowerCase();
            return (r.fullName || "").toLowerCase().includes(q)
                || (r.email || "").toLowerCase().includes(q)
                || (r.identityCard || "").toLowerCase().includes(q);
        });

        if (isLoadingPending) {
            return (
                <div className="space-y-4">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
                </div>
            );
        }

        if (filtered.length === 0) {
            return (
                <Card>
                    <CardContent className="py-12 text-center">
                        <UserPlus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">Không có đăng ký nào đang chờ phê duyệt</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-4">
                {filtered.map(reg => (
                    <Card key={reg.id || reg.userId} className="hover:shadow-md transition">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-semibold text-slate-900">{reg.fullName || reg.email || "Người dùng"}</h3>
                                    <p className="text-sm text-slate-600">{reg.email}</p>
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="outline" className="border-slate-300">{reg.role}</Badge>
                                        {reg.identityCard && <Badge variant="outline" className="border-emerald-300">CCCD: {reg.identityCard}</Badge>}
                                        <Badge className="bg-blue-500 text-white">Chờ phê duyệt</Badge>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                        disabled={approveMutation.isPending && approveTarget === (reg.id || reg.userId)}
                                        onClick={() => { setApproveTarget(reg.id || reg.userId); approveMutation.mutate({ userId: reg.id || reg.userId, approved: true }); }}
                                    >
                                        {approveMutation.isPending && approveTarget === (reg.id || reg.userId) ? "Đang xử lý..." : <><ShieldCheck className="w-4 h-4 mr-1" /> Duyệt</>}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 cursor-pointer"
                                        disabled={approveMutation.isPending}
                                        onClick={() => setRejectDialog({ open: true, userId: reg.id || reg.userId, reason: "" })}
                                    >
                                        <ShieldX className="w-4 h-4 mr-1" /> Từ chối
                                    </Button>
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
                <CardContent className="pt-3">
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
                <TabsList className="grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="drivers" className={"cursor-pointer"}>Tài xế</TabsTrigger>
                    <TabsTrigger value="staff" className={"cursor-pointer"}>Nhân viên</TabsTrigger>
                    <TabsTrigger value="registrations" className={"cursor-pointer"}>Đăng ký chờ duyệt</TabsTrigger>
                </TabsList>

                <TabsContent value="drivers">
                    {renderUserTable(driversData, isLoadingDrivers)}
                </TabsContent>

                <TabsContent value="staff">
                    {renderUserTable(staffData, isLoadingStaff)}
                </TabsContent>

                <TabsContent value="registrations">
                    <div className="space-y-4">
                        {/* Bộ lọc vai trò cho pending */}
                        <Tabs value={registrationRoleFilter} onValueChange={setRegistrationRoleFilter} className="w-full">
                            <TabsList className="grid grid-cols-3 w-full max-w-md">
                                <TabsTrigger value="ALL" className="cursor-pointer">Tất cả</TabsTrigger>
                                <TabsTrigger value="DRIVER" className="cursor-pointer">Tài xế</TabsTrigger>
                                <TabsTrigger value="STAFF" className="cursor-pointer">Nhân viên</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        {renderPendingRegistrations()}
                    </div>
                </TabsContent>
            </Tabs>

            {/* User Detail Dialog */}
            <UserDetailDialog
                open={isDetailDialogOpen}
                onOpenChange={setIsDetailDialogOpen}
                user={selectedUser}
                getStatusBadge={getStatusBadge}
                getUserInitials={getUserInitials}
            />

            {/* AlertDialog xác nhận kích hoạt / vô hiệu hóa */}
            <AlertDialog open={!!confirmState.action} onOpenChange={(open) => { if (!open) closeConfirm(); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmState.action === "activate" && "Xác nhận kích hoạt tài khoản"}
                            {confirmState.action === "deactivate" && "Xác nhận vô hiệu hóa tài khoản"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmState.action === "activate" && "Bạn có chắc chắn muốn kích hoạt tài khoản này?"}
                            {confirmState.action === "deactivate" && "Bạn có chắc chắn muốn vô hiệu hóa tài khoản này? Người dùng sẽ không thể đăng nhập."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeConfirm} className="cursor-pointer">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={executeConfirm} disabled={isPendingConfirm} className="bg-red-600 hover:bg-red-700 cursor-pointer">
                            {isPendingConfirm ? "Đang xử lý..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* AlertDialog từ chối đăng ký */}
            <AlertDialog open={rejectDialog.open} onOpenChange={(open) => { if (!open) setRejectDialog({ open: false, userId: null, reason: "" }); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Từ chối đăng ký</AlertDialogTitle>
                        <AlertDialogDescription>Nhập lý do từ chối để gửi thông báo tới người dùng.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Input
                            placeholder="Lý do từ chối"
                            value={rejectDialog.reason}
                            onChange={(e) => setRejectDialog(r => ({ ...r, reason: e.target.value }))}
                            disabled={approveMutation.isPending}
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer" disabled={approveMutation.isPending}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 cursor-pointer"
                            disabled={approveMutation.isPending}
                            onClick={() => {
                                if (!rejectDialog.reason.trim()) {
                                    toast.error("Vui lòng nhập lý do từ chối!");
                                    return;
                                }
                                approveMutation.mutate({ userId: rejectDialog.userId, approved: false, rejectionReason: rejectDialog.reason.trim() });
                            }}
                        >
                            {approveMutation.isPending ? "Đang xử lý..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

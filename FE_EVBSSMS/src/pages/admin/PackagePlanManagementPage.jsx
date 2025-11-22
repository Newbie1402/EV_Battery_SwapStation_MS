import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Plus, Search, Edit, Trash2, DollarSign, Calendar, Zap, CheckCircle, XCircle, Users } from "lucide-react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { packagePlanApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/utils/format";

export default function PackagePlanManagementPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        maxSwapPerMonth: "",
        packageType: "MONTHLY",
    });

    // Fetch danh sách package plans
    const { data: plansWrapper, isLoading, refetch } = useCustomQuery(
        ["admin-package-plans"],
        () => packagePlanApi.getAllPackagePlans()
    );

    const plansData = plansWrapper?.data || plansWrapper || [];
    const plans = Array.isArray(plansData) ? plansData : [];

    // Filter plans
    const filteredPlans = plans.filter(plan =>
        plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create mutation
    const createMutation = useCustomMutation(
        (data) => packagePlanApi.createPackagePlan(data),
        "POST",
        {
            onSuccess: () => {
                toast.success("Tạo gói dịch vụ thành công!");
                setIsCreateDialogOpen(false);
                resetForm();
                refetch();
            },
            onError: () => {
                toast.error("Không thể tạo gói dịch vụ. Vui lòng thử lại.");
            },
        }
    );

    // Update mutation
    const updateMutation = useCustomMutation(
        ({ id, data }) => packagePlanApi.updatePackagePlan(id, data),
        "PUT",
        {
            onSuccess: () => {
                toast.success("Cập nhật gói dịch vụ thành công!");
                setIsEditDialogOpen(false);
                setSelectedPlan(null);
                resetForm();
                refetch();
            },
            onError: () => {
                toast.error("Không thể cập nhật gói dịch vụ. Vui lòng thử lại.");
            },
        }
    );

    // Delete mutation
    const deleteMutation = useCustomMutation(
        (id) => packagePlanApi.deletePackagePlan(id),
        "DELETE",
        {
            onSuccess: () => {
                toast.success("Xóa gói dịch vụ thành công!");
                setIsDeleteDialogOpen(false);
                setSelectedPlan(null);
                refetch();
            },
            onError: () => {
                toast.error("Không thể xóa gói dịch vụ. Vui lòng thử lại.");
            },
        }
    );

    // Activate mutation (chuyển status từ INACTIVE sang ACTIVE)
    const activateMutation = useCustomMutation(
        (id) => packagePlanApi.activePackagePlan(id),
        "PATCH",
        {
            onSuccess: () => {
                toast.success("Kích hoạt gói dịch vụ thành công!");
                refetch();
            },
            onError: () => {
                toast.error("Không thể kích hoạt gói dịch vụ. Vui lòng thử lại.");
            },
        }
    );

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            maxSwapPerMonth: "",
            packageType: "MONTHLY",
        });
    };

    const handleCreate = () => {
        if (!formData.name || !formData.price || !formData.maxSwapPerMonth || !formData.packageType) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
            return;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            maxSwapPerMonth: parseInt(formData.maxSwapPerMonth),
            packageType: formData.packageType,
        };

        createMutation.mutate(payload);
    };

    const handleEdit = (plan) => {
        setSelectedPlan(plan);
        setFormData({
            name: plan.name || "",
            description: plan.description || "",
            price: plan.price?.toString() || "",
            maxSwapPerMonth: plan.maxSwapPerMonth?.toString() || "",
            packageType: plan.packageType || "MONTHLY",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!formData.name || !formData.price || !formData.maxSwapPerMonth || !formData.packageType) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
            return;
        }

        const payload = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            maxSwapPerMonth: parseInt(formData.maxSwapPerMonth),
            packageType: formData.packageType,
        };

        updateMutation.mutate({ id: selectedPlan.id, data: payload });
    };

    const handleDelete = (plan) => {
        setSelectedPlan(plan);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedPlan) {
            deleteMutation.mutate(selectedPlan.id);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            ACTIVE: {
                label: "Hoạt động",
                color: "bg-green-100 text-green-700",
                icon: CheckCircle
            },
            INACTIVE: {
                label: "Ngừng hoạt động",
                color: "bg-red-100 text-red-700",
                icon: XCircle
            },
        };
        return statusMap[status] || {
            label: status,
            color: "bg-gray-100 text-gray-700",
            icon: CheckCircle
        };
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleActivate = (plan) => {
        // Gọi API activePackagePlan với chỉ ID
        activateMutation.mutate(plan.id);
    };

    // Statistics
    const activeCount = plans.filter(p => p.status === "ACTIVE").length;
    const inactiveCount = plans.filter(p => p.status === "INACTIVE").length;

    return (
        <div className="w-full min-h-screen bg-white text-gray-900">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                                    <span className="text-[#135bec]">
                                        Quản lý gói dịch vụ
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Tổng số: <span className="font-semibold text-gray-800">{plans.length} gói</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-green-600">{activeCount} hoạt động</span>
                                    <span className="mx-2">•</span>
                                    <span className="text-red-600">{inactiveCount} ngừng</span>
                                </p>
                            </div>
                            <Button
                                onClick={() => {
                                    resetForm();
                                    setIsCreateDialogOpen(true);
                                }}
                                className="bg-[#135bec] hover:bg-[#135bec]/90 text-white cursor-pointer"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Thêm gói mới
                            </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Tìm kiếm theo tên gói hoặc mô tả..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 py-6 text-lg border-gray-300 focus:border-[#135bec] focus:ring-[#135bec]"
                            />
                        </div>
                    </div>

                    {/* Plans Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, idx) => (
                                <Card key={idx} className="border border-gray-200">
                                    <CardHeader className="space-y-2">
                                        <div className="h-6 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <Card className="border border-gray-200">
                            <CardContent className="p-12 text-center">
                                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 text-lg">
                                    {searchQuery ? "Không tìm thấy gói dịch vụ nào" : "Chưa có gói dịch vụ nào"}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPlans.map((plan) => {
                                const statusInfo = getStatusBadge(plan.status);
                                const StatusIcon = statusInfo.icon;
                                const isInactive = plan.status === "INACTIVE";

                                return (
                                    <div key={plan.id}>
                                        <Card className={`border hover:shadow-xl transition-all h-full flex flex-col ${
                                            isInactive 
                                                ? "border-gray-300 bg-gray-50 opacity-75" 
                                                : "border-gray-200 bg-white"
                                        }`}>
                                            <CardHeader>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <CardTitle className={`text-2xl mb-1 flex items-center gap-2 ${
                                                            isInactive ? "text-gray-500" : "text-black"
                                                        }`}>
                                                            <Package className={`w-6 h-6 ${
                                                                isInactive ? "text-gray-400" : "text-[#135bec]"
                                                            }`} />
                                                            {plan.name}
                                                            {isInactive && (
                                                                <span className="text-xs font-normal text-red-500 ml-2">(Đã vô hiệu hóa)</span>
                                                            )}
                                                        </CardTitle>
                                                    </div>
                                                    <Badge className={`font-medium ${statusInfo.color} flex items-center gap-1`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusInfo.label}
                                                    </Badge>
                                                </div>
                                                <CardDescription className={`text-sm min-h-[40px] ${
                                                    isInactive ? "text-gray-400" : "text-gray-600"
                                                }`}>
                                                    {plan.description || "Không có mô tả"}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4 flex-1">
                                                <div className={`rounded-lg p-4 ${
                                                    isInactive 
                                                        ? "bg-gray-100" 
                                                        : "bg-gradient-to-r from-emerald-50 to-cyan-50"
                                                }`}>
                                                    <div className={`flex items-center gap-2 text-3xl font-bold ${
                                                        isInactive ? "text-gray-500" : "text-emerald-700"
                                                    }`}>
                                                        <DollarSign className="w-8 h-8" />
                                                        {formatCurrency(plan.price)}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className={`flex items-center gap-2 text-sm ${
                                                        isInactive ? "text-gray-400" : "text-gray-600"
                                                    }`}>
                                                        <Zap className={`w-4 h-4 ${
                                                            isInactive ? "text-gray-400" : "text-amber-500"
                                                        }`} />
                                                        <div>
                                                            <p className={`font-semibold ${
                                                                isInactive ? "text-gray-500" : "text-gray-900"
                                                            }`}>{plan.maxSwapPerMonth}</p>
                                                            <p className="text-xs">lần/tháng</p>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-2 text-sm ${
                                                        isInactive ? "text-gray-400" : "text-gray-600"
                                                    }`}>
                                                        <Calendar className={`w-4 h-4 ${
                                                            isInactive ? "text-gray-400" : "text-blue-500"
                                                        }`} />
                                                        <div>
                                                            <p className={`font-semibold ${
                                                                isInactive ? "text-gray-500" : "text-gray-900"
                                                            }`}>{plan.packageType}</p>
                                                            <p className="text-xs">loại gói</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardContent className="pt-0 space-y-2">
                                                <Button
                                                    variant="outline"
                                                    className="w-full bg-blue-50 hover:bg-blue-100 border-blue-200 cursor-pointer"
                                                    onClick={() => navigate(`/admin/packages/${plan.id}/subscriptions`)}
                                                >
                                                    <Users className="w-4 h-4 mr-2" />
                                                    Xem người dùng đăng ký
                                                </Button>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 cursor-pointer"
                                                        onClick={() => handleEdit(plan)}
                                                        disabled={isInactive}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Sửa
                                                    </Button>
                                                    {isInactive ? (
                                                        <Button
                                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                                                            onClick={() => handleActivate(plan)}
                                                            disabled={activateMutation.isPending}
                                                        >
                                                            <CheckCircle className="w-4 h-4 mr-2" />
                                                            {activateMutation.isPending ? "Đang kích hoạt..." : "Kích hoạt"}
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="destructive"
                                                            className="flex-1 cursor-pointer"
                                                            onClick={() => handleDelete(plan)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Vô hiệu hóa
                                                        </Button>
                                                    )}
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

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-black">Thêm gói dịch vụ mới</DialogTitle>
                        <DialogDescription>
                            Điền thông tin chi tiết cho gói dịch vụ mới
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="packageName">Tên gói *</Label>
                            <Input
                                id="packageName"
                                value={formData.name}
                                onChange={(e) => handleFormChange("name", e.target.value)}
                                placeholder="Gói Cơ Bản"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleFormChange("description", e.target.value)}
                                placeholder="Mô tả chi tiết về gói dịch vụ..."
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Giá (đ) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleFormChange("price", e.target.value)}
                                    placeholder="200000"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="maxSwapPerMonth">Số lần đổi trong tháng *</Label>
                                <Input
                                    id="maxSwapPerMonth"
                                    type="number"
                                    value={formData.maxSwapPerMonth}
                                    onChange={(e) => handleFormChange("maxSwapPerMonth", e.target.value)}
                                    placeholder="10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="packageType">Loại gói *</Label>
                                <Select value={formData.packageType} onValueChange={(value) => handleFormChange("packageType", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONTHLY">Theo tháng</SelectItem>
                                        <SelectItem value="YEARLY">Theo năm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                            className="bg-[#135bec] hover:bg-[#135bec]/90 cursor-pointer"
                        >
                            {createMutation.isPending ? "Đang tạo..." : "Tạo gói"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-black">Chỉnh sửa gói dịch vụ</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin cho gói: {selectedPlan?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-packageName">Tên gói *</Label>
                            <Input
                                id="edit-packageName"
                                value={formData.name}
                                onChange={(e) => handleFormChange("name", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Mô tả</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => handleFormChange("description", e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-price">Giá (đ) *</Label>
                                <Input
                                    id="edit-price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleFormChange("price", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-maxSwapPerMonth">Số lần đổi trong tháng *</Label>
                                <Input
                                    id="edit-maxSwapPerMonth"
                                    type="number"
                                    value={formData.maxSwapPerMonth}
                                    onChange={(e) => handleFormChange("maxSwapPerMonth", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-packageType">Loại gói *</Label>
                                <Select value={formData.packageType} onValueChange={(value) => handleFormChange("packageType", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONTHLY">Theo tháng</SelectItem>
                                        <SelectItem value="YEARLY">Theo năm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={updateMutation.isPending}
                            className="bg-[#135bec] hover:bg-[#135bec]/90 cursor-pointer"
                        >
                            {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận vô hiệu hóa gói dịch vụ</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn vô hiệu hóa gói <strong>{selectedPlan?.name}</strong>?
                            Hành động này sẽ chuyển trạng thái gói sang INACTIVE.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700 cursor-pointer"
                        >
                            {deleteMutation.isPending ? "Đang vô hiệu hóa..." : "vô hiệu hóa gói"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
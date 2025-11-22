import { useState } from "react";
import { adminApi, batteriesApi } from "@/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import toast from "react-hot-toast";
import {
    Car,
    Search,
    Plus,
    Edit,
    Trash2,
    Upload,
    UserPlus,
    UserMinus,
    Battery,
    Eye, User2, BatteryIcon, Zap
} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import VehicleDetailDialog from "@/components/VehicleDetailDialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export default function VehicleManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [formData, setFormData] = useState({
        vin: "",
        model: "",
        licensePlate: "",
        batteryType: "",
        batteryCapacity: "",
        notes: "",
        employeeId: "",
        status: "ACTIVE",
    });
    const [confirmState, setConfirmState] = useState({ action: null, vehicleId: null });

    // Fetch all vehicles
    const { data: vehiclesData, isLoading, refetch } = useCustomQuery(
        ["vehicles"],
        adminApi.getAllVehicles
    );

    // Fetch drivers for assignment
    const { data: driversData } = useCustomQuery(["drivers"], adminApi.getAllDrivers);

    const createBatteryMutation = useCustomMutation(
        (data) => batteriesApi.createBattery(data),
        null,
        {
            onSuccess: () => {
                toast.success("Đã khởi tạo pin cho xe mới!");
            },
            onError: (err) => {
                console.error("Lỗi tạo pin:", err);
                toast.error("Tạo xe thành công nhưng lỗi khi tạo pin!");
            }
        }
    );

    // Create vehicle mutation
    const createMutation = useCustomMutation(
        (data) => adminApi.createVehicle(data),
        null,
        {
            onSuccess: (response) => {
                const newVehicleId = response?.vehicleId || response?.data?.vehicleId;
                if (newVehicleId && formData.batteryType && formData.batteryCapacity) {
                    createBatteryMutation.mutate({
                        model: formData.batteryType,
                        capacity: parseFloat(formData.batteryCapacity),
                        soh: 100,
                        soc: 100,
                        status: "IN_CAR",
                        ownerType: "VEHICLE",
                        referenceId: newVehicleId
                    });
                }

                toast.success("Thêm phương tiện thành công!");
                setIsCreateDialogOpen(false);
                resetForm();
                refetch();
            },
        }
    );

    // Update vehicle mutation
    const updateMutation = useCustomMutation(
        ({ vehicleId, data }) => adminApi.updateVehicle(vehicleId, data),
        null,
        {
            onSuccess: () => {
                toast.success("Cập nhật phương tiện thành công!");
                setIsEditDialogOpen(false);
                resetForm();
                refetch();
            },
        }
    );

    // Revoke vehicle mutation
    const revokeMutation = useCustomMutation(
        (vehicleId) => adminApi.revokeVehicle(vehicleId),
        null,
        {
            onSuccess: () => {
                toast.success("Thu hồi phương tiện thành công!");
                refetch();
            },
        }
    );

    // Delete vehicle mutation
    const deleteMutation = useCustomMutation(
        (vehicleId) => adminApi.deleteVehicle(vehicleId),
        null,
        {
            onSuccess: () => {
                toast.success("Xóa phương tiện thành công!");
                refetch();
            },
        }
    );

    // Upload vehicle image mutation
    const uploadImageMutation = useCustomMutation(
        ({ vehicleId, file }) => adminApi.uploadVehicleImage(vehicleId, file),
        null,
        {
            onSuccess: () => {
                toast.success("Upload ảnh thành công!");
                refetch();
            },
        }
    );

    // Delete vehicle image mutation
    const deleteImageMutation = useCustomMutation(
        (vehicleId) => adminApi.deleteVehicleImage(vehicleId),
        null,
        {
            onSuccess: () => {
                toast.success("Xóa ảnh thành công!");
                refetch();
            },
        }
    );

    const resetForm = () => {
        setFormData({
            vin: "",
            model: "",
            licensePlate: "",
            batteryType: "",
            batteryCapacity: "",
            notes: "",
            employeeId: "",
            status: "ACTIVE",
        });
        setSelectedVehicle(null);
    };

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleCreate = () => {
        if (!formData.vin || !formData.licensePlate) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
            return;
        }

        // 2. THÊM MỚI: Validate độ dài VIN (phải đủ 17 ký tự)
        if (formData.vin.trim().length !== 17) {
            toast.error("Số VIN phải bao gồm đúng 17 ký tự!");
            return;
        }

        createMutation.mutate({
            vin: formData.vin,
            model: formData.model,
            licensePlate: formData.licensePlate,
            batteryType: formData.batteryType || null,
            batteryCapacity: formData.batteryCapacity ? parseFloat(formData.batteryCapacity) : null,
            notes: formData.notes || null,
        });
    };

    const handleEdit = (vehicle) => {
        setSelectedVehicle(vehicle);
        setFormData({
            vin: vehicle.vin,
            model: vehicle.model || "",
            licensePlate: vehicle.licensePlate,
            batteryType: vehicle.batteryType || "",
            batteryCapacity: vehicle.batteryCapacity || "",
            notes: vehicle.notes || "",
            employeeId: vehicle.employeeId || "",
            status: vehicle.status,
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!formData.licensePlate) {
            toast.error("Vui lòng điền biển số xe!");
            return;
        }

        updateMutation.mutate({
            vehicleId: selectedVehicle.vehicleId,
            data: {
                employeeId: formData.employeeId || null,
                model: formData.model,
                licensePlate: formData.licensePlate,
                batteryType: formData.batteryType || null,
                batteryCapacity: formData.batteryCapacity ? parseFloat(formData.batteryCapacity) : null,
                status: formData.status,
            },
        });
    };

    const openConfirm = (action, vehicleId) => setConfirmState({ action, vehicleId });
    const closeConfirm = () => setConfirmState({ action: null, vehicleId: null });

    const executeConfirm = () => {
        if (!confirmState.vehicleId || !confirmState.action) return;
        switch (confirmState.action) {
            case "revoke":
                revokeMutation.mutate(confirmState.vehicleId);
                break;
            case "delete":
                deleteMutation.mutate(confirmState.vehicleId);
                break;
            case "deleteImage":
                deleteImageMutation.mutate(confirmState.vehicleId);
                break;
            default:
                break;
        }
        closeConfirm();
    };

    const isPendingConfirm =
        confirmState.action === "revoke" ? revokeMutation.isPending :
            confirmState.action === "delete" ? deleteMutation.isPending :
                confirmState.action === "deleteImage" ? deleteImageMutation.isPending : false;

    const handleRevoke = (vehicleId) => {
        openConfirm("revoke", vehicleId);
    };

    const handleDelete = (vehicleId) => {
        openConfirm("delete", vehicleId);
    };

    const handleUploadImage = (vehicleId, event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Kiểm tra định dạng file
        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            toast.error("Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)!");
            return;
        }

        // Kiểm tra kích thước file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước file không được vượt quá 5MB!");
            return;
        }

        uploadImageMutation.mutate({ vehicleId, file });
    };

    const handleDeleteImage = (vehicleId) => {
        openConfirm("deleteImage", vehicleId);
    };

    const handleViewDetail = (vehicle) => {
        setSelectedVehicleId(vehicle.vehicleId);
        setIsDetailDialogOpen(true);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            ACTIVE: { label: "Hoạt động", className: "bg-green-500" },
            INACTIVE: { label: "Không hoạt động", className: "bg-gray-500" },
            MAINTENANCE: { label: "Bảo trì", className: "bg-yellow-500" },
        };
        return statusMap[status] || { label: status, className: "bg-gray-500" };
    };

    const filterVehicles = (vehicles) => {
        if (!searchQuery) return vehicles;
        return vehicles.filter(
            (v) =>
                v.vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.licensePlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.driverName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredVehicles = filterVehicles(vehiclesData || []);
    const assignedVehicles = filteredVehicles.filter((v) => v.employeeId);
    const unassignedVehicles = filteredVehicles.filter((v) => !v.employeeId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý phương tiện</h1>
                    <p className="text-slate-600">Quản lý phương tiện và cấp phát cho tài xế</p>
                </div>
                <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-[#135bec] hover:bg-[#135bec]/90 gap-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Thêm phương tiện
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Car className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Tổng phương tiện</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {vehiclesData?.length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Đã cấp phát</p>
                                <p className="text-2xl font-bold text-slate-900">{assignedVehicles.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <UserMinus className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Chưa cấp phát</p>
                                <p className="text-2xl font-bold text-slate-900">{unassignedVehicles.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <Battery className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Bảo trì</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {vehiclesData?.filter((v) => v.status === "MAINTENANCE").length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="pt-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm theo VIN, biển số, model, tài xế..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Vehicles Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-64 w-full" />
                    ))}
                </div>
            ) : filteredVehicles.length === 0 ? (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Car className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">Không tìm thấy phương tiện nào</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                        <Card key={vehicle.vehicleId} className="hover:shadow-lg transition">
                            <CardContent className="p-6">
                                {/* Vehicle Image */}
                                <div className="relative w-full h-40 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center mb-4 group">
                                    {vehicle.imageUrl ? (
                                        <>
                                            <img
                                                src={vehicle.imageUrl}
                                                alt={vehicle.model}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            {/* Delete Image Button */}
                                            <button
                                                onClick={() => handleDeleteImage(vehicle.vehicleId)}
                                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                title="Xóa ảnh"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <Car className="w-16 h-16 text-white" />
                                    )}
                                    {/* Upload Image Button */}
                                    <label
                                        htmlFor={`upload-${vehicle.vehicleId}`}
                                        className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Upload ảnh"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <input
                                            id={`upload-${vehicle.vehicleId}`}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleUploadImage(vehicle.vehicleId, e)}
                                        />
                                    </label>
                                </div>

                                {/* Vehicle Info */}
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900">
                                                {vehicle.model || "Xe điện"}
                                            </h3>
                                            <p className="text-sm text-slate-500">{vehicle.licensePlate}</p>
                                        </div>
                                        <Badge className={`${getStatusBadge(vehicle.status).className} text-white`}>
                                            {getStatusBadge(vehicle.status).label}
                                        </Badge>
                                    </div>

                                    <div className="space-y-1 text-sm text-slate-600">
                                        <p>VIN: {vehicle.vin}</p>
                                        {vehicle.batteryCapacity &&
                                            <p>
                                                <BatteryIcon className="w-4 h-4 inline-block mr-1" />
                                                {vehicle.batteryCapacity} kWh</p>}
                                        {vehicle.batteryType &&
                                            <p>
                                                <Zap className="w-4 h-4 inline-block mr-1" />
                                                {vehicle.batteryType}</p>}
                                        {vehicle.driverName && (
                                            <p className="text-emerald-600 font-medium">
                                                <User2 className="w-4 h-4 inline-block mr-1" />
                                                {vehicle.driverName}
                                            </p>
                                        )}
                                    </div>

                                    {vehicle.notes && (
                                        <p className="text-xs text-slate-500 italic">{vehicle.notes}</p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-3 border-t">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewDetail(vehicle)}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Chi tiết
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(vehicle)}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            Sửa
                                        </Button>
                                        {vehicle.employeeId && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleRevoke(vehicle.vehicleId)}
                                                className="text-orange-600 cursor-pointer"
                                            >
                                                <UserMinus className="w-4 h-4 mr-1" />
                                                Thu hồi
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleDelete(vehicle.vehicleId)}
                                            className="text-red-600 cursor-pointer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Thêm phương tiện mới</DialogTitle>
                        <DialogDescription>Nhập thông tin phương tiện</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="vin">VIN <span className="text-red-500">*</span></Label>
                            <Input
                                id="vin"
                                value={formData.vin}
                                onChange={(e) => handleChange("vin", e.target.value)}
                                placeholder="Nhập VIN"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="licensePlate">Biển số <span className="text-red-500">*</span></Label>
                            <Input
                                id="licensePlate"
                                value={formData.licensePlate}
                                onChange={(e) => handleChange("licensePlate", e.target.value)}
                                placeholder="77QH1123"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model">Model xe</Label>
                            <Input
                                id="model"
                                value={formData.model}
                                onChange={(e) => handleChange("model", e.target.value)}
                                placeholder="VinFast VF e34"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="batteryType">Loại pin</Label>
                            <Input
                                id="batteryType"
                                value={formData.batteryType}
                                onChange={(e) => handleChange("batteryType", e.target.value)}
                                placeholder="LFP"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="batteryCapacity">Dung lượng pin (kWh)</Label>
                            <Input
                                id="batteryCapacity"
                                type="number"
                                step="0.1"
                                value={formData.batteryCapacity}
                                onChange={(e) => handleChange("batteryCapacity", e.target.value)}
                                placeholder="42.0"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="notes">Ghi chú</Label>
                            <Input
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => handleChange("notes", e.target.value)}
                                placeholder="Thông tin bổ sung..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className={"cursor-pointer"}
                            variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleCreate} disabled={createMutation.isPending}>
                            {createMutation.isPending ? "Đang xử lý..." : "Thêm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Cập nhật phương tiện</DialogTitle>
                        <DialogDescription>Chỉnh sửa thông tin và cấp phát cho tài xế</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label htmlFor="driver">Cấp phát cho tài xế</Label>
                            <Select
                                value={formData.employeeId || "UNASSIGNED"}
                                onValueChange={(v) => handleChange("employeeId", v === "UNASSIGNED" ? "" : v)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn tài xế" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="UNASSIGNED">Không cấp phát</SelectItem>
                                    {driversData?.map((driver) => (
                                        <SelectItem key={driver.employeeId} value={driver.employeeId}>
                                            {driver.fullName} ({driver.employeeId})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-licensePlate">Biển số</Label>
                            <Input
                                id="edit-licensePlate"
                                value={formData.licensePlate}
                                onChange={(e) => handleChange("licensePlate", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-model">Model xe</Label>
                            <Input
                                id="edit-model"
                                value={formData.model}
                                onChange={(e) => handleChange("model", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-batteryType">Loại pin</Label>
                            <Input
                                id="edit-batteryType"
                                value={formData.batteryType}
                                onChange={(e) => handleChange("batteryType", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-batteryCapacity">Dung lượng pin (kWh)</Label>
                            <Input
                                id="edit-batteryCapacity"
                                type="number"
                                step="0.1"
                                value={formData.batteryCapacity}
                                onChange={(e) => handleChange("batteryCapacity", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Trạng thái</Label>
                            <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                    <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                                    <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className={"cursor-pointer"}
                            variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            className={"cursor-pointer"}
                            onClick={handleUpdate} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Đang xử lý..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog (extracted) */}
            <VehicleDetailDialog
                open={isDetailDialogOpen}
                onOpenChange={(open) => {
                    setIsDetailDialogOpen(open);
                    if (!open) setSelectedVehicleId(null);
                }}
                vehicleId={selectedVehicleId}
            />

            {/* Alert Dialog xác nhận */}
            <AlertDialog open={!!confirmState.action} onOpenChange={(open) => { if (!open) closeConfirm(); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmState.action === "revoke" && "Xác nhận thu hồi phương tiện"}
                            {confirmState.action === "delete" && "Xác nhận xóa phương tiện"}
                            {confirmState.action === "deleteImage" && "Xác nhận xóa ảnh phương tiện"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmState.action === "revoke" && "Bạn có chắc chắn muốn thu hồi phương tiện này? Hành động sẽ gỡ khỏi tài xế."}
                            {confirmState.action === "delete" && "Bạn có chắc chắn muốn xóa phương tiện này? Hành động không thể hoàn tác."}
                            {confirmState.action === "deleteImage" && "Bạn có chắc chắn muốn xóa ảnh của phương tiện này?"}
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
        </div>
    );
}

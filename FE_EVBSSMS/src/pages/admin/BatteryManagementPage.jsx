import { useState } from "react";
import { batteriesApi, BATTERY_STATUS, stationApi } from "@/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { toast } from "react-hot-toast";
import {
    Battery,
    Plus,
    Edit,
    Trash2,
    Search,
    Zap,
    AlertCircle,
    CheckCircle,
    Eye,
    Gauge,
    MapPin
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import BatteryDetailDialog from "@/components/BatteryDetailDialog";

export default function BatteryManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddToStationDialogOpen, setIsAddToStationDialogOpen] = useState(false);
    const [selectedBattery, setSelectedBattery] = useState(null);
    const [batteryToDelete, setBatteryToDelete] = useState(null);
    const [formData, setFormData] = useState({
        model: "",
        capacity: "",
        soh: "100",
        soc: "100",
        status: "IN_STOCK",
        ownerType: "STATION",
        referenceId: "",
    });
    const [addToStationData, setAddToStationData] = useState({
        stationCode: "",
        batteryCode: "",
    });

    // Fetch batteries
    const { data: batteriesWrapper, isLoading, refetch } = useCustomQuery(
        ["batteries"],
        () => batteriesApi.getAllBatteries()
    );

    // Fetch stations for assigning battery
    const { data: stationsWrapper } = useCustomQuery(
        ["stations"],
        () => stationApi.getAllStations()
    );

    const batteriesData = batteriesWrapper?.data || batteriesWrapper || [];
    const batteries = Array.isArray(batteriesData) ? batteriesData : [];

    const stationsData = stationsWrapper?.data || stationsWrapper || [];
    const stations = Array.isArray(stationsData) ? stationsData : [];

    // Create battery mutation
    const createMutation = useCustomMutation(
        (data) => batteriesApi.createBattery(data),
        "POST",
        {
            onSuccess: () => {
                toast.success("Thêm pin thành công!");
                setIsCreateDialogOpen(false);
                resetForm();
                refetch();
            },
        }
    );

    // Update battery mutation
    const updateMutation = useCustomMutation(
        ({ id, data }) => batteriesApi.updateBattery(id, data),
        "PUT",
        {
            onSuccess: () => {
                toast.success("Cập nhật pin thành công!");
                setIsEditDialogOpen(false);
                resetForm();
                refetch();
            },
        }
    );

    // Delete battery mutation
    const deleteMutation = useCustomMutation(
        (id) => batteriesApi.deleteBattery(id),
        "DELETE",
        {
            onSuccess: () => {
                toast.success("Xóa pin thành công!");
                refetch();
            },
        }
    );

    // Add battery to station mutation
    const addToStationMutation = useCustomMutation(
        (data) => batteriesApi.addBatteryToStation(data),
        "POST",
        {
            onSuccess: () => {
                toast.success("Thêm pin vào trạm thành công! Pin đã chuyển sang trạng thái IN_USE.");
                setIsAddToStationDialogOpen(false);
                setAddToStationData({ stationCode: "", batteryCode: "" });
                refetch();
            },
        }
    );

    const resetForm = () => {
        setFormData({
            model: "",
            capacity: "",
            soh: "100",
            soc: "100",
            status: "IN_STOCK",
            ownerType: "STATION",
            referenceId: "",
        });
        setSelectedBattery(null);
    };

    const handleCreate = () => {
        if (!formData.model || !formData.capacity) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        createMutation.mutate({
            model: formData.model,
            capacity: parseFloat(formData.capacity),
            soh: parseFloat(formData.soh),
            soc: parseFloat(formData.soc),
            status: formData.status,
            ownerType: formData.ownerType,
            referenceId: formData.referenceId || null,
        });
    };

    const handleEdit = (battery) => {
        setSelectedBattery(battery);
        setFormData({
            model: battery.model || "",
            capacity: battery.capacity?.toString() || "",
            soh: battery.soh?.toString() || "100",
            soc: battery.soc?.toString() || "100",
            status: battery.status || "IN_STOCK",
            ownerType: battery.ownerType || "STATION",
            referenceId: battery.referenceId || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!formData.model || !formData.capacity) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        updateMutation.mutate({
            id: selectedBattery.id,
            data: {
                model: formData.model,
                capacity: parseFloat(formData.capacity),
                soh: parseFloat(formData.soh),
                soc: parseFloat(formData.soc),
                status: formData.status,
                ownerType: formData.ownerType,
                referenceId: formData.referenceId || null,
            },
        });
    };

    const handleDelete = (battery) => {
        setBatteryToDelete(battery);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (batteryToDelete) {
            deleteMutation.mutate(batteryToDelete.id);
            setIsDeleteDialogOpen(false);
            setBatteryToDelete(null);
        }
    };

    const handleViewDetail = (battery) => {
        setSelectedBattery(battery);
        setIsDetailDialogOpen(true);
    };

    const handleAddToStation = (battery) => {
        setAddToStationData({
            stationCode: "",
            batteryCode: battery.batteryCode,
        });
        setIsAddToStationDialogOpen(true);
    };

    const confirmAddToStation = () => {
        if (!addToStationData.stationCode || !addToStationData.batteryCode) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }
        addToStationMutation.mutate(addToStationData);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            FULL: {
                label: "Đầy",
                className: "bg-green-500",
                icon: CheckCircle
            },
            CHARGING: {
                label: "Đang sạc",
                className: "bg-blue-500",
                icon: Zap
            },
            IN_USE: {
                label: "Đang dùng",
                className: "bg-purple-500",
                icon: Battery
            },
            DEFECTIVE: {
                label: "Hỏng",
                className: "bg-red-500",
                icon: AlertCircle
            },
            MAINTENANCE: {
                label: "Bảo trì",
                className: "bg-yellow-500",
                icon: AlertCircle
            },
            IN_STOCK: {
                label: "Trong kho",
                className: "bg-gray-500",
                icon: Battery
            },
        };
        return statusMap[status] || {
            label: status,
            className: "bg-gray-500",
            icon: AlertCircle
        };
    };

    const getOwnerTypeBadge = (ownerType) => {
        const ownerMap = {
            STATION: { label: "Trạm", className: "bg-blue-100 text-blue-700" },
            VEHICLE: { label: "Xe", className: "bg-green-100 text-green-700" },
        };
        return ownerMap[ownerType] || { label: ownerType, className: "bg-gray-100 text-gray-700" };
    };

    const filterBatteries = (batteries) => {
        if (!searchQuery) return batteries;
        return batteries.filter(
            (battery) =>
                battery.batteryCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                battery.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                battery.referenceId?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const filteredBatteries = filterBatteries(batteries);
    const fullBatteries = batteries.filter((b) => b.status === BATTERY_STATUS.FULL).length;
    const chargingBatteries = batteries.filter((b) => b.status === BATTERY_STATUS.CHARGING).length;
    const defectiveBatteries = batteries.filter((b) => b.status === BATTERY_STATUS.DEFECTIVE).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý pin</h1>
                    <p className="text-slate-600">Quản lý pin trong hệ thống</p>
                </div>
                <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-[#135bec] hover:bg-[#135bec]/90 gap-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Thêm pin mới
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Battery className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Tổng số pin</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {batteries.length || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Pin đầy</p>
                                <p className="text-2xl font-bold text-slate-900">{fullBatteries}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Đang sạc</p>
                                <p className="text-2xl font-bold text-slate-900">{chargingBatteries}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Hỏng hóc</p>
                                <p className="text-2xl font-bold text-slate-900">{defectiveBatteries}</p>
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
                            placeholder="Tìm kiếm theo mã pin, model, reference ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Batteries List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            ) : filteredBatteries.length === 0 ? (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Battery className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">Không tìm thấy pin nào</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredBatteries.map((battery) => {
                        const statusInfo = getStatusBadge(battery.status);
                        const StatusIcon = statusInfo.icon;
                        const ownerInfo = getOwnerTypeBadge(battery.ownerType);

                        return (
                            <Card key={battery.id} className="hover:shadow-lg transition">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${statusInfo.className === 'bg-green-500' ? 'bg-green-100' : statusInfo.className === 'bg-blue-500' ? 'bg-blue-100' : statusInfo.className === 'bg-red-500' ? 'bg-red-100' : statusInfo.className === 'bg-yellow-500' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                                            <Battery className={`w-8 h-8 ${statusInfo.className === 'bg-green-500' ? 'text-green-600' : statusInfo.className === 'bg-blue-500' ? 'text-blue-600' : statusInfo.className === 'bg-red-500' ? 'text-red-600' : statusInfo.className === 'bg-yellow-500' ? 'text-yellow-600' : 'text-gray-600'}`} />
                                        </div>

                                        {/* Battery Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-slate-900">
                                                    {battery.batteryCode}
                                                </h3>
                                                <Badge className={`${statusInfo.className} text-white`}>
                                                    <StatusIcon className="w-3 h-3 mr-1" />
                                                    {statusInfo.label}
                                                </Badge>
                                                <Badge className={ownerInfo.className}>
                                                    {ownerInfo.label}
                                                </Badge>
                                                {battery.referenceId && battery.status === "IN_USE" && (
                                                    <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200">
                                                        <MapPin className="w-3 h-3 mr-1" />
                                                        Trạm: {battery.referenceId}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Battery className="w-4 h-4" />
                                                    Model: {battery.model}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Gauge className="w-4 h-4" />
                                                    Dung lượng: {battery.capacity} kWh
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Zap className="w-4 h-4" />
                                                    SOC: {battery.soc}%
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    SOH: {battery.soh}%
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewDetail(battery)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Chi tiết
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(battery)}
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Sửa
                                            </Button>
                                            {battery.ownerType === "STATION" && battery.status === "IN_STOCK" && !battery.referenceId && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                                    onClick={() => handleAddToStation(battery)}
                                                >
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    Gán trạm
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDelete(battery)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Thêm pin mới</DialogTitle>
                        <DialogDescription>
                            Điền thông tin để thêm pin mới vào hệ thống
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="model">
                                    Model <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="model"
                                    value={formData.model}
                                    onChange={(e) =>
                                        setFormData({ ...formData, model: e.target.value })
                                    }
                                    placeholder="VD: LFP-100"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">
                                    Dung lượng (kWh) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    step="0.1"
                                    value={formData.capacity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, capacity: e.target.value })
                                    }
                                    placeholder="VD: 100"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="soh">SOH (%)</Label>
                                <Input
                                    id="soh"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.soh}
                                    onChange={(e) =>
                                        setFormData({ ...formData, soh: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="soc">SOC (%)</Label>
                                <Input
                                    id="soc"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.soc}
                                    onChange={(e) =>
                                        setFormData({ ...formData, soc: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="status">Trạng thái</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IN_STOCK">Trong kho</SelectItem>
                                        <SelectItem value="FULL">Đầy</SelectItem>
                                        <SelectItem value="CHARGING">Đang sạc</SelectItem>
                                        <SelectItem value="IN_USE">Đang dùng</SelectItem>
                                        <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                                        <SelectItem value="DEFECTIVE">Hỏng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ownerType">Loại sở hữu</Label>
                                <Select
                                    value={formData.ownerType}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, ownerType: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STATION">Trạm</SelectItem>
                                        <SelectItem value="VEHICLE">Xe</SelectItem>
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
                            disabled={createMutation.isLoading}
                            className="bg-[#135bec] hover:bg-[#135bec]/90"
                        >
                            {createMutation.isLoading ? "Đang tạo..." : "Tạo pin"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa pin</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin pin
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-model">
                                    Model <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-model"
                                    value={formData.model}
                                    onChange={(e) =>
                                        setFormData({ ...formData, model: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-capacity">
                                    Dung lượng (kWh) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="edit-capacity"
                                    type="number"
                                    step="0.1"
                                    value={formData.capacity}
                                    onChange={(e) =>
                                        setFormData({ ...formData, capacity: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-soh">SOH (%)</Label>
                                <Input
                                    id="edit-soh"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.soh}
                                    onChange={(e) =>
                                        setFormData({ ...formData, soh: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-soc">SOC (%)</Label>
                                <Input
                                    id="edit-soc"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.soc}
                                    onChange={(e) =>
                                        setFormData({ ...formData, soc: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Trạng thái</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IN_STOCK">Trong kho</SelectItem>
                                        <SelectItem value="FULL">Đầy</SelectItem>
                                        <SelectItem value="CHARGING">Đang sạc</SelectItem>
                                        <SelectItem value="IN_USE">Đang dùng</SelectItem>
                                        <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                                        <SelectItem value="DEFECTIVE">Hỏng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-ownerType">Loại sở hữu</Label>
                                <Select
                                    value={formData.ownerType}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, ownerType: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STATION">Trạm</SelectItem>
                                        <SelectItem value="VEHICLE">Xe</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-referenceId">Reference ID</Label>
                            <Input
                                id="edit-referenceId"
                                value={formData.referenceId}
                                onChange={(e) =>
                                    setFormData({ ...formData, referenceId: e.target.value })
                                }
                                disabled={true}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={updateMutation.isLoading}
                            className="bg-[#135bec] hover:bg-[#135bec]/90"
                        >
                            {updateMutation.isLoading ? "Đang cập nhật..." : "Cập nhật"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Detail Dialog */}
            <BatteryDetailDialog
                isOpen={isDetailDialogOpen}
                onClose={() => setIsDetailDialogOpen(false)}
                battery={selectedBattery}
            />

            {/* Add to Station Dialog */}
            <Dialog open={isAddToStationDialogOpen} onOpenChange={setIsAddToStationDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gán pin vào trạm</DialogTitle>
                        <DialogDescription>
                            Khi gán pin vào trạm, trạng thái pin sẽ tự động chuyển từ IN_STOCK → IN_USE
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                            <p className="font-semibold mb-1">📌 Lưu ý:</p>
                            <ul className="list-disc ml-5 space-y-1">
                                <li>Mỗi pin chỉ có thể gán vào một trạm duy nhất</li>
                                <li>Trạng thái pin sẽ chuyển sang <strong>IN_USE</strong></li>
                                <li>Mã trạm sẽ được lưu vào <strong>referenceId</strong></li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="batteryCode">Mã pin</Label>
                            <Input
                                id="batteryCode"
                                value={addToStationData.batteryCode}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stationCode">
                                Chọn trạm <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={addToStationData.stationCode}
                                onValueChange={(value) =>
                                    setAddToStationData({
                                        ...addToStationData,
                                        stationCode: value,
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạm để gán pin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {stations.length === 0 ? (
                                        <SelectItem value="__none" disabled>
                                            Không có trạm khả dụng
                                        </SelectItem>
                                    ) : (
                                        stations.map((s) => (
                                            <SelectItem key={s.id ?? s.stationCode} value={s.stationCode}>
                                                {s.stationCode} - {s.stationName}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAddToStationDialogOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            onClick={confirmAddToStation}
                            disabled={addToStationMutation.isLoading || !addToStationData.stationCode}
                            className="bg-[#135bec] hover:bg-[#135bec]/90"
                        >
                            {addToStationMutation.isLoading ? "Đang gán..." : "Gán vào trạm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa pin</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa pin <strong>{batteryToDelete?.batteryCode}</strong> không?
                            <br />
                            <span className="text-red-600 font-medium">
                                Hành động này không thể hoàn tác!
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBatteryToDelete(null)}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa pin
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

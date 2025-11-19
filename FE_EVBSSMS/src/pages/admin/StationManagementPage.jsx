import { useState } from "react";
import { stationApi, STATION_STATUS } from "@/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { toast } from "react-hot-toast";
import {
    MapPin,
    Plus,
    Edit,
    Trash2,
    Map,
    List,
    Search,
    Building2,
    AlertCircle,
    CheckCircle,
    XCircle,
    Battery,
    Phone,
    Eye,
    Users,
    UserPlus
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import StationMapView from "./StationMapView";

export default function StationManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [stationToDelete, setStationToDelete] = useState(null);
    const [formData, setFormData] = useState({
        stationName: "",
        address: "",
        phoneNumber: "",
        totalSlots: "",
        availableSlots: "",
        status: "ACTIVE",
    });
    const [addStaffData, setAddStaffData] = useState({ stationId: null, staffCode: "" });

    // Fetch stations
    const { data: stationsWrapper, isLoading, refetch } = useCustomQuery(
        ["stations"],
        () => stationApi.getAllStations()
    );

    const stationsData = stationsWrapper?.data || stationsWrapper || [];
    const stations = Array.isArray(stationsData) ? stationsData : [];

    // Create station mutation
    const createMutation = useCustomMutation(
        (data) => stationApi.createStation(data),
        "POST",
        {
            onSuccess: () => {
                toast.success("Thêm trạm thành công!");
                setIsCreateDialogOpen(false);
                resetForm();
                refetch();
            },
        }
    );

    // Update station mutation
    const updateMutation = useCustomMutation(
        ({ id, data }) => stationApi.updateStation(id, data),
        "PUT",
        {
            onSuccess: () => {
                toast.success("Cập nhật trạm thành công!");
                setIsEditDialogOpen(false);
                resetForm();
                refetch();
            },
        }
    );

    // Delete station mutation
    const deleteMutation = useCustomMutation(
        (id) => stationApi.deleteStation(id),
        "DELETE",
        {
            onSuccess: () => {
                toast.success("Xóa trạm thành công!");
                refetch();
            },
        }
    );

    // Add staff to station
    const addStaffMutation = useCustomMutation(
        ({ stationId, staffCode }) => stationApi.addStaffToStation(stationId, { staffCode }),
        "POST",
        {
            onSuccess: () => {
                toast.success("Thêm nhân viên vào trạm thành công!");
                setIsAddStaffDialogOpen(false);
                setAddStaffData({ stationId: null, staffCode: "" });
                refetch();
            },
        }
    );

    const resetForm = () => {
        setFormData({
            stationName: "",
            address: "",
            phoneNumber: "",
            totalSlots: "",
            availableSlots: "",
            status: "ACTIVE",
        });
        setSelectedStation(null);
    };

    const handleCreate = () => {
        if (!formData.stationName || !formData.address) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        createMutation.mutate({
            stationName: formData.stationName,
            address: formData.address,
            phoneNumber: formData.phoneNumber,
            totalSlots: formData.totalSlots ? parseInt(formData.totalSlots) : 0,
            availableSlots: formData.availableSlots ? parseInt(formData.availableSlots) : 0,
            status: formData.status,
        });
    };

    const handleEdit = (station) => {
        setSelectedStation(station);
        setFormData({
            stationName: station.stationName || "",
            address: station.address || "",
            phoneNumber: station.phoneNumber || "",
            totalSlots: station.totalSlots?.toString() || "",
            availableSlots: station.availableSlots?.toString() || "",
            status: station.status || "ACTIVE",
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!formData.stationName || !formData.address) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        updateMutation.mutate({
            id: selectedStation.id,
            data: {
                stationName: formData.stationName,
                address: formData.address,
                phoneNumber: formData.phoneNumber,
                totalSlots: formData.totalSlots ? parseInt(formData.totalSlots) : 0,
                availableSlots: formData.availableSlots ? parseInt(formData.availableSlots) : 0,
                status: formData.status,
            },
        });
    };

    const handleDelete = (station) => {
        setStationToDelete(station);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (stationToDelete) {
            deleteMutation.mutate(stationToDelete.id);
            setIsDeleteDialogOpen(false);
            setStationToDelete(null);
        }
    };

    const handleViewDetail = (station) => {
        setSelectedStation(station);
        setIsDetailDialogOpen(true);
    };

    const handleOpenAddStaff = (station) => {
        setAddStaffData({ stationId: station.id, staffCode: "" });
        setIsAddStaffDialogOpen(true);
    };

    const confirmAddStaff = () => {
        if (!addStaffData.stationId || !addStaffData.staffCode) {
            toast.error("Vui lòng nhập mã nhân viên!");
            return;
        }
        addStaffMutation.mutate({
            stationId: addStaffData.stationId,
            staffCode: addStaffData.staffCode,
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            ACTIVE: {
                label: "Hoạt động",
                className: "bg-green-500",
                icon: CheckCircle
            },
            OFFLINE: {
                label: "Tạm đóng",
                className: "bg-gray-500",
                icon: XCircle
            },
            MAINTENANCE: {
                label: "Bảo trì",
                className: "bg-yellow-500",
                icon: AlertCircle
            },
        };
        return statusMap[status] || {
            label: status,
            className: "bg-gray-500",
            icon: AlertCircle
        };
    };

    const filterStations = (stations) => {
        if (!searchQuery) return stations;
        return stations.filter(
            (station) =>
                station.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                station.stationCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                station.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                station.phoneNumber?.includes(searchQuery)
        );
    };

    const filteredStations = filterStations(stations);
    const activeStations = stations.filter((s) => s.status === STATION_STATUS.ACTIVE).length;
    const maintenanceStations = stations.filter((s) => s.status === STATION_STATUS.MAINTENANCE).length;
    const totalSlots = stations.reduce((sum, s) => sum + (s.totalSlots || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý trạm đổi pin</h1>
                    <p className="text-slate-600">Quản lý các trạm đổi pin trong hệ thống</p>
                </div>
                <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-[#135bec] hover:bg-[#135bec]/90 gap-2 cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    Thêm trạm mới
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Tổng số trạm</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {stations.length || 0}
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
                                <p className="text-sm text-slate-500">Đang hoạt động</p>
                                <p className="text-2xl font-bold text-slate-900">{activeStations}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Bảo trì</p>
                                <p className="text-2xl font-bold text-slate-900">{maintenanceStations}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-3">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Battery className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Tổng slots</p>
                                <p className="text-2xl font-bold text-slate-900">{totalSlots}</p>
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
                            placeholder="Tìm kiếm theo tên, mã, địa chỉ, số điện thoại..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="list" className="gap-2">
                        <List className="w-4 h-4" />
                        Danh sách
                    </TabsTrigger>
                    <TabsTrigger value="map" className="gap-2">
                        <Map className="w-4 h-4" />
                        Bản đồ
                    </TabsTrigger>
                </TabsList>

                {/* List View */}
                <TabsContent value="list" className="mt-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-32 w-full" />
                            ))}
                        </div>
                    ) : filteredStations.length === 0 ? (
                        <Card>
                            <CardContent className="pt-12 pb-12 text-center">
                                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-500">Không tìm thấy trạm nào</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {filteredStations.map((station) => {
                                const statusInfo = getStatusBadge(station.status);
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <Card key={station.id} className="hover:shadow-lg transition">
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${statusInfo.className === 'bg-green-500' ? 'bg-green-100' : statusInfo.className === 'bg-yellow-500' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                                                    <Building2 className={`w-8 h-8 ${statusInfo.className === 'bg-green-500' ? 'text-green-600' : statusInfo.className === 'bg-yellow-500' ? 'text-yellow-600' : 'text-gray-600'}`} />
                                                </div>

                                                {/* Station Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-semibold text-slate-900">
                                                            {station.stationName}
                                                        </h3>
                                                        <Badge className={`${statusInfo.className} text-white`}>
                                                            <StatusIcon className="w-3 h-3 mr-1" />
                                                            {statusInfo.label}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                                                        <div className="flex items-center gap-1">
                                                            <MapPin className="w-4 h-4" />
                                                            {station.address}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Phone className="w-4 h-4" />
                                                            {station.phoneNumber || "Chưa có"}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Battery className="w-4 h-4" />
                                                            Slots: {station.availableSlots}/{station.totalSlots}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-slate-500">
                                                            Mã: {station.stationCode || "N/A"}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Battery className="w-4 h-4" />
                                                            Pin: {station.batteries?.length ?? 0}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Users className="w-4 h-4" />
                                                            Nhân viên: {station.staffCode?.length ?? 0}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewDetail(station)}
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Chi tiết
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEdit(station)}
                                                    >
                                                        <Edit className="w-4 h-4 mr-1" />
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                                                        onClick={() => handleOpenAddStaff(station)}
                                                    >
                                                        <UserPlus className="w-4 h-4 mr-1" />
                                                        Thêm nhân viên
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleDelete(station)}
                                                        className={"cursor-pointer"}
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
                </TabsContent>

                {/* Map View */}
                <TabsContent value="map" className="mt-6">
                    <StationMapView onEditStation={handleEdit} />
                </TabsContent>
            </Tabs>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Thêm trạm mới</DialogTitle>
                        <DialogDescription>
                            Điền thông tin để thêm trạm đổi pin mới
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="stationName">
                                Tên trạm <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="stationName"
                                value={formData.stationName}
                                onChange={(e) =>
                                    setFormData({ ...formData, stationName: e.target.value })
                                }
                                placeholder="VD: Trạm đổi pin Quận 1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">
                                Địa chỉ <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                placeholder="Nhập địa chỉ trạm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                                <Input
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phoneNumber: e.target.value })
                                    }
                                    placeholder="VD: 0901234567"
                                />
                            </div>
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
                                        <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                        <SelectItem value="OFFLINE">Tạm đóng</SelectItem>
                                        <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="totalSlots">Tổng số slots</Label>
                                <Input
                                    id="totalSlots"
                                    type="number"
                                    value={formData.totalSlots}
                                    onChange={(e) =>
                                        setFormData({ ...formData, totalSlots: e.target.value })
                                    }
                                    placeholder="VD: 10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="availableSlots">Slots khả dụng</Label>
                                <Input
                                    id="availableSlots"
                                    type="number"
                                    value={formData.availableSlots}
                                    onChange={(e) =>
                                        setFormData({ ...formData, availableSlots: e.target.value })
                                    }
                                    placeholder="VD: 10"
                                />
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
                            {createMutation.isLoading ? "Đang tạo..." : "Tạo trạm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa trạm</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin trạm đổi pin
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-stationName">
                                Tên trạm <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-stationName"
                                value={formData.stationName}
                                onChange={(e) =>
                                    setFormData({ ...formData, stationName: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-address">
                                Địa chỉ <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phoneNumber">Số điện thoại</Label>
                                <Input
                                    id="edit-phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phoneNumber: e.target.value })
                                    }
                                />
                            </div>
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
                                        <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                        <SelectItem value="OFFLINE">Tạm đóng</SelectItem>
                                        <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-totalSlots">Tổng số slots</Label>
                                <Input
                                    id="edit-totalSlots"
                                    type="number"
                                    value={formData.totalSlots}
                                    onChange={(e) =>
                                        setFormData({ ...formData, totalSlots: e.target.value })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-availableSlots">Slots khả dụng</Label>
                                <Input
                                    id="edit-availableSlots"
                                    type="number"
                                    value={formData.availableSlots}
                                    onChange={(e) =>
                                        setFormData({ ...formData, availableSlots: e.target.value })
                                    }
                                />
                            </div>
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
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Chi tiết trạm</DialogTitle>
                        <DialogDescription>
                            Thông tin chi tiết về trạm đổi pin
                        </DialogDescription>
                    </DialogHeader>
                    {selectedStation && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Tên trạm</p>
                                    <p className="font-semibold">{selectedStation.stationName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Mã trạm</p>
                                    <p className="font-semibold">{selectedStation.stationCode || "N/A"}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-sm text-slate-500 mb-1">Địa chỉ</p>
                                    <p className="font-semibold">{selectedStation.address}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Số điện thoại</p>
                                    <p className="font-semibold">{selectedStation.phoneNumber || "Chưa có"}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Trạng thái</p>
                                    <Badge className={`${getStatusBadge(selectedStation.status).className} text-white`}>
                                        {getStatusBadge(selectedStation.status).label}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Tổng slots</p>
                                    <p className="font-semibold">{selectedStation.totalSlots || 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Slots khả dụng</p>
                                    <p className="font-semibold text-green-600">{selectedStation.availableSlots || 0}</p>
                                </div>
                            </div>
                            {/* New fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Số lượng pin</p>
                                    <p className="font-semibold">{selectedStation.batteries?.length ?? 0}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">Số lượng nhân viên</p>
                                    <p className="font-semibold">{selectedStation.staffCode?.length ?? 0}</p>
                                </div>
                                {/* Danh sách nhân viên */}
                                {Array.isArray(selectedStation.staffCode) && selectedStation.staffCode.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm text-slate-500 mb-1">Danh sách mã nhân viên</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedStation.staffCode.map((code, idx) => (
                                                <Badge key={idx} variant="secondary">{code}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Danh sách pin */}
                                {Array.isArray(selectedStation.batteries) && selectedStation.batteries.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-sm text-slate-500 mb-1">Danh sách mã pin</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedStation.batteries.map((battery, idx) => (
                                                <Badge key={battery.id || idx} variant="secondary">
                                                    {battery.batteryCode} - {battery.model}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                            Đóng
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Staff Dialog */}
            <Dialog open={isAddStaffDialogOpen} onOpenChange={setIsAddStaffDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm nhân viên vào trạm</DialogTitle>
                        <DialogDescription>
                            Nhập mã nhân viên để gán vào trạm
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Trạm</Label>
                            <Input value={stations.find(s => s.id === addStaffData.stationId)?.stationName || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="staffCode">
                                Mã nhân viên <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="staffCode"
                                value={addStaffData.staffCode}
                                onChange={(e) => setAddStaffData({ ...addStaffData, staffCode: e.target.value })}
                                placeholder="Nhập mã nhân viên"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddStaffDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button
                            onClick={confirmAddStaff}
                            disabled={addStaffMutation.isLoading}
                            className="bg-[#135bec] hover:bg-[#135bec]/90"
                        >
                            {addStaffMutation.isLoading ? "Đang thêm..." : "Thêm nhân viên"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa trạm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa trạm <strong>{stationToDelete?.stationName}</strong> không?
                            <br />
                            <span className="text-red-600 font-medium">
                                Hành động này không thể hoàn tác!
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setStationToDelete(null)}>
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa trạm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}


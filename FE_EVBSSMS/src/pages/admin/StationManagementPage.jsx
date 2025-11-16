import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Search, Edit, Trash2, Phone, Battery, CheckCircle, XCircle, AlertCircle, List, Map as MapIcon } from "lucide-react";
import useCustomQuery from "@/hooks/useCustomQuery";
import useCustomMutation from "@/hooks/useCustomMutation";
import { stationApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import StationMapView from "@/pages/admin/StationMapView.jsx";

export default function StationManagementPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("list"); // "list" or "map"
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedStation, setSelectedStation] = useState(null);
    const [formData, setFormData] = useState({
        stationName: "",
        address: "",
        phoneNumber: "",
        latitude: "",
        longitude: "",
        totalSlots: "",
        availableSlots: "",
        status: "ACTIVE",
    });

    useEffect(() => {
        if (isEditDialogOpen) {
            setTimeout(() => {
                const map = window.__leaflet_map__;
                if (map) map.invalidateSize();
            }, 200);
        }
    }, [isEditDialogOpen]);

    const fadeVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    // Fetch danh sách stations
    const { data: stationsWrapper, isLoading, refetch } = useCustomQuery(
        ["admin-all-stations"],
        () => stationApi.getAllStations()
    );

    const stationsData = stationsWrapper?.data || stationsWrapper || [];
    const stations = Array.isArray(stationsData) ? stationsData : [];

    // Filter stations
    const filteredStations = stations.filter(station =>
        station.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.stationCode?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Create mutation
    const createMutation = useCustomMutation(
        (data) => stationApi.createStation(data),
        "POST",
        {
            onSuccess: () => {
                toast.success("Tạo trạm thành công!");
                setIsCreateDialogOpen(false);
                resetForm();
                refetch();
            },
            onError: () => {
                toast.error("Không thể tạo trạm. Vui lòng thử lại.");
            },
        }
    );

    // Update mutation
    const updateMutation = useCustomMutation(
        ({ id, data }) => stationApi.updateStation(id, data),
        "PUT",
        {
            onSuccess: () => {
                toast.success("Cập nhật trạm thành công!");
                setIsEditDialogOpen(false);
                setSelectedStation(null);
                resetForm();
                refetch();
            },
            onError: () => {
                toast.error("Không thể cập nhật trạm. Vui lòng thử lại.");
            },
        }
    );

    // Delete mutation
    const deleteMutation = useCustomMutation(
        (id) => stationApi.deleteStation(id),
        "DELETE",
        {
            onSuccess: () => {
                toast.success("Xóa trạm thành công!");
                setIsDeleteDialogOpen(false);
                setSelectedStation(null);
                refetch();
            },
            onError: () => {
                toast.error("Không thể xóa trạm. Vui lòng thử lại.");
            },
        }
    );

    const resetForm = () => {
        setFormData({
            stationName: "",
            address: "",
            phoneNumber: "",
            latitude: "",
            longitude: "",
            totalSlots: "",
            availableSlots: "",
            status: "ACTIVE",
        });
    };

    const handleCreate = () => {
        if (!formData.stationName || !formData.address) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        const payload = {
            stationName: formData.stationName,
            address: formData.address,
            phoneNumber: formData.phoneNumber,
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0,
            totalSlots: parseInt(formData.totalSlots) || 0,
            availableSlots: parseInt(formData.availableSlots) || 0,
            status: formData.status,
        };

        createMutation.mutate(payload);
    };

    const handleEdit = (station) => {
        setSelectedStation(station);
        setFormData({
            stationName: station.stationName || "",
            address: station.address || "",
            phoneNumber: station.phoneNumber || "",
            latitude: station.latitude?.toString() || "",
            longitude: station.longitude?.toString() || "",
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

        const payload = {
            stationName: formData.stationName,
            address: formData.address,
            phoneNumber: formData.phoneNumber,
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0,
            totalSlots: parseInt(formData.totalSlots) || 0,
            availableSlots: parseInt(formData.availableSlots) || 0,
            status: formData.status,
        };

        updateMutation.mutate({ id: selectedStation.id, data: payload });
    };

    const handleDelete = (station) => {
        setSelectedStation(station);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedStation) {
            deleteMutation.mutate(selectedStation.id);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            ACTIVE: {
                label: "Hoạt động",
                color: "bg-green-100 text-green-700",
                icon: CheckCircle
            },
            OFFLINE: {
                label: "Ngừng hoạt động",
                color: "bg-red-100 text-red-700",
                icon: XCircle
            },
            MAINTENANCE: {
                label: "Bảo trì",
                color: "bg-yellow-100 text-yellow-700",
                icon: AlertCircle
            },
        };
        return statusMap[status] || {
            label: status,
            color: "bg-gray-100 text-gray-700",
            icon: AlertCircle
        };
    };

    const handleFormChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="w-full min-h-screen bg-white text-gray-900">
            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                                    <span className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                        Quản lý trạm đổi pin
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Tổng số: <span className="font-semibold text-gray-800">{stations.length} trạm</span>
                                </p>
                            </div>
                            <Button
                                onClick={() => {
                                    resetForm();
                                    setIsCreateDialogOpen(true);
                                }}
                                className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Thêm trạm mới
                            </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Tìm kiếm theo tên trạm, địa chỉ hoặc mã trạm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 py-6 text-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                                />
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === "list" ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => setViewMode("list")}
                                    className={viewMode === "list" ? "bg-gradient-to-r from-emerald-600 to-cyan-600" : ""}
                                >
                                    <List className="w-5 h-5 mr-2" />
                                    Danh sách
                                </Button>
                                <Button
                                    variant={viewMode === "map" ? "default" : "outline"}
                                    size="lg"
                                    onClick={() => setViewMode("map")}
                                    className={viewMode === "map" ? "bg-gradient-to-r from-emerald-600 to-cyan-600" : ""}
                                >
                                    <MapIcon className="w-5 h-5 mr-2" />
                                    Bản đồ
                                </Button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Map View */}
                    {viewMode === "map" ? (
                        <StationMapView onEditStation={handleEdit} />
                    ) : (
                        <>
                    {/* Stations Grid */}
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
                    ) : filteredStations.length === 0 ? (
                        <Card className="border border-gray-200">
                            <CardContent className="p-12 text-center">
                                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-500 text-lg">
                                    {searchQuery ? "Không tìm thấy trạm nào" : "Chưa có trạm nào"}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStations.map((station, idx) => {
                                const statusInfo = getStatusBadge(station.status);
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <motion.div
                                        key={station.id}
                                        initial="hidden"
                                        animate="visible"
                                        variants={fadeVariants}
                                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                                    >
                                        <Card className="border border-gray-200 hover:shadow-xl transition-all">
                                            <CardHeader>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-xl mb-1 text-black">
                                                            {station.stationName}
                                                        </CardTitle>
                                                        <CardDescription className="text-sm text-gray-500">
                                                            Mã: {station.stationCode}
                                                        </CardDescription>
                                                    </div>
                                                    <Badge className={`font-medium ${statusInfo.color} flex items-center gap-1`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusInfo.label}
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <span>{station.address}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span>{station.phoneNumber || "Chưa có"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Battery className="w-4 h-4" />
                                                    <span>
                                                        {station.availableSlots}/{station.totalSlots} slots khả dụng
                                                    </span>
                                                </div>
                                            </CardContent>
                                            <CardContent className="pt-0">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => handleEdit(station)}
                                                    >
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="flex-1"
                                                        onClick={() => handleDelete(station)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                    </>
                    )}
                </div>
            </div>

            {/* Create Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-black">Thêm trạm mới</DialogTitle>
                        <DialogDescription>
                            Điền thông tin chi tiết cho trạm đổi pin mới
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="stationName">Tên trạm *</Label>
                                <Input
                                    id="stationName"
                                    value={formData.stationName}
                                    onChange={(e) => handleFormChange("stationName", e.target.value)}
                                    placeholder="Trạm Hương Lộ 2"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                                <Input
                                    id="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
                                    placeholder="0938859436"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">Địa chỉ *</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleFormChange("address", e.target.value)}
                                placeholder="Thalexim Petro, Quận Bình Tân"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="totalSlots">Tổng slots</Label>
                                <Input
                                    id="totalSlots"
                                    type="number"
                                    value={formData.totalSlots}
                                    onChange={(e) => handleFormChange("totalSlots", e.target.value)}
                                    placeholder="10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="availableSlots">Slots khả dụng</Label>
                                <Input
                                    id="availableSlots"
                                    type="number"
                                    value={formData.availableSlots}
                                    onChange={(e) => handleFormChange("availableSlots", e.target.value)}
                                    placeholder="10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Trạng thái</Label>
                                <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                        <SelectItem value="OFFLINE">Ngừng hoạt động</SelectItem>
                                        <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
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
                            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                        >
                            {createMutation.isPending ? "Đang tạo..." : "Tạo trạm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-black">Chỉnh sửa trạm</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin cho trạm: {selectedStation?.stationName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-stationName">Tên trạm *</Label>
                                <Input
                                    id="edit-stationName"
                                    value={formData.stationName}
                                    onChange={(e) => handleFormChange("stationName", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phoneNumber">Số điện thoại</Label>
                                <Input
                                    id="edit-phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Địa chỉ *</Label>
                            <Input
                                id="edit-address"
                                value={formData.address}
                                onChange={(e) => handleFormChange("address", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-totalSlots">Tổng slots</Label>
                                <Input
                                    id="edit-totalSlots"
                                    type="number"
                                    value={formData.totalSlots}
                                    onChange={(e) => handleFormChange("totalSlots", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-availableSlots">Slots khả dụng</Label>
                                <Input
                                    id="edit-availableSlots"
                                    type="number"
                                    value={formData.availableSlots}
                                    onChange={(e) => handleFormChange("availableSlots", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-status">Trạng thái</Label>
                                <Select value={formData.status} onValueChange={(value) => handleFormChange("status", value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                        <SelectItem value="OFFLINE">Ngừng hoạt động</SelectItem>
                                        <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
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
                            className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
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
                        <AlertDialogTitle>Xác nhận xóa trạm</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa trạm <strong>{selectedStation?.stationName}</strong>?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={deleteMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteMutation.isPending ? "Đang xóa..." : "Xóa trạm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
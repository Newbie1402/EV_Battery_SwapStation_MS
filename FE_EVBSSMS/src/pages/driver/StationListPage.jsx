import { useState, useEffect } from "react";
import { MapPin, Clock, Battery, Search, Sparkles, Navigation, MapIcon, List } from "lucide-react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useCustomQuery from "@/hooks/useCustomQuery";
import { stationApi, STATION_STATUS } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import BookingDialog from "./BookingDialog";
import { toast } from "react-hot-toast";
import useCustomMutation from "@/hooks/useCustomMutation";

export default function StationListPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStation, setSelectedStation] = useState(null);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [userLocation, setUserLocation] = useState(null);
    const [nearestStations, setNearestStations] = useState([]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [viewMode, setViewMode] = useState("list"); // "list" or "map"
    const [locationError, setLocationError] = useState(null);
    const [closestStationId, setClosestStationId] = useState(null);

    // Mutation lấy trạm gần nhất
    const nearestMutation = useCustomMutation(
        ({ latitude, longitude }) => stationApi.findNearestStations(latitude, longitude),
        "POST",
        {
            onSuccess: (res) => {
                const { data: nearbyStations, message } = res || {};
                const arr = Array.isArray(nearbyStations) ? nearbyStations : [];

                // Ghép thêm thông tin đầy đủ từ danh sách stations
                const enriched = arr.map((s) => {
                    const full = stations.find((st) => String(st.id) === String(s.id));
                    return full ? { ...full, distanceKm: s.distanceKm } : s;
                });
                setNearestStations(enriched);

                // Lấy phần tử đầu tiên (trạm gần nhất nhất)
                // if (enriched.length > 0) {
                //     setClosestStationId(String(enriched[0].id));
                // } else {
                //     setClosestStationId(null);
                // }

                // Lưu ID của 5 trạm gần nhất để tô màu xanh lá
                const topFiveIds = enriched.slice(0, 5).map((s) => String(s.id));
                setClosestStationId(topFiveIds); // Lưu mảng 5 ID

                if (message) toast.success(message);
                setViewMode("map");
                setIsLoadingLocation(false);
            },
            onError: () => {
                setNearestStations([]);
                setLocationError("Không thể tìm trạm gần nhất. Vui lòng thử lại.");
                setIsLoadingLocation(false);
            },
        }
    );

    const fadeVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
    };

    // Fetch danh sách stations
    const { data: stationsWrapper, isLoading } = useCustomQuery(
        ["stations"],
        () => stationApi.getAllStations()
    );
    const stationsData = stationsWrapper?.data || stationsWrapper || [];
    const stations = Array.isArray(stationsData) ? stationsData : [];

    // Client-side pagination
    const itemsPerPage = 12;
    const totalPages = Math.ceil(stations.length / itemsPerPage);
    const paginatedStations = stations.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

    // Filter stations theo search query
    const filteredStations = paginatedStations.filter(station =>
        station.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBookNow = (station) => {
        setSelectedStation(station);
        setIsBookingDialogOpen(true);
    };

    // Lấy vị trí người dùng
    const getUserLocation = () => {
        setIsLoadingLocation(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError("Trình duyệt không hỗ trợ định vị");
            setIsLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                // Gọi mutation thay vì gọi trực tiếp API
                nearestMutation.mutate({ latitude, longitude });
            },
            (error) => {
                console.error("Geolocation error:", error);
                setIsLoadingLocation(false);
                if (error?.code === 1) {
                    setLocationError("Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật quyền định vị cho trình duyệt.");
                } else if (error?.code === 2) {
                    setLocationError("Không thể xác định vị trí. Vui lòng kiểm tra kết nối GPS.");
                } else if (error?.code === 3) {
                    setLocationError("Yêu cầu định vị bị hết thời gian. Vui lòng thử lại.");
                } else {
                    setLocationError("Không thể lấy vị trí. Vui lòng bật GPS.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // Custom Leaflet icons
    const createCustomIcon = (color) => {
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });
    };

    const userIcon = L.divIcon({
        className: 'user-marker',
        html: `<div style="background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3), 0 2px 8px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });

    // Component để center map khi có user location
    function MapController({ center }) {
        const map = useMap();
        useEffect(() => {
            if (center) {
                map.setView(center, 13);
            }
        }, [center, map]);
        return null;
    }

    // Tính trạm gần nhất từ state
    const closestStation = closestStationId ? nearestStations.find(ns => ns.id === closestStationId) : null;

    // Helper function để lấy label và style cho status
    const getStatusDisplay = (status) => {
        switch(status) {
            case STATION_STATUS.ACTIVE:
                return { label: "Hoạt động", variant: "success", className: "bg-emerald-100 text-emerald-700" };
            case STATION_STATUS.OFFLINE:
                return { label: "Tạm đóng", variant: "secondary", className: "bg-gray-200 text-gray-700" };
            case STATION_STATUS.MAINTENANCE:
                return { label: "Bảo trì", variant: "secondary", className: "bg-yellow-100 text-yellow-700" };
            default:
                return { label: "Không rõ", variant: "secondary", className: "bg-gray-200 text-gray-600" };
        }
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50 text-gray-900 overflow-x-hidden">
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
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Tìm trạm gần bạn</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                                Trạm Đổi Pin
                            </span>
                        </h1>
                        <p className="text-lg text-gray-600">Tìm và đặt lịch tại trạm đổi pin gần bạn</p>
                    </motion.div>

                {/* Search & Filter */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeVariants}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-8 space-y-4"
                >
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo tên, địa chỉ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 rounded-xl border-gray-200 shadow-sm"
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2 h-12 px-6 rounded-xl border-gray-200 shadow-sm"
                            onClick={getUserLocation}
                            disabled={isLoadingLocation || nearestMutation.isLoading}
                        >
                            <Navigation className={`h-4 w-4 ${(isLoadingLocation || nearestMutation.isLoading) ? 'animate-spin' : ''}`} />
                            {(isLoadingLocation || nearestMutation.isLoading) ? "Đang lấy vị trí..." : "Tìm gần tôi"}
                        </Button>
                    </div>

                    {/* View Mode Toggle & Location Info */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === "list" ? "default" : "outline"}
                                size="sm"
                                className="gap-2 rounded-lg"
                                onClick={() => setViewMode("list")}
                            >
                                <List className="h-4 w-4" />
                                Danh sách
                            </Button>
                            <Button
                                variant={viewMode === "map" ? "default" : "outline"}
                                size="sm"
                                className="gap-2 rounded-lg"
                                onClick={() => setViewMode("map")}
                            >
                                <MapIcon className="h-4 w-4" />
                                Bản đồ
                            </Button>
                        </div>

                        {userLocation && (
                            <div className="text-sm text-gray-600 bg-emerald-50 px-4 py-2 rounded-lg">
                                <MapPin className="h-4 w-4 inline mr-1 text-emerald-600" />
                                Vị trí: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                                {nearestStations.length > 0 && (
                                    <span className="ml-2 font-semibold text-emerald-700">
                                        • Tìm thấy {nearestStations.length} trạm gần bạn
                                    </span>
                                )}
                                {closestStation && (
                                    <span className="ml-2 text-emerald-700">
                                        • Gần nhất: <span className="font-semibold">{closestStation.stationName}</span>
                                        {typeof closestStation.distanceKm === 'number' && (
                                            <span> (~{closestStation.distanceKm.toFixed(2)} km)</span>
                                        )}
                                    </span>
                                )}
                            </div>
                        )}

                        {locationError && (
                            <div className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                                {locationError}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Map View */}
                {viewMode === "map" && (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <Card className="rounded-3xl overflow-hidden shadow-xl border-gray-100">
                            <CardContent className="p-0">
                                <div className="h-[600px] relative">
                                    <MapContainer
                                        center={userLocation ? [userLocation.latitude, userLocation.longitude] : [10.8231, 106.6297]}
                                        zoom={userLocation ? 13 : 11}
                                        className="h-full w-full"
                                        zoomControl={true}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />

                                        {userLocation && <MapController center={[userLocation.latitude, userLocation.longitude]} />}

                                        {/* User Location Marker */}
                                        {userLocation && (
                                            <Marker
                                                position={[userLocation.latitude, userLocation.longitude]}
                                                icon={userIcon}
                                            >
                                                <Popup>
                                                    <div className="text-center p-2">
                                                        <strong className="text-emerald-600">Vị trí của bạn</strong>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                                                        </p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        )}

                                        {/* Station Markers */}
                                        {(nearestStations.length > 0 ? nearestStations : stations).map((station) => {
                                            if (!station.latitude || !station.longitude) return null;
                                            // const isClosest = String(station.id) === closestStationId; doi voi 1 diem gan nhat
                                            const isClosest = Array.isArray(closestStationId)
                                                ? closestStationId.includes(String(station.id))
                                                : String(station.id) === String(closestStationId);
                                            const markerColor = station.status === "ACTIVE"
                                                ? (isClosest ? "#10b981" : "#3b82f6")
                                                : "#6b7280";

                                            return (
                                                <Marker
                                                    key={station.id}
                                                    position={[station.latitude, station.longitude]}
                                                    icon={createCustomIcon(markerColor)}
                                                >
                                                    <Popup maxWidth={300}>
                                                        <div className="p-3">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h3 className="font-bold text-gray-900 text-base">
                                                                    {station.stationName}
                                                                </h3>
                                                                <div className="flex items-center gap-2">
                                                                    {isClosest && (
                                                                        <Badge className="bg-emerald-100 text-emerald-700 text-xs">Trạm gần nhất</Badge>
                                                                    )}
                                                                    <Badge
                                                                        variant={getStatusDisplay(station.status).variant}
                                                                        className={`text-xs font-medium ${getStatusDisplay(station.status).className}`}
                                                                    >
                                                                        {getStatusDisplay(station.status).label}
                                                                    </Badge>
                                                                </div>
                                                            </div>

                                                            <p className="text-sm text-gray-600 mb-2">
                                                                <MapPin className="inline h-3 w-3 mr-1" />
                                                                {station.address}
                                                            </p>

                                                            <p className="text-sm text-gray-600 mb-2">
                                                                <Battery className="inline h-3 w-3 mr-1" />
                                                                Còn trống: <span className="font-semibold text-emerald-600">{station.availableSlots}/{station.totalSlots}</span>
                                                            </p>

                                                            {station.distanceKm && (
                                                                <p className="text-sm font-semibold text-blue-600 mb-3">
                                                                    Cách bạn: {station.distanceKm.toFixed(2)} km
                                                                </p>
                                                            )}

                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="w-full mt-2 rounded-lg border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                                                                onClick={() => {
                                                                    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${station.latitude},${station.longitude}`;
                                                                    window.open(gmapsUrl, "_blank");
                                                                }}
                                                            >
                                                                Chỉ đường
                                                            </Button>

                                                            <Button
                                                                size="sm"
                                                                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg rounded-lg"
                                                                onClick={() => handleBookNow(station)}
                                                                disabled={station.status !== "ACTIVE" || station.availableSlots === 0}
                                                            >
                                                                {station.status !== "ACTIVE"
                                                                    ? "Tạm đóng"
                                                                    : station.availableSlots === 0
                                                                        ? "Hết chỗ"
                                                                        : "Đặt lịch ngay"}
                                                            </Button>
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            );
                                        })}
                                    </MapContainer>

                                    {/* Map Legend */}
                                    <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-4 z-[1000]">
                                        <h4 className="font-semibold text-sm mb-2">Chú thích:</h4>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500"></div>
                                                <span>Vị trí của bạn</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                                <span>Trạm gần nhất</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                <span>Trạm khác</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                                <span>Tạm đóng</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Stations Grid */}
                {viewMode === "list" && (isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="rounded-3xl">
                                <CardHeader>
                                    <Skeleton className="h-6 w-3/4 mb-2" />
                                    <Skeleton className="h-4 w-full" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-20 w-full" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredStations.length === 0 ? (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeVariants}
                        transition={{ duration: 0.8 }}
                        className="text-center py-16 bg-white rounded-3xl shadow-lg"
                    >
                        <MapPin className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Không tìm thấy trạm đổi pin
                        </h3>
                        <p className="text-gray-500 text-lg">
                            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                        </p>
                    </motion.div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStations.map((station, idx) => (
                                <motion.div
                                    key={station.id}
                                    initial="hidden"
                                    animate="visible"
                                    variants={fadeVariants}
                                    transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                                >
                                    <Card className="hover:shadow-xl transition-all transform hover:-translate-y-2 border-gray-100 rounded-3xl overflow-hidden bg-white">
                                        <CardHeader className="pb-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <CardTitle className="text-xl mb-2 text-gray-800">
                                                        {station.stationName}
                                                    </CardTitle>
                                                    <CardDescription className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="text-gray-600">{station.stationCode || "N/A"}</span>
                                                    </CardDescription>
                                                </div>
                                                <Badge
                                                    variant={getStatusDisplay(station.status).variant}
                                                    className={`font-medium ${getStatusDisplay(station.status).className}`}
                                                >
                                                    {getStatusDisplay(station.status).label}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-3.5 pb-6">
                                            <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
                                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                                                <span className="leading-relaxed">{station.address}</span>
                                            </div>

                                            {station.latitude && station.longitude && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="h-4 w-4 text-emerald-500" />
                                                    <span className="text-xs">
                                                        {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Battery className="h-4 w-4 text-cyan-500" />
                                                <span>
                                                    Số vị trí: <span className="font-semibold text-gray-800">{station.totalSlots || 0}</span> |
                                                    Còn trống: <span className="font-semibold text-emerald-600">{station.availableSlots || 0}</span>
                                                </span>
                                            </div>

                                            {station.phoneNumber && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span className="font-medium">SĐT:</span>
                                                    <span>{station.phoneNumber}</span>
                                                </div>
                                            )}
                                        </CardContent>

                                        <CardFooter className="pt-0">
                                            <Button
                                                className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:shadow-lg transition-all"
                                                onClick={() => handleBookNow(station)}
                                                disabled={station.status !== "ACTIVE" || station.availableSlots === 0}
                                            >
                                                {station.status !== "ACTIVE"
                                                    ? "Tạm đóng cửa"
                                                    : station.availableSlots === 0
                                                        ? "Hết chỗ"
                                                        : "Đặt lịch ngay"
                                                }
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={fadeVariants}
                                transition={{ duration: 0.8 }}
                                className="mt-12 flex justify-center gap-3"
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="h-12 px-6 rounded-xl border-gray-200 shadow-sm font-medium"
                                >
                                    ← Trang trước
                                </Button>
                                <div className="flex items-center px-6 py-3 text-sm text-gray-700 bg-white rounded-xl border border-gray-200 shadow-sm font-medium">
                                    Trang <span className="mx-1.5 font-bold text-emerald-600">{page + 1}</span> / {totalPages}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="h-12 px-6 rounded-xl border-gray-200 shadow-sm font-medium"
                                >
                                    Trang sau →
                                </Button>
                            </motion.div>
                        )}
                    </>
                ))}
            </div>
        </div>

        {/* Booking Dialog */}
        <BookingDialog
            open={isBookingDialogOpen}
            onOpenChange={setIsBookingDialogOpen}
            station={selectedStation}
        />
    </div>
    );
}
import { useState, useEffect } from "react";
import { MapPin, Search, Navigation, Navigation2, Filter } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useCustomQuery from "@/hooks/useCustomQuery";
import { stationApi, STATION_STATUS } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import BookingDialog from "./BookingDialog";
import { toast } from "react-hot-toast";
import useCustomMutation from "@/hooks/useCustomMutation";

export default function StationListPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStation, setSelectedStation] = useState(null);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [nearestStations, setNearestStations] = useState([]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [closestStationId, setClosestStationId] = useState(null);
    const [batteryModelFilter, setBatteryModelFilter] = useState("ALL");
    const [batteryCapacityFilter, setBatteryCapacityFilter] = useState("ALL");
    const [showFilterAlert, setShowFilterAlert] = useState(false);
    const [pendingStation, setPendingStation] = useState(null);

    // Quản lý map instance (giữ cho nút +/-)
    const [mapInstance, setMapInstance] = useState(null);

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

    // Lấy tất cả batteries từ stations để extract unique models và capacities
    const allBatteriesFromStations = stations.flatMap(station => station.batteries || []);

    // Lấy danh sách unique models (loại bỏ trùng lặp)
    const uniqueModels = [...new Set(allBatteriesFromStations.map(b => b.model).filter(Boolean))].sort();

    // Lấy danh sách unique capacities (loại bỏ trùng lặp)
    const uniqueCapacities = [...new Set(allBatteriesFromStations.map(b => b.capacity).filter(Boolean))].sort((a, b) => a - b);

    // Client-side pagination
    // const itemsPerPage = 1000; // lấy nhiều cho sidebar list
    // const paginatedStations = stations.slice(0, itemsPerPage);

    // Nguồn dữ liệu gốc: ưu tiên nearestStations nếu có
    const baseStations = nearestStations.length > 0 ? nearestStations : stations;

    // Áp dụng bộ lọc tìm kiếm + trạng thái ACTIVE + batteries
    const filteredStations = baseStations.filter((station) => {
        const matchSearch = (
            station.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            station.address?.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Chỉ hiển thị trạm ACTIVE
        const matchStatus = String(station.status) === String(STATION_STATUS.ACTIVE);

        // Lọc theo battery hold: chỉ hiển thị station có ít nhất 1 battery hold = false
        const batteries = station.batteries || [];
        const hasNonHoldBattery = batteries.some(battery => battery.hold === false);

        // Kiểm tra batteries theo model và capacity
        let matchBattery;
        if (batteryModelFilter !== 'ALL' || batteryCapacityFilter !== 'ALL') {
            // Lọc batteries có SOC = 100, SOH = 100 và status = IN_USE
            const qualifiedBatteries = batteries.filter(b =>
                b.soc === 100 &&
                b.soh === 100 &&
                b.status === 'IN_USE' &&
                b.hold === false
            );
            matchBattery = qualifiedBatteries.some(battery => {
                const modelMatch = batteryModelFilter === 'ALL' || battery.model === batteryModelFilter;
                const capacityMatch = batteryCapacityFilter === 'ALL' || String(battery.capacity) === String(batteryCapacityFilter);
                return modelMatch && capacityMatch;
            });
        } else {
            // Nếu không filter, chỉ kiểm tra có ít nhất 1 battery đạt chuẩn (IN_USE, hold = false)
            matchBattery = batteries.some(b => b.soc === 100 && b.soh === 100 && b.status === 'IN_USE' && b.hold === false);
        }

        return matchSearch && matchStatus && hasNonHoldBattery && matchBattery;
    });

    // Giới hạn số phần tử cho danh sách bên trái
    const listStations = filteredStations.slice(0, 50);

    const handleBookNow = (station) => {
        // Kiểm tra nếu cả model và capacity đều chưa được filter
        if (batteryModelFilter === 'ALL' && batteryCapacityFilter === 'ALL') {
            setPendingStation(station);
            setShowFilterAlert(true);
        } else {
            setSelectedStation(station);
            setIsBookingDialogOpen(true);
        }
    };

    const handleContinueWithoutFilter = () => {
        setSelectedStation(pendingStation);
        setShowFilterAlert(false);
        setIsBookingDialogOpen(true);
        setPendingStation(null);
    };

    const handleBackToFilter = () => {
        setShowFilterAlert(false);
        setPendingStation(null);
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
    // const closestStation = closestStationId ? nearestStations.find(ns => ns.id === closestStationId) : null; // bỏ không dùng

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
        <div className="min-h-screen w-full bg-slate-50 text-slate-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Sidebar trái */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeVariants}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-3xl font-bold tracking-tight mb-3 text-slate-900">Tìm trạm đổi pin</h1>
                            <p className="text-slate-600 mb-4">Tiếp tục hành trình của bạn một cách liền mạch.</p>
                            <div className="relative flex items-center mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                <Input
                                    className="w-full rounded-full h-12 pl-12 pr-4 border border-slate-300 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                                    placeholder="Nhập tên hoặc địa chỉ..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={getUserLocation}
                                    disabled={isLoadingLocation || nearestMutation.isLoading}
                                    className="rounded-full h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
                                >
                                    <Navigation className={`h-4 w-4 ${(isLoadingLocation || nearestMutation.isLoading) ? 'animate-spin' : ''}`} />
                                    {(isLoadingLocation || nearestMutation.isLoading) ? 'Đang lấy vị trí...' : 'Tìm gần tôi'}
                                </Button>
                                {userLocation && nearestStations.length > 0 && (
                                    <div className="flex items-center px-4 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                                        {nearestStations.length} trạm gần
                                    </div>
                                )}
                            </div>
                            {locationError && (
                                <div className="mt-3 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{locationError}</div>
                            )}
                        </motion.div>

                        {/* Bộ lọc theo pin */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeVariants}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="space-y-4 rounded-xl bg-white p-4 border border-slate-200"
                        >
                            <h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900">Bộ lọc pin</h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                                <p className="font-semibold mb-1">📌 Lưu ý:</p>
                                <p>Chỉ hiển thị trạm có pin đạt chuẩn: SOC = 100% & SOH = 100%</p>
                            </div>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700" htmlFor="model-filter">Model pin</label>
                                    <select
                                        id="model-filter"
                                        value={batteryModelFilter}
                                        onChange={(e)=>setBatteryModelFilter(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 bg-white text-slate-800 focus:border-blue-600 focus:ring-blue-600 text-sm h-10"
                                    >
                                        <option value="ALL">Tất cả model</option>
                                        {uniqueModels.map((model) => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700" htmlFor="capacity-filter">Dung lượng (kWh)</label>
                                    <select
                                        id="capacity-filter"
                                        value={batteryCapacityFilter}
                                        onChange={(e)=>setBatteryCapacityFilter(e.target.value)}
                                        className="w-full rounded-lg border-slate-300 bg-white text-slate-800 focus:border-blue-600 focus:ring-blue-600 text-sm h-10"
                                    >
                                        <option value="ALL">Tất cả dung lượng</option>
                                        {uniqueCapacities.map((capacity) => (
                                            <option key={capacity} value={capacity}>{capacity} kWh</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-full h-10 px-4 text-sm font-bold"
                                        onClick={()=>{
                                            setSearchQuery('');
                                            setBatteryModelFilter('ALL');
                                            setBatteryCapacityFilter('ALL');
                                        }}
                                    >
                                        Đặt lại bộ lọc
                                    </Button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Danh sách trạm */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeVariants}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="space-y-3"
                        >
                            { (listStations).map((station) => {
                                const isNearest = Array.isArray(closestStationId) ? closestStationId.includes(String(station.id)) : false;
                                const statusInfo = getStatusDisplay(station.status);
                                const distance = station.distanceKm;

                                return (
                                    <div
                                        key={station.id}
                                        className={`rounded-xl bg-white p-4 border-2 border-transparent hover:border-blue-600 hover:shadow-lg transition-all duration-300`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-slate-900 truncate pr-2">{station.stationName}</h4>
                                            {distance && (
                                                <span className="text-sm text-blue-600 font-semibold">{distance.toFixed(2)} km</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 mb-1 flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 text-slate-400" /> {station.address}
                                        </p>
                                        <p className="text-xs mb-2 text-slate-500">Mã: <span className="font-medium text-slate-700">{station.stationCode || 'N/A'}</span></p>
                                        <div className="flex items-center gap-2 flex-wrap mb-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.className}`}>{statusInfo.label}</span>
                                            {isNearest && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Gần bạn</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 rounded-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                                                disabled={station.status !== 'ACTIVE'}
                                                onClick={() => handleBookNow(station)}
                                            >
                                                {station.status !== 'ACTIVE' ? 'Tạm đóng' : 'Đặt lịch ngay'}
                                            </Button>
                                            {userLocation && station.latitude && station.longitude && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="rounded-full h-9 px-4 text-xs font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${station.latitude},${station.longitude}`;
                                                        window.open(gmapsUrl, "_blank");
                                                    }}
                                                >
                                                    <Navigation2 className="h-4 w-4" />
                                                    Chỉ đường
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredStations.length === 0 && nearestStations.length === 0 && !isLoading && (
                                <div className="rounded-xl bg-white p-6 border border-slate-200 text-center">
                                    <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600">Không tìm thấy trạm phù hợp.</p>
                                </div>
                            )}
                            {isLoading && (
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="rounded-xl bg-white p-4 border border-slate-200 animate-pulse h-24" />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Khu vực bản đồ */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="sticky top-24">
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={fadeVariants}
                                transition={{ duration: 0.6, delay: 0.15 }}
                                className="relative h-[calc(100vh-8rem)] min-h-[500px] w-full overflow-hidden rounded-xl shadow-lg border border-slate-200 z-[1]"
                            >
                                {/* Map Leaflet */}
                                <MapContainer
                                    center={userLocation ? [userLocation.latitude, userLocation.longitude] : [10.8231, 106.6297]}
                                    zoom={userLocation ? 13 : 11}
                                    className="h-full w-full"
                                    zoomControl={false}
                                    whenCreated={(m)=> setMapInstance(m)}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {userLocation && <MapController center={[userLocation.latitude, userLocation.longitude]} />}

                                    {userLocation && (
                                        <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                                            <Popup>
                                                <div className="text-center p-2">
                                                    <strong className="text-emerald-600">Vị trí của bạn</strong>
                                                    <p className="text-xs text-slate-600 mt-1">{userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )}

                                    {(filteredStations).map((station) => {
                                        if (!station.latitude || !station.longitude) return null;
                                        const isNearest = Array.isArray(closestStationId) ? closestStationId.includes(String(station.id)) : false;
                                        let markerColor = '#6b7280';
                                        if (String(station.status) === 'MAINTENANCE') markerColor = '#eab308';
                                        else if (String(station.status) === 'ACTIVE') markerColor = isNearest ? '#10b981' : '#2563EB';
                                        return (
                                            <Marker key={station.id} position={[station.latitude, station.longitude]} icon={createCustomIcon(markerColor)}>
                                                <Popup maxWidth={280}>
                                                    <div className="p-2">
                                                        <h5 className="font-bold text-slate-900 mb-1">{station.stationName}</h5>
                                                        <p className="text-xs text-slate-600 mb-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{station.address}</p>
                                                        {station.distanceKm && (
                                                            <p className="text-xs text-blue-600 font-semibold mb-1">Cách bạn: {station.distanceKm.toFixed(2)} km</p>
                                                        )}
                                                        <p className="text-xs mb-2"><span className="font-semibold text-emerald-600">Còn trống:</span> {station.availableSlots}/{station.totalSlots}</p>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 rounded-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                                                                disabled={station.status !== 'ACTIVE' || station.availableSlots === 0}
                                                                onClick={() => handleBookNow(station)}
                                                            >
                                                                {station.status !== 'ACTIVE' ? 'Tạm đóng' : station.availableSlots === 0 ? 'Hết chỗ' : 'Đặt lịch ngay'}
                                                            </Button>
                                                            {userLocation && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="rounded-full h-9 px-3 text-xs font-semibold border-blue-600 text-blue-600 hover:bg-blue-50"
                                                                    onClick={() => {
                                                                        const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${station.latitude},${station.longitude}`;
                                                                        window.open(gmapsUrl, "_blank");
                                                                    }}
                                                                >
                                                                    <Navigation2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        );
                                    })}
                                </MapContainer>

                                {/* Legend & Controls */}
                                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
                                    <div className="flex flex-col rounded-lg bg-white shadow-md border border-slate-200">
                                        <button
                                            className="flex size-10 items-center justify-center rounded-t-lg hover:bg-slate-100"
                                            onClick={() => { if (mapInstance) { mapInstance.zoomIn(); } }}
                                        >
                                            <span className="text-slate-600">+</span>
                                        </button>
                                        <button
                                            className="flex size-10 items-center justify-center rounded-b-lg border-t border-slate-200 hover:bg-slate-100"
                                            onClick={() => { if (mapInstance) { mapInstance.zoomOut(); } }}
                                        >
                                            <span className="text-slate-600">-</span>
                                        </button>
                                    </div>
                                    <button
                                        className="flex size-10 items-center justify-center rounded-lg bg-white shadow-md hover:bg-slate-100 border border-slate-200"
                                        onClick={() => { getUserLocation(); }}
                                        disabled={isLoadingLocation || nearestMutation.isLoading}
                                    >
                                        <MapPin className={`h-5 w-5 ${isLoadingLocation || nearestMutation.isLoading ? 'animate-ping text-blue-600' : 'text-slate-600'}`} />
                                    </button>
                                </div>

                                {/* Chú thích luôn hiển thị */}
                                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 border border-slate-200 text-xs space-y-1 z-[3000]">
                                    <div className="font-semibold mb-1 text-slate-700">Chú thích:</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" />Vị trí của bạn</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-400" />Trạm gần bạn</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600" />Trạm khác</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500" />Bảo trì</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-500" />Tạm đóng</div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Dialog khuyến khích chọn filter */}
            <AlertDialog open={showFilterAlert} onOpenChange={setShowFilterAlert}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5 text-blue-600" />
                            Khuyến khích chọn filter pin
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                            <p>
                                Bạn chưa chọn filter theo <strong>Model pin</strong> hoặc <strong>Dung lượng</strong>.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                <p className="font-semibold mb-2">💡 Lợi ích khi chọn filter:</p>
                                <ul className="list-disc ml-5 space-y-1">
                                    <li>Tìm được pin phù hợp với xe của bạn</li>
                                    <li>Đảm bảo có pin khả dụng khi đến trạm</li>
                                    <li>Tiết kiệm thời gian chờ đợi</li>
                                    <li>Tự động chọn pin đúng model khi đặt lịch</li>
                                </ul>
                            </div>
                            <p className="text-sm">
                                Bạn có muốn quay lại để chọn filter phù hợp không?
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleBackToFilter}>
                            Quay lại chọn filter
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleContinueWithoutFilter}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Tiếp tục không chọn filter
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Booking Dialog */}
            <BookingDialog
                open={isBookingDialogOpen}
                onOpenChange={setIsBookingDialogOpen}
                station={selectedStation}
                filterModel={batteryModelFilter}
                filterCapacity={batteryCapacityFilter}
            />
        </div>
    );
}

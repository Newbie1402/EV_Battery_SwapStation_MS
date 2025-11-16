import { useState, useEffect } from "react";
import { MapPin, Battery, Phone, CheckCircle, XCircle, AlertCircle, Navigation2, Edit } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import useCustomQuery from "@/hooks/useCustomQuery";
import { stationApi } from "@/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Component để center map
function MapController({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 12);
        }
    }, [center, map]);
    return null;
}

export default function StationMapView({ onEditStation }) {
    const [mapCenter, setMapCenter] = useState([10.8231, 106.6297]); // TP.HCM default
    const [selectedStation, setSelectedStation] = useState(null);

    // Fetch danh sách stations
    const { data: stationsWrapper, isLoading } = useCustomQuery(
        ["admin-stations-map"],
        () => stationApi.getAllStations()
    );

    const stationsData = stationsWrapper?.data || stationsWrapper || [];
    const stations = Array.isArray(stationsData) ? stationsData : [];

    // Tính center dựa trên tất cả stations
    useEffect(() => {
        if (stations.length > 0) {
            const validStations = stations.filter(s => s.latitude && s.longitude);
            if (validStations.length > 0) {
                const avgLat = validStations.reduce((sum, s) => sum + s.latitude, 0) / validStations.length;
                const avgLng = validStations.reduce((sum, s) => sum + s.longitude, 0) / validStations.length;
                setMapCenter([avgLat, avgLng]);
            }
        }
    }, [stations]);

    // Custom Leaflet icons theo status
    const createCustomIcon = (status) => {
        let color;
        switch (status) {
            case "ACTIVE":
                color = "#10b981"; // emerald-500
                break;
            case "OFFLINE":
                color = "#ef4444"; // red-500
                break;
            case "MAINTENANCE":
                color = "#f59e0b"; // amber-500
                break;
            default:
                color = "#6b7280"; // gray-500
        }

        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 30],
        });
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

    // Thống kê
    const activeStations = stations.filter(s => s.status === "ACTIVE").length;
    const offlineStations = stations.filter(s => s.status === "OFFLINE").length;
    const maintenanceStations = stations.filter(s => s.status === "MAINTENANCE").length;

    return (
        <>
            {/* Legends */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-green-700">
                        Hoạt động ({activeStations})
                    </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span className="text-sm font-medium text-red-700">
                        Ngừng hoạt động ({offlineStations})
                    </span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                    <span className="text-sm font-medium text-yellow-700">
                        Bảo trì ({maintenanceStations})
                    </span>
                </div>
            </div>

            {/* Map */}
            <Card className="border border-gray-200 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="h-[700px] flex items-center justify-center bg-gray-50">
                            <div className="text-center">
                                <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
                                <p className="text-gray-500">Đang tải bản đồ...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[700px] relative">
                            <MapContainer
                                whenCreated={(map) => (window.__leaflet_map__ = map)}
                                center={mapCenter}
                                zoom={12}
                                className="h-full w-full"
                                zoomControl={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <MapController center={mapCenter} />

                                {/* Station Markers */}
                                {stations.map((station) => {
                                    if (!station.latitude || !station.longitude) return null;

                                    const statusInfo = getStatusBadge(station.status);
                                    const StatusIcon = statusInfo.icon;

                                    return (
                                        <Marker
                                            key={station.id}
                                            position={[station.latitude, station.longitude]}
                                            icon={createCustomIcon(station.status)}
                                            eventHandlers={{
                                                click: () => setSelectedStation(station),
                                            }}
                                        >
                                            <Popup maxWidth={320} className="custom-popup">
                                                <div className="p-3">
                                                    {/* Header */}
                                                    <div className="mb-3">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="font-bold text-gray-900 text-lg flex-1">
                                                                {station.stationName}
                                                            </h3>
                                                            <Badge className={`font-medium ${statusInfo.color} flex items-center gap-1 ml-2`}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                {statusInfo.label}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Mã: {station.stationCode}
                                                        </p>
                                                    </div>

                                                    {/* Info */}
                                                    <div className="space-y-2 mb-3">
                                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                                            <span>{station.address}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                                            <span>{station.phoneNumber || "Chưa có"}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Battery className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                                            <span>
                                                                Slots: <span className={station.availableSlots > 0 ? "font-semibold text-emerald-600" : "font-semibold text-red-600"}>
                                                                    {station.availableSlots}
                                                                </span>/{station.totalSlots}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1"
                                                            onClick={() => {
                                                                const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${station.latitude},${station.longitude}`;
                                                                window.open(gmapsUrl, "_blank");
                                                            }}
                                                        >
                                                            <Navigation2 className="w-4 h-4 mr-1" />
                                                            Chỉ đường
                                                        </Button>
                                                        {onEditStation && (
                                                            <Button
                                                                size="sm"
                                                                className="flex-1 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                                                                onClick={() => {
                                                                    onEditStation(station);
                                                                }}
                                                            >
                                                                <Edit className="w-4 h-4 mr-1" />
                                                                Sửa
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Selected Station Info */}
            {selectedStation && (
                <Card className="border border-gray-200 shadow-lg mt-6">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                    {selectedStation.stationName}
                                </h3>
                                <p className="text-sm text-gray-500">Mã: {selectedStation.stationCode}</p>
                            </div>
                            <Badge className={`font-medium ${getStatusBadge(selectedStation.status).color} flex items-center gap-1`}>
                                {(() => {
                                    const StatusIcon = getStatusBadge(selectedStation.status).icon;
                                    return <StatusIcon className="w-3 h-3" />;
                                })()}
                                {getStatusBadge(selectedStation.status).label}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Địa chỉ</p>
                                <p className="font-semibold text-gray-900">{selectedStation.address}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
                                <p className="font-semibold text-gray-900">{selectedStation.phoneNumber || "Chưa có"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Slots khả dụng</p>
                                <p className="font-semibold text-gray-900">
                                    {selectedStation.availableSlots}/{selectedStation.totalSlots}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Tọa độ</p>
                                <p className="font-semibold text-gray-900 text-sm">
                                    {selectedStation.latitude?.toFixed(6)}, {selectedStation.longitude?.toFixed(6)}
                                </p>
                            </div>
                        </div>

                        {onEditStation && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Button
                                    onClick={() => onEditStation(selectedStation)}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Chỉnh sửa trạm
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <style>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    border-radius: 12px;
                    padding: 0;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    min-width: 280px;
                }
                .custom-marker {
                    background: transparent;
                    border: none;
                }
                .leaflet-container {
                    z-index: 50 !important;
                }

                /* tránh bị Dialog clip */
                .leaflet-popup {
                z-index: 10000 !important;
                }

                /* tránh overflow khi map trong modal */
                .leaflet-popup-content-wrapper {
                    overflow: visible !important;
                }
            `}</style>
        </>
    );
}


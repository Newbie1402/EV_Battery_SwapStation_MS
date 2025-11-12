import { useState } from "react";
import { MapPin, Clock, Battery, Search, Filter } from "lucide-react";
import useCustomQuery from "@/hooks/useCustomQuery";
import { stationApi } from "@/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import BookingDialog from "./BookingDialog";

export default function StationListPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStation, setSelectedStation] = useState(null);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [page, setPage] = useState(0);

    // Fetch danh sách stations
    const { data, isLoading } = useCustomQuery(
        ["stations", page],
        () => stationApi.getAllStations(page, 12)
    );

    const stations = data?.content || [];
    const totalPages = data?.totalPages || 0;

    // Filter stations theo search query
    const filteredStations = stations.filter(station =>
        station.stationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBookNow = (station) => {
        setSelectedStation(station);
        setIsBookingDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Trạm Đổi Pin</h1>
                    <p className="text-gray-600">Tìm và đặt lịch tại trạm đổi pin gần bạn</p>
                </div>

                {/* Search & Filter */}
                <div className="mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo tên, địa chỉ, thành phố..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Bộ lọc
                    </Button>
                </div>

                {/* Stations Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i}>
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
                    <div className="text-center py-12">
                        <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Không tìm thấy trạm đổi pin
                        </h3>
                        <p className="text-gray-500">
                            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStations.map((station) => (
                                <Card key={station.stationId} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl mb-1">
                                                    {station.stationName}
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {station.city}
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                variant={station.status === "ACTIVE" ? "success" : "secondary"}
                                                className={station.status === "ACTIVE" ? "bg-green-100 text-green-800" : ""}
                                            >
                                                {station.status === "ACTIVE" ? "Hoạt động" : "Tạm đóng"}
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        <div className="flex items-start gap-2 text-sm text-gray-600">
                                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>{station.address}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {station.openingHours || "24/7"}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Battery className="h-4 w-4" />
                                            <span>
                                                Số vị trí: {station.totalSlots || 0} |
                                                Còn trống: {station.availableSlots || 0}
                                            </span>
                                        </div>

                                        {station.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span className="font-medium">SĐT:</span>
                                                <span>{station.phone}</span>
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter>
                                        <Button
                                            className="w-full"
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
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    Trang trước
                                </Button>
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Trang {page + 1} / {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                >
                                    Trang sau
                                </Button>
                            </div>
                        )}
                    </>
                )}
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


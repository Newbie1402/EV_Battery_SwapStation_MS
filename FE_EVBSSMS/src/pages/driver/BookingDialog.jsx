import { useState, useEffect } from "react";
import { Calendar, Clock, Battery, FileText } from "lucide-react";
import useCustomMutation from "@/hooks/useCustomMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import { bookingApi, stationApi, subscriptionPackageApi } from "@/api";
import { useAuthStore } from "@/store/authStore";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

export default function BookingDialog({ open, onOpenChange, station, filterModel, filterCapacity }) {
    const { employeeId } = useAuthStore();
    const [scheduledTime, setScheduledTime] = useState("");
    const [selectedBatteryCode, setSelectedBatteryCode] = useState("");
    const [batteryModel, setBatteryModel] = useState("");
    const [batteryCapacity, setBatteryCapacity] = useState("");
    const [paymentType, setPaymentType] = useState("PER_SWAP");
    const [activePackageId, setActivePackageId] = useState(null);
    const [activePackageInfo, setActivePackageInfo] = useState(null);
    const [notes, setNotes] = useState("");
    const [showBatteryAlert, setShowBatteryAlert] = useState(false);

    // Fetch batteries của trạm
    const { data: stationBatteries, isLoading: isLoadingBatteries } = useCustomQuery(
        ["stationBatteries", station?.stationCode],
        () => stationApi.getBatteriesByStationCode(station?.stationCode),
        { enabled: !!station?.stationCode }
    );

    // Lọc chỉ lấy batteries đạt chuẩn: SOC = 100, SOH = 100 và status = IN_USE
    const availableBatteries = (stationBatteries || []).filter(
        (battery) => battery.soc === 100 && battery.soh === 100 && battery.status === 'IN_USE'
    );

    // Tự động chọn battery phù hợp với filter (nếu có)
    useEffect(() => {
        if (open && availableBatteries.length > 0) {
            // Nếu có filter từ StationListPage
            if (filterModel && filterModel !== 'ALL' || filterCapacity && filterCapacity !== 'ALL') {
                // Tìm battery khớp với filter
                const matchedBattery = availableBatteries.find(battery => {
                    const modelMatch = !filterModel || filterModel === 'ALL' || battery.model === filterModel;
                    const capacityMatch = !filterCapacity || filterCapacity === 'ALL' || String(battery.capacity) === String(filterCapacity);
                    return modelMatch && capacityMatch;
                });

                if (matchedBattery) {
                    setSelectedBatteryCode(matchedBattery.batteryCode);
                    // Tự động điền thông tin pin vào form
                    setBatteryModel(matchedBattery.model);
                    setBatteryCapacity(String(matchedBattery.capacity));
                }
            }
        }
    }, [open, availableBatteries, filterModel, filterCapacity]);

    // Query lấy gói đăng ký ACTIVE của user
    const { data: activeSubscriptionData } = useCustomQuery(
        ["activeSubscription", employeeId],
        () => subscriptionPackageApi.getActiveSubscriptionByUserId(employeeId),
        { enabled: !!employeeId }
    );

    // Cập nhật paymentType nếu có gói
    useEffect(() => {
        if (activeSubscriptionData && activeSubscriptionData.status === 'ACTIVE') {
            setPaymentType('PACKAGE');
            setActivePackageId(activeSubscriptionData.id || activeSubscriptionData.subscriptionId || null);
            setActivePackageInfo(activeSubscriptionData);
        } else {
            setPaymentType('PER_SWAP');
            setActivePackageId(null);
            setActivePackageInfo(null);
        }
    }, [activeSubscriptionData]);

    // Create booking mutation
    const createBookingMutation = useCustomMutation(
        (data) => bookingApi.createBooking(data),
        null,
        {
            onSuccess: () => {
                toast.success("Đặt lịch thành công!");
                resetForm();
                onOpenChange(false);
            },
        }
    );

    const resetForm = () => {
        setScheduledTime("");
        setSelectedBatteryCode("");
        setBatteryModel("");
        setBatteryCapacity("");
        setPaymentType("PER_SWAP");
        setNotes("");
        setShowBatteryAlert(false);
    };

    // Set default scheduled time (30 phút từ bây giờ)
    useEffect(() => {
        if (open) {
            const now = new Date();
            now.setMinutes(now.getMinutes() + 30);
            const defaultTime = now.toISOString().slice(0, 16);
            setScheduledTime(defaultTime);
        }
    }, [open]);

    const handleSubmit = () => {
        if (!employeeId) {
            toast.error("Vui lòng đăng nhập để đặt lịch");
            return;
        }

        if (!scheduledTime) {
            toast.error("Vui lòng chọn thời gian");
            return;
        }

        // Nếu chưa chọn battery, hiển thị alert khuyến khích
        if (!selectedBatteryCode && !showBatteryAlert) {
            setShowBatteryAlert(true);
            return;
        }

        if (!batteryModel || !batteryCapacity) {
            toast.error("Vui lòng nhập model và dung lượng pin của bạn");
            return;
        }

        // Tạo notes với thông tin battery của xe
        const batteryInfo = `Model pin: ${batteryModel}, Dung lượng: ${batteryCapacity}kWh${selectedBatteryCode ? `, Pin yêu cầu: ${selectedBatteryCode}` : ''}`;
        const fullNotes = notes ? `${notes}\n---\n${batteryInfo}` : batteryInfo;

        const bookingData = {
            driverId: employeeId,
            stationId: station.stationCode,
            batteryModelId: selectedBatteryCode || null,
            scheduledTime: new Date(scheduledTime).toISOString(),
            paymentType: activePackageId ? 'PACKAGE' : paymentType,
            notes: fullNotes,
            packageId: activePackageId || undefined,
        };

        createBookingMutation.mutate(bookingData);
    };

    if (!station) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Đặt lịch đổi pin</DialogTitle>
                    <DialogDescription>
                        Điền thông tin để đặt lịch tại {station.stationName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Station Info + Subscription Status */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm text-gray-900">
                            {station.stationName}
                        </h4>
                        <p className="text-sm text-gray-600">{station.address}</p>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs">
                                {station.stationCode}
                            </Badge>
                            <Badge
                                variant="success"
                                className="text-xs bg-green-100 text-green-800"
                            >
                                {availableBatteries.length} pin khả dụng
                            </Badge>
                            {activePackageInfo ? (
                                <Badge className="text-xs bg-purple-100 text-purple-700 border border-purple-200">
                                    Gói: {activePackageInfo.packagePlanName || activePackageInfo.packageName || 'Đang hoạt động'}
                                </Badge>
                            ) : (
                                <Badge className="text-xs bg-orange-100 text-orange-700 border border-orange-200">
                                    Chưa có gói - Trả theo lần
                                </Badge>
                            )}
                        </div>
                        {activePackageInfo && (
                            <div className="text-[11px] text-purple-700 mt-1 flex flex-wrap gap-3">
                                <span>Lượt đã dùng: {activePackageInfo.usedSwaps ?? 0}/{activePackageInfo.packageMaxSwapPerMonth ?? 'N/A'}</span>
                                {activePackageInfo.endDate && (
                                    <span>Hết hạn: {new Date(activePackageInfo.endDate).toLocaleDateString('vi-VN')}</span>
                                )}
                                {activePackageInfo.autoExtend && <span className="text-green-600">Tự động gia hạn</span>}
                            </div>
                        )}
                    </div>

                    {/* Thông tin pin của xe */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Thông tin pin xe của bạn</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label htmlFor="batteryModel" className="text-xs">
                                    Model pin <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="batteryModel"
                                    placeholder="VD: Tesla Model S"
                                    value={batteryModel}
                                    onChange={(e) => setBatteryModel(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="batteryCapacity" className="text-xs">
                                    Dung lượng (kWh) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="batteryCapacity"
                                    type="number"
                                    placeholder="VD: 75"
                                    value={batteryCapacity}
                                    onChange={(e) => setBatteryCapacity(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Available Batteries Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="batterySelection" className="flex items-center gap-2">
                            <Battery className="h-4 w-4" />
                            Chọn pin cụ thể (khuyến khích)
                        </Label>
                        {isLoadingBatteries ? (
                            <p className="text-sm text-gray-500">Đang tải danh sách pin...</p>
                        ) : availableBatteries.length === 0 ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                                Không có pin khả dụng (SOC = 100%, SOH = 100%, IN_USE) tại trạm này
                            </div>
                        ) : (
                            <>
                                {/* Hiển thị filter đang áp dụng */}
                                {(filterModel && filterModel !== 'ALL') || (filterCapacity && filterCapacity !== 'ALL') ? (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700 mb-2">
                                        <span className="font-semibold">Filter đang áp dụng:</span>
                                        {filterModel && filterModel !== 'ALL' && <span> Model: {filterModel}</span>}
                                        {filterCapacity && filterCapacity !== 'ALL' && <span> | Capacity: {filterCapacity} kWh</span>}
                                    </div>
                                ) : null}

                                <Select value={selectedBatteryCode || "AUTO"} onValueChange={(value) => setSelectedBatteryCode(value === "AUTO" ? "" : value)}>
                                    <SelectTrigger id="batterySelection">
                                        <SelectValue placeholder="Chọn pin hoặc để trống để hệ thống tự chọn"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AUTO">
                                            {(filterModel && filterModel !== 'ALL') || (filterCapacity && filterCapacity !== 'ALL')
                                                ? 'Bỏ chọn - Để hệ thống tự động chọn'
                                                : 'Để hệ thống tự động chọn'}
                                        </SelectItem>
                                        {availableBatteries.map((battery) => (
                                            <SelectItem key={battery.batteryCode} value={battery.batteryCode}>
                                                {battery.batteryCode} - {battery.model} ({battery.capacity}kWh) - SOC: {battery.soc}%
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </>
                        )}
                        <p className="text-xs text-gray-500">
                            Chọn pin cụ thể để đảm bảo có pin phù hợp khi đến trạm
                        </p>
                    </div>

                    {/* Scheduled Time */}
                    <div className="space-y-2">
                        <Label htmlFor="scheduledTime" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Thời gian đến <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="scheduledTime"
                            type="datetime-local"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                        <p className="text-xs text-gray-500">
                            Chọn thời gian bạn dự định đến trạm
                        </p>
                    </div>

                    {/* Payment Type (tự động nếu có gói) */}
                    <div className="space-y-2">
                        <Label htmlFor="paymentType" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Hình thức thanh toán
                        </Label>
                        <Select value={paymentType} onValueChange={setPaymentType} disabled={!!activePackageId}>
                            <SelectTrigger id="paymentType">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PER_SWAP">Trả theo lần</SelectItem>
                                <SelectItem value="PACKAGE" disabled>Gói (tự động)</SelectItem>
                            </SelectContent>
                        </Select>
                        {activePackageId && (
                            <p className="text-xs text-purple-600">Bạn đang sử dụng gói. Thanh toán tự động bằng gói hiện tại.</p>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Ghi chú (không bắt buộc)
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Nhập ghi chú nếu có..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={createBookingMutation.isLoading}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={createBookingMutation.isLoading}
                    >
                        {createBookingMutation.isLoading ? "Đang đặt..." : "Xác nhận đặt lịch"}
                    </Button>
                </DialogFooter>
            </DialogContent>

        </Dialog>
    );
}

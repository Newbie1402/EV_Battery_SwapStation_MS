import { useState, useEffect } from "react";
import { Calendar, Clock, Battery, FileText } from "lucide-react";
import useCustomMutation from "@/hooks/useCustomMutation";
import useCustomQuery from "@/hooks/useCustomQuery";
import { bookingApi, batteriesApi } from "@/api";
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

export default function BookingDialog({ open, onOpenChange, station }) {
    const { userId } = useAuthStore();
    const [scheduledTime, setScheduledTime] = useState("");
    const [batteryModelId, setBatteryModelId] = useState("");
    const [paymentType, setPaymentType] = useState("PER_SWAP");
    const [notes, setNotes] = useState("");

    // Fetch battery models
    const { data: batteryModelsData } = useCustomQuery(
        ["batteryModels"],
        () => batteriesApi.getAllBatteryModels(0, 100)
    );

    const batteryModels = batteryModelsData?.content || [];

    // Create booking mutation
    const createBookingMutation = useCustomMutation(
        (data) => bookingApi.createBooking(data),
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
        setBatteryModelId("B01");
        setPaymentType("PER_SWAP");
        setNotes("");
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
        if (!userId) {
            toast.error("Vui lòng đăng nhập để đặt lịch");
            return;
        }

        if (!scheduledTime) {
            toast.error("Vui lòng chọn thời gian");
            return;
        }

        const bookingData = {
            driverId: userId,
            stationId: station.stationId,
            batteryModelId,
            scheduledTime: new Date(scheduledTime).toISOString(),
            paymentType,
            notes: notes || null,
        };

        createBookingMutation.mutate(bookingData);
    };

    if (!station) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Đặt lịch đổi pin</DialogTitle>
                    <DialogDescription>
                        Điền thông tin để đặt lịch tại {station.stationName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Station Info */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <h4 className="font-semibold text-sm text-gray-900">
                            {station.stationName}
                        </h4>
                        <p className="text-sm text-gray-600">{station.address}</p>
                        <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                                {station.city}
                            </Badge>
                            <Badge
                                variant="success"
                                className="text-xs bg-green-100 text-green-800"
                            >
                                Còn {station.availableSlots || 0} chỗ
                            </Badge>
                        </div>
                    </div>

                    {/* Battery Model Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="batteryModel" className="flex items-center gap-2">
                            <Battery className="h-4 w-4" />
                            Loại pin <span className="text-red-500">*</span>
                        </Label>
                        <Select value={batteryModelId} onValueChange={setBatteryModelId}>
                            <SelectTrigger id="batteryModel">
                                <SelectValue placeholder="Chọn loại pin của bạn"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="B01">
                                    B01 - Pin tiêu chuẩn 50kWh (240V)
                                </SelectItem>
                                {/*{batteryModels.map((model) => (*/}
                                {/*    <SelectItem key={model.batteryModelId} value={model.batteryModelId}>*/}
                                {/*        {model.modelName} - {model.capacity}kWh*/}
                                {/*        ({model.voltage}V)*/}
                                {/*    </SelectItem>*/}
                                {/*))}*/}
                            </SelectContent>
                        </Select>
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

                    {/* Payment Type */}
                    <div className="space-y-2">
                        <Label htmlFor="paymentType" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Hình thức thanh toán
                        </Label>
                        <Select value={paymentType} onValueChange={setPaymentType}>
                            <SelectTrigger id="paymentType">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PER_SWAP">Trả theo lần</SelectItem>
                                <SelectItem value="MONTHLY_PACKAGE">Gói tháng</SelectItem>
                            </SelectContent>
                        </Select>
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

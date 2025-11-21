import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Battery, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SwapLogDialog({
    open,
    onOpenChange,
    booking,
    batteryInfo,
    stationId,
    onSwapComplete,
    isLoading,
}) {
    const [formData, setFormData] = useState({
        oldBatteryId: "",
        vehicleId: "",
        soc: "",
        soh: "",
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error khi user nhập
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.oldBatteryId.trim()) {
            newErrors.oldBatteryId = "Vui lòng nhập mã pin cũ";
        }
        if (!formData.vehicleId.trim()) {
            newErrors.vehicleId = "Vui lòng nhập biển số xe";
        }
        if (!formData.soc || formData.soc < 0 || formData.soc > 100) {
            newErrors.soc = "SOC phải từ 0-100";
        }
        if (!formData.soh || formData.soh < 0 || formData.soh > 100) {
            newErrors.soh = "SOH phải từ 0-100";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        const swapData = {
            oldBatteryId: formData.oldBatteryId.trim(),
            newBatteryId: booking.batteryModelId, // Lấy từ booking
            vehicleId: formData.vehicleId.trim(),
            stationId: stationId,
            swapStatus: "SUCCESS",
        };

        const batteryUpdateData = {
            soc: parseFloat(formData.soc),
            soh: parseFloat(formData.soh),
        };

        onSwapComplete(swapData, batteryUpdateData, formData.oldBatteryId);

        // Reset form
        setFormData({
            oldBatteryId: "",
            vehicleId: "",
            soc: "",
            soh: "",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-primary" />
                        Thực hiện đổi pin - Booking #{booking?.id}
                    </DialogTitle>
                    <DialogDescription>
                        Nhập thông tin pin cũ và xe của khách hàng
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Thông tin pin mới */}
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Battery className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="space-y-2 flex-1">
                                <h4 className="font-semibold text-sm text-green-900 dark:text-green-100">
                                    Pin mới sẽ giao cho khách
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-green-700 dark:text-green-300">Mã pin:</p>
                                        <p className="font-medium text-green-900 dark:text-green-100">
                                            {batteryInfo?.batteryCode}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-green-700 dark:text-green-300">Model:</p>
                                        <p className="font-medium text-green-900 dark:text-green-100">
                                            {batteryInfo?.model}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-green-700 dark:text-green-300">Dung lượng:</p>
                                        <p className="font-medium text-green-900 dark:text-green-100">
                                            {batteryInfo?.capacity} kWh
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-green-700 dark:text-green-300">SOC:</p>
                                        <p className="font-medium text-green-900 dark:text-green-100">
                                            {batteryInfo?.soc}%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Form nhập liệu */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm">Thông tin pin cũ khách trả</h4>

                        {/* Mã pin cũ */}
                        <div className="space-y-2">
                            <Label htmlFor="oldBatteryId">
                                Mã pin cũ <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="oldBatteryId"
                                value={formData.oldBatteryId}
                                onChange={(e) => handleChange("oldBatteryId", e.target.value)}
                                placeholder="Nhập hoặc quét mã pin cũ..."
                                className={errors.oldBatteryId ? "border-red-500" : ""}
                            />
                            {errors.oldBatteryId && (
                                <p className="text-xs text-red-500">{errors.oldBatteryId}</p>
                            )}
                        </div>

                        {/* Biển số xe */}
                        <div className="space-y-2">
                            <Label htmlFor="vehicleId">
                                Biển số xe / Mã xe <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="vehicleId"
                                value={formData.vehicleId}
                                onChange={(e) => handleChange("vehicleId", e.target.value)}
                                placeholder="Nhập biển số xe..."
                                className={errors.vehicleId ? "border-red-500" : ""}
                            />
                            {errors.vehicleId && (
                                <p className="text-xs text-red-500">{errors.vehicleId}</p>
                            )}
                        </div>

                        {/* SOC và SOH */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="soc">
                                    SOC (%) - Mức sạc <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="soc"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.soc}
                                    onChange={(e) => handleChange("soc", e.target.value)}
                                    placeholder="0-100"
                                    className={errors.soc ? "border-red-500" : ""}
                                />
                                {errors.soc && <p className="text-xs text-red-500">{errors.soc}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="soh">
                                    SOH (%) - Tình trạng pin <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="soh"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.soh}
                                    onChange={(e) => handleChange("soh", e.target.value)}
                                    placeholder="0-100"
                                    className={errors.soh ? "border-red-500" : ""}
                                />
                                {errors.soh && <p className="text-xs text-red-500">{errors.soh}</p>}
                            </div>
                        </div>

                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                                <strong>Lưu ý:</strong> Kiểm tra kỹ thông tin pin cũ khách trả.
                                SOC là % dung lượng còn lại, SOH là % sức khỏe pin (tình trạng hao mòn).
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        {isLoading ? "Đang xử lý..." : "Hoàn tất đổi pin"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


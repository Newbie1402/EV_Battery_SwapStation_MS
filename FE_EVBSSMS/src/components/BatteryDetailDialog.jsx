import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function BatteryDetailDialog({ isOpen, onClose, battery }) {
    const getStatusBadge = (status) => {
        switch (status) {
            case "FULL":
                return { label: "Đầy", className: "bg-green-500" };
            case "CHARGING":
                return { label: "Đang sạc", className: "bg-blue-500" };
            case "IN_USE":
                return { label: "Đang dùng", className: "bg-yellow-500" };
            case "DEFECTIVE":
                return { label: "Hỏng", className: "bg-red-500" };
            case "MAINTENANCE":
                return { label: "Bảo trì", className: "bg-orange-500" };
            case "IN_STOCK":
                return { label: "Trong kho", className: "bg-gray-500" };
            default:
                return { label: "Không rõ", className: "bg-gray-400" };
        }
    };

    const getOwnerTypeBadge = (ownerType) => {
        switch (ownerType) {
            case "STATION":
                return { label: "Trạm", className: "bg-purple-500 text-white" };
            case "VEHICLE":
                return { label: "Xe", className: "bg-cyan-500 text-white" };
            default:
                return { label: "Không rõ", className: "bg-gray-500 text-white" };
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Chi tiết pin</DialogTitle>
                    <DialogDescription>
                        Thông tin chi tiết về pin
                    </DialogDescription>
                </DialogHeader>
                {battery && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Mã pin</p>
                                <p className="font-semibold">{battery.batteryCode}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Model</p>
                                <p className="font-semibold">{battery.model}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Dung lượng</p>
                                <p className="font-semibold">{battery.capacity} kWh</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Trạng thái</p>
                                <Badge className={`${getStatusBadge(battery.status).className} text-white`}>
                                    {getStatusBadge(battery.status).label}
                                </Badge>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">SOH (State of Health)</p>
                                <p className="font-semibold text-green-600">{battery.soh}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">SOC (State of Charge)</p>
                                <p className="font-semibold text-blue-600">{battery.soc}%</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Loại sở hữu</p>
                                <Badge className={getOwnerTypeBadge(battery.ownerType).className}>
                                    {getOwnerTypeBadge(battery.ownerType).label}
                                </Badge>
                            </div>
                            {battery.referenceId && (
                                <div>
                                    <p className="text-sm text-slate-500 mb-1">
                                        {battery.status === "IN_USE" ? "Thuộc trạm" : "Reference ID"}
                                    </p>
                                    {battery.status === "IN_USE" ? (
                                        <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200 text-base px-3 py-1">
                                            Trạm: {battery.referenceId}
                                        </Badge>
                                    ) : (
                                        <p className="font-semibold">{battery.referenceId}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


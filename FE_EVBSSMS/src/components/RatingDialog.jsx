import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import {ratingApi} from "@/api";

export default function RatingDialog({
    open,
    onOpenChange,
    booking,
    driverId,
    onRatingSubmitted
}) {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [existingRating, setExistingRating] = useState(null);
    const [isFetchingRating, setIsFetchingRating] = useState(false);

    // Fetch existing rating khi dialog mở
    useEffect(() => {
        const fetchExistingRating = async () => {
            if (!open || !booking) return;

            setIsFetchingRating(true);
            try {
                // Lấy rating theo bookingId
                const response = await ratingApi.getRatingByBookingId(booking.id);
                const bookingRating = response?.data || response;

                if (bookingRating && bookingRating.id) {
                    setExistingRating(bookingRating);
                    setRating(bookingRating.score || 5);
                    setComment(bookingRating.comment || "");
                } else {
                    setExistingRating(null);
                    setRating(5);
                    setComment("");
                }
            } catch (error) {
                console.error("Error fetching rating:", error);
                // Nếu không tìm thấy rating (404), coi như chưa có đánh giá
                setExistingRating(null);
                setRating(5);
                setComment("");
            } finally {
                setIsFetchingRating(false);
            }
        };

        fetchExistingRating();
    }, [open, booking]);

    const handleSubmit = async () => {
        if (!booking || !driverId) return;

        setIsLoading(true);
        try {
            if (existingRating) {
                // Update existing rating - cần đầy đủ thông tin
                const updateData = {
                    bookingId: booking.id,
                    driverId: driverId,
                    stationId: booking.stationId,
                    score: rating,
                    comment: comment.trim() || null,
                };
                await ratingApi.updateRatingById(existingRating.id, updateData);
                toast.success("Đã cập nhật đánh giá!");
            } else {
                // Create new rating - cần đầy đủ thông tin
                const ratingData = {
                    bookingId: booking.id,
                    score: rating,
                    comment: comment.trim() || null,
                    driverId: driverId,
                    stationId: booking.stationId,
                };
                await ratingApi.createRating(ratingData);
                toast.success("Đã gửi đánh giá!");
            }

            if (onRatingSubmitted) {
                onRatingSubmitted();
            }

            onOpenChange(false);
        } catch (error) {
            console.error("Error submitting rating:", error);
            toast.error("Không thể gửi đánh giá. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!existingRating) return;

        const confirmed = window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?");
        if (!confirmed) return;

        setIsLoading(true);
        try {
            await ratingApi.deleteRatingById(existingRating.id);
            toast.success("Đã xóa đánh giá!");

            if (onRatingSubmitted) {
                onRatingSubmitted();
            }

            onOpenChange(false);
        } catch (error) {
            console.error("Error deleting rating:", error);
            toast.error("Không thể xóa đánh giá. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const renderStars = () => {
        return (
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => !existingRating && setRating(star)}
                        disabled={!!existingRating}
                        className={`transition-all ${existingRating ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                    >
                        <Star
                            className={`h-8 w-8 ${
                                star <= rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                            }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {existingRating ? "Đánh giá của bạn" : "Đánh giá trải nghiệm"}
                    </DialogTitle>
                    <DialogDescription>
                        {existingRating
                            ? `Đánh giá cho booking #${booking?.id}`
                            : `Hãy cho chúng tôi biết trải nghiệm của bạn tại trạm ${booking?.stationId || 'này'}`
                        }
                    </DialogDescription>
                </DialogHeader>

                {isFetchingRating ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {/* Thông tin booking */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-slate-500">Mã Booking:</p>
                                    <p className="font-medium">#{booking?.id}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Trạm:</p>
                                    <p className="font-medium">{booking?.stationId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rating stars */}
                        <div className="space-y-2">
                            <Label>Mức độ hài lòng</Label>
                            <div className="flex items-center gap-4">
                                {renderStars()}
                                <span className="text-sm font-medium text-slate-600">
                                    {rating}/5
                                </span>
                            </div>
                            {existingRating && (
                                <p className="text-xs text-slate-500 italic">
                                    Bạn không thể thay đổi số sao sau khi đã gửi
                                </p>
                            )}
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <Label htmlFor="comment">Nhận xét (Tùy chọn)</Label>
                            <Textarea
                                id="comment"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn..."
                                className="min-h-24"
                                maxLength={500}
                            />
                            <p className="text-xs text-slate-500">
                                {comment.length}/500 ký tự
                            </p>
                        </div>

                        {existingRating && (
                            <div className="text-xs text-slate-500">
                                <p>
                                    Đánh giá lúc:{" "}
                                    {existingRating.createdAt
                                        ? new Date(existingRating.createdAt).toLocaleString("vi-VN")
                                        : "N/A"}
                                </p>
                                {existingRating.updatedAt && existingRating.updatedAt !== existingRating.createdAt && (
                                    <p>
                                        Cập nhật lúc:{" "}
                                        {new Date(existingRating.updatedAt).toLocaleString("vi-VN")}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2">
                    {existingRating && (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading}
                            className="gap-2 cursor-pointer"
                        >
                            <Trash2 className="h-4 w-4" />
                            Xóa đánh giá
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="cursor-pointer"
                    >
                        {existingRating ? "Đóng" : "Hủy"}
                    </Button>
                    {!existingRating && (
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || isFetchingRating}
                            className="gap-2 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang gửi...
                                </>
                            ) : (
                                <>
                                    <Star className="h-4 w-4" />
                                    Gửi đánh giá
                                </>
                            )}
                        </Button>
                    )}
                    {existingRating && (
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading || isFetchingRating}
                            className="gap-2 cursor-pointer"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Đang cập nhật...
                                </>
                            ) : (
                                "Cập nhật nhận xét"
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


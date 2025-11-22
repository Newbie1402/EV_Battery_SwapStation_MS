import React, { useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import { ratingApi, stationApi } from "@/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/utils/format";
import { Star, Filter, Search, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const StarRating = ({ value = 0 }) => {
  const stars = Array.from({ length: 5 }, (_, i) => i < value);
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((filled, idx) => (
        <Star key={idx} className={`h-4 w-4 ${filled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
      ))}
    </div>
  );
};

export default function StaffRatingManagementPage() {
  const { employeeId } = useAuthStore();

  // Lấy station để có stationCode (BE yêu cầu StationCode theo mô tả)
  const { data: stationResp } = useCustomQuery(
    ["staff-station", employeeId],
    () => stationApi.getStationByStaffCode(employeeId),
    { enabled: !!employeeId }
  );

  const station = stationResp?.data || stationResp;
  const stationCode = useMemo(() => {
    return station?.stationCode || localStorage.getItem("staffStationCode") || "";
  }, [station?.stationCode]);

  // Bộ lọc & phân trang
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(5);

  // Query ratings page
  const {
    data: ratingsResp,
    isLoading,
    error,
    refetch,
  } = useCustomQuery(
    ["ratings-by-station", stationCode, page, size],
    () => ratingApi.getRatingsByStationId(stationCode, page, size),
    { enabled: !!stationCode }
  );

  const pageData = ratingsResp?.data || ratingsResp;
  const items = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;
  const totalElements = pageData?.totalElements || 0;

  // Query stats
  const { data: statsResp } = useCustomQuery(
    ["rating-stats", stationCode],
    () => ratingApi.getStatsRatingByStationId(stationCode),
    { enabled: !!stationCode }
  );

  const stats = statsResp?.data || statsResp || {};
  const average = stats?.averageScore || 0;
  const total = stats?.totalRatings || totalElements || 0;

  const filteredItems = useMemo(() => {
    return items.filter((r) => {
      // text
      const t = searchText.toLowerCase();
      const matchText = !t ||
        String(r.bookingId || '').toLowerCase().includes(t) ||
        String(r.driverId || '').toLowerCase().includes(t) ||
        String(r.comment || '').toLowerCase().includes(t);
      if (!matchText) return false;
      // score
      if (minScore && r.score < minScore) return false;
      if (maxScore && r.score > maxScore) return false;
      // date
      if (dateFrom) {
        const from = new Date(dateFrom);
        const d = new Date(r.createdAt);
        if (d < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        const d = new Date(r.createdAt);
        if (d > to) return false;
      }
      return true;
    });
  }, [items, searchText, minScore, maxScore, dateFrom, dateTo]);

  const handleRefresh = () => {
    refetch();
    toast.success("Đã làm mới danh sách đánh giá!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Star className="h-8 w-8 mr-3 text-yellow-500" />
              Quản lý đánh giá
            </h1>
            <p className="text-gray-600 mt-1">Theo dõi phản hồi của tài xế về trạm</p>
            {stationCode && (
              <p className="text-sm text-gray-500 mt-1">Trạm: <span className="font-medium">{station?.stationName}</span> ({stationCode})</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Điểm trung bình</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-gray-900">{average.toFixed(1)}</p>
                <StarRating value={Math.round(average)} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Tổng lượt đánh giá</p>
              <p className="text-3xl font-bold text-gray-900">{total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">5 sao</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.fiveStarCount || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">1 sao</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.oneStarCount || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg"><Filter className="h-5 w-5 mr-2 text-green-600" />Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                  <Search className="h-4 w-4 mr-1" /> Tìm kiếm (driver/booking/bình luận)
                </label>
                <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Nhập từ khóa..." className="bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-white" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">Điểm từ</label>
                  <Input type="number" min={0} max={5} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1">đến</label>
                  <Input type="number" min={0} max={5} value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} className="bg-white" />
                </div>
              </div>
            </div>
            {(searchText || dateFrom || dateTo || minScore || maxScore !== 5) && (
              <div className="mt-3 text-xs text-gray-600 flex items-center gap-2">
                <span>Bộ lọc đang áp dụng</span>
                {searchText && (<Badge variant="outline" className="bg-gray-100 text-gray-700">Từ khóa: {searchText}</Badge>)}
                {dateFrom && (<Badge variant="outline" className="bg-gray-100 text-gray-700">Từ: {dateFrom}</Badge>)}
                {dateTo && (<Badge variant="outline" className="bg-gray-100 text-gray-700">Đến: {dateTo}</Badge>)}
                {(minScore || maxScore !== 5) && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">Điểm: {minScore}-{maxScore}</Badge>
                )}
                <Button size="sm" variant="ghost" onClick={() => { setSearchText(""); setDateFrom(""); setDateTo(""); setMinScore(0); setMaxScore(5); }}>Xóa lọc</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Danh sách đánh giá ({filteredItems.length}/{total})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="py-10 text-center text-gray-600">Đang tải dữ liệu...</div>
            )}
            {error && (
              <div className="py-6 text-center">
                <p className="text-red-600 mb-3">Không thể tải dữ liệu đánh giá</p>
                <Button variant="outline" onClick={handleRefresh}>Thử lại</Button>
              </div>
            )}
            {!isLoading && !error && (
              <ScrollArea className="h-[600px]">
                <div className="min-w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="text-left font-medium px-3 py-2">Thời gian</th>
                        <th className="text-left font-medium px-3 py-2">Booking</th>
                        <th className="text-left font-medium px-3 py-2">Driver</th>
                        <th className="text-left font-medium px-3 py-2">Điểm</th>
                        <th className="text-left font-medium px-3 py-2">Bình luận</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.length > 0 ? (
                        filteredItems.map((r) => (
                          <tr key={r.id} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-3 py-2 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                            <td className="px-3 py-2">{r.bookingId}</td>
                            <td className="px-3 py-2">{r.driverId}</td>
                            <td className="px-3 py-2"><StarRating value={r.score} /></td>
                            <td className="px-3 py-2 text-gray-700">{r.comment || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-gray-500">Không có đánh giá phù hợp</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            )}

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <div className="text-xs text-gray-600">Tổng: {totalElements} | Trang {page + 1}/{totalPages || 1}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={page === 0 || isLoading} onClick={() => setPage((p) => Math.max(0, p - 1))}>Trước</Button>
                <Button variant="outline" disabled={page + 1 >= totalPages || isLoading} onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}>Sau</Button>
                <Button variant="ghost" disabled={isLoading} onClick={() => { setPage(0); refetch(); }}>Về trang 1</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


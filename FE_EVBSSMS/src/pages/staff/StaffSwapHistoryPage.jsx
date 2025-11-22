import React, { useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import useCustomQuery from "@/hooks/useCustomQuery";
import {getSwapLogByStationId, getStationByStaffCode} from "@/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDate } from "@/utils/format";
import { RefreshCw, History, Search, Filter } from "lucide-react";
import toast from "react-hot-toast";

// Trang: Lịch sử đổi pin tại trạm (Staff)
// Luồng: authStore -> stationId (nếu thiếu có thể mở rộng lấy từ staffCode) -> getSwapLogByStationId

const StaffSwapHistoryPage = () => {
  const { employeeId } = useAuthStore();

  // State bộ lọc
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stationId, setStationId] = useState( ()=> localStorage.getItem("staffStationId"));

  // Lấy thông tin trạm (để hiển thị tên/mã trạm) - chỉ chạy khi có stationId
  const { data: station } = useCustomQuery(
    ["staff-station-info", employeeId],
    () => getStationByStaffCode(employeeId),
    {
      enabled: !!employeeId,
    }
  );

  // Lấy swap logs theo stationId
  const {
    data: swapLogResponse,
    isLoading,
    error,
    refetch,
  } = useCustomQuery(
    ["swap-logs", stationId],
    () => getSwapLogByStationId(stationId),
    { enabled: !!stationId }
  );

  const rawLogs = useMemo(() => {
    // API shape: { statusCode, message, data: [...] }
    if (!swapLogResponse) return [];
    if (Array.isArray(swapLogResponse)) return swapLogResponse; // fallback nếu trực tiếp là mảng
    return swapLogResponse.data || [];
  }, [swapLogResponse]);

  // Áp dụng bộ lọc
  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      const text = searchText.toLowerCase();
      const matchText =
        !text ||
        log.vehicleCode?.toLowerCase().includes(text) ||
        log.verhicleBatteryCode?.toLowerCase().includes(text) ||
        log.stationBatteryCode?.toLowerCase().includes(text) ||
        log.batteryReturnLogId?.toLowerCase().includes(text);

      if (!matchText) return false;

      // Lọc ngày
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        const logDate = new Date(log.swapTime);
        if (logDate < fromDate) return false;
      }
      if (dateTo) {
        // End of day
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        const logDate = new Date(log.swapTime);
        if (logDate > toDate) return false;
      }
      return true;
    });
  }, [rawLogs, searchText, dateFrom, dateTo]);

  const handleRefresh = () => {
    refetch();
    toast.success("Đã làm mới dữ liệu lịch sử đổi pin!");
  };

  if (!stationId) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="max-w-3xl mx-auto border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <History className="h-12 w-12 text-yellow-600 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-800">Chưa xác định trạm làm việc</h2>
              <p className="text-gray-600">Tài khoản chưa được gán trạm hoặc thiếu stationId. Vui lòng liên hệ quản trị viên.</p>
              <div className="text-sm text-gray-500">Mã nhân viên: {employeeId || "N/A"}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <History className="h-8 w-8 mr-3 text-green-600" />
              Lịch sử đổi pin
            </h1>
            <p className="text-gray-600 mt-1">Theo dõi các phiên đổi pin đã diễn ra tại trạm</p>
            {station && (
              <p className="text-sm text-gray-500 mt-1">
                Trạm: <span className="font-medium">{station.stationName}</span> ({station.stationCode})
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} className="bg-green-600 hover:bg-green-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Bộ lọc */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Filter className="h-5 w-5 mr-2 text-green-600" /> Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
                  <Search className="h-4 w-4 mr-1" /> Tìm kiếm (mã xe / mã pin / mã log)
                </label>
                <Input
                  placeholder="Nhập từ khóa..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
            {(searchText || dateFrom || dateTo) && (
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-600">
                <span>Bộ lọc đang áp dụng:</span>
                {searchText && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">Từ khóa: {searchText}</Badge>
                )}
                {dateFrom && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">Từ: {dateFrom}</Badge>
                )}
                {dateTo && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700">Đến: {dateTo}</Badge>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setSearchText(""); setDateFrom(""); setDateTo(""); }}
                >
                  Xóa lọc
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nội dung chính */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <History className="h-5 w-5 mr-2 text-green-600" /> Danh sách bản ghi ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="py-10 text-center text-gray-600">Đang tải dữ liệu...</div>
            )}
            {error && (
              <div className="py-6 text-center">
                <p className="text-red-600 mb-3">Có lỗi xảy ra khi tải dữ liệu.</p>
                <Button variant="outline" onClick={handleRefresh}>
                  Thử lại
                </Button>
              </div>
            )}
            {!isLoading && !error && filteredLogs.length === 0 && (
              <div className="py-10 text-center text-gray-500">Không có bản ghi phù hợp.</div>
            )}
            {!isLoading && !error && filteredLogs.length > 0 && (
              <ScrollArea className="h-[600px]">
                <div className="min-w-full">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="text-left font-medium px-3 py-2">Thời gian đổi</th>
                        <th className="text-left font-medium px-3 py-2">Mã xe</th>
                        <th className="text-left font-medium px-3 py-2">Pin trên xe</th>
                        <th className="text-left font-medium px-3 py-2">Pin của trạm</th>
                        <th className="text-left font-medium px-3 py-2">Mã trạm</th>
                        <th className="text-left font-medium px-3 py-2">Log ID trả pin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="border-b last:border-b-0 hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap">{formatDate(log.swapTime)}</td>
                          <td className="px-3 py-2 font-medium text-gray-900">{log.vehicleCode || "-"}</td>
                          <td className="px-3 py-2">{log.verhicleBatteryCode || "-"}</td>
                          <td className="px-3 py-2">{log.stationBatteryCode || "-"}</td>
                          <td className="px-3 py-2">{log.stationCode || station?.stationCode || "-"}</td>
                          <td className="px-3 py-2 text-xs text-gray-600">{log.batteryReturnLogId || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Tổng quan nhanh */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tổng quan nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{rawLogs.length}</p>
                <p className="text-xs text-gray-600">Tổng số lượt đổi</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{filteredLogs.length}</p>
                <p className="text-xs text-gray-600">Sau khi lọc</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{rawLogs.filter(l => l.verhicleBatteryCode === l.stationBatteryCode).length}</p>
                <p className="text-xs text-gray-600">Trùng mã pin</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{new Set(rawLogs.map(l => l.vehicleCode)).size}</p>
                <p className="text-xs text-gray-600">Xe tham gia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffSwapHistoryPage;

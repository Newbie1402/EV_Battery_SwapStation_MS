import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import useCustomQuery from "@/hooks/useCustomQuery";
import { useAuthStore } from "@/store/authStore";
import { getStationByStaffCode, getStatsRatingByStationId } from "@/api";
import {
  MapPin,
  Phone,
  Building2,
  Battery,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const StaffStationInfoPage = () => {
  const { employeeId } = useAuthStore();
  const navigate = useNavigate();

  const {
    data: stationData,
    isLoading,
    error,
    refetch
  } = useCustomQuery(
    ["staff-station", employeeId],
    () => getStationByStaffCode(employeeId),
    {
      enabled: !!employeeId,
      staleTime: 5 * 60 * 1000, // 5 phút
    }
  );

  // Chuẩn bị station & gọi hook thống kê đánh giá TRƯỚC các early return để tránh vi phạm hooks rules
  const station = stationData;
  const stationCode = station?.stationCode || "";
  const { data: ratingStats } = useCustomQuery(
    ["station-rating-stats", stationCode],
    () => getStatsRatingByStationId(stationCode),
    { enabled: !!stationCode }
  );

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'INACTIVE':
        return 'bg-red-500';
      case 'MAINTENANCE':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBatteryStatusColor = (status) => {
    switch (status) {
      case 'FULL':
        return 'bg-green-500 text-green-50';
      case 'LOW':
        return 'bg-yellow-500 text-yellow-50';
      case 'EMPTY':
        return 'bg-red-500 text-red-50';
      case 'CHARGING':
        return 'bg-blue-500 text-blue-50';
      case 'MAINTENANCE':
        return 'bg-gray-500 text-gray-50';
      default:
        return 'bg-gray-400 text-gray-50';
    }
  };

  const getOwnerTypeColor = (ownerType) => {
    switch (ownerType) {
      case 'STATION':
        return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success("Đã cập nhật thông tin trạm!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
              <span className="text-lg font-medium text-gray-600">Đang tải thông tin trạm...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stationData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600 mb-4">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Không thể tải thông tin trạm</span>
              </div>
              <p className="text-red-700 mb-4">
                {error?.message || "Có lỗi xảy ra khi lấy dữ liệu trạm."}
              </p>
              <Button onClick={handleRefresh} variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const batteries = station?.batteries || [];
  const staffCodes = station?.staffCode || [];

  // Lấy thống kê đánh giá đã tính ở trên
  const stats = ratingStats?.data || ratingStats || {};
  const averageScore = typeof stats?.averageScore === 'number' ? stats.averageScore : 0;
  const totalRatings = typeof stats?.totalRatings === 'number' ? stats.totalRatings : 0;
  const fiveStar = stats?.fiveStarCount || 0;
  const oneStar = stats?.oneStarCount || 0;

  // Tính toán thống kê pin
  const batteryStats = {
    total: batteries.length,
    full: batteries.filter(b => b.status === 'FULL').length,
    low: batteries.filter(b => b.status === 'LOW').length,
    empty: batteries.filter(b => b.status === 'EMPTY').length,
    charging: batteries.filter(b => b.status === 'CHARGING').length,
    maintenance: batteries.filter(b => b.status === 'MAINTENANCE').length,
  };

  const availabilityPercentage = station?.totalSlots > 0
    ? (station.availableSlots / station.totalSlots) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="h-8 w-8 mr-3 text-green-600" />
              Thông tin trạm đổi pin
            </h1>
            <p className="text-gray-600 mt-1">Chi tiết trạm và quản lý pin</p>
          </div>
          <Button onClick={handleRefresh} className="bg-green-600 hover:bg-green-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>

        {/* Station Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng số slot</p>
                  <p className="text-2xl font-bold text-gray-900">{station?.totalSlots || 0}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Slot khả dụng</p>
                  <p className="text-2xl font-bold text-green-600">{station?.availableSlots || 0}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng số pin</p>
                  <p className="text-2xl font-bold text-gray-900">{batteryStats.total}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Battery className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nhân viên</p>
                  <p className="text-2xl font-bold text-gray-900">{staffCodes.length}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Station Details + Battery Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-green-600" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mã trạm</label>
                    <p className="text-lg font-semibold text-gray-900">{station?.stationCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tên trạm</label>
                    <p className="text-lg font-semibold text-gray-900">{station?.stationName}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Địa chỉ
                  </label>
                  <p className="text-gray-900 mt-1">{station?.address}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Số điện thoại
                    </label>
                    <p className="text-gray-900 mt-1">{station?.phoneNumber || 'Chưa có'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Vĩ độ</label>
                    <p className="text-gray-900 mt-1">{station?.latitude?.toFixed(6) || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Kinh độ</label>
                    <p className="text-gray-900 mt-1">{station?.longitude?.toFixed(6) || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                  <div className="mt-1">
                    <Badge
                      className={`${getStatusColor(station?.status)} text-white`}
                      variant="outline"
                    >
                      {station?.status === 'ACTIVE' ? 'Hoạt động' :
                       station?.status === 'INACTIVE' ? 'Không hoạt động' :
                       station?.status === 'MAINTENANCE' ? 'Bảo trì' : station?.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Tỷ lệ slot khả dụng</label>
                  <div className="mt-2 space-y-2">
                    <Progress value={availabilityPercentage} className="w-full" />
                    <p className="text-sm text-gray-600">
                      {station?.availableSlots}/{station?.totalSlots} slot ({availabilityPercentage.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Battery Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Battery className="h-5 w-5 mr-2 text-green-600" />
                  Thống kê pin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{batteryStats.full}</p>
                    <p className="text-sm text-gray-600">Pin đầy</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{batteryStats.low}</p>
                    <p className="text-sm text-gray-600">Pin yếu</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{batteryStats.empty}</p>
                    <p className="text-sm text-gray-600">Pin cạn</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{batteryStats.charging}</p>
                    <p className="text-sm text-gray-600">Đang sạc</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-600">{batteryStats.maintenance}</p>
                    <p className="text-sm text-gray-600">Bảo trì</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{batteryStats.total}</p>
                    <p className="text-sm text-gray-600">Tổng cộng</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staff & Battery List + Rating Summary */}
          <div className="space-y-6">
            {/* Staff List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Danh sách nhân viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                {staffCodes.length > 0 ? (
                  <ScrollArea className="h-40">
                    <div className="space-y-2">
                      {staffCodes.map((staffCode, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{staffCode}</span>
                          {staffCode === employeeId && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Bạn
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Chưa có nhân viên nào</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rating Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="inline-flex h-5 w-5 items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-yellow-500">
                      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.402 8.166L12 18.896l-7.336 3.866 1.402-8.166L.132 9.21l8.2-1.192z"/>
                    </svg>
                  </span>
                  Đánh giá tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Điểm trung bình</p>
                    <p className="text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Tổng lượt đánh giá</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalRatings}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-yellow-50 rounded-lg text-center">
                    <p className="text-xl font-semibold text-yellow-700">{fiveStar}</p>
                    <p className="text-xs text-gray-600">5 sao</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <p className="text-xl font-semibold text-gray-700">{oneStar}</p>
                    <p className="text-xs text-gray-600">1 sao</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate('/staff/ratings')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>

            {/* Recent Batteries */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Battery className="h-5 w-5 mr-2 text-green-600" />
                  Pin tại trạm ({batteries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {batteries.length > 0 ? (
                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {batteries.map((battery) => (
                        <div key={battery.id} className="p-3 border rounded-lg bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{battery.batteryCode}</span>
                            <Badge className={getBatteryStatusColor(battery.status)}>
                              {battery.status === 'FULL' ? 'Đầy' :
                               battery.status === 'LOW' ? 'Yếu' :
                               battery.status === 'EMPTY' ? 'Cạn' :
                               battery.status === 'CHARGING' ? 'Sạc' :
                               battery.status === 'MAINTENANCE' ? 'Bảo trì' : battery.status}
                            </Badge>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Model:</span> {battery.model || 'N/A'}</p>
                            <p><span className="font-medium">Dung lượng:</span> {battery.capacity || 'N/A'} kWh</p>
                            <div className="flex justify-between">
                              <span><span className="font-medium">SOH:</span> {(battery.soh * 100).toFixed(1)}%</span>
                              <span><span className="font-medium">SOC:</span> {(battery.soc * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className={getOwnerTypeColor(battery.ownerType)}>
                                {battery.ownerType === 'STATION' ? 'Trạm' : 'Khách hàng'}
                              </Badge>
                              {battery.hold && (
                                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                  Đang giữ
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-4">
                    <Battery className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Chưa có pin nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffStationInfoPage;

import { useState, useMemo, useCallback, useRef } from "react";
import { paymentApi, swapLogApi, bookingApi } from "@/api";
import useCustomQuery from "@/hooks/useCustomQuery";
import { formatDate, formatCurrency } from "@/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

// Bộ lọc thời gian
const RANGES = [
  { key: "TODAY", label: "Hôm nay" },
  { key: "LAST_7_DAYS", label: "7 ngày qua" },
  { key: "THIS_MONTH", label: "Tháng này" },
  { key: "CUSTOM", label: "Tuỳ chỉnh" },
];

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

export default function ReportStaticsPage() {
  const [selectedRange, setSelectedRange] = useState("TODAY");
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [openCustom, setOpenCustom] = useState(false);

  // Queries dữ liệu
  const { data: paymentSwapRaw, isLoading: loadingSwap } = useCustomQuery([
    "payment-swap-all"], paymentApi.getAllPaymentSwap);
  const { data: paymentPackagesRaw, isLoading: loadingPackages } = useCustomQuery([
    "payment-packages-all"], paymentApi.getAllPaymentPackages);
  const { data: swapLogsRaw, isLoading: loadingSwapLogs } = useCustomQuery([
    "swap-logs-all"], swapLogApi.getAllSwapLogs);
  const { data: bookingsRes, isLoading: loadingBookings } = useCustomQuery([
    "bookings-recent", 0, 20], () => bookingApi.getAllBookings(0, 20));

  const paymentSwaps = Array.isArray(paymentSwapRaw?.data) ? paymentSwapRaw.data : (Array.isArray(paymentSwapRaw)? paymentSwapRaw : []);
  const paymentPackages = Array.isArray(paymentPackagesRaw?.data) ? paymentPackagesRaw.data : (Array.isArray(paymentPackagesRaw)? paymentPackagesRaw : []);
  const swapLogs = useMemo(() => Array.isArray(swapLogsRaw?.data) ? swapLogsRaw.data : (Array.isArray(swapLogsRaw)? swapLogsRaw : []), [swapLogsRaw]);

  // Helper lọc theo range
  const nowRef = useRef(new Date());
  const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const filterByRange = useCallback((isoStr) => {
    if (!isoStr) return false;
    const d = new Date(isoStr);
    const now = nowRef.current;
    switch (selectedRange) {
      case "TODAY":
        return isSameDay(d, now);
      case "LAST_7_DAYS": {
        const diff = now - d;
        return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
      }
      case "THIS_MONTH":
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      case "CUSTOM":
        if (dateRange.from && dateRange.to) {
          return d >= new Date(dateRange.from) && d <= new Date(dateRange.to);
        }
        return true; // chưa chọn đủ thì coi như tất cả
      default:
        return true;
    }
  }, [selectedRange, dateRange]);

  // Tính toán thống kê
  const stats = useMemo(() => {
    const filteredSwaps = paymentSwaps.filter(p => filterByRange(p.paymentTime));
    const filteredPackages = paymentPackages.filter(p => filterByRange(p.paymentTime));
    const revenueSwap = filteredSwaps.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const revenuePackage = filteredPackages.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const revenue = revenueSwap + revenuePackage;
    const filteredSwapLogs = swapLogs.filter(log => filterByRange(log.swapTime));
    const swapCount = filteredSwapLogs.length;
    const stationFreq = {};
    filteredSwapLogs.forEach(l => { if (l.stationCode) stationFreq[l.stationCode] = (stationFreq[l.stationCode] || 0) + 1; });
    let busiestStation = "-"; let maxCount = 0;
    Object.entries(stationFreq).forEach(([code, count]) => { if (count > maxCount) { maxCount = count; busiestStation = code; } });
    const buckets = { "0-4": 0, "4-8": 0, "8-12": 0, "12-16": 0, "16-20": 0, "20-24": 0 };
    filteredSwapLogs.forEach(l => { const d = new Date(l.swapTime); const h = d.getHours(); if (h < 4) buckets["0-4"]++; else if (h < 8) buckets["4-8"]++; else if (h < 12) buckets["8-12"]++; else if (h < 16) buckets["12-16"]++; else if (h < 20) buckets["16-20"]++; else buckets["20-24"]++; });
    return { revenue, revenueSwap, revenuePackage, swapCount, busiestStation, buckets, paymentsFiltered: filteredSwaps, packagesFiltered: filteredPackages };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectedRange ảnh hưởng qua filterByRange
  }, [paymentSwaps, paymentPackages, swapLogs, selectedRange, filterByRange]);

  // Tổng hợp theo ngày cho biểu đồ đường (revenue + swapCount)
  const dailyData = useMemo(() => {
    const mapRevenueSwap = new Map();
    const mapRevenuePackage = new Map();
    const mapSwapCount = new Map();
    stats.paymentsFiltered.forEach(p => { if (!p.paymentTime) return; const key = format(new Date(p.paymentTime), 'yyyy-MM-dd'); mapRevenueSwap.set(key, (mapRevenueSwap.get(key) || 0) + (p.totalAmount || 0)); });
    stats.packagesFiltered.forEach(p => { if (!p.paymentTime) return; const key = format(new Date(p.paymentTime), 'yyyy-MM-dd'); mapRevenuePackage.set(key, (mapRevenuePackage.get(key) || 0) + (p.totalAmount || 0)); });
    const filteredSwapLogs = swapLogs.filter(l => filterByRange(l.swapTime));
    filteredSwapLogs.forEach(l => { if (!l.swapTime) return; const key = format(new Date(l.swapTime), 'yyyy-MM-dd'); mapSwapCount.set(key, (mapSwapCount.get(key) || 0) + 1); });
    const allKeys = Array.from(new Set([...mapRevenueSwap.keys(), ...mapRevenuePackage.keys(), ...mapSwapCount.keys()])).sort();
    return { labels: allKeys, revenueSwap: allKeys.map(k => mapRevenueSwap.get(k) || 0), revenuePackage: allKeys.map(k => mapRevenuePackage.get(k) || 0), swaps: allKeys.map(k => mapSwapCount.get(k) || 0) };
  }, [stats.paymentsFiltered, stats.packagesFiltered, swapLogs, filterByRange]);

  // Data cho biểu đồ giờ cao điểm (bar chart)
  const peakHourChartData = useMemo(() => {
    const labels = Object.keys(stats.buckets);
    const values = labels.map(l => stats.buckets[l]);
    return {
      labels,
      datasets: [
        {
          label: 'Lượt đổi pin',
          data: values,
          backgroundColor: '#135bec',
          borderRadius: 4,
        }
      ]
    };
  }, [stats.buckets]);

  const lineChartData = useMemo(() => ({
    labels: dailyData.labels,
    datasets: [
      { label: 'Doanh thu Đổi Pin (đ)', data: dailyData.revenueSwap, borderColor: '#135bec', backgroundColor: 'rgba(19,91,236,0.25)', tension: 0.3, yAxisID: 'y1' },
      { label: 'Doanh thu Gói Ưu Đãi (đ)', data: dailyData.revenuePackage, borderColor: '#9333ea', backgroundColor: 'rgba(147,51,234,0.25)', tension: 0.3, yAxisID: 'y1' },
      { label: 'Lượt đổi pin', data: dailyData.swaps, borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.25)', tension: 0.3, yAxisID: 'y2' }
    ]
  }), [dailyData]);

  const lineOptions = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'top' } },
    scales: {
      y1: {
        type: 'linear',
        position: 'left',
        ticks: { callback: v => formatCurrency(v) }
      },
      y2: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { precision: 0 }
      }
    }
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
  };

  const loading = loadingSwap || loadingPackages || loadingSwapLogs || loadingBookings;

  const handleExport = () => {
    toast.success("Chức năng xuất báo cáo sẽ sớm khả dụng!");
  };

  // Chuyển sang bookings cho bảng gần đây
  const allBookings = Array.isArray(bookingsRes?.content) ? bookingsRes.content : [];
  const recentBookings = useMemo(() => {
    const list = allBookings.slice();
    list.sort((a, b) => new Date(b.createdAt || b.bookingTime) - new Date(a.createdAt || a.bookingTime));
    return list.slice(0, 10);
  }, [allBookings]);

  return (
    <div className="w-full min-h-screen bg-[#f6f6f8] dark:bg-background-dark">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-72 flex-col gap-2">
            <h1 className="text-neutral-900 dark:text-neutral-100 text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Báo cáo & Thống kê</h1>
            <p className="text-neutral-700 dark:text-neutral-200/80 text-base">Phân tích hiệu suất toàn diện của hệ thống trạm đổi pin.</p>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 p-3 mt-4 overflow-x-auto">
          {RANGES.map(r => (
            r.key === 'CUSTOM' ? (
              <Popover key={r.key} open={openCustom} onOpenChange={setOpenCustom}>
                <PopoverTrigger asChild>
                  <button
                    onClick={() => {
                      setSelectedRange(r.key);
                      setOpenCustom(true);
                    }}
                    className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium leading-normal transition ${selectedRange === r.key ? "bg-primary/20 text-primary font-bold" : "bg-white dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-900 dark:text-neutral-100"}`}
                  >
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from,'dd/MM/yyyy')} - ${format(dateRange.to,'dd/MM/yyyy')}`
                      : r.label}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range || { from: null, to: null });
                      if (range?.from && range?.to) {
                        setOpenCustom(false);
                      }
                    }}
                    numberOfMonths={2}
                  />
                  <div className="flex justify-end mt-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setDateRange({ from: null, to: null }); }}>Xóa</Button>
                    <Button size="sm" onClick={() => setOpenCustom(false)}>Đóng</Button>
                  </div>
                </PopoverContent>
              </Popover>
            ) : (
              <button
                key={r.key}
                onClick={() => {
                  setSelectedRange(r.key);
                }}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-medium leading-normal transition ${selectedRange === r.key ? "bg-primary/20 text-primary font-bold" : "bg-white dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-900 dark:text-neutral-100"}`}
              >
                {r.label}
              </button>
            )
          ))}
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
            <Card className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50">
              <CardContent className="p-6 flex flex-col gap-1">
                <p className="text-neutral-700 dark:text-neutral-200/80 text-sm font-medium">Doanh thu Đổi Pin</p>
                <p className="text-neutral-900 dark:text-neutral-100 tracking-tight text-2xl font-bold">{formatCurrency(stats.revenueSwap)}</p>
                <Badge className="bg-blue-600">Swap</Badge>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50">
              <CardContent className="p-6 flex flex-col gap-1">
                <p className="text-neutral-700 dark:text-neutral-200/80 text-sm font-medium">Doanh thu Gói Ưu Đãi</p>
                <p className="text-neutral-900 dark:text-neutral-100 tracking-tight text-2xl font-bold">{formatCurrency(stats.revenuePackage)}</p>
                <Badge className="bg-purple-600">Package</Badge>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50">
              <CardContent className="p-6 flex flex-col gap-1">
                <p className="text-neutral-700 dark:text-neutral-200/80 text-sm font-medium">Tổng Doanh Thu</p>
                <p className="text-neutral-900 dark:text-neutral-100 tracking-tight text-2xl font-bold">{formatCurrency(stats.revenue)}</p>
                <Badge className="bg-green-600">Tổng</Badge>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50">
              <CardContent className="p-6 flex flex-col gap-1">
                <p className="text-neutral-700 dark:text-neutral-200/80 text-sm font-medium">Lượt Đổi Pin</p>
                <p className="text-neutral-900 dark:text-neutral-100 tracking-tight text-2xl font-bold">{stats.swapCount}</p>
                <Badge className="bg-green-600">Lượt</Badge>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50">
              <CardContent className="p-6 flex flex-col gap-1">
                <p className="text-neutral-700 dark:text-neutral-200/80 text-sm font-medium">Trạm Hoạt Động Nhiều Nhất</p>
                <p className="text-neutral-900 dark:text-neutral-100 tracking-tight text-2xl font-bold truncate">{stats.busiestStation}</p>
                <Badge className="bg-red-600">{stats.busiestStation === '-' ? 'Không' : 'Nổi bật'}</Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-6">
          <Card className="lg:col-span-3 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-bold">Doanh thu theo ngày (Đổi Pin vs Gói) & Lượt đổi pin</CardTitle>
              <p className="text-neutral-700 dark:text-neutral-200/80 text-sm">So sánh hai nguồn doanh thu và hoạt động đổi pin</p>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? <Skeleton className="h-[260px] w-full" /> : (
                dailyData.labels.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">Không có dữ liệu để hiển thị.</p>
                ) : (
                  <Line data={lineChartData} options={lineOptions} height={220} />
                )
              )}
            </CardContent>
          </Card>
          <Card className="lg:col-span-2 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-base font-bold">Giờ cao điểm sử dụng</CardTitle>
              <p className="text-neutral-700 dark:text-neutral-200/80 text-sm">Phân bố lượt đổi pin theo khung giờ</p>
            </CardHeader>
            <CardContent className="pt-4">
              {loading ? <Skeleton className="h-[260px] w-full" /> : (
                <Bar data={peakHourChartData} options={barOptions} height={220} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card className="mt-6 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50 overflow-hidden">
          <CardHeader className="p-4 sm:p-6 border-b border-neutral-200 dark:border-neutral-700/50">
            <CardTitle className="text-lg font-bold">Đặt lịch gần đây</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-neutral-700 dark:text-neutral-200/80 uppercase bg-neutral-100/50 dark:bg-white/5">
                  <tr>
                    <th className="px-6 py-3">ID</th>
                    <th className="px-6 py-3">Thời gian</th>
                    <th className="px-6 py-3">Trạm</th>
                    <th className="px-6 py-3">Người dùng</th>
                    <th className="px-6 py-3">Trạng thái</th>
                    <th className="px-6 py-3">Thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={6} className="px-6 py-4">Đang tải...</td></tr>
                  )}
                  {!loading && recentBookings.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-4 italic text-gray-500">Không có dữ liệu.</td></tr>
                  )}
                  {!loading && recentBookings.map(bk => {
                    const time = bk.createdAt || bk.bookingTime;
                    return (
                      <tr key={bk.id} className="border-b border-neutral-200 dark:border-neutral-700/50">
                        <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">#{bk.id}</td>
                        <td className="px-6 py-4 text-neutral-700 dark:text-neutral-200/80">{time ? formatDate(time) : '-'}</td>
                        <td className="px-6 py-4 text-neutral-700 dark:text-neutral-200/80">{bk.stationId || '-'}</td>
                        <td className="px-6 py-4 text-neutral-700 dark:text-neutral-200/80">{bk.driverId || '-'}</td>
                        <td className="px-6 py-4 text-neutral-700 dark:text-neutral-200/80">{bk.bookingStatus || '-'}</td>
                        <td className="px-6 py-4 text-neutral-700 dark:text-neutral-200/80">{bk.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between p-4 border-t border-neutral-200 dark:border-neutral-700/50">
              <span className="text-sm text-neutral-700 dark:text-neutral-200/80">Hiển thị <span className="font-semibold text-neutral-900 dark:text-neutral-100">{recentBookings.length}</span> mục</span>
              <div className="inline-flex -space-x-px rounded-md text-sm">
                <button disabled className="flex items-center justify-center px-3 h-8 text-neutral-400 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50 rounded-l-lg">Trước</button>
                <button disabled className="flex items-center justify-center px-3 h-8 text-neutral-400 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-700/50 rounded-r-lg">Sau</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

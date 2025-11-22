import { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { stationApi, batteryTransferApi } from '@/api';
import useCustomQuery from '@/hooks/useCustomQuery';
import useCustomMutation from '@/hooks/useCustomMutation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/utils/format';
import { toast } from 'react-hot-toast';
import { RefreshCw, Battery, Building2, Search } from 'lucide-react';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-500 text-white',
  APPROVED: 'bg-green-600 text-white',
  REJECTED: 'bg-red-600 text-white'
};

export default function StaffSupportBatteryTransferPage() {
  const { employeeId } = useAuthStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({ requestedQuantity: '', batteryModel: '', reason: '' });

  // Lấy thông tin trạm của nhân viên
  const { data: stationData, isLoading: loadingStation, refetch: refetchStation } = useCustomQuery(
    ['staff-station', employeeId],
    () => stationApi.getStationByStaffCode(employeeId),
    { enabled: !!employeeId }
  );
  const station = stationData;
  const stationCode = localStorage.getItem('staffStationCode');

  // Lấy danh sách yêu cầu theo stationCode
  const { data: requestsRaw, isLoading: loadingRequests } = useCustomQuery(
    ['station-battery-transfer-requests', stationCode],
    () => batteryTransferApi.getBatteryTransferRequestsByStationCode(stationCode),
    { enabled: !!stationCode }
  );
  const requests = useMemo(() => Array.isArray(requestsRaw?.data) ? requestsRaw.data : (Array.isArray(requestsRaw) ? requestsRaw : []), [requestsRaw]);

  // Lọc tìm kiếm + trạng thái
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchSearch = search.trim() === '' || (r.batteryModel || '').toLowerCase().includes(search.toLowerCase()) || (r.status || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === '' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  // Mutation tạo yêu cầu
  const createMutation = useCustomMutation(
    (data) => batteryTransferApi.createBatteryTransferRequest(data),
    'POST',
    {
      invalidateKeys: ['station-battery-transfer-requests', stationCode],
      onSuccess: () => {
        toast.success('Gửi yêu cầu thành công');
        setIsCreateOpen(false);
        setFormData({ requestedQuantity: '', batteryModel: '', reason: '' });
      }
    }
  );

  const handleCreate = () => {
    if (!stationCode) {
      toast.error('Không xác định được mã trạm');
      return;
    }
    const qty = parseInt(formData.requestedQuantity, 10);
    if (!qty || qty <= 0) {
      toast.error('Số lượng phải > 0');
      return;
    }
    if (!formData.batteryModel.trim()) {
      toast.error('Model pin không được để trống');
      return;
    }
    createMutation.mutate({
      stationCode,
      requestedQuantity: qty,
      batteryModel: formData.batteryModel.trim(),
      reason: formData.reason.trim()
    });
  };

  const handleRefresh = () => {
    refetchStation();
    toast.success('Đã làm mới thông tin trạm');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="h-8 w-8 text-green-600" /> Hỗ trợ bổ sung pin
            </h1>
            <p className="text-gray-600 mt-1">Gửi yêu cầu bổ sung pin cho trạm và theo dõi trạng thái.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsCreateOpen(true)} className="bg-[#135bec] hover:bg-[#135bec]/90 cursor-pointer">Tạo yêu cầu</Button>
            <Button variant="outline" onClick={handleRefresh} className="cursor-pointer">
              <RefreshCw className="h-4 w-4 mr-2" /> Làm mới
            </Button>
          </div>
        </div>

        {/* Thông tin trạm */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin trạm</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStation ? (
              <div className="flex gap-4">
                <Skeleton className="h-20 w-48" />
                <Skeleton className="h-20 w-48" />
                <Skeleton className="h-20 w-48" />
              </div>
            ) : !station ? (
              <p className="text-gray-500 italic">Không xác định được trạm của bạn.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg border bg-white">
                  <p className="text-xs uppercase text-gray-500">Mã trạm</p>
                  <p className="text-lg font-semibold text-gray-800">{station.stationCode}</p>
                </div>
                <div className="p-4 rounded-lg border bg-white">
                  <p className="text-xs uppercase text-gray-500">Tên trạm</p>
                  <p className="text-lg font-semibold text-gray-800">{station.stationName}</p>
                </div>
                <div className="p-4 rounded-lg border bg-white">
                  <p className="text-xs uppercase text-gray-500">Pin hiện có / Slots</p>
                  <p className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Battery className="h-5 w-5 text-green-600" />
                    {(station.batteries?.length || 0)} / {station.totalSlots || 0}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bộ lọc */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input placeholder="Tìm kiếm model hoặc trạng thái..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="w-full md:w-40">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border rounded-md p-2 text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        {/* Danh sách yêu cầu */}
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu của trạm</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : filteredRequests.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có yêu cầu nào.</p>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map(req => (
                  <div key={req.id} className="p-4 border rounded-lg bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">#{req.id} - {req.batteryModel}</p>
                        <Badge className={STATUS_STYLES[req.status] || 'bg-gray-500 text-white'}>{req.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Số lượng: <span className="font-medium">{req.requestedQuantity}</span> | Trạm: {req.stationCode}</p>
                      <p className="text-sm text-gray-600">Lý do: {req.reason || '-'}</p>
                      <p className="text-xs text-gray-400 mt-1">Tạo: {req.createdAt ? formatDate(req.createdAt) : '-'}</p>
                      {req.processedAt && <p className="text-xs text-gray-400">Xử lý: {formatDate(req.processedAt)}</p>}
                      {req.adminNote && <p className="text-xs text-gray-500">Admin: {req.adminNote}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog tạo yêu cầu */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu bổ sung pin</DialogTitle>
            <DialogDescription>Nhập thông tin để gửi yêu cầu.</DialogDescription>
          </DialogHeader>
          {(!stationCode && !loadingStation) && (
            <p className="text-sm text-red-600 mb-2">Không xác định được mã trạm – không thể gửi yêu cầu.</p>
          )}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Số lượng cần bổ sung</p>
                <Input type="number" min={1} value={formData.requestedQuantity} onChange={(e) => setFormData({ ...formData, requestedQuantity: e.target.value })} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Model pin</p>
                <Input value={formData.batteryModel} onChange={(e) => setFormData({ ...formData, batteryModel: e.target.value })} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Lý do</p>
              <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Ví dụ: Thiếu pin giờ cao điểm" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending || !stationCode} className="bg-[#135bec] hover:bg-[#135bec]/90 cursor-pointer">
                {createMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

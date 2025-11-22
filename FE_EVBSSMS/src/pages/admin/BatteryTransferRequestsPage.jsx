import { useState, useMemo } from 'react';
import { batteryTransferApi, stationApi } from '@/api';
import useCustomQuery from '@/hooks/useCustomQuery';
import useCustomMutation from '@/hooks/useCustomMutation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/utils/format';

// Nếu chưa có Textarea component, tạo tạm thời
// Bạn có thể thay bằng component chuẩn trong thư mục ui khi đã có

const STATUS_COLORS = {
  PENDING: 'bg-yellow-500 text-white',
  APPROVED: 'bg-green-600 text-white',
  REJECTED: 'bg-red-600 text-white',
  COMPLETED: 'bg-blue-600 text-white'
};

export default function BatteryTransferRequestsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({ stationCode: '', requestedQuantity: '', batteryModel: '', reason: '' });
  const [processData, setProcessData] = useState({ status: 'APPROVED', adminNote: '' });
  const [search, setSearch] = useState('');

  // Query danh sách trạm để hỗ trợ chọn stationCode
  const { data: stationsWrapper, isLoading: loadingStations } = useCustomQuery(['all-stations-for-transfer'], () => stationApi.getAllStations());
  const stations = useMemo(() => Array.isArray(stationsWrapper?.data) ? stationsWrapper.data : (Array.isArray(stationsWrapper) ? stationsWrapper : []), [stationsWrapper]);

  // Query danh sách yêu cầu
  const { data: requestsRaw, isLoading: loadingRequests } = useCustomQuery(['battery-transfer-requests'], batteryTransferApi.getAllBatteryTransferRequests);
  const requests = useMemo(() => Array.isArray(requestsRaw?.data) ? requestsRaw.data : (Array.isArray(requestsRaw) ? requestsRaw : []), [requestsRaw]);

  // Lọc theo tìm kiếm (theo stationCode, stationName, batteryModel, status)
  const filteredRequests = useMemo(() => {
    const q = search.toLowerCase();
    return requests.filter(r =>
      r.stationCode?.toLowerCase().includes(q) ||
      r.stationName?.toLowerCase().includes(q) ||
      r.batteryModel?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
    );
  }, [requests, search]);

  // Mutation tạo yêu cầu
  const createMutation = useCustomMutation(
    (data) => batteryTransferApi.createBatteryTransferRequest(data),
    'POST',
    {
      invalidateKeys: ['battery-transfer-requests'],
      onSuccess: () => {
        toast.success('Tạo yêu cầu thành công');
        setIsCreateOpen(false);
        setFormData({ stationCode: '', requestedQuantity: '', batteryModel: '', reason: '' });
      }
    }
  );

  // Mutation xử lý yêu cầu
  const processMutation = useCustomMutation(
    ({ id, status, adminNote }) => batteryTransferApi.processBatteryTransferRequest(id, status, adminNote),
    'PUT',
    {
      invalidateKeys: ['battery-transfer-requests'],
      onSuccess: () => {
        toast.success('Cập nhật trạng thái thành công');
        setIsProcessOpen(false);
        setSelectedRequest(null);
        setProcessData({ status: 'APPROVED', adminNote: '' });
      }
    }
  );

  const handleCreate = () => {
    if (!formData.stationCode || !formData.requestedQuantity || !formData.batteryModel) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    createMutation.mutate({
      stationCode: formData.stationCode,
      requestedQuantity: parseInt(formData.requestedQuantity, 10),
      batteryModel: formData.batteryModel,
      reason: formData.reason
    });
  };

  const openProcessDialog = (req) => {
    setSelectedRequest(req);
    // Nếu yêu cầu đang APPROVED, mặc định chuyển sang COMPLETED
    if (req.status === 'APPROVED') {
      setProcessData({ status: 'COMPLETED', adminNote: '' });
    } else {
      setProcessData({ status: 'APPROVED', adminNote: '' });
    }
    setIsProcessOpen(true);
  };

  const handleProcess = () => {
    if (!selectedRequest) return;
    processMutation.mutate({ id: selectedRequest.id, status: processData.status, adminNote: processData.adminNote });
  };

  return (
    <div className="w-full min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Yêu cầu chuyển / đổi pin</h1>
            <p className="text-gray-600">Quản lý các yêu cầu bổ sung pin giữa các trạm</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-[#135bec] hover:bg-[#135bec]/90 cursor-pointer">Tạo yêu cầu</Button>
        </div>

        {/* Tìm kiếm */}
        <div className="mb-4">
          <Input placeholder="Tìm kiếm theo trạm, model, trạng thái..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full" />
        </div>

        {/* Danh sách yêu cầu */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách yêu cầu</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : filteredRequests.length === 0 ? (
              <p className="text-gray-500 italic">Không có yêu cầu nào.</p>
            ) : (
              <div className="space-y-3">
                {filteredRequests.map(req => (
                  <div key={req.id} className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">#{req.id} - {req.stationName || "N/A"} - {req.stationCode}</p>
                        <Badge className={STATUS_COLORS[req.status] || 'bg-gray-500 text-white'}>{req.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">Model pin: <span className="font-medium">{req.batteryModel}</span> | Số lượng: <span className="font-medium">{req.requestedQuantity}</span></p>
                      <p className="text-sm text-gray-600">Lý do: {req.reason || '-'} </p>
                      <p className="text-xs text-gray-400 mt-1">Tạo lúc: {req.createdAt ? formatDate(req.createdAt) : '-'}</p>
                      {req.processedAt && <p className="text-xs text-gray-400">Xử lý lúc: {formatDate(req.processedAt)}</p>}
                      {req.adminNote && <p className="text-xs text-gray-500">Ghi chú admin: {req.adminNote}</p>}
                    </div>
                    <div className="flex gap-2">
                      {req.status === 'PENDING' && (
                        <Button size="sm" onClick={() => openProcessDialog(req)} className="bg-green-600 hover:bg-green-700 cursor-pointer">Xử lý</Button>
                      )}
                      {req.status === 'APPROVED' && (
                        <Button size="sm" onClick={() => openProcessDialog(req)} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">Hoàn thành</Button>
                      )}
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
            <DialogTitle>Tạo yêu cầu chuyển pin</DialogTitle>
            <DialogDescription>Nhập thông tin yêu cầu bổ sung pin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Chọn trạm</p>
              <select
                className="w-full border rounded-md p-2 text-sm"
                value={formData.stationCode}
                onChange={(e) => setFormData({ ...formData, stationCode: e.target.value })}
              >
                <option value="">-- Chọn trạm --</option>
                {loadingStations ? <option>Đang tải...</option> : stations.map(st => (
                  <option key={st.stationCode} value={st.stationCode}>{st.stationName || st.stationCode}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Số lượng yêu cầu</p>
                <Input type="number" min="1" value={formData.requestedQuantity} onChange={(e) => setFormData({ ...formData, requestedQuantity: e.target.value })} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Model pin</p>
                <Input value={formData.batteryModel} onChange={(e) => setFormData({ ...formData, batteryModel: e.target.value })} />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Lý do</p>
              <Textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} placeholder="Ví dụ: Trạm thiếu pin giờ cao điểm" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="bg-[#135bec] hover:bg-[#135bec]/90 cursor-pointer">
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo yêu cầu'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog xử lý yêu cầu */}
      <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === 'APPROVED' ? 'Hoàn thành yêu cầu' : 'Xử lý yêu cầu'} #{selectedRequest?.id}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.status === 'APPROVED'
                ? 'Xác nhận hoàn thành yêu cầu và ghi chú nếu cần.'
                : 'Chọn trạng thái và ghi chú nếu cần.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                {selectedRequest?.status === 'APPROVED' ? (
                  <select
                    className="w-full border rounded-md p-2 text-sm bg-gray-50"
                    value={processData.status}
                    onChange={(e) => setProcessData({ ...processData, status: e.target.value })}
                  >
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                ) : (
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={processData.status}
                    onChange={(e) => setProcessData({ ...processData, status: e.target.value })}
                  >
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Ghi chú admin</p>
                <Textarea value={processData.adminNote} onChange={(e) => setProcessData({ ...processData, adminNote: e.target.value })} placeholder="Nhập ghi chú..." />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsProcessOpen(false)}>Hủy</Button>
              <Button onClick={handleProcess} disabled={processMutation.isPending} className="bg-green-600 hover:bg-green-700 cursor-pointer">
                {processMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

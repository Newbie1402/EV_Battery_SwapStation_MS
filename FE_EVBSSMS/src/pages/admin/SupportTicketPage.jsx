import { useMemo, useState } from 'react';
import { supportTicketApi } from '@/api';
import useCustomQuery from '@/hooks/useCustomQuery';
import useCustomMutation from '@/hooks/useCustomMutation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/format';
import { toast } from 'react-hot-toast';
import { Search, Eye, CheckCircle2 } from 'lucide-react';

const STATUS_STYLES = {
  OPEN: 'bg-yellow-500 text-white',
  IN_PROGRESS: 'bg-purple-600 text-white',
  RESOLVED: 'bg-green-600 text-white',
  CLOSED: 'bg-gray-600 text-white'
};

const PRIORITY_LABEL = {
  LOW: 'Thấp', MEDIUM: 'Trung bình', HIGH: 'Cao'
};

export default function SupportTicketPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [detail, setDetail] = useState(null);
  const [processOpen, setProcessOpen] = useState(false);
  const [processData, setProcessData] = useState({ status: 'IN_PROGRESS', notes: '' });

  const { data: ticketsRaw, isLoading } = useCustomQuery(['admin-support-tickets'], supportTicketApi.getSupportTickets);
  const tickets = useMemo(() => Array.isArray(ticketsRaw?.data) ? ticketsRaw.data : (Array.isArray(ticketsRaw) ? ticketsRaw : []), [ticketsRaw]);

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q || [t.title, t.ticketId, t.user?.fullName, t.vehicle?.licensePlate, t.location].some(v => (v || '').toLowerCase().includes(q));
      const matchStatus = !statusFilter || t.status === statusFilter;
      const matchPriority = !priorityFilter || t.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const processMutation = useCustomMutation(
    ({ ticketId, nextStatus, notes }) => supportTicketApi.updateSupportTicketStatus(ticketId, { status: nextStatus, notes }),
    'PATCH',
    {
      invalidateKeys: ['admin-support-tickets'],
      onSuccess: () => {
        toast.success('Cập nhật trạng thái thành công');
        setProcessOpen(false);
        setProcessData({ status: 'IN_PROGRESS', notes: '' });
      }
    }
  );

  const openDetail = async (t) => {
    const res = await supportTicketApi.getSupportTicketById(t.ticketId);
    setDetail(res?.data || res);
  };

  const openProcess = (t) => {
    setDetail(t);
    let next = 'IN_PROGRESS';
    if (t.status === 'IN_PROGRESS') next = 'RESOLVED';
    if (t.status === 'RESOLVED') next = 'CLOSED';
    setProcessData({ status: next, notes: '' });
    setProcessOpen(true);
  };

  const handleProcess = () => {
    if (!detail?.ticketId) return;
    processMutation.mutate({ ticketId: detail.ticketId, nextStatus: processData.status, notes: processData.notes });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý yêu cầu hỗ trợ</h1>
            <p className="text-gray-600 mt-1">Xem, lọc, xử lý trạng thái ticket do người dùng gửi.</p>
          </div>
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input placeholder="Tìm theo tiêu đề, mã ticket, họ tên, biển số, địa điểm..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full md:w-48 border rounded-md p-2 text-sm">
            <option value="">Tất cả trạng thái</option>
            {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full md:w-40 border rounded-md p-2 text-sm">
            <option value="">Ưu tiên</option>
            {Object.keys(PRIORITY_LABEL).map(p => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
          </select>
        </div>

        {/* Danh sách ticket */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách yêu cầu</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : filtered.length === 0 ? (
              <p className="text-gray-500 italic">Không có ticket nào phù hợp.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-2">Mã</th>
                      <th className="px-4 py-2">Tiêu đề</th>
                      <th className="px-4 py-2">Người gửi</th>
                      <th className="px-4 py-2">Xe</th>
                      <th className="px-4 py-2">Ưu tiên</th>
                      <th className="px-4 py-2">Trạng thái</th>
                      <th className="px-4 py-2">Thời gian</th>
                      <th className="px-4 py-2 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(t => (
                      <tr key={t.ticketId} className="border-b">
                        <td className="px-4 py-2 font-medium">{t.ticketId}</td>
                        <td className="px-4 py-2">{t.title}</td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium">{t.user?.fullName || '-'}</span>
                            <span className="text-xs text-gray-500">{t.user?.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className="font-medium">{t.vehicle?.licensePlate || '-'}</span>
                            <span className="text-xs text-gray-500">{t.vehicle?.model}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2"><Badge className="bg-indigo-100 text-indigo-700">{t.priority}</Badge></td>
                        <td className="px-4 py-2"><Badge className={STATUS_STYLES[t.status] || 'bg-gray-500 text-white'}>{t.status}</Badge></td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Sự cố: {t.incidentTime ? formatDate(t.incidentTime) : '-'}</span>
                            <span className="text-xs text-gray-500">Tạo: {t.createdAt ? formatDate(t.createdAt) : '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openDetail(t)} className="cursor-pointer">
                              <Eye className="h-4 w-4 mr-1" /> Chi tiết
                            </Button>
                            <Button size="sm" onClick={() => openProcess(t)} className="bg-green-600 hover:bg-green-700 cursor-pointer">
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Xử lý
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Chi tiết */}
      <Dialog open={!!detail && !processOpen} onOpenChange={(o) => { if(!o) setDetail(null); }}>
        <DialogContent className="bg-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết ticket {detail?.ticketId}</DialogTitle>
            <DialogDescription>Xem thông tin đầy đủ của yêu cầu hỗ trợ</DialogDescription>
          </DialogHeader>
          {!detail ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Tiêu đề</p>
                  <p className="font-medium">{detail.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Trạng thái</p>
                  <Badge className={STATUS_STYLES[detail.status] || 'bg-gray-500 text-white'}>{detail.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ưu tiên</p>
                  <p className="font-medium">{detail.priority}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Loại</p>
                  <p className="font-medium">{detail.ticketType}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Mô tả</p>
                <p className="whitespace-pre-wrap">{detail.description || '-'}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Người gửi</p>
                  <p className="font-medium">{detail.user?.fullName} ({detail.user?.email})</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Xe</p>
                  <p className="font-medium">{detail.vehicle?.licensePlate} - {detail.vehicle?.model}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Sự cố lúc</p>
                  <p className="font-medium">{detail.incidentTime ? formatDate(detail.incidentTime) : '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tạo lúc</p>
                  <p className="font-medium">{detail.createdAt ? formatDate(detail.createdAt) : '-'}</p>
                </div>
              </div>
              {detail.resolutionNotes && (
                <div>
                  <p className="text-xs text-gray-500">Ghi chú xử lý</p>
                  <p className="whitespace-pre-wrap">{detail.resolutionNotes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Xử lý */}
      <Dialog open={processOpen} onOpenChange={setProcessOpen}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái</DialogTitle>
            <DialogDescription>Đổi trạng thái ticket và thêm ghi chú</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Trạng thái mới</p>
              <select className="w-full border rounded-md p-2 text-sm" value={processData.status} onChange={(e) => setProcessData({ ...processData, status: e.target.value })}>
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
              <Textarea value={processData.notes} onChange={(e) => setProcessData({ ...processData, notes: e.target.value })} placeholder="Nhập ghi chú xử lý..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setProcessOpen(false)}>Hủy</Button>
              <Button onClick={handleProcess} disabled={processMutation.isPending} className="bg-green-600 hover:bg-green-700 cursor-pointer">
                {processMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

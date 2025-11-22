import { useState, useMemo } from 'react';
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
import { Search, AlertCircle, Send, Clock, Bug, Zap, CreditCard, Battery, Info } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const TYPE_OPTIONS = [
  { value: 'BATTERY_ISSUE', label: 'Sự cố pin', icon: Battery },
  { value: 'VEHICLE_MALFUNCTION', label: 'Hỏng xe', icon: Bug },
  { value: 'STATION_EQUIPMENT', label: 'Thiết bị trạm', icon: Zap },
  { value: 'SWAP_FAILURE', label: 'Lỗi đổi pin', icon: AlertCircle },
  { value: 'PAYMENT_ISSUE', label: 'Thanh toán', icon: CreditCard },
  { value: 'SERVICE_QUALITY', label: 'Chất lượng dịch vụ', icon: Info },
  { value: 'OTHER', label: 'Khác', icon: Clock },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Thấp' },
  { value: 'MEDIUM', label: 'Trung bình' },
  { value: 'HIGH', label: 'Cao' },
];

const STATUS_STYLES = {
  SENT: 'bg-blue-500 text-white',
  OPEN: 'bg-yellow-500 text-white',
  IN_PROGRESS: 'bg-purple-600 text-white',
  RESOLVED: 'bg-green-600 text-white',
  CLOSED: 'bg-gray-600 text-white'
};

export default function DriverSupportTicketPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [form, setForm] = useState({ ticketType: 'BATTERY_ISSUE', title: '', priority: 'MEDIUM', description: '', incidentTime: '' });
  const { employeeId } = useAuthStore();

  // Query tickets của user
  const { data: ticketsRaw, isLoading: loadingTickets } = useCustomQuery(['driver-support-tickets', employeeId], () => supportTicketApi.getSupportTicketsByEmployeeId(employeeId), { enabled: !!employeeId });
  const tickets = useMemo(() => Array.isArray(ticketsRaw?.data) ? ticketsRaw.data : (Array.isArray(ticketsRaw) ? ticketsRaw : []), [ticketsRaw]);

  // Lọc tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchSearch = search.trim() === '' || (t.title || '').toLowerCase().includes(search.toLowerCase()) || (t.ticketType || '').toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === '' || t.ticketType === typeFilter;
      const matchPriority = priorityFilter === '' || t.priority === priorityFilter;
      return matchSearch && matchType && matchPriority;
    });
  }, [tickets, search, typeFilter, priorityFilter]);

  // Mutation tạo ticket
  const createMutation = useCustomMutation(
    (data) => supportTicketApi.createSupportTicket(data.ticketType, data.title, data.priority, data.description, data.incidentTime),
    'POST',
    {
      invalidateKeys: ['my-support-tickets'],
      onSuccess: () => {
        toast.success('Gửi yêu cầu hỗ trợ thành công');
        setIsCreateOpen(false);
        setForm({ ticketType: 'BATTERY_ISSUE', title: '', priority: 'MEDIUM', description: '', incidentTime: '' });
      }
    }
  );

  const handleSubmit = () => {
    if (!form.title.trim()) {
      toast.error('Tiêu đề không được trống');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Mô tả không được trống');
      return;
    }
    if (!form.incidentTime) {
      toast.error('Chọn thời gian xảy ra sự cố');
      return;
    }
    createMutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-blue-600" /> Hỗ trợ & Báo lỗi
            </h1>
            <p className="text-gray-600 mt-1">Gửi yêu cầu hỗ trợ và theo dõi trạng thái xử lý.</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 cursor-pointer">Gửi yêu cầu</Button>
        </div>

        {/* Bộ lọc */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input placeholder="Tìm kiếm theo tiêu đề hoặc loại..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full md:w-48 border rounded-md p-2 text-sm">
            <option value="">Loại yêu cầu</option>
            {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full md:w-40 border rounded-md p-2 text-sm">
            <option value="">Ưu tiên</option>
            {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        {/* Danh sách ticket */}
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu đã gửi</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTickets ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
            ) : filteredTickets.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có yêu cầu nào.</p>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map(t => {
                  const TypeIcon = TYPE_OPTIONS.find(o => o.value === t.ticketType)?.icon || Info;
                  return (
                    <div key={t.ticketId || t.id} className="p-4 border rounded-lg bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <TypeIcon className="h-5 w-5 text-blue-600" />
                          <p className="font-semibold">{t.title || 'Không tiêu đề'}</p>
                          <Badge className={STATUS_STYLES[t.status] || 'bg-gray-500 text-white'}>{t.status}</Badge>
                          <Badge className="bg-indigo-100 text-indigo-700">{t.priority}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Loại: <span className="font-medium">{t.ticketType}</span></p>
                        <p className="text-sm text-gray-600">Mô tả: {t.description || '-'}</p>
                        <p className="text-xs text-gray-400 mt-1">Gửi lúc: {t.createdAt ? formatDate(t.createdAt) : '-'}</p>
                        {t.incidentTime && <p className="text-xs text-gray-400">Thời điểm sự cố: {formatDate(t.incidentTime)}</p>}
                        {t.message && <p className="text-xs text-gray-500">Phản hồi: {t.message}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog tạo ticket */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white max-w-xl">
          <DialogHeader>
            <DialogTitle>Gửi yêu cầu hỗ trợ</DialogTitle>
            <DialogDescription>Điền thông tin bên dưới để tạo yêu cầu mới.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Loại yêu cầu</p>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={form.ticketType}
                  onChange={(e) => setForm({ ...form, ticketType: e.target.value })}
                >
                  {TYPE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Mức ưu tiên</p>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  {PRIORITY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Tiêu đề</p>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Pin đổi xong không nhận" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Mô tả chi tiết</p>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả rõ sự cố bạn gặp..." />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Thời điểm xảy ra sự cố</p>
              <Input type="datetime-local" value={form.incidentTime} onChange={(e) => setForm({ ...form, incidentTime: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Hủy</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700 cursor-pointer flex items-center gap-2">
                {createMutation.isPending ? 'Đang gửi...' : <><Send className="h-4 w-4" /> Gửi yêu cầu</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

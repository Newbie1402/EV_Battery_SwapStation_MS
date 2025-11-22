import { useState, useMemo, useEffect } from 'react';
import { aiReportApi } from '@/api/aiReportApi.js';
import useCustomQuery from '@/hooks/useCustomQuery';
import { useAuthStore } from '@/store/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

/**
 * AIReportWidget: Hiển thị phân tích tần suất đổi pin & dự báo nhu cầu nâng cấp trạm.
 * Chỉ hiển thị với role ADMIN. Cố định góc phải dưới toàn bộ layout admin.
 */
export default function AIReportWidget() {
  const { role } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ai_report_widget_collapsed') === 'true';
    }
    return false;
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  const {
    data: reportRaw,
    isLoading,
    error,
    refetch
  } = useCustomQuery(['ai-report-analyze-all'], aiReportApi.getAIReport, {
    staleTime: 5 * 60 * 1000
  });

  // Tự động refetch mỗi 10 phút nếu bật autoRefresh
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      refetch();
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, [autoRefresh, refetch]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ai_report_widget_collapsed', String(collapsed));
    }
  }, [collapsed]);

  const aiText = useMemo(() => {
    const candidates = reportRaw?.data?.candidates || reportRaw?.candidates;
    return candidates?.[0]?.content?.parts?.[0]?.text || '';
  }, [reportRaw]);

  const parsedBlocks = useMemo(() => {
    if (!aiText) return [];
    // Tách theo khoảng xuống dòng kép giữa các ngày
    const rawParts = aiText.split(/\n\n(?=Trạm )/).map(p => p.trim()).filter(Boolean);
    return rawParts.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const header = lines[0];
      const freqLine = lines.find(l => l.startsWith('- Báo cáo tần suất đổi pin')) || '';
      const demandLine = lines.find(l => l.startsWith('- Dự đoán nhu cầu sử dụng trạm')) || '';
      const upgradeLine = lines.find(l => l.startsWith('- Đề xuất nâng cấp hạ tầng') || l.startsWith('- Đề xuất nâng cấp hạ tầng hoặc dịch vụ')) || '';
      return { header, freqLine, demandLine, upgradeLine, raw: block };
    });
  }, [aiText]);

  const latest = parsedBlocks[parsedBlocks.length - 1];

  const fetchReport = () => {
    refetch();
    toast.success('Đã làm mới báo cáo AI');
  };

  if (role !== 'ADMIN') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[340px] font-sans">
      <Card className="border border-blue-200 shadow-lg bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">Phân tích AI (Tần suất & Dự báo)</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={fetchReport}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCollapsed(c => !c)}
            >
              {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        {!collapsed && (
          <CardContent className="p-0">
            {error && (
              <div className="p-4 text-sm text-red-600">Không thể tải báo cáo AI.</div>
            )}
            {isLoading && !error && (
              <div className="p-4 text-sm text-slate-600 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" /> Đang tải phân tích...
              </div>
            )}
            {reportRaw && !isLoading && !error && aiText && (
              <div>
                  <ScrollArea className="h-[60vh]">
                      {/* Tổng quan mới nhất */}
                      {latest && (
                          <div className="px-4 pt-4 pb-3 border-b bg-blue-50/40">
                              <p className="text-xs uppercase tracking-wide text-blue-700 font-medium">Tổng quan mới nhất</p>
                              <p className="mt-1 text-xs text-slate-600 font-medium">{latest.header}</p>
                              <ul className="mt-2 space-y-1 text-xs text-slate-700">
                                  {latest.freqLine && <li>{latest.freqLine.replace('- ', '')}</li>}
                                  {latest.demandLine && <li>{latest.demandLine.replace('- ', '')}</li>}
                                  {latest.upgradeLine && <li className="font-semibold text-blue-800">{latest.upgradeLine.replace('- ', '')}</li>}
                              </ul>
                          </div>
                      )}

                      {/* Lịch sử gần đây (KHÔNG CẦN SCROLL AREA RIÊNG NỮA) */}
                      <div className="divide-y">
                          {parsedBlocks.slice(0, -1).reverse().map((b, idx) => (
                              <div key={idx} className="px-4 py-3 hover:bg-slate-50/70 transition">
                                  <p className="text-[11px] font-semibold text-slate-700 mb-1">{b.header}</p>
                                  <ul className="space-y-1 text-[11px] text-slate-600">
                                      {b.freqLine && <li>{b.freqLine.replace('- ', '')}</li>}
                                      {b.demandLine && <li>{b.demandLine.replace('- ', '')}</li>}
                                      {b.upgradeLine && (<li className="font-medium text-blue-700">{b.upgradeLine.replace('- ', '')}</li>)}
                                  </ul>
                              </div>
                          ))}
                          {parsedBlocks.length === 0 && (
                              <div className="p-4 text-xs text-slate-500">Không trích xuất được nội dung báo cáo.</div>
                          )}
                      </div>
                  </ScrollArea>
                {/* Tùy chọn */}
                <div className="flex items-center justify-between px-3 py-2 border-t bg-slate-50/60">
                  <label className="flex items-center gap-2 text-[11px] text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="h-3 w-3 rounded border-slate-300"
                      disabled={!reportRaw}
                    />
                    Tự làm mới 10 phút
                  </label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 px-2 text-[11px]"
                      onClick={fetchReport}
                      disabled={isLoading}
                    >
                      Làm mới
                    </Button>
                    <Button
                      size="sm"
                      className="h-6 px-2 text-[11px] bg-blue-600 hover:bg-blue-700"
                      onClick={() => setDetailOpen(true)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-white max-w-3xl">
          <DialogHeader>
            <DialogTitle>Phân tích AI chi tiết</DialogTitle>
            <DialogDescription>Toàn bộ nội dung báo cáo tần suất & dự báo nâng cấp trạm</DialogDescription>
          </DialogHeader>
          {!aiText ? (
            <div className="text-sm text-slate-500">Không có nội dung để hiển thị.</div>
          ) : (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                {parsedBlocks.slice().reverse().map((b, idx) => (
                  <div key={idx} className="border rounded-md p-3 bg-slate-50/60">
                    <p className="text-xs font-semibold text-slate-700 mb-2">{b.header}</p>
                    <div className="space-y-1 text-xs leading-relaxed text-slate-600">
                      {b.freqLine && <p><span className="font-medium">Tần suất:</span> {b.freqLine.replace('- Báo cáo tần suất đổi pin: ', '')}</p>}
                      {b.demandLine && <p><span className="font-medium">Dự đoán:</span> {b.demandLine.replace('- Dự đoán nhu cầu sử dụng trạm: ', '')}</p>}
                      {b.upgradeLine && <p><span className="font-medium">Đề xuất:</span> {b.upgradeLine.replace(/- Đề xuất nâng cấp hạ tầng( hoặc dịch vụ)?: /, '')}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (aiText) {
                  navigator.clipboard.writeText(aiText).then(() => toast.success('Đã sao chép nội dung báo cáo')); }
              }}
              disabled={!aiText}
            >
              Sao chép
            </Button>
            <Button onClick={() => setDetailOpen(false)} className="bg-blue-600 hover:bg-blue-700">Đóng</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


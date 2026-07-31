import { useState, useEffect } from 'react';
import { CheckCircle2, ChevronRight, AlertCircle, Play, Pause, ArrowRight, CornerDownLeft, ShieldCheck, FileCheck, CheckCheck, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  type BuocHopDong,
  getAvailableTransitions,
  getStateLabel,
  getStateColor,
  canTransition,
} from '../lib/workflow';
import { updateBuocHopDong } from '../services/workflow';

const STEPS: { id: BuocHopDong; label: string; note: string }[] = [
  { id: 'du-thao', label: '1. Dự thảo', note: 'Lập HĐ & Giao việc' },
  { id: 'cho-duyet', label: '2. Chờ duyệt', note: 'Duyệt HĐ & Giao việc' },
  { id: 'dang-thuc-hien', label: '3. Đang thực hiện', note: 'Triển khai kỹ thuật' },
  { id: 'hoan-thanh', label: '4. Hoàn thành', note: 'Nghiệm thu & Quyết toán' },
  { id: 'thanh-ly', label: '5. Thanh lý & Lưu trữ', note: 'Lưu kho hồ sơ (Đ.8)' },
];

export function WorkflowStepper({
  hopDongId,
  buocHienTai,
  onStateChanged,
  readOnly = false,
}: {
  hopDongId?: string;
  buocHienTai: BuocHopDong | string;
  onStateChanged?: () => void;
  readOnly?: boolean;
}) {
  const { vaiTro } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [localStep, setLocalStep] = useState<BuocHopDong | string>(buocHienTai);

  useEffect(() => {
    setLocalStep(buocHienTai);
  }, [buocHienTai]);

  const rawStep = localStep || buocHienTai || 'du-thao';
  const normCurrentStep: BuocHopDong =
    rawStep === 'moi' || rawStep === 'du-thao' ? 'du-thao' :
    rawStep === 'cho-duyet' ? 'cho-duyet' :
    rawStep === 'dang-thuc-hien' || rawStep === 'nghiem-thu' ? 'dang-thuc-hien' :
    rawStep === 'hoan-thanh' || rawStep === 'quyet-toan' ? 'hoan-thanh' :
    rawStep === 'thanh-ly' ? 'thanh-ly' :
    rawStep === 'tam-dung' ? 'tam-dung' :
    rawStep === 'huy' ? 'huy' : 'du-thao';

  const currentStep = normCurrentStep;
  const availableNext = getAvailableTransitions(currentStep, vaiTro);

  const handleTransition = async (nextStep: BuocHopDong) => {
    // Chặn ở client cho khớp ma trận thẩm quyền (Điều 9) — RLS phía CSDL vẫn là chốt chặn cuối.
    if (!canTransition(currentStep, nextStep, vaiTro)) {
      setErr(`Vai trò hiện tại không có thẩm quyền chuyển sang "${getStateLabel(nextStep)}".`);
      return;
    }
    setLocalStep(nextStep);
    setUpdating(true);
    setErr(null);
    try {
      if (hopDongId) await updateBuocHopDong(hopDongId, nextStep);
      onStateChanged?.();
    } catch (e) {
      // Ghi trạng thái thất bại — trả về bước cũ và báo rõ, tuyệt đối không im lặng.
      setLocalStep(buocHienTai);
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setUpdating(false);
    }
  };

  const getStepIndex = (step: BuocHopDong) => {
    return STEPS.findIndex((s) => s.id === step);
  };

  const currentIdx = getStepIndex(currentStep);

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-3 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Quy trình xử lý hợp đồng (Workflow Engine)</h4>
          <p className="text-[11px] text-ink-secondary mt-0.5 flex items-center gap-1.5">
            Trạng thái hiện tại: <span className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold ${getStateColor(currentStep)}`}>{getStateLabel(currentStep)}</span>
          </p>
        </div>
      </div>

      {/* Visual Stepper Timeline */}
      <div className="relative flex items-center justify-between px-2 py-1 overflow-x-auto">
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-border/70 -translate-y-1/2 z-0" />

        {STEPS.map((step, idx) => {
          const isDone = currentIdx > idx && currentStep !== 'huy' && currentStep !== 'tam-dung';
          const isCurrent = currentStep === step.id;
          const isPaused = currentStep === 'tam-dung' && step.id === 'dang-thuc-hien';
          const isCancelled = currentStep === 'huy';

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-default text-center">
              <div
                className={`flex h-5.5 w-5.5 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                  isCurrent
                    ? 'ring-3 ring-primary-100 bg-primary text-white scale-105 shadow-2xs'
                    : isDone
                    ? 'bg-emerald-600 text-white'
                    : isPaused
                    ? 'bg-amber-500 text-white'
                    : isCancelled
                    ? 'bg-red-500 text-white'
                    : 'bg-surface border border-border-subtle text-ink-muted'
                }`}
                style={{ width: '22px', height: '22px' }}
              >
                {isDone ? <CheckCircle2 size={12} /> : idx + 1}
              </div>
              <span
                className={`mt-1 text-[11px] font-medium whitespace-nowrap tracking-tight ${
                  isCurrent ? 'text-primary font-bold' : isDone ? 'text-ink-primary' : 'text-ink-muted'
                }`}
              >
                {step.label}
              </span>
              <span className="text-[9px] text-ink-muted leading-none mt-0.5">
                {step.note}
              </span>
            </div>
          );
        })}
      </div>

      {err && (
        <p className="flex items-start gap-1.5 rounded-md bg-danger-subtle px-2 py-1.5 text-[11px] font-semibold text-danger">
          <AlertCircle size={13} className="mt-px shrink-0" /> Không chuyển được bước: {err}
        </p>
      )}

      {/* Action Buttons for Next Transitions */}
      {!readOnly && hopDongId && availableNext.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border-subtle/80">
          <span className="text-[10px] font-bold text-ink-muted uppercase mr-1">Chuyển bước tiếp:</span>
          {availableNext.map((nextStep) => {
            const isReject = nextStep === 'du-thao' || nextStep === 'huy';
            const isPause = nextStep === 'tam-dung';

            return (
              <button
                key={nextStep}
                disabled={updating}
                onClick={() => handleTransition(nextStep)}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all disabled:opacity-50 ${
                  isReject
                    ? 'bg-danger-subtle text-danger hover:bg-danger/20'
                    : isPause
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    : 'btn-primary shadow-2xs'
                }`}
              >
                {isReject ? <CornerDownLeft size={11} /> : isPause ? <Pause size={11} /> : <ArrowRight size={11} />}
                {getStateLabel(nextStep)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Landmark, Crown, Award, Users } from 'lucide-react';
import { LOAI_DON_VI } from '../services/org';
import type { DonVi, LoaiDonVi, NhanSu } from '../types';
import { cn } from '../lib/utils';

// ─── Cấu hình màu theo loại đơn vị (giữ nguyên hệ màu cũ) ───
const GROUP_COLOR: Record<LoaiDonVi, string> = {
  'lanh-dao': '#AE1E23',
  'phong-chuc-nang': '#64748b',
  'vien-chuyen-nganh': '#00668c',
  'phan-vien': '#3b82f6',
  'trung-tam': '#10b981',
  'cong-ty': '#f59e0b',
};

type NodeData = {
  label: string;
  subtitle?: string;
  count?: number;
  color?: string;
  selected?: boolean;
  onSelect?: () => void;
  kind?: 'director' | 'deputy';
};

// ─── Custom nodes ───

function RootNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div className="relative">
      <Handle type="source" position={Position.Bottom} className="!bg-primary-400" />
      <div className="min-w-[240px] rounded-2xl border-2 border-primary-400/30 bg-gradient-to-br from-primary-700 to-primary-900 px-8 py-3 text-center text-white shadow-xl ring-4 ring-primary-700/20">
        <div className="flex items-center justify-center gap-2">
          <Landmark className="h-4 w-4 opacity-80" />
          <span className="text-xs font-black uppercase tracking-wide">{d.label}</span>
        </div>
        {d.subtitle && <p className="mt-0.5 text-[10px] opacity-60">{d.subtitle}</p>}
      </div>
    </div>
  );
}

function LeaderNode({ data }: NodeProps) {
  const d = data as NodeData;
  const isDirector = d.kind === 'director';
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-[#AE1E23]" />
      <Handle type="source" position={Position.Bottom} className="!bg-[#AE1E23]" />
      {isDirector ? (
        <div 
          className="relative min-w-[220px] overflow-hidden rounded-2xl border-2 border-[#AE1E23]/40 px-8 py-4 text-center text-white shadow-xl ring-4 ring-[#AE1E23]/20"
          style={{ background: 'linear-gradient(135deg, #AE1E23 0%, #881519 100%)', borderColor: '#AE1E23' }}
        >
          <div className="mb-1 flex items-center justify-center gap-2">
            <Crown className="h-4 w-4 opacity-90" />
            <span className="text-sm font-black uppercase tracking-tight">{d.label}</span>
          </div>
          {d.subtitle && <p className="text-[11px] font-medium opacity-90">{d.subtitle}</p>}
        </div>
      ) : (
        <div 
          className="min-w-[160px] rounded-xl border-2 bg-surface px-5 py-3 text-center shadow-md transition-all hover:shadow-lg"
          style={{ borderColor: '#AE1E23' }}
        >
          <div className="mb-0.5 flex items-center justify-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-[#AE1E23]" />
            <span className="text-[11px] font-black uppercase tracking-tight text-[#AE1E23]">
              {d.label}
            </span>
          </div>
          {d.subtitle && <p className="text-[11px] font-bold text-ink">{d.subtitle}</p>}
        </div>
      )}
    </div>
  );
}

function UnitNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-slate-300" />
      <button
        onClick={d.onSelect}
        title={d.label}
        className={cn(
          'w-40 cursor-pointer rounded-lg border-2 px-3 py-2.5 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover text-white',
          d.selected ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-page border-white scale-102 shadow-lg' : 'border-transparent',
        )}
        style={{ 
          backgroundColor: d.color || '#64748b',
        }}
      >
        <p className="line-clamp-2 text-[11px] font-black leading-tight text-white">{d.label}</p>
        {d.subtitle ? (
          <p className="mt-1 line-clamp-1 text-2xs font-semibold text-white/90">{d.subtitle}</p>
        ) : (
          <p className="mt-1 line-clamp-1 text-2xs italic text-white/60">Chưa cập nhật</p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-2xs font-black text-white backdrop-blur-sm">
          <Users size={10} className="text-white/95" /> {d.count}
        </span>
      </button>
    </div>
  );
}

const nodeTypes = { root: RootNode, leader: LeaderNode, unit: UnitNode };

// ─── Layout: sơ đồ báo cáo thật (Viện trưởng → Phó VT → đơn vị phụ trách) ───
// Các đơn vị dưới cùng một Phó Viện trưởng nằm NGANG HÀNG (cùng cấp), mỗi đơn vị
// nối thẳng lên Phó VT phụ trách.

const UNIT_W = 168;
const UNIT_GAP = 16;
const UNIT_SLOT = UNIT_W + UNIT_GAP; // footprint ngang của mỗi đơn vị
const BAND_GAP = 48; // khoảng cách giữa các "band" của từng Phó VT
const Y_ROOT = 0;
const Y_DIRECTOR = 140;
const Y_DEPUTY = 300;
const Y_UNIT = 460;

interface Props {
  donViList: DonVi[];
  nhanSuList: NhanSu[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function OrgChartTree({ donViList, nhanSuList, selectedId, onSelect }: Props) {
  const { nodes, edges, contentWidth, contentHeight } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Chỉ lấy lãnh đạo thuộc khối "Lãnh đạo Viện" (tránh nhầm với Phó Viện trưởng của viện chuyên ngành)
    const lanhDao = nhanSuList.filter((n) => n.donVi === 'Lãnh đạo Viện');
    const vienTruong = lanhDao.find((n) => n.chucDanh === 'Viện trưởng');
    const phoVienTruong = lanhDao.filter((n) => n.chucDanh === 'Phó Viện trưởng');

    const donViThuoc = donViList.filter((d) => d.loai !== 'lanh-dao');

    // Mỗi Phó VT là một "band" ngang; đơn vị chưa phân công → band "trực thuộc Viện trưởng"
    const bands: { key: string; pv: NhanSu | null; units: DonVi[] }[] = phoVienTruong.map((pv) => ({
      key: `deputy-${pv.id}`,
      pv,
      units: donViThuoc.filter((d) => d.phuTrachId === pv.id),
    }));
    const chuaPhanCong = donViThuoc.filter(
      (d) => !d.phuTrachId || !phoVienTruong.some((pv) => pv.id === d.phuTrachId),
    );
    if (chuaPhanCong.length > 0) {
      bands.push({ key: 'truc-thuoc', pv: null, units: chuaPhanCong });
    }

    // Trải các band theo chiều ngang; đơn vị trong band nằm cùng một hàng (Y_UNIT)
    let cursorX = 0;
    bands.forEach((band) => {
      const n = Math.max(1, band.units.length);
      const bandStart = cursorX;
      const bandWidth = n * UNIT_SLOT - UNIT_GAP;
      const bandCenter = bandStart + bandWidth / 2;

      // Node Phó Viện trưởng ở giữa band
      if (band.pv) {
        nodes.push({
          id: band.key,
          type: 'leader',
          position: { x: bandCenter - 80, y: Y_DEPUTY },
          width: 160,
          height: 70,
          data: { label: 'Phó Viện trưởng', subtitle: band.pv.hoTen, kind: 'deputy' },
        });
        edges.push({
          id: `e-dir-${band.key}`,
          source: 'director',
          target: band.key,
          type: 'smoothstep',
          style: { stroke: '#AE1E23', strokeWidth: 1.5 },
        });
      }

      const parentId = band.pv ? band.key : 'director';
      band.units.forEach((dv, ui) => {
        const ux = bandStart + ui * UNIT_SLOT + UNIT_W / 2;
        nodes.push({
          id: `unit-${dv.id}`,
          type: 'unit',
          position: { x: ux - 80, y: Y_UNIT },
          width: 160,
          height: 95,
          data: {
            label: dv.tenVietTat || dv.ten,
            subtitle: dv.truongDonVi ?? undefined,
            count: dv.soNhanSu,
            color: GROUP_COLOR[dv.loai],
            selected: selectedId === dv.id,
            onSelect: () => onSelect(dv.id),
          },
        });
        edges.push({
          id: `e-${parentId}-${dv.id}`,
          source: parentId,
          target: `unit-${dv.id}`,
          type: 'smoothstep',
          style: { stroke: GROUP_COLOR[dv.loai], strokeWidth: 1.5 },
        });
      });

      cursorX += bandWidth + BAND_GAP;
    });

    const totalWidth = Math.max(240, cursorX - BAND_GAP);
    const centerX = totalWidth / 2;

    // Root
    nodes.push({
      id: 'root',
      type: 'root',
      position: { x: centerX - 120, y: Y_ROOT },
      width: 240,
      height: 80,
      data: { label: 'Viện Khoa học Công nghệ Xây dựng', subtitle: 'Bộ Xây dựng' },
    });

    // Viện trưởng
    nodes.push({
      id: 'director',
      type: 'leader',
      position: { x: centerX - 110, y: Y_DIRECTOR },
      width: 220,
      height: 90,
      data: { label: 'Viện trưởng', subtitle: vienTruong?.hoTen ?? 'Đang cập nhật', kind: 'director' },
    });
    edges.push({
      id: 'e-root-director',
      source: 'root',
      target: 'director',
      type: 'smoothstep',
      style: { stroke: '#AE1E23', strokeWidth: 2 },
    });

    const contentWidth = Math.max(totalWidth, 240);
    const contentHeight = Y_UNIT + 95;

    return { nodes, edges, contentWidth, contentHeight };
  }, [donViList, nhanSuList, selectedId, onSelect]);

  // Đo container bằng getBoundingClientRect (không phụ thuộc ResizeObserver) để tự tính viewport ban đầu.
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const measureRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setContainerSize({ w: el.clientWidth, h: el.clientHeight });
  }, []);

  const defaultViewport = useMemo(() => {
    if (!containerSize) return { x: 0, y: 0, zoom: 1 };
    const PADDING = 0.1;
    const scaleX = (containerSize.w * (1 - PADDING)) / contentWidth;
    const scaleY = (containerSize.h * (1 - PADDING)) / contentHeight;
    const zoom = Math.min(1.2, Math.max(0.2, Math.min(scaleX, scaleY)));
    const x = (containerSize.w - contentWidth * zoom) / 2;
    const y = (containerSize.h - contentHeight * zoom) / 2;
    return { x, y, zoom };
  }, [containerSize, contentWidth, contentHeight]);

  return (
    <div ref={measureRef} className="relative h-[640px] overflow-hidden rounded-b-xl bg-page">
      {containerSize && (
        <ReactFlow
          key={nodes.length}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultViewport={defaultViewport}
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border-default)" />
        <Controls className="!rounded-xl !border-border !bg-surface !shadow-card" />
        <MiniMap
          className="!rounded-xl !border-border !bg-surface"
          nodeColor={(n) => {
            const d = n.data as NodeData;
            if (n.type === 'root') return '#00415a';
            if (n.type === 'leader') return '#00668c';
            return d.color ?? '#64748b';
          }}
          maskColor="rgba(0,0,0,0.15)"
        />
        </ReactFlow>
      )}

      {/* Chú giải */}
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl border border-border bg-surface/90 px-4 py-3 shadow-card backdrop-blur">
        <p className="mb-2 text-2xs font-black uppercase tracking-widest text-ink-muted">Chú giải</p>
        {LOAI_DON_VI.map(({ ma, ten }) => (
          <div key={ma} className="mb-1 flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ background: GROUP_COLOR[ma] }} />
            <span className="text-2xs text-ink-muted">{ten}</span>
          </div>
        ))}
        <p className="mt-2 max-w-[180px] text-2xs italic text-ink-muted">
          * Cột dưới mỗi Phó Viện trưởng là các đơn vị được phân công phụ trách (đặt tại form Sửa đơn vị).
        </p>
      </div>
    </div>
  );
}

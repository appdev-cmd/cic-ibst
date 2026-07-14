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
      <Handle type="target" position={Position.Top} className="!bg-primary-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-primary-400" />
      {isDirector ? (
        <div className="relative min-w-[220px] overflow-hidden rounded-2xl border-2 border-primary-400/40 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 px-8 py-4 text-center text-white shadow-xl ring-4 ring-primary-500/20">
          <div className="mb-1 flex items-center justify-center gap-2">
            <Crown className="h-4 w-4 opacity-90" />
            <span className="text-sm font-black uppercase tracking-tight">{d.label}</span>
          </div>
          {d.subtitle && <p className="text-[11px] font-medium opacity-90">{d.subtitle}</p>}
        </div>
      ) : (
        <div className="min-w-[160px] rounded-xl border-2 border-primary-200 bg-surface px-5 py-3 text-center shadow-md transition-all hover:shadow-lg dark:border-primary-700">
          <div className="mb-0.5 flex items-center justify-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-primary-500" />
            <span className="text-[11px] font-black uppercase tracking-tight text-primary-600 dark:text-primary-400">
              {d.label}
            </span>
          </div>
          {d.subtitle && <p className="text-[10px] font-medium text-ink-muted">{d.subtitle}</p>}
        </div>
      )}
    </div>
  );
}

function GroupNode({ data }: NodeProps) {
  const d = data as NodeData;
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
      <div
        className="min-w-[140px] max-w-[160px] rounded-xl border border-white/20 px-4 py-3 text-center text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${d.color}dd, ${d.color})` }}
      >
        <p className="text-[10px] font-black uppercase leading-tight tracking-tight">{d.label}</p>
        {d.count !== undefined && (
          <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5">
            <Users className="h-2.5 w-2.5" />
            <span className="text-[9px] font-bold">{d.count}</span>
          </div>
        )}
      </div>
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
          'w-40 cursor-pointer rounded-lg border-2 bg-surface px-3 py-2.5 text-center shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover',
          d.selected ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-page' : '',
        )}
        style={{ borderColor: d.selected ? undefined : `${d.color}55` }}
      >
        <p className="line-clamp-2 text-[11px] font-bold leading-tight text-ink">{d.label}</p>
        {d.subtitle && <p className="mt-0.5 line-clamp-1 text-2xs text-ink-muted">{d.subtitle}</p>}
        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-subtle px-2 py-0.5 text-2xs font-bold text-ink-secondary">
          <Users size={10} /> {d.count}
        </span>
      </button>
    </div>
  );
}

const nodeTypes = { root: RootNode, leader: LeaderNode, group: GroupNode, unit: UnitNode };

// ─── Layout ───

const UNIT_W = 170;
const GROUP_GAP = 40;
const Y_ROOT = 0;
const Y_DIRECTOR = 120;
const Y_DEPUTY = 250;
const Y_GROUP = 390;
const Y_UNIT = 520;

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

    const vienTruong = nhanSuList.find((n) => n.chucDanh === 'Viện trưởng');
    const phoVienTruong = nhanSuList.filter((n) => n.chucDanh === 'Phó Viện trưởng');

    const groups = LOAI_DON_VI.filter((l) => l.ma !== 'lanh-dao')
      .map(({ ma, ten }) => ({ ma, ten, items: donViList.filter((d) => d.loai === ma) }))
      .filter((g) => g.items.length > 0);

    // Tính toạ độ X cho từng cụm nhóm + đơn vị con
    let cursorX = 0;
    const groupCenters: number[] = [];
    groups.forEach((g) => {
      const clusterWidth = Math.max(1, g.items.length) * UNIT_W;
      const startX = cursorX;
      const centerX = startX + clusterWidth / 2;
      groupCenters.push(centerX);

      nodes.push({
        id: `group-${g.ma}`,
        type: 'group',
        position: { x: centerX - 70, y: Y_GROUP },
        width: 140,
        height: 85,
        data: { label: g.ten, count: g.items.length, color: GROUP_COLOR[g.ma] },
      });

      g.items.forEach((dv, i) => {
        const ux = startX + i * UNIT_W + UNIT_W / 2;
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
            color: GROUP_COLOR[g.ma],
            selected: selectedId === dv.id,
            onSelect: () => onSelect(dv.id),
          },
        });
        edges.push({
          id: `e-group-${dv.id}`,
          source: `group-${g.ma}`,
          target: `unit-${dv.id}`,
          type: 'step',
          style: { stroke: GROUP_COLOR[g.ma], strokeWidth: 1.5 },
        });
      });

      cursorX += clusterWidth + GROUP_GAP;
    });

    const totalWidth = cursorX - GROUP_GAP;
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
      type: 'step',
      style: { stroke: '#00415a', strokeWidth: 2 },
    });

    // Phó viện trưởng — dàn hàng ngang quanh tâm
    const deputyCount = Math.max(1, phoVienTruong.length);
    const deputySpread = Math.min(320, totalWidth * 0.5);
    phoVienTruong.forEach((pv, i) => {
      const dx =
        deputyCount === 1
          ? centerX
          : centerX - deputySpread / 2 + (deputySpread / (deputyCount - 1)) * i;
      const id = `deputy-${pv.id}`;
      nodes.push({
        id,
        type: 'leader',
        position: { x: dx - 80, y: Y_DEPUTY },
        width: 160,
        height: 70,
        data: { label: 'Phó Viện trưởng', subtitle: pv.hoTen, kind: 'deputy' },
      });
      edges.push({
        id: `e-director-${id}`,
        source: 'director',
        target: id,
        type: 'step',
        style: { stroke: '#3995b8', strokeWidth: 1.5 },
      });
    });

    // Nhóm đơn vị nối trực tiếp từ Viện trưởng (chưa có dữ liệu phân công theo từng Phó)
    groupCenters.forEach((_, i) => {
      const g = groups[i];
      edges.push({
        id: `e-director-group-${g.ma}`,
        source: 'director',
        target: `group-${g.ma}`,
        type: 'step',
        style: { stroke: GROUP_COLOR[g.ma], strokeWidth: 1.5 },
      });
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
          * Phân công phụ trách theo Phó Viện trưởng chưa có trong dữ liệu — nhóm nối trực tiếp từ Viện trưởng.
        </p>
      </div>
    </div>
  );
}

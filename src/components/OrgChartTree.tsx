import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Handle,
  Position,
  BaseEdge,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Crown,
  Award,
  Users,
  X,
  Search,
  ArrowDown,
} from 'lucide-react';
import { LOAI_DON_VI } from '../services/org';
import type { DonVi, LoaiDonVi, NhanSu } from '../types';
import { cn } from '../lib/utils';

// ─── Cấu hình màu theo loại đơn vị (chuẩn hệ thống IBST) ───
const GROUP_COLOR: Record<LoaiDonVi, string> = {
  'lanh-dao': '#AE1E23',
  'phong-chuc-nang': '#475569',
  'vien-chuyen-nganh': '#0284c7',
  'phan-vien': '#2563eb',
  'trung-tam': '#059669',
  'cong-ty': '#d97706',
};

const LOAI_SHORT_LABEL: Record<LoaiDonVi, string> = {
  'lanh-dao': 'Lãnh đạo',
  'phong-chuc-nang': 'Phòng ban',
  'vien-chuyen-nganh': 'Viện CN',
  'phan-vien': 'Phân viện',
  'trung-tam': 'Trung tâm',
  'cong-ty': 'Công ty',
};

// ─── Custom Orthogonal Tree Step Edge (Đường nối phân cấp vuông góc thẳng tắp) ───
function TreeStepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  data,
}: EdgeProps) {
  // Nếu cùng tọa độ X (cùng cột) -> đường thẳng đứng tuyệt đối
  if (Math.abs(sourceX - targetX) < 1) {
    const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    return <BaseEdge id={id} path={path} style={style} />;
  }

  // Tọa độ Y của thanh ngang (nếu truyền data.midY thì dùng cố định để tạo thanh ngang đồng mức)
  const midY = (data as { midY?: number })?.midY ?? (sourceY + targetY) / 2;
  const path = `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`;
  return <BaseEdge id={id} path={path} style={style} />;
}

const edgeTypes = {
  treeStep: TreeStepEdge,
};

// ─── Node Data Types ───
type UnitNodeData = {
  id: string;
  label: string;
  tenDayDu: string;
  truongTen?: string;
  truongHocVi?: string;
  truongChucDanh?: string;
  soNhanSu: number;
  loai: LoaiDonVi;
  color: string;
  selected?: boolean;
  isDimmed?: boolean;
  onSelect?: () => void;
  employees?: NhanSu[];
  isPopoverOpen?: boolean;
  onClosePopover?: () => void;
  openUpward?: boolean;
};

type LeaderNodeData = {
  id: string;
  label: string;
  hoTen: string;
  hocVi?: string;
  moTa?: string;
  width?: number;
};

// ─── Custom Nodes ───

/** Node Viện trưởng (Root Tier 1) */
function RootNode({ data }: NodeProps) {
  const d = data as LeaderNodeData;
  return (
    <div className="relative group">
      <Handle type="source" position={Position.Bottom} className="!bg-[#AE1E23] !w-2.5 !h-2.5" />
      <div
        className="w-[280px] rounded-2xl py-3.5 px-5 text-center text-white shadow-xl transition-transform duration-200 group-hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, #AE1E23 0%, #7d1216 100%)',
          boxShadow: '0 8px 24px -4px rgba(174, 30, 35, 0.45)',
        }}
      >
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Crown size={15} className="text-amber-300" />
          <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
            {d.label}
          </span>
        </div>
        <div className="text-sm font-black tracking-tight text-white">{d.hoTen}</div>
        <p className="text-[10px] font-medium text-white/80 mt-0.5">
          {d.moTa || 'Viện Khoa học Công nghệ Xây dựng'}
        </p>
      </div>
    </div>
  );
}

/** Node Phó Viện trưởng (Tier 2) */
function DeputyNode({ data }: NodeProps) {
  const d = data as LeaderNodeData;
  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} className="!bg-amber-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500 !w-2.5 !h-2.5" />
      <div
        className="rounded-xl border border-amber-400/80 bg-surface dark:border-amber-600/70 p-3 shadow-sm transition-transform duration-200 group-hover:scale-[1.02] text-center"
        style={{ width: d.width || 225 }}
      >
        <div className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
          <Award size={12} /> {d.label}
        </div>
        <div className="text-[13px] font-bold text-ink truncate mt-0.5">
          {d.hocVi ? `${d.hocVi} ` : ''}{d.hoTen}
        </div>
        {d.moTa && (
          <p className="text-[10.5px] font-medium text-amber-800 dark:text-amber-300 mt-0.5 truncate">
            {d.moTa}
          </p>
        )}
      </div>
    </div>
  );
}

/** Node Đơn vị trực thuộc (Tier 3) */
function UnitNode({ data }: NodeProps) {
  const d = data as UnitNodeData;
  const initial = d.truongTen ? d.truongTen.split(' ').pop()?.[0] || 'T' : '?';
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Chặn sự kiện lăn chuột wheel truyền ra ReactFlow cha (tránh làm zoom sơ đồ)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !d.isPopoverOpen) return;

    const handleWheel = (e: WheelEvent) => {
      // Ngăn chặn dứt điểm sự kiện wheel bong bóng lên ReactFlow zoom pane
      e.stopPropagation();
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [d.isPopoverOpen]);

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2.5 !h-2.5" />

      <div
        onClick={(e) => {
          e.stopPropagation();
          d.onSelect?.();
        }}
        className={cn(
          'w-[225px] h-[98px] rounded-xl bg-surface border transition-all duration-150 p-3 relative cursor-pointer select-none text-left flex flex-col justify-between shadow-xs hover:shadow-md hover:-translate-y-0.5',
          d.selected
            ? 'ring-2 ring-primary-500 border-primary-500 shadow-md'
            : 'border-border hover:border-ink-muted',
          d.isDimmed && 'opacity-30 grayscale-[60%]'
        )}
        style={{
          borderLeftWidth: '5px',
          borderLeftColor: d.color,
        }}
      >
        {/* Header: Viết tắt + Loại + Sĩ số */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-black text-ink tracking-tight truncate">
              {d.label}
            </span>
            <span
              className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-sm shrink-0"
              style={{
                backgroundColor: `${d.color}15`,
                color: d.color,
              }}
            >
              {LOAI_SHORT_LABEL[d.loai] || 'ĐV'}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 bg-subtle px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold text-ink-muted">
            <Users size={11} />
            {d.soNhanSu}
          </div>
        </div>

        {/* Tên đầy đủ */}
        <p
          className="text-[10.5px] font-medium text-ink-secondary line-clamp-1 leading-snug my-auto"
          title={d.tenDayDu}
        >
          {d.tenDayDu}
        </p>

        {/* Footer: Trưởng đơn vị */}
        <div className="pt-1.5 border-t border-border-subtle flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-2xs"
            style={{ backgroundColor: d.color }}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-ink truncate leading-tight">
              {d.truongTen
                ? `${d.truongHocVi ? `${d.truongHocVi}. ` : ''}${d.truongTen}`
                : 'Chờ kiện toàn'}
            </p>
          </div>
        </div>
      </div>

      {/* Popover xem danh sách nhân sự của đơn vị */}
      {d.isPopoverOpen && (
        <div
          className={cn(
            'nowheel nodrag nopan absolute left-0 w-[280px] bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden text-left cursor-default animate-in fade-in zoom-in-95 duration-150',
            d.openUpward ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
          onClick={(e) => e.stopPropagation()}
          onWheelCapture={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-2.5 border-b border-border bg-subtle">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-ink truncate">{d.label} - {d.tenDayDu}</p>
              <p className="text-[10px] text-ink-muted">
                {d.employees?.length || 0} cán bộ nhân viên
              </p>
            </div>
            <button
              onClick={d.onClosePopover}
              className="rounded p-1 text-ink-muted hover:bg-muted hover:text-ink transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div
            ref={scrollContainerRef}
            className="nowheel max-h-[260px] overflow-y-auto overscroll-contain p-2 space-y-1 divide-y divide-border-subtle"
            onWheel={(e) => e.stopPropagation()}
          >
            {d.employees && d.employees.length > 0 ? (
              d.employees.map((emp) => {
                const isLeader = emp.hoTen === d.truongTen;
                return (
                  <div key={emp.id} className="pt-1 first:pt-0 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className={cn('text-xs truncate', isLeader ? 'font-bold text-primary-600 dark:text-primary-400' : 'font-medium text-ink')}>
                        {emp.hoTen}
                        {isLeader && <span className="ml-1 text-[9px] font-bold text-amber-500">★ Trưởng đơn vị</span>}
                      </p>
                      <p className="text-[10px] text-ink-muted truncate">
                        {emp.chucDanh || 'Cán bộ'} {emp.hocVi ? `• ${emp.hocVi}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-ink-muted py-3 text-center">Chưa có danh sách nhân sự</p>
            )}
          </div>

          <div className="p-2 border-t border-border bg-subtle text-center">
            <button
              onClick={() => {
                d.onClosePopover?.();
                const detailEl = document.getElementById('don-vi-detail-section');
                if (detailEl) {
                  detailEl.scrollIntoView({ behavior: 'smooth' });
                } else {
                  // mode orgchart-only: section bị ẩn, click vào node đã mở SlidePanel
                }
              }}
              className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
            >
              {document.getElementById('don-vi-detail-section')
                ? <>Xem chi tiết bên dưới <ArrowDown size={12} /></>
                : <>Đã mở chi tiết bên phải</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const nodeTypes = {
  root: RootNode,
  deputy: DeputyNode,
  unit: UnitNode,
};

// ─── Layout Constants ───
const CARD_W = 225;
const CARD_H = 98;
const GAP_X = 28;
const GAP_Y = 18;

const Y_ROOT = 18;
const Y_BUS_1 = 122; // Thanh ngang Viện trưởng -> 3 Phó Viện trưởng
const Y_DEPUTY = 152; // Vị trí 3 Phó Viện trưởng
const Y_BUS_2 = 254; // Thanh ngang phân phối của Đ/c Cao Duy Khôi sang Cột 3 và Cột 4
const Y_GRID = 288;  // Điểm bắt đầu của các thẻ đơn vị

// Layout constants giữ nguyên
interface Props {
  donViList: DonVi[];
  nhanSuList: NhanSu[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function OrgChartTree({ donViList, nhanSuList, selectedId, onSelect }: Props) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLoai, setFilterLoai] = useState<string>('all');

  // Khối Lãnh đạo Viện
  const lanhDao = useMemo(
    () => nhanSuList.filter((n) => n.donVi === 'Lãnh đạo Viện' || n.chucDanh?.includes('Viện trưởng')),
    [nhanSuList]
  );
  const vienTruong = useMemo(
    () => lanhDao.find((n) => n.chucDanh === 'Viện trưởng') ?? { id: '1', hoTen: 'GS.TS. Nguyễn Hồng Hải', hocVi: 'GS.TS' },
    [lanhDao]
  );
  const deputyDan = useMemo(
    () => lanhDao.find((n) => n.hoTen.includes('Đinh Quốc Dân') || n.chucDanh?.includes('Phó Viện trưởng')) ?? { id: '2', hoTen: 'Đinh Quốc Dân', hocVi: 'TS' },
    [lanhDao]
  );
  const deputyBinh = useMemo(
    () => lanhDao.find((n) => n.hoTen.includes('Nguyễn Thanh Bình')) ?? { id: '3', hoTen: 'Nguyễn Thanh Bình', hocVi: 'PGS.TS' },
    [lanhDao]
  );
  const deputyKhoi = useMemo(
    () => lanhDao.find((n) => n.hoTen.includes('Cao Duy Khôi')) ?? { id: '4', hoTen: 'Cao Duy Khôi', hocVi: 'TS' },
    [lanhDao]
  );

  // ── Phân bổ động 4 Cột đơn vị theo người phụ trách và cơ cấu Viện ──
  const dynamicCols: DonVi[][] = useMemo(() => {
    const list = donViList
      .filter((d) => d.loai !== 'lanh-dao')
      .sort((a, b) => (a.thuTu ?? 0) - (b.thuTu ?? 0));

    const col1: DonVi[] = []; // Đ/c Đinh Quốc Dân
    const col2: DonVi[] = []; // Đ/c Nguyễn Thanh Bình
    const col3: DonVi[] = []; // Đ/c Cao Duy Khôi (Chuyên ngành & BIM)
    const col4: DonVi[] = []; // Đ/c Cao Duy Khôi (Phân viện & Doanh nghiệp)
    const unassigned: DonVi[] = [];

    list.forEach((dv) => {
      const ptId = String(dv.phuTrachId || '');
      const ptName = dv.phuTrach || '';

      const isDan = ptId === String(deputyDan.id) || ptName.includes('Dân');
      const isBinh = ptId === String(deputyBinh.id) || ptName.includes('Bình');
      const isKhoi = ptId === String(deputyKhoi.id) || ptName.includes('Khôi');

      if (isDan) {
        col1.push(dv);
      } else if (isBinh) {
        col2.push(dv);
      } else if (isKhoi) {
        // Phân viện hoặc công ty ưu tiên sang Cột 4, còn lại Cột 3
        if (dv.loai === 'phan-vien' || dv.loai === 'cong-ty') {
          col4.push(dv);
        } else {
          col3.push(dv);
        }
      } else {
        unassigned.push(dv);
      }
    });

    // Cân bằng các đơn vị chưa gán phụ trách vào các cột
    unassigned.forEach((dv) => {
      const lens = [col1.length, col2.length, col3.length, col4.length];
      const minLen = Math.min(...lens);
      const targetIdx = lens.indexOf(minLen);
      if (targetIdx === 0) col1.push(dv);
      else if (targetIdx === 1) col2.push(dv);
      else if (targetIdx === 2) col3.push(dv);
      else col4.push(dv);
    });

    return [col1, col2, col3, col4];
  }, [donViList, deputyDan, deputyBinh, deputyKhoi]);

  // Xây dựng Nodes và Edges cho ReactFlow
  const { nodes, edges, contentWidth, contentHeight } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Tính toán tọa độ 4 Cột
    const totalGridWidth = 4 * CARD_W + 3 * GAP_X; // 984px
    const startGridX = -totalGridWidth / 2; // -492px

    const colXPositions = [0, 1, 2, 3].map((c) => startGridX + c * (CARD_W + GAP_X));
    const colCenters = colXPositions.map((x) => x + CARD_W / 2);

    // ── Tier 1: VIỆN TRƯỞNG (Root Node) ──
    nodes.push({
      id: 'root',
      type: 'root',
      position: { x: -140, y: Y_ROOT },
      width: 280,
      height: 76,
      data: {
        id: 'root',
        label: 'VIỆN TRƯỞNG',
        hoTen: vienTruong.hoTen,
        moTa: 'Viện Khoa học Công nghệ Xây dựng',
      },
    });

    // ── Tier 2: 3 PHÓ VIỆN TRƯỞNG (Được căn thẳng hàng với các Cột phụ trách) ──
    const deputyConfigs = [
      {
        key: 'deputy-2',
        leader: deputyDan,
        centerX: colCenters[0], // thẳng hàng tuyệt đối với Cột 1
        width: CARD_W,
        moTa: 'Phụ trách Khối Kết cấu & Thiết bị',
      },
      {
        key: 'deputy-3',
        leader: deputyBinh,
        centerX: colCenters[1], // thẳng hàng tuyệt đối với Cột 2
        width: CARD_W,
        moTa: 'Phụ trách Khối KHKT & Vật liệu',
      },
      {
        key: 'deputy-4',
        leader: deputyKhoi,
        centerX: (colCenters[2] + colCenters[3]) / 2, // chính giữa Cột 3 & Cột 4
        width: 245,
        moTa: 'Phụ trách Khối ĐKT, Phân viện & BIM',
      },
    ];

    deputyConfigs.forEach((dep) => {
      nodes.push({
        id: dep.key,
        type: 'deputy',
        position: { x: dep.centerX - dep.width / 2, y: Y_DEPUTY },
        width: dep.width,
        height: 72,
        data: {
          id: dep.key,
          label: 'PHÓ VIỆN TRƯỞNG',
          hoTen: dep.leader.hoTen,
          hocVi: dep.leader.hocVi,
          moTa: dep.moTa,
          width: dep.width,
        },
      });

      // Edge từ Viện trưởng -> Phó Viện trưởng (vuông góc chuẩn qua thanh ngang Y_BUS_1)
      edges.push({
        id: `e-root-${dep.key}`,
        source: 'root',
        target: dep.key,
        type: 'treeStep',
        data: { midY: Y_BUS_1 },
        style: { stroke: '#AE1E23', strokeWidth: 1.5 },
      });
    });

    // ── Tier 3: 4 Cột Đơn vị trực thuộc ──
    // Mỗi Phó Viện trưởng chỉ nối xuống đúng Cột đơn vị mình phụ trách:
    // 1. Đ/c Đinh Quốc Dân -> Đỉnh Cột 1
    if (dynamicCols[0].length > 0) {
      edges.push({
        id: 'e-deputy2-col0',
        source: 'deputy-2',
        target: `unit-${dynamicCols[0][0].id}`,
        type: 'treeStep',
        style: { stroke: '#64748b', strokeWidth: 1.5 },
      });
    }

    // 2. Đ/c Nguyễn Thanh Bình -> Đỉnh Cột 2
    if (dynamicCols[1].length > 0) {
      edges.push({
        id: 'e-deputy3-col1',
        source: 'deputy-3',
        target: `unit-${dynamicCols[1][0].id}`,
        type: 'treeStep',
        style: { stroke: '#64748b', strokeWidth: 1.5 },
      });
    }

    // 3. Đ/c Cao Duy Khôi -> Đỉnh Cột 3 & Cột 4 (rẽ nhánh đối xứng 2 bên)
    if (dynamicCols[2].length > 0) {
      edges.push({
        id: 'e-deputy4-col2',
        source: 'deputy-4',
        target: `unit-${dynamicCols[2][0].id}`,
        type: 'treeStep',
        data: { midY: Y_BUS_2 },
        style: { stroke: '#64748b', strokeWidth: 1.5 },
      });
    }
    if (dynamicCols[3].length > 0) {
      edges.push({
        id: 'e-deputy4-col3',
        source: 'deputy-4',
        target: `unit-${dynamicCols[3][0].id}`,
        type: 'treeStep',
        data: { midY: Y_BUS_2 },
        style: { stroke: '#64748b', strokeWidth: 1.5 },
      });
    }

    // Tạo các Thẻ đơn vị và đường nối dọc trong từng Cột
    dynamicCols.forEach((colUnits, colIdx) => {
      const ux = colXPositions[colIdx];

      colUnits.forEach((dv, rowIdx) => {
        const uy = Y_GRID + rowIdx * (CARD_H + GAP_Y);
        const employees = nhanSuList.filter((n) => String(n.donViId) === String(dv.id));

        // Tìm kiếm nhanh
        const isMatchSearch = searchQuery.trim() === '' || (
          dv.ten.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dv.tenVietTat && dv.tenVietTat.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (dv.truongDonVi && dv.truongDonVi.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        // Lọc theo loại
        const isMatchLoai = filterLoai === 'all' || dv.loai === filterLoai;
        const isDimmed = !isMatchSearch || !isMatchLoai;

        nodes.push({
          id: `unit-${dv.id}`,
          type: 'unit',
          position: { x: ux, y: uy },
          width: CARD_W,
          height: CARD_H,
          data: {
            id: dv.id,
            label: dv.tenVietTat || dv.ten,
            tenDayDu: dv.ten,
            truongTen: dv.truongDonVi ?? undefined,
            truongHocVi: dv.truongDonViHocVi ?? undefined,
            truongChucDanh: dv.truongDonViChucDanh ?? undefined,
            soNhanSu: dv.soNhanSu,
            loai: dv.loai,
            color: GROUP_COLOR[dv.loai],
            selected: selectedId === dv.id,
            isDimmed,
            employees,
            isPopoverOpen: openPopoverId === dv.id,
            openUpward: rowIdx >= 3,
            onClosePopover: () => setOpenPopoverId(null),
            onSelect: () => {
              onSelect(dv.id);
              setOpenPopoverId((prev) => (prev === dv.id ? null : dv.id));
            },
          },
          style: { zIndex: openPopoverId === dv.id ? 1000 : 0 },
        });

        // Đường nối dọc thẳng đứng giữa các thẻ trong cùng một cột (rowIdx > 0)
        if (rowIdx > 0) {
          const prevDv = colUnits[rowIdx - 1];
          edges.push({
            id: `e-spine-${prevDv.id}-${dv.id}`,
            source: `unit-${prevDv.id}`,
            target: `unit-${dv.id}`,
            type: 'treeStep',
            style: {
              stroke: '#cbd5e1',
              strokeWidth: 1.5,
              opacity: isDimmed ? 0.3 : 0.9,
            },
          });
        }
      });
    });

    const maxRows = Math.max(1, ...dynamicCols.map((c) => c.length));
    const contentHeight = Y_GRID + maxRows * (CARD_H + GAP_Y) + 30;

    return {
      nodes,
      edges,
      contentWidth: totalGridWidth + 80,
      contentHeight,
    };
  }, [
    donViList,
    nhanSuList,
    vienTruong,
    deputyDan,
    deputyBinh,
    deputyKhoi,
    selectedId,
    onSelect,
    openPopoverId,
    searchQuery,
    filterLoai,
    dynamicCols,
  ]);

  // Container viewport sizing
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);
  const measureRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setContainerSize({ w: el.clientWidth, h: el.clientHeight });
  }, []);

  const defaultViewport = useMemo(() => {
    if (!containerSize) return { x: 0, y: 0, zoom: 0.9 };
    const PADDING_X = 0.05;
    const PADDING_Y = 0.04;
    const scaleX = (containerSize.w * (1 - PADDING_X)) / contentWidth;
    const scaleY = (containerSize.h * (1 - PADDING_Y)) / contentHeight;
    const zoom = Math.min(1.05, Math.max(0.65, Math.min(scaleX, scaleY)));
    const x = containerSize.w / 2;
    const y = 18;
    return { x, y, zoom };
  }, [containerSize, contentWidth, contentHeight]);

  // Đếm động số lượng đơn vị theo từng phân loại
  const countsByLoai = useMemo(() => {
    const nonLead = donViList.filter((d) => d.loai !== 'lanh-dao');
    return {
      all: nonLead.length,
      'phong-chuc-nang': nonLead.filter((d) => d.loai === 'phong-chuc-nang').length,
      'vien-chuyen-nganh': nonLead.filter((d) => d.loai === 'vien-chuyen-nganh').length,
      'phan-vien': nonLead.filter((d) => d.loai === 'phan-vien').length,
      'trung-tam': nonLead.filter((d) => d.loai === 'trung-tam').length,
      'cong-ty': nonLead.filter((d) => d.loai === 'cong-ty').length,
    };
  }, [donViList]);

  // Số lượng đơn vị khớp tìm kiếm
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return donViList.filter(
      (d) =>
        d.loai !== 'lanh-dao' &&
        (d.ten.toLowerCase().includes(q) ||
          (d.tenVietTat && d.tenVietTat.toLowerCase().includes(q)) ||
          (d.truongDonVi && d.truongDonVi.toLowerCase().includes(q)))
    ).length;
  }, [donViList, searchQuery]);

  return (
    <div className="relative">
      {/* Thanh điều khiển nhanh trên sơ đồ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Ô tìm kiếm */}
          <div className="relative w-64">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh đơn vị, lãnh đạo..."
              className="w-full rounded-lg border border-border bg-page pl-8 pr-7 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:border-primary-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-0.5"
                title="Xóa tìm kiếm"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {matchCount !== null && (
            <span className="text-[10.5px] font-semibold text-primary-600 dark:text-primary-400 bg-primary-subtle dark:bg-primary-900/30 px-2 py-0.5 rounded-md whitespace-nowrap">
              {matchCount} đơn vị khớp
            </span>
          )}

          {/* Bộ lọc loại đơn vị */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-muted p-0.5">
            {[
              { id: 'all', label: `Tất cả (${countsByLoai.all})` },
              { id: 'phong-chuc-nang', label: `Phòng ban (${countsByLoai['phong-chuc-nang']})` },
              { id: 'vien-chuyen-nganh', label: `Viện CN (${countsByLoai['vien-chuyen-nganh']})` },
              { id: 'phan-vien', label: `Phân viện (${countsByLoai['phan-vien']})` },
              { id: 'trung-tam', label: `Trung tâm (${countsByLoai['trung-tam']})` },
              { id: 'cong-ty', label: `Công ty (${countsByLoai['cong-ty']})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterLoai(tab.id)}
                className={cn(
                  'whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-bold transition-all',
                  filterLoai === tab.id
                    ? 'bg-surface text-primary-600 shadow-xs dark:text-primary-400'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-2xs text-ink-muted">
          <span>* Click vào thẻ để chọn và xem nhân sự chi tiết</span>
        </div>
      </div>

      {/* Vùng sơ đồ ReactFlow */}
      <div
        ref={measureRef}
        className="relative h-[900px] w-full overflow-hidden bg-page select-none"
      >
        {containerSize && (
          <ReactFlow
            key={containerSize ? 'org-chart-tree-ready' : 'org-chart-tree-init'}
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultViewport={defaultViewport}
            minZoom={0.25}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            onPaneClick={() => setOpenPopoverId(null)}
            onNodeClick={(_event, node) => {
              if (node.type === 'unit') {
                const uid = (node.data as UnitNodeData).id;
                onSelect(uid);
                setOpenPopoverId((prev) => (prev === uid ? null : uid));
              }
            }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="var(--border-default)"
            />
            <Controls className="!rounded-xl !border-border !bg-surface !shadow-card" />
            <MiniMap
              position="top-right"
              className="!rounded-xl !border-border !bg-surface !shadow-xs"
              nodeColor={(n) => {
                const d = n.data as UnitNodeData;
                if (n.type === 'root') return '#AE1E23';
                if (n.type === 'deputy') return '#f97316';
                return d.color ?? '#64748b';
              }}
              maskColor="rgba(0,0,0,0.12)"
            />
          </ReactFlow>
        )}

        {/* Chú giải loại đơn vị ở góc phải */}
        <div className="pointer-events-none absolute bottom-4 right-4 rounded-xl border border-border bg-surface/90 px-3.5 py-2.5 shadow-card backdrop-blur">
          <p className="mb-1.5 text-2xs font-black uppercase tracking-widest text-ink-muted">
            Phân loại đơn vị
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {LOAI_DON_VI.map(({ ma, ten }) => {
              if (ma === 'lanh-dao') return null;
              return (
                <div key={ma} className="flex items-center gap-1.5">
                  <div
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: GROUP_COLOR[ma] }}
                  />
                  <span className="text-[11px] text-ink-secondary">{ten}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}



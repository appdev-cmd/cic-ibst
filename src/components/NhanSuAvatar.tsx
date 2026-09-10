import { useState, useEffect, useMemo } from 'react';
import { User, Crown } from 'lucide-react';
import { cn } from '../lib/utils';

export interface NhanSuAvatarProps {
  hoTen?: string | null;
  chucDanh?: string | null;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'initials' | 'icon';
  showStatus?: boolean;
  trangThaiLamViec?: string | null;
  className?: string;
  title?: string;
}

// 10 gradients hài hòa, thẩm mỹ cao theo chuẩn UI/UX Pro Max
const AVATAR_GRADIENTS = [
  'from-blue-600 to-indigo-600 text-white',
  'from-emerald-600 to-teal-700 text-white',
  'from-violet-600 to-purple-700 text-white',
  'from-sky-500 to-blue-600 text-white',
  'from-rose-500 to-pink-600 text-white',
  'from-teal-500 to-cyan-700 text-white',
  'from-indigo-500 to-purple-600 text-white',
  'from-amber-500 to-orange-600 text-white',
  'from-cyan-600 to-teal-700 text-white',
  'from-fuchsia-600 to-pink-600 text-white',
];

// Ảnh chân dung chính thức của Ban Lãnh đạo Viện IBST (tự động fallback nếu chưa gắn URL)
const LEADER_AVATARS: Record<string, string> = {
  'nguyen hong hai': '/avatars/nguyen-hong-hai.jpg',
  'dinh quoc dan': '/avatars/dinh-quoc-dan.jpg',
  'nguyen thanh binh': '/avatars/nguyen-thanh-binh.jpg',
  'cao duy khoi': '/avatars/cao-duy-khoi.jpg',
};

function normalizeName(str?: string | null): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // Lấy chữ cái đầu của Họ và Tên (chuẩn danh xưng tiếng Việt)
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}

function getGradientIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % AVATAR_GRADIENTS.length;
}

const SIZE_CONFIGS = {
  xs: { box: 'w-6 h-6 text-[10px]', iconSize: 12, ring: 'ring-1', dot: 'w-1.5 h-1.5' },
  sm: { box: 'w-7 h-7 text-2xs', iconSize: 13, ring: 'ring-1.5', dot: 'w-2 h-2' },
  md: { box: 'w-9 h-9 text-xs', iconSize: 16, ring: 'ring-2', dot: 'w-2.5 h-2.5' },
  lg: { box: 'w-12 h-12 text-sm', iconSize: 22, ring: 'ring-2', dot: 'w-3 h-3' },
  xl: { box: 'w-16 h-16 text-lg', iconSize: 30, ring: 'ring-2', dot: 'w-3.5 h-3.5' },
};

export function NhanSuAvatar({
  hoTen,
  chucDanh,
  avatarUrl,
  size = 'md',
  variant = 'initials',
  showStatus = false,
  trangThaiLamViec,
  className,
  title,
}: NhanSuAvatarProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl, hoTen]);

  const isVienTruong = useMemo(() => {
    if (!chucDanh) return false;
    const cd = chucDanh.toLowerCase();
    return cd.includes('viện trưởng') && !cd.includes('phó') && !cd.includes('chuyên ngành');
  }, [chucDanh]);

  const isPhoVienTruong = useMemo(() => {
    if (!chucDanh) return false;
    const cd = chucDanh.toLowerCase();
    return cd.includes('phó viện trưởng') && !cd.includes('chuyên ngành');
  }, [chucDanh]);

  const initials = useMemo(() => getInitials(hoTen), [hoTen]);

  // Ảnh hợp lệ: hoặc do DB cung cấp, hoặc ảnh chính thức của Lãnh đạo Viện
  const effectiveAvatar = useMemo(() => {
    if (avatarUrl && !imgError) return avatarUrl;
    if (!imgError && hoTen) {
      const norm = normalizeName(hoTen);
      for (const [key, path] of Object.entries(LEADER_AVATARS)) {
        if (norm.includes(key)) return path;
      }
    }
    return null;
  }, [avatarUrl, hoTen, imgError]);

  const gradientCls = useMemo(() => {
    if (isVienTruong) {
      return 'from-amber-500 via-orange-500 to-amber-600 text-white ring-2 ring-amber-400 dark:ring-amber-500/80 shadow-xs shadow-amber-500/20';
    }
    if (isPhoVienTruong) {
      return 'from-indigo-600 via-purple-600 to-pink-600 text-white ring-2 ring-purple-400 dark:ring-purple-500/80 shadow-xs shadow-purple-500/20';
    }
    const idx = getGradientIndex(hoTen || 'ibst');
    return AVATAR_GRADIENTS[idx];
  }, [hoTen, isVienTruong, isPhoVienTruong]);

  const cfg = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
  const tooltipText = title || (hoTen ? `${hoTen}${chucDanh ? ` (${chucDanh})` : ''}` : 'Nhân sự');

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold shadow-2xs overflow-visible',
        cfg.box,
        !effectiveAvatar && 'bg-gradient-to-br ' + gradientCls,
        effectiveAvatar && 'bg-surface border border-border dark:border-slate-700/80',
        className,
      )}
      title={tooltipText}
    >
      {/* Nội dung Avatar: Ảnh chân dung thật, hoặc chữ viết tắt / Icon */}
      {effectiveAvatar ? (
        <img
          src={effectiveAvatar}
          alt={hoTen || 'Avatar'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover rounded-full pointer-events-none"
        />
      ) : variant === 'icon' || !initials ? (
        <User size={cfg.iconSize} className="shrink-0 text-white/95 drop-shadow-xs" />
      ) : (
        <span className="tracking-tight drop-shadow-xs font-bold leading-none">{initials}</span>
      )}

      {/* Huy hiệu Ban Giám đốc Viện */}
      {isVienTruong && size !== 'xs' && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-xs p-0.5"
          title="Viện trưởng IBST"
        >
          <Crown size={size === 'xl' ? 14 : size === 'lg' ? 12 : 10} className="fill-current" />
        </span>
      )}

      {/* Chấm trạng thái làm việc */}
      {showStatus && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-surface dark:ring-[#1f2332]',
            cfg.dot,
            trangThaiLamViec === 'dang-lam-viec'
              ? 'bg-emerald-500'
              : trangThaiLamViec === 'nghi-viec'
              ? 'bg-slate-400'
              : 'bg-amber-500',
          )}
          title={
            trangThaiLamViec === 'dang-lam-viec'
              ? 'Đang làm việc'
              : trangThaiLamViec === 'nghi-viec'
              ? 'Đã nghỉ việc'
              : 'Tạm hoãn / Nghỉ chế độ'
          }
        />
      )}
    </div>
  );
}

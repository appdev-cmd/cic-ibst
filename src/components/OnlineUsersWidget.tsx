/**
 * OnlineUsersWidget — Hiển thị avatar stack người dùng đang online
 * Gắn trong header AppLayout, dùng PresenceContext để lấy danh sách.
 */
import { useAuth } from '../context/AuthContext';
import { usePresence, type OnlineUser } from '../context/PresenceContext';

/** Lấy chữ viết tắt từ họ tên */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Mini avatar cho 1 user */
function UserAvatar({ user, size = 32 }: { user: OnlineUser; size?: number }) {
  const initials = getInitials(user.fullName);
  // Màu gradient ổn định theo userId — dùng inline style để tránh Tailwind purge
  const GRADIENTS = [
    'linear-gradient(135deg, #60a5fa, #2563eb)',   // xanh dương
    'linear-gradient(135deg, #34d399, #0d9488)',   // xanh lá
    'linear-gradient(135deg, #a78bfa, #7c3aed)',   // tím
    'linear-gradient(135deg, #fb7185, #e11d48)',   // đỏ hồng
    'linear-gradient(135deg, #fbbf24, #f97316)',   // cam
    'linear-gradient(135deg, #38bdf8, #0284c7)',   // sky
  ];
  const gradientIdx = user.id.charCodeAt(0) % GRADIENTS.length;

  return (
    <div
      className="relative inline-block cursor-pointer transition-transform hover:-translate-y-0.5 hover:z-10"
      style={{ width: size, height: size }}
    >
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.fullName}
          className="rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
          style={{ width: size, height: size }}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const fb = parent.querySelector('[data-fallback]') as HTMLElement | null;
              if (fb) fb.style.display = 'flex';
            }
          }}
        />
      ) : null}
      {/* Fallback initials gradient — luôn render, ẩn nếu có ảnh */}
      <div
        data-fallback
        className="absolute inset-0 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-slate-900 text-white font-bold"
        style={{
          background: GRADIENTS[gradientIdx],
          fontSize: size * 0.34,
          display: user.avatarUrl ? 'none' : 'flex',
        }}
      >
        {initials}
      </div>
      {/* Dot xanh online */}
      <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 border-[1.5px] border-white dark:border-slate-900" />
      </span>
    </div>
  );
}

export function OnlineUsersWidget() {
  const { session } = useAuth();
  const { onlineUsers } = usePresence();

  if (onlineUsers.length === 0) return null;

  const MAX_VISIBLE = 6;
  const visibleUsers = onlineUsers.slice(0, MAX_VISIBLE);
  const remaining = onlineUsers.length - MAX_VISIBLE;

  return (
    <div className="relative group/online flex items-center gap-2">
      {/* Avatar Stack */}
      <div className="flex -space-x-2">
        {visibleUsers.map((u) => (
          <div key={u.id} title={u.fullName} className="relative">
            <UserAvatar user={u} size={30} />
          </div>
        ))}
        {remaining > 0 && (
          <div
            className="inline-flex items-center justify-center rounded-full bg-subtle ring-2 ring-white dark:ring-slate-900 text-[10px] font-bold text-ink-secondary cursor-default"
            style={{ width: 30, height: 30 }}
          >
            +{remaining}
          </div>
        )}
      </div>

      {/* Badge đếm + pulse */}
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15">
        <div className="relative w-1.5 h-1.5">
          <div className="absolute inset-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping opacity-50" />
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
        </div>
        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
          {onlineUsers.length}
        </span>
      </div>

      {/* Hover Dropdown — danh sách đầy đủ */}
      <div className="absolute top-full right-0 mt-2 w-60 opacity-0 invisible group-hover/online:opacity-100 group-hover/online:visible transition-all duration-200 translate-y-1 group-hover/online:translate-y-0 z-50 pointer-events-none group-hover/online:pointer-events-auto">
        <div className="bg-surface rounded-xl shadow-xl border border-border dark:border-slate-700/80 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-border dark:border-slate-700/80 bg-subtle flex items-center justify-between">
            <span className="text-xs font-bold text-ink">Đang online</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {onlineUsers.length} người
            </span>
          </div>

          {/* User list */}
          <div className="max-h-64 overflow-y-auto py-1">
            {onlineUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 px-4 py-2 hover:bg-muted/60 transition-colors"
              >
                <div className="relative shrink-0">
                  <UserAvatar user={u} size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-ink truncate">
                    {u.fullName}
                    {u.id === session?.user?.id && (
                      <span className="ml-1 text-[9px] text-ink-muted font-normal">(bạn)</span>
                    )}
                  </p>
                  {u.email && (
                    <p className="text-[10px] text-ink-muted truncate">{u.email}</p>
                  )}
                </div>
                <div className="shrink-0 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

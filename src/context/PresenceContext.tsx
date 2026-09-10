/**
 * PresenceContext — Theo dõi người dùng đang online
 *
 * Dùng Supabase Realtime Presence channel để broadcast và nhận trạng thái online.
 * Khi user join/leave, CHỈ component dùng usePresence() re-render (không ảnh hưởng AuthContext).
 *
 * Usage:
 *   const { onlineUsers } = usePresence();
 */

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface OnlineUser {
  id: string;       // user.id (auth UUID)
  fullName: string; // full_name từ user_metadata
  email?: string;
  avatarUrl?: string;
}

interface PresenceContextType {
  onlineUsers: OnlineUser[];
}

const PresenceContext = createContext<PresenceContextType>({ onlineUsers: [] });

export function PresenceProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!session?.user) return;

    const userId = session.user.id;
    const fullName =
      session.user.user_metadata?.full_name ??
      session.user.email?.split('@')[0] ??
      'Người dùng';
    const email = session.user.email ?? '';

    const channel = supabase.channel('ibst_online_users', {
      config: { presence: { key: userId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        Object.keys(state).forEach((key) => {
          const presence = state[key][0] as {
            user_info?: { fullName?: string; email?: string; avatarUrl?: string };
          };
          if (presence?.user_info) {
            users.push({
              id: key,
              fullName: presence.user_info.fullName ?? key,
              email: presence.user_info.email,
              avatarUrl: presence.user_info.avatarUrl,
            });
          }
        });
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        // Lấy avatar từ bảng nhan_su (qua bảng nguoi_dung)
        let avatarUrl: string | undefined;
        const { data: nd } = await supabase
          .from('nguoi_dung')
          .select('nhan_su_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (nd?.nhan_su_id) {
          const { data: ns } = await supabase
            .from('nhan_su')
            .select('anh_dai_dien')
            .eq('id', nd.nhan_su_id)
            .maybeSingle();
          avatarUrl = (ns?.anh_dai_dien as string | null) ?? undefined;
          setMyAvatarUrl(avatarUrl); // lưu để dùng cho fallback
        }

        await channel.track({
          user_info: { fullName, email, avatarUrl },
        });
      });

    return () => {
      channel.unsubscribe();
    };
  }, [session?.user?.id]);

  // Fallback: nếu channel chưa sync, hiển thị chính mình (kèm avatarUrl đã fetch)
  const effectiveOnlineUsers = useMemo(() => {
    if (onlineUsers.length > 0) return onlineUsers;
    if (!session?.user) return [];
    return [{
      id: session.user.id,
      fullName:
        session.user.user_metadata?.full_name ??
        session.user.email?.split('@')[0] ??
        'Người dùng',
      email: session.user.email ?? undefined,
      avatarUrl: myAvatarUrl,
    }];
  }, [onlineUsers, session?.user?.id, myAvatarUrl]);

  return (
    <PresenceContext.Provider value={{ onlineUsers: effectiveOnlineUsers }}>
      {children}
    </PresenceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePresence(): PresenceContextType {
  return useContext(PresenceContext);
}

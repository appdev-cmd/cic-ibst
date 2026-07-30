import type { VaiTro } from '../context/AuthContext';

export type BuocHopDong = 'du-thao' | 'cho-duyet' | 'dang-thuc-hien' | 'tam-dung' | 'nghiem-thu' | 'quyet-toan' | 'hoan-thanh' | 'thanh-ly' | 'huy';

export function getAvailableTransitions(currentState: BuocHopDong | string, userRole: VaiTro): BuocHopDong[] {
  // Chuẩn hóa tất cả các trạng thái cũ/khác về 5 bước chuẩn
  const normState: BuocHopDong =
    currentState === 'moi' || currentState === 'du-thao' ? 'du-thao' :
    currentState === 'cho-duyet' ? 'cho-duyet' :
    currentState === 'dang-thuc-hien' || currentState === 'nghiem-thu' ? 'dang-thuc-hien' :
    currentState === 'hoan-thanh' || currentState === 'quyet-toan' ? 'hoan-thanh' :
    currentState === 'thanh-ly' ? 'thanh-ly' :
    currentState === 'tam-dung' ? 'tam-dung' :
    currentState === 'huy' ? 'huy' : 'du-thao';

  const transitions: Record<BuocHopDong, Record<VaiTro, BuocHopDong[]>> = {
    'du-thao': {
      'quan-tri': ['cho-duyet', 'huy'],
      'lanh-dao': ['cho-duyet', 'huy'],
      'truong-don-vi': ['cho-duyet', 'huy'],
      'chuyen-vien': ['cho-duyet', 'huy'],
    },
    'cho-duyet': {
      'quan-tri': ['dang-thuc-hien', 'du-thao', 'huy'],
      'lanh-dao': ['dang-thuc-hien', 'du-thao', 'huy'],
      'truong-don-vi': ['du-thao', 'huy'],
      'chuyen-vien': ['du-thao', 'huy'],
    },
    'dang-thuc-hien': {
      'quan-tri': ['hoan-thanh', 'tam-dung', 'huy'],
      'lanh-dao': ['hoan-thanh', 'tam-dung', 'huy'],
      'truong-don-vi': ['hoan-thanh', 'tam-dung', 'huy'],
      'chuyen-vien': ['hoan-thanh', 'tam-dung'],
    },
    'tam-dung': {
      'quan-tri': ['dang-thuc-hien', 'huy'],
      'lanh-dao': ['dang-thuc-hien', 'huy'],
      'truong-don-vi': ['dang-thuc-hien', 'huy'],
      'chuyen-vien': ['dang-thuc-hien'],
    },
    'nghiem-thu': {
      'quan-tri': ['hoan-thanh', 'dang-thuc-hien'],
      'lanh-dao': ['hoan-thanh', 'dang-thuc-hien'],
      'truong-don-vi': ['hoan-thanh', 'dang-thuc-hien'],
      'chuyen-vien': ['hoan-thanh'],
    },
    'quyet-toan': {
      'quan-tri': ['hoan-thanh', 'dang-thuc-hien'],
      'lanh-dao': ['hoan-thanh', 'dang-thuc-hien'],
      'truong-don-vi': ['hoan-thanh', 'dang-thuc-hien'],
      'chuyen-vien': ['hoan-thanh'],
    },
    'hoan-thanh': {
      'quan-tri': ['thanh-ly', 'dang-thuc-hien'],
      'lanh-dao': ['thanh-ly', 'dang-thuc-hien'],
      'truong-don-vi': ['thanh-ly', 'dang-thuc-hien'],
      'chuyen-vien': ['thanh-ly'],
    },
    'thanh-ly': {
      'quan-tri': [],
      'lanh-dao': [],
      'truong-don-vi': [],
      'chuyen-vien': [],
    },
    'huy': {
      'quan-tri': ['du-thao'],
      'lanh-dao': ['du-thao'],
      'truong-don-vi': [],
      'chuyen-vien': [],
    },
  };

  return transitions[normState]?.[userRole] || [];
}

export function canTransition(from: BuocHopDong, to: BuocHopDong, userRole: VaiTro): boolean {
  const available = getAvailableTransitions(from, userRole);
  return available.includes(to);
}

export function getStateLabel(state: BuocHopDong | string): string {
  const labels: Record<string, string> = {
    'du-thao': 'Dự thảo',
    'cho-duyet': 'Chờ duyệt',
    'dang-thuc-hien': 'Đang thực hiện',
    'tam-dung': 'Tạm dừng',
    'nghiem-thu': 'Nghiệm thu',
    'quyet-toan': 'Quyết toán',
    'hoan-thanh': 'Hoàn thành',
    'thanh-ly': 'Thanh lý & Lưu trữ',
    'huy': 'Hủy',
  };
  return labels[state] || state;
}

export function getStateColor(state: BuocHopDong | string): string {
  const colors: Record<string, string> = {
    'du-thao': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    'cho-duyet': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'dang-thuc-hien': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'tam-dung': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'nghiem-thu': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'quyet-toan': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'hoan-thanh': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    'thanh-ly': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    'huy': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };
  return colors[state] || 'bg-gray-100 text-gray-800';
}


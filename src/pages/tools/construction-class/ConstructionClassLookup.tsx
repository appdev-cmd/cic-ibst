import React, { useState, useMemo } from 'react';
import { 
  Hammer, 
  HelpCircle, 
  Info, 
  Layers, 
  RotateCcw, 
  Calculator, 
  ChevronDown, 
  ChevronRight,
  Shield,
  FileText,
  Search,
  BookOpen
} from 'lucide-react';

// ==========================================
// HELPERS ĐỊNH DẠNG SỐ (Hàng nghìn dùng '.', thập phân dùng ',')
// ==========================================
export const parseFormattedNumber = (valStr: string): number => {
  if (!valStr) return 0;
  const normalized = valStr.replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(normalized) || 0;
};

export const formatInputOnTyping = (value: string): string => {
  let cleanValue = value.replace(/[^0-9,\.]/g, '');
  const commaCount = (cleanValue.match(/,/g) || []).length;
  if (commaCount > 1) {
    const firstCommaIdx = cleanValue.indexOf(',');
    cleanValue = cleanValue.substring(0, firstCommaIdx + 1) + 
                 cleanValue.substring(firstCommaIdx + 1).replace(/,/g, '');
  }
  const parts = cleanValue.split(',');
  let integerPart = parts[0].replace(/\./g, '');
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (parts.length > 1) {
    return integerPart + ',' + parts[1].replace(/\./g, '');
  }
  return integerPart;
};

// ==========================================
// CƠ SỞ DỮ LIỆU PHÂN CẤP THÔNG TƯ 34/2026/TT-BXD
// ==========================================

interface CapacityOption {
  value: string;
  label: string;
  unit: string;
  calc: (val: number) => { grade: string; text: string; details: string };
  hint?: string;
}

// Bảng 1.1: Công trình Dân dụng
const DAN_DUNG_OPTIONS: Record<string, CapacityOption> = {
  '1.1.1.1': {
    value: '1.1.1.1',
    label: 'Nhà trẻ, trường mẫu giáo, trường mầm non',
    unit: 'Mọi quy mô',
    calc: () => ({
      grade: 'Cấp III',
      text: 'Cấp III với mọi quy mô',
      details: 'Theo Bảng 1.1 mục 1.1.1.1 Thông tư 34/2026/TT-BXD.'
    })
  },
  '1.1.1.2': {
    value: '1.1.1.2',
    label: 'Trường tiểu học',
    unit: 'Học sinh',
    calc: (val) => {
      if (val >= 700) return { grade: 'Cấp II', text: 'Cấp II (Quy mô ≥ 700 học sinh)', details: 'Theo Bảng 1.1 mục 1.1.1.2.' };
      return { grade: 'Cấp III', text: 'Cấp III (Quy mô < 700 học sinh)', details: 'Theo Bảng 1.1 mục 1.1.1.2.' };
    }
  },
  '1.1.1.3': {
    value: '1.1.1.3',
    label: 'Trường THCS, THPT, trường liên cấp',
    unit: 'Học sinh',
    calc: (val) => {
      if (val >= 1350) return { grade: 'Cấp II', text: 'Cấp II (Quy mô ≥ 1.350 học sinh)', details: 'Theo Bảng 1.1 mục 1.1.1.3.' };
      return { grade: 'Cấp III', text: 'Cấp III (Quy mô < 1.350 học sinh)', details: 'Theo Bảng 1.1 mục 1.1.1.3.' };
    }
  },
  '1.1.1.4': {
    value: '1.1.1.4',
    label: 'Đại học, cao đẳng, trung cấp nghề',
    unit: 'Sinh viên',
    calc: (val) => {
      if (val > 8000) return { grade: 'Cấp I', text: 'Cấp I (Quy mô > 8.000 sinh viên)', details: 'Theo Bảng 1.1 mục 1.1.1.4.' };
      if (val >= 5000) return { grade: 'Cấp II', text: 'Cấp II (Quy mô 5.000 ÷ 8.000 sinh viên)', details: 'Theo Bảng 1.1 mục 1.1.1.4.' };
      return { grade: 'Cấp III', text: 'Cấp III (Quy mô < 5.000 sinh viên)', details: 'Theo Bảng 1.1 mục 1.1.1.4.' };
    }
  },
  '1.1.2.1': {
    value: '1.1.2.1',
    label: 'Bệnh viện đa khoa, chuyên khoa',
    unit: 'Giường bệnh',
    calc: (val) => {
      if (val > 1000) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Quy mô > 1.000 giường)', details: 'Theo Bảng 1.1 mục 1.1.2.1. Lưu ý: Bệnh viện cấp Trung ương không thấp hơn cấp I.' };
      if (val >= 500) return { grade: 'Cấp I', text: 'Cấp I (Quy mô 500 ÷ 1.000 giường)', details: 'Theo Bảng 1.1 mục 1.1.2.1. Lưu ý: Bệnh viện cấp Trung ương không thấp hơn cấp I.' };
      if (val >= 250) return { grade: 'Cấp II', text: 'Cấp II (Quy mô 250 ÷ <500 giường)', details: 'Theo Bảng 1.1 mục 1.1.2.1.' };
      return { grade: 'Cấp III', text: 'Cấp III (Quy mô < 250 giường)', details: 'Theo Bảng 1.1 mục 1.1.2.1.' };
    }
  },
  '1.1.3.1': {
    value: '1.1.3.1',
    label: 'Sân vận động ngoài trời có khán đài',
    unit: 'Nghìn chỗ ngồi',
    calc: (val) => {
      if (val > 40) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Sức chứa > 40 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.3.1. Lưu ý: Sân vận động quốc gia không thấp hơn cấp I.' };
      if (val > 20) return { grade: 'Cấp I', text: 'Cấp I (Sức chứa > 20 ÷ 40 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.3.1. Lưu ý: Sân vận động quốc gia không thấp hơn cấp I.' };
      if (val >= 5) return { grade: 'Cấp II', text: 'Cấp II (Sức chứa 5 ÷ 20 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.3.1.' };
      return { grade: 'Cấp III', text: 'Cấp III (Sức chứa < 5 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.3.1.' };
    }
  },
  '1.1.3.2': {
    value: '1.1.3.2',
    label: 'Nhà thi đấu, tập luyện có khán đài',
    unit: 'Nghìn chỗ ngồi',
    calc: (val) => {
      if (val > 7.5) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Sức chứa > 7,5 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.3.2. Lưu ý: Nhà thi đấu thể thao quốc gia không thấp hơn cấp I.' };
      if (val >= 5) return { grade: 'Cấp I', text: 'Cấp I (Sức chứa 5 ÷ 7,5 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.3.2.' };
      if (val >= 2) return { grade: 'Cấp II', text: 'Cấp II (Sức chứa 2 ÷ <5 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.3.2.' };
      return { grade: 'Cấp III', text: 'Cấp III (Sức chứa < 2 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.3.2.' };
    }
  },
  '1.1.4.1': {
    value: '1.1.4.1',
    label: 'Trung tâm hội nghị, nhà văn hóa, vũ trường',
    unit: 'Nghìn người (sức chứa)',
    calc: (val) => {
      if (val > 3) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Sức chứa > 3 nghìn người)', details: 'Theo Bảng 1.1 mục 1.1.4.1. Lưu ý: TT hội nghị quốc gia không thấp hơn cấp I.' };
      if (val > 1.2) return { grade: 'Cấp I', text: 'Cấp I (Sức chứa > 1,2 ÷ 3 nghìn người)', details: 'Theo Bảng 1.1 mục 1.1.4.1.' };
      if (val > 0.3) return { grade: 'Cấp II', text: 'Cấp II (Sức chứa > 0,3 ÷ 1,2 nghìn người)', details: 'Theo Bảng 1.1 mục 1.1.4.1.' };
      return { grade: 'Cấp III', text: 'Cấp III (Sức chứa ≤ 0,3 nghìn người)', details: 'Theo Bảng 1.1 mục 1.1.4.1.' };
    }
  },
  '1.1.4.2': {
    value: '1.1.4.2',
    label: 'Nhà hát, rạp chiếu phim, rạp xiếc',
    unit: 'Nghìn chỗ ngồi',
    calc: (val) => {
      if (val > 3) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Sức chứa > 3 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.4.2.' };
      if (val > 1.2) return { grade: 'Cấp I', text: 'Cấp I (Sức chứa > 1,2 ÷ 3 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.4.2.' };
      if (val > 0.3) return { grade: 'Cấp II', text: 'Cấp II (Sức chứa > 0,3 ÷ 1,2 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.4.2.' };
      return { grade: 'Cấp III', text: 'Cấp III (Sức chứa ≤ 0,3 nghìn chỗ)', details: 'Theo Bảng 1.1 mục 1.1.4.2.' };
    }
  },
  '1.1.5': {
    value: '1.1.5',
    label: 'Chợ',
    unit: 'Điểm kinh doanh (quầy)',
    calc: (val) => {
      if (val > 400) return { grade: 'Cấp II', text: 'Cấp II (Quy mô > 400 điểm kinh doanh)', details: 'Theo Bảng 1.1 mục 1.1.5.' };
      return { grade: 'Cấp III', text: 'Cấp III (Quy mô ≤ 400 điểm kinh doanh)', details: 'Theo Bảng 1.1 mục 1.1.5.' };
    }
  }
};

// Bảng 1.2: Công trình Công nghiệp
const CONG_NGHIEP_OPTIONS: Record<string, CapacityOption> = {
  '1.2.4.5': {
    value: '1.2.4.5',
    label: 'Kho xăng dầu',
    unit: 'm³ (dung tích)',
    calc: (val) => {
      const valK = val / 1000;
      if (valK > 100) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Dung tích > 100.000 m³)', details: 'Theo Bảng 1.2 mục 1.2.4.5.' };
      if (valK >= 5) return { grade: 'Cấp I', text: 'Cấp I (Dung tích 5.000 ÷ 100.000 m³)', details: 'Theo Bảng 1.2 mục 1.2.4.5.' };
      if (valK >= 0.21) return { grade: 'Cấp II', text: 'Cấp II (Dung tích 210 ÷ <5.000 m³)', details: 'Theo Bảng 1.2 mục 1.2.4.5.' };
      return { grade: 'Cấp III', text: 'Cấp III (Dung tích < 210 m³)', details: 'Theo Bảng 1.2 mục 1.2.4.5.' };
    }
  },
  '1.2.4.6': {
    value: '1.2.4.6',
    label: 'Kho chứa LPG, trạm chiết nạp khí hóa lỏng',
    unit: 'm³ (dung tích)',
    calc: (val) => {
      const valK = val / 1000;
      if (valK > 100) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Dung tích > 100.000 m³)', details: 'Theo Bảng 1.2 mục 1.2.4.6.' };
      if (valK >= 5) return { grade: 'Cấp I', text: 'Cấp I (Dung tích 5.000 ÷ 100.000 m³)', details: 'Theo Bảng 1.2 mục 1.2.4.6.' };
      return { grade: 'Cấp II', text: 'Cấp II (Dung tích < 5.000 m³)', details: 'Theo Bảng 1.2 mục 1.2.4.6.' };
    }
  },
  '1.2.5.1a': {
    value: '1.2.5.1a',
    label: 'Nhà máy nhiệt điện đốt than',
    unit: 'MW (công suất tổ máy)',
    calc: (val) => {
      if (val >= 600) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Tổ máy ≥ 600 MW)', details: 'Theo Bảng 1.2 mục 1.2.5.1a.' };
      if (val >= 300) return { grade: 'Cấp I', text: 'Cấp I (Tổ máy 300 ÷ <600 MW)', details: 'Theo Bảng 1.2 mục 1.2.5.1a.' };
      if (val >= 50) return { grade: 'Cấp II', text: 'Cấp II (Tổ máy 50 ÷ <300 MW)', details: 'Theo Bảng 1.2 mục 1.2.5.1a.' };
      return { grade: 'Cấp III', text: 'Cấp III (Tổ máy < 50 MW)', details: 'Theo Bảng 1.2 mục 1.2.5.1a.' };
    }
  },
  '1.2.5.3a': {
    value: '1.2.5.3a',
    label: 'Nhà máy thủy điện',
    unit: 'MW (tổng công suất lắp máy)',
    calc: (val) => {
      if (val > 1000) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Tổng công suất > 1.000 MW)', details: 'Theo Bảng 1.2 mục 1.2.5.3a.' };
      if (val > 50) return { grade: 'Cấp I', text: 'Cấp I (Tổng công suất > 50 ÷ 1.000 MW)', details: 'Theo Bảng 1.2 mục 1.2.5.3a.' };
      if (val > 30) return { grade: 'Cấp II', text: 'Cấp II (Tổng công suất > 30 ÷ 50 MW)', details: 'Theo Bảng 1.2 mục 1.2.5.3a.' };
      return { grade: 'Cấp III', text: 'Cấp III (Tổng công suất ≤ 30 MW)', details: 'Theo Bảng 1.2 mục 1.2.5.3a.' };
    }
  },
  '1.2.5.3b': {
    value: '1.2.5.3b',
    label: 'Hồ chứa nước thủy điện',
    unit: 'Triệu m³ (dung tích nước)',
    calc: (val) => {
      if (val > 1000) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Dung tích > 1.000 triệu m³)', details: 'Theo Bảng 1.2 mục 1.2.5.3b.' };
      if (val > 200) return { grade: 'Cấp I', text: 'Cấp I (Dung tích > 200 ÷ 1.000 triệu m³)', details: 'Theo Bảng 1.2 mục 1.2.5.3b.' };
      if (val > 20) return { grade: 'Cấp II', text: 'Cấp II (Dung tích > 20 ÷ 200 triệu m³)', details: 'Theo Bảng 1.2 mục 1.2.5.3b.' };
      if (val >= 3) return { grade: 'Cấp III', text: 'Cấp III (Dung tích 3 ÷ 20 triệu m³)', details: 'Theo Bảng 1.2 mục 1.2.5.3b.' };
      return { grade: 'Cấp IV', text: 'Cấp IV (Dung tích < 3 triệu m³)', details: 'Theo Bảng 1.2 mục 1.2.5.3b.' };
    }
  },
  '1.2.5.11': {
    value: '1.2.5.11',
    label: 'Đường dây và Trạm biến áp',
    unit: 'kV (điện áp thiết kế)',
    calc: (val) => {
      if (val >= 500) return { grade: 'Cấp I', text: 'Cấp I (Điện áp ≥ 500 kV)', details: 'Theo Bảng 1.2 mục 1.2.5.11.' };
      if (val >= 220) return { grade: 'Cấp II', text: 'Cấp II (Điện áp 220 kV)', details: 'Theo Bảng 1.2 mục 1.2.5.11.' };
      if (val >= 110) return { grade: 'Cấp III', text: 'Cấp III (Điện áp 110 kV)', details: 'Theo Bảng 1.2 mục 1.2.5.11.' };
      if (val > 35) return { grade: 'Cấp IV', text: 'Cấp IV (Điện áp > 35 ÷ < 110 kV)', details: 'Theo Bảng 1.2 mục 1.2.5.11.' };
      return { grade: 'Cấp IV', text: 'Cấp IV (Điện áp ≤ 35 kV)', details: 'Theo Bảng 1.2 mục 1.2.5.11.' };
    }
  }
};

// Bảng 1.3: Công trình Hạ tầng kỹ thuật
const HA_TANG_OPTIONS: Record<string, CapacityOption> = {
  '1.3.1': {
    value: '1.3.1',
    label: 'Nhà máy nước sạch (Trạm cấp nước)',
    unit: 'm³/ngày đêm (công suất)',
    calc: (val) => {
      if (val >= 120000) return { grade: 'Cấp I', text: 'Cấp I (Công suất ≥ 120.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.1.' };
      if (val >= 30000) return { grade: 'Cấp II', text: 'Cấp II (Công suất 30.000 ÷ <120.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.1.' };
      if (val >= 5000) return { grade: 'Cấp III', text: 'Cấp III (Công suất 5.000 ÷ <30.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.1.' };
      return { grade: 'Cấp IV', text: 'Cấp IV (Công suất < 5.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.1.' };
    }
  },
  '1.3.2': {
    value: '1.3.2',
    label: 'Mạng lưới cấp nước sạch đô thị',
    unit: 'm³/ngày đêm (lưu lượng cấp)',
    calc: (val) => {
      if (val >= 100000) return { grade: 'Cấp I', text: 'Cấp I (Công suất mạng lưới ≥ 100.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.2.' };
      if (val >= 20000) return { grade: 'Cấp II', text: 'Cấp II (Công suất 20.000 ÷ <100.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.2.' };
      if (val >= 3000) return { grade: 'Cấp III', text: 'Cấp III (Công suất 3.000 ÷ <20.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.2.' };
      return { grade: 'Cấp IV', text: 'Cấp IV (Công suất < 3.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.2.' };
    }
  },
  '1.3.3': {
    value: '1.3.3',
    label: 'Nhà máy/Trạm xử lý nước thải',
    unit: 'm³/ngày đêm (công suất xử lý)',
    calc: (val) => {
      if (val >= 50000) return { grade: 'Cấp I', text: 'Cấp I (Công suất ≥ 50.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.3.' };
      if (val >= 10000) return { grade: 'Cấp II', text: 'Cấp II (Công suất 10.000 ÷ <50.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.3.' };
      if (val >= 1000) return { grade: 'Cấp III', text: 'Cấp III (Công suất 1.000 ÷ <10.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.3.' };
      return { grade: 'Cấp IV', text: 'Cấp IV (Công suất < 1.000 m³/ngày)', details: 'Theo Bảng 1.3 mục 1.3.3.' };
    }
  },
  '1.3.4': {
    value: '1.3.4',
    label: 'Cơ sở xử lý chất thải rắn (rác thải)',
    unit: 'Tấn/ngày (công suất tiếp nhận)',
    calc: (val) => {
      if (val >= 500) return { grade: 'Cấp I', text: 'Cấp I (Công suất ≥ 500 tấn/ngày)', details: 'Theo Bảng 1.3 mục 1.3.4.' };
      if (val >= 100) return { grade: 'Cấp II', text: 'Cấp II (Công suất 100 ÷ <500 tấn/ngày)', details: 'Theo Bảng 1.3 mục 1.3.4.' };
      return { grade: 'Cấp III', text: 'Cấp III (Công suất < 100 tấn/ngày)', details: 'Theo Bảng 1.3 mục 1.3.4.' };
    }
  }
};

// Bảng 1.4: Công trình Giao thông
const GIAO_THONG_OPTIONS: Record<string, CapacityOption> = {
  '1.4.1.1': {
    value: '1.4.1.1',
    label: 'Đường cao tốc',
    unit: 'km/h (tốc độ thiết kế)',
    calc: (val) => {
      if (val >= 120) return { grade: 'Cấp I', text: 'Cấp I (Tốc độ thiết kế ≥ 120 km/h)', details: 'Theo Bảng 1.4 mục 1.4.1.1.' };
      return { grade: 'Cấp II', text: 'Cấp II (Tốc độ thiết kế < 120 km/h)', details: 'Theo Bảng 1.4 mục 1.4.1.1.' };
    }
  },
  '1.4.1.2': {
    value: '1.4.1.2',
    label: 'Đường ô tô cấp quốc lộ, đường tỉnh',
    unit: 'Cấp kỹ thuật đường (hạng)',
    calc: (val) => {
      if (val === 1 || val === 2) return { grade: 'Cấp II', text: 'Cấp II (Đường cấp I, II)', details: 'Theo Bảng 1.4 mục 1.4.1.2.' };
      if (val === 3 || val === 4) return { grade: 'Cấp III', text: 'Cấp III (Đường cấp III, IV)', details: 'Theo Bảng 1.4 mục 1.4.1.2.' };
      return { grade: 'Cấp IV', text: 'Cấp IV (Đường cấp V, VI)', details: 'Theo Bảng 1.4 mục 1.4.1.2.' };
    },
    hint: 'Nhập hạng kỹ thuật của đường: 1 (Cấp I), 2 (Cấp II), 3 (Cấp III), 4 (Cấp IV), 5 (Cấp V), 6 (Cấp VI).'
  },
  '1.4.2': {
    value: '1.4.2',
    label: 'Cảng hàng không (Sân bay)',
    unit: 'Mục tiêu khai thác',
    calc: (val) => {
      if (val === 1) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Cảng hàng không quốc tế đầu mối)', details: 'Theo Bảng 1.4 mục 1.4.2.' };
      if (val === 2) return { grade: 'Cấp I', text: 'Cấp I (Cảng hàng không quốc tế khác)', details: 'Theo Bảng 1.4 mục 1.4.2.' };
      return { grade: 'Cấp II', text: 'Cấp II (Sân bay nội địa)', details: 'Theo Bảng 1.4 mục 1.4.2.' };
    },
    hint: 'Nhập lựa chọn: 1 (Quốc tế đầu mối), 2 (Quốc tế khác), 3 (Sân bay nội địa).'
  }
};

// Bảng 1.5: Công trình Nông nghiệp & PTNT
const NONG_NGHIEP_OPTIONS: Record<string, CapacityOption> = {
  '1.5.1.1': {
    value: '1.5.1.1',
    label: 'Hồ chứa nước thủy lợi',
    unit: 'Triệu m³ (dung tích nước)',
    calc: (val) => {
      if (val > 1000) return { grade: 'Đặc biệt', text: 'Cấp Đặc biệt (Dung tích > 1.000 triệu m³)', details: 'Theo Bảng 1.5 mục 1.5.1.1.' };
      if (val > 200) return { grade: 'Cấp I', text: 'Cấp I (Dung tích > 200 ÷ 1.000 triệu m³)', details: 'Theo Bảng 1.5 mục 1.5.1.1.' };
      if (val > 20) return { grade: 'Cấp II', text: 'Cấp II (Dung tích > 20 ÷ 200 triệu m³)', details: 'Theo Bảng 1.5 mục 1.5.1.1.' };
      if (val >= 3) return { grade: 'Cấp III', text: 'Cấp III (Dung tích 3 ÷ 20 triệu m³)', details: 'Theo Bảng 1.5 mục 1.5.1.1.' };
      return { grade: 'Cấp IV', text: 'Cấp IV (Dung tích < 3 triệu m³)', details: 'Theo Bảng 1.5 mục 1.5.1.1.' };
    }
  },
  '1.5.1.6a': {
    value: '1.5.1.6a',
    label: 'Hệ thống kênh tưới tiêu ĐBSCL',
    unit: 'm³/s (lưu lượng nước thiết kế)',
    calc: (val) => {
      if (val >= 40) return { grade: 'Cấp I', text: 'Cấp I (Lưu lượng ≥ 40 m³/s)', details: 'Theo Bảng 1.5 mục 1.5.1.6.2a.' };
      if (val >= 20) return { grade: 'Cấp II', text: 'Cấp II (Lưu lượng 20 ÷ <40 m³/s)', details: 'Theo Bảng 1.5 mục 1.5.1.6.2a.' };
      if (val >= 1) return { grade: 'Cấp III', text: 'Cấp III (Lưu lượng 1 ÷ <20 m³/s)', details: 'Theo Bảng 1.5 mục 1.5.1.6.2a.' };
      return { grade: 'Cấp IV', text: 'Cấp IV (Lưu lượng < 1 m³/s)', details: 'Theo Bảng 1.5 mục 1.5.1.6.2a.' };
    }
  },
  '1.5.1.6b': {
    value: '1.5.1.6b',
    label: 'Hệ thống kênh tưới tiêu vùng khác',
    unit: 'm³/s (lưu lượng nước thiết kế)',
    calc: (val) => {
      if (val >= 20) return { grade: 'Cấp I', text: 'Cấp I (Lưu lượng ≥ 20 m³/s)', details: 'Theo Bảng 1.5 mục 1.5.1.6.2b.' };
      if (val >= 10) return { grade: 'Cấp II', text: 'Cấp II (Lưu lượng 10 ÷ <20 m³/s)', details: 'Theo Bảng 1.5 mục 1.5.1.6.2b.' };
      if (val >= 0.5) return { grade: 'Cấp III', text: 'Cấp III (Lưu lượng 0,5 ÷ <10 m³/s)', details: 'Theo Bảng 1.5 mục 1.5.1.6.2b.' };
      return { grade: 'Cấp IV', text: 'Cấp IV (Lưu lượng < 0,5 m³/s)', details: 'Theo Bảng 1.5 mục 1.5.1.6.2b.' };
    }
  }
};

const CATEGORIES = [
  { id: 'civil', name: 'Dân dụng', options: DAN_DUNG_OPTIONS },
  { id: 'industry', name: 'Công nghiệp', options: CONG_NGHIEP_OPTIONS },
  { id: 'infra', name: 'Hạ tầng kỹ thuật', options: HA_TANG_OPTIONS },
  { id: 'traffic', name: 'Giao thông', options: GIAO_THONG_OPTIONS },
  { id: 'agri', name: 'Nông nghiệp & PTNT', options: NONG_NGHIEP_OPTIONS }
];

export const ConstructionClassLookup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'project' | 'structure' | 'capacity'>('project');

  // --- State của Tab Quy mô kết cấu (Phụ lục II) ---
  const [structType, setStructType] = useState<string>('house');
  const [sHeight, setSHeight] = useState<string>('');
  const [sFloors, setSFloors] = useState<string>('');
  const [sArea, setSArea] = useState<string>('');
  const [sSpan, setSSpan] = useState<string>('');
  const [sDepth, setSDepth] = useState<string>('');
  const [sBasements, setSBasements] = useState<string>('');
  const [isFireHouse, setIsFireHouse] = useState<boolean>(true); // F1.2, F1.3, F4.2, F4.3
  const [isHazardChemical, setIsHazardChemical] = useState<boolean>(false); // Bể chứa hóa chất
  const [groundType, setGroundType] = useState<string>('A'); // A, B, C cho đập/tường chắn

  // --- State của Tab Quy mô công suất (Phụ lục I) ---
  const [capCategory, setCapCategory] = useState<string>('civil');
  const [capType, setCapType] = useState<string>('');
  const [capVal, setCapVal] = useState<string>('');

  // --- State của Tab Kết hợp (Quy trình thực tế của Dự án) ---
  const [pCategory, setPCategory] = useState<string>('civil');
  const [pCapType, setPCapType] = useState<string>('');
  const [pCapVal, setPCapVal] = useState<string>('');
  const [pHeight, setPHeight] = useState<string>('');
  const [pFloors, setPFloors] = useState<string>('');
  const [pArea, setPArea] = useState<string>('');
  const [pSpan, setPSpan] = useState<string>('');
  const [pDepth, setPDepth] = useState<string>('');
  const [pBasements, setPBasements] = useState<string>('');
  const [pIsFireHouse, setPIsFireHouse] = useState<boolean>(true);
  
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // useEffect để auto-fill 1 và disable input nếu unit === 'Mọi quy mô' ở Tab 1
  React.useEffect(() => {
    const option = CATEGORIES.find(c => c.id === pCategory)?.options[pCapType];
    if (option?.unit === 'Mọi quy mô') {
      setPCapVal('1'); // đặt là '1' để logic so khớp tính toán bình thường
    } else {
      setPCapVal('');
    }
  }, [pCapType, pCategory]);

  // useEffect để auto-fill 1 và disable input nếu unit === 'Mọi quy mô' ở Tab 3
  React.useEffect(() => {
    const option = CATEGORIES.find(c => c.id === capCategory)?.options[capType];
    if (option?.unit === 'Mọi quy mô') {
      setCapVal('1');
    } else {
      setCapVal('');
    }
  }, [capType, capCategory]);

  // Quy đổi chuỗi sang số thứ tự cấp để so sánh max
  const gradeWeight: Record<string, number> = {
    'Cấp IV': 1,
    'Cấp III': 2,
    'Cấp II': 3,
    'Cấp I': 4,
    'Đặc biệt': 5
  };

  const getWeight = (grade: string) => gradeWeight[grade] || 0;

  // --- LOGIC PHÂN CẤP THEO QUY MÔ KẾT CẤU ---
  const calcStructureGrade = (type: string, inputs: {
    height?: number,
    floors?: number,
    area?: number,
    span?: number,
    depth?: number,
    basements?: number,
    isFireHouse?: boolean,
    isHazardChemical?: boolean,
    groundType?: string
  }) => {
    const results: Array<{ criterion: string; grade: string; details: string }> = [];

    const h = inputs.height || 0;
    const f = inputs.floors || 0;
    const a = inputs.area || 0;
    const s = inputs.span || 0;
    const d = inputs.depth || 0;
    const b = inputs.basements || 0;

    if (type === 'house') {
      // 2.1.1 Nhà và kết cấu dạng nhà
      // a) Chiều cao
      if (h > 0) {
        const hStar = inputs.isFireHouse ? 150 : 200;
        let grade = 'Cấp IV';
        if (h > hStar) grade = 'Đặc biệt';
        else if (h > 75) grade = 'Cấp I';
        else if (h > 28) grade = 'Cấp II';
        else if (h > 6) grade = 'Cấp III';
        results.push({
          criterion: 'Chiều cao công trình',
          grade,
          details: `Chiều cao H = ${h} m (Ngưỡng H* = ${hStar} m). Theo Bảng 2 mục 2.1.1a.`
        });
      }

      // b) Số tầng nổi
      if (f > 0) {
        let grade = 'Cấp IV';
        if (f > 50) grade = 'Đặc biệt';
        else if (f >= 25) grade = 'Cấp I';
        else if (f >= 8) grade = 'Cấp II';
        else if (f >= 2) grade = 'Cấp III';
        results.push({
          criterion: 'Số tầng cao (nổi)',
          grade,
          details: `Số tầng nổi = ${f} tầng. Theo Bảng 2 mục 2.1.1b.`
        });
      }

      // c) Diện tích sàn
      if (a > 0) {
        const aK = a / 1000; // Đổi sang nghìn m2
        let grade = 'Cấp IV';
        if (aK > 30) grade = 'Cấp I';
        else if (aK > 10) grade = 'Cấp II';
        else if (aK >= 1) grade = 'Cấp III';
        results.push({
          criterion: 'Tổng diện tích sàn',
          grade,
          details: `Diện tích sàn = ${a.toLocaleString()} m² (${aK.toFixed(2)} nghìn m²). Theo Bảng 2 mục 2.1.1c.`
        });
      }

      // d) Nhịp lớn nhất
      if (s > 0) {
        let grade = 'Cấp IV';
        if (s > 200) grade = 'Đặc biệt';
        else if (s >= 100) grade = 'Cấp I';
        else if (s >= 50) grade = 'Cấp II';
        else if (s >= 15) grade = 'Cấp III';
        results.push({
          criterion: 'Nhịp kết cấu lớn nhất',
          grade,
          details: `Nhịp lớn nhất = ${s} m. Theo Bảng 2 mục 2.1.1d.`
        });
      }

      // đ) Độ sâu ngầm
      if (d > 0) {
        let grade = 'Cấp IV';
        if (d > 18) grade = 'Cấp II';
        else if (d >= 6) grade = 'Cấp III';
        results.push({
          criterion: 'Độ sâu ngầm',
          grade,
          details: `Độ sâu ngầm = ${d} m. Theo Bảng 2 mục 2.1.1đ.`
        });
      }

      // e) Số tầng ngầm
      if (b > 0) {
        let grade = 'Cấp III';
        if (b >= 5) grade = 'Cấp I';
        else if (b >= 2) grade = 'Cấp II';
        results.push({
          criterion: 'Số tầng ngầm',
          grade,
          details: `Số tầng ngầm = ${b} tầng. Theo Bảng 2 mục 2.1.1e.`
        });
      }
    } else if (type === 'column_civil') {
      // 2.2.1 Cột, trụ, tháp dân dụng/công nghiệp
      if (h > 0) {
        let grade = 'Cấp IV';
        if (h > 200) grade = 'Đặc biệt';
        else if (h > 75) grade = 'Cấp I';
        else if (h > 28) grade = 'Cấp II';
        else if (h > 6) grade = 'Cấp III';
        results.push({
          criterion: 'Chiều cao kết cấu cột/trụ/tháp',
          grade,
          details: `Chiều cao = ${h} m. Theo Bảng 2 mục 2.2.1.`
        });
      }
    } else if (type === 'column_infra') {
      // 2.2.2 Cột, trụ, tháp hạ tầng kỹ thuật (cột anten, tháp thu sóng BTS...)
      if (h > 0) {
        let grade = 'Cấp IV';
        if (h >= 300) grade = 'Đặc biệt';
        else if (h >= 150) grade = 'Cấp I';
        else if (h >= 75) grade = 'Cấp II';
        else if (h > 45) grade = 'Cấp III';
        results.push({
          criterion: 'Chiều cao tháp anten/thu sóng',
          grade,
          details: `Chiều cao = ${h} m. Theo Bảng 2 mục 2.2.2.`
        });
      }
    } else if (type === 'tank') {
      // 2.4 Kết cấu dạng bể chứa, si-lô
      let maxGrade = 'Cấp IV';
      let detailsList: string[] = [];

      if (a > 0) {
        // Sử dụng ô diện tích để chứa dung tích (nghìn m3)
        const v = a; 
        let grade = 'Cấp IV';
        if (v > 15) grade = 'Cấp I';
        else if (v >= 5) grade = 'Cấp II';
        else if (v >= 1) grade = 'Cấp III';
        if (getWeight(grade) > getWeight(maxGrade)) maxGrade = grade;
        detailsList.push(`Dung tích: ${v} nghìn m³ -> ${grade}`);
      }

      if (h > 0) {
        let grade = 'Cấp IV';
        if (h >= 75) grade = 'Cấp I';
        else if (h > 28) grade = 'Cấp II';
        else if (h >= 6) grade = 'Cấp III';
        if (getWeight(grade) > getWeight(maxGrade)) maxGrade = grade;
        detailsList.push(`Chiều cao bể: ${h} m -> ${grade}`);
      }

      if (d > 0) {
        let grade = 'Cấp IV';
        if (d > 18) grade = 'Cấp I';
        else if (d > 6) grade = 'Cấp II';
        else if (d > 3) grade = 'Cấp III';
        if (getWeight(grade) > getWeight(maxGrade)) maxGrade = grade;
        detailsList.push(`Độ sâu ngầm: ${d} m -> ${grade}`);
      }

      // Tăng một cấp nếu chứa hóa chất nguy hiểm
      if (inputs.isHazardChemical && maxGrade !== 'Cấp IV' && maxGrade !== 'Đặc biệt') {
        const grades = ['Cấp IV', 'Cấp III', 'Cấp II', 'Cấp I', 'Đặc biệt'];
        const idx = grades.indexOf(maxGrade);
        const oldGrade = maxGrade;
        maxGrade = grades[Math.min(idx + 1, 3)]; // Tăng 1 cấp nhưng tối đa Cấp I (hoặc tối thiểu cấp II và không có Đặc biệt)
        if (getWeight(maxGrade) < getWeight('Cấp II')) maxGrade = 'Cấp II';
        detailsList.push(`[TĂNG 1 CẤP]: Bể chứa hóa chất độc hại -> Cấp cuối: ${maxGrade}`);
      }

      if (detailsList.length > 0) {
        results.push({
          criterion: 'Quy mô kết cấu bể chứa/si-lô',
          grade: maxGrade,
          details: detailsList.join('; ') + '. Theo Bảng 2 mục 2.4.'
        });
      }
    } else if (type === 'bridge') {
      // 2.5 Cầu đường bộ
      if (s > 0) {
        let grade = 'Cấp IV';
        if (s > 150) grade = 'Đặc biệt';
        else if (s > 100) grade = 'Cấp I';
        else if (s > 42) grade = 'Cấp II';
        else if (s > 25) grade = 'Cấp III';
        results.push({
          criterion: 'Nhịp lớn nhất của cầu',
          grade,
          details: `Nhịp dầm = ${s} m. Theo Bảng 2 mục 2.5.1a.`
        });
      }

      if (h > 0) {
        let grade = 'Cấp IV';
        if (h > 75) grade = 'Đặc biệt';
        else if (h >= 30) grade = 'Cấp I';
        else if (h >= 15) grade = 'Cấp II';
        else if (h >= 6) grade = 'Cấp III';
        results.push({
          criterion: 'Chiều cao trụ cầu',
          grade,
          details: `Chiều cao trụ = ${h} m. Theo Bảng 2 mục 2.5.1b.`
        });
      }
    } else if (type === 'retaining_wall') {
      // 2.7.1 Tường chắn đất
      if (h > 0) {
        let grade = 'Cấp IV';
        const gt = inputs.groundType || 'A';
        if (gt === 'A') { // Nền đá
          if (h > 25) grade = 'Cấp I';
          else if (h > 15) grade = 'Cấp II';
          else if (h > 8) grade = 'Cấp III';
        } else if (gt === 'B') { // Nền cát/đất cứng
          if (h > 12) grade = 'Cấp II';
          else if (h > 5) grade = 'Cấp III';
        } else { // Nền sét dẻo bão hòa nước
          if (h > 10) grade = 'Cấp II';
          else if (h > 4) grade = 'Cấp III';
        }
        
        results.push({
          criterion: 'Chiều cao tường chắn đất',
          grade,
          details: `Tường chắn cao H = ${h} m trên địa chất Nền nhóm ${gt}. Theo Bảng 2 mục 2.7.1.`
        });
      }
    }

    return results;
  };

  // --- KẾT QUẢ TAB QUY MÔ KẾT CẤU ---
  const structureResults = useMemo(() => {
    const h = parseFormattedNumber(sHeight);
    const f = parseFormattedNumber(sFloors);
    const a = parseFormattedNumber(sArea);
    const s = parseFormattedNumber(sSpan);
    const d = parseFormattedNumber(sDepth);
    const b = parseFormattedNumber(sBasements);

    const list = calcStructureGrade(structType, {
      height: h,
      floors: f,
      area: a,
      span: s,
      depth: d,
      basements: b,
      isFireHouse,
      isHazardChemical,
      groundType
    });

    let maxGrade = 'Cấp IV';
    list.forEach(item => {
      if (getWeight(item.grade) > getWeight(maxGrade)) {
        maxGrade = item.grade;
      }
    });

    return { list, maxGrade };
  }, [structType, sHeight, sFloors, sArea, sSpan, sDepth, sBasements, isFireHouse, isHazardChemical, groundType]);

  // --- KẾT QUẢ TAB QUY MÔ CÔNG SUẤT ---
  const capacityResult = useMemo(() => {
    if (!capType) return null;
    const cat = CATEGORIES.find(c => c.id === capCategory);
    if (!cat) return null;

    const option = cat.options[capType];
    if (!option) return null;

    const val = parseFormattedNumber(capVal);
    return option.calc(val);
  }, [capCategory, capType, capVal]);

  // --- KẾT QUẢ TAB KẾT HỢP DỰ ÁN ---
  const combinationResult = useMemo(() => {
    if (!hasSearched || !pCapType) return null;
    
    // 1. Phân cấp công suất
    const cat = CATEGORIES.find(c => c.id === pCategory);
    const option = cat?.options[pCapType];
    const capValNum = parseFormattedNumber(pCapVal);
    const capRes = option ? option.calc(capValNum) : null;

    // 2. Phân cấp kết cấu
    const h = parseFormattedNumber(pHeight);
    const f = parseFormattedNumber(pFloors);
    const a = parseFormattedNumber(pArea);
    const s = parseFormattedNumber(pSpan);
    const d = parseFormattedNumber(pDepth);
    const b = parseFormattedNumber(pBasements);

    // Nhận định loại kết cấu
    let sType = 'house';
    if (['1.2.4.5', '1.2.4.6'].includes(pCapType)) sType = 'tank'; // Kho xăng dầu dùng kết cấu bể chứa
    if (['1.2.5.11'].includes(pCapType)) sType = 'column_civil'; // Đường dây trạm biến áp dùng kết cấu cột tháp

    const structList = calcStructureGrade(sType, {
      height: h,
      floors: f,
      area: a,
      span: s,
      depth: d,
      basements: b,
      isFireHouse: pIsFireHouse
    });

    // 3. So sánh tổng hợp
    let finalGrade = 'Cấp IV';
    let decider = '';

    if (capRes) {
      finalGrade = capRes.grade;
      decider = `Tiêu chí công suất: ${capRes.text}`;
    }

    structList.forEach(item => {
      if (getWeight(item.grade) > getWeight(finalGrade)) {
        finalGrade = item.grade;
        decider = `Tiêu chí kết cấu: ${item.criterion} (${item.grade})`;
      }
    });

    return { capRes, structList, finalGrade, decider };
  }, [hasSearched, pCategory, pCapType, pCapVal, pHeight, pFloors, pArea, pSpan, pDepth, pBasements, pIsFireHouse]);

  const handleResetCombination = () => {
    setPCapType('');
    setPCapVal('');
    setPHeight('');
    setPFloors('');
    setPArea('');
    setPSpan('');
    setPDepth('');
    setPBasements('');
    setHasSearched(false);
  };

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-140px)] border border-border bg-bg-surface rounded-xl overflow-hidden shadow-lg text-txt-primary">
      
      {/* ── Header chính mang màu sắc kỹ thuật Sky/Ocean ── */}
      <div className="px-5 py-4 bg-sky-950 border-b border-sky-900 flex items-center gap-3.5 text-white">
        <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center border border-sky-500 shadow-lg shadow-sky-950/20">
          <Hammer className="w-5.5 h-5.5 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-wider text-sky-400">Tra cứu Cấp công trình xây dựng</h1>
          <p className="text-[11px] text-sky-200 mt-0.5">
            Căn cứ pháp lý: <strong className="text-white">Thông tư số 34/2026/TT-BXD</strong> của Bộ Xây dựng (Thay thế TT 06/2021/TT-BXD)
          </p>
        </div>
      </div>

      {/* ── Lưu ý pháp lý ── */}
      <div className="bg-sky-500/10 border-b border-sky-500/20 px-5 py-2.5 flex items-start gap-2.5 text-xs text-sky-700 dark:text-sky-400 leading-relaxed font-semibold">
        <BookOpen className="w-4 h-4 shrink-0 text-sky-500 mt-0.5" />
        <span>
          <strong>Nguyên tắc phân cấp:</strong> Cấp công trình được xác định dựa trên quy mô công suất (Phụ lục I) và quy mô kết cấu (Phụ lục II). Cấp công trình độc lập cuối cùng là **cấp cao nhất** trong hai phụ lục.
        </span>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex bg-sky-950/90 px-4 border-b border-sky-900 gap-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'project', label: 'Tính toán cấp dự án (Tổng hợp)' },
          { id: 'structure', label: 'Quy mô kết cấu (Phụ lục II)' },
          { id: 'capacity', label: 'Quy mô công suất (Phụ lục I)' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold transition-all border-b-3 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-sky-400 text-sky-400 font-extrabold'
                : 'border-transparent text-sky-200 hover:text-white hover:border-sky-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Nội dung từng Tab ── */}
      <div className="flex-1 p-5 overflow-y-auto no-scrollbar w-full space-y-5">

        {/* ================================================== */}
        {/* TAB 1: TÍNH TOÁN CẤP DỰ ÁN TỔNG HỢP */}
        {/* ================================================== */}
        {activeTab === 'project' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            
            {/* Cột trái: Nhập liệu */}
            <div className="lg:col-span-4 xl:col-span-3 bg-bg-surface border border-border rounded-xl p-4 text-txt-primary shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-400">Đầu vào dự án</h3>
                <button 
                  onClick={handleResetCombination}
                  className="text-[10px] text-txt-muted hover:text-txt-primary flex items-center gap-1 font-bold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Xóa</span>
                </button>
              </div>

              {/* Phân nhóm công trình */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-txt-secondary block">Lĩnh vực công trình</label>
                <select
                  value={pCategory}
                  onChange={(e) => { setPCategory(e.target.value); setPCapType(''); }}
                  className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Loại chi tiết */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-txt-secondary block">Tên loại công trình</label>
                <select
                  value={pCapType}
                  onChange={(e) => setPCapType(e.target.value)}
                  className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                >
                  <option value="">-- Chọn loại công trình --</option>
                  {Object.values(CATEGORIES.find(c => c.id === pCategory)?.options || {}).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Nhập công suất */}
              {pCapType && (
                <div className="space-y-1 bg-sky-950/20 p-2 border border-sky-900/30 rounded">
                  <label className="text-xs font-bold text-sky-300 block">
                    Quy mô công suất ({CATEGORIES.find(c => c.id === pCategory)?.options[pCapType]?.unit})
                  </label>
                  {CATEGORIES.find(c => c.id === pCategory)?.options[pCapType]?.unit === 'Mọi quy mô' ? (
                    <input
                      type="text"
                      disabled={true}
                      placeholder="Không cần nhập (Cấp III với mọi quy mô)"
                      className="w-full bg-bg-subtle border border-border disabled:bg-bg-muted disabled:text-txt-placeholder rounded px-2.5 py-1.5 text-xs outline-none font-semibold cursor-not-allowed"
                    />
                  ) : (
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Nhập quy mô thiết kế"
                      value={pCapVal}
                      onChange={(e) => setPCapVal(formatInputOnTyping(e.target.value))}
                      className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                    />
                  )}
                  {CATEGORIES.find(c => c.id === pCategory)?.options[pCapType]?.hint && (
                    <div className="text-[9px] text-zinc-400 mt-1 font-semibold leading-normal">
                      {CATEGORIES.find(c => c.id === pCategory)?.options[pCapType]?.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Cấu phần kết cấu */}
              <div className="border-t border-border pt-3 space-y-3">
                <div className="text-xs font-black uppercase text-zinc-400 tracking-wider">Thông số kết cấu</div>
                
                {/* Chiều cao */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-txt-secondary block">Chiều cao H (m)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Ví dụ: 35,5"
                    value={pHeight}
                    onChange={(e) => setPHeight(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>

                {/* Số tầng cao */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-txt-secondary block">Số tầng nổi</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ví dụ: 9"
                    value={pFloors}
                    onChange={(e) => setPFloors(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>

                {/* Diện tích sàn */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-txt-secondary block">Tổng diện tích sàn (m²)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Ví dụ: 12.500"
                    value={pArea}
                    onChange={(e) => setPArea(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>

                {/* Nhịp kết cấu */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-txt-secondary block">Nhịp lớn nhất (m)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Ví dụ: 24"
                    value={pSpan}
                    onChange={(e) => setPSpan(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>

                {/* Độ sâu ngầm */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-txt-secondary block">Chiều sâu ngầm (m)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Ví dụ: 3,5"
                    value={pDepth}
                    onChange={(e) => setPDepth(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>

                {/* Số tầng ngầm */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-txt-secondary block">Số tầng ngầm</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Ví dụ: 1"
                    value={pBasements}
                    onChange={(e) => setPBasements(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>

                {/* Check F1.2-F4.3 */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="p_is_fire"
                    checked={pIsFireHouse}
                    onChange={(e) => setPIsFireHouse(e.target.checked)}
                    className="accent-sky-600"
                  />
                  <label htmlFor="p_is_fire" className="text-[11px] text-zinc-300 cursor-pointer font-bold">
                    Thuộc chung cư, khách sạn, văn phòng, trường học (F1.2, F1.3, F4.2, F4.3)
                  </label>
                </div>
              </div>

              <button
                onClick={() => setHasSearched(true)}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <Calculator className="w-4 h-4" />
                <span>PHÂN CẤP TỔNG HỢP</span>
              </button>
            </div>

            {/* Cột phải: Báo cáo kết quả kết hợp */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-5">
              {!hasSearched ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-bg-surface border border-border border-dashed rounded-xl h-[480px]">
                  <Calculator className="w-12 h-12 text-txt-muted mb-4 animate-bounce" />
                  <h4 className="text-txt-primary font-black text-base mb-1">Kết quả phân cấp dự án tổng hợp</h4>
                  <p className="text-txt-muted text-xs max-w-sm">
                    Nhập thông tin quy mô thiết kế và các kích thước kết cấu, sau đó bấm <strong>Phân cấp tổng hợp</strong> để đối chiếu chéo hai phụ lục.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Báo cáo kết luận lớn */}
                  {combinationResult && (
                    <div className="border border-sky-200 dark:border-sky-800/40 bg-sky-500/5 dark:bg-sky-950/10 p-5 rounded-xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="px-3.5 py-1.5 bg-sky-600 text-white text-base font-black rounded-lg shadow-sm">
                          {combinationResult.finalGrade}
                        </div>
                        <div>
                          <h3 className="font-black text-sm uppercase tracking-wider text-sky-600 dark:text-sky-400">CẤP CÔNG TRÌNH KHÁI TOÁN</h3>
                          <p className="text-xs text-txt-muted mt-0.5">
                            Căn cứ theo Thông tư 34/2026/TT-BXD
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-txt-primary border-t border-sky-100 dark:border-sky-900/50 pt-3">
                        Yếu tố quyết định cấp: <span className="text-sky-600 dark:text-sky-400">{combinationResult.decider}</span>
                      </div>
                    </div>
                  )}

                  {/* Chi tiết Phụ lục I - Công suất */}
                  {combinationResult?.capRes && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b border-border pb-2">
                        <FileText className="w-5 h-5 text-sky-500" />
                        <h4 className="font-black text-xs uppercase text-txt-primary tracking-wider">A. Phân cấp theo công suất (Phụ lục I)</h4>
                      </div>
                      <div className="border border-border bg-bg-surface p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-txt-primary">
                            {CATEGORIES.find(c => c.id === pCategory)?.options[pCapType]?.label}
                          </span>
                          <span className="px-2 py-0.5 bg-sky-500/10 text-sky-500 border border-sky-200 dark:border-sky-800/40 rounded text-[10px]">
                            {combinationResult.capRes.grade}
                          </span>
                        </div>
                        <p className="text-xs text-sky-600 font-semibold">
                          {combinationResult.capRes.text}
                        </p>
                        <p className="text-[11px] text-txt-muted leading-relaxed">
                          {combinationResult.capRes.details}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Chi tiết Phụ lục II - Kết cấu */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-border pb-2">
                      <Layers className="w-5 h-5 text-sky-500" />
                      <h4 className="font-black text-xs uppercase text-txt-primary tracking-wider">B. Phân cấp theo quy mô kết cấu (Phụ lục II)</h4>
                    </div>

                    {combinationResult && combinationResult.structList.length === 0 ? (
                      <p className="text-xs text-txt-muted">Không có thông số kết cấu nào được nhập.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {combinationResult?.structList.map((item, idx) => (
                          <div key={idx} className="border border-border bg-bg-surface p-3 rounded-lg space-y-2">
                            <div className="flex justify-between items-center text-xs font-bold border-b border-border-subtle pb-1.5">
                              <span className="text-txt-primary">{item.criterion}</span>
                              <span className="px-2 py-0.5 bg-sky-500/10 text-sky-500 border border-sky-200 dark:border-sky-800/40 rounded text-[10px]">
                                {item.grade}
                              </span>
                            </div>
                            <p className="text-xs text-txt-muted leading-normal">
                              {item.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
            
          </div>
        )}

        {/* ================================================== */}
        {/* TAB 2: QUY MÔ KẾT CẤU (PHỤ LỤC II) */}
        {/* ================================================== */}
        {activeTab === 'structure' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            
            {/* Cột trái: Nhập thông số kết cấu */}
            <div className="lg:col-span-4 xl:col-span-3 bg-bg-surface border border-border rounded-xl p-4 text-txt-primary shadow-sm space-y-4">
              <div className="border-b border-border pb-2 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-400">Bộ lọc kết cấu</h3>
              </div>

              {/* Loại kết cấu */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-txt-secondary block">Dạng kết cấu</label>
                <select
                  value={structType}
                  onChange={(e) => setStructType(e.target.value)}
                  className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                >
                  <option value="house">2.1 Nhà / Kết cấu dạng nhà</option>
                  <option value="column_civil">2.2.1 Cột / Trụ / Tháp dân dụng & công nghiệp</option>
                  <option value="column_infra">2.2.2 Cột BTS / Tháp anten hạ tầng</option>
                  <option value="tank">2.4 Bể chứa / Si-lô</option>
                  <option value="bridge">2.5 Cầu đường bộ</option>
                  <option value="retaining_wall">2.7.1 Tường chắn đất</option>
                </select>
              </div>

              {/* Chiều cao */}
              {['house', 'column_civil', 'column_infra', 'tank', 'bridge', 'retaining_wall'].includes(structType) && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-secondary block">
                    {structType === 'bridge' ? 'Chiều cao trụ cầu (m)' : structType === 'retaining_wall' ? 'Chiều cao tường chắn (m)' : 'Chiều cao kết cấu (m)'}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Nhập chiều cao"
                    value={sHeight}
                    onChange={(e) => setSHeight(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>
              )}

              {/* Tầng nổi */}
              {structType === 'house' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-secondary block">Số tầng cao (nổi)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Nhập số tầng"
                    value={sFloors}
                    onChange={(e) => setSFloors(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>
              )}

              {/* Diện tích sàn / Dung tích chứa */}
              {(structType === 'house' || structType === 'tank') && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-secondary block">
                    {structType === 'tank' ? 'Dung tích chứa (nghìn m³)' : 'Tổng diện tích sàn (m²)'}
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder={structType === 'tank' ? 'Ví dụ: 8,5' : 'Nhập diện tích'}
                    value={sArea}
                    onChange={(e) => setSArea(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>
              )}

              {/* Nhịp kết cấu */}
              {(structType === 'house' || structType === 'bridge') && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-secondary block">Nhịp kết cấu lớn nhất (m)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Nhập nhịp kết cấu"
                    value={sSpan}
                    onChange={(e) => setSSpan(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>
              )}

              {/* Độ sâu ngầm */}
              {(structType === 'house' || structType === 'tank') && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-secondary block">Độ sâu ngầm (m)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Nhập chiều sâu"
                    value={sDepth}
                    onChange={(e) => setSDepth(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>
              )}

              {/* Số tầng ngầm */}
              {structType === 'house' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-secondary block">Số tầng ngầm</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Nhập số tầng ngầm"
                    value={sBasements}
                    onChange={(e) => setSBasements(formatInputOnTyping(e.target.value))}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  />
                </div>
              )}

              {/* Nhóm nhà F1.2 - F4.3 */}
              {structType === 'house' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="s_is_fire"
                    checked={isFireHouse}
                    onChange={(e) => setIsFireHouse(e.target.checked)}
                    className="accent-sky-600"
                  />
                  <label htmlFor="s_is_fire" className="text-[11px] text-zinc-300 cursor-pointer font-bold">
                    Nhà thuộc công năng: Chung cư, văn phòng, khách sạn, trường học (F1.2, F1.3, F4.2, F4.3)
                  </label>
                </div>
              )}

              {/* Địa chất nền tường chắn */}
              {structType === 'retaining_wall' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-secondary block">Nhóm địa chất nền</label>
                  <select
                    value={groundType}
                    onChange={(e) => setGroundType(e.target.value)}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                  >
                    <option value="A">Nhóm A (Nền là đá cứng)</option>
                    <option value="B">Nhóm B (Nền đất cát, đất sét nửa cứng)</option>
                    <option value="C">Nhóm C (Nền đất sét dẻo bão hòa nước)</option>
                  </select>
                </div>
              )}

              {/* Bể chứa hóa chất độc hại */}
              {structType === 'tank' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="s_is_chemical"
                    checked={isHazardChemical}
                    onChange={(e) => setIsHazardChemical(e.target.checked)}
                    className="accent-sky-600"
                  />
                  <label htmlFor="s_is_chemical" className="text-[11px] text-zinc-300 cursor-pointer font-bold">
                    Bể chứa hóa chất nguy hiểm / chất độc hại
                  </label>
                </div>
              )}
            </div>

            {/* Cột phải: Xuất kết quả theo kết cấu */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-5">
              {structureResults.list.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-bg-surface border border-border border-dashed rounded-xl h-[420px]">
                  <Calculator className="w-12 h-12 text-txt-muted mb-4 animate-pulse" />
                  <h4 className="text-txt-primary font-black text-base mb-1">Báo cáo phân cấp theo quy mô kết cấu</h4>
                  <p className="text-txt-muted text-xs max-w-sm">
                    Nhập các kích thước, chiều cao, số tầng ở bảng điều khiển bên trái để hệ thống tính toán cấp tương ứng.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Báo cáo tổng thể kết cấu */}
                  <div className="border border-sky-200 dark:border-sky-800/40 bg-sky-500/5 dark:bg-sky-950/10 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-xs uppercase text-sky-600 dark:text-sky-400 tracking-wider">Cấp công trình theo kết cấu</h4>
                        <p className="text-[11px] text-txt-muted mt-0.5">Xác định theo cấp cao nhất của các tiêu chí hình học</p>
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 bg-sky-600 text-white text-base font-black rounded-lg shadow-sm">
                      {structureResults.maxGrade}
                    </span>
                  </div>

                  {/* Bảng chi tiết tiêu chí */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase text-txt-primary tracking-wider">Bảng đối chiếu chi tiết</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {structureResults.list.map((item, idx) => (
                        <div key={idx} className="border border-border bg-bg-surface p-3.5 rounded-lg space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold border-b border-border pb-1.5">
                            <span className="text-txt-primary">{item.criterion}</span>
                            <span className="px-2.5 py-0.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/40 rounded text-[10px] font-extrabold">
                              {item.grade}
                            </span>
                          </div>
                          <p className="text-xs text-txt-muted leading-relaxed font-semibold">
                            {item.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* ================================================== */}
        {/* TAB 3: QUY MÔ CÔNG SUẤT (PHỤ LỤC I) */}
        {/* ================================================== */}
        {activeTab === 'capacity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            
            {/* Cột trái: Form nhập công suất */}
            <div className="lg:col-span-4 xl:col-span-3 bg-bg-surface border border-border rounded-xl p-4 text-txt-primary shadow-sm space-y-4">
              <div className="border-b border-border pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-400">Bộ lọc công suất</h3>
              </div>

              {/* Lĩnh vực */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-txt-secondary block">Lĩnh vực công trình</label>
                <select
                  value={capCategory}
                  onChange={(e) => { setCapCategory(e.target.value); setCapType(''); }}
                  className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Loại chi tiết */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-txt-secondary block">Tên loại công trình</label>
                <select
                  value={capType}
                  onChange={(e) => setCapType(e.target.value)}
                  className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                >
                  <option value="">-- Chọn loại công trình --</option>
                  {Object.values(CATEGORIES.find(c => c.id === capCategory)?.options || {}).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* Nhập giá trị */}
              {capType && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-secondary block">
                    Quy mô công suất thiết kế ({CATEGORIES.find(c => c.id === capCategory)?.options[capType]?.unit})
                  </label>
                  {CATEGORIES.find(c => c.id === capCategory)?.options[capType]?.unit === 'Mọi quy mô' ? (
                    <input
                      type="text"
                      disabled={true}
                      placeholder="Không cần nhập (Cấp III với mọi quy mô)"
                      className="w-full bg-bg-subtle border border-border disabled:bg-bg-muted disabled:text-txt-placeholder rounded px-2.5 py-1.5 text-xs outline-none font-semibold cursor-not-allowed"
                    />
                  ) : (
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Nhập quy mô thiết kế"
                      value={capVal}
                      onChange={(e) => setCapVal(formatInputOnTyping(e.target.value))}
                      className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-sky-600 font-semibold"
                    />
                  )}
                  {CATEGORIES.find(c => c.id === capCategory)?.options[capType]?.hint && (
                    <div className="text-[10px] text-zinc-400 mt-1 font-semibold leading-normal">
                      {CATEGORIES.find(c => c.id === capCategory)?.options[capType]?.hint}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cột phải: Báo cáo công suất */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-5">
              {!capacityResult ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-bg-surface border border-border border-dashed rounded-xl h-[420px]">
                  <Calculator className="w-12 h-12 text-txt-muted mb-4 animate-pulse" />
                  <h4 className="text-txt-primary font-black text-base mb-1">Báo cáo phân cấp theo công suất</h4>
                  <p className="text-txt-muted text-xs max-w-sm">
                    Chọn loại công trình và nhập quy mô công suất để đối chiếu với Bảng 1 Phụ lục I Thông tư 34/2026/TT-BXD.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Báo cáo tổng thể kết quả công suất */}
                  <div className="border border-sky-200 dark:border-sky-800/40 bg-sky-500/5 dark:bg-sky-950/10 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-xs uppercase text-sky-600 dark:text-sky-400 tracking-wider">Cấp công trình theo công suất</h4>
                        <p className="text-[11px] text-txt-muted mt-0.5">Xác định theo Phụ lục I</p>
                      </div>
                    </div>
                    <span className="px-3.5 py-1.5 bg-sky-600 text-white text-base font-black rounded-lg shadow-sm">
                      {capacityResult.grade}
                    </span>
                  </div>

                  {/* Bảng chi tiết kết quả */}
                  <div className="border border-border bg-bg-surface p-4 rounded-lg space-y-3">
                    <h4 className="text-xs font-black uppercase text-txt-primary tracking-wider">Chi tiết tiêu chí quy mô công suất</h4>
                    <div className="text-xs font-bold text-sky-600">
                      {capacityResult.text}
                    </div>
                    <p className="text-xs text-txt-muted leading-relaxed font-semibold">
                      {capacityResult.details}
                    </p>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

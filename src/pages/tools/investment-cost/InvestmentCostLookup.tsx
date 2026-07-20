import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  RotateCcw, 
  Info, 
  FileText, 
  TrendingUp, 
  Building2, 
  MapPin, 
  DollarSign, 
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

// ==========================================
// HELPERS ĐỊNH DẠNG SỐ VÀ PARSE
// ==========================================
const parseFormattedNumber = (valStr: string): number => {
  if (!valStr) return 0;
  const normalized = valStr.replace(/\./g, '').replace(/,/g, '.');
  return parseFloat(normalized) || 0;
};

const formatInputOnTyping = (value: string): string => {
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

const formatMoney = (value: number): string => {
  if (isNaN(value) || value === null) return '0';
  return value.toLocaleString('vi-VN');
};

// ==========================================
// CƠ SỞ DỮ LIỆU TỈNH THÀNH & VÙNG
// ==========================================
interface Province {
  name: string;
  region: number;
}

const PROVINCES: Province[] = [
  // Vùng 1
  { name: 'Lào Cai', region: 1 }, { name: 'Yên Bái', region: 1 }, { name: 'Điện Biên', region: 1 },
  { name: 'Hòa Bình', region: 1 }, { name: 'Lai Châu', region: 1 }, { name: 'Sơn La', region: 1 },
  { name: 'Hà Giang', region: 1 }, { name: 'Cao Bằng', region: 1 }, { name: 'Bắc Kạn', region: 1 },
  { name: 'Lạng Sơn', region: 1 }, { name: 'Tuyên Quang', region: 1 }, { name: 'Thái Nguyên', region: 1 },
  { name: 'Phú Thọ', region: 1 }, { name: 'Bắc Giang', region: 1 },
  // Vùng 2
  { name: 'Quảng Ninh', region: 2 }, { name: 'Bắc Ninh', region: 2 }, { name: 'Hà Nam', region: 2 },
  { name: 'Hải Dương', region: 2 }, { name: 'Hưng Yên', region: 2 }, { name: 'Hải Phòng', region: 2 },
  { name: 'Nam Định', region: 2 }, { name: 'Ninh Bình', region: 2 }, { name: 'Thái Bình', region: 2 },
  { name: 'Vĩnh Phúc', region: 2 },
  // Vùng 3
  { name: 'Thanh Hóa', region: 3 }, { name: 'Nghệ An', region: 3 }, { name: 'Hà Tĩnh', region: 3 },
  { name: 'Quảng Bình', region: 3 }, { name: 'Quảng Trị', region: 3 }, { name: 'Thừa Thiên - Huế', region: 3 },
  { name: 'Đà Nẵng', region: 3 }, { name: 'Quảng Nam', region: 3 }, { name: 'Quảng Ngãi', region: 3 },
  { name: 'Bình Định', region: 3 }, { name: 'Phú Yên', region: 3 }, { name: 'Khánh Hòa', region: 3 },
  { name: 'Ninh Thuận', region: 3 }, { name: 'Bình Thuận', region: 3 },
  // Vùng 4
  { name: 'Kon Tum', region: 4 }, { name: 'Gia Lai', region: 4 }, { name: 'Đắk Lắk', region: 4 },
  { name: 'Đắc Nông', region: 4 }, { name: 'Lâm Đồng', region: 4 },
  // Vùng 5
  { name: 'Bình Phước', region: 5 }, { name: 'Bình Dương', region: 5 }, { name: 'Đồng Nai', region: 5 },
  { name: 'Tây Ninh', region: 5 }, { name: 'Bà Rịa - Vũng Tàu', region: 5 },
  // Vùng 6
  { name: 'Long An', region: 6 }, { name: 'Đồng Tháp', region: 6 }, { name: 'Tiền Giang', region: 6 },
  { name: 'An Giang', region: 6 }, { name: 'Bến Tre', region: 6 }, { name: 'Vĩnh Long', region: 6 },
  { name: 'Trà Vinh', region: 6 }, { name: 'Hậu Giang', region: 6 }, { name: 'Kiên Giang', region: 6 },
  { name: 'Sóc Trăng', region: 6 }, { name: 'Bạc Liêu', region: 6 }, { name: 'Cà Mau', region: 6 },
  { name: 'Cần Thơ', region: 6 },
  // Vùng 7
  { name: 'Thành phố Hà Nội', region: 7 },
  // Vùng 8
  { name: 'Thành phố Hồ Chí Minh', region: 8 }
];

// Định nghĩa 14 nhóm hệ số điều chỉnh vùng từ Bảng 100 QĐ 409
type SectorType = 
  | 'nhao' 
  | 'giaoduc' 
  | 'yte' 
  | 'thethao' 
  | 'cn_nangluong_duongday' 
  | 'cn_nangluong_tba' 
  | 'cn_nhaxuong_kho' 
  | 'ht_capnuoc' 
  | 'ht_nuocthai' 
  | 'ht_kcn_kdt' 
  | 'ht_rac_thai' 
  | 'gt_duong_nhua' 
  | 'gt_cau' 
  | 'nn_kenh_bt';

// Bản đồ hệ số điều chỉnh Kkv cho Suất vốn đầu tư (Bảng 100)
const REGION_COEFFICIENTS: Record<number, Record<SectorType, number>> = {
  1: {
    nhao: 0.935, giaoduc: 0.940, yte: 0.994, thethao: 0.936,
    cn_nangluong_duongday: 1.029, cn_nangluong_tba: 0.985, cn_nhaxuong_kho: 0.945,
    ht_capnuoc: 0.935, ht_nuocthai: 0.932, ht_kcn_kdt: 0.902, ht_rac_thai: 0.942,
    gt_duong_nhua: 0.946, gt_cau: 0.905, nn_kenh_bt: 0.918
  },
  2: {
    nhao: 0.948, giaoduc: 0.930, yte: 0.957, thethao: 0.931,
    cn_nangluong_duongday: 0.923, cn_nangluong_tba: 0.981, cn_nhaxuong_kho: 0.931,
    ht_capnuoc: 0.931, ht_nuocthai: 0.925, ht_kcn_kdt: 0.907, ht_rac_thai: 0.938,
    gt_duong_nhua: 0.996, gt_cau: 0.938, nn_kenh_bt: 0.930
  },
  3: {
    nhao: 1.032, giaoduc: 1.023, yte: 1.012, thethao: 1.003,
    cn_nangluong_duongday: 0.962, cn_nangluong_tba: 1.006, cn_nhaxuong_kho: 1.020,
    ht_capnuoc: 0.999, ht_nuocthai: 1.001, ht_kcn_kdt: 0.989, ht_rac_thai: 1.007,
    gt_duong_nhua: 0.950, gt_cau: 1.003, nn_kenh_bt: 0.967
  },
  4: {
    nhao: 1.048, giaoduc: 1.071, yte: 1.029, thethao: 1.029,
    cn_nangluong_duongday: 1.040, cn_nangluong_tba: 1.030, cn_nhaxuong_kho: 1.026,
    ht_capnuoc: 1.084, ht_nuocthai: 1.032, ht_kcn_kdt: 1.103, ht_rac_thai: 1.093,
    gt_duong_nhua: 1.099, gt_cau: 1.051, nn_kenh_bt: 1.098
  },
  5: {
    nhao: 1.048, giaoduc: 1.042, yte: 1.029, thethao: 1.034,
    cn_nangluong_duongday: 1.055, cn_nangluong_tba: 1.024, cn_nhaxuong_kho: 1.025,
    ht_capnuoc: 1.053, ht_nuocthai: 1.070, ht_kcn_kdt: 1.060, ht_rac_thai: 1.060,
    gt_duong_nhua: 1.059, gt_cau: 1.101, nn_kenh_bt: 1.071
  },
  6: {
    nhao: 1.017, giaoduc: 1.039, yte: 1.001, thethao: 1.010,
    cn_nangluong_duongday: 1.011, cn_nangluong_tba: 1.023, cn_nhaxuong_kho: 1.028,
    ht_capnuoc: 1.068, ht_nuocthai: 1.018, ht_kcn_kdt: 1.074, ht_rac_thai: 1.076,
    gt_duong_nhua: 1.118, gt_cau: 1.009, nn_kenh_bt: 1.061
  },
  7: {
    nhao: 0.952, giaoduc: 0.959, yte: 0.960, thethao: 0.942,
    cn_nangluong_duongday: 0.955, cn_nangluong_tba: 0.980, cn_nhaxuong_kho: 0.943,
    ht_capnuoc: 0.941, ht_nuocthai: 0.945, ht_kcn_kdt: 0.940, ht_rac_thai: 0.977,
    gt_duong_nhua: 0.924, gt_cau: 0.954, nn_kenh_bt: 0.982
  },
  8: {
    nhao: 1.064, giaoduc: 1.037, yte: 1.030, thethao: 1.039,
    cn_nangluong_duongday: 1.031, cn_nangluong_tba: 1.031, cn_nhaxuong_kho: 1.012,
    ht_capnuoc: 1.061, ht_nuocthai: 1.012, ht_kcn_kdt: 1.089, ht_rac_thai: 1.068,
    gt_duong_nhua: 1.031, gt_cau: 1.096, nn_kenh_bt: 1.013
  }
};

// ==========================================
// CƠ SỞ DỮ LIỆU SUẤT VỐN ĐẦU TƯ GỐC S0
// ==========================================
interface CostItem {
  id: string;
  name: string;
  s0: number;            // Nghìn đồng/đơn vị
  buildCost: number;     // Nghìn đồng/đơn vị
  equipCost: number;     // Nghìn đồng/đơn vị
  sectorType: SectorType; // Xác định trực tiếp hệ số vùng của chỉ tiêu
}

interface CostCategory {
  id: string;
  name: string;
  unit: string;          // m² sàn, cháu, học sinh, giường, km...
  items: CostItem[];
}

const COST_DATABASE: CostCategory[] = [
  // ── I. CÔNG TRÌNH DÂN DỤNG ──
  {
    id: 'chung_cu',
    name: 'Dân dụng - Nhà chung cư (Bảng 1)',
    unit: 'm² sàn',
    items: [
      { id: 'cc_5_0', name: 'Số tầng ≤ 5, không có tầng hầm', s0: 7850, buildCost: 6666, equipCost: 385, sectorType: 'nhao' },
      { id: 'cc_5_1', name: 'Số tầng ≤ 5, có 1 tầng hầm', s0: 9177, buildCost: 7793, equipCost: 450, sectorType: 'nhao' },
      { id: 'cc_5_2', name: 'Số tầng ≤ 5, có 2 tầng hầm', s0: 10354, buildCost: 8792, equipCost: 507, sectorType: 'nhao' },
      { id: 'cc_7_0', name: '5 < số tầng ≤ 7, không có tầng hầm', s0: 10118, buildCost: 7941, equipCost: 693, sectorType: 'nhao' },
      { id: 'cc_7_1', name: '5 < số tầng ≤ 7, có 1 tầng hầm', s0: 10822, buildCost: 8493, equipCost: 742, sectorType: 'nhao' },
      { id: 'cc_7_2', name: '5 < số tầng ≤ 7, có 2 tầng hầm', s0: 11547, buildCost: 9063, equipCost: 791, sectorType: 'nhao' },
      { id: 'cc_10_0', name: '7 < số tầng ≤ 10, không có tầng hầm', s0: 10425, buildCost: 8311, equipCost: 726, sectorType: 'nhao' },
      { id: 'cc_10_1', name: '7 < số tầng ≤ 10, có 1 tầng hầm', s0: 10909, buildCost: 8697, equipCost: 759, sectorType: 'nhao' },
      { id: 'cc_10_2', name: '7 < số tầng ≤ 10, có 2 tầng hầm', s0: 11447, buildCost: 9124, equipCost: 797, sectorType: 'nhao' },
      { id: 'cc_15_0', name: '10 < số tầng ≤ 15, không có tầng hầm', s0: 10919, buildCost: 8884, equipCost: 726, sectorType: 'nhao' },
      { id: 'cc_15_1', name: '10 < số tầng ≤ 15, có 1 tầng hầm', s0: 11232, buildCost: 9139, equipCost: 747, sectorType: 'nhao' },
      { id: 'cc_15_2', name: '10 < số tầng ≤ 15, có 2 tầng hầm', s0: 11603, buildCost: 9441, equipCost: 771, sectorType: 'nhao' },
      { id: 'cc_20_0', name: '15 < số tầng ≤ 20, không có tầng hầm', s0: 12169, buildCost: 9356, equipCost: 990, sectorType: 'nhao' },
      { id: 'cc_20_1', name: '15 < số tầng ≤ 20, có 1 tầng hầm', s0: 12345, buildCost: 9492, equipCost: 1005, sectorType: 'nhao' },
      { id: 'cc_20_2', name: '15 < số tầng ≤ 20, có 2 tầng hầm', s0: 12580, buildCost: 9672, equipCost: 1023, sectorType: 'nhao' },
      { id: 'cc_24_0', name: '20 < số tầng ≤ 24, không có tầng hầm', s0: 13544, buildCost: 10426, equipCost: 1308, sectorType: 'nhao' },
      { id: 'cc_24_1', name: '20 < số tầng ≤ 24, có 1 tầng hầm', s0: 13646, buildCost: 10505, equipCost: 1318, sectorType: 'nhao' },
      { id: 'cc_24_2', name: '20 < số tầng ≤ 24, có 2 tầng hầm', s0: 13803, buildCost: 10626, equipCost: 1334, sectorType: 'nhao' },
      { id: 'cc_30_0', name: '24 < số tầng ≤ 30, không có tầng hầm', s0: 14220, buildCost: 10950, equipCost: 1375, sectorType: 'nhao' },
      { id: 'cc_30_1', name: '24 < số tầng ≤ 30, có 1 tầng hầm', s0: 14280, buildCost: 10996, equipCost: 1380, sectorType: 'nhao' },
      { id: 'cc_30_2', name: '24 < số tầng ≤ 30, có 2 tầng hầm', s0: 14388, buildCost: 11079, equipCost: 1391, sectorType: 'nhao' }
    ]
  },
  {
    id: 'nha_o_rieng_le',
    name: 'Dân dụng - Nhà ở riêng lẻ (Bảng 2)',
    unit: 'm² sàn',
    items: [
      { id: 'rol_1_ton', name: 'Nhà 1 tầng, khép kín, tường gạch chịu lực, mái tôn', s0: 5184, buildCost: 4646, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_1_btct', name: 'Nhà 1 tầng, khép kín, tường gạch chịu lực, mái BTCT', s0: 5363, buildCost: 4825, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_23_khong_ham', name: 'Nhà từ 2-3 tầng, khung chịu lực BTCT, không có tầng hầm', s0: 8225, buildCost: 7405, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_23_1_ham', name: 'Nhà từ 2-3 tầng, khung chịu lực BTCT, có 1 tầng hầm', s0: 10154, buildCost: 9135, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_bt_khong_ham', name: 'Nhà biệt thự từ 2-3 tầng, không có tầng hầm', s0: 10334, buildCost: 8976, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_bt_1_ham', name: 'Nhà biệt thự từ 2-3 tầng, có 1 tầng hầm', s0: 11123, buildCost: 9670, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_0_u50', name: 'Nhà từ 4-5 tầng, không hầm, diện tích xây dựng < 50m²', s0: 8966, buildCost: 7539, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_0_50_70', name: 'Nhà từ 4-5 tầng, không hầm, diện tích xây dựng 50 - 70m²', s0: 8350, buildCost: 7320, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_0_70_90', name: 'Nhà từ 4-5 tầng, không hầm, diện tích xây dựng 70 - 90m²', s0: 7673, buildCost: 7002, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_0_90_140', name: 'Nhà từ 4-5 tầng, không hầm, diện tích xây dựng 90 - 140m²', s0: 7497, buildCost: 6927, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_0_140_180', name: 'Nhà từ 4-5 tầng, không hầm, diện tích xây dựng 140 - 180m²', s0: 7280, buildCost: 6780, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_0_o180', name: 'Nhà từ 4-5 tầng, không hầm, diện tích xây dựng ≥ 180m²', s0: 6952, buildCost: 6485, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_1_u50', name: 'Nhà từ 4-5 tầng, có 1 hầm, diện tích xây dựng < 50m²', s0: 9901, buildCost: 8985, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_1_50_70', name: 'Nhà từ 4-5 tầng, có 1 hầm, diện tích xây dựng 50 - 70m²', s0: 9050, buildCost: 8348, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_1_70_90', name: 'Nhà từ 4-5 tầng, có 1 hầm, diện tích xây dựng 70 - 90m²', s0: 8847, buildCost: 8174, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_1_90_140', name: 'Nhà từ 4-5 tầng, có 1 hầm, diện tích xây dựng 90 - 140m²', s0: 8703, buildCost: 8115, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_1_140_180', name: 'Nhà từ 4-5 tầng, có 1 hầm, diện tích xây dựng 140 - 180m²', s0: 8526, buildCost: 7994, equipCost: 0, sectorType: 'nhao' },
      { id: 'rol_45_1_o180', name: 'Nhà từ 4-5 tầng, có 1 hầm, diện tích xây dựng ≥ 180m²', s0: 8257, buildCost: 7752, equipCost: 0, sectorType: 'nhao' }
    ]
  },
  {
    id: 'truong_hoc_cac_cap',
    name: 'Dân dụng - Trường học (Bảng 3, 5, 7, 9, 10, 12)',
    unit: 'học sinh / học viên',
    items: [
      { id: 'mn_180_350', name: 'Trường mầm non: Quy mô 180 < số cháu ≤ 350 - đ/cháu', s0: 104962, buildCost: 70654, equipCost: 10109, sectorType: 'giaoduc' },
      { id: 'mn_350_450', name: 'Trường mầm non: Quy mô 350 < số cháu ≤ 450 - đ/cháu', s0: 87862, buildCost: 59148, equipCost: 8632, sectorType: 'giaoduc' },
      { id: 'mn_550_700', name: 'Trường mầm non: Quy mô 550 < số cháu ≤ 700 - đ/cháu', s0: 82136, buildCost: 55301, equipCost: 8117, sectorType: 'giaoduc' },
      { id: 'th_300_500', name: 'Trường tiểu học: Quy mô 300 < số học sinh ≤ 500 - đ/hs', s0: 89278, buildCost: 58748, equipCost: 8950, sectorType: 'giaoduc' },
      { id: 'th_850_1050', name: 'Trường tiểu học: Quy mô 850 < số học sinh ≤ 1050 - đ/hs', s0: 61582, buildCost: 40344, equipCost: 6152, sectorType: 'giaoduc' },
      { id: 'thcs_280_690', name: 'Trường THCS: Quy mô 280 < số học sinh ≤ 690 - đ/hs', s0: 114088, buildCost: 77366, equipCost: 9416, sectorType: 'giaoduc' },
      { id: 'thcs_1020_1350', name: 'Trường THCS: Quy mô 1020 < số học sinh ≤ 1350 - đ/hs', s0: 69709, buildCost: 47292, equipCost: 5855, sectorType: 'giaoduc' },
      { id: 'thcs_1700_2025', name: 'Trường THCS: Quy mô 1700 < số học sinh ≤ 2025 - đ/hs', s0: 59190, buildCost: 40205, equipCost: 5011, sectorType: 'giaoduc' },
      { id: 'thpt_600_1000', name: 'Trường THPT: Quy mô 600 < số học sinh ≤ 1000 - đ/hs', s0: 88689, buildCost: 59714, equipCost: 7667, sectorType: 'giaoduc' },
      { id: 'thpt_1700_2050', name: 'Trường THPT: Quy mô 1700 < số học sinh ≤ 2050 - đ/hs', s0: 69288, buildCost: 46880, equipCost: 5975, sectorType: 'giaoduc' },
      { id: 'dh_u1000', name: 'Trường Đại học: Quy mô số học viên ≤ 1.000 - đ/học viên', s0: 177219, buildCost: 147379, equipCost: 8587, sectorType: 'giaoduc' },
      { id: 'dh_3000_5000', name: 'Trường Đại học: Quy mô 3.000 < số học viên ≤ 5.000 - đ/học viên', s0: 160223, buildCost: 133010, equipCost: 8123, sectorType: 'giaoduc' },
      { id: 'dh_o5000', name: 'Trường Đại học: Quy mô số học viên > 5.000 - đ/học viên', s0: 455304, buildCost: 128767, equipCost: 8123, sectorType: 'giaoduc' },
      { id: 'nghe_u500', name: 'Dạy nghề, Trung cấp: Quy mô số học viên ≤ 500 - đ/học viên', s0: 85468, buildCost: 67777, equipCost: 9769, sectorType: 'giaoduc' },
      { id: 'nghe_800_1200', name: 'Dạy nghề, Trung cấp: Quy mô 800 < số học viên ≤ 1.200 - đ/học viên', s0: 76798, buildCost: 60627, equipCost: 8620, sectorType: 'giaoduc' }
    ]
  },
  {
    id: 'y_te_benh_vien',
    name: 'Dân dụng - Y tế, Bệnh viện (Bảng 13 & 15)',
    unit: 'giường bệnh / m² sàn',
    items: [
      { id: 'bv_150_250', name: 'Bệnh viện đa khoa: Quy mô từ 150 đến < 250 giường - đ/giường', s0: 2910092, buildCost: 1899206, equipCost: 372991, sectorType: 'yte' },
      { id: 'bv_250_350', name: 'Bệnh viện đa khoa: Quy mô từ 250 đến 350 giường - đ/giường', s0: 2217635, buildCost: 1446053, equipCost: 285475, sectorType: 'yte' },
      { id: 'bv_500_1000', name: 'Bệnh viện đa khoa: Quy mô từ 500 đến 1.000 giường - đ/giường', s0: 1668283, buildCost: 1086605, equipCost: 215990, sectorType: 'yte' },
      { id: 'tyt_coso', name: 'Trạm y tế cơ sở xã, phường - đ/m² sàn', s0: 9753, buildCost: 7551, equipCost: 1232, sectorType: 'yte' },
      { id: 'tyt_duphong', name: 'Trung tâm y tế dự phòng tuyến huyện - đ/m² sàn', s0: 10120, buildCost: 7890, equipCost: 1430, sectorType: 'yte' }
    ]
  },
  {
    id: 'the_thao_giai_tri',
    name: 'Dân dụng - Thể thao, Sân vận động (Bảng 18, 19, 20)',
    unit: 'chỗ ngồi / m² sân',
    items: [
      { id: 'svd_20k', name: 'Sân vận động có khán đài: Quy mô sức chứa 20.000 chỗ - đ/chỗ', s0: 3706, buildCost: 2830, equipCost: 464, sectorType: 'thethao' },
      { id: 'svd_40k', name: 'Sân vận động có khán đài: Quy mô sức chứa 40.000 chỗ - đ/chỗ', s0: 2908, buildCost: 2342, equipCost: 166, sectorType: 'thethao' },
      { id: 'ntd_bongda_ngoaitroi', name: 'Sân bóng đá ngoài trời, không khán đài - đ/m² sân', s0: 1108, buildCost: 904, equipCost: 55, sectorType: 'thethao' },
      { id: 'ntd_tennis_ngoaitroi', name: 'Sân tennis ngoài trời, không khán đài - đ/m² sân', s0: 6231, buildCost: 5042, equipCost: 332, sectorType: 'thethao' },
      { id: 'ntd_1k_chongoi', name: 'Nhà thi đấu đa năng (bóng rổ, cầu lông...) 1.000 chỗ - đ/chỗ', s0: 11885, buildCost: 9750, equipCost: 431, sectorType: 'thethao' },
      { id: 'ntd_3k_chongoi', name: 'Nhà thi đấu đa năng (bóng rổ, cầu lông...) 3.000 chỗ - đ/chỗ', s0: 11079, buildCost: 9013, equipCost: 431, sectorType: 'thethao' }
    ]
  },

  // ── II. CÔNG TRÌNH CÔNG NGHIỆP ──
  {
    id: 'cong_nghiep_nha_xuong',
    name: 'Công nghiệp - Nhà xưởng sản xuất (Bảng 51)',
    unit: 'm² sàn',
    items: [
      { id: 'nx_1t_12m_tonton', name: 'Nhà xưởng 1 tầng, khẩu độ 12m, cao ≤ 6m, mái tôn', s0: 1958, buildCost: 1862, equipCost: 0, sectorType: 'cn_nhaxuong_kho' },
      { id: 'nx_1t_12m_thep', name: 'Nhà xưởng 1 tầng, khẩu độ 12m, kèo thép, mái tôn', s0: 2268, buildCost: 2149, equipCost: 0, sectorType: 'cn_nhaxuong_kho' },
      { id: 'nx_1t_15m_betong', name: 'Nhà xưởng 1 tầng, khẩu độ 15m, cột kèo bê tông, mái tôn', s0: 5276, buildCost: 4930, equipCost: 0, sectorType: 'cn_nhaxuong_kho' },
      { id: 'nx_1t_15m_theptole', name: 'Nhà xưởng 1 tầng, khẩu độ 15m, cột kèo thép, tường bao tôn', s0: 4631, buildCost: 4321, equipCost: 0, sectorType: 'cn_nhaxuong_kho' },
      { id: 'nx_1t_18m_cautruc', name: 'Nhà xưởng 1 tầng, khẩu độ 18m, có cầu trục 5 tấn', s0: 5956, buildCost: 5550, equipCost: 0, sectorType: 'cn_nhaxuong_kho' },
      { id: 'nx_1t_24m_cautruc', name: 'Nhà xưởng 1 tầng, khẩu độ 24m, có cầu trục 10 tấn', s0: 8594, buildCost: 8009, equipCost: 0, sectorType: 'cn_nhaxuong_kho' }
    ]
  },
  {
    id: 'cong_nghiep_kho_chuyen_dung',
    name: 'Công nghiệp - Nhà kho chuyên dụng (Bảng 52, 53, 54)',
    unit: 'm² sàn / tấn',
    items: [
      { id: 'kho_u500_luongthuc', name: 'Kho lương thực nhỏ (<500 tấn), khung thép mái tôn - đ/m²', s0: 3366, buildCost: 3187, equipCost: 0, sectorType: 'cn_nhaxuong_kho' },
      { id: 'kho_u500_hoachat', name: 'Kho hóa chất xây gạch nhỏ (<500 tấn), mái bằng - đ/m²', s0: 3127, buildCost: 2960, equipCost: 0, sectorType: 'cn_nhaxuong_kho' },
      { id: 'kho_o500_500t', name: 'Kho lương thực lớn sức chứa 500 tấn - đ/tấn', s0: 3161, buildCost: 2698, equipCost: 392, sectorType: 'cn_nhaxuong_kho' },
      { id: 'kho_o500_1500t', name: 'Kho lương thực lớn sức chứa 1.500 tấn - đ/tấn', s0: 3397, buildCost: 2805, equipCost: 544, sectorType: 'cn_nhaxuong_kho' },
      { id: 'kho_o500_10000t', name: 'Kho lương thực lớn sức chứa 10.000 tấn - đ/tấn', s0: 4177, buildCost: 3438, equipCost: 632, sectorType: 'cn_nhaxuong_kho' },
      { id: 'kho_lanh_300t', name: 'Kho đông lạnh gạch và bê tông sức chứa 300 tấn - đ/m² sàn', s0: 10957, buildCost: 10213, equipCost: 0, sectorType: 'cn_nhaxuong_kho' }
    ]
  },
  {
    id: 'cong_nghiep_dien',
    name: 'Công nghiệp - Năng lượng, Điện lực (Bảng 36, 37, 38)',
    unit: 'kW / km',
    items: [
      { id: 'nd_330k', name: 'Nhà máy nhiệt điện công suất 330.000 kW - đ/kW', s0: 26989, buildCost: 8479, equipCost: 15123, sectorType: 'cn_nangluong_tba' },
      { id: 'nd_600k', name: 'Nhà máy nhiệt điện công suất 600.000 kW - đ/kW', s0: 26080, buildCost: 8017, equipCost: 14819, sectorType: 'cn_nangluong_tba' },
      { id: 'td_60_150k', name: 'Nhà máy thủy điện công suất 60.000 - 150.000 kW - đ/kW', s0: 34927, buildCost: 16108, equipCost: 14046, sectorType: 'cn_nangluong_tba' },
      { id: 'td_200_400k', name: 'Nhà máy thủy điện công suất 200.000 - 400.000 kW - đ/kW', s0: 29758, buildCost: 12828, equipCost: 13000, sectorType: 'cn_nangluong_tba' },
      { id: 'dd_22kv_ac50', name: 'Đường dây tải điện trần 22kV, dây nhôm lõi thép AC-50 - đ/km', s0: 162309, buildCost: 143589, equipCost: 0, sectorType: 'cn_nangluong_duongday' },
      { id: 'dd_22kv_ac95', name: 'Đường dây tải điện trần 22kV, dây nhôm lõi thép AC-95 - đ/km', s0: 297376, buildCost: 263086, equipCost: 0, sectorType: 'cn_nangluong_duongday' },
      { id: 'dd_110kv_ac150_1m', name: 'Đường dây trần 110kV, dây nhôm lõi thép, 1 mạch AC-150 - đ/km', s0: 1047926, buildCost: 915755, equipCost: 0, sectorType: 'cn_nangluong_duongday' },
      { id: 'dd_110kv_ac150_2m', name: 'Đường dây trần 110kV, dây nhôm lõi thép, 2 mạch AC-150 - đ/km', s0: 1676179, buildCost: 1464751, equipCost: 0, sectorType: 'cn_nangluong_duongday' }
    ]
  },

  // ── III. CÔNG TRÌNH HẠ TẦNG KỸ THUẬT ──
  {
    id: 'ha_tang_cap_thoat_nuoc',
    name: 'Hạ tầng - Cấp thoát nước, Xử lý nước thải (Bảng 55 & 56)',
    unit: 'm³ / ngày-đêm',
    items: [
      { id: 'nm_capnuoc_40k', name: 'Nhà máy cấp nước sinh hoạt công suất 40.000 m³/ngày-đêm - đ/m³', s0: 4780, buildCost: 1861, equipCost: 2395, sectorType: 'ht_capnuoc' },
      { id: 'nm_capnuoc_100k', name: 'Nhà máy cấp nước sinh hoạt công suất 100.000 m³/ngày-đêm - đ/m³', s0: 4229, buildCost: 1679, equipCost: 2090, sectorType: 'ht_capnuoc' },
      { id: 'xlnt_bun_u2000', name: 'Xử lý nước thải công nghệ bùn hoạt tính < 2.000 m³/ngày-đêm - đ/m³', s0: 26443, buildCost: 23000, equipCost: 3000, sectorType: 'ht_nuocthai' },
      { id: 'xlnt_ho_u2000', name: 'Xử lý nước thải công nghệ hồ sinh học < 2.000 m³/ngày-đêm - đ/m³', s0: 18395, buildCost: 16000, equipCost: 2000, sectorType: 'ht_nuocthai' }
    ]
  },
  {
    id: 'ha_tang_khu_cong_nghiep_do_thi',
    name: 'Hạ tầng - KCN, Cụm công nghiệp, KĐT (Bảng 57 & 68)',
    unit: 'ha / tấn công suất',
    items: [
      // Đổi triệu đồng/ha sang nghìn đồng/ha để đồng bộ
      { id: 'ht_kcn_u100', name: 'Hạ tầng kỹ thuật khu công nghiệp quy mô < 100 ha - đ/ha', s0: 8974000, buildCost: 7289000, equipCost: 439000, sectorType: 'ht_kcn_kdt' },
      { id: 'ht_kcn_100_300', name: 'Hạ tầng kỹ thuật khu công nghiệp quy mô 100 - 300 ha - đ/ha', s0: 8265000, buildCost: 6710000, equipCost: 426000, sectorType: 'ht_kcn_kdt' },
      { id: 'ht_ccng_10_75', name: 'Hạ tầng kỹ thuật cụm công nghiệp quy mô 10 - 75 ha - đ/ha', s0: 6047000, buildCost: 4725000, equipCost: 368000, sectorType: 'ht_kcn_kdt' },
      { id: 'ht_rac_thai_u100', name: 'Cơ sở xử lý chất thải rắn sinh hoạt quy mô < 100 tấn/ngày-đêm - đ/tấn công suất', s0: 412000, buildCost: 320000, equipCost: 80000, sectorType: 'ht_rac_thai' }
    ]
  },

  // ── IV. CÔNG TRÌNH GIAO THÔNG ──
  {
    id: 'giao_thong_duong_bo',
    name: 'Giao thông - Đường bộ, Cao tốc, Hầm, Trạm ETC (Bảng 69, 70, 71, 72)',
    unit: 'km / làn ETC',
    items: [
      // Đổi triệu đồng/km sang nghìn đồng/km để đồng bộ
      { id: 'cao_toc_120_4lan', name: 'Đường cao tốc cấp 100-120: 4 làn xe chạy (gồm cầu + xử lý đất) - đ/km', s0: 188722000, buildCost: 172857000, equipCost: 4442000, sectorType: 'gt_duong_nhua' },
      { id: 'cao_toc_120_4lan_nocau', name: 'Đoạn tuyến cao tốc 100-120: 4 làn (không gồm cầu & xử lý đất) - đ/km', s0: 145798000, buildCost: 134018000, equipCost: 4442000, sectorType: 'gt_duong_nhua' },
      { id: 'cao_toc_80_4lan', name: 'Đường cao tốc cấp 80: 4 làn xe chạy (gồm cầu + xử lý đất) - đ/km', s0: 173376000, buildCost: 158890000, equipCost: 4221000, sectorType: 'gt_duong_nhua' },
      { id: 'cao_toc_80_4lan_nocau', name: 'Đoạn tuyến cao tốc cấp 80: 4 làn (không gồm cầu & xử lý đất) - đ/km', s0: 133919000, buildCost: 123190000, equipCost: 4221000, sectorType: 'gt_duong_nhua' },
      { id: 'etc_codieuhanh_u6', name: 'Trạm thu phí ETC có nhà điều hành trung tâm, số làn ≤ 6 - đ/làn', s0: 10610000, buildCost: 5559000, equipCost: 4624000, sectorType: 'gt_duong_nhua' },
      { id: 'etc_khongdieuhanh_u6', name: 'Trạm thu phí ETC không có nhà điều hành trung tâm, số làn ≤ 6 - đ/làn', s0: 8545000, buildCost: 3978000, equipCost: 4202000, sectorType: 'gt_duong_nhua' },
      { id: 'ham_xuyen_nui_3lan', name: 'Hầm giao thông xuyên núi cao tốc: 3 làn xe chạy - đ/km/ống hầm', s0: 572635000, buildCost: 503997000, equipCost: 23752000, sectorType: 'gt_duong_nhua' },
      { id: 'ham_xuyen_nui_2lan', name: 'Hầm giao thông xuyên núi cao tốc: 2 làn xe chạy - đ/km/ống hầm', s0: 507987000, buildCost: 470358000, equipCost: 20943000, sectorType: 'gt_duong_nhua' }
    ]
  },

  // ── V. CÔNG TRÌNH NÔNG NGHIỆP VÀ PHÁT TRIỂN NÔNG THÔN ──
  {
    id: 'nong_nghiep_thuy_loi',
    name: 'Nông nghiệp & PTNT - Kênh mương, Thủy lợi (Bảng 79)',
    unit: 'ha',
    items: [
      { id: 'nn_kenh_025', name: 'Kênh bê tông tưới tiêu thủy lợi: Tiết diện BxH = 0.25 m² - đ/ha', s0: 1655754, buildCost: 1482402, equipCost: 0, sectorType: 'nn_kenh_bt' },
      { id: 'nn_kenh_100', name: 'Kênh bê tông tưới tiêu thủy lợi: Tiết diện BxH = 1.00 m² - đ/ha', s0: 5150932, buildCost: 4611653, equipCost: 0, sectorType: 'nn_kenh_bt' },
      { id: 'nn_kenh_200', name: 'Kênh bê tông tưới tiêu thủy lợi: Tiết diện BxH = 2.00 m² - đ/ha', s0: 9811184, buildCost: 8783970, equipCost: 0, sectorType: 'nn_kenh_bt' },
      { id: 'nn_kenh_300', name: 'Kênh bê tông tưới tiêu thủy lợi: Tiết diện BxH = 3.00 m² - đ/ha', s0: 14471437, buildCost: 12956309, equipCost: 0, sectorType: 'nn_kenh_bt' }
    ]
  }
];

export const InvestmentCostLookup: React.FC = () => {
  // --- States ---
  const [selectedProvinceName, setSelectedProvinceName] = useState<string>('Thành phố Hà Nội');
  const [categoryId, setCategoryId] = useState<string>('chung_cu');
  const [itemId, setItemId] = useState<string>('cc_5_0');
  const [quantity, setQuantity] = useState<string>(''); // Quy mô dự án thực tế

  // Tỉnh thành hiện tại
  const selectedProvince = useMemo(() => {
    return PROVINCES.find(p => p.name === selectedProvinceName) || PROVINCES[0];
  }, [selectedProvinceName]);

  // Nhóm suất đầu tư hiện tại
  const selectedCategory = useMemo(() => {
    return COST_DATABASE.find(c => c.id === categoryId) || COST_DATABASE[0];
  }, [categoryId]);

  // Chi tiết suất đầu tư gốc hiện tại
  const selectedItem = useMemo(() => {
    const items = selectedCategory.items;
    // Tự động chuyển đổi itemId nếu không khớp với category mới
    const found = items.find(i => i.id === itemId);
    if (found) return found;
    return items[0];
  }, [selectedCategory, itemId]);

  // Tự động reset itemId khi chuyển category
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCatId = e.target.value;
    setCategoryId(newCatId);
    const newCat = COST_DATABASE.find(c => c.id === newCatId);
    if (newCat) {
      setItemId(newCat.items[0].id);
    }
  };

  const handleReset = () => {
    setSelectedProvinceName('Thành phố Hà Nội');
    setCategoryId('chung_cu');
    setItemId('cc_5_0');
    setQuantity('');
  };

  // --- Logic tính toán ---
  // Hệ số vùng Kkv tính động dựa trên SectorType của Item cụ thể
  const kkv = useMemo(() => {
    const reg = selectedProvince.region;
    const itemType = selectedItem.sectorType;
    const coeffs = REGION_COEFFICIENTS[reg];
    if (!coeffs) return 1.0;
    return coeffs[itemType] || 1.0;
  }, [selectedProvince, selectedItem]);

  // Suất đầu tư sau điều chỉnh (Nghìn đồng/đơn vị)
  const adjustedS0 = useMemo(() => {
    return selectedItem.s0 * kkv;
  }, [selectedItem, kkv]);

  // Tổng mức đầu tư dự kiến (Nghìn đồng)
  const totalCost = useMemo(() => {
    const q = parseFormattedNumber(quantity);
    return adjustedS0 * q;
  }, [adjustedS0, quantity]);

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-140px)] border border-border bg-bg-surface rounded-xl overflow-hidden shadow-lg text-txt-primary">
      
      {/* ── Header mang phong cách tài chính đầu tư hoàng gia Indigo ── */}
      <div className="px-5 py-4 bg-indigo-950 border-b border-indigo-950/80 flex items-center gap-3.5 text-white">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center border border-indigo-500 shadow-lg shadow-indigo-950/20">
          <Calculator className="w-5.5 h-5.5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-wider text-indigo-400">Tra cứu Suất vốn Đầu tư Xây dựng</h1>
          <p className="text-[11px] text-indigo-200 mt-0.5">
            Căn cứ pháp lý: <strong className="text-white">Quyết định số 409/QĐ-BXD</strong> ngày 11/4/2025 của Bộ Xây dựng (Mặt bằng giá Quý IV/2024)
          </p>
        </div>
      </div>

      {/* ── Quy định sử dụng ── */}
      <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-5 py-2.5 flex items-start gap-2.5 text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed font-semibold">
        <Info className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
        <span>
          <strong>Phạm vi áp dụng:</strong> Xác định sơ bộ tổng mức đầu tư xây dựng các loại công trình (Dân dụng, Công nghiệp, Hạ tầng kỹ thuật, Giao thông, Nông nghiệp & PTNT) dựa trên quy mô và địa điểm xây dựng. Hệ thống tự động tra cứu chính xác hệ số điều chỉnh vùng Kkv theo Bảng 100 QĐ 409.
        </span>
      </div>

      {/* ── Nội dung chính ── */}
      <div className="flex-1 p-5 overflow-y-auto no-scrollbar w-full space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          
          {/* Cột trái: Bộ điều khiển */}
          <div className="lg:col-span-4 xl:col-span-3 bg-bg-surface border border-border rounded-xl p-4 text-txt-primary shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400">Thông số dự án</h3>
              <button 
                onClick={handleReset}
                className="text-[10px] text-txt-muted hover:text-txt-primary flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa</span>
              </button>
            </div>

            {/* Chọn Tỉnh / Thành phố */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Địa điểm xây dựng</span>
              </label>
              <select
                value={selectedProvinceName}
                onChange={(e) => setSelectedProvinceName(e.target.value)}
                className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-indigo-600 font-semibold"
              >
                {PROVINCES.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Chọn Loại công trình */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary block flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Nhóm công trình</span>
              </label>
              <select
                value={categoryId}
                onChange={handleCategoryChange}
                className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-indigo-600 font-semibold"
              >
                {COST_DATABASE.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Chọn Chỉ tiêu cụ thể */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary block">Chỉ tiêu quy mô thiết kế</label>
              <select
                value={selectedItem.id}
                onChange={(e) => setItemId(e.target.value)}
                className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-indigo-600 font-semibold"
              >
                {selectedCategory.items.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            {/* Nhập Quy mô dự án thực tế */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary block">
                Quy mô tính toán ({selectedCategory.unit})
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder={`Ví dụ: ${selectedCategory.unit === 'm² sàn' ? '12.500' : '250'}`}
                value={quantity}
                onChange={(e) => setQuantity(formatInputOnTyping(e.target.value))}
                className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-indigo-600 font-semibold"
              />
            </div>

          </div>

          {/* Cột phải: Báo cáo kết quả tính toán chi tiết */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-5">
            
            {/* Kết quả suất vốn đầu tư sau điều chỉnh */}
            <div className="bg-bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider text-indigo-600">SUẤT VỐN ĐẦU TƯ ÁP DỤNG</h3>
                  <p className="text-[10px] text-txt-muted mt-0.5">
                    Khu vực: <span className="font-bold text-txt-primary">{selectedProvinceName}</span> (Thuộc **Vùng {selectedProvince.region}**)
                  </p>
                </div>
              </div>

              {/* So sánh Suất gốc và Suất điều chỉnh */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="border border-border p-3 rounded-lg bg-bg-surface-hover/20">
                  <div className="text-[10px] text-txt-muted font-bold uppercase">Suất gốc cả nước (S₀)</div>
                  <div className="text-sm font-black text-txt-primary mt-1">
                    {formatMoney(selectedItem.s0 * 1000)} <span className="text-[10px] font-semibold">đ/{selectedCategory.unit.split('/')[0].trim()}</span>
                  </div>
                  <p className="text-[10px] text-txt-muted mt-1 leading-relaxed">
                    Chưa nhân hệ số vùng.
                  </p>
                </div>

                <div className="border border-border p-3 rounded-lg bg-bg-surface-hover/20">
                  <div className="text-[10px] text-txt-muted font-bold uppercase">Hệ số điều chỉnh vùng (Kkv)</div>
                  <div className="text-sm font-black text-indigo-600 mt-1">
                    {kkv.toFixed(3)}
                  </div>
                  <p className="text-[10px] text-txt-muted mt-1 leading-relaxed text-emerald-600 dark:text-emerald-400 font-semibold">
                    Áp dụng cho: {
                      selectedItem.sectorType === 'nhao' ? 'Nhà ở' :
                      selectedItem.sectorType === 'giaoduc' ? 'Giáo dục' :
                      selectedItem.sectorType === 'yte' ? 'Y tế' :
                      selectedItem.sectorType === 'thethao' ? 'Thể thao' :
                      selectedItem.sectorType === 'cn_nangluong_duongday' ? 'Đường dây truyền tải' :
                      selectedItem.sectorType === 'cn_nangluong_tba' ? 'Nhà máy điện, TBA' :
                      selectedItem.sectorType === 'cn_nhaxuong_kho' ? 'Nhà xưởng, kho bãi' :
                      selectedItem.sectorType === 'ht_capnuoc' ? 'Hạ tầng cấp nước' :
                      selectedItem.sectorType === 'ht_nuocthai' ? 'Hạ tầng nước thải' :
                      selectedItem.sectorType === 'ht_kcn_kdt' ? 'Hạ tầng KCN/KĐT' :
                      selectedItem.sectorType === 'ht_rac_thai' ? 'Hạ tầng rác thải' :
                      selectedItem.sectorType === 'gt_duong_nhua' ? 'Đường bộ nhựa, cao tốc' :
                      selectedItem.sectorType === 'gt_cau' ? 'Cầu đường bộ' : 'Kênh mương thủy lợi'
                    }.
                  </p>
                </div>

                <div className="border border-indigo-200 dark:border-indigo-900 bg-indigo-500/5 p-3 rounded-lg">
                  <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">Suất điều chỉnh (S)</div>
                  <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1">
                    {formatMoney(Math.round(adjustedS0 * 1000))} <span className="text-[10px] font-semibold">đ/{selectedCategory.unit.split('/')[0].trim()}</span>
                  </div>
                  <p className="text-[10px] text-txt-muted mt-1 leading-relaxed">
                    Đã nhân hệ số vùng {selectedProvinceName}.
                  </p>
                </div>

              </div>
            </div>

            {/* Sơ bộ Tổng mức đầu tư dự kiến */}
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 text-txt-primary space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-wider text-emerald-400">SƠ BỘ TỔNG MỨC ĐẦU TƯ DỰ KIẾN</h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    Giá trị tính toán tham khảo dựa trên quy mô nhập thực tế
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-baseline gap-2 md:gap-4">
                <span className="text-2xl font-black text-emerald-400">
                  {formatMoney(Math.round(totalCost * 1000))} VNĐ
                </span>
                <span className="text-xs text-zinc-400 font-semibold">
                  (~ {formatMoney(Math.round((totalCost * 1000) / 1000000000))} tỷ đồng)
                </span>
              </div>

              {parseFormattedNumber(quantity) <= 0 && (
                <p className="text-[11px] text-txt-muted leading-normal font-semibold">
                  * Nhập quy mô dự án thực tế ở cột bên trái để ước tính tổng vốn đầu tư.
                </p>
              )}

              {/* Thông tin thuyết minh chi tiết suất vốn đầu tư */}
              <div className="pt-2 border-t border-border/80 space-y-2 text-xs text-zinc-300">
                <div className="font-black text-emerald-400 uppercase text-[10px] tracking-wider">Thành phần chi phí bao gồm:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>Chi phí xây dựng (kết cấu, hoàn thiện phần xây thô công trình)</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>Chi phí mua sắm lắp đặt thiết bị dây chuyền công nghệ & kỹ thuật công trình</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>Chi phí quản lý dự án, tư vấn đầu tư và các chi phí khác theo tỷ lệ định mức</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>Thuế giá trị gia tăng (VAT)</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-txt-muted leading-relaxed pt-2 border-t border-border/50">
                  * <strong>Lưu ý:</strong> Suất vốn đầu tư xây dựng **chưa bao gồm** chi phí bồi thường giải phóng mặt bằng, tái định cư; lãi vay trong thời gian xây dựng; và vốn lưu động ban đầu.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
      
    </div>
  );
};

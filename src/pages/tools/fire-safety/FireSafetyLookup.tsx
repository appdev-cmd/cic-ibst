import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Flame, 
  Search, 
  BookOpen, 
  Calendar, 
  Info, 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  RotateCcw, 
  HelpCircle,
  Shield,
  FileCheck,
  Calculator,
  ExternalLink
} from 'lucide-react';

// ==========================================
// HELPERS ĐỊNH DẠNG SỐ (Hàng nghìn dùng '.', thập phân dùng ',')
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

// ==========================================
// DỮ LIỆU TĨNH TRA CỨU TIỂU CHUẨN & QUY ĐỊNH PCCC
// ==========================================

const TCVN7336_DATA = {
  "nhom_map": {
    "F1.1": { "nhom": "1", "mo_ta": "Bệnh viện, trường mầm non, nhà dưỡng lão – Phụ lục A Nhóm 1" },
    "F1.2": { "nhom": "1", "mo_ta": "Khách sạn, nhà nghỉ, nhà khách – Phụ lục A Nhóm 1" },
    "F1.3": { "nhom": "1", "mo_ta": "Nhà chung cư, ký túc xá – Phụ lục A Nhóm 1" },
    "F2.1": { "nhom": "2", "mo_ta": "Nhà hát, rạp chiếu phim, trung tâm hội nghị – Phụ lục A Nhóm 2" },
    "F2.2": { "nhom": "2", "mo_ta": "Karaoke, vũ trường, quán bar – Phụ lục A Nhóm 2" },
    "F2.3": { "nhom": "1", "mo_ta": "Nhà thi đấu, nhà tập luyện thể thao – Phụ lục A Nhóm 1" },
    "F2.4": { "nhom": "1", "mo_ta": "Bảo tàng, thư viện, nhà triển lãm – Phụ lục A Nhóm 1" },
    "F3.1": { "nhom": "2", "mo_ta": "Chợ, trung tâm thương mại, siêu thị, cửa hàng – Phụ lục A Nhóm 2" },
    "F3.2": { "nhom": "1", "mo_ta": "Nhà hàng, cơ sở ăn uống, giải khát – Phụ lục A Nhóm 1" },
    "F3.3": { "nhom": "1", "mo_ta": "Cơ sở dịch vụ công cộng, thẩm mỹ – Phụ lục A Nhóm 1" },
    "F3.4": { "nhom": "1", "mo_ta": "Nhà ga hành khách, nhà chờ bến xe, bến tàu – Phụ lục A Nhóm 1" },
    "F3.5": { "nhom": "2", "mo_ta": "Nhà để xe, nhà đăng kiểm, bảo dưỡng phương tiện – Phụ lục A Nhóm 2" },
    "F3.6": { "nhom": "1", "mo_ta": "Cơ sở giải trí, vui chơi, khu spa – Phụ lục A Nhóm 1" },
    "F4.1": { "nhom": "1", "mo_ta": "Trường học TH/THCS/THPT, ĐH, CĐ – Phụ lục A Nhóm 1" },
    "F4.2": { "nhom": "1", "mo_ta": "Trường dạy nghề, cơ sở đào tạo nghề – Phụ lục A Nhóm 1" },
    "F4.3": { "nhom": "1", "mo_ta": "Nhà văn phòng, làm việc – Phụ lục A Nhóm 1" },
    "F4.4": { "nhom": "1", "mo_ta": "Cơ sở nghiên cứu khoa học – Phụ lục A Nhóm 1" },
    "F5.1": { "nhom": "2+", "mo_ta": "Nhà sản xuất – Nhóm 2 (chế tạo máy, điện tử), 3 (dệt, nhựa), 4.1/4.2 (sơn, hóa chất) – xác định theo Phụ lục A + tải trọng cháy" },
    "F5.2": { "nhom": "2+", "mo_ta": "Nhà kho, nhà để xe – Nhóm 2 (kho vật liệu thông thường), 5 (vật liệu dễ cháy), 6 (cao su/nhựa), 7 (sơn/dầu)" },
    "F5.3": { "nhom": "2+", "mo_ta": "Nhà sản xuất/kho đặc biệt – cần xác định cụ thể theo Phụ lục A, TCVN 7336:2021" }
  } as Record<string, { nhom: string; mo_ta: string }>,
  "bang1": [
    { "nhom": "1", "n_cd": "0,08", "n_ll": 10, "n_dt": 60, "n_tg": 30, "b_cd": null, "b_ll": null, "b_dt": null, "b_tg": null, "kc": 4 },
    { "nhom": "2", "n_cd": "0,12", "n_ll": 30, "n_dt": 120, "n_tg": 60, "b_cd": "0,08", "b_ll": 20, "b_dt": 60, "b_tg": 60, "kc": 4 },
    { "nhom": "3", "n_cd": "0,24", "n_ll": 60, "n_dt": 120, "n_tg": 60, "b_cd": "0,12", "b_ll": 30, "b_dt": 60, "b_tg": 60, "kc": 4 },
    { "nhom": "4.1", "n_cd": "0,30", "n_ll": 110, "n_dt": 180, "n_tg": 60, "b_cd": "0,15", "b_ll": 55, "b_dt": 60, "b_tg": 60, "kc": 4 },
    { "nhom": "4.2", "n_cd": null, "n_ll": null, "n_dt": null, "n_tg": null, "b_cd": "0,17", "b_ll": 65, "b_dt": 180, "b_tg": 60, "kc": 3 }
  ] as Array<{ nhom: string; n_cd: string | null; n_ll: number | null; n_dt: number | null; n_tg: number | null; b_cd: string | null; b_ll: number | null; b_dt: number | null; b_tg: number | null; kc: number }>
};

const TRADEOFF_DATA = [
  {
    "id": "to_t4_3",
    "nhom_ap_dung": "all",
    "trigger": "has_cct",
    "ten": "Thay thế hệ thống báo cháy bằng CC tự động",
    "loai": "thay_the",
    "dieu_kien": "Lắp đặt hệ thống chữa cháy tự động (Sprinkler hoặc Drencher) trong các phòng vốn chỉ yêu cầu hệ thống báo cháy tự động",
    "ket_qua": "Hệ thống CC tự động có thể thay thế toàn bộ hệ thống báo cháy tự động riêng biệt cho phòng đó",
    "luu_y": "Khi áp dụng, cường độ phun vẫn phải đảm bảo theo quy định (Bảng 1 TCVN 7336), nhưng không bắt buộc tuân theo lưu lượng và thời gian phun tối thiểu của Bảng 1",
    "can_cu": "Điều 4.3, TCVN 7336:2021"
  },
  {
    "id": "to_q10_1_5_12",
    "nhom_ap_dung": ["F1.3"],
    "trigger": "nhom_and_cc",
    "cc_max": 100,
    "ten": "Rút gọn phạm vi lắp Sprinkler trong chung cư",
    "loai": "giam_pham_vi",
    "dieu_kien": "Nhà chung cư (F1.3) có chiều cao PCCC ≤ 100 m",
    "ket_qua": "Cho phép bố trí đầu phun Sprinkler chỉ tại khu vực sảnh, hành lang chung và đường thoát nạn — không bắt buộc lắp đặt bên trong từng căn hộ",
    "luu_y": "Vẫn phải trang bị hệ thống báo cháy tự động trong từng căn hộ (đầu báo khói/nhiệt)",
    "can_cu": "Điều 1.5.12, QCVN 10:2025/BCA (TT 103/2025/TT-BCA)"
  },
  {
    "id": "to_q10_1_5_6",
    "nhom_ap_dung": ["F5.1", "F5.2", "F5.3"],
    "trigger": "nhom_and_cc",
    "cc_max": 9.9,
    "ten": "Miễn báo cháy tự động cho nhà sản xuất thấp có sprinkler",
    "loai": "mien_giam",
    "dieu_kien": "Nhà sản xuất nhóm F5 có chiều cao PCCC < 10 m và đã lắp đặt hệ thống chữa cháy tự động",
    "ket_qua": "Được miễn yêu cầu trang bị thiết bị báo cháy tự động riêng biệt (đầu báo khói, nhiệt, lửa độc lập)",
    "luu_y": "Hệ thống CC tự động phải thực hiện đồng thời chức năng báo cháy theo Điều 4.1 TCVN 7336:2021. Chỉ áp dụng khi cc < 10 m",
    "can_cu": "Điều 1.5.6, QCVN 10:2025/BCA"
  }
];

const BAOHIEM_DATA: Record<string, { ten: string; bat_buoc: string; nguong_txt: string; phi: string | null; khau_tru: string | null; ghi_chu: string | null; min_tang?: number; min_dt?: number }> = {
  "F1.1": { "ten": "Bệnh viện, cơ sở y tế có giường bệnh, trường mầm non", "bat_buoc": "yes", "nguong_txt": "Toàn bộ, không phân biệt quy mô", "phi": "0,07%/năm", "khau_tru": "1.000.000 đ", "ghi_chu": null },
  "F1.2": { "ten": "Khách sạn, nhà nghỉ, cơ sở lưu trú", "bat_buoc": "yes_if", "min_tang": 5, "nguong_txt": "Từ 5 tầng trở lên hoặc từ 10 phòng lưu trú (kiểm tra thực tế)", "phi": "0,06%/năm", "khau_tru": "500.000 đ", "ghi_chu": "Khách sạn dưới 5 tầng và dưới 10 phòng: không bắt buộc" },
  "F1.3": { "ten": "Nhà chung cư, nhà ở tập thể nhiều hộ", "bat_buoc": "yes_if", "min_tang": 5, "min_dt": 1000, "nguong_txt": "Từ 5 tầng hoặc tổng diện tích sàn ≥ 1.000m²", "phi": "0,06%/năm", "khau_tru": "500.000 đ", "ghi_chu": "Nhà chung cư dưới 5 tầng và dưới 1.000m² sàn: không bắt buộc" },
  "F2.1": { "ten": "Nhà hát, rạp chiếu phim, trung tâm hội nghị, biểu diễn", "bat_buoc": "yes", "nguong_txt": "Toàn bộ, không phân biệt quy mô", "phi": "0,08%/năm", "khau_tru": "1.000.000 đ", "ghi_chu": null },
  "F2.2": { "ten": "Karaoke, vũ trường, bar, pub — dịch vụ nguy cơ cháy nổ cao", "bat_buoc": "yes", "nguong_txt": "Toàn bộ, không phân biệt quy mô", "phi": "0,08%/năm", "khau_tru": "1.000.000 đ", "ghi_chu": null },
  "F2.3": { "ten": "Nhà thi đấu thể thao, sân vận động", "bat_buoc": "check", "nguong_txt": "Đối chiếu Phụ lục VII — tùy quy mô và mục đích khai thác", "phi": null, "khau_tru": null, "ghi_chu": "Sân vận động có khán đài ≥ 500 chỗ ngồi thường thuộc diện bắt buộc" },
  "F2.4": { "ten": "Thư viện, bảo tàng, nhà triển lãm", "bat_buoc": "check", "nguong_txt": "Đối chiếu Phụ lục VII — thường không bắt buộc", "phi": null, "khau_tru": null, "ghi_chu": null },
  "F3.1": { "ten": "Nhà ga, bến tàu, sân bay, chợ", "bat_buoc": "yes", "nguong_txt": "Toàn bộ, không phân biệt quy mô", "phi": "0,07%/năm", "khau_tru": "1.000.000 đ", "ghi_chu": null },
  "F3.2": { "ten": "Siêu thị, trung tâm thương mại, cửa hàng bách hóa", "bat_buoc": "yes", "nguong_txt": "Toàn bộ, không phân biệt quy mô", "phi": "0,09%/năm", "khau_tru": "1.000.000 đ", "ghi_chu": null },
  "F3.3": { "ten": "Nhà hàng, quán cà phê, cơ sở ăn uống", "bat_buoc": "check", "nguong_txt": "Thường không bắt buộc trừ khi kết hợp dịch vụ nguy cơ cao", "phi": null, "khau_tru": null, "ghi_chu": "Nếu kết hợp bar/karaoke: xem F2.2" },
  "F3.4": { "ten": "Văn phòng, tòa nhà cho thuê, tòa nhà hành chính", "bat_buoc": "yes_if", "min_tang": 5, "min_dt": 1000, "nguong_txt": "Từ 5 tầng hoặc tổng diện tích sàn ≥ 1.000m²", "phi": "0,05%/năm", "khau_tru": "500.000 đ", "ghi_chu": "Văn phòng dưới 5 tầng và dưới 1.000m²: không bắt buộc" },
  "F3.5": { "ten": "Gara ô tô, bãi đỗ xe nhiều tầng/ngầm", "bat_buoc": "yes", "nguong_txt": "Gara ≥ 20 xe; bãi đỗ xe ngầm/nhiều tầng toàn bộ", "phi": "0,08%/năm", "khau_tru": "1.000.000 đ", "ghi_chu": null },
  "F3.6": { "ten": "Trường học, cơ sở giáo dục (cấp 1–đại học)", "bat_buoc": "yes", "nguong_txt": "Toàn bộ, không phân biệt quy mô", "phi": "0,07%/năm", "khau_tru": "1.000.000 đ", "ghi_chu": null },
  "F4.1": { "ten": "Nhà ở nhiều hộ cho thuê, nhà trọ tư nhân", "bat_buoc": "yes_if", "min_tang": 5, "min_dt": 1000, "nguong_txt": "Từ 5 tầng hoặc từ 1.000m² sàn", "phi": "0,05%/năm", "khau_tru": "500.000 đ", "ghi_chu": "Nhà trọ dưới 5 tầng và dưới 1.000m²: không bắt buộc" },
  "F4.2": { "ten": "Cơ sở giam giữ (trại tạm giam, nhà tạm giữ)", "bat_buoc": "no", "nguong_txt": "Miễn — cơ sở thuộc phạm vi quản lý Bộ Công an/Bộ Quốc phòng", "phi": null, "khau_tru": null, "ghi_chu": "Theo Điều 35 khoản 1, NĐ 105/2025" },
  "F4.3": { "ten": "Nhà ở riêng lẻ (biệt thự, nhà liền kề, nhà phố)", "bat_buoc": "no", "nguong_txt": "Không bắt buộc — khuyến khích mua bảo hiểm tự nguyện", "phi": null, "khau_tru": null, "ghi_chu": null },
  "F4.4": { "ten": "Nhà ở tạm, lán trại tạm thời", "bat_buoc": "no", "nguong_txt": "Không bắt buộc", "phi": null, "khau_tru": null, "ghi_chu": null },
  "F5.1": { "ten": "Nhà sản xuất, xưởng công nghiệp", "bat_buoc": "yes_if", "min_dt": 500, "nguong_txt": "Diện tích sàn từ 500m² trở lên", "phi": "0,10–0,40%/năm", "khau_tru": "1.000.000–5.000.000 đ", "ghi_chu": "Tỷ lệ phí tùy mức độ nguy hiểm cháy nổ của ngành nghề sản xuất" },
  "F5.2": { "ten": "Kho hàng hóa", "bat_buoc": "yes_if", "min_dt": 500, "nguong_txt": "Diện tích sàn từ 500m² trở lên", "phi": "0,10–0,45%/năm", "khau_tru": "2.000.000–5.000.000 đ", "ghi_chu": "Tỷ lệ phí tùy tính dễ cháy của hàng hóa: thông thường 0,10% — dễ cháy 0,25% — hóa chất/xăng dầu 0,45%" },
  "F5.3": { "ten": "Kho chứa xăng dầu, khí hóa lỏng (LPG/LNG), hóa chất nguy hiểm", "bat_buoc": "yes", "nguong_txt": "Toàn bộ, không phân biệt quy mô", "phi": "0,15–0,45%/năm", "khau_tru": "5.000.000 đ", "ghi_chu": null }
};

const QCVN10_META = [
  { "id": "q10_F1_1a", "nhom": ["F1.1"], "loai": "Nhà trẻ, trường mẫu giáo, trường mầm non", "bao_chay_dk": "≥100 cháu hoặc diện tích sàn ≥300 m²", "bao_chay_dl": "Cho phép thiết bị báo cháy độc lập khi diện tích <500 m²", "chua_chay_dk": "≥4 tầng (không tính tầng kỹ thuật trên cùng) VÀ diện tích sàn ≥5.000 m²", "can_cu": "Bảng A.1 mục 4, QCVN 10:2025/BCA (TT 103/2025/TT-BCA)" },
  { "id": "q10_F1_1b", "nhom": ["F1.1"], "loai": "Bệnh viện, phòng khám, cơ sở y tế", "bao_chay_dk": "≥3 tầng hoặc diện tích sàn ≥300 m²", "bao_chay_dl": null, "chua_chay_dk": "Chiều cao PCCC ≥25 m hoặc diện tích sàn ≥2.000 m²", "can_cu": "Bảng A.1 mục 6, QCVN 10:2025/BCA" },
  { "id": "q10_F1_1c", "nhom": ["F1.1"], "loai": "Nhà dưỡng lão", "bao_chay_dk": "Mọi trường hợp (không phụ thuộc diện tích)", "bao_chay_dl": "Có thể dùng thiết bị báo cháy độc lập khi <3 tầng và diện tích <300 m²", "chua_chay_dk": "Diện tích sàn ≥500 m²", "can_cu": "Bảng A.1 mục 7, QCVN 10:2025/BCA" },
  { "id": "q10_F1_3", "nhom": ["F1.3"], "loai": "Chung cư, nhà ở tập thể, ký túc xá", "bao_chay_dk": "≥5 tầng hoặc diện tích sàn ≥700 m²", "bao_chay_dl": "Có thể dùng thiết bị báo cháy độc lập khi <5 tầng và diện tích <1.500 m²", "chua_chay_dk": "Chiều cao PCCC ≥30 m", "can_cu": "Bảng A.1 mục 3, QCVN 10:2025/BCA" },
  { "id": "q10_F2_1", "nhom": ["F2.1"], "loai": "Nhà hát, rạp chiếu phim, rạp xiếc", "bao_chay_dk": "Diện tích sàn ≥500 m² hoặc ≥200 chỗ ngồi", "bao_chay_dl": "Có thể dùng thiết bị báo cháy độc lập khi diện tích <1.500 m²", "chua_chay_dk": "Chiều cao PCCC ≥25 m", "can_cu": "Bảng A.1 mục 9, QCVN 10:2025/BCA" },
  { "id": "q10_F2_2", "nhom": ["F2.2"], "loai": "Karaoke, vũ trường", "bao_chay_dk": "Mọi trường hợp (không phụ thuộc diện tích)", "bao_chay_dl": null, "chua_chay_dk": "Tầng hầm: mọi DT | Từ 3 tầng trở lên: mọi DT | 1–2 tầng trên mặt đất: ≥500 m²", "can_cu": "Bảng A.1 mục 13, QCVN 10:2025/BCA" },
  { "id": "q10_F2_3", "nhom": ["F2.3", "F3.6"], "loai": "Nhà thi đấu, nhà tập luyện, khu liên hợp thể thao", "bao_chay_dk": "Diện tích sàn ≥500 m² hoặc khán đài ≥200 chỗ", "bao_chay_dl": "Có thể dùng thiết bị báo cháy độc lập khi diện tích <1.500 m²", "chua_chay_dk": "Chiều cao PCCC ≥25 m", "can_cu": "Bảng A.1 mục 8, QCVN 10:2025/BCA" },
  { "id": "q10_F3_1", "nhom": ["F3.1"], "loai": "Chợ, trung tâm thương mại, siêu thị", "bao_chay_dk": "Mọi trường hợp (không phụ thuộc diện tích)", "bao_chay_dl": null, "chua_chay_dk": "Tầng hầm: ≥200 m² | Từ 3 tầng trở lên: mọi DT | 1–2 tầng trên mặt đất: ≥3.500 m²", "can_cu": "Bảng A.1 mục 15, QCVN 10:2025/BCA" },
  { "id": "q10_F3_2", "nhom": ["F3.2"], "loai": "Nhà hàng, cơ sở ăn uống, nhà ăn", "bao_chay_dk": "Diện tích sàn ≥500 m²", "bao_chay_dl": "Có thể dùng thiết bị báo cháy độc lập khi <3 tầng và diện tích <1.500 m²", "chua_chay_dk": "Chiều cao PCCC ≥25 m hoặc diện tích sàn ≥5.000 m²", "can_cu": "Bảng A.1 mục 16, QCVN 10:2025/BCA" },
  { "id": "q10_F4_12", "nhom": ["F4.1", "F4.2"], "loai": "Trường học các cấp, đại học, cao đẳng", "bao_chay_dk": "≥5 tầng hoặc diện tích sàn ≥1.500 m²", "bao_chay_dl": "Có thể dùng thiết bị báo cháy độc lập khi diện tích <700 m²", "chua_chay_dk": "Chiều cao PCCC ≥25 m", "can_cu": "Bảng A.1 mục 5, QCVN 10:2025/BCA" }
];

const _Q10_NHOM_MAP: Record<string, string[]> = {
  'F1.1': ['q10_F1_1a', 'q10_F1_1b', 'q10_F1_1c'],
  'F1.3': ['q10_F1_3'],
  'F2.1': ['q10_F2_1'],
  'F2.2': ['q10_F2_2'],
  'F2.3': ['q10_F2_3'],
  'F3.1': ['q10_F3_1'],
  'F3.2': ['q10_F3_2'],
  'F3.6': ['q10_F2_3'],
  'F4.1': ['q10_F4_12'],
  'F4.2': ['q10_F4_12']
};

const QCVN10_CHECKS: Record<string, (inp: any) => { bc: string; bc_dl: boolean; cct: string; note: string | null }> = {
  q10_F1_1a: function(inp){
    var dt=inp.dien_tich, sn=inp.so_nguoi, st=inp.so_tang;
    var bc=(sn>=100||dt>=300);
    return {bc:bc?'bat_buoc':'khong', bc_dl:!bc&&dt<500, cct:(st>=4&&dt>=5000)?'bat_buoc':'khong', note:null};
  },
  q10_F1_1b: function(inp){
    var st=inp.so_tang, dt=inp.dien_tich, cc=inp.chieu_cao;
    var bc=(st>=3||dt>=300);
    return {bc:bc?'bat_buoc':'khong', bc_dl:false, cct:(cc>=25||dt>=2000)?'bat_buoc':'khong', note:null};
  },
  q10_F1_1c: function(inp){
    var st=inp.so_tang, dt=inp.dien_tich;
    return {bc:'bat_buoc', bc_dl:(st<3&&dt<300), cct:dt>=500?'bat_buoc':'khong', note:null};
  },
  q10_F1_3: function(inp){
    var st=inp.so_tang, dt=inp.dien_tich, cc=inp.chieu_cao;
    var bc=(st>=5||dt>=700);
    return {bc:bc?'bat_buoc':'khong', bc_dl:!bc&&st<5&&dt<1500, cct:cc>=30?'bat_buoc':'khong', note:null};
  },
  q10_F2_1: function(inp){
    var dt=inp.dien_tich, sn=inp.so_nguoi, cc=inp.chieu_cao;
    var bc=(dt>=500||sn>=200);
    return {bc:bc?'bat_buoc':'khong', bc_dl:!bc&&dt<1500, cct:cc>=25?'bat_buoc':'khong', note:null};
  },
  q10_F2_2: function(inp){
    var st=inp.so_tang, dt=inp.dien_tich, ham=inp.tang_ham>0;
    var cct=ham||(st>=3)||(st<=2&&dt>=500);
    var note=ham?'Có tầng hầm: CC tự động bắt buộc không phụ thuộc diện tích':(st>=3?'≥3 tầng: CC tự động bắt buộc':'1-2 tầng trên mặt đất: CC tự động khi ≥500 m²');
    return {bc:'bat_buoc', bc_dl:false, cct:cct?'bat_buoc':'khong', note:note};
  },
  q10_F2_3: function(inp){
    var dt=inp.dien_tich, sn=inp.so_nguoi, cc=inp.chieu_cao;
    var bc=(dt>=500||sn>=200);
    return {bc:bc?'bat_buoc':'khong', bc_dl:!bc&&dt<1500, cct:cc>=25?'bat_buoc':'khong', note:null};
  },
  q10_F3_1: function(inp){
    var st=inp.so_tang, dt=inp.dien_tich, ham=inp.tang_ham>0;
    var cct=ham?(dt>=200):(st>=3?true:dt>=3500);
    var note=ham?'Tầng hầm: CC tự động khi ≥200 m²':(st>=3?'≥3 tầng: Bắt buộc (mọi diện tích)':'1-2 tầng: CC tự động khi ≥3.500 m²');
    return {bc:'bat_buoc', bc_dl:false, cct:cct?'bat_buoc':'khong', note:note};
  },
  q10_F3_2: function(inp){
    var st=inp.so_tang, dt=inp.dien_tich, cc=inp.chieu_cao;
    var bc=dt>=500;
    return {bc:bc?'bat_buoc':'khong', bc_dl:!bc&&st<3&&dt<1500, cct:(cc>=25||dt>=5000)?'bat_buoc':'khong', note:null};
  },
  q10_F4_12: function(inp){
    var st=inp.so_tang, dt=inp.dien_tich, cc=inp.chieu_cao;
    var bc=(st>=5||dt>=1500);
    return {bc:bc?'bat_buoc':'khong', bc_dl:!bc&&dt<700, cct:cc>=25?'bat_buoc':'khong', note:null};
  }
};

const CHECKS: Record<string, (inp: any) => { type: 'ok' | 'info' | 'warn' | 'req'; msg: string } | null> = {
  r_loi_ra_so: function(inp){
    var warns=[];
    if(inp.so_nguoi>=50) warns.push('Gian phòng có >=50 người -> tối thiểu 2 lối ra thoát nạn');
    if(inp.tang_ham>0 && inp.so_nguoi>15) warns.push('Gian phòng tầng hầm có >15 người -> tối thiểu 2 lối ra [SĐ1]');
    if(inp.dien_tich>1000 && inp.so_tang>=2) warns.push('Tầng >=2 diện tích >1000 m2 hoặc >50 người -> tối thiểu 2 lối ra');
    if(warns.length) return {type:'req', msg: warns.join('; ')};
    if(inp.so_nguoi>=25) return {type:'warn', msg:'25-49 người/tầng - kiểm tra điều kiện 1 lối ra (3.2.6)'};
    return {type:'ok', msg:'Chưa vượt ngưỡng bắt buộc 2 lối ra thoát nạn'};
  },
  r_ban_thang: function(inp){
    var cc=inp.chieu_cao, nn=inp.so_nguoi, nhom=inp.nhom, p=nhom.substring(0,2), msgs=[];
    if(nhom==='F1.1'){
      msgs.push(nn>15 ? 'F1.1 >15 người/tầng -> Bản thang >= 1,2 m' : 'F1.1 <=15 người/tầng -> Bản thang >= 1,0 m [SĐ1]');
    } else if(['F1.2','F1.3'].indexOf(nhom)>=0 || p==='F2' || p==='F3' || p==='F4'){
      if(cc>28) msgs.push('PCCC >28 m -> Bản thang >= 1,2 m');
      else if(cc<=15 && nn<=15) msgs.push('PCCC <=15 m và <=15 người/tầng -> Bản thang >= 0,7 m [SĐ1]');
      else msgs.push('Bản thang >= 0,9 m (trường hợp còn lại)');
    }
    if(msgs.length) return {type:'info', msg: msgs.join('; ')};
    return {type:'info', msg:'Chiều rộng bản thang: xem 3.4.1 theo nhóm nhà và chiều cao PCCC'};
  },
  r_hanh_lang: function(inp){
    var cc=inp.chieu_cao, nhom=inp.nhom, p=nhom.substring(0,2);
    var nhomF4 = (nhom==='F4.1');
    var isF123 = (nhom==='F1.1'||nhom==='F1.2'||nhom==='F1.3');
    var isF23  = (p==='F2'||p==='F3');
    if(cc>28 && (isF123||isF23||nhomF4))
      return {type:'info', msg:'PCCC >28 m -> Hành lang >= 1,2 m'};
    if(p==='F1'||p==='F2'||p==='F3'||p==='F4')
      return {type:'info', msg:'Nhóm F1-F4 (PCCC <=28 m) -> Hành lang >= 1,0 m'};
    return {type:'info', msg:'Chiều rộng hành lang tối thiểu 0,9 m (trường hợp còn lại)'};
  },
  r_buong_thang: function(inp){
    if(inp.chieu_cao>28)
      return {type:'req', msg:'PCCC >28 m -> Bắt buộc dùng buồng thang không nhiễm khói (H1 hoặc H2 hoặc H3)'};
    return {type:'info', msg:'PCCC <=28 m - có thể dùng buồng thang thông thường (L1, L2, L3)'};
  },
  r_tang_lanh_nan: function(inp){
    if(inp.chieu_cao>100)
      return {type:'req', msg:'PCCC >100 m -> Cần bố trí tầng lánh nạn (gian lánh nạn)'};
    return {type:'ok', msg:'PCCC <=100 m - không bắt buộc tầng lánh nạn'};
  },
  r_ngan_cach_f13: function(inp){
    if(inp.nhom!=='F1.3') return null;
    var bac=inp.bac;
    if(bac==='Bậc I'||bac==='Bậc II'||bac==='Bậc III')
      return {type:'req', msg:'Nhà F1.3, bậc I-III -> Ngăn cách GHCL >= EI 45'};
    if(bac==='Bậc IV')
      return {type:'req', msg:'Nhà F1.3, bậc IV -> Ngăn cách GHCL >= EI 15'};
    return {type:'req', msg:'Nhà F1.3 -> Phải ngăn cách với các công năng khác (GHCL theo bậc chịu lửa - điều 4.5)'};
  },
  r_dai_ngan_chay: function(inp){
    if(inp.cctn==='co')
      return {type:'ok', msg:'Có chữa cháy tự động -> Được miễn dải ngăn cháy phương đứng (4.32.2 [SĐ1])'};
    return {type:'req', msg:'Không có CCTN -> Mặt ngoài nhà phải có dải ngăn cháy phương đứng >= 1,2 m (bậc I,II) hoặc >= 0,9 m (bậc III)'};
  },
  r_dai_ngang: function(inp){
    if(inp.cctn==='co')
      return {type:'ok', msg:'Có chữa cháy tự động -> Được miễn dải ngăn cháy ngang (4.33.4 [SĐ1])'};
    if(inp.so_tang<=3 || inp.chieu_cao<15)
      return {type:'ok', msg:'Nhà <=3 tầng hoặc PCCC <15 m -> Được miễn dải ngăn cháy ngang (4.33.4 [SĐ1])'};
    return {type:'req', msg:'Mặt ngoài nhà phải có dải ngăn cháy ngang >= 1,0 m (bậc I,II) hoặc >= 0,8 m (bậc III) giữa các khoang cháy'};
  },
  r_hong_nuoc: function(inp){
    var nhom=inp.nhom, p=nhom.substring(0,2), cc=inp.chieu_cao, st=inp.so_tang, dt=inp.dien_tich;
    var warns=[];
    if(nhom==='F1.3' && st>6) warns.push('F1.3 cao >6 tầng');
    if((nhom==='F1.1'||nhom==='F1.2') && (st>2||dt>500)) warns.push('F1.1/F1.2 cao >2 tầng hoặc DT >500 m2');
    if((p==='F2'||p==='F3'||p==='F4') && (st>2||(inp.tang_ham>0&&dt>500))) warns.push('F2/F3/F4 cao >2 tầng hoặc tầng hầm DT >500 m2');
    if(p==='F5' && dt>300) warns.push('F5 hạng A,B,C DT >300 m2/tầng');
    if(cc>15) warns.push('PCCC >15 m');
    if(warns.length) return {type:'req', msg:'Bắt buộc trang bị hệ thống họng nước chữa cháy trong nhà: '+warns.join('; ')};
    return {type:'ok', msg:'Chưa xác định yêu cầu họng nước trong nhà từ thông tin đã nhập - kiểm tra đầy đủ Bảng 11'};
  },
  r_cctn: function(inp){
    var nhom=inp.nhom, p=nhom.substring(0,2), cc=inp.chieu_cao, dt=inp.dien_tich;
    var warns=[];
    if(cc>28 && (p==='F1'||p==='F2'||p==='F3'||p==='F4')) warns.push('PCCC >28 m, nhóm '+p);
    if((p==='F2'||p==='F3') && dt>3500) warns.push('F2/F3 DT >3500 m2');
    if(warns.length){
      if(inp.cctn==='co')   return {type:'ok',   msg:'Đã có CCTN - đáp ứng yêu cầu ('+warns.join('; ')+')'};
      if(inp.cctn==='khong') return {type:'req',  msg:'BẮT BUỘC chữa cháy tự động: '+warns.join('; ')+'. Hiện chưa có!'};
      return                        {type:'warn', msg:'Có thể bắt buộc CCTN: '+warns.join('; ')+' - cần xác nhận'};
    }
    if(inp.cctn==='co') return {type:'ok', msg:'Đã có CCTN (không bắt buộc theo thông tin đã nhập)'};
    return {type:'info', msg:'Chưa xác định bắt buộc CCTN - kiểm tra đầy đủ Bảng 12'};
  },
  r_thang_may_cc: function(inp){
    if(inp.chieu_cao>28)
      return {type:'req', msg:'PCCC >28 m -> BẮT BUỘC trang bị thang máy chữa cháy'};
    return {type:'ok', msg:'PCCC <=28 m - không bắt buộc thang máy chữa cháy'};
  },
  r_bai_do_xe: function(inp){
    var cc=inp.chieu_cao, p=inp.nhom.substring(0,2);
    if(cc<=15 && (p==='F1'||p==='F2'||p==='F3'||p==='F4'))
      return {type:'info', msg:'F1-F4, PCCC <=15 m - Chỉ cần đường tiếp cận đến điểm bất kỳ <=60 m'};
    if(cc>15)
      return {type:'req', msg:'PCCC >15 m -> Cần bố trí bãi đỗ xe chữa cháy theo yêu cầu 6.2 (kích thước theo Bảng 14)'};
    return {type:'info', msg:'Kiểm tra yêu cầu đường/bãi đỗ xe chữa cháy theo 6.2 và Bảng 14'};
  },
  r_loi_vao_cao: function(inp){
    if(inp.chieu_cao>15)
      return {type:'req', msg:'Cần bố trí lối vào từ trên cao: cứ mỗi 20 m chiều dài nhà >= 1 lỗ cửa (>=0,75 m x 1,5 m)'};
    return {type:'info', msg:'Kiểm tra yêu cầu lối vào từ trên cao theo 6.3 nếu có bãi đỗ xe chữa cháy'};
  },
  r_khe_hor: function(inp){
    if(inp.chieu_cao>75)
      return {type:'req', msg:'PCCC >75 m -> Áp dụng quy định về khe hở thông tầng (6.12 [SĐ1], ngưỡng giảm từ 100 m xuống 75 m)'};
    return {type:'ok', msg:'PCCC <=75 m - không áp dụng quy định khe hở thông tầng'};
  },
  r_hut_xa_khoi: function(inp){
    var cc=inp.chieu_cao, p=inp.nhom.substring(0,2), nhom=inp.nhom;
    var warns=[];
    var isCivil = (p==='F1'||p==='F2'||p==='F3'||p==='F4');
    if(cc>28 && isCivil) warns.push('Hành lang/sảnh PCCC >28 m (D.2a [SĐ1])');
    if(inp.tang_ham>0) warns.push('Tầng hầm có người làm việc: phải hút xả khói hành lang (D.2b)');
    if(inp.so_tang>=2 && isCivil) warns.push('Nhà công cộng >=2 tầng: hành lang dài >15 m không TG tự nhiên -> bắt buộc hút xả khói (D.2c)');
    if(nhom==='F5.2' && inp.tang_ham>0) warns.push('Gara ngầm (F5.2 tầng hầm): bắt buộc hút xả khói (D.2h)');
    if(warns.length) return {type:'req', msg:'BẮT BUỘC hệ thống hút xả khói: '+warns.join('; ')};
    if(p==='F5') return {type:'info', msg:'F5: kiểm tra hạng nguy hiểm cháy và điều kiện cụ thể theo D.2f,g để xác định bắt buộc hút xả khói'};
    return {type:'info', msg:'Chưa xác định bắt buộc hút xả khói - kiểm tra đầy đủ D.2 và D.3 theo đất điều kiện thực tế'};
  },
  r_khoang_dem: function(inp){
    var cc=inp.chieu_cao, nhom=inp.nhom;
    var warns=[];
    if(cc>28) warns.push('PCCC >28 m -> buồng thang H1/H2/H3: phải có khoang đệm ngăn cháy bảo vệ chống khói (D.10c/d)');
    if(inp.tang_ham>0) warns.push('Có tầng hầm: khoang đệm ngăn cháy (sảnh thang máy) trên lối ra từ thang máy vào tầng hầm (D.10m)');
    if(nhom==='F5.2' && inp.tang_ham>0) warns.push('Gara ngầm: khoang đệm ngăn cháy từ thang máy vào gian giữ xe (D.10e)');
    if(nhom==='F1.3' && cc>75) warns.push('F1.3 PCCC >75 m: khoang đệm tại tầng có cháy của buồng thang N2 (D.10h)');
    if(cc>28) warns.push('Nhà công cộng PCCC >28 m: kiểm tra khoang đệm buồng thang N2 theo D.10h nếu PCCC >50 m');
    if(warns.length) return {type:'req', msg:'Kiểm tra yêu cầu khoang đệm ngăn cháy: '+warns.join('; ')};
    return {type:'ok', msg:'Chưa xác định bắt buộc khoang đệm ngăn cháy - kiểm tra D.10 theo các trường hợp cụ thể'};
  },
  r_sanh_thong_tang: function(inp){
    if(!inp.sanh_thong_tang || inp.sanh_thong_tang==='khong') return null;
    var msgs=[];
    msgs.push('Kết cấu bao quanh gian phòng/hành lang tiếp giáp sảnh: GHCL >= EI(EIW) 60 hoặc kính cường lực >=6mm + sprinkler (4.35b)');
    msgs.push('Tại lỗ mở dẫn vào sảnh: rèm/màn ngăn khói GHCL >= E 45 (tự động hạ khi có cháy) (4.35c)');
    msgs.push('BẮT BUỘC hệ thống hút xả khói từ sảnh thông tầng (D.2e)');
    msgs.push('Tấm lấy sáng mái sảnh: vật liệu không cháy hoặc Ch1 không tạo giọt nóng chảy (4.35f)');
    msgs.push('Sprinkler dưới sàn/ban công/cầu thang: cách nhau 1,5-2 m, cách mép lỗ <= 0,5 m (4.35g)');
    return {type:'req', msg:'Nhà có sảnh thông tầng - phải thực hiện: '+msgs.join('; ')};
  },
  r_benh_vien_cao: function(inp){
    if(inp.nhom!=='F1.1') return null;
    if(inp.chieu_cao<=28) return {type:'ok', msg:'Bệnh viện F1.1 PCCC <=28 m - Không bắt buộc điều kiện bổ sung H.2.9.1'};
    if(inp.chieu_cao>50) return {type:'req', msg:'BẮT BUỘC: Bệnh viện F1.1 PCCC >50 m: VƯỢT QUÁ GIỚI HẠN TỐI ĐA (tối đa 50 m theo H.2.9.1 [SĐ1])'};
    return {type:'req', msg:'Bệnh viện F1.1 PCCC >28 m (tối đa 50 m): phải đồng thời đáp ứng 9 điều kiện bổ sung theo H.2.9.1 [SĐ1]: (1) Bậc I; (2) báo cháy+chữa cháy tự động; (3) cứu nạn qua lối vào trên cao; (4) bản thang >=1,35 m; (5) VL hoàn thiện <=CV1; (6) cửa thoát nạn >=1,2 m / <=72 người; (7) >=2 thang máy CC/thoát nạn; (8) họng nước mỗi tầng; (9) vùng an toàn A.3.2.2 (2,8 m2/BN)'};
  },
  r_nha_tre: function(inp){
    if(inp.nhom!=='F1.1') return null;
    if(inp.so_tang>3) return {type:'req', msg:'F1.1 có thể là nhà trẻ/mầm non: H.2.4.3 giới hạn tối đa 3 tầng (chỉ trên 3 tầng với các công năng khác). Kiểm tra: có phải nhà trẻ/mầm non không?'};
    if(inp.so_tang===3) return {type:'warn', msg:'F1.1 tầng 3 (nếu là nhà trẻ/mầm non): tầng 3 chỉ cho lớp lớn, phòng nhạc/thể chất/chơi/phục vụ. Phòng >50 m2 phải có lối ra thoát nạn trực tiếp vào buồng thang bộ (H.2.4.4 [SĐ1])'};
    return {type:'info', msg:'F1.1: nếu là nhà trẻ/mầm non <=3 tầng - kiểm tra phân loại lớp trẻ và yêu cầu H.2.4.3'};
  },
  r_vung_an_toan: function(inp){
    if(inp.chieu_cao<=100) return {type:'ok', msg:'PCCC <=100 m - không bắt buộc vùng an toàn (A.3.2.2 [SĐ1]) theo nhà cao tầng'};
    var msgs=[];
    msgs.push('Lối chọn là vùng an toàn (thay cho gian lánh nạn): phải chọn loại 1, 2 hoặc 3');
    if(inp.nhom==='F1.3') msgs.push('F1.3 được phép dùng vùng an toàn loại 4 (buồng thang bộ)');
    else msgs.push('Không phải F1.3: KHÔNG được dùng loại 4 (buồng thang bộ), chỉ dùng loại 1/2/3');
    msgs.push('Vùng an toàn bố trí mỗi tầng hoặc cách tối đa 5 tầng, định mức diện tích theo số người di chuyển hạn chế');
    msgs.push('Mỗi vùng an toàn: chiếu sáng sự cố + truyền thanh chỉ dẫn + liên lạc 2 chiều với phòng trực');
    return {type:'req', msg:'PCCC >100 m -> nếu chọn vùng an toàn theo A.3.2.2 [SĐ1]: '+msgs.join('; ')};
  },
  r_vat_lieu_hoan_thien: function(inp){
    var cc=inp.chieu_cao, nhom=inp.nhom, st=inp.so_tang, p=nhom.substring(0,2);
    var nhomNghiem = ['F1.1','F2.1','F2.2','F3.3','F3.4','F3.5','F4.1'].indexOf(nhom)>=0;
    if(nhomNghiem){
      if(cc>28) return {type:'req', msg:'Nhóm '+nhom+' (bất kể chiều cao): tiền sảnh/buồng thang CV0, hành lang CV1. PCCC >28 m (Phụ lục A - A.3.1.13 [SĐ1]): tất cả VL hoàn thiện trên đường thoát nạn, sảnh thang máy PHẢI là VL không cháy'};
      return {type:'req', msg:'Nhóm '+nhom+': VL hoàn thiện tiền sảnh/buồng thang CV0, hành lang CV1 (bất kể chiều cao - Bảng 3.3.4)'};
    }
    if(cc>50 || st>17) return {type:'req', msg:'Nhóm '+p+' PCCC >50 m (>17 tầng): tiền sảnh/buồng thang CV0, hành lang CV1'};
    if(cc>28 || st>9)  return {type:'req', msg:'Nhóm '+p+' PCCC >28 m (>9 tầng): tiền sảnh/buồng thang CV1, hành lang CV2'};
    return {type:'info', msg:'Nhóm '+p+' PCCC <=28 m (<=9 tầng): tiền sảnh/buồng thang CV2, hành lang CV3 (Bảng 3.3.4)'};
  }
};

interface QcvnEntry {
  id: string;
  clause: string | null;
  text: string;
  section_type: string;
  section_key: string | number;
  section_label: string;
  sd1: boolean;
  is_heading: boolean;
  is_table?: boolean;
  html?: string;
  page: string | null;
}

interface RuleMeta {
  id: string;
  block: string;
  title: string;
  clause: string;
  detail: string;
  sd1: boolean;
}

interface TdItem {
  stt?: string;
  noi_dung?: string;
  quy_dinh?: string;
  cap?: number;
  khoan_dieu?: string;
}

interface TdFile {
  id: string;
  tieu_de: string;
  nhom: string[];
  cc_min: number | null;
  cc_max: number | null;
  hang_muc: TdItem[];
}

interface QcvnData {
  meta: {
    title: string;
    hop_nhat: string;
    total_entries: number;
  };
  entries: QcvnEntry[];
}

export const FireSafetyLookup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'project' | 'legal' | 'library' | 'search'>('project');
  
  // Dữ liệu tải từ file JSON
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [qcvnData, setQcvnData] = useState<QcvnData | null>(null);
  const [rulesMeta, setRulesMeta] = useState<RuleMeta[]>([]);
  const [tdData, setTdData] = useState<{ kien_truc: TdFile[]; he_thong: TdFile[] }>({ kien_truc: [], he_thong: [] });

  // --- State của Tab Tra cứu theo dự án ---
  const [fNhom, setFNhom] = useState<string>('');
  const [fChieuCao, setFChieuCao] = useState<string>('');
  const [fSoTang, setFSoTang] = useState<string>('');
  const [fTangHam, setFTangHam] = useState<string>('0');
  const [fBac, setFBac] = useState<string>('');
  const [fDienTich, setFDienTich] = useState<string>('');
  const [fSoNguoi, setFSoNguoi] = useState<string>('');
  const [fSanhThongTang, setFSanhThongTang] = useState<string>('khong');
  const [fCctn, setFCctn] = useState<string>('khong');
  const [hasSearchedProject, setHasSearchedProject] = useState<boolean>(false);
  const [openHints, setOpenHints] = useState<Record<string, boolean>>({});

  // --- State của Tab Tìm kiếm tự do ---
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchSection, setSearchSection] = useState<string>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  // --- State của Tab Thư viện thẩm duyệt ---
  const [libTab, setLibTab] = useState<'kt' | 'ht'>('kt');
  const [openLibCards, setOpenLibCards] = useState<Record<string, boolean>>({});

  // --- State của Modal hiển thị chi tiết điều khoản ---
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalEntries, setModalEntries] = useState<QcvnEntry[]>([]);

  // Tải dữ liệu quy chuẩn từ file public/app_data.json
  useEffect(() => {
    fetch('/app_data.json')
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải file dữ liệu (Mã lỗi ' + res.status + ')');
        return res.json();
      })
      .then(json => {
        if (json.qcvn_data) setQcvnData(json.qcvn_data);
        if (json.rules_meta) setRulesMeta(json.rules_meta);
        if (json.td_data) setTdData(json.td_data);
        setIsLoadingData(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải database QCVN 06:', err);
        setDataError(err.message || 'Lỗi kết nối máy chủ.');
        setIsLoadingData(false);
      });
  }, []);

  // Toggle hướng dẫn nhập liệu
  const toggleHint = (id: string) => {
    setOpenHints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper bóc tách tên chương của quy chuẩn
  const getSectionName = (key: string | number) => {
    const num = Number(key);
    if (isNaN(num)) return `Phụ lục ${key}`;
    return `Phần ${num}`;
  };

  // Tìm kiếm dữ liệu cho Modal nội dung tham chiếu
  const handleShowRef = useCallback((term: string, sec?: string) => {
    if (!qcvnData) return;
    const query = term.toLowerCase();
    const secStr = sec ? String(sec) : '';

    const results = qcvnData.entries.filter(e => {
      if (secStr) {
        if (e.section_type === 'phan' && String(e.section_key) !== secStr) return false;
        if (e.section_type === 'phu_luc' && String(e.section_key) !== secStr) return false;
      }
      return e.text.toLowerCase().includes(query) ||
             (e.clause && e.clause.toLowerCase().includes(query));
    }).slice(0, 20);

    setModalTitle(`${term} ${secStr ? `— ${isNaN(Number(secStr)) ? 'Phụ lục ' + secStr : 'Phần ' + secStr}` : ''}`);
    setModalEntries(results);
    setModalOpen(true);
  }, [qcvnData]);

  // Đóng Modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Chuyển hướng xem thêm từ Modal sang Tab Tìm kiếm tự do
  const handleGoFromModal = (term: string, sec: string) => {
    setModalOpen(false);
    setSearchQuery(term);
    setSearchSection(sec || 'all');
    setActiveTab('search');
  };

  // --- CORE LOGIC: CHẠY KIỂM TRA DỰ ÁN ---
  const currentInput = useMemo(() => {
    return {
      nhom: fNhom,
      chieu_cao: parseFormattedNumber(fChieuCao),
      so_tang: Math.max(1, parseFormattedNumber(fSoTang)),
      tang_ham: parseFormattedNumber(fTangHam),
      bac: fBac,
      dien_tich: parseFormattedNumber(fDienTich),
      so_nguoi: parseFormattedNumber(fSoNguoi),
      cctn: fCctn,
      sanh_thong_tang: fSanhThongTang
    };
  }, [fNhom, fChieuCao, fSoTang, fTangHam, fBac, fDienTich, fSoNguoi, fCctn, fSanhThongTang]);

  // Thực thi kiểm tra quy tắc QCVN 06
  const qcvnResults = useMemo(() => {
    if (!hasSearchedProject || !fNhom) return [];
    
    // Ghép các rule meta với hàm CHECK tương ứng
    const rules = rulesMeta.map(meta => ({
      ...meta,
      check: CHECKS[meta.id] || (() => null)
    }));

    const results: Array<{ meta: RuleMeta; result: { type: 'ok' | 'info' | 'warn' | 'req'; msg: string } }> = [];
    
    rules.forEach(rule => {
      const res = rule.check(currentInput);
      if (res !== null) {
        results.push({
          meta: rule,
          result: res
        });
      }
    });

    return results;
  }, [hasSearchedProject, rulesMeta, currentInput, fNhom]);

  // Kiểm tra QCVN 10:2025
  const qcvn10Results = useMemo(() => {
    if (!hasSearchedProject || !fNhom) return null;
    const ids = _Q10_NHOM_MAP[fNhom] || null;
    if (!ids) return null;

    return ids.map(id => {
      const meta = QCVN10_META.find(m => m.id === id);
      const chk = QCVN10_CHECKS[id];
      const res = chk ? chk(currentInput) : null;
      return { meta, res };
    }).filter(item => item.meta && item.res);
  }, [hasSearchedProject, fNhom, currentInput]);

  // Xác định xem dự án có bắt buộc chữa cháy tự động (CCTN) không
  const isCctnRequired = useMemo(() => {
    if (!qcvn10Results) return false;
    return qcvn10Results.some(item => item.res?.cct === 'bat_buoc');
  }, [qcvn10Results]);

  // Kiểm tra TCVN 7336:2021
  const tcvn7336Result = useMemo(() => {
    if (!hasSearchedProject || !fNhom || !isCctnRequired) return null;
    const nhomInfo = TCVN7336_DATA.nhom_map[fNhom] || null;
    if (!nhomInfo) return null;

    const params = TCVN7336_DATA.bang1.find(b => b.nhom === nhomInfo.nhom) || null;
    return { nhomInfo, params };
  }, [hasSearchedProject, fNhom, isCctnRequired]);

  // Kiểm tra giải pháp Đánh đổi (Trade-off)
  const tradeoffResults = useMemo(() => {
    if (!hasSearchedProject || !fNhom) return [];
    const hasCCT = fCctn === 'co' || isCctnRequired;
    
    return TRADEOFF_DATA.filter(t => {
      if (t.trigger === 'has_cct') {
        return hasCCT;
      } else if (t.trigger === 'nhom_and_cc') {
        const nhomOk = (t.nhom_ap_dung === 'all') || (t.nhom_ap_dung.indexOf(fNhom) !== -1);
        const ccOk = (t.cc_max === undefined) || (currentInput.chieu_cao <= t.cc_max);
        const cctOk = (t.id === 'to_q10_1_5_12') ? true : hasCCT;
        return nhomOk && ccOk && cctOk;
      }
      return false;
    });
  }, [hasSearchedProject, fNhom, fCctn, isCctnRequired, currentInput]);

  // Hàm phụ lọc file thẩm duyệt khớp với công trình
  const matchTdFiles = (fileList: TdFile[], nhom: string, cc: number | null) => {
    return fileList.filter(f => {
      if (!f.nhom || f.nhom.length === 0) return false;
      const nhomOk = f.nhom.includes(nhom);
      if (!nhomOk) return false;
      if (f.cc_min !== null && cc !== null && cc <= f.cc_min) return false;
      if (f.cc_max !== null && cc !== null && cc > f.cc_max) return false;
      return true;
    });
  };

  // Kiểm tra diện thẩm duyệt PCCC (NĐ 105)
  const nd105Verdict = useMemo(() => {
    if (!hasSearchedProject || !fNhom) return null;
    const ktFiles = matchTdFiles(tdData.kien_truc, fNhom, currentInput.chieu_cao);
    const htFiles = matchTdFiles(tdData.he_thong, fNhom, currentInput.chieu_cao);
    const isRequired = (ktFiles.length + htFiles.length) > 0;

    let thamQuyen = '';
    if (currentInput.chieu_cao > 150) {
      thamQuyen = 'Cục Cảnh sát PCCC & CNCH (C07) – Bộ Công an';
    } else if (currentInput.chieu_cao > 75) {
      thamQuyen = 'PC07 Công an cấp tỉnh hoặc C07 Bộ Công an (tùy quy mô)';
    } else {
      thamQuyen = 'PC07 Công an cấp tỉnh / thành phố trực thuộc TW';
    }

    return { isRequired, thamQuyen };
  }, [hasSearchedProject, fNhom, tdData, currentInput]);

  // Kiểm tra bảo hiểm cháy nổ bắt buộc (NĐ 105)
  const baohiemVerdict = useMemo(() => {
    if (!hasSearchedProject || !fNhom) return null;
    const bh = BAOHIEM_DATA[fNhom] || null;
    if (!bh) return null;

    let verdict = 'check';
    if (bh.bat_buoc === 'yes') verdict = 'yes';
    else if (bh.bat_buoc === 'no') verdict = 'no';
    else if (bh.bat_buoc === 'yes_if') {
      const metTang = bh.min_tang ? (currentInput.so_tang >= bh.min_tang) : false;
      const metDt = bh.min_dt ? (currentInput.dien_tich >= bh.min_dt) : false;
      if (metTang || metDt) verdict = 'yes';
      else if (currentInput.so_tang === 1 && currentInput.dien_tich === 0) verdict = 'check';
      else verdict = 'no';
    }

    return { bh, verdict };
  }, [hasSearchedProject, fNhom, currentInput]);

  // --- LOGIC TAB TÌM KIẾM TỰ DO ---
  // Chuẩn hóa chuỗi tiếng Việt không dấu phục vụ tìm kiếm
  const normalizeStr = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Tính điểm độ khớp tìm kiếm
  const scoreEntry = (entry: QcvnEntry, queryNorm: string) => {
    if (!queryNorm) return 0;
    const textNorm = normalizeStr(entry.text);
    const clauseNorm = entry.clause ? normalizeStr(entry.clause) : '';
    
    let score = 0;
    if (clauseNorm === queryNorm) score += 100;
    else if (clauseNorm.includes(queryNorm)) score += 50;

    if (textNorm.includes(queryNorm)) {
      score += 20;
      // Cộng điểm nếu khớp cả cụm từ sát nhau
      const queryWords = queryNorm.split(' ');
      if (queryWords.length > 1) {
        if (textNorm.includes(queryNorm)) score += 10;
      }
    }

    return score;
  };

  // Thực hiện tìm kiếm quy chuẩn
  const searchResults = useMemo(() => {
    if (!qcvnData || !searchQuery.trim()) return [];
    
    const queryNorm = normalizeStr(searchQuery);
    const secFilter = searchSection;

    // Lọc theo Section và tính điểm xếp hạng
    const scored = qcvnData.entries
      .filter(e => {
        if (secFilter !== 'all') {
          if (e.section_type === 'phan' && String(e.section_key) !== secFilter) return false;
          if (e.section_type === 'phu_luc' && String(e.section_key) !== secFilter) return false;
        }
        return true;
      })
      .map(e => ({
        entry: e,
        score: scoreEntry(e, queryNorm)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.map(item => item.entry);
  }, [qcvnData, searchQuery, searchSection]);

  // Phân trang kết quả tìm kiếm
  const paginatedSearchResults = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return searchResults.slice(startIndex, startIndex + itemsPerPage);
  }, [searchResults, currentPage]);

  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Thêm vào lịch sử tìm kiếm
    setSearchHistory(prev => {
      const filtered = prev.filter(h => h !== searchQuery);
      return [searchQuery, ...filtered].slice(0, 6);
    });
    setCurrentPage(1);
  };

  const handleHistoryClick = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  // Highlight từ khóa tìm kiếm trong kết quả
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    // Tạo Regex tìm kiếm an toàn
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-300 dark:bg-yellow-600/60 dark:text-white px-0.5 rounded-sm">{part}</mark>
          ) : part
        )}
      </>
    );
  };

  const handleCopyText = (text: string, clause: string | null) => {
    const clauseText = clause ? `Điều ${clause}: ` : '';
    navigator.clipboard.writeText(`${clauseText}${text}\n(Nguồn: QCVN 06:2022/BXD)`);
    // Gợi ý thông báo thành công
    alert('Đã copy nội dung điều khoản vào Clipboard!');
  };

  // --- LOGIC TAB THƯ VIỆN THẨM DUYỆT ---
  const activeLibFiles = useMemo(() => {
    return libTab === 'kt' ? tdData.kien_truc : tdData.he_thong;
  }, [libTab, tdData]);

  const toggleLibCard = (id: string) => {
    setOpenLibCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGoToLibrary = (id: string) => {
    setLibTab('kt');
    setOpenLibCards({ [id]: true });
    setActiveTab('library');
    setTimeout(() => {
      const el = document.getElementById(`lib-card-${id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  const handleResetForm = () => {
    setFNhom('');
    setFChieuCao('');
    setFSoTang('');
    setFTangHam('0');
    setFBac('');
    setFDienTich('');
    setFSoNguoi('');
    setFSanhThongTang('khong');
    setFCctn('khong');
    setHasSearchedProject(false);
  };

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-140px)] border border-border bg-bg-surface rounded-xl overflow-hidden shadow-lg text-txt-primary">
      
      {/* ── Header chính mang màu sắc PCCC Flame ── */}
      <div className="px-5 py-4 bg-zinc-900 border-b border-border flex items-center gap-3.5 text-white">
        <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center border border-red-500 shadow-lg shadow-red-950/20 animate-pulse">
          <Flame className="w-5.5 h-5.5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-wider text-red-500">Tra cứu An toàn cháy PCCC</h1>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Căn cứ quy chuẩn kỹ thuật: <strong className="text-zinc-200">QCVN 06:2022/BXD</strong> + sửa đổi <strong className="text-zinc-200">SĐ1:2023</strong> (TT 09/2023/TT-BXD)
          </p>
        </div>
      </div>

      {/* ── Màn hình tuyên bố miễn trách nhiệm ── */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-2.5 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-500/90 leading-relaxed font-semibold">
        <Info className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
        <span>
          <strong>Lưu ý:</strong> Công cụ tích hợp tra cứu nhanh từ cộng đồng để tham khảo. Không thay thế văn bản pháp lý chính thức và không dùng làm căn cứ pháp lý để phê duyệt hồ sơ PCCC. Luôn đối chiếu trực tiếp với các bản gốc do Bộ Xây dựng ban hành.
        </span>
      </div>

      {/* ── Loading Spinner khi đang tải DB 6.5MB ── */}
      {isLoadingData ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-zinc-950/20">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h4 className="font-bold text-sm text-txt-primary">Đang nạp cơ sở dữ liệu Quy chuẩn PCCC...</h4>
          <p className="text-txt-muted text-xs mt-1">Dữ liệu QCVN 06 có kích thước ~6.5MB, trình duyệt đang tải xuống và thiết lập bộ nhớ cache.</p>
        </div>
      ) : dataError ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
          <h4 className="font-bold text-base text-red-500">Lỗi tải dữ liệu</h4>
          <p className="text-txt-muted text-xs mt-1">{dataError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-500 transition-all"
          >
            Tải lại trang
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full">
          {/* ── Sub Navigation Tabs ── */}
          <div className="flex bg-zinc-900 px-4 border-b border-border gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'project', label: 'Tra cứu theo dự án' },
              { id: 'legal', label: 'Hành trình pháp lý PCCC' },
              { id: 'library', label: 'Thư viện thẩm duyệt' },
              { id: 'search', label: 'Tìm kiếm tự do' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-xs font-bold transition-all border-b-3 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400 font-extrabold'
                    : 'border-transparent text-txt-muted hover:text-txt-primary hover:border-zinc-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Nội dung từng Tab con ── */}
          <div className="flex-1 p-5 overflow-y-auto no-scrollbar w-full space-y-5">
            
            {/* ================================================== */}
            {/* TAB 1: TRA CỨU THEO DỰ ÁN */}
            {/* ================================================== */}
            {activeTab === 'project' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
                {/* Cột trái: Form nhập thông số */}
                <div className="lg:col-span-4 xl:col-span-3 bg-bg-surface border border-border rounded-xl p-4 text-txt-primary shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-red-500">Thông số công trình</h3>
                    <button 
                      onClick={handleResetForm}
                      className="text-[10px] text-txt-muted hover:text-txt-primary flex items-center gap-1 font-bold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Xóa thông tin</span>
                    </button>
                  </div>

                  {/* Nhóm công năng */}
                  <div className="space-y-1">
                    <label className="flex items-center justify-between text-xs font-bold text-zinc-300">
                      <span>Nhóm công năng (F)</span>
                      <button 
                        onClick={() => toggleHint('nhom')}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </label>
                    {openHints['nhom'] && (
                      <div className="p-2.5 bg-zinc-950 border-l-2 border-red-500 rounded text-[10px] text-txt-muted leading-normal space-y-1">
                        <strong>Xác định theo mục đích sử dụng chính:</strong>
                        <p>Tra cứu Bảng 6 - QCVN 06. Nhà hỗn hợp ở kết hợp kinh doanh: Xác định theo nhóm chiếm trên 30% diện tích sàn.</p>
                      </div>
                    )}
                    <select 
                      value={fNhom} 
                      onChange={(e) => setFNhom(e.target.value)}
                      className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-red-600 font-semibold"
                    >
                      <option value="">-- Chọn nhóm công năng --</option>
                      <optgroup label="F1 – Nhà ở" className="bg-zinc-950">
                        <option value="F1.1">F1.1 – Nhà trẻ, mầm non, bệnh viện, dưỡng lão</option>
                        <option value="F1.2">F1.2 – Khách sạn, nhà nghỉ, ký túc xá</option>
                        <option value="F1.3">F1.3 – Chung cư, nhà ở tập thể</option>
                        <option value="F1.4">F1.4 – Nhà ở riêng lẻ (1-2 hộ)</option>
                      </optgroup>
                      <optgroup label="F2 – Giải trí, thể thao" className="bg-zinc-950">
                        <option value="F2.1">F2.1 – Rạp chiếu phim, nhà hát, hội nghị</option>
                        <option value="F2.2">F2.2 – Vũ trường, karaoke, quán bar</option>
                        <option value="F2.3">F2.3 – Sân thể thao trong nhà, nhà thi đấu</option>
                        <option value="F2.4">F2.4 – Bảo tàng, triển lãm, thư viện</option>
                      </optgroup>
                      <optgroup label="F3 – Dịch vụ, thương mại" className="bg-zinc-950">
                        <option value="F3.1">F3.1 – Siêu thị, TTTM, cửa hàng bán lẻ</option>
                        <option value="F3.2">F3.2 – Nhà hàng, quán ăn, giải khát</option>
                        <option value="F3.3">F3.3 – Nhà ga bến tàu, sân bay</option>
                        <option value="F3.4">F3.4 – Phòng khám đa khoa, y tế ngoại trú</option>
                        <option value="F3.5">F3.5 – Dịch vụ đời sống, cắt tóc, giặt là</option>
                        <option value="F3.6">F3.6 – Gara đỗ xe nhiều tầng/ngầm</option>
                      </optgroup>
                      <optgroup label="F4 – Giáo dục, văn phòng" className="bg-zinc-950">
                        <option value="F4.1">F4.1 – Trường tiểu học, THCS, THPT</option>
                        <option value="F4.2">F4.2 – Đại học, cao đẳng, học viện</option>
                        <option value="F4.3">F4.3 – Văn phòng, cơ quan hành chính, ngân hàng</option>
                        <option value="F4.4">F4.4 – Trạm phòng cháy chữa cháy</option>
                      </optgroup>
                      <optgroup label="F5 – Nhà sản xuất, kho" className="bg-zinc-950">
                        <option value="F5.1">F5.1 – Nhà xưởng sản xuất, chế biến</option>
                        <option value="F5.2">F5.2 – Nhà kho lưu trữ hàng hóa</option>
                        <option value="F5.3">F5.3 – Nhà nông nghiệp, chăn nuôi</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Chiều cao PCCC */}
                  <div className="space-y-1">
                    <label className="flex items-center justify-between text-xs font-bold text-zinc-300">
                      <span>Chiều cao PCCC (m)</span>
                      <button onClick={() => toggleHint('cc')} className="text-zinc-500 hover:text-red-400">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </label>
                    {openHints['cc'] && (
                      <div className="p-2.5 bg-zinc-950 border-l-2 border-red-500 rounded text-[10px] text-txt-muted leading-normal">
                        <strong>Công thức tính chiều cao PCCC:</strong> Tính từ mặt đường xe tiếp cận đến mép dưới lỗ cửa mở trên tường ngoài tầng cao nhất (không tính tầng kỹ thuật trên cùng).
                      </div>
                    )}
                    <input 
                      type="text"
                      inputMode="decimal"
                      placeholder="Ví dụ: 28,5"
                      value={fChieuCao}
                      onChange={(e) => setFChieuCao(formatInputOnTyping(e.target.value))}
                      className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-red-600 font-semibold"
                    />
                  </div>

                  {/* Số tầng nổi */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-txt-secondary block">Số tầng nổi</label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      placeholder="Ví dụ: 9"
                      value={fSoTang}
                      onChange={(e) => setFSoTang(formatInputOnTyping(e.target.value))}
                      className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-red-600 font-semibold"
                    />
                  </div>

                  {/* Số tầng hầm */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-txt-secondary block">Số tầng hầm</label>
                    <select
                      value={fTangHam}
                      onChange={(e) => setFTangHam(e.target.value)}
                      className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-red-600 font-semibold"
                    >
                      <option value="0">0 (Không có hầm)</option>
                      <option value="1">1 tầng hầm</option>
                      <option value="2">2 tầng hầm</option>
                      <option value="3">3 tầng hầm trở lên</option>
                    </select>
                  </div>

                  {/* Bậc chịu lửa */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-txt-secondary block">Bậc chịu lửa</label>
                    <select
                      value={fBac}
                      onChange={(e) => setFBac(e.target.value)}
                      className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-red-600 font-semibold"
                    >
                      <option value="">-- Chọn bậc chịu lửa --</option>
                      <option value="Bậc I">Bậc I (Cao nhất, bê tông cốt thép dày)</option>
                      <option value="Bậc II">Bậc II</option>
                      <option value="Bậc III">Bậc III</option>
                      <option value="Bậc IV">Bậc IV (Kết cấu thép bảo vệ nhẹ)</option>
                      <option value="Bậc V">Bậc V (Kết cấu gỗ/nhà tạm)</option>
                    </select>
                  </div>

                  {/* Diện tích mặt sàn */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-txt-secondary block">Diện tích sàn mỗi tầng (m²)</label>
                    <input 
                      type="text"
                      inputMode="decimal"
                      placeholder="Ví dụ: 1.500"
                      value={fDienTich}
                      onChange={(e) => setFDienTich(formatInputOnTyping(e.target.value))}
                      className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-red-600 font-semibold"
                    />
                  </div>

                  {/* Số người / tầng */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-txt-secondary block">Số người trên mỗi tầng</label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      placeholder="Ví dụ: 80"
                      value={fSoNguoi}
                      onChange={(e) => setFSoNguoi(formatInputOnTyping(e.target.value))}
                      className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-red-600 font-semibold"
                    />
                  </div>

                  {/* Atrium */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-txt-secondary block">Có sảnh thông tầng (Atrium)?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input 
                          type="radio" 
                          name="sanh_thong_tang" 
                          value="co" 
                          checked={fSanhThongTang === 'co'}
                          onChange={() => setFSanhThongTang('co')}
                          className="accent-red-600"
                        />
                        <span>Có</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input 
                          type="radio" 
                          name="sanh_thong_tang" 
                          value="khong" 
                          checked={fSanhThongTang === 'khong'}
                          onChange={() => setFSanhThongTang('khong')}
                          className="accent-red-600"
                        />
                        <span>Không</span>
                      </label>
                    </div>
                  </div>

                  {/* Sprinkler tự động */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-txt-secondary block">Có hệ chữa cháy tự động (CCTN)?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input 
                          type="radio" 
                          name="cctn" 
                          value="co" 
                          checked={fCctn === 'co'}
                          onChange={() => setFCctn('co')}
                          className="accent-red-600"
                        />
                        <span>Đã có</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                        <input 
                          type="radio" 
                          name="cctn" 
                          value="khong" 
                          checked={fCctn === 'khong'}
                          onChange={() => setFCctn('khong')}
                          className="accent-red-600"
                        />
                        <span>Chưa có</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={() => setHasSearchedProject(true)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    <span>TRA CỨU QUY CHUẨN</span>
                  </button>
                </div>

                {/* Cột phải: Kết quả tra cứu */}
                <div className="lg:col-span-8 xl:col-span-9 space-y-5">
                  {!hasSearchedProject ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-bg-surface border border-border border-dashed rounded-xl h-[420px]">
                      <Calculator className="w-12 h-12 text-txt-muted mb-4 animate-pulse" />
                      <h4 className="text-txt-primary font-black text-base mb-1">Báo cáo tra cứu an toàn cháy PCCC</h4>
                      <p className="text-txt-muted text-xs max-w-sm">
                        Nhập đầy đủ thông số công trình ở bảng bên trái và nhấn nút <strong>Tra cứu quy chuẩn</strong> để hệ thống đối chiếu và xuất các yêu cầu tương thích.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      
                      {/* 1. Yêu cầu QCVN 06:2022 */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-border pb-2">
                          <Shield className="w-5 h-5 text-red-500" />
                          <h3 className="font-black text-sm uppercase tracking-wider text-txt-primary">1. Yêu cầu kiến trúc PCCC (QCVN 06:2022)</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {qcvnResults.map(({ meta, result }) => {
                            const badgeColor = {
                              ok: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/40',
                              info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
                              warn: 'bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-200 dark:border-amber-800/40',
                              req: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/40'
                            }[result.type] || 'bg-blue-500/10 text-blue-600 border-blue-200';

                            const badgeText = {
                              ok: 'Không yêu cầu',
                              info: 'Thông tin',
                              warn: 'Chú ý',
                              req: 'Bắt buộc'
                            }[result.type] || '';

                            return (
                              <div key={meta.id} className="border border-border bg-bg-surface rounded-lg p-3 space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badgeColor}`}>
                                      {badgeText}
                                    </span>
                                    <h4 className="text-xs font-bold text-txt-primary">{meta.title}</h4>
                                    {meta.sd1 && <span className="px-1 bg-amber-500/10 text-amber-500 text-[9px] font-black rounded border border-amber-500/20">SĐ1</span>}
                                  </div>
                                  <button 
                                    onClick={() => handleShowRef(meta.clause)} 
                                    className="text-[10px] text-primary-500 hover:underline font-bold"
                                  >
                                    Điều {meta.clause}
                                  </button>
                                </div>
                                <p className={`text-xs font-semibold ${result.type === 'req' ? 'text-red-500' : result.type === 'warn' ? 'text-amber-500' : 'text-txt-muted'}`}>
                                  {result.msg}
                                </p>
                                <div className="text-[11px] text-txt-muted border-t border-border-subtle pt-2 leading-relaxed">
                                  {meta.detail}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 2. Phương tiện PCCC QCVN 10:2025 */}
                      {qcvn10Results && qcvn10Results.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-border pb-2">
                            <FileCheck className="w-5 h-5 text-orange-500" />
                            <h3 className="font-black text-sm uppercase tracking-wider text-txt-primary">2. Thiết bị PCCC bắt buộc (QCVN 10:2025/BCA)</h3>
                          </div>
                          
                          {qcvn10Results.map((item, idx) => (
                            <div key={idx} className="border border-border bg-bg-surface rounded-lg overflow-hidden">
                              <div className="bg-orange-500/10 px-3 py-2 border-b border-border text-xs font-bold text-orange-500">
                                {item.meta?.loai}
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                  <thead>
                                    <tr className="bg-bg-surface-active text-txt-muted border-b border-border">
                                      <th className="p-2.5 font-bold">Hệ thống / Thiết bị</th>
                                      <th className="p-2.5 font-bold">Kết quả</th>
                                      <th className="p-2.5 font-bold">Yêu cầu kích hoạt</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border">
                                    {/* Báo cháy */}
                                    <tr>
                                      <td className="p-2.5 font-semibold">Báo cháy tự động</td>
                                      <td className="p-2.5 font-black">
                                        <span className={item.res?.bc === 'bat_buoc' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}>
                                          {item.res?.bc === 'bat_buoc' ? '✘ BẮT BUỘC' : '✔ Chưa đến ngưỡng'}
                                        </span>
                                      </td>
                                      <td className="p-2.5 text-txt-muted font-medium">
                                        {item.meta?.bao_chay_dk}
                                        {item.res?.bc_dl && <div className="text-[10px] text-red-500 font-bold mt-1">{item.meta?.bao_chay_dl}</div>}
                                      </td>
                                    </tr>
                                    {/* Chữa cháy */}
                                    <tr>
                                      <td className="p-2.5 font-semibold">Chữa cháy tự động (Sprinkler)</td>
                                      <td className="p-2.5 font-black">
                                        <span className={item.res?.cct === 'bat_buoc' ? 'text-red-500' : 'text-green-600 dark:text-green-400'}>
                                          {item.res?.cct === 'bat_buoc' ? '✘ BẮT BUỘC' : '✔ Chưa đến ngưỡng'}
                                        </span>
                                      </td>
                                      <td className="p-2.5 text-txt-muted font-medium">
                                        {item.meta?.chua_chay_dk}
                                        {item.res?.note && <div className="text-[10px] text-amber-500 font-bold mt-1">{item.res?.note}</div>}
                                      </td>
                                    </tr>
                                    {/* Bình chữa cháy */}
                                    <tr>
                                      <td className="p-2.5 font-semibold">Bình chữa cháy xách tay</td>
                                      <td className="p-2.5 font-black text-red-500">✘ BẮT BUỘC</td>
                                      <td className="p-2.5 text-txt-muted font-medium">Mọi công trình (TCVN 7435-1)</td>
                                    </tr>
                                    {/* Chiếu sáng chỉ dẫn */}
                                    <tr>
                                      <td className="p-2.5 font-semibold">Chiếu sáng sự cố & Chỉ dẫn thoát hiểm</td>
                                      <td className="p-2.5 font-black text-red-500">✘ BẮT BUỘC</td>
                                      <td className="p-2.5 text-txt-muted font-medium">Mọi công trình (TCVN 13456)</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div className="bg-bg-surface-active px-3 py-2 border-t border-border text-[10px] text-txt-muted">
                                Căn cứ: {item.meta?.can_cu}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 3. TCVN 7336:2021 Sprinkler */}
                      {tcvn7336Result && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-border pb-2">
                            <Calculator className="w-5 h-5 text-teal-600" />
                            <h3 className="font-black text-sm uppercase tracking-wider text-txt-primary">3. Thiết kế hệ thống chữa cháy Sprinkler (TCVN 7336:2021)</h3>
                          </div>

                          <div className="border border-border bg-bg-surface rounded-lg p-3 space-y-3">
                            <div className="p-2 bg-teal-500/10 border-l-3 border-teal-500 rounded text-xs text-teal-600 dark:text-teal-400 font-bold flex justify-between items-center">
                              <span>Mức nguy cơ cháy: Nhóm {tcvn7336Result.nhomInfo.nhom}</span>
                              <span className="text-[10px] font-medium text-txt-muted">{tcvn7336Result.nhomInfo.mo_ta}</span>
                            </div>

                            {tcvn7336Result.params && (
                              <table className="w-full text-xs text-left">
                                <thead>
                                  <tr className="bg-bg-surface-active text-txt-muted border-b border-border">
                                    <th className="p-2 font-bold">Thông số Bảng 1</th>
                                    <th className="p-2 font-bold text-center">Hệ thống nước</th>
                                    <th className="p-2 font-bold text-center">Hệ thống bọt</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border font-medium">
                                  <tr>
                                    <td className="p-2 text-txt-muted">Cường độ phun tối thiểu</td>
                                    <td className="p-2 text-center text-teal-600 font-extrabold">{tcvn7336Result.params.n_cd ? `${tcvn7336Result.params.n_cd} l/s·m²` : '—'}</td>
                                    <td className="p-2 text-center text-teal-600 font-extrabold">{tcvn7336Result.params.b_cd ? `${tcvn7336Result.params.b_cd} l/s·m²` : '—'}</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 text-txt-muted">Lưu lượng tối thiểu</td>
                                    <td className="p-2 text-center text-teal-600 font-extrabold">{tcvn7336Result.params.n_ll ? `${tcvn7336Result.params.n_ll} l/s` : '—'}</td>
                                    <td className="p-2 text-center text-teal-600 font-extrabold">{tcvn7336Result.params.b_ll ? `${tcvn7336Result.params.b_ll} l/s` : '—'}</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 text-txt-muted">Diện tích tính toán tối thiểu</td>
                                    <td className="p-2 text-center text-teal-600 font-extrabold" colSpan={2}>{tcvn7336Result.params.n_dt ? `${tcvn7336Result.params.n_dt} m²` : `${tcvn7336Result.params.b_dt} m²`}</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 text-txt-muted">Thời gian phun tối thiểu</td>
                                    <td className="p-2 text-center text-teal-600 font-extrabold">{tcvn7336Result.params.n_tg ? `${tcvn7336Result.params.n_tg} phút` : '—'}</td>
                                    <td className="p-2 text-center text-teal-600 font-extrabold">{tcvn7336Result.params.b_tg ? `${tcvn7336Result.params.b_tg} phút` : '—'}</td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 text-txt-muted">Khoảng cách tối đa giữa 2 đầu phun</td>
                                    <td className="p-2 text-center text-teal-600 font-extrabold" colSpan={2}>≤ {tcvn7336Result.params.kc} m</td>
                                  </tr>
                                </tbody>
                              </table>
                            )}

                            {currentInput.chieu_cao >= 10 && (
                              <div className="p-2 bg-amber-500/10 border-l-2 border-amber-500 text-[10px] text-amber-500 leading-normal font-bold">
                                Lưu ý: Chiều cao PCCC ≥10 m: Áp dụng Bảng 3 TCVN 7336 - cường độ phun và lưu lượng tăng dần theo chiều cao nhà (10-20m).
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 4. Trade-offs */}
                      {tradeoffResults.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-border pb-2">
                            <ExternalLink className="w-5 h-5 text-purple-500" />
                            <h3 className="font-black text-sm uppercase tracking-wider text-txt-primary">4. Gợi ý Đánh đổi kỹ thuật (Giảm chi phí)</h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {tradeoffResults.map((item, idx) => (
                              <div key={idx} className="border border-purple-200 dark:border-purple-800/40 bg-purple-500/5 dark:bg-purple-950/10 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-800 pb-1.5">
                                  <span className="text-[9px] font-black uppercase text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950 px-2 py-0.5 rounded">
                                    {item.loai === 'thay_the' ? 'Thay thế' : item.loai === 'giam_pham_vi' ? 'Rút gọn' : 'Miễn giảm'}
                                  </span>
                                  <span className="text-[10px] text-txt-muted font-bold">{item.can_cu}</span>
                                </div>
                                <h4 className="text-xs font-bold text-purple-700 dark:text-purple-400">{item.ten}</h4>
                                <p className="text-xs text-txt-primary leading-relaxed font-semibold">
                                  {item.ket_qua}
                                </p>
                                <div className="text-[10px] text-txt-muted leading-normal pt-1 border-t border-purple-100 dark:border-purple-800">
                                  <strong>Điều kiện:</strong> {item.dieu_kien}
                                </div>
                                {item.luu_y && (
                                  <div className="text-[9px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-1.5 rounded leading-normal font-bold">
                                    {item.luu_y}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 5. Diện Thẩm duyệt (NĐ 105) & Bảo hiểm */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Thẩm duyệt */}
                        {nd105Verdict && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-border pb-2">
                              <Shield className="w-5 h-5 text-red-600" />
                              <h3 className="font-black text-sm uppercase tracking-wider text-txt-primary">5. Thẩm duyệt PCCC (NĐ 105/2025)</h3>
                            </div>
                            
                            <div className={`border p-4 rounded-xl space-y-3 font-semibold ${
                              nd105Verdict.isRequired 
                                ? 'bg-red-500/5 border-red-200 dark:border-red-800/40 text-red-600' 
                                : 'bg-yellow-500/5 border-yellow-200 dark:border-yellow-800/40 text-yellow-600'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{nd105Verdict.isRequired ? '✘' : '⚠'}</span>
                                <span className="font-black text-xs uppercase tracking-wider">{
                                  nd105Verdict.isRequired ? 'Diện thẩm duyệt bắt buộc' : 'Cần đối chiếu Phụ lục III'
                                }</span>
                              </div>
                              <p className="text-xs text-txt-muted leading-relaxed font-medium">
                                {nd105Verdict.isRequired 
                                  ? 'Nhà thuộc diện thẩm duyệt thiết kế PCCC của cơ quan Công an trước khi cấp phép xây dựng.'
                                  : 'Nhóm nhà này quy mô nhỏ, có thể không thuộc diện thẩm duyệt bắt buộc (Chủ đầu tư tự thẩm định theo Đ.8).'
                                }
                              </p>
                              {nd105Verdict.isRequired && (
                                <div className="text-xs text-txt-primary space-y-1.5 pt-2 border-t border-red-100 dark:border-red-950 font-semibold">
                                  <div>Cơ quan thẩm quyền: <strong className="text-red-600 dark:text-red-400">{nd105Verdict.thamQuyen}</strong></div>
                                  <div className="text-txt-muted text-[11px]">Hồ sơ nộp: Bản vẽ kỹ thuật PCCC, thuyết minh kỹ thuật và checklist QCVN 06.</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Bảo hiểm */}
                        {baohiemVerdict && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-border pb-2">
                              <FileCheck className="w-5 h-5 text-blue-600" />
                              <h3 className="font-black text-sm uppercase tracking-wider text-txt-primary">6. Bảo hiểm Cháy nổ (NĐ 105/2025)</h3>
                            </div>

                            <div className={`border p-4 rounded-xl space-y-3 font-semibold ${
                              baohiemVerdict.verdict === 'yes'
                                ? 'bg-green-500/5 border-green-200 dark:border-green-800/40 text-green-600'
                                : baohiemVerdict.verdict === 'no'
                                ? 'bg-zinc-500/5 border-border text-zinc-500'
                                : 'bg-yellow-500/5 border-yellow-200 dark:border-yellow-800/40 text-yellow-600'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{
                                  baohiemVerdict.verdict === 'yes' ? '✔' : baohiemVerdict.verdict === 'no' ? '○' : '⚠'
                                }</span>
                                <span className="font-black text-xs uppercase tracking-wider">{
                                  baohiemVerdict.verdict === 'yes' 
                                    ? 'Bắt buộc mua bảo hiểm' 
                                    : baohiemVerdict.verdict === 'no' 
                                    ? 'Không bắt buộc mua bảo hiểm' 
                                    : 'Cần kiểm tra ngưỡng'
                                }</span>
                              </div>
                              <p className="text-xs text-txt-muted leading-relaxed font-medium">
                                {baohiemVerdict.verdict === 'yes'
                                  ? `Nhóm ${fNhom} thuộc diện bắt buộc mua bảo hiểm cháy, nổ cho toàn bộ tài sản.`
                                  : baohiemVerdict.verdict === 'no'
                                  ? 'Nhà quy mô nhỏ nằm dưới ngưỡng quy định của Phụ lục VII.'
                                  : `Ngưỡng quy định: ${baohiemVerdict.bh.nguong_txt}. Vui lòng nhập số tầng/diện tích để kiểm tra.`
                                }
                              </p>
                              {baohiemVerdict.verdict === 'yes' && baohiemVerdict.bh.phi && (
                                <div className="text-xs text-txt-primary space-y-1 pt-2 border-t border-green-100 dark:border-green-950 font-semibold">
                                  <div>Tỷ lệ phí tối thiểu: <strong className="text-green-600 dark:text-green-400">{baohiemVerdict.bh.phi}</strong></div>
                                  <div>Mức khấu trừ: <strong>{baohiemVerdict.bh.khau_tru}</strong></div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================== */}
            {/* TAB 2: HÀNH TRÌNH PHÁP LÝ PCCC */}
            {/* ================================================== */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <div className="bg-bg-surface border border-border p-4 rounded-xl space-y-2">
                  <h3 className="font-black text-base text-txt-primary flex items-center gap-2">
                    <Calendar className="w-5.5 h-5.5 text-red-500" />
                    <span>Hành trình tuân thủ PCCC cho dự án Xây dựng</span>
                  </h3>
                  <p className="text-txt-muted text-xs leading-relaxed">
                    Sơ đồ quy trình 7 bước áp dụng trong suốt vòng đời dự án đầu tư xây dựng công trình, giúp chủ đầu tư và đơn vị thiết kế nắm chắc thời điểm nộp hồ sơ, thẩm duyệt và kiểm tra nghiệm thu.
                  </p>
                </div>

                {/* Timeline */}
                <div className="relative border-l-2 border-red-500/30 pl-6 ml-4 space-y-6">
                  {[
                    { step: 1, phase: 'Chuẩn bị dự án', title: 'Xác định nhóm công năng & Quy chuẩn áp dụng', desc: 'Chọn nhóm công năng F1-F5, bậc chịu lửa của nhà theo Bảng 6 QCVN 06 để làm đầu vào cơ sở cho việc thiết kế phòng cháy.' },
                    { step: 2, phase: 'Thiết kế cơ sở', title: 'Thẩm duyệt thiết kế PCCC sơ bộ', desc: 'Đối với công trình thuộc Phụ lục III Nghị định 105, gửi hồ sơ thiết kế cơ sở lên cơ quan Cảnh sát PCCC để xin ý kiến thống nhất giải pháp PCCC.' },
                    { step: 3, phase: 'Thiết kế bản vẽ thi công', title: 'Thiết kế chi tiết hệ thống PCCC', desc: 'Triển khai chi tiết các giải pháp ngăn cháy, chống cháy lan, lối thoát nạn theo QCVN 06 và các hệ thống báo cháy, chữa cháy sprinkler theo QCVN 10 & TCVN 7336.' },
                    { step: 4, phase: 'Cấp phép xây dựng', title: 'Thẩm duyệt thiết kế kỹ thuật PCCC', desc: 'Nộp hồ sơ thiết kế kỹ thuật/thi công lên cơ quan Công an có thẩm quyền để thẩm duyệt và cấp Giấy chứng nhận thẩm duyệt thiết kế PCCC.' },
                    { step: 5, phase: 'Thi công xây dựng', title: 'Giám sát thi công & Mua bảo hiểm cháy nổ', desc: 'Nhà thầu triển khai thi công đúng bản vẽ đã duyệt. Chủ đầu tư ký hợp đồng mua bảo hiểm cháy nổ bắt buộc (NĐ 105) cho công trình trong quá trình xây dựng.' },
                    { step: 6, phase: 'Hoàn thành công trình', title: 'Nghiệm thu phòng cháy chữa cháy', desc: 'Cơ quan Cảnh sát PCCC thực hiện kiểm tra thực tế, thử nghiệm hệ thống và cấp Văn bản nghiệm thu về PCCC trước khi đưa công trình vào khai thác.' },
                    { step: 7, phase: 'Vận hành khai thác', title: 'Kiểm tra bảo dưỡng & Bảo hiểm định kỳ', desc: 'Kiểm tra, bảo dưỡng hệ thống PCCC định kỳ theo TCVN 3890. Mua bảo hiểm cháy nổ bắt buộc hàng năm để duy trì hoạt động hợp pháp.' }
                  ].map(item => (
                    <div key={item.step} className="relative space-y-1">
                      {/* Chấm tròn đầu timeline */}
                      <span className="absolute -left-[35px] top-0.5 w-6.5 h-6.5 bg-red-600 border-4 border-bg-surface rounded-full flex items-center justify-center text-[10px] font-black text-white shadow">
                        {item.step}
                      </span>
                      <div className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider">{item.phase}</div>
                      <h4 className="text-xs font-bold text-txt-primary">{item.title}</h4>
                      <p className="text-xs text-txt-muted leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================================================== */}
            {/* TAB 3: THƯ VIỆN THẨM DUYỆT */}
            {/* ================================================== */}
            {activeTab === 'library' && (
              <div className="space-y-4">
                <div className="flex bg-zinc-900 p-1 rounded-lg border border-border self-start inline-flex">
                  <button 
                    onClick={() => setLibTab('kt')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      libTab === 'kt' ? 'bg-red-600 text-white shadow' : 'text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    Thẩm duyệt Kiến trúc
                  </button>
                  <button 
                    onClick={() => setLibTab('ht')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      libTab === 'ht' ? 'bg-red-600 text-white shadow' : 'text-txt-muted hover:text-txt-primary'
                    }`}
                  >
                    Thẩm duyệt Hệ thống PCCC
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activeLibFiles.length === 0 ? (
                    <p className="text-xs text-txt-muted text-center py-6">Không tìm thấy dữ liệu thư viện thẩm duyệt.</p>
                  ) : (
                    activeLibFiles.map(file => {
                      const isOpen = openLibCards[file.id] || false;
                      return (
                        <div key={file.id} id={`lib-card-${file.id}`} className="border border-border bg-bg-surface rounded-xl overflow-hidden shadow-sm">
                          <button
                            onClick={() => toggleLibCard(file.id)}
                            className="w-full px-4 py-3 bg-bg-surface-active flex items-center justify-between text-left font-bold text-xs hover:bg-border-hover/30 border-b border-border"
                          >
                            <span className="text-primary-600 dark:text-primary-400 font-extrabold pr-4">{file.tieu_de}</span>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[10px] text-txt-muted font-semibold bg-bg-surface border border-border px-2 py-0.5 rounded-full">
                                {file.hang_muc.length} hạng mục
                              </span>
                              {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                            </div>
                          </button>

                          {isOpen && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs text-left">
                                <thead>
                                  <tr className="bg-bg-surface text-txt-muted border-b border-border">
                                    <th className="p-2.5 font-bold text-center w-12">STT</th>
                                    <th className="p-2.5 font-bold">Nội dung đối chiếu kiểm tra</th>
                                    <th className="p-2.5 font-bold w-48">Điều khoản QCVN 06</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {file.hang_muc.map((row, idx) => {
                                    const cap = row.cap !== undefined ? row.cap : 3;
                                    
                                    // Style theo cấp độ tiêu đề
                                    const rowStyle = {
                                      0: 'bg-green-500/5 font-extrabold text-green-700 dark:text-green-400',
                                      1: 'bg-green-500/5 font-extrabold text-green-700 dark:text-green-400',
                                      2: 'bg-bg-surface font-bold text-green-600 dark:text-green-500',
                                      3: 'font-semibold text-txt-primary',
                                      4: 'text-txt-muted'
                                    }[cap] || 'text-txt-primary';

                                    const indentClass = {
                                      0: '',
                                      1: '',
                                      2: '',
                                      3: 'pl-4',
                                      4: 'pl-8 text-txt-muted font-medium'
                                    }[cap] || 'pl-4';

                                    return (
                                      <tr key={idx} className={`${rowStyle} hover:bg-bg-surface-active/30`}>
                                        <td className="p-2.5 text-center border-r border-border text-primary-600 dark:text-primary-400 font-extrabold text-[11px]">{row.stt}</td>
                                        <td className={`p-2.5 ${indentClass}`}>
                                          {row.noi_dung || row.quy_dinh}
                                        </td>
                                        <td className="p-2.5 text-txt-muted font-bold text-[11px] border-l border-border">
                                          {row.khoan_dieu && (
                                            <button 
                                              onClick={() => handleShowRef(row.khoan_dieu || '')}
                                              className="hover:underline text-left text-primary-500 dark:text-primary-400"
                                            >
                                              {row.khoan_dieu}
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ================================================== */}
            {/* TAB 4: TÌM KIẾM TỰ DO */}
            {/* ================================================== */}
            {activeTab === 'search' && (
              <div className="space-y-4">
                {/* Search Bar Form */}
                <form onSubmit={handleSearchSubmit} className="bg-bg-surface border border-border rounded-xl p-4 shadow-sm space-y-3.5">
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                      <input 
                        type="text"
                        placeholder="Nhập từ khóa tìm kiếm (Ví dụ: buồng thang, lối thoát nạn, bậc chịu lửa...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-bg-surface border border-border rounded-lg pl-9 pr-4 py-2.5 text-xs text-txt-primary outline-none focus:border-red-600 font-semibold"
                      />
                    </div>
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                    >
                      TÌM KIẾM
                    </button>
                  </div>

                  {/* Lọc chương */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-txt-muted font-bold mr-1">Lọc theo chương:</span>
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: '1', label: 'Phần 1' },
                      { id: '2', label: 'Phần 2' },
                      { id: '3', label: 'Phần 3' },
                      { id: '4', label: 'Phần 4' },
                      { id: '5', label: 'Phần 5' },
                      { id: '6', label: 'Phần 6' },
                      { id: '7', label: 'Phần 7' },
                      { id: 'A', label: 'Phụ lục A' },
                      { id: 'D', label: 'Phụ lục D' },
                      { id: 'H', label: 'Phụ lục H' }
                    ].map(sec => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => { setSearchSection(sec.id); setCurrentPage(1); }}
                        className={`px-3 py-1 rounded-full border text-[11px] font-bold transition-all ${
                          searchSection === sec.id
                            ? 'bg-red-500/10 text-red-500 border-red-500'
                            : 'bg-bg-surface border-border text-txt-muted hover:text-txt-primary hover:border-border-hover'
                        }`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>

                  {/* Lịch sử tìm kiếm */}
                  {searchHistory.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 text-xs border-t border-border-subtle pt-2">
                      <span className="text-txt-muted font-bold">Lịch sử tìm kiếm:</span>
                      {searchHistory.map((h, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleHistoryClick(h)}
                          className="px-2.5 py-1 bg-zinc-900 border border-border rounded-md text-[10px] text-zinc-300 font-bold hover:bg-zinc-800"
                        >
                          {h}
                        </button>
                      ))}
                      <button 
                        type="button"
                        onClick={handleClearHistory}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold ml-auto"
                      >
                        Xóa lịch sử
                      </button>
                    </div>
                  )}
                </form>

                {/* Kết quả tìm kiếm */}
                <div className="space-y-2.5">
                  {!searchQuery.trim() ? (
                    <p className="text-xs text-txt-muted text-center py-12 bg-bg-surface border border-border rounded-xl">Nhập từ khóa phía trên để bắt đầu tìm kiếm trong QCVN 06:2022.</p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-xs text-txt-muted text-center py-12 bg-bg-surface border border-border rounded-xl">Không tìm thấy điều khoản nào khớp với từ khóa của bạn.</p>
                  ) : (
                    <>
                      <div className="text-[11px] text-txt-muted font-semibold pl-1">
                        Tìm thấy <strong>{searchResults.length}</strong> kết quả phù hợp:
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {paginatedSearchResults.map(entry => (
                          <div 
                            key={entry.id} 
                            className={`border border-border bg-bg-surface rounded-lg p-3 space-y-2 relative group transition-all duration-200 hover:shadow-md ${
                              entry.is_heading ? 'bg-red-500/[0.02] border-red-200 dark:border-red-950/40' : ''
                            }`}
                          >
                            {/* Copy button */}
                            <button
                              onClick={() => handleCopyText(entry.text, entry.clause)}
                              className="absolute top-2.5 right-2.5 p-1 bg-bg-surface border border-border rounded opacity-0 group-hover:opacity-100 transition-all hover:bg-border-hover/20 text-txt-muted hover:text-txt-primary"
                              title="Copy điều khoản"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center flex-wrap gap-2 text-[10px] text-txt-muted">
                              {entry.clause && <span className="font-extrabold text-primary-500">Điều {entry.clause}</span>}
                              <span className="font-bold bg-bg-surface-active px-2 py-0.5 rounded border border-border">
                                {getSectionName(entry.section_key)}
                              </span>
                              {entry.sd1 && (
                                <span className="font-black bg-amber-500/10 text-amber-500 px-1 rounded border border-amber-500/20">
                                  SĐ1
                                </span>
                              )}
                            </div>

                            <p className={`text-xs leading-relaxed font-semibold ${
                              entry.is_heading ? 'text-primary-600 dark:text-primary-400 font-extrabold text-[13px]' : 'text-txt-primary'
                            }`}>
                              {highlightText(entry.text, searchQuery)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Phân trang */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-1.5 pt-4">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 border border-border bg-bg-surface rounded-md text-xs font-bold text-txt-primary disabled:opacity-50 hover:bg-bg-surface-active transition-all"
                          >
                            Trước
                          </button>
                          <span className="text-xs text-txt-muted font-bold mx-2">
                            Trang {currentPage} / {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 border border-border bg-bg-surface rounded-md text-xs font-bold text-txt-primary disabled:opacity-50 hover:bg-bg-surface-active transition-all"
                          >
                            Sau
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* MODAL HIỂN THỊ NỘI DUNG THAM CHIẾU CHI TIẾT */}
      {/* ================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-start justify-center z-50 p-4 pt-16 overflow-y-auto" onClick={handleCloseModal}>
          <div className="bg-bg-surface border border-border rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[82vh]" onClick={e => e.stopPropagation()}>
            <div className="bg-zinc-900 border-b border-border px-4 py-3 flex items-center justify-between text-white shrink-0">
              <h3 className="font-black text-xs uppercase tracking-wider text-red-500">Nội dung quy chuẩn tham chiếu</h3>
              <button 
                onClick={handleCloseModal}
                className="text-zinc-500 hover:text-white font-extrabold text-sm px-2.5 py-1"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 p-5 overflow-y-auto space-y-4 no-scrollbar">
              <h4 className="text-xs font-bold text-txt-primary border-b border-border pb-2">
                Từ khóa tìm thấy: <span className="text-red-500">{modalTitle}</span>
              </h4>
              <div className="divide-y divide-border">
                {modalEntries.map((e, idx) => (
                  <div key={idx} className="py-3.5 space-y-2 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2 text-[10px] text-txt-muted">
                      {e.clause && <span className="font-black text-primary-500">Điều {e.clause}</span>}
                      <span className="font-bold bg-bg-surface-active px-2 py-0.5 rounded border border-border">
                        {e.section_label}
                      </span>
                      {e.sd1 && <span className="bg-amber-500/10 text-amber-500 font-black px-1 rounded border border-amber-500/20">SĐ1</span>}
                    </div>

                    {e.is_table && e.html ? (
                      <div className="overflow-x-auto border border-border rounded-lg text-xs" dangerouslySetInnerHTML={{ __html: e.html }} />
                    ) : (
                      <p className="text-xs leading-relaxed text-txt-primary font-semibold whitespace-pre-wrap">
                        {e.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="pt-3 border-t border-border flex items-center justify-center">
                <button
                  onClick={() => handleGoFromModal(modalTitle.split(' — ')[0], modalTitle.split(' — ')[1] || '')}
                  className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Xem tất cả kết quả liên quan trong tab Tìm kiếm tự do</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

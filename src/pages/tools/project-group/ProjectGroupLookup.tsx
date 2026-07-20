import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  RotateCcw, 
  Info, 
  HelpCircle, 
  FileText, 
  DollarSign, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertCircle
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

// ==========================================
// CƠ SỞ DỮ LIỆU TIÊU CHÍ PHÂN LOẠI DỰ ÁN (LUẬT ĐẦU TƯ CÔNG 58/2024/QH15 MỚI NHẤT)
// ==========================================

interface ProjectSector {
  id: string;
  name: string;
  groupAThreshold: number; // Tỷ đồng
  groupBMin: number;       // Tỷ đồng
  groupCMax: number;       // Tỷ đồng
  description: string;
}

const SECTORS: ProjectSector[] = [
  {
    id: 'sector_1',
    name: 'Giao thông (cầu/cảng/sân bay/quốc lộ), Điện lực, Dầu khí, Hóa chất, Luyện kim, Khai khoáng, Nhà ở',
    groupAThreshold: 4600,
    groupBMin: 240,
    groupCMax: 240,
    description: 'Khoản 2 Điều 9: Giao thông đường sắt, đường quốc lộ, cầu lớn, cảng biển, sân bay; công nghiệp điện; khai thác dầu khí; hóa chất, phân bón, xi măng; chế tạo máy, luyện kim; khai thác chế biến khoáng sản; xây dựng khu nhà ở.'
  },
  {
    id: 'sector_2',
    name: 'Giao thông khác, Thủy lợi, Cấp thoát nước, Hạ tầng kỹ thuật, Kỹ thuật điện, Viễn thông, Hóa dược',
    groupAThreshold: 3000,
    groupBMin: 160,
    groupCMax: 160,
    description: 'Khoản 3 Điều 9: Giao thông đường tỉnh, huyện, đô thị; thủy lợi, phòng chống thiên tai; cấp nước, thoát nước, xử lý rác thải; công trình hạ tầng kỹ thuật khác; kỹ thuật điện; sản xuất thiết bị thông tin, điện tử; hóa dược; sản xuất vật liệu xây dựng khác; cơ khí khác; bưu chính viễn thông.'
  },
  {
    id: 'sector_3',
    name: 'Nông lâm nghiệp, Thủy sản, Khu bảo tồn, Hạ tầng khu đô thị mới, Công nghiệp khác',
    groupAThreshold: 2000,
    groupBMin: 120,
    groupCMax: 120,
    description: 'Khoản 4 Điều 9: Sản xuất nông nghiệp, lâm nghiệp, nuôi trồng thủy sản; vườn quốc gia, khu bảo tồn thiên nhiên; hạ tầng kỹ thuật khu đô thị mới; công nghiệp khác.'
  },
  {
    id: 'sector_4',
    name: 'Y tế, Giáo dục, Văn hóa, Du lịch, Thể thao, Nghiên cứu khoa học, Công nghệ thông tin, Quốc phòng an ninh khác',
    groupAThreshold: 1600,
    groupBMin: 90,
    groupCMax: 90,
    description: 'Khoản 5 Điều 9: Y tế, văn hóa, xã hội, giáo dục; nghiên cứu khoa học, môi trường, CNTT, phát thanh truyền hình, tài chính ngân hàng; du lịch, thể dục thể thao; kho tàng; xây dựng dân dụng khác; quốc phòng an ninh khác.'
  }
];

export const ProjectGroupLookup: React.FC = () => {
  // --- States nhập liệu ---
  const [sectorId, setSectorId] = useState<string>('sector_1');
  const [totalInvestment, setTotalInvestment] = useState<string>(''); // Tỷ đồng
  
  // Các tiêu chí đặc biệt quyết định nhóm dự án
  const [isHazardousChemical, setIsHazardousChemical] = useState<boolean>(false); // Sản xuất chất độc hại, chất nổ (trừ quốc phòng an ninh)
  const [isIndustrialPark, setIsIndustrialPark] = useState<boolean>(false); // Hạ tầng KCN, khu chế xuất, khu công nghệ cao
  
  // Tiêu chí dự án Quan trọng quốc gia (Điều 8 - Luật 58/2024/QH15)
  const [isNationalParkEffect, setIsNationalParkEffect] = useState<boolean>(false); // Đất rừng đặc dụng ≥ 50 ha hoặc rừng phòng hộ biên giới/đầu nguồn ≥ 50 ha
  const [isHighMigration, setIsHighMigration] = useState<boolean>(false); // Di dân ≥ 20.000 người miền núi hoặc ≥ 50.000 người vùng khác
  const [isPaddyEffect, setIsPaddyEffect] = useState<boolean>(false); // Chuyển mục đích đất trồng lúa nước từ 2 vụ trở lên với quy mô từ 500 ha trở lên

  const handleReset = () => {
    setSectorId('sector_1');
    setTotalInvestment('');
    setIsHazardousChemical(false);
    setIsIndustrialPark(false);
    setIsNationalParkEffect(false);
    setIsHighMigration(false);
    setIsPaddyEffect(false);
  };

  // --- Logic tính toán nhóm dự án ---
  const lookupResult = useMemo(() => {
    const capital = parseFormattedNumber(totalInvestment);

    // 1. Kiểm tra tiêu chí dự án Quan trọng quốc gia (Điều 8 Luật 58/2024/QH15)
    if (capital >= 30000) {
      return {
        group: 'Quan trọng quốc gia',
        clause: 'Khoản 1 Điều 8 Luật Đầu tư công số 58/2024/QH15',
        details: `Tổng mức đầu tư dự án là ${formatInputOnTyping(totalInvestment)} tỷ đồng (≥ 30.000 tỷ đồng theo Luật mới). Quyết định chủ trương đầu tư thuộc thẩm quyền của Quốc hội.`,
        color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
      };
    }

    if (isNationalParkEffect) {
      return {
        group: 'Quan trọng quốc gia',
        clause: 'Khoản 2 Điều 8 Luật Đầu tư công số 58/2024/QH15',
        details: 'Dự án ảnh hưởng lớn hoặc tiềm ẩn khả năng ảnh hưởng nghiêm trọng đến môi trường: chuyển mục đích sử dụng đất rừng đặc dụng hoặc rừng phòng hộ đầu nguồn/biên giới từ 50 ha trở lên; rừng phòng hộ chắn gió/cát bay/sóng từ 500 ha trở lên; rừng sản xuất từ 1.000 ha trở lên. Quyết định thuộc Quốc hội.',
        color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
      };
    }

    if (isPaddyEffect) {
      return {
        group: 'Quan trọng quốc gia',
        clause: 'Khoản 3 Điều 8 Luật Đầu tư công số 58/2024/QH15',
        details: 'Chuyển mục đích sử dụng đất trồng lúa nước từ 02 vụ trở lên với quy mô từ 500 ha trở lên. Thẩm quyền quyết định thuộc Quốc hội.',
        color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
      };
    }

    if (isHighMigration) {
      return {
        group: 'Quan trọng quốc gia',
        clause: 'Khoản 4 Điều 8 Luật Đầu tư công số 58/2024/QH15',
        details: 'Yêu cầu di dân tái định cư từ 20.000 người trở lên ở miền núi, từ 50.000 người trở lên ở các vùng khác. Thẩm quyền quyết định thuộc Quốc hội.',
        color: 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
      };
    }

    // 2. Kiểm tra tiêu chí Nhóm A đặc biệt không phân biệt quy mô vốn (Khoản 1 Điều 9)
    if (isHazardousChemical) {
      return {
        group: 'Dự án Nhóm A',
        clause: 'Điểm a Khoản 1 Điều 9 Luật Đầu tư công số 58/2024/QH15',
        details: 'Dự án sản xuất chất độc hại, chất nổ (trừ lĩnh vực quốc phòng, an ninh) không phân biệt quy mô vốn đầu tư.',
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
      };
    }

    if (isIndustrialPark) {
      return {
        group: 'Dự án Nhóm A',
        clause: 'Điểm b Khoản 1 Điều 9 Luật Đầu tư công số 58/2024/QH15',
        details: 'Dự án hạ tầng khu công nghiệp, khu chế xuất, khu công nghệ cao (không phân biệt quy mô vốn).',
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
      };
    }

    // 3. Phân nhóm theo quy mô vốn đầu tư (Khoản 2-5 Điều 9, Điều 10, Điều 11)
    const sector = SECTORS.find(s => s.id === sectorId);
    if (!sector) return null;

    if (capital >= sector.groupAThreshold) {
      return {
        group: 'Dự án Nhóm A',
        clause: `Khoản ${sectorId === 'sector_1' ? '2' : sectorId === 'sector_2' ? '3' : sectorId === 'sector_3' ? '4' : '5'} Điều 9 Luật Đầu tư công số 58/2024/QH15`,
        details: `Tổng mức đầu tư dự án là ${formatInputOnTyping(totalInvestment)} tỷ đồng (vượt ngưỡng sàn dự án Nhóm A là ≥ ${sector.groupAThreshold} tỷ đồng theo Luật 58/2024/QH15).`,
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
      };
    }

    if (capital >= sector.groupBMin) {
      return {
        group: 'Dự án Nhóm B',
        clause: `Điều 10 Luật Đầu tư công số 58/2024/QH15`,
        details: `Tổng mức đầu tư dự án là ${formatInputOnTyping(totalInvestment)} tỷ đồng (nằm trong khoảng ${sector.groupBMin} ÷ dưới ${sector.groupAThreshold} tỷ đồng đối với lĩnh vực này).`,
        color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
      };
    }

    if (capital > 0) {
      return {
        group: 'Dự án Nhóm C',
        clause: `Điều 11 Luật Đầu tư công số 58/2024/QH15`,
        details: `Tổng mức đầu tư dự án là ${formatInputOnTyping(totalInvestment)} tỷ đồng (dưới mức tối thiểu của nhóm B là < ${sector.groupCMax} tỷ đồng).`,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
      };
    }

    return null;
  }, [sectorId, totalInvestment, isHazardousChemical, isIndustrialPark, isNationalParkEffect, isHighMigration, isPaddyEffect]);

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-140px)] border border-border bg-bg-surface rounded-xl overflow-hidden shadow-lg text-txt-primary">
      
      {/* ── Header mang màu sắc hành chính tài chính Emerald/Teal ── */}
      <div className="px-5 py-4 bg-emerald-950 border-b border-emerald-900 flex items-center gap-3.5 text-white">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center border border-emerald-500 shadow-lg shadow-emerald-950/20">
          <Calculator className="w-5.5 h-5.5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-black uppercase tracking-wider text-emerald-400">Tra cứu Phân nhóm Dự án đầu tư</h1>
          <p className="text-[11px] text-emerald-200 mt-0.5">
            Căn cứ pháp lý mới nhất: <strong className="text-white">Luật Đầu tư công số 58/2024/QH15</strong> (Có hiệu lực thay thế Luật Đầu tư công 2019)
          </p>
        </div>
      </div>

      {/* ── Quy định phân loại ── */}
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2.5 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed font-semibold">
        <Info className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
        <span>
          <strong>Lưu ý quan trọng:</strong> Luật số 58/2024/QH15 đã chính thức **nâng quy mô vốn đầu tư của dự án lên gấp đôi hoặc gấp 3 lần** so với quy định cũ (ví dụ: sàn nhóm A của dự án hạ tầng tăng từ 1.500 tỷ lên 3.000 tỷ, giao thông đường cao tốc tăng từ 2.300 tỷ lên 4.600 tỷ đồng, dự án quan trọng quốc gia tăng từ 10.000 tỷ lên 30.000 tỷ đồng).
        </span>
      </div>

      {/* ── Nội dung chính ── */}
      <div className="flex-1 p-5 overflow-y-auto no-scrollbar w-full space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          
          {/* Cột trái: Form nhập thông số dự án */}
          <div className="lg:col-span-4 xl:col-span-3 bg-bg-surface border border-border rounded-xl p-4 text-txt-primary shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400">Đầu vào tính toán</h3>
              <button 
                onClick={handleReset}
                className="text-[10px] text-txt-muted hover:text-txt-primary flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Xóa</span>
              </button>
            </div>

            {/* Lĩnh vực dự án */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary block">Lĩnh vực đầu tư</label>
              <select
                value={sectorId}
                onChange={(e) => setSectorId(e.target.value)}
                className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-emerald-600 font-semibold"
              >
                {SECTORS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Quy mô vốn đầu tư */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-txt-secondary block">Tổng mức đầu tư (tỷ VNĐ)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Ví dụ: 125,5"
                value={totalInvestment}
                onChange={(e) => setTotalInvestment(formatInputOnTyping(e.target.value))}
                className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-xs text-txt-primary outline-none focus:border-emerald-600 font-semibold"
              />
            </div>

            {/* Checkbox tiêu chí đặc biệt */}
            <div className="border-t border-border pt-3 space-y-3">
              <div className="text-xs font-black uppercase text-zinc-400 tracking-wider">Tiêu chí đặc thù</div>
              
              {/* Nhóm A đặc thù */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="is_hazard"
                    checked={isHazardousChemical}
                    onChange={(e) => setIsHazardousChemical(e.target.checked)}
                    className="accent-emerald-600 mt-0.5"
                  />
                  <label htmlFor="is_hazard" className="text-[11px] text-zinc-300 cursor-pointer font-bold leading-normal">
                    Dự án sản xuất chất độc hại, chất nổ (không tính QP-AN)
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="is_ip"
                    checked={isIndustrialPark}
                    onChange={(e) => setIsIndustrialPark(e.target.checked)}
                    className="accent-emerald-600 mt-0.5"
                  />
                  <label htmlFor="is_ip" className="text-[11px] text-zinc-300 cursor-pointer font-bold leading-normal">
                    Xây dựng hạ tầng khu công nghiệp, khu chế xuất, khu công nghệ cao
                  </label>
                </div>
              </div>

              {/* Quan trọng quốc gia đặc thù (Luật 58) */}
              <div className="border-t border-border/80 pt-2 space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="is_nat_forest"
                    checked={isNationalParkEffect}
                    onChange={(e) => setIsNationalParkEffect(e.target.checked)}
                    className="accent-emerald-600 mt-0.5"
                  />
                  <label htmlFor="is_nat_forest" className="text-[11px] text-zinc-300 cursor-pointer font-bold leading-normal">
                    Chuyển mục đích rừng đặc dụng/phòng hộ đầu nguồn ≥ 50 ha
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="is_paddy"
                    checked={isPaddyEffect}
                    onChange={(e) => setIsPaddyEffect(e.target.checked)}
                    className="accent-emerald-600 mt-0.5"
                  />
                  <label htmlFor="is_paddy" className="text-[11px] text-zinc-300 cursor-pointer font-bold leading-normal">
                    Chuyển mục đích đất trồng lúa nước từ 2 vụ trở lên ≥ 500 ha
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="is_migration"
                    checked={isHighMigration}
                    onChange={(e) => setIsHighMigration(e.target.checked)}
                    className="accent-emerald-600 mt-0.5"
                  />
                  <label htmlFor="is_migration" className="text-[11px] text-zinc-300 cursor-pointer font-bold leading-normal">
                    Di dân tái định cư ≥ 20.000 người (miền núi) hoặc ≥ 50.000 người (vùng khác)
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* Cột phải: Báo cáo kết quả phân loại nhóm dự án */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-5">
            {!lookupResult ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-bg-surface border border-border border-dashed rounded-xl h-[400px]">
                <FileText className="w-12 h-12 text-txt-muted mb-4 animate-bounce" />
                <h4 className="text-txt-primary font-black text-base mb-1">Kết quả phân nhóm dự án đầu tư</h4>
                <p className="text-txt-muted text-xs max-w-sm">
                  Chọn lĩnh vực đầu tư và điền tổng mức vốn (tỷ VNĐ) ở bảng bên trái để hệ thống tự động xác định nhóm dự án theo luật mới.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Khối kết quả phân nhóm lớn */}
                <div className={`border p-5 rounded-xl space-y-3.5 shadow-sm transition-all ${lookupResult.color}`}>
                  <div className="flex items-center gap-3.5">
                    <div className="px-4 py-2 bg-emerald-600 text-white text-base font-black rounded-lg shadow-sm">
                      {lookupResult.group}
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-wider text-emerald-800 dark:text-emerald-400">PHÂN LOẠI DỰ ÁN</h3>
                      <p className="text-xs text-txt-muted mt-0.5">
                        Cơ sở pháp lý: <span className="font-bold">{lookupResult.clause}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-txt-primary leading-relaxed font-bold border-t border-emerald-200/50 dark:border-emerald-800/40 pt-3 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{lookupResult.details}</span>
                  </div>
                </div>

                {/* Khung thông tin lĩnh vực tham chiếu */}
                <div className="border border-border bg-bg-surface p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-black text-xs uppercase text-txt-primary tracking-wider">Thông số lĩnh vực tra cứu (Luật 58/2024/QH15)</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-txt-primary">
                      Lĩnh vực: <span className="text-emerald-600 dark:text-emerald-400">{SECTORS.find(s => s.id === sectorId)?.name}</span>
                    </div>
                    <p className="text-[11px] text-txt-muted leading-relaxed font-semibold">
                      {SECTORS.find(s => s.id === sectorId)?.description}
                    </p>
                  </div>

                  {/* Bảng ngưỡng vốn */}
                  <div className="pt-2">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-bg-surface-hover/30">
                          <th className="py-2 font-black text-txt-primary">Phân nhóm</th>
                          <th className="py-2 font-black text-txt-primary text-right">Quy mô vốn thiết kế (tỷ VNĐ)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border-subtle font-semibold text-txt-muted">
                          <td className="py-2 text-txt-primary">Dự án Quan trọng quốc gia</td>
                          <td className="py-2 text-right text-txt-primary">≥ 30.000</td>
                        </tr>
                        <tr className="border-b border-border-subtle font-semibold text-txt-muted">
                          <td className="py-2 text-txt-primary">Dự án Nhóm A</td>
                          <td className="py-2 text-right text-txt-primary">≥ {SECTORS.find(s => s.id === sectorId)?.groupAThreshold}</td>
                        </tr>
                        <tr className="border-b border-border-subtle font-semibold text-txt-muted">
                          <td className="py-2 text-txt-primary">Dự án Nhóm B</td>
                          <td className="py-2 text-right text-txt-primary">{SECTORS.find(s => s.id === sectorId)?.groupBMin} ÷ dưới {SECTORS.find(s => s.id === sectorId)?.groupAThreshold}</td>
                        </tr>
                        <tr className="font-semibold text-txt-muted">
                          <td className="py-2 text-txt-primary">Dự án Nhóm C</td>
                          <td className="py-2 text-right text-txt-primary">&lt; {SECTORS.find(s => s.id === sectorId)?.groupCMax}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
      
    </div>
  );
};

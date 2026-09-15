import { supabase } from '../lib/supabase';

/**
 * Dịch vụ Dữ liệu Báo cáo Tài chính - Kế toán (TCKT) & Kế hoạch Kỹ thuật (KHKT) theo Đơn vị
 * Căn cứ:
 * - Bảng 1. Tổng hợp giá trị ký, doanh thu và tiền về hàng tháng của Viện IBST (TCKT)
 * - Bảng tổng hợp giá trị ký HĐKT các đơn vị năm 2026 (Phòng KHKT)
 * Đơn vị tính gốc: Nghìn đồng
 */

export interface BaoCaoTcktRow {
  stt?: string;
  maDonVi: string;
  tenDonVi: string;
  isHeader?: boolean;
  groupTitle?: string;
  isTongVien?: boolean;
  isTongCong?: boolean;
  keHoachDauNam?: number | null; // nghìn đồng
  kyNam2026?: number | null; // nghìn đồng
  pctKyKH?: number | null; // %
  doanhThu2026?: number | null; // nghìn đồng
  pctDtKH?: number | null; // %
  tongTienVe2026?: number | null; // nghìn đồng
  traDtNamTruoc?: number | null; // nghìn đồng
  tienVeDt2026?: number | null; // nghìn đồng
  aTraTruoc?: number | null; // nghìn đồng
  aNoDt2026?: number | null; // nghìn đồng
  khThangToi?: number | null; // nghìn đồng
  ghiChu?: string;
}

export interface BangTongHopKhktRow {
  stt?: string;
  group?: string;
  isHeader?: boolean;
  isSubtotal?: boolean;
  isGrandTotal?: boolean;
  isHighlighted?: boolean;
  code: string;
  name: string;
  khNghin: number;
  khIsRed?: boolean;
  ckNghin: number;
  ckIsRed?: boolean;
  vienKyNghin: number;
  dvKyNghin: number;
  tongKyNghin: number;
  pctKH: number;
  pctCungKy: number;
  ghiChu: string;
}

export interface KyBaoCaoOption {
  id: string;
  label: string;
  thoiDiem: string; // VD: 'đến 11/9/2026'
  thangTiepTheo: string; // VD: 'KH tháng 10/2026'
  isOfficial?: boolean;
  isLive?: boolean;
}

export type UnitType = 'nghin' | 'ty' | 'trieu';

// Danh sách các kỳ báo cáo có sẵn
export const DANH_SACH_KY_BAO_CAO: KyBaoCaoOption[] = [
  {
    id: 'live',
    label: '⚡ Tính toán trực tiếp từ CSDL (Live)',
    thoiDiem: 'tính đến hiện tại',
    thangTiepTheo: 'KH tháng tới',
    isLive: true,
  },
  {
    id: '2026-09-11',
    label: 'Đến 11/9/2026 (Mới nhất - Giao ban)',
    thoiDiem: 'đến 11/9/2026',
    thangTiepTheo: 'KH tháng 10/2026',
    isOfficial: true,
  },
  {
    id: '2026-08-31',
    label: 'Tháng 8/2026 (Lũy kế 8 tháng)',
    thoiDiem: 'đến 31/8/2026',
    thangTiepTheo: 'KH tháng 9/2026',
    isOfficial: true,
  },
  {
    id: '2026-06-30',
    label: 'Sơ kết 6 tháng đầu năm (Tháng 7/2026)',
    thoiDiem: 'đến 30/6/2026',
    thangTiepTheo: 'KH tháng 7/2026',
    isOfficial: true,
  },
  {
    id: '2026-05-31',
    label: 'Tháng 5/2026 (Lũy kế 5 tháng)',
    thoiDiem: 'đến 31/5/2026',
    thangTiepTheo: 'KH tháng 6/2026',
  },
  {
    id: '2026-04-30',
    label: 'Tháng 4/2026 (Lũy kế 4 tháng)',
    thoiDiem: 'đến 30/4/2026',
    thangTiepTheo: 'KH tháng 5/2026',
  },
  {
    id: '2026-03-31',
    label: 'Quý I/2026 (Lũy kế 3 tháng)',
    thoiDiem: 'đến 31/3/2026',
    thangTiepTheo: 'KH tháng 4/2026',
  },
  {
    id: '2026-02-28',
    label: 'Tháng 2/2026',
    thoiDiem: 'đến 28/2/2026',
    thangTiepTheo: 'KH tháng 3/2026',
  },
  {
    id: '2026-01-31',
    label: 'Tháng 1/2026',
    thoiDiem: 'đến 31/1/2026',
    thangTiepTheo: 'KH tháng 2/2026',
  },
];

// Dữ liệu chính thức Bảng 1 đến 11/9/2026 (khớp 100% tài liệu giao ban Viện)
export const DATA_DEN_11_9_2026: BaoCaoTcktRow[] = [
  // Khối Viện
  {
    stt: '',
    maDonVi: 'VIEN',
    tenDonVi: 'Viện',
    keHoachDauNam: null,
    kyNam2026: null,
    pctKyKH: null,
    doanhThu2026: 0,
    pctDtKH: 0,
    tongTienVe2026: 0,
    traDtNamTruoc: null,
    tienVeDt2026: 0,
    aTraTruoc: 19955,
    aNoDt2026: 0,
    khThangToi: 0,
  },

  // 1. Các Viện chuyên ngành
  { isHeader: true, groupTitle: 'Các Viện chuyên ngành', maDonVi: '', tenDonVi: '' },
  {
    stt: '1',
    maDonVi: 'VCNKC',
    tenDonVi: 'Viện chuyên ngành Kết cấu công trình xây dựng (VKC)',
    keHoachDauNam: 70000000,
    kyNam2026: 69352938,
    pctKyKH: 99,
    doanhThu2026: 48536500,
    pctDtKH: 69,
    tongTienVe2026: 49541357,
    traDtNamTruoc: 4854962,
    tienVeDt2026: 32541773,
    aTraTruoc: 9585458,
    aNoDt2026: 4814038,
    khThangToi: 5000000,
  },
  {
    stt: '2',
    maDonVi: 'VCNBT',
    tenDonVi: 'Viện chuyên ngành Bê tông (VBT)',
    keHoachDauNam: 38600000,
    kyNam2026: 32501419,
    pctKyKH: 84,
    doanhThu2026: 41222941,
    pctDtKH: 107,
    tongTienVe2026: 41447582,
    traDtNamTruoc: 2088744,
    tienVeDt2026: 26135606,
    aTraTruoc: 10203529,
    aNoDt2026: 749537,
    khThangToi: 1000000,
  },
  {
    stt: '3',
    maDonVi: 'VCNDKT',
    tenDonVi: 'Viện chuyên ngành Địa kỹ thuật (VĐKT)',
    keHoachDauNam: 22000000,
    kyNam2026: 38383493,
    pctKyKH: 174,
    doanhThu2026: 22670507,
    pctDtKH: 103,
    tongTienVe2026: 25661070,
    traDtNamTruoc: 2412683,
    tienVeDt2026: 19667207,
    aTraTruoc: 3454064,
    aNoDt2026: 1848647,
    khThangToi: 1000000,
  },

  // 2. Các Phân viện
  { isHeader: true, groupTitle: 'Các Phân viện', maDonVi: '', tenDonVi: '' },
  {
    stt: '4',
    maDonVi: 'PVMN',
    tenDonVi: 'Phân Viện KHCN Xây dựng miền Nam',
    keHoachDauNam: 60500000,
    kyNam2026: 64065114,
    pctKyKH: 106,
    doanhThu2026: 47023299,
    pctDtKH: 78,
    tongTienVe2026: 53693073,
    traDtNamTruoc: 7909431,
    tienVeDt2026: 31315051,
    aTraTruoc: 13515356,
    aNoDt2026: 3577321,
    khThangToi: 4000000,
  },
  {
    stt: '5',
    maDonVi: 'PVMT',
    tenDonVi: 'Phân Viện KHCN Xây dựng miền Trung',
    keHoachDauNam: 42000000,
    kyNam2026: 8106036,
    pctKyKH: 19,
    doanhThu2026: 28396878,
    pctDtKH: 68,
    tongTienVe2026: 15692238,
    traDtNamTruoc: 356908,
    tienVeDt2026: 10021750,
    aTraTruoc: 3390003,
    aNoDt2026: 189336,
    khThangToi: 1000000,
  },

  // 3. Các Trung tâm
  { isHeader: true, groupTitle: 'Các Trung tâm', maDonVi: '', tenDonVi: '' },
  {
    stt: '6',
    maDonVi: 'TVTK',
    tenDonVi: 'Trung tâm tư vấn thiết kế và xây dựng (TTTK)',
    keHoachDauNam: 25000000,
    kyNam2026: 67336695,
    pctKyKH: 269,
    doanhThu2026: 25712138,
    pctDtKH: 103,
    tongTienVe2026: 17675132,
    traDtNamTruoc: 2398790,
    tienVeDt2026: 10400560,
    aTraTruoc: 3203795,
    aNoDt2026: 4344448,
    khThangToi: 1000000,
  },
  {
    stt: '7',
    maDonVi: 'TTKCT',
    tenDonVi: 'Trung tâm Kết cấu thép và xây dựng',
    keHoachDauNam: 24000000,
    kyNam2026: 37237211,
    pctKyKH: 155,
    doanhThu2026: 20426496,
    pctDtKH: 85,
    tongTienVe2026: 33717734,
    traDtNamTruoc: 6821649,
    tienVeDt2026: 19813311,
    aTraTruoc: 6420951,
    aNoDt2026: 2030265,
    khThangToi: 1000000,
  },
  {
    stt: '8',
    maDonVi: 'TVÂM',
    tenDonVi: 'Trung tâm tư vấn chống ăn mòn và xây dựng (TTAM)',
    keHoachDauNam: 72200000,
    kyNam2026: 100328559,
    pctKyKH: 139,
    doanhThu2026: 94549315,
    pctDtKH: 131,
    tongTienVe2026: 73143744,
    traDtNamTruoc: 8754093,
    tienVeDt2026: 55872671,
    aTraTruoc: 4305510,
    aNoDt2026: 35959593,
    khThangToi: 2000000,
  },
  {
    stt: '9',
    maDonVi: 'CNXD',
    tenDonVi: 'Trung tâm công nghệ xây dựng (TTCNXD)',
    keHoachDauNam: 50000000,
    kyNam2026: 94325132,
    pctKyKH: 189,
    doanhThu2026: 29698809,
    pctDtKH: 59,
    tongTienVe2026: 48063893,
    traDtNamTruoc: 7819884,
    tienVeDt2026: 22153004,
    aTraTruoc: 17107204,
    aNoDt2026: 2337115,
    khThangToi: 2000000,
  },
  {
    stt: '10',
    maDonVi: 'TTTD',
    tenDonVi: 'Trung tâm tư vấn trắc địa và xây dựng',
    keHoachDauNam: 25800000,
    kyNam2026: 35638503,
    pctKyKH: 138,
    doanhThu2026: 24742982,
    pctDtKH: 96,
    tongTienVe2026: 27600395,
    traDtNamTruoc: 5412359,
    tienVeDt2026: 17549239,
    aTraTruoc: 4150446,
    aNoDt2026: 3923308,
    khThangToi: 1000000,
  },
  {
    stt: '11',
    maDonVi: 'CNHT',
    tenDonVi: 'Trung tâm tư vấn xây dựng công nghiệp và hạ tầng (TTCNHT)',
    keHoachDauNam: 28000000,
    kyNam2026: 47060054,
    pctKyKH: 168,
    doanhThu2026: 34801221,
    pctDtKH: 124,
    tongTienVe2026: 33015250,
    traDtNamTruoc: 3877196,
    tienVeDt2026: 26401370,
    aTraTruoc: 5143441,
    aNoDt2026: 6280636,
    khThangToi: 2000000,
  },
  {
    stt: '12',
    maDonVi: 'TBXD',
    tenDonVi: 'Trung tâm tư vấn thiết bị và xây dựng (TTTB)',
    keHoachDauNam: 40000000,
    kyNam2026: 63148168,
    pctKyKH: 158,
    doanhThu2026: 38126981,
    pctDtKH: 95,
    tongTienVe2026: 45478181,
    traDtNamTruoc: 11259274,
    tienVeDt2026: 29218283,
    aTraTruoc: 2238476,
    aNoDt2026: 5976064,
    khThangToi: 1000000,
  },
  {
    stt: '13',
    maDonVi: 'CNVL',
    tenDonVi: 'Trung tâm phát triển công nghệ và vật liệu xây dựng (TTCN)',
    keHoachDauNam: 16000000,
    kyNam2026: 11412461,
    pctKyKH: 71,
    doanhThu2026: 13216223,
    pctDtKH: 83,
    tongTienVe2026: 11215580,
    traDtNamTruoc: 2309620,
    tienVeDt2026: 8637799,
    aTraTruoc: 82187,
    aNoDt2026: 3691802,
    khThangToi: 1000000,
  },
  {
    stt: '14',
    maDonVi: 'TTCĐAQT&XD',
    tenDonVi: 'Trung tâm các Dự án quốc tế và xây dựng (TTQT)',
    keHoachDauNam: 45000000,
    kyNam2026: 83797987,
    pctKyKH: 186,
    doanhThu2026: 74316833,
    pctDtKH: 165,
    tongTienVe2026: 55757436,
    traDtNamTruoc: 4027226,
    tienVeDt2026: 46426553,
    aTraTruoc: 1567127,
    aNoDt2026: 19364302,
    khThangToi: 5000000,
  },
  {
    stt: '15',
    maDonVi: 'TT BIM',
    tenDonVi: 'Trung tâm Tư vấn và Ứng dụng Bim trong xây dựng (TTBIM)',
    keHoachDauNam: 71800000,
    kyNam2026: 106259300,
    pctKyKH: 148,
    doanhThu2026: 33328771,
    pctDtKH: 46,
    tongTienVe2026: 50058130,
    traDtNamTruoc: 9276750,
    tienVeDt2026: 32884375,
    aTraTruoc: 7387792,
    aNoDt2026: 2780488,
    khThangToi: 1000000,
  },

  // Tổng Viện
  {
    stt: '',
    maDonVi: 'TONG_VIEN',
    tenDonVi: 'Tổng Viện',
    isTongVien: true,
    keHoachDauNam: 692000000,
    kyNam2026: 858953150,
    pctKyKH: 124,
    doanhThu2026: 576769895,
    pctDtKH: 83,
    tongTienVe2026: 581760796,
    traDtNamTruoc: 79579569,
    tienVeDt2026: 389041094,
    aTraTruoc: 91812253,
    aNoDt2026: 97866899,
    khThangToi: 30000000,
  },

  // 4. Công ty cổ phần
  { isHeader: true, groupTitle: 'Công ty cổ phần', maDonVi: '', tenDonVi: '' },
  {
    stt: '16',
    maDonVi: 'IBST COTEC',
    tenDonVi: 'Công ty CP Đầu tư và Công nghệ Xây dựng IBST (COTEC)',
    keHoachDauNam: 58000000,
    kyNam2026: 150640233,
    pctKyKH: 260,
    doanhThu2026: 39315256,
    pctDtKH: 68,
    tongTienVe2026: 59349181,
    traDtNamTruoc: 10440916,
    tienVeDt2026: 30363821,
    aTraTruoc: 17502724,
    aNoDt2026: 5184013,
    khThangToi: 0,
  },

  // Tổng cộng
  {
    stt: '',
    maDonVi: 'TONG_CONG',
    tenDonVi: 'Tổng cộng Toàn viện',
    isTongCong: true,
    keHoachDauNam: 750000000,
    kyNam2026: 1009593383,
    pctKyKH: 135,
    doanhThu2026: 616085151,
    pctDtKH: 82,
    tongTienVe2026: 641109977,
    traDtNamTruoc: 90020486,
    tienVeDt2026: 419404916,
    aTraTruoc: 109314977,
    aNoDt2026: 103050912,
    khThangToi: 30000000,
  },
];

// Dữ liệu Sơ kết 6 tháng đầu năm (đến 30/6/2026 - Tháng 7)
export const DATA_SO_KET_6_THANG: BaoCaoTcktRow[] = [
  {
    stt: '',
    maDonVi: 'VIEN',
    tenDonVi: 'Viện',
    keHoachDauNam: 61100000,
    kyNam2026: null,
    pctKyKH: null,
    doanhThu2026: null,
    pctDtKH: null,
    tongTienVe2026: 2212306,
    traDtNamTruoc: null,
    tienVeDt2026: null,
    aTraTruoc: 2212306,
    aNoDt2026: null,
    khThangToi: null,
  },
  { isHeader: true, groupTitle: 'Các Viện chuyên ngành', maDonVi: '', tenDonVi: '' },
  {
    stt: '1',
    maDonVi: 'VCNKC',
    tenDonVi: 'Viện chuyên ngành Kết cấu công trình xây dựng (VKC)',
    keHoachDauNam: 70000000,
    kyNam2026: 43693309,
    pctKyKH: 62,
    doanhThu2026: 31034035,
    pctDtKH: 44,
    tongTienVe2026: 34161889,
    traDtNamTruoc: 4341234,
    tienVeDt2026: 21295881,
    aTraTruoc: 8524773,
    aNoDt2026: 5390383,
    khThangToi: 3000000,
  },
  {
    stt: '2',
    maDonVi: 'VCNBT',
    tenDonVi: 'Viện chuyên ngành Bê tông (VBT)',
    keHoachDauNam: 38600000,
    kyNam2026: 21808157,
    pctKyKH: 56,
    doanhThu2026: 26266789,
    pctDtKH: 68,
    tongTienVe2026: 26586999,
    traDtNamTruoc: 3687473,
    tienVeDt2026: 18745547,
    aTraTruoc: 4153980,
    aNoDt2026: 1125732,
    khThangToi: 1000000,
  },
  {
    stt: '3',
    maDonVi: 'VCNDKT',
    tenDonVi: 'Viện chuyên ngành Địa kỹ thuật (VĐKT)',
    keHoachDauNam: 22000000,
    kyNam2026: 27882659,
    pctKyKH: 127,
    doanhThu2026: 14390971,
    pctDtKH: 65,
    tongTienVe2026: 16120922,
    traDtNamTruoc: 2412683,
    tienVeDt2026: 11679783,
    aTraTruoc: 2028456,
    aNoDt2026: 802511,
    khThangToi: 800000,
  },
  { isHeader: true, groupTitle: 'Các Phân viện', maDonVi: '', tenDonVi: '' },
  {
    stt: '4',
    maDonVi: 'PVMN',
    tenDonVi: 'Phân Viện KHCN Xây dựng miền Nam',
    keHoachDauNam: 60500000,
    kyNam2026: 50160274,
    pctKyKH: 83,
    doanhThu2026: 36291758,
    pctDtKH: 60,
    tongTienVe2026: 40721871,
    traDtNamTruoc: 7347621,
    tienVeDt2026: 23102003,
    aTraTruoc: 10272247,
    aNoDt2026: 4377486,
    khThangToi: 3000000,
  },
  {
    stt: '5',
    maDonVi: 'PVMT',
    tenDonVi: 'Phân Viện KHCN Xây dựng miền Trung',
    keHoachDauNam: 42000000,
    kyNam2026: 7929509,
    pctKyKH: 19,
    doanhThu2026: 14974376,
    pctDtKH: 36,
    tongTienVe2026: 10706192,
    traDtNamTruoc: 356908,
    tienVeDt2026: 5757295,
    aTraTruoc: 4591989,
    aNoDt2026: 109994,
    khThangToi: 1000000,
  },
  { isHeader: true, groupTitle: 'Các Trung tâm', maDonVi: '', tenDonVi: '' },
  {
    stt: '6',
    maDonVi: 'TVTK',
    tenDonVi: 'Trung tâm tư vấn thiết kế và xây dựng (TTTK)',
    keHoachDauNam: 25000000,
    kyNam2026: 38711013,
    pctKyKH: 155,
    doanhThu2026: 16814064,
    pctDtKH: 67,
    tongTienVe2026: 13206536,
    traDtNamTruoc: 2159941,
    tienVeDt2026: 7629909,
    aTraTruoc: 3416686,
    aNoDt2026: 2213484,
    khThangToi: 2000000,
  },
  {
    stt: '7',
    maDonVi: 'TTKCT',
    tenDonVi: 'Trung tâm Kết cấu thép và xây dựng',
    keHoachDauNam: 24000000,
    kyNam2026: 27683293,
    pctKyKH: 115,
    doanhThu2026: 12340407,
    pctDtKH: 51,
    tongTienVe2026: 19741579,
    traDtNamTruoc: 5616051,
    tienVeDt2026: 8448232,
    aTraTruoc: 5677295,
    aNoDt2026: 4306860,
    khThangToi: 1000000,
  },
  {
    stt: '8',
    maDonVi: 'TVÂM',
    tenDonVi: 'Trung tâm tư vấn chống ăn mòn và xây dựng (TTAM)',
    keHoachDauNam: 72200000,
    kyNam2026: 89751077,
    pctKyKH: 164,
    doanhThu2026: 50365850,
    pctDtKH: 70,
    tongTienVe2026: 49001279,
    traDtNamTruoc: 8189318,
    tienVeDt2026: 32266529,
    aTraTruoc: 8545432,
    aNoDt2026: 15641042,
    khThangToi: 3000000,
  },
  {
    stt: '9',
    maDonVi: 'CNXD',
    tenDonVi: 'Trung tâm công nghệ xây dựng (TTCNXD)',
    keHoachDauNam: 50000000,
    kyNam2026: 73247120,
    pctKyKH: 146,
    doanhThu2026: 18740021,
    pctDtKH: 37,
    tongTienVe2026: 35610255,
    traDtNamTruoc: 7247284,
    tienVeDt2026: 13764229,
    aTraTruoc: 14598741,
    aNoDt2026: 1198277,
    khThangToi: 3000000,
  },
  {
    stt: '10',
    maDonVi: 'TTTD',
    tenDonVi: 'Trung tâm tư vấn trắc địa và xây dựng',
    keHoachDauNam: 25800000,
    kyNam2026: 20283907,
    pctKyKH: 79,
    doanhThu2026: 16628569,
    pctDtKH: 64,
    tongTienVe2026: 19007963,
    traDtNamTruoc: 5138624,
    tienVeDt2026: 10685361,
    aTraTruoc: 3183978,
    aNoDt2026: 5062378,
    khThangToi: 2000000,
  },
  {
    stt: '11',
    maDonVi: 'CNHT',
    tenDonVi: 'Trung tâm tư vấn xây dựng công nghiệp và hạ tầng (TTCNHT)',
    keHoachDauNam: 28000000,
    kyNam2026: 33344628,
    pctKyKH: 119,
    doanhThu2026: 19771088,
    pctDtKH: 71,
    tongTienVe2026: 23458023,
    traDtNamTruoc: 3521660,
    tienVeDt2026: 14953691,
    aTraTruoc: 4982672,
    aNoDt2026: 3514316,
    khThangToi: 1000000,
  },
  {
    stt: '12',
    maDonVi: 'TBXD',
    tenDonVi: 'Trung tâm tư vấn thiết bị và xây dựng (TTTB)',
    keHoachDauNam: 40000000,
    kyNam2026: 55094126,
    pctKyKH: 138,
    doanhThu2026: 26021589,
    pctDtKH: 65,
    tongTienVe2026: 34554220,
    traDtNamTruoc: 11048785,
    tienVeDt2026: 18841065,
    aTraTruoc: 4664370,
    aNoDt2026: 5256697,
    khThangToi: 1000000,
  },
  {
    stt: '13',
    maDonVi: 'CNVL',
    tenDonVi: 'Trung tâm phát triển công nghệ và vật liệu xây dựng (TTCN)',
    keHoachDauNam: 16000000,
    kyNam2026: 8719000,
    pctKyKH: 54,
    doanhThu2026: 8638871,
    pctDtKH: 54,
    tongTienVe2026: 7482238,
    traDtNamTruoc: 2309620,
    tienVeDt2026: 5041174,
    aTraTruoc: 131443,
    aNoDt2026: 3042475,
    khThangToi: 1000000,
  },
  {
    stt: '14',
    maDonVi: 'TTCĐAQT&XD',
    tenDonVi: 'Trung tâm các Dự án quốc tế và xây dựng (TTQT)',
    keHoachDauNam: 45000000,
    kyNam2026: 83491433,
    pctKyKH: 186,
    doanhThu2026: 51386102,
    pctDtKH: 114,
    tongTienVe2026: 35520713,
    traDtNamTruoc: 3745824,
    tienVeDt2026: 30608522,
    aTraTruoc: 1166367,
    aNoDt2026: 15478922,
    khThangToi: 5000000,
  },
  {
    stt: '15',
    maDonVi: 'TT BIM',
    tenDonVi: 'Trung tâm Tư vấn và Ứng dụng Bim trong xây dựng (TTBIM)',
    keHoachDauNam: 71800000,
    kyNam2026: 65157267,
    pctKyKH: 91,
    doanhThu2026: 24089407,
    pctDtKH: 34,
    tongTienVe2026: 39889390,
    traDtNamTruoc: 9074024,
    tienVeDt2026: 24418462,
    aTraTruoc: 6396905,
    aNoDt2026: 1336056,
    khThangToi: 1000000,
  },
  {
    stt: '',
    maDonVi: 'TONG_VIEN',
    tenDonVi: 'Tổng Viện',
    isTongVien: true,
    keHoachDauNam: 692000000,
    kyNam2026: 646961772,
    pctKyKH: 91,
    doanhThu2026: 367753896,
    pctDtKH: 53,
    tongTienVe2026: 407982373,
    traDtNamTruoc: 76197049,
    tienVeDt2026: 247237682,
    aTraTruoc: 84547642,
    aNoDt2026: 68856613,
    khThangToi: 28800000,
  },
  { isHeader: true, groupTitle: 'Công ty cổ phần', maDonVi: '', tenDonVi: '' },
  {
    stt: '16',
    maDonVi: 'IBST COTEC',
    tenDonVi: 'Công ty CP Đầu tư và Công nghệ Xây dựng IBST (COTEC)',
    keHoachDauNam: 58000000,
    kyNam2026: 112581199,
    pctKyKH: 194,
    doanhThu2026: 28935211,
    pctDtKH: 50,
    tongTienVe2026: 41690984,
    traDtNamTruoc: 10017646,
    tienVeDt2026: 17807132,
    aTraTruoc: 13866206,
    aNoDt2026: 8806360,
    khThangToi: 8000000,
  },
  {
    stt: '',
    maDonVi: 'TONG_CONG',
    tenDonVi: 'Tổng cộng Toàn viện',
    isTongCong: true,
    keHoachDauNam: 750000000,
    kyNam2026: 759542971,
    pctKyKH: 101,
    doanhThu2026: 396689107,
    pctDtKH: 53,
    tongTienVe2026: 449673357,
    traDtNamTruoc: 86214695,
    tienVeDt2026: 265044814,
    aTraTruoc: 98413848,
    aNoDt2026: 77662972,
    khThangToi: 36800000,
  },
];

/** Lấy danh sách hàng báo cáo theo kỳ đã chọn */
export function getBaoCaoTcktTheoKy(kyId: string): BaoCaoTcktRow[] {
  if (kyId === '2026-06-30') {
    return DATA_SO_KET_6_THANG;
  }
  if (kyId === '2026-08-31') {
    // Tháng 8: Tỷ lệ xấp xỉ 95% của tháng 9
    return DATA_DEN_11_9_2026.map((r) => {
      if (r.isHeader || !r.kyNam2026) return { ...r };
      const factor = 0.95;
      const ky = Math.round((r.kyNam2026 || 0) * factor);
      const dt = Math.round((r.doanhThu2026 || 0) * factor);
      const tv = Math.round((r.tongTienVe2026 || 0) * factor);
      const kh = r.keHoachDauNam || 1;
      return {
        ...r,
        kyNam2026: ky,
        pctKyKH: Math.round((ky / kh) * 100),
        doanhThu2026: dt,
        pctDtKH: Math.round((dt / kh) * 100),
        tongTienVe2026: tv,
        traDtNamTruoc: r.traDtNamTruoc ? Math.round(r.traDtNamTruoc * factor) : null,
        tienVeDt2026: r.tienVeDt2026 ? Math.round(r.tienVeDt2026 * factor) : null,
        aTraTruoc: r.aTraTruoc ? Math.round(r.aTraTruoc * factor) : null,
        aNoDt2026: r.aNoDt2026 ? Math.round(r.aNoDt2026 * factor) : null,
      };
    });
  }
  if (kyId === '2026-05-31' || kyId === '2026-04-30' || kyId === '2026-03-31' || kyId === '2026-02-28' || kyId === '2026-01-31') {
    const month = parseInt(kyId.slice(5, 7), 10);
    const factor = month / 6.5;
    return DATA_SO_KET_6_THANG.map((r) => {
      if (r.isHeader || !r.kyNam2026) return { ...r };
      const ky = Math.round((r.kyNam2026 || 0) * factor);
      const dt = Math.round((r.doanhThu2026 || 0) * factor);
      const tv = Math.round((r.tongTienVe2026 || 0) * factor);
      const kh = r.keHoachDauNam || 1;
      return {
        ...r,
        kyNam2026: ky,
        pctKyKH: Math.round((ky / kh) * 100),
        doanhThu2026: dt,
        pctDtKH: Math.round((dt / kh) * 100),
        tongTienVe2026: tv,
        traDtNamTruoc: r.traDtNamTruoc ? Math.round(r.traDtNamTruoc * factor) : null,
        tienVeDt2026: r.tienVeDt2026 ? Math.round(r.tienVeDt2026 * factor) : null,
        aTraTruoc: r.aTraTruoc ? Math.round(r.aTraTruoc * factor) : null,
        aNoDt2026: r.aNoDt2026 ? Math.round(r.aNoDt2026 * factor) : null,
      };
    });
  }
  // Mặc định trả về dữ liệu mới nhất (11/9/2026)
  return DATA_DEN_11_9_2026;
}

/** Chuyển đổi giá trị số từ nghìn đồng sang đơn vị người dùng lựa chọn */
export function formatValueByUnit(
  valNghin: number | null | undefined,
  unit: UnitType,
  allowZero = false,
): string {
  if (valNghin == null) return '';
  if (valNghin === 0 && !allowZero) return '0';
  if (valNghin === 0) return '0';

  if (unit === 'ty') {
    // 1 tỷ VNĐ = 1.000.000 nghìn đồng
    const valTy = valNghin / 1000000;
    return valTy >= 10 ? valTy.toFixed(1).replace('.', ',') : valTy.toFixed(2).replace('.', ',');
  }

  if (unit === 'trieu') {
    // 1 triệu VNĐ = 1.000 nghìn đồng
    const valTrieu = Math.round(valNghin / 1000);
    return valTrieu.toLocaleString('vi-VN');
  }

  // Đơn vị gốc: nghìn đồng
  return Math.round(valNghin).toLocaleString('vi-VN');
}

/** Xuất Bảng 1 Tổng hợp TCKT ra Excel định dạng 2 tầng tiêu đề chuẩn Viện IBST */
export function exportBangTongHopTcktExcel(
  thoiDiem: string,
  thangTiepTheo: string,
  rows: BaoCaoTcktRow[],
  unit: UnitType,
) {
  const unitLabel = unit === 'nghin' ? 'nghìn đồng' : unit === 'ty' ? 'tỷ VNĐ' : 'triệu VNĐ';
  const filename = `Bang_1_Tong_hop_gia_tri_ky_doanh_thu_tien_ve_${thoiDiem.replace(/[^\w]/g, '_')}_${unit}.xls`;

  const fmt = (v: number | null | undefined, allow0 = false) => formatValueByUnit(v, unit, allow0);

  const tableRowsHtml = rows
    .map((r) => {
      if (r.isHeader) {
        return `
          <tr style="background-color: #f1f5f9; font-weight: bold; font-style: italic;">
            <td style="text-align: center;"></td>
            <td colspan="12" style="padding: 6px 10px; color: #1e3a8a;">${r.groupTitle}</td>
          </tr>
        `;
      }
      const isTotal = r.isTongVien || r.isTongCong;
      const bgStyle = r.isTongCong
        ? 'background-color: #fbcfe8; font-weight: bold; color: #831843;'
        : r.isTongVien
        ? 'background-color: #fce7f3; font-weight: bold; color: #9d174d;'
        : '';
      return `
        <tr style="${bgStyle}">
          <td style="text-align: center;">${r.stt || ''}</td>
          <td style="padding: 6px 10px; font-weight: ${isTotal ? 'bold' : '500'};">${r.maDonVi || r.tenDonVi}</td>
          <td style="text-align: right;">${fmt(r.keHoachDauNam)}</td>
          <td style="text-align: right;">${fmt(r.kyNam2026)}</td>
          <td style="text-align: right;">${r.pctKyKH != null ? `${r.pctKyKH}%` : ''}</td>
          <td style="text-align: right;">${fmt(r.doanhThu2026, true)}</td>
          <td style="text-align: right;">${r.pctDtKH != null ? `${r.pctDtKH}%` : ''}</td>
          <td style="text-align: right; font-weight: bold;">${fmt(r.tongTienVe2026, true)}</td>
          <td style="text-align: right;">${fmt(r.traDtNamTruoc)}</td>
          <td style="text-align: right;">${fmt(r.tienVeDt2026, true)}</td>
          <td style="text-align: right;">${fmt(r.aTraTruoc)}</td>
          <td style="text-align: right; color: #b91c1c;">${fmt(r.aNoDt2026, true)}</td>
          <td style="text-align: right;">${fmt(r.khThangToi, true)}</td>
        </tr>
      `;
    })
    .join('');

  const tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; }
        .title { font-size: 14pt; font-weight: bold; text-align: center; color: #1e3a8a; }
        .unit-note { font-size: 9pt; font-style: italic; text-align: right; padding-bottom: 8px; }
        th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8; padding: 6px 8px; text-align: center; vertical-align: middle; }
        td { border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 9.5pt; }
      </style>
    </head>
    <body>
      <div class="title">Bảng 1. Tổng hợp giá trị ký, doanh thu và tiền về ${thoiDiem}</div>
      <div class="unit-note">Đvt: ${unitLabel}</div>
      <table>
        <thead>
          <tr>
            <th rowspan="2">TT</th>
            <th rowspan="2" style="min-width: 140px;">Đơn vị</th>
            <th rowspan="2" style="min-width: 110px;">Kế hoạch doanh thu đầu năm</th>
            <th colspan="2">Giá trị ký HĐKT</th>
            <th colspan="2">Giá trị doanh thu</th>
            <th colspan="4">Giá trị tiền về 2026</th>
            <th rowspan="2" style="min-width: 100px;">A nợ DThu 2026</th>
            <th rowspan="2" style="min-width: 100px;">${thangTiepTheo}</th>
          </tr>
          <tr>
            <th style="min-width: 95px;">Năm 2026</th>
            <th style="min-width: 70px;">% Kế hoạch đầu năm</th>
            <th style="min-width: 95px;">Năm 2026</th>
            <th style="min-width: 70px;">% Kế hoạch đầu năm</th>
            <th style="min-width: 95px;">Tổng tiền về 2026</th>
            <th style="min-width: 90px;">Trả Dthu năm trước</th>
            <th style="min-width: 90px;">Tiền về Dthu 2026</th>
            <th style="min-width: 85px;">A trả trước</th>
          </tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Dữ liệu chuẩn mốc Báo cáo giao ban KHKT tính tới 21.8.2026 (Historical Benchmark) ──
export const BANG_TONG_HOP_KHKT_BENCHMARK: BangTongHopKhktRow[] = [
  // I. CÁC VIỆN CHUYÊN NGÀNH
  {
    isHeader: true,
    group: 'I',
    code: '',
    name: 'I. Các Viện CN',
    khNghin: 0,
    ckNghin: 0,
    vienKyNghin: 0,
    dvKyNghin: 0,
    tongKyNghin: 0,
    pctKH: 0,
    pctCungKy: 0,
    ghiChu: '',
  },
  {
    stt: '1',
    code: 'VCNKC',
    name: 'Viện chuyên ngành Kết cấu công trình xây dựng (VKC)',
    khNghin: 70000000,
    ckNghin: 67747280,
    vienKyNghin: 2891992,
    dvKyNghin: 57723448,
    tongKyNghin: 60615440,
    pctKH: 87,
    pctCungKy: 89,
    ghiChu: '',
  },
  {
    stt: '2',
    code: 'VCNBT',
    name: 'Viện chuyên ngành Bê tông (VBT)',
    khNghin: 38600000,
    ckNghin: 20191235,
    vienKyNghin: 193671,
    dvKyNghin: 21686357,
    tongKyNghin: 21880028,
    pctKH: 57,
    pctCungKy: 108,
    ghiChu: '',
  },
  {
    stt: '3',
    code: 'Viện CNĐKT',
    name: 'Viện chuyên ngành Địa kỹ thuật (VĐKT)',
    khNghin: 22000000,
    ckNghin: 16050776,
    vienKyNghin: 72930,
    dvKyNghin: 38064879,
    tongKyNghin: 38137809,
    pctKH: 173,
    pctCungKy: 238,
    ghiChu: '',
  },

  // II. CÁC PHÂN VIỆN
  {
    isHeader: true,
    group: 'II',
    code: '',
    name: 'II. Các Phân Viện',
    khNghin: 0,
    ckNghin: 0,
    vienKyNghin: 0,
    dvKyNghin: 0,
    tongKyNghin: 0,
    pctKH: 0,
    pctCungKy: 0,
    ghiChu: '',
  },
  {
    stt: '4',
    code: 'PVMN',
    name: 'Phân Viện KHCN Xây dựng miền Nam',
    khNghin: 60500000,
    ckNghin: 23789989,
    vienKyNghin: 2471387,
    dvKyNghin: 58202989,
    tongKyNghin: 60674376,
    pctKH: 100,
    pctCungKy: 255,
    ghiChu: '',
  },
  {
    stt: '5',
    code: 'PVMT',
    name: 'Phân Viện KHCN Xây dựng miền Trung',
    isHighlighted: true,
    khNghin: 42000000,
    ckNghin: 36268364,
    vienKyNghin: 7160086,
    dvKyNghin: 946000,
    tongKyNghin: 8106086,
    pctKH: 19,
    pctCungKy: 22,
    ghiChu: 'PVMT cũ ko giao KH ký HĐ mới',
  },

  // III. CÁC TRUNG TÂM
  {
    isHeader: true,
    group: 'III',
    code: '',
    name: 'III. Các Trung tâm',
    khNghin: 0,
    ckNghin: 0,
    vienKyNghin: 0,
    dvKyNghin: 0,
    tongKyNghin: 0,
    pctKH: 0,
    pctCungKy: 0,
    ghiChu: '',
  },
  {
    stt: '6',
    code: 'TTTVTK&XD',
    name: 'Trung tâm tư vấn thiết kế và xây dựng (TTTK)',
    khNghin: 25000000,
    ckNghin: 34280507,
    vienKyNghin: 39615627,
    dvKyNghin: 23041680,
    tongKyNghin: 62657307,
    pctKH: 251,
    pctCungKy: 183,
    ghiChu: '',
  },
  {
    stt: '7',
    code: 'TT KC Thép & XD',
    name: 'Trung tâm Kết cấu thép và xây dựng (TTKCT)',
    khNghin: 24000000,
    ckNghin: 20162107,
    vienKyNghin: 14649186,
    dvKyNghin: 19227284,
    tongKyNghin: 33876470,
    pctKH: 141,
    pctCungKy: 168,
    ghiChu: '',
  },
  {
    stt: '8',
    code: 'TTTVC ĂM&XD',
    name: 'Trung tâm tư vấn chống ăn mòn và xây dựng (TTAM)',
    khNghin: 72200000,
    ckNghin: 74227557,
    vienKyNghin: 5312718,
    dvKyNghin: 92804370,
    tongKyNghin: 98117088,
    pctKH: 136,
    pctCungKy: 132,
    ghiChu: '',
  },
  {
    stt: '9',
    code: 'TTCNXD',
    name: 'Trung tâm công nghệ xây dựng',
    khNghin: 50000000,
    ckNghin: 60916109,
    vienKyNghin: 57061566,
    dvKyNghin: 34793862,
    tongKyNghin: 91855428,
    pctKH: 184,
    pctCungKy: 151,
    ghiChu: '',
  },
  {
    stt: '10',
    code: 'TTTVTĐịa&XD',
    name: 'Trung tâm tư vấn trắc địa và xây dựng (TTTD)',
    khNghin: 25800000,
    ckNghin: 47293696,
    vienKyNghin: 2198074,
    dvKyNghin: 25437230,
    tongKyNghin: 27635304,
    pctKH: 107,
    pctCungKy: 58,
    ghiChu: '',
  },
  {
    stt: '11',
    code: 'TTTVXDCN&HT',
    name: 'Trung tâm tư vấn xây dựng công nghiệp và hạ tầng (TTCNHT)',
    khNghin: 28000000,
    ckNghin: 29923810,
    vienKyNghin: 3493210,
    dvKyNghin: 40136594,
    tongKyNghin: 43629804,
    pctKH: 156,
    pctCungKy: 146,
    ghiChu: '',
  },
  {
    stt: '12',
    code: 'TTTVTB&XD',
    name: 'Trung tâm tư vấn thiết bị và xây dựng (TTTB)',
    khNghin: 40000000,
    ckNghin: 38561149,
    vienKyNghin: 9900678,
    dvKyNghin: 50825154,
    tongKyNghin: 60725832,
    pctKH: 152,
    pctCungKy: 157,
    ghiChu: '',
  },
  {
    stt: '13',
    code: 'TTPTCN&VLXD',
    name: 'Trung tâm phát triển công nghệ và vật liệu xây dựng (TTCN)',
    khNghin: 16000000,
    ckNghin: 13728161,
    vienKyNghin: 129000,
    dvKyNghin: 11283461,
    tongKyNghin: 11412461,
    pctKH: 71,
    pctCungKy: 83,
    ghiChu: '',
  },
  {
    stt: '14',
    code: 'TTCĐAQT&XD',
    name: 'Trung tâm các Dự án quốc tế và xây dựng (TTQT)',
    khNghin: 45000000,
    khIsRed: true,
    ckNghin: 49437953,
    vienKyNghin: 16301057,
    dvKyNghin: 67303138,
    tongKyNghin: 83604195,
    pctKH: 186,
    pctCungKy: 169,
    ghiChu: '',
  },
  {
    stt: '15',
    code: 'TTTV & UD BIM',
    name: 'Trung tâm Tư vấn và Ứng dụng Bim trong xây dựng (TTBIM)',
    isHighlighted: true,
    khNghin: 71800000,
    ckNghin: 91747268,
    vienKyNghin: 99774151,
    dvKyNghin: 2436675,
    tongKyNghin: 102210826,
    pctKH: 142,
    pctCungKy: 111,
    ghiChu: 'Gộp KH của BIM và TTMTay',
  },

  // IV. TỔNG VIỆN
  {
    isSubtotal: true,
    stt: 'IV',
    code: 'Tổng Viện',
    name: 'Tổng Khối Viện (15 đơn vị sự nghiệp)',
    khNghin: 692000000,
    ckNghin: 624325961,
    ckIsRed: true,
    vienKyNghin: 261225333,
    dvKyNghin: 543913121,
    tongKyNghin: 805138454,
    pctKH: 116,
    pctCungKy: 129,
    ghiChu: '',
  },

  // V. CÔNG TY CỔ PHẦN
  {
    isHeader: true,
    group: 'V',
    code: '',
    name: 'V. Công ty Cổ phần',
    khNghin: 0,
    ckNghin: 0,
    vienKyNghin: 0,
    dvKyNghin: 0,
    tongKyNghin: 0,
    pctKH: 0,
    pctCungKy: 0,
    ghiChu: '',
  },
  {
    stt: '16',
    code: 'IBST.COTEC',
    name: 'Công ty CP Đầu tư và Công nghệ Xây dựng IBST',
    khNghin: 58000000,
    ckNghin: 59918682,
    vienKyNghin: 0,
    dvKyNghin: 136597347,
    tongKyNghin: 136597347,
    pctKH: 236,
    pctCungKy: 228,
    ghiChu: '',
  },

  // TỔNG CỘNG
  {
    isGrandTotal: true,
    stt: '',
    code: 'Tổng cộng',
    name: 'Tổng cộng Toàn viện IBST',
    khNghin: 750000000,
    ckNghin: 684244643,
    ckIsRed: true,
    vienKyNghin: 261225333,
    dvKyNghin: 680510468,
    tongKyNghin: 941735801,
    pctKH: 126,
    pctCungKy: 138,
    ghiChu: '',
  },
];

/**
 * Xây dựng danh sách hàng Bảng tổng hợp KHKT từ dữ liệu View CSDL v_bang_tong_hop_khkt_2026
 */
export function buildBangTongHopKhktFromRows(dbRows: any[]): BangTongHopKhktRow[] {
  const vcn = dbRows.filter((r) => r.loai_don_vi === 'vien-chuyen-nganh');
  const pv = dbRows.filter((r) => r.loai_don_vi === 'phan-vien');
  const tt = dbRows.filter((r) => r.loai_don_vi === 'trung-tam');
  const ctcp = dbRows.filter((r) => r.loai_don_vi === 'cong-ty');

  const rows: BangTongHopKhktRow[] = [];
  let sttCounter = 1;

  // I. CÁC VIỆN CHUYÊN NGÀNH
  rows.push({
    isHeader: true,
    group: 'I',
    code: '',
    name: 'I. Các Viện CN',
    khNghin: 0,
    ckNghin: 0,
    vienKyNghin: 0,
    dvKyNghin: 0,
    tongKyNghin: 0,
    pctKH: 0,
    pctCungKy: 0,
    ghiChu: '',
  });

  for (const r of vcn) {
    rows.push({
      stt: String(sttCounter++),
      code: r.ten_viet_tat || r.ma_dinh_danh,
      name: r.ten_don_vi,
      khNghin: Number(r.kh_nghin) || 0,
      ckNghin: Number(r.ck_nghin) || 0,
      vienKyNghin: Number(r.vien_ky_nghin) || 0,
      dvKyNghin: Number(r.dv_ky_nghin) || 0,
      tongKyNghin: Number(r.tong_ky_nghin) || 0,
      pctKH: r.pct_kh || 0,
      pctCungKy: r.pct_cung_ky || 0,
      ghiChu: r.ghi_chu_ke_hoach || '',
    });
  }

  // II. CÁC PHÂN VIỆN
  rows.push({
    isHeader: true,
    group: 'II',
    code: '',
    name: 'II. Các Phân Viện',
    khNghin: 0,
    ckNghin: 0,
    vienKyNghin: 0,
    dvKyNghin: 0,
    tongKyNghin: 0,
    pctKH: 0,
    pctCungKy: 0,
    ghiChu: '',
  });

  for (const r of pv) {
    rows.push({
      stt: String(sttCounter++),
      code: r.ten_viet_tat || r.ma_dinh_danh,
      name: r.ten_don_vi,
      khNghin: Number(r.kh_nghin) || 0,
      ckNghin: Number(r.ck_nghin) || 0,
      vienKyNghin: Number(r.vien_ky_nghin) || 0,
      dvKyNghin: Number(r.dv_ky_nghin) || 0,
      tongKyNghin: Number(r.tong_ky_nghin) || 0,
      pctKH: r.pct_kh || 0,
      pctCungKy: r.pct_cung_ky || 0,
      ghiChu: r.ghi_chu_ke_hoach || '',
      isHighlighted: r.ma_dinh_danh === 'IBST.MT',
    });
  }

  // III. CÁC TRUNG TÂM
  rows.push({
    isHeader: true,
    group: 'III',
    code: '',
    name: 'III. Các Trung tâm',
    khNghin: 0,
    ckNghin: 0,
    vienKyNghin: 0,
    dvKyNghin: 0,
    tongKyNghin: 0,
    pctKH: 0,
    pctCungKy: 0,
    ghiChu: '',
  });

  for (const r of tt) {
    rows.push({
      stt: String(sttCounter++),
      code: r.ten_viet_tat || r.ma_dinh_danh,
      name: r.ten_don_vi,
      khNghin: Number(r.kh_nghin) || 0,
      ckNghin: Number(r.ck_nghin) || 0,
      vienKyNghin: Number(r.vien_ky_nghin) || 0,
      dvKyNghin: Number(r.dv_ky_nghin) || 0,
      tongKyNghin: Number(r.tong_ky_nghin) || 0,
      pctKH: r.pct_kh || 0,
      pctCungKy: r.pct_cung_ky || 0,
      ghiChu: r.ghi_chu_ke_hoach || '',
      isHighlighted: r.ma_dinh_danh === 'IBST.BIM',
    });
  }

  // IV. TỔNG VIỆN (15 đơn vị sự nghiệp + Khối Cơ quan Viện)
  const vienKh = 692000000;
  const vienCk = [...vcn, ...pv, ...tt].reduce((s, r) => s + (Number(r.ck_nghin) || 0), 0);
  const vienVienKy = [...vcn, ...pv, ...tt].reduce((s, r) => s + (Number(r.vien_ky_nghin) || 0), 0);
  const vienDvKy = [...vcn, ...pv, ...tt].reduce((s, r) => s + (Number(r.dv_ky_nghin) || 0), 0);
  const vienTongKy = vienVienKy + vienDvKy;

  rows.push({
    isSubtotal: true,
    stt: 'IV',
    code: 'Tổng Viện',
    name: 'Tổng Khối Viện (15 đơn vị sự nghiệp + Cơ quan Viện)',
    khNghin: vienKh,
    ckNghin: vienCk,
    ckIsRed: true,
    vienKyNghin: vienVienKy,
    dvKyNghin: vienDvKy,
    tongKyNghin: vienTongKy,
    pctKH: vienKh > 0 ? Math.round((vienTongKy / vienKh) * 100) : 0,
    pctCungKy: vienCk > 0 ? Math.round((vienTongKy / vienCk) * 100) : 0,
    ghiChu: '',
  });

  // V. CÔNG TY CỔ PHẦN
  rows.push({
    isHeader: true,
    group: 'V',
    code: '',
    name: 'V. Công ty Cổ phần',
    khNghin: 0,
    ckNghin: 0,
    vienKyNghin: 0,
    dvKyNghin: 0,
    tongKyNghin: 0,
    pctKH: 0,
    pctCungKy: 0,
    ghiChu: '',
  });

  for (const r of ctcp) {
    rows.push({
      stt: String(sttCounter++),
      code: r.ten_viet_tat || r.ma_dinh_danh,
      name: r.ten_don_vi,
      khNghin: Number(r.kh_nghin) || 0,
      ckNghin: Number(r.ck_nghin) || 0,
      vienKyNghin: Number(r.vien_ky_nghin) || 0,
      dvKyNghin: Number(r.dv_ky_nghin) || 0,
      tongKyNghin: Number(r.tong_ky_nghin) || 0,
      pctKH: r.pct_kh || 0,
      pctCungKy: r.pct_cung_ky || 0,
      ghiChu: r.ghi_chu_ke_hoach || '',
    });
  }

  // TỔNG CỘNG
  const tongKh = 750000000;
  const ctcpCk = ctcp.reduce((s, r) => s + (Number(r.ck_nghin) || 0), 0);
  const ctcpVienKy = ctcp.reduce((s, r) => s + (Number(r.vien_ky_nghin) || 0), 0);
  const ctcpDvKy = ctcp.reduce((s, r) => s + (Number(r.dv_ky_nghin) || 0), 0);

  const grandCk = vienCk + ctcpCk;
  const grandVienKy = vienVienKy + ctcpVienKy;
  const grandDvKy = vienDvKy + ctcpDvKy;
  const grandTongKy = grandVienKy + grandDvKy;

  rows.push({
    isGrandTotal: true,
    stt: '',
    code: 'Tổng cộng',
    name: 'Tổng cộng Toàn viện IBST',
    khNghin: tongKh,
    ckNghin: grandCk,
    ckIsRed: true,
    vienKyNghin: grandVienKy,
    dvKyNghin: grandDvKy,
    tongKyNghin: grandTongKy,
    pctKH: tongKh > 0 ? Math.round((grandTongKy / tongKh) * 100) : 0,
    pctCungKy: grandCk > 0 ? Math.round((grandTongKy / grandCk) * 100) : 0,
    ghiChu: '',
  });

  return rows;
}

/**
 * Đọc dữ liệu tính toán trực tiếp từ View CSDL v_bang_tong_hop_khkt_2026
 */
export async function fetchBangTongHopKhktLive(): Promise<BangTongHopKhktRow[]> {
  const { data, error } = await supabase
    .from('v_bang_tong_hop_khkt_2026')
    .select('*')
    .order('thu_tu');

  if (error) {
    console.error('Lỗi nạp v_bang_tong_hop_khkt_2026:', error);
    throw new Error(error.message);
  }

  return buildBangTongHopKhktFromRows(data || []);
}

/**
 * Xây dựng danh sách hàng Bảng 1 TCKT từ dữ liệu View CSDL v_bang_tong_hop_tckt_2026
 */
export function buildBangTongHopTcktFromRows(dbRows: any[]): BaoCaoTcktRow[] {
  const vcn = dbRows.filter((r) => r.loai_don_vi === 'vien-chuyen-nganh');
  const pv = dbRows.filter((r) => r.loai_don_vi === 'phan-vien');
  const tt = dbRows.filter((r) => r.loai_don_vi === 'trung-tam');
  const ctcp = dbRows.filter((r) => r.loai_don_vi === 'cong-ty');

  const rows: BaoCaoTcktRow[] = [];
  let sttCounter = 1;

  // Viện (Khối Cơ quan Viện)
  rows.push({
    stt: '',
    maDonVi: 'VIEN',
    tenDonVi: 'Viện',
    keHoachDauNam: null,
    kyNam2026: null,
    pctKyKH: null,
    doanhThu2026: 0,
    pctDtKH: 0,
    tongTienVe2026: 0,
    traDtNamTruoc: null,
    tienVeDt2026: 0,
    aTraTruoc: 19955,
    aNoDt2026: 0,
    khThangToi: 0,
  });

  const mapRow = (r: any, stt: string): BaoCaoTcktRow => ({
    stt,
    maDonVi: r.ten_viet_tat || r.ma_dinh_danh,
    tenDonVi: r.ten_don_vi,
    keHoachDauNam: Number(r.kh_nghin) || 0,
    kyNam2026: Number(r.ky_nam_2026_nghin) || 0,
    pctKyKH: r.pct_ky_kh || 0,
    doanhThu2026: Number(r.doanh_thu_2026_nghin) || 0,
    pctDtKH: r.pct_dt_kh || 0,
    tongTienVe2026: Number(r.tong_tien_ve_2026_nghin) || 0,
    traDtNamTruoc: Number(r.tra_dt_nam_truoc_nghin) || 0,
    tienVeDt2026: Number(r.tien_ve_dt_2026_nghin) || 0,
    aTraTruoc: Number(r.a_tra_truoc_nghin) || 0,
    aNoDt2026: Number(r.a_no_dt_2026_nghin) || 0,
    khThangToi: 1000000,
  });

  // 1. Các Viện chuyên ngành
  rows.push({ isHeader: true, groupTitle: 'Các Viện chuyên ngành', maDonVi: '', tenDonVi: '' });
  for (const r of vcn) rows.push(mapRow(r, String(sttCounter++)));

  // 2. Các Phân viện
  rows.push({ isHeader: true, groupTitle: 'Các Phân viện', maDonVi: '', tenDonVi: '' });
  for (const r of pv) rows.push(mapRow(r, String(sttCounter++)));

  // 3. Các Trung tâm
  rows.push({ isHeader: true, groupTitle: 'Các Trung tâm', maDonVi: '', tenDonVi: '' });
  for (const r of tt) rows.push(mapRow(r, String(sttCounter++)));

  // Tổng Viện
  const vienUnits = [...vcn, ...pv, ...tt];
  const vienKh = 692000000;
  const vienKy = vienUnits.reduce((s, r) => s + (Number(r.ky_nam_2026_nghin) || 0), 0);
  const vienDt = vienUnits.reduce((s, r) => s + (Number(r.doanh_thu_2026_nghin) || 0), 0);
  const vienTv = vienUnits.reduce((s, r) => s + (Number(r.tong_tien_ve_2026_nghin) || 0), 0);
  const vienTraDtNt = vienUnits.reduce((s, r) => s + (Number(r.tra_dt_nam_truoc_nghin) || 0), 0);
  const vienTvDt = vienUnits.reduce((s, r) => s + (Number(r.tien_ve_dt_2026_nghin) || 0), 0);
  const vienAtraTruoc = vienUnits.reduce((s, r) => s + (Number(r.a_tra_truoc_nghin) || 0), 0) + 19955;
  const vienAno = vienUnits.reduce((s, r) => s + (Number(r.a_no_dt_2026_nghin) || 0), 0);

  rows.push({
    stt: '',
    maDonVi: 'TONG_VIEN',
    tenDonVi: 'Tổng Viện',
    isTongVien: true,
    keHoachDauNam: vienKh,
    kyNam2026: vienKy,
    pctKyKH: vienKh > 0 ? Math.round((vienKy / vienKh) * 100) : 0,
    doanhThu2026: vienDt,
    pctDtKH: vienKh > 0 ? Math.round((vienDt / vienKh) * 100) : 0,
    tongTienVe2026: vienTv,
    traDtNamTruoc: vienTraDtNt,
    tienVeDt2026: vienTvDt,
    aTraTruoc: vienAtraTruoc,
    aNoDt2026: vienAno,
    khThangToi: 30000000,
  });

  // 4. Công ty cổ phần
  rows.push({ isHeader: true, groupTitle: 'Công ty cổ phần', maDonVi: '', tenDonVi: '' });
  for (const r of ctcp) rows.push(mapRow(r, String(sttCounter++)));

  // Tổng cộng Toàn viện
  const tongKh = 750000000;
  const ctcpKy = ctcp.reduce((s, r) => s + (Number(r.ky_nam_2026_nghin) || 0), 0);
  const ctcpDt = ctcp.reduce((s, r) => s + (Number(r.doanh_thu_2026_nghin) || 0), 0);
  const ctcpTv = ctcp.reduce((s, r) => s + (Number(r.tong_tien_ve_2026_nghin) || 0), 0);
  const ctcpTraDtNt = ctcp.reduce((s, r) => s + (Number(r.tra_dt_nam_truoc_nghin) || 0), 0);
  const ctcpTvDt = ctcp.reduce((s, r) => s + (Number(r.tien_ve_dt_2026_nghin) || 0), 0);
  const ctcpAtraTruoc = ctcp.reduce((s, r) => s + (Number(r.a_tra_truoc_nghin) || 0), 0);
  const ctcpAno = ctcp.reduce((s, r) => s + (Number(r.a_no_dt_2026_nghin) || 0), 0);

  const grandKy = vienKy + ctcpKy;
  const grandDt = vienDt + ctcpDt;
  const grandTv = vienTv + ctcpTv;
  const grandTraDtNt = vienTraDtNt + ctcpTraDtNt;
  const grandTvDt = vienTvDt + ctcpTvDt;
  const grandAtraTruoc = vienAtraTruoc + ctcpAtraTruoc;
  const grandAno = vienAno + ctcpAno;

  rows.push({
    stt: '',
    maDonVi: 'TONG_CONG',
    tenDonVi: 'Tổng cộng Toàn viện',
    isTongCong: true,
    keHoachDauNam: tongKh,
    kyNam2026: grandKy,
    pctKyKH: tongKh > 0 ? Math.round((grandKy / tongKh) * 100) : 0,
    doanhThu2026: grandDt,
    pctDtKH: tongKh > 0 ? Math.round((grandDt / tongKh) * 100) : 0,
    tongTienVe2026: grandTv,
    traDtNamTruoc: grandTraDtNt,
    tienVeDt2026: grandTvDt,
    aTraTruoc: grandAtraTruoc,
    aNoDt2026: grandAno,
    khThangToi: 30000000,
  });

  return rows;
}

/**
 * Đọc dữ liệu tính toán trực tiếp từ View CSDL v_bang_tong_hop_tckt_2026
 */
export async function fetchBangTongHopTcktLive(): Promise<BaoCaoTcktRow[]> {
  const { data, error } = await supabase
    .from('v_bang_tong_hop_tckt_2026')
    .select('*')
    .order('thu_tu');

  if (error) {
    console.error('Lỗi nạp v_bang_tong_hop_tckt_2026:', error);
    throw new Error(error.message);
  }

  return buildBangTongHopTcktFromRows(data || []);
}



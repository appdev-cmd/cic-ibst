import { FunctionDeclaration, SchemaType as Type } from './geminiProxy';

export const AI_TOOLS_IBST: FunctionDeclaration[] = [
  {
    name: 'get_hop_dong_list',
    description: 'Lấy danh sách hợp đồng tư vấn/dịch vụ KHCN. Dùng khi user hỏi về hợp đồng, số lượng hợp đồng, hợp đồng theo trạng thái hoặc đơn vị.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        trang_thai: { type: Type.STRING, description: 'Lọc theo trạng thái: dang-thuc-hien, da-quyet-toan, tam-dung, hoan-thanh, huy' },
        don_vi: { type: Type.STRING, description: 'Tên hoặc mã đơn vị chủ trì (ví dụ: VKC, VBT, TTAM)' },
        search: { type: Type.STRING, description: 'Từ khóa tìm kiếm tên hợp đồng hoặc số hợp đồng' },
      },
    },
  },
  {
    name: 'get_hop_dong_detail',
    description: 'Lấy thông tin chi tiết đầy đủ của một hợp đồng (gồm thông tin chung, cán bộ chủ trì phụ trách kèm họ tên chức vụ, đơn vị thực hiện, chủ đầu tư/khách hàng, các đợt thanh toán, tiến độ). Dùng khi hỏi về chi tiết hợp đồng, ai phụ trách hợp đồng, tiến độ thanh toán.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        hopDongId: { type: Type.STRING, description: 'ID hoặc Số hiệu hợp đồng (ví dụ: "1904/2026/HDTV-TTBIM", "1904", "195") cần xem chi tiết hoặc hỏi người phụ trách' },
        so_hop_dong: { type: Type.STRING, description: 'Số hiệu hợp đồng (tùy chọn)' },
      },
      required: ['hopDongId'],
    },
  },
  {
    name: 'get_tai_chinh_overview',
    description: 'Lấy tổng quan thông tin tài chính: giá trị ký, doanh thu, công nợ. Dùng khi user hỏi tình hình doanh thu, công nợ.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        don_vi: { type: Type.STRING, description: 'Tên hoặc mã đơn vị (nếu muốn lọc theo đơn vị)' },
      },
    },
  },
  {
    name: 'get_nhan_su_info',
    description: 'Lấy thông tin cán bộ, nhân sự (họ và tên cụ thể, chức danh, chức vụ, email, số điện thoại, đơn vị). Dùng khi hỏi về một cán bộ cụ thể, ai phụ trách, hoặc tra cứu theo mã số ID nhân sự.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        search: { type: Type.STRING, description: 'Họ tên cán bộ hoặc ID cán bộ cần tra cứu (ví dụ: "Nguyễn Anh Tuấn", "784")' },
        don_vi: { type: Type.STRING, description: 'Tên hoặc mã đơn vị để lọc nhân sự' },
      },
    },
  },
  {
    name: 'get_don_vi_stats',
    description: 'Lấy thống kê về một đơn vị (số lượng hợp đồng, nhân sự). Dùng khi user hỏi thông tin tổng quát về một đơn vị.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        ma_don_vi: { type: Type.STRING, description: 'Mã đơn vị (ví dụ: VKC, TTAM)' },
      },
    },
  },
  {
    name: 'get_de_tai_khcn',
    description: 'Lấy danh sách đề tài KHCN. Dùng khi user hỏi về các đề tài nghiên cứu khoa học.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        search: { type: Type.STRING, description: 'Từ khóa tên đề tài hoặc mã số' },
        trang_thai: { type: Type.STRING, description: 'Lọc theo trạng thái đề tài' },
      },
    },
  },
  {
    name: 'get_mau_thu_las',
    description: 'Lấy thông tin mẫu thử phòng thí nghiệm (LAS). Dùng khi user hỏi về các mẫu thử nghiệm vật liệu, bê tông, kiểm định.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        search: { type: Type.STRING, description: 'Từ khóa tên mẫu, mã phẫu, hoặc phép thử' },
      },
    },
  },
  {
    name: 'get_van_ban_list',
    description: 'Lấy danh sách văn bản đến và đi. Dùng khi hỏi về công văn, văn bản chỉ đạo.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        loai: { type: Type.STRING, description: 'Loại văn bản: den hoặc di' },
        search: { type: Type.STRING, description: 'Từ khóa số hiệu hoặc trích yếu văn bản' },
      },
    },
  },
  {
    name: 'get_cong_viec_list',
    description: 'Lấy danh sách công việc được giao. Dùng khi user hỏi về công việc, tiến độ, task.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        trang_thai: { type: Type.STRING, description: 'Trạng thái công việc: pending, in_progress, completed' },
      },
    },
  },
  {
    name: 'get_dashboard_kpi',
    description: 'Lấy số liệu KPI tổng hợp từ dashboard (doanh thu, lợi nhuận, hoàn thành kế hoạch).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        year: { type: Type.STRING, description: 'Năm cần xem' },
      },
    },
  },
  {
    name: 'search_qcvn_tcvn',
    description: 'Tìm kiếm thông tin trong các quy chuẩn, tiêu chuẩn (QCVN, TCVN). Dùng khi user hỏi về quy định, tiêu chuẩn chuyên ngành.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING, description: 'Câu hỏi hoặc từ khóa tìm kiếm trong tiêu chuẩn' },
        loai_van_ban: { type: Type.STRING, description: 'Loại: qcvn hoặc tcvn' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_lich_co_quan',
    description: 'Lấy lịch công tác cơ quan. Dùng khi user hỏi về lịch tuần, sự kiện trong tháng.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        thang: { type: Type.STRING, description: 'Tháng cần xem (1-12)' },
        nam: { type: Type.STRING, description: 'Năm cần xem' },
      },
    },
  },
  {
    name: 'get_canh_bao_2815',
    description: 'Lấy danh sách cảnh báo vi phạm quy chế 2815 (trễ hạn hợp đồng, quá hạn thanh toán).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        muc_do: { type: Type.STRING, description: 'Mức độ cảnh báo: cao, trung_binh, thap' },
      },
    },
  },
  {
    name: 'create_lich_cong_tac',
    description: 'Tạo lịch công tác mới. Tool GHI dữ liệu.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Tiêu đề lịch công tác' },
        event_date: { type: Type.STRING, description: 'Ngày sự kiện (YYYY-MM-DD)' },
        start_time: { type: Type.STRING, description: 'Giờ bắt đầu (HH:mm)' },
        end_time: { type: Type.STRING, description: 'Giờ kết thúc (HH:mm)' },
        location: { type: Type.STRING, description: 'Địa điểm' },
        description: { type: Type.STRING, description: 'Mô tả chi tiết' },
        event_type: { type: Type.STRING, description: 'Loại sự kiện (hop, cong-tac, khac)' },
      },
      required: ['title', 'event_date'],
    },
  },
  {
    name: 'create_cong_viec',
    description: 'Tạo công việc/task mới. Tool GHI dữ liệu.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Tên công việc' },
        assignee_name: { type: Type.STRING, description: 'Người được giao' },
        due_date: { type: Type.STRING, description: 'Hạn hoàn thành (YYYY-MM-DD)' },
        description: { type: Type.STRING, description: 'Mô tả chi tiết' },
        priority: { type: Type.STRING, description: 'Độ ưu tiên (cao, trung_binh, thap)' },
      },
      required: ['title'],
    },
  },
];

export const WRITE_TOOL_NAMES = new Set(['create_lich_cong_tac', 'create_cong_viec']);

import { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Users,
  MapPin,
  Activity,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Building,
  Calendar,
  Layers,
  Award,
  ShieldCheck,
  Info,
  ExternalLink,
  Flame,
  Wrench,
  Compass
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- MOCK DATA FOR ALL SITEMAP SECTIONS ---

// 1. Giới thiệu - Lãnh đạo viện
const LEADERS = [
  { name: 'GS. TS. Nguyễn Xuân Khang', role: 'Viện trưởng / Chủ tịch Hội đồng khoa học', phone: '024 37544196', email: 'khangnx@ibst.vn', room: 'Phòng 402 - Nhà điều hành' },
  { name: 'PGS. TS. Trần Việt Hùng', role: 'Phó Viện trưởng phụ trách Nghiên cứu khoa học & Quy chuẩn', phone: '024 37544197', email: 'hungtv@ibst.vn', room: 'Phòng 403 - Nhà điều hành' },
  { name: 'TS. Nguyễn Hồng Hải', role: 'Phó Viện trưởng phụ trách Đào tạo & Phục vụ QLNN', phone: '024 37544198', email: 'hainh@ibst.vn', room: 'Phòng 404 - Nhà điều hành' },
  { name: 'TS. Lê Minh Long', role: 'Phó Viện trưởng phụ trách Hợp tác quốc tế & Chuyên môn', phone: '024 37544199', email: 'longlm@ibst.vn', room: 'Phòng 405 - Nhà điều hành' },
];

// 2. Giới thiệu - Các đơn vị trực thuộc (21 đơn vị tiêu biểu)
const UNITS = [
  { code: 'P.QLKH', name: 'Phòng Quản lý Khoa học & Tiêu chuẩn', type: 'Nghiệp vụ', head: 'TS. Vũ Thành Trung' },
  { code: 'P.KHTC', name: 'Phòng Kế hoạch Tài chính', type: 'Nghiệp vụ', head: 'ThS. Nguyễn Thị Mai' },
  { code: 'P.TCHC', name: 'Phòng Tổ chức Hành chính', type: 'Nghiệp vụ', head: 'ThS. Lê Hoàng Nam' },
  { code: 'PVMN', name: 'Phân viện KHCN Xây dựng miền Nam', type: 'Phân viện trực thuộc', head: 'PGS. TS. Lê Văn Huy', loc: 'TP. Hồ Chí Minh' },
  { code: 'PVMT', name: 'Phân viện KHCN Xây dựng miền Trung', type: 'Phân viện trực thuộc', head: 'TS. Nguyễn Quốc Đạt', loc: 'Đà Nẵng' },
  { code: 'IBST-COTEC', name: 'Trung tâm Tư vấn Thiết kế và Xây dựng', type: 'Chuyên môn', head: 'ThS. Đỗ Duy Hải' },
  { code: 'IBST-LIMS', name: 'Văn phòng Công nhận Chất lượng Phòng thí nghiệm', type: 'Chuyên môn', head: 'TS. Hoàng Minh Đức' },
  { code: 'TT.ĐB', name: 'Trung tâm Địa kỹ thuật và Trắc địa công trình', type: 'Chuyên môn', head: 'TS. Phạm Anh Tuấn' },
  { code: 'TT.BT', name: 'Trung tâm Bê tông & Vật liệu xây dựng', type: 'Chuyên môn', head: 'PGS. TS. Hoàng Minh Giang' },
  { code: 'TT.KC', name: 'Trung tâm Kết cấu công trình xây dựng', type: 'Chuyên môn', head: 'TS. Bùi Danh Nam' },
];

// 3. Giới thiệu - Hệ thống Phòng thí nghiệm
const LABS = [
  { code: 'LAS-XD 01', name: 'Phòng thí nghiệm Trọng điểm Quốc gia về Đường bộ & Địa kỹ thuật', type: 'Cấp Quốc gia', capacity: 'Đầy đủ chỉ tiêu đất, đá, nền móng, neo, cọc khoan nhồi đường kính lớn.' },
  { code: 'LAS-XD 18', name: 'Phòng thí nghiệm Chịu lửa và Phòng cháy chữa cháy', type: 'Cấp Bộ', capacity: 'Đo lường giới hạn chịu lửa của cấu kiện đứng, ngang, cửa chống cháy, ống gió.' },
  { code: 'LAS-XD 25', name: 'Phòng thí nghiệm Kết cấu công trình & Thử nghiệm động lực học', type: 'Cấp Viện', capacity: 'Thử nghiệm tải trọng tĩnh, động, mỏi, rung chấn trên mô hình tỷ lệ lớn.' },
  { code: 'LAS-XD 38', name: 'Phòng thí nghiệm Bê tông & Hóa phẩm xây dựng', type: 'Cấp Viện', capacity: 'Phân tích cấp phối bê tông cường độ siêu cao (UHPC), bê tông tự lèn, ăn mòn cốt thép.' },
  { code: 'LAS-XD 102', name: 'Phòng thí nghiệm Vật lý kiến trúc & Tiết kiệm năng lượng', type: 'Cấp Viện', capacity: 'Đo lường cách âm, cách nhiệt của tường kính, cửa sổ, vật liệu bao che.' }
];

// 4. Tin tức & Phục vụ QLNN
const NEWS_ARTICLES = [
  {
    id: 'n1',
    category: 'tin-hoat-dong',
    title: 'Hội thảo Quốc tế về Xu hướng Biên soạn Quy chuẩn Phòng cháy chữa cháy cho Nhà và Công trình',
    date: '2026-07-15',
    summary: 'IBST chủ trì hội thảo thảo luận các nội dung soát xét QCVN 06 mới nhằm phù hợp thực tiễn phát triển đô thị Việt Nam và tiệm cận tiêu chuẩn quốc tế ISO, NFPA.',
    content: 'Ngày 15/07/2026, Viện Khoa học công nghệ xây dựng (IBST) đã phối hợp với các chuyên gia cứu hỏa quốc tế tổ chức Hội thảo kỹ thuật lớn bàn về phương hướng sửa đổi Quy chuẩn kỹ thuật quốc gia về An toàn cháy cho nhà và công trình (QCVN 06:2026/BXD). Tại hội thảo, PGS. TS. Trần Việt Hùng đã trình bày báo cáo về các giải pháp kỹ thuật an toàn phòng cháy chủ động và thụ động, các phương pháp tính toán giới hạn chịu lửa cấu kiện phù hợp với năng lực thử nghiệm lò đứng, lò ngang tại trạm thử nghiệm chịu lửa quốc gia Hòa Lạc.',
    author: 'Phòng Quản lý Khoa học'
  },
  {
    id: 'n2',
    category: 'du-an-trong-diem',
    title: 'Nghiệm thu gói thầu Kiểm định độc lập chất lượng thi công Nhà ga hành khách - Cảng hàng không Quốc tế Long Thành',
    date: '2026-06-28',
    summary: 'Đoàn công tác của Hội đồng kiểm tra nhà nước và Lãnh đạo IBST đã tiến hành đánh giá chất lượng thi công bê tông khối lớn móng và kết cấu thép mái vòm dự án Long Thành.',
    content: 'Là đơn vị tư vấn kiểm định đầu ngành phục vụ Hội đồng Kiểm tra Nhà nước về công tác nghiệm thu công trình xây dựng, IBST đã thiết lập văn phòng hiện trường và huy động hệ thống thiết bị siêu âm bê tông khuyết tật, đo ứng suất cốt thép nhập khẩu từ Đức để kiểm tra chất lượng kết cấu nhà ga Long Thành. Báo cáo độc lập của Viện được hội đồng đánh giá cao, đảm bảo chất lượng công trình an toàn tuyệt đối trước khi bước sang giai đoạn hoàn thiện nội thất.',
    author: 'Trung tâm Địa kỹ thuật'
  },
  {
    id: 'n3',
    category: 'quy-chuan-tieu-chuan',
    title: 'Biên soạn Tiêu chuẩn Quốc gia TCVN về Thiết kế Địa kỹ thuật - Móng cọc theo định hướng mới Eurocode 7',
    date: '2026-05-18',
    summary: 'IBST hoàn thiện dự thảo soát xét tiêu chuẩn thiết kế móng cọc, áp dụng phương pháp thiết kế theo trạng thái giới hạn (Limit State Design) đồng bộ hóa với hệ thống tiêu chuẩn Eurocode.',
    content: 'Nhiệm vụ biên soạn tiêu chuẩn do Bộ Xây dựng giao Viện KHCN Xây dựng chủ trì thực hiện nhằm thay thế các tiêu chuẩn cũ vốn tính toán dựa trên hệ số an toàn đơn nhất (global safety factor). Tiêu chuẩn mới đưa vào các hệ số an toàn riêng (partial factors) cho tải trọng và sức chịu tải của đất nền, giúp tính toán móng cọc tối ưu kinh tế mà vẫn đảm bảo độ tin cậy kết cấu theo thông lệ quốc tế.',
    author: 'Phòng Quản lý Khoa học'
  },
  {
    id: 'n4',
    category: 'tin-lien-quan',
    title: 'Hợp tác nghiên cứu với Viện Khoa học Xây dựng Hàn Quốc (KICT) về công nghệ bê tông Carbon thấp',
    date: '2026-04-12',
    summary: 'Biên bản ghi nhớ hợp tác song phương tập trung vào việc nghiên cứu ứng dụng xỉ lò cao và tro bay hoạt tính cao để giảm thiểu 40% lượng phát thải CO2 trong sản xuất bê tông thương phẩm.',
    content: 'Lễ ký kết diễn ra trực tuyến giữa Viện trưởng IBST GS. TS. Nguyễn Xuân Khang và đại diện KICT. Chương trình hợp tác kéo dài 3 năm bao gồm thử nghiệm phòng thí nghiệm song song và chuyển giao thiết bị phân tích hoạt tính phụ gia khoáng siêu mịn.',
    author: 'Hợp tác quốc tế'
  }
];

// 5. Khoa học & Công nghệ (Đề tài - Dự án thực tế từ tìm kiếm)
const RESEARCH_PROJECTS = [
  {
    id: 'p1',
    code: 'TC24-20',
    title: 'Bê tông - Phương pháp lựa chọn thành phần cấp phối theo định hướng mới',
    leader: 'ThS. Nguyễn Văn Danh',
    funding: 450, // triệu VNĐ
    year: '2022',
    status: 'Đã nghiệm thu',
    type: 'Đề tài cấp Viện',
    summary: 'Nghiên cứu xây dựng quy trình thực hành thiết kế cấp phối bê tông dựa trên hiệu suất sử dụng chất kết dính và tính công tác thực tế, thay thế cho phương pháp chọn cấp phối truyền thống.',
    details: 'Đề tài tập trung giải quyết bài toán tối ưu lượng xi măng sử dụng nhằm giảm phát nhiệt khi thi công bê tông khối lớn, đồng thời nâng cao độ bền của bê tông trong môi trường khí hậu nhiệt đới ẩm Việt Nam. Kết quả đã ứng dụng thực tế tại 3 trạm trộn bê tông lớn ở Hà Nội.'
  },
  {
    id: 'p2',
    code: 'TC 19-21',
    title: 'Nghiên cứu soát xét tiêu chuẩn quốc gia TCVN 9311-1:2012 Thử nghiệm chịu lửa – các bộ phận công trình xây dựng',
    leader: 'TS. Lê Minh Long',
    funding: 780,
    year: '2022',
    status: 'Đã nghiệm thu',
    type: 'Đề tài cấp Bộ',
    summary: 'Soát xét và cập nhật phương pháp đo đạc nhiệt độ, kiểm soát áp suất lò thử nghiệm chịu lửa cấu kiện theo tiêu chuẩn quốc tế ISO 834-1.',
    details: 'Đề tài cung cấp cơ sở khoa học để sửa đổi quy trình kiểm tra các cấu kiện ngăn cháy (cửa, vách, cột) tại Việt Nam, phục vụ công tác cấp chứng nhận phòng cháy chữa cháy của các cơ quan quản lý. Tiêu chuẩn mới khắc phục được các sai lệch nhiệt độ trong quá trình thử lửa thực tế.'
  },
  {
    id: 'p3',
    code: 'RD 26-21',
    title: 'Nghiên cứu biên soạn tài liệu kỹ thuật phổ biến và hướng dẫn phòng chống thiên tai, lũ lụt cho nhà ở vùng ngập lũ',
    leader: 'TS. Nguyễn Hồng Hải',
    funding: 920,
    year: '2022',
    status: 'Đã nghiệm thu',
    type: 'Nhiệm vụ cấp Nhà nước',
    summary: 'Khảo sát và đề xuất các mô hình kết cấu nhà ở kiên cố chống bão, nhà phao tự nổi thích ứng với lũ quét vùng miền Trung và ngập lụt đồng bằng sông Cửu Long.',
    details: 'Tài liệu hướng dẫn đã được in ấn 5,000 bản và chuyển giao cho Sở Xây dựng các tỉnh Quảng Bình, Hà Tĩnh, Quảng Nam ứng dụng hỗ trợ người dân xây nhà an toàn tránh lũ.'
  },
  {
    id: 'p4',
    code: 'RD 120-20',
    title: 'Nghiên cứu cơ sở khoa học xây dựng tiêu chuẩn Thiết kế địa kỹ thuật – Thiết kế móng cọc theo định hướng mới Eurocode',
    leader: 'PGS. TS. Trần Việt Hùng',
    funding: 1200,
    year: '2023',
    status: 'Đã nghiệm thu',
    type: 'Đề tài cấp Bộ',
    summary: 'Nghiên cứu chuyển đổi triết lý thiết kế móng cọc sang Eurocode 7, xác lập hệ số an toàn riêng (partial safety factors) phù hợp với địa chất các đô thị lớn tại Việt Nam.',
    details: 'Đóng vai trò quan trọng trong việc thống nhất tiêu chuẩn tính toán kết cấu Việt Nam với hệ thống tiêu chuẩn Châu Âu. Đề tài đã phân tích dữ liệu thí nghiệm nén tĩnh hơn 200 cọc khoan nhồi trên toàn quốc để tối ưu hóa hệ số kháng đất nền.'
  },
  {
    id: 'p5',
    code: 'RD 45-23',
    title: 'Nghiên cứu ứng dụng sợi polyme gia cường (FRP) trong sửa chữa, gia cường cầu đường bộ bê tông cốt thép bị xuống cấp',
    leader: 'TS. Bùi Danh Nam',
    funding: 650,
    year: '2024',
    status: 'Đang thực hiện',
    type: 'Đề tài cấp Bộ',
    summary: 'Đánh giá khả năng chịu uốn và cắt của dầm bê tông cốt thép gia cường bằng tấm sợi carbon (CFRP) dưới tác động của tải trọng lặp động lực học.',
    details: 'Đề tài đang triển khai thử nghiệm mỏi tại phòng thí nghiệm trọng điểm. Dự kiến đưa ra hướng dẫn thi công dán tấm FRP đạt hiệu quả tối ưu cho các đơn vị duy tu giao thông.'
  }
];

export function IbstPortalPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'intro' | 'news' | 'state-gov' | 'research'>('home');
  const [activeSubTab, setActiveSubTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Khôi phục bộ lọc khi đổi Tab chính
  const handleTabChange = (tab: any, subTabDefault = 'all') => {
    setActiveTab(tab);
    setActiveSubTab(subTabDefault);
    setSelectedArticle(null);
    setSelectedProject(null);
  };

  // --- FILTER LOGIC FOR PROJECTS & NEWS ---

  const filteredProjects = useMemo(() => {
    return RESEARCH_PROJECTS.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.leader.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = activeSubTab === 'all' || p.type.toLowerCase().includes(activeSubTab.toLowerCase());
      const matchesYear = selectedYear === 'all' || p.year === selectedYear;

      return matchesSearch && matchesType && matchesYear;
    });
  }, [activeSubTab, searchQuery, selectedYear]);

  const filteredNews = useMemo(() => {
    return NEWS_ARTICLES.filter((art) => {
      const matchesSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCat = activeSubTab === 'all' || art.category === activeSubTab;

      return matchesSearch && matchesCat;
    });
  }, [activeSubTab, searchQuery]);

  return (
    <div className="min-h-screen bg-page text-ink transition-all">
      {/* ─── WEB PORTAL HEADER ─── */}
      <div className="border-b border-border bg-surface px-6 py-3 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-white rounded-xl shadow-md border border-border flex items-center justify-center p-1.5 overflow-hidden">
            <img src="https://ibst.vn/templates/e4cms/images/icon/logo5.png" alt="Logo IBST" className="object-contain" />
          </div>
          <div>
            <h1 className="text-md font-black tracking-tight text-primary-500 uppercase">
              {lang === 'vi' ? 'Viện Khoa học Công nghệ Xây dựng' : 'Institute for Building Science and Technology'}
            </h1>
            <p className="text-3xs font-semibold text-ink-muted tracking-wider uppercase mt-0.5">
              Bộ Xây Dựng — IBST Portal Module
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-4 text-ink-secondary hidden lg:flex font-medium">
            <div className="flex items-center gap-1.5">
              <Phone size={13} className="text-primary-500" />
              <span>024 37544196</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail size={13} className="text-primary-500" />
              <span>vkhcnxd@ibst.vn</span>
            </div>
          </div>

          {/* Ngôn ngữ */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
            <button
              onClick={() => setLang('vi')}
              className={cn(
                "px-2.5 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer",
                lang === 'vi' ? "bg-surface text-primary shadow-sm" : "text-ink-muted hover:text-ink"
              )}
            >
              Tiếng Việt
            </button>
            <button
              onClick={() => setLang('en')}
              className={cn(
                "px-2.5 py-1 text-2xs font-bold rounded-md transition-all cursor-pointer",
                lang === 'en' ? "bg-surface text-primary shadow-sm" : "text-ink-muted hover:text-ink"
              )}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* ─── WEB PORTAL NAVIGATION (SITEMAP MEGA MENU) ─── */}
      <div className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md shadow-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            <div className="flex space-x-1 overflow-x-auto scrollbar-none py-1.5">
              <button
                onClick={() => handleTabChange('home')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-2xs font-bold whitespace-nowrap transition-all cursor-pointer",
                  activeTab === 'home'
                    ? "bg-primary-500 text-white"
                    : "text-ink-secondary hover:bg-muted hover:text-ink"
                )}
              >
                {lang === 'vi' ? 'Trang chủ' : 'Home'}
              </button>

              {/* Giới thiệu */}
              <div className="relative group">
                <button
                  onClick={() => handleTabChange('intro', 'all')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-2xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer",
                    activeTab === 'intro'
                      ? "bg-primary-500 text-white"
                      : "text-ink-secondary hover:bg-muted hover:text-ink"
                  )}
                >
                  {lang === 'vi' ? 'Giới thiệu' : 'Introduction'}
                  <ChevronDown size={10} />
                </button>
                <div className="absolute left-0 mt-1 w-52 bg-surface border border-border shadow-dropdown rounded-xl py-2 hidden group-hover:block z-40 animate-fade-in">
                  <button onClick={() => handleTabChange('intro', 'nhiem-vu')} className="w-full text-left px-4 py-2 text-2xs font-bold text-ink hover:bg-muted hover:text-primary transition-colors">
                    {lang === 'vi' ? 'Chức năng nhiệm vụ' : 'Functions & Tasks'}
                  </button>
                  <button onClick={() => handleTabChange('intro', 'co-cau')} className="w-full text-left px-4 py-2 text-2xs font-bold text-ink hover:bg-muted hover:text-primary transition-colors">
                    {lang === 'vi' ? 'Cơ cấu tổ chức' : 'Organizational Structure'}
                  </button>
                  <button onClick={() => handleTabChange('intro', 'phong-lab')} className="w-full text-left px-4 py-2 text-2xs font-bold text-ink hover:bg-muted hover:text-primary transition-colors">
                    {lang === 'vi' ? 'Hệ thống phòng thí nghiệm' : 'Laboratories System'}
                  </button>
                </div>
              </div>

              {/* Tin tức */}
              <div className="relative group">
                <button
                  onClick={() => handleTabChange('news', 'all')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-2xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer",
                    activeTab === 'news'
                      ? "bg-primary-500 text-white"
                      : "text-ink-secondary hover:bg-muted hover:text-ink"
                  )}
                >
                  {lang === 'vi' ? 'Tin tức' : 'News'}
                  <ChevronDown size={10} />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-surface border border-border shadow-dropdown rounded-xl py-2 hidden group-hover:block z-40 animate-fade-in">
                  <button onClick={() => handleTabChange('news', 'tin-hoat-dong')} className="w-full text-left px-4 py-2 text-2xs font-bold text-ink hover:bg-muted hover:text-primary transition-colors">
                    Tin hoạt động
                  </button>
                  <button onClick={() => handleTabChange('news', 'tin-lien-quan')} className="w-full text-left px-4 py-2 text-2xs font-bold text-ink hover:bg-muted hover:text-primary transition-colors">
                    Tin liên quan
                  </button>
                </div>
              </div>

              {/* Phục vụ QLNN */}
              <div className="relative group">
                <button
                  onClick={() => handleTabChange('state-gov', 'all')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-2xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer",
                    activeTab === 'state-gov'
                      ? "bg-primary-500 text-white"
                      : "text-ink-secondary hover:bg-muted hover:text-ink"
                  )}
                >
                  {lang === 'vi' ? 'Phục vụ QLNN' : 'State Mgmt'}
                  <ChevronDown size={10} />
                </button>
                <div className="absolute left-0 mt-1 w-52 bg-surface border border-border shadow-dropdown rounded-xl py-2 hidden group-hover:block z-40 animate-fade-in">
                  <button onClick={() => handleTabChange('state-gov', 'du-an-trong-diem')} className="w-full text-left px-4 py-2 text-2xs font-bold text-ink hover:bg-muted hover:text-primary transition-colors">
                    Dự án trọng điểm quốc gia
                  </button>
                  <button onClick={() => handleTabChange('state-gov', 'quy-chuan-tieu-chuan')} className="w-full text-left px-4 py-2 text-2xs font-bold text-ink hover:bg-muted hover:text-primary transition-colors">
                    Biên soạn Quy chuẩn, Tiêu chuẩn
                  </button>
                </div>
              </div>

              {/* KH & CN (Đề tài - Dự án) */}
              <button
                onClick={() => handleTabChange('research')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-2xs font-bold whitespace-nowrap transition-all cursor-pointer",
                  activeTab === 'research'
                    ? "bg-primary-500 text-white"
                    : "text-ink-secondary hover:bg-muted hover:text-ink"
                )}
              >
                {lang === 'vi' ? 'Đề tài - Dự án' : 'R&D Projects'}
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative hidden sm:block w-56">
              <input
                type="text"
                placeholder={lang === 'vi' ? 'Tìm kiếm nhanh...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-1 pl-7 pr-3 text-2xs rounded-lg border border-border bg-muted focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
              />
              <Search className="absolute left-2.5 top-1.5 text-ink-muted" size={11} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── WEB PORTAL BODY CONTENT ─── */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* 1. PORTAL HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Banner nổi bật */}
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-card bg-gradient-to-r from-primary-600 to-indigo-900 text-white p-6 md:p-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="space-y-4 max-w-2xl text-left">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-2xs font-bold bg-white/20 text-white backdrop-blur-sm">
                  {lang === 'vi' ? 'Tiên phong khoa học xây dựng' : 'Pioneering Construction Science'}
                </span>
                <h2 className="text-xl md:text-3xl font-black leading-tight">
                  {lang === 'vi' ? 'Nâng tầm kỹ thuật và chất lượng công trình Việt Nam' : 'Elevating Engineering & Construction Quality in Vietnam'}
                </h2>
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                  {lang === 'vi'
                    ? 'Đơn vị nghiên cứu khoa học hàng đầu trực thuộc Bộ Xây dựng, quản lý 21 đơn vị chuyên môn và hệ thống phòng thí nghiệm LAS-XD đạt chuẩn quốc tế.'
                    : 'The leading construction research institute under the Ministry of Construction, managing 21 departments and laboratories.'}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => handleTabChange('intro', 'all')} className="btn bg-white hover:bg-white/95 text-primary-600 px-4 py-2 rounded-lg text-2xs font-black shadow-md transition-all cursor-pointer">
                    {lang === 'vi' ? 'Tìm hiểu năng lực' : 'Explore Capabilities'}
                  </button>
                  <button onClick={() => handleTabChange('research')} className="btn border border-white/30 hover:border-white/50 text-white px-4 py-2 rounded-lg text-2xs font-bold backdrop-blur-sm transition-all cursor-pointer">
                    {lang === 'vi' ? 'Xem các đề tài nghiên cứu' : 'View Research Topics'}
                  </button>
                </div>
              </div>
              <div className="relative w-48 h-48 flex items-center justify-center bg-white/5 rounded-full border border-white/10 backdrop-blur-sm shadow-inner hidden md:flex shrink-0">
                <Compass className="w-20 h-20 text-white/40 animate-pulse" />
              </div>
            </div>

            {/* Quick KPI stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-all">
                <div className="p-3 bg-primary/10 text-primary-500 rounded-xl"><Layers size={22} /></div>
                <div className="text-left">
                  <p className="text-md font-black">21</p>
                  <p className="text-3xs text-ink-muted uppercase font-bold tracking-wider">{lang === 'vi' ? 'Đơn vị trực thuộc' : 'Departments'}</p>
                </div>
              </div>
              <div className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-all">
                <div className="p-3 bg-success/10 text-success-500 rounded-xl"><Wrench size={22} /></div>
                <div className="text-left">
                  <p className="text-md font-black">15+</p>
                  <p className="text-3xs text-ink-muted uppercase font-bold tracking-wider">{lang === 'vi' ? 'Phòng thí nghiệm' : 'Labs (LAS-XD)'}</p>
                </div>
              </div>
              <div className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-all">
                <div className="p-3 bg-warning/10 text-warning-500 rounded-xl"><BookOpen size={22} /></div>
                <div className="text-left">
                  <p className="text-md font-black">120+</p>
                  <p className="text-3xs text-ink-muted uppercase font-bold tracking-wider">{lang === 'vi' ? 'Đề tài đã nghiệm thu' : 'Approved Topics'}</p>
                </div>
              </div>
              <div className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-all">
                <div className="p-3 bg-danger/10 text-danger-500 rounded-xl"><Award size={22} /></div>
                <div className="text-left">
                  <p className="text-md font-black">15</p>
                  <p className="text-3xs text-ink-muted uppercase font-bold tracking-wider">{lang === 'vi' ? 'Dự án trọng điểm QG' : 'National Projects'}</p>
                </div>
              </div>
            </div>

            {/* Tin nổi bật trang chủ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-black text-ink uppercase tracking-wider flex items-center gap-2">
                  <Activity size={14} className="text-primary-500" />
                  {lang === 'vi' ? 'Tin hoạt động & Nghiệm thu mới' : 'Latest Activities & Approvals'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {NEWS_ARTICLES.slice(0, 2).map((art) => (
                    <div key={art.id} onClick={() => { setSelectedArticle(art); handleTabChange('news', art.category); }} className="card p-4 flex flex-col justify-between hover:shadow-card-hover hover:border-primary-300 transition-all cursor-pointer text-left">
                      <div className="space-y-2">
                        <span className="inline-block px-2 py-0.5 rounded text-3xs font-bold bg-primary/10 text-primary-500">
                          {art.category === 'tin-hoat-dong' ? 'Tin hoạt động' : 'Dự án trọng điểm'}
                        </span>
                        <h4 className="font-bold text-ink text-[13px] line-clamp-2 hover:text-primary-500 transition-colors">
                          {art.title}
                        </h4>
                        <p className="text-2xs text-ink-secondary line-clamp-3">
                          {art.summary}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-3xs text-ink-muted mt-4 border-t border-border-subtle pt-2">
                        <span>{art.author}</span>
                        <span>{art.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cột Bên Phải: Đề tài khoa học tiêu biểu */}
              <div className="space-y-4 text-left">
                <h3 className="text-sm font-black text-ink uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} className="text-primary-500" />
                  {lang === 'vi' ? 'Đề tài nổi bật' : 'Highlighted Projects'}
                </h3>
                <div className="space-y-3">
                  {RESEARCH_PROJECTS.slice(0, 3).map((p) => (
                    <div key={p.id} onClick={() => { setSelectedProject(p); handleTabChange('research'); }} className="p-3 bg-surface hover:bg-muted border border-border rounded-xl flex gap-3 cursor-pointer transition-all">
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center text-3xs font-bold text-primary-500">
                          <span>{p.code}</span>
                          <span className="bg-success/15 text-success-500 px-1 rounded">{p.status}</span>
                        </div>
                        <h4 className="font-bold text-ink text-2xs line-clamp-2">{p.title}</h4>
                        <p className="text-3xs text-ink-muted font-medium">Chủ nhiệm: {p.leader}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. GIỚI THIỆU TAB */}
        {activeTab === 'intro' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
            {/* Sidebar danh mục giới thiệu */}
            <div className="lg:col-span-1 space-y-2">
              <div className="card p-3 space-y-1 bg-surface/50">
                <p className="text-3xs font-black text-ink-muted uppercase tracking-wider mb-2 px-2">Danh mục giới thiệu</p>
                <button
                  onClick={() => setActiveSubTab('all')}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'all' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Tất cả thông tin
                </button>
                <button
                  onClick={() => setActiveSubTab('nhiem-vu')}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'nhiem-vu' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Chức năng nhiệm vụ
                </button>
                <button
                  onClick={() => setActiveSubTab('co-cau')}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'co-cau' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Cơ cấu tổ chức & Lãnh đạo
                </button>
                <button
                  onClick={() => setActiveSubTab('phong-lab')}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'phong-lab' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Hệ thống phòng thí nghiệm
                </button>
              </div>
            </div>

            {/* Content Giới thiệu */}
            <div className="lg:col-span-3 space-y-6">

              {/* Chức năng nhiệm vụ */}
              {(activeSubTab === 'all' || activeSubTab === 'nhiem-vu') && (
                <div className="card p-6 space-y-4">
                  <h3 className="text-md font-black text-ink border-b border-border pb-3 flex items-center gap-2">
                    <ShieldCheck className="text-primary-500" size={16} />
                    Chức năng & Nhiệm vụ chính của IBST
                  </h3>
                  <div className="text-xs leading-relaxed text-ink-secondary space-y-3 font-medium">
                    <p>
                      Viện Khoa học Công nghệ Xây dựng (IBST) là đơn vị sự nghiệp trực thuộc Bộ Xây dựng, thực hiện chức năng nghiên cứu khoa học, phục vụ quản lý nhà nước, đào tạo tiến sĩ và cung cấp dịch vụ KHCN trong ngành xây dựng.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Nghiên cứu khoa học:</strong> Nghiên cứu phát triển công nghệ mới, vật liệu xây dựng tiên tiến, bê tông UHPC, kết cấu thép đặc biệt chống bão, động đất.</li>
                      <li><strong>Phục vụ quản lý nhà nước:</strong> Biên soạn hệ thống Quy chuẩn xây dựng Việt Nam (QCVN) và Tiêu chuẩn quốc gia (TCVN); thẩm tra độc lập chất lượng công trình phục vụ nghiệm thu nhà nước.</li>
                      <li><strong>Chứng nhận và Kiểm định:</strong> Chứng nhận sự phù hợp chất lượng hàng hóa, vật liệu xây dựng; thử nghiệm và kiểm định kết cấu, kiểm tra nứt, nghiêng công trình.</li>
                      <li><strong>Đào tạo nguồn nhân lực:</strong> Cơ sở đào tạo Tiến sĩ đầu ngành được Bộ Giáo dục cấp phép với hàng trăm nghiên cứu sinh đã tốt nghiệp.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Sơ đồ & Lãnh đạo viện */}
              {(activeSubTab === 'all' || activeSubTab === 'co-cau') && (
                <div className="space-y-6">
                  {/* Lãnh đạo viện */}
                  <div className="card p-6 space-y-4">
                    <h3 className="text-md font-black text-ink border-b border-border pb-3 flex items-center gap-2">
                      <Users className="text-primary-500" size={16} />
                      Ban Giám Đốc Viện (Nhiệm kỳ 2025 - 2030)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {LEADERS.map((ldr, idx) => (
                        <div key={idx} className="p-4 bg-muted border border-border rounded-xl space-y-2">
                          <h4 className="font-bold text-ink text-[13px]">{ldr.name}</h4>
                          <p className="text-3xs font-semibold text-primary-500 uppercase tracking-wider">{ldr.role}</p>
                          <div className="text-3xs text-ink-muted space-y-1 font-semibold pt-1 border-t border-border-subtle">
                            <p className="flex items-center gap-1.5"><Phone size={11} /> {ldr.phone}</p>
                            <p className="flex items-center gap-1.5"><Mail size={11} /> {ldr.email}</p>
                            <p className="flex items-center gap-1.5"><Building size={11} /> {ldr.room}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sơ đồ cơ cấu tổ chức */}
                  <div className="card p-6 space-y-4">
                    <h3 className="text-md font-black text-ink border-b border-border pb-3 flex items-center gap-2">
                      <Layers className="text-primary-500" size={16} />
                      Sơ đồ Tổ chức hành chính & Phòng ban
                    </h3>
                    <div className="p-4 bg-muted border border-border rounded-xl space-y-4 text-center">
                      <div className="inline-block px-4 py-2 bg-primary text-white text-xs font-black rounded-lg shadow-sm">
                        Ban Giám Đốc Viện
                      </div>
                      <div className="w-0.5 h-6 bg-border mx-auto"></div>
                      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                        <div className="px-3 py-2 bg-surface border border-border rounded-lg text-2xs font-bold">Hội đồng Khoa học</div>
                        <div className="px-3 py-2 bg-surface border border-border rounded-lg text-2xs font-bold">Hội đồng Tiêu chuẩn</div>
                      </div>
                      <div className="w-0.5 h-6 bg-border mx-auto"></div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="p-3 bg-surface border border-border rounded-xl text-left">
                          <h5 className="font-bold text-ink-secondary text-2xs mb-2 pb-1 border-b border-border-subtle uppercase">Đơn vị nghiệp vụ</h5>
                          <ul className="text-3xs space-y-1 font-semibold text-ink-muted list-disc pl-4">
                            <li>Phòng QLKH & Tiêu chuẩn</li>
                            <li>Phòng Kế hoạch Tài chính</li>
                            <li>Phòng Tổ chức Hành chính</li>
                            <li>Văn phòng Đảng - Đoàn thể</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-surface border border-border rounded-xl text-left">
                          <h5 className="font-bold text-ink-secondary text-2xs mb-2 pb-1 border-b border-border-subtle uppercase">Trung tâm Chuyên môn</h5>
                          <ul className="text-3xs space-y-1 font-semibold text-ink-muted list-disc pl-4">
                            <li>Trung tâm Bê tông & Vật liệu</li>
                            <li>Trung tâm Địa kỹ thuật & Trắc địa</li>
                            <li>Trung tâm Kết cấu công trình</li>
                            <li>Văn phòng Thử nghiệm LIMS</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-surface border border-border rounded-xl text-left">
                          <h5 className="font-bold text-ink-secondary text-2xs mb-2 pb-1 border-b border-border-subtle uppercase">Chi nhánh</h5>
                          <ul className="text-3xs space-y-1 font-semibold text-ink-muted list-disc pl-4">
                            <li>Phân viện miền Nam (PVMN)</li>
                            <li>Phân viện miền Trung (PVMT)</li>
                            <li>Văn phòng Đại diện Hải Phòng</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hệ thống phòng thí nghiệm */}
              {(activeSubTab === 'all' || activeSubTab === 'phong-lab') && (
                <div className="card p-6 space-y-4">
                  <h3 className="text-md font-black text-ink border-b border-border pb-3 flex items-center gap-2">
                    <Wrench className="text-primary-500" size={16} />
                    Hệ thống Phòng thí nghiệm LAS-XD đạt chuẩn VILAS
                  </h3>
                  <div className="space-y-3">
                    {LABS.map((lab, idx) => (
                      <div key={idx} className="p-4 bg-muted border border-border rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-3xs font-bold bg-primary/10 text-primary-500 rounded">
                              {lab.code}
                            </span>
                            <h4 className="font-bold text-ink text-2xs">{lab.name}</h4>
                          </div>
                          <p className="text-3xs text-ink-secondary mt-1 font-medium">{lab.capacity}</p>
                        </div>
                        <span className="px-2.5 py-1 text-3xs font-bold bg-surface border border-border rounded-lg text-ink-secondary whitespace-nowrap">
                          {lab.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 3. TIN TỨC TAB */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
            {/* Sidebar danh mục tin tức */}
            <div className="lg:col-span-1 space-y-2">
              <div className="card p-3 space-y-1 bg-surface/50">
                <p className="text-3xs font-black text-ink-muted uppercase tracking-wider mb-2 px-2">Phân loại tin tức</p>
                <button
                  onClick={() => { setActiveSubTab('all'); setSelectedArticle(null); }}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'all' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Tất cả tin tức
                </button>
                <button
                  onClick={() => { setActiveSubTab('tin-hoat-dong'); setSelectedArticle(null); }}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'tin-hoat-dong' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Tin hoạt động Viện
                </button>
                <button
                  onClick={() => { setActiveSubTab('tin-lien-quan'); setSelectedArticle(null); }}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'tin-lien-quan' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Tin tức liên quan
                </button>
              </div>
            </div>

            {/* Nội dung chính tin tức */}
            <div className="lg:col-span-3">
              {selectedArticle ? (
                /* Chi tiết bài báo */
                <div className="card p-6 space-y-4 animate-fade-in">
                  <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-1.5 text-2xs font-bold text-primary-500 hover:text-primary transition-colors cursor-pointer mb-2">
                    <ArrowLeft size={12} />
                    Quay lại danh sách
                  </button>
                  <h2 className="text-md md:text-lg font-black text-ink leading-snug">{selectedArticle.title}</h2>
                  <div className="flex items-center justify-between text-3xs font-semibold text-ink-muted py-2 border-b border-border">
                    <span>Đăng bởi: {selectedArticle.author}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} /> {selectedArticle.date}</span>
                  </div>
                  <div className="text-xs leading-relaxed text-ink-secondary space-y-4 pt-2 font-medium">
                    <p className="font-bold text-ink italic bg-muted p-3 rounded-lg border-l-4 border-primary">
                      {selectedArticle.summary}
                    </p>
                    <p>{selectedArticle.content}</p>
                    <p>Viện Khoa học công nghệ xây dựng sẽ tiếp tục thực hiện thử nghiệm bổ sung và chuyển giao giải pháp nghiên cứu trong các dự án thực tế thời gian tới nhằm hiện thực hóa các định hướng bảo vệ môi trường, giảm cacbon hiệu quả.</p>
                  </div>
                </div>
              ) : (
                /* Danh sách bài viết */
                <div className="space-y-4">
                  {filteredNews.length === 0 ? (
                    <div className="card p-8 text-center text-ink-muted text-2xs font-semibold">
                      Không tìm thấy bài viết nào phù hợp.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredNews.map((art) => (
                        <div key={art.id} onClick={() => setSelectedArticle(art)} className="card p-4 hover:shadow-card-hover hover:border-primary border border-border flex flex-col justify-between cursor-pointer transition-all">
                          <div className="space-y-2">
                            <span className="inline-block px-2 py-0.5 rounded text-3xs font-bold bg-primary/10 text-primary-500">
                              {art.category === 'tin-hoat-dong' ? 'Tin hoạt động' : 'Tin liên quan'}
                            </span>
                            <h3 className="font-bold text-ink text-2xs line-clamp-2 hover:text-primary transition-colors">{art.title}</h3>
                            <p className="text-3xs text-ink-secondary line-clamp-3 font-medium">{art.summary}</p>
                          </div>
                          <div className="flex items-center justify-between text-3xs text-ink-muted mt-4 border-t border-border-subtle pt-2">
                            <span>{art.author}</span>
                            <span>{art.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. PHỤC VỤ QLNN TAB */}
        {activeTab === 'state-gov' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
            {/* Sidebar phục vụ QLNN */}
            <div className="lg:col-span-1 space-y-2">
              <div className="card p-3 space-y-1 bg-surface/50">
                <p className="text-3xs font-black text-ink-muted uppercase tracking-wider mb-2 px-2">Hoạt động QLNN</p>
                <button
                  onClick={() => { setActiveSubTab('all'); setSelectedArticle(null); }}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'all' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Tất cả nhiệm vụ
                </button>
                <button
                  onClick={() => { setActiveSubTab('du-an-trong-diem'); setSelectedArticle(null); }}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'du-an-trong-diem' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Dự án trọng điểm QG
                </button>
                <button
                  onClick={() => { setActiveSubTab('quy-chuan-tieu-chuan'); setSelectedArticle(null); }}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'quy-chuan-tieu-chuan' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Quy chuẩn & Tiêu chuẩn
                </button>
              </div>
            </div>

            {/* Nội dung QLNN */}
            <div className="lg:col-span-3">
              {selectedArticle ? (
                /* Chi tiết dự án/tiêu chuẩn biên soạn */
                <div className="card p-6 space-y-4 animate-fade-in">
                  <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-1.5 text-2xs font-bold text-primary-500 hover:text-primary transition-colors cursor-pointer mb-2">
                    <ArrowLeft size={12} />
                    Quay lại danh sách
                  </button>
                  <h2 className="text-md md:text-lg font-black text-ink leading-snug">{selectedArticle.title}</h2>
                  <div className="flex items-center justify-between text-3xs font-semibold text-ink-muted py-2 border-b border-border">
                    <span>Cơ quan phụ trách: {selectedArticle.author}</span>
                    <span>Cập nhật ngày: {selectedArticle.date}</span>
                  </div>
                  <div className="text-xs leading-relaxed text-ink-secondary space-y-4 pt-2 font-medium">
                    <p className="font-bold text-ink italic bg-muted p-3 rounded-lg border-l-4 border-primary">
                      {selectedArticle.summary}
                    </p>
                    <p>{selectedArticle.content}</p>
                    <div className="p-4 bg-muted border border-border rounded-xl space-y-3">
                      <h4 className="font-bold text-ink text-2xs flex items-center gap-1.5"><Info size={13} className="text-primary-500" /> Kết quả dự kiến đạt được:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-3xs text-ink-muted">
                        <li>Dự thảo bản hoàn thiện gửi hội đồng nghiệm thu cấp Bộ phê duyệt.</li>
                        <li>Tài liệu thuyết minh cơ sở khoa học của các hệ số điều chỉnh hoặc quy trình thực hành thực tế.</li>
                        <li>Chuyển giao thử nghiệm tại các công trình thực tế có năng lực giám sát tối ưu.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                /* Danh sách nhiệm vụ QLNN */
                <div className="space-y-4">
                  {filteredNews.length === 0 ? (
                    <div className="card p-8 text-center text-ink-muted text-2xs font-semibold">
                      Không tìm thấy thông tin nào phù hợp.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredNews.map((art) => (
                        <div key={art.id} onClick={() => setSelectedArticle(art)} className="card p-5 hover:shadow-card-hover hover:border-primary border border-border flex justify-between items-start gap-4 cursor-pointer transition-all">
                          <div className="space-y-2 flex-1 text-left">
                            <span className="inline-block px-2 py-0.5 rounded text-3xs font-bold bg-primary/10 text-primary-500">
                              {art.category === 'du-an-trong-diem' ? 'Dự án trọng điểm quốc gia' : 'Quy chuẩn - Tiêu chuẩn quốc gia'}
                            </span>
                            <h3 className="font-bold text-ink text-xs hover:text-primary transition-colors">{art.title}</h3>
                            <p className="text-2xs text-ink-secondary font-medium">{art.summary}</p>
                            <div className="flex items-center gap-4 text-3xs text-ink-muted pt-1">
                              <span>Biên soạn: {art.author}</span>
                              <span>Ngày: {art.date}</span>
                            </div>
                          </div>
                          <ChevronRight className="text-ink-muted mt-4 shrink-0" size={16} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. KH & CN (ĐỀ TÀI - DỰ ÁN CHÍNH) TAB */}
        {activeTab === 'research' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
            {/* Sidebar bộ lọc cho Đề tài nghiên cứu */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card p-3 space-y-1 bg-surface/50">
                <p className="text-3xs font-black text-ink-muted uppercase tracking-wider mb-2 px-2">Cấp Đề tài</p>
                <button
                  onClick={() => { setActiveSubTab('all'); setSelectedProject(null); }}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'all' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Tất cả đề tài
                </button>
                <button
                  onClick={() => { setActiveSubTab('nhà nước'); setSelectedProject(null); }}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'nhà nước' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Cấp Nhà nước
                </button>
                <button
                  onClick={() => { setActiveSubTab('bộ'); setSelectedProject(null); }}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'bộ' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Cấp Bộ Xây dựng
                </button>
                <button
                  onClick={() => { setActiveSubTab('viện'); setSelectedProject(null); }}
                  className={cn("w-full text-left px-3 py-2 text-2xs font-bold rounded-lg transition-colors cursor-pointer", activeSubTab === 'viện' ? "bg-primary text-white" : "hover:bg-muted text-ink-secondary")}
                >
                  Cấp Cơ sở / Viện
                </button>
              </div>

              {/* Lọc theo năm nghiệm thu */}
              <div className="card p-4 space-y-2.5">
                <p className="text-3xs font-black text-ink-muted uppercase tracking-wider px-0.5">Năm nghiệm thu</p>
                <select
                  value={selectedYear}
                  onChange={(e) => { setSelectedYear(e.target.value); setSelectedProject(null); }}
                  className="w-full p-2 text-2xs rounded-lg border border-border bg-surface font-semibold focus:outline-none"
                >
                  <option value="all">Tất cả các năm</option>
                  <option value="2024">Năm 2024</option>
                  <option value="2023">Năm 2023</option>
                  <option value="2022">Năm 2022</option>
                </select>
              </div>
            </div>

            {/* Nội dung danh sách hoặc chi tiết đề tài */}
            <div className="lg:col-span-3">
              {selectedProject ? (
                /* Chi tiết đề tài nghiên cứu */
                <div className="card p-6 space-y-5 animate-fade-in">
                  <button onClick={() => setSelectedProject(null)} className="flex items-center gap-1.5 text-2xs font-bold text-primary-500 hover:text-primary transition-colors cursor-pointer mb-2">
                    <ArrowLeft size={12} />
                    Quay lại danh sách đề tài
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-3xs font-bold bg-primary/10 text-primary-500 rounded">
                        Mã số: {selectedProject.code}
                      </span>
                      <span className="px-2 py-0.5 text-3xs font-bold bg-success/10 text-success-500 rounded">
                        {selectedProject.status}
                      </span>
                    </div>
                    <h2 className="text-md md:text-lg font-black text-ink leading-snug mt-2">{selectedProject.title}</h2>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted border border-border rounded-xl text-3xs font-semibold">
                    <div>
                      <p className="text-ink-muted">Chủ nhiệm đề tài</p>
                      <p className="font-bold text-ink mt-0.5">{selectedProject.leader}</p>
                    </div>
                    <div>
                      <p className="text-ink-muted">Cấp đề tài</p>
                      <p className="font-bold text-ink mt-0.5">{selectedProject.type}</p>
                    </div>
                    <div>
                      <p className="text-ink-muted">Năm nghiệm thu</p>
                      <p className="font-bold text-ink mt-0.5">{selectedProject.year}</p>
                    </div>
                    <div>
                      <p className="text-ink-muted">Kinh phí cấp</p>
                      <p className="font-bold text-success-500 mt-0.5">{selectedProject.funding} triệu VNĐ</p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs font-medium text-ink-secondary leading-relaxed">
                    <div>
                      <h4 className="font-bold text-ink text-2xs mb-1.5">Tóm tắt đề tài / dự án:</h4>
                      <p className="italic bg-muted p-3 border-l-4 border-primary rounded-r-lg">{selectedProject.summary}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-ink text-2xs mb-1.5">Mục tiêu & Phương pháp nghiên cứu:</h4>
                      <p>{selectedProject.details}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-ink text-2xs mb-1.5">Ứng dụng thực tiễn của đề tài:</h4>
                      <p>Sản phẩm nghiên cứu của đề tài đã trực tiếp giải quyết các vấn đề vướng mắc thực tế trong thi công, cung cấp công cụ hướng dẫn thiết kế chuẩn xác phục vụ các công ty thiết kế kỹ thuật địa lý, nhà máy sản xuất vật liệu và chủ đầu tư các đại dự án trên toàn quốc.</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Danh sách đề tài nghiên cứu */
                <div className="space-y-4">
                  {/* Ô tìm kiếm cho màn hình di động */}
                  <div className="relative sm:hidden w-full">
                    <input
                      type="text"
                      placeholder="Tìm mã số, tên đề tài, chủ nhiệm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full py-2 pl-8 pr-3 text-2xs rounded-lg border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    />
                    <Search className="absolute left-2.5 top-2.5 text-ink-muted" size={12} />
                  </div>

                  {filteredProjects.length === 0 ? (
                    <div className="card p-8 text-center text-ink-muted text-2xs font-semibold">
                      Không tìm thấy đề tài nghiên cứu nào phù hợp bộ lọc.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {filteredProjects.map((p) => (
                        <div key={p.id} onClick={() => setSelectedProject(p)} className="card p-5 hover:shadow-card-hover hover:border-primary border border-border flex justify-between items-start gap-4 cursor-pointer transition-all">
                          <div className="space-y-2 flex-1 text-left">
                            <div className="flex flex-wrap items-center gap-2 text-3xs font-bold">
                              <span className="px-2 py-0.5 bg-primary/10 text-primary-500 rounded">Mã số: {p.code}</span>
                              <span className="px-2 py-0.5 bg-muted text-ink-secondary border border-border rounded">{p.type}</span>
                              <span className="px-1.5 py-0.5 bg-success/10 text-success-500 rounded">{p.status}</span>
                            </div>
                            <h3 className="font-bold text-ink text-[13px] hover:text-primary transition-colors">{p.title}</h3>
                            <p className="text-2xs text-ink-secondary font-medium line-clamp-2">{p.summary}</p>
                            <div className="flex flex-wrap gap-4 text-3xs text-ink-muted pt-1 font-semibold">
                              <span>Chủ nhiệm: <strong className="text-ink-secondary">{p.leader}</strong></span>
                              <span>Năm nghiệm thu: {p.year}</span>
                              <span>Kinh phí: <strong className="text-success-500">{p.funding}tr VNĐ</strong></span>
                            </div>
                          </div>
                          <ChevronRight className="text-ink-muted mt-5 shrink-0" size={16} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

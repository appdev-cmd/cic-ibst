import { PageHeader } from '../components/PageHeader';
import { DangDoanTheTab } from '../components/DangDoanTheTab';

export function DangVuPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Công tác Đảng vụ"
        subtitle="Quản lý công tác Đảng bộ Viện, các Chi bộ trực thuộc, hồ sơ Đảng viên, công tác phát triển Đảng & thu nộp Đảng phí"
      />
      <DangDoanTheTab phamVi="dang" />
    </div>
  );
}

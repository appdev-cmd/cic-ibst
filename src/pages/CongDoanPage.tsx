import { PageHeader } from '../components/PageHeader';
import { DangDoanTheTab } from '../components/DangDoanTheTab';

export function CongDoanPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Công tác Công đoàn, Đoàn TN"
        subtitle="Quản lý tổ chức Công đoàn cơ sở, Chi đoàn Thanh niên, hoạt động phong trào & thu nộp kinh phí"
      />
      <DangDoanTheTab phamVi="doan-the" />
    </div>
  );
}

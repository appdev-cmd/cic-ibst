import { PageHeader } from '../components/PageHeader';
import { TaiChinhPage } from './TaiChinhPage';

export function TcktPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Công tác Tài chính - Kế toán (TCKT)"
        subtitle="Quản lý dòng tiền Hợp đồng: Tạm ứng, Tiền về, HĐ VAT, Công nợ & Chế tài Phạt/SLA TCKT (Chương III QC 2815)"
      />
      <TaiChinhPage showHeader={false} />
    </div>
  );
}

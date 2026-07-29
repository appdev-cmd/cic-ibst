import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { HopDongPage } from './pages/HopDongPage';
import { TaiChinhPage } from './pages/TaiChinhPage';
import { KhoaHocPage } from './pages/KhoaHocPage';
import { NhanSuPage } from './pages/NhanSuPage';
import { ThiNghiemPage } from './pages/ThiNghiemPage';
import { EOfficePage } from './pages/EOfficePage';
import { KhoLuuTruPage } from './pages/KhoLuuTruPage';
import { DonViPage } from './pages/DonViPage';
import { CaiDatPage } from './pages/CaiDatPage';
import { IbstPortalPage } from './pages/IbstPortalPage';

const SKIP_AUTH = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === 'true';

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (SKIP_AUTH) return children;
  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-page">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        {/* 08 Nhóm Phân hệ ERP chuẩn theo bao_gia_pm_erp_ibst.md */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/hop-dong" element={<HopDongPage />} />
        <Route path="/tai-chinh" element={<TaiChinhPage />} />
        <Route path="/khoa-hoc" element={<KhoaHocPage />} />
        <Route path="/nhan-su" element={<NhanSuPage />} />
        <Route path="/thi-nghiem" element={<ThiNghiemPage />} />
        <Route path="/e-office" element={<EOfficePage />} />
        <Route path="/kho-luu-tru" element={<KhoLuuTruPage />} />

        {/* Các trang hỗ trợ & Cổng thông tin */}
        <Route path="/don-vi" element={<DonViPage />} />
        <Route path="/cai-dat" element={<CaiDatPage />} />
        <Route path="/ibst-portal" element={<IbstPortalPage />} />

        {/* Redirects cho các đường dẫn cũ */}
        <Route path="/van-ban" element={<Navigate to="/e-office" replace />} />
        <Route path="/lich-co-quan" element={<Navigate to="/e-office" replace />} />
        <Route path="/cong-viec" element={<Navigate to="/e-office" replace />} />
        <Route path="/de-tai" element={<Navigate to="/khoa-hoc" replace />} />
        <Route path="/so-huu-tri-tue" element={<Navigate to="/khoa-hoc" replace />} />
        <Route path="/ho-so-tai-lieu" element={<Navigate to="/kho-luu-tru" replace />} />
        <Route path="/dao-tao" element={<Navigate to="/nhan-su" replace />} />
        <Route path="/khach-hang" element={<Navigate to="/hop-dong" replace />} />
      </Route>
    </Routes>
  );
}

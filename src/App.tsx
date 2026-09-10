import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { HopDongPage } from './pages/HopDongPage';
import { KhoaHocPage } from './pages/KhoaHocPage';
import { NhanSuPage } from './pages/NhanSuPage';
import { ThiNghiemPage } from './pages/ThiNghiemPage';
import { EOfficePage } from './pages/EOfficePage';
import { KhoLuuTruPage } from './pages/KhoLuuTruPage';
import { DonViPage } from './pages/DonViPage';
import { CaiDatPage } from './pages/CaiDatPage';
import { IbstPortalPage } from './pages/IbstPortalPage';
import { DauThauPage } from './pages/DauThauPage';
import { PvqlnnPage } from './pages/PvqlnnPage';
import { UyQuyenPage } from './pages/UyQuyenPage';
import { LichCoQuanPage } from './pages/LichCoQuanPage';
import { DangVuPage } from './pages/DangVuPage';
import { TuVanDvktPage } from './pages/TuVanDvktPage';
import { TcktPage } from './pages/TcktPage';
import { CongDoanPage } from './pages/CongDoanPage';

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
        {/* 12 Nhóm Phân hệ ERP chuẩn theo cấu trúc mới thống nhất */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/nhan-su" element={<NhanSuPage />} />
        <Route path="/dang-vu" element={<DangVuPage />} />
        <Route path="/e-office" element={<EOfficePage />} />
        <Route path="/pvqlnn" element={<PvqlnnPage />} />
        <Route path="/khoa-hoc" element={<KhoaHocPage />} />
        <Route path="/tu-van-dvkt" element={<TuVanDvktPage />} />
        <Route path="/thi-nghiem" element={<ThiNghiemPage />} />
        <Route path="/tckt" element={<TcktPage />} />
        <Route path="/cong-doan" element={<CongDoanPage />} />
        <Route path="/kho-luu-tru" element={<KhoLuuTruPage />} />
        <Route path="/ibst-portal" element={<IbstPortalPage />} />

        {/* Cài đặt hệ thống */}
        <Route path="/cai-dat" element={<CaiDatPage />} />

        {/* Các route chuyển tiếp tương thích ngược (Redirects) */}
        <Route path="/hop-dong" element={<Navigate to="/tu-van-dvkt" replace />} />
        <Route path="/tai-chinh" element={<Navigate to="/tckt" replace />} />
        <Route path="/lich-co-quan" element={<Navigate to="/?tab=lich" replace />} />
        <Route path="/dau-thau" element={<Navigate to="/tu-van-dvkt?tab=dau-thau" replace />} />
        <Route path="/uy-quyen" element={<Navigate to="/tu-van-dvkt?tab=bao-cao-khkt" replace />} />
        <Route path="/khach-hang" element={<Navigate to="/tu-van-dvkt?tab=crm-khach-hang" replace />} />
        <Route path="/don-vi" element={<Navigate to="/nhan-su?tab=don-vi" replace />} />
        <Route path="/van-ban" element={<Navigate to="/e-office" replace />} />
        <Route path="/cong-viec" element={<Navigate to="/e-office" replace />} />
        <Route path="/de-tai" element={<Navigate to="/khoa-hoc" replace />} />
        <Route path="/so-huu-tri-tue" element={<Navigate to="/khoa-hoc" replace />} />
        <Route path="/ho-so-tai-lieu" element={<Navigate to="/kho-luu-tru" replace />} />
        <Route path="/dao-tao" element={<Navigate to="/nhan-su" replace />} />
      </Route>
    </Routes>
  );
}

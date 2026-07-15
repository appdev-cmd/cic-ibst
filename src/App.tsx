import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AppLayout } from './layouts/AppLayout';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { VanBanPage } from './pages/VanBanPage';
import { DeTaiPage } from './pages/DeTaiPage';
import { HopDongPage } from './pages/HopDongPage';
import { ThiNghiemPage } from './pages/ThiNghiemPage';
import { TaiChinhPage } from './pages/TaiChinhPage';
import { DonViPage } from './pages/DonViPage';
import { NhanSuPage } from './pages/NhanSuPage';
import { DaoTaoPage } from './pages/DaoTaoPage';
import { BaoCaoPage } from './pages/BaoCaoPage';
import { CaiDatPage } from './pages/CaiDatPage';

const SKIP_AUTH = import.meta.env.DEV && import.meta.env.VITE_SKIP_AUTH === 'true';

function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (SKIP_AUTH) return children;
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
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
        <Route path="/" element={<DashboardPage />} />
        <Route path="/van-ban" element={<VanBanPage />} />
        <Route path="/de-tai" element={<DeTaiPage />} />
        <Route path="/hop-dong" element={<HopDongPage />} />
        <Route path="/thi-nghiem" element={<ThiNghiemPage />} />
        <Route path="/tai-chinh" element={<TaiChinhPage />} />
        <Route path="/don-vi" element={<DonViPage />} />
        <Route path="/nhan-su" element={<NhanSuPage />} />
        <Route path="/dao-tao" element={<DaoTaoPage />} />
        <Route path="/bao-cao" element={<BaoCaoPage />} />
        <Route path="/cai-dat" element={<CaiDatPage />} />
      </Route>
    </Routes>
  );
}

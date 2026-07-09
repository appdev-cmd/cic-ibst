import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { VanBanPage } from './pages/VanBanPage';
import { DeTaiPage } from './pages/DeTaiPage';
import { HopDongPage } from './pages/HopDongPage';
import { ThiNghiemPage } from './pages/ThiNghiemPage';
import { TaiChinhPage } from './pages/TaiChinhPage';
import { NhanSuPage } from './pages/NhanSuPage';
import { DaoTaoPage } from './pages/DaoTaoPage';
import { BaoCaoPage } from './pages/BaoCaoPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/van-ban" element={<VanBanPage />} />
        <Route path="/de-tai" element={<DeTaiPage />} />
        <Route path="/hop-dong" element={<HopDongPage />} />
        <Route path="/thi-nghiem" element={<ThiNghiemPage />} />
        <Route path="/tai-chinh" element={<TaiChinhPage />} />
        <Route path="/nhan-su" element={<NhanSuPage />} />
        <Route path="/dao-tao" element={<DaoTaoPage />} />
        <Route path="/bao-cao" element={<BaoCaoPage />} />
      </Route>
    </Routes>
  );
}

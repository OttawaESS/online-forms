import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LanguageProvider } from './LanguageContext';

// Lazy load components
const LandingPage = lazy(() => import('./LandingPage'));
const ExpenseReportForm = lazy(() => import('./ExpenseReportForm'));
const EquipmentForm = lazy(() => import('./EquipmentForm'));
const LockerStatus = lazy(() => import('./LockerStatus'));
const Login = lazy(() => import('./Login'));
const PatchArchive = lazy(() => import('./PatchArchive'));
const EquipmentCalendarPage = lazy(() => import('./EquipmentCalendarPage'));
const EquipmentListPage = lazy(() => import('./EquipmentListPage'));

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/expense-report" element={<ExpenseReportForm />} />
              <Route path="/equipment-loan" element={<EquipmentForm />} />
              <Route path="/locker-status" element={<LockerStatus />} />
              <Route path="/calendar" element={<EquipmentCalendarPage />} />
              <Route path="/equipment-list" element={<EquipmentListPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/patch-archive" element={<PatchArchive />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </LanguageProvider>
  );
}
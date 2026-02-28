import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from "./LandingPage";
import ExpenseReportForm from "./ExpenseReportForm";
import EquipmentForm from "./EquipmentForm";
import Login from "./Login";
import { LanguageProvider } from './LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/expense-report" element={<ExpenseReportForm />} />
            <Route path="/equipment-loan" element={<EquipmentForm />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
}
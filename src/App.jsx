import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ComingSoonPage from "./components/ComingSoonPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PatientsListPage from "./pages/PatientsListPage";
import PatientFormPage from "./pages/PatientFormPage";
import UsersPage from "./pages/UsersPage";
import RolesPage from "./pages/RolesPage";

const wrapped = (Element) => (
  <ProtectedRoute>
    <Element />
  </ProtectedRoute>
);

const adminOnly = (Element) => (
  <AdminRoute>
    <Element />
  </AdminRoute>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/dashboard" element={wrapped(DashboardPage)} />

          <Route path="/patients" element={wrapped(PatientsListPage)} />
          <Route path="/patients/new" element={wrapped(PatientFormPage)} />
          <Route path="/patients/:id/edit" element={wrapped(PatientFormPage)} />

          {/* Admin-only — enforced here, not just hidden in the sidebar */}
          <Route path="/users" element={adminOnly(UsersPage)} />
          <Route path="/roles" element={adminOnly(RolesPage)} />

          <Route path="/doctors" element={wrapped(ComingSoonPage)} />
          <Route path="/billing" element={wrapped(ComingSoonPage)} />
          <Route path="/payments" element={wrapped(ComingSoonPage)} />
          <Route path="/reports" element={wrapped(ComingSoonPage)} />
          <Route path="/prescriptions" element={wrapped(ComingSoonPage)} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import ProtocolRegistration from './pages/ProtocolRegistration';
import AdvisorSelection from './pages/AdvisorSelection';
import UploadProgress from './pages/UploadProgress';
import FormatChecklist from './pages/FormatChecklist';
import OfficialTemplates from './pages/OfficialTemplates';
import ResearchLines from './pages/ResearchLines';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Main App Routes (Protected) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="protocol" element={<ProtocolRegistration />} />
            <Route path="advisor" element={<AdvisorSelection />} />
            <Route path="progress" element={<UploadProgress />} />
            <Route path="checklist" element={<FormatChecklist />} />
            <Route path="templates" element={<OfficialTemplates />} />
            <Route path="research-lines" element={<ResearchLines />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

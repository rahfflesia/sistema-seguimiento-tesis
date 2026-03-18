import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import ProtocolRegistration from './pages/ProtocolRegistration';
import AdvisorSelection from './pages/AdvisorSelection';
import UploadProgress from './pages/UploadProgress';
import FormatChecklist from './pages/FormatChecklist';
import OfficialTemplates from './pages/OfficialTemplates';
import ResearchLines from './pages/ResearchLines';

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;

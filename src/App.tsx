import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ProgressProvider } from './context/ProgressContext';
import { Dashboard } from './pages/Dashboard';
import { DemoPage } from './pages/DemoPage';
import { LessonPage } from './pages/LessonPage';
import { PracticePage } from './pages/PracticePage';

export function renderApp() {
  return (
    <HashRouter>
      <ProgressProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </ProgressProvider>
    </HashRouter>
  );
}

export default function App() {
  return renderApp();
}

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout           from './components/layout/Layout';
import Login            from './pages/Login';
import Register         from './pages/Register';
import Dashboard        from './pages/Dashboard';
import Applications     from './pages/Applications';
import AddApplication   from './pages/AddApplication';
import ApplicationDetail from './pages/ApplicationDetail';
import ResumeManager    from './pages/ResumeManager';
import InterviewNotes   from './pages/InterviewNotes';
import Analytics        from './pages/Analytics';
import Settings         from './pages/Settings';

const Private = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'#6c63ff', fontFamily:'Syne', fontSize:'1.1rem' }}>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
};
const Public = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background:'#1a1e2a', color:'#e8eaf0', border:'1px solid #252a38' } }} />
        <Routes>
          <Route path="/login"    element={<Public><Login /></Public>} />
          <Route path="/register" element={<Public><Register /></Public>} />
          <Route path="/" element={<Private><Layout /></Private>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"           element={<Dashboard />} />
            <Route path="applications"        element={<Applications />} />
            <Route path="applications/new"    element={<AddApplication />} />
            <Route path="applications/:id"    element={<ApplicationDetail />} />
            <Route path="applications/:id/edit" element={<AddApplication />} />
            <Route path="resumes"             element={<ResumeManager />} />
            <Route path="notes"               element={<InterviewNotes />} />
            <Route path="analytics"           element={<Analytics />} />
            <Route path="settings"            element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
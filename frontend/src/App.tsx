import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import Agenda from './pages/Agenda';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import UrgentHelp from './pages/UrgentHelp';
import Admin from './pages/Admin';
import AuthCallback from './pages/AuthCallback';
import Patients from './pages/Patients';
import NotFound from './pages/NotFound';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/agenda" element={<Agenda />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/urgent-help" element={<UrgentHelp />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/patients" element={<Patients />} />
          </Route>
        </Route>

        {/* Fallback */}
      <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
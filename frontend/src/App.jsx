import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { OutageBanner } from './components/outage/OutageBanner';

// Pages
import { Home } from './pages/Home';
import { Map } from './pages/Map';
import { Networks } from './pages/Networks';
import { Outages } from './pages/Outages';
import { Test } from './pages/Test';
import { Report } from './pages/Report';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { History } from './pages/History';
import { Alerts } from './pages/Alerts';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminOutages } from './pages/admin/AdminOutages';
import { AdminNetworks } from './pages/admin/AdminNetworks';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />;
  
  return children;
}

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <OutageBanner />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/map" element={<MainLayout><Map /></MainLayout>} />
        <Route path="/networks" element={<MainLayout><Networks /></MainLayout>} />
        <Route path="/outages" element={<MainLayout><Outages /></MainLayout>} />
        <Route path="/test" element={<MainLayout><Test /></MainLayout>} />
        <Route path="/report" element={<MainLayout><Report /></MainLayout>} />
        <Route path="/history" element={<MainLayout><History /></MainLayout>} />
        <Route path="/alerts" element={<ProtectedRoute><MainLayout><Alerts /></MainLayout></ProtectedRoute>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout><Profile /></MainLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="outages" element={<AdminOutages />} />
          <Route path="networks" element={<AdminNetworks />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

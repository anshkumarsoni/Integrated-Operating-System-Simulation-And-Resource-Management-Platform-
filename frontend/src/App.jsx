import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SimulationProvider } from './context/SimulationContext';
import { useToast } from './hooks/useToast';
import Toast from './components/Toast';
import DashboardLayout from './layouts/DashboardLayout';

// Page imports
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Processes from './pages/Processes';
import CPUScheduling from './pages/CPUScheduling';
import MemoryManagement from './pages/MemoryManagement';
import VirtualMemory from './pages/VirtualMemory';
import ThreadsSync from './pages/ThreadsSync';
import IOManagement from './pages/IOManagement';
import ResourceManagement from './pages/ResourceManagement';
import DeadlockManagement from './pages/DeadlockManagement';
import FileSystem from './pages/FileSystem';
import SystemCalls from './pages/SystemCalls';
import IntegratedSimulation from './pages/IntegratedSimulation';
import ExecutionHistory from './pages/ExecutionHistory';
import SQLDatabase from './pages/SQLDatabase';
import Settings from './pages/Settings';

const AppContent = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="processes" element={<Processes />} />
          <Route path="cpu-scheduling" element={<CPUScheduling />} />
          <Route path="memory-management" element={<MemoryManagement />} />
          <Route path="virtual-memory" element={<VirtualMemory />} />
          <Route path="threads-sync" element={<ThreadsSync />} />
          <Route path="io-management" element={<IOManagement />} />
          <Route path="resource-management" element={<ResourceManagement />} />
          <Route path="deadlock-management" element={<DeadlockManagement />} />
          <Route path="file-system" element={<FileSystem />} />
          <Route path="system-calls" element={<SystemCalls />} />
          <Route path="integrated-simulation" element={<IntegratedSimulation />} />
          <Route path="execution-history" element={<ExecutionHistory />} />
          <Route path="sql-database" element={<SQLDatabase />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toast toasts={toasts} removeToast={removeToast} />
    </>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SimulationProvider>
          <AppContent />
        </SimulationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

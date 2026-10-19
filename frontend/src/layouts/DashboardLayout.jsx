import React, { useContext, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const PATH_TITLES = {
  '/dashboard': 'Dashboard Overview',
  '/processes': 'Process Management & PCB',
  '/cpu-scheduling': 'CPU Scheduling Simulation',
  '/memory-management': 'Memory Management & Partitioning',
  '/virtual-memory': 'Virtual Memory & Page Replacement',
  '/threads-sync': 'Threads & Concurrency Synchronization',
  '/io-management': 'I/O Device & Disk Head Scheduling',
  '/resource-management': 'System Resource Management',
  '/deadlock-management': "Deadlock Avoidance & Banker's Algorithm",
  '/file-system': 'Virtual File System & Permissions',
  '/system-calls': 'System Calls Audit & Kernel Traps',
  '/integrated-simulation': 'Integrated OS Lifecycle Workflow',
  '/execution-history': 'Execution History & Audit Trail',
  '/settings': 'System Configuration & MySQL Schema'
};

const DashboardLayout = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentTitle = PATH_TITLES[location.pathname] || 'OS Simulation Platform';

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Mobile backdrop */}
      <div 
        className={`fixed inset-0 z-20 transition-opacity bg-black/60 lg:hidden backdrop-blur-sm ${sidebarOpen ? 'block' : 'hidden'}`} 
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar navigation */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content body */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={currentTitle} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

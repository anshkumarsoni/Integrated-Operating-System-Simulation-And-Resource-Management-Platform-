import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Monitor, LayoutDashboard, ListChecks, Cpu, MemoryStick, 
  Layers, GitBranch, HardDrive, Package, Lock, 
  FolderTree, Terminal, Play, History, Database, Settings, 
  User, LogOut 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Processes', path: '/processes', icon: ListChecks },
  { name: 'CPU Scheduling', path: '/cpu-scheduling', icon: Cpu },
  { name: 'Memory Management', path: '/memory-management', icon: MemoryStick },
  { name: 'Virtual Memory', path: '/virtual-memory', icon: Layers },
  { name: 'Threads & Sync', path: '/threads-sync', icon: GitBranch },
  { name: 'I/O Management', path: '/io-management', icon: HardDrive },
  { name: 'Resource Management', path: '/resource-management', icon: Package },
  { name: 'Deadlock Management', path: '/deadlock-management', icon: Lock },
  { name: 'File System', path: '/file-system', icon: FolderTree },
  { name: 'System Calls', path: '/system-calls', icon: Terminal },
  { name: 'Integrated Simulation', path: '/integrated-simulation', icon: Play },
  { name: 'Execution History', path: '/execution-history', icon: History },
  { name: 'SQL Database', path: '/sql-database', icon: Database },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = ({ onClose }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      <div className="flex items-center h-16 px-4 border-b border-slate-800">
        <Monitor className="w-6 h-6 text-blue-500 mr-2" />
        <span className="text-lg font-bold text-slate-100 tracking-tight">OS Sim Platform</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-blue-400 border-l-2 border-blue-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 pr-2">
            <div className="p-1.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 rounded-lg shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate" title={user?.name || user?.username}>
                {user?.name || user?.username || 'Admin'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.role || 'Administrator'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors shrink-0"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

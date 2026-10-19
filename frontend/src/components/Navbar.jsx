import React, { useContext } from 'react';
import { Menu, LogOut, RefreshCw, Activity, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useSimulation } from '../hooks/useSimulation';

const Navbar = ({ onMenuClick, title = 'Dashboard Overview' }) => {
  const { user, logout } = useContext(AuthContext);
  const { resetAll, refreshAll } = useSimulation();

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-slate-900 border-b border-slate-800 shrink-0 select-none">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center space-x-3 lg:space-x-4">
        {/* Live Simulation Status */}
        <div className="hidden sm:flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Simulation Online</span>
        </div>

        {/* Quick Refresh / Reseed */}
        <button
          onClick={() => {
            refreshAll();
          }}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800 hover:border-slate-700"
          title="Refresh All Modules"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>

        {/* User Profile & Logout */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="hidden md:block text-left">
              <span className="text-xs font-semibold text-slate-200 block leading-tight max-w-[150px] truncate" title={user?.name || user?.username}>
                {user?.name || user?.username || 'Admin'}
              </span>
              <span className="text-[10px] text-indigo-400/90 font-medium tracking-wide">
                {user?.role || 'Administrator'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

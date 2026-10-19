import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Monitor, Lock, ShieldCheck, KeyRound, ArrowRight, 
  UserPlus, LogIn, UserCheck, GraduationCap, Sparkles, AlertCircle, CheckCircle2, User
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { auth as authApi } from '../api/api';

const AVAILABLE_ROLES = [
  { id: 'OS Student / Researcher', label: 'OS Student / Researcher', desc: 'Standard student exploration & simulation access' },
  { id: 'System Administrator', label: 'System Administrator', desc: 'Full root simulation privileges & system control' },
  { id: 'Kernel Developer', label: 'Kernel Developer', desc: 'Low-level PCB, trap & memory diagnostic tools' },
  { id: 'Faculty Evaluator', label: 'Faculty Evaluator', desc: 'Academic review, grading & audit trail access' }
];

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Login Form State
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('OS Student / Researcher');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Feedback State
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);

  const navigate = useNavigate();
  const { login, register } = useContext(AuthContext);

  const loadAccounts = async () => {
    try {
      const users = await authApi.getUsers();
      setAvailableAccounts(users || []);
    } catch (e) {
      console.warn('Failed to load accounts list', e);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(loginUsername.trim(), loginPassword.trim());
      if (result && result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid username or password. Check credentials or register a new user.');
      }
    } catch (err) {
      setError('Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regUsername.trim() || !regPassword.trim() || !regName.trim()) {
      setError('Please provide Full Name, Username, and Password.');
      return;
    }

    if (regUsername.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    if (regPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        username: regUsername.trim(),
        password: regPassword.trim(),
        name: regName.trim(),
        role: regRole,
        email: regEmail.trim()
      });

      if (result && result.success) {
        setSuccessMsg(`Account created successfully for ${result.user.name}! Logging you in...`);
        await loadAccounts();
        setTimeout(() => {
          navigate('/dashboard');
        }, 800);
      } else {
        setError(result.message || 'Registration failed. Username may already exist.');
      }
    } catch (err) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickFillAccount = (user) => {
    setMode('login');
    setLoginUsername(user.username);
    // Auto-fill default passwords for predefined demo accounts
    if (user.username === 'admin') setLoginPassword('admin123');
    else if (user.username === 'student') setLoginPassword('student123');
    else setLoginPassword('');
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 mb-4 shadow-lg shadow-indigo-500/5">
          <Monitor className="h-10 w-10 text-indigo-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Integrated OS Simulation Platform
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
          Operating System Simulation & Resource Management Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-slate-900 py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-800 space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-sm font-semibold">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
              className={`flex items-center justify-center py-2.5 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
              className={`flex items-center justify-center py-2.5 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Register New User
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* 1. SIGN IN FORM                            */}
          {/* ========================================== */}
          {mode === 'login' ? (
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="login-username" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Username
                </label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  required
                  placeholder="e.g. admin or student"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Need a new account?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium transition-all pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/30"
                >
                  {isLoading ? 'Authenticating...' : (
                    <>
                      Sign In to Platform <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ========================================== */
            /* 2. REGISTER NEW USER FORM                  */
            /* ========================================== */
            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="reg-username" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Username
                  </label>
                  <input
                    id="reg-username"
                    type="text"
                    required
                    placeholder="e.g. aarav10"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="reg-role" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    User Role
                  </label>
                  <select
                    id="reg-role"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium transition-all"
                  >
                    {AVAILABLE_ROLES.map((r) => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Email / Student ID <span className="text-slate-500 lowercase">(optional)</span>
                  </label>
                  <input
                    id="reg-email"
                    type="text"
                    placeholder="e.g. 21BCE1042"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="reg-pass" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="reg-pass"
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 4 chars"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium transition-all pr-8"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                    >
                      {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-confirm" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    id="reg-confirm"
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/30"
                >
                  {isLoading ? 'Creating Account...' : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" /> Register & Access Dashboard
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Accounts Selection */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center font-medium">
                <KeyRound className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                Quick-Select Accounts ({availableAccounts.length}):
              </span>
              <span className="text-[11px] text-slate-500">Click to fill</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableAccounts.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => quickFillAccount(acc)}
                  className={`inline-flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    loginUsername === acc.username && mode === 'login'
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {acc.role === 'Administrator' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span>{acc.username}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({acc.role.split(' ')[0]})</span>
                </button>
              ))}
            </div>

            <div className="text-center pt-2">
              <p className="text-[11px] text-slate-500">
                Integrated OS Simulation Platform — 3rd-Year B.Tech CSE Project
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}


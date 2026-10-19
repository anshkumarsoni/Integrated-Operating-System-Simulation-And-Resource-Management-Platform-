export const formatTimestamp = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toTimeString().split(' ')[0];
};

export const formatDateFull = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return String(date);
  return d.toISOString().replace('T', ' ').slice(0, 19);
};

export const generateId = (prefix = 'id') => {
  return `${prefix}_${Math.floor(Math.random() * 900) + 100}`;
};

export const getStateColor = (state) => {
  const normalized = (state || '').toUpperCase();
  const stateColors = {
    NEW: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    READY: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    RUNNING: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    WAITING: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    TERMINATED: 'text-slate-400 bg-slate-800/60 border-slate-700'
  };
  return stateColors[normalized] || 'text-slate-400 bg-slate-800/40 border-slate-700';
};

export const getStatusColor = (status) => {
  const normalized = (status || '').toUpperCase();
  const statusColors = {
    SUCCESS: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    COMPLETED: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    FAILED: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    PENDING: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    PROCESSING: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    WAITING: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    SAFE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    UNSAFE: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
  };
  return statusColors[normalized] || 'text-slate-400 bg-slate-800/40 border-slate-700';
};

export const formatBytes = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const truncate = (str, length) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

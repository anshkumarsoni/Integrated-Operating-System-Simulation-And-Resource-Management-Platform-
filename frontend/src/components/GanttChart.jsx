import React from 'react';

const colors = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500'
];

const GanttChart = ({ data = [], totalTime = 100 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-slate-800/50 rounded-lg border border-slate-700 border-dashed">
        <span className="text-slate-500">No scheduling data available</span>
      </div>
    );
  }

  // Ensure totalTime is valid to avoid division by zero
  const safeTotalTime = Math.max(totalTime, 1);

  return (
    <div className="w-full">
      <div className="relative w-full h-16 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex">
        {data.map((item, index) => {
          const width = ((item.end - item.start) / safeTotalTime) * 100;
          const left = (item.start / safeTotalTime) * 100;
          
          return (
            <div
              key={`${item.pid}-${index}`}
              className={`absolute h-full flex flex-col items-center justify-center border-r border-slate-900/50 ${item.color || colors[index % colors.length]}`}
              style={{ width: `${width}%`, left: `${left}%` }}
              title={`${item.name} (${item.start} - ${item.end})`}
            >
              <span className="text-xs font-bold text-white shadow-sm drop-shadow-md truncate px-1">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="relative w-full mt-2 h-6 text-xs text-slate-400">
        {data.map((item, index) => (
          <React.Fragment key={`time-${index}`}>
            {index === 0 && (
              <span className="absolute transform -translate-x-1/2" style={{ left: '0%' }}>0</span>
            )}
            <span 
              className="absolute transform -translate-x-1/2" 
              style={{ left: `${(item.end / safeTotalTime) * 100}%` }}
            >
              {item.end}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default GanttChart;

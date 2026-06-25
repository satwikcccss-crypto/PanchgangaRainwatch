import React from 'react';
import { LayoutGrid, Radio, CloudSun, Info, RotateCw, ArrowUp } from 'lucide-react';

const Sidebar = ({ activeView, onViewChange, onAboutClick, onRefresh, isRefreshing }) => {
  const items = [
    { id: 'home', icon: <LayoutGrid className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'network', icon: <Radio className="w-5 h-5" />, label: 'Telemetry Network' },
    { id: 'forecast', icon: <CloudSun className="w-5 h-5" />, label: 'Weather Forecast' },
    { id: 'info', icon: <Info className="w-5 h-5" />, label: 'Project Info', action: onAboutClick },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:bottom-auto md:left-auto md:right-6 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 z-[1000] flex flex-row md:flex-col items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-3 md:py-6 md:px-3 rounded-full border border-slate-200/80 shadow-[0_10px_30px_rgba(30,58,138,0.08)] select-none">
      {items.map((item) => {
        const isActive = item.action ? false : activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => item.action ? item.action() : onViewChange(item.id)}
            title={item.label}
            className={`p-3 rounded-full transition-all duration-300 relative group ${
              isActive
                ? 'bg-blue-50 text-blue-900 shadow-inner border border-blue-100/30 scale-105'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {item.icon}
            
            {/* Tooltip */}
            <span className="absolute hidden md:block left-0 -translate-x-[110%] top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Separator line */}
      <div className="w-[1px] h-6 bg-slate-200 mx-1 md:w-8 md:h-[1px] md:my-1" />

      {/* Refresh Action */}
      <button
        onClick={onRefresh}
        title="Refresh Data"
        className={`p-3 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all ${
          isRefreshing ? 'animate-spin text-blue-600' : ''
        }`}
      >
        <RotateCw className="w-5 h-5" />
      </button>

      {/* Scroll to Top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Scroll to Top"
        className="p-3 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Sidebar;

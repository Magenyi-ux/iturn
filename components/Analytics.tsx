
import React from 'react';
import { AppState } from '../types';

interface AnalyticsProps {
  state: AppState;
}

const Analytics: React.FC<AnalyticsProps> = ({ state }) => {
  const totalRevenue = state.orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const activeProjects = state.orders.filter(o => o.status !== 'Delivered').length;
  
  const categoryStats = state.styleConcepts.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-stone-100 pb-12">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Operations Intelligence</span>
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight">Atelier Analytics</h2>
          <p className="text-stone-400 font-medium text-sm md:text-base leading-relaxed">Intelligence report for workshop output and fiscal performance.</p>
        </div>
        <div className="bg-white px-8 py-5 rounded-[2rem] border border-stone-100 shadow-sm self-start md:self-auto group hover:border-stone-200 transition-all">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 mb-1 group-hover:text-stone-400 transition-colors">Quarterly Output</p>
          <p className="text-2xl font-serif font-bold text-stone-900 tracking-tight">FY 2025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[
          { label: 'Total Yield', value: `$${totalRevenue.toLocaleString()}`, trend: '+12%', trendColor: 'text-emerald-500' },
          { label: 'Workroom Load', value: activeProjects, trend: 'Active', trendColor: 'text-stone-300' },
          { label: 'Efficiency', value: '94%', trend: 'Optimum', trendColor: 'text-emerald-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm group hover:shadow-2xl hover:shadow-stone-100 transition-all duration-700">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-stone-300 mb-4">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h4 className="text-5xl font-serif font-bold text-stone-900 tracking-tighter">{stat.value}</h4>
              <span className={`text-[10px] font-black uppercase tracking-widest mb-1 px-3 py-1 rounded-full bg-stone-50 border border-stone-100 ${stat.trendColor}`}>{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-stone-900 text-white p-10 rounded-[3rem] shadow-2xl">
          <h3 className="text-xl font-serif font-bold mb-8">Design Categories</h3>
          <div className="space-y-6">
            {Object.entries(categoryStats).map(([cat, count]) => (
              <div key={cat} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>{cat}</span>
                  <span>{count} Designs</span>
                </div>
                <div className="h-1.5 w-full bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-1000" 
                    // Fix: Explicitly cast count to number as Object.entries returns [string, any][] or similar, causing arithmetic errors
                    style={{ width: `${((count as number) / (state.styleConcepts.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-stone-100 shadow-sm flex flex-col justify-center items-center text-center space-y-6">
           <div className="w-24 h-24 rounded-full border-8 border-stone-50 border-t-stone-900 flex items-center justify-center">
              <span className="font-serif font-bold text-xl">A+</span>
           </div>
           <div>
             <h3 className="text-xl font-serif font-bold">Studio Health</h3>
             <p className="text-xs text-stone-500 max-w-xs mx-auto mt-2">
               Your atelier is performing above the digital average. High demand in "Avant-Garde" concepts suggests a specialized pivot.
             </p>
           </div>
           <button className="px-8 py-3 bg-stone-50 text-stone-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-stone-200">
             Export Technical Report
           </button>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

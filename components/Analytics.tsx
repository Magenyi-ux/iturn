
import React from 'react';
import { AppState } from '../types';

interface AnalyticsProps {
  state: AppState;
}

const Analytics: React.FC<AnalyticsProps> = ({ state }) => {
  const totalRevenue = state.orders.reduce((acc, o) => acc + o.price, 0);
  const activeProjects = state.orders.filter(o => o.status !== 'Delivered').length;
  
  const categoryStats = state.styleConcepts.reduce((acc: Record<string, number>, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end border-b border-stone-100 pb-8">
        <div>
          <h2 className="text-4xl font-serif font-bold">Atelier Analytics</h2>
          <p className="text-stone-500 mt-2">Intelligence report for workshop performance.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">Quarterly Output</p>
          <p className="text-2xl font-serif font-bold text-stone-900">FY 2025</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Total Yield</p>
          <div className="flex items-end gap-2">
            <h4 className="text-4xl font-serif font-bold text-stone-900">${totalRevenue.toLocaleString()}</h4>
            <span className="text-green-500 text-xs font-bold mb-1">+12%</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Workroom Load</p>
          <div className="flex items-end gap-2">
            <h4 className="text-4xl font-serif font-bold text-stone-900">{activeProjects}</h4>
            <span className="text-stone-300 text-xs font-bold mb-1">Active Projects</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Efficiency</p>
          <div className="flex items-end gap-2">
            <h4 className="text-4xl font-serif font-bold text-stone-900">94%</h4>
            <span className="text-stone-300 text-xs font-bold mb-1">Couture Standard</span>
          </div>
        </div>
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


import React from 'react';
import { Client } from '../types';

interface ClientVaultProps {
  clients: Client[];
  onSelect: (client: Client) => void;
  onNewProfile: () => void;
}

const ClientVault: React.FC<ClientVaultProps> = ({ clients, onSelect, onNewProfile }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Archives</span>
          <h2 className="text-5xl font-serif font-bold text-stone-900 tracking-tight">Client Vault</h2>
          <p className="text-stone-400 text-sm font-medium">Historical profiles and bespoke measurement logs.</p>
        </div>
        <button 
          onClick={onNewProfile}
          className="w-full md:w-auto px-10 py-5 bg-stone-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 hover:shadow-2xl hover:shadow-stone-200 transition-all active:scale-95"
        >
          New Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {clients.map(client => (
          <div 
            key={client.id}
            onClick={() => onSelect(client)}
            className="group bg-white border border-stone-100 p-10 rounded-[3rem] hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:border-stone-200 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-full -mr-16 -mt-16 group-hover:bg-stone-100 transition-colors"></div>
            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-16 h-16 bg-stone-50 rounded-3xl flex items-center justify-center text-stone-300 group-hover:bg-stone-900 group-hover:text-white group-hover:shadow-xl transition-all duration-500">
                <span className="font-serif font-bold text-2xl">{client.name[0]}</span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-stone-900">{client.name}</h3>
                <p className="text-[9px] text-stone-400 font-black uppercase tracking-[0.2em] mt-1">{client.lastVisit}</p>
              </div>
            </div>
            
            <div className="space-y-4 pt-8 border-t border-stone-50 relative z-10">
              {[
                { label: 'Stature', value: `${client.measurements.height}cm` },
                { label: 'Waistline', value: `${client.measurements.waist}cm` },
                { label: 'Commissions', value: client.history.length }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">{stat.label}</span>
                  <span className="font-serif font-bold text-stone-900">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-stone-50 flex justify-end opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
               <span className="text-[9px] font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
                 View File
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientVault;


import React from 'react';
import { Client } from '../types';
import { UserPlus, Search, MoreHorizontal, MapPin, Calendar } from 'lucide-react';

interface ClientVaultProps {
  clients: Client[];
  onSelect: (client: Client) => void;
  onNewProfile: () => void;
}

const ClientVault: React.FC<ClientVaultProps> = ({ clients, onSelect, onNewProfile }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-serif font-bold text-[var(--color-primary)] tracking-tight">Client Archive</h2>
          <p className="text-[var(--color-text-secondary)] mt-3 font-serif italic text-lg">Curated profiles and bespoke measurement history.</p>
        </div>
        <button 
          onClick={onNewProfile}
          className="flex items-center gap-3 px-8 py-4 bg-[var(--color-primary)] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all"
        >
          <UserPlus className="w-4 h-4 text-[var(--color-secondary)]" />
          Establish New Profile
        </button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
        <input
          type="text"
          placeholder="Search Imperial Records..."
          className="w-full bg-[var(--color-surface)] border border-[var(--color-primary)]/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-[var(--color-secondary)] transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {clients.map(client => (
          <div 
            key={client.id}
            onClick={() => onSelect(client)}
            className="group bg-[var(--color-surface)] border border-[var(--color-primary)]/5 p-10 rounded-[3rem] hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all cursor-pointer relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-5 group-hover:-translate-y-5 transition-transform duration-700" />

            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-[var(--color-primary)]/5 rounded-[2rem] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-500 shadow-inner">
                <span className="font-serif font-bold text-2xl">{client.name[0]}</span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-2xl text-[var(--color-primary)]">{client.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3 text-[var(--color-secondary)]" />
                  <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest font-black">Visited {client.lastVisit}</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-[var(--color-primary)]/5">
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Height</span>
                <p className="text-sm font-serif font-bold text-[var(--color-primary)]">{client.measurements.height}cm</p>
              </div>
              <div className="space-y-1">
                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Waist</span>
                <p className="text-sm font-serif font-bold text-[var(--color-primary)]">{client.measurements.waist}cm</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[8px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Orders</span>
                <p className="text-sm font-serif font-bold text-[var(--color-primary)]">{client.history.length}</p>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)]">Open Dossier</span>
               <MoreHorizontal className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
          </div>
        ))}

        <button
          onClick={onNewProfile}
          className="group border-2 border-dashed border-[var(--color-primary)]/10 p-10 rounded-[3rem] flex flex-col items-center justify-center gap-6 hover:border-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/5 transition-all duration-500"
        >
          <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/5 flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all">
            <UserPlus className="w-8 h-8" />
          </div>
          <p className="font-serif font-bold text-lg text-[var(--color-primary)]/40 group-hover:text-[var(--color-primary)] transition-colors">Add Client Profile</p>
        </button>
      </div>
    </div>
  );
};

export default ClientVault;

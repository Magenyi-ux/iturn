
import React from 'react';
import { Client } from '../types';

interface ClientVaultProps {
  clients: Client[];
  onSelect: (client: Client) => void;
  onNewProfile: () => void;
}

const ClientVault: React.FC<ClientVaultProps> = ({ clients, onSelect, onNewProfile }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-stone-900">Client Vault</h2>
          <p className="text-stone-500 mt-2">Historical profiles and measurement logs.</p>
        </div>
        <button 
          onClick={onNewProfile}
          className="px-6 py-2 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all"
        >
          New Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <div 
            key={client.id}
            onClick={() => onSelect(client)}
            className="group bg-white border border-stone-100 p-8 rounded-3xl hover:shadow-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 group-hover:bg-stone-900 group-hover:text-stone-50 transition-colors">
                <span className="font-serif font-bold text-xl">{client.name[0]}</span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">{client.name}</h3>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest">Last Visit: {client.lastVisit}</p>
              </div>
            </div>
            
            <div className="space-y-3 pt-6 border-t border-stone-50">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <span>Height</span>
                <span className="text-stone-900">{client.measurements.height}cm</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <span>Waist</span>
                <span className="text-stone-900">{client.measurements.waist}cm</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <span>Orders</span>
                <span className="text-stone-900">{client.history.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientVault;

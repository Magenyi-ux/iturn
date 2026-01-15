
import React from 'react';
import { Order, Client, StyleConcept } from '../types';

interface WorkroomProps {
  orders: Order[];
  clients: Client[];
  concepts: StyleConcept[];
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onOpenBlueprint: (styleId: string) => void;
}

const Workroom: React.FC<WorkroomProps> = ({ orders, clients, concepts, onUpdateStatus, onOpenBlueprint }) => {
  const statuses: Order['status'][] = ['Design', 'Cutting', 'Basting', 'Finishing', 'Delivered'];

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
      {statuses.map(status => (
        <div key={status} className="flex-shrink-0 w-96 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b-2 border-stone-900 pb-2 mb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-stone-900">{status}</h3>
            <span className="bg-stone-900 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {orders.filter(o => o.status === status).length}
            </span>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide">
            {orders.filter(o => o.status === status).map(order => {
              const client = clients.find(c => c.id === order.clientId);
              const concept = concepts.find(c => c.id === order.styleId);
              const previewImage = concept?.refinements && concept.refinements.length > 0 
                ? concept.refinements[concept.refinements.length - 1] 
                : null;

              return (
                <div key={order.id} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden group">
                  {previewImage && (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-stone-50 relative">
                      <img src={previewImage} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" alt="Preview" />
                      <div className="absolute top-4 left-4 bg-stone-900/80 backdrop-blur text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
                        ${order.totalPrice.toLocaleString()}
                      </div>
                    </div>
                  )}
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div 
                        className="cursor-pointer"
                        onClick={() => onOpenBlueprint(order.styleId)}
                      >
                        <h4 className="font-serif font-bold text-stone-800 text-xl leading-tight hover:underline">{client?.name}</h4>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1">{concept?.title}</p>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-4 rounded-2xl space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Construction Breakdown</p>
                       <div className="space-y-1">
                          {order.priceBreakdown.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[10px]">
                               <span className="text-stone-500">{item.name}</span>
                               <span className="font-bold text-stone-900">${item.cost}</span>
                            </div>
                          ))}
                          {order.priceBreakdown.length > 3 && (
                             <p className="text-[9px] text-stone-300 italic pt-1">+{order.priceBreakdown.length - 3} more items...</p>
                          )}
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <p className="text-[9px] text-stone-300 font-medium">Ref: {order.id.toUpperCase()}</p>
                      <div className="flex gap-2">
                        {status !== 'Delivered' && (
                          <button 
                            onClick={() => onUpdateStatus(order.id, statuses[statuses.indexOf(status) + 1])}
                            className="px-6 py-2.5 bg-stone-900 text-white rounded-xl transition-all text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-stone-800 active:scale-95 flex items-center gap-2"
                          >
                            Advance
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Workroom;

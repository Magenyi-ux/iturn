
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
    <div className="h-[calc(100vh-16rem)] flex gap-8 overflow-x-auto pb-8 snap-x snap-mandatory lg:snap-none scroll-smooth pr-4 lg:pr-0">
      {statuses.map(status => (
        <div key={status} className="flex-shrink-0 w-[85vw] md:w-96 flex flex-col space-y-6 snap-center">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-2">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-stone-900"></div>
               <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-900">{status}</h3>
            </div>
            <span className="bg-stone-50 text-stone-400 text-[9px] px-3 py-1 rounded-full font-black border border-stone-100">
              {orders.filter(o => o.status === status).length}
            </span>
          </div>
          
          <div className="flex-1 space-y-6 overflow-y-auto pr-4 scrollbar-hide">
            {orders.filter(o => o.status === status).map(order => {
              const client = clients.find(c => c.id === order.clientId);
              const concept = concepts.find(c => c.id === order.styleId);
              const previewImage = concept?.refinements && concept.refinements.length > 0 
                ? concept.refinements[concept.refinements.length - 1] 
                : null;

              return (
                <div key={order.id} className="bg-white rounded-[3rem] border border-stone-100 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden group">
                  {previewImage && (
                    <div className="aspect-[3/2] w-full overflow-hidden bg-stone-50 relative">
                      <img src={previewImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Preview" />
                      <div className="absolute top-6 left-6 bg-stone-900/90 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-white/10 shadow-xl">
                        ${order.totalPrice.toLocaleString()}
                      </div>
                    </div>
                  )}
                  <div className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div 
                        className="cursor-pointer space-y-1"
                        onClick={() => onOpenBlueprint(order.styleId)}
                      >
                        <h4 className="font-serif font-bold text-stone-900 text-2xl leading-tight group-hover:text-stone-600 transition-colors">{client?.name}</h4>
                        <p className="text-[9px] text-stone-300 font-black uppercase tracking-[0.3em]">{concept?.title}</p>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-6 rounded-[2rem] space-y-4 border border-stone-100/50">
                       <p className="text-[8px] font-black uppercase tracking-[0.3em] text-stone-400 border-b border-stone-200/50 pb-2">Manifest</p>
                       <div className="space-y-2">
                          {order.priceBreakdown.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[10px]">
                               <span className="text-stone-500 font-medium">{item.name}</span>
                               <span className="font-serif font-bold text-stone-900">${item.cost}</span>
                            </div>
                          ))}
                          {order.priceBreakdown.length > 2 && (
                             <p className="text-[8px] text-stone-300 font-black uppercase tracking-widest pt-1">+{order.priceBreakdown.length - 2} more elements</p>
                          )}
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                      <div className="space-y-1">
                        <p className="text-[8px] text-stone-300 font-black uppercase tracking-[0.2em]">Archival Ref</p>
                        <p className="text-[10px] text-stone-900 font-bold">{order.id.toUpperCase()}</p>
                      </div>
                      <div className="flex gap-2">
                        {status !== 'Delivered' && (
                          <button 
                            onClick={() => onUpdateStatus(order.id, statuses[statuses.indexOf(status) + 1])}
                            className="px-8 py-4 bg-stone-900 text-white rounded-2xl transition-all text-[9px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-stone-800 active:scale-95 flex items-center gap-3"
                          >
                            Advance
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

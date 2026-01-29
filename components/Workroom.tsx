
import React from 'react';
import { Order, Client, StyleConcept } from '../types';
import { ChevronRight, Clock, DollarSign, ExternalLink } from 'lucide-react';

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
    <div className="h-[calc(100vh-12rem)] flex gap-8 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
      {statuses.map(status => (
        <div key={status} className="flex-shrink-0 w-[85vw] md:w-96 flex flex-col space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[var(--color-primary)] pb-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--color-primary)]">{status}</h3>
            <span className="bg-[var(--color-primary)] text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-lg">
              {orders.filter(o => o.status === status).length}
            </span>
          </div>
          
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 scrollbar-hide">
            {orders.filter(o => o.status === status).map(order => {
              const client = clients.find(c => c.id === order.clientId);
              const concept = concepts.find(c => c.id === order.styleId);
              const previewImage = concept?.refinements && concept.refinements.length > 0 
                ? concept.refinements[concept.refinements.length - 1] 
                : null;

              return (
                <div key={order.id} className="bg-[var(--color-surface)] rounded-[3rem] border border-[var(--color-primary)]/5 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all overflow-hidden group">
                  {previewImage && (
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--color-background)] relative">
                      <img src={previewImage} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110" alt="Preview" />
                      <div className="absolute top-6 left-6 bg-[var(--color-primary)]/90 backdrop-blur-xl text-white text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-white/10 flex items-center gap-2">
                        <DollarSign className="w-3 h-3 text-[var(--color-secondary)]" />
                        {order.totalPrice.toLocaleString()}
                      </div>
                    </div>
                  )}
                  <div className="p-8 space-y-8">
                    <div className="flex justify-between items-start">
                      <div 
                        className="cursor-pointer group/title"
                        onClick={() => onOpenBlueprint(order.styleId)}
                      >
                        <h4 className="font-serif font-bold text-[var(--color-primary)] text-2xl leading-tight group-hover/title:text-[var(--color-secondary)] transition-colors">{client?.name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-[9px] text-[var(--color-text-secondary)] font-black uppercase tracking-widest">{concept?.title}</p>
                          <ExternalLink className="w-3 h-3 text-[var(--color-secondary)] opacity-0 group-hover/title:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-[var(--color-primary)]/[0.02] p-6 rounded-[2rem] border border-[var(--color-primary)]/5 space-y-4">
                       <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-3 h-3 text-[var(--color-secondary)]" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Construction Breakdown</p>
                       </div>
                       <div className="space-y-3">
                          {order.priceBreakdown.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[11px] items-center">
                               <span className="text-[var(--color-text-secondary)] font-serif italic">{item.name}</span>
                               <span className="font-bold text-[var(--color-primary)]">${item.cost}</span>
                            </div>
                          ))}
                          {order.priceBreakdown.length > 3 && (
                             <p className="text-[9px] text-[var(--color-secondary)] font-black uppercase tracking-widest pt-2">+{order.priceBreakdown.length - 3} Additional Elements</p>
                          )}
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-[var(--color-primary)]/5">
                      <p className="text-[9px] text-[var(--color-text-secondary)] font-black uppercase tracking-widest">ID: {order.id.toUpperCase()}</p>
                      <div className="flex gap-2">
                        {status !== 'Delivered' && (
                          <button 
                            onClick={() => onUpdateStatus(order.id, statuses[statuses.indexOf(status) + 1])}
                            className="px-8 py-3.5 bg-[var(--color-primary)] text-white rounded-2xl transition-all text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[var(--color-accent)] hover:scale-105 active:scale-95 flex items-center gap-3 group/btn"
                          >
                            Advance Phase
                            <ChevronRight className="w-4 h-4 text-[var(--color-secondary)] group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {orders.filter(o => o.status === status).length === 0 && (
              <div className="py-20 text-center space-y-4 opacity-20 grayscale">
                 <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="w-8 h-8 text-[var(--color-primary)]" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">No active orders</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Workroom;

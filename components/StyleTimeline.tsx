
import React from 'react';
import { Client, Order, StyleConcept } from '../types';

interface StyleTimelineProps {
  client: Client;
  orders: Order[];
  concepts: StyleConcept[];
  onBack: () => void;
}

const StyleTimeline: React.FC<StyleTimelineProps> = ({ client, orders, concepts, onBack }) => {
  const clientOrders = orders.filter(o => o.clientId === client.id);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      <div className="flex items-center gap-6">
        <button onClick={onBack} className="p-3 bg-white border border-stone-100 rounded-2xl text-stone-900 hover:bg-stone-900 hover:text-white transition-all">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <div>
          <h2 className="text-4xl font-serif font-bold">{client.name}</h2>
          <p className="text-stone-500 uppercase text-[10px] font-black tracking-widest">Aesthetic Evolution</p>
        </div>
      </div>

      <div className="relative border-l-2 border-stone-100 ml-6 pl-12 space-y-24">
        {clientOrders.length === 0 ? (
          <p className="text-stone-400 italic">No historical orders found for this client.</p>
        ) : (
          clientOrders.map((order, idx) => {
            const concept = concepts.find(c => c.id === order.styleId);
            const image = concept?.refinements?.[concept.refinements.length - 1];

            return (
              <div key={order.id} className="relative group">
                <div className="absolute -left-[3.75rem] top-0 w-8 h-8 rounded-full bg-stone-900 border-4 border-white shadow-xl z-10 flex items-center justify-center">
                   <span className="text-[10px] text-white font-bold">{idx + 1}</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="aspect-[3/4] rounded-[2rem] overflow-hidden border border-stone-100 shadow-xl bg-white">
                    {image ? (
                      <img src={image} className="w-full h-full object-cover" alt="History" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-stone-100 font-serif text-5xl">Atelier</div>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black uppercase text-stone-400 tracking-widest">
                         {new Date(order.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                       </p>
                       <h3 className="text-3xl font-serif font-bold text-stone-900">{concept?.title}</h3>
                    </div>
                    
                    <p className="text-stone-500 leading-relaxed italic border-l-2 border-stone-200 pl-6">
                      "{concept?.description}"
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {concept?.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-stone-50 rounded-full text-[9px] font-black uppercase tracking-widest text-stone-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StyleTimeline;

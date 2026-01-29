
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
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
      <div className="flex flex-col md:flex-row md:items-center gap-8 border-b border-stone-100 pb-12">
        <button
          onClick={onBack}
          className="w-16 h-16 bg-white border border-stone-100 rounded-[1.5rem] text-stone-900 hover:bg-stone-900 hover:text-white hover:shadow-2xl transition-all duration-500 flex items-center justify-center active:scale-90"
        >
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Client History</span>
          <h2 className="text-5xl font-serif font-bold text-stone-900 tracking-tight">{client.name}</h2>
          <p className="text-stone-400 font-medium uppercase text-[9px] tracking-[0.4em]">Archival Aesthetic Evolution</p>
        </div>
      </div>

      <div className="relative border-l border-stone-100 ml-8 md:ml-12 pl-12 md:pl-20 space-y-32">
        {clientOrders.length === 0 ? (
          <p className="text-stone-400 italic">No historical orders found for this client.</p>
        ) : (
          clientOrders.map((order, idx) => {
            const concept = concepts.find(c => c.id === order.styleId);
            const image = concept?.refinements?.[concept.refinements.length - 1];

            return (
              <div key={order.id} className="relative group/item">
                <div className="absolute -left-[3.8rem] md:-left-[6.1rem] top-0 w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-stone-900 border-4 border-white shadow-2xl z-10 flex items-center justify-center group-hover/item:scale-110 transition-transform duration-500">
                   <span className="text-[10px] text-white font-black">{idx + 1}</span>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
                  <div className="aspect-[3/4] rounded-[3rem] overflow-hidden border border-stone-50 shadow-[0_30px_60px_rgba(0,0,0,0.05)] bg-white group-hover/item:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-700">
                    {image ? (
                      <img src={image} className="w-full h-full object-cover grayscale-[0.2] group-hover/item:grayscale-0 group-hover/item:scale-110 transition-all duration-1000" alt="History" />
                    ) : (
                      <div className="h-full flex items-center justify-center text-stone-50 font-serif text-6xl italic">Atelier</div>
                    )}
                  </div>
                  
                  <div className="space-y-10">
                    <div className="space-y-4">
                       <p className="text-[9px] font-black uppercase text-stone-300 tracking-[0.5em]">
                         {new Date(order.createdAt).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}
                       </p>
                       <h3 className="text-5xl font-serif font-bold text-stone-900 tracking-tight leading-none group-hover/item:text-stone-600 transition-colors duration-500">{concept?.title}</h3>
                    </div>
                    
                    <p className="text-stone-400 text-lg md:text-xl leading-relaxed italic border-l-4 border-stone-100 pl-8">
                      "{concept?.description}"
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {concept?.tags.map(tag => (
                        <span key={tag} className="px-5 py-2 bg-stone-50 border border-stone-100 rounded-full text-[9px] font-black uppercase tracking-widest text-stone-400 hover:border-stone-900 hover:text-stone-900 transition-all cursor-default">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-8 flex items-center gap-6 opacity-0 group-hover/item:opacity-100 translate-y-4 group-hover/item:translate-y-0 transition-all duration-700">
                       <div className="h-px w-12 bg-stone-200"></div>
                       <span className="text-[9px] font-black uppercase tracking-widest text-stone-900">Archival Entry Verified</span>
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


import React, { useState, useEffect } from 'react';
import { StyleConcept, InventoryItem, PriceItem } from '../types';

interface PricingModalProps {
  style: StyleConcept;
  inventory: InventoryItem[];
  onConfirm: (breakdown: PriceItem[], totalPrice: number) => void;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ style, inventory, onConfirm, onClose }) => {
  const [items, setItems] = useState<PriceItem[]>([
    { name: 'Standard Couture Labor', category: 'Labor', cost: 750 }
  ]);
  const [showCatalog, setShowCatalog] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCost, setCustomCost] = useState(0);

  // Initial auto-suggest based on text matching
  useEffect(() => {
    const suggested: PriceItem[] = [];
    style.materials.forEach(mat => {
      const found = inventory.find(i => i.name.toLowerCase().includes(mat.toLowerCase()));
      if (found) {
        suggested.push({ 
          name: found.name, 
          category: found.category as any, 
          cost: found.unitCost,
          imageUrl: found.imageUrl 
        });
      }
    });
    if (suggested.length > 0) {
      setItems(prev => [...prev, ...suggested]);
    }
  }, [style, inventory]);

  const addFromInventory = (inv: InventoryItem) => {
    setItems([...items, { 
      name: inv.name, 
      category: inv.category as any, 
      cost: inv.unitCost,
      imageUrl: inv.imageUrl 
    }]);
    setShowCatalog(false);
  };

  const addCustomItem = () => {
    if (customName && customCost > 0) {
      setItems([...items, { name: customName, category: 'Material', cost: customCost }]);
      setCustomName('');
      setCustomCost(0);
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalPrice = items.reduce((acc, curr) => acc + curr.cost, 0);

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/80 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-6xl rounded-[4rem] flex flex-col lg:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 duration-700 max-h-[95vh] lg:max-h-[85vh]">
        {/* Left: Calculation Panel */}
        <div className="flex-1 p-8 md:p-16 space-y-12 overflow-y-auto scrollbar-hide border-b lg:border-b-0 lg:border-r border-stone-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Atelier Quote</span>
              <h3 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 tracking-tight">Order Breakdown</h3>
            </div>
            <button 
              onClick={() => setShowCatalog(true)}
              className="self-start md:self-auto px-8 py-3 border-2 border-stone-900 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all active:scale-95 shadow-lg shadow-stone-100"
            >
              Select from Vault
            </button>
          </div>

          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-stone-50/50 p-6 md:p-8 rounded-[2.5rem] group border border-stone-100/50 hover:bg-white hover:shadow-xl hover:border-stone-200 transition-all duration-500">
                <div className="flex items-center gap-6">
                   {item.imageUrl ? (
                     <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white shadow-sm flex-shrink-0">
                        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                     </div>
                   ) : (
                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-colors duration-500 ${
                       item.category === 'Labor' ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-100 text-stone-400 border border-stone-200'
                     }`}>
                        {item.category[0]}
                     </div>
                   )}
                   <div>
                      <p className="font-bold text-base text-stone-800">{item.name}</p>
                      <p className="text-[9px] font-black uppercase text-stone-300 tracking-[0.3em] mt-1">{item.category}</p>
                   </div>
                </div>
                <div className="flex items-center gap-8">
                   <span className="font-serif font-bold text-2xl text-stone-900">${item.cost.toLocaleString()}</span>
                   <button onClick={() => removeItem(idx)} className="p-3 opacity-0 group-hover:opacity-100 text-stone-200 hover:text-red-500 transition-all active:scale-90">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-10 md:p-12 bg-stone-900 rounded-[3rem] space-y-8 text-white relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-[5rem] group-hover:bg-white/10 transition-all duration-1000"></div>
             <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-500 relative z-10">Custom Line Item</p>
             <div className="flex flex-col md:flex-row gap-4 relative z-10">
                <input 
                  type="text" 
                  placeholder="Material or tool name..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm outline-none focus:border-white/30 transition-all placeholder:text-stone-700 font-medium"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                />
                <div className="relative md:w-48">
                  <input 
                    type="number" 
                    placeholder="Cost"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-5 text-sm outline-none focus:border-white/30 transition-all pr-14 font-serif text-lg"
                    value={customCost || ''}
                    onChange={e => setCustomCost(parseFloat(e.target.value))}
                  />
                  <button 
                    onClick={addCustomItem}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-white text-stone-900 rounded-xl flex items-center justify-center font-black hover:scale-105 active:scale-95 transition-all shadow-xl"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4v16m8-8H4" strokeWidth="3"/></svg>
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Summary Panel */}
        <div className="w-full lg:w-[28rem] bg-stone-50/50 p-8 md:p-16 flex flex-col justify-between overflow-y-auto">
           <div className="space-y-12">
              <div className="bg-white rounded-[3.5rem] p-10 border border-stone-100 shadow-xl shadow-stone-200/50 relative overflow-hidden group">
                 <div className="relative z-10 space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-stone-300">Grand Total</p>
                    <p className="text-7xl font-serif font-bold text-stone-900 tracking-tighter leading-none">${totalPrice.toLocaleString()}</p>
                 </div>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-stone-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-1000"></div>
              </div>
              <div className="space-y-6 px-4">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">Design Selection</p>
                    <p className="text-2xl font-serif font-bold italic text-stone-700 leading-tight">"{style.title}"</p>
                 </div>
                 <div className="flex flex-wrap gap-2 pt-2">
                    {style.tags.slice(0, 3).map(tag => (
                       <span key={tag} className="text-[8px] font-black uppercase tracking-widest text-stone-400 border border-stone-200 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                 </div>
              </div>
           </div>

           <div className="space-y-6 mt-12">
              <button 
                onClick={() => onConfirm(items, totalPrice)}
                className="w-full py-8 bg-stone-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-stone-800 transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4"
              >
                Commence Production
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2"/></svg>
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 text-stone-300 font-black uppercase tracking-widest text-[9px] hover:text-stone-900 transition-all duration-500"
              >
                Abort Configuration
              </button>
           </div>
        </div>
      </div>

      {/* Database Select Modal */}
      {showCatalog && (
        <div className="fixed inset-0 z-[110] bg-stone-900/80 backdrop-blur-xl flex items-center justify-center p-12">
           <div className="bg-white w-full max-w-4xl rounded-[4rem] p-16 space-y-12 animate-in slide-in-from-bottom-8">
              <div className="flex justify-between items-end border-b pb-8">
                 <div>
                    <h4 className="text-3xl font-serif font-bold">Inventory Selection</h4>
                    <p className="text-stone-400 text-sm mt-1">Pull verified materials from your digital vault.</p>
                 </div>
                 <button onClick={() => setShowCatalog(false)} className="text-stone-300 hover:text-stone-900">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[50vh] overflow-y-auto pr-4 scrollbar-hide">
                 {inventory.map(item => (
                   <button 
                    key={item.id} 
                    onClick={() => addFromInventory(item)}
                    className="flex items-center gap-4 bg-stone-50 p-5 rounded-[2.5rem] hover:bg-white hover:shadow-xl hover:scale-105 transition-all border border-stone-100 text-left group"
                   >
                     {item.imageUrl && (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white">
                           <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                     )}
                     <div className="flex-1">
                        <p className="font-bold text-sm text-stone-800">{item.name}</p>
                        <p className="text-[10px] font-black text-stone-400 mt-1">${item.unitCost}</p>
                     </div>
                     <div className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center group-hover:bg-stone-900 group-hover:border-stone-900 group-hover:text-white transition-all">
                        +
                     </div>
                   </button>
                 ))}
                 {inventory.length === 0 && (
                   <div className="col-span-full py-20 text-center opacity-50">
                      <p className="text-stone-400 italic">No materials found in database.</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PricingModal;

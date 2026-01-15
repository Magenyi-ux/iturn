
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
    <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-[4.5rem] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh]">
        {/* Left: Calculation Panel */}
        <div className="flex-1 p-16 space-y-10 overflow-y-auto">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Atelier Quote</span>
              <h3 className="text-4xl font-serif font-bold mt-2">Order Breakdown</h3>
            </div>
            <button 
              onClick={() => setShowCatalog(true)}
              className="px-6 py-2 border-2 border-stone-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all"
            >
              Select from Vault
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-stone-50/50 p-6 rounded-3xl group border border-stone-100 hover:bg-white hover:shadow-lg transition-all">
                <div className="flex items-center gap-5">
                   {item.imageUrl ? (
                     <div className="w-12 h-12 rounded-xl overflow-hidden border border-stone-100 shadow-sm">
                        <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                     </div>
                   ) : (
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-black ${
                       item.category === 'Labor' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'
                     }`}>
                        {item.category[0]}
                     </div>
                   )}
                   <div>
                      <p className="font-bold text-sm text-stone-800">{item.name}</p>
                      <p className="text-[9px] font-black uppercase text-stone-300 tracking-[0.2em]">{item.category}</p>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className="font-serif font-bold text-xl text-stone-900">${item.cost.toLocaleString()}</span>
                   <button onClick={() => removeItem(idx)} className="p-2 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 transition-all">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-10 bg-stone-900 rounded-[3rem] space-y-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[4rem]"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Custom Line Item</p>
             <div className="flex gap-4">
                <input 
                  type="text" 
                  placeholder="Material or tool name..."
                  className="flex-1 bg-stone-800 border border-stone-700 rounded-2xl px-6 py-4 text-sm outline-none focus:border-white transition-all placeholder:text-stone-600"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                />
                <div className="relative w-40">
                  <input 
                    type="number" 
                    placeholder="Cost"
                    className="w-full bg-stone-800 border border-stone-700 rounded-2xl px-6 py-4 text-sm outline-none focus:border-white transition-all pr-12"
                    value={customCost || ''}
                    onChange={e => setCustomCost(parseFloat(e.target.value))}
                  />
                  <button 
                    onClick={addCustomItem}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white text-stone-900 rounded-xl flex items-center justify-center font-black hover:scale-105 transition-all shadow-lg"
                  >
                    +
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Summary Panel */}
        <div className="w-full md:w-96 bg-stone-50 p-16 flex flex-col justify-between border-l border-stone-100">
           <div className="space-y-10">
              <div className="bg-white rounded-[3rem] p-8 border border-stone-100 shadow-sm relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300 mb-2">Grand Total</p>
                    <p className="text-6xl font-serif font-bold text-stone-900 tracking-tight">${totalPrice.toLocaleString()}</p>
                 </div>
                 <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-stone-50 rounded-full opacity-50"></div>
              </div>
              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Design Selection</p>
                 <p className="text-lg font-serif font-bold italic text-stone-600">"{style.title}"</p>
              </div>
           </div>

           <div className="space-y-4">
              <button 
                onClick={() => onConfirm(items, totalPrice)}
                className="w-full py-6 bg-stone-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-stone-800 transition-all shadow-2xl active:scale-95"
              >
                Launch Production
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 text-stone-400 font-black uppercase tracking-widest text-[9px] hover:text-stone-900 transition-all"
              >
                Close Without Saving
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

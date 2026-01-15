
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
    { name: 'Base Construction Labor', category: 'Labor', cost: 500 }
  ]);
  const [customName, setCustomName] = useState('');
  const [customCost, setCustomCost] = useState(0);

  // Auto-suggest materials from style requirements if they exist in inventory
  useEffect(() => {
    const suggested: PriceItem[] = [];
    style.materials.forEach(mat => {
      const found = inventory.find(i => i.name.toLowerCase().includes(mat.toLowerCase()));
      if (found) {
        suggested.push({ name: found.name, category: found.category as any, cost: found.unitCost });
      }
    });
    if (suggested.length > 0) {
      setItems(prev => [...prev, ...suggested]);
    }
  }, [style, inventory]);

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
      <div className="bg-white w-full max-w-4xl rounded-[4rem] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95">
        {/* Left: Calculation Panel */}
        <div className="flex-1 p-12 space-y-8 max-h-[80vh] overflow-y-auto">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Production Estimate</span>
            <h3 className="text-3xl font-serif font-bold mt-2">Bill of Materials</h3>
          </div>

          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-stone-50 p-5 rounded-2xl group border border-stone-100">
                <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                     item.category === 'Labor' ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-500'
                   }`}>
                      {item.category[0]}
                   </div>
                   <div>
                      <p className="font-bold text-sm text-stone-800">{item.name}</p>
                      <p className="text-[9px] font-black uppercase text-stone-300 tracking-widest">{item.category}</p>
                   </div>
                </div>
                <div className="flex items-center gap-6">
                   <span className="font-serif font-bold text-lg">${item.cost.toLocaleString()}</span>
                   <button onClick={() => removeItem(idx)} className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-stone-900 rounded-3xl space-y-6 text-white">
             <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Add Component</p>
             <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Item name..."
                  className="bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-white transition-all"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                />
                <div className="relative">
                  <input 
                    type="number" 
                    placeholder="Price"
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-white transition-all"
                    value={customCost || ''}
                    onChange={e => setCustomCost(parseFloat(e.target.value))}
                  />
                  <button 
                    onClick={addCustomItem}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white text-stone-900 rounded-lg flex items-center justify-center font-black"
                  >
                    +
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Summary Panel */}
        <div className="w-full md:w-80 bg-stone-50 p-12 flex flex-col justify-between border-l border-stone-100">
           <div className="space-y-6">
              <div className="aspect-square rounded-3xl bg-white border border-stone-200 overflow-hidden shadow-sm">
                 <div className="p-6 h-full flex flex-col justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-300">Final Quote</p>
                    <p className="text-5xl font-serif font-bold text-stone-900">${totalPrice.toLocaleString()}</p>
                 </div>
              </div>
              <p className="text-[11px] text-stone-400 italic leading-relaxed">
                Calculated based on current inventory unit costs and standard labor hours for a {style.category} silhouette.
              </p>
           </div>

           <div className="space-y-4">
              <button 
                onClick={() => onConfirm(items, totalPrice)}
                className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 transition-all shadow-xl"
              >
                Confirm & Create Order
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 text-stone-400 font-black uppercase tracking-widest text-[9px] hover:text-stone-900 transition-all"
              >
                Back to Catalog
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;

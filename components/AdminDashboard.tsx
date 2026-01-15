
import React, { useState } from 'react';
import { InventoryItem } from '../types';

interface AdminDashboardProps {
  inventory: InventoryItem[];
  onUpdateInventory: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ inventory, onUpdateInventory, onDeleteItem }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    category: 'Material',
    name: '',
    unitCost: 0,
    stock: 0
  });

  const handleSave = () => {
    if (newItem.name && newItem.category) {
      onUpdateInventory({
        ...newItem,
        id: Math.random().toString(36).substr(2, 9),
      } as InventoryItem);
      setIsAdding(false);
      setNewItem({ category: 'Material', name: '', unitCost: 0, stock: 0 });
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-stone-200 pb-8">
        <div>
          <h2 className="text-4xl font-serif font-bold">Atelier Database</h2>
          <p className="text-stone-500 mt-2">Manage materials, tools, and garment addons.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-8 py-3 bg-stone-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl"
        >
          Add New Item
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-12 space-y-8 animate-in zoom-in-95 shadow-2xl">
            <h3 className="text-2xl font-serif font-bold">New Inventory Entry</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Category</label>
                <select 
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 outline-none font-bold text-sm"
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value as any})}
                >
                  <option value="Material">Material</option>
                  <option value="Tool">Tool</option>
                  <option value="Addon">Addon</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Item Name</label>
                <input 
                  type="text" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 outline-none font-serif text-lg"
                  placeholder="e.g. Italian Silk, Pearl Button..."
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Unit Cost ($)</label>
                  <input 
                    type="number" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 outline-none font-bold"
                    value={newItem.unitCost}
                    onChange={e => setNewItem({...newItem, unitCost: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Initial Stock</label>
                  <input 
                    type="number" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 outline-none font-bold"
                    value={newItem.stock}
                    onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-4 bg-stone-100 text-stone-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-stone-900 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all shadow-lg"
              >
                Save to Database
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {['Material', 'Tool', 'Addon'].map(cat => (
          <div key={cat} className="space-y-6">
            <div className="flex items-center gap-4">
               <h3 className="text-xs font-black uppercase tracking-[0.3em] text-stone-300">{cat}s</h3>
               <div className="h-px flex-1 bg-stone-200"></div>
            </div>
            
            <div className="space-y-4">
              {inventory.filter(i => i.category === cat).map(item => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all group">
                   <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif font-bold text-stone-800">{item.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">
                          Cost: ${item.unitCost} / Unit
                        </p>
                      </div>
                      <button 
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-500 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                   </div>
                   <div className="mt-4 pt-4 border-t border-stone-50 flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase tracking-tighter text-stone-300">Stock: {item.stock} Units</span>
                      <div className="flex gap-2">
                         <div className={`w-2 h-2 rounded-full ${item.stock < 10 ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></div>
                      </div>
                   </div>
                </div>
              ))}
              {inventory.filter(i => i.category === cat).length === 0 && (
                <div className="p-8 border-2 border-dashed border-stone-100 rounded-[2rem] text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-stone-200">No {cat.toLowerCase()}s recorded</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

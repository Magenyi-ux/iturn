
import React, { useState, useRef } from 'react';
import { InventoryItem } from '../types';

interface AdminDashboardProps {
  inventory: InventoryItem[];
  onUpdateInventory: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
  onReset: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ inventory, onUpdateInventory, onDeleteItem, onReset }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    category: 'Material',
    name: '',
    unitCost: 0,
    stock: 0,
    imageUrl: ''
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setNewItem(prev => ({ ...prev, imageUrl: dataUrl }));
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewItem(prev => ({ ...prev, imageUrl: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (newItem.name && newItem.category) {
      onUpdateInventory({
        ...newItem,
        id: Math.random().toString(36).substr(2, 9),
      } as InventoryItem);
      setIsAdding(false);
      setNewItem({ category: 'Material', name: '', unitCost: 0, stock: 0, imageUrl: '' });
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="flex justify-between items-end border-b border-stone-200 pb-8">
        <div>
          <h2 className="text-4xl font-serif font-bold">Atelier Database</h2>
          <p className="text-stone-500 mt-2">Manage materials, tools, and garment addons.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (confirm("Are you sure? This will clear all data and start a new fitting profile.")) {
                onReset();
              }
            }}
            className="px-8 py-3 bg-stone-100 text-stone-400 rounded-full text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all"
          >
            Reset Atelier
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="px-8 py-3 bg-stone-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl"
          >
            Add New Item
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-12 space-y-8 animate-in zoom-in-95 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-serif font-bold">New Inventory Entry</h3>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                {isCapturing ? (
                  <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-black border-2 border-stone-900">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <button 
                      onClick={capturePhoto}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-stone-200 shadow-2xl flex items-center justify-center"
                    >
                      <div className="w-12 h-12 bg-stone-900 rounded-full" />
                    </button>
                    <button 
                      onClick={stopCamera}
                      className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 w-full">
                    <label className="flex-1 relative group cursor-pointer aspect-square">
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      <div className="w-full h-full rounded-3xl border-2 border-dashed border-stone-200 flex items-center justify-center bg-stone-50 overflow-hidden group-hover:border-stone-900 transition-all">
                        {newItem.imageUrl ? (
                          <img src={newItem.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                          <div className="text-center">
                            <svg className="w-6 h-6 mx-auto text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 mt-2 block">Upload File</span>
                          </div>
                        )}
                      </div>
                    </label>
                    <button 
                      onClick={startCamera}
                      className="flex-1 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50 hover:border-stone-900 flex flex-col items-center justify-center transition-all group"
                    >
                       <svg className="w-6 h-6 text-stone-300 group-hover:text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                       </svg>
                       <span className="text-[8px] font-black uppercase tracking-widest text-stone-400 mt-2 group-hover:text-stone-900">Take Photo</span>
                    </button>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Category</label>
                <select 
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 outline-none font-bold text-sm focus:border-stone-900 transition-all"
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
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 outline-none font-serif text-lg focus:border-stone-900 transition-all"
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
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 outline-none font-bold focus:border-stone-900 transition-all"
                    value={newItem.unitCost}
                    onChange={e => setNewItem({...newItem, unitCost: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Initial Stock</label>
                  <input 
                    type="number" 
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-6 py-4 outline-none font-bold focus:border-stone-900 transition-all"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {['Material', 'Tool', 'Addon'].map(cat => (
          <div key={cat} className="space-y-6">
            <div className="flex items-center gap-4">
               <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">{cat}s</h3>
               <div className="h-px flex-1 bg-stone-100"></div>
            </div>
            
            <div className="space-y-4">
              {inventory.filter(i => i.category === cat).map(item => (
                <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                   <div className="flex items-center gap-4">
                      {item.imageUrl && (
                        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-stone-100">
                          <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-stone-800 text-lg truncate">{item.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mt-1">
                          ${item.unitCost} / unit
                        </p>
                      </div>
                      <button 
                        onClick={() => onDeleteItem(item.id)}
                        className="p-2 text-stone-200 hover:text-red-500 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                   </div>
                   <div className="mt-4 pt-4 border-t border-stone-50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.stock < 10 ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></div>
                        <span className="text-[9px] font-black uppercase tracking-tighter text-stone-400">Stock: {item.stock} Units</span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-stone-200">ID: {item.id.toUpperCase()}</span>
                   </div>
                </div>
              ))}
              {inventory.filter(i => i.category === cat).length === 0 && (
                <div className="p-12 border-2 border-dashed border-stone-100 rounded-[3rem] text-center bg-stone-50/50">
                  <p className="text-[9px] font-black uppercase tracking-widest text-stone-300">No {cat.toLowerCase()} inventory</p>
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


import React, { useState } from 'react';
import { Fabric } from '../types';
import { analyzeFabric } from '../services/gemini';

interface MaterialsLibraryProps {
  fabrics: Fabric[];
  onAdd: (fabric: Fabric) => void;
}

const MaterialsLibrary: React.FC<MaterialsLibraryProps> = ({ fabrics, onAdd }) => {
  const [analyzing, setAnalyzing] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        setAnalyzing("new");
        const analysis = await analyzeFabric(url);
        onAdd({
          id: Math.random().toString(36).substr(2, 9),
          name: "Imported Swatch",
          type: "Pending Identification",
          weight: "TBD",
          composition: "TBD",
          imageUrl: url,
          aiAnalysis: analysis
        });
        setAnalyzing(null);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-stone-100 pb-12">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Textile Department</span>
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight">Materials Library</h2>
          <p className="text-stone-400 font-medium text-sm md:text-base leading-relaxed">Digital swatch-book with high-fidelity weave analysis.</p>
        </div>
        <label className="w-full md:w-auto cursor-pointer px-12 py-5 bg-stone-900 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-stone-800 hover:shadow-2xl transition-all active:scale-[0.98] text-center shadow-xl shadow-stone-100">
          Import Swatch
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
        </label>
      </div>

      {analyzing === 'new' && (
        <div className="p-20 bg-white border border-stone-100 rounded-[4rem] flex flex-col items-center justify-center space-y-8 shadow-inner">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-stone-100 border-t-stone-900 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-stone-900 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Synchronizing Fabric DNA...</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {fabrics.map(fabric => (
          <div key={fabric.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:border-stone-200 transition-all duration-700">
            <div className="aspect-[4/5] relative overflow-hidden bg-stone-50">
              <img src={fabric.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={fabric.name} />
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end">
                <p className="text-[9px] text-stone-300 font-medium leading-relaxed italic border-l-2 border-white/20 pl-4 mb-2 uppercase tracking-widest">Spectral Analysis</p>
                <p className="text-xs text-white leading-relaxed line-clamp-4">{fabric.aiAnalysis}</p>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <h3 className="font-serif font-bold text-stone-900 text-xl tracking-tight leading-none">{fabric.name}</h3>
              <div className="flex justify-between items-center pt-2 border-t border-stone-50">
                <span className="text-[9px] text-stone-300 font-black uppercase tracking-[0.2em]">{fabric.type}</span>
                <span className="text-[10px] text-stone-900 font-serif font-bold">{fabric.weight}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialsLibrary;

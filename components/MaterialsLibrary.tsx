
import React, { useState } from 'react';
import { Fabric } from '../types';
import { analyzeFabric } from '../services/gemini';

interface MaterialsLibraryProps {
  fabrics: Fabric[];
  onAdd: (fabric: Fabric) => void;
  onRemove: (id: string) => void;
}

const MaterialsLibrary: React.FC<MaterialsLibraryProps> = ({ fabrics, onAdd, onRemove }) => {
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
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-end border-b border-stone-100 pb-8">
        <div>
          <h2 className="text-4xl font-serif font-bold">Materials Library</h2>
          <p className="text-stone-500 mt-2">Digital swatch-book with AI weave analysis.</p>
        </div>
        <label className="cursor-pointer px-8 py-3 bg-stone-900 text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all">
          Import Swatch
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
        </label>
      </div>

      {analyzing === 'new' && (
        <div className="p-12 bg-white border border-stone-100 rounded-3xl flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-stone-100 border-t-stone-900 rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">AI Analyzing Weave Dynamics...</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {fabrics.map(fabric => (
          <div key={fabric.id} className="group bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-all">
            <div className="aspect-square relative overflow-hidden">
              <img src={fabric.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={fabric.name} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <p className="text-[10px] text-white/80 leading-relaxed italic">{fabric.aiAnalysis}</p>
              </div>
            </div>
            <div className="p-6 space-y-2 relative">
              <h3 className="font-serif font-bold text-stone-900">{fabric.name}</h3>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{fabric.type}</span>
                <span className="text-[10px] text-stone-900 font-bold">{fabric.weight}</span>
              </div>
              <button
                onClick={() => onRemove(fabric.id)}
                className="absolute top-6 right-6 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialsLibrary;

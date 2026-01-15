
import React, { useState, useEffect } from 'react';
import { StyleConcept, Measurements } from '../types';
import { generatePattern } from '../services/gemini';

interface BlueprintRoomProps {
  style: StyleConcept;
  measurements: Measurements;
}

const BlueprintRoom: React.FC<BlueprintRoomProps> = ({ style, measurements }) => {
  const [pattern, setPattern] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPattern = async () => {
      setLoading(true);
      try {
        const res = await generatePattern(style, measurements);
        setPattern(res);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    loadPattern();
  }, [style, measurements]);

  return (
    <div className="min-h-full flex flex-col lg:flex-row gap-12 bg-stone-50 rounded-[4rem] p-12 animate-in zoom-in-95 duration-500">
      <div className="lg:w-1/3 space-y-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Blueprint Room</span>
          <h2 className="text-4xl font-serif font-bold mt-2">{style.title}</h2>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-stone-100 shadow-sm space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-stone-900 border-b pb-2">Technical Specs</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(measurements).map(([k, v]) => (
              <div key={k}>
                <p className="text-[9px] font-black uppercase text-stone-300">{k}</p>
                <p className="text-sm font-serif font-bold text-stone-900">{v || '—'}cm</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-100 p-8 rounded-3xl border border-stone-200 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-stone-500">Specified Materials</h3>
          <div className="flex flex-wrap gap-2">
            {style.materials.map((material, idx) => (
              <span 
                key={idx} 
                className="px-4 py-1.5 bg-white border border-stone-200 rounded-full text-[10px] font-bold text-stone-800 uppercase tracking-tight shadow-sm"
              >
                {material}
              </span>
            ))}
          </div>
        </div>

        <button className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 transition-all shadow-xl">
          Export Pattern (PDF)
        </button>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] border border-stone-100 shadow-inner p-12 overflow-y-auto max-h-[70vh]">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-stone-100 border-t-stone-900 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Drafting technical guide...</p>
          </div>
        ) : (
          <div className="prose prose-stone max-w-none">
            <div className="whitespace-pre-wrap font-mono text-[11px] leading-loose text-stone-600">
              {pattern}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlueprintRoom;

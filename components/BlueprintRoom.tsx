
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
    <div className="min-h-[80vh] flex flex-col lg:flex-row gap-16 bg-white rounded-[4rem] p-8 md:p-16 animate-in slide-in-from-bottom-8 duration-1000 shadow-[0_40px_100px_rgba(0,0,0,0.02)] border border-stone-50">
      <div className="lg:w-[28rem] space-y-12">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Technical Department</span>
          <h2 className="text-5xl font-serif font-bold text-stone-900 tracking-tight leading-none">{style.title}</h2>
        </div>

        <div className="bg-stone-50/50 p-10 rounded-[3rem] border border-stone-100/50 space-y-8">
          <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-400 border-b border-stone-200 pb-4">Biometric Specifications</h3>
          <div className="grid grid-cols-2 gap-x-10 gap-y-8">
            {Object.entries(measurements).map(([k, v]) => (
              <div key={k} className="space-y-1">
                <p className="text-[8px] font-black uppercase text-stone-300 tracking-widest">{k}</p>
                <p className="text-lg font-serif font-bold text-stone-900">{v || '—'}<span className="text-[10px] ml-1 text-stone-300 uppercase">cm</span></p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-stone-900 p-10 rounded-[3rem] space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-1000"></div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-500 relative z-10">Specified Textiles</h3>
          <div className="flex flex-wrap gap-3 relative z-10">
            {style.materials.map((material, idx) => (
              <span 
                key={idx} 
                className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-stone-300 uppercase tracking-widest hover:border-white/30 transition-all"
              >
                {material}
              </span>
            ))}
          </div>
        </div>

        <button className="w-full py-8 bg-stone-900 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-stone-800 transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4">
          Export Pattern (PDF)
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2.5"/></svg>
        </button>
      </div>

      <div className="flex-1 bg-stone-50/50 rounded-[4rem] border border-stone-100 shadow-inner p-10 md:p-16 overflow-y-auto max-h-[85vh] scrollbar-hide relative group/viewer">
        <div className="absolute top-8 right-8 flex items-center gap-4 opacity-0 group-hover/viewer:opacity-100 transition-opacity duration-500">
           <span className="text-[9px] font-black uppercase tracking-widest text-stone-300">Technical Document v1.0</span>
           <div className="w-2 h-2 rounded-full bg-stone-200"></div>
        </div>
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

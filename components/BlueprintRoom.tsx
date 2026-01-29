
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
    <div className="min-h-full flex flex-col lg:flex-row gap-12 bg-[var(--color-background)] rounded-[3rem] lg:rounded-[4rem] p-6 lg:p-12 animate-luxury-fade">
      <div className="lg:w-1/3 space-y-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-secondary)]">Imperial Blueprint Room</span>
          <h2 className="text-4xl lg:text-5xl font-serif font-bold mt-3 text-[var(--color-primary)] leading-tight">{style.title}</h2>
        </div>

        <div className="bg-[var(--color-surface)] p-8 rounded-[2.5rem] border border-[var(--color-primary)]/5 shadow-2xl space-y-8">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--color-primary)] border-b border-[var(--color-primary)]/5 pb-4">Anatomic Specifications</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            {Object.entries(measurements).map(([k, v]) => (
              <div key={k} className="space-y-1">
                <p className="text-[9px] font-black uppercase text-[var(--color-text-secondary)]">{k}</p>
                <p className="text-lg font-serif font-bold text-[var(--color-primary)]">{v || '—'}cm</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-primary)]/[0.02] p-8 rounded-[2.5rem] border border-[var(--color-primary)]/5 space-y-6">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Curated Textiles</h3>
          <div className="flex flex-wrap gap-3">
            {style.materials.map((material, idx) => (
              <span 
                key={idx} 
                className="px-5 py-2 bg-white border border-[var(--color-primary)]/5 rounded-xl text-[10px] font-black text-[var(--color-primary)] uppercase tracking-widest shadow-sm hover:scale-105 transition-transform"
              >
                {material}
              </span>
            ))}
          </div>
        </div>

        <button className="w-full py-6 bg-[var(--color-primary)] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[var(--color-accent)] transition-all shadow-2xl flex items-center justify-center gap-4">
          Export Pattern (PDF)
        </button>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] border border-[var(--color-primary)]/5 shadow-inner p-8 lg:p-16 overflow-y-auto max-h-[80vh] scrollbar-hide">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30">
            <div className="w-16 h-16 border-4 border-[var(--color-primary)]/10 border-t-[var(--color-secondary)] rounded-full animate-spin"></div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--color-primary)]">Synthesizing Technical Guide...</p>
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

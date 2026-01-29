
import React, { useState } from 'react';
import { SavedInspiration } from '../types';

interface SavedStudioProps {
  inspirations: SavedInspiration[];
  onAction?: (inspiration: SavedInspiration) => void;
}

const SavedStudio: React.FC<SavedStudioProps> = ({ inspirations, onAction }) => {
  const [maximizedImage, setMaximizedImage] = useState<string | null>(null);

  if (inspirations.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="w-32 h-32 rounded-[2.5rem] bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-200 shadow-inner">
           <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
           </svg>
        </div>
        <div className="text-center space-y-4 max-w-sm">
          <h3 className="text-4xl font-serif font-bold text-stone-900 tracking-tight">Vault Depleted</h3>
          <p className="text-stone-400 font-medium text-sm leading-relaxed">
            Curate your digital library by archiving insights from the Inspiration Hub.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Lightbox */}
      {maximizedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-2xl flex items-center justify-center p-8 cursor-zoom-out animate-in fade-in duration-300"
          onClick={() => setMaximizedImage(null)}
        >
          <img 
            src={maximizedImage} 
            className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded animate-in zoom-in-95 duration-500" 
            alt="Saved View" 
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-stone-100 pb-12">
        <div className="space-y-3">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Legacy Data</span>
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-stone-900 tracking-tight">The Atelier Archive</h2>
          <p className="text-stone-400 font-serif italic text-lg md:text-2xl leading-relaxed">"Your digital library of aesthetic brilliance."</p>
        </div>
        <div className="bg-white px-8 py-5 rounded-[2rem] border border-stone-100 shadow-sm flex items-center gap-6 self-start md:self-auto group hover:border-stone-200 transition-all">
           <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 mb-1">Manifest</p>
              <p className="text-2xl font-serif font-bold text-stone-900 tracking-tight">{inspirations.length} Entries</p>
           </div>
           <div className="w-10 h-10 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-300 group-hover:bg-stone-900 group-hover:text-white transition-all duration-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeWidth="2"/></svg>
           </div>
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {inspirations.map((item) => (
          <div 
            key={item.id} 
            className="break-inside-avoid relative group"
          >
            {item.type === 'image' ? (
              <div className="bg-white p-2 pb-12 rounded shadow-xl border border-stone-100 hover:shadow-2xl hover:-translate-y-1 transition-all cursor-zoom-in">
                 <img 
                  src={item.content} 
                  className="w-full h-auto rounded grayscale-[0.2] group-hover:grayscale-0 transition-all" 
                  alt={item.title} 
                  onClick={() => setMaximizedImage(item.content)}
                 />
                 <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">{item.title}</span>
                    <span className="text-[8px] font-medium text-stone-200">{new Date(item.timestamp).toLocaleDateString()}</span>
                 </div>
              </div>
            ) : (
              <div className="bg-stone-900 text-stone-50 p-10 rounded-[3rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all space-y-6 border border-white/5">
                 <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
                 <p className="text-2xl font-serif italic leading-relaxed text-stone-200">"{item.content}"</p>
                 <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-500">{item.title}</span>
                    <button 
                      onClick={() => onAction?.(item)}
                      className="text-[9px] font-black uppercase tracking-widest text-white border-b border-white hover:border-transparent transition-all"
                    >
                       Design From Brief
                    </button>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedStudio;

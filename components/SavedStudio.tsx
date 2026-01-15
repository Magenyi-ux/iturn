
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
      <div className="h-[70vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center text-stone-300">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
           </svg>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-3xl font-serif font-bold text-stone-900">Archive Empty</h3>
          <p className="text-stone-400 italic font-serif">"Save your research in the Inspiration Hub to build your atelier's visual legacy."</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32 animate-in fade-in duration-700">
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

      <div className="flex justify-between items-end border-b border-stone-100 pb-8">
        <div className="space-y-2">
          <h2 className="text-5xl font-serif font-bold text-stone-900">The Atelier Archive</h2>
          <p className="text-stone-400 font-serif italic text-lg">"Your digital library of aesthetic brilliance."</p>
        </div>
        <div className="text-right">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Total Entries</span>
           <p className="text-2xl font-serif font-bold">{inspirations.length}</p>
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

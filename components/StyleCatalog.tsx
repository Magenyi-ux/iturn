
import React, { useState, useEffect } from 'react';
import { StyleConcept, Measurements, PhysicalCharacteristics, ViewAngle, DisplayMode } from '../types';
import { generateStyleImage, generateDesignDNA, CoutureError } from '../services/gemini';

interface StyleCatalogProps {
  concepts: StyleConcept[];
  measurements: Measurements;
  characteristics: PhysicalCharacteristics;
  photos: Record<string, string>;
  onEdit: (style: StyleConcept, image: string) => void;
  onCreateOrder: (style: StyleConcept) => void;
}

const StyleCatalog: React.FC<StyleCatalogProps> = ({ concepts, measurements, characteristics, photos, onEdit, onCreateOrder }) => {
  const [visuals, setVisuals] = useState<Record<string, Record<string, Record<string, string>>>>({});
  const [loading, setLoading] = useState<Record<string, string | null>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [designDNAs, setDesignDNAs] = useState<Record<string, string>>({});
  const [displayMode, setDisplayMode] = useState<DisplayMode>('mannequin'); 
  const [filter, setFilter] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState<Record<string, number>>({});
  const [selectedRefinementIndex, setSelectedRefinementIndex] = useState<Record<string, number>>({});
  const [quickViewStyle, setQuickViewStyle] = useState<StyleConcept | null>(null);

  useEffect(() => {
    const newIndices = { ...selectedRefinementIndex };
    let changed = false;
    concepts.forEach(c => {
      if (c.refinements && c.refinements.length > 0) {
        const lastIdx = c.refinements.length - 1;
        if (newIndices[c.id] === undefined || newIndices[c.id] < lastIdx) {
          newIndices[c.id] = lastIdx;
          changed = true;
        }
      }
    });
    if (changed) setSelectedRefinementIndex(newIndices);
  }, [concepts]);

  const angleSequence: ViewAngle[] = ['front', 'quarter', 'side', 'back'];

  const handleGenerate360 = async (concept: StyleConcept) => {
    if (loading[concept.id]) return;
    setErrors(prev => ({ ...prev, [concept.id]: null }));
    
    const mode = displayMode;
    const total = angleSequence.length;
    let frontViewImage: string | undefined;
    let secretDesignDNA: string | undefined;

    try {
      for (let i = 0; i < total; i++) {
        const angle = angleSequence[i];
        setLoading(prev => ({ ...prev, [concept.id]: `Crafting ${angle} view...` }));
        
        const url = await generateStyleImage(
          concept, 
          measurements, 
          characteristics, 
          angle, 
          mode, 
          photos.front,
          frontViewImage,
          secretDesignDNA
        );

        if (url) {
          if (angle === 'front') {
            frontViewImage = url;
            setLoading(prev => ({ ...prev, [concept.id]: `Encoding Design DNA...` }));
            secretDesignDNA = await generateDesignDNA(url, concept);
            setDesignDNAs(prev => ({ ...prev, [concept.id]: secretDesignDNA! }));
          }

          setVisuals(prev => ({
            ...prev,
            [concept.id]: {
              ...(prev[concept.id] || {}),
              [mode]: {
                ...(prev[concept.id]?.[mode] || {}),
                [angle]: url
              }
            }
          }));
        }
        
        if (i < total - 1) {
          await new Promise(r => setTimeout(r, 1500));
        }
      }
    } catch (e) {
      console.error("Failed to generate collection visuals", e);
      if (e instanceof CoutureError) {
        setErrors(prev => ({ ...prev, [concept.id]: e.message }));
      } else {
        setErrors(prev => ({ ...prev, [concept.id]: "The workshop encountered an unexpected rendering error." }));
      }
    } finally {
      setLoading(prev => ({ ...prev, [concept.id]: null }));
    }
  };

  const categories = ['All', ...Array.from(new Set(concepts.map(c => c.category)))];
  const filtered = filter === 'All' ? concepts : concepts.filter(c => c.category === filter);

  return (
    <div className="space-y-12 pb-24">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-stone-100 pb-12">
        <div className="text-left space-y-2">
          <h2 className="text-4xl font-serif font-bold text-stone-900">Design Collection</h2>
          <p className="text-stone-500">Couture concepts synchronized with technical Design DNA for perspective accuracy.</p>
        </div>
        
        <div className="flex bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <button 
            onClick={() => setDisplayMode('mannequin')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${displayMode === 'mannequin' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}
          >
            Digital Dress Form
          </button>
          <button 
            onClick={() => setDisplayMode('avatar')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all ${displayMode === 'avatar' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}
          >
            Runway Avatar
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === cat ? 'bg-stone-900 text-stone-50 shadow-md' : 'bg-white border border-stone-200 text-stone-400 hover:border-stone-900'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {filtered.map(style => {
          const modeVisuals = visuals[style.id]?.[displayMode] || {};
          const currentProgress = scrollProgress[style.id] || 0;
          const angleIndex = Math.min(Math.floor(currentProgress * angleSequence.length), angleSequence.length - 1);
          const currentAngle = angleSequence[angleIndex];
          
          const refinementIndex = selectedRefinementIndex[style.id];
          const hasRefinements = style.refinements && style.refinements.length > 0;
          const currentRefinedImage = hasRefinements && refinementIndex !== undefined ? style.refinements[refinementIndex] : null;
          
          const currentImage = currentRefinedImage || modeVisuals[currentAngle];
          const hasAnyInMode = Object.keys(modeVisuals).length > 0;
          const isLoading = !!loading[style.id];
          const hasDNA = !!designDNAs[style.id];
          const styleError = errors[style.id];

          return (
            <div key={style.id} className="bg-white rounded-3xl overflow-hidden border border-stone-100 shadow-sm flex flex-col md:flex-row h-full hover:shadow-xl transition-all">
              <div className="md:w-1/2 aspect-[3/4] bg-stone-50 relative group select-none">
                {currentImage ? (
                  <div className="w-full h-full relative overflow-hidden">
                    <img src={currentImage} className="w-full h-full object-cover transition-opacity duration-300" alt={style.title} />
                    
                    {!currentRefinedImage && (
                      <div 
                        className="absolute inset-0 cursor-ew-resize flex items-center justify-center"
                        onMouseMove={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = (e.clientX - rect.left) / rect.width;
                          setScrollProgress(prev => ({ ...prev, [style.id]: Math.max(0, Math.min(0.99, x)) }));
                        }}
                      >
                        <div className="flex flex-col gap-4 items-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-[10px] text-white font-bold uppercase tracking-[0.2em] border border-white/20">
                            Rotate Design
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setQuickViewStyle(style); }}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 bg-white text-stone-900 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-stone-900 hover:text-white"
                          >
                            Quick View
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                       <button 
                         onClick={() => onEdit(style, currentImage)}
                         className="bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-stone-100 shadow hover:bg-stone-900 hover:text-white transition-all"
                         title="Sketch & Refine this version"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                         </svg>
                       </button>

                       {currentRefinedImage && (
                         <button 
                           onClick={() => setSelectedRefinementIndex(prev => {
                             const n = { ...prev };
                             delete n[style.id];
                             return n;
                           })}
                           className="bg-white/90 backdrop-blur-md p-2.5 rounded-xl border border-stone-100 shadow hover:bg-stone-900 hover:text-white transition-all"
                           title="Back to 360 View"
                         >
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                         </button>
                       )}
                    </div>

                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                       {hasDNA && !isLoading && (
                         <div className="bg-green-500/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                           <span className="text-[8px] font-black text-white uppercase tracking-widest">DNA Synchronized</span>
                         </div>
                       )}
                    </div>

                    {isLoading && (
                      <div className="absolute inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center">
                         <div className="bg-white/90 px-4 py-2 rounded-full shadow-xl">
                            <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">{loading[style.id]}</span>
                         </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-stone-100 overflow-hidden">
                    <div className="relative z-10 space-y-6">
                      {styleError ? (
                        <div className="space-y-4 animate-in zoom-in-95">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                          </div>
                          <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest px-4 leading-relaxed">{styleError}</p>
                          <button 
                            onClick={() => handleGenerate360(style)}
                            className="text-[9px] font-black uppercase tracking-[0.2em] border-b border-stone-900 pb-0.5 hover:text-stone-500 hover:border-stone-500 transition-all"
                          >
                            Try Recalibrating
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center mx-auto text-stone-400">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                             </svg>
                          </div>
                          <button 
                            onClick={() => handleGenerate360(style)}
                            disabled={isLoading}
                            className="w-full py-4 bg-stone-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-stone-800 transition-all disabled:opacity-50"
                          >
                            {isLoading ? 'Calibrating...' : 'Visualize 360°'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 p-8 flex flex-col space-y-6">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em]">{style.category}</span>
                    <button 
                      onClick={() => setExpandedId(expandedId === style.id ? null : style.id)}
                      className="text-[10px] font-bold text-stone-900 uppercase tracking-widest border-b border-stone-900"
                    >
                      {expandedId === style.id ? 'Hide Details' : 'View Construction'}
                    </button>
                  </div>
                  <h3 className="text-2xl font-serif font-bold mt-2 text-stone-800">{style.title}</h3>
                </div>

                <div className="space-y-4">
                  <p className="text-stone-500 text-sm leading-relaxed italic border-l-2 border-stone-200 pl-4">
                    "{style.description}"
                  </p>
                </div>

                {expandedId === style.id ? (
                  <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 overflow-y-auto max-h-60 pr-2">
                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Atelier Instructions</p>
                      <ul className="space-y-3">
                        {style.steps.map((s, i) => (
                          <li key={i} className="flex gap-4 text-xs text-stone-600 leading-relaxed items-start">
                            <span className="w-5 h-5 flex-shrink-0 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold text-[8px]">{i+1}</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-end">
                    <div className="w-full p-4 bg-stone-50/50 rounded-2xl border border-stone-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                        <svg className={`w-4 h-4 ${styleError ? 'text-red-400' : 'text-stone-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758L5 19m0-14l3.121 3.121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                      <p className={`text-[9px] font-bold uppercase tracking-widest italic ${styleError ? 'text-red-400' : 'text-stone-400'}`}>
                        {styleError ? 'Studio interference detected' : hasDNA ? 'Architectural blueprints secured' : 'Awaiting visual calibration'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-stone-50 flex items-center justify-between">
                   <div className="flex gap-2">
                      <div className={`w-2 h-2 rounded-full ${hasDNA ? 'bg-green-500' : 'bg-stone-300'}`}></div>
                      <div className={`w-2 h-2 rounded-full ${styleError ? 'bg-red-400' : 'bg-stone-100'} border border-stone-200`}></div>
                   </div>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => onCreateOrder(style)}
                       className="px-6 py-2 bg-stone-100 text-stone-900 border border-stone-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all shadow-sm"
                     >
                       Send to Workroom
                     </button>
                     <button 
                       onClick={() => handleGenerate360(style)}
                       className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${hasAnyInMode ? 'bg-stone-50 text-stone-300' : 'bg-stone-900 text-white hover:scale-105 shadow-lg'}`}
                     >
                       {hasAnyInMode ? 'Recalibrate' : 'Calibrate'}
                     </button>
                   </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick View Modal */}
      {quickViewStyle && (
        <div className="fixed inset-0 z-[120] bg-stone-900/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-6xl rounded-[4rem] overflow-hidden flex flex-col md:flex-row shadow-[0_80px_160px_rgba(0,0,0,0.5)] border border-white/20 animate-in zoom-in-95 duration-500 max-h-[90vh]">
              {/* Image Preview Side */}
              <div className="flex-1 bg-stone-50 relative p-12 flex flex-col items-center justify-center gap-8 border-r border-stone-100 overflow-y-auto">
                 <div className="w-full aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl relative">
                   <img 
                    src={visuals[quickViewStyle.id]?.[displayMode]?.[angleSequence[0]] || quickViewStyle.refinements?.[quickViewStyle.refinements.length - 1] || 'https://via.placeholder.com/600x800?text=Atelier+AI'} 
                    className="w-full h-full object-cover" 
                    alt="Main Preview" 
                   />
                 </div>
                 
                 <div className="flex gap-4">
                    {angleSequence.map(angle => {
                      const img = visuals[quickViewStyle.id]?.[displayMode]?.[angle];
                      if (!img) return null;
                      return (
                        <div key={angle} className="w-24 h-32 rounded-2xl overflow-hidden border border-stone-200 shadow-lg group cursor-pointer hover:scale-105 transition-all">
                           <img src={img} className="w-full h-full object-cover" alt={angle} />
                           <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      );
                    })}
                 </div>
              </div>

              {/* Detail Content Side */}
              <div className="w-full md:w-[450px] p-16 flex flex-col justify-between space-y-12">
                 <div className="space-y-10">
                    <div className="flex justify-between items-start">
                       <div className="space-y-2">
                          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-300">Architectural Preview</p>
                          <h3 className="text-4xl font-serif font-bold text-stone-900">{quickViewStyle.title}</h3>
                          <span className="inline-block px-4 py-1.5 bg-stone-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest mt-2">{quickViewStyle.category}</span>
                       </div>
                       <button 
                        onClick={() => setQuickViewStyle(null)}
                        className="p-4 bg-stone-50 text-stone-400 hover:text-stone-900 rounded-full transition-all"
                       >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg>
                       </button>
                    </div>

                    <div className="space-y-6">
                       <p className="text-xl font-serif text-stone-600 leading-relaxed italic border-l-4 border-stone-100 pl-6">
                          "{quickViewStyle.description}"
                       </p>
                       
                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Construction Elements</p>
                          <div className="flex flex-wrap gap-2">
                             {quickViewStyle.tags.map(tag => (
                               <span key={tag} className="px-3 py-1 bg-stone-50 border border-stone-100 rounded-lg text-[9px] font-bold text-stone-500 uppercase tracking-widest">#{tag}</span>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4 pt-12 border-t border-stone-50">
                    <button 
                      onClick={() => { onCreateOrder(quickViewStyle); setQuickViewStyle(null); }}
                      className="w-full py-6 bg-stone-900 text-white rounded-[2.5rem] text-[10px] font-black uppercase tracking-widest shadow-2xl hover:bg-stone-800 transition-all transform active:scale-95"
                    >
                       Initiate Production Build
                    </button>
                    <button 
                      onClick={() => setQuickViewStyle(null)}
                      className="w-full py-4 text-stone-400 text-[10px] font-black uppercase tracking-widest hover:text-stone-900 transition-all"
                    >
                       Dismiss Quick View
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StyleCatalog;


import React, { useState } from 'react';
import { searchInspiration, generateMoodImages } from '../services/gemini';
import { SavedInspiration } from '../types';

interface InspirationHubProps {
  onGenerate?: (brief: string) => void;
  onSaveInspiration?: (inspiration: SavedInspiration) => void;
}

const InspirationHub: React.FC<InspirationHubProps> = ({ onGenerate, onSaveInspiration }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [visualLoading, setVisualLoading] = useState(false);
  const [results, setResults] = useState<{ text: string, links: { title: string, uri: string }[] } | null>(null);
  const [moodImages, setMoodImages] = useState<string[]>([]);
  const [maximizedImage, setMaximizedImage] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setMoodImages([]);
    setResults(null);
    setSavedStatus({});
    
    try {
      const searchRes = await searchInspiration(query);
      setResults(searchRes);
      setLoading(false);

      setVisualLoading(true);
      const images = await generateMoodImages(searchRes.text);
      setMoodImages(images);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
    setVisualLoading(false);
  };

  const trending = ["Surrealist Pattern-Cutting", "Nomadic Tailoring", "Cyber-Edwardian", "Liquid Silk Textures"];

  const getScatterStyles = (index: number) => {
    const rotations = ['rotate-1', 'rotate-[-2deg]', 'rotate-3', 'rotate-[-1deg]', 'rotate-2'];
    const offsets = ['translate-y-4', 'translate-y-[-2rem]', 'translate-y-8', 'translate-y-[-1rem]'];
    return `${rotations[index % rotations.length]} ${offsets[index % offsets.length]}`;
  };

  const handleSaveItem = (type: 'image' | 'text', content: string, id: string) => {
    if (!onSaveInspiration) return;
    
    const inspiration: SavedInspiration = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      title: type === 'text' ? `Synthesis: ${query}` : `Mood Image for ${query}`,
      timestamp: new Date().toISOString()
    };
    
    onSaveInspiration(inspiration);
    setSavedStatus(prev => ({ ...prev, [id]: true }));
    
    // Reset visual feedback after a delay
    setTimeout(() => {
      setSavedStatus(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleGenerateCollection = () => {
    if (!results || !onGenerate) return;
    const brief = `Inspired by visual research on "${query}". Recommendations: Silk-Wool blends, architectural lapels, and the following aesthetic: ${results.text}`;
    onGenerate(brief);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Lightbox Modal */}
      {maximizedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-2xl flex items-center justify-center p-6 cursor-zoom-out animate-in fade-in duration-500"
          onClick={() => setMaximizedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-full flex items-center justify-center">
            <img 
              src={maximizedImage} 
              className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-3xl animate-in zoom-in-95 duration-500"
              alt="Maximized view"
            />
            <button 
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors bg-black/20 backdrop-blur-md p-3 rounded-full"
              onClick={() => setMaximizedImage(null)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="text-center space-y-4">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Couture Discovery</span>
        <h2 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter text-stone-900">Inspiration Hub</h2>
        <p className="text-stone-400 font-serif italic text-lg md:text-2xl">"Gleaning the world's aesthetic for the next masterpiece."</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="relative group bg-white rounded-[3rem] p-4 shadow-[0_30px_60px_rgba(0,0,0,0.03)] border border-stone-50 transition-all hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)]">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full h-20 md:h-32 bg-transparent outline-none text-2xl md:text-5xl font-serif text-center transition-all placeholder:text-stone-100 px-12"
            placeholder="Seek silhouettes..."
          />
          <button 
            onClick={handleSearch}
            disabled={loading}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 bg-stone-900 text-white rounded-[2rem] shadow-2xl shadow-stone-200 hover:bg-stone-800 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center overflow-hidden"
          >
            {loading ? (
              <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {trending.map(t => (
            <button 
              key={t}
              onClick={() => { setQuery(t); handleSearch(); }}
              className="px-5 py-2 rounded-full border border-stone-100 bg-white text-[9px] font-black uppercase tracking-widest text-stone-400 hover:border-stone-900 hover:text-stone-900 transition-all shadow-sm"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {results && (
        <div className="space-y-24">
          <div className="relative py-12">
             <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                <span className="text-[20rem] font-serif font-bold italic">Mood</span>
             </div>

             <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 relative z-10 p-4">
                {moodImages.length === 0 && visualLoading && (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 border-4 border-stone-100 border-t-stone-900 rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300">Rendering visual intelligence...</p>
                  </div>
                )}

                {moodImages.map((img, i) => (
                  <div 
                    key={i} 
                    className={`break-inside-avoid relative group transition-all duration-700 ${getScatterStyles(i)}`}
                  >
                    <div className="relative bg-white p-2 pb-12 rounded shadow-2xl border border-stone-100 hover:z-50 hover:scale-105 transition-all">
                       <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-800/20 backdrop-blur rounded-full border border-white/40 z-20 flex items-center justify-center shadow-lg transform -translate-y-4">
                          <div className="w-1.5 h-1.5 bg-red-800 rounded-full"></div>
                       </div>
                       
                       <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleSaveItem('image', img, `img-${i}`)}
                           className={`p-3 rounded-full shadow-lg border transition-all ${savedStatus[`img-${i}`] ? 'bg-amber-500 border-amber-600 text-white' : 'bg-white/90 border-stone-100 text-stone-900 hover:bg-stone-900 hover:text-white'}`}
                           title="Save to Atelier"
                         >
                           <svg className="w-4 h-4" fill={savedStatus[`img-${i}`] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                           </svg>
                         </button>
                       </div>

                       <img 
                         src={img} 
                         onClick={() => setMaximizedImage(img)}
                         className="w-full h-auto grayscale-[0.2] group-hover:grayscale-0 transition-all rounded-sm cursor-zoom-in" 
                         alt="Mood" 
                       />
                       
                       <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                          <span className="text-[8px] font-black uppercase tracking-tighter text-stone-400">Concept #{i+1}</span>
                          <span className="text-[8px] font-serif italic text-stone-300">{savedStatus[`img-${i}`] ? 'Stored in Vault' : 'AI Synthesis'}</span>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 items-start px-4 lg:px-0">
             <div className="lg:col-span-2 space-y-8 bg-white p-10 md:p-16 rounded-[4rem] border border-stone-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-stone-50 rounded-bl-[4rem] flex items-center justify-center transition-colors group-hover:bg-stone-100">
                   <button 
                    onClick={() => handleSaveItem('text', results.text, 'synthesis')}
                    className={`p-8 rounded-bl-[4rem] transition-all ${savedStatus['synthesis'] ? 'bg-emerald-500 text-white shadow-xl' : 'text-stone-200 hover:text-stone-900'}`}
                    title="Bookmark Synthesis"
                   >
                     <svg className="w-8 h-8" fill={savedStatus['synthesis'] ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                     </svg>
                   </button>
                </div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 border-b border-stone-100 pb-6 flex justify-between items-center">
                  Aesthetic Synthesis
                  {savedStatus['synthesis'] && <span className="text-emerald-500 font-black tracking-widest uppercase text-[8px] flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Stored in Vault</span>}
                </h3>
                <p className="text-3xl md:text-4xl font-serif text-stone-900 leading-[1.4] italic pr-12 md:pr-24 tracking-tight">
                   "{results.text}"
                </p>
             </div>

             <div className="space-y-12">
                <div className="space-y-6">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900 flex items-center gap-4">
                      Primary Sources
                      <div className="h-px flex-1 bg-stone-100"></div>
                   </h3>
                   <div className="space-y-3">
                     {results.links.map((link, i) => (
                       <a 
                         key={i} 
                         href={link.uri} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="group block p-5 hover:bg-white rounded-3xl transition-all border border-transparent hover:border-stone-100 hover:shadow-lg"
                       >
                         <div className="flex justify-between items-center mb-1">
                           <span className="font-serif font-bold text-lg text-stone-700 group-hover:text-stone-900 transition-colors">{link.title}</span>
                           <svg className="w-4 h-4 text-stone-200 group-hover:text-stone-900 transition-all transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                           </svg>
                         </div>
                         <p className="text-[9px] text-stone-300 font-medium truncate">{link.uri}</p>
                       </a>
                     ))}
                   </div>
                </div>

                <div className="bg-stone-900 text-stone-50 p-10 rounded-[3rem] shadow-2xl space-y-6">
                   <p className="text-xs font-serif leading-relaxed text-stone-400">
                      Based on this visual research, the AI recommends exploring **Silk-Wool blends** and **Architectural Lapels**.
                   </p>
                   <button 
                    onClick={handleGenerateCollection} 
                    className="w-full py-4 bg-white text-stone-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-100 transition-all shadow-xl active:scale-95 transform"
                   >
                      Generate Collection
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspirationHub;

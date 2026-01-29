
import React, { useState } from 'react';
import { Fabric } from '../types';
import { analyzeFabric } from '../services/gemini';

interface MaterialsLibraryProps {
  fabrics: Fabric[];
  onAdd: (fabric: Fabric) => void;
}

const MaterialsLibrary: React.FC<MaterialsLibraryProps> = ({ fabrics, onAdd }) => {
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [selectedFabric, setSelectedFabric] = useState<Fabric | null>(null);
  const [scanMessage, setScanMessage] = useState('Initializing Weave Scan...');

  const scanMessages = [
    'Mapping Thread Density...',
    'Analyzing Drape Coefficiency...',
    'Scanning Luster & Specularity...',
    'Calculating Tensile Behavior...',
    'Synthesizing Aesthetic Profile...'
  ];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const url = event.target?.result as string;
        setAnalyzing("new");
        
        // Cycle through scan messages for aesthetic feedback
        let msgIdx = 0;
        const msgInterval = setInterval(() => {
          setScanMessage(scanMessages[msgIdx % scanMessages.length]);
          msgIdx++;
        }, 1200);

        try {
          const analysis = await analyzeFabric(url);
          onAdd({
            id: Math.random().toString(36).substr(2, 9),
            name: "Digital Swatch " + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            type: "Direct Import",
            weight: "Calculated",
            composition: "Mixed Fiber",
            imageUrl: url,
            aiAnalysis: analysis
          });
        } catch (e) {
          console.error(e);
        } finally {
          clearInterval(msgInterval);
          setAnalyzing(null);
          setScanMessage('Initializing Weave Scan...');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-16 pb-32 animate-in fade-in duration-700">
      {/* Technical Synthesis Report Modal */}
      {selectedFabric && (
        <div className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-2xl flex items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="bg-white w-full max-w-5xl rounded-[4rem] overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20">
             <div className="md:w-1/2 bg-stone-100 relative group">
                <img src={selectedFabric.imageUrl} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000" alt="Detail Swatch" />
                <div className="absolute inset-0 bg-stone-900/10 pointer-events-none"></div>
             </div>
             <div className="flex-1 p-16 space-y-10 flex flex-col justify-between max-h-[90vh] overflow-y-auto">
                <div className="space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Technical Report</span>
                        <h3 className="text-4xl font-serif font-bold text-stone-900">{selectedFabric.name}</h3>
                      </div>
                      <button onClick={() => setSelectedFabric(null)} className="p-4 hover:bg-stone-50 rounded-full transition-all text-stone-300 hover:text-stone-900">
                         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2"/></svg>
                      </button>
                   </div>
                   
                   <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-8 border-y border-stone-100 py-8">
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Fiber Composition</p>
                            <p className="font-serif font-bold text-lg mt-1 text-stone-800">{selectedFabric.composition}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-stone-400">Weight Profile</p>
                            <p className="font-serif font-bold text-lg mt-1 text-stone-800">{selectedFabric.weight}</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-lg">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                           </div>
                           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-900">AI Deep Analysis Synthesis</p>
                        </div>
                        <p className="text-xl font-serif text-stone-600 leading-relaxed italic">
                           "{selectedFabric.aiAnalysis}"
                        </p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setSelectedFabric(null)}
                  className="w-full py-6 bg-stone-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-stone-800 shadow-2xl transition-all"
                >
                   Close Technical Archive
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end border-b border-stone-100 pb-10">
        <div>
          <h2 className="text-6xl font-serif font-bold tracking-tight">Materials Archive</h2>
          <p className="text-stone-400 mt-3 font-medium text-lg italic">"A digital vault of weaves, analyzed for bespoke precision."</p>
        </div>
        <label className="group cursor-pointer relative">
          <div className="absolute inset-0 bg-stone-900 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative px-12 py-5 bg-stone-900 text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:bg-stone-800 transition-all shadow-2xl flex items-center gap-4">
             Import New Swatch
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth="2"/></svg>
          </div>
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
        </label>
      </div>

      {analyzing === 'new' && (
        <div className="p-20 bg-white border border-stone-100 rounded-[4rem] flex flex-col items-center justify-center space-y-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.05)] animate-in zoom-in-95">
          <div className="relative">
             <div className="w-24 h-24 border-2 border-stone-100 border-t-stone-900 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-stone-900 rounded-full animate-ping"></div>
             </div>
          </div>
          <div className="text-center space-y-3">
            <p className="text-xs font-black uppercase tracking-[0.5em] text-stone-900">{scanMessage}</p>
            <p className="text-[10px] text-stone-400 font-medium max-w-xs mx-auto leading-relaxed">Gemini Vision is currently evaluating surface specularity and fiber integrity.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {fabrics.map(fabric => (
          <div 
            key={fabric.id} 
            className="group bg-white rounded-[4rem] overflow-hidden border border-stone-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col relative"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-stone-50">
              <img src={fabric.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] grayscale-[0.2] group-hover:grayscale-0" alt={fabric.name} />
              
              {/* Technical Overlay HUD */}
              <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-between p-10 backdrop-blur-[2px]">
                 <div className="flex justify-between items-start">
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                       <span className="text-[8px] text-white font-black uppercase tracking-widest">Spectral Data Verified</span>
                    </div>
                 </div>
                 <button 
                  onClick={() => setSelectedFabric(fabric)}
                  className="w-full py-4 bg-white text-stone-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                 >
                    Full Technical Review
                 </button>
              </div>

              <div className="absolute top-6 right-6">
                 <div className="bg-stone-900 px-4 py-2 rounded-full text-white text-[9px] font-black uppercase tracking-widest shadow-2xl border border-white/10">
                    S-{fabric.id.substr(0, 4).toUpperCase()}
                 </div>
              </div>
            </div>
            
            <div className="p-10 flex flex-col flex-1 space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif font-bold text-stone-900 text-3xl">{fabric.name}</h3>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-stone-900"></div>)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em]">{fabric.type}</span>
                  <div className="h-px w-8 bg-stone-100"></div>
                  <span className="text-[9px] font-serif italic text-stone-300">Verified Swatch</span>
                </div>
              </div>
              
              {fabric.aiAnalysis && (
                <div className="flex-1 bg-stone-50/70 rounded-[2.5rem] p-8 border border-stone-100 group-hover:bg-white group-hover:border-stone-200 transition-all duration-500 relative overflow-hidden">
                  {/* Decorative AI Logo */}
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-stone-900/[0.02] rounded-full pointer-events-none"></div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 bg-stone-900 text-white rounded-lg flex items-center justify-center shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/></svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900">Atelier AI Insights</span>
                  </div>
                  <p className="text-[12px] text-stone-500 leading-relaxed font-serif italic line-clamp-4 group-hover:text-stone-700 transition-colors">
                    "{fabric.aiAnalysis}"
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                 <div className="flex gap-10">
                    <div className="space-y-1">
                       <span className="block text-[8px] font-black text-stone-300 uppercase tracking-widest">GSM Profile</span>
                       <span className="font-serif font-bold text-stone-700 text-sm">Light-Mid</span>
                    </div>
                    <div className="space-y-1">
                       <span className="block text-[8px] font-black text-stone-300 uppercase tracking-widest">Drape Index</span>
                       <span className="font-serif font-bold text-stone-700 text-sm">High</span>
                    </div>
                 </div>
                 <button 
                  onClick={() => setSelectedFabric(fabric)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 border-b-2 border-stone-900 pb-1 hover:text-stone-400 hover:border-stone-400 transition-all"
                 >
                    Full Specs
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {fabrics.length === 0 && !analyzing && (
        <div className="h-[50vh] border-2 border-dashed border-stone-100 rounded-[5rem] flex flex-col items-center justify-center text-center p-20 space-y-6 group">
           <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-stone-100 group-hover:bg-stone-900 group-hover:text-white transition-all duration-1000 shadow-inner">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 4h16" strokeWidth="1"/></svg>
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-serif font-bold text-stone-900">Archive Currently Empty</h3>
              <p className="text-stone-300 italic font-serif max-w-sm mx-auto leading-relaxed">
                "Import swatches of silks, wools, and linens to initiate visual synthesis and weave intelligence."
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsLibrary;

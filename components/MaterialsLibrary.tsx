
import React, { useState } from 'react';
import { Fabric } from '../types';
import { analyzeFabric } from '../services/gemini';
import { Upload, X, ShieldCheck, Microscope, Layers, ChevronRight, SwatchBook } from 'lucide-react';

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
        <div className="fixed inset-0 z-[100] bg-[var(--color-primary)]/95 backdrop-blur-2xl flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-500">
          <div className="bg-[var(--color-surface)] w-full max-w-5xl rounded-[3rem] lg:rounded-[4rem] overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/20">
             <div className="md:w-1/2 h-64 md:h-auto bg-[var(--color-background)] relative group">
                <img src={selectedFabric.imageUrl} className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-110" alt="Detail Swatch" />
                <div className="absolute inset-0 bg-[var(--color-primary)]/10 pointer-events-none"></div>
             </div>
             <div className="flex-1 p-8 lg:p-16 space-y-10 flex flex-col justify-between max-h-[80vh] md:max-h-[90vh] overflow-y-auto">
                <div className="space-y-8">
                   <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[var(--color-secondary)]">Imperial Dossier</span>
                        <h3 className="text-4xl font-serif font-bold text-[var(--color-primary)]">{selectedFabric.name}</h3>
                      </div>
                      <button onClick={() => setSelectedFabric(null)} className="p-3 hover:bg-[var(--color-background)] rounded-full transition-all text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]">
                         <X className="w-6 h-6" />
                      </button>
                   </div>
                   
                   <div className="space-y-10">
                      <div className="grid grid-cols-2 gap-8 border-y border-[var(--color-primary)]/5 py-8">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Fiber Integrity</p>
                            <p className="font-serif font-bold text-lg text-[var(--color-primary)]">{selectedFabric.composition}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--color-text-secondary)]">Weight Index</p>
                            <p className="font-serif font-bold text-lg text-[var(--color-primary)]">{selectedFabric.weight}</p>
                         </div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-xl">
                              <Microscope className="w-5 h-5 text-[var(--color-secondary)]" />
                           </div>
                           <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--color-primary)]">Optical Synthesis Report</p>
                        </div>
                        <p className="text-xl font-serif text-[var(--color-text-secondary)] leading-relaxed italic border-l-4 border-[var(--color-secondary)] pl-8">
                           "{selectedFabric.aiAnalysis}"
                        </p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setSelectedFabric(null)}
                  className="w-full py-6 bg-[var(--color-primary)] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[var(--color-accent)] shadow-2xl transition-all"
                >
                   Close Imperial Archive
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-[var(--color-primary)]/5 pb-10 gap-8">
        <div>
          <h2 className="text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[var(--color-primary)]">Materials Vault</h2>
          <p className="text-[var(--color-text-secondary)] mt-4 font-serif italic text-lg lg:text-xl">"A royal collection of weaves, mapped for digital excellence."</p>
        </div>
        <label className="group cursor-pointer relative w-full lg:w-auto">
          <div className="absolute inset-0 bg-[var(--color-secondary)] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative px-10 py-5 bg-[var(--color-primary)] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[var(--color-accent)] transition-all shadow-2xl flex items-center justify-center gap-4">
             <Upload className="w-4 h-4 text-[var(--color-secondary)]" />
             Import New Weave
          </div>
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
        </label>
      </div>

      {analyzing === 'new' && (
        <div className="p-10 lg:p-20 bg-[var(--color-surface)] border border-[var(--color-primary)]/5 rounded-[3rem] lg:rounded-[4rem] flex flex-col items-center justify-center space-y-10 shadow-2xl animate-in zoom-in-95">
          <div className="relative">
             <div className="w-24 h-24 border-4 border-[var(--color-primary)]/5 border-t-[var(--color-secondary)] rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-[var(--color-primary)] animate-pulse" />
             </div>
          </div>
          <div className="text-center space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-[var(--color-primary)]">{scanMessage}</p>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-black uppercase tracking-widest max-w-xs mx-auto leading-relaxed">Gemini Vision is synthesizing fiber integrity & luster.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-12">
        {fabrics.map(fabric => (
          <div 
            key={fabric.id} 
            className="group bg-[var(--color-surface)] rounded-[3rem] lg:rounded-[4rem] overflow-hidden border border-[var(--color-primary)]/5 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col relative"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-[var(--color-background)]">
              <img src={fabric.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt={fabric.name} />
              
              {/* Technical Overlay HUD */}
              <div className="absolute inset-0 bg-[var(--color-primary)]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-between p-10 backdrop-blur-[4px]">
                 <div className="flex justify-between items-start">
                    <div className="bg-white/10 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/20 flex items-center gap-2">
                       <ShieldCheck className="w-3 h-3 text-[var(--color-secondary)]" />
                       <span className="text-[9px] text-white font-black uppercase tracking-widest">Spectral Integrity Verified</span>
                    </div>
                 </div>
                 <button 
                  onClick={() => setSelectedFabric(fabric)}
                  className="w-full py-5 bg-white text-[var(--color-primary)] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)]"
                 >
                    Full Technical Review
                 </button>
              </div>

              <div className="absolute top-8 right-8">
                 <div className="bg-[var(--color-primary)]/90 backdrop-blur-xl px-5 py-2.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-2xl border border-white/10">
                    S-{fabric.id.substr(0, 4).toUpperCase()}
                 </div>
              </div>
            </div>
            
            <div className="p-10 flex flex-col flex-1 space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-serif font-bold text-[var(--color-primary)] text-3xl leading-tight">{fabric.name}</h3>
                  <div className="flex gap-1.5 mt-3">
                    {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)]"></div>)}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-[var(--color-text-secondary)] font-black uppercase tracking-[0.2em]">{fabric.type}</span>
                  <div className="h-px w-8 bg-[var(--color-primary)]/10"></div>
                  <span className="text-[10px] font-serif italic text-[var(--color-secondary)] font-bold">Royal Selection</span>
                </div>
              </div>
              
              {fabric.aiAnalysis && (
                <div className="flex-1 bg-[var(--color-background)] rounded-[2.5rem] p-8 border border-[var(--color-primary)]/5 group-hover:bg-white group-hover:border-[var(--color-secondary)]/20 transition-all duration-500 relative overflow-hidden group/insight">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center shadow-lg transform -rotate-12 group-hover/insight:rotate-0 transition-transform">
                      <Microscope className="w-4 h-4 text-[var(--color-secondary)]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)]">Atelier Insights</span>
                  </div>
                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed font-serif italic line-clamp-4 group-hover/insight:text-[var(--color-primary)] transition-colors">
                    "{fabric.aiAnalysis}"
                  </p>
                </div>
              )}

              <div className="pt-8 border-t border-[var(--color-primary)]/5 flex justify-between items-center">
                 <div className="flex gap-10">
                    <div className="space-y-1.5">
                       <span className="block text-[9px] font-black text-[var(--color-text-secondary)] uppercase tracking-widest">Drape Index</span>
                       <div className="flex items-center gap-2">
                          <Layers className="w-3 h-3 text-[var(--color-secondary)]" />
                          <span className="font-serif font-bold text-[var(--color-primary)] text-sm">Superior</span>
                       </div>
                    </div>
                 </div>
                 <button 
                  onClick={() => setSelectedFabric(fabric)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-primary)] group/link"
                 >
                    Full Specs
                    <ChevronRight className="w-4 h-4 text-[var(--color-secondary)] group-hover/link:translate-x-1 transition-transform" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {fabrics.length === 0 && !analyzing && (
        <div className="h-[60vh] border-2 border-dashed border-[var(--color-primary)]/10 rounded-[4rem] lg:rounded-[5rem] flex flex-col items-center justify-center text-center p-10 lg:p-20 space-y-8 group">
           <div className="w-24 h-24 bg-[var(--color-background)] rounded-full flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-1000 shadow-inner">
              <SwatchBook className="w-10 h-10" />
           </div>
           <div className="space-y-4">
              <h3 className="text-3xl font-serif font-bold text-[var(--color-primary)] tracking-tight">Archive Currently Empty</h3>
              <p className="text-[var(--color-text-secondary)] italic font-serif text-lg lg:text-xl max-w-sm mx-auto leading-relaxed">
                "Import swatches of silks, wools, and linens to initiate imperial visual synthesis."
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsLibrary;

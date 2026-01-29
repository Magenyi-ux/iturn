
import React, { useState } from 'react';

interface PhotoUploadProps {
  onPhotosComplete: (photos: Record<string, string>) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosComplete }) => {
  const [photos, setPhotos] = useState<Record<string, string>>({});

  const slots = [
    { id: 'front', label: 'Front Silhouette', desc: 'Full height, standing straight' },
    { id: 'side', label: 'Side Profile', desc: 'Arms slightly away from torso' },
    { id: 'back', label: 'Dorsal View', desc: 'Heels together, shoulders relaxed' },
  ] as const;

  const handleFileImport = (slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPhotos(prev => ({ ...prev, [slotId]: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const isComplete = Object.keys(photos).length === 3;

  return (
    <div className="max-w-6xl mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      <div className="text-center space-y-6">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Biometric Intake</span>
        <h2 className="text-6xl md:text-8xl font-serif font-bold tracking-tighter text-stone-900 leading-none">Anatomic Capture</h2>
        <p className="text-stone-400 font-serif italic text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed">
          "High-resolution silhouettes are required for precise neural measurement synthesis."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {slots.map((slot) => (
          <div key={slot.id} className="space-y-6">
            <label className="block group cursor-pointer">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileImport(slot.id, e)} 
              />
              <div className={`relative aspect-[3/4.5] rounded-[4rem] border-2 border-dashed transition-all duration-700 overflow-hidden flex flex-col items-center justify-center p-10 text-center ${
                photos[slot.id] 
                  ? 'border-stone-900 bg-stone-50 shadow-[0_20px_50px_rgba(0,0,0,0.02)]'
                  : 'border-stone-100 bg-white hover:border-stone-900 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] hover:-translate-y-2'
              }`}>
                {photos[slot.id] ? (
                  <>
                    <img 
                      src={photos[slot.id]} 
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-90 group-hover:opacity-100" 
                      alt={slot.label} 
                    />
                    <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] px-8 py-3 border border-white/20 rounded-full bg-stone-900/20">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="w-20 h-20 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center mx-auto group-hover:bg-stone-900 group-hover:text-white transition-all duration-500">
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <div>
                      <span className="block font-serif font-bold text-stone-900 text-2xl">{slot.label}</span>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] mt-3">{slot.desc}</p>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center pt-12 space-y-10">
        <div className="flex items-center gap-6 text-stone-200">
          <div className={`h-px w-32 bg-current transition-colors duration-1000 ${isComplete ? 'text-emerald-500' : ''}`} />
          <span className={`text-[9px] font-black uppercase tracking-[0.6em] transition-colors duration-1000 flex items-center gap-3 ${isComplete ? 'text-emerald-500' : ''}`}>
            {isComplete && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
            {isComplete ? 'Set Verified' : 'Awaiting Data'}
          </span>
          <div className={`h-px w-32 bg-current transition-colors duration-1000 ${isComplete ? 'text-emerald-500' : ''}`} />
        </div>

        <button 
          onClick={() => isComplete && onPhotosComplete(photos)}
          disabled={!isComplete}
          className={`group px-20 py-8 rounded-[2.5rem] font-serif font-bold text-3xl transition-all duration-700 shadow-2xl flex items-center gap-8 active:scale-[0.98] ${
            isComplete 
              ? 'bg-stone-900 text-white hover:bg-stone-800 hover:shadow-stone-200'
              : 'bg-stone-50 text-stone-200 cursor-not-allowed border border-stone-100'
          }`}
        >
          Initialize Analysis
          <svg className={`w-8 h-8 transform transition-transform duration-500 ${isComplete ? 'group-hover:translate-x-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PhotoUpload;

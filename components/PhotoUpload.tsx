
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
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-1000">
      <div className="text-center space-y-4">
        <h2 className="text-6xl font-serif font-bold tracking-tight text-stone-900">Anatomic Capture</h2>
        <p className="text-stone-400 font-serif italic text-xl max-w-2xl mx-auto">
          "Import high-resolution captures of the client for precise measurement synthesis and drape analysis."
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {slots.map((slot) => (
          <div key={slot.id} className="space-y-6">
            <label className="block group cursor-pointer">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => handleFileImport(slot.id, e)} 
              />
              <div className={`relative aspect-[3/4] rounded-[3rem] border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center p-8 text-center ${
                photos[slot.id] 
                  ? 'border-stone-900 bg-stone-50 shadow-inner' 
                  : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-2xl hover:-translate-y-2'
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

      <div className="flex flex-col items-center pt-8 space-y-8">
        <div className="flex items-center gap-4 text-stone-300">
          <div className={`h-px w-24 bg-current transition-colors ${isComplete ? 'text-stone-900' : ''}`} />
          <span className={`text-[10px] font-black uppercase tracking-[0.5em] transition-colors ${isComplete ? 'text-stone-900' : ''}`}>
            {isComplete ? 'Profile Ready' : 'Awaiting Full Set'}
          </span>
          <div className={`h-px w-24 bg-current transition-colors ${isComplete ? 'text-stone-900' : ''}`} />
        </div>

        <button 
          onClick={() => isComplete && onPhotosComplete(photos)}
          disabled={!isComplete}
          className={`group px-24 py-7 rounded-full font-serif font-bold text-2xl transition-all shadow-2xl flex items-center gap-6 active:scale-95 ${
            isComplete 
              ? 'bg-stone-900 text-stone-50 hover:bg-stone-800' 
              : 'bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200'
          }`}
        >
          Proceed to Measurement
          <svg className={`w-6 h-6 transform transition-transform ${isComplete ? 'group-hover:translate-x-2' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PhotoUpload;

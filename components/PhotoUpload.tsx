
import React, { useState, useRef } from 'react';

interface PhotoUploadProps {
  onPhotosComplete: (photos: Record<string, string>) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosComplete }) => {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const slots = [
    { id: 'front', label: 'Front Silhouette', desc: 'Full height, standing straight' },
    { id: 'side', label: 'Side Profile', desc: 'Arms slightly away from torso' },
    { id: 'back', label: 'Dorsal View', desc: 'Heels together, shoulders relaxed' },
  ] as const;

  const startCamera = async (slotId: string) => {
    setActiveCamera(slotId);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setActiveCamera(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && activeCamera) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotos(prev => ({ ...prev, [activeCamera]: dataUrl }));
      }
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setActiveCamera(null);
  };

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
            <div className={`relative aspect-[3/4] rounded-[3rem] border-2 border-dashed transition-all duration-500 overflow-hidden flex flex-col items-center justify-center p-8 text-center group ${
              photos[slot.id]
                ? 'border-stone-900 bg-stone-50 shadow-inner'
                : 'border-stone-200 bg-white hover:border-stone-400 hover:shadow-2xl hover:-translate-y-2'
            }`}>
              {activeCamera === slot.id ? (
                <div className="absolute inset-0 bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                    <button
                      onClick={capturePhoto}
                      className="w-16 h-16 bg-white rounded-full border-4 border-stone-900 shadow-xl"
                    />
                    <button
                      onClick={stopCamera}
                      className="px-6 py-2 bg-stone-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : photos[slot.id] ? (
                <>
                  <img
                    src={photos[slot.id]}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 opacity-90 group-hover:opacity-100"
                    alt={slot.label}
                  />
                  <div className="absolute inset-0 bg-stone-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm gap-4">
                    <button
                      onClick={() => startCamera(slot.id)}
                      className="text-white text-[10px] font-black uppercase tracking-[0.3em] px-8 py-3 border border-white/20 rounded-full bg-stone-900/20 hover:bg-stone-900 transition-all"
                    >
                      Retake with Camera
                    </button>
                    <label className="cursor-pointer text-white text-[10px] font-black uppercase tracking-[0.3em] px-8 py-3 border border-white/20 rounded-full bg-stone-900/20 hover:bg-stone-900 transition-all">
                      Upload Different
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileImport(slot.id, e)} />
                    </label>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => startCamera(slot.id)}
                      className="w-16 h-16 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all duration-500 shadow-sm"
                      title="Take Photo"
                    >
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <label className="w-16 h-16 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center cursor-pointer hover:bg-stone-900 hover:text-white transition-all duration-500 shadow-sm" title="Upload File">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileImport(slot.id, e)} />
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </label>
                  </div>
                  <div>
                    <span className="block font-serif font-bold text-stone-900 text-2xl">{slot.label}</span>
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.2em] mt-3">{slot.desc}</p>
                  </div>
                </div>
              )}
            </div>
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

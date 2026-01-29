
import React, { useState, useRef, useEffect } from 'react';

interface PhotoUploadProps {
  onPhotosComplete: (photos: Record<string, string>) => void;
  onManualEntry: () => void;
}

type CaptureStep = 'front' | 'side' | 'back';

interface CameraError {
  type: 'permission' | 'not_found' | 'in_use' | 'overconstrained' | 'secure_context' | 'generic';
  message: string;
  action?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosComplete, onManualEntry }) => {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [activeStep, setActiveStep] = useState<CaptureStep>('front');
  const [error, setError] = useState<CameraError | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const steps: { id: CaptureStep; label: string; desc: string }[] = [
    { id: 'front', label: 'Frontal Silhouette', desc: 'Stand straight, arms slightly away from torso' },
    { id: 'side', label: 'Side Profile', desc: 'Arms slightly forward, chin parallel to floor' },
    { id: 'back', label: 'Dorsal View', desc: 'Shoulders relaxed, weight distributed evenly' },
  ];

  const startCamera = async () => {
    setError(null);
    try {
      // 1. Check for Secure Context (Required for camera access in most browsers)
      if (!window.isSecureContext) {
        throw { name: 'SecurityError', message: 'INSECURE_CONTEXT' };
      }

      // 2. Check for API support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw { name: 'NotSupportedError' };
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', 
          width: { ideal: 1920, min: 640 }, 
          height: { ideal: 1080, min: 480 } 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err: any) {
      console.error("Atelier Camera Diagnostic:", err);
      
      let errorState: CameraError = { 
        type: 'generic', 
        message: "Studio interface error. Hardware synchronization failed.",
        action: "Try refreshing the atelier window."
      };

      const name = err.name || "";
      
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError' && err.message !== 'INSECURE_CONTEXT') {
        errorState = { 
          type: 'permission', 
          message: "Access blocked by user or system policy. The atelier cannot proceed without visual input.",
          action: "Grant camera permissions in your browser's address bar or privacy settings."
        };
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        errorState = { 
          type: 'not_found', 
          message: "No optical hardware detected. The Anatomic Capture suite requires a camera connection.",
          action: "Check your device connections or use Direct Entry Mode." 
        };
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        errorState = { 
          type: 'in_use', 
          message: "Camera hardware is currently prioritized by another application.",
          action: "Close other apps using the camera (e.g., Zoom, Teams) and retry." 
        };
      } else if (name === 'OverconstrainedError') {
        errorState = {
          type: 'overconstrained',
          message: "Requested capture fidelity exceeds hardware capabilities.",
          action: "The atelier will attempt to recalibrate for lower resolution on retry."
        };
      } else if (err.message === 'INSECURE_CONTEXT') {
        errorState = {
          type: 'secure_context',
          message: "Encryption protocol violation. Camera access is restricted to secure (HTTPS) environments.",
          action: "Ensure you are accessing the atelier over a secure connection."
        };
      } else if (name === 'NotSupportedError') {
        errorState = {
          type: 'generic',
          message: "Imaging protocols not supported by this browser architecture.",
          action: "Switch to a modern browser like Chrome, Safari, or Firefox."
        };
      }

      setError(errorState);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
        
        const newPhotos = { ...photos, [activeStep]: dataUrl };
        setPhotos(newPhotos);
        
        const currentIdx = steps.findIndex(s => s.id === activeStep);
        if (currentIdx < steps.length - 1) {
          setActiveStep(steps[currentIdx + 1].id);
        } else {
          stopCamera();
        }
      }
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>, stepId: CaptureStep) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos(prev => ({ ...prev, [stepId]: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isComplete = Object.keys(photos).length === 3;

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end">
        <div className="text-left space-y-4">
          <h2 className="text-6xl font-serif font-bold tracking-tight text-stone-900">Anatomic Capture</h2>
          <p className="text-stone-400 font-serif italic text-xl">
            "Capturing the human form with geometric precision."
          </p>
        </div>
        {!isCameraActive && (
          <button 
            onClick={onManualEntry}
            className="px-8 py-3 bg-stone-100 text-stone-900 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all border border-stone-200"
          >
            Direct Entry Mode
          </button>
        )}
      </div>

      {error && !isCameraActive && (
        <div className="p-10 bg-red-50 border border-red-100 rounded-[3rem] space-y-8 animate-in slide-in-from-top-4">
          <div className="flex items-start gap-8">
            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 flex-shrink-0 shadow-sm">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-red-900">Optical Diagnostic Failure: {error.type.replace('_', ' ')}</h4>
              <p className="text-red-700 font-serif italic text-2xl leading-snug">{error.message}</p>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{error.action}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 pl-28">
            <button 
              onClick={startCamera}
              className="px-10 py-4 bg-red-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl active:scale-95"
            >
              Retry Connection
            </button>
            <button 
              onClick={onManualEntry}
              className="px-10 py-4 bg-white text-red-600 border border-red-200 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-50 transition-all shadow-sm active:scale-95"
            >
              Switch to Direct Entry
            </button>
          </div>
        </div>
      )}

      {!isCameraActive ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const photo = photos[step.id];
            return (
              <div key={step.id} className="group relative">
                <div className={`aspect-[3/4] rounded-[3.5rem] border-2 transition-all duration-700 overflow-hidden flex flex-col items-center justify-center bg-white ${
                  photo ? 'border-stone-900 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] scale-[1.02]' : 'border-dashed border-stone-200'
                }`}>
                  {photo ? (
                    <>
                      <img src={photo} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700" alt={step.label} />
                      <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                        <label className="cursor-pointer bg-white text-stone-900 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-110 transition-transform">
                          Retake Frame
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileImport(e, step.id)} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <button 
                      onClick={() => { setActiveStep(step.id); startCamera(); }}
                      className="space-y-6 flex flex-col items-center group-hover:scale-105 transition-all duration-500"
                    >
                      <div className="w-24 h-24 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center group-hover:bg-stone-900 group-hover:text-white transition-all shadow-inner">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <span className="block font-serif font-bold text-stone-900 text-2xl">{step.label}</span>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-[0.3em] mt-3">{step.desc}</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="fixed inset-0 z-[100] bg-stone-950 flex flex-col animate-in fade-in duration-500">
          <div className="p-10 flex justify-between items-center text-white bg-gradient-to-b from-stone-950 to-transparent relative z-10">
             <div className="space-y-2">
                <p className="text-[11px] font-black uppercase tracking-[0.5em] text-stone-500">Studio Viewfinder</p>
                <h3 className="text-4xl font-serif font-bold">{steps.find(s => s.id === activeStep)?.label}</h3>
             </div>
             <button onClick={stopCamera} className="p-6 hover:bg-white/10 rounded-full transition-all text-white/50 hover:text-white">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" strokeWidth="1.5" /></svg>
             </button>
          </div>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
             <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover opacity-80" />
             <canvas ref={canvasRef} className="hidden" />

             {/* Dynamic Anatomic Overlays */}
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-full max-w-lg aspect-[1/2] relative border border-white/10 rounded-full flex items-center justify-center opacity-40">
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/20"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20"></div>
                    
                    {/* Ghost Outlines */}
                    <svg className="w-full h-full text-white/30" viewBox="0 0 100 200" fill="none" stroke="currentColor" strokeWidth="0.3">
                        {activeStep === 'front' && (
                            <>
                                <circle cx="50" cy="20" r="10" />
                                <path d="M30 40 Q50 35 70 40 L70 80 Q50 90 30 80 Z" />
                                <path d="M40 80 L35 180 M60 80 L65 180" />
                                <circle cx="30" cy="40" r="1.5" fill="currentColor" />
                                <circle cx="70" cy="40" r="1.5" fill="currentColor" />
                            </>
                        )}
                        {activeStep === 'side' && (
                            <>
                                <path d="M50 10 Q60 10 60 25 Q60 40 50 40 Q40 40 40 25 Q40 10 50 10 Z" />
                                <path d="M50 40 Q70 45 65 90 Q60 130 55 180" />
                                <path d="M40 40 Q35 90 45 180" />
                            </>
                        )}
                        {activeStep === 'back' && (
                            <>
                                <circle cx="50" cy="20" r="10" />
                                <path d="M30 40 L70 40 L65 180 L35 180 Z" />
                                <path d="M50 40 V180" strokeDasharray="2 2" />
                            </>
                        )}
                    </svg>
                </div>
             </div>

             {/* Technical HUD Layer */}
             <div className="absolute inset-0 border-[60px] border-black/40 pointer-events-none">
                <div className="absolute top-10 left-10 flex gap-4">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">Spectral Scan Ready</span>
                </div>
             </div>
          </div>

          <div className="p-16 bg-gradient-to-t from-stone-950 to-transparent flex flex-col items-center gap-12 relative z-10">
             <p className="text-white/40 text-sm font-serif italic max-w-sm text-center">{steps.find(s => s.id === activeStep)?.desc}</p>
             <div className="flex items-center gap-20">
                <button 
                  onClick={() => {
                    const idx = steps.findIndex(s => s.id === activeStep);
                    if (idx > 0) setActiveStep(steps[idx - 1].id);
                  }}
                  className="p-6 text-white/30 hover:text-white transition-all disabled:opacity-5"
                  disabled={steps.findIndex(s => s.id === activeStep) === 0}
                >
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="1.5" /></svg>
                </button>

                <div className="relative group">
                  <div className="absolute inset-0 bg-white blur-3xl opacity-10 group-active:opacity-30 transition-opacity"></div>
                  <button 
                    onClick={handleCapture}
                    className="relative w-32 h-32 rounded-full border-4 border-white flex items-center justify-center group active:scale-90 transition-all shadow-[0_0_100px_rgba(255,255,255,0.1)]"
                  >
                    <div className="w-24 h-24 bg-white rounded-full group-hover:scale-95 transition-transform shadow-2xl"></div>
                  </button>
                </div>

                <button 
                  onClick={() => {
                    const idx = steps.findIndex(s => s.id === activeStep);
                    if (idx < steps.length - 1) setActiveStep(steps[idx + 1].id);
                  }}
                  className="p-6 text-white/30 hover:text-white transition-all disabled:opacity-5"
                  disabled={steps.findIndex(s => s.id === activeStep) === steps.length - 1}
                >
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth="1.5" /></svg>
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center pt-16 space-y-10">
        <div className="flex items-center gap-6 text-stone-200">
          <div className={`h-px w-32 bg-current transition-all duration-1000 ${isComplete ? 'text-stone-900' : ''}`} />
          <span className={`text-[11px] font-black uppercase tracking-[0.6em] transition-all duration-1000 ${isComplete ? 'text-stone-900' : ''}`}>
            {isComplete ? 'Archive Verified' : `Frame ${Object.keys(photos).length + (isComplete ? 0 : 1)} / 3`}
          </span>
          <div className={`h-px w-32 bg-current transition-all duration-1000 ${isComplete ? 'text-stone-900' : ''}`} />
        </div>

        <button 
          onClick={() => isComplete && onPhotosComplete(photos)}
          disabled={!isComplete}
          className={`group px-32 py-8 rounded-full font-serif font-bold text-3xl transition-all shadow-2xl flex items-center gap-8 active:scale-95 ${
            isComplete 
              ? 'bg-stone-900 text-stone-50 hover:bg-stone-800 hover:shadow-[0_30px_90px_-20px_rgba(0,0,0,0.4)]' 
              : 'bg-stone-100 text-stone-300 cursor-not-allowed border border-stone-200 opacity-60'
          }`}
        >
          Predict Measurements
          <svg className={`w-8 h-8 transform transition-transform duration-500 ${isComplete ? 'group-hover:translate-x-3' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PhotoUpload;

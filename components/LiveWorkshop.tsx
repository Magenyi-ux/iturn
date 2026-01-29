
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { StyleConcept, Order } from '../types';
import { Mic, MicOff, PhoneOff, Video as VideoIcon, Zap, ShieldCheck, Activity, ChevronRight, Crown } from 'lucide-react';

interface LiveWorkshopProps {
  concepts: StyleConcept[];
  orders: Order[];
}

interface DiagnosticEntry {
  timestamp: string;
  type: 'Precision' | 'Fabric' | 'Warning' | 'General';
  message: string;
}

// Helpers for Live API Encoding/Decoding
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LiveWorkshop: React.FC<LiveWorkshopProps> = ({ concepts, orders }) => {
  const [activeStyle, setActiveStyle] = useState<StyleConcept | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [mirrorActive, setMirrorActive] = useState(false);
  const [mirrorOpacity, setMirrorOpacity] = useState(0.5);
  const [callDuration, setCallDuration] = useState(0);
  const [transcriptions, setTranscriptions] = useState<{ user: string; ai: string }>({ user: '', ai: '' });
  const [diagnostics, setDiagnostics] = useState<DiagnosticEntry[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const inputAudioCtx = useRef<AudioContext | null>(null);
  const outputAudioCtx = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    if (isActive) {
      timerIntervalRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setCallDuration(0);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const triggerFlash = () => {
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);
  };

  const startSession = async () => {
    if (!activeStyle) return;
    setIsConnecting(true);

    try {
      const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || "";
      const ai = new GoogleGenAI(apiKey);
      
      inputAudioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-1.5-flash',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
          },
          systemInstruction: `SYSTEM: You are the "Imperial Master Tutor" on a high-fidelity video link with a master tailor.
          Active Style: "${activeStyle.title}".
          Technical Construction Steps: ${activeStyle.steps.join('; ')}.
          
          MISSION:
          - Provide clinical, high-end technical guidance for the current phase.
          - Detect textile alignment, grain integrity, and seam precision in the video feed.
          - If the user has "Mirror Mode" active, you are "seeing" your own digital design projected onto their physical fabric—provide advice on how to align reality with that projection.
          
          VOICE COMMANDS TO MONITOR:
          - "SNAP": Trigger a visual analysis of the current frame.
          - "NEXT": Advance the construction workflow context to the next phase.
          
          CURRENT CONTEXT:
          - Construction Phase: Step ${currentStepIdx + 1}.
          - Atmosphere: Professional, Royal, Precise.

USER INSTRUCTIONS: Provide technical oversight for the atelier workshop session.`,
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = inputAudioCtx.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioCtx.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioCtx.current!.destination);

            frameIntervalRef.current = window.setInterval(() => {
              if (canvasRef.current && videoRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  canvasRef.current.width = 480;
                  canvasRef.current.height = 360;
                  ctx.drawImage(videoRef.current, 0, 0, 480, 360);
                  canvasRef.current.toBlob((blob) => {
                    if (blob) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                      };
                      reader.readAsDataURL(blob);
                    }
                  }, 'image/jpeg', 0.6);
                }
              }
            }, 1000); 
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioCtx.current) {
              const buffer = await decodeAudioData(decode(audioData), outputAudioCtx.current, 24000, 1);
              const source = outputAudioCtx.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioCtx.current.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioCtx.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.inputTranscription) {
               const text = msg.serverContent.inputTranscription.text.toLowerCase();
               setTranscriptions(prev => ({ ...prev, user: text }));

               if (text.includes('snap')) {
                 triggerFlash();
                 setDiagnostics(prev => [{
                    timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                    message: "Imperial Scan Triggered: Analyzing silhouettes...",
                    type: 'General'
                 }, ...prev]);
               }

               if (text.includes('next')) {
                 setCurrentStepIdx(prev => {
                    const nextIdx = Math.min(prev + 1, activeStyle.steps.length - 1);
                    if (nextIdx !== prev) {
                        setDiagnostics(prevLog => [{
                           timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                           message: "Workflow Advanced: Now monitoring Step " + (nextIdx + 1),
                           type: 'General'
                        }, ...prevLog]);
                    }
                    return nextIdx;
                 });
               }
            }
            if (msg.serverContent?.outputTranscription) {
               const text = msg.serverContent.outputTranscription.text;
               setTranscriptions(prev => ({ ...prev, ai: text }));
               
               if (text.length > 15) {
                 setDiagnostics(prev => [{
                   timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                   message: text,
                   type: text.toLowerCase().includes('careful') || text.toLowerCase().includes('stop') ? 'Warning' : 'Precision'
                 }, ...prev].slice(0, 15));
               }
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => console.error("Call dropped", e),
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setIsConnecting(false);
  };

  return (
    <div className="h-full bg-[var(--color-primary)] rounded-[3rem] lg:rounded-[4rem] overflow-hidden flex flex-col transition-all duration-700 shadow-2xl border border-white/5">
      {!isActive ? (
        <div className="flex-1 p-6 lg:p-12 flex flex-col justify-center items-center space-y-12 lg:space-y-16 animate-in fade-in duration-1000">
          <div className="text-center space-y-6">
            <h2 className="text-5xl lg:text-7xl font-serif font-bold text-white tracking-tight">Imperial Link</h2>
            <p className="text-white/40 font-serif text-lg lg:text-xl italic max-w-lg mx-auto">"Real-time technical synthesis between royal hands and digital vision."</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl w-full">
            {concepts.slice(0, 3).map(c => (
              <button 
                key={c.id}
                onClick={() => { setActiveStyle(c); setCurrentStepIdx(0); }}
                className={`p-8 lg:p-10 rounded-[2.5rem] border-2 text-left transition-all duration-500 group relative overflow-hidden ${
                  activeStyle?.id === c.id 
                  ? 'bg-white border-white text-[var(--color-primary)] shadow-2xl scale-[1.05]'
                  : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                {activeStyle?.id === c.id && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-primary)]/[0.03] rounded-bl-full animate-pulse"></div>
                )}
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-50">{c.category}</p>
                  {activeStyle?.id === c.id && <ShieldCheck className="w-4 h-4 text-[var(--color-secondary)]" />}
                </div>
                <h4 className="font-serif font-bold text-2xl leading-tight">{c.title}</h4>
              </button>
            ))}
          </div>

          <button 
            onClick={startSession}
            disabled={!activeStyle || isConnecting}
            className="group px-16 lg:px-24 py-6 lg:py-8 bg-white text-[var(--color-primary)] rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:bg-[var(--color-secondary)] transition-all shadow-2xl disabled:opacity-20 flex items-center gap-6"
          >
            {isConnecting ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : (
              <VideoIcon className="w-5 h-5 text-[var(--color-secondary)]" />
            )}
            {isConnecting ? 'Linking Workshop...' : 'Open Imperial Session'}
          </button>
        </div>
      ) : (
        <div className="flex-1 relative flex flex-col md:flex-row h-full animate-in fade-in duration-1000">
          {/* Main Visual Workspace */}
          <div className="flex-1 relative bg-black overflow-hidden h-[60vh] md:h-full">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

            {/* Imperial Mirror Overlay */}
            {mirrorActive && activeStyle?.refinements && activeStyle.refinements.length > 0 && (
              <div
                className="absolute inset-0 z-10 transition-opacity duration-500 pointer-events-none"
                style={{ opacity: mirrorOpacity }}
              >
                <img
                  src={activeStyle.refinements[activeStyle.refinements.length - 1]}
                  className="w-full h-full object-contain mix-blend-screen"
                  alt="Digital Projection"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-primary)]/20 to-transparent" />
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
            
            {/* Master HUD: Technical Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
               <div className="absolute top-1/2 left-0 right-0 h-px bg-[var(--color-secondary)]"></div>
               <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[var(--color-secondary)]"></div>
               <div className="absolute inset-0 border-[1px] border-[var(--color-secondary)] m-12 rounded-[2rem]"></div>
            </div>

            {/* Scanning Line Animation */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-secondary)] to-transparent opacity-40 shadow-[0_0_20px_var(--color-secondary)] animate-[scan_3s_linear_infinite] pointer-events-none" />

            {/* Flash Effect on 'Snap' */}
            {isFlashActive && <div className="absolute inset-0 bg-white z-[100] animate-out fade-out duration-500"></div>}

            {/* Top Bar Call Metrics */}
            <div className="absolute top-6 lg:top-10 left-6 lg:left-10 right-6 lg:right-10 flex justify-between items-center z-20">
               <div className="flex items-center gap-4">
                  <div className="bg-red-600 px-5 py-2 rounded-xl flex items-center gap-3 shadow-2xl border border-white/20">
                     <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                     <span className="text-[9px] text-white font-black uppercase tracking-widest">Imperial Live</span>
                  </div>
                  <div className="hidden sm:block bg-black/60 backdrop-blur-2xl px-5 py-2 rounded-xl border border-white/10 shadow-xl">
                     <span className="text-[10px] text-white font-mono tracking-widest font-bold">{formatDuration(callDuration)}</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="bg-white/5 backdrop-blur-xl px-5 py-2 rounded-full border border-white/10 flex items-center gap-3 shadow-2xl">
                     <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                     </div>
                     <span className="text-[8px] text-white font-black uppercase tracking-widest">Optical Link Verified</span>
                  </div>
               </div>
            </div>

            {/* Current Instruction HUD */}
            <div className="absolute top-24 lg:top-28 left-6 lg:left-10 z-20 animate-in slide-in-from-left-8 duration-700 w-[calc(100%-3rem)] sm:w-auto">
               <div className="bg-white/95 backdrop-blur-3xl p-6 lg:p-8 rounded-[2.5rem] lg:rounded-[3rem] border border-white shadow-2xl max-w-sm">
                  <p className="text-[8px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.4em] mb-2">Phase Instruction</p>
                  <p className="text-lg font-serif font-bold text-[var(--color-primary)] leading-tight">Step {currentStepIdx + 1}: {activeStyle?.steps[currentStepIdx]}</p>
                  <div className="mt-6 h-1 w-full bg-[var(--color-primary)]/5 rounded-full overflow-hidden">
                     <div 
                      className="h-full bg-[var(--color-secondary)] transition-all duration-[2000ms]"
                      style={{ width: `${((currentStepIdx + 1) / activeStyle!.steps.length) * 100}%` }}
                     />
                  </div>
               </div>
            </div>

            {/* Floating Captions Area */}
            <div className="absolute bottom-32 lg:bottom-40 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-6 lg:px-12 pointer-events-none">
               {transcriptions.ai && (
                 <div className="bg-black/80 backdrop-blur-3xl px-8 lg:px-12 py-6 lg:py-8 rounded-[2.5rem] lg:rounded-[3rem] border border-white/10 text-white text-xl lg:text-2xl font-serif italic text-center leading-relaxed shadow-2xl animate-in slide-in-from-bottom-8">
                    "{transcriptions.ai}"
                 </div>
               )}
            </div>

            {/* Interactive Workshop Controls */}
            <div className="absolute bottom-8 lg:bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 lg:gap-8 p-4 lg:p-6 bg-black/60 backdrop-blur-3xl rounded-full border border-white/10 shadow-2xl transition-all duration-700 hover:scale-105">
               <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-14 h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${isMuted ? 'bg-red-500 text-white scale-90' : 'bg-white/10 text-white hover:bg-white/20'}`}
               >
                 {isMuted ? <MicOff className="w-5 h-5 lg:w-6 lg:h-6" /> : <Mic className="w-5 h-5 lg:w-6 lg:h-6" />}
               </button>
               
               <button 
                onClick={stopSession}
                className="w-16 h-16 lg:w-20 lg:h-20 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-red-500 active:scale-90 transition-all duration-500"
               >
                 <PhoneOff className="w-7 h-7 lg:w-8 lg:h-8" />
               </button>

               <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/10">
                 <button
                  onClick={() => setMirrorActive(!mirrorActive)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${mirrorActive ? 'bg-[var(--color-secondary)] text-[var(--color-primary)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  title="Imperial Mirror"
                 >
                   <Zap className="w-5 h-5" />
                 </button>

                 {mirrorActive && (
                   <input
                    type="range"
                    min="0" max="1" step="0.01"
                    value={mirrorOpacity}
                    onChange={(e) => setMirrorOpacity(parseFloat(e.target.value))}
                    className="w-24 accent-[var(--color-secondary)]"
                   />
                 )}
               </div>
            </div>
          </div>

          {/* Master Tutor Intelligence Log */}
          <div className="w-full md:w-96 bg-black flex flex-col h-full border-l border-white/5">
             <div className="p-8 lg:p-10 border-b border-white/5 space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-2xl flex items-center justify-center text-[var(--color-primary)] shadow-2xl">
                      <Crown className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--color-secondary)]" />
                   </div>
                   <div>
                      <h3 className="font-serif font-bold text-white text-xl">Imperial Tutor</h3>
                      <p className="text-[9px] text-green-500 font-black uppercase tracking-[0.4em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
                        Linked
                      </p>
                   </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 scrollbar-hide max-h-[40vh] md:max-h-full">
                <div className="space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 flex items-center gap-4">
                      Atelier Log
                      <div className="h-px flex-1 bg-white/5"></div>
                   </h4>
                   {diagnostics.map((log, i) => (
                     <div key={i} className="bg-white/[0.03] p-6 rounded-3xl border border-white/[0.05] animate-in slide-in-from-right-8 duration-500 group hover:bg-white/[0.05] transition-all">
                        <div className="flex justify-between items-center mb-3">
                           <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${log.type === 'Warning' ? 'bg-red-500/10 text-red-400' : 'bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]'}`}>{log.type}</span>
                           <span className="text-[9px] text-white/20 font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-[12px] text-white/60 font-serif italic leading-relaxed group-hover:text-white transition-colors">"{log.message}"</p>
                     </div>
                   ))}
                   {diagnostics.length === 0 && (
                     <div className="py-20 text-center opacity-10 space-y-4">
                        <Activity className="w-10 h-10 mx-auto text-white" />
                        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white">Monitoring neural feedback...</p>
                     </div>
                   )}
                </div>
             </div>

             <div className="p-8 lg:p-10 bg-white/[0.02] border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                    <ChevronRight className="w-3 h-3 text-[var(--color-secondary)]" />
                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest">
                      Say "Snap" for scan or "Next" to advance.
                    </p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add scanning keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes scan {
    0% { transform: translateY(0); }
    100% { transform: translateY(100vh); }
  }
`;
document.head.appendChild(style);

export default LiveWorkshop;

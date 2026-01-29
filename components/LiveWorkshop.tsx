
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { StyleConcept, Order } from '../types';

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
      const ai = new GoogleGenAI();
      
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
          systemInstruction: `SYSTEM: You are the "Master Tutor" on a live video call with a tailor.
          Active Style: "${activeStyle.title}".
          Technical Construction Steps: ${activeStyle.steps.join('; ')}.
          
          MISSION:
          - Provide hands-free guidance for the current construction phase.
          - Identify potential errors in fabric handling, grain line alignment, or stitch tension.
          - Offer specific "Tailor's Advice" on what to do and what to avoid.
          
          VOICE COMMANDS YOU MUST RECOGNIZE:
          - "SNAP": Respond by saying "Analyzing capture..." and then provide a technical critique of the visual frame.
          - "NEXT": Move your focus to the next construction step in the sequence.
          
          CURRENT CONTEXT:
          - The tailor is currently at Step ${currentStepIdx + 1}. 
          - Be encouraging yet strictly technical and concise.

USER INSTRUCTIONS: Please provide live technical assistance for the current construction phase.`,
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
               if (text.includes('snap')) triggerFlash();
               if (text.includes('next')) {
                 setCurrentStepIdx(prev => Math.min(prev + 1, activeStyle.steps.length - 1));
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
    <div className="h-full bg-stone-900 rounded-[4rem] overflow-hidden flex flex-col transition-all duration-700 shadow-2xl border border-white/5">
      {!isActive ? (
        <div className="flex-1 p-12 flex flex-col justify-center items-center space-y-16 animate-in fade-in duration-1000">
          <div className="text-center space-y-4">
            <h2 className="text-6xl font-serif font-bold text-white tracking-tight">Direct Atelier Line</h2>
            <p className="text-stone-500 font-medium text-lg italic max-w-lg">"Real-time technical synthesis between your hands and the AI's eye."</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
            {concepts.map(c => (
              <button 
                key={c.id}
                onClick={() => { setActiveStyle(c); setCurrentStepIdx(0); }}
                className={`p-10 rounded-[3rem] border-2 text-left transition-all duration-500 group relative overflow-hidden ${
                  activeStyle?.id === c.id 
                  ? 'bg-white border-white text-stone-900 shadow-2xl scale-[1.05]' 
                  : 'bg-stone-800/40 border-stone-700 text-stone-400 hover:border-stone-500 hover:bg-stone-800/60'
                }`}
              >
                {activeStyle?.id === c.id && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-stone-900/[0.03] rounded-bl-full animate-pulse"></div>
                )}
                <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-3 opacity-50">{c.category}</p>
                <h4 className="font-serif font-bold text-2xl leading-tight">{c.title}</h4>
              </button>
            ))}
          </div>

          <button 
            onClick={startSession}
            disabled={!activeStyle || isConnecting}
            className="group px-24 py-7 bg-white text-stone-900 rounded-full text-xs font-black uppercase tracking-[0.5em] hover:bg-stone-100 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.05)] disabled:opacity-20 flex items-center gap-6"
          >
            {isConnecting ? (
              <div className="w-5 h-5 border-2 border-stone-900/20 border-t-stone-900 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.02.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/></svg>
            )}
            {isConnecting ? 'Linking Workshop...' : 'Open Technical Session'}
          </button>
        </div>
      ) : (
        <div className="flex-1 relative flex flex-col md:flex-row h-full animate-in fade-in duration-1000">
          {/* Main Visual Workspace */}
          <div className="flex-1 relative bg-black overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover grayscale-[0.1]" />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Master HUD: Technical Grid */}
            <div className="absolute inset-0 pointer-events-none">
               <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10"></div>
               <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10"></div>
               <div className="absolute inset-0 border-[2px] border-white/5 m-12 rounded-[2rem]"></div>
            </div>

            {/* Flash Effect on 'Snap' */}
            {isFlashActive && <div className="absolute inset-0 bg-white z-[100] animate-out fade-out duration-500"></div>}

            {/* Top Bar Call Metrics */}
            <div className="absolute top-10 left-10 right-10 flex justify-between items-center z-20">
               <div className="flex items-center gap-5">
                  <div className="bg-red-600 px-5 py-2.5 rounded-2xl flex items-center gap-4 shadow-2xl border border-white/20">
                     <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                     <span className="text-[11px] text-white font-black uppercase tracking-[0.2em]">Workshop Live</span>
                  </div>
                  <div className="bg-stone-900/60 backdrop-blur-2xl px-5 py-2.5 rounded-2xl border border-white/10 shadow-xl">
                     <span className="text-[11px] text-white font-mono tracking-[0.3em] font-bold">{formatDuration(callDuration)}</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-5">
                  <div className="bg-white/5 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/10 flex items-center gap-4 shadow-2xl">
                     <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></div>
                     </div>
                     <span className="text-[10px] text-white font-black uppercase tracking-[0.3em]">AI Optical Link Verified</span>
                  </div>
               </div>
            </div>

            {/* Current Instruction HUD */}
            <div className="absolute top-28 left-10 z-20 animate-in slide-in-from-left-8 duration-700">
               <div className="bg-white/95 backdrop-blur-3xl p-8 rounded-[3rem] border border-stone-200 shadow-[0_50px_100px_rgba(0,0,0,0.3)] max-w-sm">
                  <p className="text-[9px] font-black text-stone-400 uppercase tracking-[0.4em] mb-2">Phase Instruction</p>
                  <p className="text-lg font-serif font-bold text-stone-900 leading-tight">Step {currentStepIdx + 1}: {activeStyle?.steps[currentStepIdx]}</p>
                  <div className="mt-6 h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                     <div 
                      className="h-full bg-stone-900 transition-all duration-[2000ms]" 
                      style={{ width: `${((currentStepIdx + 1) / activeStyle!.steps.length) * 100}%` }}
                     />
                  </div>
               </div>
            </div>

            {/* Floating Captions Area */}
            <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-12 pointer-events-none">
               {transcriptions.ai && (
                 <div className="bg-stone-950/80 backdrop-blur-3xl px-12 py-8 rounded-[3rem] border border-white/10 text-white text-2xl font-serif italic text-center leading-relaxed shadow-[0_80px_160px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-8">
                    "{transcriptions.ai}"
                 </div>
               )}
            </div>

            {/* Interactive Workshop Controls */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center gap-8 p-6 bg-stone-900/60 backdrop-blur-3xl rounded-[3.5rem] border border-white/10 shadow-2xl transition-all duration-700 hover:scale-105">
               <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${isMuted ? 'bg-red-500 text-white scale-90' : 'bg-white/10 text-white hover:bg-white/20'}`}
               >
                 {isMuted ? (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v3.586l-1.293 1.293L10 9.172 5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 ) : (
                    <div className="relative">
                        <div className="absolute inset-0 bg-white/20 blur-xl animate-pulse rounded-full"></div>
                        <svg className="w-7 h-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="2"/></svg>
                    </div>
                 )}
               </button>
               
               <button 
                onClick={stopSession}
                className="w-20 h-20 bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(220,38,38,0.4)] hover:scale-110 hover:bg-red-500 active:scale-90 transition-all duration-500"
               >
                 <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 00-1.02.24l-2.2 2.2a15.045 15.045 0 01-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02A11.36 11.36 0 018.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z" transform="rotate(135 12 12)"/></svg>
               </button>

               <button className="w-16 h-16 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-all shadow-xl">
                 <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth="2"/></svg>
               </button>
            </div>
          </div>

          {/* Master Tutor Intelligence Log */}
          <div className="w-full md:w-96 bg-stone-950 flex flex-col h-full border-l border-white/5">
             <div className="p-10 border-b border-white/5 space-y-6">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-stone-900 shadow-2xl overflow-hidden relative group">
                      <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/0 transition-colors"></div>
                      <span className="font-serif font-bold text-2xl relative z-10">M</span>
                      <div className="absolute inset-0 border border-black/10 rounded-2xl"></div>
                   </div>
                   <div>
                      <h3 className="font-serif font-bold text-white text-xl">Master Tutor</h3>
                      <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.4em] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-current rounded-full animate-ping"></span>
                        Linked
                      </p>
                   </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                <div className="space-y-6">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-stone-600 flex items-center gap-4">
                      Atelier Log
                      <div className="h-px flex-1 bg-white/5"></div>
                   </h4>
                   {diagnostics.map((log, i) => (
                     <div key={i} className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/[0.05] animate-in slide-in-from-right-8 duration-500 group hover:bg-white/[0.05] transition-all">
                        <div className="flex justify-between items-center mb-3">
                           <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${log.type === 'Warning' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>{log.type}</span>
                           <span className="text-[9px] text-stone-700 font-mono">{log.timestamp}</span>
                        </div>
                        <p className="text-[13px] text-stone-400 font-serif italic leading-relaxed group-hover:text-stone-300 transition-colors">"{log.message}"</p>
                     </div>
                   ))}
                   {diagnostics.length === 0 && (
                     <div className="py-32 text-center opacity-10 space-y-6">
                        <svg className="w-12 h-12 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeWidth="1"/></svg>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Neural feedback processing...</p>
                     </div>
                   )}
                </div>
             </div>

             <div className="p-10 bg-white/[0.02] border-t border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-stone-600 font-serif italic">
                      Commands: say **"Snap"** for scan or **"Next"** to proceed.
                    </p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveWorkshop;

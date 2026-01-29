
import React, { useRef, useState, useEffect } from 'react';
import { StyleConcept } from '../types';
import { refineDesign, searchInspiration, CoutureError } from '../services/gemini';

interface SketchpadProps {
  baseImage: string;
  style: StyleConcept;
  onSave: (styleId: string, finalRefinement: string) => void;
  onClose: () => void;
}

const COLORS = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#8B4513', '#708090'];

const Sketchpad: React.FC<SketchpadProps> = ({ baseImage, style, onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentBaseImage, setCurrentBaseImage] = useState(baseImage);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{ text: string, links: { title: string, uri: string }[] } | null>(null);
  const [searching, setSearching] = useState(false);
  const [iterationCount, setIterationCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleRefine = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setRefining(true);
    setError(null);
    const sketchData = canvas.toDataURL('image/png');
    try {
      const refined = await refineDesign(currentBaseImage, sketchData, instructions);
      if (refined) {
        setCurrentBaseImage(refined);
        setIterationCount(prev => prev + 1);
        clearCanvas();
        setInstructions('');
      }
    } catch (e) {
      console.error("Refinement error", e);
      if (e instanceof CoutureError) {
        setError(e.message);
      } else {
        setError("The artistic synthesis failed. Please check your network or design instructions.");
      }
    } finally {
      setRefining(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const result = await searchInspiration(searchQuery);
      setSearchResult(result);
    } catch (e) {
      console.error(e);
    }
    setSearching(false);
  };

  const handleFinalize = () => {
    onSave(style.id, currentBaseImage);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-900 flex animate-in fade-in duration-300">
      <div className="w-20 bg-stone-800 border-r border-stone-700 flex flex-col items-center py-8 space-y-8">
        <button onClick={onClose} className="p-3 bg-stone-700 rounded-xl text-white hover:bg-stone-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col gap-3">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <input
            type="range"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24 -rotate-90 origin-center accent-white cursor-pointer"
          />
          <span className="text-[10px] text-stone-400 font-bold uppercase mt-12">{brushSize}px</span>
        </div>

        <button onClick={clearCanvas} className="p-3 text-stone-400 hover:text-white transition-colors" title="Clear Sketch">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-12 bg-stone-900 overflow-hidden">
        <div className="relative aspect-[3/4] h-full shadow-2xl bg-white rounded-lg overflow-hidden border-4 border-stone-800">
          <img 
            key={currentBaseImage} 
            src={currentBaseImage} 
            className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-60 animate-in fade-in duration-1000" 
            alt="Current Base" 
          />
          <canvas
            ref={canvasRef}
            width={600}
            height={800}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
          />
          
          {iterationCount > 0 && (
            <div className="absolute top-6 left-6 bg-stone-900/80 backdrop-blur px-4 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase text-white tracking-widest shadow-2xl">
              Iteration #{iterationCount}
            </div>
          )}

          {refining && (
             <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                  <p className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Synthesizing Vision...</p>
                </div>
             </div>
          )}
        </div>
      </div>

      <div className="w-96 bg-stone-800 border-l border-stone-700 flex flex-col p-8 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xl font-serif font-bold text-white mb-2">Design Suite</h3>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-black">Sketch iterative refinements</p>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Design Directives</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="w-full h-32 bg-stone-900 border border-stone-700 rounded-xl p-4 text-sm text-white focus:border-white transition-all resize-none outline-none placeholder:text-stone-600"
            placeholder="Describe your color and structure changes..."
          />
          
          {error && (
            <div className="p-4 bg-red-900/40 border border-red-500/50 rounded-xl animate-in slide-in-from-top-2">
               <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-relaxed">
                 {error}
               </p>
            </div>
          )}

          <button
            onClick={handleRefine}
            disabled={refining}
            className="w-full py-4 bg-white text-stone-900 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-stone-100 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-3"
          >
            {refining ? (
              <>
                <div className="w-4 h-4 border-2 border-stone-200 border-t-stone-900 rounded-full animate-spin"></div>
                Updating Design...
              </>
            ) : 'Apply Sketch Changes'}
          </button>
        </div>

        <div className="h-px bg-stone-700" />

        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Market Research</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-stone-900 border border-stone-700 rounded-lg px-4 py-2 text-xs text-white outline-none"
                placeholder="Find styles..."
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2 bg-stone-700 rounded-lg text-white hover:bg-stone-600 disabled:opacity-50"
              >
                {searching ? '...' : '🔍'}
              </button>
            </div>

            {searchResult && (
              <div className="bg-stone-900/50 rounded-xl p-4 space-y-4 animate-in slide-in-from-right-4 border border-stone-700/50">
                <p className="text-[11px] text-stone-300 leading-relaxed italic">"{searchResult.text}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-stone-700">
           <button
             onClick={handleFinalize}
             className="w-full py-4 bg-stone-900 text-stone-400 border border-stone-700 rounded-xl font-bold uppercase tracking-widest text-xs hover:text-white hover:border-white transition-all flex items-center justify-center gap-2 group"
           >
             Finish & Save Concept
             <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default Sketchpad;

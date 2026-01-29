
import React, { useState } from 'react';
import { Measurements } from '../types';

interface MeasurementFormProps {
  measurements: Measurements;
  isPredicting: boolean;
  userSuggestion: string;
  onUpdate: (measurements: Measurements) => void;
  onSuggestionChange: (suggestion: string) => void;
  onContinue: () => void;
}

type Unit = 'cm' | 'in';

const MeasurementForm: React.FC<MeasurementFormProps> = ({ 
  measurements, 
  isPredicting, 
  userSuggestion,
  onUpdate,
  onSuggestionChange,
  onContinue 
}) => {
  const [unit, setUnit] = useState<Unit>('cm');

  const cmToIn = (cm: string) => {
    const val = parseFloat(cm);
    return isNaN(val) ? '' : (val / 2.54).toFixed(2);
  };

  const inToCm = (inches: string) => {
    const val = parseFloat(inches);
    return isNaN(val) ? '' : (val * 2.54).toFixed(2);
  };

  const handleChange = (key: keyof Measurements, value: string) => {
    const cmValue = unit === 'in' ? inToCm(value) : value;
    onUpdate({ ...measurements, [key]: cmValue });
  };

  const fields: { key: keyof Measurements; label: string }[] = [
    { key: 'height', label: 'Total Height' },
    { key: 'chest', label: 'Chest' },
    { key: 'waist', label: 'Waist' },
    { key: 'hips', label: 'Hips' },
    { key: 'shoulders', label: 'Shoulders' },
    { key: 'sleeveLength', label: 'Sleeve' },
    { key: 'inseam', label: 'Inseam' },
    { key: 'neck', label: 'Neck' },
  ];

  if (isPredicting) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-10 animate-in fade-in zoom-in duration-1000">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-stone-100 border-t-stone-900 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-stone-900 rounded-full animate-ping"></div>
          </div>
        </div>
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-serif font-bold tracking-tight">Silicon Tailoring</h3>
          <p className="text-stone-400 font-medium max-w-xs mx-auto">Extracting high-fidelity biometric coordinates from silhouettes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-stone-100 pb-12">
        <div className="space-y-4">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-300">Biometric Intake</span>
          <h2 className="text-5xl md:text-6xl font-serif font-bold tracking-tight">Client Profile</h2>
          <p className="text-stone-400 italic text-lg md:text-2xl font-serif leading-relaxed">"The foundation of every masterpiece is precision."</p>
        </div>

        <div className="flex bg-stone-50 p-2 rounded-[2rem] border border-stone-100 shadow-inner">
          <button
            onClick={() => setUnit('cm')}
            className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-500 ${
              unit === 'cm' ? 'bg-white text-stone-900 shadow-xl' : 'text-stone-300 hover:text-stone-500'
            }`}
          >
            Metric (cm)
          </button>
          <button
            onClick={() => setUnit('in')}
            className={`px-8 py-3.5 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all duration-500 ${
              unit === 'in' ? 'bg-white text-stone-900 shadow-xl' : 'text-stone-300 hover:text-stone-500'
            }`}
          >
            Imperial (in)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
        {/* Measurements Grid */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-10 bg-white p-12 md:p-16 rounded-[4rem] border border-stone-50 shadow-[0_30px_60px_rgba(0,0,0,0.02)]">
          {fields.map((field) => {
            const displayValue = unit === 'in' ? cmToIn(measurements[field.key]) : measurements[field.key];
            return (
              <div key={field.key} className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{field.label}</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-5 py-4 bg-stone-50 border border-stone-100 rounded-2xl focus:ring-2 focus:ring-stone-900 focus:bg-white outline-none transition-all font-serif text-lg"
                    placeholder={`0.0`}
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-300 text-xs font-bold uppercase tracking-widest">
                    {unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggestion Sidebar */}
        <div className="space-y-12 bg-stone-900 text-stone-50 p-12 md:p-16 rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.1)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-all duration-1000"></div>

          <div className="space-y-6 relative z-10">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight leading-none">Creative Direction</h3>
            <p className="text-stone-400 text-sm md:text-base font-medium leading-relaxed">
              Inform the neural tailoring engine with your aesthetic requirements or material preferences.
            </p>
          </div>

          <div className="space-y-4 relative z-10">
             <label className="text-[9px] font-black text-stone-500 uppercase tracking-[0.4em]">Inspiration Notes</label>
             <textarea 
               value={userSuggestion}
               onChange={(e) => onSuggestionChange(e.target.value)}
               className="w-full h-56 bg-white/5 border border-white/10 rounded-[2rem] p-8 text-sm md:text-base text-stone-100 outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-500 resize-none placeholder:text-stone-700"
               placeholder="Example: Mid-century French tailoring, sculptural shoulders, raw silk textures..."
             />
          </div>

          <button 
            onClick={onContinue}
            className="w-full py-8 bg-white text-stone-900 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-stone-50 hover:shadow-2xl hover:shadow-white/10 transition-all duration-500 flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] relative z-10"
          >
            Curate Collection
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasurementForm;

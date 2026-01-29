
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
      <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-luxury-fade">
        <div className="w-20 h-20 border-4 border-[var(--color-primary)]/10 border-t-[var(--color-secondary)] rounded-full animate-spin"></div>
        <div className="text-center space-y-3">
          <h3 className="text-3xl font-serif font-bold text-[var(--color-primary)]">Imperial Vision Active</h3>
          <p className="text-[var(--color-text-secondary)] font-serif italic text-lg">"Synthesizing precision coordinates from anatomic captures..."</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-luxury-fade">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[var(--color-primary)]/5 pb-10">
        <div className="space-y-3">
          <h2 className="text-5xl font-serif font-bold text-[var(--color-primary)] tracking-tight">Client Specifications</h2>
          <p className="text-[var(--color-text-secondary)] font-serif italic text-lg">"Precision is the silent foundation of digital couture."</p>
        </div>

        <div className="flex bg-[var(--color-primary)]/[0.03] p-1.5 rounded-2xl border border-[var(--color-primary)]/5">
          <button
            onClick={() => setUnit('cm')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              unit === 'cm' ? 'bg-white text-[var(--color-primary)] shadow-xl' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            Metric (cm)
          </button>
          <button
            onClick={() => setUnit('in')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
              unit === 'in' ? 'bg-white text-[var(--color-primary)] shadow-xl' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
            }`}
          >
            Imperial (in)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Measurements Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 bg-[var(--color-surface)] p-10 rounded-[3rem] shadow-2xl border border-[var(--color-primary)]/5">
          {fields.map((field) => {
            const displayValue = unit === 'in' ? cmToIn(measurements[field.key]) : measurements[field.key];
            return (
              <div key={field.key} className="space-y-2.5">
                <label className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em] ml-2">{field.label}</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={displayValue}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-full px-6 py-5 bg-[var(--color-background)] border border-[var(--color-primary)]/5 rounded-2xl focus:ring-2 focus:ring-[var(--color-secondary)] focus:bg-white outline-none transition-all font-serif text-xl font-bold text-[var(--color-primary)] shadow-inner"
                    placeholder={`0.0`}
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-secondary)] text-[10px] font-black uppercase tracking-widest opacity-40">
                    {unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggestion Sidebar */}
        <div className="space-y-10 bg-[var(--color-primary)] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -mr-16 -mt-16" />

          <div className="space-y-4 relative z-10">
            <h3 className="text-2xl font-serif font-bold">Creative Directive</h3>
            <p className="text-white/40 text-sm leading-relaxed italic font-serif">
              "Establish the aesthetic parameters for the Imperial Synthesis engine."
            </p>
          </div>

          <div className="space-y-4 relative z-10">
             <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Inspiration Brief</label>
             <textarea 
               value={userSuggestion}
               onChange={(e) => onSuggestionChange(e.target.value)}
               className="w-full h-56 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white outline-none focus:border-[var(--color-secondary)] transition-all resize-none font-serif italic"
               placeholder="E.g. A collection of structured wool overcoats with exaggerated architectural lapels..."
             />
          </div>

          <button 
            onClick={onContinue}
            className="w-full py-6 bg-white text-[var(--color-primary)] rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[var(--color-secondary)] transition-all flex items-center justify-center gap-4 shadow-2xl relative z-10 group"
          >
            Curate 30 Concepts
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2 text-[var(--color-secondary)]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MeasurementForm;

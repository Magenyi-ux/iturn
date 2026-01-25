
import React, { useState } from 'react';
import { Measurements } from '../types';

interface MeasurementFormProps {
  measurements: Measurements;
  isPredicting: boolean;
  userSuggestion: string;
  clientName: string;
  onUpdate: (measurements: Measurements) => void;
  onNameChange: (name: string) => void;
  onSuggestionChange: (suggestion: string) => void;
  onContinue: () => void;
}

type Unit = 'cm' | 'in';

const MeasurementForm: React.FC<MeasurementFormProps> = ({ 
  measurements, 
  isPredicting, 
  userSuggestion,
  clientName,
  onUpdate,
  onNameChange,
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
      <div className="flex flex-col items-center justify-center py-24 space-y-6">
        <div className="w-16 h-16 border-4 border-stone-100 border-t-stone-900 rounded-full animate-spin"></div>
        <div className="text-center">
          <h3 className="text-2xl font-serif font-semibold">AI Analyzing Silhouette</h3>
          <p className="text-stone-500">Extracting precision coordinates from captures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-100 pb-8">
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <h2 className="text-4xl font-serif font-bold">Client Profile</h2>
            <p className="text-stone-500 italic">"The foundation of every masterpiece is precision."</p>
          </div>

          <div className="space-y-2 max-w-sm">
            <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-1">Client Full Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-stone-100 rounded-2xl focus:ring-2 focus:ring-stone-900 outline-none transition-all font-serif text-xl shadow-sm"
              placeholder="Enter client name..."
            />
          </div>
        </div>

        <div className="flex bg-stone-100 p-1.5 rounded-xl border border-stone-200">
          <button
            onClick={() => setUnit('cm')}
            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
              unit === 'cm' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            Metric (cm)
          </button>
          <button
            onClick={() => setUnit('in')}
            className={`px-6 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
              unit === 'in' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            Imperial (in)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Measurements Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 bg-white p-10 rounded-3xl shadow-sm border border-stone-100">
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
        <div className="space-y-8 bg-stone-900 text-stone-50 p-10 rounded-3xl shadow-2xl">
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-bold text-white">Creative Direction</h3>
            <p className="text-stone-400 text-xs leading-relaxed">
              Have a specific vision? Suggest a design language, fabric, or style for the AI to interpret.
            </p>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.2em]">Inspiration Notes</label>
             <textarea 
               value={userSuggestion}
               onChange={(e) => onSuggestionChange(e.target.value)}
               className="w-full h-48 bg-stone-800/50 border border-stone-700 rounded-2xl p-5 text-sm text-stone-100 outline-none focus:border-stone-500 transition-all resize-none placeholder:text-stone-600"
               placeholder="Example: I want a collection inspired by mid-century French tailoring with modern oversized silhouettes..."
             />
          </div>

          <button 
            onClick={onContinue}
            className="w-full py-5 bg-white text-stone-900 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-stone-100 transition-all flex items-center justify-center gap-3 shadow-lg"
          >
            Curate 30 Designs
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

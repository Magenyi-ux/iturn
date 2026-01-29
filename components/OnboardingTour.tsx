
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Crown, Sparkles } from 'lucide-react';

interface Step {
  title: string;
  content: string;
  target?: string; // CSS selector
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingTourProps {
  onComplete: () => void;
}

const steps: Step[] = [
  {
    title: "Welcome to Atelier AI",
    content: "Step into the future of digital tailoring. This guided tour will show you how to master your royal workspace.",
    position: 'center'
  },
  {
    title: "The Client Archive",
    content: "Store and manage your client dossiers, measurement history, and bespoke style preferences here.",
    target: '[data-tour="vault"]',
    position: 'right'
  },
  {
    title: "Initiate a Fitting",
    content: "Use our Anatomic AI to predict measurements from photos or enter them manually to start a new creation.",
    target: '[data-tour="fitting_choice"]',
    position: 'right'
  },
  {
    title: "The Royal Workroom",
    content: "Track the lifecycle of your garments from initial design to final imperial delivery.",
    target: '[data-tour="workroom"]',
    position: 'right'
  },
  {
    title: "Your Personal Palette",
    content: "Tailor the interface to your aesthetic. Choose between Imperial Navy, Royal Emerald, or Majestic Crimson.",
    target: '[data-tour="themes"]',
    position: 'top'
  }
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const step = steps[currentStep];
    if (step.target) {
      const el = document.querySelector(step.target);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      {/* Dark Overlay with Hole */}
      <div className="absolute inset-0 bg-[#0A1128]/80 backdrop-blur-[2px] pointer-events-auto transition-all duration-500" style={{
        clipPath: targetRect
          ? `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.top}px, ${targetRect.right}px ${targetRect.bottom}px, ${targetRect.left}px ${targetRect.bottom}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`
          : 'none'
      }} />

      {/* Tour Card */}
      <div
        className={`
          pointer-events-auto bg-white rounded-[3rem] p-10 shadow-2xl max-w-sm w-full transition-all duration-500 transform
          ${step.position === 'center' ? 'relative scale-110' : 'absolute'}
        `}
        style={targetRect ? {
          top: step.position === 'bottom' ? targetRect.bottom + 24 : step.position === 'top' ? 'auto' : '50%',
          bottom: step.position === 'top' ? (window.innerHeight - targetRect.top) + 24 : 'auto',
          left: step.position === 'right' ? targetRect.right + 24 : step.position === 'left' ? 'auto' : '50%',
          right: step.position === 'left' ? (window.innerWidth - targetRect.left) + 24 : 'auto',
          transform: step.position === 'center' ? 'none' : 'translateY(-50%)'
        } : {}}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12">
              <Crown className="w-6 h-6 text-[var(--color-secondary)]" />
            </div>
            <button onClick={onComplete} className="p-2 text-stone-300 hover:text-stone-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-serif font-bold text-[var(--color-primary)]">{step.title}</h3>
            <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed font-medium">
              {step.content}
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-6 bg-[var(--color-secondary)]' : 'w-1.5 bg-stone-100'}`} />
              ))}
            </div>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="p-3 rounded-xl border border-stone-100 text-stone-400 hover:text-stone-900 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleNext}
                className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[var(--color-accent)] transition-all shadow-xl"
              >
                {currentStep === steps.length - 1 ? "Begin" : "Next"}
                <ChevronRight className="w-4 h-4 text-[var(--color-secondary)]" />
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Sparkle */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-[var(--color-secondary)] text-[var(--color-primary)] rounded-full flex items-center justify-center animate-pulse shadow-xl">
           <Sparkles className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;

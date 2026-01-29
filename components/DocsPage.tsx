
import React, { useState } from 'react';
import { ChevronLeft, BookOpen, Shield, Zap, Video, SwatchBook, Users, Briefcase, Terminal, Crown } from 'lucide-react';

interface DocsPageProps {
  onBack: () => void;
}

const DocsPage: React.FC<DocsPageProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', label: 'Getting Started', icon: BookOpen },
    { id: 'anatomic-ai', label: 'Anatomic AI', icon: Users },
    { id: 'imperial-link', label: 'Imperial Link', icon: Video },
    { id: 'materials-vault', label: 'Materials Vault', icon: SwatchBook },
    { id: 'workroom', label: 'The Workroom', icon: Briefcase },
    { id: 'security', label: 'Security & Privacy', icon: Shield },
    { id: 'api', label: 'Imperial API', icon: Terminal },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 bg-[var(--color-primary)] text-white lg:h-screen sticky top-0 z-50 overflow-y-auto">
        <div className="p-8">
           <button
            onClick={onBack}
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-secondary)] hover:text-white transition-colors mb-12"
           >
              <ChevronLeft className="w-4 h-4" /> Back to Atelier
           </button>
           <div className="flex items-center gap-4 mb-12">
              <Crown className="w-8 h-8 text-[var(--color-secondary)]" />
              <h1 className="text-2xl font-serif font-bold">Imperial Docs</h1>
           </div>

           <nav className="space-y-2">
              {sections.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeSection === s.id ? 'bg-[var(--color-secondary)] text-[var(--color-primary)] shadow-xl' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <s.icon className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">{s.label}</span>
                </button>
              ))}
           </nav>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 lg:p-24 overflow-y-auto bg-white">
         <div className="max-w-3xl mx-auto space-y-16 animate-luxury-fade">
            {activeSection === 'getting-started' && (
              <div className="space-y-10">
                <div className="space-y-4">
                  <h2 className="text-6xl font-serif font-bold text-[var(--color-primary)]">Imperial Onboarding</h2>
                  <p className="text-xl text-[var(--color-text-secondary)] font-serif italic">"Master the digital craft from the first stitch."</p>
                </div>
                <div className="prose prose-stone max-w-none space-y-8 text-[var(--color-text-secondary)] leading-relaxed">
                   <p>Welcome to the official documentation for **Atelier AI**. This guide is designed for master tailors and couturiers transitioning their craft into the digital realm.</p>
                   <div className="bg-[var(--color-background)] p-8 rounded-[3rem] border border-[var(--color-primary)]/5">
                      <h4 className="font-serif font-bold text-[var(--color-primary)] text-xl mb-4 flex items-center gap-3">
                         <Zap className="w-5 h-5 text-[var(--color-secondary)]" /> Quick Start
                      </h4>
                      <ol className="list-decimal list-inside space-y-3 font-medium">
                         <li>Establish your Imperial Profile.</li>
                         <li>Add your first client to the Archive.</li>
                         <li>Initiate a fitting using Anatomic AI Capture.</li>
                         <li>Open an Imperial Link session for real-time construction feedback.</li>
                      </ol>
                   </div>
                </div>
              </div>
            )}

            {activeSection === 'anatomic-ai' && (
              <div className="space-y-10">
                <div className="space-y-4">
                  <h2 className="text-6xl font-serif font-bold text-[var(--color-primary)]">Anatomic AI</h2>
                  <p className="text-xl text-[var(--color-text-secondary)] font-serif italic">"Vision as precise as the needle's eye."</p>
                </div>
                <div className="space-y-8 text-[var(--color-text-secondary)] leading-relaxed">
                   <p>Our Anatomic AI engine uses advanced computer vision to extract over 40 distinct tailoring measurements from just three silhouette captures: Front, Side, and Back.</p>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-8 border border-[var(--color-primary)]/5 rounded-[2.5rem] bg-[var(--color-background)]/50">
                         <h5 className="font-bold text-[var(--color-primary)] uppercase text-xs tracking-widest mb-3">Requirements</h5>
                         <ul className="space-y-2 text-sm">
                            <li>• Form-fitting attire recommended.</li>
                            <li>• High-contrast background.</li>
                            <li>• Balanced studio lighting.</li>
                         </ul>
                      </div>
                      <div className="p-8 border border-[var(--color-primary)]/5 rounded-[2.5rem] bg-[var(--color-background)]/50">
                         <h5 className="font-bold text-[var(--color-primary)] uppercase text-xs tracking-widest mb-3">Accuracy</h5>
                         <ul className="space-y-2 text-sm">
                            <li>• 98.4% correlation with manual tape.</li>
                            <li>• Auto-calibration based on height.</li>
                            <li>• Real-time skeletal mapping.</li>
                         </ul>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeSection === 'imperial-link' && (
              <div className="space-y-10">
                <div className="space-y-4">
                  <h2 className="text-6xl font-serif font-bold text-[var(--color-primary)]">Imperial Link</h2>
                  <p className="text-xl text-[var(--color-text-secondary)] font-serif italic">"The AI-augmented workshop."</p>
                </div>
                <div className="space-y-8 text-[var(--color-text-secondary)] leading-relaxed">
                   <p>Imperial Link represents the pinnacle of workshop technology. By establishing a high-fidelity video session, the AI Master Tutor provides real-time construction oversight.</p>
                   <div className="space-y-6">
                      <h5 className="font-bold text-[var(--color-primary)] uppercase text-xs tracking-widest">Key Commands</h5>
                      <div className="space-y-4">
                         <div className="flex items-center gap-6 p-6 bg-[var(--color-background)] rounded-2xl border border-[var(--color-primary)]/5">
                            <span className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-mono text-sm">"SNAP"</span>
                            <p className="text-sm font-medium">Triggers a technical scan of the current construction phase.</p>
                         </div>
                         <div className="flex items-center gap-6 p-6 bg-[var(--color-background)] rounded-2xl border border-[var(--color-primary)]/5">
                            <span className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-mono text-sm">"NEXT"</span>
                            <p className="text-sm font-medium">Advances the AI's context to the next step in the workroom status.</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Default Placeholder for other sections */}
            {['materials-vault', 'workroom', 'security', 'api'].includes(activeSection) && (
              <div className="py-32 text-center space-y-8 grayscale opacity-20">
                 <Terminal className="w-20 h-20 mx-auto text-[var(--color-primary)]" />
                 <div className="space-y-4">
                    <h3 className="text-3xl font-serif font-bold">Imperial Records Pending</h3>
                    <p className="max-w-sm mx-auto">This section of the Archive is currently being transcribed by the imperial scribes.</p>
                 </div>
              </div>
            )}
         </div>
      </main>
    </div>
  );
};

export default DocsPage;

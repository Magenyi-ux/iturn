
import React from 'react';
import { Crown, Sparkles, Video, SwatchBook, Briefcase, ChevronRight, ArrowRight, ShieldCheck, Globe, Zap } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
  onDocs: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onDocs }) => {
  return (
    <div className="min-h-screen bg-[var(--color-primary)] text-white overflow-hidden selection:bg-[var(--color-secondary)] selection:text-[var(--color-primary)]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] backdrop-blur-md border-b border-white/5 bg-[var(--color-primary)]/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Crown className="w-8 h-8 text-[var(--color-secondary)]" />
            <h1 className="text-2xl font-serif font-bold tracking-tight">Atelier AI</h1>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={onDocs} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors hidden sm:block">Archive Docs</button>
            <button
              onClick={onEnter}
              className="px-8 py-3 bg-[var(--color-secondary)] text-[var(--color-primary)] rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl"
            >
              Enter Atelier
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 lg:pt-64 lg:pb-56 px-6 lg:px-12">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-bl from-[var(--color-secondary)]/10 to-transparent blur-[120px] -z-10" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-[var(--color-secondary)]/5 to-transparent blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 animate-luxury-fade">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl">
               <Sparkles className="w-4 h-4 text-[var(--color-secondary)]" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">The Future of Bespoke Tailoring</span>
            </div>

            <div className="space-y-6">
              <h2 className="text-6xl lg:text-8xl font-serif font-bold leading-[1.1] tracking-tight">
                Where AI Meets the <span className="text-[var(--color-secondary)] italic">Master's Touch</span>
              </h2>
              <p className="text-xl text-white/60 font-serif italic leading-relaxed max-w-lg">
                Step into a digital vault of craftsmanship. From anatomic vision to real-time workshop oversight, Atelier AI is the imperial standard for modern couturiers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-8">
              <button
                onClick={onEnter}
                className="group px-12 py-6 bg-white text-[var(--color-primary)] rounded-2xl text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-[var(--color-secondary)] transition-all shadow-2xl"
              >
                Establish Profile
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </button>
              <button
                onClick={onDocs}
                className="px-12 py-6 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
              >
                View Technical Specs
              </button>
            </div>
          </div>

          <div className="relative group lg:block hidden animate-luxury-fade [animation-delay:400ms]">
             <div className="absolute inset-0 bg-[var(--color-secondary)]/20 blur-[100px] rounded-full animate-pulse" />
             <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 shadow-2xl overflow-hidden group-hover:border-white/20 transition-all duration-700">
                <div className="grid grid-cols-2 gap-8">
                   {[
                     { icon: Video, label: "Live Workshop", color: "emerald" },
                     { icon: SwatchBook, label: "Materials Vault", color: "amber" },
                     { icon: Crown, label: "AI Concierge", color: "blue" },
                     { icon: Briefcase, label: "Imperial Orders", color: "purple" }
                   ].map((item, i) => (
                     <div key={i} className="bg-white/5 p-8 rounded-[3rem] border border-white/5 hover:bg-white/10 transition-colors">
                        <item.icon className="w-10 h-10 text-[var(--color-secondary)] mb-6" />
                        <h4 className="font-serif font-bold text-xl">{item.label}</h4>
                     </div>
                   ))}
                </div>
                <div className="mt-12 bg-black/40 rounded-3xl p-8 border border-white/5">
                   <div className="flex items-center gap-4 mb-4">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Imperial Link Active</span>
                   </div>
                   <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-secondary)] w-3/4 animate-luxury-fade" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white text-[var(--color-primary)]">
         <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center space-y-4 mb-24">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-secondary)]">The Atelier Suite</span>
               <h3 className="text-5xl font-serif font-bold">Unparalleled Digital Craft</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
               {[
                 {
                   title: "Anatomic AI Fitting",
                   desc: "Predict precise measurements from silhouette frames with clinical accuracy. No more tape measures, just vision.",
                   icon: Zap
                 },
                 {
                   title: "Imperial Mirror",
                   desc: "Project digital design concepts directly onto physical garments in real-time. Align reality with your vision.",
                   icon: Globe
                 },
                 {
                   title: "Master Tutor Oversight",
                   desc: "Hands-free voice oversight during construction. Our AI watches every seam and suggests corrections.",
                   icon: ShieldCheck
                 }
               ].map((f, i) => (
                 <div key={i} className="space-y-6 group p-8 hover:bg-[var(--color-primary)]/[0.02] rounded-[3rem] transition-all duration-500">
                    <div className="w-16 h-16 bg-[var(--color-primary)]/5 rounded-2xl flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all">
                       <f.icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-2xl font-serif font-bold">{f.title}</h4>
                    <p className="text-[var(--color-text-secondary)] font-medium leading-relaxed italic">{f.desc}</p>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-white/5 text-center space-y-12">
         <div className="flex items-center justify-center gap-4">
            <Crown className="w-8 h-8 text-[var(--color-secondary)]" />
            <h2 className="text-3xl font-serif font-bold">Atelier AI</h2>
         </div>
         <div className="flex justify-center gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
            <button onClick={onDocs} className="hover:text-white transition-colors">Documentation</button>
            <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
         </div>
         <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">© {new Date().getFullYear()} The Royal Standard. Built for Master Tailors.</p>
      </footer>
    </div>
  );
};

export default LandingPage;


import React, { useState, useEffect } from 'react';
import { AppState, INITIAL_MEASUREMENTS, INITIAL_CHARACTERISTICS, Client, Fabric, Order, StyleConcept, SavedInspiration, InventoryItem, PriceItem } from './types';
import { supabase } from './services/supabase';
import { useTheme } from './components/ThemeProvider';
import {
  Users, Sparkles, Video, SwatchBook, Briefcase, Database,
  Bookmark, Camera, LogOut, Palette, Settings, Menu, X,
  Crown, ChevronRight, Home, BookOpen
} from 'lucide-react';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import DocsPage from './components/DocsPage';
import OnboardingTour from './components/OnboardingTour';
import AIConcierge from './components/AIConcierge';
import PhotoUpload from './components/PhotoUpload';
import MeasurementForm from './components/MeasurementForm';
import StyleCatalog from './components/StyleCatalog';
import ClientVault from './components/ClientVault';
import MaterialsLibrary from './components/MaterialsLibrary';
import Workroom from './components/Workroom';
import Sketchpad from './components/Sketchpad';
import Analytics from './components/Analytics';
import InspirationHub from './components/InspirationHub';
import BlueprintRoom from './components/BlueprintRoom';
import StyleTimeline from './components/StyleTimeline';
import SavedStudio from './components/SavedStudio';
import AdminDashboard from './components/AdminDashboard';
import PricingModal from './components/PricingModal';
import LiveWorkshop from './components/LiveWorkshop';
import { predictMeasurements, generateStyles } from './services/gemini';

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Sebastian Vane', email: 'vane@example.com', phone: '+123', measurements: INITIAL_MEASUREMENTS, history: [], lastVisit: '2 days ago' },
  { id: '2', name: 'Elena Thorne', email: 'thorne@example.com', phone: '+456', measurements: INITIAL_MEASUREMENTS, history: [], lastVisit: 'Just now' }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Premium Egyptian Cotton', category: 'Material', unitCost: 45, stock: 120, imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=400' },
  { id: 'i2', name: 'Raw Mulberry Silk', category: 'Material', unitCost: 150, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1618342205515-5626210f9191?auto=format&fit=crop&q=80&w=400' },
  { id: 'i3', name: 'Silver Zipper (YKK)', category: 'Tool', unitCost: 12, stock: 300, imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=400' },
  { id: 'i4', name: 'Hand-Carved Bone Buttons', category: 'Addon', unitCost: 8, stock: 500, imageUrl: 'https://images.unsplash.com/photo-1589363412213-36367332f146?auto=format&fit=crop&q=80&w=400' }
];

const App: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [guestMode, setGuestMode] = useState(() => localStorage.getItem('atelier_guest_mode') === 'true');
  const [hasEntered, setHasEntered] = useState(() => localStorage.getItem('atelier_has_entered') === 'true');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTour, setShowTour] = useState(() => localStorage.getItem('atelier_tour_completed') !== 'true');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('atelier_state_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...parsed, 
          isPredicting: false, 
          isGeneratingStyles: false,
          inventory: parsed.inventory || INITIAL_INVENTORY
        };
      } catch (e) {
        console.error("Failed to load saved state", e);
      }
    }
    return {
      photos: {},
      measurements: INITIAL_MEASUREMENTS,
      characteristics: INITIAL_CHARACTERISTICS,
      isPredicting: false,
      isGeneratingStyles: false,
      styleConcepts: [],
      selectedStyles: [],
      userSuggestion: '',
      view: 'landing',
      clients: MOCK_CLIENTS,
      fabrics: [],
      orders: [],
      inventory: INITIAL_INVENTORY,
      savedInspirations: []
    };
  });

  const [sketchContext, setSketchContext] = useState<{ style: StyleConcept, image: string } | null>(null);
  const [pricingContext, setPricingContext] = useState<StyleConcept | null>(null);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);

  useEffect(() => {
    localStorage.setItem('atelier_state_v2', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setGuestMode(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem('atelier_guest_mode', guestMode.toString());
  }, [guestMode]);

  useEffect(() => {
    const checkKey = async () => {
      // Skip prompt if API key is provided via environment variable
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        setShowKeyPrompt(false);
        return;
      }

      if (typeof window.aistudio !== 'undefined') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) setShowKeyPrompt(true);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (typeof window.aistudio !== 'undefined') {
      await window.aistudio.openSelectKey();
      setShowKeyPrompt(false);
    }
  };

  const handleNewProfile = () => {
    setState(prev => ({
      ...prev,
      photos: {},
      measurements: INITIAL_MEASUREMENTS,
      characteristics: INITIAL_CHARACTERISTICS,
      styleConcepts: [],
      view: 'fitting_choice',
      selectedClientId: undefined,
      userSuggestion: ''
    }));
  };

  const handlePhotosComplete = async (photos: Record<string, string>) => {
    setState(prev => ({ ...prev, photos, view: 'measurements', isPredicting: true }));
    try {
      const result = await predictMeasurements(photos);
      setState(prev => ({
        ...prev,
        isPredicting: false,
        measurements: { ...prev.measurements, ...result.measurements },
        characteristics: result.characteristics
      }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isPredicting: false }));
    }
  };

  const handleContinueToStyles = async () => {
    setState(prev => ({ ...prev, isGeneratingStyles: true, view: 'styles' }));
    try {
      const styles = await generateStyles(state.measurements, state.photos, state.userSuggestion);
      setState(prev => ({ ...prev, styleConcepts: styles, isGeneratingStyles: false }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isGeneratingStyles: false }));
    }
  };

  const addFabric = (f: Fabric) => setState(prev => ({ ...prev, fabrics: [f, ...prev.fabrics] }));
  
  const updateOrderStatus = (id: string, status: Order['status']) => {
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o)
    }));
  };

  const finalizeCreateOrder = (breakdown: PriceItem[], totalPrice: number) => {
    if (!pricingContext) return;
    const style = pricingContext;
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: state.selectedClientId || state.clients[0].id,
      styleId: style.id,
      fabricId: state.fabrics[0]?.id || 'default',
      status: 'Design',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalPrice: totalPrice,
      priceBreakdown: breakdown
    };
    setState(prev => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      view: 'workroom'
    }));
    setPricingContext(null);
  };

  const openBlueprint = (styleId: string) => {
     setState(prev => ({ ...prev, selectedOrderId: styleId, view: 'blueprints' }));
  };

  const openSketchpad = (style: StyleConcept, image: string) => {
    setSketchContext({ style, image });
    setState(prev => ({ ...prev, view: 'sketchpad' }));
  };

  const handleRefinementComplete = (styleId: string, newImage: string) => {
    setState(prev => {
      const updatedConcepts = prev.styleConcepts.map(s => 
        s.id === styleId ? { ...s, refinements: [...(s.refinements || []), newImage] } : s
      );
      return { ...prev, view: 'styles', styleConcepts: updatedConcepts };
    });
    setSketchContext(null);
  };

  const updateInventory = (item: InventoryItem) => {
    setState(prev => ({ ...prev, inventory: [item, ...prev.inventory] }));
  };

  const deleteInventoryItem = (id: string) => {
    setState(prev => ({ ...prev, inventory: prev.inventory.filter(i => i.id !== id) }));
  };

  const handleSaveInspiration = (inspiration: SavedInspiration) => {
    setState(prev => ({
      ...prev,
      savedInspirations: [inspiration, ...prev.savedInspirations]
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setGuestMode(false);
    setUser(null);
    setHasEntered(false);
    localStorage.removeItem('atelier_has_entered');
    setState(prev => ({ ...prev, view: 'landing' }));
  };

  const handleEnterAtelier = () => {
    setHasEntered(true);
    localStorage.setItem('atelier_has_entered', 'true');
    setState(prev => ({ ...prev, view: 'vault' }));
  };

  if (state.view === 'landing') {
    return <LandingPage onEnter={handleEnterAtelier} onDocs={() => setState(prev => ({ ...prev, view: 'docs' }))} />;
  }

  if (state.view === 'docs') {
    return <DocsPage onBack={() => setState(prev => ({ ...prev, view: hasEntered ? 'vault' : 'landing' }))} />;
  }

  if (!user && !guestMode && hasEntered) {
    return <AuthPage onGuestMode={() => setGuestMode(true)} />;
  }

  const navItems = [
    { id: 'vault', label: 'Vault', icon: Users },
    { id: 'inspiration', label: 'Inspire', icon: Sparkles },
    { id: 'live_workshop', label: 'Live', icon: Video },
    { id: 'materials', label: 'Fabrics', icon: SwatchBook },
    { id: 'workroom', label: 'Orders', icon: Briefcase },
    { id: 'admin', label: 'Data', icon: Database },
    { id: 'archive', label: 'Saved', icon: Bookmark },
    { id: 'fitting_choice', label: 'Fitting', icon: Camera },
    { id: 'docs', label: 'Docs', icon: BookOpen }
  ];

  const handleTourComplete = () => {
    setShowTour(false);
    localStorage.setItem('atelier_tour_completed', 'true');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--color-background)] text-[var(--color-text)] transition-colors duration-500">
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}
      <AIConcierge />

      {showKeyPrompt && (
        <div className="fixed inset-0 z-[100] bg-stone-900/90 backdrop-blur-xl flex items-center justify-center p-8">
           <div className="bg-white max-w-lg w-full rounded-[3rem] p-12 text-center space-y-8 shadow-2xl animate-in zoom-in-95">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
                 <svg className="w-10 h-10 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                 </svg>
              </div>
              <div className="space-y-4">
                 <h2 className="text-3xl font-serif font-bold">Secure Access Required</h2>
                 <p className="text-stone-500 text-sm leading-relaxed">
                   To utilize high-fidelity Gemini 3 Pro image generation, you must select an API key from a paid GCP project.
                 </p>
                 <a 
                   href="https://ai.google.dev/gemini-api/docs/billing" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-200 hover:text-stone-900 hover:border-stone-900 transition-all"
                 >
                   View Billing Documentation
                 </a>
              </div>
              <button 
                onClick={handleOpenKeyDialog}
                className="w-full py-5 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 transition-all shadow-xl"
              >
                Select API Key
              </button>
           </div>
        </div>
      )}

      {/* Mobile Header */}
      <header className="lg:hidden h-20 bg-[var(--color-primary)] flex items-center justify-between px-6 sticky top-0 z-[60] shadow-xl">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-[var(--color-secondary)]" />
          <h1 className="text-xl font-serif font-bold text-white">Atelier AI</h1>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-white/80 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar - Responsive */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-72 bg-[var(--color-primary)] text-white transform transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full border-r border-white/5">
          <div className="p-10 hidden lg:block">
            <div className="flex items-center gap-4 mb-2">
              <Crown className="w-8 h-8 text-[var(--color-secondary)]" />
              <h1 className="text-2xl font-serif font-bold">Atelier AI</h1>
            </div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/40 font-black">Digital Tailoring Suite</p>
          </div>

          <nav className="flex-1 px-6 space-y-1.5 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setState(prev => ({ ...prev, view: item.id as any }));
                    setIsSidebarOpen(false);
                  }}
                  data-tour={item.id}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${
                    state.view === item.id
                    ? 'bg-[var(--color-secondary)] text-[var(--color-primary)] shadow-2xl scale-[1.02]'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${state.view === item.id ? 'text-[var(--color-primary)]' : 'text-white/20'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  {state.view === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}
          </nav>

          <div className="p-8 border-t border-white/5 space-y-6">
            <div className="space-y-4" data-tour="themes">
              <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-black flex items-center gap-2">
                <Palette className="w-3 h-3" /> Royal Palettes
              </p>
              <div className="flex gap-3">
                {(['navy', 'emerald', 'crimson'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      theme === t ? 'border-[var(--color-secondary)] scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: t === 'navy' ? '#0A1128' : t === 'emerald' ? '#064E3B' : '#7F1D1D'
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-red-400/60 hover:text-red-400 hover:bg-red-400/5 group"
            >
              <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-[10px] font-black uppercase tracking-widest">Exit Archive</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-y-auto lg:p-12 p-6 relative animate-luxury-fade">
        {state.view === 'vault' && (
          state.selectedClientId ? (
            <StyleTimeline 
              client={state.clients.find(c => c.id === state.selectedClientId)!} 
              orders={state.orders} 
              concepts={state.styleConcepts} 
              onBack={() => setState(prev => ({ ...prev, selectedClientId: undefined }))}
            />
          ) : (
            <ClientVault 
              clients={state.clients} 
              onSelect={(c) => setState(prev => ({ ...prev, selectedClientId: c.id }))} 
              onNewProfile={handleNewProfile}
            />
          )
        )}

        {state.view === 'live_workshop' && (
          <LiveWorkshop 
            concepts={state.styleConcepts}
            orders={state.orders}
          />
        )}

        {state.view === 'materials' && (
          <MaterialsLibrary 
            fabrics={state.fabrics} 
            onAdd={addFabric}
          />
        )}

        {state.view === 'inspiration' && (
          <InspirationHub 
            onGenerate={(brief) => setState(prev => ({ ...prev, userSuggestion: brief, view: 'fitting_choice', photos: {} }))} 
            onSaveInspiration={handleSaveInspiration}
          />
        )}
        
        {state.view === 'archive' && (
          <SavedStudio 
            inspirations={state.savedInspirations} 
            onAction={(item) => setState(prev => ({ ...prev, userSuggestion: item.content, view: 'fitting_choice', photos: {} }))}
          />
        )}

        {state.view === 'admin' && (
          <AdminDashboard 
            inventory={state.inventory} 
            onUpdateInventory={updateInventory}
            onDeleteItem={deleteInventoryItem}
          />
        )}

        {state.view === 'blueprints' && (
          <BlueprintRoom 
            style={state.styleConcepts.find(s => s.id === state.selectedOrderId)!} 
            measurements={state.measurements} 
          />
        )}

        {state.view === 'workroom' && (
          <Workroom 
            orders={state.orders} 
            clients={state.clients} 
            concepts={state.styleConcepts}
            onUpdateStatus={updateOrderStatus}
            onOpenBlueprint={openBlueprint}
          />
        )}

        {state.view === 'fitting_choice' && (
           <div className="h-full flex flex-col items-center justify-center space-y-16 animate-in zoom-in-95 duration-1000">
              <div className="text-center space-y-6">
                <h2 className="text-6xl font-serif font-bold text-stone-900">Initiate Fitting</h2>
                <p className="text-stone-400 italic text-xl max-w-lg mx-auto">"Precision is the bridge between the sketch and the garment."</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl w-full">
                <button 
                  onClick={() => setState(prev => ({ ...prev, view: 'capture' }))}
                  className="group bg-white p-12 rounded-[4rem] border border-stone-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center space-y-8"
                >
                   <div className="w-24 h-24 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeWidth="1.5"/></svg>
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-2xl font-serif font-bold">Anatomic AI Capture</h3>
                     <p className="text-stone-400 text-sm leading-relaxed">Predict measurements from three technical silhouette frames.</p>
                   </div>
                </button>
                <button 
                  onClick={() => setState(prev => ({ ...prev, view: 'measurements' }))}
                  className="group bg-stone-900 p-12 rounded-[4rem] shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center space-y-8"
                >
                   <div className="w-24 h-24 bg-white text-stone-900 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758L5 19m0-14l3.121 3.121" strokeWidth="1.5"/></svg>
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-2xl font-serif font-bold text-white">Direct Entry</h3>
                     <p className="text-stone-500 text-sm leading-relaxed">Manually feed in measurements for established client files.</p>
                   </div>
                </button>
              </div>
           </div>
        )}

        {state.view === 'capture' && (
          <PhotoUpload 
            onPhotosComplete={handlePhotosComplete} 
            onManualEntry={() => setState(prev => ({ ...prev, view: 'measurements' }))} 
          />
        )}

        {state.view === 'measurements' && (
          <MeasurementForm 
            measurements={state.measurements}
            isPredicting={state.isPredicting}
            userSuggestion={state.userSuggestion}
            onUpdate={(m) => setState(prev => ({ ...prev, measurements: m }))}
            onSuggestionChange={(s) => setState(prev => ({ ...prev, userSuggestion: s }))}
            onContinue={handleContinueToStyles}
          />
        )}

        {state.view === 'styles' && (
          state.isGeneratingStyles ? (
            <div className="flex flex-col items-center justify-center h-full py-24 space-y-6">
              <div className="w-16 h-16 border-4 border-stone-100 border-t-stone-900 rounded-full animate-spin"></div>
              <p className="text-xl font-serif">Curating bespoke concepts...</p>
            </div>
          ) : (
            <>
              <StyleCatalog 
                concepts={state.styleConcepts} 
                measurements={state.measurements}
                characteristics={state.characteristics}
                photos={state.photos}
                onEdit={openSketchpad}
                onCreateOrder={setPricingContext}
              />
              {pricingContext && (
                <PricingModal 
                  style={pricingContext}
                  inventory={state.inventory}
                  onConfirm={finalizeCreateOrder}
                  onClose={() => setPricingContext(null)}
                />
              )}
            </>
          )
        )}

        {state.view === 'sketchpad' && sketchContext && (
          <Sketchpad 
            baseImage={sketchContext.image} 
            style={sketchContext.style}
            onSave={handleRefinementComplete}
            onClose={() => setState(prev => ({ ...prev, view: 'styles' }))}
          />
        )}
      </main>

      {/* Mobile Navigation Dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-[var(--color-primary)] border-t border-white/10 flex items-center justify-around px-4 z-[60] backdrop-blur-xl shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setState(prev => ({ ...prev, view: item.id as any }))}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                state.view === item.id ? 'text-[var(--color-secondary)]' : 'text-white/30'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex flex-col items-center gap-1.5 text-white/30"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">More</span>
        </button>
      </nav>
    </div>
  );
};

export default App;

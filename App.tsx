
import React, { useState, useEffect } from 'react';
import { AppState, INITIAL_MEASUREMENTS, INITIAL_CHARACTERISTICS, Client, Fabric, Order, StyleConcept, SavedInspiration, InventoryItem, PriceItem } from './types';
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
import Profile from './components/Profile';
import { predictMeasurements, generateStyles } from './services/gemini';
import Auth from './components/Auth';
import { loadUserState, saveUserState } from './services/db';
import { supabase, isSupabaseConfigured } from './services/supabase';

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
  const [user, setUser] = useState<{ id: string, email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<AppState>({
    photos: {},
    measurements: INITIAL_MEASUREMENTS,
    characteristics: INITIAL_CHARACTERISTICS,
    isPredicting: false,
    isGeneratingStyles: false,
    styleConcepts: [],
    selectedStyles: [],
    userSuggestion: '',
    view: 'vault',
    clients: MOCK_CLIENTS,
    fabrics: [],
    orders: [],
    inventory: INITIAL_INVENTORY,
    savedInspirations: []
  });

  const [sketchContext, setSketchContext] = useState<{ style: StyleConcept, image: string } | null>(null);
  const [pricingContext, setPricingContext] = useState<StyleConcept | null>(null);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (!isSupabaseConfigured) {
        const cloudState = await loadUserState();
        if (cloudState) setState(cloudState);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        const cloudState = await loadUserState();
        if (cloudState) setState(cloudState);
      }
      setLoading(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        const cloudState = await loadUserState();
        if (cloudState) setState(cloudState);
      } else {
        setUser(null);
      }
    });

    const handleGuest = async () => {
      setUser({ id: 'guest', email: 'guest@atelier.ai' });
      const cloudState = await loadUserState();
      if (cloudState) setState(cloudState);
    };

    window.addEventListener('auth:guest' as any, handleGuest);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth:guest' as any, handleGuest);
    };
  }, []);

  useEffect(() => {
    if (user && !loading) {
      saveUserState(state);
    }
  }, [state, user, loading]);

  useEffect(() => {
    const checkKey = async () => {
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
      view: 'capture',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-stone-100 border-t-stone-900 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const navItems = [
    { id: 'vault', label: 'Vault', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'inspiration', label: 'Hub', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
    { id: 'workroom', label: 'Studio', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { id: 'archive', label: 'Saved', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
    { id: 'profile', label: 'Profile', icon: 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#faf9f6] text-stone-900 selection:bg-stone-900 selection:text-white">
      {showKeyPrompt && (
        <div className="fixed inset-0 z-[100] bg-stone-900/95 backdrop-blur-2xl flex items-center justify-center p-6">
           <div className="bg-white max-w-lg w-full rounded-[3.5rem] p-12 text-center space-y-8 shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto border border-stone-100">
                 <svg className="w-10 h-10 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                 </svg>
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl font-serif font-bold tracking-tight">Access Protocol</h2>
                 <p className="text-stone-500 text-sm leading-relaxed max-w-sm mx-auto font-medium">
                   Select your digital signature to authorize high-fidelity Gemini 3 generative processes.
                 </p>
              </div>
              <button 
                onClick={handleOpenKeyDialog}
                className="w-full py-6 bg-stone-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-stone-800 transition-all shadow-xl active:scale-[0.98]"
              >
                Authenticate API
              </button>
           </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-stone-100 flex-col h-screen sticky top-0 z-[50]">
        <div className="p-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center shadow-lg shadow-stone-200">
            <span className="text-white font-serif font-bold text-2xl">A</span>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold tracking-tight">Atelier AI</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-stone-400 font-black">Digital Tailoring</p>
          </div>
        </div>

        <nav className="flex-1 px-6 py-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setState(prev => ({ ...prev, view: item.id as any }))}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${
                state.view === item.id
                ? 'bg-stone-900 text-white shadow-xl shadow-stone-200 translate-x-1'
                : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={state.view === item.id ? 2 : 1.5} d={item.icon} />
              </svg>
              <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}

          <div className="pt-8 pb-4">
             <p className="px-6 text-[9px] font-black uppercase tracking-[0.4em] text-stone-300 mb-4">Operations</p>
             <button
                onClick={handleNewProfile}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${
                  state.view === 'capture'
                  ? 'bg-stone-900 text-white shadow-xl translate-x-1'
                  : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={state.view === 'capture' ? 2 : 1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-[11px] font-black uppercase tracking-widest">New Fitting</span>
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, view: 'admin' }))}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 ${
                  state.view === 'admin'
                  ? 'bg-stone-900 text-white shadow-xl translate-x-1'
                  : 'text-stone-400 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={state.view === 'admin' ? 2 : 1.5} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 4h16M4 15h16" />
                </svg>
                <span className="text-[11px] font-black uppercase tracking-widest">Database</span>
              </button>
          </div>
        </nav>

        <div className="p-6">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all text-stone-400 hover:text-red-500 hover:bg-red-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-[11px] font-black uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between sticky top-0 z-[50]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-stone-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-serif font-bold text-sm">A</span>
          </div>
          <h1 className="text-sm font-serif font-bold tracking-tight uppercase">Atelier AI</h1>
        </div>
        <button
          onClick={handleNewProfile}
          className="w-10 h-10 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path d="M12 4v16m8-8H4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 py-10 md:px-12 md:py-16 overflow-y-auto pb-32 lg:pb-16">
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

        {state.view === 'inspiration' && (
          <InspirationHub 
            onGenerate={(brief) => setState(prev => ({ ...prev, userSuggestion: brief, view: 'capture', photos: {} }))} 
            onSaveInspiration={handleSaveInspiration}
          />
        )}
        
        {state.view === 'archive' && (
          <SavedStudio 
            inspirations={state.savedInspirations} 
            onAction={(item) => setState(prev => ({ ...prev, userSuggestion: item.content, view: 'capture', photos: {} }))}
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

        {state.view === 'capture' && <PhotoUpload onPhotosComplete={handlePhotosComplete} />}

        {state.view === 'profile' && user && (
          <Profile
            state={state}
            user={user}
            onNavigate={(view) => setState(prev => ({ ...prev, view }))}
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

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-stone-100 flex items-center justify-around px-2 py-4 z-[50]">
         {navItems.map((item) => (
           <button
             key={item.id}
             onClick={() => setState(prev => ({ ...prev, view: item.id as any }))}
             className={`flex flex-col items-center gap-1.5 px-4 transition-all duration-300 ${
               state.view === item.id ? 'text-stone-900 scale-110' : 'text-stone-300'
             }`}
           >
             <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={state.view === item.id ? 2 : 1.5} d={item.icon} />
             </svg>
             <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
           </button>
         ))}
      </nav>
    </div>
  );
};

export default App;

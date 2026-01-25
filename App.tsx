
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
    currentClientName: '',
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
      currentClientName: '',
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
    // Automatically save or update client if name is provided
    if (state.currentClientName) {
      const existingIdx = state.clients.findIndex(c => c.id === state.selectedClientId);
      const updatedClients = [...state.clients];

      const clientData: Client = {
        id: state.selectedClientId || Math.random().toString(36).substr(2, 9),
        name: state.currentClientName,
        email: '',
        phone: '',
        measurements: state.measurements,
        history: existingIdx >= 0 ? state.clients[existingIdx].history : [],
        lastVisit: 'Just now'
      };

      if (existingIdx >= 0) {
        updatedClients[existingIdx] = clientData;
      } else {
        updatedClients.unshift(clientData);
      }

      setState(prev => ({
        ...prev,
        clients: updatedClients,
        selectedClientId: clientData.id,
        isGeneratingStyles: true,
        view: 'styles'
      }));
    } else {
      setState(prev => ({ ...prev, isGeneratingStyles: true, view: 'styles' }));
    }

    try {
      const styles = await generateStyles(state.measurements, state.photos, state.userSuggestion);
      setState(prev => ({ ...prev, styleConcepts: styles, isGeneratingStyles: false }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ ...prev, isGeneratingStyles: false }));
    }
  };

  const addFabric = (f: Fabric) => setState(prev => ({ ...prev, fabrics: [f, ...prev.fabrics] }));
  const removeFabric = (id: string) => setState(prev => ({ ...prev, fabrics: prev.fabrics.filter(f => f.id !== id) }));
  
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
      clients: prev.clients.map(c => c.id === newOrder.clientId ? { ...c, history: [...c.history, newOrder.id] } : c),
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

  const handleReset = () => {
    setState({
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
      currentClientName: '',
      inventory: INITIAL_INVENTORY,
      savedInspirations: []
    });
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

  return (
    <div className="min-h-screen flex bg-stone-50">
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

      <aside className="w-20 lg:w-64 bg-stone-900 text-stone-50 flex flex-col h-screen sticky top-0 z-[50]">
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-stone-900 font-serif font-bold text-xl">A</span>
          </div>
          <div className="hidden lg:block">
            <h1 className="text-lg font-serif font-bold">Atelier AI</h1>
            <div className="flex items-center gap-2">
              <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Digital Tailoring</p>
              <div
                className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}
                title={isSupabaseConfigured ? 'Cloud Sync Active' : 'Local Storage Mode'}
              />
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {[
            { id: 'vault', label: 'Client Vault', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
            { id: 'inspiration', label: 'Inspiration', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
            { id: 'workroom', label: 'Workroom', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
            { id: 'materials', label: 'Materials', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
            { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'admin', label: 'Database', icon: 'M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm0 4h16M4 15h16' },
            { id: 'archive', label: 'Saved Studio', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
            { id: 'capture', label: 'New Fitting', icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setState(prev => ({ ...prev, view: item.id as any }))}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
                state.view === item.id ? 'bg-white text-stone-900 shadow-xl' : 'text-stone-400 hover:text-white'
              }`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all text-stone-400 hover:text-white hover:bg-stone-800"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
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
              onSelect={(c) => {
                const client = state.clients.find(cl => cl.id === c.id);
                setState(prev => ({
                  ...prev,
                  selectedClientId: c.id,
                  measurements: client?.measurements || INITIAL_MEASUREMENTS,
                  currentClientName: client?.name || ''
                }));
              }}
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
            onReset={handleReset}
          />
        )}

        {state.view === 'blueprints' && (
          <BlueprintRoom 
            style={state.styleConcepts.find(s => s.id === state.selectedOrderId)!} 
            measurements={state.measurements} 
          />
        )}

        {state.view === 'materials' && (
          <MaterialsLibrary
            fabrics={state.fabrics}
            onAdd={addFabric}
            onRemove={removeFabric}
          />
        )}

        {state.view === 'analytics' && (
          <Analytics
            state={state}
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

        {state.view === 'measurements' && (
          <MeasurementForm 
            measurements={state.measurements}
            isPredicting={state.isPredicting}
            userSuggestion={state.userSuggestion}
            clientName={state.currentClientName || ''}
            onUpdate={(m) => setState(prev => ({ ...prev, measurements: m }))}
            onNameChange={(name) => setState(prev => ({ ...prev, currentClientName: name }))}
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
    </div>
  );
};

export default App;

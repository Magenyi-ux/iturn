
import React, { useState } from 'react';
import { AppState } from '../types';

interface ProfileProps {
  state: AppState;
  user: { id: string, email: string };
  onNavigate: (view: AppState['view']) => void;
}

const Profile: React.FC<ProfileProps> = ({ state, user, onNavigate }) => {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end border-b border-stone-200 pb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Atelier Account</span>
          <h2 className="text-5xl font-serif font-bold text-stone-900 mt-2">Executive Profile</h2>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-stone-900">{user.email}</p>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">ID: {user.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Storage Card */}
        <div className="md:col-span-1 bg-white rounded-[3rem] p-10 border border-stone-100 shadow-sm space-y-8">
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-stone-900">Cloud Storage</h3>
            <p className="text-[10px] text-stone-400 uppercase tracking-[0.2em]">Synchronized Architecture</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-3xl font-serif font-bold text-stone-900">0.85 GB</span>
              <span className="text-[10px] font-black text-stone-300">/ 1.0 GB</span>
            </div>
            <div className="w-full h-2 bg-stone-50 rounded-full overflow-hidden">
              <div className="h-full bg-stone-900 rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-[10px] text-stone-500 leading-relaxed italic">
              Your digital atelier is reaching capacity. Upgrade to maintain high-resolution design archives.
            </p>
          </div>

          <button
            onClick={() => setShowPaywall(true)}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-800 transition-all shadow-xl active:scale-95"
          >
            Expand Capacity
          </button>
        </div>

        {/* Activity Statistics */}
        <div className="md:col-span-2 bg-stone-900 rounded-[3rem] p-10 text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-white/10"></div>

          <div className="grid grid-cols-3 gap-8 relative z-10">
            <div className="space-y-1">
              <p className="text-4xl font-serif font-bold">{state.orders.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Active Orders</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-serif font-bold">{state.savedInspirations.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Saved Hubs</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl font-serif font-bold">{state.clients.length}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-500">Linked Clients</p>
            </div>
          </div>

          <div className="pt-8 border-t border-stone-800 flex justify-between items-center relative z-10">
             <div>
                <p className="text-xs font-bold text-stone-300 tracking-wide">Subscription Status</p>
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500 mt-1 font-black">Standard Tier</p>
             </div>
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Cloud Sync Active</span>
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
             </div>
          </div>
        </div>
      </div>

      {/* Activity History */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-stone-900 border-b border-stone-100 pb-4">Recent Past Activity</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
             <div className="flex justify-between items-center px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Recent Orders</p>
                <button onClick={() => onNavigate('workroom')} className="text-[9px] font-black uppercase tracking-widest text-stone-300 hover:text-stone-900 transition-all">View All</button>
             </div>
             <div className="space-y-3">
               {state.orders.slice(0, 3).map(order => (
                 <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 flex justify-between items-center hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center font-serif font-bold text-stone-300 group-hover:bg-stone-900 group-hover:text-white transition-all">
                          {order.id.slice(0, 1).toUpperCase()}
                       </div>
                       <div>
                          <p className="text-sm font-bold text-stone-800">Order #{order.id.toUpperCase()}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5">{order.status} • {new Date(order.createdAt).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <span className="font-serif font-bold text-stone-900">${order.totalPrice.toLocaleString()}</span>
                 </div>
               ))}
               {state.orders.length === 0 && (
                 <div className="py-12 text-center border-2 border-dashed border-stone-100 rounded-[2rem]">
                    <p className="text-xs italic text-stone-300 uppercase tracking-widest font-black">No recent orders</p>
                 </div>
               )}
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center px-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Saved Inspirations</p>
                <button onClick={() => onNavigate('archive')} className="text-[9px] font-black uppercase tracking-widest text-stone-300 hover:text-stone-900 transition-all">View All</button>
             </div>
             <div className="space-y-3">
               {state.savedInspirations.slice(0, 3).map(insp => (
                 <div key={insp.id} className="bg-white p-6 rounded-[2rem] border border-stone-100 flex justify-between items-center hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group">
                    <div className="flex items-center gap-4 truncate mr-4">
                       {insp.type === 'image' ? (
                         <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-50 flex-shrink-0 border border-stone-100">
                            <img src={insp.content} className="w-full h-full object-cover" alt="" />
                         </div>
                       ) : (
                         <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 flex-shrink-0 group-hover:bg-stone-900 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M4 6h16M4 12h16m-7 6h7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                         </div>
                       )}
                       <div className="truncate">
                          <p className="text-sm font-bold text-stone-800 truncate">{insp.title || 'Untitled Concept'}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-0.5 truncate">{new Date(insp.timestamp).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <svg className="w-4 h-4 text-stone-200 group-hover:text-stone-900 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                 </div>
               ))}
               {state.savedInspirations.length === 0 && (
                 <div className="py-12 text-center border-2 border-dashed border-stone-100 rounded-[2rem]">
                    <p className="text-xs italic text-stone-300 uppercase tracking-widest font-black">Empty Archive</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] bg-stone-900/80 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="bg-white max-w-lg w-full rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
              <div className="bg-stone-900 p-16 text-center space-y-4 relative overflow-hidden">
                 <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:20px_20px]"></div>
                 </div>
                 <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8 relative z-10 border border-white/10">
                    <span className="text-white font-serif text-3xl font-bold italic">x402</span>
                 </div>
                 <h2 className="text-3xl font-serif font-bold text-white relative z-10">Payment Required</h2>
                 <p className="text-stone-500 text-[10px] leading-relaxed uppercase tracking-[0.4em] font-black relative z-10">
                   System Restriction Protocol
                 </p>
              </div>
              <div className="p-16 space-y-10">
                 <div className="flex justify-between items-center border-b border-stone-100 pb-8">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Subscription Upgrade</p>
                       <p className="text-2xl font-serif font-bold text-stone-900 mt-1">1GB Cloud Storage</p>
                    </div>
                    <div className="text-right">
                       <p className="text-3xl font-serif font-bold text-stone-900">200 NGN</p>
                       <p className="text-[10px] text-stone-400 uppercase font-black tracking-widest mt-1">one-time activation</p>
                    </div>
                 </div>

                 <div className="bg-stone-50 p-8 rounded-[2.5rem] space-y-3 border border-stone-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-900 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-stone-900 rounded-full"></span>
                       Infrastructure Notice
                    </p>
                    <p className="text-xs text-stone-400 leading-relaxed italic">
                      This transaction gateway is currently in Sandbox mode. Payments are directed nowhere for now and will not be processed.
                    </p>
                 </div>

                 <div className="flex gap-4">
                    <button
                      onClick={() => setShowPaywall(false)}
                      className="flex-1 py-6 border-2 border-stone-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-stone-50 transition-all active:scale-95"
                    >
                      Dismiss
                    </button>
                    <button
                      disabled
                      className="flex-1 py-6 bg-stone-100 text-stone-300 rounded-2xl font-black uppercase tracking-widest text-[10px] cursor-not-allowed border border-stone-100"
                    >
                      Continue
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

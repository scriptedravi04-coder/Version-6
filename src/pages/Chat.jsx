import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { Search } from "lucide-react";
import ChatBox from "../components/chat/ChatBox";

export default function Chat() {
  const { userId: urlThreadId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [search, setSearch] = useState("");

  const isBrand = user?.role === 'brand' || user?.user_type === 'brand';

  useEffect(() => {
    if (threads.length === 0) {
      loadThreads();
    } else if (urlThreadId) {
      let t = threads.find((x) => x.id === urlThreadId);
      if (!t) {
        t = threads.find(x => x.creator_id === urlThreadId || x.brand_id === urlThreadId);
      }
      if (t) {
        setActiveThread(t);
      } else if (urlThreadId.length > 0) {
        setActiveThread({
          id: `new_${urlThreadId}`,
          creator_id: isBrand ? urlThreadId : user.user_id,
          brand_id: isBrand ? user.user_id : urlThreadId,
          status: 'NEGOTIATING',
          isNew: true
        });
      }
    } else if (threads.length > 0 && !activeThread) {
      // Auto-select first thread if none provided
      setActiveThread(threads[0]);
    }
  }, [user, urlThreadId, threads]);

  const loadThreads = async () => {
    if (!user) return;
    startLoading();
    try {
      const { data } = await api.get("/chat/v2/threads");
      setThreads(data || []);
      
      if (urlThreadId) {
        // urlThreadId could be a direct user_id (if navigated from profile) or an actual thread id
        let t = data?.find((x) => x.id === urlThreadId);
        if (!t) {
          t = data?.find(x => x.creator_id === urlThreadId || x.brand_id === urlThreadId);
        }

        if (t) {
          setActiveThread(t);
        } else if (urlThreadId.length > 0) {
           // Provide a mechanism to create a new thread if it doesn't exist
           // Since we don't have a direct /create endpoint in v2, we'll try sending an empty message 
           // but wait, if it's a user, we can create a thread object on the fly to let the user start chatting
           setActiveThread({
             id: `new_${urlThreadId}`,
             creator_id: isBrand ? urlThreadId : user.user_id,
             brand_id: isBrand ? user.user_id : urlThreadId,
             status: 'NEGOTIATING',
             isNew: true
           });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      stopLoading();
    }
  };

  const filteredThreads = threads.filter(t => {
    const opp = isBrand ? t.creator : t.brand;
    if (!opp) return true;
    return (opp.name || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex bg-[#0A0A0F] h-full overflow-hidden border-t border-white/5">
      {/* Sidebar - Inbox List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col bg-[#12121A] shrink-0 ${activeThread ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-white/5 h-20 shrink-0 flex items-center">
          <h2 className="text-xl font-display font-bold text-white">Inbox</h2>
        </div>
        
        <div className="p-4 border-b border-white/5 bg-[#1A1A2E]/30 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20 transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredThreads.map(t => {
            const isActive = activeThread?.id === t.id;
            const partner = isBrand ? t.creator : t.brand;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveThread(t);
                  navigate(`/chat/${t.id}`, { replace: true });
                }}
                className={`w-full text-left p-4 border-b border-white/5 transition-colors flex items-center gap-3 hover:bg-white/5 ${isActive ? 'bg-white/5 border-l-4 ' + (isBrand ? 'border-l-[#7C3AED]' : 'border-l-[#D9F111]') : 'border-l-4 border-l-transparent'}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 shrink-0 border border-white/10">
                  {(partner?.profile_picture_url || partner?.logo_url) ? (
                    <img src={partner.profile_picture_url || partner.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1A1A2E]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-white text-sm truncate">{partner?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-white/40 shrink-0 ml-2">
                       {new Date(t.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-xs text-white/50 truncate flex items-center gap-2">
                    <span className="bg-white/10 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{t.status === 'NEGOTIATING' ? 'Neg...' : t.status}</span>
                    <span className="truncate">{t.campaigns?.title || 'Direct Deal'}</span>
                  </div>
                </div>
              </button>
            )
          })}
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-white/40 text-sm">
              No conversations found.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeThread ? 'hidden md:flex' : 'flex'}`}>
        <ChatBox thread={activeThread} user={user} />
      </div>
    </div>
  );
}

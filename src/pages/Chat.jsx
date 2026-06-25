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
    <div className="flex bg-[var(--bg-card)] h-full overflow-hidden border-t border-[var(--border-default)]">
      {/* Sidebar - Inbox List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-[var(--border-default)] flex flex-col bg-[var(--bg-base)] shrink-0 ${activeThread ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-[var(--border-default)] h-20 shrink-0 flex items-center">
          <h2 className="text-xl font-display font-bold text-[var(--text-primary)]">Inbox</h2>
        </div>
        
        <div className="p-4 border-b border-[var(--border-default)] bg-[var(--bg-card)] shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--violet)] transition-colors"
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
                className={`w-full text-left p-4 border-b border-[var(--border-default)] transition-colors flex items-center gap-3 hover:bg-[var(--bg-elevated)] ${isActive ? 'bg-[var(--bg-elevated)] border-l-4 ' + (isBrand ? 'border-l-[var(--violet)]' : 'border-l-emerald-500') : 'border-l-4 border-l-transparent'}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--bg-elevated)] shrink-0 border border-[var(--border-default)]">
                  {(partner?.profile_picture_url || partner?.logo_url) ? (
                    <img src={partner.profile_picture_url || partner.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg-elevated)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[var(--text-primary)] text-sm truncate">{partner?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 ml-2">
                       {new Date(t.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] truncate flex items-center gap-2">
                    <span className="bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{t.status === 'NEGOTIATING' ? 'Neg...' : t.status}</span>
                    <span className="truncate">{t.campaigns?.title || 'Direct Deal'}</span>
                  </div>
                </div>
              </button>
            )
          })}
          {filteredThreads.length === 0 && (
            <div className="p-8 text-center text-[var(--text-tertiary)] text-sm">
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

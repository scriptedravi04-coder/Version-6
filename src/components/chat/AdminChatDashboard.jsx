import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { ShieldAlert, MessageSquare, Search, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminChatDashboard() {
  const [threads, setThreads] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [tab, setTab] = useState('flags'); // 'flags' or 'all'
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [threadsRes, flaggedRes] = await Promise.all([
        api.get('/admin/chat/all'),
        api.get('/admin/chat/flagged')
      ]);
      setThreads(threadsRes.data || []);
      setFlagged(flaggedRes.data || []);
    } catch (err) {
      toast.error('Failed to load chat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleAction = async (flagId, action) => {
    try {
      await api.post(`/admin/chat/flagged/${flagId}/resolve`, { action });
      toast.success(`Action taken: ${action}`);
      loadData();
    } catch (err) {
      toast.error('Action failed');
    }
  }

  if (loading) return <div className="p-8 text-center text-white/50">Loading chat metrics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-white/5 pb-4">
        <button 
           onClick={() => setTab('flags')} 
           className={`font-bold flex items-center gap-2 ${tab === 'flags' ? 'text-red-400' : 'text-white/50'}`}
        >
          <ShieldAlert size={18} /> Flagged Messages ({flagged.length})
        </button>
        <button 
           onClick={() => setTab('all')} 
           className={`font-bold flex items-center gap-2 ${tab === 'all' ? 'text-white' : 'text-white/50'}`}
        >
          <MessageSquare size={18} /> All Threads
        </button>
      </div>

      {tab === 'flags' && (
        <div className="space-y-4">
          {flagged.length === 0 && <p className="text-white/50 bg-white/5 rounded-2xl p-8 text-center">No pending flagged messages.</p>}
          {flagged.map(f => (
            <div key={f.id} className="bg-[#2a1313] border border-red-500/20 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded-sm text-xs font-bold uppercase">{f.severity} RISK</span>
                  <p className="text-white font-medium mt-2">{f.reason}</p>
                </div>
                <span className="text-xs text-white/40">{new Date(f.created_at).toLocaleString()}</span>
              </div>
              
              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <span className="text-white/40 text-xs mb-1 block">Flagged Content:</span>
                <p className="text-white/90 text-sm font-mono">&quot;{f.message?.content}&quot;</p>
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={() => handleAction(f.id, 'WARN')} className="flex-1 bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 py-2 rounded-xl text-sm font-bold transition-colors border border-amber-500/30">
                  Issue Warning
                </button>
                <button onClick={() => handleAction(f.id, 'SUSPEND')} className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30 py-2 rounded-xl text-sm font-bold transition-colors border border-red-500/30">
                  Suspend User
                </button>
                <button onClick={() => handleAction(f.id, 'DISMISS')} className="px-4 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl text-sm font-bold transition-colors border border-white/10">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'all' && (
        <div className="overflow-hidden border border-white/10 rounded-2xl bg-white/5">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-white/50 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Creator</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {threads.map(t => (
                <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-medium text-white">{t.creator?.name || 'Unknown'}</td>
                  <td className="p-4 font-medium text-white">{t.brand?.name || 'Unknown'}</td>
                  <td className="p-4">
                    <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold tracking-wide">{t.status}</span>
                  </td>
                  <td className="p-4 text-center font-bold">₹{t.agreed_amount || 0}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {threads.length === 0 && <div className="p-8 text-center">No threads found.</div>}
        </div>
      )}
    </div>
  );
}

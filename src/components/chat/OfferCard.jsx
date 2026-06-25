import React from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

export default function OfferCard({ message, threadId, onActionComplete }) {
  const { user } = useAuth();
  const offer = message.metadata || {};
  const isMine = message.sender_id === user.user_id;
  const isPending = offer.status === 'PENDING';

  const handleAction = async (action) => {
    try {
      await api.post(`/chat/v2/threads/${threadId}/offer/${offer.id}/${action}`);
      if (onActionComplete) onActionComplete();
    } catch (err) {
      toast.error(err.response?.data?.error || `Failed to ${action} offer`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`my-4 flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div className="bg-[var(--bg-elevated)] backdrop-blur-md border border-[var(--violet)]/30 rounded-2xl p-5 max-w-sm w-full shadow-lg shadow-[var(--violet)]/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2 items-center">
            <span className="bg-[var(--violet)]/20 text-[#D9F111] px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Deal Offer
            </span>
            {offer.status === 'ACCEPTED' && <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">Accepted</span>}
            {offer.status === 'REJECTED' && <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs">Rejected</span>}
          </div>
          <span className="text-[var(--text-tertiary)] text-xs">{new Date(message.created_at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</span>
        </div>

        <div className="text-3xl font-display font-bold text-[var(--text-primary)] mb-4">
          ₹{offer.amount?.toLocaleString()}
        </div>

        <div className="space-y-3 mb-6 bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-default)]">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Deadline</span>
            <span className="text-[var(--text-primary)] font-medium">{offer.deadline ? new Date(offer.deadline).toDateString() : 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--text-secondary)]">Revisions</span>
            <span className="text-[var(--text-primary)] font-medium">{offer.revision_count} included</span>
          </div>
          {offer.deliverables && offer.deliverables.length > 0 && (
            <div className="pt-2 border-t border-[var(--border-default)]">
              <span className="text-[var(--text-secondary)] text-sm block mb-2">Deliverables:</span>
              <ul className="text-sm text-[var(--text-primary)]/90 space-y-1">
                {offer.deliverables.map((item, i) => (
                  <li key={i} className="flex gap-2 items-start"><CheckCircle size={14} className="text-[#D9F111] shrink-0 mt-0.5"/> {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isPending && !isMine && (
          <div className="flex gap-3">
            <button 
              onClick={() => handleAction('accept')}
              className="flex-1 bg-[#D9F111] hover:bg-[#b8cc0e] text-black text-sm font-bold py-2.5 rounded-xl transition-colors"
            >
              Accept
            </button>
            <button 
              onClick={() => handleAction('reject')}
              className="px-4 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] text-sm font-bold py-2.5 rounded-xl transition-colors"
            >
              Reject
            </button>
          </div>
        )}
        
        {isPending && isMine && (
          <div className="text-center text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] py-2.5 rounded-xl border border-[var(--border-default)] flex items-center justify-center gap-2">
            <Clock size={16} /> Waiting for response...
          </div>
        )}
      </div>
    </motion.div>
  );
}

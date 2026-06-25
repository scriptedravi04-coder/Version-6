import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, FileSignature } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function BrandAgreement({ thread, onClose, onSigned }) {
  const [loading, setLoading] = useState(false);
  
  const handleSign = async () => {
    setLoading(true);
    try {
      await api.post(`/chat/v2/threads/${thread.id}/sign`);
      toast.success("Agreement signed digitally");
      onSigned();
      onClose();
    } catch (err) {
      toast.error("Failed to sign agreement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--bg-elevated)]/30">
           <h3 className="text-xl font-display font-bold text-[var(--text-primary)] flex items-center gap-3">
             <FileSignature className="text-[var(--violet)]" /> Digital Agreement
           </h3>
           <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] rounded-full transition-colors"><X size={18}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            By signing this agreement, you (the Brand) commit to the following terms negotiated with the Creator for the campaign.
          </p>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl p-5 space-y-4">
            <div className="flex justify-between border-b border-[var(--border-default)] pb-3">
               <span className="text-[var(--text-secondary)] text-sm">Agreed Amount</span>
               <span className="text-[var(--text-primary)] font-bold">₹{thread.agreed_amount?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border-default)] pb-3">
               <span className="text-[var(--text-secondary)] text-sm">Deadline</span>
               <span className="text-[var(--text-primary)] font-medium">{thread.deadline ? new Date(thread.deadline).toLocaleDateString() : 'TBD'}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border-default)] pb-3">
               <span className="text-[var(--text-secondary)] text-sm">Revisions</span>
               <span className="text-[var(--text-primary)] font-medium">{thread.revision_count || 0}</span>
            </div>
            <div>
               <span className="text-[var(--text-secondary)] text-sm mb-2 block">Deliverables</span>
               <ul className="text-sm text-[var(--text-primary)]/80 space-y-1 list-disc pl-5">
                 {thread.deliverables?.map((d, i) => <li key={i}>{d}</li>) || <li>No deliverables defined</li>}
               </ul>
            </div>
          </div>

          <div className="bg-[var(--violet)]/10 text-[var(--violet)] text-xs p-4 rounded-xl border border-[var(--violet)]/20">
            Payment will trigger automatically once the final content is approved by you. Both parties must sign before the deal becomes ACTIVE.
          </div>
        </div>

        <div className="p-6 border-t border-[var(--border-default)] bg-[var(--bg-elevated)]/30">
           <button 
              onClick={handleSign}
              disabled={loading || thread.agreement_signed_brand}
              className="w-full py-3.5 bg-[var(--violet)] hover:bg-[var(--violet-hover)] disabled:opacity-50 disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-secondary)] text-white font-bold rounded-xl transition-colors"
            >
              {thread.agreement_signed_brand ? 'Already Signed' : (loading ? 'Signing...' : 'Digital Sign & Accept')}
            </button>
        </div>
      </motion.div>
    </div>
  );
}

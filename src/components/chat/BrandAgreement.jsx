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
        className="bg-[#1A1A2E] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
           <h3 className="text-xl font-display font-bold text-white flex items-center gap-3">
             <FileSignature className="text-[#7C3AED]" /> Digital Agreement
           </h3>
           <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={18}/></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-white/70 leading-relaxed">
            By signing this agreement, you (the Brand) commit to the following terms negotiated with the Creator for the campaign.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between border-b border-white/10 pb-3">
               <span className="text-white/50 text-sm">Agreed Amount</span>
               <span className="text-white font-bold">₹{thread.agreed_amount?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-3">
               <span className="text-white/50 text-sm">Deadline</span>
               <span className="text-white font-medium">{thread.deadline ? new Date(thread.deadline).toLocaleDateString() : 'TBD'}</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-3">
               <span className="text-white/50 text-sm">Revisions</span>
               <span className="text-white font-medium">{thread.revision_count || 0}</span>
            </div>
            <div>
               <span className="text-white/50 text-sm mb-2 block">Deliverables</span>
               <ul className="text-sm text-white/80 space-y-1 list-disc pl-5">
                 {thread.deliverables?.map((d, i) => <li key={i}>{d}</li>) || <li>No deliverables defined</li>}
               </ul>
            </div>
          </div>

          <div className="bg-[#7C3AED]/10 text-[#7C3AED] text-xs p-4 rounded-xl border border-[#7C3AED]/20">
            Payment will trigger automatically once the final content is approved by you. Both parties must sign before the deal becomes ACTIVE.
          </div>
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
           <button 
              onClick={handleSign}
              disabled={loading || thread.agreement_signed_brand}
              className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:bg-white/10 disabled:text-white/50 text-white font-bold rounded-xl transition-colors"
            >
              {thread.agreement_signed_brand ? 'Already Signed' : (loading ? 'Signing...' : 'Digital Sign & Accept')}
            </button>
        </div>
      </motion.div>
    </div>
  );
}

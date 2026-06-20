import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Clock } from 'lucide-react';

export default function DealInfoPanel({ thread, onClose, role }) {
  if (!thread) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-80 bg-[#12121A] border-l border-white/5 z-20 flex flex-col"
      >
        <div className="p-5 flex justify-between items-center border-b border-white/5">
          <h3 className="font-bold text-white">Deal Information</h3>
          <button onClick={onClose} className="p-1.5 text-white/40 hover:text-white rounded-full hover:bg-white/10 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          <div className="text-center bg-white/5 border border-white/10 rounded-2xl p-5">
             <div className="text-white/50 text-xs uppercase tracking-wider font-bold mb-2">Agreed Amount</div>
             <div className={`text-4xl font-display font-bold ${role === 'brand' ? 'text-[#7C3AED]' : 'text-[#D9F111]'}`}>
               ₹{thread.agreed_amount?.toLocaleString() || 0}
             </div>
             <div className="mt-3 inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white/70">
               Status: {thread.status}
             </div>
          </div>

          <div>
             <h4 className="text-sm font-bold text-white mb-3">Timeline</h4>
             <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {['NEGOTIATING', 'ACTIVE', 'CONTENT_SUBMITTED', 'APPROVED', 'COMPLETED'].map((step, idx) => {
                  const isActive = thread.status === step;
                  const steps = ['NEGOTIATING', 'ACTIVE', 'CONTENT_SUBMITTED', 'APPROVED', 'COMPLETED'];
                  const isPast = steps.indexOf(thread.status) > idx;

                  return (
                    <div key={step} className="relative flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${isPast || isActive ? (role === 'brand' ? 'bg-[#7C3AED] border-[#7C3AED]' : 'bg-[#D9F111] border-[#D9F111]') : 'bg-[#1A1A2E] border-white/20'} z-10 shrink-0 shadow max-md:ml-[2px]`}>
                         {(isPast || isActive) && <CheckCircle size={12} className={role === 'brand' ? 'text-white' : 'text-black'} />}
                      </div>
                      <div className={`text-xs font-bold ${isActive ? 'text-white' : (isPast ? 'text-white/70' : 'text-white/30')}`}>
                        {step.replace('_', ' ')}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
             <div className="flex justify-between items-center mb-3">
               <span className="text-white/50 text-sm">Deadline</span>
               <span className="text-white font-medium">{thread.deadline ? new Date(thread.deadline).toLocaleDateString() : 'TBD'}</span>
             </div>
             <div className="flex justify-between items-center mb-3">
               <span className="text-white/50 text-sm">Revisions Left</span>
               <span className="text-white font-medium">{thread.revision_count ?? 'N/A'}</span>
             </div>
             <div className="pt-3 border-t border-white/5">
               <span className="text-white/50 text-sm block mb-2">Deliverables</span>
               <ul className="space-y-2">
                 {thread.deliverables?.map((d, i) => (
                   <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                     <CheckCircle size={14} className={role === 'brand' ? 'text-[#7C3AED]' : 'text-[#D9F111]'} />
                     <span>{d}</span>
                   </li>
                 )) || <li className="text-xs text-white/30">No deliverables</li>}
               </ul>
             </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}

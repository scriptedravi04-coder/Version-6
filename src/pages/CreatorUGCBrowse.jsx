import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import { Zap, Tag, Clock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatorUGCBrowse() {
  const [briefs, setBriefs] = useState([]);
  const [selectedBrief, setSelectedBrief] = useState(null);
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    startLoading();
    api.get("/ugc/briefs/available").then(res => {
      setBriefs(res.data);
      stopLoading();
    }).catch(() => stopLoading());
  }, []);

  const handleClaim = async () => {
    if(!selectedBrief) return;
    toast.loading("Claiming brief...", { id: 'claim' });
    try {
      const { data } = await api.post("/ugc/orders/claim", { brief_id: selectedBrief.id });
      toast.success("Order Active! 22 hours remaining.", { id: 'claim' });
      navigate("/creator/ugc/orders");
    } catch(e) {
      toast.error(e.response?.data?.error || "Failed to claim", { id: 'claim' });
    }
  };

  const getPayout = (budget) => {
    const feePercent = budget <= 20000 ? 5 : 2;
    return budget - (budget * feePercent / 100);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-2">Available UGC Briefs</h1>
      <p className="text-gray-400 mb-8 font-medium">Claim a brief to produce original short-form content within 22 hours.</p>

      {briefs.length === 0 ? (
        <div className="text-center py-20 bg-[#0f0f1a] border border-white/10 rounded-3xl">
          <p className="text-gray-400 font-medium">No open briefs right now. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {briefs.map(b => (
            <div key={b.id} onClick={() => setSelectedBrief(b)} className="bg-[#16161e] border border-white/10 hover:border-[#7c3aed]/50 transition-colors rounded-3xl p-6 cursor-pointer flex flex-col group">
               <div className="flex justify-between items-start mb-4">
                 <div className="inline-flex items-center gap-1.5 bg-[#facc15]/10 text-[#facc15] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#facc15]/20">
                    <Zap size={10} /> 22-Hour Brief
                 </div>
                 <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">{b.claimed_count}/{b.max_creators} Claimed</div>
               </div>
               
               <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">"{b.title}"</h3>
               <p className="text-sm text-gray-500 mb-4 line-clamp-1">{b.product_name}</p>

               <div className="flex flex-col gap-2 mt-auto text-xs font-bold uppercase tracking-wider">
                 <div className="flex justify-between">
                   <span className="text-gray-500">Format:</span>
                   <span className="text-white">🎬 {b.deliverable_type?.replace(/_/g," ")} · {b.video_duration || '30s'}</span>
                 </div>
                 <div className="flex justify-between mt-2 pt-2 border-t border-white/5">
                   <span className="text-gray-500">Your Payout:</span>
                   <span className="text-emerald-400 text-lg">₹{getPayout(b.budget).toLocaleString()}</span>
                 </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Modal */}
      <AnimatePresence>
        {selectedBrief && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={()=>setSelectedBrief(null)} />
            <motion.div initial={{scale:0.95, opacity:0, y: 20}} animate={{scale:1, opacity:1, y: 0}} exit={{scale:0.95, opacity:0, y: 20}} className="bg-[#16161e] border border-white/10 rounded-3xl p-6 md:p-8 max-w-lg w-full relative z-10 shadow-2xl">
               <div className="inline-flex items-center gap-1.5 bg-[#facc15]/10 text-[#facc15] px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-[#facc15]/20 mb-4">
                 <Zap size={10} /> 22-Hour Delivery Promise
               </div>
               <h3 className="text-2xl font-black text-white mb-2">{selectedBrief.title}</h3>
               <p className="text-gray-400 text-sm mb-6 pb-6 border-b border-white/10">{selectedBrief.product_description}</p>

               <div className="space-y-4 mb-8">
                 {selectedBrief.detailed_requirements && (
                   <div>
                     <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Detailed Requirements</h4>
                     <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">{selectedBrief.detailed_requirements}</p>
                   </div>
                 )}
                 {selectedBrief.sample_content_url && (
                   <div>
                     <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Sample Reference</h4>
                     <a href={selectedBrief.sample_content_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#9D7CFF] hover:underline underline-offset-4 flex items-center gap-1">
                       View Sample Content
                     </a>
                   </div>
                 )}
                 <div>
                   <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Must Do</h4>
                   <ul className="text-sm text-emerald-400 space-y-1">
                     {selectedBrief.dos?.[0] ? selectedBrief.dos.map((d, i) => <li key={i}>✅ {d}</li>) : <li>No specific requirements</li>}
                   </ul>
                 </div>
                 {selectedBrief.donts?.[0] && (
                   <div>
                     <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Must Not Do</h4>
                     <ul className="text-sm text-[#ef4444] space-y-1">
                       {selectedBrief.donts.map((d, i) => <li key={i}>❌ {d}</li>)}
                     </ul>
                   </div>
                 )}
               </div>

               <div className="bg-[#0f0f1a] border border-[#7c3aed]/30 rounded-xl p-4 mb-6">
                 <p className="text-sm font-medium text-purple-300">By claiming this brief, you commit to delivering the video within exactly 22 hours. Missing the deadline will cancel the order.</p>
                 <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#7c3aed]/20">
                   <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Your Payout</span>
                   <span className="text-emerald-400 font-black text-xl">₹{getPayout(selectedBrief.budget).toLocaleString()}</span>
                 </div>
               </div>

               <div className="flex gap-3">
                 <button onClick={() => setSelectedBrief(null)} className="w-1/3 bg-white/5 text-white font-bold py-3.5 rounded-xl border border-white/10 active:scale-95 transition-transform text-sm">Cancel</button>
                 <button onClick={handleClaim} className="flex-1 bg-[#facc15] hover:bg-[#eab308] text-black font-black uppercase tracking-wider py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg text-sm flex items-center justify-center gap-2">
                   <Zap size={16} /> I Commit — Claim Now
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

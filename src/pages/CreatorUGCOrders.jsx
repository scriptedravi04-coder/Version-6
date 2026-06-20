import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import CreatorCountdown from "../components/ugc/CreatorCountdown";
import { toast } from "sonner";
import { Upload, Link as LinkIcon, CheckCircle, AlertTriangle, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreatorUGCOrders() {
  const [orders, setOrders] = useState([]);
  const [submitModal, setSubmitModal] = useState(null);
  const [file, setFile] = useState(null);
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  const loadData = () => {
    startLoading();
    api.get("/ugc/orders/creator").then(res => {
      setOrders(res.data);
      stopLoading();
    }).catch(() => stopLoading());
  };

  useEffect(() => {
    loadData();
    const t = setInterval(loadData, 60000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async () => {
    if(!submitModal) return;
    toast.loading("Uploading delivery...", { id: 'dev' });
    try {
      await api.post(`/ugc/orders/${submitModal}/deliver`, { 
        video_url: "https://example.com/delivered_video.mp4",
        creator_notes: ""
      });
      toast.success("Delivered successfully! Brand will review within 24h.", { id: 'dev' });
      setSubmitModal(null);
      loadData();
    } catch(e) {
      toast.error("Failed to submit", { id: 'dev' });
    }
  };

  if (orders.length === 0) {
     return (
       <div className="max-w-4xl mx-auto px-4 py-8">
         <h1 className="text-3xl font-black text-white mb-8">My UGC Orders</h1>
         <div className="text-center py-20 bg-[#16161e] border border-white/10 rounded-3xl">
           <p className="text-gray-400 font-medium">No active UGC orders.</p>
         </div>
       </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-2">My UGC Orders</h1>
      <p className="text-gray-400 mb-8 font-medium">Upload deliverables before your timer runs out.</p>

      <div className="space-y-6">
        {orders.map(o => (
           <div key={o.id} className="bg-[#16161e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
              {o.creator_status === 'CLAIMED' && (
                <div className="bg-[#0f0f1a] border-b border-white/5 py-4 flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Internal Deadline Timer</span>
                  <CreatorCountdown internalDeadline={o.internal_deadline} />
                </div>
              )}

              {o.creator_status === 'REVISION_REQUESTED' && (
                <div className="bg-[#facc15]/10 border-b border-[#facc15]/20 py-6 px-8">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-[#facc15] shrink-0 mt-0.5" size={20}/>
                    <div>
                      <h3 className="text-[#facc15] font-bold uppercase tracking-widest text-xs mb-1">Revision Requested (1/1)</h3>
                      <p className="text-[#facc15]/80 text-sm font-medium mb-4">Brand Feedback: "{o.revision_note}"</p>
                      <CreatorCountdown internalDeadline={o.internal_deadline} />
                    </div>
                  </div>
                </div>
              )}

              {o.creator_status === 'DELIVERED' && o.brand_status !== 'COMPLETED' && (
                <div className="bg-blue-500/10 border-b border-blue-500/20 py-4 px-8 flex items-center gap-3">
                  <Clock className="text-blue-400" size={18}/>
                  <span className="text-blue-400 font-bold text-sm tracking-wide">Delivered! Waiting for brand approval.</span>
                </div>
              )}

              {o.brand_status === 'COMPLETED' && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-4 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-emerald-400" size={18}/>
                    <span className="text-emerald-400 font-bold text-sm tracking-wide">COMPLETED — Payout Received!</span>
                  </div>
                  <span className="text-emerald-400 font-black text-xl">₹{o.creator_payout.toLocaleString()}</span>
                </div>
              )}

              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-1">{o.brief?.title || "UGC Order"}</h2>
                  <p className="text-sm text-gray-400 mb-6">{o.brief?.product_name}</p>

                  <div className="space-y-4 mb-8">
                    {o.brief?.detailed_requirements && (
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Detailed Requirements</h4>
                        <p className="text-sm text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">{o.brief.detailed_requirements}</p>
                      </div>
                    )}
                    {o.brief?.sample_content_url && (
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Sample Reference</h4>
                        <a href={o.brief.sample_content_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#9D7CFF] hover:underline flex items-center gap-1">
                          View Sample Content
                        </a>
                      </div>
                    )}
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Must Do</h4>
                      <ul className="text-sm text-emerald-400/80 space-y-1">
                        {o.brief?.dos?.map((d,i) => <li key={i}>✅ {d}</li>)}
                      </ul>
                    </div>
                    {o.brief?.donts?.[0] && (
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Must Not Do</h4>
                        <ul className="text-sm text-[#ef4444]/80 space-y-1">
                          {o.brief?.donts.map((d,i) => <li key={i}>❌ {d}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {o.brand_status !== 'COMPLETED' && (
                    <div className="flex justify-between items-center bg-[#0f0f1a] p-4 rounded-xl border border-white/5">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Payout on Approval</span>
                      <span className="text-emerald-400 font-black text-lg">₹{o.creator_payout.toLocaleString()}</span>
                    </div>
                  )}

                </div>
                
                <div className="md:w-64 flex flex-col justify-end gap-3">
                  <button onClick={() => navigate(`/chat/${o.brief?.brand_id || o.brand_id}`)} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider py-4 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/10">
                    <MessageCircle size={18}/> Message Brand
                  </button>
                  {(o.creator_status === 'CLAIMED' || o.creator_status === 'REVISION_REQUESTED') && (
                    <button onClick={() => setSubmitModal(o.id)} className="w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold uppercase tracking-wider py-4 rounded-xl active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                      <Upload size={18}/> Submit Video
                    </button>
                  )}
                </div>
              </div>
           </div>
        ))}
      </div>

      <AnimatePresence>
        {submitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSubmitModal(null)} />
            <motion.div initial={{scale:0.95, opacity:0, y: 20}} animate={{scale:1, opacity:1, y: 0}} exit={{scale:0.95, opacity:0, y: 20}} className="bg-[#16161e] border border-white/10 rounded-3xl p-6 max-w-md w-full relative z-10 shadow-2xl">
               <h3 className="text-xl font-black text-white mb-6">Submit Deliverable</h3>
               
               <div className="border border-dashed border-white/20 rounded-2xl p-8 mb-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer" onClick={() => document.getElementById('vid-upload').click()}>
                 <div className="w-12 h-12 bg-[#7c3aed]/20 rounded-full flex items-center justify-center text-[#7c3aed] mb-3">
                   <Upload size={20} />
                 </div>
                 <p className="text-sm font-bold text-white mb-1">{file ? file.name : "Click to select MP4/MOV"}</p>
                 <p className="text-xs text-gray-500 font-medium">Max 500MB</p>
                 <input type="file" id="vid-upload" className="hidden" accept="video/mp4,video/quicktime" onChange={(e) => setFile(e.target.files[0])} />
               </div>

               <div className="relative mb-8">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                 <div className="relative flex justify-center text-sm"><span className="bg-[#16161e] px-2 text-gray-500 font-bold uppercase tracking-widest text-[10px]">OR</span></div>
               </div>

               <div className="mb-8">
                 <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><LinkIcon size={12}/> Drive / Dropbox Link</label>
                 <input type="url" className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7c3aed] transition-colors outline-none" placeholder="https://" />
               </div>

               <div className="flex gap-3">
                 <button onClick={() => setSubmitModal(null)} className="flex-1 bg-white/5 text-white font-bold py-3.5 rounded-xl border border-white/10 active:scale-95 transition-transform text-sm">Cancel</button>
                 <button onClick={handleSubmit} className="flex-1 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg text-sm">Submit Video</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import { Plus, PlayCircle, Clock, CheckCircle, Pause } from "lucide-react";

export default function BrandUGCBriefs() {
  const [briefs, setBriefs] = useState([]);
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    startLoading();
    api.get("/ugc/briefs/my").then(res => {
      setBriefs(res.data);
      stopLoading();
    }).catch(() => stopLoading());
  }, []);

  const stats = {
    total: briefs.length,
    open: briefs.filter(b => b.status === 'OPEN').length,
    progress: briefs.filter(b => b.status === 'IN_PROGRESS').length,
    completed: briefs.filter(b => b.status === 'COMPLETED').length
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">My UGC Briefs</h1>
          <p className="text-gray-400 mt-1">Manage your active product UGC requests</p>
        </div>
        <button 
          onClick={() => navigate("/brand/ugc/post")}
          className="bg-[#facc15] hover:bg-[#eab308] text-black font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-transform active:scale-95"
        >
          <Plus size={16} /> Post New UGC Brief
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total", val: stats.total, color: "text-white" },
          { label: "Open", val: stats.open, color: "text-[#facc15]" },
          { label: "In Progress", val: stats.progress, color: "text-blue-400" },
          { label: "Completed", val: stats.completed, color: "text-emerald-400" }
        ].map(s => (
          <div key={s.label} className="bg-[#16161e] border border-white/10 rounded-2xl p-4">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{s.label}</span>
            <div className={`text-2xl font-black mt-1 ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {briefs.length === 0 ? (
          <div className="text-center py-20 bg-[#16161e] border border-white/10 rounded-3xl">
            <h3 className="text-xl font-bold text-white mb-2">No briefs yet</h3>
            <p className="text-gray-400 mb-6 font-medium">Post a brief to get original creator videos within 24 hours.</p>
            <button onClick={() => navigate("/brand/ugc/post")} className="bg-white/10 text-white font-bold px-6 py-2 rounded-lg text-sm border border-white/20">Create Brief</button>
          </div>
        ) : briefs.map(b => (
          <div key={b.id} className="bg-[#16161e] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-20 h-20 rounded-xl bg-gray-800 flex-shrink-0 border border-white/10 overflow-hidden">
               {b.product_image_url ? (
                 <img src={b.product_image_url} alt="" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold uppercase text-xs">{b.product_name?.slice(0,2)}</div>
               )}
            </div>
            
            <div className="flex-1 min-w-0">
               <h3 className="text-lg font-bold text-white truncate mb-1">"{b.title}"</h3>
               <p className="text-sm text-gray-400 truncate mb-2">Product: {b.product_name}</p>
               <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                 <span className="bg-[#7c3aed]/10 text-purple-400 px-2.5 py-1 rounded-md border border-[#7c3aed]/20">
                    🎬 {b.deliverable_type?.replace(/_/g," ")} · {b.video_duration || '30s'}
                 </span>
                 <span className="bg-white/5 text-gray-300 px-2.5 py-1 rounded-md border border-white/10">
                    ₹{b.budget} · {b.claimed_count}/{b.max_creators} claimed
                 </span>
               </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[140px]">
              <div className="text-xs font-bold tracking-widest uppercase flex items-center justify-end gap-1.5 text-gray-400 mb-1">
                 {b.status === 'OPEN' && <span className="text-[#facc15] flex items-center gap-1"><Clock size={12}/> OPEN</span>}
                 {b.status === 'IN_PROGRESS' && <span className="text-blue-400 flex items-center gap-1"><PlayCircle size={12}/> IN_PROGRESS</span>}
                 {b.status === 'COMPLETED' && <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={12}/> COMPLETED</span>}
              </div>
              <div className="flex gap-2">
                 <button onClick={() => navigate("/brand/ugc/orders")} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold py-2 rounded-lg transition-colors">Orders</button>
                 <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold py-2 rounded-lg transition-colors">Pause</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

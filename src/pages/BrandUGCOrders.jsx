import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import { Zap, Play, Target, CheckCircle2, Search, Video, Box, Crown } from "lucide-react";

const getStageDetails = (createdAt) => {
  const elapsedMs = Date.now() - new Date(createdAt).getTime();
  const elapsedMins = elapsedMs / (1000 * 60);
  const elapsedHours = elapsedMins / 60;

  if (elapsedMins < 5) return { stage: "AI Scanning Creator Attributes...", progress: 5, statusColor: "text-blue-500", glow: "from-blue-500" };
  if (elapsedMins < 15) return { stage: "Briefing & Script Analysis", progress: 12, statusColor: "text-[#7c3aed]", glow: "from-[#7c3aed]" };
  if (elapsedHours < 2) return { stage: "Talent Shortlisting & Assignment", progress: 25, statusColor: "text-emerald-500", glow: "from-emerald-500" };
  if (elapsedHours < 10) return { stage: "Production Setup & Shoot Preparation", progress: 40, statusColor: "text-orange-500", glow: "from-orange-500" };
  if (elapsedHours < 18) return { stage: "Principal Photography & Filming", progress: 65, statusColor: "text-[#facc15]", glow: "from-[#facc15]" };
  if (elapsedHours < 22) return { stage: "Editing, Grading & Audio Post", progress: 85, statusColor: "text-pink-500", glow: "from-pink-500" };
  if (elapsedHours < 24) return { stage: "Final Quality Assessment Check", progress: 95, statusColor: "text-indigo-500", glow: "from-indigo-500" };
  
  return { stage: "Awaiting Final Delivery", progress: 99, statusColor: "text-green-500", glow: "from-green-500" };
};

export default function BrandUGCOrders() {
  const [briefs, setBriefs] = useState([]);
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  const loadData = () => {
    startLoading();
    // Fetch briefs for tracking
    api.get("/ugc/briefs/my").then(res => {
      // Filter out completed ones, we only want active tracking
      setBriefs(res.data.filter(b => b.status !== "COMPLETED"));
      stopLoading();
    }).catch(() => stopLoading());
  };

  useEffect(() => {
    loadData();
    const intv = setInterval(loadData, 30000);
    return () => clearInterval(intv);
  }, []);

  if(briefs.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-white mb-8 tracking-tight">Live Orders Tracking</h1>
        <div className="text-center py-32 bg-[#0A0A0F] border border-white/10 rounded-[2.5rem] shadow-2xl">
          <Box size={48} className="mx-auto mb-6 text-white/20" />
          <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No Active Orders</h3>
          <p className="text-white/50 font-medium">Post a brief to get original creator videos within 24 hours.</p>
          <button 
            onClick={() => navigate("/brand/ugc/post")}
            className="mt-8 bg-white text-black hover:bg-gray-200 font-bold px-8 py-3.5 rounded-full text-sm transition-all shadow-xl active:scale-95"
          >
            Post New Brief
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[200px] bg-[#7c3aed]/20 blur-[100px] pointer-events-none rounded-full" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 relative z-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Live Orders Tracking</h1>
          <p className="text-white/50 mt-2 font-medium">Real-time production tracking with 24-hour SLA</p>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        {briefs.map(brief => {
          const { stage, progress, statusColor, glow } = getStageDetails(brief.created_at);
          const isFullyClaimed = brief.claimed_creators_count >= brief.max_creators;

          return (
             <div key={brief.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent blur-xl rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative bg-[#12121A] rounded-[2.5rem] overflow-hidden border border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                   
                   {/* Top Half (Lightened dark for contrast) */}
                   <div className="bg-[#1A1A24] p-6 lg:p-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[50px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                     
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c3aed]/20 to-[#3B82F6]/20 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                              <Video size={24} className="text-white/80" />
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[#12121A] border border-white/10 flex items-center gap-1.5`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Active
                                </span>
                              </div>
                              <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">{brief.title || "UGC Campaign"}</h2>
                           </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                           <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1 shadow-sm">Budget</span>
                           <span className="text-lg font-black text-white bg-[#12121A] px-3 py-1 rounded-xl border border-white/5">₹{brief.budget?.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                        <p className="text-sm font-medium text-white/50">{brief.product_name}</p>
                        <span className="bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg">
                           {brief.claimed_creators_count || 0} / {brief.max_creators || 1} CLAIMED
                        </span>
                     </div>
                   </div>

                   {/* Bottom Half (Darkest) */}
                   <div className="bg-[#0A0A0F] p-6 lg:p-8">
                     <div className="flex justify-between items-end mb-4">
                        <div>
                           <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1.5">Production Progress</p>
                           <div className="flex items-center gap-3">
                              <span className="text-4xl font-display font-black tracking-tight text-white">{progress}%</span>
                              <div className={`px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold tracking-wider ${statusColor} animate-pulse`}>
                                 {stage}
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/40 text-xs font-bold uppercase tracking-wider">
                           Fast Delivery <Zap size={14} className="text-[#facc15]" />
                        </div>
                     </div>

                     {/* The Slider / Progress Bar */}
                     <div className="relative mt-8 mb-4">
                        <div className="absolute inset-0 bg-white/5 rounded-full h-2" />
                        <div 
                          className={`absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r ${glow} to-white shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-1000`} 
                          style={{ width: `${progress}%` }} 
                        />
                        {/* Thumb */}
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#12121A] border-4 border-[#12121A] shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center transition-all duration-1000 z-10"
                          style={{ left: `calc(${progress}% - 16px)` }}
                        >
                           <div className={`w-full h-full rounded-full bg-gradient-to-br ${glow} to-white animate-pulse`} />
                        </div>
                     </div>
                   </div>
                </div>
             </div>
          );
        })}
      </div>
    </div>
  );
}

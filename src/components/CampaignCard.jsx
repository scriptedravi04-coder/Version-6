import React from "react";
import { ChevronRight, Calendar, Users2, ShieldCheck, AlertCircle } from "lucide-react";

export default function CampaignCard({ campaign, onManage, onEdit, onSubmit }) {
  const getStatusBadgeStyle = (status) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "LIVE":
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
      case "DRAFT":
        return "bg-white/5 text-white/40 border border-white/10";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      default:
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    }
  };

  const c = campaign;
  const isLive = (c.status || "").toLowerCase() === "live" || (c.status || "").toLowerCase() === "approved";
  const isDraft = (c.status || "").toLowerCase() === "draft" || !c.status;

  // Format platforms beautifully
  const platformsList = c.platforms || [];
  const platformsStr = platformsList.length > 0 ? platformsList.join(", ") : "Instagram";

  return (
    <div className="relative group cursor-pointer h-full" onClick={() => !isDraft && onManage && onManage(c)}>
      <div className="absolute inset-0 bg-gradient-to-b from-[#7C5CFF]/10 to-transparent blur-[30px] rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="relative h-full min-h-[380px] bg-[#12121A] rounded-[2rem] overflow-hidden border border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col transition-transform duration-300 group-hover:-translate-y-1">
         {/* Top Half */}
         <div className="bg-[#1A1A24] p-6 relative overflow-hidden flex-shrink-0 border-b border-white/[0.02]">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C5CFF]/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
           
           <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#3B82F6]/20 border border-[#7C5CFF]/30 flex items-center justify-center shrink-0 shadow-inner">
                 <Video size={20} className="text-white/80" />
              </div>

              <div className="flex flex-col items-end">
                 <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5 drop-shadow-sm">Estimated Budget</span>
                 <span className="text-sm font-black text-white bg-black/40 px-3 py-1 rounded-xl border border-white/5 shadow-inner whitespace-nowrap">₹{(c.budget_min || 10000).toLocaleString("en-IN")} - {(c.budget_max || 15000).toLocaleString("en-IN")}</span>
              </div>
           </div>

           <div className="mb-2">
              <div className="flex items-center gap-2 mb-2">
                 <div className="flex bg-[#12121A] px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
                    <div className="text-[9px] font-bold tracking-widest uppercase flex items-center gap-1.5 text-white/70">
                       <span className={`px-1 rounded-md ${getStatusBadgeStyle(c.status || "live")}`}>{c.status || "live"}</span>
                    </div>
                 </div>
                 <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">{platformsStr}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight line-clamp-2 min-h-[56px]">{c.title || "Brand Campaign"}</h2>
           </div>

         </div>

         {/* Bottom Half */}
         <div className="bg-[#0A0A0F] p-6 flex-1 flex flex-col justify-end">
           <div>
              {isDraft ? (
                 <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3 text-left mb-4">
                   <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1">
                     <AlertCircle size={11} /> Draft Briefing
                   </span>
                   <p className="text-[11px] text-white/50 mt-1 leading-relaxed">
                     Created but not submitted for verification yet. Click launch to start.
                   </p>
                 </div>
              ) : (
                 <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                       <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mb-1">Applicants</p>
                       <div className="flex items-center justify-center gap-2">
                          <Users2 size={14} className="text-[#9D7CFF]" />
                          <span className="text-2xl font-display font-black tracking-tight text-white">{c.applicants?.length || 0}</span>
                       </div>
                    </div>
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 text-center">
                       <p className="text-[9px] text-emerald-400/50 font-bold uppercase tracking-widest mb-1">Deals</p>
                       <div className="flex items-center justify-center gap-2">
                          <ShieldCheck size={14} className="text-emerald-400" />
                          <span className="text-2xl font-display font-black tracking-tight text-white">{c.deals?.length || 0}</span>
                       </div>
                    </div>
                 </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-white/30 font-bold uppercase tracking-wider mt-4 border-t border-white/5 pt-4 mb-4">
                 <span className="flex items-center gap-1.5"><Calendar size={12} className="text-white/30"/> Deadline:</span>
                 <span className="text-white">{c.deadline || "Jun 30, 2026"}</span>
              </div>

              <div className="flex gap-3">
                 {isDraft ? (
                    <>
                       <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(c); }} className="flex-1 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white text-xs font-bold py-3 rounded-xl transition-colors">Edit</button>
                       <button onClick={(e) => { e.stopPropagation(); onSubmit && onSubmit(c); }} className="flex-[1.5] bg-[#7C5CFF] hover:bg-[#6B4AFF] text-white text-xs font-bold py-3 rounded-xl transition-colors shadow-lg">Launch</button>
                    </>
                 ) : (
                    <>
                       <button onClick={(e) => { e.stopPropagation(); onManage && onManage(c); }} className="flex-1 bg-[#1A1A24] hover:bg-[#252530] text-white/50 hover:text-white/80 text-xs font-bold py-3 rounded-xl transition-colors">View Details</button>
                       <button onClick={(e) => { e.stopPropagation(); onManage && onManage(c); }} className="flex-[1.5] flex items-center justify-center gap-1 bg-[#7c3aed]/20 text-[#a98eff] hover:bg-[#7c3aed]/30 border border-[#7c3aed]/30 text-xs font-bold py-3 rounded-xl transition-colors">Manage <ChevronRight size={14}/></button>
                    </>
                 )}
              </div>
           </div>
         </div>
      </div>
    </div>
  );
}

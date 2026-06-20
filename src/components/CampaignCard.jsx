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
    <div className="group flex flex-col justify-between bg-[#131224]/70 hover:bg-[#15142a] border border-white/5 hover:border-[#7C5CFF]/40 rounded-2xl p-6 shadow-md transition-all duration-300 hover:-translate-y-1 h-full relative overflow-hidden min-h-[380px] hover:shadow-[0_12px_36px_-12px_rgba(124,92,255,0.25)]">
      {/* Background radial glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7C5CFF]/5 to-transparent rounded-full filter blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        {/* Top bar: Platform tags and status badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="text-[10px] uppercase font-black tracking-wider text-white/50 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md">
            {platformsStr}
          </span>
          <span className={`px-2.5 py-1 text-[10px] uppercase font-black rounded-lg tracking-wider ${getStatusBadgeStyle(c.status || "live")}`}>
            {c.status || "live"}
          </span>
        </div>

        {/* Niche Tag */}
        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold text-[#9D7CFF] bg-[#7C5CFF]/10 uppercase tracking-widest border border-[#7C5CFF]/15 mb-3">
          {c.category || "All Niches"}
        </span>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug group-hover:text-[#a98eff] transition-colors mt-1 mb-4 line-clamp-2 min-h-[50px] flex items-start gap-2">
          {c.title}
          {isLive && (
            <span className="flex h-2 w-2 relative mt-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
        </h3>

        {/* Budget Bento Box */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 mb-4">
          <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1">Estimated Budget</div>
          <div className="text-base font-extrabold text-[#D9F111] font-mono">
            ₹{(c.budget_min || 10000).toLocaleString("en-IN")} <span className="text-white/30 font-sans font-normal text-xs mx-0.5">–</span> ₹{(c.budget_max || 15000).toLocaleString("en-IN")}
          </div>
        </div>

        {/* Stats Section or Draft Status Info */}
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
            <div className="bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] p-2.5 rounded-xl text-center transition-all flex flex-col items-center justify-center">
              <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-0.5 font-sans">Applicants</span>
              <div className="flex items-center gap-1.5 mt-1 justify-center">
                <Users2 size={13} className="text-[#9D7CFF]" />
                <span className="text-white text-base font-black font-mono leading-none">{c.applicants?.length || 0}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl text-center transition-all flex flex-col items-center justify-center bg-emerald-500/5 border border-emerald-500/10">
              <span className="text-[9px] uppercase tracking-wider text-white/40 font-bold mb-0.5 font-sans">Deals</span>
              <div className="flex items-center gap-1.5 mt-1 justify-center">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span className="text-white text-base font-black font-mono leading-none">{c.deals?.length || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer & Actions */}
      <div className="mt-auto space-y-4 pt-1">
        {/* Deadline details */}
        <div className="flex items-center justify-between text-[11px] font-medium text-white/40 font-mono pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-white/30" />
            <span>Deadline:</span>
          </div>
          <span className="text-white font-bold">{c.deadline || "Jun 30, 2026"}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-1 w-full">
          {isDraft ? (
            <>
              <button
                onClick={() => onEdit && onEdit(c)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/5 text-white/80 active:scale-95 transition-all text-center cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => onSubmit && onSubmit(c)}
                className="flex-[1.5] py-2.5 rounded-xl text-xs font-bold bg-[#7C5CFF] hover:bg-[#6B4AFF] text-white active:scale-95 shadow-md shadow-[#7C5CFF]/15 transition-all text-center cursor-pointer"
              >
                Launch Draft
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onManage && onManage(c)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-white/10 hover:bg-white/5 hover:text-white text-white/70 active:scale-95 transition-all text-center cursor-pointer"
              >
                View Brief
              </button>
              <button
                onClick={() => onManage && onManage(c)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#7C5CFF]/15 text-[#9D7CFF] hover:bg-[#7C5CFF]/25 border border-[#7C5CFF]/30 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Manage <ChevronRight size={13} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

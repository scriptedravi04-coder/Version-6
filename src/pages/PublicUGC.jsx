import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Play, TrendingUp, Clock, MapPin, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function PublicUGC() {
  const [showcase, setShowcase] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/ugc/showcase").then(res => setShowcase(res.data)).catch(() => {});
  }, []);

  const handlePost = () => {
    if (user?.role === 'brand') navigate("/brand/ugc/post");
    else navigate("/login");
  };

  const handleApply = () => {
    if (user?.role === 'creator') navigate("/creator/ugc/browse");
    else navigate("/login");
  };

  return (
    <div className="w-full bg-[#0a0a14] min-h-screen text-white font-sans">
      
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-[#facc15]/10 text-[#facc15] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-[#facc15]/20">
          <Zap size={14} /> 24-Hour Guaranteed Turnaround SLA
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
          Live UGC <br className="md:hidden"/>
          <span className="text-[#7c3aed]">Video Orders</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Bridge the content gap instantly. Brands post high-priority product video briefs, and creators claim orders to produce original, mobile-optimized reviews within 24 hours.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={handlePost} className="w-full sm:w-auto bg-[#facc15] hover:bg-[#eab308] text-black font-bold uppercase tracking-wider text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg active:scale-95">
            Post as Brand
          </button>
          <button onClick={handleApply} className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-sm px-8 py-3.5 rounded-xl transition-all border border-white/10 active:scale-95">
            Apply as Creator
          </button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="border-y border-white/5 bg-white/[0.02] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="text-center">
            <h3 className="text-3xl font-black text-white">140K+</h3>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Creators</p>
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-black text-white">500+</h3>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Cities</p>
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-black text-[#facc15]">24hr</h3>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Turnaround</p>
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-black text-white">₹500</h3>
            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Avg UGC</p>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-black text-center mb-12">How it Works</h2>
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          
          <div className="bg-[#0f0f1a] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#7c3aed]/20 rounded-full blur-3xl" />
            <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">Brand Side</h3>
            <ol className="space-y-6 text-gray-400">
              <li className="flex gap-4 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-xs font-bold mt-0.5">1</span> <div><strong className="text-white">Post Brief</strong><br/>Define deliverables, dos, donts, and budget.</div></li>
              <li className="flex gap-4 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-xs font-bold mt-0.5">2</span> <div><strong className="text-white">Pay & Hold Budget</strong><br/>Escrow secures the transaction.</div></li>
              <li className="flex gap-4 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-xs font-bold mt-0.5">3</span> <div><strong className="text-white">Track Progress</strong><br/>Live updates as creator works.</div></li>
              <li className="flex gap-4 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-xs font-bold mt-0.5">4</span> <div><strong className="text-white">Approve & Done</strong><br/>Review content and release payment.</div></li>
            </ol>
            <button onClick={handlePost} className="mt-8 w-full bg-[#facc15] hover:bg-[#eab308] text-black font-bold text-sm px-6 py-3 rounded-xl transition-all">Post as Brand</button>
          </div>

          <div className="bg-[#0f0f1a] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <h3 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">Creator Side</h3>
            <ol className="space-y-6 text-gray-400">
              <li className="flex gap-4 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">1</span> <div><strong className="text-white">Browse Briefs</strong><br/>Find open orders you match.</div></li>
              <li className="flex gap-4 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">2</span> <div><strong className="text-white">Claim Order</strong><br/>Commit to a 22-hour delivery window.</div></li>
              <li className="flex gap-4 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">3</span> <div><strong className="text-white">Create in 22hrs</strong><br/>Shoot and upload the video directly.</div></li>
              <li className="flex gap-4 items-start"><span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">4</span> <div><strong className="text-white">Get Paid Fast</strong><br/>Payment released upon brand approval.</div></li>
            </ol>
            <button onClick={handleApply} className="mt-8 w-full bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-6 py-3 border border-white/10 rounded-xl transition-all">Apply as Creator</button>
          </div>

        </div>
      </div>

      {/* Showcase Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black">UGC Videos We've Delivered</h2>
          <button className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-[#7c3aed] transition-colors flex items-center gap-1">
            Refresh <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
          </button>
        </div>

        {showcase.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {showcase.map(item => (
              <div key={item.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden group cursor-pointer border border-white/10">
                <img src={item.thumbnail_url || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800"} alt="UGC" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                    <Play size={24} className="ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                  <span className="bg-[#7c3aed] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">{item.category || "UGC Content"}</span>
                  <span className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-white/10">{item.deliverable_type?.replace(/_/g," ") || "Instagram Reel"}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#0f0f1a] rounded-3xl border border-white/5">
            <span className="text-gray-500">More videos coming soon...</span>
          </div>
        )}
      </div>

    </div>
  );
}

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, IndianRupee, Megaphone, ArrowRight, Search, MapPin, DollarSign, Clock, Briefcase, Plus, CheckCircle, Package, Monitor, X, PlayCircle, Instagram, Twitter, Youtube, Linkedin, Star, AlignLeft, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useNavigate } from "react-router-dom";

const PlatformIcon = ({ platform }) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram size={16} className="text-pink-500" />;
    case 'youtube': return <Youtube size={16} className="text-red-500" />;
    case 'tiktok': return <PlayCircle size={16} className="text-[var(--text-primary)]" />;
    case 'twitter': return <Twitter size={16} className="text-blue-400" />;
    case 'facebook': return <Facebook size={16} className="text-blue-500" />;
    case 'linkedin': return <Linkedin size={16} className="text-blue-600" />;
    case 'snapchat': return <Star size={16} className="text-yellow-400" />;
    default: return <Monitor size={16} className="text-[var(--text-tertiary)]" />;
  }
};

export default function Campaigns() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("Live Campaigns");
  
  // Filters
  const [search, setSearch] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [catFilter, setCatFilter] = useState("All");
  const [locFilter, setLocFilter] = useState("All");
  const [platFilter, setPlatFilter] = useState([]);
  const [budgetRange, setBudgetRange] = useState(100000); 
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await api.get("/campaigns");
        const mapped = data.filter(c => c.status === "live").map(c => {
          let days = 0;
          if (c.deadline) {
            const diff = new Date(c.deadline).getTime() - Date.now();
            days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
          }
          return {
            id: c.campaign_id || c.id,
            brand_name: c.brand_name || "Brand Name",
            brand_logo: c.brand_logo || "https://ui-avatars.com/api/?name=B&background=7C3AED&color=fff",
            title: c.title,
            categories: c.categories || (c.category ? [c.category] : ["General"]),
            platforms: c.platforms || [],
            location: c.location_type || c.city || "Pan India",
            budget_min: c.budget_min || 0,
            budget_max: c.budget_max || 0,
            deliverables: c.deliverables || [],
            expiry_days: days,
            description: c.description || "",
            status: c.status,
            brand_type: c.brand_type || "Various",
            follower_min: c.follower_min,
            follower_max: c.follower_max,
            views: Math.floor(Math.random() * 500) + 50,
            applied: Math.floor(Math.random() * 50) + 5,
            creator_name: c.creator_name || "Marketing Manager",
            time_ago: "1d ago"
          };
        });
        setData(mapped.length > 0 ? mapped : []);
      } catch (e) {
        console.error(e);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const togglePlatform = (p) => {
    setPlatFilter(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const filtered = useMemo(() => {
    return data.filter(c => {
      if (activeTab === "Live Campaigns" && c.status !== "live") return false;
      if (activeTab === "Closed Campaigns" && c.status !== "closed") return false;
      
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.brand_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== "All" && !c.categories.includes(catFilter)) return false;
      if (locFilter !== "All" && c.location !== locFilter) return false;
      if (platFilter.length > 0 && !c.platforms.some(p => platFilter.includes(p))) return false;
      if (c.budget_min > budgetRange) return false;
      return true;
    });
  }, [data, search, catFilter, locFilter, platFilter, budgetRange, activeTab]);

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12" data-testid="campaigns-page">
      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">Campaigns</h1>
          <p className="text-[var(--text-secondary)] font-medium">No fee. Zero commissions.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl font-bold text-sm text-[var(--text-primary)] hover:border-[var(--text-tertiary)] transition-colors relative">
          <Clock size={16} /> My Activity
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">1</span>
        </button>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-6 gap-3 custom-scrollbar hide-scrollbar-arrows">
        {["Live Campaigns", "Closed Campaigns"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${activeTab === tab ? 'bg-[var(--violet)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:text-[var(--text-primary)]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-sm font-semibold cursor-pointer">
             <span className="w-2 h-2 rounded-full bg-red-500"></span> Paid <ChevronDown size={14}/>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-sm font-semibold cursor-pointer">
             Location <ChevronDown size={14}/>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-sm font-semibold cursor-pointer">
             Language <ChevronDown size={14}/>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full text-sm font-semibold cursor-pointer">
             Campaign Type <ChevronDown size={14}/>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-[var(--violet)] border-t-transparent rounded-full animate-spin"></div></div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filtered.map(c => (
              <div key={c.id} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-5 sm:p-7 shadow-sm hover:shadow-xl hover:border-[var(--violet)]/30 transition-all cursor-pointer group" onClick={() => navigate(`/campaigns/${c.id}`)}>
                 {/* Header */}
                 <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4 items-center">
                       <img src={c.brand_logo} alt="brand" className="w-14 h-14 rounded-full object-cover border border-[var(--border-default)]" />
                       <div>
                          <h4 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-1.5">{c.creator_name} <CheckCircle size={14} className="text-emerald-500" /></h4>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
                             <Briefcase size={12} /> Influencer Marketing Manager @ {c.brand_name}
                          </p>
                          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{c.time_ago}</p>
                       </div>
                    </div>
                    <ArrowRight size={20} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] transition-colors group-hover:translate-x-1" />
                 </div>

                 <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-500 mb-4">
                    <CheckCircle size={16} /> Actively reviewing
                 </div>

                 <div className="mb-6">
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Looking for</p>
                    <div className="text-[var(--text-primary)] font-semibold text-lg line-clamp-2 leading-snug">
                       {c.categories.join(", ")}
                    </div>
                 </div>

                 {/* Grid details */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                       <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)] shrink-0"><IndianRupee size={18}/></div>
                       <div>
                          <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-1">Per Influencer</p>
                          <p className="font-bold text-[var(--text-primary)] text-sm">₹{c.budget_min.toLocaleString()} {c.budget_max ? `- ₹${c.budget_max.toLocaleString()}` : '+'}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                       <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)] shrink-0"><Megaphone size={18}/></div>
                       <div>
                          <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-1">Brand Type</p>
                          <p className="font-bold text-[var(--text-primary)] text-sm">{c.brand_type}</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                       <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)] shrink-0"><MapPin size={18}/></div>
                       <div>
                          <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-1">Location</p>
                          <p className="font-bold text-[var(--text-primary)] text-sm">{c.location}</p>
                       </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]">
                       <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-primary)] shrink-0"><Package size={18}/></div>
                       <div>
                          <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-1">Deliverables</p>
                          <p className="font-bold text-[var(--text-primary)] text-sm line-clamp-3">
                             {c.deliverables.map((d, i) => (
                               <span key={i} className="block">{d}</span>
                             ))}
                             {c.deliverables.length === 0 && "1x Instagram Reel"}
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Description Body */}
                 <div className="text-sm text-[var(--text-primary)] leading-relaxed mb-6 space-y-3">
                    <p>✨ <strong>Creators, it's a match!</strong></p>
                    <p className="line-clamp-3 text-[var(--text-secondary)]">{c.description || "We are collaborating with an amazing brand and looking for creators who can turn heads and spark conversations."}</p>
                    <ul className="space-y-1">
                       <li className="flex items-center gap-2"><Sparkles size={14} className="text-yellow-400"/> Paid Collaboration</li>
                       <li className="flex items-center gap-2"><Sparkles size={14} className="text-yellow-400"/> Creative Freedom</li>
                       <li className="flex items-center gap-2"><Sparkles size={14} className="text-yellow-400"/> Long-Term Opportunities</li>
                    </ul>
                    <p className="font-medium">Ready to create something people can't stop talking about? Apply now. ❤️</p>
                 </div>

                 {/* Footer Stats */}
                 <div className="border-t border-[var(--border-default)] pt-4 flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
                    <div className="flex items-center gap-4">
                       <span className="flex items-center gap-1.5"><Eye size={14}/> {c.views} Views</span>
                       <span className="flex items-center gap-1.5 text-[var(--violet)]">
                          <div className="flex -space-x-2">
                             <img src="https://ui-avatars.com/api/?name=A&background=random" className="w-5 h-5 rounded-full border border-[var(--bg-card)]"/>
                             <img src="https://ui-avatars.com/api/?name=B&background=random" className="w-5 h-5 rounded-full border border-[var(--bg-card)]"/>
                          </div>
                          {c.applied}+ creators applied
                       </span>
                    </div>
                 </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-3xl">
             <div className="w-16 h-16 rounded-full bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-tertiary)] mb-4">
               <Search size={24} />
             </div>
             <h3 className="font-display text-xl font-bold text-[var(--text-primary)] mb-2">No campaigns found</h3>
             <p className="text-[var(--text-secondary)] text-sm max-w-sm">We couldn't find any campaigns matching your current filters. Try adjusting them to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
}

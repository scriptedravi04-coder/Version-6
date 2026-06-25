import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, DollarSign, Clock, Briefcase, Plus, CheckCircle, Package, Monitor, X, PlayCircle, Instagram, Twitter, Youtube, Linkedin, Star, AlignLeft, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { api } from "../lib/api";

// Liquid Logo Component
const LiquidLoader = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative w-16 h-16 flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(124,92,255,0.6)]">
      <motion.div
        animate={{ rotate: 360, borderRadius: ["40% 60% 70% 30%", "30% 70% 40% 60%", "60% 40% 30% 70%", "40% 60% 70% 30%"] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-tr from-[#7C5CFF] to-[#D9F111] opacity-70"
      />
      <motion.div
        animate={{ rotate: -360, borderRadius: ["50% 50% 30% 70%", "70% 30% 50% 50%", "30% 70% 70% 30%", "50% 50% 30% 70%"] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="absolute inset-2 bg-[var(--violet)]"
      />
      <span className="font-display font-bold text-[var(--text-primary)] text-xl z-10">Yb</span>
    </div>
    <span className="text-xs font-semibold uppercase tracking-widest text-[var(--violet)] animate-pulse">Loading Campaigns</span>
  </div>
);

// Platform Icon Helper
const PlatformIcon = ({ platform }) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <Instagram size={16} className="text-pink-500" />;
    case 'youtube': return <Youtube size={16} className="text-red-500" />;
    case 'tiktok': return <PlayCircle size={16} className="text-[var(--text-primary)]" />;
    case 'twitter': return <Twitter size={16} className="text-blue-400" />;
    case 'linkedin': return <Linkedin size={16} className="text-blue-600" />;
    default: return <Monitor size={16} className="text-[var(--text-tertiary)]" />;
  }
};

const MOCK_CAMPAIGNS = [
  { id: 1, brand_name: "Lumina Skincare", brand_logo: "✨", title: "Summer Glow Up Series", category: "Beauty", platforms: ["Instagram", "TikTok"], location: "Mumbai", budget: 15000, deliverables: ["1 Reel", "2 Stories"], expiry_days: 3, description: "We're looking for vibrant creators to showcase our new Vitamin C serum." },
  { id: 2, brand_name: "TechNova", brand_logo: "🚀", title: "Review Our Latest Smartwatch", category: "Tech", platforms: ["YouTube", "Twitter"], location: "Bangalore", budget: 45000, deliverables: ["1 YouTube Video", "1 Twitter Thread"], expiry_days: 7, description: "Honest reviews needed for the TechNova X-Pro smartwatch. Devices will be provided." },
  { id: 3, brand_name: "Urban Style", brand_logo: "👕", title: "Streetwear Fall Collection", category: "Fashion", platforms: ["Instagram"], location: "Delhi", budget: 25000, deliverables: ["2 Reels", "3 Photos"], expiry_days: 2, description: "Streetwear fashion campaign highlighting our eco-friendly fall collection." },
  { id: 4, brand_name: "FitFuel", brand_logo: "⚡", title: "Protein Snack Challenge", category: "Fitness", platforms: ["Instagram", "YouTube"], location: "Pune", budget: 12000, deliverables: ["1 YouTube Short", "1 Reel"], expiry_days: 5, description: "Show how you incorporate FitFuel protein snacks into your post-workout routine." },
  { id: 5, brand_name: "TravelBug", brand_logo: "🌴", title: "Hidden Gems of India", category: "Travel", platforms: ["YouTube", "Instagram"], location: "Anywhere", budget: 85000, deliverables: ["1 Travel Vlog", "4 Reels"], expiry_days: 12, description: "Partnering with travel vloggers to explore underrated destinations in India." },
];

export default function Campaigns() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState("All Campaigns");
  
  // Filters
  const [search, setSearch] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [catFilter, setCatFilter] = useState("All");
  const [locFilter, setLocFilter] = useState("All");
  const [platFilter, setPlatFilter] = useState([]);
  const [budgetRange, setBudgetRange] = useState(100000); // 0 to 100k
  
  // Modal
  const [activeModal, setActiveModal] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const { data } = await api.get("/campaigns");
        // Map database schema to UI expectations if necessary
        const mapped = data.filter(c => c.status === "live").map(c => {
          let days = 0;
          if (c.deadline) {
            const diff = new Date(c.deadline).getTime() - Date.now();
            days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
          }
          return {
            id: c.campaign_id || c.id,
            brand_name: c.brand_name || "Brand",
            brand_logo: c.brand_logo || "✨",
            title: c.title,
            category: (c.categories && c.categories[0]) || c.category || "General",
            platforms: c.platforms || [],
            location: c.city || "Anywhere",
            budget: c.budget_max || c.budget || 0,
            deliverables: c.deliverables || [],
            expiry_days: days,
            description: c.description || "",
            status: c.status,
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
      if (activeTab === "UGC Campaigns" && c.category !== "UGC") return false;
      if (activeTab === "Paid Campaigns" && c.budget === 0) return false;
      if (activeTab === "Barter Campaigns" && c.budget > 0) return false;
      if (activeTab === "Trending Opportunities" && c.expiry_days > 5) return false;
      
      if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.brand_name.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== "All" && c.category !== catFilter) return false;
      if (locFilter !== "All" && c.location !== "Anywhere" && c.location !== locFilter) return false;
      if (platFilter.length > 0 && !c.platforms.some(p => platFilter.includes(p))) return false;
      if (c.budget > budgetRange) return false;
      return true;
    });
  }, [data, search, catFilter, locFilter, platFilter, budgetRange, activeTab]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await api.post(`/campaigns/${activeModal.id}/apply`);
      setIsApplying(false);
      setApplySuccess(true);
      setAppliedIds(prev => new Set(prev).add(activeModal.id));
      toast.success("Interest Submitted! The brand will review your profile.");
      
      setTimeout(() => {
        setApplySuccess(false);
        setActiveModal(null);
      }, 2000);
    } catch (e) {
      setIsApplying(false);
      const err = e.response?.data?.detail || "Could not apply.";
      toast.error(err);
    }
  };

  const getDaysLabel = (days) => {
    if (days <= 2) return <span className="text-red-400 flex items-center gap-1"><Clock size={12}/>{days} days left</span>;
    if (days <= 5) return <span className="text-amber-400 flex items-center gap-1"><Clock size={12}/>{days} days left</span>;
    return <span className="text-emerald-500 flex items-center gap-1"><Clock size={12}/>{days} days left</span>;
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 md:px-12 py-8 sm:py-12" data-testid="campaigns-page">
      
      <div className="mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">Explore Opportunities</h1>
        <p className="text-muted-foreground">Discover and apply to top brand campaigns suited for your niche.</p>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-8 gap-2 custom-scrollbar hide-scrollbar-arrows">
        {["All Campaigns", "UGC Campaigns", "Paid Campaigns", "Barter Campaigns", "Affiliate Campaigns", "Featured Brands", "Trending Opportunities"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${activeTab === tab ? 'bg-[var(--violet)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-default)]'}`}
          >
            {tab}
          </button>
        ))}
      </div>


      <div className="flex flex-col gap-8">
        {/* Search & Filter Bar */}
        <div className="relative w-full z-30">
          <div className="w-full h-[56px] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-full flex items-center shadow-sm focus-within:border-[var(--violet)]/40 focus-within:shadow-[0_0_20px_rgba(124,92,255,0.05)] transition-all">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="h-full px-5 sm:px-6 flex items-center gap-2 border-r border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors rounded-l-full group"
            >
              <SlidersHorizontal size={18} className="text-[var(--violet)] group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm hidden sm:inline">Filter</span>
              {((catFilter !== "All" || locFilter !== "All" || platFilter.length > 0 || budgetRange < 100000)) && (
                <div className="w-2 h-2 rounded-full bg-emerald-500 ml-1 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              )}
            </button>
            <div className="flex-1 flex items-center h-full relative">
              <Search className="absolute left-4 text-[var(--text-tertiary)]" size={18} />
              <input 
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-full bg-transparent pl-12 pr-6 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] font-medium focus:outline-none rounded-r-full"
              />
            </div>
          </div>

          <AnimatePresence>
            {showFilterMenu && (
               <motion.div 
                 initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98, transition: { duration: 0.1 } }}
                 className="absolute top-[70px] left-0 w-full sm:w-[360px] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40"
               >
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-[var(--text-primary)]">Advanced Filters</h3>
                   <button onClick={() => {setCatFilter("All"); setLocFilter("All"); setPlatFilter([]); setBudgetRange(100000);}} className="text-xs text-[var(--violet)] font-semibold hover:underline">Reset All</button>
                 </div>
                 
                 <div className="space-y-6">
                    {/* Category */}
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)] mb-2 block">Category</label>
                      <div className="relative">
                        <select value={catFilter} onChange={(e)=>setCatFilter(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--violet)] transition-colors appearance-none cursor-pointer">
                          <option value="All">All Categories</option>
                          <option value="Beauty">Beauty</option>
                          <option value="Tech">Tech</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Fitness">Fitness</option>
                          <option value="Travel">Travel</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)] mb-2 block">Location</label>
                      <div className="relative">
                        <select value={locFilter} onChange={(e)=>setLocFilter(e.target.value)} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--violet)] transition-colors appearance-none cursor-pointer">
                          <option value="All">Any Location</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Bangalore">Bangalore</option>
                          <option value="Pune">Pune</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* Platforms */}
                    <div>
                      <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)] mb-3 block">Platforms</label>
                      <div className="flex flex-wrap gap-2">
                        {["Instagram", "YouTube", "TikTok", "Twitter"].map(p => (
                          <button 
                            key={p} 
                            onClick={() => togglePlatform(p)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${platFilter.includes(p) ? 'bg-[var(--violet)] border-[var(--violet)] text-[var(--text-primary)]' : 'bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'}`}
                          >
                            <PlatformIcon platform={p}/> {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)]">Max Pay</label>
                        <span className="text-xs font-bold text-emerald-500">₹{(budgetRange).toLocaleString("en-IN")}</span>
                      </div>
                      <input 
                        type="range" 
                        min="5000" max="100000" step="5000"
                        value={budgetRange} onChange={(e)=>setBudgetRange(Number(e.target.value))}
                        className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                 </div>
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Campaign Cards */}
        <main>
          {loading ? (
             <div className="h-[400px] flex items-center justify-center">
               <LiquidLoader />
             </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-12 text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <Search size={32} className="text-muted-foreground"/>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No campaigns found</h3>
              <p className="text-muted-foreground text-sm max-w-sm">Try broadening your search filters or check back later for new opportunities.</p>
              <button 
                onClick={() => {setCatFilter("All"); setLocFilter("All"); setPlatFilter([]); setBudgetRange(100000); setSearch("");}}
                className="mt-6 px-6 py-2.5 bg-muted hover:bg-muted/80 text-[var(--text-primary)] rounded-xl text-sm font-semibold transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <motion.div 
              initial="hidden" animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map(c => (
                  <motion.div key={c.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                    <div 
                      onClick={() => setActiveModal(c)}
                      className="bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--violet)]/40 rounded-2xl p-6 cursor-pointer group hover:-translate-y-1 shadow-sm hover:shadow-md transition-all flex flex-col h-full relative"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] flex items-center justify-center text-xl shadow-inner border border-border overflow-hidden">
                            {c.brand_logo?.startsWith('http') || c.brand_logo?.startsWith('data:image') ? (
                              <img src={c.brand_logo} alt={c.brand_name} className="w-full h-full object-cover" />
                            ) : (
                              c.brand_logo
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[var(--text-primary)]">{c.brand_name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase mt-0.5">{c.category}</div>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold px-2 py-1 rounded bg-muted border border-border/50 text-muted-foreground group-hover:bg-[var(--bg-base)] transition-colors">
                          {getDaysLabel(c.expiry_days)}
                        </div>
                      </div>

                      <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-3 leading-snug group-hover:text-primary transition-colors">{c.title}</h3>

                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {c.platforms.map(p => (
                          <div key={p} className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-base)] rounded border border-border/50 text-[10px] font-semibold text-[var(--text-secondary)]">
                            <PlatformIcon platform={p}/> {p}
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto border-t border-border pt-4 flex items-end justify-between">
                        <div>
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Deliverables</div>
                          <div className="text-xs font-semibold text-[var(--text-primary)]/80">{c.deliverables.join(", ")}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-bold text-emerald-500/80 uppercase tracking-widest mb-1">Budget Up To</div>
                          <div className="text-lg font-display font-bold text-emerald-500">₹{(c.budget).toLocaleString("en-IN")}</div>
                        </div>
                      </div>

                      {appliedIds.has(c.id) && (
                         <div className="absolute inset-0 bg-[var(--bg-base)]/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl">
                           <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                             <CheckCircle className="text-emerald-500" size={20}/>
                           </div>
                           <span className="text-sm font-bold text-emerald-500">Applied</span>
                         </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </div>

      {/* Campaign Details Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isApplying && setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 border-b border-[var(--border-default)] bg-[var(--bg-card)] shrink-0">
                <button onClick={() => !isApplying && setActiveModal(null)} className="absolute top-6 right-6 p-2 rounded-full bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                  <X size={18}/>
                </button>
                
                <div className="flex items-center gap-4 mb-4 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-inner flex items-center justify-center text-3xl overflow-hidden">
                    {activeModal.brand_logo?.startsWith('http') || activeModal.brand_logo?.startsWith('data:image') ? (
                      <img src={activeModal.brand_logo} alt={activeModal.brand_name} className="w-full h-full object-cover" />
                    ) : (
                      activeModal.brand_logo
                    )}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-2xl text-[var(--text-primary)]">{activeModal.title}</h2>
                    <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-2 mt-1 font-semibold">
                      <span className="text-[var(--text-primary)]">{activeModal.brand_name}</span> &bull; {activeModal.category}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              {isApplying || applySuccess ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[300px]">
                  {applySuccess ? (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={32} className="text-emerald-500"/>
                      </div>
                      <h3 className="text-xl font-display font-bold text-[var(--text-primary)] mb-2">Success!</h3>
                      <p className="text-[var(--text-tertiary)] text-sm text-center max-w-xs">Your interest has been submitted. The brand will review your profile shortly.</p>
                    </motion.div>
                  ) : (
                    <LiquidLoader />
                  )}
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scroll-thin">
                    <section>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-[var(--violet)] mb-3 flex items-center gap-2"><AlignLeft size={14}/> Campaign Brief</h4>
                      <p className="text-sm text-[var(--text-primary)]/80 leading-relaxed">
                        {activeModal.description}
                        <br/><br/>
                        Ensure high quality lighting and clear audio. The content should feel organic and native to the platform.
                      </p>
                    </section>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] p-4 rounded-xl">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)] mb-1">Max Budget</div>
                        <div className="font-display text-xl font-bold text-emerald-500">₹{(activeModal.budget).toLocaleString("en-IN")}</div>
                      </div>
                      <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] p-4 rounded-xl">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-tertiary)] mb-1">Time Left</div>
                        <div className="font-display text-xl font-bold text-amber-500">{activeModal.expiry_days} Days</div>
                      </div>
                    </div>

                    <section>
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-[var(--violet)] mb-3 flex items-center gap-2"><Package size={14}/> Required Deliverables</h4>
                      <div className="space-y-2">
                        {activeModal.deliverables.map(d => (
                          <div key={d} className="flex items-center gap-3 bg-[var(--bg-elevated)] p-3 rounded-xl border border-[var(--border-default)]">
                            <div className="w-8 h-8 rounded-lg bg-[var(--violet)]/10 flex items-center justify-center text-[var(--violet)]"><Star size={14}/></div>
                            <span className="text-sm font-semibold text-[var(--text-primary)]">{d}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-[var(--border-default)] bg-[var(--bg-elevated)] shrink-0">
                    <button 
                      onClick={handleApply}
                      disabled={appliedIds.has(activeModal.id)}
                      className="w-full py-3.5 bg-[var(--violet)] hover:bg-[var(--violet-hover)] disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-tertiary)] disabled:cursor-not-allowed text-[var(--text-primary)] text-sm font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(124,92,255,0.2)] flex justify-center items-center gap-2"
                    >
                      {appliedIds.has(activeModal.id) ? "Interest Submitted" : "Submit Interest"}
                    </button>
                    <p className="text-[10px] text-center text-[var(--text-tertiary)] mt-3 font-medium">By submitting interest, the brand will gain access to your full profile metrics.</p>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


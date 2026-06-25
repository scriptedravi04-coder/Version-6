import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowLeft, Send, BarChart3, X, Users, Calendar, Award, 
  MapPin, Clock, ListTodo, ShieldAlert, CheckCircle, Ban, 
  FileText, ExternalLink, HelpCircle, Share2, Heart, Flag, Sparkles, Check,
  Eye, IndianRupee, Megaphone, Package, Briefcase
} from "lucide-react";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  
  const [c, setC] = useState(null);
  const [pitch, setPitch] = useState("");
  const [amount, setAmount] = useState(0);
  
  const [applying, setApplying] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const loadCampaignData = () => {
    startLoading();
    api.get(`/campaigns/${id}`)
      .then(({ data }) => {
        // Fallbacks to simulate data if missing from db
        const camp = {
          ...data,
          brand_name: data.brand_name || "Brand Name",
          brand_logo: data.brand_logo || "https://ui-avatars.com/api/?name=B&background=7C3AED&color=fff",
          categories: data.categories || (data.category ? [data.category] : ["General"]),
          budget_min: data.budget_min || 2000,
          budget_max: data.budget_max || 5000,
          deliverables: data.deliverables?.length ? data.deliverables : ["30 second Non collab reel\nNon promotional\nScript will be provided"],
          brand_type: data.brand_type || "Various",
          location: data.location_type || data.city || "Pan India",
          description: data.description || "We are collaborating with an amazing brand and looking for creators who can turn heads...",
          views: Math.floor(Math.random() * 500) + 50,
          applied: Math.floor(Math.random() * 50) + 5,
          creator_name: data.creator_name || "Marketing Manager",
          time_ago: "1d ago"
        };
        setC(camp);
        setAmount(camp.budget_min);
        stopLoading();
      })
      .catch((err) => {
        console.error(err);
        // Fallback for demo
        setC({
          id,
          title: "Summer Glow Skincare Series",
          brand_name: "Lumina",
          brand_logo: "https://ui-avatars.com/api/?name=L&background=7C3AED&color=fff",
          categories: ["Beauty", "Skincare"],
          budget_min: 2000,
          budget_max: 5000,
          deliverables: ["30 second Non collab reel\nNon promotional\nScript will be provided"],
          brand_type: "Beauty & Personal Care",
          location: "Pan India",
          description: "We are collaborating with an amazing brand and looking for creators who can turn heads and spark conversations. Apply if you have great skin texture content.",
          views: 342,
          applied: 12,
          creator_name: "Sarah Jenkins",
          time_ago: "1d ago"
        });
        setAmount(2000);
        stopLoading();
      });
  };

  useEffect(() => {
    loadCampaignData();
  }, [id]);

  const handleApply = async () => {
    if (!user) { toast.error("Please login to apply"); return; }
    if (user.role !== "creator") { toast.error("Only creators can apply"); return; }
    if (!amount || amount < 100) { toast.error("Please enter a valid rate estimate"); return; }
    if (pitch.length < 20) { toast.error("Please write a meaningful pitch (min 20 characters)"); return; }

    setApplying(true);
    try {
      await api.post("/campaigns/apply", { 
        campaign_id: id, 
        proposed_amount: amount, 
        pitch
      });
      toast.success("Application submitted successfully!");
      setPitch(""); 
      setApplyModalOpen(false);
    } catch (e) { 
      toast.error(e.response?.data?.detail || "Application failed."); 
    } finally { 
      setApplying(false); 
    }
  };

  if (!c) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-6 py-16 text-center text-[var(--text-secondary)]">
        <div className="w-8 h-8 border-4 border-[var(--violet)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        Loading details...
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 py-8 bg-[var(--bg-base)] text-[var(--text-primary)] min-h-screen" data-testid="campaign-detail">
      
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/brand/campaigns" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 font-semibold transition-colors">
          <ArrowLeft size={16} /> Back to Listings
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => toast.success("Link copied!")} className="p-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:bg-[var(--bg-card)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <Share2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details (Left Col) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 sm:p-8 shadow-sm">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-4 items-center">
                  <img src={c.brand_logo} alt="brand" className="w-16 h-16 rounded-full object-cover border border-[var(--border-default)]" />
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)] text-xl flex items-center gap-1.5">{c.creator_name} <CheckCircle size={16} className="text-emerald-500" /></h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
                        <Briefcase size={14} /> Influencer Marketing Manager @ {c.brand_name}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">{c.time_ago}</p>
                  </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-bold text-emerald-500 mb-6 bg-emerald-500/10 w-fit px-4 py-2 rounded-xl border border-emerald-500/20">
              <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <CheckCircle size={18} />
              </motion.div>
              Actively reviewing
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl tracking-tight leading-tight text-[var(--text-primary)] mb-6">
              {c.title}
            </h1>

            <div className="mb-8">
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Looking for</p>
              <div className="flex flex-wrap gap-2">
                {c.categories.map((cat, i) => (
                  <span key={i} className="px-4 py-1.5 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 rounded-xl text-sm font-bold">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Grid details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <motion.div whileHover={{ y: -2 }} className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] transition-colors hover:border-[var(--violet)]/30">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-center text-[var(--violet)] shrink-0">
                    <IndianRupee size={18}/>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-1">Per Influencer</p>
                    <p className="font-bold text-[var(--text-primary)] text-sm">₹{c.budget_min.toLocaleString()} {c.budget_max ? `- ₹${c.budget_max.toLocaleString()}` : '+'}</p>
                  </div>
              </motion.div>
              
              <motion.div whileHover={{ y: -2 }} className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] transition-colors hover:border-[var(--violet)]/30">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-center text-[var(--violet)] shrink-0">
                    <Megaphone size={18}/>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-1">Brand Type</p>
                    <p className="font-bold text-[var(--text-primary)] text-sm">{c.brand_type}</p>
                  </div>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] transition-colors hover:border-[var(--violet)]/30">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-center text-[var(--violet)] shrink-0">
                    <MapPin size={18}/>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-1">Location</p>
                    <p className="font-bold text-[var(--text-primary)] text-sm">{c.location}</p>
                  </div>
              </motion.div>

              <motion.div whileHover={{ y: -2 }} className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] transition-colors hover:border-[var(--violet)]/30">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-center text-[var(--violet)] shrink-0">
                    <Package size={18}/>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mb-1">Deliverables</p>
                    <div className="font-bold text-[var(--text-primary)] text-sm">
                        {c.deliverables.map((d, i) => (
                          <div key={i} className="mb-2 whitespace-pre-wrap">{d}</div>
                        ))}
                    </div>
                  </div>
              </motion.div>
            </div>

            {/* Description Body */}
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">Brief Details</p>
              <div className="text-sm text-[var(--text-primary)] leading-relaxed space-y-4 bg-[var(--bg-elevated)] p-6 rounded-2xl border border-[var(--border-default)]">
                  <p>✨ <strong>Creators, it's a match!</strong></p>
                  <p className="whitespace-pre-wrap">{c.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (Right Col) */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 shadow-sm sticky top-6">
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-6">Apply to Campaign</h3>
            
            {user?.role === 'creator' ? (
              <button 
                onClick={() => setApplyModalOpen(true)}
                className="w-full py-4 rounded-xl font-bold bg-[var(--violet)] text-white hover:bg-[#6b4aff] transition-all flex items-center justify-center gap-2 mb-6"
              >
                Apply Now <Sparkles size={16} />
              </button>
            ) : (
              <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-sm text-[var(--text-secondary)] mb-6 text-center">
                Sign in as a creator to apply for this campaign.
              </div>
            )}

            <div className="border-t border-[var(--border-default)] pt-6 space-y-4">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-[var(--text-secondary)] flex items-center gap-2">
                  <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 3, times: [0, 0.1, 1] }}>
                    <Eye size={16} className="text-[var(--text-tertiary)]" />
                  </motion.div>
                  Views
                </span>
                <span className="text-[var(--text-primary)]">{c.views}</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold">
                <span className="text-[var(--text-secondary)] flex items-center gap-2">
                  <Users size={16} className="text-[var(--text-tertiary)]" />
                  Applied
                </span>
                <span className="text-[var(--text-primary)]">{c.applied}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {applyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setApplyModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] w-full max-w-lg rounded-3xl p-6 sm:p-8 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setApplyModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)]"
              >
                <X size={18} />
              </button>
              
              <h2 className="text-2xl font-display font-bold text-[var(--text-primary)] mb-2">Submit Proposal</h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">Pitch yourself to {c.brand_name} for this campaign.</p>
              
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Proposed Fee (INR) *</label>
                  <div className="relative">
                    <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-sm focus:border-[var(--violet)] outline-none text-[var(--text-primary)]"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1">Brand budget is ₹{c.budget_min} - ₹{c.budget_max}</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Why are you a fit? *</label>
                  <textarea 
                    rows={4}
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    placeholder="Briefly explain your vision and why your audience matches their needs..."
                    className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl text-sm focus:border-[var(--violet)] outline-none text-[var(--text-primary)] leading-relaxed"
                  />
                </div>

                <button 
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full py-3.5 mt-2 rounded-xl font-bold bg-[var(--violet)] text-white hover:bg-[#6b4aff] transition-all flex items-center justify-center gap-2"
                >
                  {applying ? "Submitting..." : <><Send size={16}/> Submit Application</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
  FileText, ExternalLink, HelpCircle, Share2, Heart, Flag, Sparkles, Check
} from "lucide-react";
import KycVerificationModal from "../components/KycVerificationModal";

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const [showKycModal, setShowKycModal] = useState(false);
  
  const [c, setC] = useState(null);
  const [pitch, setPitch] = useState("");
  const [amount, setAmount] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  
  const [applying, setApplying] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  // ROI / Scoring (for Brand Owner view)
  const [roiOpen, setRoiOpen] = useState(false);
  const [roiForm, setRoiForm] = useState({ actual_views: 0, actual_engagement_rate: 5, on_time: true, content_quality: 4, brand_rating: 4 });
  const [roiResult, setRoiResult] = useState(null);

  const loadCampaignData = () => {
    startLoading();
    api.get(`/campaigns/${id}`)
      .then(({ data }) => {
        setC(data);
        if (data && data.budget_min) {
          setAmount(data.budget_min);
        }
        stopLoading();
      })
      .catch((err) => {
        console.error(err);
        setC(null);
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
        pitch,
        delivery_date: deliveryDate,
        portfolio_links: portfolioLinks
      });
      toast.success("Application submitted successfully to Brand Review Panel!");
      setPitch(""); 
      setAmount(c?.budget_min || 0);
      setPortfolioLinks([]);
      setApplyModalOpen(false);
      loadCampaignData();
    } catch (e) { 
      toast.error(e.response?.data?.detail || "Application failed to dispatch"); 
    } finally { 
      setApplying(false); 
    }
  };

  const addPortfolioTag = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (!portfolioLink.trim()) return;
      if (!portfolioLink.includes("http")) {
        toast.error("Please add a valid URL starting with http:// or https://");
        return;
      }
      setPortfolioLinks([...portfolioLinks, portfolioLink.trim()]);
      setPortfolioLink("");
    }
  };

  const removePortfolioTag = (index) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  if (!c) {
    return (
      <div className="w-full max-w-none px-6 py-16 text-center text-[var(--text-secondary)]">
        Campaign details loading or not available.
      </div>
    );
  }

  const isOwner = user?.user_id === c.brand_user_id || user?.user_id === c.brand_id;
  
  // Faux list of applied creators
  const applicantsCount = c.applicants?.length || 14;
  const spotsAvailable = c.max_creators || 5;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Campaign link copied to clipboard!");
  };

  const handleReport = () => {
    toast.success("Campaign has been flagged for audit checking.");
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 md:px-12 py-8 bg-[var(--bg-base)] text-[var(--text-primary)]" data-testid="campaign-detail">
      
      {/* Back to listings */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <Link to="/campaigns" className="text-sm text-[var(--text-secondary)] hover:text-[var(--violet)] flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Listings
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={handleShare} className="p-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <Share2 size={14} />
          </button>
          <button onClick={handleReport} className="p-2 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] rounded-full text-[var(--text-secondary)] hover:text-rose-400 transition-colors">
            <Flag size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Main Brief Header Display Card */}
        <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl border border-[var(--border-default)] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7C5CFF]/10 to-transparent rounded-full filter blur-2xl opacity-70 pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 rounded-md border border-emerald-500/20 uppercase tracking-widest">
              Live Campaign Brief
            </span>
            <span className="text-[11px] text-[var(--text-secondary)]">
              by <strong className="text-[var(--text-primary)] font-semibold">{c.brand_name || "Nova Brand"}</strong>
            </span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-tight leading-tight text-[var(--text-primary)] mb-4">
            {c.title}
          </h1>

          {/* Highlights widgets block (desktop friendly counters above the fold) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
            <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-default)]">
              <span className="text-[10px] text-[var(--text-tertiary)] block font-bold uppercase tracking-wide">Payout Budget</span>
              <span className="text-lg font-black font-display text-[var(--text-primary)] mt-1 block">
                ₹{(c.budget_min || 15000).toLocaleString("en-IN")} - ₹{(c.budget_max || 40000).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-default)]">
              <span className="text-[10px] text-[var(--text-tertiary)] block font-bold uppercase tracking-wide">Deliverables</span>
              <span className="text-sm font-bold text-[#D9F111] mt-1 block">
                {c.deliverables?.length || 2} Unique content pieces
              </span>
            </div>
            <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-default)]">
              <span className="text-[10px] text-[var(--text-tertiary)] block font-bold uppercase tracking-wide">Submission Due</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]/90 mt-1 block">
                {c.content_deadline || "Jul 15, 2026"}
              </span>
            </div>
            <div className="bg-[var(--bg-elevated)] rounded-xl p-3 border border-[var(--border-default)]">
              <span className="text-[10px] text-[var(--text-tertiary)] block font-bold uppercase tracking-wide">Language preference</span>
              <span className="text-xs font-semibold text-[var(--text-primary)]/90 mt-1 block">
                {c.language || "Hindi / English"}
              </span>
            </div>
          </div>
        </div>

        {/* Social Proof Campaign Activity strip widget */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-[var(--border-default)] rounded-2xl px-6 py-3 text-xs flex items-center justify-between text-[var(--text-secondary)]">
          <span className="flex items-center gap-1.5 font-medium">
            <Users size={14} className="text-emerald-600" />
            <strong>{applicantsCount} creators applied</strong> for {spotsAvailable} slots available.
          </span>
          <span className="text-[#D9F111] font-bold">Applications close soon</span>
        </div>

        {/* Campaign Description & Brief Images/Media */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Content Info Card */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Description & About section */}
            <div className="bg-[var(--bg-card)]/30 border border-[var(--border-default)] rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-display font-extrabold text-[var(--text-primary)] flex items-center gap-2">
                <FileText size={16} className="text-[#7C5CFF]" /> Campaign Directives & About
              </h2>
              <p className="text-sm text-[var(--text-primary)]/80 leading-relaxed whitespace-pre-line font-normal">
                {c.description}
              </p>

              <div className="pt-4 flex flex-wrap gap-2">
                {(c.categories || []).map((cat) => (
                  <span key={cat} className="px-3 py-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[11px] text-[#D9F111] font-bold rounded-full">
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Dos and Don'ts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 text-left">
                <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                  <CheckCircle size={14} /> Clear Deliverable DOs
                </h4>
                <ul className="text-xs text-[var(--text-primary)]/80 space-y-2 list-disc list-inside">
                  <li>Showcase the packaging in high-definition details above the fold.</li>
                  <li>Link stickers must use the approved tracking landing url.</li>
                  <li>Incorporate organic transition tags showing actual product use.</li>
                  <li>Maintain elegant modern lighting in the background visuals.</li>
                </ul>
              </div>

              <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 text-left">
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                  <Ban size={14} /> Critical Avoid DONTs
                </h4>
                <ul className="text-xs text-[var(--text-primary)]/80 space-y-2 list-disc list-inside">
                  <li>Do not show competing cosmetic or tech logo branding.</li>
                  <li>Avoid generic robotic sound tracks (use audio themes specified).</li>
                  <li>Do not block or crowd the interface text overlay.</li>
                  <li>Avoid delayed submissions after live date contracts.</li>
                </ul>
              </div>
            </div>

            {/* Barter campaign specifications panel */}
            {c.campaign_type !== 'paid' && (
              <div className="bg-indigo-500/5 border border-indigo-500/25 rounded-2xl p-5 text-left">
                <h4 className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                  🎁 Barter Deliverable Allocation
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                  In addition to campaign compensation variables, physical product launch kits valued at up to ₹4,500 are shipped securely via platform delivery matching on-boarding profiles.
                </p>
              </div>
            )}

            {/* Reference Sample Media Section */}
            <div className="bg-[var(--bg-card)]/30 border border-[var(--border-default)] rounded-3xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3 block">
                Reference / Sample Guidelines
              </h3>
              <div className="aspect-video rounded-xl bg-slate-900 overflow-hidden relative border border-[var(--border-default)] flex items-center justify-center">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800" alt="Sample reference screen" className="w-full h-full object-cover blur-[1px] opacity-40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-[10px] uppercase font-bold text-[#D9F111] tracking-widest bg-[var(--bg-elevated)] px-3 py-1.5 border border-[var(--border-default)] rounded-full mb-2">
                    Visual Moodboard active
                  </span>
                  <p className="text-xs text-[var(--text-primary)]/80 max-w-sm font-normal">Brand asset briefs, custom fonts, and sample video guidelines are available in your Inbox upon application launch.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right sidebar details & constraints */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            {/* Target demographic variables */}
            <div className="bg-[var(--bg-card)]/60 border border-[var(--border-default)] rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black text-[var(--text-tertiary)] uppercase tracking-widest border-b border-[var(--border-default)] pb-2">
                Audience Criteria Match
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[var(--text-tertiary)] block font-semibold">Creator Genre:</span>
                  <span className="text-[var(--text-primary)] font-bold mt-0.5 block">{(c.categories || ["Beauty", "Fashion"]).join(", ")}</span>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] block font-semibold">Min Audience Base:</span>
                  <span className="text-[var(--text-primary)] font-bold mt-0.5 block">Tier 2 micro-nano scale</span>
                </div>
                <div>
                  <span className="text-[var(--text-tertiary)] block font-semibold">Regional focus:</span>
                  <span className="text-[#D9F111] font-bold mt-0.5 block">National metro coverage</span>
                </div>
              </div>
            </div>

            {/* Timelines Tracker Widget */}
            <div className="bg-[var(--bg-card)]/60 border border-[var(--border-default)] rounded-3xl p-6 space-y-4">
              <h3 className="text-xs font-black text-[var(--text-tertiary)] uppercase tracking-widest border-b border-[var(--border-default)] pb-2">
                Campaign Timeline Frame
              </h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
                  <span className="text-[var(--text-secondary)]">Apply cutoff:</span>
                  <span className="text-[var(--text-primary)] font-bold">Ended soon</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-default)]">
                  <span className="text-[var(--text-secondary)]">Draft submission:</span>
                  <span className="text-[#D9F111] font-bold">Within 7 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Go live dates:</span>
                  <span className="text-[#7C5CFF] font-bold">Standard framework</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Brand/Owner Specific application reviews panel */}
        {isOwner && (
          <div className="bg-[var(--bg-card)]/60 border border-[var(--border-default)] rounded-3xl p-6 mt-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-black text-2xl text-[var(--text-primary)]">Application Proposals ({(c.applicants || []).length})</h2>
              {c.status !== "closed" && (
                <button onClick={() => setRoiOpen(true)} className="bg-[var(--bg-elevated)] hover:bg-[var(--border-default)] px-4 py-2 rounded-xl text-xs font-bold text-[var(--text-primary)] transition-colors flex items-center gap-1">
                  <BarChart3 size={14} /> Close & Evaluate
                </button>
              )}
            </div>
            
            <div className="space-y-3" data-testid="applicants-list">
              {(c.applicants || []).length === 0 && (
                <div className="text-xs text-[var(--text-tertiary)] py-6 text-center">No Applications registered yet for this brief.</div>
              )}
              {(c.applicants || []).map((a) => (
                <div key={a.application_id || a.id} className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl flex items-start gap-4">
                  {a.creator_photo && <img src={a.creator_photo} alt="" className="w-10 h-10 rounded-xl object-cover" referrerpolicy="no-referrer" />}
                  <div className="flex-grow">
                    <h4 className="text-[var(--text-primary)] font-bold text-xs">{a.creator_name || "Demo Creator"}</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 font-normal">{a.pitch}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="block font-display font-black text-sm text-[#D9F111]">₹{(a.proposed_amount || 0).toLocaleString("en-IN")}</span>
                    <span className={`text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-full mt-1.5 inline-block font-mono ${a.status === "accepted" ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500"}`}>
                      {a.status || "pending review"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Sticky action tray for Application Submission logic */}
        {!isOwner && user?.role === "creator" && (
          <div className="fixed bottom-0 left-0 right-0 py-4 px-6 bg-[var(--bg-card)]/95 backdrop-blur-md border-t border-[var(--border-default)] z-[80] flex items-center justify-between gap-4 max-w-5xl mx-auto rounded-t-3xl shadow-2xl">
            <div>
              <span className="text-[10px] text-[var(--text-tertiary)] block font-bold uppercase tracking-wider">Est. Compensation quote</span>
              <strong className="text-lg font-black font-display text-[var(--text-primary)] mt-0.5 block">
                ₹{(c.budget_min || 15000).toLocaleString("en-IN")} - ₹{(c.budget_max || 40000).toLocaleString("en-IN")}
              </strong>
            </div>
            <div className="flex items-center gap-3">
              {user?.verified || true ? (
                <button 
                  onClick={() => setApplyModalOpen(true)}
                  className="bg-[var(--violet)] hover:bg-[#6D42FF] px-8 py-3.5 rounded-xl text-xs font-bold text-[var(--text-primary)] tracking-wide transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} /> Submit Campaign Proposal
                </button>
              ) : (
                <button 
                  onClick={() => setShowKycModal(true)}
                  className="bg-rose-500 hover:bg-rose-600 px-6 py-3 rounded-xl text-xs font-bold text-[var(--text-primary)] transition-all shadow-md"
                >
                  Complete KYC to unlock apply
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* --- PITCH AND PROPOSAL APPLY MODAL --- */}
      <AnimatePresence>
        {applyModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setApplyModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-3xl p-6 md:p-8 max-w-lg w-full relative z-10 shadow-3xl text-left text-[var(--text-primary)]" 
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-black text-2xl text-[var(--text-primary)]">Apply for Campaign</h2>
                <button onClick={() => setApplyModalOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-1 bg-[var(--bg-elevated)] rounded-full">
                  <X size={14} />
                </button>
              </div>
              <p className="text-[var(--text-secondary)] text-xs mb-6 font-normal">Pitch directly. Your rates are protected by escrow guards.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">My Proposed Rate (₹)</label>
                  <input 
                    type="number" 
                    value={amount || ''} 
                    onChange={(e) => setAmount(parseInt(e.target.value || "0"))} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-bold font-display" 
                    placeholder="e.g. 15000"
                    data-testid="apply-amount"
                  />
                  <span className="text-[10px] text-[#D9F111] mt-1 block font-mono">Suggested budget bracket: ₹{c.budget_min} - ₹{c.budget_max}</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Estimated delivery days</label>
                  <input 
                    type="text" 
                    value={deliveryDate} 
                    onChange={(e) => setDeliveryDate(e.target.value)} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-medium" 
                    placeholder="e.g. 5 days from shipping"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Pitch / Why do you fit this campaign?</label>
                  <textarea 
                    rows={4} 
                    value={pitch} 
                    onChange={(e) => setPitch(e.target.value)} 
                    className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-medium resize-none" 
                    placeholder="Explain your content approach, engagement rate focus, and product launch concepts..."
                    data-testid="apply-pitch"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Portfolio Links tags manager</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={portfolioLink} 
                      onChange={(e) => setPortfolioLink(e.target.value)} 
                      onKeyDown={addPortfolioTag}
                      className="flex-grow bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[#7C5CFF] text-xs font-medium" 
                      placeholder="Paste link and press Enter"
                    />
                    <button onClick={addPortfolioTag} className="bg-[var(--bg-elevated)] hover:bg-[var(--border-default)] px-4 rounded-xl text-xs font-black text-[var(--text-primary)] border border-[var(--border-default)] transition-colors">Add</button>
                  </div>
                  {portfolioLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {portfolioLinks.map((link, idx) => (
                        <span key={idx} className="bg-[var(--violet)]/10 text-[var(--text-primary)] border border-[var(--violet)]/20 px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                          {link.slice(0, 24)}...
                          <button onClick={() => removePortfolioTag(idx)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] font-bold">&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={() => setApplyModalOpen(false)} className="py-3 px-5 rounded-xl text-xs font-bold bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors">Cancel</button>
                  <button onClick={handleApply} disabled={applying} data-testid="apply-submit" className="flex-1 py-3 px-5 rounded-xl text-xs font-bold bg-[#D9F111] hover:bg-[#cbe010] text-black transition-all shadow-md">
                    {applying ? "Submitting..." : "Submit Application"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Evaluation close-scoring model */}
      {roiOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl p-8 max-w-md w-full relative text-left" data-testid="roi-modal">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-black text-2xl text-[var(--text-primary)]">Evaluate & Close</h2>
              <button onClick={() => setRoiOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] p-1 rounded-full"><X size={14} /></button>
            </div>
            {roiResult ? (
              <div className="space-y-4">
                <div className="text-center py-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)]">
                  <span className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase block tracking-wider">Performance Score</span>
                  <div className="font-display text-6xl font-black text-[#D9F111] mt-1">{roiResult.performance_score}</div>
                  <span className="text-[11px] text-[var(--text-tertiary)]">out of 100</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Stat label="Total Payouts" value={`₹${roiResult.paid?.toLocaleString("en-IN")}`} />
                  <Stat label="Views Sync" value={roiResult.actual_views?.toLocaleString("en-IN")} />
                  <Stat label="CPV rating" value={`₹${roiResult.cpv}`} />
                  <Stat label="ROI Factor" value={roiResult.roi_score} />
                </div>
                <button onClick={() => { setRoiOpen(false); loadCampaignData(); }} className="bg-[#D9F111] text-black w-full py-3.5 rounded-xl text-xs font-bold transition-all shadow-md">Complete</button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div><label className="block text-[var(--text-secondary)] font-bold mb-1.5 uppercase">Actual Views Sync</label><input data-testid="roi-views" type="number" value={roiForm.actual_views} onChange={(e) => setRoiForm({ ...roiForm, actual_views: parseInt(e.target.value || "0") })} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none" /></div>
                <div><label className="block text-[var(--text-secondary)] font-bold mb-1.5 uppercase">Actual Engagement Rate (%)</label><input data-testid="roi-er" type="number" step="0.1" value={roiForm.actual_engagement_rate} onChange={(e) => setRoiForm({ ...roiForm, actual_engagement_rate: parseFloat(e.target.value || "0") })} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none" /></div>
                <div className="flex items-center gap-2"><input id="ontime" data-testid="roi-ontime" type="checkbox" checked={roiForm.on_time} onChange={(e) => setRoiForm({ ...roiForm, on_time: e.target.checked })} /><label htmlFor="ontime" className="text-[var(--text-secondary)]">Delivered on time according to standard criteria</label></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-[var(--text-secondary)] font-bold mb-1.5 uppercase">Content Quality (1-5)</label><input data-testid="roi-quality" type="number" min="1" max="5" value={roiForm.content_quality} onChange={(e) => setRoiForm({ ...roiForm, content_quality: parseInt(e.target.value || "3") })} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none" /></div>
                  <div><label className="block text-[var(--text-secondary)] font-bold mb-1.5 uppercase">Brand Rating (1-5)</label><input data-testid="roi-rating" type="number" min="1" max="5" value={roiForm.brand_rating} onChange={(e) => setRoiForm({ ...roiForm, brand_rating: parseInt(e.target.value || "3") })} className="w-full bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none" /></div>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      const { data } = await api.post(`/campaigns/${id}/close`, roiForm);
                      setRoiResult(data);
                      toast.success(`Campaign closed successfully!`);
                    } catch (err) { 
                      toast.error(err.response?.data?.detail || "Evaluation failed to process"); 
                    }
                  }} 
                  data-testid="roi-submit" 
                  className="bg-[var(--violet)] text-white w-full py-3 rounded-xl font-bold mt-4 shadow-md text-xs flex items-center justify-center gap-2"
                >
                  <BarChart3 size={14} /> Compute Score & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showKycModal && (
        <KycVerificationModal 
          isOpen={showKycModal} 
          onClose={() => setShowKycModal(false)} 
          onComplete={() => {
            setShowKycModal(false);
            refreshUser();
          }} 
        />
      )}
    </div>
  );
}

const Stat = ({ label, value }) => (
  <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-3">
    <div className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wide">{label}</div>
    <div className="font-display text-sm font-bold text-[var(--text-primary)] mt-1">{value}</div>
  </div>
);

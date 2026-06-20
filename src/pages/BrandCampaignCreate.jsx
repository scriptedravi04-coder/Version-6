import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Sparkles, UploadCloud, FileText, Calendar, Compass, ListTodo, Layers, ArrowLeft } from "lucide-react";

export default function BrandCampaignCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [kyc, setKyc] = useState(null);

  // Form State
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    description: "",
    category: "Tech",
    platforms: ["Instagram"],
    deliverables: [{ type: "Reel", count: 1, duration_sec: 30 }],
    hashtags: "",
    mentions: "",
    dos: "",
    donts: "",
    target_niche: ["Tech"],
    follower_range: "10K-100K",
    target_location: "All India",
    max_creators: 5,
    budget_min: "10000",
    budget_max: "15000",
    deadline: "",
    guidelines_url: ""
  });

  useEffect(() => {
    // Check KYC status
    api.get("/verifications/me").then(({ data }) => setKyc(data)).catch(() => {});

    // If edit mode, load original values
    if (editId) {
      api.get(`/campaigns?mine=true`).then(({ data }) => {
        const found = data.find(c => String(c.campaign_id || c.id) === String(editId));
        if (found) {
          setCampaignForm({
            title: found.title || "",
            description: found.description || "",
            category: found.categories?.[0] || found.category || "Tech",
            platforms: found.platforms || ["Instagram"],
            deliverables: [{ type: "Reel", count: 1, duration_sec: 30 }],
            hashtags: found.hashtags || "",
            mentions: found.mentions || "",
            dos: found.dos || "",
            donts: found.donts || "",
            target_niche: found.categories || ["Tech"],
            follower_range: found.follower_range || "10K-100K",
            target_location: found.target_location || "All India",
            max_creators: found.max_creators || 5,
            budget_min: String(found.budget_min || 10000),
            budget_max: String(found.budget_max || 15000),
            deadline: found.deadline || "",
            guidelines_url: found.guidelines_url || ""
          });
        }
      }).catch(() => {});
    }
  }, [editId]);

  const handleGuidelinesUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const { data } = await api.post("/upload", fd);
      setCampaignForm(prev => ({ ...prev, guidelines_url: data.url }));
      toast.success("Guidelines asset uploaded successfully!");
    } catch (err) {
      toast.error("Guidelines file upload failed. Try manually setting a target URL instead.");
    } finally {
      setUploadingFile(false);
    }
  };

  const validateStep = (step) => {
    if (step === 1) {
      if (!campaignForm.title.trim() || campaignForm.title.length < 5) {
        toast.error("Descriptive campaign title is required (at least 5 chars).");
        return false;
      }
      if (!campaignForm.description.trim() || campaignForm.description.length < 30) {
        toast.error("Please provide a thorough brief description (at least 30 chars).");
        return false;
      }
    }
    if (step === 3) {
      const min = Number(campaignForm.budget_min);
      const max = Number(campaignForm.budget_max);
      if (isNaN(min) || min <= 0) {
        toast.error("Enter a valid minimum campaign budget commercial.");
        return false;
      }
      if (isNaN(max) || max < min) {
        toast.error("Maximum budget should equal or exceed minimum budget.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveCampaign = async (isDraftMode = false) => {
    // Verification gating if live
    const isKycApproved = kyc?.status === "approved" || kyc?.status === "APPROVED";
    if (!isKycApproved && !isDraftMode) {
      toast.error("KYC Action block: Complete compliance details to launch live briefs!");
      navigate("/brand/kyc");
      return;
    }

    if (!campaignForm.title.trim()) {
      toast.error("Descriptive brief title is required!");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: campaignForm.title,
        description: campaignForm.description,
        budget_min: Number(campaignForm.budget_min) || 10000,
        budget_max: Number(campaignForm.budget_max) || 15000,
        deliverables: campaignForm.deliverables.map(d => `${d.count}x ${d.type} (${d.duration_sec}s)`),
        categories: [campaignForm.category],
        platforms: campaignForm.platforms,
        deadline: campaignForm.deadline || "2026-06-30",
        guidelines_url: campaignForm.guidelines_url,
        status: isDraftMode ? "draft" : "live",
        dos: campaignForm.dos,
        donts: campaignForm.donts,
        hashtags: campaignForm.hashtags,
        mentions: campaignForm.mentions
      };

      if (editId) {
        await api.post(`/campaigns/${editId}/update`, payload).catch(async () => {
          // fallback update call
          await api.post(`/campaigns`, payload);
        });
        toast.success(isDraftMode ? "Brief draft updated!" : "Brief updated and launched safely!");
      } else {
        await api.post("/campaigns", payload);
        toast.success(isDraftMode ? "Brief draft saved to listings!" : "Brief launched! Verification review initiated.");
      }

      navigate("/brand/campaigns");
    } catch (e) {
      toast.error("Platform post refused. Please inspect parameters and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepsInfo = [
    { number: 1, title: "Campaign Core", icon: FileText },
    { number: 2, title: "Target Audience", icon: Compass },
    { number: 3, title: "Budget & Dates", icon: Calendar },
    { number: 4, title: "Deliverables", icon: Layers },
    { number: 5, title: "Guidelines Assets", icon: ListTodo }
  ];

  return (
    <div className="w-full max-w-none px-4 sm:px-6 md:px-8 py-10 text-left min-h-screen bg-[#09090e] text-white">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate("/brand/campaigns")}
            className="flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white mb-3"
          >
            <ArrowLeft size={14} /> Back to Listings
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Brief Creator Wizard
          </h1>
          <p className="text-white/50 text-xs mt-1">
            Build your briefs step-by-step and pair with the finest creator partnerships.
          </p>
        </div>
      </div>

      {/* Progress horizontal list */}
      <div className="grid grid-cols-5 gap-3 mb-8">
        {stepsInfo.map(info => {
          const StepIcon = info.icon;
          const isActive = currentStep === info.number;
          const isDone = currentStep > info.number;
          return (
            <div key={info.number} className="text-left font-sans">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${isDone ? "bg-[#10b981]" : isActive ? "bg-[#7C5CFF]" : "bg-white/5"}`} />
              <div className="hidden sm:flex items-center gap-2 mt-3 pl-1">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isDone ? "bg-[#10b981] text-white" : isActive ? "bg-[#7C5CFF] text-white" : "bg-white/5 text-white/40"
                }`}>
                  {isDone ? <Check size={10} strokeWidth={4} /> : info.number}
                </span>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${isActive ? "text-white" : "text-white/40"}`}>
                  {info.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#131224] border border-white/5 p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* STEP 1: CAMPAIGN CORE DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Campaign Title *</label>
                  <input
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none"
                    type="text"
                    required
                    placeholder="e.g. Summer Glow Skincare Series launch"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Descriptive Guidelines / Brief *</label>
                  <textarea
                    rows={6}
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none leading-relaxed"
                    required
                    placeholder="Provide a highly rich explanation. Details regarding your goals, deliverables format, audio constraints and references..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Niche / Category Category</label>
                  <select
                    value={campaignForm.category}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none cursor-pointer"
                  >
                    <option value="Tech">Technology & Gadgets</option>
                    <option value="Beauty">Skincare & Fashion</option>
                    <option value="Fitness">Sports & Fitness</option>
                    <option value="Food">Food, Travel & Lifestyle</option>
                    <option value="Business">Finance & Business</option>
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: CREATOR PREFERENCES */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Follower scale category</label>
                  <select
                    value={campaignForm.follower_range}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, follower_range: e.target.value }))}
                    className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none cursor-pointer"
                  >
                    <option value="10K-50K">Micro Creators (10K - 50K)</option>
                    <option value="50K-100K">Mid-Tier Creators (50K - 100K)</option>
                    <option value="100K-500K">Macro Icons (100K - 500K)</option>
                    <option value="500K+">Mega Voices (500K+)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Target Geolocation Constraint</label>
                  <input
                    value={campaignForm.target_location}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, target_location: e.target.value }))}
                    className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none"
                    type="text"
                    placeholder="All India / Mumbai / Delhi NCR"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Maximum shortlists limit</label>
                  <input
                    value={campaignForm.max_creators}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, max_creators: Number(e.target.value) }))}
                    className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none font-mono"
                    type="number"
                    min={1}
                    placeholder="5"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: BUDGET & TIMELINE */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Budget Minimum (INR) *</label>
                    <input
                      value={campaignForm.budget_min}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, budget_min: e.target.value }))}
                      className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none font-mono"
                      type="number"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Budget Maximum (INR) *</label>
                    <input
                      value={campaignForm.budget_max}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, budget_max: e.target.value }))}
                      className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none font-mono"
                      type="number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Application submission deadline *</label>
                  <input
                    value={campaignForm.deadline}
                    required
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-4 py-3 border border-white/5 rounded-xl text-xs sm:text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none font-mono"
                    type="date"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: DELIVERABLES */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Primary Target Channels</label>
                  <div className="flex gap-4">
                    {["Instagram", "YouTube", "TikTok", "X / Twitter"].map(plat => {
                      const has = campaignForm.platforms.includes(plat);
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => {
                            setCampaignForm(prev => {
                              const curr = prev.platforms.includes(plat)
                                ? prev.platforms.filter(p => p !== plat)
                                : [...prev.platforms, plat];
                              return { ...prev, platforms: curr.length > 0 ? curr : [plat] };
                            });
                          }}
                          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            has 
                              ? "bg-[#7C5CFF]/15 text-[#a98eff] border-[#7C5CFF]/30" 
                              : "bg-white/5 text-white/50 border-transparent hover:bg-white/10"
                          }`}
                        >
                          {plat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/50 mb-3 block uppercase tracking-wider">Required Deliverables List</label>
                  {campaignForm.deliverables.map((del, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
                      <div className="flex-1 w-full text-left">
                        <span className="text-[10px] font-bold text-white/30 block mb-1">FORMAT type</span>
                        <select
                          value={del.type}
                          onChange={(e) => {
                            const copy = [...campaignForm.deliverables];
                            copy[idx].type = e.target.value;
                            setCampaignForm(prev => ({ ...prev, deliverables: copy }));
                          }}
                          className="w-full p-2.5 bg-white/5 rounded-lg border border-white/5 text-xs text-white"
                        >
                          <option value="Reel">Reels (60s Vertical Video)</option>
                          <option value="Video">YouTube Dedicated (5m - 10m Video)</option>
                          <option value="Integration">YouTube Integration (60s - 90s Slot)</option>
                          <option value="Post">Dedicated Feed Graphic Post</option>
                          <option value="Story">Active Brand Story Link Sequence</option>
                        </select>
                      </div>

                      <div className="w-full sm:w-[90px] text-left">
                        <span className="text-[10px] font-bold text-white/30 block mb-1">How many</span>
                        <input
                          value={del.count}
                          type="number"
                          min={1}
                          onChange={(e) => {
                            const copy = [...campaignForm.deliverables];
                            copy[idx].count = Math.max(1, Number(e.target.value));
                            setCampaignForm(prev => ({ ...prev, deliverables: copy }));
                          }}
                          className="w-full p-2.5 bg-white/5 rounded-lg border border-white/5 text-xs text-white font-mono"
                        />
                      </div>

                      <div className="w-full sm:w-[110px] text-left">
                        <span className="text-[10px] font-bold text-white/30 block mb-1">Duration (Sec)</span>
                        <input
                          value={del.duration_sec}
                          type="number"
                          min={5}
                          onChange={(e) => {
                            const copy = [...campaignForm.deliverables];
                            copy[idx].duration_sec = Math.max(5, Number(e.target.value));
                            setCampaignForm(prev => ({ ...prev, deliverables: copy }));
                          }}
                          className="w-full p-2.5 bg-white/5 rounded-lg border border-white/5 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: GUIDELINES & RESOURCES */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">DOs (deliverable instructions)</label>
                    <textarea
                      rows={4}
                      value={campaignForm.dos}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, dos: e.target.value }))}
                      className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none leading-relaxed"
                      placeholder="e.g. Must mention the natural herbs. Show container clearly in first 5s."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">DONTs (brand boundaries)</label>
                    <textarea
                      rows={4}
                      value={campaignForm.donts}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, donts: e.target.value }))}
                      className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none leading-relaxed"
                      placeholder="e.g. Do not show competitor logos. Do not make unverified claims."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Custom Hashtags (comma separated)</label>
                    <input
                      value={campaignForm.hashtags}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, hashtags: e.target.value }))}
                      className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none font-mono"
                      placeholder="#SummerGlow, #NaturalHerbalSkin"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Mentions (comma separated)</label>
                    <input
                      value={campaignForm.mentions}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, mentions: e.target.value }))}
                      className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none font-mono"
                      placeholder="@ybexmedia, @my_skincare_brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Brand Guidelines / Asset Document URL (Doc Link or upload PDF)</label>
                  <div className="flex gap-3">
                    <input
                      value={campaignForm.guidelines_url}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, guidelines_url: e.target.value }))}
                      className="w-full px-4 py-3 border border-white/5 rounded-xl text-sm bg-white/5 focus:border-[#7C5CFF] text-white outline-none font-mono flex-1"
                      placeholder="https://docs.google.com/document/d/your-doc-link"
                    />

                    <div className="relative overflow-hidden">
                      <input
                        type="file"
                        id="guidelines-upload"
                        onChange={handleGuidelinesUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.jpg,.png"
                      />
                      <label 
                        htmlFor="guidelines-upload"
                        className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-xs font-bold font-sans cursor-pointer flex items-center justify-center gap-1.5 h-full whitespace-nowrap"
                      >
                        {uploadingFile ? "Uploading..." : <><UploadCloud size={14} /> Upload Asset</>}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Form control interactions bar */}
        <div className="mt-8 pt-5 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-white/10 text-white hover:bg-white/5 hover:border-white/20 text-xs font-bold rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer flex items-center gap-1.5"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSaveCampaign(true)}
              disabled={submitting}
              className="px-4 py-2 text-white/60 hover:text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Save as Draft 🗒️
            </button>

            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7C5CFF] hover:bg-[#6b4aff] text-white flex items-center gap-1.5 cursor-pointer"
              >
                Next Step <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => handleSaveCampaign(false)}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border border-teal-500/20 text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Launching..." : <><Check size={14} strokeWidth={3} /> Submit Brief for Review</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Sparkles, UploadCloud, FileText, Calendar, Compass, ListTodo, Layers, ArrowLeft, X, Plus, Search } from "lucide-react";
import { CustomDatePicker } from "../components/ui/custom-date-picker";
import { VALID_NICHES, INDIAN_CITIES } from "../lib/constants";

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
    categories: [], // multi-select max 5
    language_type: "Any language",
    languages: [],
    location_type: "Pan India",
    specific_locations: [],
    platforms: ["Instagram"],
    max_creators: 200,
    budget_min: "2000",
    budget_max: "5000",
    brand_type: "Relationships & Dating",
    follower_min: 10000,
    follower_max: 500000,
    deliverables: [{ 
      duration: "30 second", 
      collab_type: "Non collab", 
      type: "reel",
      content_type: "Non promotional", 
      script_type: "Script will be provided" 
    }],
    dos: "",
    donts: "",
    hashtags: "",
    mentions: "",
    deadline: "",
    guidelines_url: ""
  });

  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryRef = useRef(null);

  const [locationSearch, setLocationSearch] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) setShowCategoryDropdown(false);
      if (locationRef.current && !locationRef.current.contains(event.target)) setShowLocationDropdown(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    api.get("/verifications/me").then(({ data }) => setKyc(data)).catch(() => {});

    if (editId) {
      api.get(`/campaigns?mine=true`).then(({ data }) => {
        const found = data.find(c => String(c.campaign_id || c.id) === String(editId));
        if (found) {
          setCampaignForm(prev => ({
            ...prev,
            title: found.title || "",
            description: found.description || "",
            categories: found.categories || (found.category ? [found.category] : []),
            platforms: found.platforms || ["Instagram"],
            max_creators: found.max_creators || 200,
            budget_min: String(found.budget_min || 2000),
            budget_max: String(found.budget_max || 5000),
            brand_type: found.brand_type || "Relationships & Dating",
            follower_min: found.follower_min || 10000,
            follower_max: found.follower_max || 500000,
            deliverables: found.deliverables_detailed || [{ 
              duration: "30 second", collab_type: "Non collab", type: "reel",
              content_type: "Non promotional", script_type: "Script will be provided" 
            }],
            deadline: found.deadline || "",
            guidelines_url: found.guidelines_url || "",
            dos: found.dos || "",
            donts: found.donts || "",
            hashtags: found.hashtags || "",
            mentions: found.mentions || "",
            language_type: found.language_type || "Any language",
            location_type: found.location_type || "Pan India",
            specific_locations: found.specific_locations || [],
          }));
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
      if (campaignForm.categories.length === 0) {
        toast.error("Please select at least one category.");
        return false;
      }
    }
    if (step === 2) {
      if (campaignForm.location_type === "Specific location" && campaignForm.specific_locations.length === 0) {
        toast.error("Please select at least one specific location.");
        return false;
      }
      if (campaignForm.platforms.length === 0) {
        toast.error("Select at least one platform.");
        return false;
      }
    }
    if (step === 3) {
      const min = Number(campaignForm.budget_min);
      const max = Number(campaignForm.budget_max);
      if (isNaN(min) || min <= 0) {
        toast.error("Enter a valid minimum campaign budget.");
        return false;
      }
      if (campaignForm.budget_max && (!isNaN(max) && max < min)) {
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
    const isKycApproved = kyc?.status === "approved" || kyc?.status === "APPROVED";
    if (!isKycApproved && !isDraftMode) {
      toast.error("Complete compliance details to launch live campaigns!");
      navigate("/brand/kyc");
      return;
    }

    if (!campaignForm.title.trim()) {
      toast.error("Descriptive title is required!");
      return;
    }

    try {
      setSubmitting(true);
      
      const formattedDeliverables = campaignForm.deliverables.map(d => 
        `${d.duration} ${d.collab_type} ${d.type}\n${d.content_type}\n${d.script_type}`
      );

      const payload = {
        title: campaignForm.title,
        description: campaignForm.description,
        budget_min: Number(campaignForm.budget_min) || 2000,
        budget_max: campaignForm.budget_max ? Number(campaignForm.budget_max) : null,
        deliverables: formattedDeliverables,
        deliverables_detailed: campaignForm.deliverables,
        categories: campaignForm.categories,
        platforms: campaignForm.platforms,
        deadline: campaignForm.deadline || "2026-06-30",
        guidelines_url: campaignForm.guidelines_url,
        status: isDraftMode ? "draft" : "live",
        dos: campaignForm.dos,
        donts: campaignForm.donts,
        hashtags: campaignForm.hashtags,
        mentions: campaignForm.mentions,
        language_type: campaignForm.language_type,
        location_type: campaignForm.location_type,
        specific_locations: campaignForm.specific_locations,
        max_creators: campaignForm.max_creators,
        brand_type: campaignForm.brand_type,
        follower_min: campaignForm.follower_min,
        follower_max: campaignForm.follower_max
      };

      if (editId) {
        await api.post(`/campaigns/${editId}/update`, payload).catch(async () => {
          await api.post(`/campaigns`, payload);
        });
        toast.success(isDraftMode ? "Draft updated!" : "Campaign updated and launched safely!");
      } else {
        await api.post("/campaigns", payload);
        toast.success(isDraftMode ? "Draft saved to listings!" : "Campaign launched! Verification review initiated.");
      }

      navigate("/brand/campaigns");
    } catch (e) {
      toast.error("Failed to save campaign. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const stepsInfo = [
    { number: 1, title: "Campaign Core", icon: FileText },
    { number: 2, title: "Target Audience", icon: Compass },
    { number: 3, title: "Budget & Dates", icon: Calendar },
    { number: 4, title: "Deliverables", icon: Layers },
    { number: 5, title: "Guidelines", icon: ListTodo }
  ];

  return (
    <div className="w-full max-w-none px-4 sm:px-6 md:px-8 py-10 text-left min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate("/brand/campaigns")}
            className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Listings
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            Create a Campaign
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-8">
        {stepsInfo.map(info => {
          const isActive = currentStep === info.number;
          const isDone = currentStep > info.number;
          return (
            <div key={info.number} className="text-left font-sans">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${isDone ? "bg-[#10b981]" : isActive ? "bg-[var(--violet)]" : "bg-[var(--bg-elevated)]"}`} />
              <div className="hidden sm:flex items-center gap-2 mt-3 pl-1">
                <span className={`w-5 h-5 rounded-t-[8px] rounded-bl-[8px] rounded-br-[2px] flex items-center justify-center text-[10px] font-bold ${
                  isDone ? "bg-[#10b981] text-[var(--text-primary)]" : isActive ? "bg-[var(--violet)] text-white" : "bg-[var(--bg-elevated)] text-[var(--text-tertiary)]"
                }`}>
                  {isDone ? <Check size={10} strokeWidth={4} /> : info.number}
                </span>
                <span className={`text-[10px] font-bold tracking-wider uppercase ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"}`}>
                  {info.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            {/* STEP 1: CAMPAIGN CORE DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Campaign Title *</label>
                  <input
                    value={campaignForm.title}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none transition-colors"
                    type="text"
                    required
                    placeholder="e.g. Summer Glow Skincare Series launch"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Brand Type *</label>
                  <input
                    value={campaignForm.brand_type}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, brand_type: e.target.value }))}
                    className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none transition-colors"
                    type="text"
                    required
                    placeholder="e.g. Relationships & Dating, Beauty, etc."
                  />
                </div>

                <div ref={categoryRef}>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Categories (Max 5) *</label>
                  <div className="relative">
                    <div className="flex items-center px-4 py-3 border border-[var(--border-default)] rounded-xl bg-[var(--bg-elevated)] focus-within:border-[#7C5CFF] transition-colors">
                      <Search size={16} className="text-[var(--text-tertiary)] mr-2" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => {
                          setCategorySearch(e.target.value);
                          setShowCategoryDropdown(true);
                        }}
                        onFocus={() => setShowCategoryDropdown(true)}
                        placeholder="Search category (e.g., Tech & Gadgets)"
                        className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)]"
                        disabled={campaignForm.categories.length >= 5}
                      />
                    </div>

                    {showCategoryDropdown && VALID_NICHES.filter(n => n.toLowerCase().includes(categorySearch.toLowerCase())).length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                        {VALID_NICHES.filter(n => n.toLowerCase().includes(categorySearch.toLowerCase())).map((niche, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              if (campaignForm.categories.length < 5 && !campaignForm.categories.includes(niche)) {
                                setCampaignForm(prev => ({ ...prev, categories: [...prev.categories, niche] }));
                                setCategorySearch("");
                                setShowCategoryDropdown(false);
                              }
                            }}
                            className="px-4 py-3 hover:bg-[var(--bg-elevated)] cursor-pointer text-sm text-[var(--text-primary)] transition-colors"
                          >
                            {niche}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {campaignForm.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {campaignForm.categories.map((cat, i) => (
                        <span key={i} className="px-3 py-1.5 bg-[var(--violet)]/10 text-[var(--violet)] border border-[var(--violet)]/20 rounded-lg text-xs font-medium flex items-center gap-1.5">
                          {cat}
                          <button onClick={() => setCampaignForm(prev => ({ ...prev, categories: prev.categories.filter(c => c !== cat) }))} className="hover:text-[var(--text-primary)] transition-colors">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Descriptive Brief / Details</label>
                  <textarea
                    rows={4}
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none leading-relaxed transition-colors"
                    placeholder="We're collaborating with a fast-growing brand and looking for creators who can turn heads..."
                  />
                </div>
              </div>
            )}

            {/* STEP 2: TARGET AUDIENCE */}
            {currentStep === 2 && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Language</label>
                    <select
                      value={campaignForm.language_type}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, language_type: e.target.value }))}
                      className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none cursor-pointer transition-colors"
                    >
                      <option value="Any language">Any language</option>
                      <option value="Select languages">Select languages (Custom)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Location</label>
                    <select
                      value={campaignForm.location_type}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, location_type: e.target.value }))}
                      className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none cursor-pointer transition-colors"
                    >
                      <option value="Pan India">Pan India</option>
                      <option value="Specific location">Specific location</option>
                    </select>
                  </div>
                </div>

                {campaignForm.location_type === "Specific location" && (
                  <div ref={locationRef}>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Specific Locations</label>
                    <div className="relative">
                      <div className="flex items-center px-4 py-3 border border-[var(--border-default)] rounded-xl bg-[var(--bg-elevated)] focus-within:border-[#7C5CFF] transition-colors">
                        <Search size={16} className="text-[var(--text-tertiary)] mr-2" />
                        <input
                          type="text"
                          value={locationSearch}
                          onChange={(e) => {
                            setLocationSearch(e.target.value);
                            setShowLocationDropdown(true);
                          }}
                          onFocus={() => setShowLocationDropdown(true)}
                          placeholder="Search city (e.g. Mumbai)"
                          className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)]"
                        />
                      </div>
                      {showLocationDropdown && INDIAN_CITIES.filter(n => n.toLowerCase().includes(locationSearch.toLowerCase())).length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                          {INDIAN_CITIES.filter(n => n.toLowerCase().includes(locationSearch.toLowerCase())).map((city, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                if (!campaignForm.specific_locations.includes(city)) {
                                  setCampaignForm(prev => ({ ...prev, specific_locations: [...prev.specific_locations, city] }));
                                  setLocationSearch("");
                                  setShowLocationDropdown(false);
                                }
                              }}
                              className="px-4 py-3 hover:bg-[var(--bg-elevated)] cursor-pointer text-sm text-[var(--text-primary)] transition-colors"
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {campaignForm.specific_locations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {campaignForm.specific_locations.map((loc, i) => (
                          <span key={i} className="px-3 py-1.5 bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-lg text-xs font-medium flex items-center gap-1.5">
                            {loc}
                            <button onClick={() => setCampaignForm(prev => ({ ...prev, specific_locations: prev.specific_locations.filter(c => c !== loc) }))} className="hover:text-red-400 transition-colors">
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Platforms</label>
                  <div className="flex flex-wrap gap-3">
                    {["Instagram", "YouTube", "Facebook", "Snapchat"].map(platform => (
                      <button
                        key={platform}
                        onClick={() => {
                          setCampaignForm(prev => {
                            if (prev.platforms.includes(platform)) {
                              return { ...prev, platforms: prev.platforms.filter(p => p !== platform) };
                            } else {
                              return { ...prev, platforms: [...prev.platforms, platform] };
                            }
                          })
                        }}
                        className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          campaignForm.platforms.includes(platform) 
                            ? 'bg-[#7C5CFF]/10 border-[#7C5CFF] text-[#7C5CFF]' 
                            : 'bg-[var(--bg-elevated)] border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[#7C5CFF]/50'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Number of Creators Needed</label>
                  <input
                    type="number"
                    value={campaignForm.max_creators}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, max_creators: parseInt(e.target.value) || 200 }))}
                    className="w-full max-w-[200px] px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none transition-colors"
                  />
                </div>

              </div>
            )}

            {/* STEP 3: BUDGET & REQUIREMENTS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Per Influencer Budget (₹)</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] text-[var(--text-tertiary)] mb-1 block">Minimum (₹2000+)</span>
                      <input
                        type="number"
                        min="2000"
                        value={campaignForm.budget_min}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, budget_min: e.target.value }))}
                        className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none"
                        placeholder="2000"
                      />
                    </div>
                    <div className="text-[var(--text-tertiary)] pt-4">-</div>
                    <div className="flex-1">
                      <span className="text-[10px] text-[var(--text-tertiary)] mb-1 block">Maximum (Leave blank for no limit)</span>
                      <input
                        type="number"
                        value={campaignForm.budget_max}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, budget_max: e.target.value }))}
                        className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none"
                        placeholder="e.g. 5000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Required Followers Range</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <span className="text-[10px] text-[var(--text-tertiary)] mb-1 block">Min Followers</span>
                      <input
                        type="number"
                        value={campaignForm.follower_min}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, follower_min: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none"
                      />
                    </div>
                    <div className="text-[var(--text-tertiary)] pt-4">-</div>
                    <div className="flex-1">
                      <span className="text-[10px] text-[var(--text-tertiary)] mb-1 block">Max Followers</span>
                      <input
                        type="number"
                        value={campaignForm.follower_max}
                        onChange={(e) => setCampaignForm(prev => ({ ...prev, follower_max: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
                    Note: If setting higher requirements, consider increasing the budget accordingly to attract top creators.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Campaign Deadline</label>
                  <CustomDatePicker
                    selected={campaignForm.deadline ? new Date(campaignForm.deadline) : null}
                    onChange={(date) => setCampaignForm(prev => ({ ...prev, deadline: date }))}
                    placeholder="Select application closing date"
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: DELIVERABLES */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-4 block uppercase tracking-wider flex items-center justify-between">
                    <span>Deliverables Checklist</span>
                    <button
                      onClick={() => setCampaignForm(prev => ({
                        ...prev,
                        deliverables: [...prev.deliverables, { duration: "30 second", collab_type: "Non collab", type: "reel", content_type: "Non promotional", script_type: "Script will be provided" }]
                      }))}
                      className="text-[var(--text-primary)] hover:text-[#7C5CFF] flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} /> Add Another
                    </button>
                  </label>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {campaignForm.deliverables.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-elevated)] relative group"
                        >
                          {campaignForm.deliverables.length > 1 && (
                            <button
                              onClick={() => {
                                const newDel = [...campaignForm.deliverables];
                                newDel.splice(index, 1);
                                setCampaignForm(prev => ({ ...prev, deliverables: newDel }));
                              }}
                              className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={16} />
                            </button>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] text-[var(--text-tertiary)] mb-1 block uppercase tracking-wider">Duration</span>
                              <input
                                type="text"
                                value={item.duration}
                                onChange={(e) => {
                                  const newDel = [...campaignForm.deliverables];
                                  newDel[index].duration = e.target.value;
                                  setCampaignForm(prev => ({ ...prev, deliverables: newDel }));
                                }}
                                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm bg-[var(--bg-base)] text-[var(--text-primary)] outline-none focus:border-[#7C5CFF]"
                                placeholder="e.g. 30 second"
                              />
                            </div>
                            
                            <div>
                              <span className="text-[10px] text-[var(--text-tertiary)] mb-1 block uppercase tracking-wider">Format Type</span>
                              <input
                                type="text"
                                value={item.type}
                                onChange={(e) => {
                                  const newDel = [...campaignForm.deliverables];
                                  newDel[index].type = e.target.value;
                                  setCampaignForm(prev => ({ ...prev, deliverables: newDel }));
                                }}
                                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm bg-[var(--bg-base)] text-[var(--text-primary)] outline-none focus:border-[#7C5CFF]"
                                placeholder="e.g. reel"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] text-[var(--text-tertiary)] mb-1 block uppercase tracking-wider">Collaboration Mode</span>
                              <select
                                value={item.collab_type}
                                onChange={(e) => {
                                  const newDel = [...campaignForm.deliverables];
                                  newDel[index].collab_type = e.target.value;
                                  setCampaignForm(prev => ({ ...prev, deliverables: newDel }));
                                }}
                                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm bg-[var(--bg-base)] text-[var(--text-primary)] outline-none focus:border-[#7C5CFF] cursor-pointer"
                              >
                                <option value="Non collab">Non-collaborative</option>
                                <option value="Collab">Collaborative</option>
                                <option value="UGC">UGC</option>
                              </select>
                            </div>

                            <div>
                              <span className="text-[10px] text-[var(--text-tertiary)] mb-1 block uppercase tracking-wider">Content Nature</span>
                              <select
                                value={item.content_type}
                                onChange={(e) => {
                                  const newDel = [...campaignForm.deliverables];
                                  newDel[index].content_type = e.target.value;
                                  setCampaignForm(prev => ({ ...prev, deliverables: newDel }));
                                }}
                                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm bg-[var(--bg-base)] text-[var(--text-primary)] outline-none focus:border-[#7C5CFF] cursor-pointer"
                              >
                                <option value="Non promotional">Non promotional</option>
                                <option value="Promotional">Promotional</option>
                              </select>
                            </div>

                            <div className="md:col-span-2">
                              <span className="text-[10px] text-[var(--text-tertiary)] mb-1 block uppercase tracking-wider">Script Preference</span>
                              <select
                                value={item.script_type}
                                onChange={(e) => {
                                  const newDel = [...campaignForm.deliverables];
                                  newDel[index].script_type = e.target.value;
                                  setCampaignForm(prev => ({ ...prev, deliverables: newDel }));
                                }}
                                className="w-full px-3 py-2 border border-[var(--border-default)] rounded-lg text-sm bg-[var(--bg-base)] text-[var(--text-primary)] outline-none focus:border-[#7C5CFF] cursor-pointer"
                              >
                                <option value="Script will be provided">Script will be provided</option>
                                <option value="Full script self creation">Full script self creation</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: GUIDELINES ASSETS */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Visual & Technical DOs</label>
                  <textarea
                    rows={4}
                    value={campaignForm.dos}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, dos: e.target.value }))}
                    className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none leading-relaxed transition-colors"
                    placeholder="List essential actions... (e.g. Show product label clearly in the first 3 seconds)"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Strict DONTs</label>
                  <textarea
                    rows={4}
                    value={campaignForm.donts}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, donts: e.target.value }))}
                    className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none leading-relaxed transition-colors"
                    placeholder="List strict avoidances... (e.g. Do not show competing brand logos)"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block uppercase tracking-wider">Drive Link / External Resource</label>
                  <input
                    value={campaignForm.guidelines_url}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, guidelines_url: e.target.value }))}
                    className="w-full px-4 py-3 border border-[var(--border-default)] rounded-xl text-sm bg-[var(--bg-elevated)] focus:border-[#7C5CFF] text-[var(--text-primary)] outline-none transition-colors"
                    type="url"
                    placeholder="https://docs.google.com/..."
                  />
                </div>

                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 text-center hover:bg-[var(--bg-card)] transition-colors group">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleGuidelinesUpload}
                    disabled={uploadingFile}
                  />
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-[var(--violet)]/10 text-[var(--violet)] flex items-center justify-center group-hover:scale-110 transition-transform">
                      {uploadingFile ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><UploadCloud size={24} /></motion.div> : <UploadCloud size={24} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{uploadingFile ? "Uploading File..." : "Or Upload Guidelines Asset directly"}</h4>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">PDF, DOCX, or Image file formats accepted</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 pt-6 border-t border-[var(--border-default)] flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1 || submitting}
            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${
              currentStep === 1 ? 'opacity-50 cursor-not-allowed text-[var(--text-tertiary)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>
          
          <div className="flex items-center gap-3">
            {currentStep === 5 ? (
              <>
                <button
                  onClick={() => handleSaveCampaign(true)}
                  disabled={submitting}
                  className="px-6 py-3 bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--text-primary)] rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSaveCampaign(false)}
                  disabled={submitting}
                  className="px-8 py-3 bg-[var(--violet)] text-white hover:bg-[#6b4de0] rounded-xl font-bold text-sm shadow-xl shadow-[var(--violet)]/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? "Launching..." : "Launch Campaign"} <Sparkles size={16} />
                </button>
              </>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-[var(--text-primary)] text-[var(--bg-base)] hover:opacity-90 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                Continue <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Shield, Users, Briefcase, HelpCircle, ChevronRight, Share2,
  ArrowLeft, Camera, Edit2, CheckCircle, AlertCircle, Globe, Grid, MapPin,
  MessageSquare, Package, Calendar, LogOut, Instagram, Youtube, Twitter, Linkedin,
  X, Smartphone, Mail, MonitorSmartphone, Link as LinkIcon, Download, Loader2, Plus, Trash2, Eye
} from "lucide-react";
import { useLoading } from "../contexts/LoadingContext";
import KycVerificationModal from "../components/KycVerificationModal";

export default function Settings() {
  const { user, logout, refreshUser } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  
  const [profile, setProfile] = useState({
    name: user?.name || "Ravi Sharma",
    profession: "Content Creation",
    niche: "Tech & Gadgets",
    subCategories: ["Mobile Reviews", "Laptops", "Smart Home"],
    language: "English, Hindi",
    location: "Mumbai, India",
    socials: [
      { id: 1, platform: 'Instagram', url: 'https://instagram.com/ravi_tech' },
      { id: 2, platform: 'YouTube', url: 'https://youtube.com/c/RaviTech' }
    ],
    barterPrefs: ["High-end Products", "Travel Experiences"],
    paymentTimeline: "Within 30 Days",
    phone: "+91 98765 43210",
    businessEmail: "collabs@ravitech.in"
  });

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!user) return;
      startLoading();
      try {
        if (user.role === "brand") {
          const { data } = await api.get("/brands/me");
          if (mounted && data) {
            setProfile(prev => ({
              ...prev,
              name: data.company_name || prev.name,
              niche: data.industry || "FMCG / D2C",
              subCategories: [],
              language: "English",
              location: (data.city || data.state) ? `${data.city || ""}, ${data.state || ""}`.replace(/^, |, $/g, "") : prev.location,
              socials: data.website ? [{ id: 1, platform: "Website", url: data.website }] : [],
              businessEmail: data.email || prev.businessEmail,
              phone: data.phone || prev.phone,
              profession: "Corporate Brand"
            }));
          }
        } else {
          const { data } = await api.get(`/creators/${user.id}`);
          if (mounted && data) {
            const extras = data.rate_card && data.rate_card.extras ? data.rate_card.extras : {};
            setProfile(prev => ({
              ...prev,
              name: data.name || prev.name,
              niche: data.category || prev.niche,
              subCategories: data.sub_categories || prev.subCategories,
              language: data.languages ? data.languages.join(", ") : prev.language,
              location: data.city || data.state ? `${data.city || ''}, ${data.state || ''}`.replace(/^, |, $/g, '') : prev.location,
              socials: data.instagram || data.youtube || data.twitter || data.linkedin ? [
                ...(data.instagram ? [{id: 1, platform: 'Instagram', url: data.instagram}] : []),
                ...(data.youtube ? [{id: 2, platform: 'YouTube', url: data.youtube}] : []),
                ...(data.twitter ? [{id: 3, platform: 'Twitter', url: data.twitter}] : []),
                ...(data.linkedin ? [{id: 4, platform: 'LinkedIn', url: data.linkedin}] : []),
              ] : prev.socials,
              businessEmail: data.email || prev.businessEmail,
              barterPrefs: data.barter ? [data.barter.replace(/_/g, ' ')] : prev.barterPrefs,
              paymentTimeline: data.payment_terms || prev.paymentTimeline,
              profession: extras.profession || prev.profession,
              phone: extras.phone || prev.phone
            }));
          }
        }
      } catch (e) {
        console.warn("Could not load profile via api, falling back.", e);
      } finally {
        if (mounted) stopLoading();
      }
    }
    loadData();
    return () => { mounted = false };
  }, [user, startLoading, stopLoading]);

  // KYC States
  const [kycObj, setKycObj] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [showKycVerificationModal, setShowKycVerificationModal] = useState(false);

  // Creator KYC inputs
  const [identityType, setIdentityType] = useState("Aadhaar");
  const [identityNum, setIdentityNum] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [socialEngagementProof, setSocialEngagementProof] = useState("");
  const [gstin, setGstin] = useState("");

  // Brand KYC inputs
  const [gstCert, setGstCert] = useState("");
  const [brandPan, setBrandPan] = useState("");
  const [incProof, setIncProof] = useState("");
  const [pocName, setPocName] = useState("");
  const [pocDesignation, setPocDesignation] = useState("");
  const [pocEmail, setPocEmail] = useState("");
  const [pocPhone, setPocPhone] = useState("");
  const [brandSiteUrl, setBrandSiteUrl] = useState("");

  // Upload simulation states
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const fetchKycStatus = async () => {
    try {
      const { data } = await api.get("/verifications/me");
      setKycObj(data);
      if (data && data.documents) {
        const doc = data.documents;
        if (user.role === "creator") {
          setIdentityType(doc.identity_type || "Aadhaar");
          setIdentityNum(doc.identity_num || "");
          setBankName(doc.bank_name || "");
          setBankAccount(doc.bank_account || "");
          setBankIfsc(doc.bank_ifsc || "");
          setUpiId(doc.upi_id || "");
          setSocialHandle(doc.social_handle || "");
          setSocialEngagementProof(doc.engagement_proof || "");
          setGstin(doc.gstin || "");
        } else if (user.role === "brand") {
          setGstCert(doc.gst_cert || "");
          setBrandPan(doc.brand_pan || "");
          setIncProof(doc.incorporation_proof || "");
          setPocName(doc.poc_name || "");
          setPocDesignation(doc.poc_designation || "");
          setPocEmail(doc.poc_email || "");
          setPocPhone(doc.poc_phone || "");
          setBrandSiteUrl(doc.website || "");
        }
        if (doc.uploaded_files) {
          setUploadedFiles(doc.uploaded_files);
        }
      }
    } catch (e) {
      console.warn("Error fetching KYC", e);
    } finally {
      setKycLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, [user]);

  useEffect(() => {
    if (!kycLoading && (window.location.search?.includes("section=kyc") || window.location.hash === "#kyc")) {
      setShowKycVerificationModal(true);
    }
  }, [kycLoading]);

  const handleSimulatedUpload = (type) => {
    let filename = type === "id" ? `${identityType}_Card_Proof.jpg` : "Business_GST_TaxDoc.pdf";
    if (type === "bank") filename = "Bank_CancelCheck.png";
    if (type === "social") filename = "Followers_Screenshot.jpg";

    const newFile = {
      name: filename,
      size: "1.4 MB",
      url: "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=500"
    };

    setUploadedFiles(prev => [...prev, newFile]);
    toast.success(`${filename} document added!`);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    toast.info("Attachment removed");
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();

    if (user.role === "creator") {
      if (!identityNum) {
        toast.error("Please enter your identity card (Aadhaar/PAN) number.");
        return;
      }
      if (!bankAccount || !bankIfsc) {
        toast.error("Please fill in your Bank Account & IFSC code details.");
        return;
      }
      if (!upiId) {
        toast.error("Please provide UPI ID representation.");
        return;
      }
      if (!socialHandle) {
        toast.error("Please enter Instagram or YouTube handle.");
        return;
      }
    } else if (user.role === "brand") {
      if (!gstCert) {
        toast.error("GST Certificate serial/status number is mandatory for Brands.");
        return;
      }
      if (!brandPan) {
        toast.error("Please enter Business PAN card number.");
        return;
      }
      if (!pocName || !pocEmail || !pocPhone) {
        toast.error("Please fill in Point of Contact name, work email and phone.");
        return;
      }
    }

    setKycSubmitting(true);
    try {
      const docsObj = user.role === "creator" ? {
        identity_type: identityType,
        identity_num: identityNum,
        bank_name: bankName,
        bank_account: bankAccount,
        bank_ifsc: bankIfsc,
        upi_id: upiId,
        social_handle: socialHandle,
        engagement_proof: socialEngagementProof || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300",
        gstin: gstin || "",
        uploaded_files: uploadedFiles
      } : {
        gst_cert: gstCert,
        brand_pan: brandPan,
        incorporation_proof: incProof || "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=300",
        poc_name: pocName,
        poc_designation: pocDesignation,
        poc_email: pocEmail,
        poc_phone: pocPhone,
        website: brandSiteUrl,
        uploaded_files: uploadedFiles
      };

      await api.post("/verifications/request", {
        documents: docsObj,
        note: `KYC direct registration submitted by ${user.name}`
      });

      toast.success("KYC request submitted! Manual compliance verification normally takes 24-48 hours.");
      fetchKycStatus();
      if (refreshUser) refreshUser();
    } catch (e) {
      toast.error("Failed to submit verification keys, check fields and retry.");
    } finally {
      setKycSubmitting(false);
    }
  };

  const [activeModal, setActiveModal] = useState(null); // 'name', 'socials', 'niche', etc.
  const [isSaving, setIsSaving] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  // Temporary state for the modal forms
  const [formData, setFormData] = useState({});

  const handleEdit = (field) => {
    setFormData(profile);
    setActiveModal(field);
    setOtpSent(false);
    setOtpCode("");
  };

  const closeModal = () => {
    setActiveModal(null);
    setFormData({});
    setOtpSent(false);
    setOtpCode("");
  };

  const handleSave = async () => {
    if (['phone', 'businessEmail'].includes(activeModal) && !otpSent) {
      startLoading();
      // Simulate OTP send delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setOtpSent(true);
      stopLoading();
      toast.success("Verification code sent!");
      return;
    }

    if (['phone', 'businessEmail'].includes(activeModal) && otpSent) {
      if (otpCode !== "1234") {
        toast.error("Invalid verification code (use 1234 for demo)");
        return;
      }
    }

    startLoading();
    
    try {
      // Basic splitting for location and language
      const locParts = (formData.location || "").split(",");
      const city = locParts[0]?.trim() || "";
      const state = locParts[1]?.trim() || "";
      const languages = (formData.language || "").split(",").map(s => s.trim()).filter(Boolean);
      
      const insta = formData.socials?.find(s => s.platform === 'Instagram')?.url || "";
      const yt = formData.socials?.find(s => s.platform === 'YouTube')?.url || "";
      const twit = formData.socials?.find(s => s.platform === 'Twitter')?.url || "";
      const link = formData.socials?.find(s => s.platform === 'LinkedIn')?.url || "";

      let currRateCard = {};
      try {
        const { data: currData } = await api.get(`/creators/${user.id}`);
        currRateCard = currData?.rate_card || {};
      } catch (e) { }

      const payload = {
        name: formData.name,
        category: formData.niche,
        sub_categories: formData.subCategories,
        languages: languages,
        city: city,
        state: state,
        email: formData.businessEmail,
        instagram: insta,
        youtube: yt,
        twitter: twit,
        linkedin: link,
        barter: formData.barterPrefs?.[0]?.replace(/ /g, '_') || 'barter_ok',
        payment_terms: formData.paymentTimeline,
        rate_card: {
           ...currRateCard,
           extras: {
             profession: formData.profession,
             phone: formData.phone
           }
        }
      };

      await api.post('/creators/profile', payload);
      
      refreshUser();
      setProfile(formData);
      toast.success("Profile updated successfully!");
    } catch(err) {
      console.error(err);
      toast.error("Failed to update profile.");
    } finally {
      stopLoading();
      closeModal();
    }
  };

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderModalContent = () => {
    switch (activeModal) {
      case 'name':
      case 'profession':
      case 'language':
      case 'location': {
        const labels = {
          name: "Update Name", profession: "Update Profession", language: "Update Language",
          location: "Update Location"
        };
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-white">{labels[activeModal]}</h3>
            <input 
              type="text" 
              value={formData[activeModal]} 
              onChange={e => handleFormChange(activeModal, e.target.value)}
              className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] transition-colors mb-6 text-white"
            />
          </>
        );
      }
      case 'phone':
      case 'businessEmail': {
        const labels = {
          phone: "Change Phone Number", businessEmail: "Update Business Email"
        };
        const destLabel = activeModal === 'phone' ? "Enter new phone number" : "Enter new business email";
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-white">{labels[activeModal]}</h3>
            {!otpSent ? (
              <div className="mb-6">
                <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">{destLabel}</label>
                <input 
                  type="text" 
                  value={formData[activeModal]} 
                  onChange={e => handleFormChange(activeModal, e.target.value)}
                  className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] transition-colors text-white"
                />
              </div>
            ) : (
              <div className="mb-6">
                <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">Enter Verification Code</label>
                <input 
                  type="text" 
                  value={otpCode} 
                  placeholder="1234"
                  onChange={e => setOtpCode(e.target.value)}
                  className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] transition-colors text-white text-center font-mono tracking-[0.5em] text-xl"
                  maxLength={4}
                />
                <p className="text-xs text-white/40 mt-3 text-center">We've sent a 4-digit code to {formData[activeModal]}</p>
              </div>
            )}
          </>
        );
      }
      case 'niche':
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-white">Content Category</h3>
            <div className="mb-4">
              <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">Primary Category</label>
              <select 
                value={formData.niche}
                onChange={e => handleFormChange('niche', e.target.value)}
                className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] text-white"
              >
                <option>Tech & Gadgets</option>
                <option>Fashion & Beauty</option>
                <option>Travel & Lifestyle</option>
                <option>Health & Fitness</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">Sub-categories (comma separated)</label>
              <input 
                type="text"
                value={formData.subCategories.join(", ")}
                onChange={e => handleFormChange('subCategories', e.target.value.split(",").map(s => s.trim()))}
                className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] text-white"
              />
            </div>
          </>
        );
      case 'socials':
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-white">Edit Socials</h3>
            <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto scroll-thin">
              {formData.socials.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select 
                    value={s.platform}
                    onChange={e => {
                      const newSocials = [...formData.socials];
                      newSocials[i].platform = e.target.value;
                      handleFormChange('socials', newSocials);
                    }}
                    className="w-1/3 bg-[#0a0a14] border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7C5CFF] text-white"
                  >
                    <option>Instagram</option><option>YouTube</option><option>Twitter</option><option>LinkedIn</option><option>TikTok</option>
                  </select>
                  <input 
                    type="text" 
                    value={s.url}
                    onChange={e => {
                      const newSocials = [...formData.socials];
                      newSocials[i].url = e.target.value;
                      handleFormChange('socials', newSocials);
                    }}
                    className="flex-1 bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C5CFF] text-white"
                  />
                  <button onClick={() => {
                    const newSocials = formData.socials.filter((_, idx) => idx !== i);
                    handleFormChange('socials', newSocials);
                  }} className="p-2 text-white/40 hover:text-red-500 transition-colors">
                    <Trash2 size={18}/>
                  </button>
                </div>
              ))}
              <button 
                onClick={() => handleFormChange('socials', [...formData.socials, { id: Date.now(), platform: 'Instagram', url: '' }])}
                className="w-full py-2.5 rounded-xl border border-dashed border-white/20 text-white/60 font-semibold text-sm hover:border-[#7C5CFF]/50 hover:text-[#7C5CFF] transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Plus size={16}/> Add another profile
              </button>
            </div>
          </>
        );
      case 'collabPrefs':
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-white">Collaboration Preferences</h3>
            <div className="mb-5">
               <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Barter Preferences</label>
               <div className="space-y-2">
                 {["High-end Products", "Travel Experiences", "Service Exchange", "Food & Dining"].map((opt) => (
                   <label key={opt} className="flex items-center gap-3 bg-[#0a0a14] border border-white/5 rounded-xl p-3 cursor-pointer hover:border-white/20 transition-all">
                     <input type="checkbox" className="w-4 h-4 rounded accent-[#7C5CFF]"
                       checked={formData.barterPrefs.includes(opt)}
                       onChange={(e) => {
                         const newPrefs = e.target.checked 
                           ? [...formData.barterPrefs, opt] 
                           : formData.barterPrefs.filter(p => p !== opt);
                         handleFormChange('barterPrefs', newPrefs);
                       }}
                     />
                     <span className="text-sm font-medium text-white">{opt}</span>
                   </label>
                 ))}
               </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 mb-2 block uppercase tracking-wider">Payment Timelines</label>
               <select 
                  value={formData.paymentTimeline}
                  onChange={e => handleFormChange('paymentTimeline', e.target.value)}
                  className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7C5CFF] text-white"
                >
                  <option>Advance Payment</option>
                  <option>Within 7 Days</option>
                  <option>Within 30 Days</option>
                  <option>After Project Completion</option>
                </select>
            </div>
          </>
        );
      case 'qr_code': {
        const profileUrl = window.location.origin + "/creator/" + (user?.id || 'demo');
        const downloadQR = () => {
          const svg = document.getElementById("profile-qr-code");
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width; canvas.height = img.height;
            ctx.fillStyle = "white"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const downloadLink = document.createElement("a");
            downloadLink.download = `${profile.name}_qr.png`;
            downloadLink.href = canvas.toDataURL("image/png");
            downloadLink.click();
            toast.success("QR Code downloaded!");
          };
          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        };

        return (
          <div className="flex flex-col items-center py-4">
            <h3 className="font-display font-bold text-xl mb-6 text-white w-full">Your Profile QR</h3>
            <div className="bg-white p-4 rounded-3xl shadow-xl mb-6">
              <QRCodeSVG id="profile-qr-code" value={profileUrl} size={180} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} />
            </div>
            <p className="text-sm text-white/70 mb-6 text-center">Scan this code to view your Ybex Creator Profile.</p>
            <button onClick={downloadQR} className="w-full py-3 bg-[#7C5CFF] hover:bg-[#6B4AFF] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#7C5CFF]/20 flex items-center justify-center gap-2">
              <Download size={18}/> Download QR Code
            </button>
          </div>
        );
      }
      case 'activeSessions':
        return (
          <>
            <h3 className="font-display font-bold text-xl mb-4 text-white">Active Sessions</h3>
            <div className="space-y-3 mb-6">
              <div className="bg-[#0a0a14] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-sm">MacBook Pro (Chrome)</div>
                  <div className="text-white/50 text-xs mt-1">Mumbai, India • Active Now</div>
                </div>
                <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase rounded">Current</div>
              </div>
              <div className="bg-[#0a0a14] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white text-sm">iPhone 14 Pro (Safari)</div>
                  <div className="text-white/50 text-xs mt-1">Mumbai, India • 2 hours ago</div>
                </div>
                <button className="text-red-500 text-xs font-semibold hover:underline">Log Out</button>
              </div>
            </div>
            <button onClick={() => {toast.success("Logged out of all other sessions"); closeModal()}} className="w-full py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold rounded-xl transition-all">
              Log out all other sessions
            </button>
          </>
        )
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-none px-4 md:px-8 py-6 sm:py-10 animate-in fade-in slide-in-from-right-4 duration-300 relative pb-24" data-testid="settings-page">
      
      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-[#1A1A2E] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
            >
              <button onClick={closeModal} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={20}/></button>
              
              {renderModalContent()}

              {['name', 'profession', 'language', 'location', 'phone', 'businessEmail', 'niche', 'socials', 'collabPrefs'].includes(activeModal) && (
                <div className="flex items-center gap-3 mt-6">
                  <button onClick={closeModal} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors" disabled={isSaving}>Cancel</button>
                  <button onClick={handleSave} disabled={isSaving} className="flex-1 py-3 rounded-xl font-bold text-sm bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2">
                    {isSaving ? <><Loader2 size={18} className="animate-spin" /> {otpSent ? 'Updating...' : 'Sending...'}</> : 
                     (['phone', 'businessEmail'].includes(activeModal) && !otpSent) ? 'Send Verification Code' : 
                     (['phone', 'businessEmail'].includes(activeModal) && otpSent) ? 'Verify & Save' : 'Save Changes'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-white bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Profile & Settings</h1>
        <button 
          onClick={() => window.open(`/creator/${user.id}`, '_blank')}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A1A2E] border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)] rounded-xl text-sm font-bold text-white transition-colors"
        >
          <Eye size={16} /> View Public Profile
        </button>
      </div>

      {/* KYC Options Row Action */}
      <div className="mb-10 bg-[#131326]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C5CFF]/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <span className={`p-3 rounded-2xl border shrink-0 ${
            (kycObj?.status === "approved" || user?.verified)
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm"
              : kycObj?.status === "pending"
              ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse shadow-sm"
              : kycObj?.status === "rejected"
              ? "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-sm"
              : "bg-[#7C5CFF]/10 text-[#9D7CFF] border-[#7C5CFF]/20 shadow-sm"
          }`}>
            <Shield size={22} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-black text-white font-sans">KYC Trust Verification Portal</h2>
              {(kycObj?.status === "approved" || user?.verified) ? (
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">Approved</span>
              ) : kycObj?.status === "pending" ? (
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 font-bold animate-pulse">Under Review</span>
              ) : kycObj?.status === "rejected" ? (
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold">Action Required</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 font-bold">Required</span>
              )}
            </div>
            
            <p className="text-xs text-white/50 mt-1 max-w-xl leading-relaxed font-medium">
              {(kycObj?.status === "approved" || user?.verified)
                ? "Your document credentials are confirmed. Settlement routes are mapped and approved for payouts."
                : kycObj?.status === "pending"
                ? "Your KYC credentials are currently undergoing review by compliance officers (resolves in 24 hours)."
                : kycObj?.status === "rejected"
                ? `Submission rejected: "${kycObj.review_note || "Invalid or blurry ID copies"}". Fix credentials immediately.`
                : "Enter government identity number, settlement account and attach images to verify profile legitimacy."}
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowKycVerificationModal(true)}
          className={`px-6 py-3 cursor-pointer rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 whitespace-nowrap text-white ${
            (kycObj?.status === "approved" || user?.verified)
              ? "bg-[#10B981] hover:bg-emerald-500 shadow-lg shadow-emerald-500/15"
              : kycObj?.status === "pending"
              ? "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/20"
              : "bg-[#7C5CFF] hover:bg-[#6c4be0] shadow-lg shadow-[#7C5CFF]/15 hover:shadow-[#7C5CFF]/25 transform hover:-translate-y-0.5"
          }`}
        >
          {(kycObj?.status === "approved" || user?.verified)
            ? "View Verified Badges"
            : kycObj?.status === "pending"
            ? "Check Portal Status"
            : "Complete KYC Portal Verification"}
        </button>
      </div>

      <KycVerificationModal 
        isOpen={showKycVerificationModal} 
        onClose={() => {
          setShowKycVerificationModal(false);
          fetchKycStatus();
        }} 
        onComplete={() => {
          fetchKycStatus();
          if (refreshUser) refreshUser();
        }}
      />

      {/* Hide original embedded block code */}
      {false && (
      <section id="kyc-section" className="mb-10 bg-[#131326]/90 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7C5CFF]/5 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-start gap-4">
            <span className={`p-3.5 rounded-2xl border ${
              (kycObj?.status === "approved" || user?.verified)
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : kycObj?.status === "pending"
                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 animate-pulse"
                : kycObj?.status === "rejected"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-white/5 text-white/50 border-white/10"
            }`}>
              <Shield size={24} />
            </span>
            <div>
              <h2 className="font-display text-xl font-bold text-white">KYC & Financial Compliance</h2>
              <p className="text-xs text-white/50 mt-1">Local laws require ID & Payout Verification compliance to unlock full campaign interactions.</p>
            </div>
          </div>

          <div>
            {(kycObj?.status === "approved" || user?.verified) ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <CheckCircle size={14} /> Account Verified
              </span>
            ) : kycObj?.status === "pending" ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-bold">
                <Loader2 size={14} className="animate-spin" /> Pending Approval (24-48h)
              </span>
            ) : kycObj?.status === "rejected" ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold">
                <AlertCircle size={14} /> Rejected - Fix Details
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/60 text-xs font-bold">
                <AlertCircle size={14} /> Action Required
              </span>
            )}
          </div>
        </div>

        {kycLoading ? (
          <div className="py-8 flex flex-col items-center justify-center text-white/50">
            <Loader2 size={32} className="animate-spin text-[#7C5CFF] mb-3" />
            <p className="text-xs">Loading compliance credentials...</p>
          </div>
        ) : (kycObj?.status === "approved" || user?.verified) ? (
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 text-sm leading-relaxed text-emerald-300 flex items-start gap-3">
            <CheckCircle size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">KYC Complete & Account Unlocked!</strong>
              <p className="text-xs text-white/60 mt-1.5">You are now fully verified to take physical financial actions. All payouts can be dropped directly to your linked account within 24-48 hours. A trustworthy checker tag is active on your explore layout.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5 text-xs text-white/50">
                {user.role === "creator" ? (
                  <>
                    <div>Verified ID: <span className="font-mono text-white font-bold">{identityType} (*-{identityNum?.slice(-4) || "XXXX"})</span></div>
                    <div>Payout Option: <span className="text-white font-bold">{upiId || `${bankName} (${bankAccount?.slice(-4) || "XXXX"})`}</span></div>
                  </>
                ) : (
                  <>
                    <div>Business GST: <span className="font-mono text-white font-bold">{gstCert}</span></div>
                    <div>Liason contact: <span className="text-white font-bold">{pocName} ({pocDesignation})</span></div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {kycObj?.status === "pending" ? (
              <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-2xl p-5 text-sm text-yellow-300 flex items-start gap-3">
                <Loader2 size={18} className="text-yellow-400 shrink-0 mt-0.5 animate-spin" />
                <div>
                  <strong className="text-white">Documents Under Regulatory Review</strong>
                  <p className="text-xs text-white/60 mt-1.5">Our manual compliance agents are evaluating your submission (Aadhaar/PAN details, point-of-contacts, bank validity checks, and handles). Complete resolution usually takes 24-48 hours. You will receive an immediate inbox alert if anything is rejected!</p>
                </div>
              </div>
            ) : (
              <div>
                {kycObj?.status === "rejected" && (
                  <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-5 text-sm text-red-300 flex items-start gap-3 mb-6">
                    <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white font-bold">Verification Correction Needed</strong>
                      <p className="text-xs text-white/70 mt-1.5 bg-red-500/10 px-3 py-2 rounded-xl border border-red-500/10">Rejection Reason: {kycObj.review_note || "Documents were blurry or could not be verified."}</p>
                      <p className="text-xs text-white/50 mt-2">Please fix the discrepancy and resubmit valid details below.</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleKycSubmit} className="space-y-6">
                  {user.role === "creator" ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">Identity Card Type</label>
                          <select 
                            value={identityType}
                            onChange={e => setIdentityType(e.target.value)}
                            className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#7C5CFF] text-white"
                          >
                            <option value="Aadhaar">Aadhaar Card (UIDAI)</option>
                            <option value="PAN">PAN Card (Income Tax)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">{identityType} Card Number</label>
                          <input 
                            type="text" 
                            required
                            placeholder={identityType === "Aadhaar" ? "XXXX XXXX XXXX" : "ABCDE1234F"}
                            value={identityNum}
                            onChange={e => setIdentityNum(e.target.value)}
                            className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#7C5CFF] text-white font-mono uppercase"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Bank Details & UPI Integration</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="text-[10px] font-semibold text-white/40 mb-1 block uppercase">Bank Name</label>
                            <input 
                              type="text" 
                              placeholder="HDFC, SBI, etc."
                              value={bankName}
                              onChange={e => setBankName(e.target.value)}
                              className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3.5 py-2.5 text-base md:text-xs text-white focus:outline-none focus:border-[#7C5CFF]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-white/40 mb-1 block uppercase">Account Number</label>
                            <input 
                              type="text" 
                              required
                              placeholder="30129038012"
                              value={bankAccount}
                              onChange={e => setBankAccount(e.target.value)}
                              className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3.5 py-2.5 text-base md:text-xs text-white font-mono focus:outline-none focus:border-[#7C5CFF]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-white/40 mb-1 block uppercase">IFSC Code</label>
                            <input 
                              type="text" 
                              required
                              placeholder="HDFC0000213"
                              value={bankIfsc}
                              onChange={e => setBankIfsc(e.target.value)}
                              className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3.5 py-2.5 text-base md:text-xs text-white font-mono uppercase focus:outline-none focus:border-[#7C5CFF]"
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5">
                          <label className="text-[10px] font-semibold text-white/45 mb-1.5 block uppercase">UPI ID Address representation</label>
                          <input 
                            type="text" 
                            required
                            placeholder="username@okaxis"
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#7C5CFF] text-white font-mono"
                          />
                          <p className="text-[10px] text-white/30 mt-1">We will issue a secure Penny Drop transaction of ₹1.00 to verify this bank / UPI ID destination instantly upon submission.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">Social Handle</label>
                          <input 
                            type="text" 
                            required
                            placeholder="@ravi_vlogs or YouTube Channel link"
                            value={socialHandle}
                            onChange={e => setSocialHandle(e.target.value)}
                            className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#7C5CFF] text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">GSTIN Number (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="27ABCDE1234F1Z5"
                            value={gstin}
                            onChange={e => setGstin(e.target.value)}
                            className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#7C5CFF] text-white font-mono uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">GSTIN Certificate ID Number (Mandatory)</label>
                          <input 
                            type="text" 
                            required
                            placeholder="27AAACN1234E1Z5"
                            value={gstCert}
                            onChange={e => setGstCert(e.target.value)}
                            className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#7C5CFF] text-white font-mono uppercase"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">Company PAN Card</label>
                          <input 
                            type="text" 
                            required
                            placeholder="AAACB1234C"
                            value={brandPan}
                            onChange={e => setBrandPan(e.target.value)}
                            className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#7C5CFF] text-white font-mono uppercase"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Authorized Point of Contact (POC) details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="text-[10px] font-semibold text-white/40 mb-1 block uppercase">Full Name</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Karan Johar"
                              value={pocName}
                              onChange={e => setPocName(e.target.value)}
                              className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3.5 py-2.5 text-base md:text-xs text-white focus:outline-none focus:border-[#7C5CFF]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-white/40 mb-1 block uppercase">POC corporate designation</label>
                            <input 
                              type="text" 
                              required
                              placeholder="Marketing lead, Founder, etc."
                              value={pocDesignation}
                              onChange={e => setPocDesignation(e.target.value)}
                              className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3.5 py-2.5 text-base md:text-xs text-white focus:outline-none focus:border-[#7C5CFF]"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-semibold text-white/40 mb-1 block uppercase">Corporate domain Email</label>
                            <input 
                              type="email" 
                              required
                              placeholder="karan@novabrand.com"
                              value={pocEmail}
                              onChange={e => setPocEmail(e.target.value)}
                              className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3.5 py-2.5 text-base md:text-xs text-white focus:outline-none focus:border-[#7C5CFF]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-semibold text-white/40 mb-1 block uppercase">Direct contact phone</label>
                            <input 
                              type="text" 
                              required
                              placeholder="+91 XXXXX XXXXX"
                              value={pocPhone}
                              onChange={e => setPocPhone(e.target.value)}
                              className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-3.5 py-2.5 text-base md:text-xs text-white focus:outline-none focus:border-[#7C5CFF]"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-white/50 mb-1.5 block uppercase tracking-wider">Official Website / Corporate Landing Page URL</label>
                        <input 
                          type="text" 
                          required
                          placeholder="https://novabrand.com"
                          value={brandSiteUrl}
                          onChange={e => setBrandSiteUrl(e.target.value)}
                          className="w-full bg-[#0a0a14] border border-white/10 rounded-xl px-4 py-3 text-base md:text-sm focus:outline-none focus:border-[#7C5CFF] text-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Attachment Block */}
                  <div className="pt-4 border-t border-white/5">
                    <label className="text-xs font-semibold text-white/50 mb-2.5 block uppercase tracking-wider">Required Document Copies (Upload Verification screenshot)</label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      <button 
                        type="button" 
                        onClick={() => handleSimulatedUpload("id")}
                        className="py-3 px-4 rounded-xl border border-dashed border-white/20 text-white/60 text-xs font-bold hover:border-[#7C5CFF]/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1.5"
                      >
                        Attach {identityType === "Aadhaar" ? "Aadhaar ID Copy" : "PAN ID Copy"}
                      </button>
                      
                      {user.role === "creator" ? (
                        <button 
                          type="button" 
                          onClick={() => handleSimulatedUpload("bank")}
                          className="py-3 px-4 rounded-xl border border-dashed border-white/20 text-white/60 text-xs font-bold hover:border-[#7C5CFF]/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1.5"
                        >
                          Attach Cancelled Cheque
                        </button>
                      ) : (
                        <button 
                          type="button" 
                          onClick={() => handleSimulatedUpload("id")}
                          className="py-3 px-4 rounded-xl border border-dashed border-white/20 text-white/60 text-xs font-bold hover:border-[#7C5CFF]/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1.5"
                        >
                          Attach GST registration Cert
                        </button>
                      )}

                      <button 
                        type="button" 
                        onClick={() => handleSimulatedUpload(user.role === "creator" ? "social" : "id")}
                        className="py-3 px-4 rounded-xl border border-dashed border-white/20 text-white/60 text-xs font-bold hover:border-[#7C5CFF]/40 hover:text-white transition-all bg-white/5 hover:bg-white/10 flex items-center justify-center gap-1.5"
                      >
                        {user.role === "creator" ? "Attach Follower Proof Copy" : "Attach Incorporation Certificate"}
                      </button>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="bg-[#0b0b14] rounded-2xl p-3 border border-white/5 space-y-2 mb-4">
                        <div className="text-[10px] font-semibold text-white/40 uppercase pl-1">Attached Documents ({uploadedFiles.length})</div>
                        {uploadedFiles.map((f, id) => (
                          <div key={id} className="flex items-center justify-between text-xs px-3 py-2 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-2">
                              <span className="text-emerald-400 font-bold font-mono">✓</span>
                              <span className="text-white/80 font-medium truncate max-w-[200px]">{f.name}</span>
                              <span className="text-white/30 text-[10px]">({f.size})</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFile(id)}
                              className="text-white/40 hover:text-red-500 hover:bg-red-500/10 p-1 rounded-lg transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button 
                      type="submit" 
                      disabled={kycSubmitting}
                      className="w-full sm:w-auto px-8 py-3 bg-[#10B981] hover:bg-emerald-600 font-bold rounded-xl text-sm transition-all text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15"
                    >
                      {kycSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Submitting credentials...
                        </>
                      ) : (
                        <>
                          Submit Verification Request
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          
          {/* BASIC PROFILE INFO */}
          <section>
            <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 ml-2">Basic Profile Info</h2>
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl flex flex-col shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] overflow-hidden">
              <EditableRow icon={User} label="Name" value={profile.name} onEdit={() => handleEdit('name')} border />
              <EditableRow icon={Briefcase} label="Profession" value={profile.profession} onEdit={() => handleEdit('profession')} border />
              <EditableRow icon={MessageSquare} label="Primary Language" value={profile.language} onEdit={() => handleEdit('language')} border />
              <EditableRow icon={MapPin} label="Current Location" value={profile.location} onEdit={() => handleEdit('location')} border />
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex gap-4">
                  <div className="mt-0.5"><Grid size={20} className="text-[#9CA3AF]" /></div>
                  <div>
                    <div className="font-semibold text-white">Niche & Focus</div>
                    <div className="text-[#9CA3AF] text-sm mt-1">
                      <span className="text-[#10B981] font-medium block mb-1">{profile.niche}</span>
                      <div className="flex flex-wrap gap-1">
                        {profile.subCategories.map(s => <span key={s} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[10px]">{s}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleEdit('niche')} className="p-2 hover:bg-white/10 rounded-lg text-white/50 transition-colors" title="Edit Niche"><Edit2 size={16}/></button>
              </div>
            </div>
          </section>

          {/* MY SOCIALS */}
          <section>
            <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 ml-2">My Socials</h2>
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] p-1">
              {profile.socials.map((social, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-white/5 m-1 rounded-xl">
                   <div className="flex items-center gap-3">
                     {social.platform === 'Instagram' && <Instagram size={18} className="text-pink-500" />}
                     {social.platform === 'YouTube' && <Youtube size={18} className="text-red-500" />}
                     {social.platform === 'Twitter' && <Twitter size={18} className="text-blue-400" />}
                     {social.platform === 'LinkedIn' && <Linkedin size={18} className="text-blue-600" />}
                     {!['Instagram', 'YouTube', 'Twitter', 'LinkedIn'].includes(social.platform) && <Globe size={18} className="text-white/70" />}
                     <div className="text-sm font-semibold text-white">{social.platform}</div>
                   </div>
                   <div className="flex items-center gap-3 text-white/40">
                      <span className="text-xs truncate max-w-[120px] sm:max-w-[180px]">{social.url}</span>
                   </div>
                 </div>
              ))}
              <div onClick={() => handleEdit('socials')} className="flex items-center justify-center p-4 m-1 cursor-pointer hover:bg-white/5 rounded-xl transition-all border border-dashed border-white/10 group">
                 <div className="text-[#7C3AED] text-sm font-bold flex items-center gap-2 tracking-wide"><Edit2 size={14} className="group-hover:rotate-12 transition-transform" /> MANAGE SOCIALS</div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* COLLABORATION PREFERENCES */}
          <section>
            <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 ml-2">Partnership Strategy</h2>
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl flex flex-col shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] overflow-hidden">
               <div className="flex items-center justify-between px-5 py-4">
                <div className="flex gap-4">
                  <div className="mt-0.5"><Package size={20} className="text-[#9CA3AF]" /></div>
                  <div>
                    <div className="font-semibold text-white">Payment & Barter Terms</div>
                    <div className="text-[#9CA3AF] text-sm mt-1.5 mb-2">Timeline: {profile.paymentTimeline}</div>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {profile.barterPrefs.map(b => (
                        <span key={b} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleEdit('collabPrefs')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white font-semibold text-sm transition-colors border border-white/10 flex items-center gap-2">
                  <Edit2 size={14}/> Manage Terms
                </button>
              </div>
            </div>
          </section>

          {/* PROFILE SHARING */}
          <section>
            <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 ml-2">Growth & Sharing</h2>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleEdit('qr_code')} className="bg-[#1A1A2E] border border-white/10 hover:border-[#7C3AED]/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all group">
                <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center group-hover:scale-110 transition-transform"><Grid size={24}/></div>
                <span className="font-bold text-sm text-white">QR Code</span>
              </button>
              <button 
                onClick={() => { navigator.clipboard.writeText(window.location.origin + "/creator/demo"); toast.success("Profile link copied!"); }}
                className="bg-[#1A1A2E] border border-white/10 hover:border-[#7C3AED]/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:scale-110 transition-transform"><LinkIcon size={24}/></div>
                <span className="font-bold text-sm text-white">Copy Link</span>
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) { navigator.share({title: 'My Ybex Profile', url: window.location.origin + '/creator/demo'}); } 
                  else { toast.success("Opening native share..."); }
                }}
                className="bg-[#1A1A2E] border border-white/10 hover:border-[#7C3AED]/50 hover:shadow-[0_0_20px_rgba(124,58,237,0.15)] rounded-2xl p-5 flex flex-col items-center justify-center gap-3 transition-all group col-span-2"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Share2 size={24}/></div>
                <span className="font-bold text-sm text-white">Share Profile</span>
              </button>
            </div>
          </section>

          {/* SECURITY SETTINGS */}
          <section>
            <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-3 ml-2">Security & Access</h2>
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl flex flex-col shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] overflow-hidden">
               <EditableRow icon={Smartphone} label="Registered Phone Number" value={profile.phone} onEdit={() => handleEdit('phone')} border />
               <EditableRow icon={Mail} label="Business Email" value={profile.businessEmail} onEdit={() => handleEdit('businessEmail')} border />
               <EditableRow icon={MonitorSmartphone} label="Active Sessions" value="2 active devices" onEdit={() => handleEdit('activeSessions')} />
            </div>
          </section>

          {/* DANGER ZONE */}
          <button onClick={logout} className="w-full mt-6 bg-[#1A1A2E] hover:bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-2xl py-4 transition-all flex items-center justify-center gap-2">
            <LogOut size={18}/> Log out of account
          </button>
        </div>
      </div>
    </div>
  );
}

function EditableRow({ icon: Icon, label, value, onEdit, border }) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 ${border ? 'border-b border-white/10' : ''}`}>
      <div className="flex gap-4">
        <div className="mt-0.5"><Icon size={20} className="text-[#9CA3AF]" /></div>
        <div>
          <div className="font-semibold text-white">{label}</div>
          <div className="text-[#9CA3AF] text-sm mt-0.5">{value}</div>
        </div>
      </div>
      <button onClick={onEdit} className="p-2 hover:bg-white/10 rounded-lg text-white/50 transition-colors">
        <Edit2 size={16}/>
      </button>
    </div>
  );
}

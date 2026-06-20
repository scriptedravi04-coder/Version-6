import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Check, ChevronRight, Video, Tag, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function BrandUGCPost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    product_name: "",
    product_description: "",
    product_url: "",
    deliverable_type: "instagram_reel",
    video_duration: "30s",
    dos: [""],
    donts: [""],
    budget: 1500,
    max_creators: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateFee = () => formData.budget <= 20000 ? 5 : 2;

  const handlePost = async () => {
    setIsSubmitting(true);
    toast.info("Escrow payment initialized... (Simulating Zaakpay)");

    setTimeout(async () => {
       try {
         await api.post("/ugc/briefs", {
           title: formData.title || `Review of ${formData.product_name}`,
           ...formData,
           dos: formData.dos.filter(d => !!d),
           donts: formData.donts.filter(d => !!d),
         });
         toast.success("Brief posted successfully!");
         navigate("/brand/ugc/briefs");
       } catch (err) {
         toast.error("Failed to post brief.");
       } finally {
         setIsSubmitting(false);
       }
    }, 1500);
  };

  const Step1 = () => (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Campaign Title</label>
        <input type="text" className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7c3aed] transition-colors outline-none" placeholder="e.g. Try on haul for activewear" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Requirements</label>
        <textarea rows={4} className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7c3aed] transition-colors outline-none" placeholder="Provide full details about exactly what you expect in the video..." value={formData.detailed_requirements || ''} onChange={e => setFormData({...formData, detailed_requirements: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Product Name</label>
        <input type="text" className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7c3aed] transition-colors outline-none" placeholder="e.g. Pro Whey Protein" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sample Content URL (Optional)</label>
        <input type="url" className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7c3aed] transition-colors outline-none" placeholder="Link to a similar video or moodboard" value={formData.sample_content_url || ''} onChange={e => setFormData({...formData, sample_content_url: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Product Description</label>
        <textarea rows={3} className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7c3aed] transition-colors outline-none" placeholder="What makes it special?" value={formData.product_description} onChange={e => setFormData({...formData, product_description: e.target.value})} />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Product URL (Optional)</label>
        <input type="url" className="w-full bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#7c3aed] transition-colors outline-none" placeholder="https://" value={formData.product_url} onChange={e => setFormData({...formData, product_url: e.target.value})} />
      </div>
      <button onClick={() => setStep(2)} className="w-full bg-white text-black font-bold py-3.5 rounded-xl mt-4 active:scale-95 transition-transform">Next: Deliverables</button>
    </div>
  );

  const Step2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Format</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['instagram_reel', 'instagram_story', 'youtube_short', 'ugc_raw_video'].map(type => (
            <button key={type} onClick={() => setFormData({...formData, deliverable_type: type})} className={`px-4 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all ${formData.deliverable_type === type ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-white' : 'border-white/10 text-gray-500 bg-[#0f0f1a] hover:border-white/20'}`}>
              {type.replace(/_/g," ")}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Duration</label>
         <div className="flex flex-wrap gap-2">
            {['15s', '30s', '60s', '90s'].map(dur => (
              <button key={dur} onClick={() => setFormData({...formData, video_duration: dur})} className={`px-5 py-2.5 rounded-xl border text-sm font-bold uppercase tracking-wider transition-all ${formData.video_duration === dur ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-white' : 'border-white/10 text-gray-500 bg-[#0f0f1a] hover:border-white/20'}`}>
                {dur}
              </button>
            ))}
         </div>
      </div>

      <div className="pt-4">
         <label className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3"><CheckCircle2 size={16}/> Must DO</label>
         {formData.dos.map((v, i) => (
           <input key={"do"+i} type="text" className="w-full mb-2 bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 outline-none text-sm" placeholder="e.g. Show product texture clearly" value={v} onChange={e => {
             const newDos = [...formData.dos];
             newDos[i] = e.target.value;
             setFormData({...formData, dos: newDos});
           }}/>
         ))}
         <button onClick={() => setFormData({...formData, dos: [...formData.dos, ""]})} className="text-emerald-400 text-xs font-bold">+ Add Rule</button>
      </div>

      <div className="pt-2">
         <label className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest mb-3"><AlertCircle size={16}/> Must NOT DO (DON'Ts)</label>
         {formData.donts.map((v, i) => (
           <input key={"dont"+i} type="text" className="w-full mb-2 bg-[#0f0f1a] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:border-red-500 outline-none text-sm" placeholder="e.g. Do not mention competitor pricing" value={v} onChange={e => {
             const newDonts = [...formData.donts];
             newDonts[i] = e.target.value;
             setFormData({...formData, donts: newDonts});
           }}/>
         ))}
         <button onClick={() => setFormData({...formData, donts: [...formData.donts, ""]})} className="text-red-400 text-xs font-bold">+ Add Rule</button>
      </div>

      <div className="flex gap-3">
         <button onClick={() => setStep(1)} className="flex-1 bg-white/5 text-white font-bold py-3.5 rounded-xl mt-4 active:scale-95 transition-transform border border-white/10">Back</button>
         <button onClick={() => setStep(3)} className="w-2/3 bg-white text-black font-bold py-3.5 rounded-xl mt-4 active:scale-95 transition-transform">Next: Budget</button>
      </div>
    </div>
  );

  const Step3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Budget per Video (₹)</label>
        <h2 className="text-5xl font-black text-white mb-6 tracking-tighter">₹{formData.budget.toLocaleString()}</h2>
        <input type="range" min="500" max="50000" step="500" value={formData.budget} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} className="w-full accent-[#7c3aed]" />
      </div>

      <div className="bg-[#16161e] border border-white/10 rounded-2xl p-5 mb-6">
         <div className="flex justify-between items-center text-sm mb-2 text-gray-400 font-medium">
           <span>Platform Fee</span>
           <span>{calculateFee()}%</span>
         </div>
         <div className="flex justify-between items-center text-sm font-bold text-emerald-400">
           <span>Creator Receives</span>
           <span>₹{(formData.budget - (formData.budget * calculateFee()) / 100).toLocaleString()}</span>
         </div>
         <p className="text-[10px] text-gray-500 mt-3 font-semibold uppercase tracking-widest">Pricing ensures creators are motivated for 24h delivery.</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Number of Creators Needed</label>
         <div className="flex gap-2">
            {[1,2,3,5,10].map(num => (
              <button key={num} onClick={() => setFormData({...formData, max_creators: num})} className={`w-12 h-12 rounded-xl border font-bold transition-all ${formData.max_creators === num ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-white' : 'border-white/10 text-gray-500 bg-[#0f0f1a] hover:border-white/20'}`}>
                {num}
              </button>
            ))}
         </div>
      </div>

      <div className="flex gap-3 pt-6">
         <button onClick={() => setStep(2)} className="flex-1 bg-white/5 text-white font-bold py-3.5 rounded-xl border border-white/10 active:scale-95 transition-transform">Back</button>
         <button onClick={() => setStep(4)} className="w-2/3 bg-white text-black font-bold py-3.5 rounded-xl active:scale-95 transition-transform">Review & Pay</button>
      </div>
    </div>
  );

  const Step4 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-[#16161e] rounded-3xl p-6 border border-[#27273a]">
        <h3 className="text-xl font-bold text-white mb-1">{formData.title || `Review of ${formData.product_name}`}</h3>
        <p className="text-sm text-gray-400 mb-6">{formData.product_name}</p>

        <div className="space-y-3 text-sm text-gray-300 font-medium pb-6 border-b border-white/10 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Format</span>
            <span className="uppercase tracking-wider font-bold">{formData.deliverable_type?.replace(/_/g," ")} · {formData.video_duration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Quantity</span>
            <span className="font-bold">{formData.max_creators} Video{formData.max_creators>1?'s':''}</span>
          </div>
          <div className="flex justify-between text-white font-bold">
            <span className="text-gray-500 uppercase tracking-widest text-[10px] font-bold">Total Budget Escrow</span>
            <span className="text-[#facc15] font-black text-lg">₹{(formData.budget * formData.max_creators).toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-[#facc15]/10 border border-[#facc15]/20 rounded-xl p-4 flex gap-4">
           <div className="mt-1 flex-shrink-0 text-[#facc15]"><Check size={20}/></div>
           <div>
             <h4 className="font-bold text-[#facc15] text-sm uppercase tracking-widest mb-1">⚡ Delivery Promise</h4>
             <p className="text-sm text-[#facc15]/70 font-medium leading-relaxed">
               Your video will be delivered within 20-22 hours of a creator claiming this brief. You will then have 24 hours to review and approve.
             </p>
           </div>
        </div>
      </div>

      <div className="flex gap-3">
         <button disabled={isSubmitting} onClick={() => setStep(3)} className="bg-white/5 text-white font-bold py-3.5 px-6 rounded-xl border border-white/10 active:scale-95 transition-transform disabled:opacity-50">Back</button>
         <button disabled={isSubmitting} onClick={handlePost} className="flex-1 bg-[#facc15] hover:bg-[#eab308] text-black font-black uppercase tracking-wider py-3.5 rounded-xl active:scale-95 transition-transform shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
           {isSubmitting ? <span className="animate-pulse">Processing...</span> : "Secure briefly & Pay"}
         </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      
      {/* Stepper Header */}
      <div className="flex items-center gap-2 w-full mb-10 overflow-hidden">
        {[1,2,3,4].map(num => (
          <React.Fragment key={num}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${step === num ? 'bg-[#7c3aed] text-white' : step > num ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-500 border border-white/10'}`}>
              {step > num ? <Check size={14}/> : num}
            </div>
            {num < 4 && <div className={`h-1 flex-1 rounded-full bg-white/5 ${step > num ? 'bg-white/20' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}

    </div>
  );
}

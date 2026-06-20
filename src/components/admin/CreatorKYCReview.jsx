import React, { useState } from 'react';
import { ArrowLeft, ZoomIn, Check, X, Flag, ChevronRight, MessageSquare, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../lib/api';

export default function CreatorKYCReview({ creator, onBack, onApprove, onReject }) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const isBrand = creator?.type === 'Brand';
  
  const [verificationFields, setVerificationFields] = useState({
    name: false,
    pan: false,
    [isBrand ? 'gstin' : 'aadhaar']: false,
    bank: false
  });
  const [internalNotes, setInternalNotes] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const cDocs = creator.documents || {};

  const hasUploaded = cDocs.uploaded_files && cDocs.uploaded_files.length > 0;

  const showPan = !hasUploaded || cDocs.uploaded_files.some(f => {
    const n = (f.name || f || "").toLowerCase();
    return n.includes("pan");
  });

  const showAadhaar = !isBrand && (!hasUploaded || cDocs.uploaded_files.some(f => {
    const n = (f.name || f || "").toLowerCase();
    return n.includes("aadhaar") || n.includes("aadhar") || n.includes("id") || n.includes("proof");
  }));

  const showGstin = isBrand && (!hasUploaded || cDocs.uploaded_files.some(f => {
    const n = (f.name || f || "").toLowerCase();
    return n.includes("gst") || n.includes("tax") || n.includes("cert") || n.includes("incor") || n.includes("proof") || n.includes("bill") || n.includes("business");
  }));

  const showBank = !hasUploaded || cDocs.uploaded_files.some(f => {
    const n = (f.name || f || "").toLowerCase();
    return n.includes("bank") || n.includes("check") || n.includes("passbook") || n.includes("cheque") || n.includes("upi");
  });

  const allVerified = [
    verificationFields.name,
    showPan ? verificationFields.pan : true,
    showAadhaar ? verificationFields.aadhaar : true,
    showGstin ? verificationFields.gstin : true,
    showBank ? verificationFields.bank : true
  ].every(v => v);

  const mockDocs = {
    pan: "https://images.unsplash.com/photo-1621360841013-c76831f1e360?w=400&q=80",
    aadhaarFront: "https://images.unsplash.com/photo-1621360841013-c76831f1e360?w=400&q=80",
    aadhaarBack: "https://images.unsplash.com/photo-1621360841013-c76831f1e360?w=400&q=80",
    gstin: "https://images.unsplash.com/photo-1621360841013-c76831f1e360?w=400&q=80",
    bank: "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?w=400&q=80"
  };

  const isAadhaar = cDocs.identity_type === "Aadhaar";

  const extractedData = {
    name: creator.name,
    pan: isAadhaar ? "ABCDE1234F" : (cDocs.identity_num || "ABCDE1234F"),
    aadhaar: isAadhaar ? (cDocs.identity_num || "XXXX XXXX 1234") : "XXXX XXXX 1234",
    gstin: creator.gstin || cDocs.gst_cert || cDocs.gstin || "27AAACN1234E1Z5",
    bankAccount: cDocs.bank_account || "9876543210123",
    ifsc: cDocs.bank_ifsc || "SBIN0001234"
  };

  const getFileUrl = (f) => {
    if (typeof f === 'string') return f;
    if (f && typeof f === 'object') return f.url || f.path || f.photo || "";
    return "";
  };

  const getFileName = (f, idx) => {
    if (f && f.name) return f.name;
    return `Uploaded Document ${idx + 1}`;
  };

  const toggleVerify = (field) => {
    setVerificationFields(prev => ({...prev, [field]: !prev[field]}));
  };

  const handleEscalate = async () => {
    try {
      await api.post(`/admin/verifications/${creator.verification_id}/escalate`, { note: 'Escalated to Fraud Team' });
      onReject(creator.verification_id, 'Escalated to Fraud Team');
      toast.success("Assigned to Fraud Team");
    } catch {
      toast.error("Failed to escalate");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-foreground/10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-foreground/5 rounded-full transition-colors">
             <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <img src={creator.photo} alt="" className="w-10 h-10 rounded-full" />
            <div>
              <h2 className="font-display font-semibold">{creator.name}</h2>
              <div className="text-xs text-foreground/50">KYC Review • Pending</div>
            </div>
          </div>
        </div>
        <button onClick={handleEscalate} className="flex items-center gap-2 px-3 py-1.5 border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 rounded-lg text-sm font-medium transition-colors">
          <Flag size={16} /> Escalate to Fraud Team
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Panel: Documents */}
        <div className="bg-card border border-foreground/10 rounded-2xl p-6 flex flex-col gap-6">
          <h3 className="font-semibold text-lg flex items-center gap-2"><ZoomIn size={18} className="text-[#9D7CFF]" /> Submitted Documents</h3>
          
          <div className="grid grid-cols-2 gap-4">
            {cDocs.uploaded_files && cDocs.uploaded_files.length > 0 ? (
              cDocs.uploaded_files.map((file, idx) => {
                const url = getFileUrl(file);
                const name = getFileName(file, idx);
                return (
                  <div key={idx} className="space-y-2">
                    <span className="text-xs text-foreground/50 font-medium uppercase truncate block max-w-full" title={name}>
                      {name}
                    </span>
                    <div 
                      className="relative bg-black/40 rounded-xl overflow-hidden cursor-pointer group aspect-video border border-foreground/10"
                      onClick={() => setZoomedImage(url)}
                    >
                      <img src={url} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                        <ZoomIn size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="space-y-2">
                  <span className="text-xs text-foreground/50 font-medium uppercase">PAN Card</span>
                  <div 
                    className="relative bg-black/40 rounded-xl overflow-hidden cursor-pointer group aspect-video border border-foreground/10"
                    onClick={() => setZoomedImage(mockDocs.pan)}
                  >
                    <img src={mockDocs.pan} alt="PAN Card" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60 mix-blend-luminosity hover:mix-blend-normal" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                      <ZoomIn size={24} className="text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-xs text-foreground/50 font-medium uppercase">Bank Passbook / Cheque</span>
                  <div 
                    className="relative bg-black/40 rounded-xl overflow-hidden cursor-pointer group aspect-video border border-foreground/10"
                    onClick={() => setZoomedImage(mockDocs.bank)}
                  >
                    <img src={mockDocs.bank} alt="Bank Document" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60 mix-blend-luminosity hover:mix-blend-normal" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                      <ZoomIn size={24} className="text-white" />
                    </div>
                  </div>
                </div>

                {!isBrand ? (
                  <>
                    <div className="space-y-2">
                      <span className="text-xs text-foreground/50 font-medium uppercase">Aadhaar (Front)</span>
                      <div 
                        className="relative bg-black/40 rounded-xl overflow-hidden cursor-pointer group aspect-video border border-foreground/10"
                        onClick={() => setZoomedImage(mockDocs.aadhaarFront)}
                      >
                        <img src={mockDocs.aadhaarFront} alt="Aadhaar Front" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60 mix-blend-luminosity hover:mix-blend-normal" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                          <ZoomIn size={24} className="text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-foreground/50 font-medium uppercase">Aadhaar (Back)</span>
                      <div 
                        className="relative bg-black/40 rounded-xl overflow-hidden cursor-pointer group aspect-video border border-foreground/10"
                        onClick={() => setZoomedImage(mockDocs.aadhaarBack)}
                      >
                        <img src={mockDocs.aadhaarBack} alt="Aadhaar Back" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60 mix-blend-luminosity hover:mix-blend-normal" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                          <ZoomIn size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                    <div className="space-y-2 col-span-2">
                      <span className="text-xs text-foreground/50 font-medium uppercase">Brand Registration / GSTIN</span>
                      <div 
                        className="relative bg-black/40 rounded-xl overflow-hidden cursor-pointer group aspect-video border border-foreground/10 max-w-sm"
                        onClick={() => setZoomedImage(mockDocs.gstin)}
                      >
                        <img src={mockDocs.gstin} alt="GSTIN" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-60 mix-blend-luminosity hover:mix-blend-normal" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                          <ZoomIn size={24} className="text-white" />
                        </div>
                      </div>
                    </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Panel: Extraction & Actions */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border border-foreground/10 rounded-2xl p-6">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2"><Check size={18} className="text-green-500" /> Extracted Data Verification</h3>
            
            <div className="space-y-1 bg-foreground/5 rounded-xl border border-foreground/10 overflow-hidden">
               <VerificationRow label="Full Name" value={extractedData.name} verified={verificationFields.name} onToggle={() => toggleVerify('name')} />
               {showPan && (
                  <VerificationRow label="PAN Number" value={extractedData.pan} verified={verificationFields.pan} onToggle={() => toggleVerify('pan')} />
               )}
               {showGstin && (
                  <VerificationRow label="GSTIN" value={extractedData.gstin} verified={verificationFields.gstin} onToggle={() => toggleVerify('gstin')} />
               )}
               {showAadhaar && (
                  <VerificationRow label="Aadhaar Number" value={extractedData.aadhaar} verified={verificationFields.aadhaar} onToggle={() => toggleVerify('aadhaar')} />
               )}
               {showBank && (
                  <VerificationRow label="Bank A/C" value={extractedData.bankAccount} subValue={`IFSC: ${extractedData.ifsc}`} verified={verificationFields.bank} onToggle={() => toggleVerify('bank')} />
               )}
            </div>

            {/* Tracker */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2 px-2 text-xs font-semibold text-foreground/50">
                <span className="text-[#9D7CFF]">Review</span>
                <span className={allVerified ? "text-green-400" : ""}>Approve</span>
                <span className="">Reject</span>
              </div>
              <div className="h-2 bg-foreground/10 rounded-full overflow-hidden flex">
                 <div className="h-full bg-[#9D7CFF]" style={{ width: '33.33%' }}></div>
                 <div className={`h-full bg-green-500 transition-all ${allVerified ? 'w-[33.33%]' : 'w-0'}`}></div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-foreground/10 rounded-2xl p-6 flex flex-col gap-4">
             <h3 className="font-semibold text-lg flex items-center gap-2"><MessageSquare size={18} className="text-foreground/50" /> Internal Notes</h3>
             <textarea 
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                placeholder="Add private investigation notes here..."
                className="w-full h-24 bg-black/40 border border-foreground/10 rounded-xl max-h-32 p-3 text-sm focus:border-[#9D7CFF] focus:outline-none resize-none"
             />
             
             <div className="flex gap-3 pt-4 border-t border-foreground/10">
                <button 
                  onClick={() => setRejectModalOpen(true)}
                  className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold rounded-xl text-sm transition-colors"
                >
                  Reject Application
                </button>
                <button 
                  onClick={() => {
                     if(!allVerified) { alert("Please tick all verification fields to approve."); return; }
                     onApprove(creator.verification_id);
                  }}
                  className={`flex-1 py-3 font-semibold rounded-xl text-sm transition-colors ${allVerified ? 'bg-green-500 hover:bg-green-600 text-black' : 'bg-foreground/10 text-foreground/40 cursor-not-allowed'}`}
                >
                  Approve & Activate
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
           <div className="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>
           <img src={zoomedImage} alt="Zoomed" className="relative z-10 max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
           <button className="absolute top-6 right-6 z-20 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full"><X size={24}/></button>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectModalOpen(false)}></div>
           <div className="relative z-10 bg-[#12121A] w-full max-w-md border border-foreground/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-foreground/10 bg-red-500/5">
                 <h3 className="font-display text-xl font-bold text-red-500 flex items-center gap-2"><AlertTriangle size={20}/> Reject KYC Application</h3>
              </div>
              <div className="p-5 space-y-4">
                 <div>
                    <label className="text-sm font-medium text-foreground/70 mb-2 block">Reason for Rejection</label>
                    <select 
                       value={rejectReason}
                       onChange={e => setRejectReason(e.target.value)}
                       className="w-full bg-black/40 border border-foreground/10 rounded-xl p-3 text-sm focus:border-red-500 focus:outline-none appearance-none"
                    >
                       <option value="" disabled>Select reason...</option>
                       <option value="Blurred/Illegible Documents">Blurred/Illegible Documents</option>
                       <option value="Name Mismatch (PAN vs Aadhaar)">Name Mismatch (PAN vs Aadhaar)</option>
                       <option value="Invalid Bank Details">Invalid Bank Details</option>
                       <option value="Suspected Fraud">Suspected Fraud</option>
                       <option value="Other">Other (Specify in notes)</option>
                    </select>
                 </div>
                 {rejectReason === "Other" && (
                    <textarea 
                       placeholder="Please specify..."
                       className="w-full bg-black/40 border border-foreground/10 rounded-xl p-3 text-sm focus:border-red-500 focus:outline-none min-h-[80px]"
                    />
                 )}
                 <p className="text-xs text-foreground/50">This action will notify the creator and require them to resubmit their application.</p>
              </div>
              <div className="flex gap-3 p-5 bg-foreground/5 justify-end">
                 <button onClick={() => setRejectModalOpen(false)} className="px-5 py-2 text-foreground/60 hover:text-foreground font-medium text-sm">Cancel</button>
                 <button 
                  disabled={!rejectReason}
                  onClick={() => { onReject(creator.verification_id, rejectReason); setRejectModalOpen(false); }}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-sm disabled:opacity-50 transition-colors"
                 >Confirm Rejection</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function VerificationRow({ label, value, subValue, verified, onToggle }) {
   return (
      <div className="px-5 py-4 border-b border-foreground/10 last:border-0 flex items-center justify-between hover:bg-foreground/5 transition-colors">
         <div>
            <div className="text-xs text-foreground/50 uppercase font-medium">{label}</div>
            <div className="font-semibold mt-0.5">{value}</div>
            {subValue && <div className="text-xs text-foreground/60">{subValue}</div>}
         </div>
         <button 
            onClick={onToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${verified ? 'bg-green-500 border-green-500 text-black' : 'border-foreground/20 hover:border-foreground/40 text-transparent'}`}
         >
            <Check size={16} className={verified ? "text-black" : "text-transparent"} />
         </button>
      </div>
   );
}

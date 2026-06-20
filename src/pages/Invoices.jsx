import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { 
  FileText, Download, TrendingUp, CheckCircle, Clock, X, 
  ArrowLeft, Plus, Settings
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function Invoices() {
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ total_volume: 0, pending: 0, paid: 0 });
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [billingProfile, setBillingProfile] = useState(null);
  const [clients, setClients] = useState([]);
  
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const invoiceRef = useRef(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadData = () => {
    startLoading();
    Promise.all([
      api.get("/invoices"),
      api.get("/invoices/stats"),
      api.get("/invoices/billing-profile").catch(() => ({ data: null })),
      api.get("/invoices/clients").catch(() => ({ data: [] }))
    ])
      .then(([resList, resStats, resProfile, resClients]) => {
        setInvoices(resList.data || []);
        setStats(resStats.data || { total_volume: 0, pending: 0, paid: 0 });
        setBillingProfile(resProfile.data);
        setClients(resClients.data || []);
        stopLoading();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load invoice records");
        stopLoading();
      });
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingPdf(true);
    toast.info("Generating pristine PDF...");
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({ format: "a4", unit: "px" });
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, width, height);
      pdf.save(`Invoice_${selectedInvoice?.invoice_number || "Draft"}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (e) {
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const EmptyState = () => (
    <div className="text-center py-12 px-4 bg-[#131224]/30 border border-white/10 rounded-3xl">
      <FileText size={48} className="text-white/20 mx-auto mb-4" />
      <h3 className="text-white font-bold text-lg mb-2">No Invoices Generated Yet</h3>
      <p className="text-white/50 text-sm max-w-sm mx-auto mb-6">Connect deals and mark them as complete to automatically generate compliance GST invoices.</p>
    </div>
  );

  return (
    <div className="w-full max-w-none px-4 sm:px-6 md:px-12 py-8 bg-[#09090e] text-white min-h-screen">
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <Link to="/dashboard" className="text-sm text-white/50 hover:text-[#9D7CFF] flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <button className="bg-white/5 hover:bg-white/10 px-4 py-2 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
          <Settings size={14} /> Billing Profile Setup
        </button>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="font-display font-black text-3xl sm:text-4xl">Billing & Invoices</h1>
            <p className="text-sm text-white/50 mt-1">Manage your GST compliant invoices and track settlement collections.</p>
          </div>
          <button 
            onClick={() => setCreateModalOpen(true)}
            className="bg-[#D9F111] hover:bg-[#ccd110] text-black font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Create Custom Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#131224]/60 border border-white/10 p-5 rounded-2xl relative overflow-hidden text-left">
            <TrendingUp size={18} className="text-[#9D7CFF] mb-2" />
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-1">Total Volume Invoiced</span>
            <span className="text-3xl font-display font-black text-white">₹{stats.total_volume.toLocaleString("en-IN")}</span>
          </div>
          <div className="bg-[#131224]/60 border border-white/10 p-5 rounded-2xl relative overflow-hidden text-left">
             <CheckCircle size={18} className="text-emerald-400 mb-2" />
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-1">Total Paid Settled</span>
            <span className="text-3xl font-display font-black text-emerald-400">₹{stats.paid.toLocaleString("en-IN")}</span>
          </div>
          <div className="bg-[#131224]/60 border border-white/10 p-5 rounded-2xl relative overflow-hidden text-left">
             <Clock size={18} className="text-amber-400 mb-2" />
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block mb-1">Pending Processing</span>
            <span className="text-3xl font-display font-black text-amber-400">₹{stats.pending.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="bg-[#131224]/40 border border-white/10 rounded-3xl overflow-hidden mt-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="bg-white/5 text-[10px] uppercase font-bold text-white/40 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Issued To</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-0"><EmptyState /></td>
                  </tr>
                )}
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                    <td className="px-6 py-5 font-bold text-white">{inv.invoice_number}</td>
                    <td className="px-6 py-5">{inv.client_name || "Client"}</td>
                    <td className="px-6 py-5">{new Date(inv.issue_date || inv.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-5 font-bold text-[#D9F111]">₹{inv.total_amount?.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                       <button className="text-[#9D7CFF] hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedInvoice(inv); }}>View Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Invoice Detail PDF Preview Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#fcfcfc] rounded-lg max-w-4xl w-full relative z-10 shadow-2xl flex flex-col max-h-[90vh] text-black" 
            >
              {/* Header logic */}
              <div className="bg-[#131224] text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
                <span className="font-bold">Invoice Preview</span>
                <div className="flex gap-2">
                  <button 
                    onClick={handleDownloadPDF} 
                    disabled={isGeneratingPdf}
                    className="bg-[#D9F111] hover:bg-[#ccd110] text-black text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={14} /> {isGeneratingPdf ? "Generating..." : "Download PDF"}
                  </button>
                  <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={16} /></button>
                </div>
              </div>

              {/* PDF Preview Area */}
              <div className="overflow-y-auto flex-grow bg-slate-200/50 p-6 flex justify-center">
                
                {/* The actual A4 canvas that gets captured */}
                <div 
                  ref={invoiceRef} 
                  className="bg-white text-slate-800 p-10 md:p-14 w-full max-w-[800px] min-h-[1000px] shadow-sm relative text-left" 
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  
                  {/* Top Bar Label */}
                  <div className="absolute top-0 right-14 bg-[#7C5CFF] text-white px-6 py-2 font-black tracking-widest pt-3 pb-4 rounded-b-xl uppercase text-xl">
                    INVOICE
                  </div>

                  {/* Header */}
                  <div className="flex justify-between items-start mt-8 mb-12">
                    <div>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">{billingProfile?.legal_entity_name || user?.name || "Creator Entity"}</h2>
                      <p className="text-sm mt-1 text-slate-500 font-medium">{billingProfile?.address || "Address Line 1, City"}</p>
                      <p className="text-sm text-slate-500 font-medium">GSTIN: {billingProfile?.gstin || "Unregistered"}</p>
                      <p className="text-sm text-slate-500 font-medium mt-2">{user?.email}</p>
                    </div>
                  </div>

                  {/* Meta Details Row */}
                  <div className="flex justify-between border-y border-slate-200 py-6 mb-12">
                    <div className="w-1/2">
                      <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">Billed To</p>
                      <h3 className="font-bold text-slate-800 text-lg">{selectedInvoice.client_name || "Brand Partner"}</h3>
                      {selectedInvoice.client_address && <p className="text-sm text-slate-600 mt-1">{selectedInvoice.client_address}</p>}
                      {selectedInvoice.client_gstin && <p className="text-sm text-slate-600 mt-1">GSTIN: {selectedInvoice.client_gstin}</p>}
                    </div>
                    <div className="w-[1px] bg-slate-200"></div>
                    <div className="w-[40%] pl-8 space-y-3">
                      <div>
                        <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-0.5">Invoice No.</p>
                        <p className="font-bold text-slate-800">{selectedInvoice.invoice_number}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-0.5">Issue Date</p>
                        <p className="font-bold text-slate-800">{new Date(selectedInvoice.issue_date || selectedInvoice.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <table className="w-full text-left mb-8">
                    <thead>
                      <tr className="border-b-2 border-slate-700">
                        <th className="py-3 px-2 text-xs font-bold uppercase text-slate-500 tracking-widest w-3/5">Description</th>
                        <th className="py-3 px-2 text-xs font-bold uppercase text-slate-500 tracking-widest text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="py-4 px-2">
                          <p className="font-bold text-slate-800">{selectedInvoice.deal_title || "Campaign Deliverable"}</p>
                          <p className="text-xs text-slate-500 mt-1 italic">Professional content creation and deployment services as per contract.</p>
                        </td>
                        <td className="py-4 px-2 text-right font-bold text-slate-800">
                          ₹{(selectedInvoice.subtotal || selectedInvoice.total_amount).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Totals Frame */}
                  <div className="flex justify-end mb-16">
                    <div className="w-1/2 p-4 bg-slate-50 rounded-xl space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 font-bold">Subtotal</span>
                        <span className="font-bold text-slate-800">₹{(selectedInvoice.subtotal || selectedInvoice.total_amount).toLocaleString("en-IN")}</span>
                      </div>
                      
                      {selectedInvoice.tax_total > 0 && selectedInvoice.igst > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500 font-bold">IGST (18%)</span>
                          <span className="font-bold text-slate-800">₹{(selectedInvoice.igst).toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      
                      {selectedInvoice.tax_total > 0 && selectedInvoice.cgst > 0 && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold">CGST (9%)</span>
                            <span className="font-bold text-slate-800">₹{(selectedInvoice.cgst).toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500 font-bold">SGST (9%)</span>
                            <span className="font-bold text-slate-800">₹{(selectedInvoice.sgst).toLocaleString("en-IN")}</span>
                          </div>
                        </>
                      )}

                      {/* Line divider */}
                      <div className="w-full h-px bg-slate-200 my-2"></div>

                      <div className="flex justify-between text-lg">
                        <span className="font-black text-slate-900 tracking-tight">Total Amount</span>
                        <span className="font-black text-[#7C5CFF]">₹{(selectedInvoice.total_amount).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="mt-16 flex justify-between items-end">
                    <div className="text-xs text-slate-500 max-w-[200px]">
                      <p className="font-bold mb-1 uppercase tracking-wider text-slate-800">Bank Details</p>
                      <p>{billingProfile?.bank_account_name || "Name on Bank"}</p>
                      <p>{billingProfile?.bank_name || "Bank Name"}</p>
                      <p>Acc: {billingProfile?.bank_account_number ? "xxxx" + billingProfile.bank_account_number.slice(-4) : "xxxxxxxxxx"}</p>
                      <p>IFSC: {billingProfile?.bank_ifsc || "IFSC Code"}</p>
                    </div>
                    <div className="text-center w-64 border-t-2 border-slate-300 pt-4">
                      <p className="font-black text-slate-800 tracking-tight">{billingProfile?.legal_entity_name || user?.name || "Authorized Signatory"}</p>
                      <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-bold">Authorized Digital Stamp</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="absolute bottom-8 left-10 text-xs text-slate-400 font-medium">
                    Auto-generated GST compliance electronic invoice. No physical signature required.
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-[#131224] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full relative z-10 shadow-3xl text-left" 
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-black text-2xl text-white">Temporary Action</h2>
                  <button onClick={() => setCreateModalOpen(false)} className="text-white/40 hover:text-white p-1 bg-white/5 rounded-full"><X size={14} /></button>
                </div>
                <p className="text-white/60 text-xs mb-6 font-normal">Custom offline invoice generation is currently available only for premium tier creators. Normal invoices generate automatically when deals conclude.</p>
                <button onClick={() => setCreateModalOpen(false)} className="w-full bg-[#D9F111] text-black font-bold text-xs py-3 rounded-xl transition-all shadow-md">Got it</button>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

    </div>
  );
}

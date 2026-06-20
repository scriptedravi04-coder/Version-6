import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import BrandProgressTracker from "../components/ugc/BrandProgressTracker";
import { toast } from "sonner";
import { Play, MessageCircle } from "lucide-react";

export default function BrandUGCOrders() {
  const [orders, setOrders] = useState([]);
  const { startLoading, stopLoading } = useLoading();
  const navigate = useNavigate();

  const loadData = () => {
    startLoading();
    api.get("/ugc/orders/brand").then(res => {
      setOrders(res.data);
      stopLoading();
    }).catch(() => stopLoading());
  };

  useEffect(() => {
    loadData();
    // Poll every 30s for tracker updates
    const intv = setInterval(loadData, 30000);
    return () => clearInterval(intv);
  }, []);

  const handleApprove = async (id) => {
    toast.loading("Approving...", { id: 'approve' });
    try {
      await api.post(`/ugc/orders/${id}/approve`);
      toast.success("Approved successfully!", { id: 'approve' });
      loadData();
    } catch(e) {
      toast.error("Failed to approve", { id: 'approve' });
    }
  };

  const handleRevision = async (id) => {
    toast.loading("Requesting revision...", { id: 'rev' });
    try {
      await api.post(`/ugc/orders/${id}/revision`, { revision_note: "Please fix lighting" });
      toast.success("Revision requested!", { id: 'rev' });
      loadData();
    } catch(e) {
      toast.error("Failed to request revision", { id: 'rev' });
    }
  };

  if(orders.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-8">UGC Order Tracking</h1>
        <div className="text-center py-20 bg-[#16161e] border border-white/10 rounded-3xl">
          <p className="text-gray-400 font-medium">No live orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-2">UGC Order Tracking</h1>
      <p className="text-gray-400 mb-8 font-medium">Live progress of your 24-hour turnaround orders</p>

      <div className="space-y-6">
        {orders.map(o => (
           <div key={o.id} className="bg-[#16161e] border border-white/10 rounded-3xl p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/10 pb-6 mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-white mb-1">{o.brief?.title || "UGC Order"}</h2>
                   <p className="text-sm text-gray-500 font-medium tracking-wide">Order #{o.id.slice(0,8).toUpperCase()} · Budget: ₹{o.agreed_amount}</p>
                 </div>
                 <div className="flex items-center gap-3 self-start">
                   {o.brand_status === 'COMPLETED' && (
                     <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold">Completed</span>
                   )}
                   {o.creator_id && o.brand_status !== 'COMPLETED' && o.brand_status !== 'CANCELLED' && (
                     <button onClick={() => navigate(`/chat/${o.creator_id}`)} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 transition-colors">
                       <MessageCircle size={12}/> Message Creator
                     </button>
                   )}
                 </div>
              </div>

              <div className="mb-6">
                 <h3 className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-4">Progress Tracker</h3>
                 <BrandProgressTracker brandStatus={o.brand_status} qualityReviewEndsAt={o.quality_review_ends_at} />
              </div>

              {o.brand_status === 'DELIVERED' && (
                 <div className="bg-[#0f0f1a] border border-[#7c3aed]/30 rounded-2xl p-6 flex flex-col md:flex-row gap-6 mt-8">
                    <div className="w-full md:w-48 aspect-[9/16] bg-gray-900 rounded-xl relative overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                      <Play size={32} className="text-white/30" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-lg font-bold text-white mb-2">Video is ready!</h4>
                      <p className="text-sm text-gray-400 mb-6 leading-relaxed">Review the content. You can request up to 1 revision if it doesn't meet the brief's requirements.</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button onClick={() => handleApprove(o.id)} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider py-3 px-6 rounded-xl transition-transform active:scale-95 text-sm flex-1">Approve & Pay</button>
                        <button onClick={() => handleRevision(o.id)} className="bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider py-3 px-6 rounded-xl border border-white/10 transition-colors text-sm flex-1">Request Revision</button>
                      </div>
                    </div>
                 </div>
              )}
           </div>
        ))}
      </div>
    </div>
  );
}

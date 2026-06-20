import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useLoading } from "../contexts/LoadingContext";
import { Wallet, CheckCircle, Clock } from "lucide-react";

export default function BrandUGCPayments() {
  const [orders, setOrders] = useState([]);
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    startLoading();
    api.get("/ugc/orders/brand").then(res => {
      setOrders(res.data);
      stopLoading();
    }).catch(() => stopLoading());
  }, []);

  const totalSpent = orders.filter(o => o.payment_status === 'RELEASED').reduce((acc, o) => acc + o.agreed_amount, 0);
  const inEscrow = orders.filter(o => o.payment_status === 'HELD').reduce((acc, o) => acc + o.agreed_amount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-white mb-2">UGC Payments & Escrow</h1>
      <p className="text-gray-400 mb-8 font-medium">Track your UGC spends and escrow balances.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#16161e] border border-white/10 p-5 rounded-2xl">
          <Wallet className="text-[#facc15] mb-2" size={24}/>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">Total Spent</span>
          <span className="text-3xl font-black text-white">₹{totalSpent.toLocaleString()}</span>
        </div>
        <div className="bg-[#16161e] border border-white/10 p-5 rounded-2xl">
          <Clock className="text-blue-400 mb-2" size={24}/>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-1">In Escrow</span>
          <span className="text-3xl font-black text-blue-400">₹{inEscrow.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-[#16161e] border border-white/10 rounded-3xl overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="bg-white/5 text-[10px] uppercase font-bold text-white/40 tracking-wider">
              <tr>
                <th className="px-6 py-4">Brief</th>
                <th className="px-6 py-4">Creator ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No payment history.</td>
                </tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-5 font-bold text-white truncate max-w-[200px]">{o.brief?.title || "UGC"}</td>
                  <td className="px-6 py-5 font-mono text-xs">{o.creator_id.slice(0, 8)}...</td>
                  <td className="px-6 py-5">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-5 font-bold text-white">₹{o.agreed_amount.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      o.payment_status === 'RELEASED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                      o.payment_status === 'HELD' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    }`}>
                      {o.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

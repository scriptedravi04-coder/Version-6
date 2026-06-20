import React, { useState } from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import FeeBreakup from './FeeBreakup';
import { api } from '../lib/api';
import { toast } from 'sonner';

export default function PayNow({ dealId, creatorId, grossAmount }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      // Pass a flag to indicate test mode so it just skips real redirect in backend
      const { data: resp } = await api.post('/payment/initiate', {
        deal_id: dealId,
        creator_id: creatorId,
        gross_amount: grossAmount
      });
      
      // Since user wants to skip Zaakpay redirect until deploy:
      toast.success('Payment successfully simulated in test mode!');
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (err) {
      toast.error(err.message || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1A2E]/60 border border-white/5 rounded-2xl p-6 md:p-8 max-w-lg mx-auto backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED]">
          <CreditCard size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Campaign Payment</h2>
          <p className="text-sm text-white/50 relative top-0.5">Secure payment via platform</p>
        </div>
      </div>

      <div className="mb-8">
        <FeeBreakup grossAmount={grossAmount} />
      </div>

      <div className="flex items-center gap-2 mb-6 text-xs text-white/40 bg-white/5 p-3 rounded-xl border border-white/5">
        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
        <p>Your payment is kept in secure escrow. The creator is paid after deliverables are approved.</p>
      </div>

      <button 
        onClick={handlePay}
        disabled={loading}
        className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-white/10 disabled:text-white/30 text-white font-bold py-4 rounded-xl shadow-lg shadow-[#7C3AED]/20 transition-all flex items-center justify-center gap-2"
      >
        {loading ? 'Processing...' : `Proceed to Pay ₹${grossAmount.toLocaleString('en-IN')}`}
      </button>

      <div className="mt-4 flex justify-center opacity-50 grayscale gap-4 items-center">
        <div className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1">Secured by <span className="text-white">Escrow</span></div>
      </div>
    </div>
  );
}

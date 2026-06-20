import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { toast } from 'sonner';

export default function SendBrief({ threadId, onClose, onSent }) {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  
  const handleSend = async () => {
    if (!fileUrl) {
       toast.error("Please provide a brief PDF URL");
       return;
    }
    setLoading(true);
    try {
      await api.post(`/chat/v2/threads/${threadId}/messages`, {
        content: "Drafted Campaign Brief",
        message_type: "file",
        metadata: { fileUrl, type: "pdf", name: "Campaign_Brief.pdf" }
      });
      toast.success("Brief sent to creator");
      onSent();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send brief");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1A1A2E] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-display font-bold text-white">Send Campaign Brief</h3>
             <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"><X size={18}/></button>
          </div>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center bg-white/5">
              <UploadCloud size={32} className="mx-auto text-white/40 mb-3" />
              <p className="text-sm text-white/70 font-medium mb-1">Upload Brief PDF</p>
              <p className="text-xs text-white/40 mb-4">Max 10MB</p>
              <input 
                type="text"
                placeholder="Enter mock PDF URL..."
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED]"
              />
            </div>

            <button 
              onClick={handleSend}
              disabled={loading || !fileUrl}
              className="w-full py-3.5 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:hover:bg-[#7C3AED] text-white font-bold rounded-xl flex items-center justify-center transition-colors"
            >
              {loading ? <span className="opacity-70 animate-pulse">Sending...</span> : 'Send Brief'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

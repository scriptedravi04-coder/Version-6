import React from "react";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import SystemMessage from "./SystemMessage";
import OfferCard from "./OfferCard";

export default function MessageBubble({ message, isMine, threadId, onActionComplete }) {
  const isSystem = message.message_type === 'system' || message.message_type === 'payment_trigger';
  const isOffer = message.message_type === 'offer';

  if (isSystem) {
    return <SystemMessage message={message} />;
  }

  if (isOffer) {
    return <OfferCard message={message} threadId={threadId} onActionComplete={onActionComplete} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"} my-3`}
    >
      {!isMine && (
        <div className="w-8 h-8 rounded-full bg-white/10 p-1.5 flex items-center justify-center mr-3 flex-shrink-0 mt-auto mb-1">
           <Building2 size={12} className="text-white/60"/>
        </div>
      )}
      <div className={`max-w-[75%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-lg ${isMine ? "bg-[#7C3AED] text-white rounded-br-sm shadow-[#7C3AED]/20 font-medium" : "bg-white/5 border border-white/10 text-[var(--text-primary)] rounded-bl-sm"}`}>
        {message.content}
        <div className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${isMine ? "text-white/50 text-right" : "text-[var(--text-tertiary)]"}`}>
          {new Date(message.created_at).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
        </div>
      </div>
    </motion.div>
  );
}


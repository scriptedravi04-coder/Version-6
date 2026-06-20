import React from "react";
import { motion } from "framer-motion";

export default function SystemMessage({ message }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }} 
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex justify-center my-6"
    >
      <div className="bg-[#1A1A2E] border border-white/10 px-5 py-2.5 rounded-full shadow-md text-xs text-white/50 font-medium text-center max-w-[80%]">
        {message.content}
      </div>
    </motion.div>
  );
}

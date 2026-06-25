import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CreatorCountdown = ({ internalDeadline }) => {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [isUrgent, setIsUrgent] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(internalDeadline).getTime() - Date.now();

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000)
      });
      setIsUrgent(diff < 3 * 60 * 60 * 1000); // < 3 hours
    }, 1000);

    return () => clearInterval(interval);
  }, [internalDeadline]);

  if (isExpired) return (
    <div className="text-[#ef4444] font-bold text-center py-2 bg-[#ef4444]/10 rounded-lg border border-[#ef4444]/20">
      ⏰ Time's up — submit immediately!
    </div>
  );

  return (
    <motion.div
      animate={isUrgent ? { scale: [1, 1.03, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1 }}
      className={`flex gap-3 justify-center py-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-default)] ${isUrgent ? 'text-[#ef4444]' : 'text-emerald-400'}`}
    >
      {[
        { val: timeLeft.h, label: 'HRS' },
        { val: timeLeft.m, label: 'MIN' },
        { val: timeLeft.s, label: 'SEC' }
      ].map(({ val, label }) => (
        <div key={label} className="flex flex-col items-center min-w-[3rem]">
          <span className="font-mono text-3xl font-bold bg-black/30 w-full text-center py-1 rounded-md">
            {String(val).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] mt-1 uppercase font-bold tracking-widest">{label}</span>
        </div>
      ))}
    </motion.div>
  );
};

export default CreatorCountdown;

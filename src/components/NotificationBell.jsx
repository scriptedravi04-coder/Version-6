import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const ref = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/notifications");
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.read).length || 0);
    } catch (e) {
      console.log("Error fetching notifications:", e);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();

    // Poll fallback every 15 seconds to ensure robust sync
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 15000);

    // Supabase Realtime — noti aate hi auto update
    const userId = user.user_id || user.id;
    const channel = supabase
      .channel(`notifications_${Math.random().toString(36).substring(2, 10)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Add manually to our notifications state on receiving insert
          const newNotif = {
            notif_id: payload.new.notif_id,
            user_id: payload.new.user_id,
            type: payload.new.type,
            message: payload.new.message,
            read: payload.new.read || false,
            created_at: payload.new.created_at || new Date().toISOString(),
          };

          setNotifications((prev) => {
            // Avoid duplicate in state in case polling also fetched it
            if (prev.some((n) => n.notif_id === newNotif.notif_id)) return prev;
            return [newNotif, ...prev];
          });
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.log("Error marking all read:", e);
    }
  };

  const markOneRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.notif_id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.log("Error marking notification read:", e);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer focus:outline-none flex items-center justify-center border border-foreground/5 shrink-0 shadow-inner"
        data-testid="notification-bell-btn"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-0.5 bg-[#EF4444] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold font-mono animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
            />
            
            {/* Slide-over Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed top-0 right-0 w-full max-w-sm sm:max-w-md h-full bg-white/95 dark:bg-[#0c0c12]/95 backdrop-blur-2xl border-l border-foreground/10 shadow-2xl z-[250] flex flex-col overflow-hidden select-none"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-foreground/5 bg-foreground/[0.02]">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#9D7CFF]" />
                  <h3 className="text-[var(--text-primary)] font-bold text-lg tracking-wide">Notifications</h3>
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-[#9D7CFF] hover:text-[#7C5CFF] font-semibold transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 -mr-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto divide-y divide-foreground/5">
                {notifications.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-[var(--text-tertiary)] py-12">
                    <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center text-2xl shadow-inner">🔔</div>
                    <span className="text-sm font-medium">No notifications yet</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem
                      key={n.notif_id}
                      notification={n}
                      onRead={markOneRead}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-foreground/5 text-center bg-foreground/[0.02]">
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="text-xs text-[var(--text-secondary)] hover:text-[#9D7CFF] font-bold transition-colors inline-block py-2.5 px-4 rounded-xl bg-foreground/5 hover:bg-foreground/10 w-full text-center"
                >
                  View all notifications
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

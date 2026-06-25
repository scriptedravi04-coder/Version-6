import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence, animate } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "../lib/supabase";
import { 
  Eye, Users, Megaphone, DollarSign, ArrowRight, Share2, Package, Check, 
  MapPin, Gift, ChevronRight, X, Briefcase, Bell, Link as LinkIcon, AlertCircle, AlertTriangle,
  Search, Power, TrendingUp, Sparkles, Film, Wallet, User, ShieldAlert, FileText, Heart, MessageCircle,
  IndianRupee, CheckCircle, Clock
} from "lucide-react";
import { useLoading } from "../contexts/LoadingContext";
import NotificationBell from "./NotificationBell";

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return Math.round(num);
};

const AnimatedNumber = ({ value, prefix = "", format = false }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v)
    });
    return controls.stop;
  }, [value]);
  
  const formatted = format ? formatNumber(display) : Math.floor(display);
  return <span>{prefix}{formatted}</span>;
};

export default function CreatorDashboard({ user }) {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();
  const importantTasks = React.useMemo(() => {
    const tasks = [];
    if (!user?.kyc_verified) {
      tasks.push({ 
        id: 'kyc', 
        icon: AlertTriangle, 
        iconColor: 'text-orange-500',
        animClass: 'group-hover:anim-jiggle',
        title: 'Complete Financial KYC', 
        desc: 'Identify and verify individuals for contracts. Unlock high-paying campaigns!', 
        btnText: 'Complete Verification',
        link: '/settings',
        actionRequired: true
      });
    }
    if (!user?.has_previous_collabs) {
      tasks.push({ 
        id: 'portfolio', 
        icon: Briefcase, 
        iconColor: 'text-orange-400',
        animClass: 'group-hover:anim-jiggle',
        title: 'Update Portfolio', 
        desc: 'Your previous collaborations section is empty. Adding past brand work increases selection chance by 40%.', 
        btnText: 'Add Details',
        link: '/profile/overview',
        dot: true
      });
    }
    if (!user?.profile_completed) {
      tasks.push({ 
        id: 'profile', 
        icon: User, 
        iconColor: 'text-blue-500',
        animClass: 'group-hover:animate-pulse',
        title: 'Complete your profile', 
        desc: 'Finish onboarding to attract top brands', 
        btnText: 'Complete Profile',
        link: '/profile/overview' 
      });
    }
    if (!user?.rate_card_added) {
      tasks.push({ 
        id: 'rate', 
        icon: FileText, 
        iconColor: 'text-rose-500',
        animClass: 'group-hover:anim-fold',
        title: 'Add your charges and prices',
        desc: 'Add your rate card so the brand can view your pricing.', 
        btnText: 'Add Rates',
        link: '/profile/overview?edit=true' 
      });
    }
    if (!user?.bank_details_added) {
      tasks.push({ 
        id: 'bank', 
        icon: Wallet, 
        iconColor: 'text-emerald-500',
        animClass: 'group-hover:-translate-y-1 transition-transform',
        title: 'Add Bank Details',
        desc: 'Add your bank details to receive payments and credit your account.', 
        btnText: 'Add Bank',
        link: '/earnings' 
      });
    }
    if (tasks.length < 3) {
      tasks.push({ 
        id: 'campaign', 
        icon: Megaphone, 
        iconColor: 'text-[var(--violet)]',
        animClass: 'group-hover:anim-jiggle',
        title: 'Apply to a Campaign',
        desc: 'You have not applied for any campaigns yet. Start earning by applying to your first campaign!', 
        btnText: 'Explore',
        link: '/explore' 
      });
    }
    return tasks.slice(0, 5);
  }, [user]);

  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  useEffect(() => {
    if (importantTasks.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTaskIndex((prev) => (prev + 1) % importantTasks.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [importantTasks.length]);

  const [loading, setLoading] = useState(true);
  
  const [profile, setProfile] = useState({ profile_views: 0, profile_reach: 0, portfolio: "" });
  const [collabCount, setCollabCount] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  
  const handleCampaignTap = (campaignId, index) => {
     // GTM-like event tracking
     console.log(`[EventTracker] Tracked click for campaign: ${campaignId}`);
     // Optimistically update views
     setCampaigns(prev => prev.map((c, i) => {
        if (i === index) {
           return { ...c, views: (c.views || 0) + 1 };
        }
        return c;
     }));
     // Fire API call to increment view count
     api.post(`/campaigns/${campaignId}/track-view`).catch(e => console.warn('Failed to track view'));
  };
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  
  const [widgetIndex, setWidgetIndex] = useState(0);

  const [banners, setBanners] = useState([]);
  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      if (!user) return;
      if (campaigns.length === 0) startLoading();
      try {
        setProfile({ profile_views: 1200, profile_reach: 48200, portfolio: "" });
        setCollabCount(4);
        setMonthlyEarnings(48500);
        
        const { data: bannersData } = await api.get('/banners').catch(() => ({ data: [] }));
        if (mounted && bannersData) setBanners(bannersData);
        
        const { data: camps } = await api.get('/campaigns').catch(() => ({ data: [] }));
        if (mounted && camps) {
          setCampaigns(camps.reverse().slice(0, 3));
        }
      } catch (e) {
        console.warn('Silent fail Dashboard shell', e);
      } finally {
        if (campaigns.length === 0) stopLoading();
        if (mounted) setLoading(false);
      }
    }
    loadData();

    // Simulating Live Sync with periodic polling
    const syncInterval = setInterval(() => {
       api.get('/campaigns').then(({ data }) => {
          if (mounted && data) {
             setCampaigns(data.reverse().slice(0, 3));
          }
       }).catch(e => console.warn('Silent live sync fail', e));
    }, 5000);

    return () => { mounted = false; clearInterval(syncInterval); };
  }, [user]);

  const heroBanners = banners.filter(b => b.placement === "Dashboard Hero Carousel" && b.status === "Live" && b.type === "Influencer").slice(0, 3);

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIdx(prev => (prev + 1) % heroBanners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      setWidgetIndex((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const generateChartData = () => {
    return [
      { name: 'Week 1', profile_views: 300, collab_interest: 5 },
      { name: 'Week 2', profile_views: 420, collab_interest: 8 },
      { name: 'Week 3', profile_views: 550, collab_interest: 12 },
      { name: 'Week 4', profile_views: 680, collab_interest: 15 }
    ];
  };

  const CHART_DATA = generateChartData();

  if (loading) {
    return (
      <div className="w-full max-w-none px-4 py-8 animate-pulse">
        <div className="h-16 bg-[var(--bg-elevated)] rounded-2xl w-1/3 mb-8"></div>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(k => <div key={k} className="h-24 bg-[var(--bg-elevated)] rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  const firstName = (user?.name || "Ravi").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col pb-12 px-4 bg-[var(--bg-base)] min-h-screen">
      {/* Header Area */}
      <div className="mb-6 flex justify-between items-center pt-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm relative">
             <img src={user?.photo || "https://i.pravatar.cc/150?u=ravi"} alt="Avatar" className="w-full h-full object-cover" />
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              {greeting}, {firstName} 👋
            </h2>
            <p className="text-sm text-[var(--text-secondary)] font-medium">
              Ready to find your next collaboration today?
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationBell />
          <button className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] flex items-center justify-center relative shadow-sm hover:bg-[var(--bg-elevated)] transition-colors">
            <MessageCircle size={18} className="text-[var(--text-secondary)]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--violet)] rounded-full text-white text-[10px] font-bold flex items-center justify-center border border-white">6</div>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8 lg:h-[300px]">
        {/* 75% Width Auto-Sliding Banner */}
        <div className="lg:col-span-3 bg-[var(--bg-card)] rounded-[1.5rem] relative overflow-hidden flex flex-col justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[var(--border-default)] group h-[200px] lg:h-full">
           
           {heroBanners.length > 0 ? (
             <>
               {heroBanners.map((banner, idx) => (
                 <a 
                   key={banner.id} 
                   href={banner.link || "#"} 
                   target={banner.link ? "_blank" : "_self"} 
                   rel="noreferrer"
                   className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${idx === currentBannerIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                 >
                   <img src={banner.imgUrl} alt="Hero Banner" className="w-full h-full object-cover" />
                 </a>
               ))}
               
               {heroBanners.length > 1 && (
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                   {heroBanners.map((_, idx) => (
                     <button 
                       key={idx}
                       onClick={(e) => { e.preventDefault(); setCurrentBannerIdx(idx); }}
                       className={`h-2 rounded-full transition-all duration-300 ${idx === currentBannerIdx ? "w-6 bg-[#D9F111]" : "w-2 bg-[var(--bg-card)]/50 hover:bg-[var(--bg-card)]/80"}`}
                     />
                   ))}
                 </div>
               )}
             </>
           ) : (
             <div className="p-8 md:p-10 w-full h-full flex flex-col justify-center">
               <div className="absolute inset-0 bg-gradient-to-br from-[var(--violet)]/5 to-transparent pointer-events-none"></div>
               
               <div className="relative z-10 max-w-sm">
                 <div className="inline-flex items-center px-4 py-1.5 bg-[var(--violet)] rounded-full text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest mb-6 shadow-sm">
                   NEW CAMPAIGNS LIVE
                 </div>
                 
                 <h3 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] leading-[1.1] tracking-tight mb-4">
                   <span className="text-[var(--text-primary)]">5 New Campaigns</span><br/>This Week<span className="text-[var(--violet)]">.</span>
                 </h3>
                 <p className="text-[var(--text-secondary)] text-sm md:text-base mb-8 font-medium">
                   Top brands. Real budgets. Right creators.
                 </p>

                 <Link to="/explore" className="bg-[var(--violet)] hover:bg-[#6b3deb] text-[var(--text-primary)] font-bold py-3.5 px-8 rounded-xl text-sm transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-[0_8px_20px_rgba(138,79,255,0.3)] w-fit">
                   Explore Campaigns <ArrowRight size={16} />
                 </Link>
               </div>
               
               {/* Floating Brand Elements */}
               <div className="absolute right-0 top-0 bottom-0 w-[55%] pointer-events-none hidden md:block">
                  {/* Decorative blobs/images matching the screenshot */}
                  <div className="absolute top-[10%] right-[40%] bg-[var(--bg-card)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-2 rotate-[-5deg] w-24">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=200&auto=format&fit=crop" className="w-full h-auto rounded-xl" alt="Shoe" />
                  </div>
                  <div className="absolute top-[20%] right-[15%] bg-[var(--bg-card)] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-4 rotate-[10deg]">
                    <span className="font-black text-xl tracking-tighter">boAt</span>
                  </div>
                  <div className="absolute bottom-[25%] right-[55%] bg-[var(--bg-card)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-3 rotate-[-10deg]">
                    <span className="font-black text-[#00A859] tracking-tighter text-lg">mCaffeine</span>
                  </div>
                  <div className="absolute bottom-[35%] right-[30%] bg-[var(--bg-card)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-3 rotate-[5deg]">
                    <span className="font-bold text-[#00AFEF] tracking-tight">mamaearth</span>
                  </div>
                  <div className="absolute bottom-[10%] right-[45%] bg-[#E23744] text-[var(--text-primary)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-3 rotate-[-5deg] z-10">
                    <span className="font-black tracking-tighter">zomato</span>
                  </div>
                  <div className="absolute top-[40%] right-[5%] bg-[#E80071] text-[var(--text-primary)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-3 rotate-[15deg]">
                    <span className="font-black tracking-widest text-sm">NYKAA</span>
                  </div>
                  
                  {/* Creator Portraits */}
                  <div className="absolute bottom-0 right-[10%] w-48 h-64 overflow-hidden z-0">
                    <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover rounded-t-[2rem]" alt="Creator" />
                  </div>
               </div>
               
               {/* Dots */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                 <div className="h-1.5 w-6 bg-[var(--violet)] rounded-full"></div>
                 <div className="h-1.5 w-6 bg-[var(--border-default)] rounded-full"></div>
                 <div className="h-1.5 w-6 bg-[var(--border-default)] rounded-full"></div>
               </div>
             </div>
           )}
        </div>

        {/* Right Column: Important for you */}
        <div className="bg-[var(--bg-card)] rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[var(--border-default)] flex flex-col h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--violet)]/5 rounded-full blur-3xl"></div>
             
             <div className="relative z-10 flex-1 flex flex-col h-full">
               <div className="mb-4">
                 <h4 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Important For You</h4>
                 <p className="text-xs text-[var(--text-secondary)] mt-1">Complete these steps to boost your reach</p>
               </div>
                            <div className="flex flex-col gap-3 flex-1 justify-center mt-2 relative min-h-[140px]">
                 {importantTasks.length === 0 ? (
                   <div className="flex-1 flex flex-col items-center justify-center text-center text-[var(--text-tertiary)]">
                     <span className="text-2xl mb-2">🎉</span>
                     <p className="text-sm font-medium">You are all caught up!</p>
                   </div>
                 ) : (
                   <AnimatePresence mode="wait">
                     <motion.div
                       key={importantTasks[currentTaskIndex].id}
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       transition={{ duration: 0.3 }}
                       className="w-full pb-4"
                     >
                       <Link
                         to={importantTasks[currentTaskIndex].link}
                         className={`block bg-[var(--bg-elevated)] rounded-[1.25rem] p-4 cursor-pointer hover:bg-[var(--bg-card)] transition-all group relative ${importantTasks[currentTaskIndex].actionRequired ? 'bg-rose-500/5 border border-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.05)]' : 'border border-[var(--border-default)]'}`}
                       >
                         {importantTasks[currentTaskIndex].dot && (
                           <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-orange-400"></div>
                         )}
                         {importantTasks[currentTaskIndex].actionRequired && (
                           <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                         )}
                         <div className="flex items-center gap-2 mb-2">
                           {React.createElement(importantTasks[currentTaskIndex].icon, {
                             size: 16,
                             className: `${importantTasks[currentTaskIndex].iconColor} ${importantTasks[currentTaskIndex].animClass}`
                           })}
                           <h5 className="font-bold text-sm text-[var(--text-primary)]">
                             {importantTasks[currentTaskIndex].title}
                           </h5>
                           {importantTasks[currentTaskIndex].actionRequired && (
                             <span className="ml-auto mr-5 text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 uppercase tracking-widest border border-rose-500/20">
                                Action Required
                             </span>
                           )}
                         </div>
                         <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                           {importantTasks[currentTaskIndex].desc}
                         </p>
                         <span className="text-[11px] font-bold text-[var(--violet)] uppercase tracking-wider transition-colors flex items-center gap-1">
                           {importantTasks[currentTaskIndex].btnText} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                         </span>
                       </Link>
                     </motion.div>
                   </AnimatePresence>
                 )}
                 {importantTasks.length > 1 && (
                   <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1.5 pb-1">
                     {importantTasks.map((_, i) => (
                       <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentTaskIndex ? 'w-4 bg-[var(--violet)]' : 'w-1.5 bg-[var(--border-default)]'}`} />
                     ))}
                   </div>
                 )}
               </div>
             </div>
          </div>
      </div>

      {/* 4 Compact Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
         {[
           { icon: Eye, label: "Profile Views", value: 1200, format: true, trend: "↑ 18% this week", color: "text-[var(--violet)]", bg: "bg-[var(--violet)]/10", chartLine: "M0 25 L20 15 L40 20 L60 5 L80 15 L100 0", stroke: "var(--violet)", animClass: "group-hover:anim-blink" },
           { icon: Heart, label: "Brand Interest", value: 32, trend: "↑ 12% this week", color: "text-rose-500", bg: "bg-rose-500/10", chartLine: "M0 20 L20 25 L40 10 L60 15 L80 5 L100 10", stroke: "#f43f5e", animClass: "group-hover:animate-pulse" },
           { icon: Briefcase, label: "Active Deals", value: 4, sub: "2 in review", color: "text-[var(--violet)]", bg: "bg-[var(--violet)]/10", chartLine: "M0 10 L20 5 L40 15 L60 10 L80 20 L100 15", stroke: "var(--violet)", animClass: "group-hover:anim-jiggle" },
           { icon: Wallet, label: "Earnings (This Month)", value: monthlyEarnings, prefix: "₹", format: true, trend: "↑ 22% vs last month", color: "text-[var(--violet)]", bg: "bg-[var(--violet)]/10", chartLine: "M0 25 L20 20 L40 15 L60 20 L80 5 L100 0", stroke: "var(--violet)", animClass: "group-hover:-translate-y-1 transition-transform" }
         ].map((s, i) => (
           <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden group">
             <div className="flex items-center gap-3 mb-4 z-10 relative">
               <div className={`w-10 h-10 rounded-t-[16px] rounded-bl-[16px] rounded-br-sm ${s.bg} ${s.color} flex items-center justify-center`}>
                 <s.icon size={18} className={s.animClass} />
               </div>
               <span className="text-xs font-bold text-[var(--text-secondary)]">{s.label}</span>
             </div>
             
             <div className="flex flex-col z-10 relative">
                <div className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight mb-2">
                  <AnimatedNumber value={s.value} format={s.format} prefix={s.prefix} />
                </div>
                {s.trend ? (
                  <div className="text-[11px] font-bold text-emerald-500">
                    {s.trend}
                  </div>
                ) : (
                  <div className="text-[11px] font-bold text-[var(--text-tertiary)]">
                    {s.sub}
                  </div>
                )}
             </div>
             
             {/* Mini sparkline chart */}
             <div className="absolute right-4 bottom-4 w-1/3 h-10 opacity-40">
               <svg viewBox="0 0 100 30" className="w-full h-full fill-none stroke-[3px] stroke-linecap-round stroke-linejoin-round" preserveAspectRatio="none">
                 <path d={s.chartLine} stroke={s.stroke} />
               </svg>
             </div>
           </div>
         ))}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-8">
        
        {/* Left Column (Recommended Campaigns) */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex justify-between items-center mb-2">
             <div className="flex flex-col">
               <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Recent campaigns</h3>
               <span className="text-sm font-medium text-[var(--text-secondary)]">by Brands & Agencies</span>
             </div>
             <Link to="/explore" className="text-sm font-bold text-[var(--violet)] hover:underline flex items-center gap-1 bg-[var(--bg-elevated)] px-4 py-2 rounded-full transition-colors border border-[var(--border-default)]">View all <ArrowRight size={14}/></Link>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
             {(campaigns.length > 0 ? campaigns : [
               { title: 'Fitness Creator Campaign', name: 'Avantika Pandey', role: 'Influencer Marketing Manager', company: 'Nike', price_range: '18,000 - 30,000', platform: 'Instagram', brand_logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop', views: 409, applied: 124, category: 'Fitness & Sports' },
               { title: 'Skincare UGC Campaign', name: 'Mainak Das', role: 'Creative Head', company: 'Intuitive', price_range: '12,000 - 22,000', platform: 'YouTube', brand_logo: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=300&auto=format&fit=crop', views: 245, applied: 86, category: 'Beauty & Skincare' },
               { title: 'Food Creator Campaign', name: 'Taranjot Kaur', role: 'Influencer Marketing Manager', company: 'Zomato', price_range: '15,000 - 25,000', platform: 'Instagram', brand_logo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=300&auto=format&fit=crop', views: 532, applied: 201, category: 'Food & Beverage' }
             ]).map((c, i) => (
                <div key={i} onClick={() => handleCampaignTap(c.campaign_id || i, i)} className="snap-start shrink-0 w-[85%] md:w-[400px] bg-[var(--bg-card)] rounded-[1.5rem] border border-[var(--border-default)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between cursor-pointer hover:border-[var(--violet)]/50 transition-colors">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3">
                         <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-[var(--border-default)]">
                            <img src={c.brand_logo || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop'} alt="Brand Profile" className="w-full h-full object-cover" />
                         </div>
                         <div>
                            <h4 className="font-bold text-[var(--text-primary)] text-sm flex items-center gap-1">{c.brand_name || c.company || 'Brand Manager'} <CheckCircle size={12} className="text-emerald-500" /></h4>
                            <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 flex items-center gap-1"><Briefcase size={10} /> {c.targetAudience ? (c.targetAudience.split(',')[1] || c.targetAudience.split(',')[0]).trim() : (c.category || 'Campaign Category')}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)] mt-1">1d ago</p>
                         </div>
                      </div>
                      <Link to={`/campaign/${c.campaign_id || i}`} className="w-8 h-8 rounded-full border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"><ArrowRight size={14}/></Link>
                   </div>
                   
                   <p className="text-sm font-medium text-[var(--text-primary)] mb-4 line-clamp-2">Campaign Theme: <span className="font-normal text-[var(--text-secondary)]">{c.title} - The influencer buys a product from a local retail shop, then tracks its journey back...</span></p>
                   
                   <div className="flex flex-wrap items-center gap-6 text-xs mb-5">
                      <div className="flex items-center gap-3">
                         <span className="flex items-center justify-center w-[42px] h-[42px] text-[var(--text-primary)] bg-[var(--bg-card)] border-[2.5px] border-[var(--text-primary)] shadow-sm rounded-t-[20px] rounded-bl-[20px] rounded-br-sm"><IndianRupee size={18} strokeWidth={2.5}/></span>
                         <div>
                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold mb-0.5">Per Influencer</div>
                            <div className="font-bold text-[var(--text-primary)] text-[15px]">{c.price_range || `₹10,000`}</div>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="flex items-center justify-center w-[42px] h-[42px] text-[var(--text-primary)] bg-[var(--bg-card)] border-[2.5px] border-[var(--text-primary)] shadow-sm rounded-t-[20px] rounded-bl-sm rounded-br-[20px]"><Megaphone size={18} strokeWidth={2.5}/></span>
                         <div>
                            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold mb-0.5">Brand collab with</div>
                            <div className="font-bold text-[var(--text-primary)] text-[15px] line-clamp-1">{c.company || c.brand_name || 'Brand'}</div>
                         </div>
                      </div>
                   </div>

                   <div className="border-t border-[var(--border-default)] pt-3 flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1.5"><Eye size={14} className="anim-blink"/> {c.views || 0} Views</span>
                      <span className="w-1 h-1 bg-[var(--border-default)] rounded-full"></span>
                      {(() => {
                         const count = c.applied || (c.applicants ? c.applicants.length : 0) || 124;
                         const mockAvatars = [
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&fit=crop",
                            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop",
                            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=64&h=64&fit=crop"
                         ];
                         let displayAvatars = mockAvatars;
                         if (c.applicants && c.applicants.length > 0) {
                            displayAvatars = c.applicants.slice(0, 3).map((a, idx) => a.creator_photo || mockAvatars[idx % mockAvatars.length]);
                         }
                         return (
                            <div className="flex items-center gap-1.5 text-[var(--violet)] bg-[var(--violet)]/10 px-2 py-1 rounded-md">
                               <div className="flex -space-x-1.5 mr-0.5">
                                  {displayAvatars.map((src, idx) => (
                                     <img key={idx} className="w-4 h-4 rounded-full border border-[var(--bg-card)] shadow-sm" src={src} alt="avatar" />
                                  ))}
                               </div>
                               <span>{count}+ creators applied</span>
                            </div>
                         );
                      })()}
                   </div>
                </div>
             ))}
          </div>

          <div className="mt-8 flex justify-between items-center mb-2">
             <h3 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">Your Active Deals</h3>
             <Link to="/creator/ugc/orders" className="text-sm font-bold text-[var(--violet)] hover:underline">View All</Link>
          </div>
          <div className="flex gap-2">
            <button className="bg-[var(--violet)] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm">All</button>
            <button className="bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] text-xs font-bold px-4 py-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors">In Progress</button>
            <button className="bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] text-xs font-bold px-4 py-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors">Pending Review</button>
            <button className="bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)] text-xs font-bold px-4 py-2 rounded-full hover:bg-[var(--bg-elevated)] transition-colors">Completed</button>
          </div>
        </div>


      </div>
      
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { useLoading } from "../contexts/LoadingContext";
import { toast } from "sonner";
import { 
  ArrowLeft, Instagram, Sparkles, CheckCircle, ExternalLink, 
  HelpCircle, Eye, Heart, BarChart3, AlertCircle, RefreshCw, Smartphone
} from "lucide-react";

export default function AddCollab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();

  const [deal, setDeal] = useState(null);
  const [postUrl, setPostUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState(false);

  // Simulated metrics fetched from postUrl
  const [previewMetrics, setPreviewMetrics] = useState({
    views: 0,
    likes: 0,
    reach: 0,
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
    caption: "",
    author: ""
  });

  const loadDeal = () => {
    startLoading();
    api.get(`/deals/${id}`)
      .then(({ data }) => {
        setDeal(data);
        stopLoading();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Collab details not found");
        stopLoading();
      });
  };

  useEffect(() => {
    loadDeal();
  }, [id]);

  const handleFetchPreview = (e) => {
    e.preventDefault();
    if (!postUrl.trim()) {
      toast.error("Please enter your live Instagram post link");
      return;
    }
    if (!postUrl.includes("instagram.com")) {
      toast.error("Please enter a valid Instagram URL (e.g., instagram.com/p/...)");
      return;
    }

    setFetching(true);
    // Simulate API fetch delay
    setTimeout(() => {
      const isReel = postUrl.includes("/reel/") || postUrl.includes("/reels/");
      const randomViews = Math.floor(Math.random() * 32000 + 15000);
      const randomLikes = Math.floor(randomViews * 0.06);
      const randomReach = Math.floor(randomViews * 1.15);

      setPreviewMetrics({
        views: randomViews,
        likes: randomLikes,
        reach: randomReach,
        thumbnail: isReel 
          ? "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800"
          : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800",
        caption: deal?.deliverable ? `Reviewing ${deal.deliverable} check it out! #collab #sponsored` : "Loving this amazing product! AD",
        author: user?.name || "creator"
      });

      setFetching(false);
      setFetchSuccess(true);
      toast.success("Live Instagram post data successfully fetched!");
    }, 1500);
  };

  const handleSubmitProof = async () => {
    if (!fetchSuccess) {
      toast.error("Please fetch post metrics successfully before submitting");
      return;
    }

    startLoading();
    try {
      await api.post(`/deals/${id}/add-collab`, {
        instagram_post_url: postUrl,
        fetched_views: previewMetrics.views,
        fetched_likes: previewMetrics.likes,
        fetched_reach: previewMetrics.reach,
        manual_screenshot_url: previewMetrics.thumbnail,
        fetch_status: "SYNCED"
      });

      toast.success("Proof uploaded successfully! Redirecting to synced dashboard...");
      navigate(`/deals/${id}/uploaded-collab`);
    } catch(err) {
      toast.error(err.response?.data?.detail || "Could not save Instagram metrics proof");
    } finally {
      stopLoading();
    }
  };

  if (!deal) {
    return (
      <div className="w-full max-w-none px-6 py-16 text-center text-white/50 bg-[#09090e]">
        Fetching deal context...
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-4 sm:px-6 md:px-12 py-8 bg-[#09090e] text-white">
      
      {/* Navigation and Title */}
      <div className="max-w-3xl mx-auto mb-6">
        <Link to={`/deals/${id}`} className="text-sm text-white/50 hover:text-[#9D7CFF] flex items-center gap-1.5 font-medium transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Deal Tracker
        </Link>
        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider">
          LIVE POST INTEGRATION WORKSPACE
        </span>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-2 leading-tight">
          Add Live Instagram Post Metrics
        </h1>
        <p className="text-xs text-white/50 mt-1 font-normal">
          Contract target: {deal.deliverable || "Collab contract details"}
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Input pasting URL Form card */}
        <div className="bg-[#131224]/50 border border-white/10 rounded-3xl p-6 sm:p-8 text-left space-y-4">
          <h3 className="text-sm font-black text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">
            Paste Instagram link
          </h3>

          <form onSubmit={handleFetchPreview} className="space-y-4">
            <p className="text-xs text-white/60 leading-relaxed font-normal">
              Provide the live link to your Instagram Post, Reel, or Carousels. Our automated platform will sync the likes, impressions, views, and reach metrics to populate your partner dashboard.
            </p>

            <div className="flex gap-3">
              <div className="relative flex-grow">
                <Instagram size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="url" 
                  value={postUrl} 
                  onChange={(e) => setPostUrl(e.target.value)} 
                  disabled={fetching}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#7C5CFF]" 
                  placeholder="https://www.instagram.com/p/..."
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={fetching} 
                className="bg-[#7C5CFF] hover:bg-[#6D3FFF] text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {fetching ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {fetching ? "Syncing API..." : "Fetch Post Data"}
              </button>
            </div>
          </form>
        </div>

        {/* --- LIVE PREVIEW AUTOMATED CARDS --- */}
        {fetchSuccess && (
          <div className="bg-[#131224]/30 border border-white/10 rounded-3xl p-6 sm:p-8 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">
                Automated Insights Response Card
              </h3>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-bold">
                <CheckCircle size={10} /> LINK VALIDATED
              </span>
            </div>

            {/* Layout mockup mimicking smartphone view post layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Smartphone mockup left */}
              <div className="md:col-span-5 bg-black/60 border border-white/5 rounded-2xl overflow-hidden relative max-w-[260px] mx-auto md:ml-0 shadow-lg">
                <div className="bg-white/5 py-2 px-3 flex items-center gap-2 border-b border-white/5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[9px] font-mono text-white/30 ml-auto select-none">instagram.mock.cdn</span>
                </div>
                <div className="aspect-square relative overflow-hidden bg-slate-900 border-b border-white/5">
                  <img src={previewMetrics.thumbnail} alt="Instagram Post Thumbnail preview" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 text-left space-y-1">
                  <div className="text-[10px] font-bold text-white flex items-center justify-between">
                    <span>@{previewMetrics.author}</span>
                  </div>
                  <p className="text-[9px] text-white/60 leading-snug line-clamp-2 font-normal">
                    {previewMetrics.caption}
                  </p>
                </div>
              </div>

              {/* Stats values display card right */}
              <div className="md:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Platform Synced Metrics</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                    <Eye size={16} className="text-[#9D7CFF] mb-1.5" />
                    <span className="text-[9px] uppercase font-bold text-white/40 block">Views Sync</span>
                    <span className="text-base font-black font-display text-white mt-1 block">
                      {previewMetrics.views.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                    <Heart size={16} className="text-rose-400 mb-1.5" />
                    <span className="text-[9px] uppercase font-bold text-white/40 block">Likes count</span>
                    <span className="text-base font-black font-display text-white mt-1 block">
                      {previewMetrics.likes.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                    <BarChart3 size={16} className="text-emerald-400 mb-1.5" />
                    <span className="text-[9px] uppercase font-bold text-white/40 block">Estimated Reach</span>
                    <span className="text-base font-black font-display text-white mt-1 block">
                      {previewMetrics.reach.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 text-xs">
                  <p className="text-emerald-400 font-bold mb-1">Agreement check passed</p>
                  <p className="text-white/60 font-normal leading-relaxed text-[11px]">These live metrics comply directly with target parameters defined inside negotiations contracts. Ready to submit and trigger escrow processing.</p>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleSubmitProof}
                    className="w-full bg-[#D9F111] hover:bg-[#ccd110] text-black font-extrabold text-xs py-3.5 rounded-2xl transition-all shadow-md uppercase tracking-wider cursor-pointer"
                  >
                    Submit Proof & Proceed with Payout verification
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

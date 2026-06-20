import React, { useState } from 'react';
import { Settings, Shield, Edit3, Image as ImageIcon, Link as LinkIcon, Search, GripVertical, Plus, X } from 'lucide-react';

const mockBanners = [
  { id: 'b1', type: 'Influencer', placement: 'Home Top', imgUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', status: 'Live', clicks: 1240 },
  { id: 'b2', type: 'Brand', placement: 'Sidebar', imgUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80', status: 'Scheduled', clicks: 0 },
];

export default function BannerManager() {
  const [tab, setTab] = useState('Influencer');
  const [banners, setBanners] = useState(mockBanners);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const filtered = banners.filter(b => b.type === tab);

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-black/40 p-1 rounded-xl border border-foreground/10 w-full md:w-auto">
             {['Influencer', 'Brand'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-[#9D7CFF] text-white shadow-md' : 'text-foreground/60 hover:text-foreground'}`}
                >
                  {t} Banners
                </button>
             ))}
          </div>
          <button onClick={() => setShowUploadModal(true)} className="w-full md:w-auto px-4 py-2 bg-white text-black font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors hover:bg-gray-200">
             <Plus size={16}/> Upload New Banner
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(b => (
             <div key={b.id} className="bg-card border border-foreground/10 rounded-2xl overflow-hidden group">
                <div className="relative aspect-[21/9] bg-black/40">
                   <img src={b.imgUrl} alt="Banner" className="w-full h-full object-cover" />
                   <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur border border-white/10 rounded-md text-[10px] font-bold uppercase text-white tracking-widest">
                      {b.placement}
                   </div>
                   {b.status === 'Live' && (
                      <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                   )}
                </div>
                <div className="p-4 bg-card flex items-center justify-between">
                   <div>
                      <div className="text-sm font-semibold flex items-center gap-2">
                         Status: <span className={b.status === 'Live' ? 'text-green-400' : 'text-amber-400'}>{b.status}</span>
                      </div>
                      <div className="text-xs text-foreground/50 mt-1">{b.clicks.toLocaleString()} clicks</div>
                   </div>
                   <button className="text-foreground/40 hover:text-white transition-colors p-2"><Edit3 size={18}/></button>
                </div>
             </div>
          ))}
          {filtered.length === 0 && (
             <div className="col-span-full py-12 text-center text-foreground/40 border border-dashed border-foreground/20 rounded-2xl">
                No active banners in this category.
             </div>
          )}
       </div>

       {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
             <div className="bg-[#12121A] border border-foreground/10 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-foreground/10 flex justify-between items-center">
                   <h3 className="font-display font-semibold text-lg flex items-center gap-2"><ImageIcon size={18}/> Upload Banner</h3>
                   <button onClick={() => setShowUploadModal(false)} className="text-foreground/50 hover:text-white"><X size={20}/></button>
                </div>
                <div className="p-5 space-y-4">
                   <div className="border-2 border-dashed border-foreground/20 rounded-xl p-8 text-center flex flex-col items-center justify-center hover:bg-foreground/5 transition-colors cursor-pointer text-foreground/50 hover:text-foreground">
                      <ImageIcon size={32} className="mb-2 opacity-50" />
                      <div className="text-sm font-semibold">Click to upload image</div>
                      <div className="text-xs mt-1">1200x400px recommended (Max 2MB)</div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-medium text-foreground/50 mb-1 block">Target Audience</label>
                         <select className="w-full bg-black/40 border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D7CFF]">
                            <option>Influencers</option>
                            <option>Brands</option>
                         </select>
                      </div>
                      <div>
                         <label className="text-xs font-medium text-foreground/50 mb-1 block">Placement</label>
                         <select className="w-full bg-black/40 border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D7CFF]">
                            <option>Home Top Banner</option>
                            <option>Sidebar</option>
                         </select>
                      </div>
                   </div>

                   <div>
                      <label className="text-xs font-medium text-foreground/50 mb-1 block">Click-Through URL</label>
                      <div className="relative">
                         <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                         <input type="text" placeholder="https://..." className="w-full bg-black/40 border border-foreground/10 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#9D7CFF]"/>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-xs font-medium text-foreground/50 mb-1 block">Start Date</label>
                         <input type="date" className="w-full bg-black/40 border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D7CFF]" />
                      </div>
                      <div>
                         <label className="text-xs font-medium text-foreground/50 mb-1 block">End Date</label>
                         <input type="date" className="w-full bg-black/40 border border-foreground/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D7CFF]" />
                      </div>
                   </div>
                </div>
                <div className="p-4 border-t border-foreground/10 bg-card flex justify-end gap-3">
                   <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-white">Cancel</button>
                   <button onClick={() => setShowUploadModal(false)} className="px-5 py-2 bg-[#9D7CFF] hover:bg-[#8B6BE0] text-white text-sm font-bold rounded-xl transition-colors">Save & Publish</button>
                </div>
             </div>
          </div>
       )}
    </div>
  );
}

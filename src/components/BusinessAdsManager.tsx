import React, { useState } from 'react';
import { Megaphone, Plus, Target, Calendar, BarChart3, AlertCircle, Trash2, ExternalLink, Sparkles } from 'lucide-react';

interface BusinessAdsProps {
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
  theme?: 'dark' | 'light';
  sponsoredAds: any[];
  setSponsoredAds: React.Dispatch<React.SetStateAction<any[]>>;
  onUpdateCompanyRevenue: (amount: number) => void;
  username: string;
}

const AD_PRESET_IMAGES = [
  { name: 'Quantum Core', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60' },
  { name: 'Crypto Safe', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60' },
  { name: 'Neural Flow', url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=60' },
  { name: 'Sovereign Node', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60' }
];

export default function BusinessAdsManager({
  balance,
  onUpdateBalance,
  theme = 'dark',
  sponsoredAds,
  setSponsoredAds,
  onUpdateCompanyRevenue,
  username
}: BusinessAdsProps) {
  const isLight = theme === 'light';

  // State definitions for Ad Creation Form
  const [campaignTitle, setCampaignTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adPresetImage, setAdPresetImage] = useState(AD_PRESET_IMAGES[0].url);
  const [adCtaText, setAdCtaText] = useState('Explore Mesh');
  const [adCtaUrl, setAdCtaUrl] = useState('https://ai.studio/build');
  const [adBudget, setAdBudget] = useState('100');
  const [adCpc, setAdCpc] = useState('0.25');

  // New Requirements Fields
  const [targetAudience, setTargetAudience] = useState('developers');
  const [campaignSchedule, setCampaignSchedule] = useState('7_days');
  const [campaignGoal, setCampaignGoal] = useState('traffic');

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();

    const budgetValue = parseFloat(adBudget);
    const cpcValue = parseFloat(adCpc);

    if (isNaN(budgetValue) || budgetValue <= 0) {
      alert("Please provide a valid total budget.");
      return;
    }
    if (isNaN(cpcValue) || cpcValue <= 0) {
      alert("Please provide a valid Cost Per Click.");
      return;
    }

    if (budgetValue > balance) {
      alert(`Insufficient funds! Your current wallet balance is ${balance.toFixed(2)} LC, but this campaign requires ${budgetValue.toFixed(2)} LC.`);
      return;
    }

    // Spend ledger balance
    onUpdateBalance(balance - budgetValue);

    // Update company revenue: 1 LC spent adds $12.50 to company's corporate gross revenue
    const usdContribution = budgetValue * 12.50;
    onUpdateCompanyRevenue(usdContribution);

    // Create a beautifully decorated sponsored post
    const newAd = {
      id: `ad_${Date.now()}`,
      authorName: username,
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=60',
      authorPublicKey: '0x3f5c88da99a11...E381',
      nodeName: 'broadcaster-biz-01',
      campaignName: campaignTitle || 'Sovereign Sponsor',
      imageUrl: adPresetImage,
      content: `${adDescription} #${targetAudience}-target`,
      sponsorCta: adCtaText,
      sponsorUrl: adCtaUrl,
      isSponsored: true,
      budget: budgetValue,
      spent: 0,
      impressions: 1, // Start with 1 view
      clicks: 0,
      reach: 1,
      engagement: 0,
      isActive: true,
      cpc: cpcValue,
      targetAudience,
      schedule: campaignSchedule,
      campaignGoal,
      type: 'media',
      timestamp: Date.now(),
      likes: 0,
      commentsCount: 0,
      comments: []
    };

    setSponsoredAds(prev => [newAd, ...prev]);

    // Clear form
    setCampaignTitle('');
    setAdDescription('');
    setAdCtaText('Explore Mesh');
    setAdBudget('100');
    setAdCpc('0.25');

    alert(`Campaign successfully registered! Deducted ${budgetValue.toFixed(2)} LC from your node. Cumulative corporate revenue boosted by +$${usdContribution.toLocaleString()}!`);
  };

  const handleStopCampaign = (id: string, budget: number, spent: number) => {
    const refund = Math.max(0, budget - spent);
    if (refund > 0) {
      onUpdateBalance(balance + refund);
      alert(`Campaign stopped. Safe returned +${refund.toFixed(2)} LC unspent budget to your wallet ledger!`);
    } else {
      alert(`Campaign completed or fully exhausted. Safe liquidated.`);
    }
    setSponsoredAds(prev => prev.filter(a => a.id !== id));
  };

  const handleIncrementMetrics = (id: string) => {
    // Simulate organic traffic
    setSponsoredAds(prev => prev.map(ad => {
      if (ad.id === id) {
        if (ad.spent >= ad.budget) {
          alert(`Campaign "${ad.campaignName}" has exhausted its allocated budget of ${ad.budget} LC.`);
          return ad;
        }

        const newClicks = ad.clicks + Math.floor(Math.random() * 4) + 1;
        const newImpressions = ad.impressions + Math.floor(Math.random() * 15) + 10;
        const incrementalSpent = parseFloat((newClicks * ad.cpc).toFixed(2));
        const finalSpent = Math.min(ad.budget, ad.spent + incrementalSpent);
        const reach = Math.round(newImpressions * 0.85);
        const engagement = newImpressions > 0 ? parseFloat(((newClicks / newImpressions) * 100).toFixed(2)) : 0;

        return {
          ...ad,
          clicks: newClicks,
          impressions: newImpressions,
          reach,
          engagement,
          spent: finalSpent
        };
      }
      return ad;
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Info card */}
      <div className={`p-4 border rounded-xl flex items-start gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-900 text-slate-300'
      }`}>
        <AlertCircle className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-slate-200">Decentralized Business Ads Manager</p>
          <p className="text-slate-400 leading-relaxed">
            Create sponsored ad blocks, specify demographic protocol targets, allocate click budgets, and track telemetry metrics in real-time. Campaigns appear naturally in the public social feed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ad creation form builder */}
        <div className={`lg:col-span-6 p-6 border rounded-2xl space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#090E1A] border-slate-900 shadow-xl'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
            <h4 className={`text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <Plus className="w-4 h-4 text-cyan-400" />
              Campaign Builder
            </h4>
            <span className="text-[10px] font-mono text-slate-500">Form Node v1.1</span>
          </div>

          <form onSubmit={handleCreateAd} className="space-y-4 font-mono text-xs text-left">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block font-bold">Campaign Name</label>
                <input 
                  type="text" 
                  value={campaignTitle}
                  onChange={e => setCampaignTitle(e.target.value)}
                  placeholder="Campaign Name"
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block font-bold">CTA Text</label>
                <input 
                  type="text" 
                  value={adCtaText}
                  onChange={e => setAdCtaText(e.target.value)}
                  placeholder="Button Label"
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase block font-bold">Ad Narrative (Description)</label>
              <textarea 
                value={adDescription}
                onChange={e => setAdDescription(e.target.value)}
                placeholder="Declare your promotional value or protocol announcement to the community..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* NEW REQUIREMENT: TARGET AUDIENCE, SCHEDULE & GOALS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block font-bold">
                  <span className="flex items-center gap-1"><Target className="w-3 h-3 text-cyan-400" /> Audience</span>
                </label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-2 text-slate-100 font-mono text-xs cursor-pointer focus:outline-none focus:border-cyan-500"
                >
                  <option value="developers">Developers / Geeks</option>
                  <option value="crypto_peers">DeFi Traders</option>
                  <option value="general_social">General Peers</option>
                  <option value="archon_validators">Archon Validators</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block font-bold">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-cyan-400" /> Schedule</span>
                </label>
                <select
                  value={campaignSchedule}
                  onChange={e => setCampaignSchedule(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-2 text-slate-100 font-mono text-xs cursor-pointer focus:outline-none focus:border-cyan-500"
                >
                  <option value="3_days">3 Days Boost</option>
                  <option value="7_days">7 Days Standard</option>
                  <option value="30_days">30 Days Enterprise</option>
                  <option value="continuous">Continuous Feed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block font-bold">
                  <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3 text-cyan-400" /> Goal</span>
                </label>
                <select
                  value={campaignGoal}
                  onChange={e => setCampaignGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-2 text-slate-100 font-mono text-xs cursor-pointer focus:outline-none focus:border-cyan-500"
                >
                  <option value="traffic">Traffic Clicks (CPC)</option>
                  <option value="brand_reach">Brand Reach (CPM)</option>
                  <option value="node_conversions">Node Installs</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block font-bold">Campaign Budget (LC)</label>
                <input 
                  type="number" 
                  value={adBudget}
                  onChange={e => setAdBudget(e.target.value)}
                  min="5"
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
                <span className="text-[9px] text-slate-500 font-sans">Deducted from wallet balance</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase block font-bold">Cost Per Click (LC)</label>
                <input 
                  type="number" 
                  value={adCpc}
                  onChange={e => setAdCpc(e.target.value)}
                  step="0.05"
                  min="0.05"
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 uppercase block font-bold">Promotion Banner Presets</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AD_PRESET_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAdPresetImage(img.url)}
                    className={`p-1.5 border rounded text-[9px] transition truncate text-left ${
                      adPresetImage === img.url ? 'border-cyan-500 bg-cyan-950/10 text-cyan-400 font-bold' : 'border-slate-850 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    {img.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md shadow-violet-600/15"
            >
              Launch Decentralized Ad Campaign
            </button>
          </form>
        </div>

        {/* Campaign Analytics / Tracking Dashboard */}
        <div className={`lg:col-span-6 p-6 border rounded-2xl space-y-4 ${
          isLight ? 'bg-white border-slate-200' : 'bg-[#090E1A] border-slate-900 shadow-xl'
        }`}>
          <div className="flex items-center justify-between border-b border-slate-900/60 pb-3">
            <h4 className={`text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <Megaphone className="w-4 h-4 text-violet-400" />
              Active Campaign Telemetry
            </h4>
            <span className="text-[10px] font-mono text-slate-500">Ledger Distribution: Streamed</span>
          </div>

          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {sponsoredAds.map((ad, idx) => (
              <div key={ad.id || idx} className="p-4 bg-slate-950/50 rounded-xl border border-slate-900 font-mono space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="space-y-0.5 text-left">
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      {ad.campaignName}
                      <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                    </span>
                    <div className="flex gap-1.5 text-[9px] text-slate-500 font-mono uppercase flex-wrap">
                      <span>Target: {ad.targetAudience}</span>
                      <span>• Goal: {ad.campaignGoal}</span>
                      <span>• Schedule: {ad.schedule}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 uppercase font-black animate-pulse">
                    Live
                  </span>
                </div>
                
                {/* 4 Analytics Pillars */}
                <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-500 text-center border-t border-b border-slate-900 py-3">
                  <div>
                    <div className="text-slate-200 font-bold text-xs">{ad.impressions || 0}</div>
                    <div className="scale-95 text-[9px] mt-0.5 text-slate-500">Impressions</div>
                  </div>
                  <div>
                    <div className="text-slate-200 font-bold text-xs">{ad.clicks || 0}</div>
                    <div className="scale-95 text-[9px] mt-0.5 text-slate-500 font-mono">Clicks</div>
                  </div>
                  <div>
                    <div className="text-slate-200 font-bold text-xs">{ad.reach || 0}</div>
                    <div className="scale-95 text-[9px] mt-0.5 text-slate-500">Est. Reach</div>
                  </div>
                  <div>
                    <div className="text-emerald-400 font-bold text-xs">{(ad.engagement || 0).toFixed(1)}%</div>
                    <div className="scale-95 text-[9px] mt-0.5 text-slate-500">Engagement</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 text-[10px] text-slate-400 py-0.5">
                  <div className="text-left">Budget: <strong className="text-slate-300">{ad.budget} LC</strong></div>
                  <div className="text-right">Spent: <strong className="text-violet-400">{(ad.spent || 0).toFixed(2)} LC</strong></div>
                </div>

                <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-900/60">
                  <button
                    onClick={() => handleIncrementMetrics(ad.id)}
                    className="text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    Simulate Organic Peer Click
                  </button>
                  <button
                    onClick={() => handleStopCampaign(ad.id, ad.budget, ad.spent)}
                    className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Stop & Refund
                  </button>
                </div>
              </div>
            ))}

            {sponsoredAds.length === 0 && (
              <div className="py-16 text-center text-xs text-slate-500 font-sans border border-dashed border-slate-900 rounded-xl">
                No active target campaigns registered. Configure your target demographics above to propagate sponsored feed posts!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

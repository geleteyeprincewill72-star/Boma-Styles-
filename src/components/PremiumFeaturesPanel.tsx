import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Cpu, Flame, CheckCircle2, Send, HelpCircle, Loader2, ArrowUpCircle } from 'lucide-react';

interface PremiumFeaturesProps {
  isPremium: boolean;
  theme?: 'dark' | 'light';
}

const SUPPORT_PRESETS = [
  { q: "What is the bandwidth limit of standard nodes?", a: "[Priority Desk Route #1]: Standard nodes are limited to 5MB per block broadcast. Upgraded premium nodes operate on a high-fidelity 100MB UHD packet size to prevent degradation." },
  { q: "How are my earnings calculated?", a: "[Priority Desk Route #2]: Content yields are calculated at a programmatic 4.00 LC CPM rate per 1,000 certified impressions of integrated programmatic feed blocks." },
  { q: "Is the wallet secure?", a: "[Priority Desk Route #3]: Absolutely. OmniSphere uses client-side signed Web Cryptography keys. Your private keys never leave your browser sandbox." }
];

export default function PremiumFeaturesPanel({
  isPremium,
  theme = 'dark'
}: PremiumFeaturesProps) {
  const isLight = theme === 'light';

  // State definitions for premium customization
  const [premiumBadge, setPremiumBadge] = useState(() => {
    return localStorage.getItem('aura_premium_badge') || '💎 ARCHON';
  });

  const [premiumGlowColor, setPremiumGlowColor] = useState(() => {
    return localStorage.getItem('aura_premium_glow') || 'gold';
  });

  useEffect(() => {
    localStorage.setItem('aura_premium_badge', premiumBadge);
  }, [premiumBadge]);

  useEffect(() => {
    localStorage.setItem('aura_premium_glow', premiumGlowColor);
  }, [premiumGlowColor]);

  // Support desk chat states
  const [supportMessage, setSupportMessage] = useState('');
  const [supportChat, setSupportChat] = useState<{ sender: 'user' | 'system', text: string, timestamp: number }[]>(() => {
    return [
      { sender: 'system', text: "Welcome to the Sovereign Priority Support Desk. Premium members receive 24/7 hyper-priority routing on dedicated network nodes.", timestamp: Date.now() }
    ];
  });
  const [isSendingSupport, setIsSendingSupport] = useState(false);

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    const userMsg = supportMessage;
    setSupportChat(prev => [...prev, { sender: 'user', text: userMsg, timestamp: Date.now() }]);
    setSupportMessage('');
    setIsSendingSupport(true);

    setTimeout(() => {
      // Generate intelligent automated answer based on keywords
      let reply = "[Priority Desk Route #9]: Your request has been logged. Our priority consensus ring is reviewing your ledger block. Standard response time is < 30 seconds.";
      
      const lower = userMsg.toLowerCase();
      if (lower.includes('limit') || lower.includes('upload') || lower.includes('size')) {
        reply = "[Priority Desk Route #4]: Your high-upload limits are unlocked. You can broadcast large asset files up to 100MB natively without peer degradation.";
      } else if (lower.includes('earnings') || lower.includes('monetiz') || lower.includes('billion')) {
        reply = "[Priority Desk Route #5]: The Creator program unlocks globally once our cumulative ledger revenue hits $1 Billion. You can contribute via campaigns or direct seeds.";
      } else if (lower.includes('badge') || lower.includes('customize') || lower.includes('color')) {
        reply = "[Priority Desk Route #6]: Profile customizing features are active! Toggle your verification badge text and custom golden glowing aura instantly in the control board.";
      } else {
        const found = SUPPORT_PRESETS.find(p => lower.includes(p.q.toLowerCase().split(' ')[2]));
        if (found) reply = found.a;
      }

      setSupportChat(prev => [...prev, { sender: 'system', text: reply, timestamp: Date.now() }]);
      setIsSendingSupport(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Locked premium customization container */}
      {!isPremium ? (
        <div className={`p-8 border border-dashed rounded-3xl text-center max-w-xl mx-auto space-y-5 my-12 ${
          isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-950/40 border-slate-900/80'
        }`}>
          <div className="relative w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className={`text-lg font-bold font-sans ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
              Premium Node Features Locked
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-md mx-auto">
              Aura Premium unlocks sovereign identity customization, golden verification badges, advanced bandwidth limits (100MB), and direct priority help desk routing.
            </p>
          </div>

          <div className="text-xs text-amber-500 font-mono bg-amber-950/20 border border-amber-500/20 p-3 rounded-xl inline-block">
            🎁 Purchase Monthly or Yearly Pass on the 'Premium Passes' tab to activate!
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Customizer options */}
          <div className={`lg:col-span-6 p-6 border rounded-2xl space-y-5 ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900 shadow-xl'
          }`}>
            <h4 className={`text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <Sparkles className="w-4 h-4 text-amber-400" />
              Sovereign Customization Engine
            </h4>

            {/* Verification badge selector */}
            <div className="space-y-2 text-xs font-mono">
              <label className="text-[10px] text-slate-500 uppercase block font-bold">Select Verification Badge Emoji</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {['💎 ARCHON', '👑 SVRGN', '🌟 GOLD', '⚡ FUSION'].map((badge) => (
                  <button
                    key={badge}
                    onClick={() => {
                      setPremiumBadge(badge);
                      alert(`Verification badge set to ${badge}! Reflects immediately next to your post blocks.`);
                    }}
                    className={`p-2 border rounded text-[10px] text-center transition ${
                      premiumBadge === badge 
                        ? 'border-amber-500 bg-amber-950/20 text-amber-400 font-black' 
                        : 'border-slate-850 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>

            {/* Glowing avatar color */}
            <div className="space-y-2 text-xs font-mono">
              <label className="text-[10px] text-slate-500 uppercase block font-bold">Avatar Halo Aura Glow</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'gold', name: 'Imperial Gold', class: 'border-amber-500 text-amber-400' },
                  { id: 'cyan', name: 'Cyber Teal', class: 'border-cyan-500 text-cyan-400' },
                  { id: 'magenta', name: 'Neon Magenta', class: 'border-pink-500 text-pink-400' }
                ].map((color) => (
                  <button
                    key={color.id}
                    onClick={() => {
                      setPremiumGlowColor(color.id);
                      alert(`Avatar glowing accent configured as ${color.name}!`);
                    }}
                    className={`p-2 border rounded text-[9px] text-center transition ${
                      premiumGlowColor === color.id 
                        ? `${color.class} bg-slate-950 font-bold` 
                        : 'border-slate-850 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Technical Upgrades Info */}
            <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/30 text-xs font-sans space-y-3">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-amber-400 font-bold">
                <Shield className="w-4 h-4" />
                Network Infrastructure Upgrades Active
              </div>
              <ul className="space-y-2 text-slate-400 text-xs list-disc pl-4 leading-relaxed">
                <li><strong className="text-slate-200">Decentralized 100% Ad-Free Feed</strong>: Banner, native, and interstitial program ads are automatically blocked.</li>
                <li><strong className="text-slate-200">Broadcaster Node Limit (100MB)</strong>: Standard peers are capped at 5MB limit. Your broadcasts handle high-fidelity, uncompressed 100MB packets securely.</li>
                <li><strong className="text-slate-200">Sovereign Signatures</strong>: Signed items highlight your custom Badge and glowing Aura.</li>
              </ul>
            </div>
          </div>

          {/* Priority Help Desk */}
          <div className={`lg:col-span-6 p-6 border rounded-2xl flex flex-col h-[400px] justify-between ${
            isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900 shadow-xl'
          }`}>
            <h4 className={`text-xs font-bold font-mono uppercase tracking-wide flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-slate-200'} pb-3 border-b border-slate-900/60`}>
              <Cpu className="w-4 h-4 text-emerald-400" />
              Priority support Desk Node
            </h4>

            {/* Chat list */}
            <div className="flex-grow my-4 overflow-y-auto space-y-3 pr-1">
              {supportChat.map((msg, idx) => (
                <div key={idx} className={`text-xs font-mono rounded-lg p-2.5 leading-relaxed text-left ${
                  msg.sender === 'user' 
                    ? 'bg-cyan-950/20 text-cyan-400 border border-cyan-500/20 ml-8' 
                    : 'bg-slate-950/60 text-slate-300 border border-slate-900/40 mr-8'
                }`}>
                  {msg.text}
                </div>
              ))}
              {isSendingSupport && (
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Routing request over priority fiber-ring...
                </div>
              )}
            </div>

            {/* Suggested quick questions */}
            <div className="flex flex-wrap gap-1.5 pb-2 text-[9px] font-mono">
              <span className="text-slate-500 flex items-center gap-0.5">Quick Ask:</span>
              {SUPPORT_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSupportMessage(p.q)}
                  className="px-2 py-0.5 border border-slate-800 rounded bg-slate-950 hover:border-slate-700 text-slate-400"
                >
                  {p.q.slice(0, 15)}...
                </button>
              ))}
            </div>

            {/* Send form */}
            <form onSubmit={handleSendSupport} className="flex gap-2 font-mono">
              <input
                type="text"
                value={supportMessage}
                onChange={e => setSupportMessage(e.target.value)}
                placeholder="Ask our 24/7 hyper-priority support ring..."
                className="flex-grow bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}

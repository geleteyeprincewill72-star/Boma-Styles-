import React, { useState, useEffect } from 'react';
import { Lock, Award, TrendingUp, DollarSign, Users, AlertCircle, Heart, CheckCircle2, ChevronRight, RefreshCw, Send, ArrowUpRight } from 'lucide-react';

interface CreatorMonetizationProps {
  balance: number;
  onUpdateBalance: (newBalance: number) => void;
  theme?: 'dark' | 'light';
  transactions: any[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
  companyRevenue: number;
  onUpdateCompanyRevenue: (amount: number) => void;
}

export default function CreatorMonetization({
  balance,
  onUpdateBalance,
  theme = 'dark',
  transactions,
  setTransactions,
  companyRevenue,
  onUpdateCompanyRevenue
}: CreatorMonetizationProps) {
  const isLight = theme === 'light';
  
  // Is Creator approved status
  const [isCreatorApproved, setIsCreatorApproved] = useState<boolean>(() => {
    return localStorage.getItem('aura_is_creator_approved') === 'true';
  });

  // Creator stats (Views, clicks, earnings)
  const [creatorViews, setCreatorViews] = useState<number>(() => {
    const cached = localStorage.getItem('aura_creator_views');
    return cached ? parseInt(cached) : 14200;
  });

  const [creatorBalance, setCreatorBalance] = useState<number>(() => {
    const cached = localStorage.getItem('aura_creator_balance');
    return cached ? parseFloat(cached) : 85.20;
  });

  useEffect(() => {
    localStorage.setItem('aura_is_creator_approved', isCreatorApproved ? 'true' : 'false');
  }, [isCreatorApproved]);

  useEffect(() => {
    localStorage.setItem('aura_creator_views', creatorViews.toString());
  }, [creatorViews]);

  useEffect(() => {
    localStorage.setItem('aura_creator_balance', creatorBalance.toString());
  }, [creatorBalance]);

  // Handle donations / seeding to company
  const [seedAmount, setSeedAmount] = useState('500');

  const handleSeedCorporateTreasury = () => {
    const amount = parseFloat(seedAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Specify a valid seeding amount (LC).");
      return;
    }

    if (amount > balance) {
      alert(`Insufficient funds! Your wallet contains ${balance.toFixed(2)} LC, but this corporate seed requires ${amount.toFixed(2)} LC.`);
      return;
    }

    onUpdateBalance(balance - amount);
    // 1 LC equals $10.00 in simulated corporate value to reward developers
    const usdContribution = amount * 10;
    onUpdateCompanyRevenue(usdContribution);

    // Ledger log
    const txHash = '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const newTx = {
      id: `tx_corp_seed_${Date.now()}`,
      type: 'transfer',
      amount: amount,
      description: `Seeded OmniSphere Corporate Treasury: +$${usdContribution.toLocaleString()} USD value`,
      timestamp: Date.now(),
      txHash
    };
    setTransactions(prev => [newTx, ...prev]);

    alert(`Treasury contribution accepted! Seeded $${usdContribution.toLocaleString()} USD worth of LC into the corporate ledger. Cumulative revenue is increasing!`);
  };

  const handleCashOutCreatorEarnings = () => {
    if (creatorBalance <= 0) {
      alert("You have no pending creator earnings to claim.");
      return;
    }

    const claimAmount = creatorBalance;
    onUpdateBalance(balance + claimAmount);
    setCreatorBalance(0);

    const txHash = '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const newTx = {
      id: `tx_creator_cashout_${Date.now()}`,
      type: 'deposit',
      amount: claimAmount,
      description: `Claimed Creator Partner Program ad share payout`,
      timestamp: Date.now(),
      txHash
    };
    setTransactions(prev => [newTx, ...prev]);

    alert(`Success! Handshaked programmatic contract: Claimed +${claimAmount.toFixed(2)} LC and safely routed to your wallet ledger.`);
  };

  const handleHarvestContentImpressions = () => {
    // Generate organic peer views and update earnings
    const newViews = Math.floor(Math.random() * 2500) + 500;
    const additionalEarnings = parseFloat((newViews * 0.004).toFixed(2)); // $4.00 CPM rate
    
    setCreatorViews(prev => prev + newViews);
    setCreatorBalance(prev => parseFloat((prev + additionalEarnings).toFixed(2)));

    // Watch corporate revenue also tick up as peer nodes render these ads
    onUpdateCompanyRevenue(newViews * 0.02);

    alert(`Swarm peer nodes updated! Harvested +${newViews.toLocaleString()} new views yielding +${additionalEarnings.toFixed(2)} LC creator earnings!`);
  };

  // Determine milestone status
  const milestoneTarget = 1000000000; // $1 Billion
  const isMilestoneAchieved = companyRevenue >= milestoneTarget;
  const percentage = Math.min(100, (companyRevenue / milestoneTarget) * 100);
  const remaining = Math.max(0, milestoneTarget - companyRevenue);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1 BILLION REVENUE MILESTONE BAR */}
      <div className={`p-6 border rounded-2xl space-y-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#090E1A] border-slate-900 shadow-xl'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
              isMilestoneAchieved ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' : 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
            }`}>
              {isMilestoneAchieved ? 'Milestone UNLOCKED' : 'Corporate Target: $1 Billion USD'}
            </span>
            <h3 className={`text-sm font-bold font-sans tracking-tight ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              OmniSphere Global Creator Revenue Milestone
            </h3>
          </div>
          <div className="text-right font-mono text-xs">
            <span className={`${isMilestoneAchieved ? 'text-emerald-400 font-extrabold' : 'text-cyan-400'} font-bold`}>
              ${companyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-slate-500"> / $1B USD</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-900 overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${
                isMilestoneAchieved 
                  ? 'from-emerald-500 to-teal-500 animate-pulse' 
                  : 'from-cyan-500 via-indigo-500 to-purple-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>{percentage.toFixed(5)}% Completed</span>
            {isMilestoneAchieved ? (
              <span className="text-emerald-400 font-bold">MILESTONE REACHED! PROGRAM UNLOCKED GLOABLLY</span>
            ) : (
              <span>${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} remaining</span>
            )}
          </div>
        </div>

        {/* Informative Note */}
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          isMilestoneAchieved 
            ? 'bg-emerald-950/10 border-emerald-500/20 text-slate-300' 
            : 'bg-amber-950/10 border-amber-500/20 text-slate-300'
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isMilestoneAchieved ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
          <div className="text-xs space-y-1 font-sans">
            <p className="font-semibold text-slate-200">
              {isMilestoneAchieved 
                ? 'OmniSphere Partner Program is Active!' 
                : 'Program Lock Announcement:'}
            </p>
            <p className="text-slate-400 leading-relaxed">
              {isMilestoneAchieved 
                ? 'OmniSphere has successfully reached a global ecosystem valuation of $1 Billion. In accordance with blockchain-enforced protocol bylaws, creator revenue payouts are now fully active.' 
                : `To ensure network liquidity and token stability, creator revenue sharing payouts will unlock globally once cumulative corporate gross revenues reach exactly $1,000,000,000 USD from Google AdSense web ad networks, premium pass activations, and business campaign spends.`}
            </p>
          </div>
        </div>

        {/* Seed Company Panel (Only if not unlocked, but available for testing) */}
        {!isMilestoneAchieved && (
          <div className="pt-3 border-t border-slate-900 flex flex-col sm:flex-row items-center gap-3 justify-between">
            <div className="text-left">
              <h5 className="text-[11px] font-mono font-bold text-slate-300">Boost Corporate Milestone</h5>
              <p className="text-[10px] text-slate-500 font-sans">Deduct LC from your wallet to seed corporate treasury and force unlock the creator engine!</p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <input 
                type="number" 
                value={seedAmount}
                onChange={e => setSeedAmount(e.target.value)}
                placeholder="Amount (LC)"
                className="w-24 bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-100 text-center font-mono text-xs"
              />
              <button 
                onClick={handleSeedCorporateTreasury}
                className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold font-mono rounded text-[10px] uppercase transition shadow"
              >
                Seed Treasury
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CREATOR APPLICATION / DASHBOARD */}
      {!isCreatorApproved ? (
        <div className={`p-8 border border-dashed rounded-3xl text-center max-w-xl mx-auto space-y-6 my-12 ${
          isLight ? 'bg-white border-slate-300 shadow-sm' : 'bg-slate-950/40 border-slate-900/80'
        }`}>
          <div className="relative w-20 h-20 mx-auto bg-violet-950/15 rounded-full flex items-center justify-center border border-violet-500/20">
            <Award className="w-10 h-10 text-violet-400 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] text-violet-400 font-bold uppercase bg-violet-950/40 border border-violet-800/40 px-3 py-1 rounded">
              Creator Verification Console
            </span>
            <h3 className={`text-lg font-bold font-sans ${isLight ? 'text-slate-800' : 'text-slate-100'}`}>
              Verify Creator Account Identity
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-md mx-auto">
              Ready to claim your content yield? To qualify for ad dividend payouts once unlocked, creators must complete secure, decentralised cryptographic node registration.
            </p>
          </div>

          <button
            onClick={() => {
              setIsCreatorApproved(true);
              alert("Verification complete! Creator node registered on the consensus mesh.");
            }}
            className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-slate-100 rounded-xl font-bold font-mono text-xs uppercase transition tracking-wider shadow-lg shadow-violet-600/10 cursor-pointer"
          >
            Sign Creator Node Agreement
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Creator Program status options */}
          <div className="flex justify-between items-center bg-slate-950/20 p-3 rounded-xl border border-slate-900/40">
            <span className="text-[10px] text-slate-500 font-mono">Verification: Approved Creator Node (Active)</span>
            <button 
              onClick={() => {
                setIsCreatorApproved(false);
                alert("Creator registration cleared. Retested locked verification screen.");
              }}
              className="text-[9px] font-mono text-rose-400 hover:text-rose-300 uppercase"
            >
              Reset Verification State
            </button>
          </div>

          {/* ACTIVE DASHBOARD AND ANALYTICS */}
          {!isMilestoneAchieved ? (
            /* LOCKED DASHBOARD PREVIEW OVERLAY */
            <div className="relative overflow-hidden border border-slate-900 rounded-2xl p-6 bg-slate-950/10 backdrop-blur-[1px]">
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col justify-center items-center p-6 text-center space-y-4">
                <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800/40">
                  <Lock className="w-8 h-8 text-rose-500 animate-pulse" />
                </div>
                <div className="space-y-2 max-w-sm mx-auto">
                  <h4 className="text-sm font-bold font-sans text-slate-200">Creator Earnings Locked</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Your analytics are tracking, but revenue payouts cannot be activated until corporate gross reaches $1 Billion. 
                  </p>
                  <p className="text-[11px] text-amber-400 font-mono">
                    Milestone Target: {percentage.toFixed(4)}% Complete
                  </p>
                </div>
              </div>

              {/* Blurred stats background */}
              <div className="filter blur-[4px] select-none pointer-events-none opacity-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 border rounded-xl bg-slate-950">
                    <span className="text-[9px] uppercase text-slate-500">Impressions</span>
                    <div className="text-xl font-bold font-mono">14,200</div>
                  </div>
                  <div className="p-4 border rounded-xl bg-slate-950">
                    <span className="text-[9px] uppercase text-slate-500">Avg CTR</span>
                    <div className="text-xl font-bold font-mono">1.84%</div>
                  </div>
                  <div className="p-4 border rounded-xl bg-slate-950">
                    <span className="text-[9px] uppercase text-slate-500">Revenue Yield</span>
                    <div className="text-xl font-bold font-mono">85.20 LC</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* FULLY UNLOCKED DASHBOARD */
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Total views */}
                <div className={`p-5 border rounded-2xl flex flex-col justify-between ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                    <span>Eligible Content Views</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-4">
                    <div className={`text-2xl font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      {creatorViews.toLocaleString()} views
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Sovereign peer CTR tracking: 1.84%</p>
                  </div>
                </div>

                {/* Avg CPM */}
                <div className={`p-5 border rounded-2xl flex flex-col justify-between ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                    <span>Simulated Ad CPM Rate</span>
                    <Award className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="mt-4">
                    <div className={`text-2xl font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      4.00 LC
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Per 1,000 certified impressions</p>
                  </div>
                </div>

                {/* Creator Revenue Balance */}
                <div className={`p-5 border rounded-2xl flex flex-col justify-between ${
                  isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#090E1A] border-slate-900 border-emerald-500/20'
                }`}>
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px] uppercase">
                    <span>Creator Partner Balance</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-mono font-bold text-emerald-400">
                      {creatorBalance.toFixed(2)} LC
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Ad share yield available to claim</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-between items-center bg-slate-950/40 p-4 border border-slate-900 rounded-2xl">
                <div className="text-left space-y-1">
                  <h4 className="text-xs font-mono font-bold text-slate-200">Interactive Creator Controls</h4>
                  <p className="text-[10px] text-slate-500 font-sans">Simulate organic impressions on your posts or withdraw ad share funds instantly.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleHarvestContentImpressions}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-400 rounded-xl text-xs font-mono font-bold uppercase transition flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Harvest Views
                  </button>
                  <button
                    onClick={handleCashOutCreatorEarnings}
                    disabled={creatorBalance <= 0}
                    className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition tracking-wider flex items-center gap-1.5 ${
                      creatorBalance <= 0 
                        ? 'bg-slate-850 text-slate-500 border border-slate-800 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-slate-100 shadow'
                    }`}
                  >
                    Claim Creator Dividend <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

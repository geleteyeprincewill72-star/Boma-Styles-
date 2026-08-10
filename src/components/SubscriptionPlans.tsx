import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Crown, 
  Star, 
  MessageSquare, 
  HardDrive, 
  Award, 
  Sliders, 
  Table, 
  Grid,
  Info
} from 'lucide-react';
import { SubscriptionPlan, getSubscriptionPlans } from '../utils/monetization';

interface SubscriptionPlansProps {
  plans?: SubscriptionPlan[];
  currentPlanId?: string;
  isLight?: boolean;
  onSelectPlan?: (plan: SubscriptionPlan, billingPeriod: 'month' | 'year') => void;
  onCancelSubscription?: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  plans = getSubscriptionPlans(),
  currentPlanId = 'plan_free',
  isLight = false,
  onSelectPlan,
  onCancelSubscription
}) => {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="space-y-6 font-sans">
      {/* HEADER & CONTROLS */}
      <div className="text-center max-w-2xl mx-auto space-y-3 py-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/60 border border-cyan-800/50 rounded-full text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>5 Membership Levels</span>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-extrabold font-sans tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Choose Your OmniSphere Membership
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mx-auto font-sans">
          From 100% Free unlimited private communication to Superstar experimental AI pipelines, select the tier that fits your workflow.
        </p>

        {/* BILLING TOGGLE & VIEW MODE SWITCH */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setBillingCycle('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                billingCycle === 'month' 
                  ? 'bg-cyan-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('year')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'year' 
                  ? 'bg-amber-500 text-slate-950 shadow font-extrabold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-700/50 px-1.5 py-0.2 rounded font-mono">
                SAVE 20%
              </span>
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-slate-800 text-cyan-400 shadow' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1 cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-slate-800 text-cyan-400 shadow' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Comparison Matrix View"
            >
              <Table className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Compare Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* CORE COMMUNICATION GUARANTEE BANNER */}
      <div className="max-w-6xl mx-auto p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-start sm:items-center gap-3.5 shadow-lg">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-200 leading-relaxed font-sans flex-1">
          <strong className="text-emerald-400 font-mono font-bold uppercase tracking-wider block sm:inline mr-2">
            ✓ 100% UNLIMITED Private Communication Policy:
          </strong>
          All membership tiers include unlimited private messages, unlimited direct peer calls, unlimited group viewing, and zero daily messaging caps. Paid tiers add higher AI speed, ad removal, cloud storage, and enterprise business tools without restricting basic communications!
        </div>
      </div>

      {/* VIEW MODE 1: MODERN PRICING CARDS GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto pt-2">
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const price = billingCycle === 'month' ? plan.monthlyPrice : plan.yearlyPrice;
            const isSuperstar = plan.id === 'plan_superstar';
            const isPremium = plan.id === 'plan_premium';
            const isPro = plan.id === 'plan_pro';

            return (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl flex flex-col justify-between space-y-5 relative transition-all duration-200 ${
                  isCurrent
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950/40 border-2 border-cyan-400 ring-4 ring-cyan-500/20 shadow-2xl scale-[1.02]'
                    : isSuperstar
                    ? 'bg-gradient-to-b from-[#120826] via-[#090E1A] to-slate-950 border border-fuchsia-500/40 hover:border-fuchsia-400 shadow-xl'
                    : isPremium
                    ? 'bg-gradient-to-b from-[#1c1508] via-[#090E1A] to-slate-950 border border-amber-500/40 hover:border-amber-400 shadow-lg'
                    : isLight 
                    ? 'bg-white border border-slate-200 shadow-sm hover:border-slate-300' 
                    : 'bg-[#090E1A] border border-slate-800/80 hover:border-slate-700 shadow-md'
                }`}
              >
                {/* ACTIVE PLAN / POPULAR BADGE */}
                {isCurrent ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-extrabold font-mono text-[9px] uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3" /> CURRENT ACTIVE PLAN
                  </div>
                ) : isSuperstar ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-extrabold font-mono text-[9px] uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-300 fill-amber-300" /> HIGHEST TIER
                  </div>
                ) : isPro ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-extrabold font-mono text-[9px] uppercase px-3 py-0.5 rounded-full shadow-md tracking-wider">
                    MOST POPULAR
                  </div>
                ) : null}

                {/* PLAN TITLE & BADGE */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${plan.badgeColor}`}>
                        {plan.badge}
                      </span>
                      {(isPremium || isSuperstar || isPro) && (
                        <div className="relative group/tooltip inline-block cursor-help z-20">
                          <Info className="w-3.5 h-3.5 text-amber-400 hover:text-amber-300 transition" />
                          <div className="absolute left-0 top-full mt-2 w-64 bg-slate-950 border border-amber-500/50 rounded-xl p-3 shadow-2xl opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none group-hover/tooltip:pointer-events-auto text-left font-sans space-y-2 z-50">
                            <div className="flex items-center justify-between border-b border-amber-900/50 pb-1 font-mono text-[9px] text-amber-400 font-bold uppercase">
                              <span className="flex items-center gap-1"><Crown className="w-3 h-3 text-amber-400" /> Tier Technical Advantages</span>
                            </div>
                            <ul className="space-y-1.5 text-[10px] text-slate-300 font-sans">
                              <li className="flex items-start gap-1.5">
                                <span className="text-amber-400 font-bold font-mono">⚡</span>
                                <span><strong>Zero-Queue AI Acceleration:</strong> Priority execution with zero queue latency.</span>
                              </li>
                              <li className="flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold font-mono">🔒</span>
                                <span><strong>50GB Offline Edge Storage:</strong> High-speed cloud & offline storage index.</span>
                              </li>
                              <li className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold font-mono">🚫</span>
                                <span><strong>100% Ad-Free:</strong> Complete exemption from banner and interstitial ad units.</span>
                              </li>
                              <li className="flex items-start gap-1.5">
                                <span className="text-fuchsia-400 font-bold font-mono">👑</span>
                                <span><strong>Sovereign W3C Badges:</strong> Verified cryptographic badge across mesh nodes.</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                    {isSuperstar && <Sparkles className="w-4 h-4 text-fuchsia-400 animate-pulse" />}
                    {isPremium && <Crown className="w-4 h-4 text-amber-400" />}
                  </div>

                  <h3 className={`text-lg font-bold font-sans tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {plan.name}
                  </h3>

                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed min-h-[36px]">
                    {plan.id === 'plan_free' && '100% Free forever. Unlimited messaging, calls & standard AI.'}
                    {plan.id === 'plan_semipro' && 'Fewer ads, 5x faster AI response, and 10 GB cloud storage.'}
                    {plan.id === 'plan_pro' && '100% Ad-Free across all tabs, priority support & 50 GB storage.'}
                    {plan.id === 'plan_premium' && 'Unlimited AI, business tools & Gold verified badge.'}
                    {plan.id === 'plan_superstar' && 'Highest AI performance, experimental features & Superstar badge.'}
                  </p>
                </div>

                {/* PRICING */}
                <div className="space-y-1 font-mono border-y border-slate-800/60 py-3">
                  <div className={`text-2xl sm:text-3xl font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {price === 0 ? '$0.00' : `$${price.toFixed(2)}`}
                    <span className="text-[10px] text-slate-400 font-medium block sm:inline">
                      {price === 0 ? ' / forever' : ` / ${billingCycle}`}
                    </span>
                  </div>
                  {price > 0 && billingCycle === 'year' && (
                    <div className="text-[10px] text-amber-400 font-bold">
                      Equivalent to ${(price / 12).toFixed(2)}/mo billed yearly
                    </div>
                  )}
                </div>

                {/* KEY HIGHLIGHT METRICS */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950/60 p-2 rounded-xl border border-slate-900">
                  <div>
                    <span className="text-slate-500 uppercase block text-[8px]">AI Daily</span>
                    <span className="font-bold text-cyan-400">
                      {plan.aiDailyLimit >= 999999 ? 'Unlimited' : `${plan.aiDailyLimit} req`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase block text-[8px]">Storage</span>
                    <span className="font-bold text-emerald-400">{plan.cloudStorageGb} GB</span>
                  </div>
                </div>

                {/* FEATURE BULLETS */}
                <ul className="space-y-2 text-[11px] text-slate-300 font-sans flex-1">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-snug">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                {/* ACTION BUTTON */}
                <div className="pt-2">
                  {isCurrent ? (
                    <div className="space-y-2">
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800 text-center cursor-default"
                      >
                        ✓ Currently Active
                      </button>
                      {plan.id !== 'plan_free' && onCancelSubscription && (
                        <button
                          onClick={onCancelSubscription}
                          className="w-full py-1 text-[10px] font-mono text-slate-500 hover:text-rose-400 transition uppercase text-center block cursor-pointer"
                        >
                          Revert to Free Plan
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onSelectPlan && onSelectPlan(plan, billingCycle)}
                      className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase transition tracking-wider shadow cursor-pointer ${
                        isSuperstar
                          ? 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white shadow-fuchsia-950/50'
                          : isPremium
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
                          : isPro
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : plan.id === 'plan_semipro'
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {plan.monthlyPrice === 0 ? 'Activate Free' : `Upgrade to ${plan.name.split(' ')[0]}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: COMPARISON MATRIX TABLE */}
      {viewMode === 'table' && (
        <div className="max-w-6xl mx-auto overflow-x-auto bg-slate-950/90 border border-slate-800 rounded-2xl shadow-xl font-sans">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 font-mono text-xs">
                <th className="p-4 text-slate-400 uppercase tracking-wider font-bold w-1/4">Feature & Perks</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="p-4 text-center font-bold">
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-mono block mb-1 ${plan.badgeColor}`}>
                      {plan.badge}
                    </span>
                    <span className="text-slate-100 text-sm font-sans block">{plan.name}</span>
                    <span className="text-cyan-400 text-xs font-mono font-bold block mt-0.5">
                      {plan.monthlyPrice === 0 ? 'Free' : `$${(billingCycle === 'month' ? plan.monthlyPrice : plan.yearlyPrice).toFixed(2)}`}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-xs">
              {/* Row 1: Messaging & Phone Calls */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-slate-200 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited Messaging & Calls</span>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 text-center font-mono font-bold text-emerald-400 bg-emerald-950/10">
                    ✓ 100% Unlimited
                  </td>
                ))}
              </tr>

              {/* Row 2: Ad Frequency */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>Ad Frequency</span>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 text-center font-mono text-slate-300">
                    {plan.adFrequency === 'standard' && <span className="text-slate-400">Standard Ads</span>}
                    {plan.adFrequency === 'fewer' && <span className="text-cyan-400 font-bold">Fewer Ads</span>}
                    {plan.adFrequency === 'none' && <span className="text-emerald-400 font-bold uppercase">100% Ad-Free</span>}
                  </td>
                ))}
              </tr>

              {/* Row 3: AI Daily Limit */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-slate-200 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>AI Requests / Day</span>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 text-center font-mono font-bold text-slate-200">
                    {plan.aiDailyLimit >= 999999 ? (
                      <span className="text-amber-400 font-black">Unlimited</span>
                    ) : (
                      `${plan.aiDailyLimit} / day`
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 4: AI Speed */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <span>AI Response Latency</span>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 text-center font-mono text-slate-300">
                    {plan.aiSpeed}
                  </td>
                ))}
              </tr>

              {/* Row 5: Cloud Storage */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-slate-200 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span>Cloud Storage Capacity</span>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 text-center font-mono font-bold text-slate-200">
                    {plan.cloudStorageGb} GB
                  </td>
                ))}
              </tr>

              {/* Row 6: Max File Upload */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-slate-200">Max Single File Upload</td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 text-center font-mono text-slate-400">
                    {plan.maxFileUploadMb >= 1000 ? `${plan.maxFileUploadMb / 1000} GB` : `${plan.maxFileUploadMb} MB`}
                  </td>
                ))}
              </tr>

              {/* Row 7: Business Tools */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-slate-200 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Business & Campaign Tools</span>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 text-center font-mono">
                    {plan.businessTools ? (
                      <Check className="w-5 h-5 text-emerald-400 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 8: Experimental Access */}
              <tr className="hover:bg-slate-900/40">
                <td className="p-4 font-bold text-slate-200 flex items-center gap-2">
                  <Star className="w-4 h-4 text-fuchsia-400 fill-fuchsia-400" />
                  <span>Experimental Feature Access</span>
                </td>
                {plans.map((plan) => (
                  <td key={plan.id} className="p-4 text-center font-mono">
                    {plan.experimentalFeatures ? (
                      <span className="text-fuchsia-400 font-bold uppercase">Superstar Early Access</span>
                    ) : (
                      <X className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 9: CTA Row */}
              <tr className="bg-slate-900/60">
                <td className="p-4 font-bold text-slate-200 font-mono">Select Plan</td>
                {plans.map((plan) => {
                  const isCurrent = currentPlanId === plan.id;
                  return (
                    <td key={plan.id} className="p-4 text-center">
                      {isCurrent ? (
                        <span className="px-3 py-1.5 bg-cyan-950 text-cyan-400 font-mono text-[10px] font-bold rounded-lg border border-cyan-800 block uppercase">
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => onSelectPlan && onSelectPlan(plan, billingCycle)}
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold rounded-lg uppercase transition shadow block w-full cursor-pointer"
                        >
                          Select
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;

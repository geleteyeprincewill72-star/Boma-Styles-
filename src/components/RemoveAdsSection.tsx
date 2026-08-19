import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  UploadCloud, 
  Copy, 
  Check, 
  ArrowRight, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon, 
  RefreshCw, 
  ExternalLink,
  Zap,
  Lock,
  ChevronRight,
  User,
  CreditCard,
  History,
  Info
} from 'lucide-react';
import { AdRemovalPaymentRecord, AdRemovalPlan, AdRemovalPlanType, UserProfile } from '../types';
import { 
  AD_REMOVAL_PLANS, 
  TARGET_OPAY_ACCOUNT, 
  generateAdRemovalReference, 
  getUserAdStatus, 
  isUserAdFree 
} from '../utils/adManager';
import { 
  submitAdRemovalPayment, 
  listenToUserAdRemovalPayments, 
  fetchUserAdRemovalPayments 
} from '../utils/firebase';

interface Props {
  userProfile?: UserProfile | null;
  onNavigate?: (tab: string) => void;
  onCloseModal?: () => void;
}

export const RemoveAdsSection: React.FC<Props> = ({ userProfile, onNavigate, onCloseModal }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'payment' | 'receipt' | 'history'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<AdRemovalPlan>(AD_REMOVAL_PLANS[1]); // Default to 1-Year
  const [referenceId, setReferenceId] = useState<string>('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Receipt form state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string>('');
  const [inputRefId, setInputRefId] = useState<string>('');
  const [inputAmount, setInputAmount] = useState<number>(10000);
  const [senderName, setSenderName] = useState<string>('');
  const [senderPhone, setSenderPhone] = useState<string>('');
  const [receiptNote, setReceiptNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Payment history state
  const [payments, setPayments] = useState<AdRemovalPaymentRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [selectedHistoryReceipt, setSelectedHistoryReceipt] = useState<AdRemovalPaymentRecord | null>(null);

  // Initialize reference ID
  useEffect(() => {
    const ref = generateAdRemovalReference(userProfile?.username || 'GUEST');
    setReferenceId(ref);
    setInputRefId(ref);
    setInputAmount(selectedPlan.priceNgn);
  }, [userProfile, selectedPlan]);

  // Listen to user payment history
  useEffect(() => {
    const uid = userProfile?.uid || 'anonymous_user';
    setIsLoadingHistory(true);

    const unsubscribe = listenToUserAdRemovalPayments(uid, (data) => {
      setPayments(data);
      setIsLoadingHistory(false);
    });

    // Initial fetch backup
    fetchUserAdRemovalPayments(uid).then((res) => {
      if (res && res.length > 0) {
        setPayments(res);
      }
      setIsLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [userProfile]);

  const adStatus = getUserAdStatus(userProfile);

  const handleSelectPlan = (plan: AdRemovalPlan) => {
    setSelectedPlan(plan);
    setInputAmount(plan.priceNgn);
    setActiveTab('payment');
  };

  const handleCopy = (text: string, type: 'account' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('Receipt file exceeds maximum 8MB limit.');
      return;
    }

    setReceiptFile(file);
    setErrorMessage('');

    // Generate preview
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!inputRefId.trim()) {
      setErrorMessage('Please enter a valid Reference ID.');
      return;
    }
    if (!receiptPreviewUrl && !receiptFile) {
      setErrorMessage('Please upload a screenshot or document of your payment receipt.');
      return;
    }

    setIsSubmitting(true);

    try {
      const uid = userProfile?.uid || 'guest_user_' + Date.now();
      const username = userProfile?.username || userProfile?.displayName || 'Aura Member';

      await submitAdRemovalPayment({
        userId: uid,
        username,
        userEmail: userProfile?.email || '',
        amount: Number(inputAmount) || selectedPlan.priceNgn,
        currency: 'NGN',
        planType: selectedPlan.id,
        planTitle: selectedPlan.title,
        paymentMethod: 'OPAY_TRANSFER',
        targetAccount: {
          accountNumber: TARGET_OPAY_ACCOUNT.accountNumber,
          bank: TARGET_OPAY_ACCOUNT.bankName,
          accountName: TARGET_OPAY_ACCOUNT.accountName
        },
        reference: inputRefId.trim().toUpperCase(),
        receiptUrl: receiptPreviewUrl,
        receiptFileName: receiptFile?.name || 'receipt_screenshot.png',
        receiptFileType: receiptFile?.type || 'image/png',
        receiptNote: receiptNote.trim(),
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        status: 'pending',
        submittedAt: Date.now(),
        adsRemoved: false
      });

      setSubmissionSuccess(true);
      setIsSubmitting(false);
      setActiveTab('history');
    } catch (err: any) {
      console.error('Failed to submit receipt:', err);
      setErrorMessage(err.message || 'Failed to submit payment receipt. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div id="remove-ads-page" className="max-w-5xl mx-auto px-4 py-8 space-y-8 font-sans animate-fadeIn">
      
      {/* HEADER HERO BANNER */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 border border-amber-500/30 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sovereign Ad-Free Experience</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Enjoy 100% Ad-Free Aura
            </h1>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Remove all third-party banner ads, sponsored video interruptions, and popups permanently or with flexible passes. Experience maximum privacy, ultra-fast mesh loading, and zero commercial tracking.
            </p>
          </div>

          {/* Current Subscription Status Pill */}
          <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2 min-w-[240px] shadow-lg shrink-0">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
              Your Current Status
            </span>
            <div className="flex items-center gap-2">
              {adStatus.isAdFree ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              )}
              <span className={`text-sm font-bold font-mono ${adStatus.isAdFree ? 'text-emerald-300' : 'text-amber-300'}`}>
                {adStatus.statusText}
              </span>
            </div>
            {adStatus.expiryFormatted && (
              <span className="text-[11px] font-mono text-slate-400">
                Expires: {adStatus.expiryFormatted} ({adStatus.daysRemaining} days left)
              </span>
            )}
          </div>
        </div>

        {/* TAB NAVIGATION PILLS */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto relative z-10">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'plans'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>1. Choose Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'payment'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>2. Make Payment (OPAY)</span>
          </button>

          <button
            onClick={() => setActiveTab('receipt')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'receipt'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>3. Upload Receipt</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>4. Payment History ({payments.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PRICING PLANS */}
      {activeTab === 'plans' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
              Select Your Ad-Free Pass
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Payments are verified directly via our secure OPAY account. Ads are permanently or temporarily suppressed upon official verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AD_REMOVAL_PLANS.map((plan) => {
              const isSelected = selectedPlan.id === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                    isSelected
                      ? 'bg-slate-900/90 border-2 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]'
                      : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-wider shadow">
                      {plan.badge}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-white">{plan.title}</h3>
                      <span className="text-xs text-slate-400 font-mono">{plan.durationLabel}</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-amber-300 font-mono">
                        {plan.priceFormatted}
                      </span>
                      {plan.savings && (
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          ({plan.savings})
                        </span>
                      )}
                    </div>

                    <div className="border-t border-slate-800 pt-4 space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    className={`mt-6 w-full py-2.5 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Verification Transparency Notice */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-400">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">How verification works:</strong> Ads are removed as soon as your payment receipt is verified against our OPAY statement. Clicking pay or selecting a plan does not automatically disable ads until proof is submitted and confirmed by the administrator.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENT INSTRUCTIONS (OPAY) */}
      {activeTab === 'payment' && (
        <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">OPAY Bank Transfer</h2>
                  <p className="text-xs text-slate-400 font-mono">Plan: {selectedPlan.title} ({selectedPlan.priceFormatted})</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('plans')}
                className="text-xs font-mono text-amber-400 hover:underline"
              >
                Change Plan
              </button>
            </div>

            {/* User Account Info */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-500 uppercase block">Your Username:</span>
                <span className="text-slate-200 font-bold">@{userProfile?.username || 'aura_member'}</span>
              </div>
              <div>
                <span className="text-slate-500 uppercase block">Your User ID:</span>
                <span className="text-slate-200 font-bold truncate block">{userProfile?.uid || 'GUEST-SESSION'}</span>
              </div>
            </div>

            {/* Target OPAY Bank Account */}
            <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-bold text-amber-300 tracking-wider">
                  Transfer To Official OPAY Account
                </span>
                <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono rounded font-bold">
                  Verified Merchant
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">Bank Name</span>
                  <span className="text-sm font-bold text-slate-100 font-mono">{TARGET_OPAY_ACCOUNT.bankName}</span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">Account Number</span>
                    <span className="text-base font-extrabold text-amber-300 font-mono tracking-wider">
                      {TARGET_OPAY_ACCOUNT.accountNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(TARGET_OPAY_ACCOUNT.accountNumber, 'account')}
                    className="p-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-1 text-xs font-mono"
                    title="Copy Account Number"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAccount ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">Account Name</span>
                <span className="text-xs font-bold text-slate-200 font-mono">{TARGET_OPAY_ACCOUNT.accountName}</span>
              </div>
            </div>

            {/* Generated Unique Reference ID */}
            <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase font-bold text-indigo-300">
                  Payment Reference ID (Required in Transfer Narration)
                </span>
                <button
                  onClick={() => handleCopy(referenceId, 'ref')}
                  className="p-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 transition flex items-center gap-1 text-xs font-mono"
                >
                  {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRef ? 'Copied Ref' : 'Copy Ref'}</span>
                </button>
              </div>

              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-sm font-bold text-indigo-200 select-all">
                {referenceId}
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                ⚠️ <strong>Important:</strong> Put this Reference ID as your transfer remark/narration so our automated ledger pairs your payment immediately.
              </p>
            </div>

            {/* Total Amount Summary */}
            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Total Payable Amount</span>
              <span className="text-xl font-extrabold text-amber-300 font-mono">{selectedPlan.priceFormatted}</span>
            </div>

            {/* Button to Continue to Receipt Upload */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setInputRefId(referenceId);
                  setInputAmount(selectedPlan.priceNgn);
                  setActiveTab('receipt');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-mono font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <span>I Have Made Payment — Upload Receipt</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[11px] font-mono text-slate-500">
                Ads will be removed immediately after the administrator verifies the payment receipt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECEIPT UPLOAD */}
      {activeTab === 'receipt' && (
        <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
          <form onSubmit={handleSubmitReceipt} className="bg-slate-950/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Upload Payment Receipt</h2>
                  <p className="text-xs text-slate-400 font-mono">Submit proof of your OPAY transfer</p>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Reference ID input */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                Payment Reference ID *
              </label>
              <input
                type="text"
                value={inputRefId}
                onChange={(e) => setInputRefId(e.target.value)}
                placeholder="e.g. AURA-ADFREE-USER-A1B2C3"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Amount and Plan Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                  Amount Paid (NGN ₦) *
                </label>
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(Number(e.target.value))}
                  required
                  min={1500}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                  Selected Plan
                </label>
                <select
                  value={selectedPlan.id}
                  onChange={(e) => {
                    const found = AD_REMOVAL_PLANS.find(p => p.id === e.target.value);
                    if (found) {
                      setSelectedPlan(found);
                      setInputAmount(found.priceNgn);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-400 transition"
                >
                  {AD_REMOVAL_PLANS.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({p.priceFormatted})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sender Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                  Sender Account / Full Name
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                  Sender Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="e.g. 08154561612"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                Receipt File (Screenshot / PDF) *
              </label>

              <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-6 text-center transition bg-slate-900/50">
                {receiptPreviewUrl ? (
                  <div className="space-y-3">
                    <img 
                      src={receiptPreviewUrl} 
                      alt="Receipt Preview" 
                      className="max-h-48 mx-auto rounded-xl border border-slate-700 object-contain shadow-md"
                    />
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-xs text-slate-300 font-mono">{receiptFile?.name || 'receipt.png'}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptFile(null);
                          setReceiptPreviewUrl('');
                        }}
                        className="text-xs text-rose-400 hover:underline font-mono"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-300">
                      Drag and drop your receipt image, or <span className="text-amber-400 font-bold underline cursor-pointer">browse file</span>
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">PNG, JPG, JPEG, or PDF up to 8MB</p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={handleFileChange}
                  className={receiptPreviewUrl ? "hidden" : "mt-2 block w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"}
                />
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-300 mb-1.5">
                Additional Notes / Bank Transaction Ref (Optional)
              </label>
              <textarea
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
                placeholder="Any additional details or transaction timestamps..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-mono font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Receipt for Review...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Payment Receipt</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: PAYMENT HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Your Payment Submissions</h2>
              <p className="text-xs text-slate-400 font-mono">
                Track verification status and active ad-removal passes
              </p>
            </div>

            <button
              onClick={() => setActiveTab('payment')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Submit Another Payment</span>
            </button>
          </div>

          {isLoadingHistory ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              <span>Loading payment history...</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-10 text-center space-y-4 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-200">No Payment Submissions Yet</h3>
              <p className="text-xs text-slate-400">
                You haven't submitted any ad-removal receipts yet. Choose a plan to remove all ads from your feed and video streams.
              </p>
              <button
                onClick={() => setActiveTab('plans')}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-mono font-bold text-xs rounded-xl shadow"
              >
                Choose an Ad-Free Pass
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {payments.map((pay) => {
                const dateStr = new Date(pay.submittedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={pay.id}
                    className="bg-slate-950/90 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-200">{pay.planTitle || 'Ad Removal Pass'}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900 border border-slate-800 text-amber-300 rounded font-bold">
                            ₦{pay.amount.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 block mt-0.5">Ref: {pay.reference}</span>
                      </div>

                      {/* Status Badge */}
                      {pay.status === 'verified' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified ✅</span>
                        </span>
                      ) : pay.status === 'rejected' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-950/90 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold flex items-center gap-1 shrink-0">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected ❌</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-950/90 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 shrink-0">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Pending Review</span>
                        </span>
                      )}
                    </div>

                    {/* Status details message */}
                    {pay.status === 'pending' && (
                      <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 text-xs font-mono text-amber-200 flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>Pending verification — your receipt is being reviewed. Ads will remain active until verified.</span>
                      </div>
                    )}

                    {pay.status === 'verified' && (
                      <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-xs font-mono text-emerald-200 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>Payment verified. Ads have been removed from your account.</span>
                      </div>
                    )}

                    {pay.status === 'rejected' && (
                      <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-3 text-xs font-mono text-rose-200 space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <strong>Rejection Reason:</strong>
                            <p className="mt-0.5">{pay.rejectionReason || 'Receipt details did not match OPAY bank records.'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setInputRefId(pay.reference);
                            setInputAmount(pay.amount);
                            setActiveTab('receipt');
                          }}
                          className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded text-[11px] font-mono transition"
                        >
                          Submit New Receipt
                        </button>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-900 pt-3">
                      <span>Submitted: {dateStr}</span>
                      {pay.receiptUrl && (
                        <button
                          onClick={() => setSelectedHistoryReceipt(pay)}
                          className="text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>View Receipt</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RECEIPT VIEW MODAL */}
      {selectedHistoryReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold font-mono text-slate-200">
                Payment Receipt: {selectedHistoryReceipt.reference}
              </h3>
              <button
                onClick={() => setSelectedHistoryReceipt(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {selectedHistoryReceipt.receiptUrl && (
              <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-800 bg-slate-900 p-2">
                <img
                  src={selectedHistoryReceipt.receiptUrl}
                  alt="Receipt Document"
                  className="w-full h-auto rounded object-contain"
                />
              </div>
            )}

            <div className="text-xs font-mono text-slate-400 space-y-1">
              <div>Amount: <strong className="text-amber-300">₦{selectedHistoryReceipt.amount.toLocaleString()}</strong></div>
              <div>Status: <strong className="text-slate-200 capitalize">{selectedHistoryReceipt.status}</strong></div>
              {selectedHistoryReceipt.senderName && <div>Sender: {selectedHistoryReceipt.senderName}</div>}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RemoveAdsSection;

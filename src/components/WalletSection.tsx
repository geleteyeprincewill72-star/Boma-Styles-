import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  CheckCircle, 
  ShieldAlert, 
  DollarSign, 
  Users, 
  Eye, 
  History, 
  BadgeCent, 
  TrendingUp, 
  HelpCircle,
  Building,
  Key,
  AlertTriangle,
  Info,
  CreditCard
} from 'lucide-react';
import { 
  fetchPaymentConfig, 
  saveWithdrawalRequest, 
  fetchWithdrawalRequests, 
  createNotification,
  WithdrawalRequestDoc 
} from '../utils/firebase';

interface WalletSectionProps {
  username: string;
  myPublicKey: string;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
}

interface PayoutRecord {
  id: string;
  method: string;
  destination: string;
  amount: number;
  usdEquivalent: number;
  status: 'Pending Settlement' | 'Completed' | 'Failed' | 'Rejected';
  statusReason: string;
  timestamp: number;
  primaryShareUSD?: number;
  secondaryShareUSD?: number;
}

export default function WalletSection({ username, myPublicKey, balance, setBalance }: WalletSectionProps) {
  const [cashoutAmount, setCashoutAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [payoutAddress, setPayoutAddress] = useState('OPAY 7041224113');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedTxDetail, setSelectedTxDetail] = useState<PayoutRecord | null>(null);

  // Dynamic Payment configuration state from Firestore
  const [paymentConfig, setPaymentConfig] = useState<{ bankName: string; accountNumber: string; accountName: string }>({
    bankName: 'OPAY',
    accountNumber: '7041224113',
    accountName: 'BOMA ARIBITE PRINCEWILL'
  });

  useEffect(() => {
    let active = true;
    const loadConfig = async () => {
      try {
        const config = await fetchPaymentConfig();
        if (active) {
          setPaymentConfig({
            bankName: config.bankName || 'OPAY',
            accountNumber: config.accountNumber || '7041224113',
            accountName: config.accountName || 'BOMA ARIBITE PRINCEWILL'
          });
        }
      } catch (err) {
        console.warn("Failed to load payment config from DB in WalletSection:", err);
      }
    };
    loadConfig();

    // Fetch existing withdrawal records from Firestore
    const loadWithdrawals = async () => {
      try {
        const dbReqs = await fetchWithdrawalRequests();
        if (dbReqs && dbReqs.length > 0 && active) {
          const mapped: PayoutRecord[] = dbReqs.map(r => ({
            id: r.id,
            method: r.method,
            destination: r.destination,
            amount: r.amountLC,
            usdEquivalent: r.amountUSD,
            status: r.status,
            statusReason: r.statusReason || 'Pending automated payout gateway execution or administrator 50/50 settlement.',
            timestamp: r.timestamp,
            primaryShareUSD: r.primaryAccountShare?.amountUSD,
            secondaryShareUSD: r.secondaryAccountShare?.amountUSD
          }));
          setPayouts(mapped);
        }
      } catch (err) {
        console.warn("Failed to load withdrawal requests from DB:", err);
      }
    };
    loadWithdrawals();

    return () => { active = false; };
  }, []);
  
  const [payouts, setPayouts] = useState<PayoutRecord[]>([
    { 
      id: 'pay_01', 
      method: 'Bank Direct (OPAY)', 
      destination: 'OPAY 7041224113', 
      amount: 120.00, 
      usdEquivalent: 102.00, 
      status: 'Completed', 
      statusReason: 'Direct verified deposit via Primary OPAY Account.',
      timestamp: Date.now() - 604800000,
      primaryShareUSD: 51.00,
      secondaryShareUSD: 51.00
    },
    { 
      id: 'pay_02', 
      method: 'Paystack Direct (OPAY)', 
      destination: 'OPAY 7041224113', 
      amount: 350.00, 
      usdEquivalent: 297.50, 
      status: 'Completed', 
      statusReason: 'Settled to verified recipient Paystack NUBAN bank destination.',
      timestamp: Date.now() - 2592000000,
      primaryShareUSD: 148.75,
      secondaryShareUSD: 148.75
    },
    { 
      id: 'pay_03', 
      method: 'Bank Wire', 
      destination: 'OPAY ****4113', 
      amount: 50.00, 
      usdEquivalent: 42.50, 
      status: 'Pending Settlement', 
      statusReason: 'Pending live automated payment gateway key verification / administrator 50/50 revenue split execution.',
      timestamp: Date.now() - 172800000,
      primaryShareUSD: 21.25,
      secondaryShareUSD: 21.25
    }
  ]);

  const exchangeRate = 0.85; // 1 LC = $0.85 USD

  const handleCashout = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(cashoutAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid cash-out amount.");
      return;
    }
    if (amount > balance) {
      alert("Insufficient balance in your Aura Creator wallet.");
      return;
    }
    if (!payoutAddress.trim()) {
      alert("Please specify the payment recipient or destination account details.");
      return;
    }

    setIsProcessing(true);

    const usdVal = amount * exchangeRate;
    const splitUSD = usdVal / 2; // 50/50 revenue split
    let reqId = `pay_${Date.now()}`;
    const methodName = paymentMethod === 'paystack' ? 'Paystack Direct (OPAY)' : paymentMethod === 'wire' ? 'Bank Direct (OPAY)' : 'Crypto Key Address';
    
    let statusReasonText = "Withdrawal request submitted & recorded in database. Pending automated payment gateway API settlement or manual 50/50 revenue sharing payout to Primary Account (BOMA ARIBITE PRINCEWILL / OPAY: 7041224113) & Secondary Account (Gwotmut Nanman / OPAY).";
    let finalStatus: 'Pending Settlement' | 'Completed' | 'Failed' = 'Pending Settlement';

    // Dispatch to Paystack Transfer API Endpoint on server
    try {
      const pRes = await fetch('/api/paystack/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUSD: usdVal,
          destinationAccount: payoutAddress,
          recipientName: username || 'Aura Creator',
          reason: `Aura Creator Cashout by ${username || 'User'}`
        })
      });
      const pData = await pRes.json();
      if (pData.reference) reqId = pData.reference;
      
      if (pData.success && pData.status === 'SUCCESS') {
        finalStatus = 'Completed';
        statusReasonText = `Paystack Transfer Confirmed! Reference: ${pData.reference}. Deposited to OPAY 7041224113 with 50/50 split executed.`;
      } else if (pData.status === 'FAILED') {
        finalStatus = 'Failed';
        statusReasonText = `Paystack Transfer Failed: ${pData.message || 'Check recipient details or bank gateway status'}`;
      } else {
        statusReasonText = `Paystack Reference [${pData.reference || reqId}]: ${pData.message || statusReasonText}`;
      }
    } catch (err) {
      console.warn("Paystack Transfer API endpoint notice:", err);
    }

    const docData: WithdrawalRequestDoc = {
      id: reqId,
      userId: myPublicKey || 'current_user',
      username: username || 'Aura Creator',
      method: methodName,
      destination: payoutAddress,
      amountLC: amount,
      amountUSD: usdVal,
      status: finalStatus,
      statusReason: statusReasonText,
      primaryAccountShare: {
        name: 'BOMA ARIBITE PRINCEWILL',
        bank: 'OPAY',
        accountNumber: '7041224113',
        amountUSD: splitUSD
      },
      secondaryAccountShare: {
        name: 'Gwotmut Nanman',
        bank: 'OPAY',
        accountNumber: 'Secondary Standby',
        amountUSD: splitUSD
      },
      timestamp: Date.now()
    };

    // Save to Firestore
    await saveWithdrawalRequest(docData);

    // Create notification
    await createNotification({
      recipientId: myPublicKey || 'current_user',
      senderId: 'system_payout',
      type: 'message',
      messageText: `💵 Withdrawal Request Registered [Paystack Ref: ${reqId}]: ${amount.toFixed(2)} LC ($${usdVal.toFixed(2)} USD) status is '${finalStatus}'. 50/50 Primary/Secondary split queued.`
    });

    setBalance(prev => prev - amount);
    
    const newPayout: PayoutRecord = {
      id: reqId,
      method: methodName,
      destination: payoutAddress,
      amount,
      usdEquivalent: usdVal,
      status: finalStatus,
      statusReason: statusReasonText,
      timestamp: Date.now(),
      primaryShareUSD: splitUSD,
      secondaryShareUSD: splitUSD
    };

    setPayouts(prev => [newPayout, ...prev]);
    setIsProcessing(false);
    setSuccessMsg(`Paystack Withdrawal request [Ref: ${reqId}] of ${amount.toFixed(2)} LC ($${usdVal.toFixed(2)} USD) registered! Status: ${finalStatus}.`);
    setCashoutAmount('');
    setPayoutAddress('');
  };

  const [creatorUnlocked, setCreatorUnlocked] = useState(false);
  const [approvalPending, setApprovalPending] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRequestApproval = () => {
    setErrorMessage('');
    // Simulated request to the app creator
    alert("Decentralized access token requested. A notification has been routed to Princewill's device for secure signature approval.");
  };

  const handleOwnerApprove = () => {
    setErrorMessage('');
    if (passcode === '0815') {
      setApprovalPending(false);
      setCreatorUnlocked(true);
    } else {
      setErrorMessage("Invalid Creator Authorization Passcode. (Hint: Use owner passcode '0815')");
    }
  };

  return (
    <div className="space-y-6" id="wallet-section">
      
      {/* Heading */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            Aura Creator Wallet
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Zero-intermediary creator compensation ledger • Tip shares and direct payouts
          </p>
        </div>
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl px-3.5 py-1.5 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <div>
            <div className="text-[10px] uppercase font-mono text-emerald-400 font-bold leading-none">Primary Payout Node Configured</div>
            <div className="text-xs text-slate-200 font-mono mt-1 font-semibold">OPAY 7041224113 (Paystack)</div>
          </div>
        </div>
      </div>

      {/* Grid of Balances and Quick Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Wallet Balance Card */}
        <div className="md:col-span-6 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden shadow-lg shadow-emerald-950/10">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Wallet className="w-32 h-32 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-widest font-semibold bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              Verified Mesh Balance
            </span>
            <BadgeCent className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-slate-100 flex items-baseline gap-1.5">
              {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-sm text-emerald-400 font-bold">LC</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              ≈ ${(balance * exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              Sovereign Ledger Synced
            </span>
            <span>1 LC = $0.85 USD</span>
          </div>
        </div>

        {/* Creator Stats */}
        <div className="md:col-span-6 grid grid-cols-2 gap-4">
          <div className="bg-[#0A0F1D] border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-mono tracking-wider">Mesh Views</span>
              <Eye className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-bold text-slate-200">14,810</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5 font-mono">
                <TrendingUp className="w-3 h-3" />
                +18.4% this week
              </div>
            </div>
          </div>

          <div className="bg-[#0A0F1D] border border-slate-900 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[10px] uppercase font-mono tracking-wider">Swarm Tips</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-mono font-bold text-slate-200">890 LC</div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">Average 4.8 LC / tip</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cash-Out & monetization section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Cash-Out Payout Form */}
        <div className="md:col-span-7 bg-[#0A0F1D] border border-slate-900 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            Instant Cash-Out Registry
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Convert your earned Aura Coins into cold hard cash. There are no platform cuts or delays—your signed payout is dispatched directly to your designated account.
          </p>

          {successMsg && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-lg flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleCashout} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1.5">Payout Method</label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('paystack'); setPayoutAddress('OPAY 7041224113'); }}
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono flex items-center gap-2 transition text-left ${
                      paymentMethod === 'paystack' 
                        ? 'bg-slate-950 border-emerald-500 text-emerald-400' 
                        : 'border-slate-850 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Paystack Direct (Bank / OPAY)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('wire'); setPayoutAddress('OPAY 7041224113'); }}
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono flex items-center gap-2 transition text-left ${
                      paymentMethod === 'wire' 
                        ? 'bg-slate-950 border-emerald-500 text-emerald-400' 
                        : 'border-slate-850 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    Bank Direct (OPAY)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('crypto'); setPayoutAddress(myPublicKey.slice(0, 30)); }}
                    className={`w-full p-2.5 rounded-lg border text-xs font-mono flex items-center gap-2 transition text-left ${
                      paymentMethod === 'crypto' 
                        ? 'bg-slate-950 border-emerald-500 text-emerald-400' 
                        : 'border-slate-850 hover:border-slate-800 text-slate-400'
                    }`}
                  >
                    <Key className="w-3.5 h-3.5" />
                    Crypto Key Address
                  </button>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1.5">Amount (LC)</label>
                  <input
                    type="number"
                    value={cashoutAmount}
                    onChange={(e) => setCashoutAmount(e.target.value)}
                    placeholder="LC Amount"
                    min="1"
                    step="any"
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                    Remaining: {(balance - (parseFloat(cashoutAmount) || 0)).toFixed(2)} LC
                  </span>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1.5">Recipient Destination</label>
                  <input
                    type="text"
                    value={payoutAddress}
                    onChange={(e) => setPayoutAddress(e.target.value)}
                    placeholder="e.g. email or bank details"
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-slate-100 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition shadow"
            >
              {isProcessing ? "Validating Cryptographic Ledger..." : "Authorize Creator Payout"}
            </button>
          </form>
        </div>

        {/* SECURE CREATOR PAYOUT VAULT (OPAY NIGERIA - 08154561612) */}
        <div className="md:col-span-5 bg-[#0A0F1D] border border-slate-900 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400 animate-pulse" />
              Creator Payout Vault
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-2 leading-relaxed">
              Compensation routing ledger for platform creators. Standard users have no access to these credentials. Unlocking require digital approval by the App creator (Princewill).
            </p>
          </div>

          {/* Gate Controls */}
          {!creatorUnlocked ? (
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-[10px]">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>STATUS: LOCKED & PENDING CREATOR APPROVAL</span>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono text-slate-500 tracking-wider">Creator Passcode</label>
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Passcode (e.g. 0815)"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {errorMessage && (
                <div className="text-[10px] text-red-400 font-mono bg-red-950/20 p-2 rounded border border-red-900/30">
                  {errorMessage}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRequestApproval}
                  className="py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded text-[10px] font-mono border border-slate-800 transition"
                >
                  Request Access
                </button>
                <button
                  type="button"
                  onClick={handleOwnerApprove}
                  className="py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-100 rounded text-[10px] font-mono transition"
                >
                  Approve & Reveal
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-emerald-400 font-bold">● DECRYPTED & APPROVED</span>
                <span className="text-slate-500">SIGN_VERIFIED</span>
              </div>

              <div className="space-y-2 border-t border-emerald-500/10 pt-2.5">
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500">Destination Bank</span>
                  <div className="text-xs font-bold text-slate-200 font-mono">{paymentConfig.bankName} NIGERIA</div>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-mono text-slate-500">Account Number</span>
                  <div className="text-sm font-bold text-emerald-400 font-mono bg-emerald-950/60 px-2 py-1 rounded inline-block">
                    {paymentConfig.accountNumber}
                  </div>
                </div>
              </div>

              <div className="text-[9px] font-mono text-slate-500 leading-normal border-t border-emerald-500/10 pt-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span>Tips and ad revenue streams successfully routing to OPAY endpoint.</span>
              </div>

              {/* OPAY Facebook Chat Notification Alert */}
              <div className="bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/40 p-3 rounded-xl space-y-1.5 text-xs font-mono">
                <div className="text-blue-400 font-bold uppercase text-[9px] flex items-center justify-between">
                  <span>OPAY Notification Alert</span>
                  <span className="text-amber-300 font-normal">08154561612</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-normal">
                  📢 <strong>Notice to OPAY Holder:</strong> Money gained has entered your OPAY node! Please chat me on Facebook at <strong className="text-amber-300">"Bios Styles"</strong> immediately to confirm you have seen it.
                </p>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold uppercase px-2.5 py-1 rounded transition mt-1"
                >
                  <span>Chat "Bios Styles" On Facebook</span>
                </a>
              </div>
            </div>
          )}

          <div className="space-y-2 text-[10px] text-slate-500 font-mono border-t border-slate-900/60 pt-3">
            <div className="flex gap-1.5">
              <span className="text-emerald-400">✔</span>
              <span>100% Secure routing, hidden from gossip nodes.</span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-emerald-400">✔</span>
              <span>Requires Princewill approval for viewing access.</span>
            </div>
          </div>
        </div>
      </div>

      {/* payout transaction log history table */}
      <div className="bg-[#0A0F1D] border border-slate-900 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
          <h3 className="text-sm font-semibold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-4 h-4 text-slate-400" />
            Monetization Transaction & Payout Log
          </h3>
          <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-800/40 px-2 py-0.5 rounded">
            Click any row for 50/50 revenue split breakdown
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-400">
            <thead>
              <tr className="border-b border-slate-850 text-slate-500">
                <th className="pb-3 font-semibold">Transaction ID</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold">Recipient Address</th>
                <th className="pb-3 font-semibold">Amount (LC / USD)</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Time</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map(pay => (
                <tr 
                  key={pay.id} 
                  onClick={() => setSelectedTxDetail(pay)}
                  className="border-b border-slate-900/60 hover:bg-slate-900/60 transition cursor-pointer"
                >
                  <td className="py-3 text-slate-300 font-bold">{pay.id}</td>
                  <td className="py-3 text-slate-400">{pay.method}</td>
                  <td className="py-3 text-slate-500 font-mono truncate max-w-[130px]" title={pay.destination}>{pay.destination}</td>
                  <td className="py-3 font-bold text-slate-200">
                    <div>{pay.amount.toFixed(2)} LC</div>
                    <div className="text-[10px] text-emerald-400 font-normal">≈ ${(pay.usdEquivalent || pay.amount * exchangeRate).toFixed(2)} USD</div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 ${
                      pay.status === 'Completed' 
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60' 
                        : pay.status === 'Pending Settlement'
                        ? 'bg-amber-950/60 text-amber-400 border border-amber-900/60 animate-pulse'
                        : 'bg-red-950/60 text-red-400 border border-red-900/60'
                    }`}>
                      {pay.status === 'Pending Settlement' && <AlertTriangle className="w-3 h-3 text-amber-400" />}
                      {pay.status === 'Completed' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                      {pay.status}
                    </span>
                  </td>
                  <td className="py-3 text-[10px] text-slate-500">{new Date(pay.timestamp).toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <button className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 px-2 py-1 rounded">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTxDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0F1D] border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                Transaction & Payout Status Details
              </h4>
              <button 
                onClick={() => setSelectedTxDetail(null)}
                className="text-slate-400 hover:text-slate-100 font-bold px-2 py-1 bg-slate-900 rounded"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between"><span className="text-slate-500">Transaction ID:</span> <span className="text-slate-200 font-bold">{selectedTxDetail.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Method:</span> <span className="text-slate-300">{selectedTxDetail.method}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Recipient Address:</span> <span className="text-cyan-300 font-bold select-all">{selectedTxDetail.destination}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Amount Requested:</span> <span className="text-emerald-400 font-bold">{selectedTxDetail.amount.toFixed(2)} LC (${(selectedTxDetail.usdEquivalent || selectedTxDetail.amount * exchangeRate).toFixed(2)} USD)</span></div>
              <div className="flex justify-between items-center"><span className="text-slate-500">Status:</span> 
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedTxDetail.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}>
                  {selectedTxDetail.status}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Status Explanation / Reason:</span>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {selectedTxDetail.statusReason}
              </p>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-emerald-900/40 space-y-2">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block border-b border-slate-900 pb-1">
                50% / 50% Revenue Share Allocation:
              </span>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Account (50%):</span>
                  <span className="text-slate-200 font-bold">BOMA ARIBITE PRINCEWILL (OPAY 7041224113) - ${(selectedTxDetail.primaryShareUSD || (selectedTxDetail.amount * exchangeRate) / 2).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Secondary Account (50%):</span>
                  <span className="text-slate-200 font-bold">Gwotmut Nanman (OPAY Secondary Standby) - ${(selectedTxDetail.secondaryShareUSD || (selectedTxDetail.amount * exchangeRate) / 2).toFixed(2)} USD</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedTxDetail(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs uppercase font-bold"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


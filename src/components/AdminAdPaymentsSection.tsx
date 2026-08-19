import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  Eye, 
  AlertCircle, 
  CreditCard, 
  DollarSign, 
  Filter, 
  ExternalLink,
  Check,
  User,
  MessageSquare,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { AdRemovalPaymentRecord, UserProfile } from '../types';
import { 
  fetchAllAdRemovalPayments, 
  listenToAllAdRemovalPayments, 
  verifyAdRemovalPayment, 
  rejectAdRemovalPayment 
} from '../utils/firebase';

interface Props {
  userProfile?: UserProfile | null;
  onNavigate?: (tab: string) => void;
}

export const AdminAdPaymentsSection: React.FC<Props> = ({ userProfile, onNavigate }) => {
  const [payments, setPayments] = useState<AdRemovalPaymentRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<AdRemovalPaymentRecord | null>(null);

  // Rejection modal
  const [rejectingPayment, setRejectingPayment] = useState<AdRemovalPaymentRecord | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string>('');
  const [actionErrorMessage, setActionErrorMessage] = useState<string>('');

  // Check admin authorization
  const isAdmin = userProfile?.role === 'admin' || 
    userProfile?.email?.toLowerCase() === 'geleteyeprincewill72@gmail.com' ||
    userProfile?.username?.toLowerCase() === 'admin' ||
    userProfile?.username?.toLowerCase() === 'creator';

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = listenToAllAdRemovalPayments((data) => {
      setPayments(data);
      setIsLoading(false);
    });

    fetchAllAdRemovalPayments().then((data) => {
      if (data && data.length > 0) {
        setPayments(data);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (pay: AdRemovalPaymentRecord) => {
    setActionLoadingId(pay.id);
    setActionSuccessMessage('');
    setActionErrorMessage('');

    try {
      const adminUid = userProfile?.uid || 'admin';
      const adminEmail = userProfile?.email || 'geleteyeprincewill72@gmail.com';

      const res = await verifyAdRemovalPayment(pay.id, adminUid, adminEmail);
      setActionSuccessMessage(`Payment ${pay.reference} verified! Ads have been permanently removed for @${pay.username}.`);
      
      // Update local state optimistically
      setPayments(prev => prev.map(p => p.id === pay.id ? {
        ...p,
        status: 'verified',
        adsRemoved: true,
        verifiedAt: Date.now(),
        verifiedBy: adminEmail
      } : p));

      setTimeout(() => setActionSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Failed to verify payment:', err);
      setActionErrorMessage(err.message || 'Failed to verify payment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectModal = (pay: AdRemovalPaymentRecord, defaultReason?: string) => {
    setRejectingPayment(pay);
    setRejectionReason(defaultReason || 'Payment could not be verified in OPAY account 8105341700.');
  };

  const handleConfirmReject = async () => {
    if (!rejectingPayment) return;

    setActionLoadingId(rejectingPayment.id);
    setActionSuccessMessage('');
    setActionErrorMessage('');

    try {
      const adminUid = userProfile?.uid || 'admin';
      const adminEmail = userProfile?.email || 'geleteyeprincewill72@gmail.com';

      await rejectAdRemovalPayment(rejectingPayment.id, rejectionReason, adminUid, adminEmail);
      setActionSuccessMessage(`Payment ${rejectingPayment.reference} marked as rejected.`);

      setPayments(prev => prev.map(p => p.id === rejectingPayment.id ? {
        ...p,
        status: 'rejected',
        rejectionReason,
        adsRemoved: false,
        verifiedAt: Date.now(),
        verifiedBy: adminEmail
      } : p));

      setRejectingPayment(null);
      setRejectionReason('');
      setTimeout(() => setActionSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Failed to reject payment:', err);
      setActionErrorMessage(err.message || 'Failed to reject payment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-slate-950 border border-rose-500/40 rounded-3xl text-center space-y-4 shadow-2xl font-sans">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Access Restricted</h2>
        <p className="text-xs text-slate-400 font-mono">
          Only authorized administrators can access the Ad Removal Payment Verification dashboard.
        </p>
      </div>
    );
  }

  // Filter and search
  const filteredPayments = payments.filter((pay) => {
    const matchesStatus = filterStatus === 'all' || pay.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      pay.reference.toLowerCase().includes(q) || 
      pay.username.toLowerCase().includes(q) ||
      (pay.senderName && pay.senderName.toLowerCase().includes(q)) ||
      (pay.senderPhone && pay.senderPhone.includes(q)) ||
      pay.amount.toString().includes(q);

    return matchesStatus && matchesSearch;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'verified')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const verifiedCount = payments.filter(p => p.status === 'verified').length;
  const rejectedCount = payments.filter(p => p.status === 'rejected').length;

  return (
    <div id="admin-ad-payments-page" className="max-w-6xl mx-auto px-4 py-8 space-y-8 font-sans animate-fadeIn">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ad Removal Payments & Verification
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Target OPAY Bank: <strong>8105341700</strong> (Aura Sovereign / Princewill Geleteye)
          </p>
        </div>

        <button
          onClick={() => {
            setIsLoading(true);
            fetchAllAdRemovalPayments().then((data) => {
              setPayments(data);
              setIsLoading(false);
            });
          }}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-400' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Total Submissions</span>
          <span className="text-2xl font-bold font-mono text-slate-100">{payments.length}</span>
        </div>

        <div className="bg-slate-950/80 border border-amber-500/40 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">Pending Verification</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-300">{pendingCount}</span>
            {pendingCount > 0 && <span className="text-[10px] font-mono text-amber-400 animate-pulse font-bold">Action Needed</span>}
          </div>
        </div>

        <div className="bg-slate-950/80 border border-emerald-500/40 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">Verified Revenue</span>
          <span className="text-2xl font-bold font-mono text-emerald-300">₦{totalRevenue.toLocaleString()}</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Rejected Receipts</span>
          <span className="text-2xl font-bold font-mono text-rose-400">{rejectedCount}</span>
        </div>
      </div>

      {/* ACTION ALERTS */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {actionErrorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{actionErrorMessage}</span>
        </div>
      )}

      {/* FILTER & SEARCH CONTROLS */}
      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['all', 'pending', 'verified', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? `All (${payments.length})` : `${st} (${payments.filter(p => p.status === st).length})`}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Ref, User, Sender..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
          />
        </div>
      </div>

      {/* PAYMENTS LIST */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
          <span>Loading payment receipts...</span>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-12 text-center space-y-2">
          <p className="text-sm font-bold text-slate-300 font-mono">No payment submissions found</p>
          <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((pay) => {
            const isProcessing = actionLoadingId === pay.id;
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
                className={`bg-slate-950/90 border rounded-2xl p-5 transition space-y-4 ${
                  pay.status === 'pending'
                    ? 'border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : pay.status === 'verified'
                    ? 'border-emerald-500/30'
                    : 'border-slate-800 opacity-80'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: User & Plan info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-100 font-mono">@{pay.username}</span>
                      <span className="text-xs font-mono text-slate-500">({pay.userId.slice(0, 12)}...)</span>
                      <span className="px-2 py-0.5 bg-amber-950/90 border border-amber-500/40 text-amber-300 text-[10px] font-mono rounded font-bold">
                        {pay.planTitle || 'Ad-Free Pass'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
                      <span>Ref: <strong className="text-slate-200">{pay.reference}</strong></span>
                      <span>•</span>
                      <span>Amount: <strong className="text-amber-300">₦{pay.amount.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>Date: {dateStr}</span>
                    </div>

                    {(pay.senderName || pay.senderPhone) && (
                      <div className="text-[11px] font-mono text-slate-400">
                        Sender: <span className="text-slate-200">{pay.senderName || 'N/A'}</span>
                        {pay.senderPhone && ` (${pay.senderPhone})`}
                      </div>
                    )}
                  </div>

                  {/* Right: Status and Actions */}
                  <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
                    {/* View Receipt Button */}
                    {pay.receiptUrl && (
                      <button
                        onClick={() => setSelectedReceipt(pay)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>View Proof</span>
                      </button>
                    )}

                    {pay.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleApprove(pay)}
                          disabled={isProcessing}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-mono font-bold transition flex items-center gap-1.5 shadow"
                        >
                          {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          <span>Approve & Remove Ads</span>
                        </button>

                        <button
                          onClick={() => handleOpenRejectModal(pay)}
                          disabled={isProcessing}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold transition flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : pay.status === 'verified' ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified (Ads Removed)</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold flex items-center gap-1.5">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Rejected</span>
                        </span>
                        <button
                          onClick={() => handleApprove(pay)}
                          disabled={isProcessing}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono"
                          title="Re-approve this payment"
                        >
                          Re-Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {pay.receiptNote && (
                  <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] font-mono text-slate-300">
                    <span className="text-slate-500 font-bold uppercase mr-1">User Note:</span>
                    {pay.receiptNote}
                  </div>
                )}

                {pay.rejectionReason && (
                  <div className="p-2.5 bg-rose-950/30 rounded-xl border border-rose-500/30 text-[11px] font-mono text-rose-300">
                    <span className="text-rose-400 font-bold uppercase mr-1">Rejection Reason:</span>
                    {pay.rejectionReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* RECEIPT DETAIL MODAL */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-950 border border-slate-800 max-w-xl w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-200">
                  Payment Receipt Proof: {selectedReceipt.reference}
                </h3>
                <span className="text-xs font-mono text-slate-400">@{selectedReceipt.username} • ₦{selectedReceipt.amount.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white p-1 text-base font-mono"
              >
                ✕
              </button>
            </div>

            {selectedReceipt.receiptUrl ? (
              <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-800 bg-slate-900 p-2 text-center">
                <img
                  src={selectedReceipt.receiptUrl}
                  alt="Receipt Full Preview"
                  className="max-w-full h-auto mx-auto rounded object-contain"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-xs font-mono text-slate-500">
                No visual image provided.
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              {selectedReceipt.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedReceipt);
                      setSelectedReceipt(null);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-mono font-bold rounded-xl shadow"
                  >
                    Approve Payment
                  </button>
                  <button
                    onClick={() => {
                      handleOpenRejectModal(selectedReceipt);
                      setSelectedReceipt(null);
                    }}
                    className="px-3 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono rounded-xl"
                  >
                    Reject Receipt
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-2 bg-slate-800 text-slate-300 text-xs font-mono rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-950 border border-rose-500/50 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold font-mono text-rose-300">
              Reject Payment: {rejectingPayment.reference}
            </h3>

            <p className="text-xs text-slate-400">
              Provide a clear reason so @{rejectingPayment.username} can review their OPAY transfer and re-submit a valid receipt:
            </p>

            <div className="space-y-2">
              {[
                'Payment not found in OPAY account 8105341700.',
                'Amount paid is less than the selected plan price.',
                'Receipt screenshot is unreadable or blurry.',
                'Duplicate reference ID or expired transaction proof.'
              ].map((quickReason) => (
                <button
                  key={quickReason}
                  type="button"
                  onClick={() => setRejectionReason(quickReason)}
                  className="w-full p-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left text-xs font-mono text-slate-300 rounded-lg transition"
                >
                  {quickReason}
                </button>
              ))}
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-400 transition"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingPayment(null)}
                className="px-3 py-2 bg-slate-800 text-slate-300 text-xs font-mono rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold rounded-xl transition shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAdPaymentsSection;

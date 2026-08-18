import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  EyeOff, 
  Trash2, 
  CornerDownRight, 
  Send, 
  Search, 
  AlertTriangle,
  Sparkles,
  Award,
  User,
  Filter,
  BarChart3,
  ThumbsUp,
  MessageSquareCode,
  Flag,
  Check,
  X
} from 'lucide-react';
import { AppFeedbackReview, ReviewAnalytics, ReviewCategory } from '../types';
import { 
  fetchAllFeedbackReviewsAdmin, 
  moderateFeedbackReview, 
  respondToFeedbackReview, 
  deleteFeedbackReview 
} from '../utils/firebase';

interface AdminReviewsSectionProps {
  adminUserId: string;
  adminUserName: string;
}

export default function AdminReviewsSection({
  adminUserId,
  adminUserName
}: AdminReviewsSectionProps) {
  const [reviews, setReviews] = useState<AppFeedbackReview[]>([]);
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'hidden' | 'spam'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Replying state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      // 1. Try server admin endpoint
      const res = await fetch('/api/admin/reviews', {
        headers: {
          'x-admin-key': 'geleteyeprincewill72@gmail.com',
          'x-user-role': 'admin'
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.reviews) {
          setReviews(json.reviews);
          setAnalytics(json.analytics);
          return;
        }
      }

      // 2. Fallback to Firestore
      const list = await fetchAllFeedbackReviewsAdmin();
      setReviews(list);
      computeLocalAnalytics(list);
    } catch (err) {
      console.warn("Admin reviews fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const computeLocalAnalytics = (all: AppFeedbackReview[]) => {
    const totalCount = all.length;
    const approvedCount = all.filter(r => r.status === 'approved').length;
    const pendingCount = all.filter(r => r.status === 'pending').length;
    const hiddenCount = all.filter(r => r.status === 'hidden').length;
    const spamCount = all.filter(r => r.status === 'spam').length;

    const totalRating = all.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalCount > 0 ? parseFloat((totalRating / totalCount).toFixed(1)) : 5.0;

    const ratingCounts = {
      5: all.filter(r => r.rating === 5).length,
      4: all.filter(r => r.rating === 4).length,
      3: all.filter(r => r.rating === 3).length,
      2: all.filter(r => r.rating === 2).length,
      1: all.filter(r => r.rating === 1).length,
    };

    const categoryCounts: Record<string, number> = {};
    all.forEach(r => {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    });

    const recentSuggestions = all
      .filter(r => r.suggestion && r.suggestion.trim().length > 0)
      .slice(0, 8)
      .map(r => ({ author: r.authorName, category: r.category, suggestion: r.suggestion!, rating: r.rating, createdAt: r.createdAt }));

    const recentBugReports = all
      .filter(r => r.category === 'Bug Report')
      .slice(0, 8)
      .map(r => ({ author: r.authorName, comment: r.comment, rating: r.rating, createdAt: r.createdAt, status: r.status }));

    setAnalytics({
      totalCount,
      approvedCount,
      pendingCount,
      hiddenCount,
      spamCount,
      averageRating,
      ratingCounts,
      categoryCounts,
      recentSuggestions,
      recentBugReports
    });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleModerateStatus = async (reviewId: string, status: 'approved' | 'hidden' | 'spam') => {
    try {
      // 1. Server API
      await fetch('/api/admin/reviews/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'geleteyeprincewill72@gmail.com',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ reviewId, status })
      });

      // 2. Firestore
      await moderateFeedbackReview(reviewId, status);

      setReviews(prev => prev.map(r => r.reviewId === reviewId ? { ...r, status, updatedAt: Date.now() } : r));
    } catch (err) {
      alert("Error updating review status: " + err);
    }
  };

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      // 1. Server API
      await fetch('/api/admin/reviews/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': 'geleteyeprincewill72@gmail.com',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ 
          reviewId, 
          adminResponse: replyText.trim(),
          status: 'approved'
        })
      });

      // 2. Firestore
      await respondToFeedbackReview(reviewId, replyText.trim(), adminUserId);

      setReviews(prev => prev.map(r => 
        r.reviewId === reviewId 
          ? { ...r, adminResponse: replyText.trim(), adminRespondedAt: Date.now(), status: 'approved', updatedAt: Date.now() } 
          : r
      ));

      setReplyingReviewId(null);
      setReplyText('');
    } catch (err) {
      alert("Error submitting reply: " + err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Permanently delete this review?")) return;
    try {
      await deleteFeedbackReview(reviewId);
      setReviews(prev => prev.filter(r => r.reviewId !== reviewId));
    } catch (err) {
      alert("Error deleting review: " + err);
    }
  };

  // Filtered list
  const filteredReviews = reviews.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (starFilter !== 'all' && r.rating !== starFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAuthor = r.authorName.toLowerCase().includes(q);
      const matchComment = r.comment.toLowerCase().includes(q);
      const matchCat = r.category.toLowerCase().includes(q);
      const matchSuggestion = (r.suggestion || '').toLowerCase().includes(q);
      if (!matchAuthor && !matchComment && !matchCat && !matchSuggestion) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6" id="admin-reviews-section">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/30 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-violet-400" />
              Admin Review Moderation & Feedback Analytics
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-violet-950 text-violet-300 border border-violet-700">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Moderate community feedback, respond to bug reports & inspect weekly telemetry
          </p>
        </div>

        <button
          onClick={loadReviews}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-medium transition flex items-center gap-2 shadow self-start md:self-auto"
        >
          <span>Refresh Data</span>
        </button>
      </div>

      {/* ==================== ANALYTICS DASHBOARD ==================== */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Total & Average Rating */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Average Rating</span>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-slate-100 font-mono">
              {analytics.averageRating} <span className="text-sm text-slate-500">/ 5.0</span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {analytics.totalCount} Total Feedback Submissions
            </div>
          </div>

          {/* Pending Moderation Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 uppercase">Pending Moderation</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-300 font-mono">
              {analytics.pendingCount}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Reviews awaiting approval
            </div>
          </div>

          {/* Approved & Live */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 uppercase">Approved & Public</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-300 font-mono">
              {analytics.approvedCount}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Visible on Community page
            </div>
          </div>

          {/* Hidden or Spam */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-rose-400 uppercase">Hidden / Spam</span>
              <EyeOff className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-3xl font-bold text-rose-300 font-mono">
              {analytics.hiddenCount + analytics.spamCount}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Filtered from public view
            </div>
          </div>

        </div>
      )}

      {/* Star Breakdown & Bug Reports Fast Queue */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Star Distribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-violet-400" /> Star Rating Distribution
            </h4>
            <div className="space-y-2 text-xs font-mono">
              {[5, 4, 3, 2, 1].map(st => {
                const count = analytics.ratingCounts[st as keyof typeof analytics.ratingCounts] || 0;
                const pct = analytics.totalCount > 0 ? (count / analytics.totalCount) * 100 : 0;
                return (
                  <div key={st} className="flex items-center gap-3">
                    <span className="w-12 text-slate-300">{st} Stars</span>
                    <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Distribution Pills */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-cyan-400" /> Category Breakdown
            </h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(analytics.categoryCounts).map(([cat, cnt]) => (
                <div 
                  key={cat}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center gap-2"
                >
                  <span className="text-slate-200 font-sans">{cat}</span>
                  <span className="px-1.5 py-0.2 rounded bg-violet-950 text-violet-300 border border-violet-800 font-mono font-bold text-[10px]">
                    {cnt}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ==================== FILTERS TOOLBAR ==================== */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search all reviews, suggestions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Moderation Statuses</option>
            <option value="pending">⏳ Pending Review</option>
            <option value="approved">✅ Approved</option>
            <option value="hidden">👁️ Hidden</option>
            <option value="spam">🚫 Spam</option>
          </select>

          {/* Star Filter */}
          <select
            value={starFilter}
            onChange={e => setStarFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Stars</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* ==================== REVIEWS MODERATION LIST ==================== */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500 font-mono text-xs">
            Loading reviews for moderation...
          </div>
        ) : filteredReviews.length > 0 ? (
          <div className="grid gap-4">
            {filteredReviews.map(rev => (
              <div 
                key={rev.reviewId}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 transition shadow"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    {rev.isAnonymous ? (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                    ) : rev.authorAvatar ? (
                      <img 
                        src={rev.authorAvatar} 
                        alt={rev.authorName} 
                        className="w-10 h-10 rounded-full object-cover border border-violet-500/40"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-violet-950 text-violet-300 border border-violet-700/50 flex items-center justify-center font-bold font-sans text-sm">
                        {rev.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-100 font-sans">
                          {rev.authorName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-violet-300 border border-slate-700 font-mono">
                          {rev.category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold border ${
                          rev.status === 'approved' 
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                            : rev.status === 'pending'
                              ? 'bg-amber-950 text-amber-300 border-amber-700'
                              : 'bg-rose-950 text-rose-300 border-rose-700'
                        }`}>
                          {rev.status}
                        </span>
                        {rev.reportedCount && rev.reportedCount > 0 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-700 font-mono font-bold flex items-center gap-1">
                            <Flag className="w-3 h-3" /> Reported ({rev.reportedCount})
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-mono">
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star 
                              key={st} 
                              className={`w-3.5 h-3.5 ${st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                            />
                          ))}
                        </div>
                        <span>• {new Date(rev.createdAt).toLocaleString()}</span>
                        <span>• ID: {rev.ownerId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Moderation Controls */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {rev.status !== 'approved' && (
                      <button
                        onClick={() => handleModerateStatus(rev.reviewId, 'approved')}
                        className="px-3 py-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 shadow"
                        title="Approve and make public"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    )}

                    {rev.status !== 'hidden' && (
                      <button
                        onClick={() => handleModerateStatus(rev.reviewId, 'hidden')}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition flex items-center gap-1"
                        title="Hide from public view"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide</span>
                      </button>
                    )}

                    {rev.status !== 'spam' && (
                      <button
                        onClick={() => handleModerateStatus(rev.reviewId, 'spam')}
                        className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-medium transition flex items-center gap-1"
                        title="Mark as Spam"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>Spam</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setReplyingReviewId(rev.reviewId);
                        setReplyText(rev.adminResponse || '');
                      }}
                      className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium transition flex items-center gap-1 shadow"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                      <span>{rev.adminResponse ? 'Edit Reply' : 'Reply'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(rev.reviewId)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Permanently Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap pl-1">
                  {rev.comment}
                </p>

                {/* Suggestion */}
                {rev.suggestion && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs">
                    <span className="text-[11px] font-mono font-bold text-cyan-400 block mb-1">
                      Constructive Suggestion:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{rev.suggestion}</p>
                  </div>
                )}

                {/* Existing Admin Response */}
                {rev.adminResponse && (
                  <div className="bg-violet-950/30 border border-violet-500/30 rounded-xl p-3.5 text-xs space-y-1">
                    <div className="flex items-center justify-between text-violet-300 font-bold font-sans">
                      <span className="flex items-center gap-1">
                        <CornerDownRight className="w-3.5 h-3.5 text-violet-400" />
                        Creator Reply
                      </span>
                      {rev.adminRespondedAt && (
                        <span className="text-[10px] text-slate-400 font-mono font-normal">
                          {new Date(rev.adminRespondedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-200 leading-relaxed pl-4">{rev.adminResponse}</p>
                  </div>
                )}

                {/* Reply Input Box */}
                {replyingReviewId === rev.reviewId && (
                  <div className="bg-slate-950 border border-violet-500/40 rounded-xl p-3 space-y-2 animate-fadeIn">
                    <label className="text-xs font-bold text-violet-300 block font-sans">
                      Author Official Creator Reply to @{rev.authorName}
                    </label>
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      placeholder="Thank user, address their suggestion or share timeline..."
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-violet-500 resize-y"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyingReviewId(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isSubmittingReply}
                        onClick={() => handleSendReply(rev.reviewId)}
                        className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingReply ? 'Publishing...' : 'Publish Official Reply'}</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-2">
            <MessageSquareCode className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">No reviews found matching current filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}

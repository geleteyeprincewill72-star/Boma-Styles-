import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle, 
  MessageSquareCode, 
  ShieldCheck, 
  ThumbsUp, 
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  Send,
  Flag,
  User,
  Filter,
  CheckCircle2,
  Trash2,
  Edit3,
  MessageCircle,
  HelpCircle,
  Search,
  Award,
  CornerDownRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  AppFeedbackReview, 
  ReviewCategory, 
  ReviewReportReason 
} from '../types';
import { 
  fetchPublicFeedbackReviews, 
  fetchUserFeedbackReviews, 
  submitFeedbackReview, 
  updateUserFeedbackReview, 
  deleteFeedbackReview, 
  reportFeedbackReview 
} from '../utils/firebase';

interface ReviewsSectionProps {
  username: string;
  myPublicKey?: string;
  myPrivateKey?: string;
  currentUserId?: string;
  userAvatar?: string;
  isAppCreator?: boolean;
  onOpenAdminReviews?: () => void;
}

const CATEGORIES: ReviewCategory[] = [
  'General Review',
  'Feature Request',
  'Bug Report',
  'AI Quality',
  'Image Generation',
  'Video Generation',
  'Performance',
  'User Interface',
  'Other'
];

const RATING_LABELS: Record<number, string> = {
  1: '1 Star - Poor / Needs Significant Work',
  2: '2 Stars - Fair / Some Critical Issues',
  3: '3 Stars - Good / Has Potential',
  4: '4 Stars - Very Good / Highly Enjoyable',
  5: '5 Stars - Excellent / Outstanding Experience!'
};

export default function ReviewsSection({ 
  username, 
  currentUserId = 'user_local',
  userAvatar,
  isAppCreator = false,
  onOpenAdminReviews
}: ReviewsSectionProps) {
  // Navigation sub-views: 'community' | 'submit' | 'my_reviews'
  const [activeTab, setActiveTab] = useState<'community' | 'submit' | 'my_reviews'>('community');

  // Community & User Reviews Data
  const [publicReviews, setPublicReviews] = useState<AppFeedbackReview[]>([]);
  const [myReviews, setMyReviews] = useState<AppFeedbackReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [categoryInput, setCategoryInput] = useState<ReviewCategory>('General Review');
  const [commentInput, setCommentInput] = useState('');
  const [suggestionInput, setSuggestionInput] = useState('');
  const [isAnonymousInput, setIsAnonymousInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editing State (for personal reviews)
  const [editingReview, setEditingReview] = useState<AppFeedbackReview | null>(null);
  const [editComment, setEditComment] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editCategory, setEditCategory] = useState<ReviewCategory>('General Review');
  const [editSuggestion, setEditSuggestion] = useState('');

  // Filter & Search State
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Modal State
  const [reportingReviewId, setReportingReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<ReviewReportReason>('Spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Load reviews on mount and tab change
  const loadData = async () => {
    setIsLoading(true);
    try {
      const publicList = await fetchPublicFeedbackReviews();
      setPublicReviews(publicList);

      if (currentUserId) {
        const userList = await fetchUserFeedbackReviews(currentUserId);
        setMyReviews(userList);
      }
    } catch (err) {
      console.warn("Reviews load fallback error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId, activeTab]);

  // Submit new feedback review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      setErrorMsg("Please provide your review or feedback comment.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const newReview = await submitFeedbackReview({
        ownerId: currentUserId,
        authorName: isAnonymousInput ? 'Anonymous Member' : (username || 'Aura Member'),
        authorAvatar: isAnonymousInput ? undefined : userAvatar,
        rating: ratingInput,
        comment: commentInput.trim(),
        category: categoryInput,
        suggestion: suggestionInput.trim() || undefined,
        isAnonymous: isAnonymousInput
      });

      setSuccessMsg("Thank you! Your review has been submitted for moderation and will be published shortly.");
      setCommentInput('');
      setSuggestionInput('');
      setRatingInput(5);
      setIsAnonymousInput(false);

      // Refresh personal reviews
      setMyReviews(prev => [newReview, ...prev]);

      setTimeout(() => {
        setSuccessMsg('');
      }, 6000);
    } catch (err: any) {
      setErrorMsg("Error submitting review: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save edited review
  const handleSaveEdit = async () => {
    if (!editingReview) return;
    try {
      await updateUserFeedbackReview(editingReview.reviewId, {
        rating: editRating,
        comment: editComment,
        category: editCategory,
        suggestion: editSuggestion
      });

      setMyReviews(prev => prev.map(r => 
        r.reviewId === editingReview.reviewId 
          ? { ...r, rating: editRating, comment: editComment, category: editCategory, suggestion: editSuggestion, updatedAt: Date.now() }
          : r
      ));

      setEditingReview(null);
    } catch (err) {
      alert("Error saving edits: " + err);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await deleteFeedbackReview(reviewId);
      setMyReviews(prev => prev.filter(r => r.reviewId !== reviewId));
      setPublicReviews(prev => prev.filter(r => r.reviewId !== reviewId));
    } catch (err) {
      alert("Error deleting review: " + err);
    }
  };

  // Submit report against a review
  const handleSubmitReport = async () => {
    if (!reportingReviewId) return;
    try {
      await reportFeedbackReview(reportingReviewId, currentUserId, reportReason, reportDetails);
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setReportingReviewId(null);
        setReportDetails('');
      }, 2500);
    } catch (err) {
      alert("Error reporting review: " + err);
    }
  };

  // Filtered public reviews
  const filteredPublicReviews = publicReviews.filter(r => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (filterCategory !== 'all' && r.category !== filterCategory) return false;
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

  // Calculate statistics
  const totalApproved = publicReviews.length;
  const avgRating = totalApproved > 0 
    ? (publicReviews.reduce((sum, r) => sum + r.rating, 0) / totalApproved).toFixed(1) 
    : '5.0';

  return (
    <div className="space-y-6" id="reviews-section">
      
      {/* Header Banner */}
      <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
            <MessageSquareCode className="w-5 h-5 text-violet-400" />
            Reviews & Feedback Center
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Community ratings, feature suggestions & weekly bug reporting
          </p>
        </div>

        {/* Action Tabs & Admin Shortcut */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                activeTab === 'community' 
                  ? 'bg-violet-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Community Reviews ({totalApproved})</span>
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                activeTab === 'submit' 
                  ? 'bg-violet-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write Feedback</span>
            </button>
            <button
              onClick={() => setActiveTab('my_reviews')}
              className={`px-3.5 py-1.5 rounded-lg transition font-medium flex items-center gap-1.5 ${
                activeTab === 'my_reviews' 
                  ? 'bg-violet-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>My Reviews ({myReviews.length})</span>
            </button>
          </div>

          {isAppCreator && onOpenAdminReviews && (
            <button
              onClick={onOpenAdminReviews}
              className="px-3 py-1.5 bg-violet-950 text-violet-300 border border-violet-700/50 hover:bg-violet-900 rounded-xl text-xs font-mono font-medium transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
              <span>Moderate Reviews</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================== SUB-VIEW 1: COMMUNITY REVIEWS ==================== */}
      {activeTab === 'community' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100 font-mono">{avgRating} <span className="text-xs text-slate-400">/ 5.0</span></div>
                <div className="text-xs text-slate-400 font-mono">Average Community Rating</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100 font-mono">{totalApproved}</div>
                <div className="text-xs text-slate-400 font-mono">Approved Public Reviews</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-400 font-mono">Weekly Updates</div>
                <div className="text-xs text-slate-400 font-mono">Reviewed in every Sunday release</div>
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reviews & suggestions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
              {/* Rating Filter */}
              <select
                value={filterRating}
                onChange={e => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="1">⭐ 1 Star</option>
              </select>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 font-mono text-xs">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading verified reviews...
            </div>
          ) : filteredPublicReviews.length > 0 ? (
            <div className="grid gap-4">
              {filteredPublicReviews.map(rev => (
                <div 
                  key={rev.reviewId} 
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 transition shadow"
                >
                  {/* Top Bar: Author, Rating, Category & Report */}
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
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100 font-sans">
                            {rev.authorName}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-violet-300 border border-slate-700 font-mono">
                            {rev.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* Stars */}
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map(st => (
                              <Star 
                                key={st} 
                                className={`w-3.5 h-3.5 ${st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Report action */}
                    <button
                      onClick={() => setReportingReviewId(rev.reviewId)}
                      className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition p-1"
                      title="Report inappropriate review"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-mono">Report</span>
                    </button>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap pl-0.5">
                    {rev.comment}
                  </p>

                  {/* Optional Constructive Suggestion */}
                  {rev.suggestion && (
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1">
                      <div className="text-[11px] font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> Constructive Suggestion:
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-1">{rev.suggestion}</p>
                    </div>
                  )}

                  {/* Admin Official Response (if available) */}
                  {rev.adminResponse && (
                    <div className="bg-violet-950/30 border border-violet-500/30 rounded-xl p-3.5 text-xs space-y-1.5 mt-2">
                      <div className="flex items-center justify-between text-violet-300 font-bold font-sans">
                        <span className="flex items-center gap-1.5">
                          <CornerDownRight className="w-3.5 h-3.5 text-violet-400" />
                          Official Creator / Admin Response
                        </span>
                        {rev.adminRespondedAt && (
                          <span className="text-[10px] text-slate-400 font-mono font-normal">
                            {new Date(rev.adminRespondedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-200 leading-relaxed pl-5">
                        {rev.adminResponse}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
              <MessageSquareCode className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No reviews found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No reviews match your current filters. Be the first to share your thoughts on Aura!
              </p>
              <button
                onClick={() => setActiveTab('submit')}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-xl transition shadow"
              >
                Write a Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== SUB-VIEW 2: SUBMIT REVIEW FORM ==================== */}
      {activeTab === 'submit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl mx-auto shadow-xl animate-fadeIn">
          
          <div>
            <h3 className="text-base font-bold text-slate-100 font-sans flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-violet-400" />
              Submit Your Review & Feature Feedback
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Your feedback is directly analyzed by the creator team during every weekly development upgrade.
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-4 flex items-center gap-3 text-xs text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-5">
            
            {/* 1. Star Rating Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Overall Experience Rating <span className="text-rose-400">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(st => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => setRatingInput(st)}
                    onMouseEnter={() => setHoverRating(st)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1.5 focus:outline-none transition transform hover:scale-110"
                    aria-label={`${st} Stars`}
                  >
                    <Star 
                      className={`w-7 h-7 ${
                        st <= (hoverRating || ratingInput) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-slate-700'
                      }`} 
                    />
                  </button>
                ))}
                <span className="text-xs font-mono text-amber-400 font-medium ml-2">
                  {RATING_LABELS[hoverRating || ratingInput]}
                </span>
              </div>
            </div>

            {/* 2. Category Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Feedback Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={categoryInput}
                onChange={e => setCategoryInput(e.target.value as ReviewCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 3. Review Comment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Your Review & Observations <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={4}
                value={commentInput}
                onChange={e => setCommentInput(e.target.value)}
                placeholder="Share your detailed experience, what you loved most, or issues you encountered..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition leading-relaxed resize-y"
              />
            </div>

            {/* 4. Constructive Feature Suggestion */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Constructive Suggestion or Feature Request (Optional)
              </label>
              <textarea
                rows={2}
                value={suggestionInput}
                onChange={e => setSuggestionInput(e.target.value)}
                placeholder="What single enhancement would make Aura 10x better for you?"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition leading-relaxed resize-y"
              />
            </div>

            {/* 5. Privacy & Anonymous Toggle */}
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                {isAnonymousInput ? (
                  <EyeOff className="w-4 h-4 text-cyan-400 shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {isAnonymousInput ? 'Anonymous Review' : `Publishing as @${username || 'Aura Member'}`}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {isAnonymousInput ? 'Your username and profile avatar will be hidden publicly.' : 'Your verified display name will appear alongside your review.'}
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAnonymousInput} 
                  onChange={e => setIsAnonymousInput(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('community')}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ==================== SUB-VIEW 3: MY REVIEWS HISTORY ==================== */}
      {activeTab === 'my_reviews' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-slate-200 font-sans">
              Your Submitted Feedback ({myReviews.length})
            </h3>
            <button
              onClick={() => setActiveTab('submit')}
              className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-xl transition flex items-center gap-1.5 shadow"
            >
              <Edit3 className="w-3 h-3" />
              <span>Write New Review</span>
            </button>
          </div>

          {myReviews.length > 0 ? (
            <div className="grid gap-4">
              {myReviews.map(rev => (
                <div key={rev.reviewId} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map(st => (
                          <Star 
                            key={st} 
                            className={`w-4 h-4 ${st <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {rev.category}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono uppercase font-bold border ${
                        rev.status === 'approved' 
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-700' 
                          : rev.status === 'pending'
                            ? 'bg-amber-950 text-amber-300 border-amber-700'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {rev.status === 'approved' ? 'Approved & Public' : rev.status === 'pending' ? 'Pending Moderation' : rev.status}
                      </span>

                      {/* Action buttons */}
                      <button
                        onClick={() => {
                          setEditingReview(rev);
                          setEditComment(rev.comment);
                          setEditRating(rev.rating);
                          setEditCategory(rev.category);
                          setEditSuggestion(rev.suggestion || '');
                        }}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition"
                        title="Edit feedback"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteReview(rev.reviewId)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                        title="Delete feedback"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {rev.comment}
                  </p>

                  {rev.suggestion && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">Suggestion:</span>
                      <p className="text-slate-300">{rev.suggestion}</p>
                    </div>
                  )}

                  {rev.adminResponse && (
                    <div className="bg-violet-950/30 border border-violet-500/30 rounded-xl p-3 text-xs space-y-1">
                      <span className="text-[11px] font-bold text-violet-300 font-sans block">
                        Admin Response:
                      </span>
                      <p className="text-slate-200">{rev.adminResponse}</p>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Submitted: {new Date(rev.createdAt).toLocaleDateString()}</span>
                    <span>{rev.isAnonymous ? 'Anonymous' : 'Public Name'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-2">
              <User className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">You haven't submitted any reviews yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ==================== EDIT REVIEW MODAL ==================== */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 font-sans">
              Edit Your Review & Feedback
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setEditRating(st)}
                      className="p-1 focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${st <= editRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={e => setEditCategory(e.target.value as ReviewCategory)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Feedback Comment</label>
                <textarea
                  rows={3}
                  value={editComment}
                  onChange={e => setEditComment(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 resize-y"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Suggestion</label>
                <textarea
                  rows={2}
                  value={editSuggestion}
                  onChange={e => setEditSuggestion(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== REPORT REVIEW MODAL ==================== */}
      {reportingReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-400" />
              Report Review to Moderators
            </h3>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thank you. Your report has been submitted to the moderation council.</span>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Reason for Report</label>
                    <select
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value as ReviewReportReason)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200"
                    >
                      <option value="Spam">Spam or Advertisement</option>
                      <option value="Offensive">Offensive or Abusive Content</option>
                      <option value="Misleading">Misleading or False Claims</option>
                      <option value="Irrelevant">Irrelevant Content</option>
                      <option value="Inappropriate">Inappropriate for Community</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Additional Details (Optional)</label>
                    <textarea
                      rows={3}
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      placeholder="Explain why this content violates community standards..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 resize-y"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingReviewId(null)}
                    className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReport}
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

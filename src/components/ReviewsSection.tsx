import React, { useState } from 'react';
import { 
  Star, 
  CheckCircle, 
  MessageSquareCode, 
  ShieldCheck, 
  ThumbsUp, 
  AlertCircle,
  Key,
  Clock,
  Sparkles,
  ThumbsDown,
  Layers,
  Wrench,
  CheckCircle2,
  Calendar,
  Zap,
  Tag
} from 'lucide-react';
import { signContent } from '../utils/crypto';
import { Review } from '../types';

interface ReviewsSectionProps {
  username: string;
  myPublicKey: string;
  myPrivateKey: string;
  reviews: Review[];
  onAddReview: (review: Review) => void;
  onHelpfulToggle: (reviewId: string) => void;
  isAppCreator?: boolean;
}

export default function ReviewsSection({ 
  username, 
  myPublicKey, 
  myPrivateKey,
  reviews,
  onAddReview,
  onHelpfulToggle,
  isAppCreator = false
}: ReviewsSectionProps) {
  const [ratingInput, setRatingInput] = useState(5);
  const [likeInput, setLikeInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<'ui_design' | 'performance' | 'features' | 'monetization' | 'bug_fix' | 'general'>('features');
  const [reviewContent, setReviewContent] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'likes' | 'dislikes' | '4day_backlog'>('all');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!likeInput.trim() && !dislikeInput.trim() && !reviewContent.trim()) {
      alert("Please provide feedback on what you like or don't like about the app.");
      return;
    }

    try {
      const summaryContent = reviewContent.trim() || 
        `Pros: ${likeInput || 'Great overall app'} | Upgrade Requests: ${dislikeInput || 'Keep improving'}`;

      const sigPayload = `${username}:${summaryContent}:${ratingInput}:${Date.now()}`;
      const signature = await signContent(sigPayload, myPrivateKey);

      const newReview: Review = {
        id: `rev_${Date.now()}`,
        authorName: username,
        authorPublicKey: myPublicKey,
        rating: ratingInput,
        content: summaryContent,
        likeAspects: likeInput.trim(),
        dislikeAspects: dislikeInput.trim(),
        upgradeCategory: categoryInput,
        upgradeStatus: 'pending',
        timestamp: Date.now(),
        signature,
        helpfulCount: 0
      };

      onAddReview(newReview);
      setReviewContent('');
      setLikeInput('');
      setDislikeInput('');
      setRatingInput(5);
      setSuccessMsg("Thank you! Your feedback has been cryptographically signed and logged for the upcoming 4-Day App Upgrade Cycle.");
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);

    } catch (err) {
      alert("Error signing review: " + err);
    }
  };

  const handleHelpful = (id: string) => {
    onHelpfulToggle(id);
  };

  // Calculate stats
  const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : '0.0';
  
  const reviewsWithDislikes = reviews.filter(r => r.dislikeAspects && r.dislikeAspects.trim().length > 0);
  const reviewsWithLikes = reviews.filter(r => r.likeAspects && r.likeAspects.trim().length > 0);

  // Filter logic
  const filteredReviewsList = reviews.filter(rev => {
    if (activeFilter === 'likes') return rev.likeAspects && rev.likeAspects.trim().length > 0;
    if (activeFilter === 'dislikes') return rev.dislikeAspects && rev.dislikeAspects.trim().length > 0;
    if (activeFilter === '4day_backlog') return rev.dislikeAspects || rev.upgradeStatus === 'pending';
    return true;
  });

  return (
    <div className="space-y-6" id="reviews-section">
      
      {/* Heading */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
            <MessageSquareCode className="w-5 h-5 text-violet-400" />
            User Reviews & 4-Day App Upgrade Engine
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Share what you love & what needs improvement • All feedback is processed every 4 days to upgrade the app
          </p>
        </div>
        <div className="bg-gradient-to-r from-violet-950/60 via-slate-900 to-cyan-950/60 border border-violet-500/30 rounded-xl px-4 py-2 flex items-center gap-3 shadow">
          <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          <div>
            <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">4-DAY UPGRADE CADENCE ACTIVE</div>
            <div className="text-[11px] text-slate-300 font-mono">Next Scheduled Upgrade: <strong className="text-emerald-400">Day 4 Milestone</strong></div>
          </div>
        </div>
      </div>

      {/* 4-DAY APP UPGRADE CYCLE NOTICE BANNER */}
      <div className="bg-gradient-to-r from-violet-950/40 via-slate-950 to-indigo-950/40 border border-violet-500/30 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
              <Sparkles className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-sans flex items-center gap-2">
                Continuous 4-Day App Upgrade Guarantee
                <span className="text-[9px] bg-violet-950 text-violet-300 border border-violet-800 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
                  Automatic AI Cycle
                </span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans mt-0.5">
                Every 4 days, all submitted comments—highlighting what users love and what needs fixing—are compiled to ship new features, UI refinements, and app upgrades!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Cycle Length: <strong>Every 4 Days</strong></span>
          </div>
        </div>

        {/* Quick Backlog Analytics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Total Reviews</span>
            <span className="text-base font-bold text-slate-200">{reviews.length}</span>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-emerald-400 block uppercase">Positive Feedback</span>
            <span className="text-base font-bold text-emerald-300">{reviewsWithLikes.length}</span>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-amber-400 block uppercase">Requested Upgrades</span>
            <span className="text-base font-bold text-amber-300">{reviewsWithDislikes.length}</span>
          </div>
          <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-violet-400 block uppercase">Average Satisfaction</span>
            <span className="text-base font-bold text-violet-300">{averageRating} / 5.0</span>
          </div>
        </div>
      </div>

      {/* Overview Stats & Submit Review Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Rating Breakdown & Creator Status */}
        <div className="md:col-span-4 bg-gradient-to-tr from-violet-950/20 to-slate-900 border border-violet-900/30 rounded-2xl p-6 flex flex-col justify-between text-center space-y-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-violet-400 font-bold mb-2 block">
              Swarm Satisfaction Score
            </span>
            <div className="text-5xl font-extrabold text-slate-100 font-mono tracking-tighter">
              {averageRating}
            </div>
            <div className="flex justify-center gap-1.5 my-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-5 h-5 ${
                    star <= Math.round(parseFloat(averageRating))
                      ? 'fill-amber-400 stroke-amber-400' 
                      : 'stroke-slate-600'
                  }`} 
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Based on {reviews.length} verifiable user feedback log{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-left space-y-2">
            <div className="text-[10px] uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              What Users Want Upgraded Next:
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300 font-sans">
              {reviewsWithDislikes.length > 0 ? (
                reviewsWithDislikes.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-amber-300/90 font-mono text-[10px]">
                    <span className="text-amber-500 font-bold">•</span>
                    <span className="truncate">{r.dislikeAspects}</span>
                  </div>
                ))
              ) : (
                <div className="text-[10px] text-slate-500 italic">No complaint reports logged yet. Submit your feedback on the right!</div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Detailed Review Form */}
        <div className="md:col-span-8 bg-[#0A0F1D] border border-slate-900 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-violet-400" />
              Submit App Review & Upgrade Suggestions
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Processed Every 4 Days</span>
          </div>

          {successMsg && (
            <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-lg flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4">
            
            {/* Rating Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-850">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">Overall Score:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const ratingValue = star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingInput(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="transition focus:outline-none"
                      >
                        <Star 
                          className={`w-5 h-5 cursor-pointer transition-colors ${
                            ratingValue <= (hoverRating !== null ? hoverRating : ratingInput)
                              ? 'fill-amber-400 stroke-amber-400' 
                              : 'stroke-slate-600 hover:stroke-amber-400'
                          }`} 
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/40 border border-amber-900/40 px-1.5 py-0.2 rounded">
                  {ratingInput} / 5 Stars
                </span>
              </div>

              {/* Category selector */}
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={categoryInput}
                  onChange={(e: any) => setCategoryInput(e.target.value)}
                  className="bg-slate-900 text-slate-200 border border-slate-800 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-violet-500"
                >
                  <option value="features">Features & Capability</option>
                  <option value="ui_design">UI Layout & Visuals</option>
                  <option value="performance">Speed & Performance</option>
                  <option value="monetization">OPAY & Monetization</option>
                  <option value="bug_fix">Bug Fixes & Errors</option>
                  <option value="general">General Feedback</option>
                </select>
              </div>
            </div>

            {/* Structured Feedback Fields: Pros & Cons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <ThumbsUp className="w-3 h-3 text-emerald-400" />
                  What You LIKE About The App
                </label>
                <textarea
                  value={likeInput}
                  onChange={(e) => setLikeInput(e.target.value)}
                  placeholder="Share what you like about the app..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none resize-none font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono text-amber-400 tracking-wider flex items-center gap-1.5 mb-1">
                  <ThumbsDown className="w-3 h-3 text-amber-400" />
                  What You DON'T LIKE / Want Upgraded
                </label>
                <textarea
                  value={dislikeInput}
                  onChange={(e) => setDislikeInput(e.target.value)}
                  placeholder="Share feedback or suggested improvements..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none resize-none font-sans"
                />
              </div>
            </div>

            {/* Additional General Comment */}
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-400 tracking-wider block mb-1">
                Additional Comments / Detailed Instructions
              </label>
              <textarea
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
                placeholder="Elaborate on your feedback or give step-by-step feature requests for the next 4-day upgrade batch..."
                maxLength={800}
                rows={2}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 resize-none font-sans"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-slate-100 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition shadow"
            >
              Submit Signed Feedback for 4-Day Upgrade Batch
            </button>
          </form>
        </div>
      </div>

      {/* Reviews Feed with Filtering */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-200 font-sans uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-400" />
            Community Review & Complaint Log ({reviews.length})
          </h3>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg border transition ${
                activeFilter === 'all' ? 'bg-violet-950 border-violet-500 text-violet-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Feedback
            </button>
            <button
              onClick={() => setActiveFilter('likes')}
              className={`px-3 py-1 rounded-lg border transition ${
                activeFilter === 'likes' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Liked Features
            </button>
            <button
              onClick={() => setActiveFilter('dislikes')}
              className={`px-3 py-1 rounded-lg border transition ${
                activeFilter === 'dislikes' ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Complaints & Upgrades
            </button>
          </div>
        </div>

        {filteredReviewsList.length === 0 ? (
          <div className="text-center py-12 bg-[#0A0F1D] border border-slate-900 rounded-2xl text-slate-500 font-mono text-xs space-y-2">
            <MessageSquareCode className="w-8 h-8 mx-auto text-slate-600" />
            <p>No reviews match the selected filter category yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviewsList.map(rev => (
              <div 
                key={rev.id} 
                className="bg-[#0A0F1D] border border-slate-900 rounded-xl p-5 space-y-3.5 transition hover:border-slate-800"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-violet-400 border border-slate-700/60 font-sans uppercase">
                      {rev.authorName.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 font-sans text-xs">{rev.authorName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">• {new Date(rev.timestamp).toLocaleDateString()}</span>
                        {rev.upgradeCategory && (
                          <span className="text-[9px] bg-slate-900 text-cyan-400 border border-cyan-900/60 px-1.5 py-0.2 rounded font-mono uppercase">
                            {rev.upgradeCategory}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[9px] text-slate-500 mt-0.5">
                        <Key className="w-2.5 h-2.5 text-violet-500" />
                        <span>Sender: {rev.authorPublicKey.slice(0, 16)}...</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating 
                            ? 'fill-amber-400 stroke-amber-400' 
                            : 'stroke-slate-700'
                        }`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Structured Pros & Cons Content */}
                {(rev.likeAspects || rev.dislikeAspects) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {rev.likeAspects && (
                      <div className="bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-lg space-y-1">
                        <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-emerald-400" />
                          What They Like:
                        </div>
                        <p className="text-slate-200 font-sans">{rev.likeAspects}</p>
                      </div>
                    )}

                    {rev.dislikeAspects && (
                      <div className="bg-amber-950/20 border border-amber-500/20 p-3 rounded-lg space-y-1">
                        <div className="text-[10px] font-mono text-amber-400 font-bold uppercase flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3 text-amber-400" />
                          What Needs 4-Day Upgrade:
                        </div>
                        <p className="text-slate-200 font-sans">{rev.dislikeAspects}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* General Comment */}
                {rev.content && (
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    {rev.content}
                  </p>
                )}

                {/* Cryptographic Signature verification & 4-day upgrade status footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900/60">
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Verified Cryptographic Block: {rev.signature.slice(0, 16)}...</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-900/40">
                      ● Queued for Next 4-Day Upgrade Batch
                    </span>
                    <button 
                      onClick={() => handleHelpful(rev.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded border border-slate-850 hover:bg-slate-900 transition ${
                        rev.hasMarkedHelpful ? 'text-violet-400 border-violet-800' : 'text-slate-500'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

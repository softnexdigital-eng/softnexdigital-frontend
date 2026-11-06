 "use client";

import { FaStar, FaTimes } from "react-icons/fa";
import type { Review } from "@/types";

interface ReviewsSectionProps {
  reviews: Review[];
  reviewsLoading: boolean;
  avgRating: number;
  showReviewForm: boolean;
  setShowReviewForm: (v: boolean) => void;
  editingReviewId: string | null;
  reviewName: string;
  reviewLocation: string;
  reviewText: string;
  reviewStars: number;
  reviewPhone: string;
  reviewSubmitting: boolean;
  setEditingReviewId: (v: string | null) => void;
  setReviewName: (v: string) => void;
  setReviewLocation: (v: string) => void;
  setReviewText: (v: string) => void;
  setReviewStars: (v: number) => void;
  setReviewPhone: (v: string) => void;
  onReviewSubmit: () => void;
  onEditReview: (r: Review) => void;
  onDeleteReview: (id: string) => void;
  primary: string;
}

export default function ReviewsSection({
  reviews, reviewsLoading, avgRating, showReviewForm, setShowReviewForm, editingReviewId,
  reviewName, reviewLocation, reviewText, reviewStars, reviewPhone, reviewSubmitting,
  setEditingReviewId, setReviewName, setReviewLocation, setReviewText, setReviewStars, setReviewPhone,
  onReviewSubmit, onEditReview, onDeleteReview, primary,
}: ReviewsSectionProps) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-sm">
      <h2 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"><span className="w-3 h-3 inline-block rounded-sm" style={{ background: "#f50b0b" }} />গ্রাহকের রিভিউ</h2>
      <div className="flex items-center gap-5 p-4 mb-4 border border-gray-100 rounded-sm" style={{ background: "#fffbeb" }}>
        <div className="text-center flex-shrink-0">
          <div className="text-4xl font-black text-gray-800 leading-none">{avgRating.toFixed(1)}</div>
          <div className="flex justify-center gap-0.5 my-1.5">{Array(5).fill(0).map((_, i) => <FaStar key={i} className="text-red-400" style={{ fontSize: "12px" }} />)}</div>
          <div className="text-[10px] text-gray-400">মোট {reviews.length > 0 ? reviews.length : 125} রেটিং</div>
        </div>
        <div className="flex-1">
          {[5,4,3,2,1].map(star => {
            const count = reviews.filter(r => r.stars === star).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : [70,20,6,3,1][5-star];
            return (
              <div key={star} className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 w-3">{star}</span>
                <FaStar className="text-red-400" style={{ fontSize: "9px" }} />
                <div className="flex-1 h-2 bg-gray-100 overflow-hidden rounded-sm"><div className="h-full transition-all rounded-sm" style={{ width: `${pct}%`, background: "#f50b0b" }} /></div>
                <span className="text-[10px] text-gray-400 w-6 text-right">{Math.round(pct)}%</span>
              </div>
            );
          })}
        </div>
      </div>
      {reviewsLoading ? (
        <div className="flex justify-center py-6"><div className="animate-spin rounded-sm h-7 w-7 border-2 border-red-400 border-t-transparent" /></div>
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {reviews.slice(0,6).map((r, i) => (
            <div key={r.id} className="p-4 h-full flex flex-col border border-gray-100 relative group hover:border-red-200 transition-all rounded-sm" style={{ background: "#fafafa" }}>
              {reviewPhone && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onEditReview(r)} className="w-6 h-6 bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-[10px] rounded-sm">✏️</button>
                  <button onClick={() => onDeleteReview(r.id)} className="w-6 h-6 bg-red-50 hover:bg-red-100 flex items-center justify-center text-[10px] rounded-sm">🗑️</button>
                </div>
              )}
              <div className="flex gap-0.5 mb-2">{Array(r.stars).fill(0).map((_, s) => <FaStar key={s} className="text-red-400" style={{ fontSize: "11px" }} />)}</div>
              <p className="text-xs text-gray-600 leading-relaxed flex-1 mb-3 italic">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 flex items-center justify-center text-white text-xs font-black flex-shrink-0 rounded-sm" style={{ background: primary }}>{r.name.charAt(0)}</div>
                <div className="min-w-0"><div className="font-black text-gray-800 text-xs leading-tight truncate">{r.name}</div><div className="text-[10px] text-gray-400">{r.location}</div></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400 text-sm mb-4">এখনো কোনো রিভিউ নেই।</div>
      )}
      {!showReviewForm ? (
        <button onClick={() => { setShowReviewForm(true); setEditingReviewId(null); setReviewName(""); setReviewLocation(""); setReviewText(""); setReviewStars(5); }} className="w-full flex items-center justify-center gap-2 font-bold py-3 border-2 text-sm transition-all hover:bg-red-50 rounded-sm" style={{ color: "#06d937", borderColor: "#f50b0b50" }}><FaStar className="text-red-400" /> আপনার মতামত লিখুন</button>
      ) : (
        <div className="p-4 border border-red-100 rounded-sm" style={{ background: "#fffdf5" }}>
          <h3 className="font-black text-sm text-gray-800 mb-3">{editingReviewId ? "✏️ রিভিউ আপডেট করুন" : "⭐ আপনার মতামত দিন"}</h3>
          <div className="flex gap-1 mb-3">{Array(5).fill(0).map((_, s) => (<button key={s} type="button" onClick={() => setReviewStars(s+1)} className="text-xl hover:scale-110 transition-transform"><FaStar className={s+1 <= reviewStars ? "text-red-400" : "text-gray-200"} /></button>))}</div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input value={reviewName} onChange={e => setReviewName(e.target.value)} className="px-3 py-2.5 text-sm border border-gray-200 bg-white rounded-sm" placeholder="আপনার নাম *" />
            <input value={reviewLocation} onChange={e => setReviewLocation(e.target.value)} className="px-3 py-2.5 text-sm border border-gray-200 bg-white rounded-sm" placeholder="আপনার এলাকা" />
          </div>
          <input value={reviewPhone} onChange={e => setReviewPhone(e.target.value)} className="w-full px-3 py-2.5 text-sm border border-gray-200 bg-white mb-2 rounded-sm" placeholder="মোবাইল নম্বর (ঐচ্ছিক)" />
          <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3} className="w-full px-3 py-2.5 text-sm resize-none border border-gray-200 bg-white mb-3 rounded-sm" placeholder="আপনার মতামত লিখুন *" />
          <div className="flex gap-2">
            <button onClick={onReviewSubmit} disabled={reviewSubmitting} className="flex-1 text-white font-bold py-2.5 text-sm disabled:opacity-50 hover:opacity-90 transition-all rounded-sm" style={{ background: "linear-gradient(135deg,#06d937,#f50b0b)" }}>{reviewSubmitting ? "জমা হচ্ছে..." : editingReviewId ? "আপডেট করুন" : "জমা দিন"}</button>
            <button onClick={() => { setShowReviewForm(false); setEditingReviewId(null); }} className="px-4 py-2.5 text-sm font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-sm">বাতিল</button>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { FaStar, FaPen, FaRegTrashAlt } from "react-icons/fa";
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

const STAR = "#F59E0B";
const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-base text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400";

export default function ReviewsSection({
  reviews,
  reviewsLoading,
  avgRating,
  showReviewForm,
  setShowReviewForm,
  editingReviewId,
  reviewName,
  reviewLocation,
  reviewText,
  reviewStars,
  reviewPhone,
  reviewSubmitting,
  setEditingReviewId,
  setReviewName,
  setReviewLocation,
  setReviewText,
  setReviewStars,
  setReviewPhone,
  onReviewSubmit,
  onEditReview,
  onDeleteReview,
  primary,
}: ReviewsSectionProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-4 flex items-center gap-2.5 text-base font-bold text-gray-900 sm:text-lg">
        <span className="inline-block h-5 w-1 rounded-full" style={{ background: primary }} />
        গ্রাহকের রিভিউ
      </h2>

      {/* Rating summary */}
      <div className="mb-5 flex items-center gap-4 rounded-xl bg-gray-50 p-4 sm:gap-6 sm:p-5">
        <div className="flex-shrink-0 text-center">
          <div className="text-4xl font-extrabold leading-none text-gray-900">{avgRating.toFixed(1)}</div>
          <div className="my-2 flex justify-center gap-0.5">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <FaStar key={i} style={{ fontSize: "12px", color: STAR }} />
              ))}
          </div>
          <div className="text-[11px] text-gray-500">মোট {reviews.length > 0 ? reviews.length : 125} রেটিং</div>
        </div>
        <div className="min-w-0 flex-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.stars === star).length;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : [70, 20, 6, 3, 1][5 - star];
            return (
              <div key={star} className="mb-1.5 flex items-center gap-2 last:mb-0">
                <span className="w-2.5 text-xs font-medium text-gray-600">{star}</span>
                <FaStar style={{ fontSize: "9px", color: STAR }} />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: STAR }} />
                </div>
                <span className="w-8 text-right text-[11px] text-gray-500">{Math.round(pct)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* List */}
      {reviewsLoading ? (
        <div className="flex justify-center py-8">
          <div
            className="h-7 w-7 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: primary, borderTopColor: "transparent" }}
          />
        </div>
      ) : reviews.length > 0 ? (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((r) => (
            <article key={r.id} className="group relative flex h-full flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              {reviewPhone && (
                <div className="absolute right-2.5 top-2.5 flex gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                  <button
                    onClick={() => onEditReview(r)}
                    aria-label="এডিট"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-600 hover:bg-gray-200"
                  >
                    <FaPen />
                  </button>
                  <button
                    onClick={() => onDeleteReview(r.id)}
                    aria-label="ডিলিট"
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-xs text-red-500 hover:bg-red-100"
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              )}
              <div className="mb-2 flex gap-0.5">
                {Array(r.stars)
                  .fill(0)
                  .map((_, s) => (
                    <FaStar key={s} style={{ fontSize: "12px", color: STAR }} />
                  ))}
              </div>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-gray-600">&ldquo;{r.text}&rdquo;</p>
              <div className="flex items-center gap-2.5 border-t border-gray-50 pt-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: primary }}
                >
                  {r.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold leading-tight text-gray-900">{r.name}</div>
                  {r.location && <div className="truncate text-xs text-gray-500">{r.location}</div>}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mb-5 py-6 text-center text-sm text-gray-400">এখনো কোনো রিভিউ নেই।</div>
      )}

      {/* Form */}
      {!showReviewForm ? (
        <button
          onClick={() => {
            setShowReviewForm(true);
            setEditingReviewId(null);
            setReviewName("");
            setReviewLocation("");
            setReviewText("");
            setReviewStars(5);
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-gray-50"
          style={{ color: primary, borderColor: `${primary}60` }}
        >
          <FaStar style={{ color: STAR }} /> আপনার মতামত লিখুন
        </button>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="mb-3 text-sm font-bold text-gray-900">
            {editingReviewId ? "রিভিউ আপডেট করুন" : "আপনার মতামত দিন"}
          </h3>
          <div className="mb-3 flex gap-1">
            {Array(5)
              .fill(0)
              .map((_, s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewStars(s + 1)}
                  aria-label={`${s + 1} স্টার`}
                  className="p-1 text-2xl transition-transform active:scale-110"
                >
                  <FaStar style={{ color: s + 1 <= reviewStars ? STAR : "#E5E7EB" }} />
                </button>
              ))}
          </div>
          <div className="mb-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <input value={reviewName} onChange={(e) => setReviewName(e.target.value)} className={inputCls} placeholder="আপনার নাম *" />
            <input value={reviewLocation} onChange={(e) => setReviewLocation(e.target.value)} className={inputCls} placeholder="আপনার এলাকা" />
          </div>
          <input
            value={reviewPhone}
            onChange={(e) => setReviewPhone(e.target.value)}
            inputMode="tel"
            className={`${inputCls} mb-2.5`}
            placeholder="মোবাইল নম্বর (ঐচ্ছিক)"
          />
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={3}
            className={`${inputCls} mb-3 resize-none`}
            placeholder="আপনার মতামত লিখুন *"
          />
          <div className="flex gap-2">
            <button
              onClick={onReviewSubmit}
              disabled={reviewSubmitting}
              className="h-12 flex-1 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: primary }}
            >
              {reviewSubmitting ? "জমা হচ্ছে..." : editingReviewId ? "আপডেট করুন" : "জমা দিন"}
            </button>
            <button
              onClick={() => {
                setShowReviewForm(false);
                setEditingReviewId(null);
              }}
              className="h-12 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

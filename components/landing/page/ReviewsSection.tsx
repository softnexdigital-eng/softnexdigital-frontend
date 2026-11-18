"use client";

import { useState } from "react";
import { FaStar, FaPen, FaRegTrashAlt, FaPlus, FaCheck, FaChevronLeft, FaChevronRight, FaCommentDots } from "react-icons/fa";
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

const STAR_COLOR = "#F59E0B";
const inputClasses =
  "w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-100";

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
  const displayReviews = reviews.length > 0 ? reviews : [
    { id: "1", name: "Ashish Mojumder", text: "I bought 2 kg of #Chia_Seeds from Falaq Food. The quality was very good and the packaging was premium. Thank you Falaq Food. ❤️❤️", stars: 5, location: "" },
    { id: "2", name: "MD Atiqul Islam", text: "কিছুক্ষণ আগেই হাতে পেলাম পূর্বে অর্ডারকৃত মধু 🥰। এটা অসাধারণ 😍। এটা এতোটাই ভালো যে আবার অর্ডার করলাম গিফট দিবো তাই ❤️", stars: 5, location: "" },
    { id: "3", name: "আব্দুল্লাহ আল হুমাইদী", text: "আলহমদুলিল্লাহ। কিছুদিন পূর্বে চিয়াসীড। এখন দুই কেজি সরিষা মধু। প্রতিটি প্রোডাক্টেই আমি সেটিসফাইড। শুভকামনা রইল Falaq Food এর জন্য... ❤️", stars: 5, location: "" },
  ] as Review[];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, displayReviews.length - 3) : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= displayReviews.length - 3 ? 0 : prev + 1));
  };

  return (
    <section className="bg-transparent py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">CUSTOMER REVIEWS</span>
          <h2 className="mt-1 text-xl font-black text-gray-900 sm:text-2xl">আমাদের গ্রাহকদের অভিজ্ঞতা</h2>
        </div>
        
        {!showReviewForm && (
          <button
            onClick={() => {
              setShowReviewForm(true);
              setEditingReviewId(null);
              setReviewName("");
              setReviewLocation("");
              setReviewText("");
              setReviewStars(5);
            }}
            className="relative group flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 animate-pulse"
            style={{ 
              background: primary,
              boxShadow: `0 10px 25px -5px ${primary}50`
            }}
          >
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <FaCommentDots className="text-base animate-bounce" /> 
            আপনার মতামত লিখুন (ক্লিক করুন)
          </button>
        )}
      </div>

      {/* Form Card */}
      {showReviewForm && (
        <div className="mb-10 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xl animate-fadeIn">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900">
              {editingReviewId ? "রিভিউ আপডেট করুন" : "আপনার মূল্যবান মতামত দিন"}
            </h3>
            <button
              onClick={() => {
                setShowReviewForm(false);
                setEditingReviewId(null);
              }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              ✕ বন্ধ করুন
            </button>
          </div>

          <div className="mb-4 flex items-center gap-1">
            <span className="mr-2 text-xs font-medium text-gray-600">রেটিং দিন:</span>
            {Array(5)
              .fill(0)
              .map((_, s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setReviewStars(s + 1)}
                  aria-label={`${s + 1} স্টার`}
                  className="p-1 text-2xl transition-transform active:scale-125"
                >
                  <FaStar style={{ color: s + 1 <= reviewStars ? STAR_COLOR : "#E5E7EB" }} />
                </button>
              ))}
          </div>

          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              value={reviewName}
              onChange={(e) => setReviewName(e.target.value)}
              className={inputClasses}
              placeholder="আপনার নাম *"
            />
            <input
              value={reviewLocation}
              onChange={(e) => setReviewLocation(e.target.value)}
              className={inputClasses}
              placeholder="আপনার এলাকা (যেমন: ঢাকা)"
            />
          </div>

          <input
            value={reviewPhone}
            onChange={(e) => setReviewPhone(e.target.value)}
            inputMode="tel"
            className={`${inputClasses} mb-3`}
            placeholder="মোবাইল নম্বর (ঐচ্ছিক)"
          />

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={3}
            className={`${inputClasses} mb-4 resize-none`}
            placeholder="পণ্য বা সার্ভিস সম্পর্কে আপনার অভিজ্ঞতা বিস্তারিত লিখুন *"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={onReviewSubmit}
              disabled={reviewSubmitting}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: primary }}
            >
              {reviewSubmitting ? (
                "জমা হচ্ছে..."
              ) : (
                <>
                  <FaCheck className="text-xs" /> {editingReviewId ? "আপডেট করুন" : "রিভিউ জমা দিন"}
                </>
              )}
            </button>
            <button
              onClick={() => {
                setShowReviewForm(false);
                setEditingReviewId(null);
              }}
              className="h-12 rounded-xl border border-gray-200 bg-gray-50 px-6 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Slider Section - Transparent Background & No Border on Cards */}
      {reviewsLoading ? (
        <div className="flex justify-center py-12">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: primary, borderTopColor: "transparent" }}
          />
        </div>
      ) : (
        <div className="relative px-2 sm:px-10">
          {/* Left Arrow */}
          <button
            onClick={prevSlide}
            aria-label="Previous"
            className="absolute -left-2 sm:left-1 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all hover:bg-gray-50 active:scale-95"
          >
            <FaChevronLeft className="text-sm" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={nextSlide}
            aria-label="Next"
            className="absolute -right-2 sm:right-1 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition-all hover:bg-gray-50 active:scale-95"
          >
            <FaChevronRight className="text-sm" />
          </button>

          {/* Cards Container with Transparent BG and Removed Borders */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {displayReviews.slice(currentIndex, currentIndex + 3).map((r) => (
              <article
                key={r.id}
                className="group relative flex flex-col items-center text-center rounded-3xl bg-white/60 backdrop-blur-sm p-6 shadow-sm transition-all hover:bg-white hover:shadow-md border-0"
              >
                {reviewPhone && (
                  <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => onEditReview(r)}
                      aria-label="এডিট"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-600 hover:bg-gray-200"
                    >
                      <FaPen />
                    </button>
                    <button
                      onClick={() => onDeleteReview(r.id)}
                      aria-label="ডিলিট"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-xs text-red-500 hover:bg-red-100"
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                )}

                {/* Circular Avatar */}
                <div className="mb-4 h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md">
                  <div
                    className="flex h-full w-full items-center justify-center text-lg font-bold text-white"
                    style={{ background: primary }}
                  >
                    {r.name.charAt(0)}
                  </div>
                </div>

                {/* Stars */}
                <div className="mb-4 flex justify-center gap-1">
                  {Array(r.stars || 5)
                    .fill(0)
                    .map((_, s) => (
                      <FaStar key={s} style={{ fontSize: "14px", color: STAR_COLOR }} />
                    ))}
                </div>

                {/* Review Text */}
                <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-600">&ldquo;{r.text}&rdquo;</p>

                {/* Name */}
                <div className="border-t border-gray-100/80 pt-4 w-full">
                  <div className="text-sm font-bold text-gray-900">{r.name}</div>
                  {r.location && <div className="text-xs text-gray-400">{r.location}</div>}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
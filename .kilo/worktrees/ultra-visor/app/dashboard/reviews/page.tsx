"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { FaStar, FaTrash, FaCheck, FaTimes, FaSearch, FaSpinner } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

interface Review {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  text: string;
  stars: number;
  phone?: string;
  approved: boolean;
  createdAt: string;
}

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tenantId = user?.tenantId;

  const fetchReviews = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      let url = `/reviews/${tenantId}?page=${page}&limit=20`;
      if (filter === "approved") url += "&approved=true";
      else if (filter === "pending") url += "&approved=false";
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;

      const res = await api.get(url);
      if (res.data.success) {
        setReviews(res.data.data);
        setTotalPages(res.data.pages || 1);
      }
    } catch {
      showToast.error("রিভিউ লোড করতে সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }, [tenantId, page, filter, search]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleApproval = async (id: string) => {
    setTogglingId(id);
    try {
      const res = await api.patch(`/reviews/${id}/toggle-approval`);
      if (res.data.success) {
        setReviews(prev =>
          prev.map(r => (r.id === id ? { ...r, approved: !r.approved } : r))
        );
        showToast.success("স্টেটাস আপডেট হয়েছে");
      }
    } catch {
      showToast.error("আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("আপনি কি এই রিভিউটি ডিলিট করতে চান?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r.id !== id));
      showToast.success("রিভিউ ডিলিট হয়েছে");
    } catch {
      showToast.error("ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#111827", marginBottom: "0.25rem" }}>
          ⭐ গ্রাহক রিভিউ
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          মোট {reviews.length}টি রিভিউ
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "0.75rem",
        marginBottom: "1.5rem", alignItems: "center",
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <FaSearch style={{
            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
            fontSize: "0.8rem", color: "#9ca3af",
          }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="নাম বা রিভিউ অনুসন্ধান..."
            style={{
              width: "100%", padding: "0.625rem 0.875rem 0.625rem 2.25rem",
              borderRadius: "0.5rem", border: "1.5px solid #e5e7eb",
              fontSize: "0.875rem", outline: "none", fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filter buttons */}
        {(["all", "approved", "pending"] as const).map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            style={{
              padding: "0.5rem 1rem", borderRadius: "2rem", border: "none",
              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
              background: filter === f ? "#1a56db" : "#f3f4f6",
              color: filter === f ? "#fff" : "#374151",
              transition: "all .15s",
            }}
          >
            {f === "all" ? "সব" : f === "approved" ? "অ্যাপ্রুভড" : "পেন্ডিং"}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <FaSpinner style={{ fontSize: "1.5rem", color: "#1a56db", animation: "spin 1s linear infinite" }} />
        </div>
      ) : reviews.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "3rem", color: "#9ca3af",
          background: "#f9fafb", borderRadius: "0.75rem", border: "1px dashed #e5e7eb",
        }}>
          <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💬</p>
          <p>কোনো রিভিউ পাওয়া যায়নি</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {reviews.map(review => (
            <div
              key={review.id}
              style={{
                background: "#fff", borderRadius: "0.75rem", padding: "1rem 1.25rem",
                border: `1px solid ${review.approved ? "#d1fae5" : "#fef3c7"}`,
                borderLeft: `4px solid ${review.approved ? "#10b981" : "#f50b0b"}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "all .15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                {/* Left: Review content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Stars */}
                  <div style={{ display: "flex", gap: "2px", marginBottom: "0.375rem" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar
                        key={i}
                        style={{
                          fontSize: "0.8rem",
                          color: i < review.stars ? "#f50b0b" : "#d1d5db",
                        }}
                      />
                    ))}
                    <span style={{ fontSize: "0.72rem", color: "#6b7280", marginLeft: "0.5rem" }}>
                      {review.stars}/5
                    </span>
                  </div>

                  {/* Review text */}
                  <p style={{
                    fontSize: "0.875rem", color: "#374151", lineHeight: 1.6,
                    marginBottom: "0.5rem",
                  }}>
                    &ldquo;{review.text}&rdquo;
                  </p>

                  {/* Name & location */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#111827" }}>
                      {review.name}
                    </span>
                    {review.location && (
                      <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>
                        — {review.location}
                      </span>
                    )}
                    <span style={{ fontSize: "0.68rem", color: "#d1d5db" }}>•</span>
                    <span style={{ fontSize: "0.68rem", color: "#9ca3af" }}>
                      {formatDate(review.createdAt)}
                    </span>
                    {review.phone && (
                      <>
                        <span style={{ fontSize: "0.68rem", color: "#d1d5db" }}>•</span>
                        <span style={{ fontSize: "0.68rem", color: "#9ca3af" }}>
                          📱 {review.phone}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  {/* Approve/Disable button */}
                  <button
                    onClick={() => handleToggleApproval(review.id)}
                    disabled={togglingId === review.id}
                    title={review.approved ? "ডিসেবল" : "অ্যাপ্রুভ"}
                    style={{
                      width: 36, height: 36, borderRadius: "0.5rem", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", transition: "all .15s", fontFamily: "inherit",
                      background: review.approved ? "#fef3c7" : "#d1fae5",
                      color: review.approved ? "#06d937" : "#059669",
                      opacity: togglingId === review.id ? 0.5 : 1,
                    }}
                  >
                    {togglingId === review.id ? (
                      <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: "0.75rem" }} />
                    ) : review.approved ? (
                      <FaTimes style={{ fontSize: "0.75rem" }} />
                    ) : (
                      <FaCheck style={{ fontSize: "0.75rem" }} />
                    )}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    title="ডিলিট"
                    style={{
                      width: 36, height: 36, borderRadius: "0.5rem", border: "none",
                      cursor: "pointer", display: "flex", alignItems: "center",
                      justifyContent: "center", transition: "all .15s", fontFamily: "inherit",
                      background: "#fef2f2", color: "#ef4444",
                      opacity: deletingId === review.id ? 0.5 : 1,
                    }}
                  >
                    {deletingId === review.id ? (
                      <FaSpinner style={{ animation: "spin 1s linear infinite", fontSize: "0.75rem" }} />
                    ) : (
                      <FaTrash style={{ fontSize: "0.75rem" }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Status badge */}
              <div style={{ marginTop: "0.5rem" }}>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "0.25rem",
                    fontSize: "0.68rem", fontWeight: 600, padding: "0.2rem 0.625rem",
                    borderRadius: "2rem",
                    background: review.approved ? "#ecfdf5" : "#fffbeb",
                    color: review.approved ? "#059669" : "#06d937",
                  }}
                >
                  {review.approved ? "✅ অ্যাপ্রুভড" : "⏳ পেন্ডিং"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              style={{
                width: 36, height: 36, borderRadius: "0.5rem", border: "none",
                fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
                fontFamily: "inherit",
                background: page === i + 1 ? "#1a56db" : "#f3f4f6",
                color: page === i + 1 ? "#fff" : "#374151",
                transition: "all .15s",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
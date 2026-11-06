"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { showToast } from "@/lib/toast";
import api from "@/lib/api";
import { Banner } from "@/types";
import { FiImage, FiEdit, FiTrash2 } from "react-icons/fi";

interface Category {
  id: string;
  name: string;
  slug: string;
}

type BannerFormData = {
  imageUrl: string;
  title?: string;
  description?: string;
  categoryId?: string;
  linkUrl?: string;
  isActive: boolean;
  sortOrder: number;
};

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BannerFormData>({
    defaultValues: {
      isActive: true,
      sortOrder: 0,
    }
  });

  const fetchBanners = useCallback(async () => {
    try {
      const res = await api.get("/banners");
      if (res.data.success) {
        setBanners(res.data.data);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load banners";
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/banners/categories");
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    fetchCategories();
  }, [fetchBanners, fetchCategories]);

  const onSubmit = async (formData: BannerFormData) => {
    try {
      if (editingId) {
        const res = await api.put(`/banners/${editingId}`, formData);
        if (res.data.success) {
          showToast.success("Banner updated successfully");
          setEditingId(null);
          setShowForm(false);
          reset();
          fetchBanners();
        }
      } else {
        const res = await api.post("/banners", formData);
        if (res.data.success) {
          showToast.success("Banner created successfully");
          setShowForm(false);
          reset();
          fetchBanners();
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operation failed";
      showToast.error(message);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setShowForm(true);
    reset({
      imageUrl: banner.imageUrl,
      title: banner.title || "",
      description: banner.description || "",
      categoryId: banner.categoryId || "",
      linkUrl: banner.linkUrl || "",
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const res = await api.delete(`/banners/${id}`);
      if (res.data.success) {
        showToast.success("Banner deleted successfully");
        fetchBanners();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      showToast.error(message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowForm(false);
    reset();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl">
        {/* Hero-style Banner Preview */}
        {banners.length > 0 && (
          <div className="relative bg-black mb-8 overflow-hidden" style={{ height: '400px' }}>
            <div className="absolute inset-0">
              <img
                src={banners[0].imageUrl}
                alt={banners[0].title || "Hero Banner"}
                className="w-full h-full object-cover opacity-80"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/1200x400?text=Hero+Banner";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            </div>
            <div className="relative z-10 h-full flex items-center">
              <div className="px-8 md:px-12 max-w-3xl">
                {banners[0].title && (
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                    {banners[0].title}
                  </h2>
                )}
                {banners[0].description && (
                  <p className="text-lg md:text-xl text-white/90 mb-6 drop-shadow-md">
                    {banners[0].description}
                  </p>
                )}
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    banners[0].isActive 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/50'
                  }`}>
                    {banners[0].isActive ? '● Active' : '● Inactive'}
                  </span>
                  {banners[0].category && (
                    <span className="px-4 py-2 rounded-full text-sm font-bold bg-white/10 text-white border border-white/20">
                      {banners[0].category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Banner Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your promotional banners and hero sections</p>
          </div>
          {!showForm && (
            <button
              onClick={() => { setShowForm(true); setEditingId(null); reset(); }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-md"
            >
              + Add New Banner
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editingId ? "Edit Banner" : "Create New Banner"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Image URL *
                  </label>
                  <input
                    {...register("imageUrl", { required: "Image URL is required" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://example.com/banner.jpg"
                  />
                  {errors.imageUrl && (
                    <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    {...register("title")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Banner title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    {...register("description")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Banner description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Category (Optional)
                  </label>
                  <select
                    {...register("categoryId")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">None (use external link)</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    When category is selected, clicking banner will filter products by this category
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    External Link URL
                  </label>
                  <input
                    {...register("linkUrl")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://example.com (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used if no category is selected
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    {...register("sortOrder", { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("isActive")}
                      className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  {editingId ? "Update Banner" : "Create Banner"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banners Grid - Hero Card Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {banners.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-md p-6 text-center border-b-red-600">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiImage className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-800 mb-2">No banners yet</p>
                <p className="text-sm text-gray-500 mb-6">Create your first banner to get started</p>
                <button
                  onClick={() => { setShowForm(true); setEditingId(null); reset(); }}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-md"
                >
                  + Create First Banner
                </button>
              </div>
            </div>
          ) : (
            banners.map((banner) => (
              <div
                key={banner.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl ${
                  banner.isActive ? "border-2 border-gray-200" : "border-2 border-gray-100 opacity-70"
                }`}
              >
                {/* Hero-style banner preview */}
                <div className="relative h-48 bg-gray-900 overflow-hidden group">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title || "Banner"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x250?text=Invalid+Image";
                    }}
                  />
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <span className="text-white font-bold text-sm bg-red-500 px-4 py-2 rounded-full shadow-lg">
                        Inactive
                      </span>
                    </div>
                  )}
                  {/* Action buttons overlay */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg shadow-lg transition-colors"
                      title="Edit Banner"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg shadow-lg transition-colors"
                      title="Delete Banner"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Banner details */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 text-lg truncate flex-1">
                      {banner.title || "Untitled Banner"}
                    </h3>
                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                      banner.isActive 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      {banner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {banner.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {banner.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-4">
                    {banner.category && (
                      <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-medium">
                        {banner.category.name}
                      </span>
                    )}
                    {banner.linkUrl && !banner.category && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-medium">
                        External Link
                      </span>
                    )}
                    <span className="text-gray-400 font-mono">Sort: {banner.sortOrder}</span>
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Edit Banner
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
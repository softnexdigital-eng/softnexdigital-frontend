"use client";

import { useState } from "react";
import { FaCloudUploadAlt, FaTimes, FaCheckCircle } from "react-icons/fa";
import { uploadImage, uploadImages } from "@/lib/upload";

interface ImageUploadProps {
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  onChangeSingle?: (value: string) => void;
  multiple?: boolean;
  folder?: string;
  label?: string;
  accept?: string;
  maxFiles?: number;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  multiple = false,
  folder = "ecom",
  label = "ছবি আপলোড করুন",
  accept = "image/*",
  maxFiles = 10,
  className,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filesToArray = (v: string | string[] | undefined): string[] => {
    if (!v) return [];
    return Array.isArray(v) ? v : [v];
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      if (multiple) {
        const filesArray = Array.from(files).slice(0, 10);
        const urls = await uploadImages(Array.from(files), folder, 10);
        const newUrls = [...filesToArray(value), ...urls];
        setPreview(newUrls);
        onChange(newUrls);
      } else {
        const file = files[0];
        const url = await uploadImage(file, folder);
        setPreview(url);
        onChange(url);
      }
      setError(null);
    } catch (err) {
      setError("ছবি আপলোড ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (urlToRemove: string) => {
    const current = filesToArray(value);
    const filtered = current.filter((u) => u !== urlToRemove);
    setPreview(multiple ? filtered : "");
    onChange(multiple ? filtered : "");
  };

  const previewList = filesToArray(value);

  const inputId = "upload-" + Math.random();

  return (
    <div className={"space-y-3 " + (className || "")}>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>

      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleUpload}
        disabled={uploading}
        className="sr-only"
        id={inputId}
      />

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>আপলোড হচ্ছে...</span>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Preview */}
      {previewList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {previewList.map((url, idx) => (
            <div key={url + "-" + idx} className="relative group">
              <div className="aspect-square relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={url}
                  alt={"Uploaded image " + (idx + 1)}
                  className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-80"
                  loading="lazy"
                />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500/90 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="ছবি মুছুন"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
          </div>
         ))}
       </div>
       )}

      <label
        htmlFor={inputId}
        className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--primary,#e11d48)" }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16l-2.83-2.83a2 2 0 012.83 0L21 12" />
        </svg>
        <span>{label}</span>
      </label>
    </div>
  );
}
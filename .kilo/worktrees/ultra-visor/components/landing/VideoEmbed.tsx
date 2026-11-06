"use client";

import { useRef } from "react";

interface VideoEmbedProps {
  videoUrl?: string;
}

/**
 * Renders a responsive video embed (YouTube, Facebook, or direct video).
 * Falls back to a placeholder if no videoUrl is provided.
 */
export default function VideoEmbed({ videoUrl }: VideoEmbedProps) {
  const ref = useRef<HTMLIFrameElement>(null);

  if (!videoUrl) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#64748b",
          fontSize: "0.875rem",
          borderRadius: "0.5rem",
        }}
      >
        No Video
      </div>
    );
  }

  // YouTube URL detection
  const youtubeMatch = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  // Facebook video URL detection
  const facebookMatch = videoUrl.match(/facebook\.com\/.*\/videos\/(\d+)/);

  if (youtubeMatch) {
    return (
      <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
        <iframe
          ref={ref}
          src={`https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "0.5rem",
          }}
        />
      </div>
    );
  }

  if (facebookMatch) {
    return (
      <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
        <iframe
          ref={ref}
          src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(videoUrl)}&show_text=false`}
          title="Facebook video player"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "0.5rem",
          }}
        />
      </div>
    );
  }

  // Default: try to render as a direct video source (mp4, webm, etc.)
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "1" }}>
      <video
        controls
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          borderRadius: "0.5rem",
          objectFit: "cover",
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
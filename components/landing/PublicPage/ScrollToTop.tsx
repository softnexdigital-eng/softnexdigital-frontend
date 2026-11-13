"use client";

import { useEffect, useState } from "react";
import { FiChevronUp } from "react-icons/fi";

const CIRCUMFERENCE = 2 * Math.PI * 19;

export default function ScrollToTop() {
  const [scrollState, setScrollState] = useState({ visible: false, progress: 0 });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        setScrollState({
          visible: window.scrollY > 600,
          progress: scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0,
        });
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="উপরে যান"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      className={`landing-scroll-top ${
        scrollState.visible ? "landing-scroll-top-visible" : ""
      }`}
    >
      <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
        <circle cx="22" cy="22" r="19" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="2" />
        <circle
          cx="22"
          cy="22"
          r="19"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - scrollState.progress)}
          strokeLinecap="round"
        />
      </svg>
      <FiChevronUp aria-hidden="true" size={20} />
    </button>
  );
}

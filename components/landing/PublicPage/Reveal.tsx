"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealDirection = "left" | "right" | "up";

interface RevealProps {
  children: ReactNode;
  direction?: RevealDirection;
  delay?: number;
  scale?: boolean;
  className?: string;
}

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  scale = false,
  className = "",
}: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      element.dataset.visible = "true";
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.visible = "true";
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const translation = direction === "left"
    ? "translate3d(-28px, 0, 0)"
    : direction === "right"
      ? "translate3d(28px, 0, 0)"
      : "translate3d(0, 24px, 0)";

  return (
    <div
      ref={elementRef}
      className={`landing-reveal ${className}`}
      data-visible={visible}
      style={{
        transitionDelay: `${delay}ms`,
        transform: visible ? (scale ? "scale(1.025)" : "translate3d(0, 0, 0)") : `${translation}${scale ? " scale(0.97)" : ""}`,
      }}
    >
      {children}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { LANDING_SECTIONS } from "./sections";
import type { LandingSectionId } from "./sections";

interface SectionDockProps {
  activeId: string;
  passedIds: string[];
}

export default function SectionDock({ activeId, passedIds }: SectionDockProps) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const chipRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    const hero = document.getElementById("home");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollableHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        setProgress(scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0);
      });
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  useEffect(() => {
    if (!activeId || activeId === "home") return;
    chipRefs.current.get(activeId)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeId]);

  const scrollToSection = (id: LandingSectionId) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <div className="landing-dock-slot" aria-hidden={heroVisible}>
      <nav
        aria-label="সেকশন"
        className={`landing-section-dock ${heroVisible ? "landing-dock-hidden" : ""}`}
      >
        <div className="landing-dock-scroll">
          {LANDING_SECTIONS.map((section) => {
            const isPassed = passedIds.includes(section.id);
            return (
              <button
                key={section.id}
                ref={(element) => {
                  if (element) chipRefs.current.set(section.id, element);
                  else chipRefs.current.delete(section.id);
                }}
                type="button"
                disabled={!isPassed}
                aria-hidden={!isPassed}
                aria-current={activeId === section.id ? "location" : undefined}
                onClick={() => scrollToSection(section.id)}
                className={`landing-dock-chip ${
                  isPassed ? "" : "landing-dock-chip-hidden"
                } ${
                  activeId === section.id && isPassed ? "landing-dock-chip-active" : ""
                }`}
              >
                {section.label}
              </button>
            );
          })}
        </div>
        <span
          className="landing-dock-progress"
          style={{ transform: `scaleX(${progress})` }}
        />
      </nav>
    </div>
  );
}

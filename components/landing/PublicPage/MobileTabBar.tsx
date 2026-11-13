"use client";

import Link from "next/link";
import { FiCreditCard, FiHelpCircle, FiHome, FiLayers, FiPlus } from "react-icons/fi";
import { LANDING_SECTIONS } from "./sections";

const TABS = [
  { id: "home", label: "হোম", icon: FiHome },
  { id: "features", label: "ফিচার", icon: FiLayers },
  { id: "register", label: "রেজিস্ট্রেশন", icon: null },
  { id: "pricing", label: "প্যাকেজ", icon: FiCreditCard },
  { id: "faq", label: "প্রশ্ন", icon: FiHelpCircle },
] as const;

export default function MobileTabBar({ activeId }: { activeId: string }) {
  const scrollTo = (id: string) => {
    const targetId = id === "home"
      ? "home"
      : LANDING_SECTIONS.find((section) => section.id === id)?.id;
    if (!targetId) return;
    document.getElementById(targetId)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };

  return (
    <nav aria-label="প্রধান নেভিগেশন" className="landing-mobile-bar md:hidden">
      {TABS.map((tab) => {
        if (tab.id === "register") {
          return (
            <Link
              key={tab.id}
              href="/auth/login"
              className="landing-mobile-tab landing-mobile-register"
            >
              <span className="landing-mobile-register-icon">
                <FiPlus aria-hidden="true" size={22} />
              </span>
              <span>{tab.label}</span>
            </Link>
          );
        }
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={activeId === tab.id ? "page" : undefined}
            onClick={() => scrollTo(tab.id)}
            className={`landing-mobile-tab ${
              activeId === tab.id ? "landing-mobile-tab-active" : ""
            }`}
          >
            <Icon aria-hidden="true" size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

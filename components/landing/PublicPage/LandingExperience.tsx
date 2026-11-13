"use client";

import { type ReactNode } from "react";
import { LANDING_SECTIONS } from "./sections";
import { useScrollSpy } from "./useScrollSpy";
import SectionDock from "./SectionDock";
import ScrollToTop from "./ScrollToTop";
import MobileTabBar from "./MobileTabBar";

const SECTION_IDS = LANDING_SECTIONS.map((section) => section.id);

export default function LandingExperience({ children }: { children: ReactNode }) {
  const { activeId, passedIds } = useScrollSpy(SECTION_IDS);

  return (
    <>
      <SectionDock activeId={activeId} passedIds={passedIds} />
      {children}
      <ScrollToTop />
      <MobileTabBar activeId={activeId} />
    </>
  );
}

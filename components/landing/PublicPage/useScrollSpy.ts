"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollSpyState {
  activeId: string;
  passedIds: string[];
}

export function useScrollSpy(ids: readonly string[]): ScrollSpyState {
  const [state, setState] = useState<ScrollSpyState>({
    activeId: "home",
    passedIds: [],
  });
  const stateRef = useRef(state);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const observedElements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    if (observedElements.length === 0) return;

    const getOffset = () => {
      const navHeight = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
      );
      const dockHeight = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--dock-h"),
      );
      return (Number.isFinite(navHeight) ? navHeight : 64) +
        (Number.isFinite(dockHeight) ? dockHeight : 48);
    };

    const update = () => {
      const offset = getOffset();
      const passedIds = observedElements
        .filter((element) => element.getBoundingClientRect().top <= offset)
        .map((element) => element.id);
      const activeId = passedIds[passedIds.length - 1] || "home";
      const previous = stateRef.current;
      if (
        previous.activeId === activeId &&
        previous.passedIds.length === passedIds.length &&
        previous.passedIds.every((id, index) => id === passedIds[index])
      ) {
        return;
      }
      const nextState = { activeId, passedIds };
      stateRef.current = nextState;
      setState(nextState);
    };

    const connectObserver = () => {
      observer?.disconnect();
      const offset = getOffset();
      const remainingHeight = Math.max(0, window.innerHeight - offset - 1);
      observer = new IntersectionObserver(update, {
        rootMargin: `-${Math.round(offset)}px 0px -${Math.round(remainingHeight)}px 0px`,
        threshold: 0,
      });
      observedElements.forEach((element) => observer?.observe(element));
    };

    connectObserver();
    window.addEventListener("resize", connectObserver);
    const navbar = document.querySelector<HTMLElement>("[data-landing-navbar]");
    const resizeObserver = navbar
      ? new ResizeObserver(connectObserver)
      : null;
    if (navbar) resizeObserver?.observe(navbar);

    return () => {
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", connectObserver);
    };
  }, [ids]);

  return state;
}

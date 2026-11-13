"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface SnapCarouselProps {
  children: ReactNode;
  className: string;
  role?: "list";
}

export default function SnapCarousel({
  children,
  className,
  role,
}: SnapCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let frame = 0;
    const updateActiveItem = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const containerLeft = container.getBoundingClientRect().left;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;
        Array.from(container.children).forEach((item, index) => {
          const distance = Math.abs(item.getBoundingClientRect().left - containerLeft);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        setActiveIndex(closestIndex);
      });
    };
    container.addEventListener("scroll", updateActiveItem, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", updateActiveItem);
    };
  }, [items.length]);

  const enhancedItems = items.map((item) => {
    if (!isValidElement<{ className?: string }>(item)) return item;
    return cloneElement(item, {
      className: [
        item.props.className,
        "w-[84%] shrink-0 snap-center md:w-auto md:shrink md:snap-align-none",
      ]
        .filter(Boolean)
        .join(" "),
    });
  });

  return (
    <>
      <div
        ref={containerRef}
        role={role}
        className={`-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:gap-5 md:overflow-visible md:px-0 md:pb-0 ${className}`}
      >
        {enhancedItems}
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5 md:hidden" aria-label="কার্ড নির্দেশক">
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`কার্ড ${index + 1}`}
              aria-current={activeIndex === index ? "true" : undefined}
              onClick={() => {
                const item = containerRef.current?.children[index];
                if (!item) return;
                containerRef.current?.scrollTo({
                  left: item.getBoundingClientRect().left -
                    (containerRef.current.getBoundingClientRect().left),
                  behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth",
                });
              }}
              className={`h-1.5 rounded-full transition-all ${
                activeIndex === index ? "w-5 bg-red-600" : "w-1.5 bg-zinc-300"
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}

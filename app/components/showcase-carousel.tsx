"use client";

import { useRef, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ShowcaseCarousel() {
  const showcaseImages = useQuery(api.showcase.list);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    // RTL: scrollLeft is negative
    const scrollLeft = Math.abs(el.scrollLeft);
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < maxScroll - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [showcaseImages]);

  // Auto-scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !showcaseImages?.length) return;

    let paused = false;
    const interval = setInterval(() => {
      if (paused) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const scrollLeft = Math.abs(el.scrollLeft);
      if (scrollLeft >= maxScroll - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // RTL: scroll in negative direction
        el.scrollBy({ left: -300, behavior: "smooth" });
      }
    }, 4000);

    const handleMouseEnter = () => { paused = true; };
    const handleMouseLeave = () => { paused = false; };
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearInterval(interval);
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [showcaseImages]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    // RTL: "left" button scrolls content visually left (positive scrollBy)
    const amount = direction === "left" ? 320 : -320;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (!showcaseImages || showcaseImages.length === 0) return null;

  return (
    <section className="py-16 md:py-24 px-4 border-t border-card-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            أمثلة من <span className="text-gradient">إبداعات عملائنا</span>
          </h2>
          <p className="text-muted text-lg">تصاميم حقيقية تم إنشاؤها بالذكاء الاصطناعي</p>
        </div>

        <div className="relative group">
          {/* Navigation buttons */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface-1/90 backdrop-blur-sm border border-card-border rounded-full flex items-center justify-center text-muted hover:text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2"
            >
              <ChevronRight size={20} />
            </button>
          )}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface-1/90 backdrop-blur-sm border border-card-border rounded-full flex items-center justify-center text-muted hover:text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-x-2"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Scrollable row */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {showcaseImages.map((img) => (
              <div
                key={img._id}
                className="flex-shrink-0 w-[260px] md:w-[300px] snap-start"
              >
                <div className="relative rounded-2xl overflow-hidden border border-card-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-surface-1">
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={img.title || "Showcase poster"}
                      className="w-full aspect-square object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-surface-2 flex items-center justify-center text-muted text-sm">
                      Loading...
                    </div>
                  )}
                  {/* Category badge */}
                  {img.category && (
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {img.category}
                    </div>
                  )}
                </div>
                {img.title && (
                  <p className="mt-2 text-sm text-muted text-center font-medium truncate">{img.title}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

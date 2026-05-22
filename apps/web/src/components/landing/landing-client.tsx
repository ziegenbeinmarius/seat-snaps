"use client";

import { useEffect, useRef, useCallback } from "react";

export function LandingShell({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const parallaxLayers = document.querySelectorAll<HTMLElement>("[data-parallax]");
    parallaxLayers.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || "0.3");
      el.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    const targets = containerRef.current?.querySelectorAll("[data-animate]");
    targets?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-x-hidden">
      {children}
    </div>
  );
}

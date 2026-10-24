"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "locomotive-scroll/dist/locomotive-scroll.css";

gsap.registerPlugin(ScrollTrigger);

const ScrollReadyContext = createContext(0);

export function useScrollReady() {
  return useContext(ScrollReadyContext);
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(0);

  useEffect(() => {
    let destroyed = false;
    let scroll: { destroy: () => void } | undefined;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    setReady(0);
    window.scrollTo(0, 0);

    if (reduced) {
      setReady(1);
      return;
    }

    void import("locomotive-scroll").then(({ default: LocomotiveScroll }) => {
      if (destroyed) return;
      scroll = new LocomotiveScroll({
        lenisOptions: {
          lerp: coarse ? 1 : 0.085,
          smoothWheel: !coarse,
          syncTouch: false,
        },
        scrollCallback: () => {
          ScrollTrigger.update();
        },
      });
      setReady((value) => value + 1);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    return () => {
      destroyed = true;
      scroll?.destroy();
    };
  }, [pathname]);

  useEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.from(element, {
          y: 28,
          autoAlpha: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 90%",
          },
        });
      });
    });

    return () => context.revert();
  }, [pathname, ready]);

  return <ScrollReadyContext.Provider value={ready}>{children}</ScrollReadyContext.Provider>;
}

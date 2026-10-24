"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useScrollReady } from "@/components/motion/smooth-scroll";

gsap.registerPlugin(ScrollTrigger);

export function HomeMotion() {
  const ready = useScrollReady();

  useEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const motion = gsap.matchMedia();

    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from("[data-hero-line]", {
        yPercent: 110,
        duration: 0.95,
        stagger: 0.08,
        ease: "power3.out",
      });
      gsap.from("[data-hero-mark]", {
        scale: 0,
        transformOrigin: "0% 0%",
        duration: 0.7,
        ease: "power3.out",
      });
      gsap.from("[data-hero-photo]", {
        clipPath: "inset(8% 8% 8% 8%)",
        duration: 1.15,
        ease: "power3.out",
      });
      gsap.from("[data-hero-copy], [data-hero-actions]", {
        y: 16,
        autoAlpha: 0,
        duration: 0.7,
        delay: 0.35,
        stagger: 0.08,
        ease: "power3.out",
      });

      gsap.from("[data-supply-rule]", {
        scaleX: 0,
        transformOrigin: "left center",
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-supply]", start: "top 85%" },
      });
      gsap.from("[data-supply-item]", {
        y: 14,
        autoAlpha: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-supply]", start: "top 85%" },
      });

      gsap.to("[data-marquee-track]", {
        xPercent: -50,
        duration: 28,
        ease: "none",
        repeat: -1,
      });

      gsap.from("[data-manifest-row]", {
        y: 22,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-manifest]", start: "top 78%" },
      });

      gsap.utils.toArray<HTMLElement>("[data-reason]").forEach((row) => {
        const rule = row.querySelector("[data-reason-rule]");
        const copy = row.querySelector("[data-reason-copy]");
        if (rule) {
          gsap.from(rule, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: { trigger: row, start: "top 88%" },
          });
        }
        if (copy) {
          gsap.from(copy, {
            y: 12,
            autoAlpha: 0,
            duration: 0.55,
            delay: 0.08,
            ease: "power2.out",
            scrollTrigger: { trigger: row, start: "top 88%" },
          });
        }
      });

      const photo = document.querySelector("[data-parallax-photo]");
      if (photo) {
        gsap.fromTo(
          photo,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-parallax]",
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      gsap.from("[data-steps-line]", {
        scaleX: 0,
        transformOrigin: "left center",
        ease: "none",
        scrollTrigger: {
          trigger: "[data-steps]",
          start: "top 72%",
          end: "bottom 70%",
          scrub: true,
        },
      });

      gsap.from("[data-cta-line]", {
        yPercent: 110,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-cta]", start: "top 82%" },
      });
    });

    motion.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const rail = document.querySelector<HTMLElement>("[data-rail]");
      const pin = document.querySelector<HTMLElement>("[data-rail-pin]");
      if (!rail || !pin) return;

      const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth);
      gsap.to(rail, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top 88px",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.65,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const timer = window.setTimeout(refresh, 500);

    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(timer);
      motion.revert();
    };
  }, [ready]);

  return null;
}

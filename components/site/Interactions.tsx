"use client";

import { useEffect } from "react";

/**
 * Porta el comportamiento del prototipo v1 (scroll reveal, rail de progreso,
 * tabs de camadas, lightbox) a un Client Component. Sin JS de servidor:
 * corre una sola vez montado el DOM, igual que el <script> original.
 */
export default function Interactions() {
  useEffect(() => {
    const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    let io: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io?.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12 }
      );
      revealEls.forEach((el) => io!.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("in"));
    }

    const fill = document.getElementById("railFill");
    const dots = Array.from(document.querySelectorAll<HTMLElement>(".rail-dot"));
    const sections = dots.map((d) => document.querySelector<HTMLElement>(d.dataset.target || ""));

    function onScroll() {
      const doc = document.documentElement;
      const pct = doc.scrollTop / (doc.scrollHeight - doc.clientHeight);
      if (fill) fill.style.height = `${Math.max(0, Math.min(1, pct)) * 100}%`;
      const mid = window.scrollY + window.innerHeight * 0.4;
      let activeIdx = 0;
      sections.forEach((s, i) => {
        if (s && s.offsetTop <= mid) activeIdx = i;
      });
      dots.forEach((d, i) => d.classList.toggle("active", i === activeIdx));
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const dotClickHandlers = dots.map((d) => {
      const handler = () => {
        const t = document.querySelector(d.dataset.target || "");
        t?.scrollIntoView({ behavior: "smooth" });
      };
      d.addEventListener("click", handler);
      return { d, handler };
    });

    const tabs = Array.from(document.querySelectorAll<HTMLElement>(".camada-tab"));
    const tabHandlers = tabs.map((tab) => {
      const handler = () => {
        tabs.forEach((t) => t.classList.remove("active"));
        document.querySelectorAll(".camada-panel").forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        const panel = document.getElementById(tab.dataset.tab || "");
        panel?.classList.add("active");
      };
      tab.addEventListener("click", handler);
      return { tab, handler };
    });

    // Tabs del torneo (por fase) — set independiente de las de camadas, para
    // no desactivarse entre sí si ambas secciones están en la misma página.
    const torneoTabs = Array.from(document.querySelectorAll<HTMLElement>(".torneo-tab"));
    const torneoPanels = Array.from(document.querySelectorAll<HTMLElement>(".torneo-fase-panel"));
    const torneoTabHandlers = torneoTabs.map((tab) => {
      const handler = () => {
        torneoTabs.forEach((t) => t.classList.remove("active"));
        torneoPanels.forEach((p) => p.classList.remove("active"));
        tab.classList.add("active");
        const fase = tab.dataset.fase;
        torneoPanels.find((p) => p.dataset.fasePanel === fase)?.classList.add("active");
      };
      tab.addEventListener("click", handler);
      return { tab, handler };
    });

    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightboxImg") as HTMLImageElement | null;
    const lbVideo = document.getElementById("lightboxVideo") as HTMLVideoElement | null;
    const mediaEls = Array.from(document.querySelectorAll<HTMLElement>("[data-lightbox]"));
    const mediaHandlers = mediaEls.map((el) => {
      const handler = () => {
        const src = el.getAttribute("data-lightbox") || "";
        const isVideo = el.getAttribute("data-lightbox-type") === "video";
        if (isVideo && lbVideo && lbImg) {
          lbImg.style.display = "none";
          lbVideo.style.display = "block";
          lbVideo.src = src;
        } else if (lbImg && lbVideo) {
          lbVideo.style.display = "none";
          lbVideo.pause();
          lbImg.style.display = "block";
          lbImg.src = src;
        }
        lb?.classList.add("open");
      };
      el.addEventListener("click", handler);
      return { el, handler };
    });

    const closeBtn = document.getElementById("lightboxClose");
    const closeLightbox = () => {
      lb?.classList.remove("open");
      lbVideo?.pause();
    };
    closeBtn?.addEventListener("click", closeLightbox);
    const bgHandler = (e: MouseEvent) => {
      if (e.target === lb) closeLightbox();
    };
    lb?.addEventListener("click", bgHandler);
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", escHandler);

    return () => {
      io?.disconnect();
      document.removeEventListener("scroll", onScroll);
      dotClickHandlers.forEach(({ d, handler }) => d.removeEventListener("click", handler));
      tabHandlers.forEach(({ tab, handler }) => tab.removeEventListener("click", handler));
      torneoTabHandlers.forEach(({ tab, handler }) => tab.removeEventListener("click", handler));
      mediaHandlers.forEach(({ el, handler }) => el.removeEventListener("click", handler));
      closeBtn?.removeEventListener("click", closeLightbox);
      lb?.removeEventListener("click", bgHandler as any);
      document.removeEventListener("keydown", escHandler);
    };
  }, []);

  return null;
}

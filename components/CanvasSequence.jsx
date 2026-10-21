"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const TOTAL_FRAMES = 145;
const FRAME_URL = (i) =>
  `https://www.apple.com/105/media/us/airpods-pro/2022/d2a4548c-118e-48bf-bdce-c6d1d4b68e98/anim/hero/large/${String(i).padStart(4, "0")}.png`;

export default function CanvasSequence() {
  const canvasRef = useRef(null);
  const images    = useRef([]);
  const current   = useRef(0);

  /* ── Draw frame N with object-fit:cover maths ── */
  const drawFrame = (n) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = images.current[n];
    if (!img || !img.complete || !img.naturalWidth) return;

    const cw = canvas.width,  ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const r  = Math.max(cw / iw, ch / ih);
    const dx = (cw - iw * r) / 2;
    const dy = (ch - ih * r) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, 0, 0, iw, ih, dx, dy, iw * r, ih * r);
  };

  /* ── Resize canvas to full viewport ── */
  const resize = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
    drawFrame(current.current);
  };

  /* ── Preload all frames ── */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    resize();

    const imgs = [];
    let loaded = 0;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_URL(i + 1);
      img.crossOrigin = "anonymous";
      img.onload = () => {
        loaded++;
        if (i === 0) drawFrame(0); // show frame 1 immediately
      };
      imgs.push(img);
    }
    images.current = imgs;

    window.addEventListener("resize", resize);

    /* ── ScrollTrigger: scroll progress → frame index ── */
    const trigger = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.5,
      onUpdate(self) {
        const n = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.round(self.progress * (TOTAL_FRAMES - 1)))
        );
        if (n !== current.current) {
          current.current = n;
          requestAnimationFrame(() => drawFrame(n));
        }
      },
    });

    return () => {
      window.removeEventListener("resize", resize);
      trigger.kill();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        display: "block",
        background: "#000",
      }}
    />
  );
}
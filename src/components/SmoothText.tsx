import { useLayoutEffect, useRef } from "react";

/** Keep DOM text for layout/selection, then supersample only the visible ink. */
export default function SmoothText({ text }: { text: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const root = rootRef.current!, source = textRef.current!, canvas = canvasRef.current!;
    let cancelled = false;
    let frame = 0;
    async function paint() {
      source.style.opacity = "1";
      canvas.style.visibility = "hidden";
      const css = getComputedStyle(root);
      const font = `${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
      await document.fonts.load(font, text);
      if (cancelled || !root.offsetWidth || !root.offsetHeight) return;
      const bounds = root.getBoundingClientRect();
      const width = parseFloat(css.width), height = parseFloat(css.height);
      const scaleX = bounds.width / width, scaleY = bounds.height / height;
      // Glyph ink can extend beyond its advance box. Never clip it at the
      // rounded DOM dimensions, particularly in the 50% / 75% preview.
      const bleed = 4;
      const node = source.firstChild;
      if (!node) return;
      const lines: { text: string; x: number; y: number }[] = [];
      const range = document.createRange();
      let offset = 0;
      for (const char of text) {
        range.setStart(node, offset); offset += char.length; range.setEnd(node, offset);
        const rect = range.getBoundingClientRect();
        const x = (rect.left - bounds.left) / scaleX, y = (rect.top - bounds.top) / scaleY;
        if (char === "\n") continue;
        const last = lines[lines.length - 1];
        if (last && Math.abs(last.y - y) < .5) last.text += char;
        else lines.push({ text: char, x, y });
      }
      const ratio = Math.max(3, window.devicePixelRatio || 1);
      const sample = ratio * 3;
      const hi = document.createElement("canvas");
      hi.width = Math.ceil((width + bleed * 2) * sample); hi.height = Math.ceil((height + bleed * 2) * sample);
      const ctx = hi.getContext("2d");
      const out = canvas.getContext("2d");
      if (!ctx || !out) return;
      ctx.scale(sample, sample);
      ctx.translate(bleed, bleed);
      ctx.font = font;
      ctx.fillStyle = css.color;
      ctx.textBaseline = "alphabetic";
      ctx.letterSpacing = css.letterSpacing === "normal" ? "0px" : css.letterSpacing;
      const ascent = ctx.measureText("国Mg").fontBoundingBoxAscent;
      for (const line of lines) ctx.fillText(line.text, line.x, line.y + ascent);
      canvas.width = Math.ceil((width + bleed * 2) * ratio); canvas.height = Math.ceil((height + bleed * 2) * ratio);
      out.imageSmoothingEnabled = true; out.imageSmoothingQuality = "high";
      out.drawImage(hi, 0, 0, canvas.width, canvas.height);
      source.style.opacity = "0";
      canvas.style.visibility = "visible";
    }
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { void paint(); }); };
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    // Theme changes can change the inherited ink color without changing dimensions.
    const themeObserver = new MutationObserver(schedule);
    const theme = root.closest(".phone-screen");
    if (theme) themeObserver.observe(theme, { attributes: true, attributeFilter: ["class"] });
    schedule();
    return () => { cancelled = true; cancelAnimationFrame(frame); observer.disconnect(); themeObserver.disconnect(); };
  }, [text]);
  return <span ref={rootRef} className="smooth-text" style={{ display: "block", position: "relative" }}><span ref={textRef}>{text}</span><canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", left: -4, top: -4, width: "calc(100% + 8px)", height: "calc(100% + 8px)", pointerEvents: "none", visibility: "hidden" }} /></span>;
}

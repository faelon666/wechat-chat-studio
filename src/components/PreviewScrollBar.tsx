import { useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from "react";

type Metrics = { left: number; top: number; height: number; max: number; value: number; thumbHeight: number };
const empty: Metrics = { left: 0, top: 0, height: 0, max: 0, value: 0, thumbHeight: 0 };

export default function PreviewScrollBar({ phoneRef, enabled, scale }: { phoneRef: RefObject<HTMLDivElement | null>; enabled: boolean; scale: number }) {
  const railRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef<number | null>(null);
  const [metrics, setMetrics] = useState<Metrics>(empty);

  useLayoutEffect(() => {
    if (!enabled) { setMetrics(empty); return; }
    const scroll = phoneRef.current?.querySelector<HTMLElement>(".chat-scroll");
    const rail = railRef.current;
    if (!scroll || !rail) return;
    const update = () => {
      const wrap = railRef.current?.parentElement?.getBoundingClientRect();
      const rect = scroll.getBoundingClientRect();
      const max = Math.max(0, scroll.scrollHeight - scroll.clientHeight);
      const height = rect.height;
      setMetrics({
        left: rect.right - (wrap?.left ?? 0) + 8,
        top: rect.top - (wrap?.top ?? 0), height, max,
        value: Math.min(max, scroll.scrollTop),
        thumbHeight: max ? Math.max(28, height * scroll.clientHeight / scroll.scrollHeight) : height,
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(scroll);
    const content = scroll.firstElementChild;
    if (content) observer.observe(content);
    scroll.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => { observer.disconnect(); scroll.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [enabled, phoneRef, scale]);

  if (!enabled || metrics.max <= 0) return <div ref={railRef} className="preview-scrollbar-anchor" aria-hidden="true" />;
  const travel = metrics.height - metrics.thumbHeight;
  const thumbTop = travel * metrics.value / metrics.max;
  const scroll = phoneRef.current?.querySelector<HTMLElement>(".chat-scroll");
  const setFromPointer = (clientY: number) => {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect || !scroll || !travel) return;
    const thumbY = Math.max(0, Math.min(travel, clientY - rect.top - (dragOffset.current ?? metrics.thumbHeight / 2)));
    scroll.scrollTop = thumbY / travel * metrics.max;
  };
  const start = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const thumb = (event.target as HTMLElement).closest(".preview-scrollbar-thumb");
    dragOffset.current = thumb ? event.clientY - thumb.getBoundingClientRect().top : metrics.thumbHeight / 2;
    event.currentTarget.setPointerCapture(event.pointerId);
    setFromPointer(event.clientY);
  };
  return <div ref={railRef} className="preview-scrollbar" role="scrollbar" tabIndex={0} aria-label="聊天预览滚动条" aria-controls="preview-chat-scroll" aria-valuemin={0} aria-valuemax={Math.round(metrics.max)} aria-valuenow={Math.round(metrics.value)} style={{ left: metrics.left, top: metrics.top, height: metrics.height }} onPointerDown={start} onPointerMove={event => { if (dragOffset.current !== null) setFromPointer(event.clientY); }} onPointerUp={event => { dragOffset.current = null; event.currentTarget.releasePointerCapture(event.pointerId); }} onPointerCancel={() => { dragOffset.current = null; }} onKeyDown={event => {
    if (!scroll) return;
    const step = event.key === "ArrowDown" ? 40 : event.key === "ArrowUp" ? -40 : event.key === "PageDown" ? scroll.clientHeight : event.key === "PageUp" ? -scroll.clientHeight : null;
    if (step !== null) { event.preventDefault(); scroll.scrollTop += step; }
    if (event.key === "Home" || event.key === "End") { event.preventDefault(); scroll.scrollTop = event.key === "Home" ? 0 : metrics.max; }
  }}><span className="preview-scrollbar-thumb" style={{ top: thumbTop, height: metrics.thumbHeight }} /></div>;
}

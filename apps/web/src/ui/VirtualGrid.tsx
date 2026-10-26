import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

// Only the rows on screen (plus a couple either side) exist in the page. Scroll down and the
// ones above go away; scroll up and they come back. Keeps thousands of previews smooth.
export function VirtualGrid<T>({ items, min = 150, gap = 12, extra = 52, render, keyOf }: {
  items: T[];
  min?: number;
  gap?: number;
  extra?: number;
  render: (item: T, height: number) => ReactNode;
  keyOf: (item: T) => string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [view, setView] = useState({ top: 0, height: 800 });

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let scroller: HTMLElement | null = el.parentElement;
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) scroller = scroller.parentElement;
    const target: HTMLElement | Window = scroller ?? window;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const outer = scroller ? scroller.getBoundingClientRect() : { top: 0, height: innerHeight };
        setView({ top: outer.top - rect.top, height: outer.height });
      });
    };
    update();
    target.addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener("scroll", update);
      removeEventListener("resize", update);
    };
  }, []);

  const cols = Math.max(1, Math.floor((width + gap) / (min + gap)));
  const cardW = width ? (width - gap * (cols - 1)) / cols : min;
  const rowH = cardW + extra + gap;
  const rows = Math.ceil(items.length / cols);
  const first = Math.max(0, Math.floor(view.top / rowH) - 2);
  const last = Math.min(rows, Math.ceil((view.top + view.height) / rowH) + 2);
  const shown = items.slice(first * cols, last * cols);

  return (
    <div ref={box} style={{ position: "relative", height: rows * rowH - gap }}>
      <div style={{ position: "absolute", top: first * rowH, left: 0, right: 0, display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}>
        {shown.map(item => <div key={keyOf(item)} style={{ height: rowH - gap }}>{render(item, rowH - gap)}</div>)}
      </div>
    </div>
  );
}

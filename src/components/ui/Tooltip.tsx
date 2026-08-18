import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  children: ReactNode;
  content: string;
  description?: string;
  side?: "right" | "left" | "top" | "bottom";
  delay?: number;
}

export default function Tooltip({
  children,
  content,
  description,
  side = "right",
  delay = 250,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const calcPos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 12;

    let x = 0;
    let y = 0;

    if (side === "right") {
      x = rect.right + gap;
      y = rect.top + rect.height / 2;
    } else if (side === "left") {
      x = rect.left - gap;
      y = rect.top + rect.height / 2;
    } else if (side === "top") {
      x = rect.left + rect.width / 2;
      y = rect.top - gap;
    } else {
      x = rect.left + rect.width / 2;
      y = rect.bottom + gap;
    }

    setPos({ x, y });
  }, [side]);

  const show = useCallback(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      calcPos();
      setVisible(true);
    }, delay);
  }, [delay, calcPos]);

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  }, []);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const handleScroll = () => hide();
    document.addEventListener("scroll", handleScroll, true);
    return () => document.removeEventListener("scroll", handleScroll, true);
  }, [visible, hide]);

  const origin =
    side === "right"
      ? "origin-left"
      : side === "left"
        ? "origin-right"
        : side === "top"
          ? "origin-bottom"
          : "origin-top";

  return (
    <div
      ref={triggerRef}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible &&
        createPortal(
          <div
            ref={containerRef}
            role="tooltip"
            className={`
              fixed z-[99999] pointer-events-none
              ${origin}
              ${side === "right"
                ? "translate-y-[-50%]"
                : side === "left"
                  ? "-translate-x-full translate-y-[-50%]"
                  : side === "top"
                    ? "-translate-x-1/2 -translate-full"
                    : "-translate-x-1/2"
              }
            `}
            style={{
              left: pos.x,
              top: pos.y,
              transform: `translate(${
                side === "left" ? "-100%" : side === "right" ? "0" : "-50%"
              }, ${
                side === "top" ? "-100%" : side === "bottom" ? "0" : "-50%"
              }) scale(${visible ? 1 : 0.92})`,
              opacity: visible ? 1 : 0,
              transition: "opacity 180ms cubic-bezier(0.16,1,0.3,1), transform 180ms cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {/* Arrow */}
            <div
              className={`absolute ${
                side === "right"
                  ? "left-full top-1/2 -translate-y-1/2 border-y-[5px] border-y-transparent border-r-[5px] border-r-[rgba(22,23,30,0.96)]"
                  : side === "left"
                    ? "right-full top-1/2 -translate-y-1/2 border-y-[5px] border-y-transparent border-l-[5px] border-l-[rgba(22,23,30,0.96)]"
                    : side === "top"
                      ? "bottom-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-[rgba(22,23,30,0.96)]"
                      : "top-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-b-[5px] border-b-[rgba(22,23,30,0.96)]"
              }`}
            />
            {/* Body */}
            <div className="min-w-[130px] max-w-[220px] px-3.5 py-2.5 rounded-xl bg-[rgba(22,23,30,0.96)] backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.03)]">
              <p className="text-[13px] font-medium text-[#F5F7FA] leading-snug whitespace-nowrap">
                {content}
              </p>
              {description && (
                <p className="text-[11px] text-[#6B7280] leading-snug mt-1 whitespace-nowrap">
                  {description}
                </p>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

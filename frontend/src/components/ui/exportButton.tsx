import React, { useEffect, useRef, useState } from "react";

type Props = {
  onPDF: () => void;
  onDocx: () => void;
  label?: string;                 // default "Export"
  size?: "sm" | "md";            // default "md"
  variant?: "brand" | "neutral"; // default "brand"
  className?: string;
};

/**
 * ExportButtons now renders a single button with a small dropdown menu
 * listing "PDF" and "Word". Keeps the same API: onPDF, onDocx.
 */
export const ExportButtons: React.FC<Props> = ({
  onPDF,
  onDocx,
  label = "Export",
  size = "md",
  variant = "brand",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close on click outside / Esc
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current || !btnRef.current) return;
      const target = e.target as Node;
      if (!menuRef.current.contains(target) && !btnRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const baseBtn = "inline-flex items-center gap-2 rounded-md border transition select-none";
  const sizes = size === "sm" ? "px-2.5 py-1.5 text-sm" : "px-3 py-2 text-sm";
  const brand = "border-brand/30 bg-brand/10 text-brand hover:bg-brand/15";
  const neutral = "border-gray-200 bg-white text-slate-700 hover:bg-slate-50";
  const btnStyle = `${baseBtn} ${sizes} ${variant === "brand" ? brand : neutral} ${className}`;

  return (
    <div className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        className={btnStyle}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <i className="bi bi-arrow-down-square" />
        {label}
        <i className={`bi bi-chevron-down transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Export options"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
        >
          <button
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => {
              setOpen(false);
              onPDF();
            }}
          >
            <i className="bi bi-filetype-pdf text-red-600" />
            PDF
          </button>
          <button
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-gray-200 dark:hover:bg-gray-800"
            onClick={() => {
              setOpen(false);
              onDocx();
            }}
          >
            <i className="bi bi-filetype-doc text-brand" />
            Word
          </button>
        </div>
      )}
    </div>
  );
};
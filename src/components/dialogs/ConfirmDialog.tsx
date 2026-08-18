import { useEffect, useRef, useCallback } from "react";
import Button from "../ui/Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const handleClose = useCallback(() => onCancel(), [onCancel]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [handleClose]);

  return (
    <dialog
      ref={dialogRef}
      className="bg-transparent p-4 sm:p-6 w-[min(28rem,calc(100vw-2rem))]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-[#14151C] border border-white/[0.06] rounded-2xl p-5 sm:p-6 shadow-2xl">
        <h2 className="text-base sm:text-lg font-semibold text-[#F5F7FA] mb-2">
          {title}
        </h2>
        <p className="text-sm text-[#6B7280] mb-6 whitespace-pre-wrap leading-relaxed">
          {message}
        </p>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

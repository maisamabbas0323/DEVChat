import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B10]",
          "disabled:pointer-events-none disabled:opacity-40",
          "active:scale-[0.97]",
          {
            "bg-indigo-500 text-white hover:bg-indigo-400 focus-visible:ring-indigo-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30":
              variant === "primary",
            "bg-white/[0.04] text-[#D1D5DB] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] focus-visible:ring-white/20":
              variant === "secondary",
            "text-[#6B7280] hover:text-[#D1D5DB] hover:bg-white/[0.04] focus-visible:ring-white/20":
              variant === "ghost",
            "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:text-red-300 focus-visible:ring-red-500":
              variant === "danger",
          },
          {
            "h-9 px-3 text-xs": size === "sm",
            "h-11 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;

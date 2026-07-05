import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-violet-600/20 text-violet-300",
        secondary: "border-transparent bg-white/10 text-white/70",
        destructive: "border-transparent bg-red-600/20 text-red-300",
        success: "border-transparent bg-emerald-600/20 text-emerald-300",
        warning: "border-transparent bg-yellow-600/20 text-yellow-300",
        outline: "border-white/20 text-white/70",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

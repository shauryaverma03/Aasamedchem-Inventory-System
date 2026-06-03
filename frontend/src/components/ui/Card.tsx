import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className, children, ...props }: CardProps) => (
  <div
    className={cn("bg-white rounded-2xl border border-border shadow-sm p-6", className)}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }: CardProps) => (
  <div className={cn("mb-4", className)} {...props}>{children}</div>
);

export const CardTitle = ({ className, children, ...props }: CardProps) => (
  <h3 className={cn("text-lg font-semibold text-primary", className)} {...props}>{children}</h3>
);

export const CardContent = ({ className, children, ...props }: CardProps) => (
  <div className={cn("", className)} {...props}>{children}</div>
);

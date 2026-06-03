import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "success" | "danger" | "warning" | "info";
}

export const Badge = ({ children, className, variant = "default" }: BadgeProps) => {
  const variants = {
    default: "bg-gray-100 text-gray-700 border border-gray-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    info: "bg-blue-50 text-blue-700 border border-blue-200",
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { variant: BadgeProps["variant"]; dot: string }> = {
    PENDING:   { variant: "warning", dot: "bg-amber-400" },
    APPROVED:  { variant: "success", dot: "bg-emerald-400" },
    REJECTED:  { variant: "danger",  dot: "bg-red-400" },
    COMPLETED: { variant: "info",    dot: "bg-blue-400" },
    EXPIRED:   { variant: "default", dot: "bg-gray-400" },
  };
  const c = config[status] || { variant: "default" as BadgeProps["variant"], dot: "bg-gray-400" };
  return (
    <Badge variant={c.variant}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mr-1.5 inline-block`} />
      {status}
    </Badge>
  );
};

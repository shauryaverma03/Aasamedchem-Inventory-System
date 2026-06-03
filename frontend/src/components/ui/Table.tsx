import React from "react";
import { cn } from "@/lib/utils";

export const Table = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("w-full overflow-x-auto", className)}>
    <table className="w-full text-sm">{children}</table>
  </div>
);

export const Thead = ({ children }: { children: React.ReactNode }) => (
  <thead className="bg-muted border-b border-border">{children}</thead>
);

export const Tbody = ({ children }: { children: React.ReactNode }) => (
  <tbody className="divide-y divide-border">{children}</tbody>
);

export const Th = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={cn("px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground", className)}>
    {children}
  </th>
);

export const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={cn("px-4 py-3 text-gray-700", className)}>{children}</td>
);

export const Tr = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tr className={cn("hover:bg-muted/50 transition-colors", className)}>{children}</tr>
);

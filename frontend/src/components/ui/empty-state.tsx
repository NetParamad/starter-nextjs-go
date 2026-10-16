import * as React from "react";
import { cn } from "@/lib/utils";

export type EmptyStateProps = React.HTMLAttributes<HTMLDivElement> & {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { className, icon, title, description, action, children, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        "bg-card text-card-foreground grid justify-items-center gap-4 rounded-xl border p-8 text-center shadow-sm",
        className,
      )}
      {...props}
    >
      {icon ? (
        <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-full">
          {icon}
        </div>
      ) : null}
      <div className="grid gap-1.5">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        {description ? (
          <p className="text-muted-foreground max-w-sm text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
      {children}
    </div>
  ),
);

EmptyState.displayName = "EmptyState";

export { EmptyState };

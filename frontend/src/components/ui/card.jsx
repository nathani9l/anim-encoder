import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-background shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col space-y-1 p-5 pb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-sm font-medium leading-none tracking-tight", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

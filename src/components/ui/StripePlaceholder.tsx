import { cn } from "@/app/utils/cn";

type Props = {
  className?: string;
  label?: string;
};

export function StripePlaceholder({ className, label }: Props) {
  return (
    <div
      className={cn(
        "stripe-placeholder flex items-center justify-center text-muted",
        className,
      )}
    >
      {label ? <span className="px-3 text-center text-xs">{label}</span> : null}
    </div>
  );
}

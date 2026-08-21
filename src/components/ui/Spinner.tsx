import { cn } from "@/app/utils/cn";

type SpinnerSize = "sm" | "md" | "lg";

type Props = {
  size?: SpinnerSize;
  className?: string;
  label?: string;
};

const SIZE_PX: Record<SpinnerSize, number> = {
  sm: 18,
  md: 22,
  lg: 36,
};

export function Spinner({ size = "md", className, label }: Props) {
  const px = SIZE_PX[size];
  const border = size === "lg" ? 4 : 3;

  return (
    <span
      className={cn("app-spinner", className)}
      role="status"
      aria-label={label}
      aria-hidden={!label}
      style={{
        width: px,
        height: px,
        minWidth: px,
        minHeight: px,
        display: "inline-block",
        flexShrink: 0,
        boxSizing: "border-box",
        borderRadius: "999px",
        border: `${border}px solid currentColor`,
        borderRightColor: "transparent",
        opacity: 1,
        visibility: "visible",
      }}
    />
  );
}

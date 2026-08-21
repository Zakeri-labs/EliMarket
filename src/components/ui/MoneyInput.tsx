"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "@/app/utils/cn";
import {
  formatMoneyFromNumber,
  formatMoneyInputText,
  parseMoneyInputText,
} from "@/lib/money/grouped-number";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
};

export function MoneyInput({
  value,
  onValueChange,
  className,
  onBlur,
  ...props
}: Props) {
  const [text, setText] = useState(() => formatMoneyFromNumber(value));
  const lastEmitted = useRef(value);

  useEffect(() => {
    if (value === lastEmitted.current) return;
    lastEmitted.current = value;
    setText(formatMoneyFromNumber(value));
  }, [value]);

  return (
    <input
      {...props}
      inputMode="decimal"
      dir="ltr"
      autoComplete="off"
      className={cn(className)}
      value={text}
      onChange={(event) => {
        const next = formatMoneyInputText(event.target.value);
        setText(next);
        const parsed = next.trim() ? parseMoneyInputText(next) : undefined;
        lastEmitted.current = parsed;
        onValueChange(parsed);
      }}
      onBlur={(event) => {
        const parsed = parseMoneyInputText(text);
        if (parsed != null) {
          const pretty = formatMoneyFromNumber(parsed);
          setText(pretty);
          lastEmitted.current = parsed;
          onValueChange(parsed);
        }
        onBlur?.(event);
      }}
    />
  );
}

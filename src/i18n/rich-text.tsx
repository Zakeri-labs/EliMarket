"use client";

import { Fragment, type ReactNode } from "react";
import { useLocaleStore } from "@/app/_store/locale-store";
import { getMessages } from "@/i18n/messages";
import { resolveMessage } from "@/i18n/resolve-message";

/**
 * Like `t()`, but the placeholder values may be React nodes instead of plain
 * strings. Used for sentences that embed a price so the Omani Rial glyph (an
 * inline SVG, not a character) can be rendered inside the copy — e.g.
 * "Place order — <Price/>".
 *
 * The message template is split on `{token}` markers; each marker is replaced
 * with the matching entry from `params` (falling back to the literal marker when
 * absent). String segments are returned as-is.
 */
export function useRichText() {
  const locale = useLocaleStore((s) => s.locale);
  const messages = getMessages(locale);

  return (path: string, params: Record<string, ReactNode>): ReactNode => {
    const template = resolveMessage(messages, path) ?? path;
    const nodes: ReactNode[] = [];
    const pattern = /\{(\w+)\}/g;
    let cursor = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    const push = (value: ReactNode) => {
      nodes.push(<Fragment key={key++}>{value}</Fragment>);
    };

    while ((match = pattern.exec(template)) !== null) {
      if (match.index > cursor) push(template.slice(cursor, match.index));
      const name = match[1];
      push(name in params ? params[name] : match[0]);
      cursor = match.index + match[0].length;
    }
    if (cursor < template.length) push(template.slice(cursor));

    return <>{nodes}</>;
  };
}

import { Fragment, type ReactNode } from "react";

const URL_RE = /(https?:\/\/[^\s]+)/g;

/** Render inline text, turning bare URLs into links. */
function inline(text: string, keyBase: string) {
  return text.split(URL_RE).map((chunk, i) => {
    if (i % 2 === 1) {
      return (
        <a
          key={`${keyBase}-a-${i}`}
          href={chunk}
          target="_blank"
          rel="noopener noreferrer"
          className="break-words text-accent-teal underline underline-offset-2"
        >
          {chunk}
        </a>
      );
    }
    return <Fragment key={`${keyBase}-t-${i}`}>{chunk}</Fragment>;
  });
}

/**
 * Plain-text post body → readable HTML. A blank line or a `## ` heading line
 * ends the current paragraph; `## ` lines become sub-headings; other newlines
 * inside a paragraph become line breaks.
 */
export function BlogPostBody({ body }: { body: string }) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let para: string[] = [];

  const flush = () => {
    if (para.length === 0) return;
    const key = `p-${out.length}`;
    out.push(
      <p key={key}>
        {para.map((line, j) => (
          <Fragment key={`${key}-${j}`}>
            {j > 0 ? <br /> : null}
            {inline(line, `${key}-${j}`)}
          </Fragment>
        ))}
      </p>,
    );
    para = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      const key = `h-${out.length}`;
      out.push(
        <h2
          key={key}
          className="pt-3 text-xl font-bold text-text-primary first:pt-0"
        >
          {inline(line.slice(3).trim(), key)}
        </h2>,
      );
      continue;
    }
    para.push(line);
  }
  flush();

  return (
    <div className="space-y-5 text-base leading-8 text-text-primary">{out}</div>
  );
}

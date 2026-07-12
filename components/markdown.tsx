"use client";

import { memo, useRef, useState } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="ff-code-copy"
      aria-label="Copy code"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        } catch {
          /* clipboard unavailable (non-secure context / blocked) */
        }
      }}
    >
      {copied ? "✓" : "Copy"}
    </button>
  );
}

/** Wrap fenced code blocks: rounded dark box + language label + copy button. */
function PreBlock({ children }: { children?: React.ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null);
  const child = (Array.isArray(children) ? children[0] : children) as
    | React.ReactElement<{ className?: string }>
    | undefined;
  const lang =
    /language-([\w-]+)/.exec(child?.props?.className || "")?.[1] || "";
  return (
    <div className="ff-code">
      <div className="ff-code-bar">
        <span className="ff-code-lang">{lang || "code"}</span>
        <CopyButton getText={() => preRef.current?.textContent ?? ""} />
      </div>
      <pre ref={preRef} className="ff-code-pre">
        {children}
      </pre>
    </div>
  );
}

const components: Components = {
  a({ node: _node, ...props }) {
    return <a {...props} target="_blank" rel="noopener noreferrer" />;
  },
  pre({ children }) {
    return <PreBlock>{children}</PreBlock>;
  },
  code({ className, children }) {
    const match = /language-([\w-]+)/.exec(className || "");
    const text = String(children ?? "");
    // Fenced blocks have a language class OR span multiple lines; everything
    // else is inline code.
    const isBlock = !!match || text.includes("\n");
    if (isBlock) {
      return <code className={className}>{children}</code>;
    }
    return <code className="ff-code-inline">{children}</code>;
  },
};

/**
 * Markdown renderer for model output. Safe by default: react-markdown
 * doesn't render raw HTML, so untrusted output can't XSS.
 *
 * `streaming` skips syntax highlighting until the reply completes —
 * re-highlighting on every typewriter tick is O(n^2).
 */
export const Markdown = memo(function Markdown({
  content,
  streaming = false,
}: {
  content: string;
  streaming?: boolean;
}) {
  return (
    <div className="ff-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={streaming ? [] : [rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

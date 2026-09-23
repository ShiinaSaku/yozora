import * as React from "react"
import { Markdown } from "@tanstack/markdown/react"
import type { MarkdownComponents } from "@tanstack/markdown/react"
import { calloutsExtension } from "@tanstack/markdown/extensions/callouts"
import { defaultHighlighter } from "@tanstack/highlight"
import { createTanStackMarkdownHighlighter } from "@tanstack/highlight/markdown"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

function PreBlock({
  children,
  className,
  "data-lang": lang,
  "data-code-title": title,
  ...props
}: React.ComponentPropsWithoutRef<"pre"> & {
  "data-lang"?: string
  "data-code-title"?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const preRef = React.useRef<HTMLPreElement>(null)
  const displayLang = title || lang || "text"

  const handleCopy = () => {
    if (typeof window !== "undefined" && preRef.current) {
      const text = preRef.current.textContent || ""
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-xl border border-border/60 bg-muted/40 shadow-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-border/40 bg-muted/70 px-3.5 py-1.5 font-mono text-xs text-muted-foreground">
        <span className="text-xs font-semibold tracking-wider uppercase">
          {displayLang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 font-sans text-xs font-medium transition-all hover:bg-background/80 hover:text-foreground active:scale-95"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre
        ref={preRef}
        className={cn(
          "no-scrollbar overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground/90",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}

const markdownComponents: MarkdownComponents = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-3 border-b border-border/40 pb-2 text-xl font-black tracking-tight text-foreground sm:text-2xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2.5 border-b border-border/30 pb-1.5 text-lg font-bold tracking-tight text-foreground sm:text-xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-2 text-base font-bold tracking-tight text-foreground sm:text-lg">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-3 mb-1.5 text-sm font-bold tracking-tight text-foreground sm:text-base">
      {children}
    </h4>
  ),
  p: ({ children }) => (
    <p className="my-2.5 leading-relaxed text-foreground/90">{children}</p>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-r-lg border-l-3 border-primary/40 bg-muted/20 py-1 pl-3.5 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  pre: PreBlock,
  code: ({ className, children, ...props }) => {
    // If inside a pre code block with syntax highlight classes, render directly
    if (className?.includes("language-") || className?.includes("th-")) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code
        className="rounded-md border border-border/40 bg-muted/80 px-1.5 py-0.5 font-mono text-xs font-medium text-foreground"
        {...props}
      >
        {children}
      </code>
    )
  },
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl border border-border/50 shadow-2xs">
      <table className="w-full border-collapse text-left text-xs">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="border-b border-border/50 bg-muted/70 font-bold text-foreground">
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="px-3.5 py-2.5 text-xs font-semibold tracking-tight text-foreground">
      {children}
    </th>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-border/30 transition-colors last:border-0 even:bg-muted/20 hover:bg-muted/30">
      {children}
    </tr>
  ),
  td: ({ children }) => (
    <td className="px-3.5 py-2 text-xs text-foreground/90">{children}</td>
  ),
  a: ({ href, children, ...props }) => (
    <a
      {...props}
      href={href}
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      className="font-semibold text-primary underline decoration-primary/40 underline-offset-3 transition-colors hover:text-primary/80 hover:decoration-primary"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-2.5 list-disc space-y-1 pl-5 text-foreground/90">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2.5 list-decimal space-y-1 pl-5 font-mono text-xs text-foreground/90">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="my-1 leading-relaxed">{children}</li>,
  hr: () => <hr className="my-6 border-border/50" />,
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      className="my-3 max-h-96 max-w-full rounded-xl border border-border/50 object-contain shadow-xs"
    />
  ),
}

const markdownExtensions = [calloutsExtension()]
const markdownHighlighter =
  createTanStackMarkdownHighlighter(defaultHighlighter)

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  if (!content) {
    return null
  }

  return (
    <div
      className={cn(
        "prose dark:prose-invert max-w-none text-xs leading-relaxed sm:text-sm",
        className
      )}
    >
      <Markdown
        components={markdownComponents}
        extensions={markdownExtensions}
        highlighter={markdownHighlighter}
      >
        {content}
      </Markdown>
    </div>
  )
}

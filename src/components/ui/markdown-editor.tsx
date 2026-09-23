import * as React from "react"
import {
  Bold,
  Code,
  Columns2,
  Eye,
  Heading,
  Image as ImageIcon,
  Italic,
  Lightbulb,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  PenLine,
  Quote,
  SquareCode,
  Strikethrough,
  Table as TableIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { cn } from "@/lib/utils"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
}

type TabType = "write" | "preview" | "split"
type FormatFn = (prefix: string, suffix?: string, defaultText?: string) => void

function MarkdownToolbar({ onFormat }: { onFormat: FormatFn }) {
  return (
    <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto text-muted-foreground">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("### ", "", "Heading")}
        title="Heading (###)"
      >
        <Heading className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("**", "**", "bold text")}
        title="Bold (⌘B)"
      >
        <Bold className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("*", "*", "italic text")}
        title="Italic (⌘I)"
      >
        <Italic className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("~~", "~~", "strikethrough")}
        title="Strikethrough"
      >
        <Strikethrough className="size-3.5" />
      </Button>

      <span className="mx-1 h-4 w-px bg-border/60" />

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("> ", "", "Quote")}
        title="Quote (>)"
      >
        <Quote className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("`", "`", "code")}
        title="Inline Code"
      >
        <Code className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("```ts\n", "\n```", "// code here")}
        title="Code Block"
      >
        <SquareCode className="size-3.5" />
      </Button>

      <span className="mx-1 h-4 w-px bg-border/60" />

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("- ", "", "List item")}
        title="Bullet List (-)"
      >
        <List className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("1. ", "", "Numbered item")}
        title="Numbered List (1.)"
      >
        <ListOrdered className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("- [ ] ", "", "Task item")}
        title="Task List (- [ ])"
      >
        <ListTodo className="size-3.5" />
      </Button>

      <span className="mx-1 h-4 w-px bg-border/60" />

      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("[", "](https://)", "Link Title")}
        title="Insert Link (⌘K)"
      >
        <Link2 className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => onFormat("![", "](https://)", "Image Alt")}
        title="Insert Image"
      >
        <ImageIcon className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() =>
          onFormat("| Header 1 | Header 2 |\n|---|---|\n| Cell 1 | Cell 2 |\n")
        }
        title="Insert Table"
      >
        <TableIcon className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() =>
          onFormat("> [!TIP]\n> ", "", "Write your tip or note here")
        }
        title="Insert GitHub Callout Alert"
      >
        <Lightbulb className="size-3.5 text-emerald-500" />
      </Button>
    </div>
  )
}

function MarkdownEditorHeader({
  activeTab,
  setActiveTab,
  onFormat,
}: {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  onFormat: FormatFn
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/50 bg-muted/40 px-3 py-2">
      <div className="flex items-center gap-1 rounded-xl border border-border/40 bg-muted/80 p-0.5">
        <button
          type="button"
          onClick={() => setActiveTab("write")}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors",
            activeTab === "write"
              ? "bg-background text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <PenLine className="size-3.5" />
          <span>Write</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors",
            activeTab === "preview"
              ? "bg-background text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Eye className="size-3.5" />
          <span>Preview</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("split")}
          className={cn(
            "hidden cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-colors md:flex",
            activeTab === "split"
              ? "bg-background text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Columns2 className="size-3.5" />
          <span>Split</span>
        </button>
      </div>

      {activeTab !== "preview" && <MarkdownToolbar onFormat={onFormat} />}
    </div>
  )
}

function MarkdownStatusBar({
  wordCount,
  charCount,
}: {
  wordCount: number
  charCount: number
}) {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-2 font-mono text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <span>{wordCount} words</span>
        <span>·</span>
        <span>{charCount} chars</span>
      </div>

      <span className="flex items-center gap-1 text-xs text-muted-foreground/80">
        GitHub Flavored Markdown (GFM)
      </span>
    </div>
  )
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write in GitHub Flavored Markdown...",
  minHeight = "min-h-[220px]",
  className,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>("write")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const insertFormatting: FormatFn = (
    prefix,
    suffix = "",
    defaultText = ""
  ) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end)
    const replacement = selected
      ? `${prefix}${selected}${suffix}`
      : `${prefix}${defaultText}${suffix}`

    const newValue =
      value.substring(0, start) + replacement + value.substring(end)
    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      const cursorPos = selected
        ? start + prefix.length + selected.length + suffix.length
        : start + prefix.length
      textarea.setSelectionRange(
        cursorPos,
        cursorPos + (selected ? 0 : defaultText.length)
      )
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === "b") {
        e.preventDefault()
        insertFormatting("**", "**", "bold text")
      } else if (e.key === "i") {
        e.preventDefault()
        insertFormatting("*", "*", "italic text")
      } else if (e.key === "k") {
        e.preventDefault()
        insertFormatting("[", "](https://)", "link title")
      }
    }
  }

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const charCount = value.length

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs",
        className
      )}
    >
      <MarkdownEditorHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onFormat={insertFormatting}
      />

      <div className="min-h-0 flex-1 bg-background">
        {activeTab === "write" && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={placeholder || "Markdown source code"}
            className={cn(
              "w-full resize-y rounded-none border-0 bg-transparent p-4 font-mono text-xs leading-relaxed shadow-none focus:outline-none sm:text-sm",
              minHeight
            )}
          />
        )}

        {activeTab === "preview" && (
          <div className={cn("max-h-125 overflow-y-auto p-5", minHeight)}>
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground italic">
                Nothing to preview yet. Switch back to &ldquo;Write&rdquo; to
                start typing.
              </div>
            )}
          </div>
        )}

        {activeTab === "split" && (
          <div className="grid grid-cols-1 divide-y divide-border/50 md:grid-cols-2 md:divide-x md:divide-y-0">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              aria-label={placeholder || "Markdown source code"}
              className={cn(
                "w-full resize-y rounded-none border-0 bg-transparent p-4 font-mono text-xs leading-relaxed shadow-none focus:outline-none",
                minHeight
              )}
            />
            <div
              className={cn(
                "max-h-125 overflow-y-auto bg-muted/10 p-4",
                minHeight
              )}
            >
              {value.trim() ? (
                <MarkdownRenderer content={value} />
              ) : (
                <div className="py-12 text-center text-xs text-muted-foreground italic">
                  Live preview will render here...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <MarkdownStatusBar wordCount={wordCount} charCount={charCount} />
    </div>
  )
}

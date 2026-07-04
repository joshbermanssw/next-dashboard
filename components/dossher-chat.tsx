"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
  HeadphonesIcon,
  MicIcon,
  SendIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const GREETING = "Hello, I'm Dossher! How can I help you today?"
const STUB_REPLY =
  "I'm still in training and can't answer that just yet — real answers are coming soon!"

const quickActions = [
  { label: "Customer Support", icon: HeadphonesIcon },
  { label: "Voice Control", icon: MicIcon },
]

type ChatMessage = {
  id: number
  role: "user" | "assistant"
  text: string
}

export function DossherChat() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [draft, setDraft] = React.useState("")
  const [typing, setTyping] = React.useState(false)
  const launcherRef = React.useRef<HTMLButtonElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const replyTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const nextId = React.useRef(0)

  React.useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
        launcherRef.current?.focus()
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  React.useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  React.useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [open, messages, typing])

  React.useEffect(() => () => clearTimeout(replyTimer.current), [])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, role: "user", text: trimmed },
    ])
    setTyping(true)
    clearTimeout(replyTimer.current)
    replyTimer.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: "assistant", text: STUB_REPLY },
      ])
      setTyping(false)
    }, 700)
  }

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        aria-label="Open DosshPay assistant"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex size-12 items-center justify-center rounded-full bg-white/[0.06] ring-1 ring-sidebar-border transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "bg-white/[0.1]"
        )}
      >
        <img
          src="/logos/dosh/dosh-d-white.svg"
          alt=""
          width={22}
          height={22}
          className="size-5.5"
        />
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-label="Dossher assistant"
            className="fixed bottom-20 left-4 z-50 flex h-[min(560px,calc(100vh-6.5rem))] w-95 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accentBlue to-surfaceCardBlue">
                <SparklesIcon className="size-5 text-white" />
              </div>
              <div className="flex flex-1 flex-col">
                <span className="text-base font-bold text-blueLightest">
                  Dossher
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-accentBlue">
                  <span className="size-1.5 rounded-full bg-positive" />
                  AI Assistant
                </span>
              </div>
              <button
                type="button"
                aria-label="Close chat"
                onClick={() => {
                  setOpen(false)
                  launcherRef.current?.focus()
                }}
                className="flex size-9 items-center justify-center rounded-full bg-white/[0.06] text-blueLight transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <XIcon className="size-4.5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex flex-1 flex-col gap-3 overflow-y-auto p-4"
            >
              <div className="max-w-[85%] rounded-2xl rounded-bl-md border border-panel-border bg-panel p-4">
                <p className="text-sm leading-relaxed text-foreground">
                  {GREETING}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => send(action.label)}
                      className="flex items-center gap-2 rounded-full border border-border bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-blueLightest transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <action.icon className="size-3.5" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    message.role === "user"
                      ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md border border-panel-border bg-panel text-foreground"
                  )}
                >
                  {message.text}
                </div>
              ))}

              {typing && (
                <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-panel-border bg-panel px-3.5 py-3">
                  <span className="size-1.5 animate-bounce rounded-full bg-blueLight/60 [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-blueLight/60 [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-blueLight/60" />
                </div>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                send(draft)
                setDraft("")
              }}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                ref={inputRef}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask Dossher anything..."
                className="h-11 min-w-0 flex-1 rounded-xl bg-white/[0.04] px-4 text-sm text-foreground placeholder:text-label focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                disabled
                aria-label="Voice input (coming soon)"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground opacity-50"
              >
                <MicIcon className="size-5" />
              </button>
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Send message"
                className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-accentBlueHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              >
                <SendIcon className="size-5" />
              </button>
            </form>
          </div>,
          document.body
        )}
    </>
  )
}

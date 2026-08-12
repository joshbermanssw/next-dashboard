"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import jsQR from "jsqr"
import { CameraOffIcon, LockIcon } from "lucide-react"

import { parsePaymentUrl } from "@/lib/qr-payment"
import { cn } from "@/lib/utils"

/** How often a frame is handed to the decoder. The camera runs at 30–60fps;
 * decoding every frame costs battery without finding codes any sooner. */
const DECODE_INTERVAL_MS = 100

/** Longest edge of the frame we decode. Downscaling is the biggest single win
 * for decode latency, and QR codes survive it comfortably. */
const DECODE_MAX_EDGE = 480

type BlockedReason = "denied" | "no-camera" | "insecure" | "error"

type ScannerState =
  | { status: "starting" }
  | { status: "scanning" }
  | { status: "blocked"; reason: BlockedReason }

const BLOCKED_COPY: Record<BlockedReason, { title: string; body: string }> = {
  denied: {
    title: "Camera access is off",
    body: "DosshPay needs your camera to read a payment code. Allow camera access in your browser settings, then try again.",
  },
  "no-camera": {
    title: "No camera found",
    body: "We couldn't find a camera on this device to scan with.",
  },
  insecure: {
    title: "Needs a secure connection",
    body: "Browsers only allow camera access over HTTPS. Open DosshPay on a secure connection and try again.",
  },
  error: {
    title: "Couldn't start the camera",
    body: "Something went wrong reaching your camera. Try again in a moment.",
  },
}

/** Corner brackets of the scan frame — each is a two-sided border on a square. */
const FRAME_CORNERS = [
  "left-0 top-0 rounded-tl-3xl border-l-4 border-t-4",
  "right-0 top-0 rounded-tr-3xl border-r-4 border-t-4",
  "bottom-0 left-0 rounded-bl-3xl border-b-4 border-l-4",
  "bottom-0 right-0 rounded-br-3xl border-b-4 border-r-4",
]

/**
 * The Pay tab: a live rear-camera preview that watches for DosshPay payment
 * codes and routes to the confirm screen the moment it sees one.
 *
 * Decoding happens entirely on-device — frames never leave the phone.
 */
export function QrScanner() {
  const router = useRouter()
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [state, setState] = React.useState<ScannerState>({ status: "starting" })
  const [attempt, setAttempt] = React.useState(0)

  React.useEffect(() => {
    // `mediaDevices` is simply absent on insecure origins, which is worth
    // naming rather than reporting as a generic failure — it's the usual
    // outcome of opening the dev server from a phone over plain http.
    if (!navigator.mediaDevices?.getUserMedia) {
      setState({ status: "blocked", reason: "insecure" })
      return
    }

    let stream: MediaStream | null = null
    let frameId = 0
    let stopped = false
    let lastDecodeAt = 0

    const canvas = document.createElement("canvas")
    const context = canvas.getContext("2d", { willReadFrequently: true })

    const stop = () => {
      stopped = true
      cancelAnimationFrame(frameId)
      stream?.getTracks().forEach((track) => track.stop())
      stream = null
    }

    const tick = (now: number) => {
      frameId = requestAnimationFrame(tick)

      const video = videoRef.current
      if (!context || !video || video.readyState < video.HAVE_ENOUGH_DATA) return
      if (now - lastDecodeAt < DECODE_INTERVAL_MS) return
      lastDecodeAt = now

      const scale = Math.min(
        1,
        DECODE_MAX_EDGE / Math.max(video.videoWidth, video.videoHeight),
      )
      const width = Math.round(video.videoWidth * scale)
      const height = Math.round(video.videoHeight * scale)
      if (width === 0 || height === 0) return

      canvas.width = width
      canvas.height = height
      context.drawImage(video, 0, 0, width, height)

      const { data } = context.getImageData(0, 0, width, height)
      const found = jsQR(data, width, height, { inversionAttempts: "dontInvert" })
      if (!found) return

      // A camera sees every code in front of it — wifi codes, product barcodes,
      // someone else's link. Anything that isn't a DosshPay payment is ignored
      // and scanning simply continues.
      const request = parsePaymentUrl(found.data, window.location.origin)
      if (!request) return

      stop()
      const query =
        request.amount === null ? "" : `?amt=${request.amount.toFixed(2)}`
      router.push(`/qr/pay/${encodeURIComponent(request.accountId)}${query}`)
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" } } })
      .then((opened) => {
        // The effect can be torn down while the permission prompt is still up.
        if (stopped || !videoRef.current) {
          opened.getTracks().forEach((track) => track.stop())
          return
        }
        stream = opened
        videoRef.current.srcObject = opened
        // iOS won't autoplay an inline stream without an explicit play().
        void videoRef.current.play().catch(() => {})
        setState({ status: "scanning" })
        frameId = requestAnimationFrame(tick)
      })
      .catch((error: unknown) => {
        if (stopped) return
        setState({ status: "blocked", reason: blockedReason(error) })
      })

    return stop
  }, [router, attempt])

  if (state.status === "blocked") {
    const { title, body } = BLOCKED_COPY[state.reason]
    const Icon = state.reason === "insecure" ? LockIcon : CameraOffIcon

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 pt-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-white/10 text-blueLight">
          <Icon className="size-6" />
        </span>
        <h2 className="text-lg font-semibold text-blueLightest">{title}</h2>
        <p className="max-w-xs text-sm text-blueLight/70">{body}</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="mt-2 rounded-full border border-panel-border bg-white/5 px-5 py-2.5 text-sm font-medium text-blueLightest transition-colors hover:bg-white/10"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        className="absolute inset-0 size-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-10 px-6">
        <p className="rounded-full bg-black/45 px-5 py-2.5 text-base font-medium text-white backdrop-blur-sm">
          {state.status === "starting"
            ? "Starting camera…"
            : "Scan a DosshPay QR code"}
        </p>

        <div className="relative aspect-square w-full max-w-[300px]">
          {FRAME_CORNERS.map((corner) => (
            <span
              key={corner}
              className={cn("absolute size-12 border-white/90", corner)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function blockedReason(error: unknown): BlockedReason {
  const name = error instanceof DOMException ? error.name : ""
  if (name === "NotAllowedError" || name === "SecurityError") return "denied"
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "no-camera"
  }
  return "error"
}

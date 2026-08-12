"use client"

import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { FaApple, FaGooglePlay } from "react-icons/fa"
import { SmartphoneIcon } from "lucide-react"

import { APP_STORE_URL, DOWNLOAD_URL, PLAY_STORE_URL } from "@/lib/app-links"
import HeadingTag from "@/components/util/heading-tag"

/**
 * What a desktop visitor sees at `/qr`.
 *
 * The QR flow needs a rear camera to scan with and a screen you can hold up to
 * someone, so it's gated to phones (see `server/device.ts`). The entry point is
 * hidden on desktop too — this catches anyone arriving by direct link, so the
 * URL explains itself instead of 404ing.
 */
export function MobileOnly() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-blueDarker px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accentBlue/15 text-accentBlue">
        <SmartphoneIcon className="size-6" />
      </span>

      <header className="space-y-2">
        <HeadingTag level={5} className="font-semibold text-blueLightest">
          QR payments are on your phone
        </HeadingTag>
        <p className="max-w-sm text-sm text-blueLight/70">
          Scanning a code needs a camera, and showing one needs a screen you can
          hand over. Open DosshPay on your phone to pay or get paid by QR.
        </p>
      </header>

      <div className="rounded-xl bg-blueLightest p-4 shadow-inner">
        <QRCodeSVG
          value={DOWNLOAD_URL}
          size={160}
          level="M"
          bgColor="#F5F7FF"
          fgColor="#00032E"
          marginSize={0}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <StoreLink href={APP_STORE_URL} icon={<FaApple className="size-5" />}>
          App Store
        </StoreLink>
        <StoreLink
          href={PLAY_STORE_URL}
          icon={<FaGooglePlay className="size-4" />}
        >
          Google Play
        </StoreLink>
      </div>

      <Link
        href="/"
        className="text-sm font-medium text-accentBlue underline-offset-4 hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  )
}

function StoreLink({
  href,
  icon,
  children,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2.5 rounded-full border border-panel-border bg-white/5 px-6 py-3 text-sm font-medium text-blueLightest transition-colors hover:bg-white/10"
    >
      {icon}
      {children}
    </a>
  )
}

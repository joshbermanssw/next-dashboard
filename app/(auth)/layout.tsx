import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import HeadingTag from "@/components/util/heading-tag"

export const metadata: Metadata = {
  title: "DosshPay — Sign in",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-neutralBlack">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/video/login-bg.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 z-[1] bg-black/55" />

      <Link
        href="/"
        className="fixed top-6 left-6 z-20 hidden flex-col gap-2 sm:flex"
        aria-label="DosshPay home"
      >
        <div className="flex items-center gap-2">
          <Image
            src="/logos/dosh/dosh-d-white.svg"
            alt="DosshPay"
            width={20}
            height={20}
          />
          <HeadingTag level={6} className="font-semibold perspective-distant">
            Welcome to DosshPay
          </HeadingTag>
        </div>
        <p className="text-sm text-blueLight">
          Do more with your adaptable DigiWallet
        </p>
      </Link>

      <main className="relative z-10 w-full px-4 py-10 sm:px-6">{children}</main>
    </div>
  )
}

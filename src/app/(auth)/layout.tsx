import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dosshpay – Login",
  description: "Banking Without Borders",
  icons: {
    icon: "/logos/dosh/dosh-d.svg",
  },
};


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-neutralBlack">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-[0] h-full w-full object-cover"
      >
        <source src="/video/login-bg.webm" type="video/webm" />
      </video>
      <div className="absolute inset-0 z-[1] bg-black/50" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

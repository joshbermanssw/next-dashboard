export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-tr from-blueDarker from-50% via-blue via-80% to-accentBlue">
      {children}
    </div>
  )
}

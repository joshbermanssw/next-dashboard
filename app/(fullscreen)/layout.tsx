/**
 * Chrome-free shell for screens that own the whole viewport.
 *
 * The QR flow's camera runs edge to edge, so these routes sit outside
 * `(dashboard)` and its sidebar + header rather than fighting them. Auth stays
 * where the project rules put it — in the pages, not here, since layouts don't
 * re-render on navigation.
 */
export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-dvh bg-neutralBlack">{children}</div>
}

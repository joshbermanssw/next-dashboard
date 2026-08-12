import "server-only"

/**
 * Device-class detection for the QR payment flow, which is mobile-only: it
 * wants a rear camera to scan with and a screen to hold up to someone else's.
 *
 * Decided server-side, from the request, so the gate is settled before first
 * paint — a client-side check would flash the wrong UI, and a viewport check
 * would call a narrow desktop window a phone.
 */

/** UA families that mean "handheld". Deliberately excludes iPadOS, which
 * reports itself as a Mac and is desktop-class for our purposes. */
const MOBILE_UA =
  /Android|iPhone|iPod|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile/i

/**
 * Whether this request came from a phone.
 *
 * Prefers the `Sec-CH-UA-Mobile` client hint, which Chromium sends and which is
 * far harder to get wrong than UA sniffing. Safari sends no hints, so the UA
 * regex carries iPhone.
 */
export function isMobileRequest(headers: Headers): boolean {
  const hint = headers.get("sec-ch-ua-mobile")
  if (hint) return hint === "?1"
  return MOBILE_UA.test(headers.get("user-agent") ?? "")
}

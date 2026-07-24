import { describe, it, expect } from "vitest"
import {
  normalizePhone,
  SignupDetailsSchema,
  SignupPasswordSchema,
  PasswordSchema,
  OtpSchema,
  isDisplayableUpstreamMessage,
} from "@/lib/signup"

const validDetails = {
  firstName: "Josh",
  lastName: "Berman",
  email: "josh@example.com",
  phone: "+61 412 345 678",
}

describe("normalizePhone", () => {
  it("strips spaces, dashes and brackets", () => {
    expect(normalizePhone("+61 412 345 678")).toBe("+61412345678")
    expect(normalizePhone("+1 (415) 555-0100")).toBe("+14155550100")
  })

  it("leaves an already-bare number untouched", () => {
    expect(normalizePhone("+61412345678")).toBe("+61412345678")
  })
})

describe("SignupDetailsSchema", () => {
  it("accepts a fully valid set of details", () => {
    expect(SignupDetailsSchema.safeParse(validDetails).success).toBe(true)
  })

  it("accepts a number typed without separators", () => {
    const r = SignupDetailsSchema.safeParse({
      ...validDetails,
      phone: "+61412345678",
    })
    expect(r.success).toBe(true)
  })

  it("rejects a phone number with no country code", () => {
    const r = SignupDetailsSchema.safeParse({
      ...validDetails,
      phone: "0412 345 678",
    })
    expect(r.success).toBe(false)
  })

  it("rejects a malformed email", () => {
    const r = SignupDetailsSchema.safeParse({
      ...validDetails,
      email: "not-an-email",
    })
    expect(r.success).toBe(false)
  })

  it("rejects a blank or whitespace-only name", () => {
    expect(
      SignupDetailsSchema.safeParse({ ...validDetails, firstName: "   " })
        .success,
    ).toBe(false)
  })

  it("trims surrounding whitespace off names and email", () => {
    const r = SignupDetailsSchema.parse({
      ...validDetails,
      firstName: "  Josh  ",
      email: "  josh@example.com  ",
    })
    expect(r.firstName).toBe("Josh")
    expect(r.email).toBe("josh@example.com")
  })
})

describe("PasswordSchema", () => {
  it("accepts 8+ characters with letters and numbers", () => {
    expect(PasswordSchema.safeParse("passw0rd").success).toBe(true)
  })

  it("rejects anything shorter than 8 characters", () => {
    expect(PasswordSchema.safeParse("pass1").success).toBe(false)
  })

  it("rejects letters with no number", () => {
    expect(PasswordSchema.safeParse("passworddd").success).toBe(false)
  })

  it("rejects numbers with no letter", () => {
    expect(PasswordSchema.safeParse("12345678").success).toBe(false)
  })
})

describe("SignupPasswordSchema", () => {
  it("accepts a matching pair", () => {
    const r = SignupPasswordSchema.safeParse({
      password: "passw0rd",
      confirmPassword: "passw0rd",
    })
    expect(r.success).toBe(true)
  })

  it("reports a mismatch against the confirm field", () => {
    const r = SignupPasswordSchema.safeParse({
      password: "passw0rd",
      confirmPassword: "passw0rdx",
    })
    expect(r.success).toBe(false)
    if (!r.success) {
      expect(r.error.issues[0].path).toEqual(["confirmPassword"])
    }
  })
})

describe("OtpSchema", () => {
  it("accepts exactly six digits", () => {
    expect(OtpSchema.safeParse({ otp: "123456" }).success).toBe(true)
  })

  it("rejects the wrong length or non-digits", () => {
    expect(OtpSchema.safeParse({ otp: "12345" }).success).toBe(false)
    expect(OtpSchema.safeParse({ otp: "1234567" }).success).toBe(false)
    expect(OtpSchema.safeParse({ otp: "12345a" }).success).toBe(false)
  })
})

describe("isDisplayableUpstreamMessage", () => {
  it("passes through short, human-facing prose", () => {
    for (const m of [
      "Email already in use",
      "Failed to send verification code",
      "Too many requests. Try again shortly.",
      "Invalid credentials",
    ]) {
      expect(isDisplayableUpstreamMessage(m)).toBe(true)
    }
  })

  it("suppresses the leaked Prisma error the backend returns on a dupe email", () => {
    const leaked =
      "\nInvalid `prisma.customers.create()` invocation:\n\n\nUnique constraint failed on the fields: (`email`)"
    expect(isDisplayableUpstreamMessage(leaked)).toBe(false)
  })

  it("suppresses anything that reads like a trace or ORM/DB internal", () => {
    for (const m of [
      "Error at Object.<anonymous> (/app/server.js:42)",
      "duplicate key value violates unique constraint",
      "prisma.$queryRaw failed",
      "TypeError: cannot read property 'id' of undefined\n  at foo",
    ]) {
      expect(isDisplayableUpstreamMessage(m)).toBe(false)
    }
  })

  it("suppresses empty, over-long, and non-string values", () => {
    expect(isDisplayableUpstreamMessage("")).toBe(false)
    expect(isDisplayableUpstreamMessage("   ")).toBe(false)
    expect(isDisplayableUpstreamMessage("x".repeat(200))).toBe(false)
    expect(isDisplayableUpstreamMessage(undefined)).toBe(false)
    expect(isDisplayableUpstreamMessage(null)).toBe(false)
    expect(isDisplayableUpstreamMessage({ message: "hi" })).toBe(false)
  })
})

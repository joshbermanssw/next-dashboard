/**
 * Option catalogues for the KYC sections.
 *
 * Each catalogue is a `const` tuple of stable machine keys (what the backend
 * would store) plus a label record for display. Keeping the keys as a tuple
 * lets Zod derive a literal union straight from the catalogue, so adding an
 * option in one place updates the schema, the type and the UI together.
 *
 * Deliberately free of React so both server and client modules can import it.
 */

// ── Personal ────────────────────────────────────────────────────────────────

export const TITLES = ["mr", "mrs", "ms", "miss", "mx", "dr", "prof"] as const
export type Title = (typeof TITLES)[number]
export const TITLE_LABELS: Record<Title, string> = {
  mr: "Mr",
  mrs: "Mrs",
  ms: "Ms",
  miss: "Miss",
  mx: "Mx",
  dr: "Dr",
  prof: "Prof",
}

export const GENDERS = ["male", "female", "other", "undisclosed"] as const
export type Gender = (typeof GENDERS)[number]
export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  undisclosed: "Prefer not to say",
}

export const RELATIONSHIP_STATUSES = [
  "single",
  "married",
  "divorced",
  "widowed",
  "de-facto",
] as const
export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number]
export const RELATIONSHIP_STATUS_LABELS: Record<RelationshipStatus, string> = {
  single: "Single",
  married: "Married",
  divorced: "Divorced",
  widowed: "Widowed",
  "de-facto": "De facto",
}

export const VISA_STATUSES = [
  "citizen",
  "permanent-resident",
  "working-visa",
  "student-visa",
  "visitor-visa",
  "other",
] as const
export type VisaStatus = (typeof VISA_STATUSES)[number]
export const VISA_STATUS_LABELS: Record<VisaStatus, string> = {
  citizen: "Australian Citizen",
  "permanent-resident": "Australian Permanent Resident",
  "working-visa": "Valid Working Visa",
  "student-visa": "Student Visa",
  "visitor-visa": "Visitor Visa",
  other: "Other",
}

/** Why a customer has no TFN. Required only when the TFN field is left blank. */
export const TFN_EXEMPTION_REASONS = [
  "not-eligible",
  "foreign-resident",
  "not-applied",
  "awaiting-processing",
  "other",
] as const
export type TfnExemptionReason = (typeof TFN_EXEMPTION_REASONS)[number]
export const TFN_EXEMPTION_REASON_LABELS: Record<TfnExemptionReason, string> = {
  "not-eligible": "I'm not eligible for a TFN",
  "foreign-resident": "I'm a foreign resident",
  "not-applied": "I haven't applied for one yet",
  "awaiting-processing": "I've applied and I'm awaiting processing",
  other: "Other",
}

// ── Source of funds ─────────────────────────────────────────────────────────

export const INCOME_SOURCES = [
  "sales-revenue",
  "recurring-revenue",
  "freelance",
  "investment",
  "rental",
  "licensing",
  "government-grants",
  "salary",
] as const
export type IncomeSource = (typeof INCOME_SOURCES)[number]
export const INCOME_SOURCE_LABELS: Record<IncomeSource, string> = {
  "sales-revenue": "Sales Revenue",
  "recurring-revenue": "Recurring Revenue",
  freelance: "Freelancer & Contracting",
  investment: "Investment Income",
  rental: "Rental Income",
  licensing: "Licensing",
  "government-grants": "Government Grants",
  salary: "Salary & Wages",
}

export const INCOME_BANDS = [
  "under-30k",
  "30k-60k",
  "60k-100k",
  "100k-150k",
  "150k-250k",
  "over-250k",
] as const
export type IncomeBand = (typeof INCOME_BANDS)[number]
export const INCOME_BAND_LABELS: Record<IncomeBand, string> = {
  "under-30k": "Under $30,000",
  "30k-60k": "$30,000 – $60,000",
  "60k-100k": "$60,000 – $100,000",
  "100k-150k": "$100,000 – $150,000",
  "150k-250k": "$150,000 – $250,000",
  "over-250k": "Over $250,000",
}

export const INDUSTRIES = [
  "agriculture",
  "banking-finance",
  "construction",
  "education",
  "energy-utilities",
  "healthcare",
  "hospitality",
  "it-telecoms",
  "legal",
  "manufacturing",
  "media-entertainment",
  "mining-resources",
  "professional-services",
  "real-estate",
  "retail",
  "transport-logistics",
  "government",
  "not-for-profit",
  "other",
] as const
export type Industry = (typeof INDUSTRIES)[number]
export const INDUSTRY_LABELS: Record<Industry, string> = {
  agriculture: "Agriculture",
  "banking-finance": "Banking & Finance",
  construction: "Construction",
  education: "Education",
  "energy-utilities": "Energy & Utilities",
  healthcare: "Healthcare",
  hospitality: "Hospitality & Tourism",
  "it-telecoms": "IT & Telecommunications",
  legal: "Legal",
  manufacturing: "Manufacturing",
  "media-entertainment": "Media & Entertainment",
  "mining-resources": "Mining & Resources",
  "professional-services": "Professional Services",
  "real-estate": "Real Estate",
  retail: "Retail",
  "transport-logistics": "Transport & Logistics",
  government: "Government & Public Sector",
  "not-for-profit": "Not for Profit",
  other: "Other",
}

export const OCCUPATIONS = [
  "accountant",
  "administrative-worker",
  "analyst",
  "architect",
  "artist-designer",
  "chef-cook",
  "clerical-worker",
  "consultant",
  "engineer",
  "executive",
  "farmer",
  "healthcare-worker",
  "hospitality-worker",
  "labourer",
  "lawyer",
  "manager",
  "retired",
  "sales-worker",
  "self-employed",
  "student",
  "teacher",
  "technician",
  "trades-worker",
  "transport-worker",
  "unemployed",
  "other",
] as const
export type Occupation = (typeof OCCUPATIONS)[number]
export const OCCUPATION_LABELS: Record<Occupation, string> = {
  accountant: "Accountant",
  "administrative-worker": "Administrative Worker",
  analyst: "Analyst",
  architect: "Architect",
  "artist-designer": "Artist/Designer",
  "chef-cook": "Chef/Cook",
  "clerical-worker": "Clerical Worker",
  consultant: "Consultant",
  engineer: "Engineer",
  executive: "Executive/Director",
  farmer: "Farmer",
  "healthcare-worker": "Healthcare Worker",
  "hospitality-worker": "Hospitality Worker",
  labourer: "Labourer",
  lawyer: "Lawyer",
  manager: "Manager",
  retired: "Retired",
  "sales-worker": "Sales Worker",
  "self-employed": "Self-employed",
  student: "Student",
  teacher: "Teacher",
  technician: "Technician",
  "trades-worker": "Trades Worker",
  "transport-worker": "Transport Worker",
  unemployed: "Not currently employed",
  other: "Other",
}

export const ACTIVITIES = [
  "bills-utilities",
  "business-transactions",
  "car-payments",
  "charity-donations",
  "ecommerce",
  "international-transfers",
  "payroll",
  "everyday-spending",
  "savings-investment",
] as const
export type Activity = (typeof ACTIVITIES)[number]
export const ACTIVITY_LABELS: Record<Activity, string> = {
  "bills-utilities": "Bills & Utilities",
  "business-transactions": "Business Transactions",
  "car-payments": "Car Payments",
  "charity-donations": "Charity Donations",
  ecommerce: "E-Commerce / Online Shopping",
  "international-transfers": "International Transfers",
  payroll: "Payroll / Employee Payments",
  "everyday-spending": "Everyday Spending",
  "savings-investment": "Savings & Investment",
}

/** ISO 3166-1 alpha-2 for the markets DosshPay settles in. */
export const TRANSACTION_COUNTRIES = [
  "AU",
  "NZ",
  "US",
  "GB",
  "CA",
  "SG",
  "JP",
  "DE",
  "FR",
  "IE",
  "HK",
  "IN",
  "PH",
  "ZA",
  "AE",
] as const
export type TransactionCountry = (typeof TRANSACTION_COUNTRIES)[number]
export const TRANSACTION_COUNTRY_LABELS: Record<TransactionCountry, string> = {
  AU: "Australia",
  NZ: "New Zealand",
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  SG: "Singapore",
  JP: "Japan",
  DE: "Germany",
  FR: "France",
  IE: "Ireland",
  HK: "Hong Kong",
  IN: "India",
  PH: "Philippines",
  ZA: "South Africa",
  AE: "United Arab Emirates",
}

// ── Documents ───────────────────────────────────────────────────────────────

export const PRIMARY_DOCUMENT_TYPES = [
  "passport",
  "drivers-licence",
  "national-id",
] as const
export type PrimaryDocumentType = (typeof PRIMARY_DOCUMENT_TYPES)[number]
export const PRIMARY_DOCUMENT_TYPE_LABELS: Record<PrimaryDocumentType, string> =
  {
    passport: "Passport",
    "drivers-licence": "Driver's licence",
    "national-id": "National ID card",
  }
export const PRIMARY_DOCUMENT_TYPE_HINTS: Record<PrimaryDocumentType, string> = {
  passport: "Valid or recently expired",
  "drivers-licence": "Front and back photo required",
  "national-id": "Medicare, birth certificate or national ID",
}

export const SECONDARY_DOCUMENT_TYPES = [
  "medicare-card",
  "birth-certificate",
  "citizenship-certificate",
  "bank-statement",
  "utility-bill",
] as const
export type SecondaryDocumentType = (typeof SECONDARY_DOCUMENT_TYPES)[number]
export const SECONDARY_DOCUMENT_TYPE_LABELS: Record<
  SecondaryDocumentType,
  string
> = {
  "medicare-card": "Medicare card",
  "birth-certificate": "Birth certificate",
  "citizenship-certificate": "Citizenship certificate",
  "bank-statement": "Bank statement",
  "utility-bill": "Utility bill",
}
export const SECONDARY_DOCUMENT_TYPE_HINTS: Record<
  SecondaryDocumentType,
  string
> = {
  "medicare-card": "All names as they appear on the card",
  "birth-certificate": "Full certificate, not an extract",
  "citizenship-certificate": "Issued by the Department of Home Affairs",
  "bank-statement": "From the last 3 months",
  "utility-bill": "From the last 3 months",
}

// ── Address lookup ──────────────────────────────────────────────────────────

export type AddressSuggestion = {
  id: string
  line1: string
  suburb: string
  state: string
  postcode: string
  country: string
}

/**
 * Stand-in for the address autocomplete provider. The real flow queries a
 * geocoding service; this is a fixed list so the picker behaves (search,
 * select, confirm) without a network dependency.
 */
const MOCK_ADDRESSES: AddressSuggestion[] = [
  { id: "1", line1: "28 Church Av", suburb: "Mascot", state: "NSW", postcode: "2020", country: "Australia" },
  { id: "2", line1: "28 Ricketty St", suburb: "Mascot", state: "NSW", postcode: "2020", country: "Australia" },
  { id: "3", line1: "28 May St", suburb: "St Peters", state: "NSW", postcode: "2044", country: "Australia" },
  { id: "4", line1: "1 Martin Place", suburb: "Sydney", state: "NSW", postcode: "2000", country: "Australia" },
  { id: "5", line1: "14 Bourke St", suburb: "Melbourne", state: "VIC", postcode: "3000", country: "Australia" },
  { id: "6", line1: "5 Queen St", suburb: "Brisbane", state: "QLD", postcode: "4000", country: "Australia" },
  { id: "7", line1: "42 King William St", suburb: "Adelaide", state: "SA", postcode: "5000", country: "Australia" },
  { id: "8", line1: "77 St Georges Tce", suburb: "Perth", state: "WA", postcode: "6000", country: "Australia" },
  { id: "9", line1: "3 Elizabeth St", suburb: "Hobart", state: "TAS", postcode: "7000", country: "Australia" },
  { id: "10", line1: "9 Northbourne Av", suburb: "Canberra", state: "ACT", postcode: "2601", country: "Australia" },
  { id: "11", line1: "120 Oxford St", suburb: "Paddington", state: "NSW", postcode: "2021", country: "Australia" },
  { id: "12", line1: "16 Chapel St", suburb: "Windsor", state: "VIC", postcode: "3181", country: "Australia" },
]

export function formatAddress(address: AddressSuggestion): string {
  return `${address.line1}, ${address.suburb} ${address.state} ${address.postcode}`
}

/** Substring match across the whole formatted address. Empty query → no rows. */
export function searchAddresses(query: string): AddressSuggestion[] {
  const q = query.trim().toLowerCase()
  if (q.length === 0) return []
  return MOCK_ADDRESSES.filter((a) =>
    formatAddress(a).toLowerCase().includes(q),
  ).slice(0, 5)
}

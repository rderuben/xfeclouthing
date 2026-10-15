import data from "@/data/airlines.json"

// flag: U = URL provided by the team, K = known official site (verify), D = defunct,
// M = merged into another carrier (url = successor), "" = no verified URL (search fallback)
export type Airline = {
  prefix: string
  iata: string
  name: string
  url: string | null
  flag: "U" | "K" | "D" | "M" | ""
}

export const AIRLINES = data as Airline[]

/** Link to open: the known URL, or a "<airline> cargo tracking" web search when none is verified. */
export function trackingUrl(a: Airline): string {
  return a.url ?? `https://www.google.com/search?q=${encodeURIComponent(a.name + " cargo tracking")}`
}

export type AwbParse =
  | { kind: "awb"; prefix: string; serial: string; checkOk: boolean; airline?: Airline }
  | { kind: "text"; matches: Airline[] }

/** Parses an AWB (PPP-NNNNNNNN, dash/space optional) or does a free-text airline search. */
export function search(raw: string): AwbParse {
  const q = raw.trim()
  const digits = q.replace(/[\s-]/g, "")
  if (/^\d{11}$/.test(digits)) {
    const prefix = digits.slice(0, 3)
    const serial = digits.slice(3)
    // IATA check digit: last digit = first 7 digits mod 7
    const checkOk = Number(serial.slice(0, 7)) % 7 === Number(serial[7])
    return { kind: "awb", prefix, serial, checkOk, airline: AIRLINES.find((a) => a.prefix === prefix) }
  }
  const t = q.toLowerCase()
  return {
    kind: "text",
    matches: t ? AIRLINES.filter((a) => a.name.toLowerCase().includes(t) || a.prefix.startsWith(t) || a.iata.toLowerCase() === t) : AIRLINES,
  }
}

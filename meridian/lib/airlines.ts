export type Airline = { prefix: string; name: string; country: string; url: string }

// Official cargo pages (landing / tracking hubs). Verify each URL before production use.
export const AIRLINES: Airline[] = [
  { prefix: "001", name: "American Airlines Cargo", country: "US", url: "https://www.aacargo.com/" },
  { prefix: "006", name: "Delta Cargo", country: "US", url: "https://www.deltacargo.com/" },
  { prefix: "014", name: "Air Canada Cargo", country: "CA", url: "https://www.aircanada.com/cargo" },
  { prefix: "016", name: "United Cargo", country: "US", url: "https://www.unitedcargo.com/" },
  { prefix: "020", name: "Lufthansa Cargo", country: "DE", url: "https://www.lufthansa-cargo.com/" },
  { prefix: "023", name: "FedEx Express", country: "US", url: "https://www.fedex.com/en-us/tracking.html" },
  { prefix: "045", name: "LATAM Cargo", country: "CL", url: "https://www.latamcargo.com/" },
  { prefix: "057", name: "Air France Cargo", country: "FR", url: "https://www.afklcargo.com/" },
  { prefix: "065", name: "Saudia Cargo", country: "SA", url: "https://www.saudiacargo.com/" },
  { prefix: "071", name: "Ethiopian Cargo", country: "ET", url: "https://cargo.ethiopianairlines.com/" },
  { prefix: "074", name: "KLM Cargo", country: "NL", url: "https://www.afklcargo.com/" },
  { prefix: "075", name: "Iberia Cargo (IAG Cargo)", country: "ES", url: "https://www.iagcargo.com/" },
  { prefix: "081", name: "Qantas Freight", country: "AU", url: "https://www.qantasfreight.com/" },
  { prefix: "086", name: "Air New Zealand Cargo", country: "NZ", url: "https://www.airnzcargo.com/" },
  { prefix: "125", name: "British Airways Cargo (IAG Cargo)", country: "GB", url: "https://www.iagcargo.com/" },
  { prefix: "131", name: "Japan Airlines Cargo", country: "JP", url: "https://www.jal.co.jp/jalcargo/en/" },
  { prefix: "134", name: "Avianca Cargo", country: "CO", url: "https://www.aviancacargo.com/" },
  { prefix: "139", name: "Aeroméxico Cargo", country: "MX", url: "https://aeromexicocargo.com.mx/" },
  { prefix: "145", name: "LATAM Cargo", country: "CL", url: "https://www.latamcargo.com/" },
  { prefix: "157", name: "Qatar Airways Cargo", country: "QA", url: "https://www.qrcargo.com/" },
  { prefix: "160", name: "Cathay Cargo", country: "HK", url: "https://www.cathaycargo.com/" },
  { prefix: "172", name: "Cargolux", country: "LU", url: "https://www.cargolux.com/" },
  { prefix: "176", name: "Emirates SkyCargo", country: "AE", url: "https://www.skycargo.com/" },
  { prefix: "180", name: "Korean Air Cargo", country: "KR", url: "https://cargo.koreanair.com/" },
  { prefix: "205", name: "ANA Cargo", country: "JP", url: "https://www.ana.co.jp/en/jp/cargo/" },
  { prefix: "217", name: "Thai Cargo", country: "TH", url: "https://www.thaicargo.com/" },
  { prefix: "235", name: "Turkish Cargo", country: "TR", url: "https://www.turkishcargo.com.tr/" },
  { prefix: "297", name: "China Airlines Cargo", country: "TW", url: "https://cargo.china-airlines.com/" },
  { prefix: "406", name: "UPS Airlines", country: "US", url: "https://www.ups.com/track" },
  { prefix: "607", name: "Etihad Cargo", country: "AE", url: "https://www.etihadcargo.com/" },
  { prefix: "618", name: "Singapore Airlines Cargo", country: "SG", url: "https://www.siacargo.com/" },
  { prefix: "999", name: "Air China Cargo", country: "CN", url: "https://www.airchinacargo.com/" },
]

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
    matches: t ? AIRLINES.filter((a) => a.name.toLowerCase().includes(t) || a.prefix.startsWith(t) || a.country.toLowerCase() === t) : AIRLINES,
  }
}

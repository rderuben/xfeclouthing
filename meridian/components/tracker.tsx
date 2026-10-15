"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle2, Copy, ExternalLink, Search } from "lucide-react"

import { search, type Airline } from "@/lib/airlines"

function AirlineCard({ a, awb }: { a: Airline; awb?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    if (!awb) return
    try {
      await navigator.clipboard.writeText(awb)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-card p-4 shadow-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{a.name}</p>
        <p className="text-sm text-muted-foreground">Prefix {a.prefix} · {a.country}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        {awb && (
          <button onClick={copy} className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-secondary">
            <Copy className="size-4" /> {copied ? "Copied" : "Copy AWB"}
          </button>
        )}
        <a href={a.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90">
          Track <ExternalLink className="size-4" />
        </a>
      </div>
    </div>
  )
}

export function Tracker() {
  const [query, setQuery] = useState("")
  const [submitted, setSubmitted] = useState("")
  const result = search(submitted || query)
  const isAwb = result.kind === "awb"

  return (
    <div className="mx-auto w-full max-w-2xl">
      <form
        onSubmit={(e) => { e.preventDefault(); setSubmitted(query) }}
        className="flex items-center gap-2 rounded-xl border bg-background p-2 shadow-lg"
      >
        <Search className="ml-2 size-5 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSubmitted("") }}
          placeholder="Enter an AWB (e.g. 139-12345675) or search an airline"
          aria-label="AWB number or airline"
          className="h-11 w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        <button type="submit" className="h-11 rounded-lg bg-accent px-5 font-medium text-accent-foreground hover:opacity-90">
          Track
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {isAwb ? (
          <>
            <div className={"flex items-start gap-2 rounded-lg border p-3 text-sm " + (result.checkOk ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800")}>
              {result.checkOk ? <CheckCircle2 className="mt-0.5 size-4" /> : <AlertTriangle className="mt-0.5 size-4" />}
              <span>
                AWB {result.prefix}-{result.serial}: {result.checkOk ? "valid check digit." : "check digit doesn't match, double-check the number."}
              </span>
            </div>
            {result.airline ? (
              <AirlineCard a={result.airline} awb={`${result.prefix}-${result.serial}`} />
            ) : (
              <p className="rounded-lg border p-4 text-sm text-muted-foreground">
                Prefix {result.prefix} isn&apos;t in our directory yet.
              </p>
            )}
          </>
        ) : !query.trim() && !submitted ? null : result.matches.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {result.matches.map((a) => <AirlineCard key={a.prefix} a={a} />)}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">No airlines match “{query}”.</p>
        )}
      </div>
    </div>
  )
}

import { Plane } from "lucide-react"

import { Tracker } from "@/components/tracker"
import { Globe } from "@/components/ui/globe"

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-5">
        <Plane className="size-6 text-accent" />
        <span className="text-xl font-semibold tracking-tight">Meridian</span>
        <span className="hidden text-sm text-muted-foreground sm:inline">· Global Air Cargo Tracking</span>
      </header>

      <section className="relative mx-auto max-w-5xl overflow-hidden px-4 pb-16 pt-10 text-center">
        <h1 className="bg-gradient-to-b from-black to-gray-400/80 bg-clip-text text-5xl font-semibold leading-tight tracking-tight text-transparent sm:text-7xl">
          Track any cargo.<br />Any airline.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Enter an Air Waybill number and Meridian identifies the carrier and takes you to its official tracking page.
        </p>

        <div className="relative mt-10">
          <div className="relative z-10"><Tracker /></div>
          <div className="relative mx-auto mt-[-120px] h-[420px] sm:h-[560px]">
            <Globe className="top-0" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.15),rgba(255,255,255,0))]" />
          </div>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Meridian. Tracking data is provided by each airline&apos;s official site.
      </footer>
    </main>
  )
}

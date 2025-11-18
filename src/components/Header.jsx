import { useMemo } from 'react'

function Header() {
  const tagline = useMemo(() => 'On‑chain escrow and programmable payouts', [])
  return (
    <header className="relative z-10 py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-blue-200">
          Built on trust and transparency
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
          SplitPay
        </h1>
        <p className="mt-4 text-blue-200/90 text-lg md:text-xl max-w-2xl">
          {tagline}. Lock funds until both sides confirm, then release automatically.
        </p>
      </div>
    </header>
  )
}

export default Header

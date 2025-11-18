function Features() {
  const items = [
    {
      title: 'P2P payments via Telegram',
      desc: 'Create, confirm, and release escrows directly from chat commands.'
    },
    {
      title: 'One‑tap splits',
      desc: 'Move funds to a single recipient or split among multiple peers.'
    },
    {
      title: 'Chain‑agnostic',
      desc: 'Start on testnet. Plug into Ethereum, Polygon, Solana or others later.'
    },
    {
      title: 'Activity log',
      desc: 'Clear status from funded to released for auditability.'
    }
  ]

  return (
    <section className="relative z-10 py-16">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-4 gap-6">
        {items.map((f, i) => (
          <div key={i} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5">
            <h3 className="text-white font-semibold">{f.title}</h3>
            <p className="text-blue-200/90 text-sm mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features

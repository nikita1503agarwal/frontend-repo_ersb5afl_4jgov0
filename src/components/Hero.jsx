import { useState } from 'react'

function RecipientRow({ index, value, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-3 items-center">
      <input
        type="email"
        placeholder="recipient@email.com"
        className="col-span-5 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        value={value.email}
        onChange={(e) => onChange({ ...value, email: e.target.value })}
      />
      <input
        type="number"
        min="0"
        max="100"
        step="0.1"
        placeholder="%"
        className="col-span-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        value={value.percentage}
        onChange={(e) => onChange({ ...value, percentage: parseFloat(e.target.value || 0) })}
      />
      <input
        type="text"
        placeholder="wallet (optional)"
        className="col-span-3 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        value={value.wallet}
        onChange={(e) => onChange({ ...value, wallet: e.target.value })}
      />
      <button
        onClick={onRemove}
        className="col-span-1 text-red-300 hover:text-red-200"
      >
        ✕
      </button>
    </div>
  )
}

function Hero() {
  const [title, setTitle] = useState('P2P payment')
  const [description, setDescription] = useState('Send money to a peer and release when confirmed')
  const [payerEmail, setPayerEmail] = useState('me@example.com')
  const [amount, setAmount] = useState(25)
  const [currency, setCurrency] = useState('USDC')
  const [chain, setChain] = useState('testnet')
  const [recipients, setRecipients] = useState([
    { email: 'friend@example.com', percentage: 100, wallet: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [createdId, setCreatedId] = useState('')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const addRecipient = () => setRecipients([...recipients, { email: '', percentage: 0, wallet: '' }])
  const updateRecipient = (i, next) => setRecipients(recipients.map((r, idx) => idx === i ? next : r))
  const removeRecipient = (i) => setRecipients(recipients.filter((_, idx) => idx !== i))

  const createEscrow = async () => {
    setLoading(true)
    setMessage('')
    try {
      // If single recipient with 100%, hit the P2P optimized endpoint
      const isP2P = recipients.length === 1 && recipients[0].percentage === 100
      if (isP2P) {
        const res = await fetch(`${baseUrl}/api/p2p`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payer_email: payerEmail,
            recipient_email: recipients[0].email,
            amount: parseFloat(amount),
            currency,
            chain,
            title,
            description,
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed to create P2P escrow')
        setMessage('P2P escrow created. Share the ID to confirm and release in Telegram.')
        setCreatedId(data.id)
      } else {
        const res = await fetch(`${baseUrl}/api/escrows`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            payer_email: payerEmail,
            total_amount: parseFloat(amount),
            currency,
            chain,
            recipients,
          })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || 'Failed to create escrow')
        setMessage('Escrow created. Share the ID to confirm and release.')
        setCreatedId(data.id)
      }
    } catch (e) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  const confirmAs = async (email) => {
    if (!createdId) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${baseUrl}/api/escrows/${createdId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actor: email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to confirm')
      setMessage(`Confirmation recorded. Status: ${data.status}`)
    } catch (e) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  const release = async () => {
    if (!createdId) return
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${baseUrl}/api/escrows/${createdId}/release`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Failed to release')
      setMessage(`Funds released. Status: ${data.status}`)
    } catch (e) {
      setMessage(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative z-10 pb-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">P2P / Telegram‑first</h2>
            <div className="space-y-3">
              <input className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" />
              <input className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Description" />
              <input type="email" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={payerEmail} onChange={(e)=>setPayerEmail(e.target.value)} placeholder="Your email (payer)" />
              <div className="grid grid-cols-3 gap-3">
                <input type="number" className="col-span-2 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Amount" />
                <select className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={currency} onChange={(e)=>setCurrency(e.target.value)}>
                  <option>USDC</option>
                  <option>USDT</option>
                  <option>ETH</option>
                  <option>BTC</option>
                </select>
              </div>
              <select className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={chain} onChange={(e)=>setChain(e.target.value)}>
                <option value="testnet">Testnet</option>
                <option value="ethereum">Ethereum</option>
                <option value="polygon">Polygon</option>
                <option value="solana">Solana</option>
              </select>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">Recipient</h3>
                  <button onClick={addRecipient} className="text-blue-300 hover:text-white text-sm">+ Add</button>
                </div>
                <div className="space-y-2">
                  {recipients.map((r, i) => (
                    <RecipientRow key={i} index={i} value={r} onChange={(v)=>updateRecipient(i, v)} onRemove={()=>removeRecipient(i)} />
                  ))}
                </div>
              </div>

              <button onClick={createEscrow} disabled={loading} className="w-full mt-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold py-2">
                {loading ? 'Creating...' : 'Create P2P Escrow'}
              </button>

              {createdId && (
                <div className="mt-3 text-blue-200/90 text-sm">
                  Escrow ID: <span className="font-mono text-white">{createdId}</span>
                </div>
              )}
              {message && (
                <div className="mt-3 text-blue-200/90 text-sm">{message}</div>
              )}

              <div className="mt-4 text-blue-200/90 text-sm">
                Tip: In Telegram, use these commands with our bot: <span className="font-mono text-white">/link you@example.com</span>, <span className="font-mono text-white">/pay friend@example.com 25 USDC</span>, <span className="font-mono text-white">/confirm &lt;escrow_id&gt;</span>, <span className="font-mono text-white">/release &lt;escrow_id&gt;</span>.
              </div>
            </div>
          </div>

          <div className="md:pl-6">
            <h2 className="text-2xl font-semibold text-white mb-3">Simulate confirmations</h2>
            <div className="space-y-3">
              <button onClick={()=>confirmAs(payerEmail)} disabled={!createdId || loading} className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold py-2">Confirm as Payer</button>
              {recipients.map((r, i) => (
                <button key={i} onClick={()=>confirmAs(r.email)} disabled={!createdId || loading} className="w-full rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-2">Confirm as {r.email || 'Recipient'}</button>
              ))}
              <button onClick={release} disabled={!createdId || loading} className="w-full rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold py-2">Release Funds</button>

              <div className="mt-6 rounded-xl bg-white/5 ring-1 ring-white/10 p-4 text-blue-200/90 text-sm">
                P2P flow uses a single 100% recipient. Telegram commands let you do the same directly in chat.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

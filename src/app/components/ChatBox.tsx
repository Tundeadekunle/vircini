'use client'
import { useState } from 'react'

export default function ChatBox({ sessionId }: { sessionId: string }) {
  const [message, setMessage] = useState('')
  async function send() {
    if (!message) return
    await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ sessionId, message }), headers: { 'Content-Type': 'application/json' } })
    setMessage('')
  }
  return (
    <div>
      <div className="mb-2">Chat for session {sessionId}</div>
      <div className="flex gap-2">
        <input value={message} onChange={e => setMessage(e.target.value)} className="flex-1 border p-2" />
        <button onClick={send} className="px-3 py-2 bg-blue-600 text-white rounded">Send</button>
      </div>
    </div>
  )
}
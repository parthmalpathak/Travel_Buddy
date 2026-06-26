'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copy}
      className="w-full sm:w-auto bg-primary text-on-primary font-sans text-label-md px-6 py-3 rounded-full hover:bg-primary-container transition-colors shadow-sm flex justify-center items-center gap-2 shrink-0"
    >
      <span>{copied ? 'Copied!' : 'Copy Link'}</span>
      {copied ? <Check className="w-[18px] h-[18px]" /> : <Copy className="w-[18px] h-[18px]" />}
    </button>
  )
}

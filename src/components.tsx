import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'

/** Turns a Blob saved in the database into a URL that <img> or <video> can show. */
export function useObjectUrl(blob?: Blob): string | undefined {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!blob) {
      setUrl(undefined)
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])
  return url
}

export function Media({ blob, type, className }: { blob?: Blob; type?: 'image' | 'video'; className?: string }) {
  const url = useObjectUrl(blob)
  if (!url) return null
  if (type === 'video') {
    return <video className={className} src={url} controls playsInline muted loop />
  }
  return <img className={className} src={url} alt="" />
}

/** Small square preview used in lists. */
export function Thumb({ blob, type, label }: { blob?: Blob; type?: 'image' | 'video'; label: string }) {
  const url = useObjectUrl(blob)
  if (url && type === 'image') return <img className="thumb" src={url} alt="" />
  if (url && type === 'video') return <video className="thumb" src={url} muted playsInline preload="metadata" />
  return <div className="thumb thumb-letter" aria-hidden="true">{label.charAt(0).toUpperCase()}</div>
}

/**
 * Number input that works well on iPhone (numeric keyboard, accepts "1,5" and "1.5").
 */
export function NumberField({
  label,
  value,
  onChange,
  decimal = false,
  suffix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  decimal?: boolean
  suffix?: string
}) {
  const [text, setText] = useState(String(value))

  useEffect(() => {
    const parsed = Number(text.replace(',', '.'))
    if (parsed !== value) setText(String(value))
  }, [value])

  return (
    <label className="field number-field">
      <span className="field-label">{label}</span>
      <span className="number-input">
        <input
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          value={text}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            setText(e.target.value)
            const parsed = Number(e.target.value.replace(',', '.'))
            if (!Number.isNaN(parsed) && parsed >= 0) onChange(decimal ? parsed : Math.round(parsed))
          }}
        />
        {suffix && <span className="suffix">{suffix}</span>}
      </span>
    </label>
  )
}

/** Header for detail and form screens. */
export function TopBar({ title, right }: { title: string; right?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <header className="topbar">
      <button type="button" className="icon-button" onClick={() => navigate(-1)} aria-label="Back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-right">{right}</div>
    </header>
  )
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      <p className="empty-text">{text}</p>
      {action}
    </div>
  )
}

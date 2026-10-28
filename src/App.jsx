import { useEffect, useMemo, useRef, useState } from 'react'
import manifest from './manifest.json'

const TYPE_LABEL = { chat: 'แชท', booking: 'จอง' }
const TYPE_COLOR = { chat: 'var(--color-ocean)', booking: 'var(--color-coral)' }
export default function App() {
  const [type, setType] = useState('all')
  const [query, setQuery] = useState('')
  const [volume, setVolume] = useState(0.8)
  const [playing, setPlaying] = useState(null) // sound id
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)
  const queueRef = useRef([])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  const stop = () => {
    const a = audioRef.current
    if (a) { a.pause(); a.src = '' }
    audioRef.current = null
    queueRef.current = []
    setPlaying(null)
    setProgress(0)
  }

  const play = (sound) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = '' }
    const a = new Audio(sound.src)
    a.volume = volume
    audioRef.current = a
    setPlaying(sound.id)
    setProgress(0)
    a.ontimeupdate = () => setProgress(a.duration ? a.currentTime / a.duration : 0)
    a.onended = () => {
      const next = queueRef.current.shift()
      if (next) setTimeout(() => play(next), 500)
      else { setPlaying(null); setProgress(0) }
    }
    a.play().catch(() => setPlaying(null))
  }

  const playList = (sounds) => {
    if (!sounds.length) return
    const [first, ...rest] = sounds
    queueRef.current = rest
    play(first)
  }

  const visibleSets = useMemo(() => {
    const q = query.trim().toLowerCase()
    return manifest
      .map((set) => ({
        ...set,
        sounds: set.sounds.filter((s) =>
          (type === 'all' || s.type === type) &&
          (!q || s.name.toLowerCase().includes(q) || s.phrase.toLowerCase().includes(q) || set.title.toLowerCase().includes(q)),
        ),
      }))
      .filter((set) => set.sounds.length)
  }, [type, query])

  const total = manifest.reduce((n, s) => n + s.sounds.length, 0)
  const shown = visibleSets.reduce((n, s) => n + s.sounds.length, 0)

  // Space stops the current sound
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space' || e.target.tagName === 'INPUT') return
      e.preventDefault()
      if (audioRef.current) stop()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-sea-100 bg-sea-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
          <h1 className="text-xl font-black tracking-tight">
            Samet Go <span className="font-medium text-sea-700">· ทดสอบเสียงแจ้งเตือน</span>
          </h1>
          <p className="text-sm text-sea-700">{shown} / {total} เสียง</p>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="flex overflow-hidden rounded-full border border-sea-100 bg-white text-sm font-bold">
              {[['all', 'ทั้งหมด'], ['chat', 'แชท'], ['booking', 'จอง']].map(([v, l]) => (
                <button key={v} onClick={() => setType(v)}
                  className={`px-4 py-1.5 transition-colors ${type === v ? 'bg-sea-900 text-white' : 'hover:bg-sea-50'}`}>
                  {l}
                </button>
              ))}
            </div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาชื่อไฟล์ / คำพูด"
              className="w-44 rounded-full border border-sea-100 bg-white px-4 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-brand" />
            <label className="flex items-center gap-2 text-sm font-bold">
              🔊
              <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(+e.target.value)} className="w-24" />
            </label>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {visibleSets.length === 0 && (
          <p className="rounded-2xl bg-white p-8 text-center text-sea-700">
            ไม่มีเสียงที่ตรงกับตัวกรอง — ลองเปลี่ยนประเภทหรือล้างคำค้นหา
          </p>
        )}

        {visibleSets.map((set) => (
          <section key={set.id} className="mb-10">
            <div className="mb-3 flex flex-wrap items-end gap-x-4 gap-y-1">
              <h2 className="text-2xl font-black">{set.title}</h2>
              <p className="text-sm text-sea-700">{set.description}</p>
              <button onClick={() => playList(set.sounds)}
                className="ml-auto rounded-full bg-emerald-brand px-4 py-1.5 text-sm font-bold text-white hover:brightness-95">
                เล่นทั้งชุด ({set.sounds.length})
              </button>
            </div>
            <ul className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_0_var(--color-sea-100)]">
              {set.sounds.map((s) => (
                <SoundRow key={s.id} sound={s} active={playing === s.id} progress={playing === s.id ? progress : 0}
                  onPlay={() => (playing === s.id ? stop() : play(s))} />
              ))}
            </ul>
          </section>
        ))}

        <footer className="mt-12 text-sm text-sea-700">
          กด Space เพื่อหยุดเสียงที่กำลังเล่น · ไฟล์ทั้งหมดอยู่ใน <code>public/sounds/</code>
        </footer>
      </main>
    </div>
  )
}

function SoundRow({ sound, active, progress, onPlay }) {
  const color = TYPE_COLOR[sound.type]
  const r = 18, c = 2 * Math.PI * r
  return (
    <li className={`flex items-center gap-4 border-b border-sea-50 px-4 py-3 last:border-0 ${active ? 'bg-sea-50' : ''}`}>
      <button onClick={onPlay} aria-label={active ? 'หยุด' : 'เล่น'}
        className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-brand"
        style={{ background: color }}>
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" />
          <circle cx="24" cy="24" r={r} fill="none" stroke="white" strokeWidth="3"
            strokeDasharray={c} strokeDashoffset={c * (1 - progress)} style={{ transition: 'stroke-dashoffset 120ms linear' }} />
        </svg>
        {active
          ? <span className="h-3.5 w-3.5 rounded-sm bg-white" />
          : <span className="ml-1 border-y-[7px] border-l-[12px] border-y-transparent border-l-white" />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-bold">{sound.name}</span>
          <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: color }}>{TYPE_LABEL[sound.type]}</span>
          <span className="text-xs text-sea-700">{sound.duration.toFixed(2)} วิ</span>
        </div>
        {(sound.phrase || sound.note) && (
          <p className="truncate text-sm text-sea-700">
            {sound.phrase && <span className="italic">“{sound.phrase}”</span>}
            {sound.phrase && sound.note && ' · '}
            {sound.note}
          </p>
        )}
      </div>
    </li>
  )
}

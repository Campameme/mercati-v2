import type { SVGProps } from 'react'

export function OliveSprig(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12 C 20 12, 44 12, 62 12" />
      <ellipse cx="14" cy="7" rx="4" ry="2.2" transform="rotate(-20 14 7)" fill="currentColor" opacity="0.9" />
      <ellipse cx="22" cy="17" rx="4" ry="2.2" transform="rotate(20 22 17)" fill="currentColor" opacity="0.9" />
      <ellipse cx="32" cy="7" rx="4" ry="2.2" transform="rotate(-20 32 7)" fill="currentColor" opacity="0.9" />
      <ellipse cx="42" cy="17" rx="4" ry="2.2" transform="rotate(20 42 17)" fill="currentColor" opacity="0.9" />
      <ellipse cx="52" cy="7" rx="4" ry="2.2" transform="rotate(-20 52 7)" fill="currentColor" opacity="0.9" />
    </svg>
  )
}

export function WaveDivider(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" {...props}>
      <path d="M0 8 C 12 2, 24 14, 40 8 S 68 2, 80 8 S 108 14, 120 8 S 148 2, 160 8 S 188 14, 200 8" />
    </svg>
  )
}

export function MountainSea(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 60" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" {...props}>
      {/* Monti */}
      <path d="M0 50 L 26 22 L 44 38 L 72 14 L 100 38 L 128 24 L 158 40 L 200 30 L 200 50 Z" fill="currentColor" opacity="0.08" />
      <path d="M0 50 L 26 22 L 44 38 L 72 14 L 100 38 L 128 24 L 158 40 L 200 30" />
      {/* Onda mare */}
      <path d="M0 55 C 20 51, 40 59, 60 55 S 100 51, 120 55 S 160 59, 200 55" opacity="0.9" />
    </svg>
  )
}

export function DoubleRule({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-[2px] ${className}`}>
      <span className="block h-px bg-cream-300" />
      <span className="block h-px bg-cream-300" />
    </div>
  )
}

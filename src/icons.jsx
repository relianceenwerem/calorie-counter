// Lightweight inline SVG icons — no icon library needed.
// stroke="currentColor" so each icon inherits its category color.

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function SunIcon(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

export function BowlIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11h18" />
      <path d="M4 11a8 8 0 0 0 16 0" />
      <path d="M8 11c0-2 1-3 1-4M12 11c0-2 1-3 1-4M16 11c0-2 1-3 1-4" />
    </svg>
  )
}

export function AppleIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 7c-1.5-2-4.5-2.5-6 0-1.5 2.5 0 7 2 9 1 1 2 1 3 .4 1 .6 2 .6 3-.4 2-2 3.5-6.5 2-9-1.5-2.5-4.5-2-6 0Z" />
      <path d="M12 7c0-1.5.5-3 2-4" />
    </svg>
  )
}

export function MoonIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

export function TrashIcon(props) {
  return (
    <svg {...base} width={18} height={18} {...props}>
      <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
    </svg>
  )
}

export function PlusIcon(props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export const CATEGORY_ICONS = {
  Breakfast: SunIcon,
  Lunch: BowlIcon,
  Snack: AppleIcon,
  Dinner: MoonIcon,
}

// A calm accent color per category.
export const CATEGORY_COLORS = {
  Breakfast: '#e0a458', // warm sun
  Lunch: '#7bbf9e', // soft green
  Snack: '#d4796f', // muted apple red
  Dinner: '#6f8fd4', // soft blue
}

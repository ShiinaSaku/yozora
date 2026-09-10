import * as React from "react"
import { m, useMotionTemplate, useMotionValue, useSpring } from "motion/react"

const WASH_SIZE = 560
const CORE_SIZE = 180

/**
 * CursorGlow: soft indigo night-sky glow trailing the pointer site-wide.
 * Native arrow stays. Desktop fine pointers only, skips reduced-motion.
 */
export function CursorGlow() {
  const [enabled, setEnabled] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  const x = useMotionValue(-WASH_SIZE)
  const y = useMotionValue(-WASH_SIZE)

  const washX = useSpring(x, { stiffness: 90, damping: 20, mass: 0.6 })
  const washY = useSpring(y, { stiffness: 90, damping: 20, mass: 0.6 })
  const coreX = useSpring(x, { stiffness: 550, damping: 40, mass: 0.4 })
  const coreY = useSpring(y, { stiffness: 550, damping: 40, mass: 0.4 })

  const washTransform = useMotionTemplate`translate3d(${washX}px, ${washY}px, 0) translate(-50%, -50%)`
  const coreTransform = useMotionTemplate`translate3d(${coreX}px, ${coreY}px, 0) translate(-50%, -50%)`

  React.useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia === "undefined"
    ) {
      return
    }
    const finePointer = window.matchMedia("(pointer: fine) and (hover: hover)")
    const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (!finePointer.matches || calmMotion.matches) {
      return
    }
    setEnabled(true)

    const onMove = (event: MouseEvent) => {
      x.set(event.clientX)
      y.set(event.clientY)
      setVisible(true)
    }
    const onLeave = () => setVisible(false)
    window.addEventListener("mousemove", onMove, { passive: true })
    document.documentElement.addEventListener("mouseleave", onLeave)
    return () => {
      window.removeEventListener("mousemove", onMove)
      document.documentElement.removeEventListener("mouseleave", onLeave)
    }
  }, [x, y])

  if (!enabled) {
    return null
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      <m.div
        className="absolute top-0 left-0"
        style={{
          width: WASH_SIZE,
          height: WASH_SIZE,
          transform: washTransform,
          opacity: visible ? 1 : 0,
          background:
            "radial-gradient(circle, rgba(99,102,241,0.16) 0%, rgba(139,92,246,0.08) 35%, rgba(34,211,248,0.05) 55%, transparent 70%)",
          transition: "opacity 0.4s ease",
        }}
      />
      <m.div
        className="absolute top-0 left-0 rounded-full"
        style={{
          width: CORE_SIZE,
          height: CORE_SIZE,
          transform: coreTransform,
          opacity: visible ? 1 : 0,
          background:
            "radial-gradient(circle, rgba(165,180,252,0.20) 0%, rgba(99,102,241,0.10) 45%, transparent 70%)",
          transition: "opacity 0.25s ease",
        }}
      />
    </div>
  )
}

import { autoUpdate, flip, offset, shift, useFloating, type Placement } from "@floating-ui/react";
import { useEffect, useCallback, useState, useRef } from "react";

// Module-level singleton: tracks the currently open popover and
// allows any new one to close the previous one automatically.
let activePopoverId: string | null = null;
const closeCallbacks = new Map<string, () => void>();

let nextId = 0;
function getNextId() { return String(++nextId); }

interface UsePopoverOptions {
  placement?: Placement
  offsetPx?: number
}

export function usePopover({
  placement = "bottom-end",
  offsetPx = 4
}: UsePopoverOptions = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const idRef = useRef(getNextId())

  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    placement,
    middleware: [
      offset(offsetPx),
      flip(),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  })

  // Register this popover's close callback so the singleton can reach it,
  // and unregister on unmount.
  useEffect(() => {
    const id = idRef.current
    closeCallbacks.set(id, () => setIsOpen(false))
    return () => {
      closeCallbacks.delete(id)
      if (activePopoverId === id) activePopoverId = null
    }
  }, [])

  // Helpers to open/close the popover that components can call.
  // useCallback ensures a stable reference - without it,
  // passing open/close as props to a child component would cause
  // unnecessary re-renders when the parent re-renders.

  const open = useCallback(() => {
    const id = idRef.current
    // Close whichever other popover is currently open
    if (activePopoverId !== null && activePopoverId !== id) {
      closeCallbacks.get(activePopoverId)?.()
    }
    activePopoverId = id
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    if (activePopoverId === idRef.current) activePopoverId = null
    setIsOpen(false)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const id = idRef.current
      if (!prev) {
        // Opening: close the current active popover first
        if (activePopoverId !== null && activePopoverId !== id) {
          closeCallbacks.get(activePopoverId)?.()
        }
        activePopoverId = id
      } else {
        if (activePopoverId === id) activePopoverId = null
      }
      return !prev
    })
  }, [])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      const floating = refs.floating.current
      const reference = refs.reference.current

      if (floating && !floating.contains(e.target as Node) && reference && !(reference as HTMLElement).contains(e.target as Node)) {
        if (activePopoverId === idRef.current) activePopoverId = null
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, refs.floating, refs.reference])

  // Escape click to close
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activePopoverId === idRef.current) activePopoverId = null
        setIsOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])


  return {
    isOpen,
    open,
    close,
    toggle,
    // refs para ligar ao trigger e ao popup
    setReference: refs.setReference,
    setFloating: refs.setFloating,
    // estilos calculados pelo Floating UI
    floatingStyles,
  }
}
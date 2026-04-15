import type React from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode
  containerId?: string
}

const Portal = ({ children, containerId = "popup-container"}: PortalProps) => {
  const container = document.getElementById(containerId)

  if (!container) return null

  return createPortal(children, container)
}

export default Portal
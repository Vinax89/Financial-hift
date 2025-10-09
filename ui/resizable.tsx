/**
 * @fileoverview Resizable panel components using react-resizable-panels
 * @description Split layouts with draggable resize handles (horizontal or vertical)
 */

"use client"

import { GripVertical } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

/**
 * Resizable panel group container
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {'horizontal'|'vertical'} props.direction - Panel layout direction
 * @returns {JSX.Element} Panel group container
 * @example
 * <ResizablePanelGroup direction="horizontal">
 *   <ResizablePanel defaultSize={50}>Panel 1</ResizablePanel>
 *   <ResizableHandle />
 *   <ResizablePanel defaultSize={50}>Panel 2</ResizablePanel>
 * </ResizablePanelGroup>
 */
const ResizablePanelGroup = ({
  className,
  ...props
}) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props} />
)

/** 
 * Resizable panel (child of ResizablePanelGroup)
 * @type {React.ComponentType} 
 * @description Individual panel with size constraints (defaultSize, minSize, maxSize props)
 */
const ResizablePanel = ResizablePrimitive.Panel

/**
 * Draggable resize handle between panels
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.withHandle] - Show visible grip icon
 * @param {string} [props.className] - Additional CSS classes
 * @returns {JSX.Element} Resize handle with optional grip indicator
 */
const ResizableHandle = ({
  withHandle,
  className,
  ...props
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}>
    {withHandle && (
      <div
        className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="h-2.5 w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }


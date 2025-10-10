/**
 * @fileoverview Chart components using Recharts library
 * @description Wrapper components for Recharts with theme support and custom styling
 */

"use client";
import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

/**
 * Theme configuration mapping
 * @constant
 * @type {Object.<string, string>}
 */
const THEMES = {
  light: "",
  dark: ".dark"
}

/**
 * @typedef {Object} ChartConfig
 * @property {string} [label] - Display label
 * @property {string} [color] - Color value
 * @property {Object} [theme] - Theme-specific colors
 * @property {React.ComponentType} [icon] - Icon component
 */

/**
 * Chart configuration interface
 */
export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
    theme?: {
      light?: string;
      dark?: string;
    };
    icon?: React.ComponentType;
  };
}

interface ChartContextValue {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextValue | null>(null)

/**
 * Hook to access chart configuration
 * @returns {{config: ChartConfig}} Chart config object
 * @throws {Error} If used outside ChartContainer
 */
function useChart(): ChartContextValue {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  className?: string;
  children: React.ReactNode;
  config: ChartConfig;
}

/**
 * Chart container with theme and configuration
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.id] - Chart ID for styling
 * @param {string} [props.className] - Additional CSS classes
 * @param {ChartConfig} props.config - Chart configuration (colors, labels, icons)
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element} Responsive chart container
 * @example
 * <ChartContainer config={{
 *   revenue: { label: "Revenue", color: "#3b82f6" }
 * }}>
 *   <LineChart data={data}>
 *     <Line dataKey="revenue" />
 *   </LineChart>
 * </ChartContainer>
 */
const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    (<ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>)
  );
})
ChartContainer.displayName = "Chart"

/**
 * Sanitize CSS color value to prevent XSS injection
 * @param {string} color - Color value to sanitize
 * @returns {string} Sanitized color value
 */
const sanitizeColorValue = (color: string | undefined): string => {
  if (!color || typeof color !== 'string') return '';
  
  // Only allow safe CSS color formats:
  // - Hex colors: #fff, #ffffff, #ffffffff
  // - RGB/RGBA: rgb(255,255,255), rgba(255,255,255,0.5)
  // - HSL/HSLA: hsl(0,0%,100%), hsla(0,0%,100%,0.5)
  // - Named colors: red, blue, transparent, etc.
  // - CSS variables: var(--color-name)
  const safeColorPattern = /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|var\([^)]+\)|[a-z]+)$/;
  
  return safeColorPattern.test(color.trim()) ? color.trim() : '';
};

/**
 * Sanitize CSS selector to prevent injection
 * @param {string} selector - CSS selector key to sanitize
 * @returns {string} Sanitized selector
 */
const sanitizeCSSKey = (key: string | undefined): string => {
  if (!key || typeof key !== 'string') return '';
  
  // Only allow alphanumeric, hyphens, and underscores
  return key.replace(/[^a-zA-Z0-9_-]/g, '');
};

interface ChartStyleProps {
  id: string;
  config: ChartConfig;
}

/**
 * Dynamic CSS variables for chart colors
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Chart ID
 * @param {ChartConfig} props.config - Chart configuration
 * @returns {JSX.Element|null} Style element with CSS variables
 * 
 * @security Input validation applied to all color values and CSS keys
 * to prevent XSS injection attacks. Only safe CSS color formats are allowed.
 */
const ChartStyle = ({
  id,
  config
}: ChartStyleProps) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color)

  if (!colorConfig.length) {
    return null
  }

  // Sanitize chart ID to prevent CSS injection
  const sanitizedId = sanitizeCSSKey(id);

  return (
    (<style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) => {
            const themeStyles = colorConfig
              .map(([key, itemConfig]) => {
                const rawColor = itemConfig.theme?.[theme] || itemConfig.color;
                const sanitizedColor = sanitizeColorValue(rawColor);
                const sanitizedKey = sanitizeCSSKey(key);
                
                return sanitizedColor && sanitizedKey
                  ? `  --color-${sanitizedKey}: ${sanitizedColor};`
                  : null;
              })
              .filter(Boolean)
              .join("\n");
            
            return themeStyles 
              ? `${prefix} [data-chart=${sanitizedId}] {\n${themeStyles}\n}`
              : null;
          })
          .filter(Boolean)
          .join("\n"),
      }} />)
  );
}

/** @type {React.ComponentType} Recharts Tooltip component */
const ChartTooltip = RechartsPrimitive.Tooltip

interface ChartTooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  payload?: any[];
  className?: string;
  indicator?: 'dot' | 'line' | 'dashed';
  hideLabel?: boolean;
  hideIndicator?: boolean;
  label?: string | React.ReactNode;
  labelFormatter?: (value: any, payload: any[]) => React.ReactNode;
  labelClassName?: string;
  formatter?: (value: any, name: string, item: any, index: number, payload: any[]) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
}

/**
 * Custom tooltip content for charts
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.active - Tooltip active state
 * @param {Array} props.payload - Data payload
 * @param {string} [props.className] - Additional CSS classes
 * @param {'dot'|'line'|'dashed'} [props.indicator='dot'] - Indicator style
 * @param {boolean} [props.hideLabel=false] - Hide tooltip label
 * @param {boolean} [props.hideIndicator=false] - Hide color indicator
 * @param {Function} [props.labelFormatter] - Custom label formatter
 * @param {Function} [props.formatter] - Custom value formatter
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element|null} Styled tooltip with indicators
 */
const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>((
  {
    active,
    payload,
    className,
    indicator = "dot",
    hideLabel = false,
    hideIndicator = false,
    label,
    labelFormatter,
    labelClassName,
    formatter,
    color,
    nameKey,
    labelKey,
  },
  ref
) => {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item.dataKey || item.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        (<div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>)
      );
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    (<div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}>
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = color || item.payload.fill || item.color

          return (
            (<div
              key={item.dataKey}
              className={cn(
                "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                indicator === "dot" && "items-center"
              )}>
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent":
                            indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed",
                        })}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor
                          }
                        } />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    )}>
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>)
          );
        })}
      </div>
    </div>)
  );
})
ChartTooltipContent.displayName = "ChartTooltip"

/** @type {React.ComponentType} Recharts Legend component */
const ChartLegend = RechartsPrimitive.Legend

interface ChartLegendContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  hideIcon?: boolean;
  payload?: any[];
  verticalAlign?: 'top' | 'bottom';
  nameKey?: string;
}

/**
 * Custom legend content for charts
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.hideIcon=false] - Hide legend icons
 * @param {Array} props.payload - Legend data
 * @param {'top'|'bottom'} [props.verticalAlign='bottom'] - Vertical alignment
 * @param {string} [props.nameKey] - Key for legend names
 * @param {React.Ref} ref - Forwarded ref
 * @returns {JSX.Element|null} Styled legend with icons
 */
const ChartLegendContent = React.forwardRef<HTMLDivElement, ChartLegendContentProps>((
  { className, hideIcon = false, payload, verticalAlign = "bottom", nameKey },
  ref
) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    (<div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}>
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          (<div
            key={item.value}
            className={cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            )}>
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }} />
            )}
            {itemConfig?.label}
          </div>)
        );
      })}
    </div>)
  );
})
ChartLegendContent.displayName = "ChartLegend"

/**
 * Helper to extract item config from payload
 * @param {ChartConfig} config - Chart configuration
 * @param {Object} payload - Data payload
 * @param {string} key - Config key
 * @returns {Object|undefined} Item configuration
 */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
): ChartConfig[string] | undefined {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey = key

  if (
    key in payload &&
    typeof payload[key] === "string"
  ) {
    configLabelKey = payload[key]
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key]
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}

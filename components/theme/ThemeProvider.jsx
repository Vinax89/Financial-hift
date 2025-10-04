
import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";

const THEME_STORAGE_KEY = "apex-finance:theme";

const ThemeContext = createContext({
  theme: "system",
  actualTheme: "light",
  setTheme: () => {},
  isDark: false,
  isOled: false,
  getGlowColor: (intensity = "medium") => "#0ea5e980",
});

function getSystemPrefersDark() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveActualTheme(theme) {
  if (theme === "system") return getSystemPrefersDark() ? "dark" : "light";
  return theme;
}

function injectBaseThemeVarsOnce() {
  if (typeof document === "undefined") return;
  const id = "apex-base-theme-vars";
  if (document.getElementById(id)) return;

  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    /* Light theme tokens */
    :root[data-theme="light"] {
      --background: 0 0% 100%;
      --foreground: 222.2 47.4% 11.2%;

      --card: 0 0% 100%;
      --card-foreground: 222.2 47.4% 11.2%;

      --popover: 0 0% 100%;
      --popover-foreground: 222.2 47.4% 11.2%;

      --primary: 199 89% 55%;
      --primary-foreground: 210 40% 10%;

      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;

      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;

      --accent: 199 89% 55%;
      --accent-foreground: 210 40% 10%;

      --destructive: 0 84% 60%;
      --destructive-foreground: 210 40% 98%;

      --border: 214.3 31.8% 91.4%;
      --input: 214.3 31.8% 91.4%;
      --ring: 199 89% 55%;
      --radius: 0.75rem;
    }

    /* Dark theme tokens */
    :root[data-theme="dark"] {
      --background: 222.2 84% 4.9%;
      --foreground: 210 40% 98%;

      --card: 222.2 84% 6%;
      --card-foreground: 210 40% 96%;

      --popover: 222.2 84% 6%;
      --popover-foreground: 210 40% 98%;

      --primary: 199 89% 55%;
      --primary-foreground: 222.2 47.4% 11.2%;

      --secondary: 217.2 32.6% 17.5%;
      --secondary-foreground: 210 40% 96%;

      --muted: 217.2 32.6% 17.5%;
      --muted-foreground: 215 20% 65%;

      --accent: 199 89% 55%;
      --accent-foreground: 222.2 47.4% 11.2%;

      --destructive: 0 72% 51%;
      --destructive-foreground: 210 40% 98%;

      --border: 217.2 32.6% 17.5%;
      --input: 217.2 32.6% 17.5%;
      --ring: 199 89% 55%;
      --radius: 0.75rem;
    }
  `;
  document.head.appendChild(style);
}

// Enhance: apply Tailwind dark class + data-theme + OLED vars
function applyRootClassesAndVars(actualTheme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  const shouldDark = actualTheme === "dark" || actualTheme === "oled";
  root.classList.toggle("dark", shouldDark);
  root.setAttribute("data-theme", actualTheme);

  // Ensure base vars are present
  injectBaseThemeVarsOnce();

  // OLED overrides (true black + elevated contrast)
  const styleId = "apex-oled-theme-vars";
  let styleEl = document.getElementById(styleId);

  if (actualTheme === "oled") {
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      :root[data-theme="oled"] {
        --background: 0 0% 0%;
        --foreground: 210 40% 98%;

        --card: 0 0% 0%;
        --card-foreground: 210 40% 95%;

        --popover: 0 0% 0%;
        --popover-foreground: 210 40% 98%;

        --primary: 199 89% 55%;
        --primary-foreground: 210 40% 10%;

        --secondary: 240 6% 10%;
        --secondary-foreground: 210 40% 96%;

        --muted: 240 7% 8%;
        --muted-foreground: 215 20% 70%;

        --accent: 199 89% 55%;
        --accent-foreground: 210 40% 10%;

        --destructive: 0 84% 60%;
        --destructive-foreground: 210 40% 98%;

        --border: 240 6% 12%;
        --input: 240 6% 12%;
        --ring: 199 89% 55%;
        --radius: 0.75rem;
      }
      html[data-theme="oled"], body[data-theme="oled"] {
        background-color: hsl(var(--background));
      }
    `;
  } else if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }
}

function injectGlobalKeyframesOnce() {
  if (typeof document === "undefined") return;
  const id = "apex-theme-global-keyframes";
  if (document.getElementById(id)) return;
  const style = document.createElement("style");
  style.id = id;
  style.textContent = `
    @keyframes shine {
      0% { transform: translateX(-100%); }
      60%, 100% { transform: translateX(200%); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}

export function ThemeProvider({ children, defaultTheme = "system" }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === "undefined") return defaultTheme || "system";
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    try {
      return saved ? JSON.parse(saved) : (saved || defaultTheme || "system");
    } catch {
      return saved || defaultTheme || "system";
    }
  });

  const [actualTheme, setActualTheme] = useState(resolveActualTheme(theme));

  // Expose helpers used by UI components
  const getGlowColor = useCallback((intensity = "medium") => {
    const base = actualTheme === "light" ? "#0ea5e980" : actualTheme === "dark" ? "#38bdf880" : "#7dd3fcA0";
    if (intensity === "subtle") return base.replace(/..$/, "55");
    if (intensity === "strong") return base.replace(/..$/, "FF");
    return base;
  }, [actualTheme]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, typeof t === "string" ? t : JSON.stringify(t));
    }
  }, []); // setThemeState is stable, localStorage is global, so no dependencies needed here.

  // Recalculate actual theme, apply classes/vars when the 'theme' state changes
  useEffect(() => {
    const nextActual = resolveActualTheme(theme);
    setActualTheme(nextActual);
    applyRootClassesAndVars(nextActual);
    injectGlobalKeyframesOnce(); // Ensure keyframes are injected
  }, [theme]);

  // Also respond to system changes when in system mode
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (theme === "system") { // Only react to system changes if the theme is set to "system"
        const nextActual = mq.matches ? "dark" : "light";
        setActualTheme(nextActual);
        applyRootClassesAndVars(nextActual);
      }
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [theme]); // Depend on theme to re-register listener if theme switches from/to "system"

  const value = useMemo(() => ({
    theme,
    actualTheme,
    setTheme,
    isDark: actualTheme === "dark" || actualTheme === "oled",
    isOled: actualTheme === "oled",
    getGlowColor,
  }), [theme, actualTheme, setTheme, getGlowColor]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeProvider;

"use client";

import { Toaster as Sonner, toast } from "sonner";

import { useTheme } from "../theme/ThemeProvider";

const Toaster = ({
  ...props
}) => {
  const { theme = "system", actualTheme } = useTheme();

  const sonnerTheme = (() => {
    if (theme === "system") {
      if (actualTheme === "dark" || actualTheme === "oled") return "dark";
      return "light";
    }
    if (theme === "oled") return "dark";
    return theme;
  })();

  return (
    <Sonner
      theme={sonnerTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };

import React, { useEffect, useState } from "react";
import { Toaster as SonnerToaster, toast } from "sonner";

function resolveTheme() {
  if (typeof document === "undefined") return "light";
  const root = document.documentElement;
  if (root.dataset.theme) return root.dataset.theme;
  return root.classList.contains("dark") ? "dark" : "light";
}

const Toaster = (props) => {
  const [theme, setTheme] = useState(() => resolveTheme());

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    const root = document.documentElement;
    const observer = new MutationObserver(() => setTheme(resolveTheme()));
    observer.observe(root, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => observer.disconnect();
  }, []);

  return (
    <SonnerToaster
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };

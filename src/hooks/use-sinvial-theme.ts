import { useEffect, useState } from "react";

export type SinVialTheme = "dark" | "light";

const THEME_STORAGE_KEY = "sinvial_theme";
const THEME_EVENT = "sinvial-theme-changed";

function getStoredTheme(): SinVialTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

function applyTheme(theme: SinVialTheme) {
  if (theme === "light") {
    document.documentElement.classList.add("light-theme");
  } else {
    document.documentElement.classList.remove("light-theme");
  }
}

export function setSinVialTheme(theme: SinVialTheme) {
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyTheme(theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function useSinVialTheme() {
  const [theme, setThemeState] = useState<SinVialTheme>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const syncTheme = () => setThemeState(getStoredTheme());
    window.addEventListener(THEME_EVENT, syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const setTheme = (nextTheme: SinVialTheme) => {
    setThemeState(nextTheme);
    setSinVialTheme(nextTheme);
  };

  return { theme, setTheme };
}

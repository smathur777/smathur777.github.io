const THEME_KEY = "smathur777-theme";

type Theme = "dark" | "light";

function getStoredTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme): void {
  document.body.classList.toggle("light-mode", theme === "light");
  const button = document.getElementById("theme-toggle");
  if (button) {
    button.textContent = theme === "light" ? "dark mode" : "light mode";
  }
}

function toggleTheme(): void {
  const nextTheme: Theme = document.body.classList.contains("light-mode") ? "dark" : "light";
  localStorage.setItem(THEME_KEY, nextTheme);
  applyTheme(nextTheme);
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getStoredTheme());
  const button = document.getElementById("theme-toggle");
  if (button) {
    button.addEventListener("click", toggleTheme);
  }
});

import { useThemeStore } from "../../store/theme";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center justify-between gap-3 transition-all duration-200 outline-none group ${className}`}
      aria-label="toggle-theme"
      type="button"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <Sun className="w-4 h-4 text-accent-gold" />
        ) : (
          <Moon className="w-4 h-4 text-primary-brown" />
        )}
        <span className={`text-sm font-medium ${isDark ? "text-gray-300 group-hover:text-white" : "text-secondary-brown group-hover:text-primary-brown"}`}>
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      </div>
    </button>
  );
}


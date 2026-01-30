/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Menu,
  Search,
  X,
  LogOut,
  User,
  Sun,
  Moon,
  Home,
  Image,
  Clock,
  Archive,
  Library,
  Mail,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useThemeStore } from "../store/theme";
import { useAuth } from "../admin/components/AuthContext";
import { api } from "../lib/api";
import { useTranslation } from "../context/TranslationContext";
import LanguageMenu from "./LanguageMenu";

const searchSchema = z.object({
  query: z.string().min(1, "Search cannot be empty"),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface SuggestionItem {
  id: string | number;
  title?: string;
  name?: string;
  tree_title?: string;
}

interface SuggestionsState {
  trees: SuggestionItem[];
  people: SuggestionItem[];
}

export default function Navbar() {
  // @ts-ignore - useThemeStore not typed yet
  const { theme, toggleTheme } = useThemeStore();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsState>({ trees: [], people: [] });
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState("");
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef("");
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    // formState: { errors },
    watch,
    setValue,
  } = useForm<SearchFormData>({ resolver: zodResolver(searchSchema) });
  const searchField = register("query");

  const onSubmit = (data: SearchFormData) => {
    setSuggestOpen(false);
    setSidebarOpen(false);
    navigate(`/gallery?q=${encodeURIComponent(data.query)}`);
  };

  const query = watch("query") || "";

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const q = String(query || "").trim();
    latestQueryRef.current = q;

    if (suggestTimerRef.current) {
      clearTimeout(suggestTimerRef.current);
    }

    if (q.length < 2) {
      setSuggestions({ trees: [], people: [] });
      setSuggestOpen(false);
      setSuggestLoading(false);
      setSuggestError("");
      return;
    }

    suggestTimerRef.current = setTimeout(async () => {
      setSuggestLoading(true);
      setSuggestError("");
      try {
        const { data } = await api.get(
          `/search/suggest?q=${encodeURIComponent(q)}`
        );
        if (latestQueryRef.current !== q) return;
        setSuggestions({
          trees: Array.isArray(data?.trees) ? data.trees : [],
          people: Array.isArray(data?.people) ? data.people : [],
        });
        setSuggestOpen(true);
      } catch (err: any) {
        if (latestQueryRef.current !== q) return;
        setSuggestError(
          err.response?.data?.message || "Failed to load suggestions"
        );
        setSuggestions({ trees: [], people: [] });
      } finally {
        if (latestQueryRef.current === q) {
          setSuggestLoading(false);
        }
      }
    }, 300);

    return () => {
      if (suggestTimerRef.current) {
        clearTimeout(suggestTimerRef.current);
      }
    };
  }, [query]);

  const handleSuggestFocus = () => {
    if (String(query || "").trim().length >= 2) {
      setSuggestOpen(true);
    }
  };

  const handleSuggestBlur = () => {
    window.setTimeout(() => setSuggestOpen(false), 150);
  };

  const handlePickSuggestion = (value: string | undefined) => {
    if (!value) return;
    setValue("query", value, { shouldValidate: true });
    setSuggestOpen(false);
    navigate(`/gallery?q=${encodeURIComponent(value)}`);
  };

  // Navigation links with icons for sidebar
  const navLinks = [
    { to: "/", label: t("home", "Home"), icon: Home },
    { to: "/gallery", label: t("gallery", "Gallery"), icon: Image },
    { to: "/periods", label: t("periods", "Periods"), icon: Clock },
    { to: "/sourcesandarchives", label: t("sources_and_archives", "Sources & Archives"), icon: Archive },
    { to: "/library", label: t("library", "Library"), icon: Library },
    { to: "/contact", label: t("contact", "Contact"), icon: Mail },
  ];

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      <header className="navbar-header">

        <div className="navbar-container">
          {/* Left: Hamburger + Logo */}
          <div className="navbar-left">
            {/* Hamburger Button */}
            <button
              type="button"
              className="navbar-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label={t("menu", "Menu")}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="navbar-logo">
              <div className="navbar-logo-icon">
                <BookOpen className="w-7 h-7 xs-500:w-8 xs-500:h-8" />
              </div>
              <div className="navbar-logo-text">
                <span className="navbar-logo-main">Roots</span>
                <span className="navbar-logo-sub">Maghreb</span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation (hidden on mobile) */}
          <nav className="navbar-nav" aria-label="Primary">
            {navLinks.slice(0, 4).map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `navbar-link${isActive ? " active" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `navbar-link${isActive ? " active" : ""}`
                }
              >
                {user?.role === 1
                  ? t("admin", "Admin")
                  : t("dashboard", "Dashboard")}
              </NavLink>
            )}
          </nav>

          {/* Right: Search, Theme, Language, Login */}
          <div className="navbar-right">
            {/* Search - Desktop */}
            <form className="navbar-search" onSubmit={handleSubmit(onSubmit)}>
              <Search className="navbar-search-icon" />
              <input
                {...searchField}
                type="search"
                placeholder={t("search", "Search...")}
                onFocus={handleSuggestFocus}
                onBlur={handleSuggestBlur}
                aria-label={t("search", "Search")}
                className="navbar-search-input"
              />
              {suggestOpen && (
                <div className="navbar-suggestions">
                  {suggestLoading ? (
                    <p className="navbar-suggest-item">{t("loading", "Loading...")}</p>
                  ) : suggestError ? (
                    <p className="navbar-suggest-item text-red-500">{suggestError}</p>
                  ) : suggestions.trees.length || suggestions.people.length ? (
                    <>
                      {suggestions.trees.map((item) => (
                        <button
                          key={`tree-${item.id}`}
                          type="button"
                          className="navbar-suggest-item"
                          onMouseDown={() => handlePickSuggestion(item.title)}
                        >
                          <strong>{item.title}</strong>
                          <span>{t("trees", "Family Trees")}</span>
                        </button>
                      ))}
                      {suggestions.people.map((item) => (
                        <button
                          key={`person-${item.id}`}
                          type="button"
                          className="navbar-suggest-item"
                          onMouseDown={() =>
                            handlePickSuggestion(item.name || "")
                          }
                        >
                          <strong>{item.name || "Unknown"}</strong>
                          <span>
                            {item.tree_title
                              ? `Tree: ${item.tree_title}`
                              : "Person"}
                          </span>
                        </button>
                      ))}
                    </>
                  ) : (
                    <p className="navbar-suggest-item">{t("no_results", "No suggestions")}</p>
                  )}
                </div>
              )}
            </form>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="navbar-icon-btn"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Language Menu */}
            <LanguageMenu buttonClassName="navbar-icon-btn navbar-lang-btn" />

            {/* Login/Logout - Desktop */}
            <div className="navbar-auth">
              {user ? (
                <button
                  type="button"
                  onClick={logout}
                  className="navbar-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("logout", "Logout")}</span>
                </button>
              ) : (
                <Link to="/login" className="navbar-login-btn">
                  <User className="w-4 h-4" />
                  <span>{t("login", "Login")}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        aria-label="Navigation sidebar"
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={closeSidebar}>
            <BookOpen className="w-8 h-8 text-[#d4af37]" />
            <div>
              <span className="sidebar-logo-main">Roots</span>
              <span className="sidebar-logo-sub">Maghreb</span>
            </div>
          </Link>
          <button
            type="button"
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Search */}
        <form className="sidebar-search" onSubmit={handleSubmit(onSubmit)}>
          <Search className="sidebar-search-icon" />
          <input
            {...searchField}
            type="search"
            placeholder={t("search", "Search...")}
            className="sidebar-search-input"
          />
        </form>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">{t("menu", "Menu")}</div>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
              onClick={closeSidebar}
            >
              <Icon className="sidebar-link-icon" />
              <span>{label}</span>
              <ChevronRight className="sidebar-link-arrow" />
            </NavLink>
          ))}
          {user && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `sidebar-link${isActive ? " active" : ""}`
              }
              onClick={closeSidebar}
            >
              <LayoutDashboard className="sidebar-link-icon" />
              <span>
                {user?.role === 1
                  ? t("admin", "Admin Panel")
                  : t("dashboard", "My Dashboard")}
              </span>
              <ChevronRight className="sidebar-link-arrow" />
            </NavLink>
          )}
        </nav>

        {/* Sidebar Actions */}
        <div className="sidebar-actions">
          <div className="sidebar-nav-label">{t("settings", "Settings")}</div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={() => {
              toggleTheme();
            }}
            className="sidebar-action-btn"
          >
            {theme === "dark" ? (
              <Sun className="sidebar-link-icon" />
            ) : (
              <Moon className="sidebar-link-icon" />
            )}
            <span>
              {theme === "dark"
                ? t("light_mode", "Light Mode")
                : t("dark_mode", "Dark Mode")}
            </span>
          </button>

          {/* Language */}
          <LanguageMenu
            buttonClassName="sidebar-action-btn w-full"
            align="left"
          />
        </div>

        {/* Sidebar Footer - Auth */}
        <div className="sidebar-footer">
          {user ? (
            <button
              type="button"
              onClick={() => {
                logout();
                closeSidebar();
              }}
              className="sidebar-logout"
            >
              <LogOut className="w-5 h-5" />
              <span>{t("logout", "Logout")}</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="sidebar-login"
              onClick={closeSidebar}
            >
              <User className="w-5 h-5" />
              <span>{t("login", "Login")}</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Layers,
  TrendingUp,
  Route,
  Grid3X3,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/matrix", label: "Matrix", icon: Grid3X3 },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/frameworks/pact", label: "WACT 4.0", icon: Layers },
  { href: "/frameworks/product-eval", label: "Product Eval", icon: Layers },
  { href: "/markets", label: "Markets", icon: TrendingUp },
  { href: "/assess", label: "Assess", icon: Sparkles },
  { href: "/cuj", label: "CUJ Map", icon: Route },
  { href: "/refresh", label: "Refresh", icon: RefreshCw },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: "#ffffff",
        borderBottom: "1px solid var(--md-sys-color-outline)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0"
            style={{ textDecoration: "none" }}
          >
            <div
              className="w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-lg"
              style={{
                background: "var(--md-sys-color-primary)",
                color: "#ffffff",
                letterSpacing: "0.02em",
              }}
            >
              AF
            </div>
            <span
              className="hidden sm:inline text-sm font-semibold"
              style={{
                color: "var(--md-sys-color-on-surface)",
                letterSpacing: "-0.01em",
              }}
            >
              Agent Factory
            </span>
          </Link>

          {/* Nav items */}
          <div className="flex items-center gap-0.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all rounded-lg"
                  style={{
                    color: isActive
                      ? "var(--md-sys-color-primary)"
                      : "var(--md-sys-color-on-surface-variant)",
                    background: isActive
                      ? "var(--md-sys-color-primary-container)"
                      : "transparent",
                    textDecoration: "none",
                  }}
                >
                  <Icon
                    style={{
                      width: 14,
                      height: 14,
                      color: isActive
                        ? "var(--md-sys-color-primary)"
                        : "var(--md-sys-color-on-surface-variant)",
                      flexShrink: 0,
                    }}
                  />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

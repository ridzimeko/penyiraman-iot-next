"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Settings,
  Calendar,
  History,
  Droplets,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Monitoring",
    href: "/dashboard/monitoring",
    icon: BarChart3,
  },
  {
    name: "Kontrol",
    href: "/dashboard/control",
    icon: Droplets,
  },
  {
    name: "Jadwal",
    href: "/dashboard/schedule",
    icon: Calendar,
  },
  {
    name: "Riwayat",
    href: "/dashboard/history",
    icon: History,
  },
  {
    name: "Pengaturan",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "w-64 bg-white border-r h-screen fixed left-0 top-0 transition-transform z-40",
        "md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-linear-to-r from-green-500 to-blue-500 rounded-lg"></div>
            <div>
              <h2 className="font-bold text-lg">Smart Irrigation</h2>
              <p className="text-xs text-gray-500">Control Panel</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* System Status */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Status Sistem</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-blue-600">Semua sistem berjalan normal</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Spacer for sidebar */}
      <div className="hidden md:block w-64 shrink-0"></div>
    </>
  );
}
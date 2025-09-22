"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Settings, Users, User, Box, Headset, Route } from "lucide-react";

export default function TabBar() {
  const pathname = usePathname();

  const [showTabBar, setShowTabBar] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (token) {
      setShowTabBar(true);
    } else {
      setShowTabBar(false);
    }
    if (storedRole) {
      setRole(storedRole);
    }
  }, [pathname]);

  const lowercaseRole = role?.toLowerCase();
  const adminRole = lowercaseRole === "admin";
  const userRole =
    lowercaseRole && ["maintenance", "ais", "lms"].includes(lowercaseRole);

  const tabs = [
    { href: "/dashboard", label: "Home", icon: Home, show: true },
    {
      href: "/management",
      label: "Management",
      icon: Settings,
      show: adminRole,
    },
    {
      href: "/oncall",
      label: "On Call",
      icon: Headset,
      show: userRole,
    },
    {
      href: "/routine",
      label: "Routine",
      icon: Route,
      show: userRole,
    },
    { href: "/worker", label: "Workers", icon: Users, show: userRole },
    { href: "/assets", label: "Assets", icon: Box, show: userRole },
    { href: "/profile", label: "Profile", icon: User, show: true },
  ];

  if (!showTabBar) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50">
      <ul className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          if (!tab.show) return null;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex flex-col items-center text-xs font-medium transition ${
                  isActive
                    ? "text-[#002D62]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon
                  className={`h-5 w-5 mb-1 ${isActive ? "fill-white" : ""}`}
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

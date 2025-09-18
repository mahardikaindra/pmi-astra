"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Settings, Users, User, Box, Headset, Route } from "lucide-react";

export default function TabBar() {
  const pathname = usePathname();

  // Initialize to false to prevent a flash of the tab bar for logged-out users.
  const [showTabBar, setShowTabBar] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  useEffect(() => {
    // This check runs on the client side after the component mounts
    // and whenever the user navigates to a new page or the pathname changes.
    const token = localStorage.getItem("token");

    // Show the tab bar only if a token exists.
    if (token) {
      setShowTabBar(true);
    } else {
      setShowTabBar(false);
    }
  }, [pathname]);

  const maintainanceRole = role && ["maintainer", "head"].includes(role?.toLowerCase());
  // const adminRole = role && role?.toLowerCase() === "admin";
  const userRole = role && ["maintainer", "head", "spv", "lms", "hse"].includes(role?.toLowerCase());

  const tabs = [
    { href: "/dashboard", label: "Home", icon: Home, show: true },
    // { href: "/management", label: "Management", icon: Settings, show: adminRole },
    {
      href: "/oncall",
      label: "On Call",
      icon: Headset,
      show: maintainanceRole,
    },
    {
      href: "/routine",
      label: "Routine",
      icon: Route,
      show: maintainanceRole,
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

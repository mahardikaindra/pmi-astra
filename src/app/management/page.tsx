// src/app/management/page.tsx
"use client";
import Link from "next/link";
import Header from "@/components/Header";
import { Users, Upload, Layers, Clock, Route, PanelTop } from "lucide-react";

const menus = [
  {
    title: "User",
    description: "User management",
    href: "/management/user",
    icon: Users,
  },
  {
    title: "Bulk Upload",
    description: "Upload Assets & Worker data",
    href: "/management/bulk-upload",
    icon: Upload,
  },
  {
    title: "Group",
    description: "Group management",
    href: "/management/group",
    icon: Layers,
  },
  {
    title: "Shift",
    description: "Shift management",
    href: "/management/shift",
    icon: Clock,
  },
  {
    title: "Jalur",
    description: "Jalur management",
    href: "/management/jalur",
    icon: Route,
  },
  {
    title: "Lajur",
    description: "Lajur management",
    href: "/management/lajur",
    icon: PanelTop,
  },
];

export default function ManagementPage() {
  return (
    <>
    <Header />
    <div className="min-h-screen bg-gray-50 p-8 top-32 pt-25">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-15">
        {menus.map((menu) => (
          <Link
            key={menu.title}
            href={menu.href}
            className="flex items-start gap-4 p-6 bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
          >
            <menu.icon className="w-10 h-10 text-[#002D62]" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {menu.title}
              </h2>
              <p className="text-sm text-gray-600">{menu.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </>
  );
}

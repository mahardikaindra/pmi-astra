import React from "react";
// import ThemeToggle from "./ThemeToggle";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/theme-provider";
import { ArrowLeft, LogOut } from "lucide-react";

interface HeaderProps {
  hasBack?: boolean;
}

const Header = ({ hasBack }: HeaderProps) => {
  const token = localStorage.getItem("token");
  const router = useRouter();
  const { theme } = useTheme();
  return (
    <header
      className={`flex justify-between z-10 fixed top-0 left-0 right-0 items-center p-4 shadow-md ${theme === "light" ? "bg-white text-black" : "bg-[#1A1A1A] text-white"}`}
    >
      {hasBack && (
        <button
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <ArrowLeft size={24} />
        </button>
      )}
      <Image
        src={theme === "light" ? "/SIAP.png" : "/SIAP.png"}
        alt="Astra Logo"
        width={100}
        height={50}
        className="object-contain h-auto"
      />
      <div className="flex items-center space-x-4">
        {/* <ThemeToggle /> */}
        {token && (
          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.push("/");
            }}
            className="mr-4 p-2 rounded-lg hover:bg-[#002D62] dark:hover:bg-[#002D62] transition"
          >
            <LogOut size={24} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

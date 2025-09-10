"use client";
import Header from "@/components/Header";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [router]);

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-100 p-4 top-32 pt-15">
        <div className="bg-white dark:bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <Image
            src="/icon_bar.png"
            alt="Astra Logo"
            width={200}
            height={100}
            className="mx-auto mb-6 object-contain"
          />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-black mb-4">
            Welcome to Safety Integration Asset & Performance!
          </h1>
          <p className="text-gray-600 dark:text-black-300 mb-6">
            Your comprehensive system for routine work information.
          </p>
        </div>
      </div>
    </>
  );
}


const DashboardPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default DashboardPage;
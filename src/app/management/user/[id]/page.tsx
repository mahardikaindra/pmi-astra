"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../../firebaseConfig";
import { useParams, notFound } from "next/navigation";
import Header from "@/components/Header";
import { Pencil } from "lucide-react";

// Extend the Window interface to include __app_id
declare global {
  interface Window {
    __app_id?: string;
  }
}

type UserData = {
  id: string;
  username: string;
  email: string;
  role: string;
};

export default function UserPage() {
  const params = useParams<{ id: string }>();
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [canReadDelete, setCanReadDelete] = useState(false);

  // ✅ Cek role hanya di client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      if (role === "Admin") {
        setCanReadDelete(true);
      }
    }
  }, []);

  // ✅ Ambil data dari Firestore
  useEffect(() => {
    if (!db || !params?.id) return;

    const docPath = `users/${params.id}`;
    const profileDocRef = doc(db, docPath);

    setLoading(true);
    const unsubscribe = onSnapshot(
      profileDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const profile: UserData = {
            id: data.id,
            username: data.username,
            role: data.role,
            email: data.email,
          };
          setProfileData(profile);
        } else {
          setError("Profile not found.");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to fetch data from Firestore.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [params?.id]);

  // ✅ State Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          <p className="mt-4 text-lg">Loading profile data...</p>
        </div>
      </div>
    );
  }

  // ✅ Error handler
  if (error) {
    if (error === "Profile not found.") return notFound();
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-500 p-4">
        <div className="text-center font-semibold">
          Error: {error}
          <p className="text-sm text-gray-500 mt-2">
            Check the console for more details.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Render utama
  return (
    <>
      <Header hasBack />
      <div className="bg-gray-100 min-h-screen flex flex-col items-center p-4 md:p-8 font-sans antialiased top-32 pt-30 z-0">
        <div className="w-full max-w-xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
          <div
            className="relative w-full h-80 bg-cover bg-center rounded-t-2xl flex items-end justify-center pb-4"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
            <div className="z-10 text-white text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                {profileData?.username || "No Name"}
              </h1>
              <p className="text-sm font-light opacity-80">
                {profileData?.email || "-"}
              </p>
            </div>
          </div>

          <div className="p-6">
            {/* Info dasar */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-gray-700">
              {[
                ["Username", profileData?.username],
                ["Role", profileData?.role],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-gray-500">
                    {label}
                  </span>
                  <span className="text-sm font-medium">{value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tombol edit hanya jika role = SPV/Head */}
      {canReadDelete && profileData?.id && (
        <Link
          href={`/user/${profileData.id}/edit`}
          className="fixed bottom-6 right-6 bg-[#002D62] hover:bg-[#002D62] text-white p-4 rounded-full shadow-lg flex items-center justify-center mb-12"
          title="Edit User"
        >
          <Pencil className="h-6 w-6" />
        </Link>
      )}
    </>
  );
}

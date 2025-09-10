"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { useParams, notFound } from "next/navigation";
import Header from "@/components/Header";
import { Pencil } from "lucide-react";

// extend window untuk appId
declare global {
  interface Window {
    __app_id?: string;
  }
}

type AssetData = {
  id: string;
  image?: string;
  address?: string;
  assets?: string;
  condition?: string;
  facility?: string;
  floor?: string;
  last_replace_part?: string;
  latitude?: string;
  longitude?: string;
  merk?: string;
  technical_data?: string;
  initial_date?: string;
  last_maintenance?: string;
};

export default function ViewAssetPage() {
  const params = useParams<{ id: string }>();
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [canEdit, setCanEdit] = useState(false);

  // cek role
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      if (role === "SPV" || role === "Head") {
        setCanEdit(true);
      }
    }
  }, []);

  // ambil data Firestore realtime
  useEffect(() => {
    if (!db || !params?.id) return;

    const appId =
      typeof window !== "undefined" && window.__app_id
        ? window.__app_id
        : "Ij8HEOktiALS0zjKB3ay";

    const docPath = `artifacts/${appId}/assets/${params.id}`;
    const assetDocRef = doc(db, docPath);

    setLoading(true);
    const unsubscribe = onSnapshot(
      assetDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as AssetData;
          setAssetData({ ...data, id: params.id });
        } else {
          setError("Asset not found.");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firestore error:", err);
        setError("Failed to fetch asset data.");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [params?.id]);

  // loading state
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="mt-4 text-lg">Loading asset data...</p>
        </div>
      </div>
    );
  }

  // error state
  if (error) {
    if (error === "Asset not found.") return notFound();
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-500 p-4">
        <div className="text-center font-semibold">
          Error: {error}
          <p className="text-sm text-gray-500 mt-2">
            Check console for more details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header hasBack />
      <div className="bg-gray-100 min-h-screen flex flex-col items-center p-4 md:p-8 font-sans antialiased top-32 pt-30 z-0">
        <div className="w-full max-w-xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
          <div
            className="relative w-full h-80 bg-cover bg-center rounded-t-2xl flex items-end justify-center pb-4"
            style={{
              backgroundImage: `url('${
                assetData?.image || "/placeholder.png"
              }')`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
            <div className="z-10 text-white text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                {assetData?.assets || "No Name"}
              </h1>
              <p className="text-sm font-light opacity-80">
                {assetData?.merk || "Unknown Merk"}
              </p>
            </div>
          </div>

          <div className="p-6">
            {/* Detail asset */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-gray-700">
              {[
                ["Alamat", assetData?.address],
                ["Aset", assetData?.assets],
                ["Merk", assetData?.merk],
                ["Fasilitas", assetData?.facility],
                // ["Lantai", assetData?.floor],
                ["Kondisi", assetData?.condition],
                ["Part Diganti", assetData?.last_replace_part],
                // ["Latitude", assetData?.latitude],
                // ["Longitude", assetData?.longitude],
                ["Data Teknis", assetData?.technical_data],
                ["Tanggal Awal", assetData?.initial_date],
                ["Last Maintenance", assetData?.last_maintenance],
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

        <footer className="w-full max-w-xl text-center text-sm text-gray-500 p-2">
          <p>
            Asset ID:{" "}
            <span className="font-mono text-gray-700">
              {assetData?.id || "Not found"}
            </span>
          </p>
        </footer>
      </div>

      {/* Tombol edit hanya jika role = SPV/Head */}
      {canEdit && assetData?.id && (
        <Link
          href={`/assets/${assetData.id}/edit`}
          className="fixed bottom-6 right-6 bg-[#002D62] hover:bg-[#002D62] text-white p-4 rounded-full shadow-lg flex items-center justify-center mb-12"
          title="Edit Asset"
        >
          <Pencil className="h-6 w-6" />
        </Link>
      )}
    </>
  );
}

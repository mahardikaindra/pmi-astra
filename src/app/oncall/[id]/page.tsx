"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { useParams, notFound } from "next/navigation";
import Header from "@/components/Header";
import { Star, Pencil } from "lucide-react";

// Extend the Window interface to include __app_id
declare global {
  interface Window {
    __app_id?: string;
  }
}

type ProfileData = {
  id: string;
  age: string;
  area: string;
  contractor: string;
  license1: string;
  license2: string;
  name: string;
  photo: string;
  point_reward?: number;
  position: string;
  punishment?: string;
  information?: string;
  sik?: string;
  rating?: number;
};

export default function WorkerPage() {
  const params = useParams<{ id: string }>();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [canReadDelete, setCanReadDelete] = useState(false);

  // ✅ Cek role hanya di client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("role");
      if (role === "SPV" || role === "Head") {
        setCanReadDelete(true);
      }
    }
  }, []);

  // ✅ Ambil data dari Firestore
  useEffect(() => {
    if (!db || !params?.id) return;

    const appId =
      typeof window !== "undefined" && window.__app_id
        ? window.__app_id
        : "Ij8HEOktiALS0zjKB3ay";

    const docPath = `artifacts/${appId}/users/${params.id}`;
    const profileDocRef = doc(db, docPath);

    setLoading(true);
    const unsubscribe = onSnapshot(
      profileDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const profile: ProfileData = {
            id: data.id,
            age: data.age,
            area: data.area,
            contractor: data.contractor,
            license1: data.license1,
            license2: data.license2,
            name: data.name,
            photo: data.photo,
            point_reward: data.point_reward,
            position: data.position,
            punishment: data.punishment,
            sik: data.sik,
            rating: data.rating,
            information: data.information,
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
      <div className="bg-gray-100 min-h-screen flex flex-col items-center p-4 md:p-8 font-sans antialiased">
        <div className="w-full max-w-xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden mb-8">
          <div
            className="relative w-full h-80 bg-cover bg-center rounded-t-2xl flex items-end justify-center pb-4"
            style={{ backgroundImage: `url('${profileData?.photo}')` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
            <div className="z-10 text-white text-center">
              <h1 className="text-2xl font-bold tracking-tight">
                {profileData?.name || "No Name"}
              </h1>
              <p className="text-sm font-light opacity-80">
                {profileData?.position || "Unknown Position"}
              </p>
            </div>
          </div>

          <div className="p-6">
            {/* Info dasar */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-gray-700">
              {[
                ["ID", profileData?.id],
                ["Kontraktor", profileData?.contractor],
                ["Posisi", profileData?.position],
                ["Nama", profileData?.name],
                ["Usia", profileData?.age],
                ["Area", profileData?.area],
                ["Hukuman", profileData?.punishment],
                ["Keterangan", profileData?.information],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-gray-500">
                    {label}
                  </span>
                  <span className="text-sm font-medium">{value || "-"}</span>
                </div>
              ))}
            </div>

            {/* ⭐ Rating */}
            {profileData?.rating && (
              <div className="mt-6 flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Rating
                </span>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        (profileData?.rating || 0) >= star
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 📜 Dokumen */}
            {(profileData?.license1 ||
              profileData?.license2 ||
              profileData?.sik) && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {profileData?.license1 && (
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">
                      Lisensi
                    </h3>
                    {profileData.license1.endsWith(".pdf") ? (
                      <a
                        href={profileData.license1}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        View Lisensi (PDF)
                      </a>
                    ) : (
                      <Image
                        src={profileData.license1}
                        alt="Lisensi"
                        className="w-full h-auto rounded-xl shadow-lg border border-gray-200 object-cover"
                        width={600}
                        height={400}
                      />
                    )}
                  </div>
                )}
                {profileData?.license2 && (
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">
                      Sertifikat
                    </h3>
                    {profileData.license2.endsWith(".pdf") ? (
                      <a
                        href={profileData.license2}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        View Sertifikat (PDF)
                      </a>
                    ) : (
                      <Image
                        src={profileData.license2}
                        alt="Sertifikat"
                        className="w-full h-auto rounded-xl shadow-lg border border-gray-200 object-cover"
                        width={600}
                        height={400}
                      />
                    )}
                  </div>
                )}
                {profileData?.sik && (
                  <div className="flex flex-col items-center">
                    <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">
                      SIK
                    </h3>
                    {profileData.sik.endsWith(".pdf") ? (
                      <a
                        href={profileData.sik}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm"
                      >
                        View SIK (PDF)
                      </a>
                    ) : (
                      <Image
                        src={profileData.sik}
                        alt="SIK"
                        className="w-full h-auto rounded-xl shadow-lg border border-gray-200 object-cover"
                        width={600}
                        height={400}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="w-full max-w-xl text-center text-sm text-gray-500 p-2">
          <p>
            Current User ID:{" "}
            <span className="font-mono text-gray-700">
              {profileData?.id || "Not signed in"}
            </span>
          </p>
        </footer>
      </div>

      {/* Tombol edit hanya jika role = SPV/Head */}
      {canReadDelete && profileData?.id && (
        <Link
          href={`/worker/${profileData.id}/edit`}
          className="fixed bottom-6 right-6 bg-[#002D62] hover:bg-[#002D62] text-white p-4 rounded-full shadow-lg flex items-center justify-center"
          title="Edit OnCall"
        >
          <Pencil className="h-6 w-6" />
        </Link>
      )}
    </>
  );
}

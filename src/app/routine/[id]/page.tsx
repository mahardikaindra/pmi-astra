/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { db } from "../../../../firebaseConfig";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";

function ViewRoutinePage() {
  const router = useRouter();
  const params = useParams(); // ambil :id
  const { id } = params as { id: string };

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Ambil data dari Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(
          db,
          "artifacts",
          "Ij8HEOktiALS0zjKB3ay",
          "routine",
          id,
        );
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setData(snap.data());
        } else {
          alert("Data tidak ditemukan ❌");
          router.push("/routine");
        }
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 mb-20">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Detail Routine
          </h1>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tanggal, Jam</p>
              <p className="text-xm font-medium text-gray-500">
                {data.date &&
                  (() => {
                    const dateObj = data.date.toDate();
                    const options: Intl.DateTimeFormatOptions = {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    };
                    return `${dateObj.toLocaleDateString("id-ID", options)} WIB`;
                  })()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Personil</p>
              <p className="text-xm font-medium text-gray-500">
                {data?.personil ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Lokasi</p>
              <p className="text-xm font-medium text-gray-500">
                {data?.location ?? "-"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Latitude</p>
                <p className="text-xm font-medium text-gray-500">
                  {data?.latitude ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Longitude</p>
                <p className="text-xm font-medium text-gray-500">
                  {data?.longitude ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Akurasi</p>
                <p className="text-xm font-medium text-gray-500">
                  {data?.akurasi ?? "0"} meters
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Deskripsi</p>
              <p className="text-xm font-medium text-gray-500 whitespace-pre-line">
                {data?.deskripsi ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Hasil Routine</p>
              <p className="text-xm font-medium text-gray-500 whitespace-pre-line">
                {data?.result ?? "-"}
              </p>
            </div>

            {data?.dokumentasi && (
              <div>
                <p className="text-sm text-gray-500">Dokumentasi</p>
                <Image
                  src={data.dokumentasi}
                  alt="Dokumentasi"
                  className="mt-2 w-full h-64 object-cover rounded-lg border"
                  width={400}
                  height={400}
                />
              </div>
            )}

            {data?.updatedAt && (
              <div>
                <p className="text-sm text-gray-500">Terakhir Diperbarui</p>
                <p className="text-xm font-medium text-gray-500">
                  {new Date(data.updatedAt.seconds * 1000).toLocaleString(
                    "id-ID",
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewRoutinePage;

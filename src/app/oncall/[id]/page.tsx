/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { db } from "../../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getLocalStorageToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  useEffect(() => {
    const token = getLocalStorageToken();
    if (!token) {
      router.push("/");
    }
  }, [router]);

  // Ambil data berdasarkan ID
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "oncall", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const docData = snap.data();
          setData({
            ...docData,
            tanggal: docData.tanggal?.toDate().toLocaleDateString("id-ID") || "-",
          });
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return <p className="pt-24 text-center">Loading...</p>;
  }

  if (!data) {
    return <p className="pt-24 text-center text-red-500">Data tidak ditemukan ❌</p>;
  }

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Detail OnCall</h1>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Tanggal</p>
              <p className="text-base font-semibold text-gray-800">{data.tanggal}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Group / Tim</p>
              <p className="text-base font-semibold text-gray-800">{data.group}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Lokasi</p>
              <p className="text-base font-semibold text-gray-800">{data.location}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Shift</p>
              <p className="text-base font-semibold text-gray-800">{data.shift}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Departement</p>
              <p className="text-base font-semibold text-gray-800">{data.departement}</p>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => router.push(`/oncall/${id}/edit`)}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Edit
            </button>
            <button
              onClick={() => router.push("/oncall")}
              className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const ViewOnCallPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default ViewOnCallPage;

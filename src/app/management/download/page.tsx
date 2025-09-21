/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { db } from "../../../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import * as XLSX from "xlsx";
import Header from "@/components/Header";
import dynamic from "next/dynamic";

const collections = [
  "users",
  "assets",
  "oncall",
  "routine",
  "jalur",
  "lajur",
  "shift",
  "group",
];

function PageComponent() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (colName: string) => {
    setLoading(colName);
    try {
      // Ambil data dari Firestore
      const colRef = collection(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", colName);
      const snapshot = await getDocs(colRef);

      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });

      if (data.length === 0) {
        alert(`Tidak ada data di ${colName}`);
        setLoading(null);
        return;
      }

      // Buat worksheet dari data
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, colName);

      // Simpan ke file Excel
      XLSX.writeFile(workbook, `${colName}.xlsx`);
    } catch (err) {
      console.error("Error exporting data:", err);
      alert(`Gagal export data ${colName} ❌`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Header hasBack />
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Download Data (Excel)
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((col) => (
            <div
                key={col}
                className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
            >
                <span className="font-medium text-gray-700 capitalize">
                {col}
                </span>
                <button
                onClick={() => handleExport(col)}
                disabled={loading === col}
                className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                    loading === col
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                >
                {loading === col ? "Mengunduh..." : "Download"}
                </button>
            </div>
            ))}
        </div>
        </div>
    </div>
  );
}


const DownloadPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default DownloadPage;

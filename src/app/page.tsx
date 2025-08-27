"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

interface Worker {
  id: string;
  name: string;
  age: number;
  area: string;
  contractor: string;
  point_reward: number;
  position: string;
  punishment: string;
  photo?: string;
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Ambil semua data workers dari subcollection profiles
  const fetchWorkers = async () => {
    try {
      const usersCol = collection(db, "artifacts/Ij8HEOktiALS0zjKB3ay/users");
      const userDocs = await getDocs(usersCol);
      console.log("User Docs:", userDocs.docs);
      const allWorkers: Worker[] = [];

      for (const userDoc of userDocs.docs) {
        const profilesCol = collection(
          db,
          `artifacts/Ij8HEOktiALS0zjKB3ay/users/${userDoc.id}/profiles`,
        );
        const profileDocs = await getDocs(profilesCol);

        profileDocs.forEach((profileDoc) => {
          if (profileDoc.exists()) {
            allWorkers.push(profileDoc.data() as Worker);
          }
        });
      }

      setWorkers(allWorkers);
    } catch (error) {
      console.error("Error fetching workers:", error);
      alert("Gagal memuat data pegawai ❌");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Hapus worker
  const handleDelete = async (workerId: string) => {
    if (!confirm("Yakin ingin menghapus pegawai ini?")) return;

    try {
      await deleteDoc(
        doc(
          db,
          `artifacts/Ij8HEOktiALS0zjKB3ay/users/${workerId}/profiles/my-profile`,
        ),
      );
      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
      alert("Worker berhasil dihapus ✅");
    } catch (error) {
      console.error("Error deleting worker:", error);
      alert("Gagal menghapus ❌");
    }
  };

  // 🔹 Generate QR Code to redirect detail worker/[id]
  const generateQRCode = (worker: Worker) => {
    // URL halaman detail worker
    const workerUrl = `https://pmi-astra.vercel.app/workers/${worker.id}`;

    // Gunakan API qrserver untuk generate QR dari URL ini
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      workerUrl,
    )}&size=200x200`;

    // Tampilkan QR Code di tab baru
    window.open(qrCodeUrl, "_blank");
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Daftar Pegawai</h1>
          <Link
            href="/workers/add"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Tambah Pegawai
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Nama</th>
                <th className="px-4 py-2 text-left">Posisi</th>
                <th className="px-4 py-2 text-left">Area</th>
                <th className="px-4 py-2 text-left">Kontraktor</th>
                <th className="px-4 py-2 text-left">Reward</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    Belum ada pegawai
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id} className="border-t text-gray-600">
                    <td className="px-4 py-2">{worker.id}</td>
                    <td className="px-4 py-2 flex items-center gap-2">
                      {worker.photo && (
                        <Image
                          width={32}
                          height={32}
                          src={worker.photo}
                          alt={worker.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      {worker.name}
                    </td>
                    <td className="px-4 py-2">{worker.position}</td>
                    <td className="px-4 py-2">{worker.area}</td>
                    <td className="px-4 py-2">{worker.contractor}</td>
                    <td className="px-4 py-2">{worker.point_reward}</td>
                    <td className="px-4 py-2 flex gap-2">
                      <Link
                        href={`/workers/${worker.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(worker.id)}
                        className="text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => generateQRCode(worker)}
                        className="text-green-600 hover:underline"
                      >
                        Genertae QR Code
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

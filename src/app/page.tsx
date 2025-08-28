"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { Pencil, Trash2, QrCode } from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";

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
  sik?: string;
  licenses?: string[];
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const usersCol = collection(db, "artifacts/Ij8HEOktiALS0zjKB3ay/users");
        const usersSnap = await getDocs(usersCol);

        const workersData: Worker[] = usersSnap.docs.map((docSnap) => {
          const data = docSnap.data() as Worker;
          const { id, ...restData } = data;
          return {
            id: docSnap.id,
            ...restData,
          };
        });

        setWorkers(workersData);
      } catch (e) {
        console.error("Error fetching workers:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus worker ini?")) return;

    try {
      // hapus dokumen dari Firestore
      const docRef = doc(
        db,
        `artifacts/Ij8HEOktiALS0zjKB3ay/users/${id}`
      );
      await deleteDoc(docRef);

      // update state agar UI langsung refresh
      setWorkers((prev) => prev.filter((w) => w.id !== id));

      alert("Worker berhasil dihapus ✅");
    } catch (error) {
      console.error("Error deleting worker:", error);
      alert("Gagal menghapus worker ❌");
    }
  };

  const generateQRCode = (worker: Worker) => {
    const workerUrl = `https://pmi-astra.vercel.app/worker/${worker.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      workerUrl,
    )}&size=200x200`;

    window.open(qrCodeUrl, "_blank");
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <>
      <nav className="w-full bg-white p-4 flex items-center justify-between">
        <Image
          src="/icon_bar.png"
          alt="Astra Logo"
          width={200}
          height={50}
          className="object-contain"
        />
      </nav>
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-xl font-bold mb-4 text-gray-800">Daftar Pegawai</h1>

        <div className="space-y-4">
          {workers.map((worker) => (
            <div
              key={worker.id}
              onClick={() => router.push(`/worker/${worker.id}`)}
              className="bg-white shadow rounded-xl p-4 flex items-center gap-4"
            >
              {/* Foto Worker */}
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                {worker.photo ? (
                  <Image
                    src={worker.photo}
                    alt={worker.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No Photo
                  </div>
                )}
              </div>

              {/* Info Worker */}
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800">
                  {worker.name}
                </h2>
                <p className="text-sm text-gray-600">{worker.position}</p>
                <p className="text-xs text-gray-500">
                  {worker.area} • {worker.contractor}
                </p>
                <p className="text-xs text-gray-500">
                  Reward: {worker.point_reward} | Age: {worker.age}
                </p>
              </div>

              {/* Aksi */}
              <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                <Link
                  href={`/worker/${worker.id}/edit`}
                  title="Edit"
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Pencil size={20} />
                </Link>
                <button
                  onClick={() => handleDelete(worker.id)}
                  title="Delete"
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => generateQRCode(worker)}
                  title="QR Code"
                  className="text-gray-600 hover:text-green-600"
                >
                  <QrCode size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

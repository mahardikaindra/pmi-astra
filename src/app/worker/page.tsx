/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { db, auth } from "../../../firebaseConfig";
import { collection, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Pencil, Trash2, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useTheme } from "../theme-provider";

interface Worker {
  id?: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  // 🔐 Cek user login dan ambil role dari Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/"); // redirect ke login kalau belum login
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userRole = userData.role || "USER";
          setRole(userRole);

          // 🚀 Bisa cache di localStorage tapi bukan sumber utama
          localStorage.setItem("role", userRole);

          // Fetch data hanya kalau user punya role
          fetchWorkers();
        } else {
          console.error("User data tidak ditemukan di Firestore");
          router.push("/");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchWorkers = async () => {
    try {
      const usersCol = collection(db, "artifacts/Ij8HEOktiALS0zjKB3ay/users");
      const usersSnap = await getDocs(usersCol);

      const workersData: Worker[] = usersSnap.docs.map((docSnap) => {
        const data = docSnap.data() as Worker;
        return { id: docSnap.id, ...data };
      });

      setWorkers(workersData);
    } catch (e) {
      console.error("Error fetching workers:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus worker ini?")) return;

    try {
      const docRef = doc(db, `artifacts/Ij8HEOktiALS0zjKB3ay/users/${id}`);
      await deleteDoc(docRef);

      setWorkers((prev) => prev.filter((w) => w.id !== id));
      alert("Worker berhasil dihapus ✅");
    } catch (error) {
      alert("Gagal menghapus worker ❌");
    }
  };

  const generateQRCode = (worker: Worker) => {
    const workerUrl = `https://pmi-astra.vercel.app/worker/${worker.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
      workerUrl
    )}&size=200x200`;

    window.open(qrCodeUrl, "_blank");
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;
  // 🔐 Contoh: hanya role tertentu yang boleh delete
  const canReadDelete = role === "SPV" || role === "Head";

  return (
    <>
      <Header />
      <div className={`${theme === "light" ? "bg-white" : "bg-[#1A1A1A]"} p-4`}>
        <div className="relative">
          <input
            type="text"
            placeholder="Search workers by name or ID..."
            className={`w-full p-2 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === "light"
                ? "text-black"
                : "text-white bg-gray-700 border-gray-600"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-xl font-bold mb-4 text-gray-800">Daftar Pegawai</h1>

        <div className="space-y-4">
          {workers
            .filter(
              (worker) =>
                worker.name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) || (worker.id && worker.id.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            .map((worker) => (
              <div
                key={worker.id}
                onClick={() => router.push(`/worker/${worker.id}`)}
                className="bg-white shadow rounded-xl p-4 flex items-center gap-4 cursor-pointer"
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
                <div
                  className="flex flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canReadDelete && (<Link
                    href={`/worker/${worker.id}/edit`}
                    title="Edit"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    <Pencil size={20} />
                  </Link>)}
                  {canReadDelete && (
                    <button
                      onClick={() => worker.id && handleDelete(worker.id)}
                      title="Delete"
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
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
      <Link
        href="/worker/add"
        className="fixed bottom-6 right-6 bg-[#002D62] text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
        title="Add New Worker"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </>
  );
}

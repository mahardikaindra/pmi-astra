"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db, auth } from "../../../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useTheme } from "../theme-provider";
import CustomPopup from "@/components/CustomPopUp";

interface Routine {
  id?: string;
  indikator: string;
  jalan_tol: string;
}

export default function RoutinePage() {
  const [routine, setRoutine] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  // 👉 tambahan state untuk popup
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Routine | null>(null);

  // 🔐 Cek user login dan ambil role dari Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const userRole = userData.role || "USER";
          setRole(userRole);
          localStorage.setItem("role", userRole);

          fetchRoutine();
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchRoutine = async () => {
    try {
      const usersCol = collection(db, "artifacts/Ij8HEOktiALS0zjKB3ay/routine");
      const usersSnap = await getDocs(usersCol);

      const oncallData: Routine[] = usersSnap.docs.map((docSnap) => {
        const data = docSnap.data() as Routine;
        return { id: docSnap.id, ...data };
      });

      setRoutine(oncallData);
    } catch (e) {
      console.error("Error fetching routine:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ confirm delete
  const handleConfirm = async () => {
    if (!selectedWorker?.id) return;

    try {
      const docRef = doc(
        db,
        `artifacts/Ij8HEOktiALS0zjKB3ay/users/${selectedWorker.id}`,
      );
      await deleteDoc(docRef);

      setRoutine((prev) => prev.filter((w) => w.id !== selectedWorker.id));
      setIsOpen(false);
      setSelectedWorker(null);
      alert("Routine berhasil dihapus ✅");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus routine ❌");
    }
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;

  const canReadDelete = role === "Maintainer" || role === "Head";

  return (
    <>
      <Header />
      <div
        className={`${theme === "light" ? "bg-white" : "bg-[#1A1A1A]"} p-4 fixed top-15 left-0 right-0 z-20`}
      >
        <input
          type="text"
          placeholder="Search routine by name or ID..."
          className={`w-full p-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === "light"
              ? "text-black border-gray-300"
              : "text-white bg-gray-700 border-gray-600"
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="min-h-screen bg-gray-100 p-4 top-32 pt-45">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold mb-4 text-gray-800">List Routine</h1>
          {canReadDelete && (
            <Link
              href="/routine/add"
              className="bg-[#002D62] text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              + Add Routine
            </Link>
          )}
        </div>
        <div className="space-y-4 mb-12">
          {routine
            .filter(
              (routine) =>
                routine.indikator
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                (routine.id &&
                  routine.id.toLowerCase().includes(searchTerm.toLowerCase())),
            )
            .map((routine) => (
              <div
                key={routine.id}
                onClick={() => router.push(`/routine/${routine.id}`)}
                className="bg-white shadow rounded-xl p-4 flex items-center gap-4 cursor-pointer"
              >
                {/* Info Routine */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {routine.indikator}
                  </h2>
                  <p className="text-xs text-gray-500">{routine.jalan_tol}</p>
                </div>

                {/* Aksi */}
                <div
                  className="flex flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canReadDelete && (
                    <Link
                      href={`/routine/${routine.id}/edit`}
                      title="Edit"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Pencil size={20} />
                    </Link>
                  )}
                  {canReadDelete && (
                    <button
                      onClick={() => {
                        setSelectedWorker(routine);
                        setIsOpen(true);
                      }}
                      title="Delete"
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {isOpen && (
        <CustomPopup
          title="Konfirmasi"
          message={`Apakah Anda yakin ingin menghapus routine "${
            selectedWorker?.indikator || ""
          }"?`}
          onClose={() => {
            setIsOpen(false);
            setSelectedWorker(null);
          }}
          onConfirm={handleConfirm}
          confirmText="Ya"
          cancelText="Batal"
        />
      )}
    </>
  );
}

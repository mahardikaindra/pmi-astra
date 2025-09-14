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
import { Timestamp } from "firebase/firestore";

interface OnCall {
  id?: string;
  group: string;
  shift: string;
  location: string;
  tanggal: Timestamp;
}

export default function OnCallPage() {
  const [workers, setOnCall] = useState<OnCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  // 👉 tambahan state untuk popup
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<OnCall | null>(null);

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

          fetchOnCall();
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

  const fetchOnCall = async () => {
    try {
      const usersCol = collection(db, "artifacts/Ij8HEOktiALS0zjKB3ay/oncall");
      const usersSnap = await getDocs(usersCol);

      const oncallData: OnCall[] = usersSnap.docs.map((docSnap) => {
        const data = docSnap.data() as OnCall;
        return { id: docSnap.id, ...data };
      });

      setOnCall(oncallData);
    } catch (e) {
      console.error("Error fetching workers:", e);
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

      setOnCall((prev) => prev.filter((w) => w.id !== selectedWorker.id));
      setIsOpen(false);
      setSelectedWorker(null);
      alert("OnCall berhasil dihapus ✅");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus oncall ❌");
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
          placeholder="Search oncall by name or ID..."
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
          <h1 className="text-xl font-bold mb-4 text-gray-800">
            List On Call Me
          </h1>
          {canReadDelete && (
            <Link
              href="/oncall/add"
              className="bg-[#002D62] text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              + Add OnCall
            </Link>
          )}
        </div>
        <div className="space-y-4 mb-12">
          {workers
            .filter(
              (oncall) =>
                oncall.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (oncall.id &&
                  oncall.id.toLowerCase().includes(searchTerm.toLowerCase())),
            )
            .map((oncall) => (
              <div
                key={oncall.id}
                onClick={() => router.push(`/oncall/${oncall.id}`)}
                className="bg-white shadow rounded-xl p-4 flex items-center gap-4 cursor-pointer"
              >
                {/* Info OnCall */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {oncall.group}
                  </h2>
                  <p className="text-sm text-gray-600">{oncall.location}</p>

                  <p className="text-xs text-gray-500">Shift: {oncall.shift}</p>
                  <p className="text-xs text-gray-500">
                    Tanggal:{" "}
                    {oncall.tanggal &&
                      oncall.tanggal.toDate().toLocaleDateString()}
                  </p>
                </div>

                {/* Aksi */}
                <div
                  className="flex flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canReadDelete && (
                    <Link
                      href={`/oncall/${oncall.id}/edit`}
                      title="Edit"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Pencil size={20} />
                    </Link>
                  )}
                  {canReadDelete && (
                    <button
                      onClick={() => {
                        setSelectedWorker(oncall);
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
          message={`Apakah Anda yakin ingin menghapus oncall "${
            selectedWorker?.group || ""
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

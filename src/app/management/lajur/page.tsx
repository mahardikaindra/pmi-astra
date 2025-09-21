"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db, auth } from "../../../../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useTheme } from "../../theme-provider";
import CustomPopup from "@/components/CustomPopUp";
import dynamic from "next/dynamic";

interface Lajur {
  id?: string;
  nama: string;
  lokasi: string;
  panjang: number; // contoh field
  status: string; // contoh field
}

function PageComponent() {
  const [jalur, setLajurs] = useState<Lajur[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLajur, setSelectedLajur] = useState<Lajur | null>(null);

  // 🔐 cek user login & ambil role
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

          fetchLajur();
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

  // 🔄 ambil data lajur
  const fetchLajur = async () => {
    try {
      const colRef = collection(db, "artifacts/Ij8HEOktiALS0zjKB3ay/lajur");
      const snap = await getDocs(colRef);

      const jalurData: Lajur[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as Lajur;
        return { id: docSnap.id, ...data };
      });

      setLajurs(jalurData);
    } catch (e) {
      console.error("Error fetching lajur:", e);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ delete
  const handleConfirm = async () => {
    if (!selectedLajur?.id) return;

    try {
      const docRef = doc(
        db,
        `artifacts/Ij8HEOktiALS0zjKB3ay/lajur/${selectedLajur.id}`,
      );
      await deleteDoc(docRef);

      setLajurs((prev) => prev.filter((j) => j.id !== selectedLajur.id));
      setIsOpen(false);
      setSelectedLajur(null);
      alert("Lajur berhasil dihapus ✅");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus lajur ❌");
    }
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;

  const canCRUD = role === "admin";

  return (
    <>
      <Header hasBack />
      <div
        className={`${theme === "light" ? "bg-white" : "bg-[#1A1A1A]"} p-4 fixed top-15 left-0 right-0 z-20`}
      >
        <input
          type="text"
          placeholder="Cari lajur..."
          className={`w-full p-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === "light"
              ? "text-black border-gray-300"
              : "text-white bg-gray-700 border-gray-600"
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="min-h-screen bg-gray-100 p-4 pt-45">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold mb-4 text-gray-800">List Lajur</h1>
          {canCRUD && (
            <Link
              href="/management/lajur/add"
              className="bg-[#002D62] text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              + Add Lajur
            </Link>
          )}
        </div>

        <div className="space-y-4 mb-12">
          {jalur
            .filter(
              (j) =>
                j.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (j.id && j.id.toLowerCase().includes(searchTerm.toLowerCase())),
            )
            .map((lajur) => (
              <div
                key={lajur.id}
                className="bg-white shadow rounded-xl p-4 flex items-center gap-4"
              >
                {/* Info Lajur */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {lajur.nama}
                  </h2>
                  <p className="text-sm text-gray-600">{lajur.lokasi}</p>

                  <p className="text-xs text-gray-500">
                    Panjang: {lajur.panjang} km
                  </p>
                  <p className="text-xs text-gray-500">
                    Status: {lajur.status}
                  </p>
                </div>

                {/* Aksi */}
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/management/lajur/${lajur.id}`}
                    title="View"
                    className="text-gray-600 hover:text-green-600"
                  >
                    <Eye size={20} />
                  </Link>

                  {canCRUD && (
                    <Link
                      href={`/management/lajur/${lajur.id}/edit`}
                      title="Edit"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Pencil size={20} />
                    </Link>
                  )}
                  {canCRUD && (
                    <button
                      onClick={() => {
                        setSelectedLajur(lajur);
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
          message={`Apakah Anda yakin ingin menghapus lajur "${
            selectedLajur?.nama || ""
          }"?`}
          onClose={() => {
            setIsOpen(false);
            setSelectedLajur(null);
          }}
          onConfirm={handleConfirm}
          confirmText="Ya"
          cancelText="Batal"
        />
      )}
    </>
  );
}

const LajurPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default LajurPage;

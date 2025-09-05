"use client";

import Image from "next/image";
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
import { Pencil, Trash2, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useTheme } from "../theme-provider";
import { Timestamp } from "firebase/firestore";
import CustomPopup from "@/components/CustomPopUp";

interface Assets {
  id?: string;
  address?: string;
  assets: string;
  condition: number;
  facility: string;
  floor: string;
  initial_date: Timestamp;
  last_maintenance: Timestamp;
  last_replace_part: string;
  image?: string;
  merk?: string;
  technical_data?: number;
  latitude?: string;
  longitude?: string;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Assets[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  // 👉 tambahan state untuk popup
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Assets | null>(null);

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

          fetchWorkers();
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

  const fetchWorkers = async () => {
    try {
      const usersCol = collection(db, "artifacts/Ij8HEOktiALS0zjKB3ay/assets");
      const usersSnap = await getDocs(usersCol);

      const assetsData: Assets[] = usersSnap.docs.map((docSnap) => {
        const data = docSnap.data() as Assets;
        return { id: docSnap.id, ...data };
      });

      setAssets(assetsData);
    } catch (e) {
      console.error("Error fetching assets:", e);
    } finally {
      setLoading(false);
    }
  };

  // ✅ confirm delete
  const handleConfirm = async () => {
    if (!selectedAssets?.id) return;

    try {
      const docRef = doc(
        db,
        `artifacts/Ij8HEOktiALS0zjKB3ay/assets/${selectedAssets.id}`,
      );
      await deleteDoc(docRef);

      setAssets((prev) => prev.filter((w) => w.id !== selectedAssets.id));
      setIsOpen(false);
      setSelectedAssets(null);
      alert("Assets berhasil dihapus ✅");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus assets ❌");
    }
  };

  const openLocation = (assets: Assets) => {
    if (assets.latitude && assets.longitude) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${assets.latitude},${assets.longitude}`;
      window.open(mapsUrl, "_blank");
    } else {
      alert("Lokasi tidak tersedia untuk assets ini.");
    }
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;

  const canReadDelete = role === "SPV" || role === "Head";

  return (
    <>
      <Header />
      <div className={`${theme === "light" ? "bg-white" : "bg-[#1A1A1A]"} p-4`}>
        <input
          type="text"
          placeholder="Search assets by assets or ID..."
          className={`w-full p-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === "light"
              ? "text-black border-gray-300"
              : "text-white bg-gray-700 border-gray-600"
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="min-h-screen bg-gray-100 p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold mb-4 text-gray-800">
            Daftar Assets
          </h1>
          {canReadDelete && (
            <Link
              href="/assets/add"
              className="bg-[#002D62] text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              + Add Assets
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {assets
            .filter(
              (assets) =>
                assets.assets
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                (assets.id &&
                  assets.id.toLowerCase().includes(searchTerm.toLowerCase())),
            )
            .map((assets) => (
              <div
                key={assets.id}
                onClick={() => router.push(`/assets/${assets.id}`)}
                className="bg-white shadow rounded-xl p-4 flex items-center gap-4 cursor-pointer"
              >
                {/* Foto Assets */}
                <div className="w-16 h-16 bg-gray-200 overflow-hidden">
                  {assets.image ? (
                    <Image
                      src={assets.image}
                      alt={assets.assets}
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

                {/* Info Assets */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {assets.assets}
                  </h2>
                  <p className="text-sm text-gray-600">{assets.address}</p>
                </div>

                {/* Aksi */}
                <div
                  className="flex flex-col gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {canReadDelete && (
                    <Link
                      href={`/assets/${assets.id}/edit`}
                      title="Edit"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Pencil size={20} />
                    </Link>
                  )}
                  {canReadDelete && (
                    <button
                      onClick={() => {
                        setSelectedAssets(assets);
                        setIsOpen(true);
                      }}
                      title="Delete"
                      className="text-gray-600 hover:text-red-600"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                  <button
                    onClick={() => openLocation(assets)}
                    title="QR Code"
                    className="text-gray-600 hover:text-green-600"
                  >
                    <MapPin size={20} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      {isOpen && (
        <CustomPopup
          title="Konfirmasi"
          message={`Apakah Anda yakin ingin menghapus assets "${
            selectedAssets?.assets || ""
          }"?`}
          onClose={() => {
            setIsOpen(false);
            setSelectedAssets(null);
          }}
          onConfirm={handleConfirm}
          confirmText="Ya"
          cancelText="Batal"
        />
      )}
    </>
  );
}

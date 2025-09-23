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

interface Location {
  id?: string;
  location_name: string;
  address: string;
  status: string; // contoh field
}

function PageComponent() {
  const [location, setLocation] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

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

          fetchGroup();
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

  // 🔄 ambil data location
  const fetchGroup = async () => {
    try {
      const colRef = collection(db, "artifacts/Ij8HEOktiALS0zjKB3ay/locations");
      const snap = await getDocs(colRef);

      const locationData: Location[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as Location;
        return { id: docSnap.id, ...data };
      });

      setLocation(locationData);
    } catch (e) {
      console.error("Error fetching location:", e);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ delete
  const handleConfirm = async () => {
    if (!selectedLocation?.id) return;

    try {
      const docRef = doc(
        db,
        `artifacts/Ij8HEOktiALS0zjKB3ay/locations/${selectedLocation.id}`,
      );
      await deleteDoc(docRef);

      setLocation((prev) => prev.filter((j) => j.id !== selectedLocation.id));
      setIsOpen(false);
      setSelectedLocation(null);
      alert("Location berhasil dihapus ✅");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus location ❌");
    }
  };

  const canEdit = role === "admin";

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <>
      <Header hasBack />
      <div
        className={`${theme === "light" ? "bg-white" : "bg-[#1A1A1A]"} p-4 fixed top-15 left-0 right-0 z-20`}
      >
        <input
          type="text"
          placeholder="Cari location..."
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
          <h1 className="text-xl font-bold mb-4 text-gray-800">
            List Location
          </h1>
          <Link
            href="/management/location/add"
            className="bg-[#002D62] text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            + Add Location
          </Link>
        </div>

        <div className="space-y-4 mb-12">
          {location
            .filter(
              (j) =>
                j.location_name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                (j.id && j.id.toLowerCase().includes(searchTerm.toLowerCase())),
            )
            .map((location) => (
              <div
                key={location.id}
                className="bg-white shadow rounded-xl p-4 flex items-center gap-4"
              >
                {/* Info Location */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {location.location_name}
                  </h2>
                  <p className="text-sm text-gray-600">{location.address}</p>
                  <p className="text-xs text-gray-500">
                    Status: {location.status}
                  </p>
                </div>

                {/* Aksi */}
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/management/location/${location.id}`}
                    title="View"
                    className="text-gray-600 hover:text-green-600"
                  >
                    <Eye size={20} />
                  </Link>

                  {canEdit && (
                    <Link
                      href={`/management/location/${location.id}/edit`}
                      title="Edit"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Pencil size={20} />
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setSelectedLocation(location);
                      setIsOpen(true);
                    }}
                    title="Delete"
                    className="text-gray-600 hover:text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {isOpen && (
        <CustomPopup
          title="Konfirmasi"
          message={`Apakah Anda yakin ingin menghapus location "${
            selectedLocation?.location_name || ""
          }"?`}
          onClose={() => {
            setIsOpen(false);
            setSelectedLocation(null);
          }}
          onConfirm={handleConfirm}
          confirmText="Ya"
          cancelText="Batal"
        />
      )}
    </>
  );
}

const LocationPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default LocationPage;

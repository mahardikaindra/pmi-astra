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

interface User {
  id?: string;
  username: string;
  role: string;
  email: number; // contoh field
}

function PageComponent() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

          fetchUser();
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

  // 🔄 ambil data user
  const fetchUser = async () => {
    try {
      const colRef = collection(db, "users");
      const snap = await getDocs(colRef);

      const usersData: User[] = snap.docs.map((docSnap) => {
        const data = docSnap.data() as User;
        return { id: docSnap.id, ...data };
      });

      setUsers(usersData);
    } catch (e) {
      console.error("Error fetching user:", e);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ delete
  const handleConfirm = async () => {
    if (!selectedUser?.id) return;

    try {
      const docRef = doc(db, `users/${selectedUser.id}`);
      await deleteDoc(docRef);

      setUsers((prev) => prev.filter((j) => j.id !== selectedUser.id));
      setIsOpen(false);
      setSelectedUser(null);
      alert("User berhasil dihapus ✅");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Gagal menghapus user ❌");
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
          placeholder="Cari user..."
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
          <h1 className="text-xl font-bold mb-4 text-gray-800">List User</h1>
          {canCRUD && (
            <Link
              href="/management/user/add"
              className="bg-[#002D62] text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
            >
              + Add User
            </Link>
          )}
        </div>

        <div className="space-y-4 mb-12">
          {users
            .filter(
              (j) =>
                j.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (j.id && j.id.toLowerCase().includes(searchTerm.toLowerCase())),
            )
            .map((user) => (
              <div
                key={user.id}
                className="bg-white shadow rounded-xl p-4 flex items-center gap-4"
              >
                {/* Info User */}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {user.username}
                  </h2>
                  <p className="text-sm text-gray-600">{user.email}</p>

                  <p className="text-xs text-gray-500">Role: {user.role}</p>
                </div>

                {/* Aksi */}
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/management/user/${user.id}`}
                    title="View"
                    className="text-gray-600 hover:text-green-600"
                  >
                    <Eye size={20} />
                  </Link>

                  {canCRUD && (
                    <Link
                      href={`/management/user/${user.id}/edit`}
                      title="Edit"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Pencil size={20} />
                    </Link>
                  )}
                  {canCRUD && (
                    <button
                      onClick={() => {
                        setSelectedUser(user);
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
          message={`Apakah Anda yakin ingin menghapus user "${
            selectedUser?.username || ""
          }"?`}
          onClose={() => {
            setIsOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleConfirm}
          confirmText="Ya"
          cancelText="Batal"
        />
      )}
    </>
  );
}

const UserPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default UserPage;

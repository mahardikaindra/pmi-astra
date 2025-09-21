"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { db } from "../../../../../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Cek token login
  const getLocalStorageToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  useEffect(() => {
    const token = getLocalStorageToken();
    if (!token) {
      router.push("/");
    }
  }, [router]);

  // ✅ Ambil data lama untuk prefill
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            username: data.username || "",
            email: data.email || "",
            role: data.role || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // ✅ handle input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const docRef = doc(db, "users", id);

      await updateDoc(docRef, {
        ...form,
      });

      alert("User berhasil diperbarui ✅");
      router.push("/management/user");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Gagal update user ❌");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="pt-24 text-center">Loading...</p>;

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit User</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama User */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Nama User
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Masukkan username"
                className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="text"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Masukkan email"
                className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Role */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">-- Pilih Role --</option>
                <option value="Admin">Admin</option>
                <option value="Head">Head</option>
                <option value="Maintenance">Maintenance</option>
                <option value="LMS">LMS</option>
                <option value="HSE">HSE</option>
                <option value="SPV">SPV</option>
              </select>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                submitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#002D62] text-white hover:bg-blue-700"
              }`}
            >
              {submitting ? "Updating..." : "Update User"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const EditUserPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default EditUserPage;

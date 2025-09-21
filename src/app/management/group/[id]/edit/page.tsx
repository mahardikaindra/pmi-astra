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
    nama: "",
    status: "",
    deskripsi: "",
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
        const docRef = doc(
          db,
          "artifacts",
          "Ij8HEOktiALS0zjKB3ay",
          "group",
          id,
        );
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            nama: data.nama || "",
            status: data.status || "",
            deskripsi: data.deskripsi || "",
          });
        }
      } catch (error) {
        console.error("Error fetching group:", error);
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
      const docRef = doc(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "group", id);

      await updateDoc(docRef, {
        ...form,
      });

      alert("Group berhasil diperbarui ✅");
      router.push("/management/group");
    } catch (error) {
      console.error("Error updating group:", error);
      alert("Gagal update group ❌");
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Group</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Group */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Nama Group
              </label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Masukkan nama group"
                className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Deskripsi */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Deskripsi
              </label>
              <input
                type="text"
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                placeholder="Masukkan deskripsi group"
                className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">-- Pilih Status --</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
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
              {submitting ? "Updating..." : "Update Group"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const EditGroupPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default EditGroupPage;

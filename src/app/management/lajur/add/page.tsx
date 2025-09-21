"use client";
import { useState } from "react";
import { db } from "../../../../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";

function PageComponent() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    status: "",
    lokasi: "",
    panjang: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const colRef = collection(
        db,
        "artifacts",
        "Ij8HEOktiALS0zjKB3ay",
        "lajur",
      );
      await addDoc(colRef, form);
      alert("✅ Lajur berhasil ditambahkan");
      router.push("/management/lajur");
    } catch (error) {
      console.error("Error adding lajur:", error);
      alert("❌ Gagal menambahkan lajur");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔹 Header */}
      <Header hasBack />

      {/* 🔹 Form Card */}
      <div className="flex items-center justify-center py-10 px-4 pt-24">
        <div className="bg-white shadow-lg rounded-2xl w-full max-w-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lajur
              </label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                required
                className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002D62] focus:outline-none"
                placeholder="Masukkan nama lajur"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows={3}
                className="w-full text-black  border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002D62] focus:outline-none"
                placeholder="Masukkan deskripsi lajur"
              />
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lokasi
              </label>
              <input
                type="text"
                name="lokasi"
                value={form.lokasi}
                onChange={handleChange}
                required
                className="w-full  text-black border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002D62] focus:outline-none"
                placeholder="Masukkan lokasi lajur"
              />
            </div>

            {/* Panjang */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Panjang (meter)
              </label>
              <input
                type="number"
                name="panjang"
                value={form.panjang}
                onChange={handleChange}
                required
                min="0"
                className="w-full text-black  border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002D62] focus:outline-none"
                placeholder="Masukkan panjang lajur"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                required
                className="w-full text-black  border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002D62] focus:outline-none"
              >
                <option value="">-- Pilih Status --</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="perbaikan">Perbaikan</option>
              </select>
            </div>

            {/* Tombol */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#002D62] text-white py-2.5 rounded-lg hover:bg-blue-800 transition font-medium disabled:opacity-70"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const AddLajurPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default AddLajurPage;

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
    location_name: "",
    address: "",
    latitude: "",
    longitude: "",
    akurasi: "",
    status: "",
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
        "locations",
      );
      await addDoc(colRef, form);
      alert("✅ Lokasi berhasil ditambahkan");
      router.push("/management/location");
    } catch (error) {
      console.error("Error adding location:", error);
      alert("❌ Gagal menambahkan location");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude.toString(),
            longitude: pos.coords.longitude.toString(),
            akurasi: pos.coords.accuracy.toString(),
          }));
        },
        (err) => {
          alert("Gagal mengambil lokasi: " + err.message);
        },
        { enableHighAccuracy: true },
      );
    } else {
      alert("Geolocation tidak didukung browser ini");
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
                Nama Lokasi
              </label>
              <input
                type="text"
                name="location_name"
                value={form.location_name}
                onChange={handleChange}
                required
                className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002D62] focus:outline-none"
                placeholder="Masukkan nama location"
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="w-full text-black  border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002D62] focus:outline-none"
                placeholder="Masukkan Alamat"
              />
            </div>

            {/* Lat Long Akurasi */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Akurasi
                  </label>
                  <input
                    type="text"
                    name="akurasi"
                    value={form.akurasi}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Gunakan Lokasi Saat Ini
                </button>
              </div>
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

const AddGroupPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default AddGroupPage;

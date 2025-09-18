"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { db, storage } from "../../../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();
  const [form, setForm] = useState({
    jalan_tol: "",
    indikator: "",
    lokasi: "",
    jalur: "",
    lajur: "",
    latitude: "",
    longitude: "",
    akurasi: "",
    deskripsi: "",
    catatan: "",
    dokumentasi: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, dokumentasi: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let fileUrl = "";
      if (form.dokumentasi) {
        const fileRef = ref(
          storage,
          `routine/${Date.now()}-${form.dokumentasi.name}`,
        );
        await uploadBytes(fileRef, form.dokumentasi);
        fileUrl = await getDownloadURL(fileRef);
      }

      const colRef = collection(
        db,
        "artifacts",
        "Ij8HEOktiALS0zjKB3ay",
        "routine",
      );
      await addDoc(colRef, {
        ...form,
        dokumentasi: fileUrl,
      });

      alert("Routine berhasil disimpan ✅");
      router.push("/routine");
    } catch (error) {
      console.error("Error saving routine:", error);
      alert("Gagal menyimpan data ❌");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Routine</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Jalan Tol */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Jalan Tol
              </label>
              <input
                type="text"
                name="jalan_tol"
                value={form.jalan_tol}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                required
              />
            </div>

            {/* Indikator */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Indikator
              </label>
              <select
                name="indikator"
                value={form.indikator}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                required
              >
                <option value="">-- Pilih Indikator --</option>
                <option value="Perkerasan Jalan Utama [ Lubang ]">
                  Perkerasan Jalan Utama [ Lubang ]
                </option>
                <option value="Rambu Rusak">Rambu Rusak</option>
                <option value="Pagar Pengaman">Pagar Pengaman</option>
              </select>
            </div>

            {/* Lokasi, Jalur, Lajur */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Lokasi (km)
                </label>
                <input
                  type="text"
                  name="lokasi"
                  value={form.lokasi}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Jalur
                </label>
                <select
                  name="jalur"
                  value={form.jalur}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                  required
                >
                  <option value="">-- Pilih Jalur --</option>
                  <option value="Jalur A">Jalur A</option>
                  <option value="Jalur B">Jalur B</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Lajur
                </label>
                <select
                  name="lajur"
                  value={form.lajur}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                  required
                >
                  <option value="">-- Pilih Lajur --</option>
                  <option value="Bahu Luar">Bahu Luar</option>
                  <option value="Lajur 1">Lajur 1</option>
                  <option value="Lajur 2">Lajur 2</option>
                  <option value="Lajur 3">Lajur 3</option>
                </select>
              </div>
            </div>

            {/* Lat Long Akurasi */}
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

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                rows={3}
                required
              ></textarea>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Catatan
              </label>
              <textarea
                name="deskripsi"
                value={form.catatan}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                rows={3}
                required
              ></textarea>
            </div>

            {/* Dokumentasi */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Dokumentasi
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
              />
              {form.dokumentasi && (
                <p className="text-sm text-gray-500 mt-1">
                  {form.dokumentasi.name}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                submitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#002D62] text-white hover:bg-blue-500"
              }`}
            >
              {submitting ? "Saving..." : "Simpan"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const AddRoutinePage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default AddRoutinePage;

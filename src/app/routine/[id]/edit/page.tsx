/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { db, storage } from "../../../../../firebaseConfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useParams } from "next/navigation";

function EditRoutinePage() {
  const router = useRouter();
  const params = useParams(); // ambil :id dari route
  const { id } = params as { id: string };

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
    dokumentasi: "" as string | File,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ambil data awal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "routine", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setForm(snap.data() as any);
        } else {
          alert("Data tidak ditemukan ❌");
          router.push("/maintenance");
        }
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
      let fileUrl = typeof form.dokumentasi === "string" ? form.dokumentasi : "";

      if (form.dokumentasi instanceof File) {
        const fileRef = ref(storage, `routine/${Date.now()}-${form.dokumentasi.name}`);
        await uploadBytes(fileRef, form.dokumentasi);
        fileUrl = await getDownloadURL(fileRef);
      }

      const docRef = doc(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "routine", id);
      await updateDoc(docRef, {
        ...form,
        dokumentasi: fileUrl,
        updatedAt: Timestamp.now(),
      });

      alert("Routine berhasil diperbarui ✅");
      router.push("/routine");
    } catch (error) {
      console.error("Error updating routine:", error);
      alert("Gagal update data ❌");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Routine</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Jalan Tol */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Jalan Tol</label>
              <input
                type="text"
                name="jalan_tol"
                value={form.jalan_tol}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
              />
            </div>

            {/* Indikator */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Indikator</label>
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
                <label className="block text-sm font-medium text-gray-600 mb-1">Lokasi (km)</label>
                <input
                  type="text"
                  name="lokasi"
                  value={form.lokasi}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Jalur</label>
                <select
                  name="jalur"
                  value={form.jalur}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                >
                  <option value="">-- Pilih Jalur --</option>
                  <option value="Jalur A">Jalur A</option>
                  <option value="Jalur B">Jalur B</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Lajur</label>
                <select
                  name="lajur"
                  value={form.lajur}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
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
                <label className="block text-sm font-medium text-gray-600 mb-1">Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Akurasi</label>
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
              <label className="block text-sm font-medium text-gray-600 mb-1">Deskripsi</label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                rows={3}
              ></textarea>
            </div>

            {/* Dokumentasi */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Dokumentasi</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
              />
              {typeof form.dokumentasi === "string" && form.dokumentasi !== "" && (
                <div className="mt-2">
                  <Image
                    src={form.dokumentasi}
                    alt="Dokumentasi"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
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
              {submitting ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditRoutinePage;

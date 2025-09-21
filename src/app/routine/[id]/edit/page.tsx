/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { db, storage } from "../../../../../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();
  const params = useParams(); // ambil id dari route
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
    catatan: "",
    dokumentasi: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  // 🔹 State untuk dropdown jalur & lajur
  const [jalurs, setJalurs] = useState<string[]>([]);
  const [lajurs, setLajurs] = useState<string[]>([]);
  const [dokumentasi, setDokumentasi] = useState<File | null>(null);
  const [dokumentasiUrl, setDokumentasiUrl] = useState<string>("");

  // Cek token login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [router]);

  // Ambil data dari Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(
          db,
          "artifacts",
          "Ij8HEOktiALS0zjKB3ay",
          "routine",
          id,
        );
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setForm(snapshot.data() as any);
          if (snapshot.data()) {
            setDokumentasiUrl(snapshot.data().dokumentasi); // URL dari firestore
          }
        } else {
          alert("Data tidak ditemukan ❌");
          router.push("/routine");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  // 🔹 Ambil data Jalur & Lajur dari Firestore
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const jalurSnap = await getDocs(
          collection(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "jalur"),
        );
        const lajurSnap = await getDocs(
          collection(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "lajur"),
        );

        setJalurs(jalurSnap.docs.map((doc) => doc.data().nama));
        setLajurs(lajurSnap.docs.map((doc) => doc.data().nama));
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchOptions();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDokumentasi(file);
      setDokumentasiUrl(URL.createObjectURL(file)); // preview lokal
    }
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Gunakan lokasi saat ini
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

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let fileUrl = dokumentasiUrl;

      if (dokumentasi) {
        const fileRef = ref(
          storage,
          `routine/${Date.now()}-${dokumentasi.name}`,
        );
        await uploadBytes(fileRef, dokumentasi);
        fileUrl = await getDownloadURL(fileRef);
      }

      const docRef = doc(
        db,
        "artifacts",
        "Ij8HEOktiALS0zjKB3ay",
        "routine",
        id,
      );
      await updateDoc(docRef, {
        ...form,
        dokumentasi: fileUrl,
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

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 mb-12">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Edit Routine
          </h1>

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
              {/* Jalur dari Firestore */}
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
                  {jalurs.map((j, i) => (
                    <option key={i} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
              {/* Lajur dari Firestore */}
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
                  {lajurs.map((l, i) => (
                    <option key={i} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Latitude, Longitude, Akurasi */}
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Akurasi (m)
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

              {/* Tombol ambil lokasi */}
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
              ></textarea>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Catatan
              </label>
              <textarea
                name="catatan"
                value={form.catatan}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                rows={3}
              ></textarea>
            </div>

            {/* Dokumentasi */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Dokumentasi
              </label>

              {dokumentasiUrl && (
                <Image
                  src={dokumentasiUrl}
                  alt="Dokumentasi"
                  width={200}
                  height={200}
                  className="w-32 h-32 object-cover rounded mb-2"
                />
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
              />

              {dokumentasi && (
                <p className="text-sm text-gray-500 mt-1">
                  File dipilih: {dokumentasi.name}
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
              {submitting ? "Updating..." : "Update"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const EditRoutinePage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default EditRoutinePage;

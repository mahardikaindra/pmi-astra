"use client";
import Image from "next/image";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { db, storage } from "../../../../../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();
  const params = useParams(); 
  const id = params?.id as string;

  const [form, setForm] = useState({
    tanggal: "",
    group: "",
    location: "",
    shift: "",
    departement: "",
    catatan: "",
    dokumentasi: null as File | null,
    dokumentasiUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cek token login
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

  // Ambil data lama dari Firestore untuk prefill
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(
          db,
          "artifacts",
          "Ij8HEOktiALS0zjKB3ay",
          "oncall",
          id,
        );
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            tanggal: data.tanggal?.toDate().toISOString().split("T")[0] || "",
            group: data.group || "",
            location: data.location || "",
            shift: data.shift || "",
            departement: data.departement || "",
            catatan: data.catatan || "",
            dokumentasi: null,
            dokumentasiUrl: data.dokumentasiUrl || "",
          });
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    if (e.target.type === "file") {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        setForm({ ...form, dokumentasi: target.files[0] });
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = form.dokumentasiUrl;

      // Upload file baru kalau ada
      if (form.dokumentasi) {
        const storageRef = ref(
          storage,
          `oncall/${Date.now()}-${form.dokumentasi.name}`,
        );
        await uploadBytes(storageRef, form.dokumentasi);
        imageUrl = await getDownloadURL(storageRef);
      }

      const docRef = doc(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "oncall", id);

      await updateDoc(docRef, {
        tanggal: Timestamp.fromDate(new Date(form.tanggal)),
        group: form.group,
        location: form.location,
        shift: form.shift,
        departement: form.departement,
        catatan: form.catatan,
        dokumentasiUrl: imageUrl || null,
      });

      alert("OnCall berhasil diperbarui ✅");
      router.push("/oncall");
    } catch (error) {
      console.error("Error updating worker:", error);
      alert("Gagal update data ❌");
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit OnCall</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tanggal */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={form.tanggal}
                  onChange={handleChange}
                  className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Group Dropdown */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Group / Tim
                </label>
                <select
                  name="group"
                  value={form.group}
                  onChange={handleChange}
                  className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">-- Pilih Group --</option>
                  <option value="ON CALL BARAT">ON CALL BARAT</option>
                  <option value="ON CALL TIMUR">ON CALL TIMUR</option>
                  <option value="REPAIR REPLACE">REPAIR REPLACE</option>
                </select>
              </div>

              {/* Lokasi */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Lokasi
                </label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Contoh: Jakarta"
                  className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Shift Dropdown */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Shift
                </label>
                <select
                  name="shift"
                  value={form.shift}
                  onChange={handleChange}
                  className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                  required
                >
                  <option value="">-- Pilih Shift --</option>
                  <option value="Satu">Satu</option>
                  <option value="Dua">Dua</option>
                  <option value="Tiga">Tiga</option>
                </select>
              </div>

              {/* Departement Radio */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-2">
                  Departement
                </label>
                <div className="flex flex-wrap gap-4">
                  {["MAINTENANCE", "EHS", "GA"].map((dept) => (
                    <label
                      key={dept}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="departement"
                        value={dept}
                        checked={form.departement === dept}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300"
                        required
                      />
                      <span className="text-sm text-gray-700">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Catatan */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Catatan
                </label>
                <textarea
                  name="catatan"
                  value={form.catatan}
                  onChange={handleChange}
                  placeholder="Tulis catatan tambahan..."
                  className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 h-24"
                />
              </div>

              {/* Dokumentasi */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Dokumentasi
                </label>
                <input
                  type="file"
                  name="dokumentasi"
                  accept="image/*"
                  onChange={handleChange}
                  className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                />
                {form.dokumentasiUrl && (
                  <Image
                    height={160}
                    width={160}
                    src={form.dokumentasiUrl}
                    alt="Preview"
                    className="mt-2 w-40 h-40 object-cover rounded-lg border"
                  />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                submitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#002D62] text-white hover:bg-blue-700"
              }`}
            >
              {submitting ? "Updating..." : "Update OnCall"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const EditOnCallPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default EditOnCallPage;

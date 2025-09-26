/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
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
  const params = useParams();
  const { id } = params as { id: string }; // 🔑 ambil asset id dari URL

  const [form, setForm] = useState({
    address: "",
    jenis_assets: "",
    assets: "",
    condition: "",
    facility: "",
    initial_date: "",
    last_maintenance: "",
    last_replace_part: "",
    merk: "",
    technical_data: "",
    image: "",
    msds: null as File | null,
  });

  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 State dropdown
  const [locations, setLocations] = useState<string[]>([]);
  const [msdsUrl, setDokumentasiUrl] = useState<string>(""); // preview lokal
  const [msds, setDokumentasi] = useState<File | null>(null); // file msds

  // 🔑 cek login token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [router]);

  // 🔹 Ambil data asset by id
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ambil data lokasi untuk dropdown
        const locationSnap = await getDocs(
          collection(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "locations"),
        );
        setLocations(locationSnap.docs.map((doc) => doc.data().location_name));

        // ambil data asset by id
        const docRef = doc(
          db,
          "artifacts",
          "Ij8HEOktiALS0zjKB3ay",
          "assets",
          id,
        );
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setForm(snapshot.data() as any);
        } else {
          alert("Data asset tidak ditemukan ❌");
          router.push("/assets");
        }
      } catch (error) {
        console.error("Error fetching asset:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDokumentasi(file);
      setDokumentasiUrl(URL.createObjectURL(file)); // preview lokal
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let fileUrl = msdsUrl;

      if (msds) {
        const fileRef = ref(storage, `routine/${Date.now()}-${msds.name}`);
        await uploadBytes(fileRef, msds);
        fileUrl = await getDownloadURL(fileRef);
      }

      let imageURL = form.image; // default gambar lama
      if (image) {
        const imgRef = ref(storage, `assets/${Date.now()}-${image.name}`);
        await uploadBytes(imgRef, image);
        imageURL = await getDownloadURL(imgRef);
      }

      const docRef = doc(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "assets", id);

      await updateDoc(docRef, {
        ...form,
        image: imageURL,
        msds: fileUrl,
      });

      alert("Asset berhasil diperbarui ✅");
      router.push("/assets");
    } catch (error) {
      console.error("Error updating asset:", error);
      alert("Gagal memperbarui asset ❌");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>;
  }

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center top-32 pt-30 z-0">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Asset</h1>

          {/* Upload Image */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Image
                width={128}
                height={128}
                src={
                  image
                    ? URL.createObjectURL(image)
                    : form.image || "data:image/svg+xml;base64,..."
                }
                alt="Asset Image"
                className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
              />
              <label
                htmlFor="image-upload"
                className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-md"
                title="Change photo"
              >
                📷
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setImage(e.target.files[0])}
                className="hidden"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mb-12">
            {/* Grid Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 🔹 Lokasi Dropdown */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Lokasi
                </label>
                <select
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Pilih Lokasi --</option>
                  {locations.map((loc, i) => (
                    <option key={i} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Input lain */}
              {[
                { field: "assets", label: "Kode Aset" },
                { field: "jenis_assets", label: "Jenis Aset" },
                { field: "condition", label: "Kondisi" },
                { field: "facility", label: "Fasilitas" },
                { field: "last_replace_part", label: "Part diganti" },
                { field: "merk", label: "Merk" },
                { field: "technical_data", label: "Data Teknis" },
              ].map(({ field, label }) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1">
                    {label}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={(form as any)[field]}
                    onChange={handleChange}
                    className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}

              {/* 📅 Initial Date */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Initial Date
                </label>
                <input
                  type="date"
                  name="initial_date"
                  value={form.initial_date}
                  onChange={handleChange}
                  className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 📅 Last Maintenance */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Last Maintenance
                </label>
                <input
                  type="date"
                  name="last_maintenance"
                  value={form.last_maintenance}
                  onChange={handleChange}
                  className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 🔹 MSDS Upload */}
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1">
                  MSDS
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                />
                {msdsUrl && (
                  <div className="mt-2">
                    <Image
                      src={msdsUrl}
                      alt="Preview"
                      width={300}
                      height={200}
                      className="rounded-lg border"
                    />
                  </div>
                )}
                {msds && (
                  <p className="text-sm text-gray-500 mt-1">{msds.name}</p>
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
              {submitting ? "Updating..." : "Update Asset"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const EditAssetsPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default EditAssetsPage;

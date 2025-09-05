/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { db, storage } from "../../../../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();
  const { id } = useParams();

  const [form, setForm] = useState({
    address: "",
    assets: "",
    condition: "",
    facility: "",
    floor: "",
    initial_date: "",
    last_maintenance: "",
    last_replace_part: "",
    latitude: "",
    longitude: "",
    merk: "",
    technical_data: "",
    image: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔑 cek login token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [router]);

  // 📥 Ambil data asset berdasarkan id
  useEffect(() => {
    const fetchAsset = async () => {
      if (!id) {
        setLoading(false); // ✅ jangan biarkan loading infinite kalau id null
        return;
      }
      try {
        const docRef = doc(db, `artifacts/Ij8HEOktiALS0zjKB3ay/assets/${id}`);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setForm(snap.data() as any);
        } else {
          alert("Asset tidak ditemukan ❌");
          router.push("/assets");
        }
      } catch (error) {
        console.error("Error fetching asset:", error);
        alert("Gagal mengambil data asset ❌");
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      let imageURL = form.image;
      if (image) {
        const imgRef = ref(storage, `assets/${id}-${image.name}`);
        await uploadBytes(imgRef, image);
        imageURL = await getDownloadURL(imgRef);
      }

      const docRef = doc(db, `artifacts/Ij8HEOktiALS0zjKB3ay/assets/${id}`);
      await updateDoc(docRef, {
        ...form,
        image: imageURL,
      });

      alert("Asset berhasil diperbarui ✅");
      router.push("/assets");
    } catch (error) {
      console.error("Error updating asset:", error);
      alert("Gagal memperbarui data ❌");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
              {[
                "address",
                "assets",
                "condition",
                "facility",
                "floor",
                "last_replace_part",
                "latitude",
                "longitude",
                "merk",
                "technical_data",
              ].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1 capitalize">
                    {field.replace("_", " ")}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={(form as any)[field]}
                    onChange={handleChange}
                    className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                />
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

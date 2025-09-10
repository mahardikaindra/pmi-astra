/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Header from "@/components/Header"; // Assuming Header component is correctly imported
import { useState, useEffect } from "react";
import { db, storage } from "../../../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();
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
  });

  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 🔑 cek login token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageURL = "";
      if (image) {
        const imgRef = ref(storage, `assets/${Date.now()}-${image.name}`);
        await uploadBytes(imgRef, image);
        imageURL = await getDownloadURL(imgRef);
      }

      // 🔥 addDoc → auto-id
      await addDoc(collection(db, "artifacts/Ij8HEOktiALS0zjKB3ay/assets"), {
        ...form,
        image: imageURL,
        floor: "",
      });

      alert("Asset berhasil disimpan ✅");
      router.push("/assets");

      // reset form
      setForm({
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
      });
      setImage(null);
    } catch (error) {
      console.error("Error saving asset:", error);
      alert("Gagal menyimpan data ❌");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Tambah Asset</h1>

          {/* Upload Image */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Image
                width={128}
                height={128}
                src={
                  image
                    ? URL.createObjectURL(image)
                    : "data:image/svg+xml;base64,..."
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
                // "floor",
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
                    required={field !== "latitude" && field !== "longitude"} // latitude/longitude opsional
                  />
                </div>
              ))}{" "}
              {/* Closing tag for map function */}
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
              {submitting ? "Saving..." : "Save Asset"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const AddAssetsPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default AddAssetsPage;

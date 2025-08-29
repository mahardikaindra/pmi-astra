/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { db, storage } from "../../../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

export default function AddWorkerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    id: "",
    name: "",
    age: "",
    area: "",
    contractor: "",
    point_reward: "",
    position: "",
    punishment: "",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [sik, setSik] = useState<File | null>(null);
  const [licenses, setLicenses] = useState<File[]>([]);

  // Check if token exists in local storage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setLicenses(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Upload photo
      let photoURL = "";
      if (photo) {
        const photoRef = ref(storage, `workers/${form.id}/photo/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      // Upload SIK
      let sikURL = "";
      if (sik) {
        const sikRef = ref(storage, `workers/${form.id}/sik/${sik.name}`);
        await uploadBytes(sikRef, sik);
        sikURL = await getDownloadURL(sikRef);
      }

      // Upload Licenses
      const licensesURL: string[] = [];
      for (const file of licenses) {
        const fileRef = ref(
          storage,
          `workers/${form.id}/licenses/${file.name}`,
        );
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        licensesURL.push(url);
      }

      // Simpan ke Firestore
      const docRef = doc(db, `artifacts/Ij8HEOktiALS0zjKB3ay/users/${form.id}`);

      await setDoc(docRef, {
        id: Number(form.id),
        name: form.name,
        age: Number(form.age),
        area: form.area,
        contractor: form.contractor,
        point_reward: Number(form.point_reward),
        position: form.position,
        punishment: form.punishment,
        photo: photoURL,
        sik: sikURL,
        licenses: licensesURL,
      });

      alert("Worker berhasil disimpan ✅");
      setForm({
        id: "",
        name: "",
        age: "",
        area: "",
        contractor: "",
        point_reward: "",
        position: "",
        punishment: "",
      });
      setPhoto(null);
      setSik(null);
      setLicenses([]);
    } catch (error) {
      console.error("Error saving worker:", error);
      alert("Gagal menyimpan data ❌");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Worker</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "id",
                "name",
                "age",
                "area",
                "contractor",
                "point_reward",
                "position",
                "punishment",
              ].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1 capitalize">
                    {field.replace("_", " ")}
                  </label>
                  <input
                    type={
                      field === "age" || field === "point_reward"
                        ? "number"
                        : "text"
                    }
                    name={field}
                    value={(form as any)[field]}
                    onChange={handleChange}
                    className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setPhoto(e.target.files[0])
                  }
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  SIK
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => e.target.files && setSik(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-600 hover:file:bg-green-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Licenses
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={handleFileArrayChange}
                  className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Save Worker
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

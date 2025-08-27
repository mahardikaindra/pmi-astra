/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, storage } from "../../../../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function EditWorkerPage() {
  const { id } = useParams(); // ambil [id] dari URL
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
    photo: "",
    sik: "",
    licenses: [] as string[],
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [sik, setSik] = useState<File | null>(null);
  const [licenses, setLicenses] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data dari Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(
          db,
          `artifacts/Ij8HEOktiALS0zjKB3ay/users/${id}/profiles/my-profile`,
        );
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setForm({ ...(snap.data() as any) });
        }
      } catch (error) {
        console.error("Error loading worker:", error);
        alert("Gagal memuat data ❌");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

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
      // Upload photo jika ada file baru
      let photoURL = form.photo;
      if (photo) {
        const photoRef = ref(storage, `workers/${form.id}/photo/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      // Upload SIK jika ada file baru
      let sikURL = form.sik;
      if (sik) {
        const sikRef = ref(storage, `workers/${form.id}/sik/${sik.name}`);
        await uploadBytes(sikRef, sik);
        sikURL = await getDownloadURL(sikRef);
      }

      // Upload Licenses (replace kalau upload baru)
      let licensesURL: string[] = form.licenses || [];
      if (licenses.length > 0) {
        licensesURL = [];
        for (const file of licenses) {
          const fileRef = ref(
            storage,
            `workers/${form.id}/licenses/${file.name}`,
          );
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          licensesURL.push(url);
        }
      }

      // Simpan update ke Firestore
      const docRef = doc(
        db,
        `artifacts/Ij8HEOktiALS0zjKB3ay/users/${form.id}/profiles/my-profile`,
      );

      await setDoc(docRef, {
        ...form,
        age: Number(form.age),
        point_reward: Number(form.point_reward),
        photo: photoURL,
        sik: sikURL,
        licenses: licensesURL,
      });

      alert("Worker berhasil diupdate ✅");
      router.push("/workers"); // redirect ke list page
    } catch (error) {
      console.error("Error updating worker:", error);
      alert("Gagal mengupdate data ❌");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Worker</h1>
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
              {form.photo && (
                <img
                  src={form.photo}
                  alt="current"
                  className="w-24 h-24 rounded-lg mb-2 object-cover"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setPhoto(e.target.files[0])}
                className="block w-full text-sm text-gray-700
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:bg-blue-600 file:text-white hover:file:bg-blue-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                SIK
              </label>
              {form.sik && (
                <a
                  href={form.sik}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline mb-2 block"
                >
                  Lihat SIK
                </a>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => e.target.files && setSik(e.target.files[0])}
                className="block w-full text-sm text-gray-700
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:bg-green-600 file:text-white hover:file:bg-green-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Licenses
              </label>
              {form.licenses?.length > 0 && (
                <ul className="list-disc pl-6 mb-2 text-sm text-gray-600">
                  {form.licenses.map((url, i) => (
                    <li key={i}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 underline"
                      >
                        License {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={handleFileArrayChange}
                className="block w-full text-sm text-gray-700
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Update Worker
          </button>
        </form>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, storage } from "../../../../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import dynamic from "next/dynamic";

function PageComponent() {
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
  const [submitting, setSubmitting] = useState(false);

  // ✅ taruh helper function di atas, bukan di bawah useEffect
  const getLocalStorageToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  useEffect(() => {
    const token = getLocalStorageToken();
    if (!token) {
      router.push("/"); // redirect kalau token ga ada
    }
  }, [router]);

  // Load data dari Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, `artifacts/Ij8HEOktiALS0zjKB3ay/users/${id}`);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setForm({ id: snap.id, ...(snap.data() as any) });
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

  const cleanData = (obj: Record<string, any>) => {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null),
    );
  };

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
    setSubmitting(true);

    try {
      // Upload photo jika ada file baru
      let photoURL = form.photo;
      if (photo) {
        const photoRef = ref(storage, `workers/${id}/photo/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      // Upload SIK jika ada file baru
      let sikURL = form.sik;
      if (sik) {
        const sikRef = ref(storage, `workers/${id}/sik/${sik.name}`);
        await uploadBytes(sikRef, sik);
        sikURL = await getDownloadURL(sikRef);
      }

      // Upload Licenses (replace kalau upload baru)
      let licensesURL: string[] = form.licenses || [];
      if (licenses.length > 0) {
        licensesURL = [];
        for (const file of licenses) {
          const fileRef = ref(storage, `workers/${id}/licenses/${file.name}`);
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          licensesURL.push(url);
        }
      }

      // Simpan update ke Firestore (pakai id dari URL, bukan form.id)
      const docRef = doc(db, `artifacts/Ij8HEOktiALS0zjKB3ay/users/${id}`);

      await setDoc(
        docRef,
        cleanData({
          ...form,
          age: Number(form.age),
          point_reward: Number(form.point_reward),
          photo: photoURL || "",
          sik: sikURL || "",
          licenses: licensesURL || [],
        }),
      );

      alert("Worker berhasil diupdate ✅");
      router.push("/");
    } catch (error) {
      console.error("Error updating worker:", error);
      alert("Gagal mengupdate data ❌");
    } finally {
      setSubmitting(false);
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
    <>
      <Header hasBack={true} />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Edit Worker
          </h1>

          {/* Avatar and Edit Button */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Image
                width={128}
                height={128}
                src={
                  photo
                    ? URL.createObjectURL(photo)
                    : form.photo ||
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNNjQgNDBDNTAuNzUgNDAgNDAgNTAuNzUgNDAgNjRjMCAxMy4yNSAxMC43NSAyNCAyNCAyNHMyNC0xMC43NSAyNC0yNEM4OCA1MC43NSA3Ny4yNSA0MCA2NCA0MHptMCA0NGMtOC44MiAwLTE2LTcuMTgtMTYtMTZzNy4xOC0xNiAxNi0xNiAxNiA3LjE4IDE2IDE2LTcuMTggMTYtMTYgMTZ6TTg4LjggOTguNEM4My4xMyA5My40NCA3NC4zMSA5MCA2NCA5MGMtMTAuMzEgMC0xOS4xMyAzLjQ0LTI0LjggOC40QzMyLjQgMTEzLjYgNDYuNiAxMjQgNjQgMTI0czMxLjYtMTAuNCAzNC44LTE1LjZ6IiBmaWxsPSIjQzZDNkM2Ii8+PC9zdmc+"
                }
                alt="Worker Photo"
                className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
              />
              <label
                htmlFor="photo-upload"
                className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-md"
                title="Change photo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path
                    fillRule="evenodd"
                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
            </div>
          </div>

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
            <div className="space-y-6">
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setPhoto(e.target.files[0])}
                className="hidden"
              />

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

              {form.sik && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Current SIK:
                  </p>
                  {form.sik.endsWith(".pdf") ? (
                    <a
                      href={form.sik}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View SIK (PDF)
                    </a>
                  ) : (
                    <Image
                      width={96}
                      height={96}
                      src={form.sik}
                      alt="Current SIK"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>
              )}

              {form.licenses && form.licenses.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Current Licenses:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {form.licenses.map((licenseUrl, index) => (
                      <div key={index} className="relative group">
                        {licenseUrl.endsWith(".pdf") ? (
                          <a
                            href={licenseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-blue-600 hover:underline text-xs"
                          >
                            View PDF {index + 1}
                          </a>
                        ) : (
                          <Image
                            width={96}
                            height={96}
                            src={licenseUrl}
                            alt={`License ${index + 1}`}
                            className="w-full
                            h-24 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                submitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {submitting ? "Updating..." : "Update Worker"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const EditWorkerPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default EditWorkerPage;

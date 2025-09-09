/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { db, storage } from "../../../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Star } from "lucide-react";

function PageComponent() {
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
    information: "",
    license1: "",
    license2: "",
    rating: 0,
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [sik, setSik] = useState<File | null>(null);
  const [license1, setLicense1] = useState<File | null>(null);
  const [license2, setLicense2] = useState<File | null>(null);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRating = (value: number) => {
    setForm({ ...form, rating: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let photoURL = "";
      if (photo) {
        const photoRef = ref(storage, `workers/${form.id}/photo/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      let sikURL = "";
      if (sik) {
        const sikRef = ref(storage, `workers/${form.id}/sik/${sik.name}`);
        await uploadBytes(sikRef, sik);
        sikURL = await getDownloadURL(sikRef);
      }

      let license1URL = "";
      if (license1) {
        const license1Ref = ref(
          storage,
          `workers/${form.id}/licenses/license1-${license1.name}`,
        );
        await uploadBytes(license1Ref, license1);
        license1URL = await getDownloadURL(license1Ref);
      }

      let license2URL = "";
      if (license2) {
        const license2Ref = ref(
          storage,
          `workers/${form.id}/licenses/license2-${license2.name}`,
        );
        await uploadBytes(license2Ref, license2);
        license2URL = await getDownloadURL(license2Ref);
      }

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
        rating: Number(form.rating),
        photo: photoURL,
        sik: sikURL,
        license1: license1URL,
        license2: license2URL,
        information: form.information,
      });

      alert("OnCall berhasil disimpan ✅");
      router.push("/worker");

      setForm({
        id: "",
        name: "",
        age: "",
        area: "",
        contractor: "",
        point_reward: "",
        position: "",
        punishment: "",
        rating: 0,
        photo: "",
        sik: "",
        license1: "",
        license2: "",
        information: "",
      });
      setPhoto(null);
      setSik(null);
      setLicense1(null);
      setLicense2(null);
    } catch (error) {
      console.error("Error saving worker:", error);
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
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add OnCall</h1>

          {/* Avatar */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Image
                width={128}
                height={128}
                src={
                  photo
                    ? URL.createObjectURL(photo)
                    : "data:image/svg+xml;base64,..."
                }
                alt="OnCall Photo"
                className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
              />
              <label
                htmlFor="photo-upload"
                className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-md"
                title="Change photo"
              >
                ✏️
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && setPhoto(e.target.files[0])}
                className="hidden"
              />
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
                "information",
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

            {/* ⭐ Rating Input */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Rating
              </label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`h-6 w-6 cursor-pointer ${
                      form.rating >= star
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  SIK
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && setSik(e.target.files[0])}
                  className="block w-full text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  License 1
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setLicense1(e.target.files[0])
                  }
                  className="block w-full text-sm text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  License 2
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setLicense2(e.target.files[0])
                  }
                  className="block w-full text-sm text-gray-500"
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
              {submitting ? "Updating..." : "Save OnCall"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const AddWorkerPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default AddWorkerPage;

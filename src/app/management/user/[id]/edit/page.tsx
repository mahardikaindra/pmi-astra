/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, storage } from "../../../../../../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import dynamic from "next/dynamic";
import { Star } from "lucide-react";

function PageComponent() {
  const { id } = useParams(); // ambil [id] dari URL
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    role: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
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
      router.push("/"); // redirect kalau token ga ada
    }
  }, [router]);

  // Load data dari Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, `/users/${id}`);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          setForm({ id: snap.id, ...(snap.data() as any) });
        }
      } catch (error) {
        console.error("Error loading user:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Simpan update ke Firestore
      const docRef = doc(db, `users/${id}`);

      await setDoc(
        docRef,
        cleanData({
          ...form,
        }),
      );

      alert("User berhasil diupdate ✅");
      router.push("/user");
    } catch (error) {
      console.error("Error updating user:", error);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 top-32 pt-30 z-0">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Edit User
          </h1>

          {/* Avatar */}
          <div className="flex justify-center mb-8">
            {/* <div className="relative">
              <Image
                width={128}
                height={128}
                src={
                  photo
                    ? URL.createObjectURL(photo)
                    : form.photo ||
                      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNjQiIGN5PSI2NCIgcj0iNjQiIGZpbGw9IiNFNUU3RUIiLz48cGF0aCBkPSJNNjQgNDBDNTAuNzUgNDAgNDAgNTAuNzUgNDAgNjRjMCAxMy4yNSAxMC43NSAyNCAyNCAyNHMyNC0xMC43NSAyNC0yNEM4OCA1MC43NSA3Ny4yNSA0MCA2NCA0MHptMCA0NGMtOC44MiAwLTE2LTcuMTgtMTYtMTZzNy4xOC0xNiAxNi0xNiAxNiA3LjE4IDE2IDE2LTcuMTggMTYtMTYgMTZ6TTg4LjggOTguNEM4My4xMyA5My40NCA3NC4zMSA5MCA2NCA5MGMtMTAuMzEgMC0xOS4xMyAzLjQ0LTI0LjggOC40QzMyLjQgMTEzLjYgNDYuNiAxMjQgNjQgMTI0czMxLjYtMTAuNCAzNC44LTE1LjZ6IiBmaWxsPSIjQzZDNkM2Ii8+PC9zdmc+"
                }
                alt="User Photo"
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
            </div> */}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "username",
                "role",
                "email",
              ].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-bold text-black mb-1 capitalize">
                    {field.replace("_", " ")}
                  </label>
                  {field === "information" ? (
                    <textarea
                      name={field}
                      value={(form as any)[field]}
                      onChange={(e) =>
                        setForm({ ...form, [e.target.name]: e.target.value })
                      }
                      rows={3}
                      className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
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
                  )}
                </div>
              ))}
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
              {submitting ? "Updating..." : "Update User"}
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

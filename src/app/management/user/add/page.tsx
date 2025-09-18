/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { db, storage } from "../../../../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Star } from "lucide-react";

function PageComponent() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    role: "",
    email: "",
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {

      const docRef = doc(db, `users`);

      await setDoc(docRef, {
        username: form.username,
        email: form.email,
        role: form.role,
      });

      alert("User berhasil disimpan ✅");
      router.push("/user");

      setForm({
        username: "",
        role: "",
        email: "",
      });
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Gagal menyimpan data ❌");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center top-32 pt-30 z-0">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add User</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "username",
                "role",
                "email",
              ].map((field) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1 capitalize">
                    {field.replace("_", " ")}
                  </label>
                  <input
                    type={"text"}
                    name={field}
                    value={(form as any)[field]}
                    onChange={handleChange}
                    className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
              {submitting ? "Updating..." : "Save User"}
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

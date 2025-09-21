"use client";
import { useState } from "react";
import { db } from "../../../../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";

function PageComponent() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const colRef = collection(db, "users");
      await addDoc(colRef, form);
      alert("✅ User berhasil ditambahkan");
      router.push("/management/user");
    } catch (error) {
      console.error("Error adding user:", error);
      alert("❌ Gagal menambahkan user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔹 Header */}
      <Header hasBack />

      {/* 🔹 Form Card */}
      <div className="flex items-center justify-center py-10 px-4 pt-24">
        <div className="bg-white shadow-lg rounded-2xl w-full max-w-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama User
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002D62] focus:outline-none"
                placeholder="Masukkan username"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <textarea
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full text-black  border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002D62] focus:outline-none"
                placeholder="Masukkan email"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full text-black border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#002D62] focus:outline-none"
              >
                <option value="">-- Pilih Role --</option>
                <option value="Admin">Admin</option>
                <option value="Head">Head</option>
                <option value="Maintenance">Maintenance</option>
                <option value="HSE">HSE</option>
                <option value="LMS">LMS</option>
                <option value="SPV">SPV</option>
              </select>
            </div>

            {/* Tombol */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#002D62] text-white py-2.5 rounded-lg hover:bg-blue-800 transition font-medium disabled:opacity-70"
            >
              {submitting ? "Menyimpan..." : "Simpan"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const AddUserPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default AddUserPage;

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", response);
      // set token in local storage
      if (response.user) {
        const token = await response.user.getIdToken();
        localStorage.setItem("token", token);
        router.push("/worker"); // redirect ke halaman utama (bisa ganti ke /workers)
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white shadow-lg rounded-2xl p-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/icon_bar.png"
            alt="Astra Logo"
            width={200}
            height={50}
            className="object-contain"
          />
        </div>

        {/* Judul */}
        <h1 className="text-xl font-bold text-center text-gray-800 mb-6">
          Login
        </h1>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-black w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-black  w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

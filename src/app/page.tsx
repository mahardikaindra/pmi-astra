/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { Eye, EyeOff } from "lucide-react";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Cek token di client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        router.push("/worker");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 🔑 Firebase Auth Login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("UserCredential:", userCredential);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        localStorage.setItem("role", role);
        localStorage.setItem("email", email);
        localStorage.setItem("token", (user as any).accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        router.push("/worker");
      } else {
        throw new Error("User tidak ditemukan di Firestore");
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error };
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
              placeholder="Enter your email"
              className="text-black w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="text-black w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#002D62] text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

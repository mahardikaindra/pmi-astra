"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { db } from "../../../../../../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState({
    location_name: "",
    latitude: "",
    longitude: "",
    akurasi: "",
    status: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Cek token login
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

  // ✅ Ambil data lama untuk prefill
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(
          db,
          "artifacts",
          "Ij8HEOktiALS0zjKB3ay",
          "locations",
          id,
        );
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            location_name: data.location_name || "",
            status: data.status || "",
            address: data.address || "",
            latitude: data.latitude || "",
            longitude: data.longitude || "",
            akurasi: data.akurasi || "",
          });
        }
      } catch (error) {
        console.error("Error fetching location:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  // ✅ handle input
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const docRef = doc(
        db,
        "artifacts",
        "Ij8HEOktiALS0zjKB3ay",
        "locations",
        id,
      );

      await updateDoc(docRef, {
        ...form,
      });

      alert("Lokasi berhasil diperbarui ✅");
      router.push("/management/location");
    } catch (error) {
      console.error("Error updating location:", error);
      alert("Gagal update location ❌");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude.toString(),
            longitude: pos.coords.longitude.toString(),
            akurasi: pos.coords.accuracy.toString(),
          }));
        },
        (err) => {
          alert("Gagal mengambil lokasi: " + err.message);
        },
        { enableHighAccuracy: true },
      );
    } else {
      alert("Geolocation tidak didukung browser ini");
    }
  };

  if (loading) return <p className="pt-24 text-center">Loading...</p>;

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 mb-12">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Edit Lokasi {form.location_name}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Group */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Nama Lokasi
              </label>
              <input
                type="text"
                name="location_name"
                value={form.location_name}
                onChange={handleChange}
                placeholder="Masukkan nama lokasi"
                className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                required
              />
            </div>

            {/* Alamat */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Alamat
              </label>
              <textarea
                name="address"
                value={form.address}
                rows={3}
                onChange={handleChange}
                placeholder="Masukkan alamat location"
                className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Akurasi
                  </label>
                  <input
                    type="text"
                    name="akurasi"
                    value={form.akurasi}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Gunakan Lokasi Saat Ini
                </button>
              </div>
            </div>
            {/* Status Dropdown */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">-- Pilih Status --</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                submitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#002D62] text-white hover:bg-blue-700"
              }`}
            >
              {submitting ? "Updating..." : "Update Lokasi"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const EditGroupPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default EditGroupPage;

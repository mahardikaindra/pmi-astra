/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { db, storage } from "../../../../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

interface Location {
  location_name: string;
  latitude: string;
  longitude: string;
  akurasi: string;
  status: string;
  address: string;
}
interface Users {
  id?: string;
  name: string;
  age: number;
  area: string;
  contractor: string;
  point_reward: number;
  position: string;
  punishment: string;
  photo?: string;
  sik?: string;
  rating?: number;
  information?: string;
  licenses?: string[];
}

interface Assets {
  assets: string;
  facility: string;
  merk: string;
  condition: string;
  technical_data: string;
  initial_date: string;
  last_maintenance: string;
  last_replace_part: string;
  address: string;
  latitude: string;
  longitude: string;
  image?: string;
  jenis_assets: string;
  personils: string[];
}

function PageComponent() {
  const router = useRouter();
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    location: "",
    indikator: "",
    latitude: "",
    longitude: "",
    akurasi: "",
    deskripsi: "",
    personil: "",
    result: "",
    personils: [] as string[],
    dokumentasi: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);

  // 🔹 State untuk dropdown jalur & lajur
  const [assets, setAssets] = useState<Assets[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<Users[]>([]);

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

  // 🔹 Ambil data Location & User dari Firestore
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const usersCol = collection(db, "artifacts/Ij8HEOktiALS0zjKB3ay/users");
        const usersSnap = await getDocs(usersCol);
        const workerData: Users[] = usersSnap.docs.map((docSnap) => {
          const data = docSnap.data() as Users;
          return { id: docSnap.id, ...data };
        });
        setUsers(
          workerData.filter(
            (user) => user?.area && user?.area.toLowerCase() === "rutin",
          ),
        );

        const locationsCol = collection(
          db,
          "artifacts/Ij8HEOktiALS0zjKB3ay/locations",
        );
        const locationSnap = await getDocs(locationsCol);
        const locationData: Location[] = locationSnap.docs.map((docSnap) => {
          const dataLoc = docSnap.data() as Location;
          return { id: docSnap.id, ...dataLoc };
        });
        setLocations(locationData);

        const assetsCol = collection(
          db,
          "artifacts/Ij8HEOktiALS0zjKB3ay/assets",
        );
        const assetsSnap = await getDocs(assetsCol);
        const assetsData: Assets[] = assetsSnap.docs.map((docSnap) => {
          const dataAssets = docSnap.data() as Assets;
          return { id: docSnap.id, ...dataAssets };
        });
        setAssets(assetsData);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm({ ...form, dokumentasi: e.target.files[0] });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let fileUrl = "";
      if (form.dokumentasi) {
        const fileRef = ref(
          storage,
          `routine/${Date.now()}-${form.dokumentasi.name}`,
        );
        await uploadBytes(fileRef, form.dokumentasi);
        fileUrl = await getDownloadURL(fileRef);
      }

      const colRef = collection(
        db,
        "artifacts",
        "Ij8HEOktiALS0zjKB3ay",
        "routine",
      );
      await addDoc(colRef, {
        ...form,
        dokumentasi: fileUrl,
      });

      alert("Routine berhasil disimpan ✅");
      router.push("/routine");
    } catch (error) {
      console.error("Error saving routine:", error);
      alert("Gagal menyimpan data ❌");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 mb-12">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Routine</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tanggal & Waktu
              </label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Personil
              </label>
              <div className="grid grid-cols-2 gap-2">
                {users.map((user, i) => (
                  <label key={i} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={user.name}
                      checked={form.personils.includes(user.name)}
                      disabled={
                        !form.personils.includes(user.name) &&
                        form.personils.length >= 5
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm((prev) => ({
                          ...prev,
                          personils: checked
                            ? [...prev.personils, user.name]
                            : prev.personils.filter((n) => n !== user.name),
                        }));
                      }}
                      className="accent-[#002D62]"
                    />
                    <span className="text-gray-500">{user.name}</span>
                  </label>
                ))}
              </div>
              {form.personils.length >= 5 && (
                <p className="text-xs text-red-500 mt-1">
                  Maksimal 5 personil dapat dipilih.
                </p>
              )}
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Lokasi
              </label>
              <select
                name="location"
                value={form.location}
                onChange={(e) => {
                  handleChange(e);
                  const selectedLoc = locations.find(
                    (loc) => loc.location_name === e.target.value,
                  );
                  if (selectedLoc) {
                    setForm((prev) => ({
                      ...prev,
                      latitude: selectedLoc.latitude,
                      longitude: selectedLoc.longitude,
                      akurasi: selectedLoc.akurasi,
                    }));
                  }
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                required
              >
                <option value="">-- Pilih Lokasi --</option>
                {locations.map((j, i) => (
                  <option key={i} value={j.location_name}>
                    {j.location_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lat Long Akurasi */}
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
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500 bg-gray-100 cursor-not-allowed"
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
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500 bg-gray-100 cursor-not-allowed"
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
                    readOnly
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500 bg-gray-100 cursor-not-allowed"
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

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Jenis Assets
              </label>
              <select
                name="indikator"
                value={form.indikator}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                required
              >
                <option value="">-- Pilih Assets --</option>
                {assets.map((asset, i) => (
                  <option key={i} value={asset.jenis_assets}>
                    {asset.jenis_assets}
                  </option>
                ))}
              </select>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                rows={3}
                required
              ></textarea>
            </div>

            {/* Hasil Routine */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Hasil Routine
              </label>
              <textarea
                name="result"
                value={form.result}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                rows={3}
                required
              ></textarea>
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
              />
              {form.dokumentasi && (
                <p className="text-sm text-gray-500 mt-1">
                  {form.dokumentasi.name}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                submitting
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#002D62] text-white hover:bg-blue-500"
              }`}
            >
              {submitting ? "Saving..." : "Simpan"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const AddRoutinePage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default AddRoutinePage;

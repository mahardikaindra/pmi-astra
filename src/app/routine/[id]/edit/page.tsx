/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { db, storage } from "../../../../../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useParams } from "next/navigation";
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
}

function PageComponent() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };

  const [form, setForm] = useState({
    date: Timestamp.now(),
    location: "",
    indikator: "",
    latitude: "",
    longitude: "",
    akurasi: "",
    deskripsi: "",
    personil: "",
    result: "",
    dokumentasi: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  // 🔹 State untuk dropdown jalur & lajur
  const [assets, setAssets] = useState<Assets[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<Users[]>([]);
  const [dokumentasi, setDokumentasi] = useState<File | null>(null);
  const [dokumentasiUrl, setDokumentasiUrl] = useState<string>("");

  // Cek token login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [router]);

  // Ambil data dari Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(
          db,
          "artifacts",
          "Ij8HEOktiALS0zjKB3ay",
          "routine",
          id,
        );
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setForm(snapshot.data() as any);
          if (snapshot.data()) {
            setDokumentasiUrl(snapshot.data().dokumentasi); // URL dari firestore
          }
        } else {
          alert("Data tidak ditemukan ❌");
          router.push("/routine");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  // 🔹 Ambil data Jalur & Lajur dari Firestore
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDokumentasi(file);
      setDokumentasiUrl(URL.createObjectURL(file)); // preview lokal
    }
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Gunakan lokasi saat ini
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

  // Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let fileUrl = dokumentasiUrl;

      if (dokumentasi) {
        const fileRef = ref(
          storage,
          `routine/${Date.now()}-${dokumentasi.name}`,
        );
        await uploadBytes(fileRef, dokumentasi);
        fileUrl = await getDownloadURL(fileRef);
      }

      const docRef = doc(
        db,
        "artifacts",
        "Ij8HEOktiALS0zjKB3ay",
        "routine",
        id,
      );
      await updateDoc(docRef, {
        ...form,
        dokumentasi: fileUrl,
      });

      alert("Routine berhasil diperbarui ✅");
      router.push("/routine");
    } catch (error) {
      console.error("Error updating routine:", error);
      alert("Gagal update data ❌");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 mb-12">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Edit Routine
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tanggal & Waktu
              </label>
              <input
                type="datetime-local"
                name="date"
                value={
                  form.date instanceof Timestamp
                    ? new Date(form.date.seconds * 1000)
                        .toISOString()
                        .slice(0, 16)
                    : form.date
                }
                onChange={(e) => {
                  setForm({
                    ...form,
                    date: Timestamp.fromDate(new Date(e.target.value)),
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Personil
              </label>
              <select
                name="personil"
                value={form.personil}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                required
              >
                <option value="">-- Pilih Personil --</option>
                {users.map((j: any, i: number) => (
                  <option key={i} value={j.name}>
                    {j.name}
                  </option>
                ))}
              </select>
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
                Assets
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
                  <option key={i} value={asset.assets}>
                    {asset.assets}
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
              {dokumentasiUrl && (
                <div className="mt-2">
                  <Image
                    src={dokumentasiUrl}
                    alt="Preview"
                    width={300}
                    height={200}
                    className="rounded-lg border"
                  />
                </div>
              )}
              {dokumentasi && (
                <p className="text-sm text-gray-500 mt-1">{dokumentasi.name}</p>
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

const EditRoutinePage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default EditRoutinePage;

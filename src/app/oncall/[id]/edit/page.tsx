"use client";
import Image from "next/image";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { db, storage } from "../../../../../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();
  const params = useParams(); // ambil id dari URL
  const id = params?.id as string;

  const [form, setForm] = useState({
    date: "",
    group: "",
    location: "",
    shift: "",
    departement: "",
    catatan: "",
    description: "",
    jenis_assets: "",
    dokumentasi: null as File | null,
    p2h: null as File | null,
    dokumentasiUrl: "",
    p2hUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // 🔹 Dropdown states
  const [locations, setLocations] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [shifts, setShifts] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [router]);

  // 🔹 Fetch options
  useEffect(() => {
    const fetchOptions = async () => {
      const groupSnap = await getDocs(
        collection(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "group"),
      );
      const shiftSnap = await getDocs(
        collection(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "shift"),
      );
      const locationSnap = await getDocs(
        collection(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "locations"),
      );
      setLocations(locationSnap.docs.map((doc) => doc.data().location_name));
      setGroups(groupSnap.docs.map((doc) => doc.data().nama));
      setShifts(shiftSnap.docs.map((doc) => doc.data().nama));
    };
    fetchOptions();
  }, []);

  // 🔹 Fetch existing OnCall data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const docRef = doc(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "oncall", id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setForm({
          date: data.date?.toDate().toISOString().split("T")[0] || "",
          group: data.group || "",
          location: data.location || "",
          shift: data.shift || "",
          description: data.description || "",
          jenis_assets: data.jenis_assets || "",
          departement: data.departement || "",
          catatan: data.catatan || "",
          dokumentasi: null,
          p2h: null,
          dokumentasiUrl: data.dokumentasiUrl || "",
          p2hUrl: data.p2hUrl || "",
        });
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);

    try {
      let imageUrl = form.dokumentasiUrl;
      let p2hUrl = form.p2hUrl;

      // Upload dokumentasi baru kalau ada
      if (form.dokumentasi) {
        const storageRef = ref(
          storage,
          `oncall/${Date.now()}-${form.dokumentasi.name}`,
        );
        await uploadBytes(storageRef, form.dokumentasi);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Upload P2H baru kalau ada
      if (form.p2h) {
        const storageRef = ref(storage, `p2h/${Date.now()}-${form.p2h.name}`);
        await uploadBytes(storageRef, form.p2h);
        p2hUrl = await getDownloadURL(storageRef);
      }

      const docRef = doc(db, "artifacts", "Ij8HEOktiALS0zjKB3ay", "oncall", id);

      await updateDoc(docRef, {
        date: Timestamp.fromDate(new Date(form.date)),
        group: form.group,
        location: form.location,
        shift: form.shift,
        departement: form.departement,
        catatan: form.catatan,
        dokumentasiUrl: imageUrl || null,
        p2hUrl: p2hUrl || null,
      });

      alert("OnCall berhasil diperbarui ✅");
      router.push("/oncall");
    } catch (error) {
      console.error("Error updating OnCall:", error);
      alert("Gagal memperbarui data ❌");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header hasBack />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 mb-12">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit OnCall</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tanggal */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Tanggal
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="text-sm border rounded-lg px-3 py-2 border-gray-300 text-gray-500"
                  required
                />
              </div>

              {/* Group */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Group / Tim
                </label>
                <select
                  name="group"
                  value={form.group}
                  onChange={handleChange}
                  className="text-sm border rounded-lg px-3 py-2 border-gray-300 text-gray-500"
                  required
                >
                  <option value="">-- Pilih Group --</option>
                  {groups.map((g, i) => (
                    <option key={i} value={g}>
                      {g}
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
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-500"
                  required
                >
                  <option value="">-- Pilih Lokasi --</option>
                  {locations.map((j, i) => (
                    <option key={i} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shift */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Shift
                </label>
                <select
                  name="shift"
                  value={form.shift}
                  onChange={handleChange}
                  className="text-sm border rounded-lg px-3 py-2 border-gray-300 text-gray-500"
                  required
                >
                  <option value="">-- Pilih Shift --</option>
                  {shifts.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Departement */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-2">
                  Departement
                </label>
                <div className="flex gap-4">
                  {["MAINTENANCE", "EHS", "GA"].map((dept) => (
                    <label
                      key={dept}
                      className="flex items-center space-x-2 border-gray-300 text-gray-500"
                    >
                      <input
                        type="radio"
                        name="departement"
                        value={dept}
                        checked={form.departement === dept}
                        onChange={handleChange}
                        className="w-4 h-4 border-gray-300 text-gray-300"
                      />
                      <span>{dept}</span>
                    </label>
                  ))}
                  <label className="flex items-center space-x-2 border-gray-300 text-gray-500">
                    <input
                      type="radio"
                      name="departement"
                      value="custom"
                      checked={
                        !!form.departement &&
                        !["MAINTENANCE", "EHS", "GA"].includes(form.departement)
                      }
                      onChange={() => setForm({ ...form, departement: "" })}
                      className="w-4 h-4 border-gray-300"
                    />
                    <span>Custom</span>
                    <input
                      type="text"
                      placeholder="Departement lain..."
                      value={
                        ["MAINTENANCE", "EHS", "GA"].includes(form.departement)
                          ? ""
                          : form.departement
                      }
                      onChange={(e) =>
                        setForm({ ...form, departement: e.target.value })
                      }
                      className="ml-2 border rounded px-2 py-1 border-gray-300 text-gray-500"
                      disabled={["MAINTENANCE", "EHS", "GA"].includes(
                        form.departement,
                      )}
                    />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="text-sm border rounded-lg px-3 py-2 border-gray-300 text-gray-500 h-24"
                />
              </div>

              {/* Catatan */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Catatan
                </label>
                <textarea
                  name="catatan"
                  value={form.catatan}
                  onChange={handleChange}
                  className="text-sm border rounded-lg px-3 py-2 border-gray-300 h-24 text-gray-500"
                />
              </div>

              {/* Dokumentasi */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Dokumentasi
                </label>
                {form.dokumentasiUrl && (
                  <Image
                    height={300}
                    width={200}
                    src={form.dokumentasiUrl}
                    alt="Dokumentasi"
                    className="w-32 h-32 object-cover mb-2"
                  />
                )}
                <input
                  type="file"
                  name="dokumentasi"
                  accept="image/*"
                  className="text-sm text-gray-500"
                  onChange={handleChange}
                />
              </div>

              {/* P2H */}
              <div className="flex flex-col md:col-span-2">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  P2H
                </label>
                {form.p2hUrl && (
                  <Image
                    height={300}
                    width={200}
                    src={form.p2hUrl}
                    alt="P2H"
                    className="w-32 h-32 object-cover mb-2"
                  />
                )}
                <input
                  type="file"
                  name="p2h"
                  accept="image/*"
                  className="text-sm text-gray-500"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-3 rounded-lg font-semibold transition ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#002D62] text-white hover:bg-blue-700"
              }`}
            >
              {submitting ? "Updating..." : "Update OnCall"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

const EditOnCallPage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default EditOnCallPage;

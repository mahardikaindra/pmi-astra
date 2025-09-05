/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Header from "@/components/Header";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import CustomPopup from "@/components/CustomPopUp";
import dynamic from "next/dynamic";

function PageComponent() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupTitle, setPopupTitle] = useState("");
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/");
  }, [router]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setProfile(user);
    }
  }, []);

  const handleLogout = () => {
    setPopupTitle("Konfirmasi Logout");
    setPopupMessage("Apakah Anda yakin ingin keluar?");
    setShowPopup(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    router.push("/");
    setShowPopup(false);
  };

  return (
    <>
      <Header />
      {/* Create Profile Page */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-white dark:bg-gray-100 p-4">
        <div className="bg-white dark:bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full flex flex-col items-center">
          <div className="mb-6">
            {profile?.photoURL ? (
              <Image
                src={profile.photoURL}
                alt="Profile Picture"
                width={128}
                height={128}
                className="rounded-full object-cover w-32 h-32"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-5xl font-semibold">
                {profile?.email ? profile.email[0].toUpperCase() : "U"}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-black mb-4">
            {profile?.email
              ? profile.email.split("@")[0].toUpperCase()
              : "Guest"}
          </h1>
          <p className="text-gray-600 dark:text-black-300 mb-6">
            {profile?.email}
          </p>
          <div className="text-left w-full mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-black mb-3">
              Account Details
            </h2>
            <div className="bg-gray-100 dark:bg-gray-100 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-black mb-2">
                <strong>Email Verified:</strong>{" "}
                {profile?.emailVerified ? "Yes" : "No"}
              </p>
              <p className="text-gray-700 dark:text-black">
                <strong>Role:</strong> {localStorage.getItem("role") || "N/A"}
              </p>
            </div>
          </div>
          {!profile && (
            <>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Loading profile...
              </p>
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition duration-300"
              >
                Logout
              </button>
            </>
          )}
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
      {showPopup && (
        <CustomPopup
          title={popupTitle}
          message={popupMessage}
          onClose={() => setShowPopup(false)}
          onConfirm={confirmLogout}
          confirmText="Ya, Keluar"
          cancelText="Batal"
        />
      )}
    </>
  );
}


const ProfilePage = dynamic(() => Promise.resolve(PageComponent), {
  ssr: false,
});

export default ProfilePage;
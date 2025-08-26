/* eslint-disable @next/next/no-img-element */
'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import React, { useState, useEffect } from 'react';
import { signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from "../../firebaseConfig";

type ProfileData = {
  id: string;
  age: string;
  area: string;
  contractor: string;
  licencies: string[];
  name: string;
  photo: string;
  point_reward?: number;
  position: string;
  punsihment?: string;
  sik?: string;
};

export default function Home() {
  const [profileData, setProfileData] = useState<ProfileData | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

/**
   * Handles user authentication.
   * This effect runs only once on component mount.
   */
  // useEffect(() => {
  //   // Only proceed if auth object is defined
  //   if (!auth) {
  //     setError("Firebase Auth is not initialized. Check console for details.");
  //     setLoading(false);
  //     return;
  //   }

  //   // Listen for authentication state changes
  //   const unsubscribe = onAuthStateChanged(auth, async (user) => {
  //     if (user) {
  //       setUserId(user.uid);
  //       setIsAuthReady(true);
  //       console.log("User signed in with UID:", user.uid);
  //     } else {
  //       console.log("User is not signed in. Attempting to sign in...");
  //       try {
  //         if (typeof window !== 'undefined' && (window as any).__initial_auth_token) {
  //           await signInWithCustomToken(auth, (window as any).__initial_auth_token);
  //           console.log("Signed in with custom token");
  //         } else {
  //           await signInAnonymously(auth);
  //           console.log("Signed in anonymously");
  //         }
  //       } catch (authError: any) {
  //         console.error("Firebase Auth Error:", authError.code, authError.message);
  //         setError(`Failed to authenticate: ${authError.message}`);
  //       }
  //     }
  //   });

  //   // Cleanup the listener on component unmount
  //   return () => unsubscribe();
  // }, []);

  /**
   * Fetches the profile data from Firestore.
   * This effect runs whenever isAuthReady or userId changes.
   */
  useEffect(() => {
    // Only proceed if user is authenticated and db is defined
    if (db) {
      const appId = typeof window !== 'undefined' && (window as any).__app_id !== undefined
        ? (window as any).__app_id
        : 'Ij8HEOktiALS0zjKB3ay';
      const docPath = `artifacts/${appId}/users/2025001/profiles/my-profile`;
      const profileDocRef = doc(db, docPath);

      console.log(`Setting up real-time listener for document at path: ${docPath}`);
      setLoading(true);

      const unsubscribe = onSnapshot(profileDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          console.log("Document data received:", JSON.stringify(docSnapshot.data()));
          const data = docSnapshot.data();
          // Map Firestore data to ProfileData type
          const profile: ProfileData = {
            id: data.id,
            age: data.age,
            area: data.area,
            contractor: data.contractor,
            licencies: data.licencies,
            name: data.name,
            photo: data.photo,
            point_reward: data.point_reward,
            position: data.position,
            punsihment: data.punsihment,
            sik: data.sik,
          };
          setProfileData(profile);
        }
        setLoading(false);
      }, (error) => {
        console.error("Firestore onSnapshot error:", error);
        setError("Failed to fetch data from Firestore.");
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!db) {
      setError("Firestore is not initialized. Check console for details.");
      setLoading(false);
    }
  }, []);

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg">Loading profile data...</p>
          {/* <p className="mt-2 text-sm text-gray-500">User ID: {userId ? userId : 'Authenticating...'}</p> */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-red-500 p-4">
        <div className="text-center font-semibold">
          Error: {error}
          <p className="text-sm text-gray-500 mt-2">Check the console for more details.</p>
        </div>
      </div>
    );
  }

  // Render the main page content after data is loaded
    return (
      <>
      <nav className="w-full bg-white p-4 flex items-center justify-between">
            <div className="text-black font-bold text-lg">Astra</div>
            <Image
              src="/icon_bar.png"
              alt="Astra Logo"
              width={200}
              height={50}
              className="object-contain"
            />
            <div className="text-black text-sm">User ID: {profileData?.id}</div>
          </nav>
      
      <div className="bg-gray-100 min-h-screen flex flex-col items-center p-4 md:p-8 font-sans antialiased">
          <div className="w-full max-w-xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden mb-8"> 
          
          <div className="relative w-full h-80 bg-cover bg-center rounded-t-2xl flex items-end justify-center pb-4" 
               style={{ backgroundImage: `url('${profileData?.photo}')` }}>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
            <div className="z-10 text-white text-center" >
              <h1 className="text-2xl font-bold tracking-tight">{profileData?.name || 'No Name'}</h1>
              <p className="text-sm font-light opacity-80">
                {profileData?.position || 'Unknown Position'}
              </p>
            </div>
          </div>
  
          <div className="p-6">
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-gray-700">
              <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-gray-500">ID</span>
                  <span className="text-sm font-medium">{profileData?.id || '-'}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-gray-500">Kontraktor</span>
                  <span className="text-sm font-medium">{profileData?.contractor || '-'}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-gray-500">Posisi</span>
                  <span className="text-sm font-medium">{profileData?.position || '-'}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-gray-500">Nama</span>
                  <span className="text-sm font-medium">{profileData?.name || '-'}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-gray-500">Usia</span>
                  <span className="text-sm font-medium">{profileData?.age || '-'}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-gray-500">Area</span>
                  <span className="text-sm font-medium">{profileData?.area || '-'}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-gray-500">Hukuman</span>
                  <span className="text-sm font-medium">{profileData?.punsihment || '-'}</span>
              </div>
              <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase text-gray-500">SIK</span>
                  <span className="text-sm font-medium">{profileData?.sik || '-'}</span>
              </div>
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">Lisensi</h3>
                <iframe
                  src={profileData?.licencies[0] || ''}
                  className="w-full h-auto rounded-xl shadow-lg border border-gray-200 object-cover"
                  width={600} 
                  height={400}
                />
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">Sertifikat</h3>
                <iframe
                  src={profileData?.licencies[1] || ''}
                  className="w-full h-auto rounded-xl shadow-lg border border-gray-200 object-cover"
                  width={600}
                  height={400}
                />
              </div>
            </div>
          </div>
        </div>
  
        <footer className="w-full max-w-xl text-center text-sm text-gray-500 p-2">
          <p>Current User ID: <span className="font-mono text-gray-700">{profileData?.id || 'Not signed in'}</span></p>
        </footer>
      </div>
      </>
    );
  }

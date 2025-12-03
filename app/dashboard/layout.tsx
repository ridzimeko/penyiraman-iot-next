"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { Toaster } from "sonner";

// Mock user data untuk development tanpa Firebase
const mockUser = {
  uid: "user_123456",
  email: "admin@smartirrigation.com",
  displayName: "Admin Utama",
  photoURL: null,
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulasi loading auth
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Cek jika user sudah login (simulasi dengan localStorage)
      const isLoggedIn = localStorage.getItem("isLoggedIn");
      if (!isLoggedIn) {
        router.push("/login");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="h-20 w-20 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
              <div className="absolute inset-4 border-4 border-green-500 rounded-full animate-spin border-t-transparent"></div>
              <div className="absolute inset-8 border-4 border-green-300 rounded-full animate-spin border-b-transparent animate-reverse"></div>
            </div>
            <p className="text-lg font-medium text-gray-700">Memuat Dashboard</p>
            <p className="text-sm text-gray-500 mt-2">Sistem penyiraman otomatis</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={mockUser} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 pt-20 md:pt-24">
          {children}
          <Toaster />
        </main>
      </div>
    </div>
  );
}
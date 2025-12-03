"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Pendaftaran Akun
          </CardTitle>
          <CardDescription>
            Fitur pendaftaran belum tersedia untuk demo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              Untuk demo UAS, silakan gunakan akun demo yang tersedia di halaman login.
              Fitur pendaftaran akan dikembangkan setelah sistem utama selesai.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Kembali ke Login
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userEmail", "demo@example.com");
                router.push("/dashboard");
              }}
              className="w-full"
            >
              Lanjut ke Dashboard (Demo Mode)
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <Link href="/" className="text-green-600 hover:underline">
              Kembali ke halaman utama
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Simulasi delay API
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock validation
    if (!email || !password) {
      setError("Email dan password harus diisi");
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setError("Format email tidak valid");
      setLoading(false);
      return;
    }

    // Mock successful login
    setSuccess("Login berhasil! Mengarahkan ke dashboard...");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);
    
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  // Demo credentials
  const handleDemoLogin = (type: "admin" | "user") => {
    if (type === "admin") {
      setEmail("admin@smartirrigation.com");
      setPassword("admin123");
    } else {
      setEmail("user@example.com");
      setPassword("user123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-blue-50 to-cyan-50 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-green-200 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4">
            <div className="h-12 w-12 bg-linear-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Smart Irrigation System
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sistem penyiraman otomatis berbasis IoT
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Demo Buttons */}
          <div className="space-y-3">
            <p className="text-sm text-gray-500 text-center">Login Demo:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("admin")}
                className="text-sm"
              >
                Admin Account
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDemoLogin("user")}
                className="text-sm"
              >
                User Account
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Atau login manual</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs text-blue-600"
                  onClick={() => alert("Fitur reset password belum tersedia")}
                >
                  Lupa password?
                </Button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {/* Remember me */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Ingat saya
              </label>
            </div>

            {/* Messages */}
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="p-3 text-sm text-green-700 bg-green-50 rounded-lg flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-linear-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memproses...</span>
                </div>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-600">Belum punya akun? </span>
            <Link 
              href="/register" 
              className="text-green-600 hover:text-green-700 font-medium"
              onClick={(e) => {
                e.preventDefault();
                alert("Fitur register belum tersedia. Gunakan demo account.");
              }}
            >
              Daftar disini
            </Link>
          </div>

          {/* System Info */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Sistem UAS • Teknologi IoT • {new Date().getFullYear()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Floating Info */}
      <div className="fixed bottom-4 right-4 md:block hidden">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-600">
            <span className="font-medium">Demo Credentials:</span><br />
            Admin: admin@smartirrigation.com / admin123<br />
            User: user@example.com / user123
          </p>
        </div>
      </div>
    </div>
  );
}
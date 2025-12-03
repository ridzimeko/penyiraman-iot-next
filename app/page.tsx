import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Droplets, 
  Zap, 
  Clock,
  BarChart3,
  Shield,
  Smartphone,
  Leaf
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <Droplets className="h-8 w-8 text-blue-600" />,
      title: "Monitoring Real-time",
      description: "Pantau kelembaban tanah, suhu, dan kelembaban udara secara real-time",
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: "Penjadwalan Otomatis",
      description: "Atur jadwal penyiraman sesuai kebutuhan tanaman Anda",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Kontrol Manual",
      description: "Kontrol sistem penyiraman langsung dari dashboard",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Analisis Data",
      description: "Grafik dan statistik untuk analisis kesehatan tanaman",
    },
    {
      icon: <Shield className="h-8 w-8 text-red-600" />,
      title: "Keamanan Sistem",
      description: "Autentikasi pengguna dan proteksi data",
    },
    {
      icon: <Smartphone className="h-8 w-8 text-indigo-600" />,
      title: "Responsif",
      description: "Akses dari berbagai perangkat dengan tampilan optimal",
    },
  ];

  const stats = [
    { label: "Penghematan Air", value: "40%" },
    { label: "Kesehatan Tanaman", value: "+35%" },
    { label: "Waktu Efisiensi", value: "80%" },
    { label: "Keakuratan Sensor", value: "95%" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-grid-black/[0.02] bg-grid"></div>
        <div className="container relative mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800">
              <Leaf className="h-4 w-4" />
              Sistem Penyiraman Otomatis Berbasis IoT
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
              Smart{" "}
              <span className="bg-linear-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Irrigation
              </span>{" "}
              System
            </h1>
            
            <p className="mb-10 max-w-2xl text-lg text-gray-600 md:text-xl">
              Sistem penyiraman otomatis cerdas berbasis website yang mengoptimalkan penggunaan air 
              dan meningkatkan kesehatan tanaman dengan teknologi IoT terkini.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 bg-linear-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  Mulai Sekarang
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  Lihat Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Fitur Unggulan Sistem
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Sistem kami dilengkapi dengan berbagai fitur canggih untuk memastikan 
              penyiraman tanaman yang optimal dan efisien
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-linear-to-r from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
              Cara Kerja Sistem
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600">
              Sistem kami bekerja secara otomatis dalam 4 langkah sederhana
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Sensor Membaca</h3>
              <p className="text-gray-600">Sensor membaca kelembaban tanah dan kondisi lingkungan</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Analisis Data</h3>
              <p className="text-gray-600">Sistem menganalisis data untuk menentukan kebutuhan air</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Kontrol Otomatis</h3>
              <p className="text-gray-600">Pompa air diaktifkan secara otomatis berdasarkan analisis</p>
            </div>
            
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                <span className="text-2xl font-bold text-green-600">4</span>
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">Monitoring</h3>
              <p className="text-gray-600">Anda dapat memantau seluruh proses melalui dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-2xl bg-linear-to-r from-green-600 to-blue-600 p-8 md:p-12">
            <div className="flex flex-col items-center text-center text-white">
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Siap Mengoptimalkan Penyiraman Tanaman Anda?
              </h2>
              <p className="mb-8 max-w-2xl text-green-100">
                Bergabung dengan ratusan pengguna yang telah menghemat air dan 
                meningkatkan kesehatan tanaman dengan sistem kami
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link href="/register">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    className="bg-white text-gray-900 hover:bg-gray-100"
                  >
                    Daftar Sekarang
                  </Button>
                </Link>
                <Link href="/login">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Masuk ke Akun
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-linear-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900">Smart Irrigation System</div>
                <div className="text-sm text-gray-600">UAS Project - Sistem IoT</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600 md:text-right">
              <p>© {new Date().getFullYear()} Smart Irrigation System. All rights reserved.</p>
              <p className="mt-1">Dibuat untuk kepentingan akademik - Teknologi IoT</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}